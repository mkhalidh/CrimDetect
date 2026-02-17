/**
 * User Service
 * API calls for user panel operations
 */

import api from './api';

const userService = {
    /**
     * Get user profile with status
     * @returns {Promise<Object>} User profile data
     */
    async getProfile() {
        return api.get('/user/profile');
    },

    /**
     * Update user profile
     * @param {FormData} formData - Profile data with optional image
     * @returns {Promise<Object>} Updated profile
     */
    async updateProfile(formData) {
        return api.put('/user/profile', formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
        });
    },

    /**
     * Get user warnings
     * @returns {Promise<Object>} Warnings list with summary
     */
    async getWarnings() {
        return api.get('/user/warnings');
    },

    /**
     * Acknowledge a warning
     * @param {number} id - Warning ID
     * @returns {Promise<Object>} Response
     */
    async acknowledgeWarning(id) {
        return api.post(`/user/warnings/${id}/acknowledge`);
    },

    /**
     * Submit a claim
     * @param {FormData} formData - Claim data with proof
     * @returns {Promise<Object>} Created claim
     */
    async submitClaim(formData) {
        return api.post('/user/claim', formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
        });
    },

    /**
     * Get user's claims
     * @returns {Promise<Object>} Claims list
     */
    async getClaims() {
        return api.get('/user/claims');
    },

    /**
     * Get current status
     * @returns {Promise<Object>} Status data
     */
    async getStatus() {
        return api.get('/user/status');
    },

    /**
     * Get activity history
     * @returns {Promise<Object>} Activity list
     */
    async getActivity() {
        return api.get('/user/activity');
    },
};

export default userService;
