import axios from 'axios';
import authService from './authService';

const API_URL = 'http://localhost:5000/api/complaints';

const complaintService = {
    // Submit a new complaint
    submitComplaint: async (data) => {
        try {
            const token = authService.getToken();
            const response = await axios.post(`${API_URL}/user/complaint`, data, {
                headers: { Authorization: `Bearer ${token}` }
            });
            return response.data;
        } catch (error) {
            throw error.response?.data?.message || 'Failed to submit complaint';
        }
    },

    // Get complaints (Admin: all, User: mine)
    getComplaints: async (params = {}) => {
        try {
            const token = authService.getToken();
            const response = await axios.get(`${API_URL}/complaints`, {
                params,
                headers: { Authorization: `Bearer ${token}` }
            });
            return response.data;
        } catch (error) {
            throw error.response?.data?.message || 'Failed to fetch complaints';
        }
    },

    // Verify complaint (Admin only)
    verifyComplaint: async (id, action, feedback) => {
        try {
            const token = authService.getToken();
            const response = await axios.put(
                `${API_URL}/admin/complaint/${id}/verify`,
                { action, feedback },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            return response.data;
        } catch (error) {
            throw error.response?.data?.message || 'Failed to verify complaint';
        }
    },

    // Get stats for analytics
    getStats: async () => {
        try {
            const token = authService.getToken();
            const response = await axios.get(`${API_URL}/stats/area-category`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            return response.data;
        } catch (error) {
            // Fallback if public
            try {
                const response = await axios.get(`${API_URL}/stats/area-category`);
                return response.data;
            } catch (e) {
                throw error.response?.data?.message || 'Failed to fetch stats';
            }
        }
    },

    // Delete area data (Admin only)
    deleteArea: async (areaName) => {
        try {
            const token = authService.getToken();
            const response = await axios.delete(`${API_URL}/admin/area/${areaName}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            return response.data;
        } catch (error) {
            throw error.response?.data?.message || 'Failed to delete area';
        }
    }
};

export default complaintService;
