/**
 * Person Model
 * Handles person data including face descriptors
 * Central model linking to criminal records, warnings, and claims
 */

const { query, getConnection } = require('../config/db');

const Person = {
    /**
     * Create a new person record
     * @param {Object} personData - Person data object
     * @returns {Promise<Object>} Created person
     */
    async create(personData) {
        const {
            user_id = null,
            name,
            age = null,
            cnic = null,
            image_url = null,
            face_descriptor = null,
            status = 'NORMAL'
        } = personData;

        const sql = `
            INSERT INTO persons (user_id, name, age, cnic, image_url, face_descriptor, status)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        `;

        // Convert face_descriptor array to JSON string
        const descriptorJson = face_descriptor ? JSON.stringify(face_descriptor) : null;

        const result = await query(sql, [
            user_id, name, age, cnic, image_url, descriptorJson, status
        ]);

        return {
            id: result.insertId,
            user_id, name, age, cnic,
            image_url, status
        };
    },

    /**
     * Find person by ID
     * @param {number} id - Person ID
     * @returns {Promise<Object|null>} Person object or null
     */
    async findById(id) {
        const sql = `
            SELECT p.*, u.email as user_email 
            FROM persons p 
            LEFT JOIN users u ON p.user_id = u.id 
            WHERE p.id = ?
        `;
        const results = await query(sql, [id]);
        if (results[0] && results[0].face_descriptor) {
            results[0].face_descriptor = JSON.parse(results[0].face_descriptor);
        }
        return results[0] || null;
    },

    /**
     * Find person by user ID
     * @param {number} userId - User ID
     * @returns {Promise<Object|null>} Person object or null
     */
    async findByUserId(userId) {
        const sql = 'SELECT * FROM persons WHERE user_id = ?';
        const results = await query(sql, [userId]);
        if (results[0] && results[0].face_descriptor) {
            results[0].face_descriptor = JSON.parse(results[0].face_descriptor);
        }
        return results[0] || null;
    },

    /**
     * Find person by CNIC
     * @param {string} cnic - CNIC number
     * @returns {Promise<Object|null>} Person object or null
     */
    async findByCnic(cnic) {
        const sql = 'SELECT * FROM persons WHERE cnic = ?';
        const results = await query(sql, [cnic]);
        return results[0] || null;
    },

    /**
     * Update person data
     * @param {number} id - Person ID
     * @param {Object} personData - Data to update
     * @returns {Promise<boolean>} Success status
     */
    async update(id, personData) {
        const fields = [];
        const values = [];

        const allowedFields = ['name', 'age', 'cnic', 'image_url', 'face_descriptor', 'status'];

        for (const field of allowedFields) {
            if (personData[field] !== undefined) {
                fields.push(`${field} = ?`);
                if (field === 'face_descriptor') {
                    values.push(JSON.stringify(personData[field]));
                } else {
                    values.push(personData[field]);
                }
            }
        }

        if (fields.length === 0) return false;

        values.push(id);
        const sql = `UPDATE persons SET ${fields.join(', ')} WHERE id = ?`;
        const result = await query(sql, values);
        return result.affectedRows > 0;
    },

    /**
     * Delete person by ID
     * @param {number} id - Person ID
     * @returns {Promise<boolean>} Success status
     */
    async delete(id) {
        const sql = 'DELETE FROM persons WHERE id = ?';
        const result = await query(sql, [id]);
        return result.affectedRows > 0;
    },

    /**
     * Get all persons with pagination and filters
     * @param {Object} options - Query options
     * @returns {Promise<Array>} Array of persons
     */
    async findAll(options = {}) {
        const {
            limit = 10,
            offset = 0,
            status = null,
            search = null
        } = options;

        let sql = `
            SELECT p.*, 
                   (SELECT COUNT(*) FROM criminal_records cr WHERE cr.person_id = p.id) as record_count
            FROM persons p
            WHERE 1=1
        `;
        const params = [];

        if (status) {
            sql += ' AND p.status = ?';
            params.push(status);
        }

        if (search) {
            sql += ' AND (p.name LIKE ? OR p.cnic LIKE ?)';
            params.push(`%${search}%`, `%${search}%`);
        }

        sql += ' ORDER BY p.created_at DESC LIMIT ? OFFSET ?';
        params.push(limit, offset);

        return query(sql, params);
    },

    /**
     * Get all criminals with face descriptors
     * Used for face matching
     * @returns {Promise<Array>} Array of criminals with descriptors
     */
    async getAllCriminalsWithDescriptors() {
        const sql = `
            SELECT p.id, p.name, p.face_descriptor, p.image_url, p.status, p.cnic,
                   u.email,
                   cr.crime_type, cr.risk_level, cr.description, cr.violation_count
            FROM persons p
            JOIN criminal_records cr ON p.id = cr.person_id
            LEFT JOIN users u ON p.user_id = u.id
            WHERE p.face_descriptor IS NOT NULL
            AND p.status = 'CRIMINAL'
        `;
        const results = await query(sql);

        // Parse face descriptors
        return results.map(r => ({
            ...r,
            face_descriptor: r.face_descriptor ? JSON.parse(r.face_descriptor) : null
        }));
    },

    /**
     * Update person status
     * @param {number} id - Person ID
     * @param {string} status - New status
     * @returns {Promise<boolean>} Success status
     */
    async updateStatus(id, status) {
        const sql = 'UPDATE persons SET status = ? WHERE id = ?';
        const result = await query(sql, [status, id]);
        return result.affectedRows > 0;
    },

    /**
     * Count persons by status
     * @param {string} status - Status to count (optional)
     * @returns {Promise<number>} Count
     */
    async count(status = null) {
        let sql = 'SELECT COUNT(*) as total FROM persons';
        const params = [];

        if (status) {
            sql += ' WHERE status = ?';
            params.push(status);
        }

        const result = await query(sql, params);
        return result[0].total;
    }
};

module.exports = Person;
