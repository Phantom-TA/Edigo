"use client"
import React, { useState, useEffect, useRef } from 'react'
import { useUser } from '@clerk/nextjs'
import { Send, Loader2 } from 'lucide-react'
import MessageList from './MessageList'
import { io, Socket } from 'socket.io-client'

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

interface ChatPanelProps {
  courseId: string
}

let socket: Socket | null = null;

const ChatPanel = ({ courseId }: ChatPanelProps) => {
  const { user } = useUser()
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [currentUserId, setCurrentUserId] = useState<number | null>(null)
  const [currentUserProfile, setCurrentUserProfile] = useState<{
    id: number;
    fullName: string | null;
    profileImage: string | null;
  } | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const [connected, setConnected] = useState(false)

  // Fetch current user's database profile
  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const userResponse = await fetch('/api/user/profile')
        if (userResponse.ok) {
          const userData = await userResponse.json()
          setCurrentUserId(userData.id)
          setCurrentUserProfile({
            id: userData.id,
            fullName: userData.fullName,
            profileImage: userData.profileImage,
          })
        }
      } catch (error) {
        console.error('Error fetching user profile:', error)
      }
    }

    if (user) {
      fetchUserProfile()
    }
  }, [user])

  // Initialize Socket.IO connection
  useEffect(() => {
    const initSocket = () => {
      const socketUrl = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:3000';

      socket = io(socketUrl, {
        path: '/socket.io',
        transports: ['websocket', 'polling'],
      });

      socket.on('connect', () => {
        console.log('✅ Connected to Socket.IO server:', socket?.id);
        setConnected(true);

        // Join the course room
        if (courseId) {
          socket?.emit('join-course', courseId);
        }
      });

      socket.on('disconnect', () => {
        console.log('❌ Disconnected from Socket.IO server');
        setConnected(false);
      });

      socket.on('connect_error', (error) => {
        console.error('Connection error:', error);
        setConnected(false);
      });

      // Listen for new messages
      socket.on('new-message', (message: Message) => {
        console.log('📩 Received new message:', message);
        setMessages((prev) => {
          // Avoid duplicates
          const exists = prev.some((m) => m.id === message.id);
          if (exists) return prev;
          return [...prev, message];
        });
      });

      // Listen for user joined
      socket.on('user-joined', (data) => {
        console.log('👋 User joined:', data);
      });
    };

    if (!socket && courseId) {
      initSocket();
    }

    return () => {
      if (socket) {
        socket.emit('leave-course', courseId);
        socket.disconnect();
        socket = null;
      }
    };
  }, [courseId]);

  // Fetch initial messages
  useEffect(() => {
    const fetchMessages = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/chat/get-messages?courseId=${courseId}`);
        if (response.ok) {
          const data = await response.json();
          setMessages(data.messages || []);
        }
      } catch (error) {
        console.error('Error fetching messages:', error);
      } finally {
        setLoading(false);
      }
    };

    if (courseId) {
      fetchMessages();
    }
  }, [courseId]);

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newMessage.trim() || !currentUserProfile) return;

    try {
      setSending(true);

      // Save to database first
      const response = await fetch('/api/chat/send-message', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          courseId,
          message: newMessage.trim(),
        }),
      });

      if (response.ok) {
        // Send via Socket.IO
        if (socket && connected) {
          socket.emit('send-message', {
            courseId,
            message: newMessage.trim(),
            senderId: currentUserProfile.id,
            senderName: currentUserProfile.fullName,
            senderImage: currentUserProfile.profileImage,
          });
        }

        setNewMessage('');
      } else {
        const error = await response.json();
        console.error('Failed to send message:', error);
        alert('Failed to send message. Please try again.');
      }
    } catch (error) {
      console.error('Error sending message:', error);
      alert('Failed to send message. Please try again.');
    } finally {
      setSending(false);
    }
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <Loader2 className="animate-spin text-indigo-600" size={32} />
      </div>
    );
  }

  return (
    <>
      {/* Connection Status */}
      {!connected && (
        <div className="px-4 py-2 bg-yellow-50 border-b border-yellow-200 text-yellow-800 text-sm">
          ⚠️ Connecting to chat server...
        </div>
      )}

      {/* Messages */}
      <MessageList messages={messages} currentUserId={currentUserId} />
      <div ref={messagesEndRef} />

      {/* Message Input */}
      <form onSubmit={handleSendMessage} className="p-4 border-t bg-gray-50">
        <div className="flex gap-2">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type a message..."
            className="flex-1 px-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-indigo-500"
            disabled={sending || !connected}
          />
          <button
            type="submit"
            disabled={sending || !newMessage.trim() || !connected}
            className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-full p-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {sending ? (
              <Loader2 className="animate-spin" size={20} />
            ) : (
              <Send size={20} />
            )}
          </button>
        </div>
      </form>
    </>
  );
};

export default ChatPanel;
