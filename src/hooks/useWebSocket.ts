// src/hooks/useWebSocket.ts
import { useState, useEffect, useCallback, useRef } from 'react';
import type { Notification } from '../types/types';

// Extended NotificationOptions interface
interface NotificationOptions {
  body?: string;
  icon?: string;
  image?: string;
  badge?: string;
  vibrate?: number[];
  tag?: string;
  renotify?: boolean;
  silent?: boolean;
  sound?: string;
  noscreen?: boolean;
  sticky?: boolean;
  dir?: 'auto' | 'ltr' | 'rtl';
  lang?: string;
  timestamp?: number;
}

type WebSocketMessage = {
  type: 'notification' | 'heartbeat' | 'read_receipt';
  data: Notification | string;
};

const MAX_RECONNECT_ATTEMPTS = 5;
const RECONNECT_INTERVAL = 5000;

export default function useWebSocket(userId?: number) {
  const url = import.meta.env.VITE_WS_URL;

  const [socket, setSocket] = useState<WebSocket | null>(null);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [reconnectAttempt, setReconnectAttempt] = useState(0);
  const reconnectTimerRef = useRef<number>();
  const [lastMessage, setLastMessage] = useState<any>(null);

  // Handle incoming messages
  const handleMessage = useCallback((event: MessageEvent) => {
    try {
      const message: WebSocketMessage = JSON.parse(event.data);
       setLastMessage(message);
      
      if (message.type === 'notification') {
        const notification = message.data as Notification;
        setNotifications(prev => [notification, ...prev]);
        
        // Show browser notification if permission is granted
        const showNotification = () => {
          new Notification(notification.title, {
            body: notification.message,
            icon: notification.icon || '/default-notification-icon.png',
          } as NotificationOptions);
        };

        if (Notification.permission === 'granted') {
          showNotification();
        } else if (Notification.permission !== 'denied') {
          Notification.requestPermission().then(permission => {
            if (permission === 'granted') {
              showNotification();
            }
          });
        }
      }
    } catch (error) {
      console.error('Error parsing WebSocket message:', error);
    }
  }, []);

  // Cleanup WebSocket connection
  const cleanup = useCallback(() => {
    if (socket) {
      socket.onopen = null;
      socket.onmessage = null;
      socket.onclose = null;
      socket.onerror = null;
      if (socket.readyState === WebSocket.OPEN) {
        socket.close();
      }
    }
    if (reconnectTimerRef.current) {
      clearTimeout(reconnectTimerRef.current);
    }
  }, [socket]);

  // Connection management
  const connect = useCallback(() => {
    cleanup();

    if (!url || reconnectAttempt > MAX_RECONNECT_ATTEMPTS) {
      return;
    }

    const wsUrl = userId ? `${url}?userId=${userId}` : url;
    const ws = new WebSocket(wsUrl);
    
    ws.onopen = () => {
      console.log('WebSocket connected');
      setIsConnected(true);
      setReconnectAttempt(0);
    };
    
    ws.onmessage = handleMessage;
    
    ws.onclose = () => {
      setIsConnected(false);
      console.log('WebSocket disconnected');
      
      // Exponential backoff reconnect with max attempts
      if (reconnectAttempt < MAX_RECONNECT_ATTEMPTS) {
        const delay = Math.min(
          RECONNECT_INTERVAL * Math.pow(2, reconnectAttempt),
          RECONNECT_INTERVAL * 10 // Max 50 seconds
        );
        reconnectTimerRef.current = window.setTimeout(() => {
          setReconnectAttempt(prev => prev + 1);
          connect();
        }, delay);
      }
    };
    
    ws.onerror = (error) => {
      console.error('WebSocket error:', error);
      ws.close();
    };
    
    setSocket(ws);
  }, [url, userId, handleMessage, reconnectAttempt, cleanup]);

  // Initialize connection
  useEffect(() => {
    if (!url) return;
    
    connect();

    return () => {
      cleanup();
    };
  }, [url, userId, connect, cleanup]);

  // Send message through WebSocket
  const sendMessage = useCallback((message: object) => {
    if (socket && socket.readyState === WebSocket.OPEN) {
      try {
        socket.send(JSON.stringify(message));
        return true;
      } catch (error) {
        console.error('Error sending WebSocket message:', error);
        return false;
      }
    }
    return false;
  }, [socket]);

  // Mark notification as read
  const markAsRead = useCallback((notificationId: number) => {
    setNotifications(prev =>
      prev.map(n => 
        n.id === notificationId ? { ...n, isRead: true } : n
      )
    );
    sendMessage({
      type: 'mark_as_read',
      notificationId
    });
  }, [sendMessage]);

  // Mark all notifications as read
  const markAllAsRead = useCallback(() => {
    setNotifications(prev =>
      prev.map(n => ({ ...n, isRead: true }))
    );
    sendMessage({
      type: 'mark_all_read'
    });
  }, [sendMessage]);

  return {
    socket,
    notifications,
    isConnected,
    sendMessage,
    markAsRead,
    markAllAsRead,
    unreadCount: notifications.filter(n => !n.isRead).length,
    reconnectAttempt,
     lastMessage
  };
}