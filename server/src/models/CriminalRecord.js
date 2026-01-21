/**
 * Criminal Record Model
 * Handles criminal records with crime details and risk levels
 * Links to Person model for extended criminal information
 */

const { query } = require('../config/db');

const CriminalRecord = {
    /**
     * Create a new criminal record
     * @param {Object} recordData - Criminal record data
     * @returns {Promise<Object>} Created record
     */
    async create(recordData) {
        const {
            person_id,
            crime_type,
            description = null,
            risk_level = 'LOW',
            violation_count = 0,
            verified = false
        } = recordData;

        const sql = `
            INSERT INTO criminal_records 
            (person_id, crime_type, description, risk_level, violation_count, verified)
            VALUES (?, ?, ?, ?, ?, ?)
        `;

        const result = await query(sql, [
            person_id, crime_type, description, risk_level, violation_count, verified
        ]);

        return {
            id: result.insertId,
            person_id,
            crime_type,
            description,
            risk_level,
            violation_count,
            verified
        };
    },

    /**
     * Find record by ID
     * @param {number} id - Record ID
     * @returns {Promise<Object|null>} Record or null
     */
    async findById(id) {
        const sql = `
            SELECT cr.*, p.name as person_name, p.image_url, p.cnic
            FROM criminal_records cr
            JOIN persons p ON cr.person_id = p.id
            WHERE cr.id = ?
        `;
        const results = await query(sql, [id]);
        return results[0] || null;
    },

    /**
     * Find records by person ID
     * @param {number} personId - Person ID
     * @returns {Promise<Array>} Array of records
     */
    async findByPersonId(personId) {
        const sql = `
            SELECT * FROM criminal_records 
            WHERE person_id = ? 
            ORDER BY created_at DESC
        `;
        return query(sql, [personId]);
    },

    /**
     * Update criminal record
     * @param {number} id - Record ID
     * @param {Object} recordData - Data to update
     * @returns {Promise<boolean>} Success status
     */
    async update(id, recordData) {
        const fields = [];
        const values = [];

        const allowedFields = [
            'crime_type', 'description', 'risk_level',
            'violation_count', 'verified'
        ];

        for (const field of allowedFields) {
            if (recordData[field] !== undefined) {
                fields.push(`${field} = ?`);
                values.push(recordData[field]);
            }
        }

        if (fields.length === 0) return false;

        values.push(id);
        const sql = `UPDATE criminal_records SET ${fields.join(', ')} WHERE id = ?`;
        const result = await query(sql, values);
        return result.affectedRows > 0;
    },

    /**
     * Delete criminal record
     * @param {number} id - Record ID
     * @returns {Promise<boolean>} Success status
     */
    async delete(id) {
        const sql = 'DELETE FROM criminal_records WHERE id = ?';
        const result = await query(sql, [id]);
        return result.affectedRows > 0;
    },

    /**
     * Get all criminal records with pagination and filters
     * @param {Object} options - Query options
     * @returns {Promise<Array>} Array of records
     */
    async findAll(options = {}) {
        const {
            limit = 10,
            offset = 0,
            crime_type = null,
            risk_level = null,
            verified = null,
            search = null
        } = options;

        let sql = `
            SELECT cr.*, p.name as person_name, p.image_url, p.cnic, p.age, p.status
            FROM criminal_records cr
            JOIN persons p ON cr.person_id = p.id
            WHERE 1=1
        `;
        const params = [];

        if (crime_type) {
            sql += ' AND cr.crime_type = ?';
            params.push(crime_type);
        }

        if (risk_level) {
            sql += ' AND cr.risk_level = ?';
            params.push(risk_level);
        }

        if (verified !== null) {
            sql += ' AND cr.verified = ?';
            params.push(verified);
        }

        if (search) {
            sql += ' AND (p.name LIKE ? OR p.cnic LIKE ? OR cr.crime_type LIKE ?)';
            params.push(`%${search}%`, `%${search}%`, `%${search}%`);
        }

        sql += ' ORDER BY cr.created_at DESC LIMIT ? OFFSET ?';
        params.push(limit, offset);

        return query(sql, params);
    },

    /**
     * Increment violation count
     * @param {number} id - Record ID
     * @returns {Promise<number>} New violation count
     */
    async incrementViolation(id) {
        const sql = `
            UPDATE criminal_records 
            SET violation_count = violation_count + 1 
            WHERE id = ?
        `;
        await query(sql, [id]);

        // Get updated count
        const record = await this.findById(id);
        return record ? record.violation_count : 0;
    },

    /**
     * Reset violation count (used when claim is approved)
     * @param {number} personId - Person ID
     * @returns {Promise<boolean>} Success status
     */
    async resetViolationCount(personId) {
        const sql = 'UPDATE criminal_records SET violation_count = 0 WHERE person_id = ?';
        const result = await query(sql, [personId]);
        return result.affectedRows > 0;
    },

    /**
     * Count total criminal records
     * @param {Object} filters - Optional filters
     * @returns {Promise<number>} Total count
     */
    async count(filters = {}) {
        let sql = 'SELECT COUNT(*) as total FROM criminal_records WHERE 1=1';
        const params = [];

        if (filters.risk_level) {
            sql += ' AND risk_level = ?';
            params.push(filters.risk_level);
        }

        if (filters.verified !== undefined) {
            sql += ' AND verified = ?';
            params.push(filters.verified);
        }

        const result = await query(sql, params);
        return result[0].total;
    },

    /**
     * Get statistics for dashboard
     * @returns {Promise<Object>} Statistics object
     */
    async getStatistics() {
        const sql = `
            SELECT 
                COUNT(*) as total,
                SUM(CASE WHEN risk_level = 'HIGH' THEN 1 ELSE 0 END) as high_risk,
                SUM(CASE WHEN risk_level = 'MEDIUM' THEN 1 ELSE 0 END) as medium_risk,
                SUM(CASE WHEN risk_level = 'LOW' THEN 1 ELSE 0 END) as low_risk,
                SUM(CASE WHEN verified = TRUE THEN 1 ELSE 0 END) as verified,
                SUM(CASE WHEN verified = FALSE THEN 1 ELSE 0 END) as unverified
            FROM criminal_records
        `;
        const result = await query(sql);
        return result[0];
    }
};

module.exports = CriminalRecord;
