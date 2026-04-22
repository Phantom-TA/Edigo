import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
export const dynamic = 'force-dynamic';
import { db, supabase } from '@/app/_configs/db';
import { Users } from '@/app/_configs/Schema';
import { eq } from 'drizzle-orm';

export async function GET(req: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user's database profile
    let userProfile: any = null;

    try {
      // 1. Drizzle check
      const user = await db
        .select({
          id: Users.id,
          email: Users.email,
          fullName: Users.fullName,
          profileImage: Users.profileImage,
          role: Users.role,
        })
        .from(Users)
        .where(eq(Users.clerkId, userId))
        .limit(1);
      
      if (user.length > 0) userProfile = user[0];
    } catch (drizzleError) {
      console.error('Drizzle profile fetch failed, falling back to Supabase:', drizzleError);
      
      // 2. Supabase fallback
      const { data, error } = await supabase
        .from('users')
        .select('id, email, fullName, profileImage, role')
        .eq('clerkId', userId)
        .maybeSingle();

      if (data && !error) userProfile = data;
    }

    if (!userProfile) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json(userProfile);
  } catch (error) {
    console.error('Fatal profile fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch profile' },
      { status: 500 }
    );
  }
}
