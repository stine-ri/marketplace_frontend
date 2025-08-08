import { useState, useEffect, useCallback, useRef } from 'react';
import type { Notification } from '../types/types';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';

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
  type: string;
  data: any;
};

const MAX_RECONNECT_ATTEMPTS = 5;
const RECONNECT_INTERVAL = 5000;

export default function useWebSocket(userId?: number) {
  const url = import.meta.env.VITE_WS_URL;
  const { user, token } = useAuth();

  const [socket, setSocket] = useState<WebSocket | null>(null);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [reconnectAttempt, setReconnectAttempt] = useState(0);
  const reconnectTimerRef = useRef<number>();
  const [lastMessage, setLastMessage] = useState<any>(null);

// Update the handleMessage function in useWebSocket.ts
const handleMessage = useCallback((event: MessageEvent) => {
  try {
    const message: WebSocketMessage = JSON.parse(event.data);
    setLastMessage(message);

    switch (message.type) {
      case 'notification':
      case 'new_notification': {
        const notification = message.data as Notification;
        setNotifications(prev => [notification, ...prev]);
        // ... existing notification code ...
        break;
      }

      case 'initial_notifications': {
        if (Array.isArray(message.data)) {
          setNotifications(message.data);
        }
        break;
      }

      case 'new_message': {
        // Handle incoming chat messages
        const { chatRoomId, message: chatMessage } = message.data;
        // Update your chat state here
        console.log('New message received:', chatMessage);
        break;
      }

      case 'interest_accepted': {
        // Handle when a client accepts the provider's interest
        const { requestId, chatRoomId } = message.data;
        toast.success(`Your interest in request #${requestId} was accepted!`);
        // You might want to fetch the chat room details here
        break;
      }

      case 'chat_room_created': {
        // Handle when a new chat room is created for an accepted interest
        const { chatRoom } = message.data;
        // Update your chat rooms state
        console.log('New chat room created:', chatRoom);
        break;
      }

      default:
        console.warn('Unhandled message type:', message.type);
    }
  } catch (error) {
    console.error('WebSocket message error:', error);
  }
}, []);

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

  const connect = useCallback(() => {
    cleanup();

    if (!url || !token || reconnectAttempt > MAX_RECONNECT_ATTEMPTS) return;

    const ws = new WebSocket(url);
    ws.onopen = () => {
      console.log('WebSocket connected');
      setSocket(ws);
      setIsConnected(true);
      setReconnectAttempt(0);

      ws.send(JSON.stringify({ type: 'auth', token }));
    };

    ws.onmessage = handleMessage;

    ws.onclose = () => {
      console.log('WebSocket disconnected');
      setIsConnected(false);

      if (reconnectAttempt < MAX_RECONNECT_ATTEMPTS) {
        const delay = Math.min(
          RECONNECT_INTERVAL * Math.pow(2, reconnectAttempt),
          RECONNECT_INTERVAL * 10
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
  }, [url, token, handleMessage, reconnectAttempt, cleanup]);

  useEffect(() => {
    if (!url || !token || !user) return;
    connect();
    return () => cleanup();
  }, [url, token, user, connect, cleanup]);

  const sendMessage = useCallback((message: object) => {
    if (socket && socket.readyState === WebSocket.OPEN) {
      try {
        socket.send(JSON.stringify(message));
        return true;
      } catch (error) {
        console.error('WebSocket send error:', error);
        return false;
      }
    }
    return false;
  }, [socket]);

  const markAsRead = useCallback((notificationId: number) => {
    setNotifications(prev =>
      prev.map(n => n.id === notificationId ? { ...n, isRead: true } : n)
    );
    sendMessage({ type: 'mark_as_read', notificationId });
  }, [sendMessage]);

  const markAllAsRead = useCallback(() => {
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    sendMessage({ type: 'mark_all_read' });
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
