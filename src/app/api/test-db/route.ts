import { NextResponse } from "next/server";
import { db, supabase } from "@/app/_configs/db";
import { CourseList } from "@/app/_configs/Schema";
import { sql } from "drizzle-orm";

export async function GET() {
  try {
    const results: any = {
      drizzle: { success: false },
      supabase: { success: false }
    };

    // 1. Test Drizzle (Postgres Connection)
    try {
      if (process.env.DATABASE_URL) {
        const testQuery = await db.execute(sql`SELECT 1 as test`);
        const courses = await db.select().from(CourseList).limit(1);
        results.drizzle = {
          success: true,
          message: "Database connection successful",
          data: { testQuery, coursesCount: courses.length }
        };
      } else {
        results.drizzle = { success: false, message: "DATABASE_URL not set" };
      }
    } catch (err: any) {
      results.drizzle = { success: false, message: err.message };
    }

    // 2. Test Supabase HTTP (API Connection)
    try {
      const { data, error } = await supabase.from('courseList').select('id').limit(1);
      if (error) throw error;
      results.supabase = {
        success: true,
        message: "Supabase HTTP connection successful",
        data: { coursesCount: data.length }
      };
    } catch (err: any) {
      results.supabase = { success: false, message: err.message };
    }

    return NextResponse.json({
      success: results.supabase.success || results.drizzle.success,
      results
    });
  } catch (error: any) {
    console.error("Database test error:", error);
    return NextResponse.json({
      success: false,
      message: error.message || "Unknown error",
      error: error,
    }, { status: 500 });
  }
}
