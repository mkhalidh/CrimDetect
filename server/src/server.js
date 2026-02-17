/**
 * Server Entry Point
 * Handles server startup, database connection, and worker threads
 */

const app = require('./app');
const { testConnection } = require('./config/db');
const workerManager = require('./workers/workerManager');
require('dotenv').config();

const PORT = process.env.PORT || 5000;

const startServer = async () => {
    try {
        // Test database connection
        const dbConnected = await testConnection();
        if (!dbConnected) {
            console.error('⚠️  Database connection failed. Server starting anyway...');
        }

        // Initialize worker threads
        try {
            workerManager.initialize();
            console.log('✅ Worker threads initialized');
        } catch (error) {
            console.error('⚠️  Worker initialization failed:', error.message);
        }

        // Start HTTP server
        app.listen(PORT, () => {
            console.log(`
╔═══════════════════════════════════════════════════════════╗
║     Criminal Face Detection System - Backend Server       ║
╠═══════════════════════════════════════════════════════════╣
║  🚀 Server running on: http://localhost:${PORT}             ║
║  📁 Environment: ${(process.env.NODE_ENV || 'development').padEnd(39)}║
║  🗄️  Database: ${dbConnected ? 'Connected ✅'.padEnd(42) : 'Disconnected ❌'.padEnd(42)}║
╚═══════════════════════════════════════════════════════════╝
            `);
        });
    } catch (error) {
        console.error('Failed to start server:', error);
        process.exit(1);
    }
};

// Handle graceful shutdown
process.on('SIGTERM', async () => {
    console.log('\nReceived SIGTERM. Graceful shutdown...');
    await workerManager.shutdown();
    process.exit(0);
});

process.on('SIGINT', async () => {
    console.log('\nReceived SIGINT. Graceful shutdown...');
    await workerManager.shutdown();
    process.exit(0);
});

// Start the server
startServer();
