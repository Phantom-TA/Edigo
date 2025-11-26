'use client';

import { useState } from 'react';

interface EnrollButtonProps {
  courseId: string;
  courseName: string;
  onEnrollSuccess?: () => void;
  onOpenPreview?: () => void;
}

export default function EnrollButton({
  courseId,
  courseName,
  onEnrollSuccess,
  onOpenPreview,
}: EnrollButtonProps) {
  const [loading, setLoading] = useState(false);
  const [enrolled, setEnrolled] = useState(false);

  const handleEnroll = async () => {
    // If preview modal exists, open it instead of direct enrollment
    if (onOpenPreview) {
      onOpenPreview();
      return;
    }

    // Direct enrollment
    setLoading(true);
    try {
      const response = await fetch('/api/courses/enroll', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ courseId }),
      });

      const data = await response.json();

      if (response.ok) {
        setEnrolled(true);
        alert(`Successfully enrolled in ${courseName}!`);
        onEnrollSuccess?.();
      } else {
        alert(data.error || 'Failed to enroll');
      }
    } catch (error) {
      console.error('Error enrolling:', error);
      alert('An error occurred while enrolling');
    } finally {
      setLoading(false);
    }
  };

  if (enrolled) {
    return (
      <button
        disabled
        className="w-full px-4 py-2 bg-green-100 text-green-700 rounded-lg font-semibold cursor-not-allowed"
      >
        ✓ Enrolled
      </button>
    );
  }

  return (
    <button
      onClick={handleEnroll}
      disabled={loading}
      className={`w-full px-4 py-2 rounded-lg font-semibold transition-colors ${
        loading
          ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
          : 'bg-indigo-600 text-white hover:bg-indigo-700'
      }`}
    >
      {loading ? 'Enrolling...' : 'Enroll Now'}
    </button>
  );
}
