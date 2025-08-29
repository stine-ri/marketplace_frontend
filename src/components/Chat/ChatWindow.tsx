import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { PaperAirplaneIcon } from '@heroicons/react/24/solid';
import { CurrencyDollarIcon } from '@heroicons/react/24/outline';
import { PaymentAgreementModal } from '../NewFeature/PaymentAgreementModal';
import { CreateAgreementDto, PaymentAgreement } from '../../types/payment';
import api from '../../api/api';

interface Message {
  id: number;
  content: string;
  createdAt: string;
  read: boolean;
  senderId?: number;
  sender_id?: number;
  sender: {
    id: number;
    name: string;
    full_name?: string;
    avatar?: string;
  };
  isSystem?: boolean;
}

interface ChatRoomData {
  id: number;
  clientId: number;
  providerId: number;
  request?: {
    id: number;
    productName?: string;
  };
  client?: {
    id: number;
    full_name: string;
    email: string;
    avatar?: string;
  };
  provider?: {
    id: number;
    full_name: string;
    email: string;
    avatar?: string;
  };
  userRole?: 'client' | 'provider';
}

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://mkt-backend-sz2s.onrender.com';
const WS_BASE_URL = API_BASE_URL.replace('http', 'ws');

export function ChatWindow() {
  const { chatRoomId } = useParams();
  const navigate = useNavigate();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [agreement, setAgreement] = useState<PaymentAgreement | null>(null);
  const [isAccepting, setIsAccepting] = useState(false);
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [connectionStatus, setConnectionStatus] = useState<'connecting'|'connected'|'disconnected'>('connecting');
  const [chatRoomData, setChatRoomData] = useState<ChatRoomData | null>(null);
  const { user } = useAuth();

  // Cleanup WebSocket connection
  const cleanupWebSocket = useCallback(() => {
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }
    setConnectionStatus('disconnected');
  }, []);

  // Setup WebSocket connection
  const setupWebSocket = useCallback(() => {
    cleanupWebSocket();

    if (!chatRoomId || !user?.userId) {
      console.log('WebSocket setup skipped - missing requirements');
      return;
    }

    const token = localStorage.getItem('token');
    if (!token) {
      console.error('No token available for WebSocket');
      navigate('/login');
      return;
    }

    const wsUrl = `${WS_BASE_URL}/api/chat/${chatRoomId}/ws?token=${token}`;
    
    try {
      const ws = new WebSocket(wsUrl);
      setConnectionStatus('connecting');

      ws.onopen = () => {
        setConnectionStatus('connected');
        setError(null);
        console.log('WebSocket connected for room:', chatRoomId);
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          
          if (data.type === 'new_message') {
            const newMsg: Message = {
              id: data.message.id || Date.now(),
              content: data.message.content,
              createdAt: data.message.createdAt || new Date().toISOString(),
              read: data.message.read || false,
              senderId: data.message.senderId,
              sender: {
                id: data.message.senderId,
                name: data.message.sender?.name || data.message.sender?.full_name || 'Unknown',
                avatar: data.message.sender?.avatar
              }
            };
            setMessages(prev => [...prev, newMsg]);
            scrollToBottom();
          } else if (data.type === 'message_read') {
            setMessages(prev => prev.map(msg => 
              msg.id === data.messageId ? { ...msg, read: true } : msg
            ));
          } else if (data.type === 'payment_agreement') {
            setAgreement(data.agreement);
          }
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
        }
      };

      ws.onerror = (error) => {
        console.error('WebSocket error:', error);
        setConnectionStatus('disconnected');
      };

      ws.onclose = (event) => {
        setConnectionStatus('disconnected');
        console.log('WebSocket disconnected:', event.code, event.reason);
        
        // Reconnect after 5 seconds if still authenticated
        if (user?.userId && localStorage.getItem('token')) {
          reconnectTimeoutRef.current = setTimeout(() => {
            setupWebSocket();
          }, 5000);
        }
      };

      wsRef.current = ws;
    } catch (error) {
      console.error('Failed to create WebSocket connection:', error);
      setConnectionStatus('disconnected');
    }
  }, [chatRoomId, user?.userId, navigate, cleanupWebSocket]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Fetch chat data
  const fetchChatData = useCallback(async () => {
    if (!chatRoomId || !user?.userId) {
      setError('Invalid chat room or user');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      const [messagesResponse, roomResponse] = await Promise.all([
        api.get(`/api/chat/${chatRoomId}/messages`),
        api.get(`/api/chat/chats/${chatRoomId}`)
      ]);

      // Process messages
      const messagesData = messagesResponse.data;
      const roomData = roomResponse.data;

      if (!Array.isArray(messagesData)) {
        throw new Error('Invalid messages data format');
      }

      if (!roomData || !roomData.id) {
        throw new Error('Invalid room data structure');
      }

      setChatRoomData(roomData);

      const processedMessages = messagesData.map((msg: any) => {
        const senderId = msg.senderId || msg.sender_id;
        const senderName = msg.sender?.name || 
                         msg.sender?.full_name || 
                         (senderId === roomData.clientId ? roomData.client?.full_name : roomData.provider?.full_name) ||
                         'Unknown User';
        
        return {
          id: msg.id || Date.now() + Math.random(),
          content: msg.content || '',
          createdAt: msg.createdAt || new Date().toISOString(),
          read: msg.read !== undefined ? msg.read : true,
          senderId: senderId,
          sender: {
            id: senderId,
            name: senderName,
            avatar: msg.sender?.avatar || 
                   (senderId === roomData.clientId ? roomData.client?.avatar : roomData.provider?.avatar) ||
                   '/default-avatar.png'
          },
          isSystem: msg.isSystem || false
        };
      });
      
      setMessages(processedMessages);

      // Fetch payment agreement
      try {
        const agreementResponse = await api.get(`/api/chat/${chatRoomId}/agreements`);
        if (agreementResponse.data) {
          setAgreement(agreementResponse.data);
        }
      } catch (agreementError) {
        console.log('No existing payment agreement');
      }

      scrollToBottom();

    } catch (error: any) {
      console.error("Error fetching chat data:", error);
      
      let errorMessage = "Failed to load chat data";
      if (error.response?.status === 401) {
        errorMessage = "Unauthorized - Please login again";
        navigate('/login');
      } else if (error.response?.status === 403) {
        errorMessage = "You don't have access to this chat room";
        navigate('/chat');
      } else if (error.response?.status === 404) {
        errorMessage = "Chat room not found";
        navigate('/chat');
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [chatRoomId, user?.userId, navigate]);

  // Initial data load
  useEffect(() => {
    if (chatRoomId && user?.userId) {
      fetchChatData();
    }

    return () => {
      cleanupWebSocket();
    };
  }, [chatRoomId, user?.userId, fetchChatData, cleanupWebSocket]);

  // Setup WebSocket after data loads
  useEffect(() => {
    if (chatRoomData && !loading && user?.userId) {
      setupWebSocket();
    }
  }, [chatRoomData, loading, user?.userId, setupWebSocket]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !chatRoomId || connectionStatus !== 'connected') return;

    const messageContent = newMessage.trim();
    const tempId = Date.now();
    
    // Optimistic update
    if (!user) {
      setError('User not authenticated.');
      return;
    }
    const optimisticMessage: Message = {
      id: tempId,
      content: messageContent,
      createdAt: new Date().toISOString(),
      read: false,
      senderId: user.userId,
      sender: {
        id: user.userId,
        name: user.full_name || 'You',
        avatar: user.avatar
      }
    };

    setMessages(prev => [...prev, optimisticMessage]);
    setNewMessage('');
    scrollToBottom();

    try {
      const response = await api.post(`/api/chat/${chatRoomId}/messages`, {
        content: messageContent
      });

      // Replace optimistic message with real one
      if (response.data) {
        setMessages(prev => prev.map(msg => 
          msg.id === tempId ? {
            ...response.data,
            sender: {
              id: response.data.sender?.id || user?.userId || 0,
              name: response.data.sender?.name || user?.full_name || 'You',
              avatar: response.data.sender?.avatar || user?.avatar
            }
          } : msg
        ));
      }
    } catch (error) {
      console.error('Error sending message:', error);
      // Remove optimistic message on error
      setMessages(prev => prev.filter(msg => msg.id !== tempId));
      setError('Failed to send message. Please try again.');
      setNewMessage(messageContent);
    }
  };

  const handleCreateAgreement = async (agreementData: CreateAgreementDto) => {
    if (!chatRoomId) return;
    
    try {
      const response = await api.post(`/api/chat/${chatRoomId}/agreements`, agreementData);
      
      setAgreement(response.data);
      
      const systemMessage: Message = {
        id: Date.now(),
        content: `Payment agreement created: KSh ${response.data.amount} via ${response.data.paymentMethod}`,
        createdAt: new Date().toISOString(),
        read: true,
        sender: {
          id: 0,
          name: 'System',
          avatar: '/system-avatar.png'
        },
        isSystem: true
      };
      
      setMessages(prev => [...prev, systemMessage]);
      scrollToBottom();
      setShowPaymentModal(false);
    } catch (error) {
      console.error('Error creating agreement:', error);
      setError('Failed to create payment agreement. Please try again.');
    }
  };

  const handleAcceptAgreement = async () => {
    if (!chatRoomId || !agreement || isAccepting) return;
    
    try {
      setIsAccepting(true);
      const response = await api.post(`/api/chat/${chatRoomId}/agreements/${agreement.id}/accept`);
      
      setAgreement(response.data);
      
      const systemMessage: Message = {
        id: Date.now(),
        content: `Payment agreement accepted`,
        createdAt: new Date().toISOString(),
        read: true,
        sender: {
          id: user?.userId || 0,
          name: user?.full_name || 'System',
        },
        isSystem: true
      };
      
      setMessages(prev => [...prev, systemMessage]);
      scrollToBottom();
    } catch (error) {
      console.error('Error accepting agreement:', error);
      setError('Failed to accept payment agreement');
    } finally {
      setIsAccepting(false);
    }
  };

  const handleRetry = () => {
    setError(null);
    setLoading(true);
    fetchChatData();
    setupWebSocket();
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading chat...</p>
          <p className="text-xs text-gray-400 mt-1">
            If this takes too long, please refresh the page
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          <div className="text-red-500 mb-4">
            <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <p className="text-red-500 mb-4">{error}</p>
          <div className="space-x-2">
            <button 
              onClick={handleRetry}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Retry
            </button>
            <button 
              onClick={() => navigate('/chat')}
              className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
            >
              Back to Chat List
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col h-full">
      {/* Header */}
      <div className="border-b border-gray-200 p-3 bg-gray-50 flex justify-between items-center sticky top-0 z-10">
        <div>
          <h2 className="text-lg font-medium text-gray-900">
            Chat with {chatRoomData?.userRole === 'client' ? 
              chatRoomData?.provider?.full_name || 'Provider' : 
              chatRoomData?.client?.full_name || 'Client'}
          </h2>
          {chatRoomData?.request?.productName && (
            <p className="text-sm text-gray-600">Request: {chatRoomData.request.productName}</p>
          )}
        </div>
        <div className={`text-sm flex items-center ${
          connectionStatus === 'connected' ? 'text-green-600' :
          connectionStatus === 'connecting' ? 'text-yellow-600' : 'text-red-600'
        }`}>
          <span className="mr-1">
            {connectionStatus === 'connected' ? '🟢' :
             connectionStatus === 'connecting' ? '🟡' : '🔴'}
          </span>
          {connectionStatus}
        </div>
      </div>
      
      {/* Messages area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Payment agreement display */}
        {agreement && (
          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-4">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <CurrencyDollarIcon className="h-5 w-5 text-yellow-400" />
              </div>
              <div className="ml-3 flex-1">
                <h3 className="text-sm font-medium text-yellow-800">Payment Agreement</h3>
                <div className="mt-1 text-sm text-yellow-700">
                  <p>Amount: KSh {agreement.amount}</p>
                  <p>Method: {agreement.paymentMethod}</p>
                  {agreement.terms && <p>Terms: {agreement.terms}</p>}
                  <p className="mt-2">
                    Status: <span className={`font-medium ${
                      agreement.status === 'accepted' ? 'text-green-600' : 
                      agreement.status === 'rejected' ? 'text-red-600' : 'text-yellow-600'
                    }`}>
                      {agreement.status}
                    </span>
                  </p>
                </div>
                {agreement.status === 'pending' && chatRoomData?.userRole === 'provider' && (
                  <button
                    onClick={handleAcceptAgreement}
                    disabled={isAccepting}
                    className={`mt-2 px-3 py-1 text-white text-sm rounded focus:outline-none focus:ring-2 ${
                      isAccepting 
                        ? 'bg-green-300 cursor-not-allowed' 
                        : 'bg-green-500 hover:bg-green-600 focus:ring-green-500'
                    }`}
                  >
                    {isAccepting ? 'Accepting...' : 'Accept Agreement'}
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Messages */}
        {messages.length === 0 ? (
          <div className="text-center text-gray-500 py-8">
            <div className="text-4xl mb-2">💬</div>
            <p>No messages yet</p>
            <p className="text-sm">Start the conversation!</p>
          </div>
        ) : (
          messages.map(message => {
            const isOwnMessage = message.senderId === user?.userId;
            
            return (
              <div key={message.id} className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                  message.isSystem ? 'bg-gray-100 text-gray-600 text-center text-sm' :
                  isOwnMessage ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-800'
                } ${message.isSystem ? 'mx-auto' : ''}`}>
                  
                  {!message.isSystem && !isOwnMessage && (
                    <div className="flex items-start">
                      <img 
                        src={message.sender.avatar || '/default-avatar.png'} 
                        alt={message.sender.name}
                        className="w-8 h-8 rounded-full mr-2"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = '/default-avatar.png';
                        }}
                      />
                      <div className="flex-1">
                        <p className="font-semibold text-sm mb-1">
                          {message.sender.name}
                        </p>
                        <p>{message.content}</p>
                        <p className="text-xs mt-1 text-gray-500">
                          {new Date(message.createdAt).toLocaleTimeString([], { 
                            hour: '2-digit', 
                            minute: '2-digit' 
                          })}
                        </p>
                      </div>
                    </div>
                  )}

                  {!message.isSystem && isOwnMessage && (
                    <div>
                      <p>{message.content}</p>
                      <div className="flex justify-between items-center mt-1">
                        <p className="text-xs text-blue-100">
                          {new Date(message.createdAt).toLocaleTimeString([], { 
                            hour: '2-digit', 
                            minute: '2-digit' 
                          })}
                        </p>
                        <span className="text-xs">
                          {message.read ? '✓✓' : '✓'}
                        </span>
                      </div>
                    </div>
                  )}

                  {message.isSystem && (
                    <p>{message.content}</p>
                  )}
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>
      
      {/* Message input */}
      <form onSubmit={handleSendMessage} className="border-t border-gray-200 p-4 bg-white">
        <div className="flex space-x-2">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder={connectionStatus === 'connected' ? "Type your message..." : "Connecting..."}
            disabled={connectionStatus === 'disconnected'}
            className="flex-1 border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
          />
          <button
            type="submit"
            disabled={connectionStatus === 'disconnected' || !newMessage.trim()}
            className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-300 disabled:cursor-not-allowed"
          >
            <PaperAirplaneIcon className="h-5 w-5" />
          </button>
          <button
            type="button"
            onClick={() => setShowPaymentModal(true)}
            disabled={connectionStatus === 'disconnected'}
            className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:bg-gray-100 disabled:cursor-not-allowed"
          >
            <CurrencyDollarIcon className="h-5 w-5 text-gray-500 mr-1" />
            Payment
          </button>
        </div>
      </form>

      {chatRoomId && (
        <PaymentAgreementModal
          isOpen={showPaymentModal}
          onClose={() => setShowPaymentModal(false)}
          chatRoomId={parseInt(chatRoomId)}
          onAgreementReached={handleCreateAgreement}
        />
      )}
    </div>
  );
}