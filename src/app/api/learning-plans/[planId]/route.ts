import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/app/_configs/db';
import { StudentLearningPlans, Users } from '@/app/_configs/Schema';
import { eq, and } from 'drizzle-orm';
import { currentUser } from '@clerk/nextjs/server';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ planId: string }> }
) {
  try {
    const user = await currentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { planId } = await params;

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

    // Fetch learning plan
    const plan = await db
      .select()
      .from(StudentLearningPlans)
      .where(
        and(
          eq(StudentLearningPlans.id, parseInt(planId)),
          eq(StudentLearningPlans.studentId, studentId)
        )
      )
      .limit(1);

    if (!plan || plan.length === 0) {
      return NextResponse.json({ error: 'Learning plan not found' }, { status: 404 });
    }

    return NextResponse.json(plan[0]);
  } catch (error) {
    console.error('Error fetching learning plan:', error);
    return NextResponse.json(
      { error: 'Failed to fetch learning plan' },
      { status: 500 }
    );
  }
}
