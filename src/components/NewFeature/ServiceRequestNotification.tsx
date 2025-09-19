// components/EnhancedServiceRequestNotifications.tsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useWebSocketContext } from '../../context/WebSocketContext';
import { toast } from 'react-toastify';
import { 
  BellIcon,
  CheckIcon,
  XMarkIcon,
  ChatBubbleLeftRightIcon,
  ClockIcon,
  CurrencyDollarIcon,
  UserIcon,
  PaperAirplaneIcon,
  EnvelopeIcon,
  PhoneIcon,
  ArrowPathIcon,
  BellAlertIcon,
  WifiIcon,
  
} from '@heroicons/react/24/outline';
import { useNavigate } from 'react-router-dom';
import type { ServiceRequest } from '../../types/types';


interface NotificationPreferences {
  emailNotifications: boolean;
  browserNotifications: boolean;
  soundNotifications: boolean;
  smsNotifications: boolean;
}

const EnhancedServiceRequestNotifications: React.FC = () => {
  const { user } = useAuth();
  const { 
    isConnected: isWsConnected, 
    sendMessage: sendWsMessage,
    connectionError: wsError,
    reconnect: reconnectWs
  } = useWebSocketContext();
  const navigate = useNavigate();
  
  const [requests, setRequests] = useState<ServiceRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [respondingTo, setRespondingTo] = useState<number | null>(null);
  const [showPreferences, setShowPreferences] = useState(false);
  const [preferences, setPreferences] = useState<NotificationPreferences>({
    emailNotifications: true,
    browserNotifications: true,
    soundNotifications: true,
    smsNotifications: false
  });
  const [unreadCount, setUnreadCount] = useState(0);
  const [lastNotificationTime, setLastNotificationTime] = useState<Date | null>(null);
  const [expandedRequest, setExpandedRequest] = useState<number | null>(null);
  const [realTimeUpdates, setRealTimeUpdates] = useState(true);

  const baseURL = import.meta.env.VITE_API_BASE_URL || 'https://mkt-backend-sz2s.onrender.com';

  // Check browser notification permissions
  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
    
    // Load saved preferences
    const savedPreferences = localStorage.getItem('notificationPreferences');
    if (savedPreferences) {
      setPreferences(JSON.parse(savedPreferences));
    }
  }, []);

  const fetchServiceRequests = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${baseURL}/api/service-requests`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setRequests(data.data || []);
        
        // Calculate unread count (requests from the last 24 hours)
        const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
        const newRequests = data.data.filter((req: ServiceRequest) => 
          new Date(req.createdAt) > twentyFourHoursAgo && req.status === 'pending'
        );
        setUnreadCount(newRequests.length);
        
        // Check for new requests since last notification
        if (lastNotificationTime && preferences.browserNotifications) {
          const newRequestsSinceLast = data.data.filter((req: ServiceRequest) => 
            new Date(req.createdAt) > lastNotificationTime && req.status === 'pending'
          );
          
          if (newRequestsSinceLast.length > 0) {
            showBrowserNotification(newRequestsSinceLast.length);
          }
        }
        
        setLastNotificationTime(new Date());
      } else {
        console.error('Failed to fetch service requests:', response.status);
      }
    } catch (error) {
      console.error('Error fetching service requests:', error);
    } finally {
      setLoading(false);
    }
  };

  // Listen for real-time service request updates via WebSocket
  useEffect(() => {
    if (isWsConnected && realTimeUpdates) {
      // Subscribe to service request updates
      sendWsMessage({
        type: 'subscribe',
        channel: 'service_requests',
        userId: user?.id
      });
      
      // Listen for incoming service request notifications
      const handleServiceRequestUpdate = (event: MessageEvent) => {
        try {
          const data = JSON.parse(event.data);
          
          if (data.type === 'service_request_update') {
            const updatedRequest = data.data;
            
            setRequests(prev => prev.map(req => 
              req.id === updatedRequest.id ? updatedRequest : req
            ));
            
            // Show notification for new requests
            if (updatedRequest.status === 'pending' && 
                new Date(updatedRequest.createdAt) > new Date(Date.now() - 60000)) {
              showBrowserNotification(1, updatedRequest);
            }
          }
        } catch (error) {
          console.error('Error processing WebSocket message:', error);
        }
      };
      
      // Add event listener (this would need to be integrated with your WebSocket hook)
      // For now, we'll use polling as fallback
    }
  }, [isWsConnected, realTimeUpdates, user?.id, sendWsMessage]);

  // Fallback to polling if WebSocket is not available
  useEffect(() => {
    fetchServiceRequests();
    
    const interval = setInterval(() => {
      if (!isWsConnected || !realTimeUpdates) {
        fetchServiceRequests();
      }
    }, 30000); // Poll every 30 seconds if no WebSocket
    
    return () => clearInterval(interval);
  }, [isWsConnected, realTimeUpdates]);

  const showBrowserNotification = (count: number, request?: ServiceRequest) => {
    if ('Notification' in window && Notification.permission === 'granted' && preferences.browserNotifications) {
      const notification = new Notification(
        request 
          ? `New Service Request: ${request.requestTitle}`
          : `You have ${count} new service request${count > 1 ? 's' : ''}`,
        {
          body: request 
            ? `From ${request.client.full_name} - ${request.service.name}`
            : 'Click to view your service requests',
          icon: '/logo192.png',
          tag: 'service-request'
        }
      );
      
      notification.onclick = () => {
        window.focus();
        notification.close();
        navigate('/service-requests');
      };
    }
    
    if (preferences.soundNotifications) {
      playNotificationSound();
    }
  };

  const playNotificationSound = () => {
    // Create a simple notification sound using the Web Audio API
    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      oscillator.frequency.value = 800;
      gainNode.gain.value = 0.1;
      
      oscillator.start();
      gainNode.gain.exponentialRampToValueAtTime(0.00001, audioContext.currentTime + 0.5);
      
      setTimeout(() => {
        oscillator.stop();
      }, 500);
    } catch (error) {
      console.log('Audio context not supported');
    }
  };

  const handleResponse = async (requestId: number, action: 'accept' | 'decline', response?: string) => {
    setRespondingTo(requestId);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${baseURL}/api/service-requests/${requestId}/respond`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ action, response })
      });

      const data = await res.json();

      if (res.ok) {
        toast.success(`Request ${action === 'accept' ? 'accepted' : 'declined'} successfully!`);
        
        // Update local state
        setRequests(prev => prev.map(req => 
          req.id === requestId 
            ? { ...req, status: action === 'accept' ? 'accepted' : 'declined' }
            : req
        ));

        // Send WebSocket notification about the response
        if (isWsConnected) {
          sendWsMessage({
            type: 'service_request_response',
            requestId,
            action,
            response
          });
        }

        // If accepted and chat room created
        if (action === 'accept' && data.data.chatRoom) {
          toast.info('Chat room created! You can now discuss details.');
        }
      } else {
        toast.error(data.error || `Failed to ${action} request`);
      }
    } catch (error) {
      console.error('Error responding to request:', error);
      toast.error('Network error occurred');
    } finally {
      setRespondingTo(null);
    }
  };

  const sendQuickMessage = async (requestId: number, message: string) => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${baseURL}/api/service-requests/${requestId}/message`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ message })
      });

      if (res.ok) {
        toast.success('Message sent successfully!');
        
        // Send via WebSocket if available for real-time delivery
        if (isWsConnected) {
          sendWsMessage({
            type: 'service_request_message',
            requestId,
            message
          });
        }
      } else {
        toast.error('Failed to send message');
      }
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Network error occurred');
    }
  };

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'urgent': return 'bg-red-100 text-red-800 border-red-200';
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'normal': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'low': return 'bg-gray-100 text-gray-800 border-gray-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const formatBudget = (min?: string, max?: string) => {
    if (!min && !max) return 'Budget not specified';
    if (min && max) return `KSh ${min} - ${max}`;
    if (min) return `KSh ${min}+`;
    return `Up to KSh ${max}`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const navigateToChat = (chatRoomId: number) => {
    navigate(`/chat/${chatRoomId}`);
  };

  const savePreferences = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${baseURL}/api/notification-preferences`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(preferences)
      });

      if (response.ok) {
        localStorage.setItem('notificationPreferences', JSON.stringify(preferences));
        toast.success('Notification preferences saved!');
        setShowPreferences(false);
      } else {
        toast.error('Failed to save preferences');
      }
    } catch (error) {
      console.error('Error saving preferences:', error);
      toast.error('Failed to save preferences');
    }
  };

  const toggleExpandRequest = (requestId: number) => {
    setExpandedRequest(expandedRequest === requestId ? null : requestId);
  };

  const toggleRealTimeUpdates = () => {
    setRealTimeUpdates(!realTimeUpdates);
    toast.info(`Real-time updates ${!realTimeUpdates ? 'enabled' : 'disabled'}`);
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-gray-200 rounded w-1/4"></div>
          <div className="space-y-3">
            <div className="h-20 bg-gray-200 rounded"></div>
            <div className="h-20 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  // Filter requests based on user role
  const filteredRequests = requests.filter(request => {
    if (user?.role === 'service_provider') {
      return request.status === 'pending' || request.status === 'accepted';
    } else if (user?.role === 'client') {
      return request.client.id === user.id;
    }
    return true;
  });

  const pendingRequests = filteredRequests.filter(req => req.status === 'pending');

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center">
              <BellIcon className="h-5 w-5 mr-2 text-blue-500" />
              Service Requests
              {unreadCount > 0 && (
                <span className="ml-2 bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                  {unreadCount} new
                </span>
              )}
            </h2>
            
            {/* Connection status indicator */}
            <div className="ml-4 flex items-center">
              {isWsConnected ? (
                <span className="flex items-center text-green-600 text-sm">
                  <WifiIcon className="h-4 w-4 mr-1" />
                  Live
                </span>
              ) : (
                <span className="flex items-center text-gray-500 text-sm">
                  <WifiIcon  className="h-4 w-4 mr-1" />
                  Polling
                </span>
              )}
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            {/* Real-time toggle */}
            <button
              onClick={toggleRealTimeUpdates}
              className={`p-2 rounded-full ${
                realTimeUpdates 
                  ? 'bg-blue-100 text-blue-600' 
                  : 'bg-gray-100 text-gray-600'
              }`}
              title={realTimeUpdates ? 'Disable real-time updates' : 'Enable real-time updates'}
            >
              <ArrowPathIcon className="h-4 w-4" />
            </button>
            
            <button
              onClick={() => setShowPreferences(true)}
              className="p-2 text-gray-500 hover:text-gray-700 rounded-full hover:bg-gray-100"
              title="Notification preferences"
            >
              <BellAlertIcon className="h-5 w-5" />
            </button>
            
            <button
              onClick={fetchServiceRequests}
              className="p-2 text-gray-500 hover:text-gray-700 rounded-full hover:bg-gray-100"
              title="Refresh requests"
            >
              <ArrowPathIcon className="h-5 w-5" />
            </button>
          </div>
        </div>
        
        {/* WebSocket connection error */}
        {wsError && (
          <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md">
            <p className="text-red-700 text-sm">
              Connection issue: {wsError}. 
              <button 
                onClick={reconnectWs}
                className="ml-2 text-red-800 underline"
              >
                Try to reconnect
              </button>
            </p>
          </div>
        )}
      </div>

      {/* Notification Preferences Modal */}
      {showPreferences && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Notification Preferences</h3>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <label htmlFor="browserNotifications" className="text-sm font-medium text-gray-700">
                  Browser Notifications
                </label>
                <input
                  type="checkbox"
                  id="browserNotifications"
                  checked={preferences.browserNotifications}
                  onChange={(e) => setPreferences({...preferences, browserNotifications: e.target.checked})}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
              </div>
              
              <div className="flex items-center justify-between">
                <label htmlFor="soundNotifications" className="text-sm font-medium text-gray-700">
                  Sound Alerts
                </label>
                <input
                  type="checkbox"
                  id="soundNotifications"
                  checked={preferences.soundNotifications}
                  onChange={(e) => setPreferences({...preferences, soundNotifications: e.target.checked})}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
              </div>
              
              <div className="flex items-center justify-between">
                <label htmlFor="emailNotifications" className="text-sm font-medium text-gray-700">
                  Email Notifications
                </label>
                <input
                  type="checkbox"
                  id="emailNotifications"
                  checked={preferences.emailNotifications}
                  onChange={(e) => setPreferences({...preferences, emailNotifications: e.target.checked})}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
              </div>
              
              <div className="flex items-center justify-between">
                <label htmlFor="smsNotifications" className="text-sm font-medium text-gray-700">
                  SMS Notifications
                </label>
                <input
                  type="checkbox"
                  id="smsNotifications"
                  checked={preferences.smsNotifications}
                  onChange={(e) => setPreferences({...preferences, smsNotifications: e.target.checked})}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
              </div>
            </div>
            
            <div className="mt-6 flex justify-end space-x-3">
              <button
                onClick={() => setShowPreferences(false)}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
              >
                Cancel
              </button>
              <button
                onClick={savePreferences}
                className="px-4 py-2 text-white bg-blue-600 rounded-md hover:bg-blue-700"
              >
                Save Preferences
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="divide-y divide-gray-200">
        {filteredRequests.length === 0 ? (
          <div className="p-8 text-center">
            <BellIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No service requests yet</h3>
            <p className="text-gray-500">Service requests will appear here</p>
          </div>
        ) : (
          filteredRequests.map((request) => {
            const isNew = new Date(request.createdAt) > new Date(Date.now() - 24 * 60 * 60 * 1000);
            
            return (
              <div key={request.id} className={`p-6 hover:bg-gray-50 transition-colors ${isNew ? 'bg-blue-50' : ''}`}>
                {isNew && (
                  <div className="mb-3 flex items-center">
                    <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                      New
                    </span>
                    {isWsConnected && realTimeUpdates && (
                      <span className="ml-2 bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                        Live
                      </span>
                    )}
                  </div>
                )}
                
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    {user?.role === 'service_provider' ? (
                      <>
                        {request.client.avatar ? (
                          <img 
                            src={request.client.avatar} 
                            alt={request.client.full_name}
                            className="h-10 w-10 rounded-full object-cover"
                          />
                        ) : (
                          <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                            <UserIcon className="h-6 w-6 text-gray-500" />
                          </div>
                        )}
                        <div>
                          <h3 className="font-medium text-gray-900">{request.requestTitle}</h3>
                          <p className="text-sm text-gray-500">from {request.client.full_name}</p>
                        </div>
                      </>
                    ) : (
                      <>
                        {request.provider?.avatar ? (
                          <img 
                            src={request.provider.avatar} 
                            alt={request.provider.full_name}
                            className="h-10 w-10 rounded-full object-cover"
                          />
                        ) : (
                          <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                            <UserIcon className="h-6 w-6 text-gray-500" />
                          </div>
                        )}
                        <div>
                          <h3 className="font-medium text-gray-900">{request.requestTitle}</h3>
                          <p className="text-sm text-gray-500">to {request.provider?.full_name || 'Provider'}</p>
                        </div>
                      </>
                    )}
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full border ${getUrgencyColor(request.urgency)}`}>
                      {request.urgency.charAt(0).toUpperCase() + request.urgency.slice(1)}
                    </span>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                      request.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                      request.status === 'accepted' ? 'bg-green-100 text-green-800' :
                      request.status === 'declined' ? 'bg-red-100 text-red-800' :
                      'bg-blue-100 text-blue-800'
                    }`}>
                      {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                    </span>
                  </div>
                </div>

                <div className="mb-4">
                  <div className="flex items-center text-sm text-gray-600 mb-2">
                    <span className="font-medium text-blue-600">{request.service.name}</span>
                  </div>
                  
                  {request.description && (
                    <p className="text-sm text-gray-700 mb-2">{request.description}</p>
                  )}

                  <div className="flex flex-wrap gap-4 text-xs text-gray-500">
                    <div className="flex items-center">
                      <CurrencyDollarIcon className="h-4 w-4 mr-1" />
                      {formatBudget(request.budgetMin, request.budgetMax)}
                    </div>
                    
                    {request.deadline && (
                      <div className="flex items-center">
                        <ClockIcon className="h-4 w-4 mr-1" />
                        Due: {formatDate(request.deadline)}
                      </div>
                    )}
                    
                    <div>
                      Requested: {formatDate(request.createdAt)}
                    </div>
                  </div>

                  {request.clientNotes && (
                    <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                      <p className="text-sm text-gray-700">
                        <span className="font-medium">Client notes:</span> {request.clientNotes}
                      </p>
                    </div>
                  )}
                </div>

                {/* Contact Information for Providers */}
                {user?.role === 'service_provider' && request.status === 'pending' && request.client && (
                  <div className="mb-4 p-3 bg-blue-50 rounded-lg">
                    <p className="text-xs text-blue-700 font-medium mb-2">Client Contact Information:</p>
                    <div className="flex space-x-3">
                      {request.client.email && (
                        <a 
                          href={`mailto:${request.client.email}`}
                          className="flex items-center text-xs text-blue-600 hover:text-blue-800"
                        >
                          <EnvelopeIcon className="h-4 w-4 mr-1" />
                          Email
                        </a>
                      )}
                      {request.client.phone && (
                        <a 
                          href={`tel:${request.client.phone}`}
                          className="flex items-center text-xs text-blue-600 hover:text-blue-800"
                        >
                          <PhoneIcon className="h-4 w-4 mr-1" />
                          Call
                        </a>
                      )}
                    </div>
                  </div>
                )}

                {user?.role === 'service_provider' && request.status === 'pending' ? (
                  <div className="space-y-3">
                    <div className="flex space-x-3">
                      <button
                        onClick={() => handleResponse(request.id, 'accept')}
                        disabled={respondingTo === request.id}
                        className="flex-1 px-4 py-2 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 disabled:opacity-50 flex items-center justify-center transition-colors"
                      >
                        {respondingTo === request.id ? (
                          <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                        ) : (
                          <CheckIcon className="h-4 w-4 mr-2" />
                        )}
                        Accept
                      </button>
                      <button
                        onClick={() => handleResponse(request.id, 'decline')}
                        disabled={respondingTo === request.id}
                        className="flex-1 px-4 py-2 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700 disabled:opacity-50 flex items-center justify-center transition-colors"
                      >
                        <XMarkIcon className="h-4 w-4 mr-2" />
                        Decline
                      </button>
                    </div>
                    
                    {/* Quick Message Options */}
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <p className="text-xs text-gray-600 mb-2">Quick responses:</p>
                      <div className="flex flex-wrap gap-2">
                        <button
                          onClick={() => sendQuickMessage(request.id, "I'm interested in your request. Can we discuss the details?")}
                          className="px-3 py-1 text-xs bg-white border border-gray-200 rounded-md hover:bg-gray-50"
                        >
                          Interested
                        </button>
                        <button
                          onClick={() => sendQuickMessage(request.id, "I need more information about this request.")}
                          className="px-3 py-1 text-xs bg-white border border-gray-200 rounded-md hover:bg-gray-50"
                        >
                          Need more info
                        </button>
                        <button
                          onClick={() => sendQuickMessage(request.id, "I'm available to start on this soon.")}
                          className="px-3 py-1 text-xs bg-white border border-gray-200 rounded-md hover:bg-gray-50"
                        >
                          Available soon
                        </button>
                      </div>
                    </div>
                  </div>
                ) : request.status === 'accepted' && request.chatRoom ? (
                  <button
                    onClick={() => navigateToChat(request.chatRoom!.id)}
                    className="w-full px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 flex items-center justify-center transition-colors"
                  >
                    <ChatBubbleLeftRightIcon className="h-4 w-4 mr-2" />
                    Go to Chat
                  </button>
                ) : user?.role === 'client' && request.status === 'pending' ? (
                  <div className="text-sm text-gray-500 italic">
                    <PaperAirplaneIcon className="h-4 w-4 inline mr-1" />
                    Request sent - waiting for provider response
                  </div>
                ) : (
                  <div className="text-sm text-gray-500 italic">
                    {request.status === 'accepted' ? 'Request accepted' :
                    request.status === 'declined' ? 'Request declined' :
                    'Request completed'}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default EnhancedServiceRequestNotifications;