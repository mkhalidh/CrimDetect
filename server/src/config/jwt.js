/**
 * JWT Configuration
 * Token generation and verification utilities
 * Handles authentication token management
 */

const jwt = require('jsonwebtoken');
require('dotenv').config();

// JWT Configuration constants
const JWT_SECRET = process.env.JWT_SECRET || 'default_secret_change_in_production';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

/**
 * Generate JWT token for a user
 * @param {Object} payload - User data to encode in token
 * @returns {string} JWT token
 */
const generateToken = (payload) => {
    return jwt.sign(
        {
            id: payload.id,
            email: payload.email,
            role: payload.role
        },
        JWT_SECRET,
        { expiresIn: JWT_EXPIRES_IN }
    );
};

/**
 * Verify JWT token
 * @param {string} token - JWT token to verify
 * @returns {Object|null} Decoded payload or null if invalid
 */
const verifyToken = (token) => {
    try {
        return jwt.verify(token, JWT_SECRET);
    } catch (error) {
        console.error('JWT Verification Error:', error.message);
        return null;
    }
};

/**
 * Decode token without verification (for debugging)
 * @param {string} token - JWT token to decode
 * @returns {Object|null} Decoded payload
 */
const decodeToken = (token) => {
    try {
        return jwt.decode(token);
    } catch (error) {
        return null;
    }
};

module.exports = {
    JWT_SECRET,
    JWT_EXPIRES_IN,
    generateToken,
    verifyToken,
    decodeToken
};
