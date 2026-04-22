"use server"

import { db, supabase } from "@/app/_configs/db";
import { CourseList } from "@/app/_configs/Schema";
import { eq } from "drizzle-orm";

export const getCourseById = async (courseId: string) => {
    try {
        // Attempt 1: Direct Postgres via Drizzle
        const result = await db.select().from(CourseList)
            .where(eq(CourseList.courseId, courseId));
        
        if (result.length > 0) return result;
        throw new Error('No result from drizzle');
    } catch (drizzleError: any) {
        console.error('Drizzle getCourseById failed, falling back to Supabase:', drizzleError.message);
        
        // Attempt 2: Fallback to Supabase HTTP Data API
        const { data, error } = await supabase
            .from('courseList')
            .select('*')
            .eq('courseId', courseId);
            
        if (error) {
            console.error('Supabase getCourseById also failed:', error.message);
            return [];
        }
        return data || [];
    }
}
