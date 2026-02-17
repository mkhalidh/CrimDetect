/**
 * Authentication Middleware
 * Verifies JWT tokens and protects routes
 * Attaches user data to request object
 */

const { verifyToken } = require('../config/jwt');
const User = require('../models/User');

/**
 * JWT Authentication Middleware
 * Protects routes requiring authentication
 */
const authMiddleware = async (req, res, next) => {
    try {
        // Get token from Authorization header
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({
                success: false,
                message: 'Access denied. No token provided.'
            });
        }

        // Extract token
        const token = authHeader.split(' ')[1];

        // Verify token
        const decoded = verifyToken(token);

        if (!decoded) {
            return res.status(401).json({
                success: false,
                message: 'Invalid or expired token.'
            });
        }

        // Get user from database
        const user = await User.findById(decoded.id);

        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'User not found.'
            });
        }

        // Attach user to request
        req.user = {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role
        };

        next();
    } catch (error) {
        console.error('Auth Middleware Error:', error.message);
        return res.status(500).json({
            success: false,
            message: 'Authentication error.'
        });
    }
};

/**
 * Optional Auth Middleware
 * Attaches user if token exists, but doesn't require it
 */
const optionalAuth = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;

        if (authHeader && authHeader.startsWith('Bearer ')) {
            const token = authHeader.split(' ')[1];
            const decoded = verifyToken(token);

            if (decoded) {
                const user = await User.findById(decoded.id);
                if (user) {
                    req.user = {
                        id: user.id,
                        name: user.name,
                        email: user.email,
                        role: user.role
                    };
                }
            }
        }

        next();
    } catch (error) {
        // Continue without user data
        next();
    }
};

module.exports = { authMiddleware, optionalAuth };
