import { useState, useEffect } from 'react';
import { Star, Send, CheckCircle, Bell, X, Search, AlertCircle, Loader } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

interface ServiceProvider {
  id: number;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  profileImageUrl?: string | null;
  rating?: number;
  completedRequests?: number;
  address?: string;
  college?: { id: number; name: string };
  location?: string;
}

interface ServiceWithProviders {
  id: number;
  name: string;
  description?: string;
  category?: string;
  createdAt?: string;
  providers: ServiceProvider[];
  providerCount: number;
}

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://mkt-backend-sz2s.onrender.com';

export default function ServicesListComponent() {
  const { user, isAuthenticated, token } = useAuth();
  const navigate = useNavigate();
  const [services, setServices] = useState<ServiceWithProviders[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedService, setSelectedService] = useState<ServiceWithProviders | null>(null);
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [requestDetails, setRequestDetails] = useState({
    description: '',
    budget: '',
    location: '',
    preferredDate: '',
    contactMethod: 'whatsapp' as 'whatsapp' | 'call' | 'sms'
  });
const [submittingRequest, setSubmittingRequest] = useState(false);
const [notificationSent, setNotificationSent] = useState(false);
const [openingTabs, setOpeningTabs] = useState(false);          // NEW LINE
const [tabsOpened, setTabsOpened] = useState(0);                // NEW LINE
const [totalTabs, setTotalTabs] = useState(0);                  // NEW LINE
const [searchQuery, setSearchQuery] = useState('');
  const [filterRating, setFilterRating] = useState(0);
  const [sortBy, setSortBy] = useState('popular');



  // Helper function to get auth headers
  const getAuthHeaders = () => {
    return {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` })
    };
  };

  useEffect(() => {
    fetchServices();
  }, []);

  const fetchServices = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`${API_BASE_URL}/api/all/services`, {
        headers: getAuthHeaders()
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch services: ${response.status}`);
      }

      const allServices = await response.json();

      // Fetch providers for each service
      const servicesWithProviders: ServiceWithProviders[] = [];
      
      for (const service of allServices) {
        try {
          const providerResponse = await fetch(`${API_BASE_URL}/api/all/services/${service.id}`, {
            headers: getAuthHeaders()
          });

          if (providerResponse.ok) {
            const serviceData = await providerResponse.json();
            
            servicesWithProviders.push({
              id: service.id,
              name: service.name,
              description: service.description,
              category: service.category,
              createdAt: service.createdAt,
              providers: serviceData.providers || [],
              providerCount: serviceData.providerCount || (serviceData.providers?.length || 0)
            });
          }
        } catch (err) {
          console.error(`Error fetching providers for service ${service.id}:`, err);
        }
      }

      setServices(servicesWithProviders);
    } catch (err) {
      console.error('Error fetching services:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch services');
    } finally {
      setLoading(false);
    }
  };

  const handleRequestService = (service: ServiceWithProviders) => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    setSelectedService(service);
    setShowRequestModal(true);
  };

  // Enhanced WhatsApp notification with authentication
  const sendWhatsAppNotificationsToAllProviders = async (service: ServiceWithProviders, requestDetails: any) => {
    try {
      if (!service.providers || service.providers.length === 0) {
        throw new Error('No providers available for this service');
      }

      // Get client info from auth context - use the 'id' field which is the primary user_id
      const clientName = user?.full_name || 'Client';
      const clientPhone = user?.contact_phone || 'Not provided';
      const clientUserId = user?.id; // This is the user_id from the users table

      console.log('Client info from auth:', { 
        clientName, 
        clientPhone, 
        clientUserId,
        fullUser: user 
      });

      const requestPayload = {
        serviceId: service.id,
        clientInfo: {
          name: clientName,
          phone: clientPhone,
          userId: clientUserId
        },
        requestDetails: requestDetails
      };

      console.log('Sending WhatsApp request with payload:', requestPayload);

      const response = await fetch(`${API_BASE_URL}/api/services/whatsapp-urls`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(requestPayload)
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to generate WhatsApp URLs: ${response.status} - ${errorText}`);
      }

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || 'Failed to generate WhatsApp URLs');
      }

      console.log('WhatsApp URLs response:', data);
      console.log('Full WhatsApp message to be sent:', data.message);

    // Open WhatsApp URLs in new tabs with improved timing
if (data.urls && data.urls.length > 0) {
  console.log(`Opening ${data.urls.length} WhatsApp tab(s)...`);
  setOpeningTabs(true);
  setTotalTabs(data.urls.length);
  setTabsOpened(0);
  
  const openWhatsAppTabs = async () => {
    for (let i = 0; i < data.urls.length; i++) {
      const urlInfo = data.urls[i];
      
      if (urlInfo.url && urlInfo.isValid) {
        console.log(`Opening WhatsApp for provider ${i + 1}/${data.urls.length}:`, {
          phone: urlInfo.phoneNumber,
          url: urlInfo.url.substring(0, 100) + '...'
        });
        
        const newWindow = window.open(urlInfo.url, '_blank', 'noopener,noreferrer');
        
        if (!newWindow) {
          console.warn(`Failed to open WhatsApp tab for ${urlInfo.phoneNumber}. Check popup blocker.`);
        } else {
          console.log(`✅ Successfully opened WhatsApp for ${urlInfo.phoneNumber}`);
        }
        
        setTabsOpened(i + 1);
        
        // Wait 800ms between each tab to avoid popup blocker
        if (i < data.urls.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 800));
        }
      } else {
        console.warn(`Invalid WhatsApp URL for provider:`, urlInfo);
      }
    }
    
    console.log(`✅ Finished opening ${data.urls.length} WhatsApp tabs`);
    setOpeningTabs(false);
  };
  
  openWhatsAppTabs();
} else {
  console.warn('No valid WhatsApp URLs generated');
}

      return {
        success: true,
        totalProviders: data.totalProviders,
        validProviders: data.validProviders,
        urls: data.urls
      };

    } catch (error) {
      console.error('Error sending WhatsApp notifications:', error);
      throw error;
    }
  };

  // Enhanced batch notification through backend with authentication
  const sendBatchNotificationThroughBackend = async (service: ServiceWithProviders, requestDetails: any) => {
    try {
      // Get client info from auth context
      const clientName = user?.full_name || 'Client';
      const clientPhone = user?.contact_phone || 'Not provided';
      const clientUserId = user?.id; // This is the user_id from the users table

      console.log('Batch notification - Client info from auth:', { 
        clientName, 
        clientPhone, 
        clientUserId 
      });

      const notificationData = {
        serviceId: service.id,
        serviceName: service.name,
        clientInfo: {
          name: clientName,
          phone: clientPhone,
          userId: clientUserId
        },
        requestDetails: {
          description: requestDetails.description,
          location: requestDetails.location,
          budget: requestDetails.budget,
          preferredDate: requestDetails.preferredDate,
          contactMethod: requestDetails.contactMethod
        }
      };

      console.log('Sending batch notification with data:', notificationData);

      const response = await fetch(`${API_BASE_URL}/api/services/notify/batch-enhanced`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(notificationData)
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to send batch notification: ${response.status} - ${errorText}`);
      }

      const result = await response.json();
      console.log('Enhanced batch notification result:', result);
      return result;

    } catch (error) {
      console.error('Error sending batch notification:', error);
      throw error;
    }
  };

  const handleSubmitRequest = async () => {
    if (!selectedService || !requestDetails.description || !requestDetails.location) {
      alert('Please fill in all required fields');
      return;
    }

    if (!isAuthenticated || !user) {
      alert('You must be logged in to submit a request');
      navigate('/login');
      return;
    }

    // Verify user has required info
    if (!user.full_name || !user.contact_phone) {
      alert('Please complete your profile with your name and phone number before requesting services');
      return;
    }

    console.log('Submitting request with user:', { 
      name: user.full_name, 
      phone: user.contact_phone, 
      id: user.id 
    });

    setSubmittingRequest(true);

    try {
      let notificationResult;

      // The batch-enhanced endpoint now creates the service request
      // So we don't need a separate createServiceRequest call
      if (requestDetails.contactMethod === 'whatsapp') {
        // For WhatsApp, we still want to open the tabs
        console.log('Opening WhatsApp tabs for providers...');
        notificationResult = await sendWhatsAppNotificationsToAllProviders(selectedService, requestDetails);
        console.log('WhatsApp URLs generated:', notificationResult);
        
        // But also save to database via backend
        const backendResult = await sendBatchNotificationThroughBackend(selectedService, requestDetails);
        console.log('Backend notification sent:', backendResult);
      } else {
        // For other methods, just use backend
        notificationResult = await sendBatchNotificationThroughBackend(selectedService, requestDetails);
      }

      setNotificationSent(true);
      setSubmittingRequest(false);

      console.log('Service request completed:', {
        service: selectedService.name,
        providersNotified: notificationResult?.totalProviders || selectedService.providerCount,
        contactMethod: requestDetails.contactMethod
      });

      // Reset after 3 seconds
    // Reset after 3 seconds
setTimeout(() => {
  setShowRequestModal(false);
  setNotificationSent(false);
  setOpeningTabs(false);     
  setTabsOpened(0);          
  setTotalTabs(0);          
  setRequestDetails({
    description: '',
    budget: '',
    location: '',
    preferredDate: '',
    contactMethod: 'whatsapp'
  });
  setSelectedService(null);
}, 3000);

    } catch (error) {
      console.error('Error submitting request:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to send notifications';
      alert(`Error: ${errorMessage}`);
      setSubmittingRequest(false);
    }
  };

  const filteredServices = services
    .filter(service => {
      const matchesSearch = service.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           service.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           service.category?.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesRating = filterRating === 0 || service.providers.some(p => (p.rating || 0) >= filterRating);
      return matchesSearch && matchesRating;
    })
    .sort((a, b) => {
      if (sortBy === 'popular') {
        return b.providerCount - a.providerCount;
      } else if (sortBy === 'rating') {
        const avgRatingA = a.providers.length > 0
          ? a.providers.reduce((sum, p) => sum + (p.rating || 0), 0) / a.providers.length
          : 0;
        const avgRatingB = b.providers.length > 0
          ? b.providers.reduce((sum, p) => sum + (p.rating || 0), 0) / b.providers.length
          : 0;
        return avgRatingB - avgRatingA;
      }
      return 0;
    });

const closeModal = () => {
  setShowRequestModal(false);
  setNotificationSent(false);
  setOpeningTabs(false);    
  setTabsOpened(0);          
  setTotalTabs(0);           
  setRequestDetails({
    description: '',
    budget: '',
    location: '',
    preferredDate: '',
    contactMethod: 'whatsapp'
  });
  setSelectedService(null);
};

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-slate-600">Loading services...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-50">
      <div className="container mx-auto px-4 py-6 max-w-6xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-light text-slate-800 mb-2">Available Services</h1>
          <p className="text-slate-600">Browse services and request quotes from multiple providers</p>
          {!isAuthenticated && (
            <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
              <p className="text-blue-700 text-sm">
                💡 <strong>Tip:</strong> Sign in to request services and get quotes from multiple providers at once!
              </p>
            </div>
          )}
        </div>

        {error && (
          <div className="mb-8 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-medium text-red-900">Error Loading Services</h3>
              <p className="text-sm text-red-800 mt-1">{error}</p>
              <button
                onClick={fetchServices}
                className="mt-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm font-medium"
              >
                Try Again
              </button>
            </div>
          </div>
        )}

        {/* Search and Filter Section */}
        <div className="bg-white/80 backdrop-blur-sm p-6 rounded-2xl shadow-sm border border-slate-100/80 mb-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-slate-700 mb-2">Search Services</label>
              <div className="relative">
                <Search className="absolute left-3 top-3 w-5 h-5 text-slate-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by service name..."
                  className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-300 transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Min Rating</label>
              <select
                value={filterRating}
                onChange={(e) => setFilterRating(Number(e.target.value))}
                className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-300 transition-all"
              >
                <option value="0">Any Rating</option>
                <option value="3">3+ Stars</option>
                <option value="4">4+ Stars</option>
                <option value="4.5">4.5+ Stars</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Sort By</label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-300 transition-all"
              >
                <option value="popular">Most Popular</option>
                <option value="rating">Highest Rated</option>
              </select>
            </div>
          </div>
        </div>

        {/* Services Grid */}
        {filteredServices.length === 0 ? (
          <div className="text-center py-16 bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm border border-slate-100/80">
            <Search className="h-16 w-16 text-slate-300 mx-auto mb-4" />
            <h3 className="text-xl font-medium text-slate-900 mb-2">No services found</h3>
            <p className="text-slate-600">Try adjusting your search filters</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredServices.map(service => {
              const avgRating = service.providers.length > 0 
                ? (service.providers.reduce((sum, p) => sum + (p.rating || 0), 0) / service.providers.length).toFixed(1)
                : 'N/A';

              return (
                <div 
                  key={service.id} 
                  className="group bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm hover:shadow-lg transition-all border border-slate-100/80 overflow-hidden"
                >
                  <div className="p-6">
                    {/* Service Header */}
                    <div className="mb-4">
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="text-xl font-semibold text-slate-800 flex-1">{service.name}</h3>
                        {service.category && (
                          <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full font-medium ml-2 flex-shrink-0">
                            {service.category}
                          </span>
                        )}
                      </div>
                      {service.description && (
                        <p className="text-sm text-slate-600 line-clamp-2">{service.description}</p>
                      )}
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-2 gap-3 mb-6">
                      <div className="bg-slate-50/70 rounded-xl p-3 text-center">
                        <div className="flex items-center justify-center mb-1">
                          <Star className="h-4 w-4 text-amber-400 fill-amber-400 mr-1" />
                          <span className="font-medium text-slate-800">{avgRating}</span>
                        </div>
                        <p className="text-xs text-slate-600">Avg Rating</p>
                      </div>

                      <div className="bg-slate-50/70 rounded-xl p-3 text-center">
                        <div className="font-medium text-slate-800 mb-1">
                          {service.providerCount}
                        </div>
                        <p className="text-xs text-slate-600">Providers</p>
                      </div>
                    </div>

                    {/* Top Providers Preview */}
                    {service.providers.length > 0 && (
                      <div className="mb-6">
                        <h4 className="text-sm font-medium text-slate-700 mb-3">Available Providers</h4>
                        <div className="space-y-2 max-h-48 overflow-y-auto">
                          {service.providers.slice(0, 3).map(provider => (
                            <div key={provider.id} className="flex items-center gap-2 p-2 bg-slate-50/70 rounded-lg">
                              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-100 to-slate-100 flex items-center justify-center flex-shrink-0 text-xs font-medium text-slate-600">
                                {provider.firstName?.charAt(0)}{provider.lastName?.charAt(0)}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-xs font-medium text-slate-800 truncate">
                                  {provider.firstName} {provider.lastName}
                                </p>
                                <div className="flex items-center gap-1">
                                  <Star className="h-3 w-3 text-amber-400 fill-amber-400" />
                                  <span className="text-xs text-slate-600">{provider.rating?.toFixed(1) || 'New'}</span>
                                </div>
                              </div>
                            </div>
                          ))}
                          {service.providers.length > 3 && (
                            <p className="text-xs text-slate-500 text-center py-2">
                              +{service.providers.length - 3} more providers
                            </p>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Request Button */}
                    {service.providers.length > 0 ? (
                      <button
                        onClick={() => handleRequestService(service)}
                        disabled={!isAuthenticated}
                        className={`w-full px-4 py-3 rounded-xl shadow-sm font-medium transition-all flex items-center justify-center gap-2 ${
                          isAuthenticated
                            ? 'bg-green-600 text-white hover:bg-green-700'
                            : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        }`}
                      >
                        <Send className="h-4 w-4" />
                        {isAuthenticated 
                          ? `Request Service (Notify ${service.providerCount})`
                          : 'Sign In to Request'
                        }
                      </button>
                    ) : (
                      <div className="w-full px-4 py-3 bg-slate-100 text-slate-400 rounded-xl text-center text-sm">
                        No providers available
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Service Request Modal */}
        {showRequestModal && selectedService && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
              <div className="sticky top-0 bg-white border-b border-slate-100 p-6 flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-slate-900">Request Service</h2>
                  <p className="text-sm text-slate-600 mt-1">{selectedService.name}</p>
                </div>
                <button
                  onClick={closeModal}
                  className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  <X className="h-6 w-6 text-slate-400" />
                </button>
              </div>

              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Service Description *
                  </label>
                  <textarea
                    value={requestDetails.description}
                    onChange={(e) => setRequestDetails({...requestDetails, description: e.target.value})}
                    placeholder="Describe what you need in detail..."
                    rows={4}
                    className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none resize-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Your Location *
                  </label>
                  <input
                    type="text"
                    value={requestDetails.location}
                    onChange={(e) => setRequestDetails({...requestDetails, location: e.target.value})}
                    placeholder="Where are you located?"
                    className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Budget (Optional)
                    </label>
                    <input
                      type="text"
                      value={requestDetails.budget}
                      onChange={(e) => setRequestDetails({...requestDetails, budget: e.target.value})}
                      placeholder="e.g., 5000 KES"
                      className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Preferred Date
                    </label>
                    <input
                      type="date"
                      value={requestDetails.preferredDate}
                      onChange={(e) => setRequestDetails({...requestDetails, preferredDate: e.target.value})}
                      className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Preferred Contact Method
                  </label>
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { value: 'whatsapp', label: 'WhatsApp', icon: '💬' },
                      { value: 'call', label: 'Call', icon: '📞' },
                      { value: 'sms', label: 'SMS', icon: '📧' }
                    ].map(method => (
                      <button
                        key={method.value}
                        type="button"
                        onClick={() => setRequestDetails({...requestDetails, contactMethod: method.value as any})}
                        className={`p-3 rounded-lg border-2 transition-all text-center font-medium text-sm ${
                          requestDetails.contactMethod === method.value
                            ? 'border-blue-500 bg-blue-50 text-blue-600'
                            : 'border-slate-200 text-slate-600 hover:border-slate-300'
                        }`}
                      >
                        <div className="text-xl mb-1">{method.icon}</div>
                        {method.label}
                      </button>
                    ))}
                  </div>
                </div>

                {notificationSent ? (
                  <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                    <div className="flex items-center gap-2 mb-2">
                      <CheckCircle className="h-5 w-5 text-green-600" />
                      <h4 className="font-medium text-green-900">Request Sent Successfully!</h4>
                    </div>
                    <p className="text-sm text-green-800 mb-2">
                      ✅ Your request has been sent to <strong>{selectedService.providerCount} provider(s)</strong>
                      {requestDetails.contactMethod === 'whatsapp' && ' via WhatsApp'}
                    </p>
                    <p className="text-sm text-green-700 mb-2">
                      📝 A separate service request has been created for each provider
                    </p>
                    <p className="text-sm text-green-700 mb-2">
                      📱 Providers will contact you at: <strong>{user?.contact_phone}</strong>
                    </p>
                    <div className="mt-3 pt-3 border-t border-green-200">
                      <p className="text-xs text-green-600">
                        🌐 Track your requests at <strong>quisells.com</strong>
                      </p>
                      <p className="text-xs text-green-600">
                        📧 Questions? Email: <strong>ombongidiaz@gmail.com</strong>
                      </p>
                    </div>
                  </div>
               ) : submittingRequest ? (
  <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
    <div className="flex items-center gap-2 mb-2">
      <Loader className="h-5 w-5 text-yellow-600 animate-spin" />
      <h4 className="font-medium text-yellow-900">Processing Your Request...</h4>
    </div>
    <p className="text-sm text-yellow-800">
      {requestDetails.contactMethod === 'whatsapp' 
        ? `Creating ${selectedService.providerCount} service request(s) and preparing WhatsApp notifications...`
        : `Creating ${selectedService.providerCount} service request(s) and notifying providers...`
      }
    </p>
    {openingTabs && (
      <div className="mt-2 p-2 bg-yellow-100 rounded">
        <p className="text-sm text-yellow-900 font-medium">
          Opening WhatsApp tabs: {tabsOpened} of {totalTabs}
        </p>
        <div className="w-full bg-yellow-200 rounded-full h-2 mt-2">
          <div 
            className="bg-yellow-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${(tabsOpened / totalTabs) * 100}%` }}
          />
        </div>
      </div>
    )}
    {requestDetails.contactMethod === 'whatsapp' && !openingTabs && (
      <p className="text-xs text-yellow-700 mt-2">
        Please allow popups if prompted
      </p>
    )}
  </div>
) : (
                  <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <div className="flex items-center gap-2 mb-2">
                      <Bell className="h-5 w-5 text-blue-600" />
                      <h4 className="font-medium text-blue-900">All Providers Will Be Notified</h4>
                    </div>
                    <p className="text-sm text-blue-800 mb-2">
                      {selectedService.providerCount} provider(s) offering "{selectedService.name}" will receive your request 
                      {requestDetails.contactMethod === 'whatsapp' && ' via WhatsApp'}.
                    </p>
                    <p className="text-sm text-blue-700 mb-2">
                      📋 A separate service request will be created for each provider to ensure proper tracking.
                    </p>
                    {requestDetails.contactMethod === 'whatsapp' && (
  <p className="text-sm text-blue-700">
    💡 <strong>Note:</strong> Multiple WhatsApp tabs will open sequentially (one every 0.8 seconds). Please allow popups in your browser and wait for all tabs to open.
  </p>
)}
                  </div>
                )}

                <button
                  onClick={handleSubmitRequest}
                  disabled={submittingRequest || notificationSent}
                  className="w-full px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed font-medium transition-all flex items-center justify-center gap-2"
                >
                  {submittingRequest ? (
                    <>
                      <Loader className="h-4 w-4 animate-spin" />
                      Processing Request...
                    </>
                  ) : notificationSent ? (
                    <>
                      <CheckCircle className="h-4 w-4" />
                      Request Sent!
                    </>
                  ) : requestDetails.contactMethod === 'whatsapp' ? (
                    `Notify ${selectedService.providerCount} Providers via WhatsApp`
                  ) : (
                    `Send Request to ${selectedService.providerCount} Providers`
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}