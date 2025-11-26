"use client"
import React, { useState } from 'react'
import TopicItem from './TopicItem'

interface Topic {
  topicName: string
  description: string
  videoSearchQuery: string
  testQuizPrompt: string
  completed?: boolean
}

interface Week {
  weekNumber: number
  weekTitle: string
  topics: Topic[]
}

interface WeeklyRoadmapProps {
  weeks: Week[]
  courseId: string
  onProgressChange?: () => void
}

const WeeklyRoadmap: React.FC<WeeklyRoadmapProps> = ({ weeks, courseId, onProgressChange }) => {
  const [openWeek, setOpenWeek] = useState<number | null>(null)

  const toggleWeek = (weekNumber: number) => {
    setOpenWeek(openWeek === weekNumber ? null : weekNumber)
  }

  return (
    <div className="space-y-3">
      {weeks.map((week) => (
        <div key={week.weekNumber} className="border border-gray-300 rounded-lg overflow-hidden">
          {/* Week Header */}
          <button
            onClick={() => toggleWeek(week.weekNumber)}
            className="w-full px-6 py-4 bg-white hover:bg-gray-50 flex items-center justify-between transition-colors"
          >
            <div className="flex items-center gap-3">
              <span className="text-sm font-medium text-gray-700">
                Week {week.weekNumber}:
              </span>
              <span className="text-sm text-gray-600">{week.weekTitle}</span>
            </div>
            <svg
              className={`w-5 h-5 text-gray-500 transition-transform ${
                openWeek === week.weekNumber ? 'rotate-180' : ''
              }`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {/* Topics Dropdown */}
          {openWeek === week.weekNumber && (
            <div className="border-t border-gray-300 bg-gray-50 p-4">
              <div className="space-y-4">
                {week.topics.map((topic, idx) => (
                  <TopicItem
                    key={idx}
                    topic={topic}
                    courseId={courseId}
                    weekNumber={week.weekNumber}
                    topicIndex={idx}
                    onProgressChange={onProgressChange}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  )
}

export default WeeklyRoadmap
