'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@clerk/nextjs';

export default function RoleSelectionPage() {
  const [selectedRole, setSelectedRole] = useState<'TEACHER' | 'STUDENT' | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { user } = useUser();

  const handleRoleSelection = async () => {
    if (!selectedRole || !user) return;

    setLoading(true);

    try {
      const response = await fetch('/api/user/set-role', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clerkId: user.id,
          email: user.emailAddresses[0]?.emailAddress || '',
          fullName: user.fullName || '',
          profileImage: user.imageUrl || '',
          role: selectedRole,
        }),
      });

      if (response.ok) {
        // Redirect to home page
        router.push('/');
      } else {
        alert('Failed to set role. Please try again.');
        setLoading(false);
      }
    } catch (error) {
      console.error('Error setting role:', error);
      alert('An error occurred. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="max-w-4xl w-full mx-auto p-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Welcome to Edigo! 👋
          </h1>
          <p className="text-lg text-gray-600">
            Let&apos;s get started by selecting your role
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6 mb-8">
          {/* Teacher Card */}
          <button
            onClick={() => setSelectedRole('TEACHER')}
            disabled={loading}
            className={`p-8 rounded-2xl border-2 transition-all duration-200 text-left ${
              selectedRole === 'TEACHER'
                ? 'border-indigo-600 bg-indigo-50 shadow-lg scale-105'
                : 'border-gray-200 bg-white hover:border-indigo-300 hover:shadow-md'
            }`}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center text-3xl">
                👨‍🏫
              </div>
              {selectedRole === 'TEACHER' && (
                <div className="w-8 h-8 bg-indigo-600 rounded-full flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
              )}
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">I&apos;m a Teacher</h3>
            <p className="text-gray-600">
              Create and manage courses, upload course materials, and guide students through their learning journey.
            </p>
          </button>

          {/* Student Card */}
          <button
            onClick={() => setSelectedRole('STUDENT')}
            disabled={loading}
            className={`p-8 rounded-2xl border-2 transition-all duration-200 text-left ${
              selectedRole === 'STUDENT'
                ? 'border-green-600 bg-green-50 shadow-lg scale-105'
                : 'border-gray-200 bg-white hover:border-green-300 hover:shadow-md'
            }`}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center text-3xl">
                🎓
              </div>
              {selectedRole === 'STUDENT' && (
                <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
              )}
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">I&apos;m a Student</h3>
            <p className="text-gray-600">
              Browse courses, enroll in classes, create personalized learning plans, and track your progress.
            </p>
          </button>
        </div>

        <div className="text-center">
          <button
            onClick={handleRoleSelection}
            disabled={!selectedRole || loading}
            className={`px-8 py-4 rounded-xl font-semibold text-lg transition-all duration-200 ${
              selectedRole && !loading
                ? 'bg-black text-white hover:bg-gray-800 shadow-lg'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            {loading ? 'Setting up your account...' : 'Continue'}
          </button>
        </div>
      </div>
    </div>
  );
}
