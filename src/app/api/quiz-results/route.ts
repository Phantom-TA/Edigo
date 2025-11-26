import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/app/_configs/db';
import { QuizResults, Users } from '@/app/_configs/Schema';
import { eq, and, desc } from 'drizzle-orm';
import { currentUser } from '@clerk/nextjs/server';

// GET - Retrieve quiz results for a student in a course
export async function GET(request: NextRequest) {
  try {
    const user = await currentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const courseId = searchParams.get('courseId');

    if (!courseId) {
      return NextResponse.json({ error: 'Course ID is required' }, { status: 400 });
    }

    // Get user from database
    const dbUser = await db
      .select()
      .from(Users)
      .where(eq(Users.clerkId, user.id))
      .limit(1);

    if (!dbUser || dbUser.length === 0) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const studentId = dbUser[0].id;

    // Fetch quiz results
    const results = await db
      .select()
      .from(QuizResults)
      .where(
        and(
          eq(QuizResults.studentId, studentId),
          eq(QuizResults.courseId, courseId)
        )
      )
      .orderBy(desc(QuizResults.completedAt));

    return NextResponse.json({ results });
  } catch (error) {
    console.error('Error fetching quiz results:', error);
    return NextResponse.json(
      { error: 'Failed to fetch quiz results' },
      { status: 500 }
    );
  }
}

// POST - Save a new quiz result
export async function POST(request: NextRequest) {
  try {
    const user = await currentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { courseId, topicName, weekNumber, score, totalQuestions, quizData } = body;

    if (!courseId || !topicName || score === undefined || !totalQuestions) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Get user from database
    const dbUser = await db
      .select()
      .from(Users)
      .where(eq(Users.clerkId, user.id))
      .limit(1);

    if (!dbUser || dbUser.length === 0) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const studentId = dbUser[0].id;
    const percentage = Math.round((score / totalQuestions) * 100);

    // Insert quiz result
    const result = await db.insert(QuizResults).values({
      studentId,
      courseId,
      topicName,
      weekNumber: weekNumber || null,
      score,
      totalQuestions,
      percentage,
      quizData: quizData || null,
    }).returning();

    return NextResponse.json({ success: true, result: result[0] });
  } catch (error) {
    console.error('Error saving quiz result:', error);
    return NextResponse.json(
      { error: 'Failed to save quiz result' },
      { status: 500 }
    );
  }
}
