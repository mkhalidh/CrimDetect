/**
 * Complaint Model
 * Handles user complaints and status updates
 */

const { query } = require('../config/db');

const Complaint = {
    /**
     * Create a new complaint
     * @param {Object} complaintData 
     */
    async create(complaintData) {
        const {
            user_id,
            category,
            description,
            location_country = 'Pakistan',
            location_city,
            location_area,
            latitude = null,
            longitude = null,
            image_url = null
        } = complaintData;

        const sql = `
            INSERT INTO complaints 
            (user_id, category, description, location_country, location_city, location_area, latitude, longitude, image_url)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;

        const result = await query(sql, [
            user_id, category, description, location_country, location_city, location_area, latitude, longitude, image_url
        ]);

        return {
            id: result.insertId,
            ...complaintData,
            status: 'PENDING'
        };
    },

    /**
     * Find all complaints with filters
     */
    async findAll(options = {}) {
        const {
            limit = 20,
            offset = 0,
            status = null,
            user_id = null,
            city = null
        } = options;

        let sql = `
            SELECT c.*, u.name as user_name, u.email as user_email
            FROM complaints c
            JOIN users u ON c.user_id = u.id
            WHERE 1=1
        `;
        const params = [];

        if (status) {
            sql += ' AND c.status = ?';
            params.push(status);
        }

        if (user_id) {
            sql += ' AND c.user_id = ?';
            params.push(user_id);
        }

        if (city) {
            sql += ' AND c.location_city = ?';
            params.push(city);
        }

        sql += ' ORDER BY c.created_at DESC LIMIT ? OFFSET ?';
        params.push(parseInt(limit), parseInt(offset));

        const results = await query(sql, params);

        // Get total count
        let countSql = 'SELECT COUNT(*) as total FROM complaints c WHERE 1=1';
        const countParams = [];

        if (status) {
            countSql += ' AND c.status = ?';
            countParams.push(status);
        }
        if (user_id) {
            countSql += ' AND c.user_id = ?';
            countParams.push(user_id);
        }
        if (city) {
            countSql += ' AND c.location_city = ?';
            countParams.push(city);
        }

        const countResult = await query(countSql, countParams);

        return {
            complaints: results,
            total: countResult[0].total
        };
    },

    /**
     * Find complaint by ID
     */
    async findById(id) {
        const sql = `
            SELECT c.*, u.name as user_name, u.email as user_email
            FROM complaints c
            JOIN users u ON c.user_id = u.id
            WHERE c.id = ?
        `;
        const results = await query(sql, [id]);
        return results[0] || null;
    },

    /**
     * Update complaint status
     */
    async updateStatus(id, status, admin_feedback = null) {
        const sql = 'UPDATE complaints SET status = ?, admin_feedback = ? WHERE id = ?';
        const result = await query(sql, [status, admin_feedback, id]);
        return result.affectedRows > 0;
    },

    /**
     * Update complaint location area
     */
    async updateLocationArea(id, areaName) {
        const sql = 'UPDATE complaints SET location_area = ? WHERE id = ?';
        const result = await query(sql, [areaName, id]);
        return result.affectedRows > 0;
    },

    /**
     * Delete complaints for a specific area (Admin feature)
     */
    async deleteByArea(areaName) {
        const sql = 'DELETE FROM complaints WHERE location_area = ?';
        return query(sql, [areaName]);
    }
};

module.exports = Complaint;
