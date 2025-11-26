"use server";

import { db } from "../_configs/db";
import { CourseList } from "../_configs/Schema";
import { v4 as uuidv4 } from "uuid";
import { getGroqChatCompletionServer } from "../_configs/AiModels";

export const GenerateAndSaveCourse = async ({
  formData,
  user,
}: {
  formData: {
    title: string;
    duration: string;
    importantTopics: string;
    markingScheme: string;
  };
  user: any;
}) => {
  const courseId = uuidv4();

  // Create AI prompt based on form data
  const prompt = `Generate a comprehensive course roadmap based on the following details:

  Course Title: ${formData.title}
  Duration: ${formData.duration}
  Important Topics: ${formData.importantTopics}
  Marking Scheme: ${formData.markingScheme}

  Generate a JSON response with the following structure:
  {
    "courseName": "Course title",
    "description": "Brief course description",
    "duration": "Total duration",
    "weeks": [
      {
        "weekNumber": 1,
        "weekTitle": "Week title",
        "topics": [
          {
            "topicName": "Topic name",
            "description": "Brief description (2-3 sentences max)",
            "videoSearchQuery": "YouTube search query for this topic",
            "testQuizPrompt": "A test question about this topic"
          }
        ]
      }
    ]
  }

  Make sure to divide the content into weekly modules based on the duration provided.`;

  try {
    // Generate course layout using AI
    const result = await getGroqChatCompletionServer(prompt);
    const courseLayout = result.choices[0].message.content;

    // Save to database
    await db.insert(CourseList).values({
      courseId: courseId,
      name: formData.title,
      level: "Beginner", // Default level for simple course
      courseOutput: courseLayout,
      createdBy: user?.email || '',
      username: user?.fullName || null,
      userProfileImage: user?.imageUrl || null
    });

    return { success: true, courseId };
  } catch (error: unknown) {
    console.error('Course generation error:', error);
    return { success: false, error: 'Failed to generate course' };
  }
};
