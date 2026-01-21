/**
 * Error Handling Middleware
 * Centralized error handling for the application
 * Handles various error types and formats responses
 */

/**
 * Not Found Handler (404)
 */
const notFound = (req, res, next) => {
    const error = new Error(`Not Found - ${req.originalUrl}`);
    error.status = 404;
    next(error);
};

/**
 * Global Error Handler
 */
const errorHandler = (err, req, res, next) => {
    // Log error for debugging
    console.error('Error:', err.message);
    if (process.env.NODE_ENV === 'development') {
        console.error('Stack:', err.stack);
    }

    // Default status code
    let statusCode = err.status || err.statusCode || 500;
    let message = err.message || 'Internal Server Error';

    // Handle specific error types
    if (err.name === 'ValidationError') {
        statusCode = 400;
        message = Object.values(err.errors).map(e => e.message).join(', ');
    }

    if (err.name === 'JsonWebTokenError') {
        statusCode = 401;
        message = 'Invalid token';
    }

    if (err.name === 'TokenExpiredError') {
        statusCode = 401;
        message = 'Token expired';
    }

    // MySQL duplicate entry error
    if (err.code === 'ER_DUP_ENTRY') {
        statusCode = 409;
        message = 'Duplicate entry. This record already exists.';
    }

    // MySQL foreign key constraint error
    if (err.code === 'ER_NO_REFERENCED_ROW_2') {
        statusCode = 400;
        message = 'Referenced record does not exist.';
    }

    // Multer file size error
    if (err.code === 'LIMIT_FILE_SIZE') {
        statusCode = 400;
        message = 'File size too large. Maximum allowed size is 5MB.';
    }

    // Multer file type error
    if (err.message && err.message.includes('Invalid file type')) {
        statusCode = 400;
    }

    // Send error response
    res.status(statusCode).json({
        success: false,
        message,
        ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    });
};

/**
 * Async Handler Wrapper
 * Wraps async functions to catch errors
 * @param {Function} fn - Async function to wrap
 */
const asyncHandler = (fn) => (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
};

module.exports = { notFound, errorHandler, asyncHandler };
