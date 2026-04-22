import { eq, and, or } from "drizzle-orm";
import { db, supabase } from "../_configs/db";
import { CourseList, CourseEnrollments, Users } from "../_configs/Schema";

export const getUserCourse = async ({
    clerkId,
    role,
    email
}: {
    clerkId: string;
    role: 'TEACHER' | 'STUDENT';
    email?: string;
}) => {
    try {
        if (role === 'TEACHER') {
            // Teachers: Fetch courses they created
            // We check for both clerkId AND email to handle schema inconsistencies
            try {
                let query = supabase
                    .from('courseList')
                    .select('*');
                
                if (email) {
                    query = query.or(`createdBy.eq.${clerkId},createdBy.eq.${email}`);
                } else {
                    query = query.eq('createdBy', clerkId);
                }
                
                const { data, error } = await query;
                    
                if (error) throw error;
                return data || [];
            } catch (supabaseError) {
                console.error('Supabase teacher fetch failed:', supabaseError);
                if (email) {
                    return await db.select().from(CourseList).where(
                        or(
                            eq(CourseList.createdBy, clerkId),
                            eq(CourseList.createdBy, email)
                        )
                    );
                }
                return await db.select().from(CourseList).where(eq(CourseList.createdBy, clerkId));
            }
        } else {
            // Students: Fetch courses they are enrolled in
            let userId_db = null;
            
            // First get the internal DB user ID
            try {
                const userView = await db.select({ id: Users.id }).from(Users).where(eq(Users.clerkId, clerkId)).limit(1);
                if (userView.length > 0) userId_db = userView[0].id;
            } catch (err) {
                const { data } = await supabase.from('users').select('id').eq('clerkId', clerkId).maybeSingle();
                if (data) userId_db = data.id;
            }

            if (!userId_db) return [];

            try {
                // Fetch enrolled courses via Supabase
                const { data: enrollments, error } = await supabase
                    .from('courseEnrollments')
                    .select(`
                        courseId,
                        courseList:courseList (*)
                    `)
                    .eq('studentId', userId_db);
                
                if (error) {
                    console.error('Supabase join error details:', error);
                    throw error;
                }
                
                // Normalize the nested structure
                return enrollments.map((e: any) => e.courseList).filter(Boolean);
            } catch (supabaseError) {
                console.error('Supabase student enroll fetch failed:', supabaseError);
                return []; 
            }
        }
    } catch (error) {
        console.error("Error fetching user courses:", error);
        return [];
    }
}