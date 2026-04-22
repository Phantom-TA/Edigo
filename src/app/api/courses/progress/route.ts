import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
export const dynamic = 'force-dynamic';
import { db, supabase } from '@/app/_configs/db';
import { CourseEnrollments, Users } from '@/app/_configs/Schema';
import { eq, and } from 'drizzle-orm';

// GET progress for a course
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

    // Get enrollment with progress
    let enrollment: any = null;

    try {
      // 1. Drizzle check
      // Get user's database ID
      const user = await db
        .select({ id: Users.id })
        .from(Users)
        .where(eq(Users.clerkId, userId))
        .limit(1);

      if (user.length > 0) {
        const result = await db
          .select()
          .from(CourseEnrollments)
          .where(
            and(
              eq(CourseEnrollments.courseId, courseId),
              eq(CourseEnrollments.studentId, user[0].id)
            )
          )
          .limit(1);
        if (result.length > 0) enrollment = result[0];
      }
    } catch (drizzleError) {
      console.error('Drizzle progress fetch failed, falling back to Supabase:', drizzleError);
      
      // 2. Supabase fallback
      const { data: user, error: userError } = await supabase
        .from('users')
        .select('id')
        .eq('clerkId', userId)
        .maybeSingle();

      if (user && !userError) {
        const { data: result, error: fetchError } = await supabase
          .from('courseEnrollments')
          .select('*')
          .eq('courseId', courseId)
          .eq('studentId', user.id)
          .maybeSingle();
        
        if (result && !fetchError) enrollment = result;
      }
    }

    if (!enrollment) {
      return NextResponse.json({ progress: {} });
    }

    return NextResponse.json({ progress: enrollment.progress || {} });
  } catch (error) {
    console.error('Fatal error fetching progress:', error);
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

    const { courseId, weekNumber, topicIndex, completed } = await req.json();

    if (!courseId || weekNumber === undefined || topicIndex === undefined || completed === undefined) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const progressKey = `week_${weekNumber}_topic_${topicIndex}`;
    let success = false;
    let finalProgress = {};

    try {
      // 1. Drizzle Update
      const user = await db
        .select({ id: Users.id })
        .from(Users)
        .where(eq(Users.clerkId, userId))
        .limit(1);

      if (user.length > 0) {
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

        const currentProgress = enrollment.length > 0 ? (enrollment[0].progress as any) || {} : {};
        currentProgress[progressKey] = completed;
        finalProgress = currentProgress;

        if (enrollment.length === 0) {
          await db.insert(CourseEnrollments).values({
            courseId,
            studentId: user[0].id,
            progress: currentProgress,
          });
        } else {
          await db
            .update(CourseEnrollments)
            .set({ progress: currentProgress })
            .where(eq(CourseEnrollments.id, enrollment[0].id));
        }
        success = true;
      }
    } catch (drizzleError) {
      console.error('Drizzle progress update failed, falling back to Supabase:', drizzleError);
      
      // 2. Supabase fallback
      const { data: user, error: userError } = await supabase
        .from('users')
        .select('id')
        .eq('clerkId', userId)
        .maybeSingle();

      if (user && !userError) {
        const { data: enrollment, error: fetchError } = await supabase
          .from('courseEnrollments')
          .select('*')
          .eq('courseId', courseId)
          .eq('studentId', user.id)
          .maybeSingle();
        
        const currentProgress = enrollment ? (enrollment.progress as any) || {} : {};
        currentProgress[progressKey] = completed;
        finalProgress = currentProgress;

        if (!enrollment) {
          const { error: insertError } = await supabase.from('courseEnrollments').insert({
            courseId,
            studentId: user.id,
            progress: currentProgress,
          });
          if (!insertError) success = true;
        } else {
          const { error: updateError } = await supabase.from('courseEnrollments')
            .update({ progress: currentProgress })
            .eq('id', enrollment.id);
          if (!updateError) success = true;
        }
      }
    }

    return NextResponse.json({ success, progress: finalProgress });
  } catch (error) {
    console.error('Fatal error updating progress:', error);
    return NextResponse.json(
      { error: 'Failed to update progress' },
      { status: 500 }
    );
  }
}
