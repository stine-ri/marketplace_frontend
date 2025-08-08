import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { PaperAirplaneIcon } from '@heroicons/react/24/solid';
import { CurrencyDollarIcon } from '@heroicons/react/24/outline';
import { PaymentAgreementModal } from '../NewFeature/PaymentAgreementModal';
import { CreateAgreementDto, PaymentAgreement, PaymentMethod } from '../../types/payment';

interface Message {
  id: number;
  content: string;
  createdAt: string;
  read: boolean;
  sender: {
    id: number;
    name: string;
    avatar?: string;
  };
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
  const { user } = useAuth();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [agreement, setAgreement] = useState<PaymentAgreement | null>(null);
  const [isAccepting, setIsAccepting] = useState(false);
  const wsRef = useRef<WebSocket | null>(null);
  const [connectionStatus, setConnectionStatus] = useState<'connecting'|'connected'|'disconnected'>('connecting');

 const fetchWithAuth = async (url: string, options: RequestInit = {}) => {
  const token = localStorage.getItem('token');
  
  if (!token) {
    navigate('/login');
    throw new Error('No authentication token found');
  }

  const headers = new Headers({
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  });

  if (options.headers) {
    Object.entries(options.headers).forEach(([key, value]) => {
      headers.append(key, value);
    });
  }

  const response = await fetch(`${API_BASE_URL}${url}`, {
    ...options,
    headers
  });

  if (!response.ok) {
    let errorMessage = `HTTP error! status: ${response.status}`;
    try {
      const errorData = await response.json();
      if (errorData.error) {
        errorMessage = errorData.error;
        if (errorData.details) {
          errorMessage += `: ${errorData.details}`;
        }
      }
    } catch (e) {
      console.log('Could not parse error response');
    }

    if (response.status === 401) {
      navigate('/login');
      throw new Error('Unauthorized - Please login again');
    }
    if (response.status === 403) {
      throw new Error('You do not have access to this chat room');
    }
    if (response.status === 404) {
      throw new Error('Chat room not found');
    }
    throw new Error(errorMessage);
  }

  return response; 
};

const setupWebSocket = useCallback(() => {
  if (!chatRoomId || !user?.userId) {
    console.error('Missing chatRoomId or userId');
    return;
  }

    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }

    const wsUrl = `${WS_BASE_URL}/api/chat/${chatRoomId}/ws?token=${token}`;
    const ws = new WebSocket(wsUrl);
 ws.onopen = () => {
    setConnectionStatus('connected');
    console.log('WebSocket connected for room:', chatRoomId);
    // Send a ping message to verify connection
    ws.send(JSON.stringify({ type: 'ping' }));
  };

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
        console.log('WebSocket message:', data);
        
      if (data.type === 'new_message') {
        setMessages(prev => [...prev, data.message]);
        scrollToBottom();
      } else if (data.type === 'message_read') {
        setMessages(prev => prev.map(msg => 
          msg.id === data.messageId ? { ...msg, read: true } : msg
        ));
      } else if (data.type === 'payment_agreement') {
        setAgreement(data.agreement);
        const systemMessage = {
          id: Date.now(),
          content: `Payment agreement created: KSh ${data.agreement.amount} via ${data.agreement.paymentMethod}`,
          createdAt: new Date().toISOString(),
          read: true,
          isSystem: true,
          sender: {
            id: 0,
            name: 'System'
          }
        };
        setMessages(prev => [...prev, systemMessage]);
      }
    };

    ws.onerror = (error) => {
      console.error('WebSocket error:', error);
    };

    ws.onclose = () => {
      setConnectionStatus('disconnected');
      console.log('WebSocket disconnected');
      // Attempt to reconnect after a delay
      setTimeout(() => setupWebSocket(), 5000);
    };

    wsRef.current = ws;
    return ws;
  }, [chatRoomId, user?.userId, navigate]);

  useEffect(() => {
    if (!chatRoomId || isNaN(Number(chatRoomId))) {
      setError('Invalid chat room ID');
      setLoading(false);
      return;
    }

    const ws = setupWebSocket();

   // Update the fetchChatData function to handle errors better
const fetchChatData = async () => {
  try {
    setLoading(true);
    setError(null);
    
    const [messagesResponse, roomResponse] = await Promise.all([
      fetchWithAuth(`/api/chat/${chatRoomId}/messages`),
      fetchWithAuth(`/api/chat/chats/${chatRoomId}`)
    ]);

    if (!messagesResponse.ok || !roomResponse.ok) {
      throw new Error('Failed to fetch chat data');
    }

    const messagesData = await messagesResponse.json();
    const roomData = await roomResponse.json();

    console.log('Fetched room data:', roomData); // Debug log

    if (!Array.isArray(messagesData)) {
      throw new Error('Messages data is not an array');
    }

    if (!roomData || !roomData.clientId || !roomData.providerId) {
      throw new Error('Invalid room data structure');
    }

    // Process messages as shown above
    // Update the enhancedMessages mapping in ChatWindow component
const enhancedMessages = messagesData.map(msg => {
  // Determine if sender is client or provider
  const isClient = msg.sender_id === roomData.clientId;
  const senderInfo = isClient ? roomData.client : roomData.provider;
  
  return {
    ...msg,
    sender: {
      id: msg.sender_id,
      name: msg.sender?.name || senderInfo?.name || 'Unknown User',
      avatar: msg.sender?.avatar || senderInfo?.avatar || '/default-avatar.png'
    }
  };
});
    
    setMessages(enhancedMessages);
  }catch (error) {
  console.error("Error fetching chat data:", error);

  if (error instanceof Error) {
    setError(error.message);
    if (error.message.includes('404')) {
      navigate('/chat');
    }
  } else {
    setError("Failed to load chat data");
  }
} finally {
  setLoading(false);
}

};

    fetchChatData();

    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, [chatRoomId, navigate, setupWebSocket]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !chatRoomId || !wsRef.current) return;

    const tempId = Date.now();
    const newMsg = {
      id: tempId,
      content: newMessage,
      createdAt: new Date().toISOString(),
      read: false,
      sender: {
        id: user?.userId || 0,
        name: user?.full_name || 'You',
        avatar: user?.avatar
      }
    };

    // Optimistic update
    setMessages(prev => [...prev, newMsg]);
    setNewMessage('');
    scrollToBottom();

    try {
      // Send via WebSocket
      wsRef.current.send(JSON.stringify({
        type: 'send_message',
        content: newMessage
      }));
    } catch (error) {
      console.error('Error sending message:', error);
      // Rollback optimistic update
      setMessages(prev => prev.filter(msg => msg.id !== tempId));
      setError('Failed to send message');
    }
  };

const handleCreateAgreement = async (agreementData: CreateAgreementDto) => {
  if (!chatRoomId) return;
  
  try {
    console.log('Creating agreement:', agreementData); // Debug log
    const response = await fetchWithAuth(`/api/chat/${chatRoomId}/agreements`, {
      method: 'POST',
      body: JSON.stringify(agreementData),
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    console.log('Agreement created:', data); // Debug log
    
    setAgreement(data);
    
    const systemMessage = {
      id: Date.now(),
      content: `Payment agreement created: KSh ${data.amount} via ${data.paymentMethod}`,
      createdAt: new Date().toISOString(),
      read: true,
      sender: {
        id: 0, // System user
        name: 'System',
        avatar: '/system-avatar.png'
      },
      isSystem: true
    };
    
    setMessages(prev => [...prev, systemMessage]);
  } catch (error) {
    console.error('Error creating agreement:', error);
    setError('Failed to create payment agreement. Please try again.');
  }
};

  const handleAcceptAgreement = async () => {
  if (!chatRoomId || !agreement || isAccepting) return;
  
  try {
    setIsAccepting(true);
    const response = await fetchWithAuth(`/api/chat/${chatRoomId}/agreements/${agreement.id}/accept`, {
      method: 'POST',
    });
    
    const data = await response.json();
    setAgreement(data);
    
    const systemMessage = {
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
  } catch (error) {
    console.error('Error accepting agreement:', error);
    setError('Failed to accept payment agreement');
  } finally {
    setIsAccepting(false);
  }
};

  if (error) {
    return (
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="text-center">
          <p className="text-red-500">{error}</p>
          <button 
            onClick={() => navigate('/chat')}
            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Back to Chat List
          </button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center p-4">
        {[...Array(5)].map((_, i) => (
        <div key={i} className="animate-pulse flex space-x-4">
          <div className="rounded-full bg-gray-200 h-10 w-10"></div>
          <div className="flex-1 space-y-2">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded"></div>
          </div>
        </div>
      ))}
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col">
      {/* Add connection status here */}
    <div className="border-b border-gray-200 p-3 bg-gray-50 flex justify-between items-center sticky top-0 z-10">
  <h2 className="text-lg font-medium text-gray-900">Chat Room {chatRoomId}</h2>
  <div className={`text-sm flex items-center ${
    connectionStatus === 'connected' ? 'text-green-600' :
    connectionStatus === 'connecting' ? 'text-yellow-600' : 'text-red-600'
  }`}>
    <span className="mr-1">
      {connectionStatus === 'connected' ? '🟢' :
       connectionStatus === 'connecting' ? '🟡' : '🔴'}
    </span>
    {connectionStatus === 'connected' ? 'Online' :
     connectionStatus === 'connecting' ? 'Connecting...' : 'Disconnected'}
  </div>
          </div>
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
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
                {agreement.status === 'pending' && user?.userId !== agreement.clientId && (
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

{messages.map(message => (
  <div key={message.id} className={`flex ${message.sender.id === user?.userId ? 'justify-end' : 'justify-start'}`}>
    <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg flex ${message.sender.id === user?.userId ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-800'}`}>
      {/* Sender avatar for received messages */}
      {message.sender.id !== user?.userId && (
        <img 
          src={message.sender.avatar || '/default-avatar.png'} 
          alt={message.sender.name}
          className="w-8 h-8 rounded-full mr-2"
        />
      )}
     
{message.sender.id === user?.userId && (
  <span className="ml-2 text-xs">
    {message.read ? '✓✓' : '✓'}
  </span>
)}
      <div>
        {message.sender.id !== user?.userId && (
          <p className="font-semibold text-sm mb-1">{message.sender.name}</p>
        )}
        <p>{message.content}</p>
        <p className={`text-xs mt-1 ${message.sender.id === user?.userId ? 'text-blue-100' : 'text-gray-500'}`}>
          {new Date(message.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </p>
      </div>
    </div>
  </div>
))}
        <div ref={messagesEndRef} />
      </div>
      
      <form onSubmit={handleSendMessage} className="border-t border-gray-200 p-4">
        <div className="flex">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type your message..."
            className="flex-1 border border-gray-300 rounded-l-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            type="submit"
            className="bg-blue-500 text-white px-4 py-2 rounded-r-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <PaperAirplaneIcon className="h-5 w-5" />
          </button>
          <button
            type="button"
            onClick={() => setShowPaymentModal(true)}
            className="inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 ml-2"
          >
            <CurrencyDollarIcon className="-ml-1 mr-2 h-5 w-5 text-gray-500" />
            Create Payment
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