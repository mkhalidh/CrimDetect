/**
 * Admin Routes
 * Protected routes for admin operations
 */

const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const adminController = require('../controllers/adminController');
const { authMiddleware } = require('../middlewares/authMiddleware');
const { isAdmin } = require('../middlewares/roleMiddleware');
const { upload } = require('../config/multer');

// All admin routes require authentication and admin role
router.use(authMiddleware);
router.use(isAdmin);

// Validation rules
const criminalValidation = [
    body('name')
        .notEmpty().withMessage('Name is required')
        .isLength({ min: 2, max: 100 }).withMessage('Name must be 2-100 characters'),
    body('crime_type')
        .notEmpty().withMessage('Crime type is required'),
    body('risk_level')
        .optional()
        .isIn(['LOW', 'MEDIUM', 'HIGH']).withMessage('Invalid risk level')
];

const verifyClaimValidation = [
    body('status')
        .notEmpty().withMessage('Status is required')
        .isIn(['APPROVED', 'REJECTED']).withMessage('Status must be APPROVED or REJECTED'),
    body('admin_response')
        .optional()
        .isLength({ max: 500 }).withMessage('Response must not exceed 500 characters')
];

// Criminal management routes
router.get('/users/lookup', adminController.lookupUserByEmail);
router.get('/users', adminController.getUsers);
router.post('/criminal', upload.single('image'), criminalValidation, adminController.addCriminal);
router.get('/criminals', adminController.getCriminals);
router.get('/criminal/:id', adminController.getCriminal);
router.put('/criminal/:id', upload.single('image'), adminController.updateCriminal);
router.delete('/criminal/:id', adminController.deleteCriminal);

// Claims management routes
router.get('/claims', adminController.getClaims);
router.put('/claim/:id/verify', verifyClaimValidation, adminController.verifyClaim);

// Dashboard route
router.get('/dashboard', adminController.getDashboard);

module.exports = router;
