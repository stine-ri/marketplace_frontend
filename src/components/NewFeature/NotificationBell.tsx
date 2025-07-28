// src/components/NotificationBell.tsx
import { useState, useEffect } from 'react';
import { Notification } from '../../types/types';
import useNotifications from '../../hooks/useNotification';
import { useNavigate } from 'react-router-dom';

export default function NotificationBell({ userId }: { userId?: number }) {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();
  const {
    notifications,
    markAsRead,
    markAllAsRead,
    unreadCount,
    isLoading,
    error
  } = useNotifications(userId);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = () => {
      if (isOpen) setIsOpen(false);
    };
    
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [isOpen]);

  const handleNotificationClick = (notification: Notification) => {
    markAsRead(notification.id);
    if (notification.link) {
      navigate(notification.link);
    }
    setIsOpen(false);
  };

  return (
    <div className="relative">
      <button 
        onClick={(e) => {
          e.stopPropagation();
          setIsOpen(!isOpen);
        }}
        className="p-2 rounded-full hover:bg-gray-100 relative"
        aria-label="Notifications"
      >
        <svg 
          xmlns="http://www.w3.org/2000/svg" 
          className="h-6 w-6 text-gray-500" 
          fill="none" 
          viewBox="0 0 24 24" 
          stroke="currentColor"
        >
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth={2} 
            d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" 
          />
        </svg>
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 h-5 w-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>
      
      {isOpen && (
        <div 
          className="absolute right-0 mt-2 w-80 bg-white rounded-md shadow-lg overflow-hidden z-50 ring-1 ring-black ring-opacity-5"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="py-1 max-h-96 overflow-y-auto">
            <div className="px-4 py-2 border-b bg-gray-50 flex justify-between items-center">
              <h3 className="text-sm font-medium text-gray-700">Notifications</h3>
              {unreadCount > 0 && (
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    markAllAsRead();
                  }}
                  className="text-xs text-blue-600 hover:text-blue-800"
                >
                  Mark all as read
                </button>
              )}
            </div>
            
            {isLoading ? (
              <div className="px-4 py-3 text-center">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-gray-400 mx-auto"></div>
              </div>
            ) : error ? (
              <div className="px-4 py-3 text-sm text-red-500">{error}</div>
            ) : notifications.length === 0 ? (
              <div className="px-4 py-3 text-sm text-gray-500">No notifications</div>
            ) : (
              notifications.map(notification => (
                <div 
                  key={notification.id} 
                  className={`px-4 py-3 hover:bg-gray-50 cursor-pointer ${
                    !notification.isRead ? 'bg-blue-50' : ''
                  }`}
                  onClick={() => handleNotificationClick(notification)}
                >
                  <div className="flex justify-between">
                    <h4 className={`text-sm font-medium ${
                      !notification.isRead ? 'text-blue-800' : 'text-gray-800'
                    }`}>
                      {notification.title}
                    </h4>
                    <span className="text-xs text-gray-500">
                      {new Date(notification.createdAt).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500 mt-1 truncate">
                    {notification.message}
                  </p>
                  {notification.type === 'new_request' && (
                    <span className="inline-block mt-1 px-2 py-0.5 text-xs rounded-full bg-green-100 text-green-800">
                      New Request
                    </span>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}