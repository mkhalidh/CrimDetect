/**
 * Warning Model
 * Tracks warning history for persons
 * Implements warning level progression: LOW → MEDIUM → HIGH
 */

const { query } = require('../config/db');

const Warning = {
    /**
     * Create a new warning
     * @param {Object} warningData - Warning data
     * @returns {Promise<Object>} Created warning
     */
    async create(warningData) {
        const {
            person_id,
            warning_level,
            message = null
        } = warningData;

        const sql = `
            INSERT INTO warnings (person_id, warning_level, message)
            VALUES (?, ?, ?)
        `;

        const result = await query(sql, [person_id, warning_level, message]);

        return {
            id: result.insertId,
            person_id,
            warning_level,
            message
        };
    },

    /**
     * Find warning by ID
     * @param {number} id - Warning ID
     * @returns {Promise<Object|null>} Warning or null
     */
    async findById(id) {
        const sql = `
            SELECT w.*, p.name as person_name
            FROM warnings w
            JOIN persons p ON w.person_id = p.id
            WHERE w.id = ?
        `;
        const results = await query(sql, [id]);
        return results[0] || null;
    },

    /**
     * Find all warnings for a person
     * @param {number} personId - Person ID
     * @returns {Promise<Array>} Array of warnings
     */
    async findByPersonId(personId) {
        const sql = `
            SELECT * FROM warnings 
            WHERE person_id = ? 
            ORDER BY created_at DESC
        `;
        return query(sql, [personId]);
    },

    /**
     * Count warnings for a person
     * @param {number} personId - Person ID
     * @returns {Promise<number>} Warning count
     */
    async countByPersonId(personId) {
        const sql = 'SELECT COUNT(*) as total FROM warnings WHERE person_id = ?';
        const result = await query(sql, [personId]);
        return result[0].total;
    },

    /**
     * Get unacknowledged warnings for a person
     * @param {number} personId - Person ID
     * @returns {Promise<Array>} Array of unacknowledged warnings
     */
    async getUnacknowledged(personId) {
        const sql = `
            SELECT * FROM warnings 
            WHERE person_id = ? AND acknowledged = FALSE
            ORDER BY created_at DESC
        `;
        return query(sql, [personId]);
    },

    /**
     * Acknowledge a warning
     * @param {number} id - Warning ID
     * @returns {Promise<boolean>} Success status
     */
    async acknowledge(id) {
        const sql = 'UPDATE warnings SET acknowledged = TRUE WHERE id = ?';
        const result = await query(sql, [id]);
        return result.affectedRows > 0;
    },

    /**
     * Acknowledge all warnings for a person
     * @param {number} personId - Person ID
     * @returns {Promise<boolean>} Success status
     */
    async acknowledgeAll(personId) {
        const sql = 'UPDATE warnings SET acknowledged = TRUE WHERE person_id = ?';
        const result = await query(sql, [personId]);
        return result.affectedRows > 0;
    },

    /**
     * Calculate appropriate warning level based on violation count
     * Rule: 1-2: LOW, 3-4: MEDIUM, 5+: HIGH
     * @param {number} violationCount - Current violation count
     * @returns {string} Warning level
     */
    calculateWarningLevel(violationCount) {
        if (violationCount >= 5) return 'HIGH';
        if (violationCount >= 3) return 'MEDIUM';
        return 'LOW';
    },

    /**
     * Get latest warning for a person
     * @param {number} personId - Person ID
     * @returns {Promise<Object|null>} Latest warning or null
     */
    async getLatest(personId) {
        const sql = `
            SELECT * FROM warnings 
            WHERE person_id = ? 
            ORDER BY created_at DESC 
            LIMIT 1
        `;
        const results = await query(sql, [personId]);
        return results[0] || null;
    },

    /**
     * Delete all warnings for a person
     * Used when claim is approved
     * @param {number} personId - Person ID
     * @returns {Promise<boolean>} Success status
     */
    async deleteByPersonId(personId) {
        const sql = 'DELETE FROM warnings WHERE person_id = ?';
        const result = await query(sql, [personId]);
        return result.affectedRows > 0;
    },

    /**
     * Get warning statistics
     * @returns {Promise<Object>} Statistics
     */
    async getStatistics() {
        const sql = `
            SELECT 
                COUNT(*) as total,
                SUM(CASE WHEN warning_level = 'HIGH' THEN 1 ELSE 0 END) as high,
                SUM(CASE WHEN warning_level = 'MEDIUM' THEN 1 ELSE 0 END) as medium,
                SUM(CASE WHEN warning_level = 'LOW' THEN 1 ELSE 0 END) as low,
                SUM(CASE WHEN acknowledged = FALSE THEN 1 ELSE 0 END) as unacknowledged
            FROM warnings
        `;
        const result = await query(sql);
        return result[0];
    }
};

module.exports = Warning;
