import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { db } from '@/app/_configs/db';
import { StudentExamScores, Users } from '@/app/_configs/Schema';
import { eq, and } from 'drizzle-orm';

// GET student scores for a course
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

    // Get user's database ID
    const user = await db
      .select({ id: Users.id })
      .from(Users)
      .where(eq(Users.clerkId, userId))
      .limit(1);

    if (user.length === 0) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const studentId = user[0].id;

    // Get scores for this student and course
    const scores = await db
      .select()
      .from(StudentExamScores)
      .where(
        and(
          eq(StudentExamScores.studentId, studentId),
          eq(StudentExamScores.courseId, courseId)
        )
      )
      .limit(1);

    if (scores.length === 0) {
      // Return empty scores if not found
      return NextResponse.json({
        quiz1Score: null,
        quiz2Score: null,
        midSemScore: null,
        endSemScore: null,
      });
    }

    return NextResponse.json(scores[0]);
  } catch (error) {
    console.error('Error fetching scores:', error);
    return NextResponse.json({ error: 'Failed to fetch scores' }, { status: 500 });
  }
}

// POST/PUT to update student scores
export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { courseId, quiz1Score, quiz2Score, midSemScore, endSemScore } = body;

    if (!courseId) {
      return NextResponse.json({ error: 'Course ID required' }, { status: 400 });
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

    const studentId = user[0].id;

    // Check if scores already exist
    const existingScores = await db
      .select()
      .from(StudentExamScores)
      .where(
        and(
          eq(StudentExamScores.studentId, studentId),
          eq(StudentExamScores.courseId, courseId)
        )
      )
      .limit(1);

    if (existingScores.length > 0) {
      // Update existing scores
      const updated = await db
        .update(StudentExamScores)
        .set({
          quiz1Score: quiz1Score !== undefined ? quiz1Score : existingScores[0].quiz1Score,
          quiz2Score: quiz2Score !== undefined ? quiz2Score : existingScores[0].quiz2Score,
          midSemScore: midSemScore !== undefined ? midSemScore : existingScores[0].midSemScore,
          endSemScore: endSemScore !== undefined ? endSemScore : existingScores[0].endSemScore,
          updatedAt: new Date(),
        })
        .where(eq(StudentExamScores.id, existingScores[0].id))
        .returning();

      return NextResponse.json(updated[0]);
    } else {
      // Create new scores record
      const created = await db
        .insert(StudentExamScores)
        .values({
          studentId,
          courseId,
          quiz1Score: quiz1Score || null,
          quiz2Score: quiz2Score || null,
          midSemScore: midSemScore || null,
          endSemScore: endSemScore || null,
        })
        .returning();

      return NextResponse.json(created[0]);
    }
  } catch (error) {
    console.error('Error updating scores:', error);
    return NextResponse.json({ error: 'Failed to update scores' }, { status: 500 });
  }
}
