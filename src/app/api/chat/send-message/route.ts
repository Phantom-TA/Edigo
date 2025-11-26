import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { db } from '@/app/_configs/db';
import { CourseChats, Users } from '@/app/_configs/Schema';
import { eq } from 'drizzle-orm';

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user's database ID and profile
    const user = await db
      .select({
        id: Users.id,
        fullName: Users.fullName,
        profileImage: Users.profileImage
      })
      .from(Users)
      .where(eq(Users.clerkId, userId))
      .limit(1);

    if (user.length === 0) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const { courseId, message } = await req.json();

    if (!courseId || !message) {
      return NextResponse.json(
        { error: 'Course ID and message are required' },
        { status: 400 }
      );
    }

    // Insert message into database
    const newMessage = await db.insert(CourseChats).values({
      courseId,
      senderId: user[0].id,
      senderName: user[0].fullName,
      senderImage: user[0].profileImage,
      message,
      isRead: false,
    }).returning();

    return NextResponse.json({
      success: true,
      message: newMessage[0]
    }, { status: 201 });
  } catch (error) {
    console.error('Error sending message:', error);
    return NextResponse.json(
      { error: 'Failed to send message' },
      { status: 500 }
    );
  }
}
