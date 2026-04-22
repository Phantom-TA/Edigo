import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
export const dynamic = 'force-dynamic';
import { enrollStudent, isStudentEnrolled } from '@/lib/courses/enrollStudent';
import { db, supabase } from '@/app/_configs/db';
import { Users } from '@/app/_configs/Schema';
import { eq } from 'drizzle-orm';

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

    // Role Check - Only students can enroll
    try {
      const user = await db
        .select({ role: Users.role })
        .from(Users)
        .where(eq(Users.clerkId, userId))
        .limit(1);
      
      const role = user.length > 0 ? user[0].role : null;
      
      if (role === 'TEACHER') {
        return NextResponse.json(
          { error: 'Teachers cannot enroll in courses. Use your student account or create courses instead.' },
          { status: 403 }
        );
      }
    } catch (err) {
      console.error('Role check fallback in enroll:', err);
      const { data } = await supabase.from('users').select('role').eq('clerkId', userId).maybeSingle();
      if (data && data.role === 'TEACHER') {
          return NextResponse.json(
              { error: 'Teachers cannot enroll in courses.' },
              { status: 403 }
          );
      }
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
