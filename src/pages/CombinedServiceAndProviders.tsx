// import { useState, useEffect } from 'react';
// import { Link, useNavigate } from 'react-router-dom';
// import { Star, Send, CheckCircle, Bell, X, Search, AlertCircle, Loader, Filter, ChevronDown, Phone, Eye, Building2, MapPin, User } from 'lucide-react';
// import { useAuth } from '../context/AuthContext';
// import { useToast } from '../context/ToastContext';
// import DirectServiceRequest from '../components/NewFeature/ServiceRequests';
// import { parsePriceToNumber, formatPriceRange, formatPrice } from '../utilis/priceFormatter';

// const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://mkt-backend-sz2s.onrender.com';

// export default function UnifiedServicesComponent() {
//   const { user, isAuthenticated, token } = useAuth();
//   const { addToast } = useToast();
//   const navigate = useNavigate();

//   const [viewMode, setViewMode] = useState('services');
  
//   // Services state
//   const [services, setServices] = useState([]);
//   const [selectedService, setSelectedService] = useState(null);
//   const [showRequestModal, setShowRequestModal] = useState(false);
//   const [requestDetails, setRequestDetails] = useState({
//     description: '',
//     budget: '',
//     location: '',
//     preferredDate: '',
//     contactMethod: 'whatsapp'
//   });
//   const [submittingRequest, setSubmittingRequest] = useState(false);
//   const [notificationSent, setNotificationSent] = useState(false);

//   // Providers state
//   const [allProviders, setAllProviders] = useState([]);
//   const [filteredProviders, setFilteredProviders] = useState([]);
//   const [providerServices, setProviderServices] = useState([]);
//   const [colleges, setColleges] = useState([]);
//   const [selectedImage, setSelectedImage] = useState(null);
//   const [showServiceRequest, setShowServiceRequest] = useState(false);
//   const [selectedProvider, setSelectedProvider] = useState(null);
//   const [selectedServiceId, setSelectedServiceId] = useState(null);
//   const [selectedServiceName, setSelectedServiceName] = useState('');

//   // Common state
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);
//   const [showMobileFilters, setShowMobileFilters] = useState(false);

//   const [filters, setFilters] = useState({
//     serviceId: '',
//     collegeId: '',
//     searchQuery: '',
//     location: '',
//     radius: 10,
//     minPrice: '',
//     maxPrice: '',
//     sortBy: 'rating-desc',
//     availability: '',
//     minRating: 0
//   });

//   const getAuthHeaders = () => {
//     return {
//       'Content-Type': 'application/json',
//       ...(token && { 'Authorization': `Bearer ${token}` })
//     };
//   };

//   const fetchServices = async () => {
//     try {
//       setLoading(true);
//       setError(null);

//       const response = await fetch(`${API_BASE_URL}/api/all/services`, {
//         headers: getAuthHeaders()
//       });

//       if (!response.ok) {
//         throw new Error(`Failed to fetch services: ${response.status}`);
//       }

//       const allServices = await response.json();

//       const servicesWithProviders = [];
      
//       for (const service of allServices) {
//         try {
//           const providerResponse = await fetch(`${API_BASE_URL}/api/all/services/${service.id}`, {
//             headers: getAuthHeaders()
//           });

//           if (providerResponse.ok) {
//             const serviceData = await providerResponse.json();
            
//             servicesWithProviders.push({
//               id: service.id,
//               name: service.name,
//               description: service.description,
//               category: service.category,
//               createdAt: service.createdAt,
//               providers: serviceData.providers || [],
//               providerCount: serviceData.providerCount || (serviceData.providers?.length || 0)
//             });
//           }
//         } catch (err) {
//           console.error(`Error fetching providers for service ${service.id}:`, err);
//         }
//       }

//       setServices(servicesWithProviders);
//     } catch (err) {
//       console.error('Error fetching services:', err);
//       setError(err instanceof Error ? err.message : 'Failed to fetch services');
//     } finally {
//       setLoading(false);
//     }
//   };

//   const fetchProviders = async () => {
//     try {
//       setLoading(true);
//       setError(null);

//       const [providersRes, servicesRes, collegesRes] = await Promise.all([
//         fetch(`${API_BASE_URL}/api/provider/public/all`),
//         fetch(`${API_BASE_URL}/api/services`),
//         fetch(`${API_BASE_URL}/api/colleges`)
//       ]);

//       const providersData = await providersRes.json();
//       const servicesData = await servicesRes.json();
//       const collegesData = await collegesRes.json();

//       const processedProviders = (providersData?.data || []).map((provider) => {
//         const processed = {
//           ...provider,
//           services: (provider.services || []).map((service) => {
//             const serviceData = service.service || service;
//             return {
//               ...serviceData,
//               price: parsePriceToNumber(serviceData.price)
//             };
//           }),
//         };
//         return processed;
//       });

//       setAllProviders(processedProviders);
//       setFilteredProviders(processedProviders);
//       setProviderServices(servicesData);
//       setColleges(collegesData);

//     } catch (err) {
//       console.error('❌ Fetch error:', err);
//       const errorMessage = 'Failed to load providers';
//       setError(errorMessage);
//       addToast(errorMessage, 'error');
//       setAllProviders([]);
//       setFilteredProviders([]);
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     if (viewMode === 'services') {
//       fetchServices();
//     } else {
//       fetchProviders();
//     }
//   }, [viewMode]);

//   useEffect(() => {
//     if (allProviders.length === 0 || viewMode !== 'providers') return;

//     let results = [...allProviders];

//     if (filters.serviceId) {
//       results = results.filter(provider => 
//         provider.services?.some(service => service.id.toString() === filters.serviceId)
//       );
//     }

//     if (filters.collegeId) {
//       results = results.filter(provider => 
//         provider.college?.id.toString() === filters.collegeId
//       );
//     }

//     if (filters.searchQuery) {
//       const query = filters.searchQuery.toLowerCase();
//       results = results.filter(provider => 
//         provider.firstName.toLowerCase().includes(query) ||
//         provider.lastName.toLowerCase().includes(query) ||
//         provider.bio?.toLowerCase().includes(query) ||
//         provider.services?.some(service => 
//           service.name.toLowerCase().includes(query)
//         )
//       );
//     }

//     if (filters.minPrice) {
//       const min = Number(filters.minPrice);
//       results = results.filter(provider => 
//         provider.services?.some(service => {
//           const price = service.price !== null && service.price !== undefined 
//             ? Number(service.price) 
//             : NaN;
//           return !isNaN(price) && price >= min;
//         })
//       );
//     }

//     if (filters.maxPrice) {
//       const max = Number(filters.maxPrice);
//       results = results.filter(provider => 
//         provider.services?.some(service => {
//           const price = service.price !== null && service.price !== undefined 
//             ? Number(service.price) 
//             : NaN;
//           return !isNaN(price) && price <= max;
//         })
//       );
//     }

//     switch (filters.sortBy) {
//       case 'rating-desc':
//         results.sort((a, b) => (b.rating || 0) - (a.rating || 0));
//         break;
//       case 'price-asc':
//         results.sort((a, b) => {
//           const aValidPrices = a.services?.map(s => s.price).filter((p) => typeof p === 'number' && !isNaN(p)) || [];
//           const bValidPrices = b.services?.map(s => s.price).filter((p) => typeof p === 'number' && !isNaN(p)) || [];
          
//           const aMinPrice = aValidPrices.length > 0 ? Math.min(...aValidPrices) : Infinity;
//           const bMinPrice = bValidPrices.length > 0 ? Math.min(...bValidPrices) : Infinity;
          
//           return aMinPrice - bMinPrice;
//         });
//         break;
//       case 'price-desc':
//         results.sort((a, b) => {
//           const aValidPrices = a.services?.map(s => s.price).filter((p) => typeof p === 'number' && !isNaN(p)) || [];
//           const bValidPrices = b.services?.map(s => s.price).filter((p) => typeof p === 'number' && !isNaN(p)) || [];
          
//           const aMaxPrice = aValidPrices.length > 0 ? Math.max(...aValidPrices) : -1;
//           const bMaxPrice = bValidPrices.length > 0 ? Math.max(...bValidPrices) : -1;
          
//           return bMaxPrice - aMaxPrice;
//         });
//         break;
//       case 'requests-desc':
//         results.sort((a, b) => (b.completedRequests || 0) - (a.completedRequests || 0));
//         break;
//       default:
//         break;
//     }

//     setFilteredProviders(results);
//   }, [filters, allProviders, viewMode]);

//   const filteredServices = services.filter(service => {
//     const matchesSearch = service.name.toLowerCase().includes(filters.searchQuery.toLowerCase()) ||
//                          service.description?.toLowerCase().includes(filters.searchQuery.toLowerCase()) ||
//                          service.category?.toLowerCase().includes(filters.searchQuery.toLowerCase());
//     const matchesRating = filters.minRating === 0 || service.providers.some(p => (p.rating || 0) >= filters.minRating);
//     return matchesSearch && matchesRating;
//   }).sort((a, b) => {
//     if (filters.sortBy === 'popular') {
//       return b.providerCount - a.providerCount;
//     } else if (filters.sortBy === 'rating') {
//       const avgRatingA = a.providers.length > 0
//         ? a.providers.reduce((sum, p) => sum + (p.rating || 0), 0) / a.providers.length
//         : 0;
//       const avgRatingB = b.providers.length > 0
//         ? b.providers.reduce((sum, p) => sum + (p.rating || 0), 0) / b.providers.length
//         : 0;
//       return avgRatingB - avgRatingA;
//     }
//     return 0;
//   });

//   const handleRequestService = (service) => {
//     if (!isAuthenticated) {
//       navigate('/login');
//       return;
//     }
//     setSelectedService(service);
//     setShowRequestModal(true);
//   };

//   const sendWhatsAppNotificationsToAllProviders = async (service, requestDetails) => {
//     try {
//       if (!service.providers || service.providers.length === 0) {
//         throw new Error('No providers available for this service');
//       }

//       const clientName = user?.full_name || 'Client';
//       const clientPhone = user?.contact_phone || 'Not provided';
//       const clientUserId = user?.id;

//       const requestPayload = {
//         serviceId: service.id,
//         clientInfo: {
//           name: clientName,
//           phone: clientPhone,
//           userId: clientUserId
//         },
//         requestDetails: requestDetails
//       };

//       const response = await fetch(`${API_BASE_URL}/api/services/whatsapp-urls`, {
//         method: 'POST',
//         headers: getAuthHeaders(),
//         body: JSON.stringify(requestPayload)
//       });

//       if (!response.ok) {
//         const errorText = await response.text();
//         throw new Error(`Failed to generate WhatsApp URLs: ${response.status} - ${errorText}`);
//       }

//       const data = await response.json();

//       if (!data.success) {
//         throw new Error(data.error || 'Failed to generate WhatsApp URLs');
//       }

//       if (data.urls && data.urls.length > 0) {
//         data.urls.forEach((urlInfo, index) => {
//           if (urlInfo.url && urlInfo.isValid) {
//             setTimeout(() => {
//               const newWindow = window.open(urlInfo.url, '_blank', 'noopener,noreferrer');
//               if (!newWindow) {
//                 alert(`Please allow popups to send WhatsApp messages. Provider phone: ${urlInfo.phoneNumber}`);
//               }
//             }, index * 500);
//           }
//         });
//       }

//       return {
//         success: true,
//         totalProviders: data.totalProviders,
//         validProviders: data.validProviders,
//         urls: data.urls
//       };

//     } catch (error) {
//       console.error('Error sending WhatsApp notifications:', error);
//       throw error;
//     }
//   };

//   const sendBatchNotificationThroughBackend = async (service, requestDetails) => {
//     try {
//       const clientName = user?.full_name || 'Client';
//       const clientPhone = user?.contact_phone || 'Not provided';
//       const clientUserId = user?.id;

//       const notificationData = {
//         serviceId: service.id,
//         serviceName: service.name,
//         clientInfo: {
//           name: clientName,
//           phone: clientPhone,
//           userId: clientUserId
//         },
//         requestDetails: {
//           description: requestDetails.description,
//           location: requestDetails.location,
//           budget: requestDetails.budget,
//           preferredDate: requestDetails.preferredDate,
//           contactMethod: requestDetails.contactMethod
//         }
//       };

//       const response = await fetch(`${API_BASE_URL}/api/services/notify/batch-enhanced`, {
//         method: 'POST',
//         headers: getAuthHeaders(),
//         body: JSON.stringify(notificationData)
//       });

//       if (!response.ok) {
//         const errorText = await response.text();
//         throw new Error(`Failed to send batch notification: ${response.status} - ${errorText}`);
//       }

//       const result = await response.json();
//       return result;

//     } catch (error) {
//       console.error('Error sending batch notification:', error);
//       throw error;
//     }
//   };

//   const handleSubmitRequest = async () => {
//     if (!selectedService || !requestDetails.description || !requestDetails.location) {
//       alert('Please fill in all required fields');
//       return;
//     }

//     if (!isAuthenticated || !user) {
//       alert('You must be logged in to submit a request');
//       navigate('/login');
//       return;
//     }

//     if (!user.full_name || !user.contact_phone) {
//       alert('Please complete your profile with your name and phone number before requesting services');
//       return;
//     }

//     setSubmittingRequest(true);

//     try {
//       let notificationResult;

//       if (requestDetails.contactMethod === 'whatsapp') {
//         notificationResult = await sendWhatsAppNotificationsToAllProviders(selectedService, requestDetails);
//         await sendBatchNotificationThroughBackend(selectedService, requestDetails);
//       } else {
//         notificationResult = await sendBatchNotificationThroughBackend(selectedService, requestDetails);
//       }

//       setNotificationSent(true);
//       setSubmittingRequest(false);

//       setTimeout(() => {
//         setShowRequestModal(false);
//         setNotificationSent(false);
//         setRequestDetails({
//           description: '',
//           budget: '',
//           location: '',
//           preferredDate: '',
//           contactMethod: 'whatsapp'
//         });
//         setSelectedService(null);
//       }, 3000);

//     } catch (error) {
//       console.error('Error submitting request:', error);
//       const errorMessage = error instanceof Error ? error.message : 'Failed to send notifications';
//       alert(`Error: ${errorMessage}`);
//       setSubmittingRequest(false);
//     }
//   };

//   const handleContactProvider = (provider) => {
//     if (!user) {
//       addToast('Please sign up to access contact information', 'info');
//       navigate('/register');
//       return;
//     }

//     if (!provider.phoneNumber) {
//       addToast('This provider has not shared their contact information', 'warning');
//       return;
//     }
    
//     if (confirm(`Contact ${provider.firstName} ${provider.lastName} at ${provider.phoneNumber}?`)) {
//       window.location.href = `tel:${provider.phoneNumber}`;
//     }
//   };

//   const handleProviderServiceRequest = (provider) => {
//     if (!user) {
//       addToast('Please sign up to request services', 'info');
//       navigate('/register');
//       return;
//     }

//     if (user.providerId && user.providerId.toString() === provider.id.toString()) {
//       addToast('You cannot request your own services', 'warning');
//       return;
//     }

//     if (!provider.services || provider.services.length === 0) {
//       addToast('This provider has no services available', 'warning');
//       return;
//     }

//     const firstService = provider.services[0];
    
//     setSelectedProvider(provider);
//     setSelectedServiceId(firstService.id);
//     setSelectedServiceName(firstService.name);
//     setShowServiceRequest(true);
//   };

//   const handleServiceRequestSuccess = () => {
//     setShowServiceRequest(false);
//     setSelectedProvider(null);
//     setSelectedServiceId(null);
//     setSelectedServiceName('');
//     addToast('Service request sent successfully!', 'success');
//   };

//   const handleResetFilters = () => {
//     setFilters({
//       serviceId: '',
//       collegeId: '',
//       searchQuery: '',
//       location: '',
//       radius: 10,
//       minPrice: '',
//       maxPrice: '',
//       sortBy: viewMode === 'services' ? 'popular' : 'rating-desc',
//       availability: '',
//       minRating: 0
//     });
//     addToast('Filters reset', 'info');
//   };

//   const getGeneralLocation = (address) => {
//     if (!address) return null;
//     const parts = address.split(',');
//     return parts.length > 1 ? parts[parts.length - 1].trim() : parts[0].trim();
//   };

//   const closeModal = () => {
//     setShowRequestModal(false);
//     setNotificationSent(false);
//     setRequestDetails({
//       description: '',
//       budget: '',
//       location: '',
//       preferredDate: '',
//       contactMethod: 'whatsapp'
//     });
//     setSelectedService(null);
//   };

//   if (loading) {
//     return (
//       <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-50 flex items-center justify-center">
//         <div className="text-center">
//           <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto mb-4"></div>
//           <p className="text-slate-600">Loading {viewMode === 'services' ? 'services' : 'providers'}...</p>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-50">
//       <div className="container mx-auto px-4 py-6 max-w-7xl">
        
//         {/* Header */}
//         <div className="mb-6">
//           <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
//             <div>
//               <h1 className="text-3xl sm:text-4xl font-light text-slate-800 mb-2">
//                 {viewMode === 'services' ? 'Available Services' : 'Service Providers'}
//               </h1>
//               <p className="text-slate-600">
//                 {viewMode === 'services' 
//                   ? 'Browse services and request quotes from multiple providers'
//                   : 'Discover talented professionals in your area'
//                 }
//               </p>
//             </div>

//             {/* View Toggle & Actions */}
//             <div className="flex flex-col sm:flex-row gap-3">
//               <div className="flex bg-white/80 backdrop-blur-sm rounded-xl p-1 shadow-sm border border-slate-200">
//                 <button
//                   onClick={() => setViewMode('services')}
//                   className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
//                     viewMode === 'services'
//                       ? 'bg-blue-600 text-white shadow-sm'
//                       : 'text-slate-600 hover:text-slate-800'
//                   }`}
//                 >
//                   Services
//                 </button>
//                 <button
//                   onClick={() => setViewMode('providers')}
//                   className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
//                     viewMode === 'providers'
//                       ? 'bg-blue-600 text-white shadow-sm'
//                       : 'text-slate-600 hover:text-slate-800'
//                   }`}
//                 >
//                   Providers
//                 </button>
//               </div>

//               {user?.role === 'service_provider' && (
//                 <Link 
//                   to="/provider/dashboard" 
//                   className="px-6 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 text-center font-medium transition-all shadow-sm border border-blue-600 text-sm"
//                 >
//                   My Dashboard
//                 </Link>
//               )}

//               {!user && (
//                 <div className="flex space-x-2">
//                   <button
//                     onClick={() => navigate('/login')}
//                     className="px-4 py-2 text-blue-600 border border-blue-300 rounded-xl hover:bg-blue-50 transition-all font-medium text-sm"
//                   >
//                     Sign In
//                   </button>
//                   <button
//                     onClick={() => navigate('/register')}
//                     className="px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 font-medium transition-all shadow-sm text-sm"
//                   >
//                     Sign Up Free
//                   </button>
//                 </div>
//               )}
//             </div>
//           </div>

//           {!isAuthenticated && (
//             <div className="p-4 bg-gradient-to-r from-blue-50 to-green-50 rounded-xl border border-blue-200">
//               <p className="text-blue-700 text-sm flex items-center">
//                 <User className="h-4 w-4 mr-2" />
//                 <strong className="mr-1">Tip:</strong> Sign in to request services and get quotes from multiple providers at once!
//               </p>
//             </div>
//           )}
//         </div>

//         {error && (
//           <div className="mb-8 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
//             <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
//             <div>
//               <h3 className="font-medium text-red-900">Error Loading {viewMode === 'services' ? 'Services' : 'Providers'}</h3>
//               <p className="text-sm text-red-800 mt-1">{error}</p>
//               <button
//                 onClick={() => viewMode === 'services' ? fetchServices() : fetchProviders()}
//                 className="mt-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm font-medium"
//               >
//                 Try Again
//               </button>
//             </div>
//           </div>
//         )}

//         {/* Filters Section */}
//         <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm border border-slate-100/80 mb-6">
//           <button
//             onClick={() => setShowMobileFilters(!showMobileFilters)}
//             className="lg:hidden w-full p-4 flex items-center justify-between text-slate-700 font-medium"
//           >
//             <span className="flex items-center">
//               <Filter className="h-5 w-5 mr-2" />
//               Filters & Search
//             </span>
//             <ChevronDown className={`h-5 w-5 transition-transform ${showMobileFilters ? 'rotate-180' : ''}`} />
//           </button>

//           <div className={`p-6 ${showMobileFilters ? 'block' : 'hidden'} lg:block`}>
//             <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
//               <div className="sm:col-span-2">
//                 <label className="block text-sm font-medium text-slate-700 mb-2">Search</label>
//                 <div className="relative">
//                   <Search className="absolute left-3 top-3 w-5 h-5 text-slate-400" />
//                   <input
//                     type="text"
//                     value={filters.searchQuery}
//                     onChange={(e) => setFilters({...filters, searchQuery: e.target.value})}
//                     placeholder={viewMode === 'services' ? "Search services..." : "Search providers..."}
//                     className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-300 transition-all"
//                   />
//                 </div>
//               </div>

//               {viewMode === 'providers' && (
//                 <>
//                   <div>
//                     <label className="block text-sm font-medium text-slate-700 mb-2">Service</label>
//                     <select
//                       value={filters.serviceId}
//                       onChange={(e) => setFilters({...filters, serviceId: e.target.value})}
//                       className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-300 transition-all"
//                     >
//                       <option value="">All Services</option>
//                       {providerServices.map(service => (
//                         <option key={service.id} value={service.id}>
//                           {service.name}
//                         </option>
//                       ))}
//                     </select>
//                   </div>

//                   <div>
//                     <label className="block text-sm font-medium text-slate-700 mb-2">College</label>
//                     <select
//                       value={filters.collegeId}
//                       onChange={(e) => setFilters({...filters, collegeId: e.target.value})}
//                       className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-300 transition-all"
//                     >
//                       <option value="">All Colleges</option>
//                       {colleges.map(college => (
//                         <option key={college.id} value={college.id}>
//                           {college.name}
//                         </option>
//                       ))}
//                     </select>
//                   </div>
//                 </>
//               )}

//               <div>
//                 <label className="block text-sm font-medium text-slate-700 mb-2">Min Rating</label>
//                 <select
//                   value={filters.minRating}
//                   onChange={(e) => setFilters({...filters, minRating: Number(e.target.value)})}
//                   className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-300 transition-all"
//                 >
//                   <option value="0">Any Rating</option>
//                   <option value="3">3+ Stars</option>
//                   <option value="4">4+ Stars</option>
//                   <option value="4.5">4.5+ Stars</option>
//                 </select>
//               </div>

//               <div>
//                 <label className="block text-sm font-medium text-slate-700 mb-2">Sort By</label>
//                 <select
//                   value={filters.sortBy}
//                   onChange={(e) => setFilters({...filters, sortBy: e.target.value})}
//                   className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-300 transition-all"
//                 >
//                   {viewMode === 'services' ? (
//                     <>
//                       <option value="popular">Most Popular</option>
//                       <option value="rating">Highest Rated</option>
//                     </>
//                   ) : (
//                     <>
//                       <option value="rating-desc">Highest Rating</option>
//                       <option value="price-asc">Price: Low to High</option>
//                       <option value="price-desc">Price: High to Low</option>
//                       <option value="requests-desc">Most Completed Requests</option>
//                     </>
//                   )}
//                 </select>
//               </div>

//               {viewMode === 'providers' && (
//                 <div className="sm:col-span-2">
//                   <label className="block text-sm font-medium text-slate-700 mb-2">Price Range (KSh)</label>
//                   <div className="flex flex-col sm:flex-row gap-3">
//                     <input
//                       type="number"
//                       value={filters.minPrice}
//                       onChange={(e) => setFilters({...filters, minPrice: e.target.value})}
//                       placeholder="Min price"
//                       className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-300 transition-all"
//                       min="0"
//                     />
//                     <input
//                       type="number"
//                       value={filters.maxPrice}
//                       onChange={(e) => setFilters({...filters, maxPrice: e.target.value})}
//                       placeholder="Max price"
//                       className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-300 transition-all"
//                       min="0"
//                     />
//                   </div>
//                 </div>
//               )}
//             </div>

//             <div className="mt-6 flex justify-end">
//               <button
//                 onClick={handleResetFilters}
//                 className="px-6 py-3 text-slate-600 hover:text-slate-800 hover:bg-slate-50 rounded-xl transition-all font-medium border border-slate-200 hover:border-slate-300"
//               >
//                 Reset All Filters
//               </button>
//             </div>
//           </div>
//         </div>

//         {/* Content Grid */}
//         {viewMode === 'services' ? (
//           filteredServices.length === 0 ? (
//             <div className="text-center py-16 bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm border border-slate-100/80">
//               <Search className="h-16 w-16 text-slate-300 mx-auto mb-4" />
//               <h3 className="text-xl font-medium text-slate-900 mb-2">No services found</h3>
//               <p className="text-slate-600">Try adjusting your search filters</p>
//             </div>
//           ) : (
//             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
//               {filteredServices.map(service => {
//                 const avgRating = service.providers.length > 0 
//                   ? (service.providers.reduce((sum, p) => sum + (p.rating || 0), 0) / service.providers.length).toFixed(1)
//                   : 'N/A';

//                 return (
//                   <div 
//                     key={service.id} 
//                     className="group bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm hover:shadow-lg transition-all border border-slate-100/80 overflow-hidden"
//                   >
//                     <div className="p-6">
//                       <div className="mb-4">
//                         <div className="flex items-start justify-between mb-2">
//                           <h3 className="text-xl font-semibold text-slate-800 flex-1">{service.name}</h3>
//                           {service.category && (
//                             <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full font-medium ml-2 flex-shrink-0">
//                               {service.category}
//                             </span>
//                           )}
//                         </div>
//                         {service.description && (
//                           <p className="text-sm text-slate-600 line-clamp-2">{service.description}</p>
//                         )}
//                       </div>

//                       <div className="grid grid-cols-2 gap-3 mb-6">
//                         <div className="bg-slate-50/70 rounded-xl p-3 text-center">
//                           <div className="flex items-center justify-center mb-1">
//                             <Star className="h-4 w-4 text-amber-400 fill-amber-400 mr-1" />
//                             <span className="font-medium text-slate-800">{avgRating}</span>
//                           </div>
//                           <p className="text-xs text-slate-600">Avg Rating</p>
//                         </div>

//                         <div className="bg-slate-50/70 rounded-xl p-3 text-center">
//                           <div className="font-medium text-slate-800 mb-1">
//                             {service.providerCount}
//                           </div>
//                           <p className="text-xs text-slate-600">Providers</p>
//                         </div>
//                       </div>

//                       {service.providers.length > 0 && (
//                         <div className="mb-6">
//                           <h4 className="text-sm font-medium text-slate-700 mb-3">Available Providers</h4>
//                           <div className="space-y-2 max-h-48 overflow-y-auto">
//                             {service.providers.slice(0, 3).map(provider => (
//                               <div key={provider.id} className="flex items-center gap-2 p-2 bg-slate-50/70 rounded-lg">
//                                 <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-100 to-slate-100 flex items-center justify-center flex-shrink-0 text-xs font-medium text-slate-600">
//                                   {provider.firstName?.charAt(0)}{provider.lastName?.charAt(0)}
//                                 </div>
//                                 <div className="flex-1 min-w-0">
//                                   <p className="text-xs font-medium text-slate-800 truncate">
//                                     {provider.firstName} {provider.lastName}
//                                   </p>
//                                   <div className="flex items-center gap-1">
//                                     <Star className="h-3 w-3 text-amber-400 fill-amber-400" />
//                                     <span className="text-xs text-slate-600">{provider.rating?.toFixed(1) || 'New'}</span>
//                                   </div>
//                                 </div>
//                               </div>
//                             ))}
//                             {service.providers.length > 3 && (
//                               <p className="text-xs text-slate-500 text-center py-2">
//                                 +{service.providers.length - 3} more providers
//                               </p>
//                             )}
//                           </div>
//                         </div>
//                       )}

//                       {service.providers.length > 0 ? (
//                         <button
//                           onClick={() => handleRequestService(service)}
//                           disabled={!isAuthenticated}
//                           className={`w-full px-4 py-3 rounded-xl shadow-sm font-medium transition-all flex items-center justify-center gap-2 ${
//                             isAuthenticated
//                               ? 'bg-green-600 text-white hover:bg-green-700'
//                               : 'bg-gray-300 text-gray-500 cursor-not-allowed'
//                           }`}
//                         >
//                           <Send className="h-4 w-4" />
//                           {isAuthenticated 
//                             ? `Request Service (Notify ${service.providerCount})`
//                             : 'Sign In to Request'
//                           }
//                         </button>
//                       ) : (
//                         <div className="w-full px-4 py-3 bg-slate-100 text-slate-400 rounded-xl text-center text-sm">
//                           No providers available
//                         </div>
//                       )}
//                     </div>
//                   </div>
//                 );
//               })}
//             </div>
//           )
//         ) : (
//           filteredProviders.length === 0 ? (
//             <div className="text-center py-16 bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm border border-slate-100/80">
//               <User className="h-16 w-16 text-slate-300 mx-auto mb-4" />
//               <h3 className="text-xl font-medium text-slate-900 mb-2">No providers found</h3>
//               <p className="text-slate-600 mb-6">Try adjusting your search filters</p>
//               <button
//                 onClick={handleResetFilters}
//                 className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 font-medium transition-all shadow-sm"
//               >
//                 Clear Filters
//               </button>
//             </div>
//           ) : (
//             <div className="grid grid-cols-1 lg:grid-cols-2 2xl:grid-cols-3 gap-6">
//               {filteredProviders.map(provider => (
//                 <div key={provider.id} className="group bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm hover:shadow-lg transition-all border border-slate-100/80 overflow-hidden">
//                   <div className="p-6">
//                     <div className="flex items-start gap-4 mb-6">
//                       <div className="w-20 h-20 rounded-2xl overflow-hidden flex-shrink-0 shadow-md">
//                         {provider.profileImageUrl ? (
//                           <img 
//                             src={provider.profileImageUrl} 
//                             alt={`${provider.firstName} ${provider.lastName}`}
//                             className="w-full h-full object-cover"
//                             onError={(e) => {
//                               e.target.src = '/default-avatar.png';
//                             }}
//                           />
//                         ) : (
//                           <div className="w-full h-full bg-gradient-to-br from-blue-100 to-slate-100 flex items-center justify-center">
//                             <span className="text-xl font-light text-slate-600">
//                               {provider.firstName?.charAt(0)}{provider.lastName?.charAt(0)}
//                             </span>
//                           </div>
//                         )}
//                       </div>
                      
//                       <div className="flex-1 min-w-0">
//                         <Link to={`/providers/public/${provider.id}`} className="group">
//                           <h3 className="font-medium text-lg text-slate-800 group-hover:text-blue-600 transition-colors truncate">
//                             {provider.firstName} {provider.lastName}
//                           </h3>
//                         </Link>
                        
//                         {provider.college && (
//                           <div className="flex items-center mt-1 text-sm text-slate-600">
//                             <Building2 className="h-4 w-4 mr-1 flex-shrink-0" />
//                             <span className="truncate">{provider.college.name}</span>
//                           </div>
//                         )}
                        
//                         {provider.address && (
//                           <div className="flex items-center mt-1 text-sm text-slate-600">
//                             <MapPin className="h-4 w-4 mr-1 flex-shrink-0" />
//                             <span className="truncate">
//                               {user ? provider.address : getGeneralLocation(provider.address)}
//                             </span>
//                           </div>
//                         )}
//                       </div>
//                     </div>

//                     <div className="grid grid-cols-2 gap-4 mb-6">
//                       <div 
//                         className={`bg-slate-50/70 rounded-xl p-3 text-center transition-colors ${
//                           user 
//                             ? 'cursor-pointer hover:bg-slate-100/70 hover:shadow-sm' 
//                             : 'cursor-pointer'
//                         }`}
//                         onClick={() => {
//                           if (user) {
//                             navigate(`/providers/public/${provider.id}`);
//                           } else {
//                             addToast('Sign up to rate providers', 'info');
//                             navigate('/register');
//                           }
//                         }}
//                       >
//                         <div className="flex items-center justify-center mb-1">
//                           <Star className={`h-4 w-4 mr-1 ${(provider.rating || 0) > 0 ? 'text-amber-400 fill-amber-400' : 'text-slate-300'}`} />
//                           <span className="font-medium text-slate-800">
//                             {provider.rating ? provider.rating.toFixed(1) : 'New'}
//                           </span>
//                         </div>
//                         <p className="text-xs text-slate-600">
//                           {user ? 'Click to rate' : 'Sign up to rate'}
//                         </p>
//                       </div>
                      
//                       <div className="bg-slate-50/70 rounded-xl p-3 text-center">
//                         <div className="font-medium text-slate-800 mb-1">
//                           {provider.completedRequests || 0}
//                         </div>
//                         <p className="text-xs text-slate-600">Completed</p>
//                       </div>
//                     </div>

//                     <div className="mb-6">
//                       <div className="flex items-center justify-between">
//                         <h4 className="text-sm font-medium text-slate-700 mb-2">
//                           Price Range
//                         </h4>
//                         <span className="text-sm font-medium text-blue-600 bg-blue-50 px-3 py-1 rounded-lg">
//                           {user ? formatPriceRange(provider.services) : 'Contact for pricing'}
//                         </span>
//                       </div>
//                     </div>

//                     {provider.bio && (
//                       <div className="mb-6">
//                         <p className="text-sm text-slate-700 line-clamp-3 leading-relaxed">
//                           {provider.bio}
//                         </p>
//                       </div>
//                     )}

//                     {provider.services && provider.services.length > 0 && (
//                       <div className="mb-6">
//                         <h4 className="text-sm font-medium text-slate-700 mb-3">Services Offered</h4>
//                         <div className="space-y-2">
//                           {provider.services.slice(0, 3).map(service => (
//                             <div key={service.id} className="flex justify-between items-center p-3 bg-slate-50/70 rounded-lg">
//                               <span className="text-sm text-slate-700 flex-1 mr-3 truncate">
//                                 {service.name}
//                               </span>
//                               <span className="text-sm font-medium text-blue-600 bg-blue-50 px-2 py-1 rounded whitespace-nowrap">
//                                 {user ? (
//                                   service.price !== undefined && service.price !== null 
//                                     ? formatPrice(service.price)
//                                     : 'Quote'
//                                 ) : (
//                                   'Contact'
//                                 )}
//                               </span>
//                             </div>
//                           ))}
//                           {provider.services.length > 3 && (
//                             <div className="text-sm text-slate-500 italic text-center py-2">
//                               +{provider.services.length - 3} more services
//                             </div>
//                           )}
//                         </div>
//                       </div>
//                     )}

//                     {provider.pastWorks && provider.pastWorks.length > 0 && (
//                       <div className="mb-6">
//                         <h4 className="text-sm font-medium text-slate-700 mb-3 flex items-center">
//                           <Eye className="h-4 w-4 mr-1" />
//                           Portfolio Preview
//                         </h4>
//                         <div className="flex gap-2 overflow-x-auto pb-2">
//                           {provider.pastWorks.slice(0, 4).map((work, index) => (
//                             <div key={index} className="flex-shrink-0 w-20 h-20 relative group cursor-pointer">
//                               <img
//                                 src={work.imageUrl}
//                                 alt={`Portfolio item ${index + 1}`}
//                                 className="w-full h-full object-cover rounded-lg shadow-sm"
//                                 onError={(e) => {
//                                   e.target.src = '/default-work.png';
//                                 }}
//                                 onClick={() => {
//                                   if (user) {
//                                     setSelectedImage(work.imageUrl);
//                                   } else {
//                                     addToast('Sign up to view full portfolio', 'info');
//                                     navigate('/register');
//                                   }
//                                 }}
//                               />
//                               <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 rounded-lg transition-all flex items-center justify-center">
//                                 <Eye className="h-5 w-5 text-white opacity-0 group-hover:opacity-100 transition-opacity drop-shadow-lg" />
//                               </div>
//                             </div>
//                           ))}
//                           {provider.pastWorks.length > 4 && (
//                             <div className="flex-shrink-0 w-20 h-20 bg-slate-100 rounded-lg flex items-center justify-center">
//                               <span className="text-xs text-slate-600 font-medium">
//                                 +{provider.pastWorks.length - 4}
//                               </span>
//                             </div>
//                           )}
//                         </div>
//                       </div>
//                     )}

//                     <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-slate-100">
//                       <Link 
//                         to={`/providers/public/${provider.id}`}
//                         className="flex-1 px-4 py-3 text-blue-600 hover:text-blue-800 font-medium text-sm text-center border border-blue-200 rounded-xl hover:bg-blue-50 hover:border-blue-300 transition-all"
//                       >
//                         View Full Profile
//                       </Link>
                      
//                       {user && user.providerId?.toString() !== provider.id.toString() && (
//                         <button
//                           onClick={() => handleProviderServiceRequest(provider)}
//                           disabled={!provider.services || provider.services.length === 0}
//                           className={`flex-1 px-4 py-3 rounded-xl font-medium text-sm transition-all flex items-center justify-center ${
//                             provider.services && provider.services.length > 0
//                               ? 'bg-green-600 text-white hover:bg-green-700 shadow-sm hover:shadow-md transform hover:scale-105' 
//                               : 'bg-slate-100 text-slate-400 cursor-not-allowed'
//                           }`}
//                         >
//                           <Send className="h-4 w-4 mr-2" />
//                           {provider.services && provider.services.length > 0 ? 'Request Service' : 'No Services'}
//                         </button>
//                       )}

//                       {user && user.providerId?.toString() === provider.id.toString() && (
//                         <div className="flex-1 px-4 py-3 bg-blue-50 text-blue-700 rounded-xl border border-blue-200 text-center text-sm font-medium">
//                           <User className="h-4 w-4 inline mr-2" />
//                           Your Profile
//                         </div>
//                       )}

//                       {user && provider.phoneNumber && user.providerId?.toString() !== provider.id.toString() && (
//                         <button
//                           onClick={() => handleContactProvider(provider)}
//                           className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 shadow-sm font-medium text-sm transition-all flex items-center justify-center hover:shadow-md"
//                         >
//                           <Phone className="h-4 w-4 mr-2" />
//                           Contact Now
//                         </button>
//                       )}

//                       {!user && (
//                         <div className="flex-1 px-4 py-3 bg-gradient-to-r from-blue-50 to-green-50 text-blue-800 rounded-xl border border-blue-200 text-center text-sm">
//                           <div className="flex items-center justify-center mb-2">
//                             <User className="h-4 w-4 mr-1" />
//                             <span className="font-medium">Connect with {provider.firstName}</span>
//                           </div>
//                           <div className="flex space-x-2">
//                             <Link 
//                               to="/login"
//                               className="flex-1 px-2 py-1 text-blue-600 border border-blue-300 rounded text-xs font-medium hover:bg-blue-50 transition-colors"
//                             >
//                               Sign In
//                             </Link>
//                             <Link 
//                               to="/register"
//                               className="flex-1 px-2 py-1 bg-blue-600 text-white rounded text-xs font-medium hover:bg-blue-700 transition-colors"
//                             >
//                               Sign Up
//                             </Link>
//                           </div>
//                         </div>
//                       )}
//                     </div>
//                   </div>
//                 </div>
//               ))}
//             </div>
//           )
//         )}

//         {/* Service Request Modal */}
//         {showRequestModal && selectedService && (
//           <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
//             <div className="bg-white rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
//               <div className="sticky top-0 bg-white border-b border-slate-100 p-6 flex items-center justify-between">
//                 <div>
//                   <h2 className="text-2xl font-bold text-slate-900">Request Service</h2>
//                   <p className="text-sm text-slate-600 mt-1">{selectedService.name}</p>
//                 </div>
//                 <button
//                   onClick={closeModal}
//                   className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
//                 >
//                   <X className="h-6 w-6 text-slate-400" />
//                 </button>
//               </div>

//               <div className="p-6 space-y-4">
//                 <div>
//                   <label className="block text-sm font-medium text-slate-700 mb-2">
//                     Service Description *
//                   </label>
//                   <textarea
//                     value={requestDetails.description}
//                     onChange={(e) => setRequestDetails({...requestDetails, description: e.target.value})}
//                     placeholder="Describe what you need in detail..."
//                     rows={4}
//                     className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none resize-none"
//                   />
//                 </div>

//                 <div>
//                   <label className="block text-sm font-medium text-slate-700 mb-2">
//                     Your Location *
//                   </label>
//                   <input
//                     type="text"
//                     value={requestDetails.location}
//                     onChange={(e) => setRequestDetails({...requestDetails, location: e.target.value})}
//                     placeholder="Where are you located?"
//                     className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
//                   />
//                 </div>

//                 <div className="grid grid-cols-2 gap-4">
//                   <div>
//                     <label className="block text-sm font-medium text-slate-700 mb-2">
//                       Budget (Optional)
//                     </label>
//                     <input
//                       type="text"
//                       value={requestDetails.budget}
//                       onChange={(e) => setRequestDetails({...requestDetails, budget: e.target.value})}
//                       placeholder="e.g., 5000 KES"
//                       className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
//                     />
//                   </div>

//                   <div>
//                     <label className="block text-sm font-medium text-slate-700 mb-2">
//                       Preferred Date
//                     </label>
//                     <input
//                       type="date"
//                       value={requestDetails.preferredDate}
//                       onChange={(e) => setRequestDetails({...requestDetails, preferredDate: e.target.value})}
//                       className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
//                     />
//                   </div>
//                 </div>

//                 <div>
//                   <label className="block text-sm font-medium text-slate-700 mb-2">
//                     Preferred Contact Method
//                   </label>
//                   <div className="grid grid-cols-3 gap-3">
//                     {[
//                       { value: 'whatsapp', label: 'WhatsApp', icon: '💬' },
//                       { value: 'call', label: 'Call', icon: '📞' },
//                       { value: 'sms', label: 'SMS', icon: '📧' }
//                     ].map(method => (
//                       <button
//                         key={method.value}
//                         type="button"
//                         onClick={() => setRequestDetails({...requestDetails, contactMethod: method.value})}
//                         className={`p-3 rounded-lg border-2 transition-all text-center font-medium text-sm ${
//                           requestDetails.contactMethod === method.value
//                             ? 'border-blue-500 bg-blue-50 text-blue-600'
//                             : 'border-slate-200 text-slate-600 hover:border-slate-300'
//                         }`}
//                       >
//                         <div className="text-xl mb-1">{method.icon}</div>
//                         {method.label}
//                       </button>
//                     ))}
//                   </div>
//                 </div>

//                 {notificationSent ? (
//                   <div className="p-4 bg-green-50 rounded-lg border border-green-200">
//                     <div className="flex items-center gap-2 mb-2">
//                       <CheckCircle className="h-5 w-5 text-green-600" />
//                       <h4 className="font-medium text-green-900">Request Sent Successfully!</h4>
//                     </div>
//                     <p className="text-sm text-green-800 mb-2">
//                       ✅ Your request has been sent to <strong>{selectedService.providerCount} provider(s)</strong>
//                       {requestDetails.contactMethod === 'whatsapp' && ' via WhatsApp'}
//                     </p>
//                     <p className="text-sm text-green-700 mb-2">
//                       📝 A separate service request has been created for each provider
//                     </p>
//                     <p className="text-sm text-green-700 mb-2">
//                       📱 Providers will contact you at: <strong>{user?.contact_phone}</strong>
//                     </p>
//                     <div className="mt-3 pt-3 border-t border-green-200">
//                       <p className="text-xs text-green-600">
//                         🌐 Track your requests at <strong>quisells.com</strong>
//                       </p>
//                       <p className="text-xs text-green-600">
//                         📧 Questions? Email: <strong>ombongidiaz@gmail.com</strong>
//                       </p>
//                     </div>
//                   </div>
//                 ) : submittingRequest ? (
//                   <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
//                     <div className="flex items-center gap-2 mb-2">
//                       <Loader className="h-5 w-5 text-yellow-600 animate-spin" />
//                       <h4 className="font-medium text-yellow-900">Processing Your Request...</h4>
//                     </div>
//                     <p className="text-sm text-yellow-800">
//                       {requestDetails.contactMethod === 'whatsapp' 
//                         ? `Creating ${selectedService.providerCount} service request(s) and opening WhatsApp tabs...`
//                         : `Creating ${selectedService.providerCount} service request(s) and notifying providers...`
//                       }
//                     </p>
//                     {requestDetails.contactMethod === 'whatsapp' && (
//                       <p className="text-xs text-yellow-700 mt-2">
//                         Please allow popups if prompted
//                       </p>
//                     )}
//                   </div>
//                 ) : (
//                   <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
//                     <div className="flex items-center gap-2 mb-2">
//                       <Bell className="h-5 w-5 text-blue-600" />
//                       <h4 className="font-medium text-blue-900">All Providers Will Be Notified</h4>
//                     </div>
//                     <p className="text-sm text-blue-800 mb-2">
//                       {selectedService.providerCount} provider(s) offering "{selectedService.name}" will receive your request 
//                       {requestDetails.contactMethod === 'whatsapp' && ' via WhatsApp'}.
//                     </p>
//                     <p className="text-sm text-blue-700 mb-2">
//                       📋 A separate service request will be created for each provider to ensure proper tracking.
//                     </p>
//                     {requestDetails.contactMethod === 'whatsapp' && (
//                       <p className="text-sm text-blue-700">
//                         💡 <strong>Note:</strong> Multiple WhatsApp tabs will open - one for each provider. Please allow popups in your browser.
//                       </p>
//                     )}
//                   </div>
//                 )}

//                 <button
//                   onClick={handleSubmitRequest}
//                   disabled={submittingRequest || notificationSent}
//                   className="w-full px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed font-medium transition-all flex items-center justify-center gap-2"
//                 >
//                   {submittingRequest ? (
//                     <>
//                       <Loader className="h-4 w-4 animate-spin" />
//                       Processing Request...
//                     </>
//                   ) : notificationSent ? (
//                     <>
//                       <CheckCircle className="h-4 w-4" />
//                       Request Sent!
//                     </>
//                   ) : requestDetails.contactMethod === 'whatsapp' ? (
//                     `Notify ${selectedService.providerCount} Providers via WhatsApp`
//                   ) : (
//                     `Send Request to ${selectedService.providerCount} Providers`
//                   )}
//                 </button>
//               </div>
//             </div>
//           </div>
//         )}

//         {/* Provider Service Request Modal */}
//         {showServiceRequest && selectedProvider && selectedServiceId && (
//           <DirectServiceRequest
//             providerId={selectedProvider.id}
//             serviceId={selectedServiceId}
//             serviceName={selectedServiceName}
//             providerName={`${selectedProvider.firstName} ${selectedProvider.lastName}`}
//             isOpen={showServiceRequest}
//             onClose={() => setShowServiceRequest(false)}
//             onSuccess={handleServiceRequestSuccess}
//           />
//         )}

//         {/* Image Preview Modal */}
//         {selectedImage && user && (
//           <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
//             <div className="relative max-w-4xl max-h-[90vh] w-full">
//               <button
//                 onClick={() => setSelectedImage(null)}
//                 className="absolute -top-12 right-0 text-white/80 hover:text-white transition-colors p-2 rounded-full hover:bg-white/10"
//               >
//                 <X className="h-6 w-6" />
//               </button>
//               <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-2 border border-white/20">
//                 <img
//                   src={selectedImage}
//                   alt="Portfolio item"
//                   className="w-full h-full object-contain rounded-xl shadow-2xl max-h-[80vh]"
//                 />
//               </div>
//             </div>
//           </div>
//         )}

//         {/* Floating Sign Up Button for non-authenticated users */}
//         {!user && (
//           <div className="fixed bottom-6 right-6 z-40">
//             <button
//               onClick={() => navigate('/register')}
//               className="bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700 text-white px-6 py-3 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 group text-sm font-medium"
//               title="Sign up to connect with providers"
//             >
//               <User className="h-5 w-5 inline mr-2 group-hover:scale-110 transition-transform" />
//               Join Free
//             </button>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// }