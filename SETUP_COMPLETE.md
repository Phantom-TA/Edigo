# Edigo Setup Guide - Complete Implementation

## ✅ What's Been Implemented

### 1. **Real-Time Chat System (Socket.IO)**
- Teacher-Student chat per course
- Real-time message delivery
- Message persistence in database
- Connection status indicators

### 2. **Progress Tracking System**
- Database-backed progress tracking
- Real-time progress bar updates
- Checkbox completion tracking per topic
- Synced across devices

### 3. **YouTube Video Embeds**
- Top 2 YouTube videos embedded per topic
- Automatic video fetching via YouTube API
- Fallback to search links if API not configured
- Expandable/collapsible video sections

---

## 🔧 Required Environment Variables

Create a `.env.local` file in the root directory:

```bash
# ===================================
# DATABASE
# ===================================
DATABASE_URL=your_postgresql_connection_string

# ===================================
# CLERK AUTHENTICATION
# ===================================
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
CLERK_SECRET_KEY=your_clerk_secret_key

# ===================================
# SUPABASE (For file storage)
# ===================================
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# ===================================
# GROQ AI
# ===================================
NEXT_PUBLIC_GROQ_API_KEY=your_groq_api_key

# ===================================
# STRIPE PAYMENT
# ===================================
STRIPE_SECRET_KEY=your_stripe_secret_key
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key

# ===================================
# YOUTUBE API (For video embeds)
# ===================================
# OPTIONAL but recommended for video embeds
YOUTUBE_API_KEY=your_youtube_api_key

# ===================================
# SOCKET.IO (For real-time chat)
# ===================================
NEXT_PUBLIC_SOCKET_URL=http://localhost:3000
PORT=3000
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

---

## 📺 How to Get YouTube API Key

1. **Go to Google Cloud Console**: https://console.cloud.google.com/
2. **Create a new project** (or select existing one)
3. **Enable YouTube Data API v3**:
   - Go to "APIs & Services" > "Library"
   - Search for "YouTube Data API v3"
   - Click "Enable"
4. **Create credentials**:
   - Go to "APIs & Services" > "Credentials"
   - Click "Create Credentials" > "API Key"
   - Copy the API key
5. **Add to `.env.local`**:
   ```bash
   YOUTUBE_API_KEY=your_api_key_here
   ```

**Note**: If you don't set this up, the system will fallback to YouTube search links instead of embedded videos.

---

## 🗄️ Database Schema Updates

The following tables are already defined in `src/app/_configs/Schema.ts`:

- **`CourseChats`** - Stores chat messages with sender info
- **`CourseEnrollments`** - Tracks student enrollments and progress

Make sure to run database migrations:

```bash
npm run db:push
```

---

## 🚀 Running the Application

### Development Mode:
```bash
npm run dev
```

This starts the custom Socket.IO + Next.js server on port 3000.

### Build for Production:
```bash
npm run build
npm start
```

---

## 🎯 Feature Usage Guide

### **1. Progress Tracking**

**How it works:**
- Students click checkboxes next to topics
- Progress saves to database automatically
- Progress bar updates in real-time
- Progress syncs across all devices

**Where to see it:**
- Course roadmap page: `/course/[courseid]/roadmap`
- Progress bar at the top shows overall completion

**API Endpoints:**
- `GET /api/courses/progress?courseId=xxx` - Get progress
- `POST /api/courses/progress` - Update progress

---

### **2. YouTube Video Embeds**

**How it works:**
- Click "🎥 Watch Videos" button on any topic
- System fetches top 2 relevant videos from YouTube
- Videos embed directly in the page
- Click again to hide videos

**Fallback behavior:**
- If YouTube API key not set: Opens YouTube search in new tab
- If API request fails: Opens YouTube search as fallback

**Where to see it:**
- Any topic in the roadmap: `/course/[courseid]/roadmap`

---

### **3. Real-Time Chat (ClassBot)**

**How it works:**
- Floating chat button appears on course pages
- Only accessible to enrolled students + course creator
- Messages sync in real-time via Socket.IO
- All messages stored in database

**Where to see it:**
- Course roadmap: `/course/[courseid]/roadmap`
- Course content: `/create-course/[courseId]/finish`

**Socket.IO Events:**
- `join-course` - Join course chat room
- `send-message` - Send a message
- `new-message` - Receive messages in real-time

**API Endpoints:**
- `POST /api/chat/send-message` - Save message to DB
- `GET /api/chat/get-messages` - Fetch message history

---

## 🧪 Testing Checklist

### Progress Tracking:
- [ ] Sign in as student
- [ ] Open a course roadmap
- [ ] Click checkboxes on topics
- [ ] Refresh page - checkboxes should stay checked
- [ ] Watch progress bar update

### YouTube Embeds:
- [ ] Click "🎥 Watch Videos" on any topic
- [ ] Videos should embed (if API key set)
- [ ] Click again to hide videos
- [ ] Try without API key - should open YouTube search

### Real-Time Chat:
- [ ] Open course page in two browser windows
- [ ] Login as teacher in one, student in another
- [ ] Send messages from both
- [ ] Messages should appear instantly in both windows
- [ ] Refresh - message history should persist

---

## 📁 File Structure

```
src/
├── app/
│   ├── api/
│   │   ├── chat/
│   │   │   ├── send-message/route.ts       # Save messages
│   │   │   └── get-messages/route.ts       # Fetch messages
│   │   ├── courses/
│   │   │   ├── progress/route.ts           # Progress tracking
│   │   │   └── enrolled/route.ts           # Enrollment API
│   │   └── youtube/
│   │       └── search/route.ts             # YouTube video search
│   ├── course/[courseid]/
│   │   ├── roadmap/
│   │   │   ├── page.tsx                    # Roadmap with progress bar
│   │   │   └── _components/
│   │   │       ├── WeeklyRoadmap.tsx       # Week accordion
│   │   │       └── TopicItem.tsx           # Topic with checkbox + videos
│   │   └── _components/
│   │       ├── ChatBot.tsx                 # Floating chat button
│   │       ├── ChatPanel.tsx               # Chat interface (Socket.IO)
│   │       └── MessageList.tsx             # Message display
│   └── _configs/
│       └── Schema.ts                       # Database schema
└── lib/
    └── socket.ts                           # Socket.IO types

server.js                                   # Custom Socket.IO server
```

---

## 🔒 Security Notes

1. **YouTube API Key**: Has quota limits, monitor usage
2. **Socket.IO**: Already configured with CORS
3. **Chat Access**: Enforced at API level (enrolled students only)
4. **Progress Tracking**: User authentication required

---

## 🐛 Common Issues

### Chat not connecting?
- Check `NEXT_PUBLIC_SOCKET_URL` is correct
- Ensure `npm run dev` is running (not `npm run dev:next`)
- Check browser console for connection errors

### Videos not embedding?
- Verify `YOUTUBE_API_KEY` is set in `.env.local`
- Check API key has YouTube Data API v3 enabled
- Check quota limits in Google Cloud Console
- Fallback will work without API key (opens search links)

### Progress not saving?
- Ensure user is signed in
- Check database connection
- Verify `CourseEnrollments` table exists
- Check browser console for errors

---

## 📈 Production Deployment

### Environment Variables (Production):
Update these for production:

```bash
NEXT_PUBLIC_SOCKET_URL=https://yourdomain.com
NEXT_PUBLIC_APP_URL=https://yourdomain.com
PORT=3000
```

### Socket.IO Deployment:
- VPS/Dedicated Server: Use `server.js` as-is
- Vercel: Deploy Socket.IO separately (Heroku/Railway/Render)
- Docker: Use provided Dockerfile in `SOCKETIO_SETUP.md`

---

## 📚 Additional Documentation

- **Socket.IO Setup**: See `SOCKETIO_SETUP.md`
- **Database Schema**: See `src/app/_configs/Schema.ts`
- **Plan Document**: See `PLAN.md`

---

## ✅ Summary

You now have:
1. ✅ **Real-time chat** between teachers and students
2. ✅ **Progress tracking** with database persistence
3. ✅ **YouTube video embeds** in course topics

All features are production-ready! 🎉
