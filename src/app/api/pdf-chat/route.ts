import { NextRequest, NextResponse } from 'next/server';
import Groq from 'groq-sdk';

const groq = new Groq({
  apiKey: process.env.NEXT_PUBLIC_GROQ_API_KEY || process.env.GROQ_API_KEY,
});

// In-memory storage for chat sessions
const chatSessions = new Map<string, Array<{ role: string; content: string }>>();
const pdfContents = new Map<string, string>();

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const action = formData.get('action') as string;
    const sessionId = formData.get('sessionId') as string;

    if (!sessionId) {
      return NextResponse.json({ error: 'Session ID is required' }, { status: 400 });
    }

    // Handle PDF upload
    if (action === 'upload') {
      const file = formData.get('pdf') as File;
      
      if (!file) {
        return NextResponse.json({ error: 'No PDF file provided' }, { status: 400 });
      }

      try {
        // Dynamically import pdfjs-dist
        const pdfjsLib = await import('pdfjs-dist');
        
        // Convert file to buffer
        const bytes = await file.arrayBuffer();
        const uint8Array = new Uint8Array(bytes);

        // Load PDF document
        const loadingTask = pdfjsLib.getDocument({ data: uint8Array });
        const pdfDocument = await loadingTask.promise;
        
        let pdfText = '';
        const numPages = pdfDocument.numPages;

        // Extract text from all pages
        for (let pageNum = 1; pageNum <= numPages; pageNum++) {
          const page = await pdfDocument.getPage(pageNum);
          const textContent = await page.getTextContent();
          const pageText = textContent.items
            .map((item: any) => item.str)
            .join(' ');
          pdfText += pageText + '\n';
        }

        // Store PDF content for this session
        pdfContents.set(sessionId, pdfText);
        
        // Initialize chat session with system message
        chatSessions.set(sessionId, [
          {
            role: 'system',
            content: `You are a helpful AI assistant. You have access to the following PDF document content. Use this information to answer questions accurately and helpfully:\n\n${pdfText.substring(0, 50000)}` // Limit to avoid token limits
          }
        ]);

        return NextResponse.json({ 
          success: true, 
          message: 'PDF uploaded successfully',
          pages: numPages 
        });
      } catch (error: any) {
        console.error('PDF parsing error:', error);
        return NextResponse.json({ 
          error: 'Failed to parse PDF. Please ensure the file is a valid PDF document.' 
        }, { status: 400 });
      }
    }

    // Handle chat message (works with or without PDF)
    if (action === 'chat') {
      const message = formData.get('message') as string;

      if (!message) {
        return NextResponse.json({ error: 'Message is required' }, { status: 400 });
      }

      // Get or initialize chat session
      let messages = chatSessions.get(sessionId);
      
      if (!messages) {
        // Initialize without PDF context for normal chat
        messages = [
          {
            role: 'system',
            content: 'You are a helpful AI assistant. Answer questions clearly and accurately.'
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
        model: 'llama-3.3-70b-versatile', // Using latest Groq model
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
        messageCount: messages.length - 1 // Exclude system message
      });
    }

    // Handle clear session
    if (action === 'clear') {
      chatSessions.delete(sessionId);
      pdfContents.delete(sessionId);

      return NextResponse.json({ 
        success: true, 
        message: 'Session cleared' 
      });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });

  } catch (error: any) {
    console.error('PDF Chat API Error:', error);
    return NextResponse.json({ 
      error: error.message || 'Internal server error' 
    }, { status: 500 });
  }
}
