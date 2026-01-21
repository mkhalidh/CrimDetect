/**
 * User Routes
 * Protected routes for regular user operations
 */

const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const userController = require('../controllers/userController');
const { authMiddleware } = require('../middlewares/authMiddleware');
const { upload } = require('../config/multer');

// All user routes require authentication
router.use(authMiddleware);

// Validation rules
const claimValidation = [
    body('reason')
        .notEmpty().withMessage('Reason is required')
        .isLength({ min: 10, max: 1000 }).withMessage('Reason must be 10-1000 characters')
];

const profileValidation = [
    body('age')
        .optional()
        .isInt({ min: 1, max: 150 }).withMessage('Invalid age'),
    body('cnic')
        .optional()
        .matches(/^[0-9]{5}-[0-9]{7}-[0-9]$/).withMessage('Invalid CNIC format (XXXXX-XXXXXXX-X)')
];

// Profile routes
router.get('/profile', userController.getProfile);
router.put('/profile', upload.single('image'), profileValidation, userController.updateProfile);

// Warnings routes
router.get('/warnings', userController.getWarnings);
router.post('/warnings/:id/acknowledge', userController.acknowledgeWarning);

// Claims routes
router.post('/claim', upload.single('proof'), claimValidation, userController.submitClaim);
router.get('/claims', userController.getClaims);

// Status route
router.get('/status', userController.getStatus);

// Activity history
router.get('/activity', userController.getActivity);

module.exports = router;
