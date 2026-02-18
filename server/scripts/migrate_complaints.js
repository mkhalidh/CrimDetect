
const fs = require('fs');
const path = require('path');
const { pool } = require('../src/config/db');

async function migrate() {
    try {
        console.log('Starting migration...');

        const schemaPath = path.join(__dirname, '../extras/complaints_schema.sql');
        const sql = fs.readFileSync(schemaPath, 'utf8');

        // Split by semicolon but ignore empty lines
        const queries = sql
            .split(';')
            .filter(q => q.trim().length > 0);

        console.log(`Found ${queries.length} queries to execute.`);

        const connection = await pool.getConnection();

        try {
            for (let i = 0; i < queries.length; i++) {
                const query = queries[i];
                console.log(`Executing query ${i + 1}...`);
                await connection.query(query);
            }
            console.log('✅ Migration completed successfully!');
        } finally {
            connection.release();
        }

        process.exit(0);
    } catch (error) {
        console.error('❌ Migration failed:', error);
        process.exit(1);
    }
}

migrate();
