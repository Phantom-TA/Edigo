import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { getEnrolledCourses } from '@/lib/courses/enrollStudent';

export async function GET(req: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const enrollments = await getEnrolledCourses(userId);

    return NextResponse.json({ enrollments }, { status: 200 });
  } catch (error) {
    console.error('Error fetching enrolled courses:', error);
    return NextResponse.json(
      { error: 'Failed to fetch enrolled courses' },
      { status: 500 }
    );
  }
}
