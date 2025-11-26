"use client"
import React, { useState } from 'react'
import { MessageCircle, X } from 'lucide-react'
import ChatPanel from './ChatPanel'

interface ChatBotProps {
  courseId: string
}

const ChatBot = ({ courseId }: ChatBotProps) => {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <>
      {/* Floating Chat Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 z-50 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full p-4 shadow-lg transition-all duration-300 flex items-center gap-2 group"
          aria-label="Open chat"
        >
          <MessageCircle size={24} />
          <span className="hidden group-hover:inline-block text-sm font-semibold mr-1">
            ClassBot
          </span>
        </button>
      )}

      {/* Chat Panel */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 z-50 w-96 h-[600px] bg-white rounded-lg shadow-2xl flex flex-col">
          {/* Chat Header */}
          <div className="bg-indigo-600 text-white p-4 rounded-t-lg flex justify-between items-center">
            <div className="flex items-center gap-2">
              <MessageCircle size={20} />
              <h3 className="font-bold text-lg">ClassBot</h3>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="hover:bg-indigo-700 rounded-full p-1 transition-colors"
              aria-label="Close chat"
            >
              <X size={20} />
            </button>
          </div>

          {/* Chat Content */}
          <ChatPanel courseId={courseId} />
        </div>
      )}
    </>
  )
}

export default ChatBot
