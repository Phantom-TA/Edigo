import { db } from '@/app/_configs/db';
import { Users } from '@/app/_configs/Schema';
import { eq } from 'drizzle-orm';
import { auth } from '@clerk/nextjs/server';

export type UserRole = 'TEACHER' | 'STUDENT' | null;

/**
 * Gets the user's role from the database
 * Returns null if user not found or not authenticated
 */
export async function getUserRole(): Promise<UserRole> {
  try {
    const { userId } = await auth();

    if (!userId) {
      return null;
    }

    const user = await db
      .select({ role: Users.role })
      .from(Users)
      .where(eq(Users.clerkId, userId))
      .limit(1);

    if (user.length === 0) {
      return null;
    }

    return user[0].role as UserRole;
  } catch (error) {
    console.error('Error getting user role:', error);
    return null;
  }
}

/**
 * Gets user data including role
 */
export async function getUserData() {
  try {
    const { userId } = await auth();

    if (!userId) {
      return null;
    }

    const user = await db
      .select()
      .from(Users)
      .where(eq(Users.clerkId, userId))
      .limit(1);

    if (user.length === 0) {
      return null;
    }

    return user[0];
  } catch (error) {
    console.error('Error getting user data:', error);
    return null;
  }
}
