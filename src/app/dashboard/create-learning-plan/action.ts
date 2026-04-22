"use server";

import { db, supabase } from "@/app/_configs/db";
import { StudentLearningPlans, Users } from "@/app/_configs/Schema";
import { v4 as uuidv4 } from "uuid";
import { getGroqChatCompletionServer } from "@/app/_configs/AiModels";
import { eq } from "drizzle-orm";

export const GenerateLearningPlan = async ({
  formData,
  user,
}: {
  formData: {
    domain: string;
    duration: string;
    wantedTopics: string;
    additionalNeeds: string;
  };
  user: any;
}) => {
  try {
    let studentId = null;

    // 1. Get or Create User
    try {
      // Drizzle check
      const dbUser = await db
        .select()
        .from(Users)
        .where(eq(Users.clerkId, user.id))
        .limit(1);

      if (dbUser.length > 0) {
        studentId = dbUser[0].id;
      } else {
        const newUser = await db.insert(Users).values({
          clerkId: user.id,
          email: user.email,
          fullName: user.fullName || '',
          profileImage: user.imageUrl || '',
          role: 'STUDENT',
        }).returning();
        if (newUser.length > 0) studentId = newUser[0].id;
      }
    } catch (drizzleError) {
      console.error('Drizzle user check failed, falling back to Supabase:', drizzleError);
      
      const { data: dbUser, error: fetchError } = await supabase
        .from('users')
        .select('id')
        .eq('clerkId', user.id)
        .maybeSingle();

      if (dbUser && !fetchError) {
        studentId = dbUser.id;
      } else {
        // Create user via Supabase
        const { data: newUser, error: insertError } = await supabase
          .from('users')
          .insert({
            clerkId: user.id,
            email: user.email,
            fullName: user.fullName || '',
            profileImage: user.imageUrl || '',
            role: 'STUDENT',
          })
          .select('id')
          .single();
        if (newUser && !insertError) studentId = newUser.id;
      }
    }

    if (!studentId) {
      return { success: false, error: 'User not found or could not be created' };
    }

    // Calculate weeks based on duration (assuming 10 hours per week)
    const totalHours = parseInt(formData.duration);
    const estimatedWeeks = Math.ceil(totalHours / 10);

    // Create AI prompt for learning plan
    const prompt = `Create a personalized learning roadmap for a student with the following details:

Domain: ${formData.domain}
Total Duration: ${formData.duration} hours (approximately ${estimatedWeeks} weeks)
${formData.wantedTopics ? `Focus Topics: ${formData.wantedTopics}` : ''}
${formData.additionalNeeds ? `Additional Requirements: ${formData.additionalNeeds}` : ''}

Generate a comprehensive JSON learning plan with the following structure:
{
  "planTitle": "A catchy title for the learning plan",
  "description": "A brief description of what the student will learn (2-3 sentences)",
  "totalDuration": "${formData.duration} hours",
  "estimatedWeeks": ${estimatedWeeks},
  "weeks": [
    {
      "weekNumber": 1,
      "weekTitle": "Week title",
      "topics": [
        {
          "topicName": "Topic name",
          "description": "Brief description (2-3 sentences max)",
          "videoSearchQuery": "YouTube search query for this topic",
          "resources": ["Resource link 1", "Resource link 2"],
          "estimatedHours": "Number of hours for this topic"
        }
      ]
    }
  ],
  "learningGoals": ["Goal 1", "Goal 2", "Goal 3"],
  "prerequisites": ["Prerequisite 1", "Prerequisite 2"] or "None"
}

Rules:
- Break down the content into ${estimatedWeeks} weeks
- Each week should have 3-5 topics
- Focus on practical, hands-on learning
- Include beginner-friendly topics if no prerequisites are mentioned
- Make sure topics align with the wanted topics if specified
- Total hours should match the duration provided
- Make the videoSearchQuery specific and useful for finding relevant YouTube tutorials`;

    console.log('Generating learning plan with AI...');

    // Generate learning plan using AI
    const result = await getGroqChatCompletionServer(prompt);
    const content = result.choices[0].message.content;

    if (!content) {
      throw new Error('No content returned from AI');
    }

    console.log('AI response received, parsing...');

    const learningPlan = JSON.parse(content);

    console.log('Learning plan parsed successfully');

    // Prepare topics array for storage
    const topicsArray = formData.wantedTopics
      ? formData.wantedTopics.split(',').map(t => t.trim())
      : [];

    // 2. Save Plan to database
    let savedId = null;

    try {
      // Drizzle Insert
      const savedPlan = await db.insert(StudentLearningPlans).values({
        studentId: studentId,
        planTitle: learningPlan.planTitle || `${formData.domain} Learning Plan`,
        domain: formData.domain,
        duration: parseInt(formData.duration),
        topics: topicsArray,
        planOutput: learningPlan,
      }).returning({ id: StudentLearningPlans.id });
      if (savedPlan.length > 0) savedId = savedPlan[0].id;
    } catch (drizzleError) {
      console.error('Drizzle save plan failed, falling back to Supabase:', drizzleError);
      
      const { data, error } = await supabase
        .from('studentLearningPlans')
        .insert({
          studentId: studentId,
          planTitle: learningPlan.planTitle || `${formData.domain} Learning Plan`,
          domain: formData.domain,
          duration: parseInt(formData.duration),
          topics: topicsArray,
          planOutput: learningPlan,
        })
        .select('id')
        .single();
      
      if (data && !error) savedId = data.id;
    }

    if (!savedId) {
      return { success: false, error: 'Failed to save learning plan' };
    }

    console.log('Learning plan saved to database');

    return {
      success: true,
      planId: savedId,
      plan: learningPlan
    };
  } catch (error: unknown) {
    console.error('Learning plan generation error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to generate learning plan'
    };
  }
};
