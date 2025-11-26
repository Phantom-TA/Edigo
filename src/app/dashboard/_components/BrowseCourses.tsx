'use client';

import { useEffect, useState } from 'react';
import { useUser } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import CoursePreviewModal from './CoursePreviewModal';

interface Course {
  courseId: string;
  name: string;
  level?: string;
  courseBanner?: string;
  courseOutput?: any;
  username?: string;
  createdBy?: string;
}

interface CourseWithEnrollment extends Course {
  isEnrolled?: boolean;
}

export default function BrowseCourses() {
  const { user, isLoaded } = useUser();
  const router = useRouter();
  const [courses, setCourses] = useState<CourseWithEnrollment[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [userRole, setUserRole] = useState<'TEACHER' | 'STUDENT' | null>(null);

  useEffect(() => {
    if (user) {
      fetchUserRole();
    }
    fetchPublishedCourses();
  }, [user]);

  const fetchUserRole = async () => {
    try {
      const response = await fetch('/api/user/role');
      if (response.ok) {
        const data = await response.json();
        setUserRole(data.role);
      }
    } catch (error) {
      console.error('Error fetching user role:', error);
    }
  };

  const fetchPublishedCourses = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/get-all-courses?published=true');
      if (response.ok) {
        const data = await response.json();

        // Check enrollment status for each course if user is authenticated
        if (user) {
          const coursesWithEnrollment = await Promise.all(
            data.map(async (course: Course) => {
              try {
                const enrollResponse = await fetch(`/api/courses/enroll?courseId=${course.courseId}`);
                if (enrollResponse.ok) {
                  const enrollData = await enrollResponse.json();
                  return { ...course, isEnrolled: enrollData.enrolled };
                }
              } catch (error) {
                console.error('Error checking enrollment:', error);
              }
              return { ...course, isEnrolled: false };
            })
          );
          setCourses(coursesWithEnrollment);
        } else {
          setCourses(data);
        }
      }
    } catch (error) {
      console.error('Error fetching courses:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEnrollClick = (course: Course) => {
    if (!user) return;
    setSelectedCourse(course);
    setShowModal(true);
  };

  const handleCourseClick = (course: CourseWithEnrollment) => {
    // If enrolled, navigate to course view
    if (course.isEnrolled) {
      router.push(`/course/${course.courseId}/roadmap`);
    }
  };

  const handleEnrollSuccess = () => {
    fetchPublishedCourses(); // Refresh list to update enrollment status
  };

  if (loading) {
    return (
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Browse Courses</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="animate-pulse bg-gray-100 rounded-lg h-64"></div>
          ))}
        </div>
      </div>
    );
  }

  if (courses.length === 0) {
    return (
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Browse Courses</h2>
        <div className="bg-gray-50 rounded-lg p-8 text-center">
          <p className="text-gray-500">No published courses available at the moment.</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Browse Courses</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses.map((course) => (
            <div
              key={course.courseId}
              className={`bg-white rounded-lg shadow-md hover:shadow-lg transition-all overflow-hidden ${
                course.isEnrolled ? 'cursor-pointer' : ''
              }`}
              onClick={() => course.isEnrolled && handleCourseClick(course)}
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

                <div className="flex gap-2 mb-3">
                  {course.level && (
                    <span className="px-2 py-1 bg-indigo-100 text-indigo-700 rounded text-xs font-semibold">
                      {course.level}
                    </span>
                  )}
                  {course.courseOutput?.Duration && (
                    <span className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs font-semibold">
                      {course.courseOutput.Duration}
                    </span>
                  )}
                </div>

                {course.username && (
                  <p className="text-sm text-gray-600 mb-3">
                    By {course.username}
                  </p>
                )}

                {/* Button logic based on role and enrollment status */}
                {!isLoaded || !user ? (
                  <div className="text-center text-sm text-gray-500 py-2">
                    Sign in to enroll
                  </div>
                ) : userRole === 'TEACHER' ? (
                  <div className="text-center text-sm text-gray-600 py-2 bg-gray-100 rounded-lg">
                    Available to students
                  </div>
                ) : course.isEnrolled ? (
                  <button
                    disabled
                    className="w-full px-4 py-2 bg-green-600 text-white rounded-lg font-semibold cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    Enrolled
                  </button>
                ) : (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleEnrollClick(course);
                    }}
                    className="w-full px-4 py-2 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 transition-colors"
                  >
                    Enroll Now
                  </button>
                )}

                {course.isEnrolled && (
                  <p className="text-xs text-center text-gray-500 mt-2">
                    Click card to view course
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Course Preview Modal */}
      {selectedCourse && (
        <CoursePreviewModal
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          course={selectedCourse}
          onEnrollSuccess={handleEnrollSuccess}
        />
      )}
    </>
  );
}
