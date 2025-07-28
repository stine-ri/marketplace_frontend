// src/context/WebSocketContext.tsx
import { createContext, useContext, ReactNode, useMemo } from 'react';
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


  const value = useMemo(() => ws, [ws]);

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