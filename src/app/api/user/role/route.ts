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

    // Get user's role from database
    let role = null;

    // 1. Try Drizzle
    try {
      const user = await db
        .select({ role: Users.role })
        .from(Users)
        .where(eq(Users.clerkId, userId))
        .limit(1);

      if (user && user.length > 0) {
        role = user[0].role;
      }
    } catch (drizzleError: any) {
      console.error('Drizzle role fetch failed:', drizzleError.message);
    }

    // 2. Fallback to Supabase if Drizzle failed or returned nothing
    if (!role) {
      try {
        const { data, error } = await supabase
          .from('users')
          .select('role')
          .eq('clerkId', userId)
          .maybeSingle();

        if (error) {
          console.error('Supabase role fetch failed:', error.message);
        } else if (data) {
          role = data.role;
        }
      } catch (supaError) {
        console.error('Supabase fetch exception:', supaError);
      }
    }

    // 3. Final default if still not found
    if (!role) {
      role = 'STUDENT';
    }

    return NextResponse.json({ role });
  } catch (error) {
    console.error('Error fetching user role:', error);
    return NextResponse.json(
      { error: 'Failed to fetch role' },
      { status: 500 }
    );
  }
}
