const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

async function runCheck() {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!url || !anonKey) {
        console.log('Supabase URL or Anon Key is missing in .env');
        return;
    }

    console.log('--- Supabase HTTP Connection Check ---');
    console.log('URL:', url);

    const supabase = createClient(url, anonKey);

    try {
        console.log('Attempting to fetch 1 row from courseList...');
        const { data, error } = await supabase
            .from('courseList')
            .select('*')
            .limit(1);

        if (error) {
            console.log('HTTP Connection: FAILED', error.message);
        } else {
            console.log('HTTP Connection: SUCCESS');
            console.log('Sample Data:', data);
        }
    } catch (err) {
        console.log('Check execution error:', err.message);
    }
}

runCheck();
