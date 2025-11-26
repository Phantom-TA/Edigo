import * as dotenv from "dotenv";
// Load environment variables BEFORE any other imports
dotenv.config({ path: "./.env" });

import { db } from "./src/app/_configs/db";
import { CourseList } from "./src/app/_configs/Schema";
import { sql } from "drizzle-orm";

async function testDatabaseConnection() {
  console.log(" Testing Database Connection...\n");

  // Check if DATABASE_URL is set
  if (!process.env.DATABASE_URL) {
    console.error(" DATABASE_URL is not set in environment variables!");
    return;
  }

  console.log(" DATABASE_URL is set");
  console.log(" Database URL:", process.env.DATABASE_URL.substring(0, 30) + "...");

  try {
    // Test 1: Simple query to check connection
    console.log("\n Test 1: Testing basic connection...");
    const result = await db.execute(sql`SELECT 1 as test`);
    console.log("Basic connection successful:", result);

    // Test 2: Check if CourseList table exists
    console.log("\n Test 2: Checking CourseList table...");
    const courses = await db.select().from(CourseList).limit(5);
    console.log(` CourseList table exists with ${courses.length} courses (showing max 5)`);
    console.log("Sample data:", JSON.stringify(courses, null, 2));

    // Test 3: Check table structure
    console.log("\n Test 3: Checking table structure...");
    const tableInfo = await db.execute(sql`
      SELECT column_name, data_type
      FROM information_schema.columns
      WHERE table_name = 'courseList'
    `);
    console.log(" Table structure:", tableInfo);

    console.log("\n All database tests passed!");
    process.exit(0);

  } catch (error) {
    console.error("\n Database Error:", error);
    if (error instanceof Error) {
      console.error("Error message:", error.message);
      console.error("Error stack:", error.stack);
    }
    process.exit(1);
  }
}

testDatabaseConnection();
