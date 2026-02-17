/**
 * User Model
 * Handles user data operations including authentication
 * Supports both admin and regular user roles
 */

const { query } = require('../config/db');
const bcrypt = require('bcryptjs');

const User = {
    /**
     * Create a new user with hashed password
     * @param {Object} userData - User data object
     * @returns {Promise<Object>} Created user
     */
    async create(userData) {
        const { name, email, password, role = 'user' } = userData;

        // Hash password with bcrypt (10 rounds)
        const hashedPassword = await bcrypt.hash(password, 10);

        const sql = `
            INSERT INTO users (name, email, password, role)
            VALUES (?, ?, ?, ?)
        `;

        const result = await query(sql, [name, email, hashedPassword, role]);
        return { id: result.insertId, name, email, role };
    },

    /**
     * Find user by ID
     * @param {number} id - User ID
     * @returns {Promise<Object|null>} User object or null
     */
    async findById(id) {
        const sql = 'SELECT id, name, email, role, created_at FROM users WHERE id = ?';
        const results = await query(sql, [id]);
        return results[0] || null;
    },

    /**
     * Find user by email (includes password for auth)
     * @param {string} email - User email
     * @returns {Promise<Object|null>} User object or null
     */
    async findByEmail(email) {
        const sql = 'SELECT * FROM users WHERE email = ?';
        const results = await query(sql, [email]);
        return results[0] || null;
    },

    /**
     * Update user data
     * @param {number} id - User ID
     * @param {Object} userData - Data to update
     * @returns {Promise<boolean>} Success status
     */
    async update(id, userData) {
        const fields = [];
        const values = [];

        if (userData.name) {
            fields.push('name = ?');
            values.push(userData.name);
        }
        if (userData.email) {
            fields.push('email = ?');
            values.push(userData.email);
        }
        if (userData.password) {
            fields.push('password = ?');
            values.push(await bcrypt.hash(userData.password, 10));
        }

        if (fields.length === 0) return false;

        values.push(id);
        const sql = `UPDATE users SET ${fields.join(', ')} WHERE id = ?`;
        const result = await query(sql, values);
        return result.affectedRows > 0;
    },

    /**
     * Verify password against stored hash
     * @param {string} password - Plain text password
     * @param {string} hashedPassword - Stored hash
     * @returns {Promise<boolean>} Match result
     */
    async verifyPassword(password, hashedPassword) {
        return bcrypt.compare(password, hashedPassword);
    },

    /**
     * Get all users (admin function)
     * @param {number} limit - Results limit
     * @param {number} offset - Results offset
     * @returns {Promise<Array>} Array of users
     */
    async findAll(limit = 10, offset = 0) {
        const sql = `
            SELECT id, name, email, role, created_at 
            FROM users 
            ORDER BY created_at DESC 
            LIMIT ? OFFSET ?
        `;
        return query(sql, [limit, offset]);
    },

    /**
     * Count total users
     * @returns {Promise<number>} Total count
     */
    async count() {
        const sql = 'SELECT COUNT(*) as total FROM users';
        const result = await query(sql);
        return result[0].total;
    },

    /**
     * Find all non-admin users for linking
     * @returns {Promise<Array>} Array of users
     */
    async findNonAdmins() {
        const sql = `
            SELECT u.id, u.name, u.email, p.age, p.cnic 
            FROM users u
            LEFT JOIN persons p ON u.id = p.user_id
            WHERE u.role != 'admin' 
            ORDER BY u.name ASC
        `;
        return query(sql);
    }
};

module.exports = User;
