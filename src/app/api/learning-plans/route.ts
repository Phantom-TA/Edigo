import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/app/_configs/db';
import { StudentLearningPlans, Users } from '@/app/_configs/Schema';
import { eq, desc } from 'drizzle-orm';
import { currentUser } from '@clerk/nextjs/server';

export async function GET(request: NextRequest) {
  try {
    const user = await currentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
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

    // Fetch all learning plans for this student
    const plans = await db
      .select()
      .from(StudentLearningPlans)
      .where(eq(StudentLearningPlans.studentId, studentId))
      .orderBy(desc(StudentLearningPlans.createdAt));

    return NextResponse.json({ plans });
  } catch (error) {
    console.error('Error fetching learning plans:', error);
    return NextResponse.json(
      { error: 'Failed to fetch learning plans' },
      { status: 500 }
    );
  }
}
