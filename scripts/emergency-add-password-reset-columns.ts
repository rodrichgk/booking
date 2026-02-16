import 'dotenv/config';
import { Client } from 'pg';

async function migrate() {
    const connectionString = process.env.POSTGRES_URL;
    if (!connectionString) {
        throw new Error('POSTGRES_URL environment variable is not set');
    }

    const client = new Client({ connectionString });

    try {
        await client.connect();
        console.log('🔄 Running emergency migration for password reset columns...');

        await client.query(`
      ALTER TABLE "user" ADD COLUMN IF NOT EXISTS reset_password_token VARCHAR(255);
    `);

        await client.query(`
      ALTER TABLE "user" ADD COLUMN IF NOT EXISTS reset_password_expires TIMESTAMP;
    `);

        console.log('✅ Migration successful! Columns added to "user" table.');
    } catch (error) {
        console.error('❌ Migration failed:', error);
        process.exit(1);
    } finally {
        await client.end();
    }
}

migrate();
