import { NextRequest, NextResponse } from 'next/server';
import { db, supabase } from '@/app/_configs/db';
import { CourseList } from '@/app/_configs/Schema';
import { inArray } from 'drizzle-orm';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const publishedOnly = searchParams.get('published') === 'true';
    const idsParam = searchParams.get('ids');

    let courses: any[] = [];

    // Attempt 1: Try Supabase HTTP Data API (Port 443 - very fast and rarely blocked)
    try {
      if (idsParam) {
        const ids = idsParam.split(',');
        const { data, error } = await supabase
          .from('courseList')
          .select('*')
          .in('courseId', ids);
        if (error) throw error;
        courses = data || [];
      } else if (publishedOnly) {
        const { data, error } = await supabase
          .from('courseList')
          .select('*');
        if (error) throw error;
        courses = (data || []).filter(
          (course: any) =>
            course.publish === true ||
            course.isPublished === true ||
            course.publish === 'true' ||
            course.isPublished === 'true'
        );
      } else {
        const { data, error } = await supabase
          .from('courseList')
          .select('*');
        if (error) throw error;
        courses = data || [];
      }
    } catch (supabaseError: any) {
      console.error('Supabase fetch failed, falling back to Drizzle:', supabaseError.message);
      
      // Attempt 2: Fallback to Drizzle (Direct Postgres)
      if (idsParam) {
        const ids = idsParam.split(',');
        courses = await db
          .select()
          .from(CourseList)
          .where(inArray(CourseList.courseId, ids));
      } else if (publishedOnly) {
        const allCourses = await db.select().from(CourseList);
        courses = allCourses.filter(
          (course: any) =>
            course.publish === true ||
            course.isPublished === true ||
            course.publish === 'true' ||
            course.isPublished === 'true'
        );
      } else {
        courses = await db.select().from(CourseList);
      }
    }

    return NextResponse.json(courses);
  } catch (error: any) {
    console.error('Fatal course fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch courses', details: error.message },
      { status: 500 }
    );
  }
}
