/**
 * Stats Model
 * Handles area-wise crime statistics
 */

const { query } = require('../config/db');

const Stats = {
    /**
     * Increment crime count for an area and category
     */
    async increment(country, city, area, category) {
        // Normalize area name to Title Case for consistency
        const normalizedArea = area.trim().toLowerCase().split(' ')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ');

        const sql = `
            INSERT INTO area_category_stats (country, city, area, category, crime_count)
            VALUES (?, ?, ?, ?, 1)
            ON DUPLICATE KEY UPDATE crime_count = crime_count + 1, last_update = NOW()
        `;
        const result = await query(sql, [country, city, normalizedArea, category]);
        return result;
    },

    /**
     * Get all stats for heatmap
     */
    async getAll() {
        const sql = 'SELECT * FROM area_category_stats ORDER BY crime_count DESC';
        return query(sql);
    },

    /**
     * Get aggregated stats by category
     */
    async getCategoryStats() {
        const sql = `
            SELECT category, CAST(SUM(crime_count) AS UNSIGNED) as total
            FROM area_category_stats
            GROUP BY category
            ORDER BY total DESC
        `;
        return query(sql);
    },

    /**
     * Get top high-crime areas
     */
    async getTopAreas(limit = 5) {
        const sql = `
            SELECT city, area, CAST(SUM(crime_count) AS UNSIGNED) as total
            FROM area_category_stats
            GROUP BY city, area
            ORDER BY total DESC
            LIMIT ?
        `;
        return query(sql, [limit]);
    },

    /**
     * Get aggregated stats by area AND category for stacked bar chart
     */
    async getAreaCategoryStats() {
        const sql = `
            SELECT area, category, CAST(SUM(crime_count) AS UNSIGNED) as count
            FROM area_category_stats
            GROUP BY area, category
            ORDER BY area, count DESC
        `;
        return query(sql);
    },

    /**
     * Get aggregated area stats with coordinates for map
     */
    async getAreaStatsWithCoords() {
        const sql = `
            SELECT 
                s.city, 
                s.area, 
                SUM(s.crime_count) as total,
                AVG(c.latitude) as latitude,
                AVG(c.longitude) as longitude
            FROM area_category_stats s
            LEFT JOIN complaints c ON s.area = c.location_area AND s.city = c.location_city
            WHERE c.latitude IS NOT NULL AND c.longitude IS NOT NULL
            GROUP BY s.city, s.area
            ORDER BY total DESC
            LIMIT 100
        `;
        return query(sql);
    },

    /**
     * Delete stats for a specific area
     */
    async deleteArea(areaName) {
        const sql = 'DELETE FROM area_category_stats WHERE area = ?';
        return query(sql, [areaName]);
    }
};

module.exports = Stats;
