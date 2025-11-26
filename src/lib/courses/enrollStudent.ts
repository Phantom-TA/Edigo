import { db } from '@/app/_configs/db';
import { CourseEnrollments, Users } from '@/app/_configs/Schema';
import { eq, and } from 'drizzle-orm';

/**
 * Enroll a student in a course
 * Returns enrollment record or null if already enrolled
 */
export async function enrollStudent(clerkId: string, courseId: string) {
  try {
    // Get user's database ID
    const user = await db
      .select({ id: Users.id })
      .from(Users)
      .where(eq(Users.clerkId, clerkId))
      .limit(1);

    if (user.length === 0) {
      throw new Error('User not found');
    }

    const studentId = user[0].id;

    // Check if already enrolled
    const existingEnrollment = await db
      .select()
      .from(CourseEnrollments)
      .where(
        and(
          eq(CourseEnrollments.studentId, studentId),
          eq(CourseEnrollments.courseId, courseId)
        )
      )
      .limit(1);

    if (existingEnrollment.length > 0) {
      return null; // Already enrolled
    }

    // Create enrollment
    const enrollment = await db
      .insert(CourseEnrollments)
      .values({
        studentId,
        courseId,
        progress: {},
      })
      .returning();

    return enrollment[0];
  } catch (error) {
    console.error('Error enrolling student:', error);
    throw error;
  }
}

/**
 * Check if a student is enrolled in a course
 */
export async function isStudentEnrolled(clerkId: string, courseId: string): Promise<boolean> {
  try {
    const user = await db
      .select({ id: Users.id })
      .from(Users)
      .where(eq(Users.clerkId, clerkId))
      .limit(1);

    if (user.length === 0) {
      return false;
    }

    const enrollment = await db
      .select()
      .from(CourseEnrollments)
      .where(
        and(
          eq(CourseEnrollments.studentId, user[0].id),
          eq(CourseEnrollments.courseId, courseId)
        )
      )
      .limit(1);

    return enrollment.length > 0;
  } catch (error) {
    console.error('Error checking enrollment:', error);
    return false;
  }
}

/**
 * Get all enrolled courses for a student
 */
export async function getEnrolledCourses(clerkId: string) {
  try {
    const user = await db
      .select({ id: Users.id })
      .from(Users)
      .where(eq(Users.clerkId, clerkId))
      .limit(1);

    if (user.length === 0) {
      return [];
    }

    const enrollments = await db
      .select()
      .from(CourseEnrollments)
      .where(eq(CourseEnrollments.studentId, user[0].id));

    return enrollments;
  } catch (error) {
    console.error('Error getting enrolled courses:', error);
    return [];
  }
}
