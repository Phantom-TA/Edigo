# Socket.IO Real-Time Chat Setup Guide

## Overview
This application now uses Socket.IO for real-time chat functionality between teachers and students in courses.

---

## Required Environment Variables

Add these to your `.env.local` file:

```bash
# Socket.IO Configuration
NEXT_PUBLIC_SOCKET_URL=http://localhost:3000
PORT=3000
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### Variable Descriptions:

1. **`NEXT_PUBLIC_SOCKET_URL`** (Required)
   - The URL where Socket.IO client connects
   - Development: `http://localhost:3000`
   - Production: Your production domain (e.g., `https://yourdomain.com`)

2. **`PORT`** (Optional, defaults to 3000)
   - Port number for the Next.js + Socket.IO server
   - Both Next.js and Socket.IO run on the same port

3. **`NEXT_PUBLIC_APP_URL`** (Optional)
   - Used for CORS configuration
   - Should match your application URL

---

## How to Run

### Development Mode

```bash
npm run dev
```

This will start the custom server with Socket.IO on port 3000.

### Production Mode

```bash
npm run build
npm start
```

---

## Architecture

### Server Setup (`server.js`)
- Custom Next.js server with Socket.IO integration
- Handles both HTTP requests (Next.js) and WebSocket connections (Socket.IO)
- Runs on the same port (default: 3000)

### Socket Events

#### Client → Server:
- `join-course` - Join a course chat room
- `leave-course` - Leave a course chat room
- `send-message` - Send a new message
- `typing` - User is typing (optional)
- `stop-typing` - User stopped typing (optional)

#### Server → Client:
- `new-message` - Broadcast new message to all users in course
- `user-joined` - Notify when user joins room
- `user-typing` - Show typing indicator
- `user-stop-typing` - Hide typing indicator

---

## Chat Flow

1. **User opens course page** → Socket.IO connection initiated
2. **User joins course** → Emits `join-course` event
3. **User sends message**:
   - Message saved to database via `/api/chat/send-message`
   - Message broadcast via Socket.IO to all users in course room
4. **Other users receive** → `new-message` event updates UI in real-time
5. **User leaves** → Emits `leave-course` event

---

## Files Modified/Created

### Created:
- `server.js` - Custom Socket.IO + Next.js server
- `src/lib/socket.ts` - Socket types (optional)
- `src/app/api/socket/route.ts` - Socket.IO API route (alternative approach)
- `.env.socket.example` - Environment variables example
- `SOCKETIO_SETUP.md` - This documentation

### Modified:
- `package.json` - Updated scripts to use custom server
- `src/app/course/[courseid]/_components/ChatPanel.tsx` - Socket.IO client implementation

---

## Troubleshooting

### Chat not connecting?

1. **Check Socket.IO server is running**:
   ```bash
   # You should see this in console:
   🚀 Server ready on http://localhost:3000
   🔌 Socket.IO server ready
   ```

2. **Check environment variables**:
   ```bash
   # In browser console, check:
   console.log(process.env.NEXT_PUBLIC_SOCKET_URL)
   ```

3. **Check browser console**:
   - Look for: `✅ Connected to Socket.IO server: [socket-id]`
   - If you see connection errors, verify the `NEXT_PUBLIC_SOCKET_URL`

4. **Check firewall/network**:
   - Ensure port 3000 is not blocked
   - In production, ensure WebSocket connections are allowed

### Messages not appearing?

1. **Check database connection** - Messages must be saved first
2. **Check course ID** - Ensure courseId is correct
3. **Check user enrollment** - Only enrolled students + teacher can access chat
4. **Check browser console** for Socket.IO events

---

## Production Deployment

### Environment Variables (Production):
```bash
NEXT_PUBLIC_SOCKET_URL=https://yourdomain.com
PORT=3000  # Or your server port
NEXT_PUBLIC_APP_URL=https://yourdomain.com
```

### Deployment Platforms:

#### Vercel
⚠️ **Note**: Vercel Serverless doesn't support WebSockets by default.
You'll need to either:
1. Deploy Socket.IO server separately (Heroku, Railway, Render, etc.)
2. Use Vercel with external WebSocket service

#### VPS/Dedicated Server (Recommended):
```bash
# Install dependencies
npm install

# Build
npm run build

# Start with PM2 (recommended)
pm2 start server.js --name edigo-chat

# Or use Docker
docker build -t edigo .
docker run -p 3000:3000 edigo
```

#### Docker Example:
```dockerfile
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["node", "server.js"]
```

---

## Additional Features (Optional)

### Typing Indicators
Already implemented in `server.js`, just emit from client:
```typescript
socket.emit('typing', { courseId, userId, userName });
// After 2 seconds:
socket.emit('stop-typing', { courseId, userId });
```

### Online Status
Track connected users:
```typescript
socket.on('user-joined', (data) => {
  // Show user as online
});
```

### Message Read Receipts
Update `isRead` field when messages are viewed.

---

## Support

For issues or questions:
1. Check browser console for Socket.IO logs
2. Check server console for connection events
3. Verify environment variables are set correctly
4. Ensure database has CourseChats table
