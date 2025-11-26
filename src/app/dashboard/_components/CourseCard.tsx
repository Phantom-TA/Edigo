"use client"
import Image from 'next/image'
import Link from 'next/link';
import React, { useState } from 'react'
import { PublishCourse } from '@/app/create-course/action';

interface Course {
  courseId: string;
  courseBanner: string;
  name: string;
  publish?: boolean;
  isPublished?: boolean;
  courseOutput: {
    Duration?: string;
    // add other properties as needed
  };
}

const CourseCard = ({ course, refreshCourses }: { course: Course; refreshCourses?: () => void }) => {
  const [isPublished, setIsPublished] = useState(course.publish || course.isPublished || false);
  const [isUpdating, setIsUpdating] = useState(false);

  // Check if this is a simple course (has weeks property) or old course format
  const courseOutput = course.courseOutput as any
  const isSimpleCourse = courseOutput?.weeks !== undefined
  const courseUrl = isSimpleCourse
    ? `/course/${course.courseId}/roadmap`
    : `/course/${course.courseId}`

  const handlePublishToggle = async (e: React.MouseEvent) => {
    e.preventDefault(); // Prevent navigation
    e.stopPropagation();

    setIsUpdating(true);
    try {
      const newPublishStatus = !isPublished;
      const success = await PublishCourse(course.courseId, newPublishStatus);

      if (success) {
        setIsPublished(newPublishStatus);
        alert(newPublishStatus ? 'Course published successfully! Students can now enroll.' : 'Course unpublished successfully.');
        if (refreshCourses) refreshCourses();
      } else {
        alert('Failed to update course status');
      }
    } catch (error) {
      console.error('Error toggling publish status:', error);
      alert('An error occurred');
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="bg-violet-50 border border-violet-200 rounded-lg shadow-md overflow-hidden flex flex-col transition-transform duration-300 hover:scale-105">
      <Link href={courseUrl}>
        <div className="cursor-pointer">
          {/* Banner/Header Section */}
          <div className="h-40 bg-gradient-to-br from-indigo-500 to-purple-600 overflow-hidden flex items-center justify-center">
            {course.courseBanner ? (
              <Image alt="Topic Image" src={course.courseBanner} width={300} height={160} className="w-full h-full object-cover" />
            ) : (
              <span className="text-white text-4xl font-bold">{course.name.charAt(0)}</span>
            )}
          </div>
          <div className="p-4 flex-1 flex flex-col">
            <h2 className="text-lg font-semibold mb-2 text-violet-700">{course.name}</h2>
            <p className="text-sm text-violet-500 mb-2">Duration: {courseOutput?.Duration || courseOutput?.duration || 'N/A'}</p>
          </div>
        </div>
      </Link>

      {/* Publish/Unpublish Button */}
      <div className="px-4 pb-4">
        <button
          onClick={handlePublishToggle}
          disabled={isUpdating}
          className={`w-full px-4 py-2 rounded-lg font-semibold transition-colors ${
            isPublished
              ? 'bg-green-600 hover:bg-green-700 text-white'
              : 'bg-gray-400 hover:bg-gray-500 text-white'
          } ${isUpdating ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          {isUpdating ? 'Updating...' : isPublished ? '✓ Published' : 'Publish Course'}
        </button>
        {isPublished && (
          <p className="text-xs text-green-600 mt-1 text-center">
            Visible to students
          </p>
        )}
      </div>
    </div>
  );
}

export default CourseCard