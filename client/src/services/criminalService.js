/**
 * Criminal Service
 * API calls for criminal management (admin)
 */

import api from './api';

const criminalService = {
    /**
     * Get all criminals with pagination/filters
     * @param {Object} params - { page, limit, search, crime_type, risk_level }
     * @returns {Promise<Object>} Paginated criminal list
     */
    async getCriminals(params = {}) {
        return api.get('/admin/criminals', { params });
    },

    /**
     * Get single criminal by ID
     * @param {number} id - Criminal record ID
     * @returns {Promise<Object>} Criminal details
     */
    async getCriminal(id) {
        return api.get(`/admin/criminal/${id}`);
    },

    /**
     * Add new criminal
     * @param {FormData} formData - Criminal data with image
     * @returns {Promise<Object>} Created criminal
     */
    async addCriminal(formData) {
        return api.post('/admin/criminal', formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
        });
    },

    /**
     * Update criminal record
     * @param {number} id - Criminal record ID
     * @param {FormData} formData - Updated data
     * @returns {Promise<Object>} Updated criminal
     */
    async updateCriminal(id, formData) {
        return api.put(`/admin/criminal/${id}`, formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
        });
    },

    /**
     * Delete criminal record
     * @param {number} id - Criminal record ID
     * @returns {Promise<Object>} Response
     */
    async deleteCriminal(id) {
        return api.delete(`/admin/criminal/${id}`);
    },

    /**
     * Get all claims
     * @param {Object} params - { page, limit, status }
     * @returns {Promise<Object>} Paginated claims list
     */
    async getClaims(params = {}) {
        return api.get('/admin/claims', { params });
    },

    /**
     * Verify (approve/reject) a claim
     * @param {number} id - Claim ID
     * @param {Object} data - { status, admin_response }
     * @returns {Promise<Object>} Response
     */
    async verifyClaim(id, data) {
        return api.put(`/admin/claim/${id}/verify`, data);
    },

    /**
     * Get dashboard statistics
     * @returns {Promise<Object>} Dashboard data
     */
    async getDashboard() {
        return api.get('/admin/dashboard');
    },

    /**
     * Get users for linking
     * @returns {Promise<Object>} List of users
     */
    async getUsers() {
        return api.get('/admin/users');
    },
};

export default criminalService;
