# 🎓 Edigo — AI-Powered Smart Learning Platform

Edigo is a unified, intelligent learning platform designed to streamline course creation for teachers and personalize study roadmaps for students.

https://github.com/user-attachments/assets/4a4aaab5-561d-4b4e-a665-4141521feaf7

---

## 🎯 What is Edigo?
In modern education, learning is fragmented. Students jump between various sites for videos, PDFs, flashcards, and search engines. Teachers spend countless hours drafting syllabi, lesson plans, and assessments. 

**Edigo** unifies this fragmented flow. It uses cutting-edge AI model orchestration to automatically generate comprehensive structured courses, curate learning paths, embed video resources, compile practice quizzes, and offer real-time help.

---

## 💡 What Edigo Solves & Why It Is Better

| The Problem | How Edigo Solves It | The Edigo Edge |
|:---|:---|:---|
| **Fragmented Resources** | Blends course syllabus, text content, video search, quizzes, and class chat under one roof. | **Unified Workspace:** Students never have to leave the application. |
| **High Teacher Prep Time** | Automatically drafts full lesson plans, summaries, and assessments from a simple title and duration prompt. | **Structured JSON Output:** Powered by Groq, generating instant valid formats without parser failures. |
| **Lack of Personalization** | Student Learning Plans allow customization of topics, difficulty level, and study duration. | **Tailored Curriculums:** Custom roadmaps built for the exact hourly budget of the student. |
| **Fragile Databases in Schools** | Adapts db client connection parameters using dual-persistence layers. | **Network Resiliency:** Instantly switches to HTTP (Port 443) if standard Postgres ports (5432) are firewall-blocked. |

---

## 🧠 System Architecture

```mermaid
graph TD
    Client["Next.js Frontend (Tailwind)"] -->|Auth Session| Clerk["Clerk Authentication"]
    Client -->|Real-Time Messages| Socket["Socket.IO Server (Port 3002)"]
    Client -->|HTTP API Requests| NextServer["Next.js backend (Port 3000)"]
    
    NextServer -->|1. Direct Connection (Port 5432)| Drizzle["Drizzle ORM (PostgreSQL)"]
    NextServer -->|2. Fallback REST Client (Port 443)| Supabase["Supabase HTTP Data API"]
    
    NextServer -->|Structured JSON Prompt| Groq["Groq SDK (Llama 3.3 70B)"]
    NextServer -->|Resource Search| YouTube["YouTube Data API v3"]
    NextServer -->|Upload Reference Files| Storage["Supabase Storage"]
    NextServer -->|Billing Events| Stripe["Stripe Payments Gateway"]
```

---

## ⚡ Key Features

### 1. **AI-Powered Course Generation**
* **For Teachers:** Generate a complete course curriculum by entering a title, duration, core topics, and marking scheme.
* **For Students:** Create highly personalized, hour-budgeted learning plans for any domain.

### 2. **Context-Aware PDF Chatbot**
* Upload textbook reference chapters, course documents, or syllabi directly.
* Parse file buffers using `pdfreader` and chat with the document using context-injected Groq model queries.

### 3. **Real-time Course Chat (ClassBot)**
* Collaborative chatrooms for every course powered by WebSockets.
* Instant messaging, participant status notifications, and database message logging.

### 4. **Dynamic Video & Quiz Curation**
* Auto-embeds the top 2 relevant YouTube video resources for every learning module.
* Generates interactive, validated 5-question multiple-choice quizzes dynamically for real-time progress checking.

### 5. **Empathetic Student Wellness Chat**
* A dedicated student mental wellness chatbot.
* Programmed with an empathetic, non-judgmental, warm persona to help students handle exam stress.

---

## 🛠️ Tech Stack

* **Frontend:** Next.js (App Router), React, Tailwind CSS, Radix UI, Lucide Icons
* **Backend:** Next.js API Routes, Standalone Node.js (Socket.IO server)
* **AI Model Orchestration:** Groq SDK (`llama-3.3-70b-versatile`)
* **Database & ORM:** Drizzle ORM, postgres.js, Supabase PostgreSQL, Supabase Client
* **Authentication:** Clerk
* **Payment Processing:** Stripe
* **Storage:** Supabase Storage
* **Integrations:** YouTube Data API v3, Pdfreader, Svix (Clerk Webhooks)

---

## 🔧 Installation & Setup

### Prerequisites
* Node.js v18 or higher
* PostgreSQL database or a Supabase account
* Accounts on Groq, Clerk, Stripe, and Google Cloud (YouTube API)

### 1. Clone & Install Dependencies
```bash
git clone https://github.com/Phantom-TA/Edigo.git
cd Edigo
npm install
```

### 2. Configure Environment Variables
Create a `.env.local` file in the root directory:

```env
# Database Credentials
DATABASE_URL=your_postgresql_connection_string

# Clerk Authentication (Get from clerk.com)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_pub_key
CLERK_SECRET_KEY=your_clerk_secret_key
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_IN_FALLBACK_REDIRECT_URL=/onboarding/role-selection
NEXT_PUBLIC_CLERK_SIGN_UP_FALLBACK_REDIRECT_URL=/onboarding/role-selection

# Supabase (Get from supabase.com project settings)
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# Groq API (Get from console.groq.com)
NEXT_PUBLIC_GROQ_API_KEY=your_groq_api_key

# Stripe (Get from dashboard.stripe.com)
STRIPE_SECRET_KEY=your_stripe_secret_key
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=your_stripe_pub_key

# YouTube Data API Key (Optional, get from console.cloud.google.com)
YOUTUBE_API_KEY=your_youtube_api_key

# Application Settings
NEXT_PUBLIC_BASE_URL=http://localhost:3000
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_SOCKET_URL=http://localhost:3002
```

### 3. Sync Database Schema
Drizzle will compile the schema and push it directly to your PostgreSQL database.
```bash
npm run db:push
```

### 4. Running the Application

For real-time chat, you need to run **both** the Next.js development server and the standalone Socket.io server.

**Terminal 1 (Next.js Application):**
```bash
npm run dev
```

**Terminal 2 (Socket.IO Server):**
```bash
npm run socket-server
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🛡️ Production Deployment Notes
* **WebSockets:** Standard serverless platforms like Vercel do not support persistent WebSockets. Deploy the `socket-standalone.js` file to a VPS or containerized platform (like Railway, Render, or Heroku) and update `NEXT_PUBLIC_SOCKET_URL` accordingly.
* **Database Connections:** Utilize connection poolers (e.g. Supabase connection pooler) for production-grade scaling.
