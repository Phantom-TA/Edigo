'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@clerk/nextjs';
import Header from '../_components/Header';
import { GenerateLearningPlan } from './action';
import { Loader2 } from 'lucide-react';

const trendingDomains = [
  'Web Development',
  'Data Science',
  'Machine Learning',
  'Artificial Intelligence',
  'Mobile App Development',
  'Cloud Computing',
  'Cybersecurity',
  'DevOps',
  'Blockchain',
  'Game Development',
  'UI/UX Design',
  'Digital Marketing',
  'Business Analytics',
  'Internet of Things (IoT)',
  'Augmented Reality/Virtual Reality'
];

export default function CreateLearningPlan() {
  const router = useRouter();
  const { user } = useUser();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    domain: '',
    duration: '',
    wantedTopics: '',
    additionalNeeds: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      alert('Please sign in to create a learning plan');
      return;
    }

    if (!formData.domain || !formData.duration) {
      alert('Please fill in all required fields');
      return;
    }

    setLoading(true);

    try {
      const result = await GenerateLearningPlan({
        formData,
        user: {
          email: user.emailAddresses[0].emailAddress,
          fullName: user.fullName,
          imageUrl: user.imageUrl,
          id: user.id
        }
      });

      if (result.success && result.planId) {
        router.push(`/dashboard/my-learning-plans/${result.planId}`);
      } else {
        alert(result.error || 'Failed to generate learning plan');
      }
    } catch (error) {
      console.error('Error creating learning plan:', error);
      alert('Failed to create learning plan. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50">
      <Header />

      <div className="max-w-3xl mx-auto px-4 py-12">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-3">
              Create Your Learning Plan
            </h1>
            <p className="text-gray-600">
              Let AI generate a personalized learning roadmap tailored to your goals and schedule.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Trending Domains */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Trending Domains <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.domain}
                onChange={(e) => setFormData({ ...formData, domain: e.target.value })}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-purple-500 focus:outline-none transition-colors"
                required
              >
                <option value="">Select a domain...</option>
                {trendingDomains.map((domain) => (
                  <option key={domain} value={domain}>
                    {domain}
                  </option>
                ))}
              </select>
            </div>

            {/* Duration */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Duration (in hours) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                min="1"
                max="1000"
                value={formData.duration}
                onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                placeholder="e.g., 40"
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-purple-500 focus:outline-none transition-colors"
                required
              />
              <p className="text-sm text-gray-500 mt-1">
                Total time you want to dedicate to this learning plan
              </p>
            </div>

            {/* Wanted Topics */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Wanted Topics
              </label>
              <textarea
                value={formData.wantedTopics}
                onChange={(e) => setFormData({ ...formData, wantedTopics: e.target.value })}
                placeholder="List specific topics you want to cover (e.g., React Hooks, API Integration, State Management)"
                rows={4}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-purple-500 focus:outline-none transition-colors resize-none"
              />
            </div>

            {/* Any Other Needs */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Any Other Needs
              </label>
              <textarea
                value={formData.additionalNeeds}
                onChange={(e) => setFormData({ ...formData, additionalNeeds: e.target.value })}
                placeholder="Share your learning goals, current skill level, or any specific requirements"
                rows={4}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-purple-500 focus:outline-none transition-colors resize-none"
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white font-bold py-4 rounded-lg hover:from-purple-700 hover:to-blue-700 transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
            >
              {loading ? (
                <>
                  <Loader2 className="animate-spin" size={24} />
                  Generating Your Learning Plan...
                </>
              ) : (
                <>
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  Generate Learning Plan
                </>
              )}
            </button>
          </form>
        </div>

        {/* Info Cards */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white rounded-lg p-4 shadow-md">
            <div className="text-purple-600 text-2xl mb-2">🎯</div>
            <h3 className="font-semibold text-gray-900 mb-1">Personalized</h3>
            <p className="text-sm text-gray-600">Tailored to your goals and schedule</p>
          </div>
          <div className="bg-white rounded-lg p-4 shadow-md">
            <div className="text-blue-600 text-2xl mb-2">📚</div>
            <h3 className="font-semibold text-gray-900 mb-1">Structured</h3>
            <p className="text-sm text-gray-600">Week-by-week learning roadmap</p>
          </div>
          <div className="bg-white rounded-lg p-4 shadow-md">
            <div className="text-green-600 text-2xl mb-2">✨</div>
            <h3 className="font-semibold text-gray-900 mb-1">AI-Powered</h3>
            <p className="text-sm text-gray-600">Generated using advanced AI</p>
          </div>
        </div>
      </div>
    </div>
  );
}
