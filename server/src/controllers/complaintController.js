/**
 * Complaint Controller
 * Handles complaint submission, approval, and statistics
 */

const Complaint = require('../models/Complaint');
const Stats = require('../models/Stats');
const response = require('../utils/response');
const geoUtils = require('../utils/geoUtils');

const complaintController = {
    /**
     * Submit a new complaint
     * POST /api/user/complaint
     */
    async submitComplaint(req, res, next) {
        try {
            const { category, description, location_city, location_area, latitude, longitude, image_url } = req.body;
            const user_id = req.user.id; // From auth middleware

            if (!category || !location_city || !location_area) {
                return response.error(res, 'Missing required fields');
            }

            // Normalize inputs
            const normalizedCity = location_city.trim().toUpperCase();
            const normalizedArea = location_area.trim().toUpperCase();

            const complaint = await Complaint.create({
                user_id,
                category,
                description,
                location_city: normalizedCity,
                location_area: normalizedArea,
                latitude,
                longitude,
                image_url
            });

            return response.created(res, complaint, 'Complaint submitted successfully');
        } catch (error) {
            next(error);
        }
    },

    /**
     * Get complaints (Admin: All/Pending, User: My complaints)
     * GET /api/complaints
     */
    async getComplaints(req, res, next) {
        try {
            const { status, page = 1, limit = 20 } = req.query;
            const offset = (page - 1) * limit;

            // If user is admin, they can see all. If user is normal, only their own.
            // Assumption: req.user.role is available
            const isAdmin = req.user.role === 'admin';
            const user_id = isAdmin ? null : req.user.id;

            const result = await Complaint.findAll({
                status,
                user_id,
                limit,
                offset
            });

            return response.paginated(res, result.complaints, parseInt(page), parseInt(limit), result.total);
        } catch (error) {
            next(error);
        }
    },

    /**
     * Approve or Reject complaint
     * PUT /api/admin/complaint/:id/verify
     */
    async verifyComplaint(req, res, next) {
        try {
            const { id } = req.params;
            const { action, feedback } = req.body; // 'approve' or 'reject'

            if (!['approve', 'reject'].includes(action)) {
                return response.error(res, 'Invalid action. method must be approve or reject');
            }

            const complaint = await Complaint.findById(id);
            if (!complaint) {
                return response.notFound(res, 'Complaint not found');
            }

            if (complaint.status !== 'PENDING') {
                return response.error(res, 'Complaint is already processed');
            }

            const newStatus = action === 'approve' ? 'APPROVED' : 'REJECTED';

            let detectedArea = complaint.location_area;
            if (newStatus === 'APPROVED' && complaint.latitude && complaint.longitude) {
                const autoDetected = geoUtils.getAreaFromCoordinates(complaint.latitude, complaint.longitude);
                if (autoDetected) {
                    detectedArea = autoDetected;
                    await Complaint.updateLocationArea(id, detectedArea);
                }
            }

            await Complaint.updateStatus(id, newStatus, feedback);

            // If approved, update stats
            if (newStatus === 'APPROVED') {
                await Stats.increment(
                    complaint.location_country || 'Pakistan',
                    complaint.location_city,
                    detectedArea,
                    complaint.category
                );
            }

            // Send notification to user
            const Notification = require('../models/Notification');
            await Notification.create({
                user_id: complaint.user_id,
                title: `Complaint ${newStatus}`,
                message: newStatus === 'APPROVED'
                    ? `Your ${complaint.category} complaint in ${detectedArea} has been approved.${feedback ? ' Admin note: ' + feedback : ''}`
                    : `Your ${complaint.category} complaint was rejected.${feedback ? ' Reason: ' + feedback : ''}`,
                type: newStatus === 'APPROVED' ? 'success' : 'warning',
                related_id: id
            });

            return response.success(res, { id, status: newStatus }, `Complaint ${newStatus}`);
        } catch (error) {
            next(error);
        }
    },

    /**
     * Get statistics for heatmap and charts
     * GET /api/stats/area-category
     */
    async getStats(req, res, next) {
        try {
            const rawData = await Stats.getAll();
            const categoryStats = await Stats.getCategoryStats();
            const topAreas = await Stats.getTopAreas();
            const areaStats = await Stats.getAreaStatsWithCoords();
            const areaCategoryStats = await Stats.getAreaCategoryStats();

            // Process for Stacked Bar Chart
            // Output: [{ name: 'Saddar', Snatching: 5, Theft: 2, ... }, ...]
            const stackedData = [];
            const areaMap = {};

            areaCategoryStats.forEach(item => {
                if (!areaMap[item.area]) {
                    areaMap[item.area] = { name: item.area };
                    stackedData.push(areaMap[item.area]);
                }
                areaMap[item.area][item.category] = item.count;
            });

            return response.success(res, {
                rawData,
                categoryStats,
                topAreas,
                areaStats,
                stackedData
            });
        } catch (error) {
            next(error);
        }
    },

    /**
     * Delete entire area data
     * DELETE /api/admin/complaint/area/:name
     */
    async deleteArea(req, res, next) {
        try {
            const { name } = req.params;
            if (!name) return response.error(res, 'Area name is required');

            // Delete from stats
            await Stats.deleteArea(name);

            // Delete associated complaints
            await Complaint.deleteByArea(name);

            return response.success(res, null, `Area ${name} and related data deleted successfully`);
        } catch (error) {
            next(error);
        }
    }
};

module.exports = complaintController;
