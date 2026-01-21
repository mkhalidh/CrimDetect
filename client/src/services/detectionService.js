/**
 * Detection Service
 * API calls for face detection operations
 */

import api from './api';

const detectionService = {
    /**
     * Match face descriptor against criminal database
     * @param {Array<number>} descriptor - 128-D face descriptor
     * @param {boolean} useWorker - Use worker thread for matching
     * @param {string} location - Optional location info
     * @returns {Promise<Object>} Match result
     */
    async detectFace(descriptor, useWorker = false, location = null) {
        return api.post('/detect/face', {
            descriptor,
            useWorker,
            location,
        });
    },

    /**
     * Get all criminals with descriptors for client-side matching
     * @returns {Promise<Object>} Criminals with face descriptors
     */
    async getCriminals() {
        return api.get('/detect/criminals');
    },

    /**
     * Log a detection (from client-side matching)
     * @param {Object} data - { person_id, confidence, location }
     * @returns {Promise<Object>} Created log
     */
    async logDetection(data) {
        return api.post('/detect/log', data);
    },

    /**
     * Batch detect faces
     * @param {Array<Object>} descriptors - Array of { descriptor }
     * @returns {Promise<Object>} Batch results
     */
    async batchDetect(descriptors) {
        return api.post('/detect/batch', { descriptors });
    },

    /**
     * Get detection logs
     * @param {Object} params - { page, limit, person_id }
     * @returns {Promise<Object>} Paginated logs
     */
    async getLogs(params = {}) {
        return api.get('/detect/logs', { params });
    },

    /**
     * Get recent detections
     * @param {number} limit - Maximum results
     * @param {number} hours - Hours to look back
     * @returns {Promise<Object>} Recent detections
     */
    async getRecent(limit = 10, hours = 24) {
        return api.get('/detect/recent', { params: { limit, hours } });
    },

    /**
     * Get detection statistics
     * @returns {Promise<Object>} Statistics and timeline
     */
    async getStats() {
        return api.get('/detect/stats');
    },

    /**
     * Get worker thread status
     * @returns {Promise<Object>} Worker pool status
     */
    async getWorkerStatus() {
        return api.get('/detect/worker-status');
    },
};

export default detectionService;
