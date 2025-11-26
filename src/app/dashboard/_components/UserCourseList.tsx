"use client";
import { useUser } from "@clerk/nextjs";
import React, { useEffect, useState } from "react";
import CourseCard from "./CourseCard";
import { useUserCourseList } from "../../_context/UserCourseListContext";

const SkeletonCard = () => (
  <div className="animate-pulse flex flex-col gap-3 p-4 bg-gray-100 rounded shadow">
    <div className="h-32 bg-gray-300 rounded" />
    <div className="h-5 bg-gray-300 rounded w-3/4" />
    <div className="h-4 bg-gray-300 rounded w-1/2" />
  </div>
);

interface CourseOutput {
  CourseName?: string;
  Description?: string;
  Duration?: string;
  Level?: string;
  Chapters?: Array<any>;
}

interface Course {
  courseId: string;
  courseBanner: string;
  name: string;
  includeVideo?: string;
  level?: string;
  publish?: boolean;
  isPublished?: boolean;
  courseOutput?: CourseOutput;
}

const UserCourseList = () => {
  const { user } = useUser();
  const { userCourseList, setUserCourseList } = useUserCourseList();
  const [loading, setLoading] = useState(true);

  const fetchCourses = async () => {
    if (user && user.fullName) {
      setLoading(true);
      try {
        const res = await fetch(
          `/api/get-user-courses?fullName=${encodeURIComponent(user.fullName)}`
        );
        const data = await res.json();

        const normalizedCourses: Course[] = Array.isArray(data)
          ? data.map((c) => ({
            courseId: c.courseId ?? "",
            courseBanner: c.courseBanner ?? "",
            name: c.name ?? "",
            includeVideo: c.includeVideo,
            level: c.level,
            publish: c.publish,
            isPublished: c.isPublished,
            courseOutput: c.courseOutput ?? {},
          }))
          : [];

        setUserCourseList(normalizedCourses);
      } catch (error) {
        console.error("Error fetching courses:", error);
        setUserCourseList([]);
      } finally {
        setLoading(false);
      }
    } else {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCourses();
  }, [user, setUserCourseList]);

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6 text-violet-500">My Courses</h1>
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 3 }).map((_, idx) => (
            <SkeletonCard key={idx} />
          ))}
        </div>
      ) : userCourseList.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {userCourseList.map((course, idx) => (
            <CourseCard key={idx} course={course as any} refreshCourses={fetchCourses} />
          ))}
        </div>
      ) : (
        <p>No courses found.</p>
      )}
    </div>
  );
};

export default UserCourseList;
