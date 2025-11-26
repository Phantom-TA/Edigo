import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { db } from '@/app/_configs/db';
import { Users } from '@/app/_configs/Schema';
import { eq } from 'drizzle-orm';

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { clerkId, email, fullName, profileImage, role } = body;

    // Validate role
    if (role !== 'TEACHER' && role !== 'STUDENT') {
      return NextResponse.json({ error: 'Invalid role' }, { status: 400 });
    }

    // Check if user already exists
    const existingUser = await db
      .select()
      .from(Users)
      .where(eq(Users.clerkId, clerkId))
      .limit(1);

    if (existingUser.length > 0) {
      // Update existing user
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
    } else {
      // Create new user
      await db.insert(Users).values({
        clerkId,
        email,
        fullName,
        profileImage,
        role,
      });
    }

    return NextResponse.json({ success: true, role });
  } catch (error) {
    console.error('Error setting user role:', error);
    return NextResponse.json(
      { error: 'Failed to set role' },
      { status: 500 }
    );
  }
}
