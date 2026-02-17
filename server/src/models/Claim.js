/**
 * Claim Model
 * Handles user claims/appeals for status disputes
 * Supports proof uploads and admin responses
 */

const { query } = require('../config/db');

const Claim = {
    /**
     * Create a new claim
     * @param {Object} claimData - Claim data
     * @returns {Promise<Object>} Created claim
     */
    async create(claimData) {
        const {
            user_id,
            person_id,
            reason,
            proof_url = null
        } = claimData;

        const sql = `
            INSERT INTO claims (user_id, person_id, reason, proof_url)
            VALUES (?, ?, ?, ?)
        `;

        const result = await query(sql, [user_id, person_id, reason, proof_url]);

        return {
            id: result.insertId,
            user_id,
            person_id,
            reason,
            proof_url,
            status: 'PENDING'
        };
    },

    /**
     * Find claim by ID
     * @param {number} id - Claim ID
     * @returns {Promise<Object|null>} Claim or null
     */
    async findById(id) {
        const sql = `
            SELECT c.*, 
                   u.name as user_name, u.email as user_email,
                   p.name as person_name, p.status as person_status
            FROM claims c
            JOIN users u ON c.user_id = u.id
            JOIN persons p ON c.person_id = p.id
            WHERE c.id = ?
        `;
        const results = await query(sql, [id]);
        return results[0] || null;
    },

    /**
     * Find claims by user ID
     * @param {number} userId - User ID
     * @returns {Promise<Array>} Array of claims
     */
    async findByUserId(userId) {
        const sql = `
            SELECT c.*, p.name as person_name
            FROM claims c
            JOIN persons p ON c.person_id = p.id
            WHERE c.user_id = ?
            ORDER BY c.created_at DESC
        `;
        return query(sql, [userId]);
    },

    /**
     * Find claims by person ID
     * @param {number} personId - Person ID
     * @returns {Promise<Array>} Array of claims
     */
    async findByPersonId(personId) {
        const sql = `
            SELECT c.*, u.name as user_name
            FROM claims c
            JOIN users u ON c.user_id = u.id
            WHERE c.person_id = ?
            ORDER BY c.created_at DESC
        `;
        return query(sql, [personId]);
    },

    /**
     * Update claim status (admin action)
     * @param {number} id - Claim ID
     * @param {string} status - New status (APPROVED/REJECTED)
     * @param {string} adminResponse - Admin's response message
     * @returns {Promise<boolean>} Success status
     */
    async updateStatus(id, status, adminResponse = null) {
        const sql = `
            UPDATE claims 
            SET status = ?, admin_response = ?, updated_at = CURRENT_TIMESTAMP
            WHERE id = ?
        `;
        const result = await query(sql, [status, adminResponse, id]);
        return result.affectedRows > 0;
    },

    /**
     * Get all claims with pagination and filters
     * @param {Object} options - Query options
     * @returns {Promise<Array>} Array of claims
     */
    async findAll(options = {}) {
        const {
            limit = 10,
            offset = 0,
            status = null,
            user_id = null
        } = options;

        let sql = `
            SELECT c.*, 
                   u.name as user_name, u.email as user_email,
                   p.name as person_name, p.status as person_status, p.image_url
            FROM claims c
            JOIN users u ON c.user_id = u.id
            JOIN persons p ON c.person_id = p.id
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

        sql += ' ORDER BY c.created_at DESC LIMIT ? OFFSET ?';
        params.push(limit, offset);

        return query(sql, params);
    },

    /**
     * Get pending claims (for admin dashboard)
     * @param {number} limit - Maximum results
     * @returns {Promise<Array>} Array of pending claims
     */
    async getPending(limit = 10) {
        const sql = `
            SELECT c.*, 
                   u.name as user_name, u.email as user_email,
                   p.name as person_name, p.status as person_status
            FROM claims c
            JOIN users u ON c.user_id = u.id
            JOIN persons p ON c.person_id = p.id
            WHERE c.status = 'PENDING'
            ORDER BY c.created_at ASC
            LIMIT ?
        `;
        return query(sql, [limit]);
    },

    /**
     * Count claims by status
     * @param {string} status - Status to count (optional)
     * @returns {Promise<number>} Count
     */
    async count(status = null) {
        let sql = 'SELECT COUNT(*) as total FROM claims';
        const params = [];

        if (status) {
            sql += ' WHERE status = ?';
            params.push(status);
        }

        const result = await query(sql, params);
        return result[0].total;
    },

    /**
     * Check if user has pending claim for a person
     * @param {number} userId - User ID
     * @param {number} personId - Person ID
     * @returns {Promise<boolean>} Has pending claim
     */
    async hasPendingClaim(userId, personId) {
        const sql = `
            SELECT COUNT(*) as count 
            FROM claims 
            WHERE user_id = ? AND person_id = ? AND status = 'PENDING'
        `;
        const result = await query(sql, [userId, personId]);
        return result[0].count > 0;
    },

    /**
     * Delete claim
     * @param {number} id - Claim ID
     * @returns {Promise<boolean>} Success status
     */
    async delete(id) {
        const sql = 'DELETE FROM claims WHERE id = ?';
        const result = await query(sql, [id]);
        return result.affectedRows > 0;
    }
};

module.exports = Claim;
