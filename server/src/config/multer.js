/**
 * Multer Configuration
 * File upload handling with validation and secure storage
 * Supports image uploads for criminal records and claim proofs
 */

const multer = require('multer');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const fs = require('fs');

// Ensure upload directory exists
const uploadDir = path.join(__dirname, '../../uploads');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

// Allowed file types for security
const ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
const MAX_FILE_SIZE = parseInt(process.env.MAX_FILE_SIZE) || 5 * 1024 * 1024; // 5MB default

/**
 * Storage configuration
 * Uses disk storage with unique filenames
 */
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        // Create subdirectories based on upload type
        let subDir = 'general';
        if (req.baseUrl.includes('admin')) {
            subDir = 'criminals';
        } else if (req.baseUrl.includes('user')) {
            subDir = 'claims';
        }

        const fullPath = path.join(uploadDir, subDir);
        if (!fs.existsSync(fullPath)) {
            fs.mkdirSync(fullPath, { recursive: true });
        }

        cb(null, fullPath);
    },
    filename: (req, file, cb) => {
        // Generate unique filename with original extension
        const ext = path.extname(file.originalname).toLowerCase();
        const uniqueName = `${uuidv4()}${ext}`;
        cb(null, uniqueName);
    }
});

/**
 * File filter for validating uploads
 * Only allows specified image types
 */
const fileFilter = (req, file, cb) => {
    if (ALLOWED_TYPES.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error(`Invalid file type. Allowed types: ${ALLOWED_TYPES.join(', ')}`), false);
    }
};

/**
 * Multer upload instance
 * Configured with storage, file filter, and size limits
 */
const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: {
        fileSize: MAX_FILE_SIZE,
        files: 1 // Single file upload
    }
});

/**
 * Multiple files upload instance
 * For bulk uploads if needed
 */
const uploadMultiple = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: {
        fileSize: MAX_FILE_SIZE,
        files: 5 // Maximum 5 files
    }
});

/**
 * Get public URL for uploaded file
 * @param {string} filename - Name of the uploaded file
 * @param {string} subDir - Subdirectory (criminals/claims/general)
 * @returns {string} Public URL path
 */
const getFileUrl = (filename, subDir = 'general') => {
    return `/uploads/${subDir}/${filename}`;
};

/**
 * Delete uploaded file
 * @param {string} filePath - Path to the file
 */
const deleteFile = (filePath) => {
    const fullPath = path.join(uploadDir, filePath);
    if (fs.existsSync(fullPath)) {
        fs.unlinkSync(fullPath);
    }
};

module.exports = {
    upload,
    uploadMultiple,
    getFileUrl,
    deleteFile,
    ALLOWED_TYPES,
    MAX_FILE_SIZE
};
