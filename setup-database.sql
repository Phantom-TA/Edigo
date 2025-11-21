-- Alcademy Database Setup Script
-- Run this in your Supabase SQL Editor

-- Create courseList table
CREATE TABLE IF NOT EXISTS "courseList" (
    "id" SERIAL PRIMARY KEY,
    "courseId" VARCHAR NOT NULL,
    "name" VARCHAR NOT NULL,
    "level" VARCHAR NOT NULL,
    "includeVideo" VARCHAR NOT NULL DEFAULT 'Yes',
    "courseOutput" JSONB NOT NULL,
    "createdBy" VARCHAR NOT NULL,
    "username" VARCHAR,
    "userProfileImage" VARCHAR,
    "courseBanner" VARCHAR,
    "publish" BOOLEAN DEFAULT false
);

-- Create chapters table
CREATE TABLE IF NOT EXISTS "chapters" (
    "id" SERIAL PRIMARY KEY,
    "courseId" VARCHAR NOT NULL,
    "chapterId" INTEGER NOT NULL,
    "content" JSONB NOT NULL,
    "videoId" VARCHAR NOT NULL
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_courseList_courseId ON "courseList"("courseId");
CREATE INDEX IF NOT EXISTS idx_courseList_createdBy ON "courseList"("createdBy");
CREATE INDEX IF NOT EXISTS idx_chapters_courseId ON "chapters"("courseId");

-- Verify tables were created
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
AND table_name IN ('courseList', 'chapters');
