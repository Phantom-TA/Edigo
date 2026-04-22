"use server";

import { db, supabase } from "../_configs/db";
import { Chapters, CourseList } from "../_configs/Schema";
import { v4 as uuidv4 } from "uuid";
import { and, eq } from 'drizzle-orm';

export const SaveCourseLayoutInDb = async ({
  userCourseInput,
  courseLayout,
  user,
}: {
  userCourseInput: any;
  courseLayout: string | null;
  user: any;
}) => {
  const courseId = uuidv4(); // Generate UUID
  try {
    try {
      // 1. Drizzle Insert
      await db.insert(CourseList).values({
        courseId: courseId,
        name: userCourseInput?.topic || 'Untitled Course',
        level: userCourseInput?.level || 'Beginner',
        courseOutput: courseLayout || null,
        createdBy: user?.primaryEmailAddress?.emailAddress || '',
        username: user?.fullName || null,
        userProfileImage: user?.imageUrl || null
      });
    } catch (drizzleError) {
      console.error('Drizzle save layout failed, falling back to Supabase:', drizzleError);
      
      // 2. Supabase Fallback
      const { error: supabaseError } = await supabase
        .from('courseList')
        .insert({
          courseId: courseId,
          name: userCourseInput?.topic || 'Untitled Course',
          level: userCourseInput?.level || 'Beginner',
          courseOutput: courseLayout,
          createdBy: user?.primaryEmailAddress?.emailAddress || '',
          username: user?.fullName || null,
          userProfileImage: user?.imageUrl || null
        });
      
      if (supabaseError) throw supabaseError;
    }

    return courseId;
  } catch (error: unknown) {
    console.error('Save course layout error:', error);
    return null;
  }
};

export const GetCourse = async (courseId: string, fullName: string) => {
  try {
    try {
      // 1. Drizzle Select
      const result = await db.select()
        .from(CourseList)
        .where(
          and(
            eq(CourseList.courseId, courseId),
            eq(CourseList.username, fullName)
          )
        );
      if (result.length > 0) return result;
    } catch (drizzleError) {
      console.error('Drizzle get course failed, falling back to Supabase:', drizzleError);
    }
    
    // 2. Supabase Fallback
    const { data, error } = await supabase
      .from('courseList')
      .select('*')
      .eq('courseId', courseId)
      .eq('username', fullName);
      
    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error in GetCourse:', error);
    return [];
  }
};

export const UpdateCourseImage = async ({
  courseId,
  imageUrl,
}: {
  courseId: string;
  imageUrl: string;
}) => {
  try {
    try {
      await db
        .update(CourseList)
        .set({ courseBanner: imageUrl })
        .where(eq(CourseList.courseId, courseId));
    } catch (drizzleError) {
      console.error('Drizzle update image failed, falling back to Supabase:', drizzleError);
      const { error } = await supabase
        .from('courseList')
        .update({ courseBanner: imageUrl })
        .eq('courseId', courseId);
      if (error) throw error;
    }
    return true;
  } catch (error) {
    console.error('Database update error:', error);
    return false;
  }
};

export const UpdateVideoId = async ({
  content,
  videoId,
  courseId,
  chapterId
}: {
  content: any,
  videoId: string,
  courseId: string,
  chapterId: any
}) => {
  try {
    try {
      await db.insert(Chapters).values({
        chapterId,
        courseId,
        content,
        videoId
      });
    } catch (drizzleError) {
      console.error('Drizzle update video failed, falling back to Supabase:', drizzleError);
      const { error } = await supabase
        .from('chapters')
        .insert({
          chapterId,
          courseId,
          content,
          videoId
        });
      if (error) throw error;
    }
    return true;
  } catch (error) {
    console.error("Error in inserting into Chapter Schema", error);
    return false;
  }
};

export const GetCourseContent = async (courseId: string) => {
  try {
    try {
      const content = await db
        .select()
        .from(Chapters)
        .where(eq(Chapters.courseId, courseId));
      if (content.length > 0) return content;
    } catch (drizzleError) {
      console.error('Drizzle get contents failed, falling back to Supabase:', drizzleError);
    }

    const { data, error } = await supabase
      .from('chapters')
      .select('*')
      .eq('courseId', courseId);
    
    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching course content:', error);
    return [];
  }
};

export const PublishCourse = async (courseId: string, publish: boolean) => {
  try {
    try {
      await db
        .update(CourseList)
        .set({
          publish: publish,
          isPublished: publish
        })
        .where(eq(CourseList.courseId, courseId));
    } catch (drizzleError) {
      console.error('Drizzle publish failed, falling back to Supabase:', drizzleError);
      const { error } = await supabase
        .from('courseList')
        .update({
          publish: publish,
          isPublished: publish
        })
        .eq('courseId', courseId);
      if (error) throw error;
    }
    return true;
  } catch (error) {
    console.error('Error publishing course:', error);
    return false;
  }
};
