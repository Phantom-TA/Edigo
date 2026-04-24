import { NextRequest, NextResponse } from 'next/server';
import Groq from 'groq-sdk';
import { createRequire } from 'module';
export const config = {
  api: {
    bodyParser: false, // Disable the default body parser to handle large files
  },
};
export const maxDuration = 60; // Increase timeout to 60 seconds

let groq: Groq | null = null;

const getGroqClient = () => {
  if (!groq) {
    const apiKey = process.env.NEXT_PUBLIC_GROQ_API_KEY || process.env.GROQ_API_KEY;
    if (!apiKey) {
      throw new Error('GROQ_API_KEY environment variable is missing');
    }
    groq = new Groq({ apiKey });
  }
  return groq;
};

// In-memory storage for chat sessions
const chatSessions = new Map<string, Array<{ role: string; content: string }>>();
const pdfContents = new Map<string, string>();

export async function POST(req: NextRequest) {
  try {
    let formData;
    try {
      formData = await req.formData();
    } catch (e) {
      console.error("FormData Parsing Error:", e);
      return NextResponse.json({ error: 'Invalid form data. Please try again.' }, { status: 400 });
    }
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
        const require = createRequire(import.meta.url);
        const { PdfReader } = require('pdfreader');
        
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);

        // Parse PDF using a Promise wrapper for PdfReader
        const extractText = () => {
          return new Promise<string>((resolve, reject) => {
            let text = '';
            new PdfReader({}).parseBuffer(buffer, (err: any, item: any) => {
              if (err) reject(err);
              else if (!item) resolve(text);
              else if (item.text) text += item.text + ' ';
            });
          });
        };

        const pdfText = await extractText();

        if (!pdfText || !pdfText.trim()) {
           throw new Error("Could not extract any text from the PDF. It might be an image-only scan.");
        }

        // Store PDF content for this session
        pdfContents.set(sessionId, pdfText);
        
        chatSessions.set(sessionId, [
          {
            role: 'system',
            content: `You are a helpful AI assistant. You have access to the following PDF document content. Use this information to answer questions accurately and helpfully:\n\n${pdfText.substring(0, 50000)}` 
          }
        ]);

        return NextResponse.json({ 
          success: true, 
          message: 'PDF uploaded successfully'
        });
      } catch (error: any) {
        console.error('Final PDF Error:', error.message);
        return NextResponse.json({ 
          error: `PDF Error: ${error.message || 'Failed to read document'}` 
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
      const groqClient = getGroqClient();
      const chatCompletion = await groqClient.chat.completions.create({
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
