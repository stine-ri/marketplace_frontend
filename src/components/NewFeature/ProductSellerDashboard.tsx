// ProductSellerDashboard.tsx
import { useState, useEffect, useCallback } from 'react';
import { Navigate } from 'react-router-dom';
import api from '../../api/api';
import { BellIcon, ArrowPathIcon } from '@heroicons/react/24/outline';
import { useAuth } from '../../context/AuthContext';
import { ProductManagementSection } from '../NewFeature/ProductManagementSection';
import { useNavigate } from 'react-router-dom';
import useWebSocket from '../../hooks/useWebSocket';
import { toast } from 'react-toastify';

interface ChatRoom {
  id: number;
  clientId: number;
  providerId: number;
  requestId: number;
  client?: any;
  provider?: any;
  request?: any;
  lastMessage?: any;
  unreadCount?: number;
  fromInterest?: boolean;
}

export function ProductSellerDashboard() {
  const [activeTab, setActiveTab] = useState<'products' | 'chat'>('products');
  const [chatRooms, setChatRooms] = useState<ChatRoom[]>([]);
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { notifications, unreadCount } = useWebSocket();
  const [showNotifications, setShowNotifications] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const fetchChatRooms = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        toast.error("Please log in to access chat");
        return;
      }

      const response = await api.get('/api/chat', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      const enhancedRooms = response.data.map((room: any) => ({
        ...room,
        otherParty: room.clientId === user?.userId ? room.provider : room.client,
        lastMessage: room.messages?.[0] || null,
        unreadCount: room.unreadCount || 0
      }));

      setChatRooms(enhancedRooms);
    } catch (error) {
      console.error('Error fetching chat rooms:', error);
      toast.error('Failed to load chat rooms');
    }
  }, [user?.userId]);

  const handleRefresh = async () => {
    try {
      setRefreshing(true);
      if (activeTab === 'chat') {
        await fetchChatRooms();
      }
    } catch (error) {
      console.error('Refresh failed:', error);
      toast.error('Failed to refresh data');
    } finally {
      setRefreshing(false);
    }
  };

  const getDisplayName = (party: any): string => {
    if (!party) return 'Unknown';
    
    if (party.fullName) {
      return party.fullName;
    }
    
    if (party.firstName && party.lastName) {
      return `${party.firstName} ${party.lastName}`;
    }
    
    if (party.name) {
      return party.name;
    }
    
    return 'User';
  };

  const getAvatarUrl = (party: any): string | undefined => {
    if (!party) return undefined;
    
    return party.avatar || party.profileImageUrl;
  };

  if (!user || (user.role !== 'service_provider' && user.role !== 'product_seller')) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-3 py-3 sm:px-4 sm:py-4 lg:px-6 lg:py-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 sm:gap-0">
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900">Product Seller Dashboard</h1>
          <div className="flex items-center justify-end sm:justify-normal space-x-2 sm:space-x-3 w-full sm:w-auto">
            <button 
              onClick={handleRefresh}
              disabled={refreshing}
              className={`p-1 sm:p-2 rounded-full hover:bg-gray-100 transition-colors ${
                refreshing ? 'bg-gray-100' : ''
              }`}
              title="Refresh"
            >
              <ArrowPathIcon className={`h-4 w-4 sm:h-5 sm:w-5 ${
                refreshing ? 'text-blue-500 animate-spin' : 'text-gray-600'
              }`} />
            </button>
            
            <div className="relative">
              <button 
                onClick={() => setShowNotifications(!showNotifications)}
                className="p-1 sm:p-2 rounded-full hover:bg-gray-100"
              >
                <BellIcon className="h-4 w-4 sm:h-5 sm:w-5 text-gray-600" />
                {unreadCount > 0 && (
                  <span className="absolute top-0 right-0 h-2 w-2 sm:h-3 sm:w-3 bg-red-500 rounded-full"></span>
                )}
              </button>
              
              {showNotifications && (
                <div className="absolute right-0 mt-2 w-64 sm:w-72 bg-white rounded-md shadow-lg overflow-hidden z-10">
                  <div className="py-1">
                    {notifications.length === 0 ? (
                      <div className="px-3 py-2 text-xs sm:text-sm text-gray-700">No notifications</div>
                    ) : (
                      notifications.map(notification => (
                        <div 
                          key={notification.id} 
                          className={`px-3 py-2 text-xs sm:text-sm ${!notification.isRead ? 'bg-blue-50' : ''}`}
                        >
                          <p className="font-medium">{notification.title}</p>
                          <p className="text-gray-600">{notification.message}</p>
                          <p className="text-xxs sm:text-xs text-gray-500 mt-1">
                            {new Date(notification.createdAt).toLocaleString()}
                          </p>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>
            
            <button
              onClick={logout}
              className="text-xs sm:text-sm text-red-600 hover:text-red-800 px-2 py-1 sm:px-3 sm:py-1.5 lg:px-4 lg:py-2 rounded hover:bg-red-50"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-2 sm:px-4 py-3 sm:py-4 lg:px-6 lg:py-6">
        <div className="border-b border-gray-200 mb-3 sm:mb-6 overflow-x-auto">
          <nav className="-mb-px flex space-x-1 sm:space-x-2 md:space-x-4 lg:space-x-8 min-w-max">
            <button
              onClick={() => setActiveTab('products')}
              className={`${activeTab === 'products' ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
            >
              My Products
            </button>
            <button
              onClick={() => {
                setActiveTab('chat');
                fetchChatRooms();
              }}
              className={`${activeTab === 'chat' ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'} whitespace-nowrap py-2 px-1 sm:py-3 sm:px-2 border-b-2 font-medium text-xs sm:text-sm`}
            >
              Messages ({chatRooms.filter(r => (r.unreadCount ?? 0) > 0).length})
            </button>
          </nav>
        </div>

        {activeTab === 'products' && <ProductManagementSection />}

        {activeTab === 'chat' && (
          <div className="space-y-4">
            {chatRooms.length === 0 ? (
              <div className="text-center py-8 bg-white rounded-lg shadow">
                <div className="text-gray-400 text-lg mb-2">💬</div>
                <h3 className="text-lg font-medium text-gray-900">No conversations yet</h3>
                <p className="text-sm text-gray-500">
                  Chat rooms will appear here when clients contact you about your products.
                </p>
              </div>
            ) : (
              <div className="grid gap-4">
                {chatRooms.map(room => {
                  const isProvider = room.providerId === user?.userId;
                  const otherParty = isProvider ? room.client : room.provider;
                  const isInterestRoom = room.fromInterest;
                  
                  return (
                    <div 
                      key={room.id}
                      className="bg-white rounded-lg shadow p-4 hover:shadow-md transition-shadow cursor-pointer"
                      onClick={() => navigate(`/chat/${room.id}`)}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
                              {getAvatarUrl(otherParty) ? (
                                <img 
                                  src={getAvatarUrl(otherParty)} 
                                  alt={getDisplayName(otherParty)}
                                  className="w-10 h-10 rounded-full object-cover"
                                />
                              ) : (
                                <span className="text-sm font-medium text-gray-600">
                                  {getDisplayName(otherParty)?.charAt(0) || '?'}
                                </span>
                              )}
                            </div>
                            <div>
                              <h3 className="font-medium text-gray-900">
                                {getDisplayName(otherParty) || 'Client'}
                                {isInterestRoom && (
                                  <span className="ml-2 px-2 py-0.5 text-xs bg-green-100 text-green-800 rounded-full">
                                    From Interest
                                  </span>
                                )}
                              </h3>
                              <p className="text-sm text-gray-500">
                                {room.request?.productName || `Product Inquiry`}
                              </p>
                            </div>
                          </div>
                          
                          {room.lastMessage && (
                            <div className="text-sm text-gray-600">
                              <p className="truncate">
                                {room.lastMessage.content}
                              </p>
                              <p className="text-xs text-gray-400 mt-1">
                                {new Date(room.lastMessage.createdAt).toLocaleString()}
                              </p>
                            </div>
                          )}
                        </div>
                        
                        <div className="text-right">
                          {(room.unreadCount ?? 0) > 0 && (
                            <span className="inline-flex items-center justify-center w-6 h-6 text-xs font-medium text-white bg-red-500 rounded-full">
                              {room.unreadCount}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}