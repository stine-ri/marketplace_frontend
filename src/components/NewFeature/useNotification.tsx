// src/hooks/useNotifications.ts
import { useState, useEffect, useCallback } from 'react';
import type { Notification } from '../../types/types';
import api from '../../api/api';
import { useWebSocketContext } from '../../context/WebSocketContext';

interface UseNotificationsReturn {
  notifications: Notification[];
  markAsRead: (id: number) => void;
  markAllAsRead: () => void;
  unreadCount: number;
  isLoading: boolean;
  error: string | null;
  hasUnread: boolean;
}

export default function useNotifications(userId?: number): UseNotificationsReturn {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { socket } = useWebSocketContext();

  const playNotificationSound = useCallback(() => {
    const audio = new Audio('api/notification-sound.mp3');
    audio.play().catch((e) => console.log('Audio play failed:', e));
  }, []);

  // WebSocket handlers
useEffect(() => {
  if (!socket) return;

  const handleNewNotification = (event: MessageEvent) => {
    try {
      const message = JSON.parse(event.data);
      if (message.type === 'notification') {
        const data = message.data;

        playNotificationSound();

        if (Notification.permission === 'granted') {
          new Notification(data.title, {
            body: data.message,
            icon: '/notification-icon.png',
          });
        }

        setNotifications(prev => [data, ...prev]);
      }
    } catch (err) {
      console.error('Failed to handle notification message:', err);
    }
  };

  socket.addEventListener('message', handleNewNotification);

  return () => {
    socket.removeEventListener('message', handleNewNotification);
  };
}, [socket, playNotificationSound]);


  // Mark notification as read
  const markAsRead = useCallback((id: number) => {
    setNotifications(prev =>
      prev.map(n => (n.id === id ? { ...n, isRead: true } : n))
    );
    
    // API call to mark as read on server
    api.patch(`api/notifications/${id}/read`).catch(err => {
      console.error('Failed to mark notification as read:', err);
    });
  }, []);

  // Mark all notifications as read
  const markAllAsRead = useCallback(() => {
    setNotifications(prev =>
      prev.map(n => ({ ...n, isRead: true }))
    );
    
    // API call to mark all as read on server
    api.patch('api/notifications/read-all').catch(err => {
      console.error('Failed to mark all notifications as read:', err);
    });
  }, []);

  // Calculate unread count
  const unreadCount = notifications.filter(n => !n.isRead).length;

  // Fetch initial notifications
  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const response = await api.get<Notification[]>('api/notifications');
        setNotifications(response.data);
      } catch (err) {
        setError('Failed to load notifications');
        console.error('Error fetching notifications:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchNotifications();
  }, [userId]);

  // Request notification permission
  useEffect(() => {
    if ('Notification' in window && Notification.permission !== 'granted') {
      Notification.requestPermission().catch(err => {
        console.error('Notification permission error:', err);
      });
    }
  }, []);

  return {
    notifications,
    markAsRead,
    markAllAsRead,
    unreadCount,
    isLoading,
    error,
    hasUnread: unreadCount > 0
  };
}