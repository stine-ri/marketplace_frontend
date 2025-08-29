import { useState, useEffect, useCallback, useRef } from 'react';
import type { Notification } from '../types/types';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';

type WebSocketMessage = {
  type: string;
  data: any;
};

const MAX_RECONNECT_ATTEMPTS = 5;
const RECONNECT_INTERVAL = 5000;
const IS_DEVELOPMENT = import.meta.env.DEV;
// Consider making this configurable via environment variable
const DISABLE_WS_IN_DEV = import.meta.env.VITE_WS_DISABLE_IN_DEV === 'true'; // Set to false when you want to test WebSocket in dev

// Add this helper at the top
function getWsUrl(): string {
  let url = import.meta.env.VITE_WS_URL;

  if (!url) {
    // fallback for local dev (same host as frontend)
    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    return `${protocol}//${window.location.host}`;
  }

  // Normalize if someone accidentally used http/https
  if (url.startsWith("http://")) {
    url = url.replace("http://", "ws://");
  }
  if (url.startsWith("https://")) {
    url = url.replace("https://", "wss://");
  }

  return url;
}

export default function useWebSocket(userId?: number) {
  const url = getWsUrl(); 
  const { user, token } = useAuth();

  const [socket, setSocket] = useState<WebSocket | null>(null);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [reconnectAttempt, setReconnectAttempt] = useState(0);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const reconnectTimerRef = useRef<number>();
  const [lastMessage, setLastMessage] = useState<any>(null);
  const socketRef = useRef<WebSocket | null>(null);
  const isConnectingRef = useRef(false);

const handleMessage = useCallback((event: MessageEvent) => {
  try {
    let rawData = event.data;
    let parsed: WebSocketMessage;

    // Handle case where data is already an object
    if (typeof rawData === 'object' && !(rawData instanceof Blob)) {
      if (rawData.type) { // If it looks like our message format
        parsed = rawData;
      } else {
        // Try to stringify and parse to ensure consistency
        try {
          rawData = JSON.stringify(rawData);
          parsed = JSON.parse(rawData);
        } catch {
          console.error("Could not process incoming object:", rawData);
          return;
        }
      }
    } else if (typeof rawData === 'string') {
      // Normal JSON parsing for string data
      try {
        parsed = JSON.parse(rawData);
      } catch (e) {
        console.error("Failed to parse WebSocket data. Raw:", rawData);
        return;
      }
    } else {
      console.error("Unsupported WebSocket message type:", typeof rawData);
      return;
    }

    const message: WebSocketMessage = parsed;
    setLastMessage(message);

    switch (message.type) {
      case "notification":
      case "new_notification": {
        const notification = message.data as Notification;
        setNotifications(prev => [notification, ...prev]);
        break;
      }

      case "initial_notifications": {
        if (Array.isArray(message.data)) {
          setNotifications(message.data);
        }
        break;
      }

      case "new_message": {
        const { message: chatMessage } = message.data;
        console.log("New message received:", chatMessage);
        break;
      }

      case "interest_accepted": {
        const { requestId } = message.data;
        toast.success(`Your interest in request #${requestId} was accepted!`);
        break;
      }

      case "chat_room_created": {
        console.log("New chat room created:", message.data.chatRoom);
        break;
      }

      case "auth_success": {
        console.log("Authenticated successfully");
        break;
      }

      default:
        console.warn("Unhandled message type:", message.type, "with data:", message.data);
    }
  } catch (error) {
    console.error("WebSocket message handling error:", error);
  }
}, []);


  const cleanup = useCallback(() => {
    if (reconnectTimerRef.current) {
      clearTimeout(reconnectTimerRef.current);
      reconnectTimerRef.current = undefined;
    }
    
    if (socketRef.current) {
      socketRef.current.onopen = null;
      socketRef.current.onmessage = null;
      socketRef.current.onclose = null;
      socketRef.current.onerror = null;
      
      if (socketRef.current.readyState === WebSocket.OPEN) {
        socketRef.current.close();
      }
      
      socketRef.current = null;
    }
    
    setSocket(null);
    setIsConnected(false);
    isConnectingRef.current = false;
  }, []);

  // Main connection effect
  useEffect(() => {
    // Skip WebSocket connection in development if disabled
    if (IS_DEVELOPMENT && DISABLE_WS_IN_DEV) {
      console.log('WebSocket disabled in development mode');
      setConnectionError('WebSocket disabled in development');
      return;
    }

    // Clear any previous error
    setConnectionError(null);

    // Validate environment
    if (!url) {
      setConnectionError('WebSocket URL not configured (VITE_WS_URL)');
      console.error('VITE_WS_URL environment variable not set');
      return;
    }

    if (!token) {
      setConnectionError('No authentication token available');
      console.warn('No authentication token - WebSocket connection skipped');
      return;
    }

    if (!user) {
      setConnectionError('No user data available');
      console.warn('No user data - WebSocket connection skipped');
      return;
    }

    // Don't connect if already connected or connecting
    if (socketRef.current?.readyState === WebSocket.OPEN || isConnectingRef.current) {
      return;
    }

    // Don't connect if exceeded max attempts
    if (reconnectAttempt > MAX_RECONNECT_ATTEMPTS) {
      setConnectionError(`Max reconnection attempts exceeded (${MAX_RECONNECT_ATTEMPTS})`);
      console.error('Max WebSocket reconnection attempts reached');
      return;
    }

    console.log(`Attempting WebSocket connection to: ${url} (attempt ${reconnectAttempt + 1})`);
    isConnectingRef.current = true;

    try {
      const ws = new WebSocket(url);
      socketRef.current = ws;

      // Connection timeout
      const connectionTimeout = setTimeout(() => {
        if (ws.readyState === WebSocket.CONNECTING) {
          console.error('WebSocket connection timeout');
          ws.close();
          setConnectionError('Connection timeout');
        }
      }, 10000); // 10 second timeout
      
      ws.onopen = () => {
        clearTimeout(connectionTimeout);
        console.log('WebSocket connected successfully');
        setSocket(ws);
        setIsConnected(true);
        setReconnectAttempt(0);
        setConnectionError(null);
        isConnectingRef.current = false;
        
        // Send authentication
        ws.send(JSON.stringify({ type: 'auth', token }));
      };

      ws.onmessage = handleMessage;

      ws.onclose = (event) => {
        clearTimeout(connectionTimeout);
        console.log(`WebSocket disconnected - Code: ${event.code}, Reason: ${event.reason || 'No reason provided'}`);
        
        setIsConnected(false);
        setSocket(null);
        socketRef.current = null;
        isConnectingRef.current = false;

        // Set error message based on close code
        switch (event.code) {
          case 1000:
            setConnectionError(null); // Normal closure
            break;
          case 1006:
            setConnectionError('Connection failed - Server may be unreachable');
            break;
          case 1011:
            setConnectionError('Server error encountered');
            break;
          case 1012:
            setConnectionError('Server restarting');
            break;
          default:
            setConnectionError(`Connection closed unexpectedly (Code: ${event.code})`);
        }

        // Only reconnect if it wasn't a manual close and we haven't exceeded attempts
        if (event.code !== 1000 && reconnectAttempt < MAX_RECONNECT_ATTEMPTS) {
          const delay = Math.min(
            RECONNECT_INTERVAL * Math.pow(2, reconnectAttempt),
            RECONNECT_INTERVAL * 10
          );
          
          console.log(`Scheduling reconnection in ${delay}ms (attempt ${reconnectAttempt + 1}/${MAX_RECONNECT_ATTEMPTS})`);
          
          reconnectTimerRef.current = window.setTimeout(() => {
            setReconnectAttempt(prev => prev + 1);
          }, delay);
        } else if (reconnectAttempt >= MAX_RECONNECT_ATTEMPTS) {
          console.error('Max reconnection attempts reached, giving up');
        }
      };

      ws.onerror = (error) => {
        clearTimeout(connectionTimeout);
        console.error('WebSocket error occurred:', error);
        setConnectionError('WebSocket connection error');
        isConnectingRef.current = false;
        
        if (ws.readyState === WebSocket.OPEN) {
          ws.close();
        }
      };
    } catch (error) {
      console.error('Failed to create WebSocket:', error);
      setConnectionError('Failed to create WebSocket connection');
      isConnectingRef.current = false;
    }

    return cleanup;
  }, [url, token, user, handleMessage, cleanup, reconnectAttempt]);

  const sendMessage = useCallback((message: object) => {
    if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
      try {
        socketRef.current.send(JSON.stringify(message));
        return true;
      } catch (error) {
        console.error('WebSocket send error:', error);
        setConnectionError('Failed to send message');
        return false;
      }
    } else {
      console.warn('Cannot send message - WebSocket not connected');
      return false;
    }
  }, []);

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

  // Manual reconnect function
  const reconnect = useCallback(() => {
    if (reconnectAttempt < MAX_RECONNECT_ATTEMPTS) {
      cleanup();
      setReconnectAttempt(0);
      setConnectionError(null);
    }
  }, [cleanup, reconnectAttempt]);

  return {
    socket,
    notifications,
    isConnected,
    sendMessage,
    markAsRead,
    markAllAsRead,
    unreadCount: notifications.filter(n => !n.isRead).length,
    reconnectAttempt,
    lastMessage,
    connectionError,
    reconnect
  };
}