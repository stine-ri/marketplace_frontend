import React, { useState } from 'react';
import { HelpCircle, Send, MessageSquare, Shield, Clock, CheckCircle, AlertCircle, User, Search, Filter, Eye, Trash2, MessageCircle, Calendar, Tag } from 'lucide-react';

const HelpSupportComponent = () => {
  const [activeView, setActiveView] = useState<'user' | 'admin'>('user');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [formData, setFormData] = useState({
    title: '',
    issue: '',
    category: '',
    priority: 'medium'
  });

  const [tickets, setTickets] = useState([
    {
      id: 1,
      title: 'Payment not received for completed service',
      issue: 'I completed a web design project 3 days ago but haven\'t received payment yet. The client confirmed the work was satisfactory. Can you help me resolve this payment issue?',
      category: 'payment',
      priority: 'high',
      status: 'pending',
      date: '2024-07-28',
      time: '14:30',
      userType: 'service-provider',
      userName: 'John Smith',
      userEmail: 'john.smith@email.com',
      responses: 0
    },
    {
      id: 2,
      title: 'Product listing not showing in search results',
      issue: 'I uploaded a new handmade jewelry collection yesterday but it\'s not appearing when customers search for jewelry or handmade items. All required fields were filled out correctly.',
      category: 'listing',
      priority: 'medium',
      status: 'in-progress',
      date: '2024-07-27',
      time: '09:15',
      userType: 'seller',
      userName: 'Sarah Johnson',
      userEmail: 'sarah.j@email.com',
      responses: 2
    },
    {
      id: 3,
      title: 'Unable to update profile information',
      issue: 'I\'m trying to update my business address and contact information but the save button is not working. I\'ve tried different browsers with the same result.',
      category: 'technical',
      priority: 'low',
      status: 'resolved',
      date: '2024-07-26',
      time: '16:45',
      userType: 'seller',
      userName: 'Mike Wilson',
      userEmail: 'mike.wilson@email.com',
      responses: 1
    },
    {
      id: 4,
      title: 'Customer dispute resolution needed',
      issue: 'A customer is claiming that the tutoring session was not delivered as promised, but I have all the session recordings and materials. Need help with dispute resolution process.',
      category: 'dispute',
      priority: 'high',
      status: 'pending',
      date: '2024-07-28',
      time: '11:20',
      userType: 'service-provider',
      userName: 'Emily Davis',
      userEmail: 'emily.davis@email.com',
      responses: 0
    },
    {
      id: 5,
      title: 'Commission rate clarification',
      issue: 'I need clarification on the commission structure for premium sellers. The documentation shows different rates and I want to understand which applies to my account.',
      category: 'account',
      priority: 'medium',
      status: 'resolved',
      date: '2024-07-25',
      time: '13:10',
      userType: 'seller',
      userName: 'David Brown',
      userEmail: 'david.brown@email.com',
      responses: 3
    }
  ]);

  const categories = [
    { value: 'payment', label: 'Payment Issues', icon: '💳' },
    { value: 'technical', label: 'Technical Problems', icon: '⚙️' },
    { value: 'account', label: 'Account Settings', icon: '👤' },
    { value: 'listing', label: 'Listing/Service Issues', icon: '📋' },
    { value: 'dispute', label: 'Customer Disputes', icon: '⚖️' },
    { value: 'verification', label: 'Verification Issues', icon: '✅' },
    { value: 'other', label: 'Other', icon: '❓' }
  ];

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmitTicket = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.title && formData.issue) {
      const newTicket = {
        id: tickets.length + 1,
        title: formData.title,
        issue: formData.issue,
        category: formData.category,
        priority: formData.priority,
        status: 'pending',
        date: new Date().toISOString().split('T')[0],
        time: new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' }),
        userType: 'seller',
        userName: 'Current User',
        userEmail: 'user@email.com',
        responses: 0
      };
      setTickets([newTicket, ...tickets]);
      setFormData({ title: '', issue: '', category: '', priority: 'medium' });
    }
  };

  const updateTicketStatus = (ticketId: number, newStatus: string) => {
    setTickets(prev => 
      prev.map(ticket => 
        ticket.id === ticketId 
          ? { ...ticket, status: newStatus }
          : ticket
      )
    );
  };

  const deleteTicket = (ticketId: number) => {
    setTickets(prev => prev.filter(ticket => ticket.id !== ticketId));
  };

  const filteredTickets = tickets.filter(ticket => {
    const matchesSearch = ticket.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         ticket.issue.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         ticket.userName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = filterStatus === 'all' || ticket.status === filterStatus;
    
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'in-progress':
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

  const renderUserView = () => (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Submit Ticket Form */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="bg-blue-100 p-3 rounded-lg">
              <HelpCircle className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Need Help?</h2>
              <p className="text-gray-600">Submit your issue and we'll help you</p>
            </div>
          </div>

          <form onSubmit={handleSubmitTicket} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Issue Title *
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                placeholder="Brief description of your issue"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Issue Category
              </label>
              <select
                value={formData.category}
                onChange={(e) => handleInputChange('category', e.target.value)}
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
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
                rows={6}
                value={formData.issue}
                onChange={(e) => handleInputChange('issue', e.target.value)}
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                placeholder="Please provide as much detail as possible about your issue..."
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Priority Level
              </label>
              <div className="flex gap-4">
                <label className="flex items-center">
                  <input 
                    type="radio" 
                    name="priority" 
                    value="low" 
                    checked={formData.priority === 'low'}
                    onChange={(e) => handleInputChange('priority', e.target.value)}
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
                    onChange={(e) => handleInputChange('priority', e.target.value)}
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
                    onChange={(e) => handleInputChange('priority', e.target.value)}
                    className="text-blue-600" 
                  />
                  <span className="ml-2 text-sm">High</span>
                </label>
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 px-6 rounded-lg font-semibold transition-colors flex items-center justify-center gap-2"
            >
              <Send className="w-4 h-4" />
              Submit Ticket
            </button>
          </form>
        </div>

        {/* Help Resources */}
        <div className="space-y-6">
          {/* Quick Help */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Quick Help</h3>
            <div className="space-y-3">
              <a href="#" className="block p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                <div className="flex items-center gap-3">
                  <MessageSquare className="w-5 h-5 text-blue-600" />
                  <div>
                    <p className="font-medium text-gray-900">FAQ</p>
                    <p className="text-sm text-gray-600">Find answers to common questions</p>
                  </div>
                </div>
              </a>
              <a href="#" className="block p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                <div className="flex items-center gap-3">
                  <User className="w-5 h-5 text-blue-600" />
                  <div>
                    <p className="font-medium text-gray-900">Getting Started Guide</p>
                    <p className="text-sm text-gray-600">Learn how to use our platform</p>
                  </div>
                </div>
              </a>
              <a href="#" className="block p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                <div className="flex items-center gap-3">
                  <Shield className="w-5 h-5 text-blue-600" />
                  <div>
                    <p className="font-medium text-gray-900">Safety Guidelines</p>
                    <p className="text-sm text-gray-600">Stay safe while using our platform</p>
                  </div>
                </div>
              </a>
            </div>
          </div>

          {/* Contact Information */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Contact Us</h3>
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <MessageCircle className="w-5 h-5 text-blue-600" />
                <div>
                  <p className="font-medium text-gray-900">Live Chat</p>
                  <p className="text-sm text-gray-600">Available 24/7</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <HelpCircle className="w-5 h-5 text-blue-600" />
                <div>
                  <p className="font-medium text-gray-900">support@platform.com</p>
                  <p className="text-sm text-gray-600">Email support</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Clock className="w-5 h-5 text-blue-600" />
                <div>
                  <p className="font-medium text-gray-900">Response Time</p>
                  <p className="text-sm text-gray-600">Usually within 2-4 hours</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderAdminView = () => (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Admin Header */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-8">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Support Dashboard</h2>
            <p className="text-gray-600">Manage customer support tickets</p>
          </div>
          
          {/* Filters and Search */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search tickets..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              />
            </div>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="in-progress">In Progress</option>
              <option value="resolved">Resolved</option>
            </select>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">
          <div className="bg-blue-50 p-4 rounded-lg">
            <div className="flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-blue-600" />
              <span className="text-sm font-medium text-blue-600">Total Tickets</span>
            </div>
            <p className="text-2xl font-bold text-blue-900 mt-1">{tickets.length}</p>
          </div>
          <div className="bg-yellow-50 p-4 rounded-lg">
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-yellow-600" />
              <span className="text-sm font-medium text-yellow-600">Pending</span>
            </div>
            <p className="text-2xl font-bold text-yellow-900 mt-1">
              {tickets.filter(t => t.status === 'pending').length}
            </p>
          </div>
          <div className="bg-blue-50 p-4 rounded-lg">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-blue-600" />
              <span className="text-sm font-medium text-blue-600">In Progress</span>
            </div>
            <p className="text-2xl font-bold text-blue-900 mt-1">
              {tickets.filter(t => t.status === 'in-progress').length}
            </p>
          </div>
          <div className="bg-green-50 p-4 rounded-lg">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <span className="text-sm font-medium text-green-600">Resolved</span>
            </div>
            <p className="text-2xl font-bold text-green-900 mt-1">
              {tickets.filter(t => t.status === 'resolved').length}
            </p>
          </div>
        </div>
      </div>

      {/* Tickets List */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Support Tickets</h3>
        </div>
        
        <div className="divide-y divide-gray-200">
          {filteredTickets.length > 0 ? (
            filteredTickets.map(ticket => (
              <div key={ticket.id} className="p-6 hover:bg-gray-50 transition-colors">
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-4">
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-3 mb-2">
                      <h4 className="text-lg font-semibold text-gray-900">{ticket.title}</h4>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(ticket.status)}`}>
                        {ticket.status.replace('-', ' ')}
                      </span>
                      <span className={`text-sm font-medium ${getPriorityColor(ticket.priority)}`}>
                        {ticket.priority} priority
                      </span>
                    </div>
                    
                    <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 mb-3">
                      <div className="flex items-center gap-1">
                        <User className="w-4 h-4" />
                        <span>{ticket.userName} ({ticket.userType.replace('-', ' ')})</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        <span>{ticket.date} at {ticket.time}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Tag className="w-4 h-4" />
                        <span>{categories.find(c => c.value === ticket.category)?.label || 'Other'}</span>
                      </div>
                      {ticket.responses > 0 && (
                        <div className="flex items-center gap-1">
                          <MessageCircle className="w-4 h-4" />
                          <span>{ticket.responses} responses</span>
                        </div>
                      )}
                    </div>
                    
                    <p className="text-gray-600 mb-4 line-clamp-2">{ticket.issue}</p>
                  </div>
                </div>
                
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="flex flex-wrap gap-2">
                    <button className="flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors text-sm font-medium">
                      <Eye className="w-4 h-4" />
                      View Details
                    </button>
                    <button className="flex items-center gap-1 px-3 py-1 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors text-sm font-medium">
                      <MessageCircle className="w-4 h-4" />
                      Reply
                    </button>
                  </div>
                  
                  <div className="flex flex-wrap gap-2">
                    {ticket.status === 'pending' && (
                      <button
                        onClick={() => updateTicketStatus(ticket.id, 'in-progress')}
                        className="px-3 py-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                      >
                        Start Progress
                      </button>
                    )}
                    {ticket.status === 'in-progress' && (
                      <button
                        onClick={() => updateTicketStatus(ticket.id, 'resolved')}
                        className="px-3 py-1 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium"
                      >
                        Mark Resolved
                      </button>
                    )}
                    <button
                      onClick={() => deleteTicket(ticket.id)}
                      className="p-1 text-red-600 hover:bg-red-50 rounded transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="p-12 text-center">
              <MessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No tickets found matching your criteria</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
                {activeView === 'user' ? 'Help & Support' : 'Admin Dashboard'}
              </h1>
              <p className="text-gray-600">
                {activeView === 'user' 
                  ? 'Get help with any issues or questions'
                  : 'Manage customer support tickets and requests'
                }
              </p>
            </div>
            
            {/* View Toggle */}
            <div className="flex gap-2">
              <button
                onClick={() => setActiveView('user')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  activeView === 'user'
                    ? 'bg-blue-100 text-blue-600'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`}
              >
                User View
              </button>
              <button
                onClick={() => setActiveView('admin')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  activeView === 'admin'
                    ? 'bg-blue-100 text-blue-600'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`}
              >
                Admin View
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="py-8">
        {activeView === 'user' ? renderUserView() : renderAdminView()}
      </div>
    </div>
  );
};

export default HelpSupportComponent;