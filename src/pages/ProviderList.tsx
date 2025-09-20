// src/pages/ProvidersList.tsx - Updated with eased restrictions for non-authenticated users
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { ProviderProfile, Service, College } from '../types/types';
import { AxiosError } from 'axios';
import { 
  StarIcon, 
  MapPinIcon, 
  PhoneIcon, 
  UserIcon,
  BuildingOfficeIcon,
  PhotoIcon,
  EyeIcon,
  PaperAirplaneIcon,
  LockClosedIcon
} from '@heroicons/react/24/outline';
import { parsePriceToNumber, formatPriceRange, formatPrice } from '../utilis/priceFormatter';
import DirectServiceRequest from '../components/NewFeature/ServiceRequests';
import { useNavigate } from "react-router-dom";

const baseURL = import.meta.env.VITE_API_BASE_URL || 'https://mkt-backend-sz2s.onrender.com';

export default function ProvidersList() {
  const { user } = useAuth();
  const { addToast } = useToast();
  const [allProviders, setAllProviders] = useState<ProviderProfile[]>([]);
  const [filteredProviders, setFilteredProviders] = useState<ProviderProfile[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [colleges, setColleges] = useState<College[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  
  const [showServiceRequest, setShowServiceRequest] = useState(false);
  const [selectedProvider, setSelectedProvider] = useState<ProviderProfile | null>(null);
  const [selectedServiceId, setSelectedServiceId] = useState<number | null>(null);
  const [selectedServiceName, setSelectedServiceName] = useState<string>('');

  const [filters, setFilters] = useState({
    serviceId: '',
    collegeId: '',
    searchQuery: '',
    location: '',
    radius: 10,
    minPrice: '',
    maxPrice: '',
    sortBy: 'rating-desc',
    availability: '',
  });
  const navigate = useNavigate();

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [providersRes, servicesRes, collegesRes] = await Promise.all([
        axios.get(`${baseURL}/api/provider/public/all`),
        axios.get(`${baseURL}/api/services`),
        axios.get(`${baseURL}/api/colleges`)
      ]);

      const processedProviders = (providersRes.data?.data || []).map((provider: any) => {
        const processed = {
          ...provider,
          services: (provider.services || []).map((service: any) => {
            const serviceData = service.service || service;
            return {
              ...serviceData,
              price: parsePriceToNumber(serviceData.price)
            };
          }),
        };
        return processed;
      });

      setAllProviders(processedProviders);
      setFilteredProviders(processedProviders);
      setServices(servicesRes.data);
      setColleges(collegesRes.data);

    } catch (err) {
      console.error('❌ Fetch error:', err);
      const errorMessage = axios.isAxiosError(err) 
        ? err.response?.data?.error || 'Failed to load providers'
        : 'Failed to load providers';
      
      setError(errorMessage);
      addToast(errorMessage, 'error');
      setAllProviders([]);
      setFilteredProviders([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (allProviders.length === 0) return;

    let results = [...allProviders];

    if (filters.serviceId) {
      results = results.filter(provider => 
        provider.services?.some(service => service.id.toString() === filters.serviceId)
      );
    }

    if (filters.collegeId) {
      results = results.filter(provider => 
        provider.college?.id.toString() === filters.collegeId
      );
    }

    if (filters.searchQuery) {
      const query = filters.searchQuery.toLowerCase();
      results = results.filter(provider => 
        provider.firstName.toLowerCase().includes(query) ||
        provider.lastName.toLowerCase().includes(query) ||
        provider.bio?.toLowerCase().includes(query) ||
        provider.services?.some(service => 
          service.name.toLowerCase().includes(query)
        )
      );
    }

    if (filters.minPrice) {
      const min = Number(filters.minPrice);
      results = results.filter(provider => 
        provider.services?.some(service => {
          const price = service.price !== null && service.price !== undefined 
            ? Number(service.price) 
            : NaN;
          return !isNaN(price) && price >= min;
        })
      );
    }

    if (filters.maxPrice) {
      const max = Number(filters.maxPrice);
      results = results.filter(provider => 
        provider.services?.some(service => {
          const price = service.price !== null && service.price !== undefined 
            ? Number(service.price) 
            : NaN;
          return !isNaN(price) && price <= max;
        })
      );
    }

    switch (filters.sortBy) {
      case 'rating-desc':
        results.sort((a, b) => (b.rating || 0) - (a.rating || 0));
        break;
      case 'price-asc':
        results.sort((a, b) => {
          const aValidPrices = a.services?.map(s => s.price).filter((p): p is number => typeof p === 'number' && !isNaN(p)) || [];
          const bValidPrices = b.services?.map(s => s.price).filter((p): p is number => typeof p === 'number' && !isNaN(p)) || [];
          
          const aMinPrice = aValidPrices.length > 0 ? Math.min(...aValidPrices) : Infinity;
          const bMinPrice = bValidPrices.length > 0 ? Math.min(...bValidPrices) : Infinity;
          
          return aMinPrice - bMinPrice;
        });
        break;
      case 'price-desc':
        results.sort((a, b) => {
          const aValidPrices = a.services?.map(s => s.price).filter((p): p is number => typeof p === 'number' && !isNaN(p)) || [];
          const bValidPrices = b.services?.map(s => s.price).filter((p): p is number => typeof p === 'number' && !isNaN(p)) || [];
          
          const aMaxPrice = aValidPrices.length > 0 ? Math.max(...aValidPrices) : -1;
          const bMaxPrice = bValidPrices.length > 0 ? Math.max(...bValidPrices) : -1;
          
          return bMaxPrice - aMaxPrice;
        });
        break;
      case 'requests-desc':
        results.sort((a, b) => (b.completedRequests || 0) - (a.completedRequests || 0));
        break;
      default:
        break;
    }

    setFilteredProviders(results);
  }, [filters, allProviders]);

  const handleContactProvider = (provider: ProviderProfile) => {
    if (!user) {
      addToast('Please sign up to access contact information', 'info');
      navigate('/register');
      return;
    }

    if (!provider.phoneNumber) {
      addToast('This provider has not shared their contact information', 'warning');
      return;
    }
    
    if (confirm(`Contact ${provider.firstName} ${provider.lastName} at ${provider.phoneNumber}?`)) {
      window.location.href = `tel:${provider.phoneNumber}`;
    }
  };

  const handleServiceRequest = (provider: ProviderProfile) => {
    if (!user) {
      addToast('Please sign up to request services', 'info');
      navigate('/register');
      return;
    }

    if (user.providerId && user.providerId.toString() === provider.id.toString()) {
      addToast('You cannot request your own services', 'warning');
      return;
    }

    if (!provider.services || provider.services.length === 0) {
      addToast('This provider has no services available', 'warning');
      return;
    }

    const firstService = provider.services[0];
    
    setSelectedProvider(provider);
    setSelectedServiceId(firstService.id);
    setSelectedServiceName(firstService.name);
    setShowServiceRequest(true);
  };

  const handleServiceRequestSuccess = () => {
    setShowServiceRequest(false);
    setSelectedProvider(null);
    setSelectedServiceId(null);
    setSelectedServiceName('');
    addToast('Service request sent successfully!', 'success');
  };

  const handleResetFilters = () => {
    setFilters({
      serviceId: '',
      collegeId: '',
      searchQuery: '',
      location: '',
      radius: 10,
      minPrice: '',
      maxPrice: '',
      sortBy: 'rating-desc',
      availability: ''
    });
    addToast('Filters reset', 'info');
  };

  // Helper function to get general location (city/area only)
  const getGeneralLocation = (address: string | undefined | null) => {
    if (!address) return null;
    const parts = address.split(',');
    return parts.length > 1 ? parts[parts.length - 1].trim() : parts[0].trim();
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="p-4 bg-red-100 text-red-700 rounded-lg">
          {error}
          <button 
            onClick={() => window.location.reload()}
            className="mt-2 w-full sm:w-auto sm:ml-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-50">
      <div className="container mx-auto px-4 py-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div>
            <h1 className="text-3xl sm:text-4xl font-light text-slate-800 mb-2">Service Providers</h1>
            <p className="text-slate-600">Discover talented professionals in your area</p>
            {!user && (
              <p className="text-sm text-blue-600 mt-2 flex items-center">
                <UserIcon className="h-4 w-4 mr-1" />
                Browse freely • Sign up to connect and request services
              </p>
            )}
          </div>
          
          <div className="flex flex-col sm:flex-row gap-3">
            {user?.role === 'service_provider' && (
              <Link 
                to="/provider/dashboard" 
                className="w-full sm:w-auto px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 text-center font-medium transition-all shadow-sm border border-blue-600"
              >
                My Dashboard
              </Link>
            )}
            
            {!user && (
              <div className="flex space-x-3">
                <button
                  onClick={() => navigate('/login')}
                  className="px-4 py-3 text-blue-600 border border-blue-300 rounded-xl hover:bg-blue-50 transition-all font-medium text-sm"
                >
                  Sign In
                </button>
                <button
                  onClick={() => navigate('/register')}
                  className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 font-medium transition-all shadow-sm text-sm"
                >
                  Sign Up Free
                </button>
              </div>
            )}
          </div>
        </div>
        
        {/* Enhanced Filters Section */}
        <div className="bg-white/80 backdrop-blur-sm p-6 rounded-2xl shadow-sm border border-slate-100/80 mb-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-slate-700 mb-2">Search</label>
              <input
                type="text"
                value={filters.searchQuery}
                onChange={(e) => setFilters({...filters, searchQuery: e.target.value})}
                placeholder="Search by name, bio, or services..."
                className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-300 transition-all bg-white/70 backdrop-blur-sm"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Service</label>
              <select
                value={filters.serviceId}
                onChange={(e) => setFilters({...filters, serviceId: e.target.value})}
                className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-300 transition-all bg-white/70 backdrop-blur-sm"
              >
                <option value="">All Services</option>
                {services.map(service => (
                  <option key={service.id} value={service.id}>
                    {service.name}
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">College</label>
              <select
                value={filters.collegeId}
                onChange={(e) => setFilters({...filters, collegeId: e.target.value})}
                className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-300 transition-all bg-white/70 backdrop-blur-sm"
              >
                <option value="">All Colleges</option>
                {colleges.map(college => (
                  <option key={college.id} value={college.id}>
                    {college.name}
                  </option>
                ))}
              </select>
            </div>
            
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-slate-700 mb-2">Price Range (KSh)</label>
              <div className="flex flex-col sm:flex-row gap-3">
                <input
                  type="number"
                  value={filters.minPrice}
                  onChange={(e) => setFilters({...filters, minPrice: e.target.value})}
                  placeholder="Min price (KSh)"
                  className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-300 transition-all bg-white/70 backdrop-blur-sm"
                  min="0"
                />
                <input
                  type="number"
                  value={filters.maxPrice}
                  onChange={(e) => setFilters({...filters, maxPrice: e.target.value})}
                  placeholder="Max price (KSh)"
                  className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-300 transition-all bg-white/70 backdrop-blur-sm"
                  min="0"
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Sort By</label>
              <select
                value={filters.sortBy}
                onChange={(e) => setFilters({...filters, sortBy: e.target.value})}
                className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-300 transition-all bg-white/70 backdrop-blur-sm"
              >
                <option value="rating-desc">Highest Rating</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
                <option value="requests-desc">Most Completed Requests</option>
              </select>
            </div>
            
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-slate-700 mb-2">Location</label>
              <div className="flex flex-col sm:flex-row gap-2">
                <input
                  type="text"
                  value={filters.location}
                  onChange={(e) => setFilters({...filters, location: e.target.value})}
                  placeholder="Zip code or address"
                  className="flex-1 px-4 py-3 border border-slate-200 rounded-xl sm:rounded-r-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-300 transition-all bg-white/70 backdrop-blur-sm"
                />
                <select
                  value={filters.radius}
                  onChange={(e) => setFilters({...filters, radius: Number(e.target.value)})}
                  className="px-4 py-3 border border-slate-200 rounded-xl sm:rounded-l-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-300 transition-all bg-white/70 backdrop-blur-sm"
                >
                  <option value="5">5 km</option>
                  <option value="10">10 km</option>
                  <option value="25">25 km</option>
                  <option value="50">50 km</option>
                </select>
              </div>
            </div>
          </div>
          
          <div className="mt-6">
            <label className="block text-sm font-medium text-slate-700 mb-2">Availability</label>
            <select
              value={filters.availability}
              onChange={(e) => setFilters({...filters, availability: e.target.value})}
              className="w-full sm:w-64 px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-300 transition-all bg-white/70 backdrop-blur-sm"
            >
              <option value="">Any</option>
              <option value="weekdays">Weekdays</option>
              <option value="weekends">Weekends</option>
              <option value="mornings">Mornings</option>
              <option value="evenings">Evenings</option>
            </select>
          </div>
          
          <div className="mt-6 flex justify-end">
            <button
              onClick={handleResetFilters}
              className="px-6 py-3 text-slate-600 hover:text-slate-800 hover:bg-slate-50 rounded-xl transition-all font-medium border border-slate-200 hover:border-slate-300"
            >
              Reset All Filters
            </button>
          </div>
        </div>

        {/* Providers Grid */}
        {filteredProviders.length === 0 ? (
          <div className="text-center py-16 bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm border border-slate-100/80">
            <UserIcon className="h-16 w-16 text-slate-300 mx-auto mb-4" />
            <h3 className="text-xl font-medium text-slate-900 mb-2">No providers found</h3>
            <p className="text-slate-600 mb-6">Try adjusting your search filters</p>
            <button
              onClick={handleResetFilters}
              className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 font-medium transition-all shadow-sm"
            >
              Clear Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 2xl:grid-cols-3 gap-6">
            {filteredProviders.map(provider => (
              <div key={provider.id} className="group bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm hover:shadow-lg transition-all border border-slate-100/80 overflow-hidden">
                <div className="p-6">
                  <div className="flex items-start gap-4 mb-6">
                    <div className="w-20 h-20 rounded-2xl overflow-hidden flex-shrink-0 shadow-md">
                      {provider.profileImageUrl ? (
                        <img 
                          src={provider.profileImageUrl} 
                          alt={`${provider.firstName} ${provider.lastName}`}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = '/default-avatar.png';
                          }}
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-blue-100 to-slate-100 flex items-center justify-center">
                          <span className="text-xl font-light text-slate-600">
                            {provider.firstName?.charAt(0)}{provider.lastName?.charAt(0)}
                          </span>
                        </div>
                      )}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <Link to={`/providers/public/${provider.id}`} className="group">
                        <h3 className="font-medium text-lg text-slate-800 group-hover:text-blue-600 transition-colors truncate">
                          {provider.firstName} {provider.lastName}
                        </h3>
                      </Link>
                      
                      {provider.college && (
                        <div className="flex items-center mt-1 text-sm text-slate-600">
                          <BuildingOfficeIcon className="h-4 w-4 mr-1 flex-shrink-0" />
                          <span className="truncate">{provider.college.name}</span>
                        </div>
                      )}
                      
                      {provider.address && (
                        <div className="flex items-center mt-1 text-sm text-slate-600">
                          <MapPinIcon className="h-4 w-4 mr-1 flex-shrink-0" />
                          <span className="truncate">
                            {user ? provider.address : getGeneralLocation(provider.address)}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div 
                      className={`bg-slate-50/70 rounded-xl p-3 text-center transition-colors ${
                        user 
                          ? 'cursor-pointer hover:bg-slate-100/70 hover:shadow-sm' 
                          : 'cursor-pointer'
                      }`}
                      onClick={() => {
                        if (user) {
                          navigate(`/providers/public/${provider.id}`);
                        } else {
                          addToast('Sign up to rate providers', 'info');
                          navigate('/register');
                        }
                      }}
                    >
                      <div className="flex items-center justify-center mb-1">
                        <StarIcon className={`h-4 w-4 mr-1 ${(provider.rating || 0) > 0 ? 'text-amber-400 fill-amber-400' : 'text-slate-300'}`} />
                        <span className="font-medium text-slate-800">
                          {provider.rating ? provider.rating.toFixed(1) : 'New'}
                        </span>
                      </div>
                      <p className="text-xs text-slate-600">
                        {user ? 'Click to rate' : 'Sign up to rate'}
                      </p>
                    </div>
                    
                    <div className="bg-slate-50/70 rounded-xl p-3 text-center">
                      <div className="font-medium text-slate-800 mb-1">
                        {provider.completedRequests || 0}
                      </div>
                      <p className="text-xs text-slate-600">Completed</p>
                    </div>
                  </div>

                  <div className="mb-6">
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-medium text-slate-700 mb-2">
                        Price Range
                      </h4>
                      <span className="text-sm font-medium text-blue-600 bg-blue-50 px-3 py-1 rounded-lg">
                        {user ? formatPriceRange(provider.services) : 'Contact for pricing'}
                      </span>
                    </div>
                  </div>
                  
                  {provider.bio && (
                    <div className="mb-6">
                      <p className="text-sm text-slate-700 line-clamp-3 leading-relaxed">
                        {provider.bio}
                      </p>
                    </div>
                  )}
                  
                  {provider.services && provider.services.length > 0 && (
                    <div className="mb-6">
                      <h4 className="text-sm font-medium text-slate-700 mb-3">Services Offered</h4>
                      <div className="space-y-2">
                        {provider.services.slice(0, 3).map(service => (
                          <div key={service.id} className="flex justify-between items-center p-3 bg-slate-50/70 rounded-lg">
                            <span className="text-sm text-slate-700 flex-1 mr-3 truncate">
                              {service.name}
                            </span>
                            <span className="text-sm font-medium text-blue-600 bg-blue-50 px-2 py-1 rounded whitespace-nowrap">
                              {user ? (
                                service.price !== undefined && service.price !== null 
                                  ? formatPrice(service.price)
                                  : 'Quote'
                              ) : (
                                'Contact'
                              )}
                            </span>
                          </div>
                        ))}
                        {provider.services.length > 3 && (
                          <div className="text-sm text-slate-500 italic text-center py-2">
                            +{provider.services.length - 3} more services
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {provider.pastWorks && provider.pastWorks.length > 0 && (
                    <div className="mb-6">
                      <h4 className="text-sm font-medium text-slate-700 mb-3 flex items-center">
                        <PhotoIcon className="h-4 w-4 mr-1" />
                        Portfolio Preview
                      </h4>
                      <div className="flex gap-2 overflow-x-auto pb-2">
                        {provider.pastWorks.slice(0, 4).map((work, index) => (
                          <div key={index} className="flex-shrink-0 w-20 h-20 relative group cursor-pointer">
                            <img
                              src={work.imageUrl}
                              alt={`Portfolio item ${index + 1}`}
                              className="w-full h-full object-cover rounded-lg shadow-sm"
                              onError={(e) => {
                                (e.target as HTMLImageElement).src = '/default-work.png';
                              }}
                              onClick={() => {
                                if (user) {
                                  setSelectedImage(work.imageUrl);
                                } else {
                                  addToast('Sign up to view full portfolio', 'info');
                                  navigate('/register');
                                }
                              }}
                            />
                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 rounded-lg transition-all flex items-center justify-center">
                              <EyeIcon className="h-5 w-5 text-white opacity-0 group-hover:opacity-100 transition-opacity drop-shadow-lg" />
                            </div>
                          </div>
                        ))}
                        {provider.pastWorks.length > 4 && (
                          <div className="flex-shrink-0 w-20 h-20 bg-slate-100 rounded-lg flex items-center justify-center">
                            <span className="text-xs text-slate-600 font-medium">
                              +{provider.pastWorks.length - 4}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-slate-100">
                    <Link 
                      to={`/providers/public/${provider.id}`}
                      className="flex-1 px-4 py-3 text-blue-600 hover:text-blue-800 font-medium text-sm text-center border border-blue-200 rounded-xl hover:bg-blue-50 hover:border-blue-300 transition-all"
                    >
                      View Full Profile
                    </Link>
                    
                    {/* Show Request Service button for authenticated users */}
                    {user && user.providerId?.toString() !== provider.id.toString() && (
                      <button
                        onClick={() => handleServiceRequest(provider)}
                        disabled={!provider.services || provider.services.length === 0}
                        className={`flex-1 px-4 py-3 rounded-xl font-medium text-sm transition-all flex items-center justify-center ${
                          provider.services && provider.services.length > 0
                            ? 'bg-green-600 text-white hover:bg-green-700 shadow-sm hover:shadow-md transform hover:scale-105' 
                            : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                        }`}
                      >
                        <PaperAirplaneIcon className="h-4 w-4 mr-2" />
                        {provider.services && provider.services.length > 0 ? 'Request Service' : 'No Services'}
                      </button>
                    )}

                    {/* Show "Your Profile" indicator for own profile */}
                    {user && user.providerId?.toString() === provider.id.toString() && (
                      <div className="flex-1 px-4 py-3 bg-blue-50 text-blue-700 rounded-xl border border-blue-200 text-center text-sm font-medium">
                        <UserIcon className="h-4 w-4 inline mr-2" />
                        Your Profile
                      </div>
                    )}
                    
                    {/* Show contact button for logged users only if phone is available and not own profile */}
                    {user && provider.phoneNumber && user.providerId?.toString() !== provider.id.toString() && (
                      <button
                        onClick={() => handleContactProvider(provider)}
                        className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 shadow-sm font-medium text-sm transition-all flex items-center justify-center hover:shadow-md"
                      >
                        <PhoneIcon className="h-4 w-4 mr-2" />
                        Contact Now
                      </button>
                    )}

                    {/* Show general contact info for logged users when phone not available */}
                    {user && !provider.phoneNumber && user.providerId?.toString() !== provider.id.toString() && (
                      <div className="flex-1 px-4 py-3 bg-amber-50 text-amber-800 rounded-xl border border-amber-200 text-center text-sm">
                        <p>Contact via services</p>
                      </div>
                    )}

                    {/* Show sign up prompt for non-authenticated users */}
                    {!user && (
                      <div className="flex-1 px-4 py-3 bg-gradient-to-r from-blue-50 to-green-50 text-blue-800 rounded-xl border border-blue-200 text-center text-sm">
                        <div className="flex items-center justify-center mb-2">
                          <UserIcon className="h-4 w-4 mr-1" />
                          <span className="font-medium">Connect with {provider.firstName}</span>
                        </div>
                        <div className="flex space-x-2">
                          <Link 
                            to="/login"
                            className="flex-1 px-2 py-1 text-blue-600 border border-blue-300 rounded text-xs font-medium hover:bg-blue-50 transition-colors"
                          >
                            Sign In
                          </Link>
                          <Link 
                            to="/register"
                            className="flex-1 px-2 py-1 bg-blue-600 text-white rounded text-xs font-medium hover:bg-blue-700 transition-colors"
                          >
                            Sign Up
                          </Link>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Service Request Modal */}
        {showServiceRequest && selectedProvider && selectedServiceId && (
          <DirectServiceRequest
            providerId={selectedProvider.id}
            serviceId={selectedServiceId}
            serviceName={selectedServiceName}
            providerName={`${selectedProvider.firstName} ${selectedProvider.lastName}`}
            isOpen={showServiceRequest}
            onClose={() => setShowServiceRequest(false)}
            onSuccess={handleServiceRequestSuccess}
          />
        )}

        {/* Image Preview Modal - For authenticated users */}
        {selectedImage && user && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="relative max-w-4xl max-h-[90vh] w-full">
              <button
                onClick={() => setSelectedImage(null)}
                className="absolute -top-12 right-0 text-white/80 hover:text-white transition-colors p-2 rounded-full hover:bg-white/10"
              >
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
              <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-2 border border-white/20">
                <img
                  src={selectedImage}
                  alt="Portfolio item"
                  className="w-full h-full object-contain rounded-xl shadow-2xl max-h-[80vh]"
                />
              </div>
            </div>
          </div>
        )}

        {/* Floating Sign Up Button for non-authenticated users */}
        {!user && (
          <div className="fixed bottom-6 right-6 z-40">
            <button
              onClick={() => navigate('/register')}
              className="bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700 text-white px-6 py-3 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 group text-sm font-medium"
              title="Sign up to connect with providers"
            >
              <UserIcon className="h-5 w-5 inline mr-2 group-hover:scale-110 transition-transform" />
              Join Free
            </button>
          </div>
        )}
      </div>
    </div>
  );
}