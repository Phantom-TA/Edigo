'use client';

import { useEffect, useState } from 'react';
import { useUser } from '@clerk/nextjs';

interface StudentProgressProps {
  courseId: string;
}

interface ExamScores {
  midSemScore: number | null;
  endSemScore: number | null;
}

export default function StudentProgress({ courseId }: StudentProgressProps) {
  const { user } = useUser();
  const [scores, setScores] = useState<ExamScores>({
    midSemScore: null,
    endSemScore: null,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchScores();
  }, [courseId]);

  const fetchScores = async () => {
    try {
      const response = await fetch(`/api/student/scores?courseId=${courseId}`);
      if (response.ok) {
        const data = await response.json();
        setScores(data);
      }
    } catch (error) {
      console.error('Error fetching scores:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateOverallProgress = () => {
    const scores_array = [
      scores.midSemScore,
      scores.endSemScore,
    ].filter((score) => score !== null) as number[];

    if (scores_array.length === 0) return 0;

    const avg = scores_array.reduce((sum, score) => sum + score, 0) / scores_array.length;
    return Math.round(avg);
  };

  const getScoreColor = (score: number | null) => {
    if (score === null) return 'text-gray-400';
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <p className="text-gray-500">Loading progress...</p>
      </div>
    );
  }

  const overallScore = calculateOverallProgress();

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
      <h3 className="text-xl font-bold text-gray-900 mb-4">Your Progress</h3>

      {/* Overall Score */}
      <div className="mb-6 p-4 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg">
        <div className="flex items-center justify-between">
          <span className="text-gray-700 font-medium">Overall Score</span>
          <span className={`text-3xl font-bold ${getScoreColor(overallScore)}`}>
            {overallScore}%
          </span>
        </div>
        <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-indigo-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${overallScore}%` }}
          ></div>
        </div>
      </div>

      {/* Individual Exam Scores */}
      <div className="grid grid-cols-2 gap-4">
        <ExamCard
          title="Mid-Sem"
          score={scores.midSemScore}
          maxScore={100}
          icon="📚"
        />
        <ExamCard
          title="End-Sem"
          score={scores.endSemScore}
          maxScore={100}
          icon="🎓"
        />
      </div>
    </div>
  );
}

interface ExamCardProps {
  title: string;
  score: number | null;
  maxScore: number;
  icon: string;
}

function ExamCard({ title, score, maxScore, icon }: ExamCardProps) {
  const getScoreColor = (score: number | null) => {
    if (score === null) return 'text-gray-400';
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between mb-2">
        <span className="text-2xl">{icon}</span>
        <span className="text-xs text-gray-500">/ {maxScore}</span>
      </div>
      <h4 className="text-sm font-semibold text-gray-700 mb-1">{title}</h4>
      <p className={`text-2xl font-bold ${getScoreColor(score)}`}>
        {score !== null ? score : '—'}
      </p>
      {score === null && (
        <p className="text-xs text-gray-400 mt-1">Not yet taken</p>
      )}
    </div>
  );
}
