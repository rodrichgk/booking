const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env.local') });
const { Client } = require('pg');

async function migrate() {
    const connectionString = process.env.POSTGRES_URL;
    if (!connectionString) {
        console.error('POSTGRES_URL environment variable is not set');
        try {
            require('dotenv').config(); // Try default .env
        } catch (e) { }

        if (!process.env.POSTGRES_URL) {
            console.error('Still not set after checking .env');
            process.exit(1);
        }
    }

    const client = new Client({ connectionString: process.env.POSTGRES_URL });

    try {
        await client.connect();
        console.log('🔄 Running emergency migration...');

        await client.query(`ALTER TABLE "user" ADD COLUMN IF NOT EXISTS reset_password_token VARCHAR(255);`);
        await client.query(`ALTER TABLE "user" ADD COLUMN IF NOT EXISTS reset_password_expires TIMESTAMP;`);

        console.log('✅ Migration successful!');
    } catch (error) {
        console.error('❌ Migration failed:', error);
        process.exit(1);
    } finally {
        await client.end();
    }
}

migrate();
