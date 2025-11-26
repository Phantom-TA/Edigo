'use client';

import { useState } from 'react';

interface CoursePreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  course: {
    courseId: string;
    name: string;
    level?: string;
    courseBanner?: string;
    courseOutput?: {
      CourseName?: string;
      Description?: string;
      Duration?: string;
      Chapters?: Array<{ ChapterTitle: string }>;
    };
    username?: string;
  };
  onEnrollSuccess?: () => void;
}

export default function CoursePreviewModal({
  isOpen,
  onClose,
  course,
  onEnrollSuccess,
}: CoursePreviewModalProps) {
  const [enrolling, setEnrolling] = useState(false);

  if (!isOpen) return null;

  const handleEnroll = async () => {
    setEnrolling(true);
    try {
      const response = await fetch('/api/courses/enroll', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ courseId: course.courseId }),
      });

      const data = await response.json();

      if (response.ok) {
        alert(`Successfully enrolled in ${course.name}!`);
        onEnrollSuccess?.();
        onClose();
      } else {
        alert(data.error || 'Failed to enroll');
      }
    } catch (error) {
      console.error('Error enrolling:', error);
      alert('An error occurred while enrolling');
    } finally {
      setEnrolling(false);
    }
  };

  const chapters = course.courseOutput?.Chapters || [];
  const weekCount = Math.ceil(chapters.length / 3); // Rough estimate

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header with Image */}
        {course.courseBanner && (
          <div className="h-48 overflow-hidden rounded-t-xl">
            <img
              src={course.courseBanner}
              alt={course.name}
              className="w-full h-full object-cover"
            />
          </div>
        )}

        <div className="p-6">
          {/* Title */}
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            {course.courseOutput?.CourseName || course.name}
          </h2>

          {/* Level & Duration */}
          <div className="flex gap-4 mb-4">
            {course.level && (
              <span className="px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-sm font-semibold">
                {course.level}
              </span>
            )}
            {course.courseOutput?.Duration && (
              <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-semibold">
                {course.courseOutput.Duration}
              </span>
            )}
            {weekCount > 0 && (
              <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm font-semibold">
                ~{weekCount} weeks
              </span>
            )}
          </div>

          {/* Teacher */}
          {course.username && (
            <p className="text-gray-600 mb-4">
              <span className="font-semibold">Teacher:</span> {course.username}
            </p>
          )}

          {/* Description */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Course Description
            </h3>
            <p className="text-gray-700 leading-relaxed">
              {course.courseOutput?.Description ||
                'This course will help you master the fundamentals and advance your skills.'}
            </p>
          </div>

          {/* Topics Covered */}
          {chapters.length > 0 && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Topics Covered ({chapters.length} chapters)
              </h3>
              <ul className="space-y-1 max-h-40 overflow-y-auto">
                {chapters.slice(0, 10).map((chapter: any, idx: number) => (
                  <li key={idx} className="flex items-start gap-2 text-gray-700">
                    <span className="text-indigo-600 mt-1">•</span>
                    <span>{chapter.ChapterTitle || `Chapter ${idx + 1}`}</span>
                  </li>
                ))}
                {chapters.length > 10 && (
                  <li className="text-gray-500 italic">
                    + {chapters.length - 10} more chapters
                  </li>
                )}
              </ul>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 mt-6">
            <button
              onClick={handleEnroll}
              disabled={enrolling}
              className={`flex-1 px-6 py-3 rounded-lg font-semibold transition-colors ${
                enrolling
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-indigo-600 text-white hover:bg-indigo-700'
              }`}
            >
              {enrolling ? 'Enrolling...' : 'Confirm Enrollment'}
            </button>
            <button
              onClick={onClose}
              disabled={enrolling}
              className="px-6 py-3 border border-gray-300 rounded-lg font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
