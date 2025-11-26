
import { boolean, json, pgTable, serial, varchar, integer, timestamp, text } from "drizzle-orm/pg-core"

// PHASE 1: New Tables 

// User table with role system
export const Users = pgTable('users', {
    id: serial('id').primaryKey(),
    clerkId: varchar('clerkId', { length: 255 }).notNull().unique(),
    email: varchar('email', { length: 255 }).notNull(),
    fullName: varchar('fullName', { length: 255 }),
    profileImage: varchar('profileImage', { length: 500 }),
    role: varchar('role', { length: 20 }).notNull().default('STUDENT'), // 'TEACHER' or 'STUDENT'
    createdAt: timestamp('createdAt').defaultNow().notNull(),
    updatedAt: timestamp('updatedAt').defaultNow().notNull()
});

// Course Enrollments table
export const CourseEnrollments = pgTable('courseEnrollments', {
    id: serial('id').primaryKey(),
    courseId: varchar('courseId', { length: 255 }).notNull(),
    studentId: integer('studentId').notNull(), // references Users.id
    enrolledAt: timestamp('enrolledAt').defaultNow().notNull(),
    progress: json('progress').default({}) // Stores completion status per chapter
});

// Student Learning Plans table
export const StudentLearningPlans = pgTable('studentLearningPlans', {
    id: serial('id').primaryKey(),
    studentId: integer('studentId').notNull(), // references Users.id
    planTitle: varchar('planTitle', { length: 255 }).notNull(),
    domain: varchar('domain', { length: 255 }).notNull(),
    duration: integer('duration').notNull(), // in hours
    topics: json('topics').default([]),
    planOutput: json('planOutput').notNull(), // AI-generated plan structure
    createdAt: timestamp('createdAt').defaultNow().notNull()
});

// Course Chat table
export const CourseChats = pgTable('courseChats', {
    id: serial('id').primaryKey(),
    courseId: varchar('courseId', { length: 255 }).notNull(),
    senderId: integer('senderId').notNull(), // references Users.id
    senderName: varchar('senderName', { length: 255 }),
    senderImage: varchar('senderImage', { length: 500 }),
    message: text('message').notNull(),
    createdAt: timestamp('createdAt').defaultNow().notNull(),
    isRead: boolean('isRead').default(false)
});

// PHASE 3: Student Progress Tracking

// Student Exam Scores table
export const StudentExamScores = pgTable('studentExamScores', {
    id: serial('id').primaryKey(),
    studentId: integer('studentId').notNull(), // references Users.id
    courseId: varchar('courseId', { length: 255 }).notNull(),
    quiz1Score: integer('quiz1Score'), // nullable, score out of 100
    quiz2Score: integer('quiz2Score'), // nullable, score out of 100
    midSemScore: integer('midSemScore'), // nullable, score out of 100
    endSemScore: integer('endSemScore'), // nullable, score out of 100
    createdAt: timestamp('createdAt').defaultNow().notNull(),
    updatedAt: timestamp('updatedAt').defaultNow().notNull()
});

// Quiz Results table - stores individual quiz attempts
export const QuizResults = pgTable('quizResults', {
    id: serial('id').primaryKey(),
    studentId: integer('studentId').notNull(), // references Users.id
    courseId: varchar('courseId', { length: 255 }).notNull(),
    topicName: varchar('topicName', { length: 500 }).notNull(),
    weekNumber: integer('weekNumber'),
    score: integer('score').notNull(), // number of correct answers
    totalQuestions: integer('totalQuestions').notNull(), // total questions in quiz
    percentage: integer('percentage').notNull(), // calculated percentage
    quizData: json('quizData'), // stores the full quiz questions and user answers
    completedAt: timestamp('completedAt').defaultNow().notNull()
});

// EXISTING TABLES (with Phase 1 enhancements)

export const CourseList = pgTable('courseList', {
    id: serial('id').primaryKey(),
    courseId: varchar('courseId').notNull(),
    name: varchar('name').notNull(),
    level: varchar('level').notNull(),
    includeVideo: varchar('includeVideo').notNull().default('Yes'),
    courseOutput: json('courseOutput').notNull(),
    createdBy: varchar('createdBy').notNull(), // Keep for backward compatibility (Clerk ID)
    username: varchar('username'),
    userProfileImage: varchar('userProfileImage'),
    courseBanner: varchar('courseBanner'),
    publish: boolean('publish').default(false),
    // Phase 1 additions:
    creatorId: integer('creatorId'), // references Users.id (nullable for existing courses)
    isPublished: boolean('isPublished').default(false) // New field for published status
});

export const Chapters = pgTable('chapters', {
    id: serial('id').primaryKey(),
    courseId: varchar('courseId').notNull(),
    chapterId: integer('chapterId').notNull(),
    content: json('content').notNull(),
    videoId: varchar('videoId').notNull()
}
)