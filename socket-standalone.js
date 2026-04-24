const { createServer } = require('http');
const { Server } = require('socket.io');

const port = process.env.PORT || 3002;

// List of allowed origins for CORS
const allowedOrigins = [
  process.env.NEXT_PUBLIC_APP_URL, // Your Vercel domain
  'http://localhost:3000',          // Local development
  'http://localhost:3001'
].filter(Boolean);

const httpServer = createServer((req, res) => {
  res.writeHead(200);
  res.end('Edigo Socket.IO Standalone Server is running!');
});

const io = new Server(httpServer, {
  cors: {
    origin: allowedOrigins.length > 0 ? allowedOrigins : '*',
    methods: ['GET', 'POST'],
    credentials: true,
  },
});

io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);

  // Join course room
  socket.on('join-course', (courseId) => {
    socket.join(`course-${courseId}`);
    console.log(`Socket ${socket.id} joined course-${courseId}`);
    
    socket.to(`course-${courseId}`).emit('user-joined', {
      socketId: socket.id,
    });
  });

  // Leave course room
  socket.on('leave-course', (courseId) => {
    socket.leave(`course-${courseId}`);
    console.log(`Socket ${socket.id} left course-${courseId}`);
  });

  // Handle new messages
  socket.on('send-message', (data) => {
    console.log('Message relaying:', data.courseId);
    
    // Broadcast to all clients in the course room
    io.to(`course-${data.courseId}`).emit('new-message', {
      id: Date.now(),
      courseId: data.courseId,
      message: data.message,
      senderId: data.senderId,
      senderName: data.senderName,
      senderImage: data.senderImage,
      createdAt: new Date().toISOString(),
      isRead: false,
    });
  });

  // Handle typing indicator
  socket.on('typing', (data) => {
    socket.to(`course-${data.courseId}`).emit('user-typing', {
      userId: data.userId,
      userName: data.userName,
    });
  });

  socket.on('stop-typing', (data) => {
    socket.to(`course-${data.courseId}`).emit('user-stop-typing', {
      userId: data.userId,
    });
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

httpServer.listen(port, () => {
  console.log(`🚀 Standalone Socket.IO server ready on port ${port}`);
  console.log(`📡 Allowed Origins:`, allowedOrigins.length > 0 ? allowedOrigins : 'All');
});
