/**
 * Notification Service
 * Client-side API calls for notifications
 */

import api from './api';

const notificationService = {
    /**
     * Get user notifications
     * @returns {Promise<Object>} Notification list and unread count
     */
    async getNotifications() {
        return api.get('/notifications');
    },

    /**
     * Mark notification as read
     * @param {number} id - Notification ID
     * @returns {Promise<Object>} Response
     */
    async markAsRead(id) {
        return api.put(`/notifications/${id}/read`);
    },

    /**
     * Mark all notifications as read
     * @returns {Promise<Object>} Response
     */
    async markAllAsRead() {
        return api.put('/notifications/read-all');
    }
};

export default notificationService;
