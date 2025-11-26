import { NextRequest, NextResponse } from 'next/server';
import { getGroqChatCompletionServer } from '@/app/_configs/AiModels';

export async function POST(request: NextRequest) {
  try {
    const { topicName, description } = await request.json();

    if (!topicName) {
      return NextResponse.json(
        { error: 'Topic name is required' },
        { status: 400 }
      );
    }

    const prompt = `Generate a quiz with exactly 5 multiple choice questions about the topic: "${topicName}".
${description ? `Topic description: ${description}` : ''}

Return the response in the following JSON format:
{
  "questions": [
    {
      "question": "The question text",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correctAnswer": 0
    }
  ]
}

Rules:
- Each question must have exactly 4 options
- The correctAnswer should be the index (0-3) of the correct option
- Make questions relevant to the topic and educational
- Vary the difficulty from basic to intermediate
- Ensure questions test understanding, not just memorization`;

    console.log('Generating quiz for topic:', topicName);

    const result = await getGroqChatCompletionServer(prompt);
    const content = result.choices[0].message.content;

    console.log('Raw AI response:', content);

    if (!content) {
      throw new Error('No content returned from AI');
    }

    const quizData = JSON.parse(content);
    console.log('Parsed quiz data:', JSON.stringify(quizData, null, 2));

    // Validate the structure
    if (!quizData.questions || !Array.isArray(quizData.questions) || quizData.questions.length === 0) {
      console.error('Invalid quiz data structure:', quizData);
      throw new Error('Invalid quiz data structure received from AI');
    }

    // Validate each question has the required fields
    for (const q of quizData.questions) {
      if (!q.question || !q.options || !Array.isArray(q.options) || q.correctAnswer === undefined) {
        console.error('Invalid question format:', q);
        throw new Error('Invalid question format in quiz data');
      }
    }

    console.log('Successfully validated quiz with', quizData.questions.length, 'questions');
    console.log('Returning quiz data to client:', JSON.stringify(quizData, null, 2));

    return NextResponse.json(quizData);
  } catch (error) {
    console.error('Error generating quiz:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to generate quiz';
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}
