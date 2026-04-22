import { NextRequest, NextResponse } from 'next/server';
import { db, supabase } from '@/app/_configs/db';
import { StudentLearningPlans, Users } from '@/app/_configs/Schema';
import { eq, desc } from 'drizzle-orm';
import { currentUser } from '@clerk/nextjs/server';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const user = await currentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

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

    // 2. Fetch all learning plans for this student
    try {
      const plans = await db
        .select()
        .from(StudentLearningPlans)
        .where(eq(StudentLearningPlans.studentId, studentId))
        .orderBy(desc(StudentLearningPlans.createdAt));
      
      return NextResponse.json({ plans });
    } catch (drizzleError) {
      console.error('Drizzle fetch plans failed, falling back to Supabase:', drizzleError);
      const { data, error } = await supabase
        .from('studentLearningPlans')
        .select('*')
        .eq('studentId', studentId)
        .order('createdAt', { ascending: false });
      
      if (error) throw error;
      return NextResponse.json({ plans: data || [] });
    }
  } catch (error) {
    console.error('Error fetching learning plans:', error);
    return NextResponse.json(
      { error: 'Failed to fetch learning plans' },
      { status: 500 }
    );
  }
}
