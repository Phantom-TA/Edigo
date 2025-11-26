import { NextRequest, NextResponse } from 'next/server';
import Groq from 'groq-sdk';

const groq = new Groq({
  apiKey: process.env.NEXT_PUBLIC_GROQ_API_KEY || process.env.GROQ_API_KEY,
});

// In-memory storage for chat sessions
const chatSessions = new Map<string, Array<{ role: string; content: string }>>();

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const action = formData.get('action') as string;
    const sessionId = formData.get('sessionId') as string;

    if (!sessionId) {
      return NextResponse.json({ error: 'Session ID is required' }, { status: 400 });
    }

    // Handle chat message
    if (action === 'chat') {
      const message = formData.get('message') as string;

      if (!message) {
        return NextResponse.json({ error: 'Message is required' }, { status: 400 });
      }

      // Get or initialize chat session
      let messages = chatSessions.get(sessionId);
      
      if (!messages) {
        // Initialize wellness chat session with supportive system prompt
        messages = [
          {
            role: 'system',
            content: `You are a caring, supportive, and friendly mental wellness companion for children and students. Your role is to:

- Listen with empathy and understanding
- Provide emotional support and encouragement
- Help them feel heard, valued, and understood
- Offer gentle, age-appropriate guidance
- Celebrate their feelings and validate their experiences
- Encourage positive thinking and self-care
- Be warm, kind, and non-judgmental
- Use simple, friendly language
- Share uplifting and supportive messages

Important guidelines:
- DO NOT provide medical advice or diagnose any conditions
- DO NOT replace professional mental health services
- If someone mentions serious issues (self-harm, abuse, severe depression), gently encourage them to talk to a trusted adult, parent, teacher, or counselor
- Focus on listening, validating feelings, and providing comfort
- Keep responses warm, positive, and supportive
- Use emojis occasionally to be friendly (but not excessively)

Your goal is to make them feel better, supported, and remind them they're not alone.`
          }
        ];
        chatSessions.set(sessionId, messages);
      }

      // Add user message to chat history
      messages.push({
        role: 'user',
        content: message
      });

      // Call Groq API with conversation history
      const chatCompletion = await groq.chat.completions.create({
        messages: messages as any,
        model: 'llama-3.3-70b-versatile',
        temperature: 0.8, // Slightly higher for more empathetic, varied responses
        max_tokens: 2048,
      });

      const assistantMessage = chatCompletion.choices[0]?.message?.content || 'I\'m here for you. Please tell me more.';

      // Add assistant response to chat history
      messages.push({
        role: 'assistant',
        content: assistantMessage
      });

      // Update session
      chatSessions.set(sessionId, messages);

      return NextResponse.json({ 
        success: true, 
        response: assistantMessage,
        messageCount: messages.length - 1
      });
    }

    // Handle clear session
    if (action === 'clear') {
      chatSessions.delete(sessionId);

      return NextResponse.json({ 
        success: true, 
        message: 'Session cleared' 
      });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });

  } catch (error: any) {
    console.error('Wellness Chat API Error:', error);
    return NextResponse.json({ 
      error: 'I\'m having trouble connecting right now. Please try again.' 
    }, { status: 500 });
  }
}
