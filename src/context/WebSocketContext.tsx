// src/context/WebSocketContext.tsx
import { createContext, useContext, ReactNode, useMemo, useState, useEffect } from 'react';
import useWebSocket from '../hooks/useWebSocket';

type WebSocketContextType = ReturnType<typeof useWebSocket>;

const WebSocketContext = createContext<WebSocketContextType | null>(null);

export function WebSocketProvider({ 
  children,
  userId 
}: { 
  children: ReactNode;
  userId?: number;
}) {
  const ws = useWebSocket(userId);
  const [isReady, setIsReady] = useState(false);

  // Wait for WebSocket to be ready if user is authenticated
  useEffect(() => {
    if (userId) {
      setIsReady(ws.isConnected);
    } else {
      setIsReady(true); // Ready immediately if no user (no WebSocket needed)
    }
  }, [userId, ws.isConnected]);

  const value = useMemo(() => ws, [ws]);

  if (!isReady) {
    return <div>Connecting to real-time service...</div>;
  }

  return (
    <WebSocketContext.Provider value={value}>
      {children}
    </WebSocketContext.Provider>
  );
}

export function useWebSocketContext() {
  const context = useContext(WebSocketContext);
  if (!context) {
    throw new Error('useWebSocketContext must be used within a WebSocketProvider');
  }
  return context;
}
