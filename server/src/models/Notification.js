/**
 * Notification Model
 * Handles persistent alerts for users and admins
 */

const { query } = require('../config/db');

const Notification = {
    /**
     * Create a new notification
     * @param {Object} data - { user_id, title, message, type, related_id }
     * @returns {Promise<Object>} Created notification
     */
    async create(data) {
        const { user_id, title, message, type = 'info', related_id = null } = data;
        const sql = `
            INSERT INTO notifications (user_id, title, message, type, related_id)
            VALUES (?, ?, ?, ?, ?)
        `;
        const result = await query(sql, [user_id, title, message, type, related_id]);
        return { id: result.insertId, ...data };
    },

    /**
     * Find notifications for a user
     * @param {number} userId - User ID
     * @param {Object} options - { unreadOnly, limit }
     * @returns {Promise<Array>} List of notifications
     */
    async findByUserId(userId, options = {}) {
        const { unreadOnly = false, limit = 50 } = options;
        let sql = 'SELECT * FROM notifications WHERE user_id = ?';
        const params = [userId];

        if (unreadOnly) {
            sql += ' AND is_read = FALSE';
        }

        sql += ' ORDER BY created_at DESC LIMIT ?';
        params.push(limit);

        return query(sql, params);
    },

    /**
     * Find notifications for all admins
     * @param {Object} options - { unreadOnly, limit }
     * @returns {Promise<Array>} List of notifications
     */
    async findForAdmins(options = {}) {
        const { unreadOnly = false, limit = 50 } = options;
        let sql = `
            SELECT n.* FROM notifications n
            JOIN users u ON n.user_id = u.id
            WHERE u.role = 'admin'
        `;
        const params = [];

        if (unreadOnly) {
            sql += ' AND n.is_read = FALSE';
        }

        sql += ' ORDER BY n.created_at DESC LIMIT ?';
        params.push(limit);

        return query(sql, params);
    },

    /**
     * Mark a notification as read
     * @param {number} id - Notification ID
     * @returns {Promise<boolean>} Success status
     */
    async markAsRead(id) {
        const sql = 'UPDATE notifications SET is_read = TRUE WHERE id = ?';
        const result = await query(sql, [id]);
        return result.affectedRows > 0;
    },

    /**
     * Mark all notifications as read for a user
     * @param {number} userId - User ID
     * @returns {Promise<boolean>} Success status
     */
    async markAllAsRead(userId) {
        const sql = 'UPDATE notifications SET is_read = TRUE WHERE user_id = ?';
        const result = await query(sql, [userId]);
        return result.affectedRows > 0;
    },

    /**
     * Count unread notifications for a user
     * @param {number} userId - User ID
     * @returns {Promise<number>} Unread count
     */
    async countUnread(userId) {
        const sql = 'SELECT COUNT(*) as total FROM notifications WHERE user_id = ? AND is_read = FALSE';
        const result = await query(sql, [userId]);
        return result[0].total;
    },

    /**
     * Create notification for all admins
     * @param {Object} data - { title, message, type, related_id }
     */
    async notifyAdmins(data) {
        const admins = await query("SELECT id FROM users WHERE role = 'admin'");
        for (const admin of admins) {
            await this.create({ ...data, user_id: admin.id });
        }
    }
};

module.exports = Notification;
