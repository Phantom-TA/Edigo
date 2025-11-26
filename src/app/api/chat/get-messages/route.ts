import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { db } from '@/app/_configs/db';
import { CourseChats, Users, CourseEnrollments, CourseList } from '@/app/_configs/Schema';
import { eq, desc, and } from 'drizzle-orm';

export async function GET(req: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user's database ID and role
    const user = await db
      .select({ id: Users.id, role: Users.role })
      .from(Users)
      .where(eq(Users.clerkId, userId))
      .limit(1);

    if (user.length === 0) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const courseId = req.nextUrl.searchParams.get('courseId');

    if (!courseId) {
      return NextResponse.json(
        { error: 'Course ID is required' },
        { status: 400 }
      );
    }

    // Check if user has access to this course
    // Teachers can access courses they created
    // Students can access courses they're enrolled in
    const userRole = user[0].role;
    const userId_db = user[0].id;

    if (userRole === 'TEACHER') {
      // Check if teacher created this course
      const course = await db
        .select()
        .from(CourseList)
        .where(eq(CourseList.courseId, courseId))
        .limit(1);

      if (course.length === 0 || course[0].creatorId !== userId_db) {
        return NextResponse.json(
          { error: 'Access denied' },
          { status: 403 }
        );
      }
    } else {
      // Check if student is enrolled
      const enrollment = await db
        .select()
        .from(CourseEnrollments)
        .where(
          and(
            eq(CourseEnrollments.courseId, courseId),
            eq(CourseEnrollments.studentId, userId_db)
          )
        )
        .limit(1);

      if (enrollment.length === 0) {
        return NextResponse.json(
          { error: 'You must be enrolled in this course to access chat' },
          { status: 403 }
        );
      }
    }

    // Get messages (last 100 messages)
    const messages = await db
      .select({
        id: CourseChats.id,
        courseId: CourseChats.courseId,
        message: CourseChats.message,
        createdAt: CourseChats.createdAt,
        isRead: CourseChats.isRead,
        senderId: CourseChats.senderId,
        senderName: CourseChats.senderName,
        senderImage: CourseChats.senderImage,
      })
      .from(CourseChats)
      .where(eq(CourseChats.courseId, courseId))
      .orderBy(desc(CourseChats.createdAt))
      .limit(100);

    // Return messages in ascending order (oldest first)
    return NextResponse.json({
      messages: messages.reverse()
    }, { status: 200 });
  } catch (error) {
    console.error('Error fetching messages:', error);
    return NextResponse.json(
      { error: 'Failed to fetch messages' },
      { status: 500 }
    );
  }
}
