'use client';

import React, { useEffect, useState } from 'react';
import { useUser } from '@clerk/nextjs';

interface QuizResult {
  id: string;
  topicName: string;
  score: number;
  totalQuestions: number;
  percentage: number;
  completedAt: Date;
  weekNumber?: number;
}

interface QuizzesTabProps {
  courseId: string;
}

export default function QuizzesTab({ courseId }: QuizzesTabProps) {
  const { user } = useUser();
  const [quizResults, setQuizResults] = useState<QuizResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalQuizzes: 0,
    averageScore: 0,
    bestScore: 0,
    totalTopicsCovered: 0
  });

  useEffect(() => {
    if (user) {
      fetchQuizResults();
    }
  }, [user, courseId]);

  const fetchQuizResults = async () => {
    try {
      const response = await fetch(`/api/quiz-results?courseId=${courseId}`);
      if (response.ok) {
        const data = await response.json();
        setQuizResults(data.results || []);
        calculateStats(data.results || []);
      }
    } catch (error) {
      console.error('Error fetching quiz results:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (results: QuizResult[]) => {
    if (results.length === 0) {
      setStats({
        totalQuizzes: 0,
        averageScore: 0,
        bestScore: 0,
        totalTopicsCovered: 0
      });
      return;
    }

    const totalQuizzes = results.length;
    const averageScore = Math.round(
      results.reduce((sum, result) => sum + result.percentage, 0) / totalQuizzes
    );
    const bestScore = Math.max(...results.map(r => r.percentage));
    const uniqueTopics = new Set(results.map(r => r.topicName)).size;

    setStats({
      totalQuizzes,
      averageScore,
      bestScore,
      totalTopicsCovered: uniqueTopics
    });
  };

  const getScoreColor = (percentage: number) => {
    if (percentage >= 80) return 'text-green-600 bg-green-50 border-green-200';
    if (percentage >= 60) return 'text-yellow-600 bg-yellow-50 border-yellow-200';
    return 'text-red-600 bg-red-50 border-red-200';
  };

  const getScoreBadge = (percentage: number) => {
    if (percentage >= 80) return { label: 'Excellent', color: 'bg-green-500' };
    if (percentage >= 60) return { label: 'Good', color: 'bg-yellow-500' };
    return { label: 'Needs Improvement', color: 'bg-red-500' };
  };

  if (loading) {
    return (
      <div className="py-8">
        <div className="animate-pulse space-y-4">
          <div className="h-32 bg-gray-200 rounded-lg"></div>
          <div className="h-20 bg-gray-200 rounded-lg"></div>
          <div className="h-20 bg-gray-200 rounded-lg"></div>
        </div>
      </div>
    );
  }

  if (quizResults.length === 0) {
    return (
      <div className="py-12 text-center">
        <div className="bg-gray-50 rounded-lg p-8 max-w-md mx-auto">
          <svg
            className="mx-auto h-12 w-12 text-gray-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
          <h3 className="mt-4 text-lg font-medium text-gray-900">No quiz results yet</h3>
          <p className="mt-2 text-sm text-gray-500">
            Start taking quizzes from the Roadmap tab to see your progress here.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="py-6 space-y-6">
      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="text-sm text-gray-600 mb-1">Total Quizzes</div>
          <div className="text-3xl font-bold text-gray-900">{stats.totalQuizzes}</div>
        </div>
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="text-sm text-gray-600 mb-1">Average Score</div>
          <div className="text-3xl font-bold text-indigo-600">{stats.averageScore}%</div>
        </div>
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="text-sm text-gray-600 mb-1">Best Score</div>
          <div className="text-3xl font-bold text-green-600">{stats.bestScore}%</div>
        </div>
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="text-sm text-gray-600 mb-1">Topics Covered</div>
          <div className="text-3xl font-bold text-gray-900">{stats.totalTopicsCovered}</div>
        </div>
      </div>

      {/* Quiz Results List */}
      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Quiz History</h3>
        </div>
        <div className="divide-y divide-gray-200">
          {quizResults.map((result, index) => {
            const badge = getScoreBadge(result.percentage);
            return (
              <div key={result.id || index} className="px-6 py-4 hover:bg-gray-50 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <h4 className="font-medium text-gray-900">{result.topicName}</h4>
                      <span className={`text-xs px-2 py-1 rounded-full ${badge.color} text-white`}>
                        {badge.label}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
                      <span>
                        Score: {result.score}/{result.totalQuestions}
                      </span>
                      <span>
                        {new Date(result.completedAt).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </span>
                    </div>
                  </div>
                  <div className={`text-right`}>
                    <div className={`text-2xl font-bold ${getScoreColor(result.percentage).split(' ')[0]}`}>
                      {result.percentage}%
                    </div>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="mt-3 w-full bg-gray-200 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full transition-all duration-300 ${
                      result.percentage >= 80 ? 'bg-green-500' :
                      result.percentage >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                    }`}
                    style={{ width: `${result.percentage}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
