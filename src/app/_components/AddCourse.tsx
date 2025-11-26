"use client"
import { Button } from '@/components/ui/button'
import { useUser, SignInButton, SignUpButton } from '@clerk/nextjs'
import { useRouter } from 'next/navigation';
import React from 'react'
import { useUserCourseList } from '../_context/UserCourseListContext';

const AddCourse = () => {
    const { user, isLoaded } = useUser();
    const { userCourseList } = useUserCourseList();
    const maxCourses = 10;
    const router = useRouter();

    const handleClick = () => {
        if (userCourseList.length >= maxCourses) {
            router.push('/dashboard/upgrade');
        } else {
            router.push('/create-course-simple');
        }
    };

    // Show loading state while Clerk is loading
    if (!isLoaded) {
        return (
            <div className="bg-violet-50 border border-violet-200 rounded-lg shadow p-6 mb-6 flex items-center justify-center">
                <div className="animate-pulse text-violet-700">Loading...</div>
            </div>
        );
    }

    // If user is not authenticated, show sign-in/sign-up buttons
    if (!user) {
        return (
            <div className="bg-gradient-to-r from-violet-50 to-purple-50 border border-violet-200 rounded-lg shadow-lg p-8 mb-6">
                <div className="text-center">
                    <h2 className="text-3xl font-bold text-violet-700 mb-3">Welcome to Edigo</h2>
                    <p className="text-violet-600 mb-6 text-lg">
                        Empower your journey—create, share, and learn with AI-driven courses and personalized learning plans.
                    </p>
                    <div className="flex gap-4 justify-center flex-wrap">
                        <SignInButton mode="modal">
                            <Button className="px-8 py-3 text-lg font-semibold rounded-full bg-violet-600 text-white hover:bg-violet-700 transition-colors">
                                Sign In
                            </Button>
                        </SignInButton>
                        <SignUpButton
                            mode="modal"
                            forceRedirectUrl="/onboarding"
                        >
                            <Button className="px-8 py-3 text-lg font-semibold rounded-full bg-purple-600 text-white hover:bg-purple-700 transition-colors">
                                Sign Up
                            </Button>
                        </SignUpButton>
                    </div>
                </div>
            </div>
        );
    }

    // If user is authenticated, show the create course section
    return (
        <div className="bg-violet-50 border border-violet-200 rounded-lg shadow p-6 mb-6 flex flex-col md:flex-row items-center justify-between">
            <div className="mb-4 md:mb-0">
                <h2 className="text-2xl font-bold text-violet-700">Hello,<span className="ml-2 uppercase">{user?.fullName || user?.username}</span></h2>
                <p className="text-violet-500 mt-2">Empower your journey—create, share, and learn with AI-driven courses and personalized learning plans.</p>
            </div>
            <Button
                className="mt-4 md:mt-0 px-6 py-3 cursor-pointer text-lg font-semibold rounded-full bg-violet-600 text-white hover:bg-violet-700"
                onClick={handleClick}
            >
                + Create AI Course
            </Button>
        </div>
    )
}

export default AddCourse