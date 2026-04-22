const postgres = require('postgres');
require('dotenv').config();

async function runCheck() {
    const url = process.env.DATABASE_URL;
    if (!url) {
        console.log('DATABASE_URL is missing in .env');
        return;
    }

    console.log('--- Database Connection Check ---');
    console.log('URL Length:', url.length);

    // Manual Parsing
    try {
        const regex = /postgresql:\/\/([^:]+):([^@]+)@([^:]+):(\d+)\/(.+)/;
        const match = url.match(regex);
        
        if (!match) {
            console.log('Could not parse DATABASE_URL with standard regex.');
        } else {
            const [_, user, pass, host, port, dbname] = match;
            console.log('Parsed - User:', user);
            console.log('Parsed - Host:', host);
            console.log('Parsed - Port:', port);
            console.log('Parsed - DB:', dbname);
            console.log('Parsed - Pass Length:', pass.length);

            // Attempt 1: Raw URI
            console.log('\n--- Attempt 1: Connecting with URI ---');
            const sql1 = postgres(url, { ssl: 'require', connect_timeout: 10 });
            try {
                const res1 = await sql1`SELECT 1 as test`;
                console.log('URI Connection: SUCCESS', res1);
            } catch (e) {
                console.log('URI Connection: FAILED', e.message);
            } finally {
                await sql1.end();
            }

            // Attempt 2: Separate parameters (Decoded password)
            console.log('\n--- Attempt 2: Connecting with separate parameters ---');
            const sql2 = postgres({
                host,
                port: parseInt(port),
                user,
                password: decodeURIComponent(pass),
                database: dbname,
                ssl: 'require',
                connect_timeout: 10
            });
            try {
                const res2 = await sql2`SELECT 1 as test`;
                console.log('Params Connection: SUCCESS', res2);
                
                // If success, check tables
                const tables = await sql2`SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'`;
                console.log('Tables found:', tables.map(t => t.table_name).join(', '));
            } catch (e) {
                console.log('Params Connection: FAILED', e.message);
            } finally {
                await sql2.end();
            }
        }
    } catch (err) {
        console.log('Check execution error:', err.message);
    }
}

runCheck();
