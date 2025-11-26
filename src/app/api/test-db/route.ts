import { NextResponse } from "next/server";
import { db } from "@/app/_configs/db";
import { CourseList } from "@/app/_configs/Schema";
import { sql } from "drizzle-orm";

export async function GET() {
  try {
    // Check if DATABASE_URL is set
    if (!process.env.DATABASE_URL) {
      return NextResponse.json({
        success: false,
        message: "DATABASE_URL not set",
      }, { status: 500 });
    }

    // Test basic connection
    const testQuery = await db.execute(sql`SELECT 1 as test`);

    // Get count of courses
    const courses = await db.select().from(CourseList).limit(3);

    return NextResponse.json({
      success: true,
      message: "Database connection successful",
      data: {
        connectionTest: testQuery,
        coursesCount: courses.length,
        sampleCourses: courses,
      },
    });
  } catch (error) {
    console.error("Database test error:", error);
    return NextResponse.json({
      success: false,
      message: error instanceof Error ? error.message : "Unknown error",
      error: error,
    }, { status: 500 });
  }
}
