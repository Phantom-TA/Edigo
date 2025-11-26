"use client"
import React from 'react'
import { useUser } from '@clerk/nextjs'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import UserCourseList from './_components/UserCourseList'
import { useUserCourseList } from '../_context/UserCourseListContext'

const Dashboard = () => {
  const { user, isLoaded } = useUser();
  const router = useRouter();
  const { userCourseList } = useUserCourseList();
  const maxCourses = 5;

  // Redirect to home if not authenticated
  React.useEffect(() => {
    if (isLoaded && !user) {
      router.push('/');
    }
  }, [isLoaded, user, router]);

  const handleCreateCourse = () => {
    if (userCourseList.length >= maxCourses) {
      router.push('/dashboard/upgrade');
    } else {
      router.push('/create-course-simple');
    }
  };

  if (!isLoaded || !user) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-pulse text-violet-700 text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <div>
      {/* Create Course Section */}
      <div className="bg-gradient-to-r from-violet-50 to-purple-50 border border-violet-200 rounded-lg shadow-lg p-8 mb-8">
        <div className="flex flex-col md:flex-row items-center justify-between">
          <div className="mb-4 md:mb-0">
            <h2 className="text-3xl font-bold text-violet-700">
              Hello, <span className="uppercase">{user?.fullName || user?.username}</span>!
            </h2>
            <p className="text-violet-600 mt-2 text-lg">
              Empower your journey—create, share, and learn with AI-driven courses and personalized learning plans.
            </p>
          </div>
          <Button
            onClick={handleCreateCourse}
            className="px-8 py-4 text-lg font-semibold rounded-full bg-violet-600 text-white hover:bg-violet-700 transition-colors shadow-md"
          >
            + Create AI Course
          </Button>
        </div>
      </div>

      {/* Display List of User's Own Courses */}
      <UserCourseList />
    </div>
  )
}

export default Dashboard