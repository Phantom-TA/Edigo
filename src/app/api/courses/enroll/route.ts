import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { enrollStudent, isStudentEnrolled } from '@/lib/courses/enrollStudent';

// POST - Enroll in a course
export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { courseId } = body;

    if (!courseId) {
      return NextResponse.json({ error: 'Course ID required' }, { status: 400 });
    }

    // Check if already enrolled
    const alreadyEnrolled = await isStudentEnrolled(userId, courseId);
    if (alreadyEnrolled) {
      return NextResponse.json(
        { error: 'Already enrolled in this course' },
        { status: 400 }
      );
    }

    // Enroll student
    const enrollment = await enrollStudent(userId, courseId);

    if (!enrollment) {
      return NextResponse.json(
        { error: 'Enrollment failed' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      enrollment,
    });
  } catch (error) {
    console.error('Error enrolling in course:', error);
    return NextResponse.json(
      { error: 'Failed to enroll in course' },
      { status: 500 }
    );
  }
}

// GET - Check enrollment status
export async function GET(req: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const courseId = searchParams.get('courseId');

    if (!courseId) {
      return NextResponse.json({ error: 'Course ID required' }, { status: 400 });
    }

    const enrolled = await isStudentEnrolled(userId, courseId);

    return NextResponse.json({ enrolled });
  } catch (error) {
    console.error('Error checking enrollment:', error);
    return NextResponse.json(
      { error: 'Failed to check enrollment' },
      { status: 500 }
    );
  }
}
