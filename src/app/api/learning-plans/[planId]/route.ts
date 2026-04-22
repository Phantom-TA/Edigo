import { NextRequest, NextResponse } from 'next/server';
import { db, supabase } from '@/app/_configs/db';
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
    let studentId = null;

    // 1. Get user from database
    try {
      const dbUser = await db
        .select()
        .from(Users)
        .where(eq(Users.clerkId, user.id))
        .limit(1);

      if (dbUser.length > 0) {
        studentId = dbUser[0].id;
      }
    } catch (drizzleError) {
      console.error('Drizzle fetch user failed, falling back to Supabase:', drizzleError);
      const { data, error } = await supabase
        .from('users')
        .select('id')
        .eq('clerkId', user.id)
        .maybeSingle();
      
      if (data && !error) studentId = data.id;
    }

    if (!studentId) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // 2. Fetch learning plan
    try {
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

      if (plan.length > 0) {
        return NextResponse.json(plan[0]);
      }
    } catch (drizzleError) {
      console.error('Drizzle fetch plan failed, falling back to Supabase:', drizzleError);
      const { data, error } = await supabase
        .from('studentLearningPlans')
        .select('*')
        .eq('id', parseInt(planId))
        .eq('studentId', studentId)
        .maybeSingle();
      
      if (data && !error) {
        return NextResponse.json(data);
      }
    }

    return NextResponse.json({ error: 'Learning plan not found' }, { status: 404 });
  } catch (error) {
    console.error('Error fetching learning plan:', error);
    return NextResponse.json(
      { error: 'Failed to fetch learning plan' },
      { status: 500 }
    );
  }
}
