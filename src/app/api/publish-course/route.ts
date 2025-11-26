import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { db } from '@/app/_configs/db';
import { CourseList } from '@/app/_configs/Schema';
import { eq } from 'drizzle-orm';

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { courseId, publish } = body;

    if (!courseId) {
      return NextResponse.json({ error: 'Course ID required' }, { status: 400 });
    }

    // Update course publish status
    await db
      .update(CourseList)
      .set({
        publish: publish,
        isPublished: publish
      })
      .where(eq(CourseList.courseId, courseId));

    return NextResponse.json({
      success: true,
      message: publish ? 'Course published successfully' : 'Course unpublished successfully'
    });
  } catch (error) {
    console.error('Error updating course publish status:', error);
    return NextResponse.json(
      { error: 'Failed to update course status' },
      { status: 500 }
    );
  }
}
