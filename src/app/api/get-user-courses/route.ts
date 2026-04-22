import { NextRequest, NextResponse } from 'next/server';
import { getUserCourse } from '@/app/dashboard/action';
import { auth } from '@clerk/nextjs/server';
import { db, supabase } from '@/app/_configs/db';
import { Users } from '@/app/_configs/Schema';
import { eq } from 'drizzle-orm';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
    try {
        const { userId } = await auth();
        
        if (!userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // 1. Get user's role and email from database
        let userRole = 'STUDENT';
        let userEmail = undefined;
        
        try {
            const userView = await db
                .select({ role: Users.role, email: Users.email })
                .from(Users)
                .where(eq(Users.clerkId, userId))
                .limit(1);
            
            if (userView.length > 0) {
                userRole = userView[0].role;
                userEmail = userView[0].email;
            }
        } catch (err) {
            console.error('Drizzle user fetch error in get-user-courses:', err);
            const { data } = await supabase
                .from('users')
                .select('role, email')
                .eq('clerkId', userId)
                .maybeSingle();
            if (data) {
                userRole = data.role;
                userEmail = data.email;
            }
        }

        const courses = await getUserCourse({ 
            clerkId: userId, 
            role: userRole as 'TEACHER' | 'STUDENT',
            email: userEmail
        });
        
        return NextResponse.json(courses);
    } catch (error) {
        console.error('Error in get-user-courses:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}