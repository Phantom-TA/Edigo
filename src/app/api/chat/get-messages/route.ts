import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { db, supabase } from '@/app/_configs/db';
import { CourseChats, Users, CourseEnrollments, CourseList } from '@/app/_configs/Schema';
import { eq, desc, and } from 'drizzle-orm';

export async function GET(req: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const courseId = req.nextUrl.searchParams.get('courseId');

    if (!courseId) {
      return NextResponse.json(
        { error: 'Course ID is required' },
        { status: 400 }
      );
    }

    let userRole = 'STUDENT';
    let userId_db = null;
    let accessGranted = false;

    // 1. Get user and check access
    try {
      // Drizzle check
      const user = await db
        .select({ id: Users.id, role: Users.role })
        .from(Users)
        .where(eq(Users.clerkId, userId))
        .limit(1);

      if (user.length > 0) {
        userId_db = user[0].id;
        userRole = user[0].role;

        if (userRole === 'TEACHER') {
          const course = await db
            .select()
            .from(CourseList)
            .where(eq(CourseList.courseId, courseId))
            .limit(1);
          if (course.length > 0 && course[0].creatorId === userId_db) accessGranted = true;
        } else {
          const enrollment = await db
            .select()
            .from(CourseEnrollments)
            .where(and(eq(CourseEnrollments.courseId, courseId), eq(CourseEnrollments.studentId, userId_db)))
            .limit(1);
          if (enrollment.length > 0) accessGranted = true;
        }
      }
    } catch (err) {
      console.error('Drizzle chat access check failed, falling back to Supabase:', err);
      
      // Supabase fallback
      const { data: user, error: userError } = await supabase
        .from('users')
        .select('id, role')
        .eq('clerkId', userId)
        .maybeSingle();

      if (user && !userError) {
        userId_db = user.id;
        userRole = user.role;

        if (userRole === 'TEACHER') {
          const { data: course } = await supabase
            .from('courseList')
            .select('creatorId')
            .eq('courseId', courseId)
            .maybeSingle();
          if (course && course.creatorId === userId_db) accessGranted = true;
        } else {
          const { data: enrollment } = await supabase
            .from('courseEnrollments')
            .select('id')
            .eq('courseId', courseId)
            .eq('studentId', userId_db)
            .maybeSingle();
          if (enrollment) accessGranted = true;
        }
      }
    }

    if (!userId_db) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    if (!accessGranted) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    // 2. Get messages
    let rawMessages: any[] = [];
    try {
      rawMessages = await db
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
    } catch (err) {
      console.error('Drizzle chat messages fetch failed, falling back to Supabase:', err);
      
      const { data, error } = await supabase
        .from('courseChats')
        .select('*')
        .eq('courseId', courseId)
        .order('createdAt', { ascending: false })
        .limit(100);
      
      if (!error) rawMessages = data || [];
    }

    return NextResponse.json({
      messages: rawMessages.reverse()
    }, { status: 200 });
  } catch (error) {
    console.error('Fatal chat fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch messages' },
      { status: 500 }
    );
  }
}
