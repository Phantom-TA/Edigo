import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { db, supabase } from '@/app/_configs/db';
import { Users } from '@/app/_configs/Schema';
import { eq } from 'drizzle-orm';

export async function POST(req: NextRequest) {
  try {
    const { userId: authUserId } = await auth();

    if (!authUserId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { clerkId, email, fullName, profileImage, role } = body;

    // Validate role
    if (role !== 'TEACHER' && role !== 'STUDENT') {
      return NextResponse.json({ error: 'Invalid role' }, { status: 400 });
    }

    let userExists = false;
    let existingId = null;

    // 1. Check if user exists
    try {
      const existingUser = await db
        .select()
        .from(Users)
        .where(eq(Users.clerkId, clerkId))
        .limit(1);
      
      if (existingUser.length > 0) {
        userExists = true;
        existingId = existingUser[0].id;
      }
    } catch (drizzleError) {
      console.error('Drizzle user check failed, falling back to Supabase:', drizzleError);
      const { data, error } = await supabase
        .from('users')
        .select('id')
        .eq('clerkId', clerkId)
        .maybeSingle();
      
      if (data && !error) {
        userExists = true;
        existingId = data.id;
      }
    }

    // 2. Update or Insert
    if (userExists) {
      try {
        await db
          .update(Users)
          .set({
            role,
            email,
            fullName,
            profileImage,
            updatedAt: new Date(),
          })
          .where(eq(Users.clerkId, clerkId));
      } catch (drizzleError) {
        console.error('Drizzle update failed, falling back to Supabase:', drizzleError);
        const { error } = await supabase
          .from('users')
          .update({
            role,
            email,
            fullName,
            profileImage,
            updatedAt: new Date().toISOString(),
          })
          .eq('clerkId', clerkId);
        
        if (error) throw error;
      }
    } else {
      try {
        await db.insert(Users).values({
          clerkId,
          email,
          fullName,
          profileImage,
          role,
        });
      } catch (drizzleError) {
        console.error('Drizzle insert failed, falling back to Supabase:', drizzleError);
        const { error } = await supabase
          .from('users')
          .insert({
            clerkId,
            email,
            fullName,
            profileImage,
            role,
          });
        
        if (error) throw error;
      }
    }

    return NextResponse.json({ success: true, role });
  } catch (error) {
    console.error('Fatal error setting user role:', error);
    return NextResponse.json(
      { error: 'Failed to set role' },
      { status: 500 }
    );
  }
}
