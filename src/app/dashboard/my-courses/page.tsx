'use client';

import { useEffect, useState } from 'react';
import { useUser } from '@clerk/nextjs';
import Link from 'next/link';

interface EnrolledCourse {
  id: number;
  courseId: string;
  enrolledAt: Date;
  progress: any;
}

interface CourseDetails {
  courseId: string;
  name: string;
  level?: string;
  courseBanner?: string;
  courseOutput?: any;
}

interface LearningPlan {
  id: number;
  planTitle: string;
  domain: string;
  duration: number;
  createdAt: Date;
  planOutput: any;
}

export default function MyCoursesPage() {
  const { user } = useUser();
  const [enrolledCourses, setEnrolledCourses] = useState<EnrolledCourse[]>([]);
  const [coursesDetails, setCoursesDetails] = useState<CourseDetails[]>([]);
  const [learningPlans, setLearningPlans] = useState<LearningPlan[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchEnrolledCourses();
      fetchLearningPlans();
    }
  }, [user]);

  const fetchEnrolledCourses = async () => {
    if (!user) return;

    try {
      setLoading(true);

      // Get enrolled course IDs from API
      const enrollmentResponse = await fetch('/api/courses/enrolled');
      if (!enrollmentResponse.ok) {
        throw new Error('Failed to fetch enrollments');
      }
      const enrollmentData = await enrollmentResponse.json();
      const enrollments = enrollmentData.enrollments || [];
      setEnrolledCourses(enrollments);

      // Fetch details for each course
      const courseIds = enrollments.map((e: EnrolledCourse) => e.courseId);
      if (courseIds.length > 0) {
        // Fetch course details from your existing API
        const response = await fetch(
          `/api/get-all-courses?enrolled=true&ids=${courseIds.join(',')}`
        );

        if (response.ok) {
          const data = await response.json();
          setCoursesDetails(data);
        }
      }
    } catch (error) {
      console.error('Error fetching enrolled courses:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchLearningPlans = async () => {
    try {
      const response = await fetch('/api/learning-plans');
      if (response.ok) {
        const data = await response.json();
        setLearningPlans(data.plans || []);
      }
    } catch (error) {
      console.error('Error fetching learning plans:', error);
    }
  };

  const getProgressPercentage = (courseId: string) => {
    const enrollment = enrolledCourses.find((e) => e.courseId === courseId);
    const course = coursesDetails.find((c) => c.courseId === courseId);

    if (!enrollment || !course || !course.courseOutput) return 0;

    // Calculate total topics from course structure
    let totalTopics = 0;
    const courseData = typeof course.courseOutput === 'string'
      ? JSON.parse(course.courseOutput)
      : course.courseOutput;

    if (courseData.weeks && Array.isArray(courseData.weeks)) {
      courseData.weeks.forEach((week: any) => {
        if (week.topics && Array.isArray(week.topics)) {
          totalTopics += week.topics.length;
        }
      });
    }

    if (totalTopics === 0) return 0;

    // Count completed topics from progress
    const progress = enrollment.progress as any;
    let completedTopics = 0;

    if (progress && typeof progress === 'object') {
      Object.entries(progress).forEach(([key, value]) => {
        if (value === true) {
          completedTopics++;
        }
      });
    }

    return Math.round((completedTopics / totalTopics) * 100);
  };

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">My Learning</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="animate-pulse bg-gray-100 rounded-lg h-64"
            ></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">My Learning</h1>

      {/* Learning Plans Section */}
      {learningPlans.length > 0 && (
        <div className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">My Learning Plans</h2>
            <span className="text-gray-600">
              {learningPlans.length} plan{learningPlans.length !== 1 ? 's' : ''}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {learningPlans.map((plan) => {
              const planData = plan.planOutput;
              return (
                <Link
                  key={plan.id}
                  href={`/dashboard/my-learning-plans/${plan.id}`}
                  className="block bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow overflow-hidden border-2 border-purple-200"
                >
                  <div className="h-40 bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center">
                    <div className="text-center text-white p-4">
                      <svg className="w-12 h-12 mx-auto mb-2" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z"/>
                        <path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd"/>
                      </svg>
                      <p className="text-sm font-semibold">Learning Plan</p>
                    </div>
                  </div>

                  <div className="p-4">
                    <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2">
                      {plan.planTitle}
                    </h3>

                    <span className="inline-block px-2 py-1 bg-purple-100 text-purple-700 rounded text-xs font-semibold mb-3">
                      {plan.domain}
                    </span>

                    <div className="text-sm text-gray-600 space-y-1">
                      <p>{plan.duration} hours</p>
                      {planData.estimatedWeeks && (
                        <p>{planData.estimatedWeeks} weeks</p>
                      )}
                    </div>

                    <button className="mt-4 w-full px-4 py-2 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700 transition-colors">
                      View Plan
                    </button>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      )}

      {/* Enrolled Courses Section */}
      {enrolledCourses.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Enrolled Courses</h2>
            <span className="text-gray-600">
              {enrolledCourses.length} course{enrolledCourses.length !== 1 ? 's' : ''}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {coursesDetails.map((course) => {
              const progress = getProgressPercentage(course.courseId);

              return (
                <Link
                  key={course.courseId}
                  href={`/course/${course.courseId}/roadmap`}
                  className="block bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow overflow-hidden"
                >
                  {/* Course Banner */}
                  <div className="h-40 bg-gradient-to-br from-indigo-500 to-purple-600 overflow-hidden">
                    {course.courseBanner ? (
                      <img
                        src={course.courseBanner}
                        alt={course.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-white text-4xl font-bold">
                        {course.name.charAt(0)}
                      </div>
                    )}
                  </div>

                  {/* Course Info */}
                  <div className="p-4">
                    <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2">
                      {course.name}
                    </h3>

                    {course.level && (
                      <span className="inline-block px-2 py-1 bg-indigo-100 text-indigo-700 rounded text-xs font-semibold mb-3">
                        {course.level}
                      </span>
                    )}

                    {/* Progress Bar */}
                    <div className="mt-3">
                      <div className="flex items-center justify-between text-sm text-gray-600 mb-1">
                        <span>Progress</span>
                        <span className="font-semibold">{progress}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-indigo-600 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${progress}%` }}
                        ></div>
                      </div>
                    </div>

                    <button className="mt-4 w-full px-4 py-2 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 transition-colors">
                      Continue Learning
                    </button>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      )}

      {/* Empty State */}
      {enrolledCourses.length === 0 && learningPlans.length === 0 && (
        <div className="text-center py-12">
          <div className="mb-6">
            <svg className="w-24 h-24 mx-auto text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">Start Your Learning Journey</h3>
          <p className="text-gray-500 mb-6">
            Enroll in courses or create a personalized learning plan to get started.
          </p>
          <div className="flex gap-4 justify-center">
            <Link
              href="/"
              className="inline-block px-6 py-3 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 transition-colors"
            >
              Browse Courses
            </Link>
            <Link
              href="/dashboard/create-learning-plan"
              className="inline-block px-6 py-3 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700 transition-colors"
            >
              Create Learning Plan
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
