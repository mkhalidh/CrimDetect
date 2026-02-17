/**
 * Response Utility
 * Standardized API response formats
 * Ensures consistent response structure across all endpoints
 */

/**
 * Success response
 * @param {Object} res - Express response object
 * @param {Object} data - Response data
 * @param {string} message - Success message
 * @param {number} statusCode - HTTP status code (default: 200)
 */
const success = (res, data = null, message = 'Success', statusCode = 200) => {
    return res.status(statusCode).json({
        success: true,
        message,
        data
    });
};

/**
 * Created response (201)
 * @param {Object} res - Express response object
 * @param {Object} data - Created resource data
 * @param {string} message - Success message
 */
const created = (res, data = null, message = 'Resource created successfully') => {
    return success(res, data, message, 201);
};

/**
 * Error response
 * @param {Object} res - Express response object
 * @param {string} message - Error message
 * @param {number} statusCode - HTTP status code (default: 400)
 * @param {Object} errors - Additional error details
 */
const error = (res, message = 'An error occurred', statusCode = 400, errors = null) => {
    return res.status(statusCode).json({
        success: false,
        message,
        ...(errors && { errors })
    });
};

/**
 * Not found response (404)
 * @param {Object} res - Express response object
 * @param {string} message - Not found message
 */
const notFound = (res, message = 'Resource not found') => {
    return error(res, message, 404);
};

/**
 * Unauthorized response (401)
 * @param {Object} res - Express response object
 * @param {string} message - Unauthorized message
 */
const unauthorized = (res, message = 'Unauthorized access') => {
    return error(res, message, 401);
};

/**
 * Forbidden response (403)
 * @param {Object} res - Express response object
 * @param {string} message - Forbidden message
 */
const forbidden = (res, message = 'Access forbidden') => {
    return error(res, message, 403);
};

/**
 * Validation error response (422)
 * @param {Object} res - Express response object
 * @param {Array} errors - Validation errors
 */
const validationError = (res, errors) => {
    return res.status(422).json({
        success: false,
        message: 'Validation failed',
        errors
    });
};

/**
 * Paginated response
 * @param {Object} res - Express response object
 * @param {Array} data - Array of items
 * @param {number} page - Current page
 * @param {number} limit - Items per page
 * @param {number} total - Total items
 * @param {string} message - Success message
 */
const paginated = (res, data, page, limit, total, message = 'Success') => {
    const totalPages = Math.ceil(total / limit);

    return res.status(200).json({
        success: true,
        message,
        data,
        pagination: {
            page,
            limit,
            total,
            totalPages,
            hasNextPage: page < totalPages,
            hasPrevPage: page > 1
        }
    });
};

module.exports = {
    success,
    created,
    error,
    notFound,
    unauthorized,
    forbidden,
    validationError,
    paginated
};
