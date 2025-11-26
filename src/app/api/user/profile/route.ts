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

    // Get user's database profile
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

    if (user.length === 0) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json(user[0]);
  } catch (error) {
    console.error('Error fetching user profile:', error);
    return NextResponse.json(
      { error: 'Failed to fetch profile' },
      { status: 500 }
    );
  }
}
