import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/api';
import { useAuth } from '../../context/AuthContext';
import { ClockIcon, CheckIcon } from '@heroicons/react/24/outline';

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
  lastMessage?: {
    content: string;
    createdAt: string;
    read: boolean;
    senderId: number;
  };
}

export function ChatList() {
  const [chatRooms, setChatRooms] = useState<ChatRoom[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    const fetchChatRooms = async () => {
      try {
        const response = await api.get('/api/chat');
        setChatRooms(response.data);
      } catch (error) {
        console.error('Error fetching chat rooms:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchChatRooms();
  }, []);

  if (loading) {
    return <div className="p-4">Loading chats...</div>;
  }

  return (
    <div className="border-r border-gray-200 h-full">
      <div className="p-4 border-b border-gray-200">
        <h2 className="text-lg font-medium">Messages</h2>
      </div>
      <div className="divide-y divide-gray-200">
        {chatRooms.length === 0 ? (
          <div className="p-4 text-center text-gray-500">
            No active chats
          </div>
        ) : (
          chatRooms.map(room => (
            <Link 
              key={room.id} 
              to={`/chat/${room.id}`}
              className="block p-4 hover:bg-gray-50"
            >
              <div className="flex items-center">
                <img
                  className="h-10 w-10 rounded-full"
                  src={user?.role === 'service_provider' 
                    ? room.client?.avatar || '/default-avatar.png'
                    : room.provider?.avatar || '/default-avatar.png'
                  }
                  alt={user?.role === 'service_provider' 
                    ? room.client?.name
                    : room.provider?.name
                  }
                />
                <div className="ml-3 flex-1">
                  <div className="flex justify-between">
                    <h3 className="text-sm font-medium">
                      {user?.role === 'service_provider' 
                        ? room.client?.name
                        : room.provider?.name
                      }
                    </h3>
                    <span className="text-xs text-gray-500">
{room.lastMessage?.createdAt
  ? new Date(room.lastMessage.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  : null}

                    </span>
                  </div>
                  <p className="text-sm text-gray-500 truncate">
                    {room.request.title}
                  </p>
                  <div className="flex items-center mt-1">
                    <p className="text-sm text-gray-600 truncate flex-1">
                      {room.lastMessage?.content}
                    </p>
                    {room.lastMessage && !room.lastMessage.read && room.lastMessage.senderId !== user?.userId && (
                      <span className="ml-2 inline-block h-2 w-2 rounded-full bg-blue-500"></span>
                    )}
                  </div>
                </div>
              </div>
            </Link>
          ))
        )}
      </div>
    </div>
  );
}
