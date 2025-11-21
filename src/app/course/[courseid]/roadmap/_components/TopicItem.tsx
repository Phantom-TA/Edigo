"use client"
import React, { useState, useEffect } from 'react'

interface Topic {
  topicName: string
  description: string
  videoSearchQuery: string
  testQuizPrompt: string
  completed?: boolean
}

interface TopicItemProps {
  topic: Topic
  courseId: string
  weekNumber: number
  topicIndex: number
}

const TopicItem: React.FC<TopicItemProps> = ({ topic, courseId, weekNumber, topicIndex }) => {
  const [completed, setCompleted] = useState(false)

  useEffect(() => {
    // Load completion status from localStorage on mount
    const storageKey = `course_${courseId}_week_${weekNumber}_topic_${topicIndex}`
    const saved = localStorage.getItem(storageKey)
    if (saved) {
      setCompleted(JSON.parse(saved))
    }
  }, [courseId, weekNumber, topicIndex])

  const handleCheckboxChange = () => {
    const newStatus = !completed
    setCompleted(newStatus)
    const storageKey = `course_${courseId}_week_${weekNumber}_topic_${topicIndex}`
    localStorage.setItem(storageKey, JSON.stringify(newStatus))
  }

  // Generate YouTube search URL
  const youtubeSearchUrl = `https://www.youtube.com/results?search_query=${encodeURIComponent(topic.videoSearchQuery)}`

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4">
      <div className="flex items-start gap-3">
        {/* Checkbox */}
        <input
          type="checkbox"
          checked={completed}
          onChange={handleCheckboxChange}
          className="mt-1 w-4 h-4 text-gray-600 border-gray-300 rounded focus:ring-gray-500"
        />

        <div className="flex-1">
          {/* Topic Name */}
          <h3 className="font-medium text-gray-800 mb-2">{topic.topicName}</h3>

          {/* Description */}
          <p className="text-sm text-gray-600 mb-3">{topic.description}</p>

          {/* Links */}
          <div className="flex flex-wrap gap-3">
            {/* Test Quiz Link */}
            <button
              onClick={() => alert(`Test Quiz: ${topic.testQuizPrompt}`)}
              className="px-4 py-2 text-sm border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
            >
              Test Quiz
            </button>

            {/* Video Link */}
            <a
              href={youtubeSearchUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2 text-sm border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
            >
              Video Link
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}

export default TopicItem
