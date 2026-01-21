/**
 * Role Middleware
 * Checks user roles for authorization
 * Used to protect admin-only routes
 */

/**
 * Check if user has admin role
 */
const isAdmin = (req, res, next) => {
    if (!req.user) {
        return res.status(401).json({
            success: false,
            message: 'Authentication required.'
        });
    }

    if (req.user.role !== 'admin') {
        return res.status(403).json({
            success: false,
            message: 'Access denied. Admin privileges required.'
        });
    }

    next();
};

/**
 * Check if user has regular user role (or higher)
 */
const isUser = (req, res, next) => {
    if (!req.user) {
        return res.status(401).json({
            success: false,
            message: 'Authentication required.'
        });
    }

    if (req.user.role !== 'user' && req.user.role !== 'admin') {
        return res.status(403).json({
            success: false,
            message: 'Access denied. Invalid role.'
        });
    }

    next();
};

/**
 * Check if user has one of the allowed roles
 * @param {Array<string>} allowedRoles - Array of allowed roles
 */
const hasRole = (allowedRoles) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: 'Authentication required.'
            });
        }

        if (!allowedRoles.includes(req.user.role)) {
            return res.status(403).json({
                success: false,
                message: `Access denied. Required roles: ${allowedRoles.join(', ')}`
            });
        }

        next();
    };
};

module.exports = { isAdmin, isUser, hasRole };
