"use client"

import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { HiTrash, HiPaperAirplane, HiHeart } from 'react-icons/hi';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

const WellnessChatbot = () => {
  const [sessionId] = useState(() => `wellness-${Date.now()}-${Math.random()}`);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  // Auto scroll to bottom when new messages arrive
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages]);

  // Welcome message on mount
  useEffect(() => {
    const welcomeMessage: Message = {
      role: 'assistant',
      content: "Hello! 😊 I'm here to listen and support you. How are you feeling today? Feel free to share what's on your mind.",
      timestamp: new Date()
    };
    setMessages([welcomeMessage]);
  }, []);

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;

    const userMessage: Message = {
      role: 'user',
      content: inputMessage,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    const formData = new FormData();
    formData.append('action', 'chat');
    formData.append('sessionId', sessionId);
    formData.append('message', inputMessage);

    try {
      const response = await fetch('/api/wellness-chat', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (data.success) {
        const assistantMessage: Message = {
          role: 'assistant',
          content: data.response,
          timestamp: new Date()
        };
        setMessages(prev => [...prev, assistantMessage]);
      } else {
        const errorMessage: Message = {
          role: 'assistant',
          content: "I'm having trouble connecting right now. Please try again in a moment.",
          timestamp: new Date()
        };
        setMessages(prev => [...prev, errorMessage]);
      }
    } catch (error) {
      console.error('Chat error:', error);
      const errorMessage: Message = {
        role: 'assistant',
        content: "I'm having trouble connecting right now. Please try again in a moment.",
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearSession = async () => {
    if (!confirm('Are you sure you want to start a new conversation?')) {
      return;
    }

    const formData = new FormData();
    formData.append('action', 'clear');
    formData.append('sessionId', sessionId);

    try {
      await fetch('/api/wellness-chat', {
        method: 'POST',
        body: formData,
      });

      const welcomeMessage: Message = {
        role: 'assistant',
        content: "Hello! 😊 I'm here to listen and support you. How are you feeling today?",
        timestamp: new Date()
      };
      setMessages([welcomeMessage]);
    } catch (error) {
      console.error('Clear error:', error);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="max-w-5xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-3">
          <div className="bg-gradient-to-r from-pink-400 to-purple-400 p-3 rounded-full">
            <HiHeart className="text-white text-3xl" />
          </div>
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-pink-500 to-purple-500 bg-clip-text text-transparent">
              Wellness Companion
            </h1>
            <p className="text-gray-600">A safe space to share your thoughts and feelings</p>
          </div>
        </div>
        
        {/* Supportive Info Card */}
        <Card className="p-4 bg-gradient-to-r from-pink-50 to-purple-50 border-pink-200">
          <p className="text-sm text-gray-700">
            💜 <strong>You're not alone.</strong> This is a safe, judgment-free space where you can express yourself. 
            I'm here to listen and support you.
          </p>
          <p className="text-xs text-gray-500 mt-2">
            ⚠️ If you're experiencing a crisis, please reach out to a trusted adult, parent, teacher, or counselor.
          </p>
        </Card>
      </div>

      {/* Chat Container */}
      <Card className="flex flex-col h-[550px] shadow-xl border-2 border-purple-100">
        {/* Messages Area */}
        <div
          ref={chatContainerRef}
          className="flex-1 overflow-y-auto p-6 space-y-4 bg-gradient-to-b from-purple-50/30 to-pink-50/30"
        >
          {messages.map((message, index) => (
            <div
              key={index}
              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[85%] p-4 rounded-2xl shadow-md ${
                  message.role === 'user'
                    ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white'
                    : 'bg-white text-gray-800 border-2 border-purple-100'
                }`}
              >
                <p className="whitespace-pre-wrap break-words leading-relaxed">{message.content}</p>
                <p
                  className={`text-xs mt-2 ${
                    message.role === 'user' ? 'text-purple-100' : 'text-gray-400'
                  }`}
                >
                  {message.timestamp.toLocaleTimeString()}
                </p>
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-white p-4 rounded-2xl border-2 border-purple-100 shadow-md">
                <p className="text-gray-500">💭 Thinking...</p>
              </div>
            </div>
          )}
        </div>

        {/* Input Area */}
        <div className="border-t-2 border-purple-100 p-4 bg-white">
          <div className="flex gap-2 mb-2">
            <Input
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Share what's on your mind..."
              disabled={isLoading}
              className="flex-1 border-2 border-purple-200 focus:ring-purple-400 focus:border-purple-400 rounded-xl text-base py-6"
            />
            <Button
              onClick={handleSendMessage}
              disabled={!inputMessage.trim() || isLoading}
              className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white px-8 py-6 rounded-xl disabled:bg-gray-300 shadow-lg"
            >
              <HiPaperAirplane className="text-xl" />
            </Button>
          </div>
          <div className="flex justify-between items-center">
            <p className="text-xs text-gray-500">
              Press Enter to send • Your conversation is private and secure
            </p>
            <Button
              onClick={handleClearSession}
              variant="ghost"
              size="sm"
              className="text-gray-400 hover:text-red-500"
            >
              <HiTrash className="mr-1" />
              New Chat
            </Button>
          </div>
        </div>
      </Card>

      {/* Footer Resources */}
      <div className="mt-4 text-center">
        <p className="text-xs text-gray-500">
          🌟 Remember: It's okay to not be okay. Taking care of your mental health is important.
        </p>
      </div>
    </div>
  );
};

export default WellnessChatbot;
