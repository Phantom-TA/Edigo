"use client"

import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { HiUpload, HiTrash, HiPaperAirplane } from 'react-icons/hi';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

const PdfChatbot = () => {
  const [sessionId] = useState(() => `session-${Date.now()}-${Math.random()}`);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [pdfUploaded, setPdfUploaded] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  // Auto scroll to bottom when new messages arrive
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type === 'application/pdf') {
      setPdfFile(file);
    } else {
      alert('Please select a valid PDF file');
    }
  };

  const handleUploadPdf = async () => {
    if (!pdfFile) return;

    setIsUploading(true);
    const formData = new FormData();
    formData.append('action', 'upload');
    formData.append('sessionId', sessionId);
    formData.append('pdf', pdfFile);

    try {
      const response = await fetch('/api/pdf-chat', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (data.success) {
        setPdfUploaded(true);
        setMessages([{
          role: 'assistant',
          content: `PDF uploaded successfully! (${data.pages} pages). You can now ask me questions about the document.`,
          timestamp: new Date()
        }]);
      } else {
        alert(data.error || 'Failed to upload PDF');
      }
    } catch (error) {
      console.error('Upload error:', error);
      alert('Failed to upload PDF');
    } finally {
      setIsUploading(false);
    }
  };

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
      const response = await fetch('/api/pdf-chat', {
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
    if (!confirm('Are you sure you want to clear the current session? This will remove the PDF and chat history.')) {
      return;
    }

    const formData = new FormData();
    formData.append('action', 'clear');
    formData.append('sessionId', sessionId);

    try {
      await fetch('/api/pdf-chat', {
        method: 'POST',
        body: formData,
      });

      setPdfFile(null);
      setPdfUploaded(false);
      setMessages([]);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
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
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-violet-700 mb-2">AI Chatbot</h1>
        <p className="text-gray-600">Chat with AI or upload a PDF to ask questions about it</p>
      </div>

      {/* PDF Upload Section - Always visible */}
      <Card className="p-6 mb-6 bg-gradient-to-r from-violet-50 to-purple-50 border-violet-200">
        <h2 className="text-xl font-semibold text-violet-700 mb-4">
          {pdfUploaded ? 'PDF Loaded' : 'Upload PDF (Optional)'}
        </h2>
        {!pdfUploaded ? (
          <div className="flex flex-col md:flex-row gap-4 items-center">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept=".pdf"
              className="flex-1 p-2 border border-violet-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500"
            />
            <Button
              onClick={handleUploadPdf}
              disabled={!pdfFile || isUploading}
              className="bg-violet-600 hover:bg-violet-700 text-white px-6 py-2 disabled:bg-gray-300"
            >
              <HiUpload className="mr-2" />
              {isUploading ? 'Uploading...' : 'Upload PDF'}
            </Button>
          </div>
        ) : (
          <div className="flex justify-between items-center">
            <div>
              <p className="text-sm text-violet-700 font-medium">PDF Loaded: {pdfFile?.name}</p>
              <p className="text-xs text-gray-500">You can now ask questions about the PDF</p>
            </div>
            <Button
              onClick={handleClearSession}
              variant="outline"
              className="border-red-300 text-red-600 hover:bg-red-50"
            >
              <HiTrash className="mr-2" />
              Remove PDF
            </Button>
          </div>
        )}
        {pdfFile && !pdfUploaded && (
          <p className="mt-2 text-sm text-violet-600">Selected: {pdfFile.name}</p>
        )}
      </Card>

      {/* Chat Container - Always visible */}
      <Card className="flex flex-col h-[600px]">
        {/* Messages Area */}
        <div
          ref={chatContainerRef}
          className="flex-1 overflow-y-auto p-6 space-y-4"
        >
          {messages.length === 0 && (
            <div className="flex items-center justify-center h-full text-gray-400">
              <div className="text-center">
                <p className="text-lg mb-2">Start a conversation!</p>
                <p className="text-sm">You can chat normally or upload a PDF to ask questions about it.</p>
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
                placeholder={pdfUploaded ? "Ask a question about the PDF..." : "Type your message..."}
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

export default PdfChatbot;
