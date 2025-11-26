import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/app/_configs/db';
import { CourseList } from '@/app/_configs/Schema';
import { inArray } from 'drizzle-orm';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const publishedOnly = searchParams.get('published') === 'true';
    const idsParam = searchParams.get('ids');

    // Filter by IDs if provided (for enrolled courses)
    if (idsParam) {
      const ids = idsParam.split(',');
      const courses = await db
        .select()
        .from(CourseList)
        .where(inArray(CourseList.courseId, ids));

      return NextResponse.json(courses);
    }

    // Filter by published status
    if (publishedOnly) {
      // Get all courses and filter by publish status (support both old and new fields)
      const allCourses = await db.select().from(CourseList);
      const publishedCourses = allCourses.filter(
        (course) => course.publish === true || course.isPublished === true
      );

      return NextResponse.json(publishedCourses);
    }

    // Return all courses
    const courses = await db.select().from(CourseList);
    return NextResponse.json(courses);
  } catch (error) {
    console.error('Error fetching courses:', error);
    return NextResponse.json(
      { error: 'Failed to fetch courses' },
      { status: 500 }
    );
  }
}
