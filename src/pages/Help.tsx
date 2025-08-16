import React, { useState, useEffect } from 'react';
import { 
  HelpCircle, Send, MessageSquare, Shield, Clock, 
  AlertCircle, User, MessageCircle, LogIn 
} from 'lucide-react';
import { useAuth } from '../context/AuthContext'; // Adjust path as needed

interface TicketResponse {
  id: number;
  ticketId: number;
  userId: number;
  message: string;
  isAdminResponse: boolean;
  createdAt: string;
  user?: {
    full_name: string;
    email: string;
    role: string;
  }
}

interface SupportTicket {
  id: number;
  userId: number;
  title: string;
  issue: string;
  category: TicketCategory; 
  priority: 'low' | 'medium' | 'high';
  status: 'pending' | 'in_progress' | 'resolved';
  createdAt: string;
  updatedAt: string;
  responses?: TicketResponse[];
  user?: {
    full_name: string;
    email: string;
    role: string;
  };
}

interface Category {
  value: string;
  label: string;
  icon: string;
}

type TicketCategory = 'payment' | 'technical' | 'account' | 'listing' | 'dispute' | 'verification' | 'other';

const UserHelpSupportComponent = () => {
  // Auth context
  const { user, token, isPublic } = useAuth();
  const isAuthenticated = !!user && !!token;

  const [formData, setFormData] = useState({
    title: '',
    issue: '',
    category: '' as TicketCategory | '', 
    priority: 'medium' as 'low' | 'medium' | 'high'
  });

  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);
  const [newResponse, setNewResponse] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showMyTickets, setShowMyTickets] = useState(false);
  const [showAuthMessage, setShowAuthMessage] = useState(false);

  const categories: Category[] = [
    { value: 'payment', label: 'Payment Issues', icon: '💳' },
    { value: 'technical', label: 'Technical Problems', icon: '⚙️' },
    { value: 'account', label: 'Account Settings', icon: '👤' },
    { value: 'listing', label: 'Listing/Service Issues', icon: '📋' },
    { value: 'dispute', label: 'Customer Disputes', icon: '⚖️' },
    { value: 'verification', label: 'Verification Issues', icon: '✅' },
    { value: 'other', label: 'Other', icon: '❓' }
  ];

  useEffect(() => {
    if (showMyTickets) {
      fetchTickets();
    }
  }, [showMyTickets]);

  const fetchTickets = async () => {
    if (!isAuthenticated) {
      setError('Please login to view your tickets');
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      // Use token from auth context
      const response = await fetch('https://mkt-backend-sz2s.onrender.com/api/support/user-tickets', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch tickets');
      }
      
      const data = await response.json();
      setTickets(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load tickets');
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmitResponse = async () => {
    if (!selectedTicket || !newResponse.trim() || !isAuthenticated) return;
    
    setIsLoading(true);
    try {
      const response = await fetch(`https://mkt-backend-sz2s.onrender.com/api/support/${selectedTicket.id}/respond`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ message: newResponse })
      });
      
      if (!response.ok) {
        throw new Error('Failed to submit response');
      }
      
      setNewResponse('');
      // Refresh the selected ticket to show the new response
      await fetchSingleTicket(selectedTicket.id);
      // Also refresh the tickets list
      fetchTickets();
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit response');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchSingleTicket = async (ticketId: number) => {
    if (!isAuthenticated) return;
    
    try {
      const response = await fetch(`https://mkt-backend-sz2s.onrender.com/api/support/${ticketId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch ticket details');
      }
      
      const data = await response.json();
      setSelectedTicket(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load ticket details');
    }
  };

  const handleSubmitTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Check authentication first
    if (!isAuthenticated) {
      setShowAuthMessage(true);
      return;
    }
    
    // Validate required fields
    if (!formData.title || !formData.issue || !formData.category) {
      setError('Please fill all required fields');
      return;
    }

    // Ensure category is a valid TicketCategory
    const validCategories: TicketCategory[] = ['payment', 'technical', 'account', 'listing', 'dispute', 'verification', 'other'];
    if (!validCategories.includes(formData.category as TicketCategory)) {
      setError('Please select a valid category');
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch('https://mkt-backend-sz2s.onrender.com/api/support', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...formData,
          category: formData.category as TicketCategory
        })
      });
      
      if (!response.ok) {
        throw new Error('Failed to submit ticket');
      }
      
      // Reset form with proper typing
      setFormData({ 
        title: '', 
        issue: '', 
        category: '' as TicketCategory | '',
        priority: 'medium' 
      });
      
      // Refresh tickets if viewing them
      if (showMyTickets) {
        fetchTickets();
      }
      
      // Show success message
      setError(null);
      alert('Ticket submitted successfully!');
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit ticket');
    } finally {
      setIsLoading(false);
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

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'text-red-600';
      case 'medium':
        return 'text-yellow-600';
      case 'low':
        return 'text-green-600';
      default:
        return 'text-gray-600';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 mb-2">
                Help & Support
              </h1>
              <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                <p className="text-sm sm:text-base text-gray-600">
                  Get help with any issues or questions
                </p>
                {isAuthenticated && user && (
                  <div className="flex items-center gap-2 text-xs sm:text-sm text-blue-600 bg-blue-50 px-2 py-1 rounded-full">
                    <User size={14} />
                    <span>{user.full_name || user.email}</span>
                  </div>
                )}
              </div>
            </div>
            
            {/* Toggle to view tickets */}
            <div className="flex gap-2">
              <button
                onClick={() => setShowMyTickets(false)}
                className={`px-3 sm:px-4 py-2 rounded-lg font-medium transition-colors text-sm sm:text-base ${
                  !showMyTickets
                    ? 'bg-blue-100 text-blue-600'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`}
              >
                Submit Ticket
              </button>
              <button
                onClick={() => {
                  if (!isAuthenticated) {
                    setShowAuthMessage(true);
                    return;
                  }
                  setShowMyTickets(true);
                  if (!tickets.length) fetchTickets();
                }}
                className={`px-3 sm:px-4 py-2 rounded-lg font-medium transition-colors text-sm sm:text-base ${
                  showMyTickets
                    ? 'bg-blue-100 text-blue-600'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`}
              >
                My Tickets
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="py-6 sm:py-8">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Error Message */}
          {error && (
            <div className="mb-4 sm:mb-6 p-3 sm:p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg flex items-center justify-between">
              <div className="flex items-center">
                <AlertCircle className="mr-2 flex-shrink-0" size={16} />
                <span className="text-sm sm:text-base">{error}</span>
              </div>
              <button 
                onClick={() => setError(null)} 
                className="text-red-500 hover:text-red-700 ml-2 flex-shrink-0"
              >
                &times;
              </button>
            </div>
          )}

          {/* Authentication Message */}
          {showAuthMessage && (
            <div className="mb-4 sm:mb-6 p-3 sm:p-4 bg-blue-50 border border-blue-200 text-blue-700 rounded-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <LogIn className="mr-2 flex-shrink-0" size={16} />
                  <div>
                    <p className="font-medium text-sm sm:text-base">Authentication Required</p>
                    <p className="text-xs sm:text-sm">Please login or register to submit support tickets and view your ticket history.</p>
                  </div>
                </div>
                <button 
                  onClick={() => setShowAuthMessage(false)} 
                  className="text-blue-500 hover:text-blue-700 ml-2 flex-shrink-0"
                >
                  &times;
                </button>
              </div>
              <div className="mt-3 flex gap-2">
                <a 
                  href="/login" 
                  className="inline-flex items-center px-3 py-1.5 bg-blue-600 text-white text-xs rounded-md hover:bg-blue-700 transition-colors"
                >
                  Login
                </a>
                <a 
                  href="/register" 
                  className="inline-flex items-center px-3 py-1.5 border border-blue-600 text-blue-600 text-xs rounded-md hover:bg-blue-50 transition-colors"
                >
                  Register
                </a>
              </div>
            </div>
          )}
          
          {!showMyTickets ? (
            /* Submit Ticket View */
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
              {/* Submit Ticket Form */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 sm:p-6">
                <div className="flex items-center gap-3 mb-4 sm:mb-6">
                  <div className="bg-blue-100 p-2 sm:p-3 rounded-lg">
                    <HelpCircle className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" />
                  </div>
                  <div>
                    <h2 className="text-lg sm:text-2xl font-bold text-gray-900">Need Help?</h2>
                    <p className="text-sm sm:text-base text-gray-600">Submit your issue and we'll help you</p>
                  </div>
                </div>

                <form onSubmit={handleSubmitTicket} className="space-y-4 sm:space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Issue Title *
                    </label>
                    <input
                      type="text"
                      value={formData.title}
                      onChange={(e) => handleInputChange('title', e.target.value)}
                      className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-sm sm:text-base"
                      placeholder="Brief description of your issue"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Issue Category *
                    </label>
                    <select
                      value={formData.category}
                      onChange={(e) => {
                        const value = e.target.value;
                        if (value === '' || categories.some(c => c.value === value)) {
                          handleInputChange('category', value as TicketCategory | '');
                        }
                      }}
                      className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-sm sm:text-base"
                      required
                    >
                      <option value="">Select category</option>
                      {categories.map(category => (
                        <option key={category.value} value={category.value}>
                          {category.icon} {category.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Describe Your Issue *
                    </label>
                    <textarea
                      rows={5}
                      value={formData.issue}
                      onChange={(e) => handleInputChange('issue', e.target.value)}
                      className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-sm sm:text-base"
                      placeholder="Please provide as much detail as possible about your issue..."
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Priority Level
                    </label>
                    <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                      <label className="flex items-center">
                        <input 
                          type="radio" 
                          name="priority" 
                          value="low" 
                          checked={formData.priority === 'low'}
                          onChange={(e) => handleInputChange('priority', e.target.value as any)}
                          className="text-blue-600" 
                        />
                        <span className="ml-2 text-sm">Low</span>
                      </label>
                      <label className="flex items-center">
                        <input 
                          type="radio" 
                          name="priority" 
                          value="medium" 
                          checked={formData.priority === 'medium'}
                          onChange={(e) => handleInputChange('priority', e.target.value as any)}
                          className="text-blue-600" 
                        />
                        <span className="ml-2 text-sm">Medium</span>
                      </label>
                      <label className="flex items-center">
                        <input 
                          type="radio" 
                          name="priority" 
                          value="high" 
                          checked={formData.priority === 'high'}
                          onChange={(e) => handleInputChange('priority', e.target.value as any)}
                          className="text-blue-600" 
                        />
                        <span className="ml-2 text-sm">High</span>
                      </label>
                    </div>
                  </div>

                  <button
                    type="submit"
                    className={`w-full py-2 sm:py-3 px-4 sm:px-6 rounded-lg font-semibold transition-colors flex items-center justify-center gap-2 text-sm sm:text-base ${
                      isAuthenticated 
                        ? 'bg-blue-600 hover:bg-blue-700 text-white' 
                        : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    }`}
                    disabled={isLoading || !isAuthenticated}
                  >
                    {isLoading ? (
                      <span className="animate-spin">↻</span>
                    ) : (
                      <>
                        <Send className="w-4 h-4" />
                        {isAuthenticated ? 'Submit Ticket' : 'Login to Submit'}
                      </>
                    )}
                  </button>
                </form>
              </div>

              {/* Help Resources */}
              <div className="space-y-6">
                {/* Quick Help */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 sm:p-6">
                  <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4">Quick Help</h3>
                  <div className="space-y-3">
                    <a href="#" className="block p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                      <div className="flex items-center gap-3">
                        <MessageSquare className="w-5 h-5 text-blue-600 flex-shrink-0" />
                        <div>
                          <p className="font-medium text-gray-900 text-sm sm:text-base">FAQ</p>
                          <p className="text-xs sm:text-sm text-gray-600">Find answers to common questions</p>
                        </div>
                      </div>
                    </a>
                    <a href="#" className="block p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                      <div className="flex items-center gap-3">
                        <User className="w-5 h-5 text-blue-600 flex-shrink-0" />
                        <div>
                          <p className="font-medium text-gray-900 text-sm sm:text-base">Getting Started Guide</p>
                          <p className="text-xs sm:text-sm text-gray-600">Learn how to use our platform</p>
                        </div>
                      </div>
                    </a>
                    <a href="#" className="block p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                      <div className="flex items-center gap-3">
                        <Shield className="w-5 h-5 text-blue-600 flex-shrink-0" />
                        <div>
                          <p className="font-medium text-gray-900 text-sm sm:text-base">Safety Guidelines</p>
                          <p className="text-xs sm:text-sm text-gray-600">Stay safe while using our platform</p>
                        </div>
                      </div>
                    </a>
                  </div>
                </div>

                {/* Contact Information */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 sm:p-6">
                  <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4">Contact Us</h3>
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <MessageCircle className="w-5 h-5 text-blue-600 flex-shrink-0" />
                      <div>
                        <p className="font-medium text-gray-900 text-sm sm:text-base">Live Chat</p>
                        <p className="text-xs sm:text-sm text-gray-600">Available 24/7</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <HelpCircle className="w-5 h-5 text-blue-600 flex-shrink-0" />
                      <div>
                        <p className="font-medium text-gray-900 text-sm sm:text-base">support@platform.com</p>
                        <p className="text-xs sm:text-sm text-gray-600">Email support</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Clock className="w-5 h-5 text-blue-600 flex-shrink-0" />
                      <div>
                        <p className="font-medium text-gray-900 text-sm sm:text-base">Response Time</p>
                        <p className="text-xs sm:text-sm text-gray-600">Usually within 2-4 hours</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            /* My Tickets View */
            showMyTickets && !selectedTicket ? (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="p-4 sm:p-6 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">My Support Tickets</h3>
              </div>
              
              <div className="divide-y divide-gray-200">
                {isLoading ? (
                  <div className="p-8 sm:p-12 text-center">
                    <div className="animate-spin rounded-full h-8 w-8 sm:h-12 sm:w-12 border-t-2 border-b-2 border-blue-500 mx-auto mb-4"></div>
                    <p className="text-gray-500 text-sm sm:text-base">Loading tickets...</p>
                  </div>
                ) : tickets.length > 0 ? (
                  tickets.map(ticket => (
                    <div 
                      key={ticket.id} 
                      className="p-4 sm:p-6 hover:bg-gray-50 cursor-pointer transition-colors"
                      onClick={() => fetchSingleTicket(ticket.id)}
                    >
                      <div className="flex flex-col gap-3 mb-4">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                          <h4 className="text-base sm:text-lg font-semibold text-gray-900">{ticket.title}</h4>
                          <div className="flex flex-wrap gap-2">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(ticket.status)}`}>
                              {ticket.status.replace('_', ' ')}
                            </span>
                            <span className={`text-xs sm:text-sm font-medium ${getPriorityColor(ticket.priority)}`}>
                              {ticket.priority} priority
                            </span>
                          </div>
                        </div>
                        
                        <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-xs sm:text-sm text-gray-500">
                          <span>Category: {categories.find(c => c.value === ticket.category)?.label || 'Other'}</span>
                          <span>•</span>
                          <span>Created: {new Date(ticket.createdAt).toLocaleDateString()}</span>
                          {ticket.responses && ticket.responses.length > 0 && (
                            <>
                              <span>•</span>
                              <span>{ticket.responses.length} responses</span>
                            </>
                          )}
                        </div>
                        
                        <p className="text-sm sm:text-base text-gray-600 line-clamp-2">{ticket.issue}</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-8 sm:p-12 text-center">
                    <MessageSquare className="w-8 h-8 sm:w-12 sm:h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500 text-sm sm:text-base">No tickets found</p>
                    <button
                      onClick={() => setShowMyTickets(false)}
                      className="mt-4 text-blue-600 hover:text-blue-700 font-medium text-sm sm:text-base"
                    >
                      Submit your first ticket
                    </button>
                  </div>
                )}
              </div>
            </div>
          ) : showMyTickets && selectedTicket ? (
            /* Ticket Detail View */
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              {/* Header */}
              <div className="p-4 sm:p-6 border-b border-gray-200">
                <div className="flex items-center justify-between mb-4">
                  <button
                    onClick={() => setSelectedTicket(null)}
                    className="text-blue-600 hover:text-blue-700 font-medium text-sm"
                  >
                    ← Back to tickets
                  </button>
                </div>
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
                      <span className={`text-xs font-medium ${getPriorityColor(selectedTicket.priority)}`}>
                        {selectedTicket.priority} priority
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Issue Description */}
              <div className="p-4 sm:p-6 border-b border-gray-200">
                <h3 className="font-medium text-gray-700 mb-2">Issue Description</h3>
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="whitespace-pre-line text-sm lg:text-base leading-relaxed">
                    {selectedTicket.issue}
                  </p>
                </div>
              </div>

              {/* Responses */}
              <div className="p-4 sm:p-6 border-b border-gray-200 max-h-96 overflow-y-auto">
                <h3 className="font-medium text-gray-700 mb-4">Conversation</h3>
                
                {selectedTicket.responses?.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <div className="text-3xl mb-2">💬</div>
                    <p>No responses yet</p>
                  </div>
                ) : (
                  <div className="space-y-4">
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
              {selectedTicket.status !== 'resolved' && (
                <div className="p-4 sm:p-6">
                  <h3 className="font-medium text-gray-700 mb-3">Add Response</h3>
                  <div className="space-y-3">
                    <textarea
                      rows={4}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-vertical"
                      value={newResponse}
                      onChange={(e) => setNewResponse(e.target.value)}
                      placeholder="Type your response here..."
                      maxLength={1000}
                    />
                    <div className="flex flex-col sm:flex-row gap-2 sm:justify-between sm:items-center">
                      <span className="text-xs text-gray-500">
                        {newResponse.length}/1000 characters
                      </span>
                      <button
                        onClick={handleSubmitResponse}
                        disabled={!newResponse.trim() || isLoading}
                        className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white px-6 py-2 rounded-lg transition-colors font-medium"
                      >
                        {isLoading ? 'Sending...' : 'Send Response'}
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ) : null
          )}
        </div>
      </div>
    </div>
  );
};

// Export the component as default
export default UserHelpSupportComponent;