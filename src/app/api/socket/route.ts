import { NextRequest, NextResponse } from 'next/server';
import { Server as SocketIOServer } from 'socket.io';
import { createServer } from 'http';

// Global variable to store the Socket.IO server instance
let io: SocketIOServer | null = null;

export async function GET(req: NextRequest) {
  if (!io) {
    try {
      // Create HTTP server
      const httpServer = createServer();

      // Initialize Socket.IO
      io = new SocketIOServer(httpServer, {
        path: '/api/socket',
        addTrailingSlash: false,
        cors: {
          origin: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
          methods: ['GET', 'POST'],
          credentials: true,
        },
      });

      // Socket.IO event handlers
      io.on('connection', (socket) => {
        console.log('Client connected:', socket.id);

        // Join a course room
        socket.on('join-course', (courseId: string) => {
          socket.join(`course-${courseId}`);
          console.log(`Socket ${socket.id} joined course-${courseId}`);
        });

        // Leave a course room
        socket.on('leave-course', (courseId: string) => {
          socket.leave(`course-${courseId}`);
          console.log(`Socket ${socket.id} left course-${courseId}`);
        });

        // Handle new messages
        socket.on('send-message', async (data: {
          courseId: string;
          message: string;
          senderId: number;
          senderName: string;
          senderImage: string | null;
        }) => {
          console.log('Message received:', data);

          // Broadcast to all clients in the course room
          io?.to(`course-${data.courseId}`).emit('new-message', {
            id: Date.now(), // Temporary ID
            courseId: data.courseId,
            message: data.message,
            senderId: data.senderId,
            senderName: data.senderName,
            senderImage: data.senderImage,
            createdAt: new Date().toISOString(),
            isRead: false,
          });
        });

        // Handle disconnect
        socket.on('disconnect', () => {
          console.log('Client disconnected:', socket.id);
        });
      });

      // Start listening on port
      const port = parseInt(process.env.SOCKET_PORT || '3001');
      httpServer.listen(port, () => {
        console.log(`Socket.IO server running on port ${port}`);
      });

      return NextResponse.json({
        success: true,
        message: 'Socket.IO server initialized',
        port
      });
    } catch (error) {
      console.error('Error initializing Socket.IO:', error);
      return NextResponse.json(
        { error: 'Failed to initialize Socket.IO' },
        { status: 500 }
      );
    }
  }

  return NextResponse.json({
    success: true,
    message: 'Socket.IO server already running'
  });
}

export { io };
