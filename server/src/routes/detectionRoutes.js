/**
 * Detection Routes
 * Routes for face detection and matching
 */

const express = require('express');
const router = express.Router();
const detectionController = require('../controllers/detectionController');
const { authMiddleware, optionalAuth } = require('../middlewares/authMiddleware');
const { isAdmin } = require('../middlewares/roleMiddleware');

// Public detection endpoint (requires optional auth for logging)
router.post('/face', optionalAuth, detectionController.detectFace);

// Get criminals for client-side matching (protected)
router.get('/criminals', authMiddleware, detectionController.getCriminals);

// Log detection from client
router.post('/log', optionalAuth, detectionController.logDetection);

// Batch detection (protected - requires auth)
router.post('/batch', authMiddleware, detectionController.detectBatch);

// Detection logs (admin only)
router.get('/logs', authMiddleware, isAdmin, detectionController.getLogs);

// Recent detections (admin only)
router.get('/recent', authMiddleware, isAdmin, detectionController.getRecent);

// Statistics (admin only)
router.get('/stats', authMiddleware, isAdmin, detectionController.getStats);

// Worker status (admin only)
router.get('/worker-status', authMiddleware, isAdmin, detectionController.getWorkerStatus);

module.exports = router;
