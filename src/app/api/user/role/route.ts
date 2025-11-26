import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { db } from '@/app/_configs/db';
import { Users } from '@/app/_configs/Schema';
import { eq } from 'drizzle-orm';

export async function GET(req: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user's role from database
    const user = await db
      .select({ role: Users.role })
      .from(Users)
      .where(eq(Users.clerkId, userId))
      .limit(1);

    if (user.length === 0) {
      return NextResponse.json({ role: 'STUDENT' }); // Default to student if not found
    }

    return NextResponse.json({ role: user[0].role });
  } catch (error) {
    console.error('Error fetching user role:', error);
    return NextResponse.json(
      { error: 'Failed to fetch role' },
      { status: 500 }
    );
  }
}
