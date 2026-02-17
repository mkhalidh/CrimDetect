/**
 * Admin Controller
 * Handles criminal management, claims verification, and dashboard statistics
 */

const Person = require('../models/Person');
const CriminalRecord = require('../models/CriminalRecord');
const Claim = require('../models/Claim');
const Warning = require('../models/Warning');

const DetectionLog = require('../models/DetectionLog');
const User = require('../models/User');
const RuleEngine = require('../utils/ruleEngine');
const Notification = require('../models/Notification');
const response = require('../utils/response');
const { getFileUrl } = require('../config/multer');
const { validationResult } = require('express-validator');

const adminController = {
    /**
     * POST /api/admin/criminal
     * Add a new criminal record
     */
    async addCriminal(req, res, next) {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return response.validationError(res, errors.array());
            }

            const {
                name, age, cnic, crime_type, description,
                risk_level, face_descriptor, user_id
            } = req.body;

            // Get uploaded image URL if exists
            let image_url = null;
            if (req.file) {
                image_url = getFileUrl(req.file.filename, 'criminals');
            }

            // Start with no person
            let person = null;

            // 1. Try to find person by CNIC first (Strongest identifier for duplicate check)
            if (cnic) {
                person = await Person.findByCnic(cnic);
            }

            // 2. If not found by CNIC, try by User ID if provided
            if (!person && user_id) {
                person = await Person.findByUserId(user_id);
            }

            // 3. Validation: If person found via CNIC, but user_id is different -> Conflict
            if (person && cnic && person.cnic === cnic && user_id && person.user_id && person.user_id != user_id) {
                return response.error(res, 'This CNIC belongs to a different user account', 409);
            }

            // Parse face descriptor if provided as string
            let descriptor = face_descriptor;
            if (typeof face_descriptor === 'string') {
                try {
                    descriptor = JSON.parse(face_descriptor);
                } catch (e) {
                    return response.error(res, 'Invalid face descriptor format');
                }
            }

            if (person) {
                // Update existing person (whether found by CNIC or UserID)
                await Person.update(person.id, {
                    name,
                    age: parseInt(age) || undefined,
                    cnic,
                    image_url: image_url || undefined,
                    face_descriptor: descriptor || undefined,
                    status: 'CRIMINAL',
                    user_id: user_id || person.user_id // Link if not already linked
                });
                // Refresh person
                person = await Person.findById(person.id);

                // If user_id was just added or existed, ensure we notify/warn
                if (person.user_id) {
                    await Warning.create({
                        person_id: person.id,
                        warning_level: risk_level || 'LOW',
                        message: `You have been marked as a criminal record: ${crime_type}. Please contact administration if this is an error.`
                    });
                }

            } else {
                // Create new person (Standalone or Linked)
                person = await Person.create({
                    user_id: user_id || null,
                    name,
                    age: parseInt(age) || null,
                    cnic,
                    image_url,
                    face_descriptor: descriptor,
                    status: 'CRIMINAL'
                });

                if (user_id) {
                    await Warning.create({
                        person_id: person.id,
                        warning_level: risk_level || 'LOW',
                        message: `You have been marked as a criminal record: ${crime_type}. Please contact administration if this is an error.`
                    });
                }
            }

            // Create criminal record
            const criminalRecord = await CriminalRecord.create({
                person_id: person.id,
                crime_type,
                description,
                risk_level: risk_level || 'LOW',
                verified: true
            });

            // Notify user if linked
            if (user_id) {
                await Notification.create({
                    user_id,
                    title: 'Criminal Record Added',
                    message: `A new criminal record has been added to your profile: ${crime_type}`,
                    type: 'record_added',
                    related_id: person.id
                });
            }

            return response.created(res, {
                person,
                criminal_record: criminalRecord
            }, 'Criminal record added successfully');
        } catch (error) {
            next(error);
        }
    },

    /**
     * GET /api/admin/criminals
     * Get list of criminals with pagination and filters
     */
    async getCriminals(req, res, next) {
        try {
            const {
                page = 1,
                limit = 10,
                search = '',
                crime_type = '',
                risk_level = ''
            } = req.query;

            const offset = (parseInt(page) - 1) * parseInt(limit);

            const criminals = await CriminalRecord.findAll({
                limit: parseInt(limit),
                offset,
                search: search || null,
                crime_type: crime_type || null,
                risk_level: risk_level || null
            });

            const total = await CriminalRecord.count({
                crime_type: crime_type || null,
                risk_level: risk_level || null
            });

            return response.paginated(res, criminals, parseInt(page), parseInt(limit), total);
        } catch (error) {
            next(error);
        }
    },

    /**
     * GET /api/admin/criminal/:id
     * Get single criminal record
     */
    async getCriminal(req, res, next) {
        try {
            const { id } = req.params;

            const record = await CriminalRecord.findById(id);
            if (!record) {
                return response.notFound(res, 'Criminal record not found');
            }

            // Get person details
            const person = await Person.findById(record.person_id);

            // Get warnings
            const warnings = await Warning.findByPersonId(record.person_id);

            return response.success(res, {
                record,
                person,
                warnings
            });
        } catch (error) {
            next(error);
        }
    },

    /**
     * PUT /api/admin/criminal/:id
     * Update criminal record
     */
    async updateCriminal(req, res, next) {
        try {
            const { id } = req.params;
            const {
                name, age, cnic, crime_type, description,
                risk_level, verified, face_descriptor
            } = req.body;

            const record = await CriminalRecord.findById(id);
            if (!record) {
                return response.notFound(res, 'Criminal record not found');
            }

            // Handle image upload
            let image_url = undefined;
            if (req.file) {
                image_url = getFileUrl(req.file.filename, 'criminals');
            }

            // Parse face descriptor if provided
            let descriptor = face_descriptor;
            if (typeof face_descriptor === 'string') {
                try {
                    descriptor = JSON.parse(face_descriptor);
                } catch (e) {
                    return response.error(res, 'Invalid face descriptor format');
                }
            }

            // Update person
            await Person.update(record.person_id, {
                name,
                age: age ? parseInt(age) : undefined,
                cnic,
                image_url,
                face_descriptor: descriptor
            });

            // Update criminal record
            await CriminalRecord.update(id, {
                crime_type,
                description,
                risk_level,
                verified
            });

            const updatedRecord = await CriminalRecord.findById(id);

            return response.success(res, updatedRecord, 'Criminal record updated successfully');
        } catch (error) {
            next(error);
        }
    },

    /**
     * DELETE /api/admin/criminal/:id
     * Delete criminal record
     */
    async deleteCriminal(req, res, next) {
        try {
            const { id } = req.params;

            const record = await CriminalRecord.findById(id);
            if (!record) {
                return response.notFound(res, 'Criminal record not found');
            }

            // Delete person (cascades to criminal record)
            await Person.delete(record.person_id);

            return response.success(res, null, 'Criminal record deleted successfully');
        } catch (error) {
            next(error);
        }
    },

    /**
     * GET /api/admin/claims
     * Get all claims with pagination
     */
    async getClaims(req, res, next) {
        try {
            const { page = 1, limit = 10, status = '' } = req.query;
            const offset = (parseInt(page) - 1) * parseInt(limit);

            const claims = await Claim.findAll({
                limit: parseInt(limit),
                offset,
                status: status || null
            });

            const total = await Claim.count(status || null);

            return response.paginated(res, claims, parseInt(page), parseInt(limit), total);
        } catch (error) {
            next(error);
        }
    },

    /**
     * PUT /api/admin/claim/:id/verify
     * Approve or reject a claim
     */
    async verifyClaim(req, res, next) {
        try {
            const { id } = req.params;
            const { status, admin_response } = req.body;

            if (!['APPROVED', 'REJECTED'].includes(status)) {
                return response.error(res, 'Status must be APPROVED or REJECTED');
            }

            const claim = await Claim.findById(id);
            if (!claim) {
                return response.notFound(res, 'Claim not found');
            }

            if (claim.status !== 'PENDING') {
                return response.error(res, 'Claim has already been processed');
            }

            // Update claim status
            await Claim.updateStatus(id, status, admin_response);

            // If approved, apply rule engine logic
            if (status === 'APPROVED') {
                await RuleEngine.processClaimApproval(claim.person_id);
            }

            // Notify user of claim response
            await Notification.create({
                user_id: claim.user_id,
                title: `Claim ${status}`,
                message: `Your claim has been ${status.toLowerCase()}. ${admin_response || ''}`,
                type: 'claim_reply',
                related_id: claim.id
            });

            return response.success(res, null, `Claim ${status.toLowerCase()} successfully`);
        } catch (error) {
            next(error);
        }
    },

    /**
     * GET /api/admin/dashboard
     * Get dashboard statistics
     */
    async getDashboard(req, res, next) {
        try {
            // Get counts
            const [
                totalCriminals,
                pendingClaims,
                recentDetections,
                criminalStats,
                warningStats,
                detectionStats
            ] = await Promise.all([
                Person.count('CRIMINAL'),
                Claim.count('PENDING'),
                DetectionLog.getRecent(10, 24),
                CriminalRecord.getStatistics(),
                Warning.getStatistics(),
                DetectionLog.getStatistics()
            ]);

            // Get detection timeline
            const timeline = await DetectionLog.getHourlyTimeline();

            return response.success(res, {
                counts: {
                    totalCriminals,
                    pendingClaims,
                    underObservation: await Person.count('UNDER_OBSERVATION'),
                    totalDetections: detectionStats.total_detections
                },
                criminalStats,
                warningStats,
                detectionStats,
                recentDetections,
                timeline
            });
        } catch (error) {
            next(error);
        }
    },

    /**
     * GET /api/admin/users
     * Get list of users for linking
     */
    async getUsers(req, res, next) {
        try {
            const users = await User.findNonAdmins();
            return response.success(res, users);
        } catch (error) {
            next(error);
        }
    },

    /**
     * GET /api/admin/users/lookup
     * Lookup user by email for linking
     */
    async lookupUserByEmail(req, res, next) {
        try {
            const { email } = req.query;
            if (!email) {
                return response.error(res, 'Email is required');
            }

            const user = await User.findByEmail(email);
            if (!user) {
                return response.notFound(res, 'User not found');
            }

            // Also check if they already have a person record
            const person = await Person.findByUserId(user.id);

            return response.success(res, {
                user: {
                    id: user.id,
                    name: user.name,
                    email: user.email
                },
                person: person ? {
                    id: person.id,
                    age: person.age,
                    cnic: person.cnic
                } : null
            });
        } catch (error) {
            next(error);
        }
    }
};

module.exports = adminController;
