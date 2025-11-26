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
        // Initialize chat session
        messages = [
          {
            role: 'system',
            content: 'You are a helpful AI assistant. Answer questions clearly, accurately, and in a friendly manner.'
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
        temperature: 0.7,
        max_tokens: 2048,
      });

      const assistantMessage = chatCompletion.choices[0]?.message?.content || 'No response';

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
    console.error('Chat API Error:', error);
    return NextResponse.json({ 
      error: error.message || 'Internal server error' 
    }, { status: 500 });
  }
}
