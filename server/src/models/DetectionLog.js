/**
 * Detection Log Model
 * Records all face detection events
 * Tracks when and where criminals are detected
 */

const { query } = require('../config/db');

const DetectionLog = {
    /**
     * Create a new detection log entry
     * @param {Object} logData - Detection log data
     * @returns {Promise<Object>} Created log entry
     */
    async create(logData) {
        const {
            person_id,
            confidence,
            location = null
        } = logData;

        const sql = `
            INSERT INTO detection_logs (person_id, confidence, location)
            VALUES (?, ?, ?)
        `;

        const result = await query(sql, [person_id, confidence, location]);

        // Auto-increment violation count for criminal
        try {
            await query(`
                UPDATE criminal_records 
                SET violation_count = violation_count + 1 
                WHERE person_id = ?
            `, [person_id]);
        } catch (err) {
            console.error('Failed to increment violation count:', err);
        }

        return {
            id: result.insertId,
            person_id,
            confidence,
            location,
            detected_at: new Date()
        };
    },

    /**
     * Find log entry by ID
     * @param {number} id - Log ID
     * @returns {Promise<Object|null>} Log entry or null
     */
    async findById(id) {
        const sql = `
            SELECT dl.*, p.name as person_name, p.image_url,
                   cr.crime_type, cr.risk_level
            FROM detection_logs dl
            JOIN persons p ON dl.person_id = p.id
            LEFT JOIN criminal_records cr ON p.id = cr.person_id
            WHERE dl.id = ?
        `;
        const results = await query(sql, [id]);
        return results[0] || null;
    },

    /**
     * Find all logs for a person
     * @param {number} personId - Person ID
     * @param {number} limit - Maximum results
     * @returns {Promise<Array>} Array of logs
     */
    async findByPersonId(personId, limit = 50) {
        const sql = `
            SELECT * FROM detection_logs 
            WHERE person_id = ? 
            ORDER BY detected_at DESC
            LIMIT ?
        `;
        return query(sql, [personId, limit]);
    },

    /**
     * Get recent detections
     * @param {number} limit - Maximum results
     * @param {number} hours - Hours to look back
     * @returns {Promise<Array>} Array of recent detections
     */
    async getRecent(limit = 10, hours = 24) {
        const sql = `
            SELECT dl.*, p.name as person_name, p.image_url, p.status,
                   cr.crime_type, cr.risk_level
            FROM detection_logs dl
            JOIN persons p ON dl.person_id = p.id
            LEFT JOIN criminal_records cr ON p.id = cr.person_id
            WHERE dl.detected_at >= DATE_SUB(NOW(), INTERVAL ? HOUR)
            ORDER BY dl.detected_at DESC
            LIMIT ?
        `;
        return query(sql, [hours, limit]);
    },

    /**
     * Get all detection logs with pagination
     * @param {Object} options - Query options
     * @returns {Promise<Array>} Array of logs
     */
    async findAll(options = {}) {
        const {
            limit = 10,
            offset = 0,
            person_id = null,
            from_date = null,
            to_date = null
        } = options;

        let sql = `
            SELECT dl.*, p.name as person_name, p.image_url, p.status,
                   cr.crime_type, cr.risk_level
            FROM detection_logs dl
            JOIN persons p ON dl.person_id = p.id
            LEFT JOIN criminal_records cr ON p.id = cr.person_id
            WHERE 1=1
        `;
        const params = [];

        if (person_id) {
            sql += ' AND dl.person_id = ?';
            params.push(person_id);
        }

        if (from_date) {
            sql += ' AND dl.detected_at >= ?';
            params.push(from_date);
        }

        if (to_date) {
            sql += ' AND dl.detected_at <= ?';
            params.push(to_date);
        }

        sql += ' ORDER BY dl.detected_at DESC LIMIT ? OFFSET ?';
        params.push(limit, offset);

        return query(sql, params);
    },

    /**
     * Count detections for a person
     * @param {number} personId - Person ID
     * @returns {Promise<number>} Detection count
     */
    async countByPersonId(personId) {
        const sql = 'SELECT COUNT(*) as total FROM detection_logs WHERE person_id = ?';
        const result = await query(sql, [personId]);
        return result[0].total;
    },

    /**
     * Count total detections
     * @param {number} hours - Optional, count only from last N hours
     * @returns {Promise<number>} Total count
     */
    async count(hours = null) {
        let sql = 'SELECT COUNT(*) as total FROM detection_logs';
        const params = [];

        if (hours) {
            sql += ' WHERE detected_at >= DATE_SUB(NOW(), INTERVAL ? HOUR)';
            params.push(hours);
        }

        const result = await query(sql, params);
        return result[0].total;
    },

    /**
     * Get detection statistics
     * @returns {Promise<Object>} Statistics object
     */
    async getStatistics() {
        const sql = `
            SELECT 
                COUNT(*) as total_detections,
                COUNT(DISTINCT person_id) as unique_persons,
                AVG(confidence) as avg_confidence,
                MAX(detected_at) as last_detection,
                (SELECT COUNT(*) FROM detection_logs 
                 WHERE detected_at >= DATE_SUB(NOW(), INTERVAL 24 HOUR)) as last_24h,
                (SELECT COUNT(*) FROM detection_logs 
                 WHERE detected_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)) as last_7d
            FROM detection_logs
        `;
        const result = await query(sql);
        return result[0];
    },

    /**
     * Get detection timeline (hourly counts for the last 24 hours)
     * @returns {Promise<Array>} Hourly detection counts
     */
    async getHourlyTimeline() {
        const sql = `
            SELECT 
                DATE_FORMAT(detected_at, '%Y-%m-%d %H:00:00') as hour,
                COUNT(*) as count
            FROM detection_logs
            WHERE detected_at >= DATE_SUB(NOW(), INTERVAL 24 HOUR)
            GROUP BY DATE_FORMAT(detected_at, '%Y-%m-%d %H:00:00')
            ORDER BY hour ASC
        `;
        return query(sql);
    },

    /**
     * Delete old logs (cleanup)
     * @param {number} days - Delete logs older than N days
     * @returns {Promise<number>} Deleted count
     */
    async deleteOld(days = 90) {
        const sql = `
            DELETE FROM detection_logs 
            WHERE detected_at < DATE_SUB(NOW(), INTERVAL ? DAY)
        `;
        const result = await query(sql, [days]);
        return result.affectedRows;
    }
};

module.exports = DetectionLog;
