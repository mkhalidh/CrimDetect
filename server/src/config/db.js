/**
 * Database Configuration
 * MySQL connection pool with promise-based queries
 * Handles connection pooling for better performance and reliability
 */

const mysql = require('mysql2/promise');
require('dotenv').config();

// Create connection pool for efficient database access
const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'criminal_detection_db',
    waitForConnections: true,
    connectionLimit: 10,           // Maximum number of connections in pool
    queueLimit: 0,                 // Unlimited queue
    enableKeepAlive: true,
    keepAliveInitialDelay: 0
});

/**
 * Execute a query with parameters
 * @param {string} sql - SQL query string
 * @param {Array} params - Query parameters
 * @returns {Promise<Array>} Query results
 */
const query = async (sql, params = []) => {
    try {
        const [results] = await pool.execute(sql, params);
        return results;
    } catch (error) {
        console.error('Database Query Error:', error.message);
        throw error;
    }
};

/**
 * Get a connection from the pool for transactions
 * @returns {Promise<Connection>} Database connection
 */
const getConnection = async () => {
    try {
        return await pool.getConnection();
    } catch (error) {
        console.error('Database Connection Error:', error.message);
        throw error;
    }
};

/**
 * Test database connection
 * @returns {Promise<boolean>} Connection status
 */
const testConnection = async () => {
    try {
        const connection = await pool.getConnection();
        console.log('✅ Database connected successfully');
        connection.release();
        return true;
    } catch (error) {
        console.error('❌ Database connection failed:', error.message);
        return false;
    }
};

module.exports = {
    pool,
    query,
    getConnection,
    testConnection
};
