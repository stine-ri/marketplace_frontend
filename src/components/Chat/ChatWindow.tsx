import { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import api from '../../api/api';
import { useAuth } from '../../context/AuthContext';
import { PaperAirplaneIcon } from '@heroicons/react/24/solid';
import { CurrencyDollarIcon } from '@heroicons/react/24/outline';
import { PaymentAgreementModal } from '../NewFeature/PaymentAgreementModal';
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

export function ChatWindow() {
  const { chatRoomId } = useParams();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
   const [agreement, setAgreement] = useState<any>(null);
  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const response = await api.get(`/api/chat/${chatRoomId}/messages`);
        setMessages(response.data);
      } catch (error) {
        console.error('Error fetching messages:', error);
      } finally {
        setLoading(false);
      }
    };

    if (chatRoomId) {
      fetchMessages();
    }
  }, [chatRoomId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    try {
      const response = await api.post(`/api/chat/${chatRoomId}/messages`, {
        content: newMessage
      });
      
      setMessages(prev => [...prev, response.data]);
      setNewMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  if (loading) {
    return <div className="flex-1 p-4">Loading messages...</div>;
  }
// Add this function
const handleCreateAgreement = async (agreementData: any) => {
  try {
    const response = await api.post(`/api/chat/${chatRoomId}/agreement`, agreementData);
    setAgreement(response.data);
    
    // Send a system message about the agreement
    const systemMessage = `Payment agreement created: KSh ${agreementData.amount} via ${agreementData.paymentMethod}`;
    await api.post(`/api/chat/${chatRoomId}/messages`, {
      content: systemMessage,
      isSystem: true
    });
    
    // Refresh messages
    const messagesResponse = await api.get(`/api/chat/${chatRoomId}/messages`);
    setMessages(messagesResponse.data);
  } catch (error) {
    console.error('Error creating agreement:', error);
    throw error;
  }
};
  return (
    <div className="flex-1 flex flex-col">
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {agreement && (
  <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-4">
    <div className="flex items-start">
      <div className="flex-shrink-0">
        <CurrencyDollarIcon className="h-5 w-5 text-yellow-400" />
      </div>
      <div className="ml-3">
        <h3 className="text-sm font-medium text-yellow-800">Payment Agreement</h3>
        <div className="mt-1 text-sm text-yellow-700">
          <p>Amount: KSh {agreement.amount}</p>
          <p>Method: {agreement.paymentMethod}</p>
          {agreement.terms && <p>Terms: {agreement.terms}</p>}
        </div>
      </div>
    </div>
  </div>
)}

        {messages.map(message => (
          <div
            key={message.id}
            className={`flex ${message.sender.id === user?.userId ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${message.sender.id === user?.userId
                ? 'bg-blue-500 text-white' 
                : 'bg-gray-200 text-gray-800'
              }`}
            >
              <p>{message.content}</p>
              <p className={`text-xs mt-1 ${message.sender.id === user?.userId ? 'text-blue-100' : 'text-gray-500'}`}>
                {new Date(message.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </p>
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
    className="inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
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