const { createServer } = require('http');
const { parse } = require('url');
const next = require('next');
const { Server } = require('socket.io');

const dev = process.env.NODE_ENV !== 'production';
const hostname = 'localhost';
const port = parseInt(process.env.PORT, 10) || 3000;

const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  const server = createServer(async (req, res) => {
    try {
      const parsedUrl = parse(req.url, true);
      await handle(req, res, parsedUrl);
    } catch (err) {
      console.error('Error occurred handling', req.url, err);
      res.statusCode = 500;
      res.end('internal server error');
    }
  });

  // Initialize Socket.IO
  const io = new Server(server, {
    cors: {
      origin: process.env.NEXT_PUBLIC_APP_URL || `http://localhost:${port}`,
      methods: ['GET', 'POST'],
      credentials: true,
    },
  });

  // Socket.IO connection handling
  io.on('connection', (socket) => {
    console.log(' Client connected:', socket.id);

    // Join course room
    socket.on('join-course', (courseId) => {
      socket.join(`course-${courseId}`);
      console.log(` Socket ${socket.id} joined course-${courseId}`);

      // Notify others in the room
      socket.to(`course-${courseId}`).emit('user-joined', {
        socketId: socket.id,
      });
    });

    // Leave course room
    socket.on('leave-course', (courseId) => {
      socket.leave(`course-${courseId}`);
      console.log(` Socket ${socket.id} left course-${courseId}`);
    });

    // Handle new messages
    socket.on('send-message', (data) => {
      console.log('Message received:', data);

      // Broadcast to all clients in the course room (including sender)
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

    // Handle disconnect
    socket.on('disconnect', () => {
      console.log(' Client disconnected:', socket.id);
    });
  });

  server.listen(port, (err) => {
    if (err) throw err;
    console.log(` Server ready on http://${hostname}:${port}`);
    console.log(` Socket.IO server ready`);
  });
});
