import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { createClient } from '@supabase/supabase-js';

// Connection string from environment
const connectionString = process.env.DATABASE_URL || '';

// --- Direct Postgres Client (Drizzle) ---
// Note: This may time out on restricted networks (e.g. some office/school WiFi)
const client = postgres(connectionString || 'postgres://localhost:5432/dummy', {
    ssl: connectionString ? 'require' : false,
    max: 1,
    idle_timeout: 30,
    connect_timeout: 2, // Reduced from 30s to 2s for faster fallback in restricted networks
    connection: {
        application_name: 'alcademy'
    }
});
export const db = drizzle(client);

// --- HTTP Data API Client (Supabase) ---
// Note: This is more reliable on restricted networks (Port 443)
export const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || '',
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
);
