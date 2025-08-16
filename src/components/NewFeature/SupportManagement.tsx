// src/components/AdminPanel/SupportManagement.tsx
import { useState, useEffect } from 'react';
import axios from 'axios';
import { getAuthHeaders } from '../../utilis/auth';

const baseURL = import.meta.env.VITE_API_BASE_URL || 'https://mkt-backend-sz2s.onrender.com';

// Types for Support Tickets
interface TSSupportTicket {
  id: number;
  title: string;
  category: string;
  issue: string;
  status: 'pending' | 'in_progress' | 'resolved';
  createdAt: string;
  responses?: TSupportResponse[];
}

interface TSUser {
  full_name: string;
}

interface TSupportResponse {
  id: number;
  message: string;
  isAdminResponse: boolean;
  createdAt: string;
  user?: TSUser;
}

const SupportManagement = () => {
  const [tickets, setTickets] = useState<TSSupportTicket[]>([]);
  const [selectedTicket, setSelectedTicket] = useState<TSSupportTicket | null>(null);
  const [newResponse, setNewResponse] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchTickets();
  }, []);

  const fetchTickets = async () => {
    setIsLoading(true);
    try {
      const res = await axios.get(`${baseURL}/api/support`, { 
        headers: getAuthHeaders() 
      });
      setTickets(res.data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load tickets');
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateStatus = async (ticketId: number, status: 'pending' | 'in_progress' | 'resolved') => {
    try {
      await axios.patch(`${baseURL}/api/support/${ticketId}/status`, 
        { status },
        { headers: getAuthHeaders() }
      );
      fetchTickets();
      if (selectedTicket?.id === ticketId) {
        setSelectedTicket({ ...selectedTicket, status });
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to update status');
    }
  };

  const handleSubmitResponse = async () => {
    if (!selectedTicket || !newResponse.trim()) return;
    
    try {
      await axios.post(`${baseURL}/api/support/${selectedTicket.id}/respond`, 
        { message: newResponse },
        { headers: getAuthHeaders() }
      );
      setNewResponse('');
      fetchTickets();
      // Refresh selected ticket
      const res = await axios.get(`${baseURL}/api/support/${selectedTicket.id}`, {
        headers: getAuthHeaders()
      });
      setSelectedTicket(res.data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to submit response');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'in_progress':
        return 'bg-blue-100 text-blue-800';
      case 'resolved':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="p-4 lg:p-6">
      {error && (
        <div className="mb-4 bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg">
          {error}
          <button 
            onClick={() => setError(null)}
            className="ml-2 text-red-500 hover:text-red-700"
          >
            ×
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 lg:gap-6 h-full">
        {/* Tickets List */}
        <div className="xl:col-span-1 bg-white rounded-lg shadow-sm border p-4 lg:p-6">
          <h2 className="text-lg lg:text-xl font-semibold mb-4">Support Tickets</h2>
          
          {isLoading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
            </div>
          ) : tickets.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <div className="text-4xl mb-2">📭</div>
              <p>No tickets found</p>
            </div>
          ) : (
            <div className="space-y-2 max-h-[calc(100vh-200px)] overflow-y-auto">
              {tickets.map(ticket => (
                <div 
                  key={ticket.id}
                  onClick={() => setSelectedTicket(ticket)}
                  className={`p-3 lg:p-4 border rounded-lg cursor-pointer transition-all duration-200 hover:shadow-md ${
                    selectedTicket?.id === ticket.id 
                      ? 'border-blue-500 bg-blue-50 shadow-sm' 
                      : 'hover:bg-gray-50 border-gray-200'
                  }`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-medium text-sm lg:text-base line-clamp-2 flex-1 mr-2">
                      {ticket.title}
                    </h3>
                    <span className={`text-xs px-2 py-1 rounded-full whitespace-nowrap ${getStatusColor(ticket.status)}`}>
                      {ticket.status.replace('_', ' ')}
                    </span>
                  </div>
                  
                  <p className="text-xs lg:text-sm text-gray-500 mb-2 line-clamp-2">
                    {ticket.issue.length > 80 ? `${ticket.issue.substring(0, 80)}...` : ticket.issue}
                  </p>
                  
                  <div className="flex justify-between items-center text-xs text-gray-500">
                    <span>{new Date(ticket.createdAt).toLocaleDateString()}</span>
                    <div className="flex items-center space-x-2">
                      <span className="bg-gray-100 px-2 py-1 rounded text-xs">
                        {ticket.category}
                      </span>
                      <span>{ticket.responses?.length || 0} replies</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Ticket Details */}
        {selectedTicket ? (
          <div className="xl:col-span-2 bg-white rounded-lg shadow-sm border flex flex-col">
            {/* Header */}
            <div className="p-4 lg:p-6 border-b">
              <div className="flex flex-col lg:flex-row lg:justify-between lg:items-start gap-4">
                <div className="flex-1">
                  <h2 className="text-lg lg:text-xl font-semibold mb-2 leading-tight">
                    {selectedTicket.title}
                  </h2>
                  <div className="flex flex-wrap items-center gap-2 text-sm">
                    <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(selectedTicket.status)}`}>
                      {selectedTicket.status.replace('_', ' ')}
                    </span>
                    <span className="text-gray-500">
                      {new Date(selectedTicket.createdAt).toLocaleString()}
                    </span>
                    <span className="bg-gray-100 px-2 py-1 rounded text-xs">
                      {selectedTicket.category}
                    </span>
                  </div>
                </div>
                
                <div className="flex-shrink-0">
                  <select
                    value={selectedTicket.status}
                    onChange={(e) => handleUpdateStatus(
                      selectedTicket.id, 
                      e.target.value as 'pending' | 'in_progress' | 'resolved'
                    )}
                    className="text-sm border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="pending">Pending</option>
                    <option value="in_progress">In Progress</option>
                    <option value="resolved">Resolved</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Issue Description */}
            <div className="p-4 lg:p-6 border-b">
              <h3 className="font-medium text-gray-700 mb-2">Issue Description</h3>
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="whitespace-pre-line text-sm lg:text-base leading-relaxed">
                  {selectedTicket.issue}
                </p>
              </div>
            </div>

            {/* Responses */}
            <div className="flex-1 p-4 lg:p-6 border-b">
              <h3 className="font-medium text-gray-700 mb-4">Conversation</h3>
              
              {selectedTicket.responses?.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <div className="text-3xl mb-2">💬</div>
                  <p>No responses yet</p>
                </div>
              ) : (
                <div className="space-y-4 max-h-80 overflow-y-auto">
                  {selectedTicket.responses?.map(response => (
                    <div 
                      key={response.id}
                      className={`p-4 rounded-lg ${
                        response.isAdminResponse 
                          ? 'bg-blue-50 border border-blue-100 ml-4' 
                          : 'bg-gray-50 border border-gray-100 mr-4'
                      }`}
                    >
                      <div className="flex justify-between items-center mb-2">
                        <span className="font-medium text-sm">
                          {response.user?.full_name || 'User'} 
                          {response.isAdminResponse && (
                            <span className="ml-1 bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                              Admin
                            </span>
                          )}
                        </span>
                        <span className="text-xs text-gray-500">
                          {new Date(response.createdAt).toLocaleString()}
                        </span>
                      </div>
                      <p className="whitespace-pre-line text-sm leading-relaxed">
                        {response.message}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Response Form */}
            <div className="p-4 lg:p-6">
              <h3 className="font-medium text-gray-700 mb-3">Add Response</h3>
              <div className="space-y-3">
                <textarea
                  rows={4}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-vertical"
                  value={newResponse}
                  onChange={(e) => setNewResponse(e.target.value)}
                  placeholder="Type your response here..."
                />
                <div className="flex flex-col sm:flex-row gap-2 sm:justify-between sm:items-center">
                  <span className="text-xs text-gray-500">
                    {newResponse.length}/1000 characters
                  </span>
                  <button
                    onClick={handleSubmitResponse}
                    disabled={!newResponse.trim()}
                    className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white px-6 py-2 rounded-lg transition-colors font-medium"
                  >
                    Send Response
                  </button>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="xl:col-span-2 bg-white rounded-lg shadow-sm border flex items-center justify-center">
            <div className="text-center py-12 text-gray-500">
              <div className="text-6xl mb-4">🎫</div>
              <h3 className="text-lg font-medium mb-2">Select a Ticket</h3>
              <p className="text-sm">Choose a support ticket from the list to view details and respond</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SupportManagement;