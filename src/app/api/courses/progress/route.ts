import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { db } from '@/app/_configs/db';
import { CourseEnrollments, Users } from '@/app/_configs/Schema';
import { eq, and } from 'drizzle-orm';

// GET progress for a course
export async function GET(req: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user's database ID
    const user = await db
      .select({ id: Users.id })
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

    // Get enrollment with progress
    const enrollment = await db
      .select()
      .from(CourseEnrollments)
      .where(
        and(
          eq(CourseEnrollments.courseId, courseId),
          eq(CourseEnrollments.studentId, user[0].id)
        )
      )
      .limit(1);

    if (enrollment.length === 0) {
      return NextResponse.json({ progress: {} });
    }

    return NextResponse.json({ progress: enrollment[0].progress || {} });
  } catch (error) {
    console.error('Error fetching progress:', error);
    return NextResponse.json(
      { error: 'Failed to fetch progress' },
      { status: 500 }
    );
  }
}

// POST/PUT update progress for a course
export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user's database ID
    const user = await db
      .select({ id: Users.id })
      .from(Users)
      .where(eq(Users.clerkId, userId))
      .limit(1);

    if (user.length === 0) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const { courseId, weekNumber, topicIndex, completed } = await req.json();

    if (!courseId || weekNumber === undefined || topicIndex === undefined || completed === undefined) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Get current enrollment
    const enrollment = await db
      .select()
      .from(CourseEnrollments)
      .where(
        and(
          eq(CourseEnrollments.courseId, courseId),
          eq(CourseEnrollments.studentId, user[0].id)
        )
      )
      .limit(1);

    const progressKey = `week_${weekNumber}_topic_${topicIndex}`;
    let currentProgress = enrollment.length > 0 ? (enrollment[0].progress as any) || {} : {};

    // Update progress
    currentProgress[progressKey] = completed;

    if (enrollment.length === 0) {
      // Create enrollment if doesn't exist
      await db.insert(CourseEnrollments).values({
        courseId,
        studentId: user[0].id,
        progress: currentProgress,
      });
    } else {
      // Update existing enrollment
      await db
        .update(CourseEnrollments)
        .set({ progress: currentProgress })
        .where(eq(CourseEnrollments.id, enrollment[0].id));
    }

    return NextResponse.json({ success: true, progress: currentProgress });
  } catch (error) {
    console.error('Error updating progress:', error);
    return NextResponse.json(
      { error: 'Failed to update progress' },
      { status: 500 }
    );
  }
}
