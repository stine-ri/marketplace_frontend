import { useState, useEffect, useCallback, useRef } from 'react';
import type { Notification } from '../types/types';
import type { ServiceRequest, WebSocketMessage } from '../types/types';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';

const MAX_RECONNECT_ATTEMPTS = 5;
const RECONNECT_INTERVAL = 5000;
const IS_DEVELOPMENT = import.meta.env.DEV;
const DISABLE_WS_IN_DEV = import.meta.env.VITE_WS_DISABLE_IN_DEV === 'true';

function getWsUrl(): string {
  // Option 1: Use environment variable (recommended)
  let url = import.meta.env.VITE_WS_URL;
  
  // Option 2: If no env var, construct from API base URL
  if (!url) {
    const apiBase = import.meta.env.VITE_API_BASE_URL || 'https://mkt-backend-sz2s.onrender.com';
    const protocol = apiBase.startsWith('https') ? 'wss:' : 'ws:';
    const host = apiBase.replace(/^https?:\/\//, '');
    url = `${protocol}//${host}/ws`; // Add /ws endpoint
  }

  // Ensure proper protocol
  if (url.startsWith("http://")) {
    url = url.replace("http://", "ws://");
  }
  if (url.startsWith("https://")) {
    url = url.replace("https://", "wss://");
  }

  // Ensure it has the /ws path
  if (!url.includes('/ws')) {
    url = `${url}/ws`;
  }

  console.log('WebSocket URL:', url);
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
      let parsedData: any;

      // Handle different message formats
      if (typeof rawData === 'string') {
        try {
          parsedData = JSON.parse(rawData);
        } catch (e) {
          console.error("Failed to parse WebSocket message as JSON:", rawData);
          return;
        }
      } else if (typeof rawData === 'object') {
        // If it's already an object, use it directly
        parsedData = rawData;
      } else {
        console.error("Unsupported WebSocket message type:", typeof rawData);
        return;
      }

      console.log('📨 Raw WebSocket message received:', parsedData);

      // Handle connection established message
      if (parsedData.type === 'connection_established') {
        console.log('✅ WebSocket connection established');
        setLastMessage({ type: 'connection_established', data: parsedData });
        return;
      }

      // Handle WebSocketMessage format (with data property)
      if (parsedData.type && parsedData.data !== undefined) {
        const message: WebSocketMessage = parsedData;
        
        switch (message.type) {
          case "notification":
          case "new_notification": {
            const notification = message.data as Notification;
            setNotifications(prev => [notification, ...prev]);
            setLastMessage({ type: 'notification', data: notification });
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
            setLastMessage({ type: 'new_message', data: message.data });
            break;
          }

          case "interest_accepted": {
            const { requestId } = message.data;
            toast.success(`Your interest in request #${requestId} was accepted!`);
            setLastMessage({ type: 'interest_accepted', data: message.data });
            break;
          }

          case "chat_room_created": {
            console.log("New chat room created:", message.data.chatRoom);
            setLastMessage({ type: 'chat_room_created', data: message.data });
            break;
          }

          case "auth_success": {
            console.log("Authenticated successfully");
            setLastMessage({ type: 'auth_success', data: message.data });
            break;
          }

          case 'service_request_update': {
            const request = message.data as ServiceRequest;
            console.log('Service request updated:', request);
            setLastMessage({ type: 'service_request_update', data: request });
            break;
          }

          case 'service_request_response': {
            const { action, response } = message.data;
            toast.info(`Your service request was ${action}ed${response ? ': ' + response : ''}`);
            setLastMessage({ type: 'service_request_response', data: message.data });
            break;
          }

          case 'service_request_message': {
            const { message: msg } = message.data;
            toast.info(`New message about your service request: ${msg}`);
            setLastMessage({ type: 'service_request_message', data: message.data });
            break;
          }

          default:
            console.warn("Unhandled WebSocketMessage type:", message.type, "with data:", message.data);
            // Still set lastMessage for unhandled types
            setLastMessage(parsedData);
        }
      } else {
        // Handle direct message format (type directly on object)
        // This is what ProviderDashboard expects
        console.log('📨 Direct message format detected:', parsedData);
        setLastMessage(parsedData);
        
        // Also handle notifications for direct format
        if (parsedData.type === 'notification' || parsedData.type === 'new_notification') {
          setNotifications(prev => [parsedData, ...prev]);
        }
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
      }, 10000);
      
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
            setConnectionError(null);
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