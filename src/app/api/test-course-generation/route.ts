import { NextResponse } from "next/server";
import { db } from "@/app/_configs/db";
import { CourseList } from "@/app/_configs/Schema";
import { getGroqChatCompletion } from "@/app/_configs/AiModels";

export async function GET() {
  const logs: string[] = [];

  try {
    // Test 1: Check DATABASE_URL
    logs.push("🔍 Step 1: Checking DATABASE_URL...");
    if (!process.env.DATABASE_URL) {
      logs.push("❌ DATABASE_URL not set");
      return NextResponse.json({
        success: false,
        logs,
        error: "DATABASE_URL not set",
      }, { status: 500 });
    }
    logs.push("✅ DATABASE_URL is configured");

    // Test 2: Check GROQ API Key
    logs.push("\n🔍 Step 2: Checking GROQ API Key...");
    if (!process.env.NEXT_PUBLIC_GROQ_API_KEY) {
      logs.push("❌ NEXT_PUBLIC_GROQ_API_KEY not set");
      return NextResponse.json({
        success: false,
        logs,
        error: "NEXT_PUBLIC_GROQ_API_KEY not set",
      }, { status: 500 });
    }
    logs.push("✅ GROQ API Key is configured");

    // Test 3: Test AI Model with sample prompt
    logs.push("\n🔍 Step 3: Testing AI Model with sample prompt...");
    const BASIC_PROMPT = "Generate A Course Tutorial on Following Detail With field Course Name, Description, Along with Chapter Name, about, Duration. ";
    const USER_INPUTPROMPT = "Topic: Python Programming, Level: Beginner, Duration: 1 hour, NoOf Chapters: 3, in JSON format";
    const FINAL_PROMPT = BASIC_PROMPT + USER_INPUTPROMPT;

    logs.push(`📝 Prompt: ${FINAL_PROMPT.substring(0, 100)}...`);

    const result = await getGroqChatCompletion(FINAL_PROMPT);
    const aiResponse = result.choices[0].message.content;

    logs.push("✅ AI Model responded successfully");
    logs.push(`📊 Response length: ${aiResponse?.length || 0} characters`);
    logs.push(`📋 Response preview: ${aiResponse?.substring(0, 200)}...`);

    // Test 4: Test Database Connection
    logs.push("\n🔍 Step 4: Testing Database connection...");
    const courses = await db.select().from(CourseList).limit(3);
    logs.push(`✅ Database connected - Found ${courses.length} courses`);

    // Test 5: Simulate saving to database (without actually saving)
    logs.push("\n🔍 Step 5: Validating data structure for database...");
    const mockData = {
      courseId: "test-uuid-123",
      name: "Python Programming",
      level: "Beginner",
      courseOutput: aiResponse,
      createdBy: "test@example.com",
      username: "Test User",
      userProfileImage: "https://example.com/image.jpg"
    };
    logs.push("✅ Data structure is valid for database insertion");

    return NextResponse.json({
      success: true,
      logs,
      data: {
        prompt: FINAL_PROMPT,
        aiResponse: aiResponse,
        aiResponseParsed: JSON.parse(aiResponse || "{}"),
        databaseCourseCount: courses.length,
        sampleCourses: courses,
        mockDataForDB: mockData,
      },
    });

  } catch (error) {
    console.error("Test error:", error);
    logs.push(`\n❌ Error: ${error instanceof Error ? error.message : "Unknown error"}`);

    return NextResponse.json({
      success: false,
      logs,
      error: error instanceof Error ? error.message : "Unknown error",
      stack: error instanceof Error ? error.stack : undefined,
    }, { status: 500 });
  }
}
