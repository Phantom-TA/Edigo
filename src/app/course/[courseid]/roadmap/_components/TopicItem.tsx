"use client"
import React, { useState, useEffect } from 'react'
import { useUser } from '@clerk/nextjs'
import QuizModal from './QuizModal'

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
  onProgressChange?: () => void
}

interface YouTubeVideo {
  videoId: string
  title: string
  description: string
  thumbnail: string
  channelTitle: string
}

const TopicItem: React.FC<TopicItemProps> = ({
  topic,
  courseId,
  weekNumber,
  topicIndex,
  onProgressChange
}) => {
  const { user } = useUser()
  const [completed, setCompleted] = useState(false)
  const [loading, setLoading] = useState(false)
  const [videos, setVideos] = useState<YouTubeVideo[]>([])
  const [videosLoading, setVideosLoading] = useState(false)
  const [showVideos, setShowVideos] = useState(false)
  const [showQuizModal, setShowQuizModal] = useState(false)

  useEffect(() => {
    // Load completion status from database
    const loadProgress = async () => {
      if (!user) return

      try {
        const response = await fetch(`/api/courses/progress?courseId=${courseId}`)
        if (response.ok) {
          const data = await response.json()
          const progressKey = `week_${weekNumber}_topic_${topicIndex}`
          setCompleted(data.progress[progressKey] || false)
        }
      } catch (error) {
        console.error('Error loading progress:', error)
      }
    }

    loadProgress()
  }, [courseId, weekNumber, topicIndex, user])

  const handleCheckboxChange = async () => {
    if (!user) {
      alert('Please sign in to track your progress')
      return
    }

    const newStatus = !completed
    setLoading(true)

    try {
      const response = await fetch('/api/courses/progress', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          courseId,
          weekNumber,
          topicIndex,
          completed: newStatus,
        }),
      })

      if (response.ok) {
        setCompleted(newStatus)
        // Notify parent to recalculate progress
        if (onProgressChange) {
          onProgressChange()
        }
      } else {
        alert('Failed to update progress')
      }
    } catch (error) {
      console.error('Error updating progress:', error)
      alert('Failed to update progress')
    } finally {
      setLoading(false)
    }
  }

  const fetchYouTubeVideos = async () => {
    if (videos.length > 0) {
      // Already fetched
      setShowVideos(!showVideos)
      return
    }

    setVideosLoading(true)
    setShowVideos(true)

    try {
      const response = await fetch(`/api/youtube/search?q=${encodeURIComponent(topic.videoSearchQuery)}`)
      const data = await response.json()

      if (data.videos && data.videos.length > 0) {
        setVideos(data.videos)
      } else if (data.searchUrl) {
        // Fallback: open YouTube search
        window.open(data.searchUrl, '_blank')
        setShowVideos(false)
      }
    } catch (error) {
      console.error('Error fetching videos:', error)
      // Fallback: open YouTube search
      const searchUrl = `https://www.youtube.com/results?search_query=${encodeURIComponent(topic.videoSearchQuery)}`
      window.open(searchUrl, '_blank')
      setShowVideos(false)
    } finally {
      setVideosLoading(false)
    }
  }

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4">
      <div className="flex items-start gap-3">
        {/* Checkbox */}
        <input
          type="checkbox"
          checked={completed}
          onChange={handleCheckboxChange}
          disabled={loading}
          className="mt-1 w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500 disabled:opacity-50"
        />

        <div className="flex-1">
          {/* Topic Name */}
          <h3 className={`font-medium text-gray-800 mb-2 ${completed ? 'line-through text-gray-500' : ''}`}>
            {topic.topicName}
          </h3>

          {/* Description */}
          <p className="text-sm text-gray-600 mb-3">{topic.description}</p>

          {/* Links */}
          <div className="flex flex-wrap gap-3">
            {/* Test Quiz Link */}
            <button
              onClick={() => setShowQuizModal(true)}
              className="px-4 py-2 text-sm border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
            >
              📝 Test Quiz
            </button>

            {/* Video Link */}
            <button
              onClick={fetchYouTubeVideos}
              disabled={videosLoading}
              className="px-4 py-2 text-sm border border-gray-300 rounded-md hover:bg-gray-50 transition-colors disabled:opacity-50"
            >
              {videosLoading ? '⏳ Loading...' : showVideos ? '▲ Hide Videos' : '🎥 Watch Videos'}
            </button>
          </div>

          {/* Embedded Videos */}
          {showVideos && videos.length > 0 && (
            <div className="mt-4 space-y-4">
              <h4 className="text-sm font-semibold text-gray-700">Recommended Videos:</h4>
              <div className="grid grid-cols-1 gap-4">
                {videos.map((video) => (
                  <div key={video.videoId} className="border border-gray-200 rounded-lg overflow-hidden">
                    {/* YouTube Embed */}
                    <div className="relative w-full" style={{ paddingBottom: '56.25%' }}>
                      <iframe
                        className="absolute top-0 left-0 w-full h-full"
                        src={`https://www.youtube.com/embed/${video.videoId}`}
                        title={video.title}
                        frameBorder="0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                      />
                    </div>
                    {/* Video Info */}
                    <div className="p-3 bg-gray-50">
                      <h5 className="text-sm font-medium text-gray-800 mb-1 line-clamp-2">
                        {video.title}
                      </h5>
                      <p className="text-xs text-gray-600">{video.channelTitle}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Quiz Modal */}
      <QuizModal
        isOpen={showQuizModal}
        onClose={() => setShowQuizModal(false)}
        topicName={topic.topicName}
        description={topic.description}
        courseId={courseId}
        weekNumber={weekNumber}
      />
    </div>
  )
}

export default TopicItem
