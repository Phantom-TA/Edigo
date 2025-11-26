// Database Configuration
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config();

if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL environment variable is not set');
}

const connectionString = process.env.DATABASE_URL;

// Create PostgreSQL client with optimized settings for Supabase
const client = postgres(connectionString, {
    ssl: 'require',
    max: 1,
    idle_timeout: 30,
    connect_timeout: 30,
    connection: {
        application_name: 'alcademy'
    }
});

// Export Drizzle instance
export const db = drizzle(client);
