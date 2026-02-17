/**
 * Complaint Routes
 */

const express = require('express');
const router = express.Router();
const complaintController = require('../controllers/complaintController');
const { authMiddleware } = require('../middlewares/authMiddleware');
const { isAdmin } = require('../middlewares/roleMiddleware');

// User: Submit complaint
router.post('/user/complaint', authMiddleware, complaintController.submitComplaint);

// User/Admin: Get complaints (Admin sees all, User sees theirs)
router.get('/complaints', authMiddleware, complaintController.getComplaints);

// Admin: Verify complaint
router.put('/admin/complaint/:id/verify', authMiddleware, isAdmin, complaintController.verifyComplaint);

// Public/Auth: Get stats (Heatmap data)
// Assuming stats should be visible to at least authenticated users
router.get('/stats/area-category', authMiddleware, complaintController.getStats);

// Admin: Delete area data
router.delete('/admin/area/:name', authMiddleware, isAdmin, complaintController.deleteArea);

module.exports = router;
