const multer = require('multer');
const path = require('path');
const fs = require('fs');
const response = require('../utils/response');

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, '../../uploads');
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configure multer storage
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadsDir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, 'complaint-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({
    storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
    fileFilter: (req, file, cb) => {
        const allowedTypes = /jpeg|jpg|png|gif/;
        const mimeType = allowedTypes.test(file.mimetype);
        const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());

        if (mimeType && extname) {
            return cb(null, true);
        }
        cb(new Error('Only image files are allowed'));
    }
}).single('image');

const uploadController = {
    uploadImage: (req, res, next) => {
        upload(req, res, (err) => {
            if (err) {
                return response.error(res, err.message, 400);
            }

            if (!req.file) {
                return response.error(res, 'No file uploaded', 400);
            }

            const imageUrl = `/uploads/${req.file.filename}`;
            return response.success(res, { imageUrl });
        });
    }
};

module.exports = uploadController;
