import { useState, useEffect, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/api';
import { useAuthCheck } from '../../hooks/useAuth';
import { ClockIcon, CheckIcon } from '@heroicons/react/24/outline';

interface ChatMessage {
  id?: number;
  content: string;
  createdAt: string;
  read: boolean;
  senderId: number;
}

interface ChatRoom {
  id: number;
  requestId: number;
  request: {
    title: string;
  };
  provider?: {
    id: number;
    name: string;
    avatar?: string;
  };
  client?: {
    id: number;
    name: string;
    avatar?: string;
  };
  lastMessage?: ChatMessage;
  unreadCount?: number;
}

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://mkt-backend-sz2s.onrender.com';
const WS_BASE_URL = API_BASE_URL.replace('http', 'ws');

export function ChatList() {
  const [chatRooms, setChatRooms] = useState<ChatRoom[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isAuthenticated = useAuthCheck();

  // TODO: Replace this with your actual user fetching logic (e.g., from context or props)
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  const cleanupWebSocket = useCallback(() => {
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }
  }, []);

  const setupWebSocket = useCallback(() => {
    cleanupWebSocket();

    const token = localStorage.getItem('token');
    if (!token || !isAuthenticated) return;

    const wsUrl = `${WS_BASE_URL}/api/chat/updates?token=${token}`;
    const ws = new WebSocket(wsUrl);

    ws.onopen = () => {
      console.log('Chat list WebSocket connected');
      setError(null);
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        
        if (data.type === 'new_message') {
          setChatRooms(prev => prev.map(room => {
            if (room.id === data.chatRoomId) {
              return {
                ...room,
                lastMessage: {
                  content: data.message.content,
                  createdAt: data.message.createdAt,
                  read: data.message.read || false,
                  senderId: data.message.senderId,
                },
                unreadCount: data.message.senderId !== data.userId 
                  ? (room.unreadCount || 0) + 1 
                  : room.unreadCount
              };
            }
            return room;
          }));
        }
      } catch (error) {
        console.error('Error parsing WebSocket message:', error);
      }
    };

    ws.onerror = (error) => {
      console.error('Chat list WebSocket error:', error);
      setError('Connection error');
    };

    ws.onclose = () => {
      console.log('Chat list WebSocket disconnected');
      if (isAuthenticated) {
        reconnectTimeoutRef.current = setTimeout(() => setupWebSocket(), 5000);
      }
    };

    wsRef.current = ws;
  }, [isAuthenticated, cleanupWebSocket]);

  const fetchChatRooms = useCallback(async () => {
    if (!isAuthenticated) return;

    try {
      setLoading(true);
      const response = await api.get('/api/chat');
      setChatRooms(response.data.map((room: ChatRoom) => ({
        ...room,
        unreadCount: room.lastMessage && 
                    !room.lastMessage.read && 
                    room.lastMessage.senderId !== room.client?.id ? 1 : 0
      })));
    } catch (error) {
      console.error('Error fetching chat rooms:', error);
      setError('Failed to load chats');
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (isAuthenticated) {
      fetchChatRooms();
      setupWebSocket();
    }

    return () => {
      cleanupWebSocket();
    };
  }, [isAuthenticated, fetchChatRooms, setupWebSocket, cleanupWebSocket]);

if (!isAuthenticated) {
  console.log('ChatList: User not authenticated');
 
  return null;
}

  if (loading) {
    return (
      <div className="p-4 flex justify-center items-center">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
        <span className="ml-2">Loading chats...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 text-center text-red-500">
        <p>{error}</p>
        <button 
          onClick={fetchChatRooms}
          className="mt-2 px-4 py-2 bg-blue-500 text-white rounded"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="border-r border-gray-200 h-full">
      <div className="p-4 border-b border-gray-200">
        <h2 className="text-lg font-medium">Messages</h2>
      </div>
      <div className="divide-y divide-gray-200">
        {chatRooms.length === 0 ? (
          <div className="p-4 text-center text-gray-500">
            <div className="text-4xl mb-2">💬</div>
            <p>No active chats</p>
            <p className="text-xs mt-1">Chat rooms will appear here when you start conversations</p>
          </div>
        ) : (
          chatRooms.map(room => {
            const otherParty = user?.role === 'service_provider' ? room.client : room.provider;
            
            return (
              <Link 
                key={room.id} 
                to={`/chat/${room.id}`}
                className="block p-4 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center">
                  <div className="relative">
                    <img
                      className="h-10 w-10 rounded-full object-cover"
                      src={otherParty?.avatar || '/default-avatar.png'}
                      alt={otherParty?.name || 'User'}
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = '/default-avatar.png';
                      }}
                    />
                    {(room.unreadCount || 0) > 0 && (
                      <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></div>
                    )}
                  </div>
                  
                  <div className="ml-3 flex-1 min-w-0">
                    <div className="flex justify-between items-center">
                      <h3 className="text-sm font-medium text-gray-900 truncate">
                        {otherParty?.name || 'Unknown User'}
                      </h3>
                      {room.lastMessage?.createdAt && (
                        <span className="text-xs text-gray-500 flex-shrink-0 ml-2">
                          {new Date(room.lastMessage.createdAt).toLocaleTimeString([], { 
                            hour: '2-digit', 
                            minute: '2-digit' 
                          })}
                        </span>
                      )}
                    </div>
                    
                    <p className="text-sm text-gray-500 truncate">
                      {room.request.title}
                    </p>
                    
                    <div className="flex items-center justify-between mt-1">
                      <p className="text-sm text-gray-600 truncate flex-1">
                        {room.lastMessage?.content || 'No messages yet'}
                      </p>
                      
                      <div className="flex items-center ml-2 flex-shrink-0">
                        {room.lastMessage?.read && room.lastMessage?.senderId === user?.userId && (
                          <CheckIcon className="h-4 w-4 text-blue-500" />
                        )}
                        
                        {(room.unreadCount || 0) > 0 && (
                          <span className="ml-1 inline-flex items-center justify-center w-5 h-5 text-xs font-medium text-white bg-blue-500 rounded-full">
                            {room.unreadCount}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            );
          })
        )}
      </div>
    </div>
  );
}