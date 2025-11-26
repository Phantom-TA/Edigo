"use client"
import React from 'react'
import { useUser } from '@clerk/nextjs'

interface Message {
  id: number
  courseId: string
  message: string
  createdAt: Date | string
  isRead: boolean
  senderId: number
  senderName: string | null
  senderImage: string | null
}

interface MessageListProps {
  messages: Message[]
  currentUserId: number | null
}

const MessageList = ({ messages, currentUserId }: MessageListProps) => {
  const { user } = useUser()

  const formatTime = (date: Date | string) => {
    const d = new Date(date)
    const hours = d.getHours().toString().padStart(2, '0')
    const minutes = d.getMinutes().toString().padStart(2, '0')
    return `${hours}:${minutes}`
  }

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-4">
      {messages.length === 0 ? (
        <div className="flex items-center justify-center h-full text-gray-500">
          <p>No messages yet. Start the conversation!</p>
        </div>
      ) : (
        messages.map((message) => {
          const isOwnMessage = message.senderId === currentUserId
          return (
            <div
              key={message.id}
              className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[75%] ${
                  isOwnMessage
                    ? 'bg-indigo-600 text-white'
                    : 'bg-gray-200 text-gray-800'
                } rounded-lg p-3`}
              >
                {!isOwnMessage && (
                  <div className="flex items-center gap-2 mb-1">
                    {message.senderImage ? (
                      <img
                        src={message.senderImage}
                        alt={message.senderName || 'User'}
                        className="w-6 h-6 rounded-full"
                      />
                    ) : (
                      <div className="w-6 h-6 rounded-full bg-gray-400 flex items-center justify-center text-white text-xs">
                        {message.senderName?.[0] || 'U'}
                      </div>
                    )}
                    <span className="text-xs font-semibold">
                      {message.senderName || 'Unknown User'}
                    </span>
                  </div>
                )}
                <p className="text-sm break-words whitespace-pre-wrap">
                  {message.message}
                </p>
                <p
                  className={`text-xs mt-1 ${
                    isOwnMessage ? 'text-indigo-200' : 'text-gray-500'
                  }`}
                >
                  {formatTime(message.createdAt)}
                </p>
              </div>
            </div>
          )
        })
      )}
    </div>
  )
}

export default MessageList
