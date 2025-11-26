"use client"

import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { HiTrash, HiPaperAirplane } from 'react-icons/hi';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

const AiChatbot = () => {
  const [sessionId] = useState(() => `session-${Date.now()}-${Math.random()}`);
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
      const response = await fetch('/api/ai-chat', {
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
        alert(data.error || 'Failed to get response');
      }
    } catch (error) {
      console.error('Chat error:', error);
      alert('Failed to send message');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearSession = async () => {
    if (!confirm('Are you sure you want to clear the chat history?')) {
      return;
    }

    const formData = new FormData();
    formData.append('action', 'clear');
    formData.append('sessionId', sessionId);

    try {
      await fetch('/api/ai-chat', {
        method: 'POST',
        body: formData,
      });

      setMessages([]);
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
    <div className="max-w-6xl mx-auto">
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-violet-700 mb-2">AI Chatbot</h1>
          <p className="text-gray-600">Ask me anything!</p>
        </div>
        {messages.length > 0 && (
          <Button
            onClick={handleClearSession}
            variant="outline"
            className="border-red-300 text-red-600 hover:bg-red-50"
          >
            <HiTrash className="mr-2" />
            Clear Chat
          </Button>
        )}
      </div>

      {/* Chat Container */}
      <Card className="flex flex-col h-[600px]">
        {/* Messages Area */}
        <div
          ref={chatContainerRef}
          className="flex-1 overflow-y-auto p-6 space-y-4"
        >
          {messages.length === 0 && (
            <div className="flex items-center justify-center h-full text-gray-400">
              <div className="text-center">
                <p className="text-lg mb-2">👋 Hello! I'm your AI assistant</p>
                <p className="text-sm">Start a conversation by typing a message below</p>
              </div>
            </div>
          )}
          {messages.map((message, index) => (
            <div
              key={index}
              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[80%] p-4 rounded-lg ${
                  message.role === 'user'
                    ? 'bg-violet-600 text-white'
                    : 'bg-gray-100 text-gray-800'
                }`}
              >
                <p className="whitespace-pre-wrap break-words">{message.content}</p>
                <p
                  className={`text-xs mt-2 ${
                    message.role === 'user' ? 'text-violet-200' : 'text-gray-500'
                  }`}
                >
                  {message.timestamp.toLocaleTimeString()}
                </p>
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-gray-100 p-4 rounded-lg">
                <p className="text-gray-500">AI is typing...</p>
              </div>
            </div>
          )}
        </div>

        {/* Input Area */}
        <div className="border-t p-4">
          <div className="flex gap-2">
            <Input
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type your message..."
              disabled={isLoading}
              className="flex-1 border-violet-300 focus:ring-violet-500"
            />
            <Button
              onClick={handleSendMessage}
              disabled={!inputMessage.trim() || isLoading}
              className="bg-violet-600 hover:bg-violet-700 text-white px-6 disabled:bg-gray-300"
            >
              <HiPaperAirplane />
            </Button>
          </div>
          <p className="text-xs text-gray-500 mt-2">
            Press Enter to send • Chat history is maintained during this session
          </p>
        </div>
      </Card>
    </div>
  );
};

export default AiChatbot;
