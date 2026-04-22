import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

let supabase: any = null;

const getSupabase = () => {
    if (!supabase) {
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
        const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
        if (!supabaseUrl || !supabaseKey) {
            console.warn('Missing Supabase environment variables during build');
            return null;
        }
        supabase = createClient(supabaseUrl, supabaseKey);
    }
    return supabase;
};

export const dynamic = 'force-dynamic';
export async function POST(req: NextRequest) {
    const formData = await req.formData();
    const file = formData.get('file');

    if (!file) {
        return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }

    if (!(file instanceof File)) {
        return NextResponse.json({ error: 'Invalid file type' }, { status: 400 });
    }

    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}.${fileExt}`;
    const filePath = `uploads/${fileName}`;

    const supabaseClient = getSupabase();
    if (!supabaseClient) {
        return NextResponse.json({ error: 'Supabase client not initialized' }, { status: 500 });
    }

    // Upload to Supabase Storage
    const { error } = await supabaseClient.storage
        .from('aicadmeyfilestorage') // <-- replace with your bucket name
        .upload(filePath, file, {
            cacheControl: '3600',
            upsert: false,
        });

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Get public URL
    const { data: publicUrlData } = supabaseClient.storage
        .from('aicadmeyfilestorage')
        .getPublicUrl(filePath);
    //console.log('Public URL Data:', publicUrlData);

    return NextResponse.json({ url: publicUrlData.publicUrl });
}

