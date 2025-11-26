"use client"
import React, { useEffect, useState } from 'react'
import Header from "./_components/Header"
import BrowseCourses from './dashboard/_components/BrowseCourses'
import { Button } from '@/components/ui/button'
import { useUser } from '@clerk/nextjs'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function Home(){
  const { user, isLoaded } = useUser();
  const router = useRouter();
  const [userRole, setUserRole] = useState<'TEACHER' | 'STUDENT' | null>(null);

  useEffect(() => {
    if (user) {
      fetchUserRole();
    }
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

  const handleCreateClick = () => {
    if (userRole === 'STUDENT') {
      router.push('/dashboard/create-learning-plan');
    } else {
      router.push('/create-course-simple');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 via-white to-purple-50">
      <Header/>

      {/* Hero Section with Auth Buttons */}
      <div className="max-w-7xl mx-auto px-4 py-12">
        {!isLoaded ? (
          <div className="bg-white border border-violet-200 rounded-lg shadow-lg p-8 mb-8 flex items-center justify-center">
            <div className="animate-pulse text-violet-700">Loading...</div>
          </div>
        ) : !user ? (
          // Show sign-in/sign-up for unauthenticated users
          <div className="bg-gradient-to-r from-violet-100 to-purple-100 border border-violet-200 rounded-2xl shadow-2xl p-12 mb-12">
            <div className="text-center flex flex-col items-center justify-center">
              <h1 className="text-5xl font-extrabold text-violet-700 mb-6 drop-shadow-lg">
                Welcome to Edigo
              </h1>
              <p className="text-violet-600 mb-8 text-xl max-w-xl mx-auto font-medium">
                Connect. Learn. Grow. <br />
                Where students and teachers meet, share, and unlock AI-powered learning together.
              </p>
              <div className="flex gap-6 justify-center flex-wrap">
                <Link href="/sign-in">
                  <Button className="px-10 py-4 text-lg font-semibold rounded-full bg-violet-600 text-white hover:bg-violet-700 transition-colors shadow-lg">
                    Sign In
                  </Button>
                </Link>
                <Link href="/sign-up">
                  <Button className="px-10 py-4 text-lg font-semibold rounded-full bg-purple-600 text-white hover:bg-purple-700 transition-colors shadow-lg">
                    Sign Up
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        ) : (
          // Show welcome message for authenticated users
          <div className="bg-white border border-violet-200 rounded-2xl shadow-lg p-8 mb-12">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="mb-4 md:mb-0">
                <h2 className="text-3xl font-bold text-violet-700">
                  Hello, <span className="uppercase">{user?.fullName || user?.username}</span>!
                </h2>
                <p className="text-violet-600 mt-2 text-lg">
                  Empower your journey—create, share, and learn with AI-driven courses and personalized learning plans.
                </p>
              </div>
              <div className="flex gap-3">
                <Button
                  onClick={() => router.push('/dashboard')}
                  className="px-8 py-4 text-lg font-semibold rounded-full bg-violet-600 text-white hover:bg-violet-700 transition-colors shadow-md"
                >
                  My Dashboard
                </Button>
                <Button
                  onClick={handleCreateClick}
                  className="px-8 py-4 text-lg font-semibold rounded-full bg-purple-600 text-white hover:bg-purple-700 transition-colors shadow-md"
                >
                  {userRole === 'STUDENT' ? '+ Create Learning Plan' : '+ Create Course'}
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Browse Courses Section */}
        <BrowseCourses />
      </div>
    </div>
  )
}

