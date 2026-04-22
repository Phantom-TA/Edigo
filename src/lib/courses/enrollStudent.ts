import { supabase } from '@/app/_configs/db';

/**
 * Enroll a student in a course
 * Returns enrollment record or null if already enrolled
 */
export async function enrollStudent(clerkId: string, courseId: string) {
  try {
    // Get user's database ID using Supabase HTTP client
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('id')
      .eq('clerkId', clerkId)
      .maybeSingle();

    if (userError) {
      console.error('Error fetching user:', userError);
      throw new Error('Error fetching user');
    }

    if (!user) {
      throw new Error('User not found');
    }

    const studentId = user.id;

    // Check if already enrolled
    const { data: existingEnrollment, error: fetchError } = await supabase
      .from('courseEnrollments')
      .select('*')
      .eq('studentId', studentId)
      .eq('courseId', courseId)
      .maybeSingle();

    if (fetchError) {
      console.error('Error checking enrollment:', fetchError);
      throw new Error('Error checking enrollment');
    }

    if (existingEnrollment) {
      return null; // Already enrolled
    }

    // Create enrollment
    const { data: enrollment, error: insertError } = await supabase
      .from('courseEnrollments')
      .insert({
        studentId,
        courseId,
        progress: {},
      })
      .select()
      .single();

    if (insertError) {
      console.error('Error creating enrollment:', insertError);
      throw insertError;
    }

    return enrollment;
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
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('id')
      .eq('clerkId', clerkId)
      .maybeSingle();

    if (userError || !user) {
      return false;
    }

    const { data: enrollment, error: fetchError } = await supabase
      .from('courseEnrollments')
      .select('id')
      .eq('studentId', user.id)
      .eq('courseId', courseId)
      .maybeSingle();

    if (fetchError) return false;

    return !!enrollment;
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
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('id')
      .eq('clerkId', clerkId)
      .maybeSingle();

    if (userError || !user) {
      return [];
    }

    const { data: enrollments, error: fetchError } = await supabase
      .from('courseEnrollments')
      .select('*')
      .eq('studentId', user.id);

    if (fetchError) {
      console.error('Error getting enrolled courses:', fetchError);
      return [];
    }

    return enrollments || [];
  } catch (error) {
    console.error('Error getting enrolled courses:', error);
    return [];
  }
}
