// src/pages/ProvidersList.tsx
import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { ProviderProfile, Service, College } from '../types/types';
import { AxiosError } from 'axios';

const baseURL = import.meta.env.VITE_API_BASE_URL || 'https://mkt-backend-sz2s.onrender.com';

export default function ProvidersList() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [allProviders, setAllProviders] = useState<ProviderProfile[]>([]);
  const [filteredProviders, setFilteredProviders] = useState<ProviderProfile[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [colleges, setColleges] = useState<College[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
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

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const [providersRes, servicesRes, collegesRes] = await Promise.all([
        axios.get(`${baseURL}/api/provider/public/all`),
        axios.get(`${baseURL}/api/services`),
        axios.get(`${baseURL}/api/colleges`)
      ]);

      const processedProviders = (providersRes.data?.data || []).map((provider: any) => ({
        ...provider,
        id: provider.id.toString(),
        services: (provider.services || []).map((service: any) => ({
          ...service,
          price: service.price !== undefined && service.price !== null 
            ? Number(service.price) 
            : undefined
        })),
        rating: provider.rating || 0,
        completedRequests: provider.completedRequests || 0,
        college: provider.college || null
      }));

      setAllProviders(processedProviders);
      setFilteredProviders(processedProviders);
      setServices(servicesRes.data);
      setColleges(collegesRes.data);

    } catch (err) {
      console.error('Fetch error:', err);
      setError(
        axios.isAxiosError(err) 
          ? err.response?.data?.error || 'Failed to load providers'
          : 'Failed to load providers'
      );
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
        provider.services?.some(service => 
          service.price && service.price >= min
        )
      );
    }

    if (filters.maxPrice) {
      const max = Number(filters.maxPrice);
      results = results.filter(provider => 
        provider.services?.some(service => 
          service.price && service.price <= max
        )
      );
    }

    switch (filters.sortBy) {
      case 'rating-desc':
        results.sort((a, b) => (b.rating || 0) - (a.rating || 0));
        break;
      case 'price-asc':
        results.sort((a, b) => {
          const aMinPrice = Math.min(...(a.services?.map(s => s.price || Infinity) || [Infinity]));
          const bMinPrice = Math.min(...(b.services?.map(s => s.price || Infinity) || [Infinity]));
          return aMinPrice - bMinPrice;
        });
        break;
      case 'price-desc':
        results.sort((a, b) => {
          const aMaxPrice = Math.max(...(a.services?.map(s => s.price || -Infinity) || [-Infinity]));
          const bMaxPrice = Math.max(...(b.services?.map(s => s.price || -Infinity) || [-Infinity]));
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
    if (!provider.phoneNumber) {
      alert('This provider has not shared their contact information');
      return;
    }
    
    if (confirm(`Contact ${provider.firstName} ${provider.lastName} at ${provider.phoneNumber}?`)) {
      window.location.href = `tel:${provider.phoneNumber}`;
    }
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
      <div className="container mx-auto py-8 px-4">
        <div className="p-4 bg-red-100 text-red-700 rounded-lg">
          {error}
          <button 
            onClick={() => window.location.reload()}
            className="ml-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Available Service Providers</h1>
        {user?.role === 'service_provider' && (
          <Link 
            to="/provider/dashboard" 
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            My Dashboard
          </Link>
        )}
      </div>
      
      <div className="bg-white p-6 rounded-lg shadow-md mb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
            <input
              type="text"
              value={filters.searchQuery}
              onChange={(e) => setFilters({...filters, searchQuery: e.target.value})}
              placeholder="Search by name, bio, or services..."
              className="w-full p-2 border border-gray-300 rounded-lg"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Service</label>
            <select
              value={filters.serviceId}
              onChange={(e) => setFilters({...filters, serviceId: e.target.value})}
              className="w-full p-2 border border-gray-300 rounded-lg"
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
            <label className="block text-sm font-medium text-gray-700 mb-1">College</label>
            <select
              value={filters.collegeId}
              onChange={(e) => setFilters({...filters, collegeId: e.target.value})}
              className="w-full p-2 border border-gray-300 rounded-lg"
            >
              <option value="">All Colleges</option>
              {colleges.map(college => (
                <option key={college.id} value={college.id}>
                  {college.name}
                </option>
              ))}
            </select>
          </div>
          
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Price Range</label>
            <div className="flex space-x-2">
              <input
                type="number"
                value={filters.minPrice}
                onChange={(e) => setFilters({...filters, minPrice: e.target.value})}
                placeholder="Min price"
                className="flex-1 p-2 border border-gray-300 rounded-lg"
                min="0"
              />
              <input
                type="number"
                value={filters.maxPrice}
                onChange={(e) => setFilters({...filters, maxPrice: e.target.value})}
                placeholder="Max price"
                className="flex-1 p-2 border border-gray-300 rounded-lg"
                min="0"
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Sort By</label>
            <select
              value={filters.sortBy}
              onChange={(e) => setFilters({...filters, sortBy: e.target.value})}
              className="w-full p-2 border border-gray-300 rounded-lg"
            >
              <option value="rating-desc">Highest Rating</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
              <option value="requests-desc">Most Completed Requests</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
            <div className="flex">
              <input
                type="text"
                value={filters.location}
                onChange={(e) => setFilters({...filters, location: e.target.value})}
                placeholder="Zip code or address"
                className="flex-1 p-2 border border-gray-300 rounded-l-lg"
              />
              <select
                value={filters.radius}
                onChange={(e) => setFilters({...filters, radius: Number(e.target.value)})}
                className="p-2 border border-gray-300 rounded-r-lg"
              >
                <option value="5">5 mi</option>
                <option value="10">10 mi</option>
                <option value="25">25 mi</option>
                <option value="50">50 mi</option>
              </select>
            </div>
          </div>
        </div>
        
        <div className="mt-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">Availability</label>
          <select
            value={filters.availability}
            onChange={(e) => setFilters({...filters, availability: e.target.value})}
            className="w-full p-2 border border-gray-300 rounded-lg"
          >
            <option value="">Any</option>
            <option value="weekdays">Weekdays</option>
            <option value="weekends">Weekends</option>
            <option value="mornings">Mornings</option>
            <option value="evenings">Evenings</option>
          </select>
        </div>
        
        <div className="mt-4 flex justify-end">
          <button
            onClick={handleResetFilters}
            className="px-4 py-2 text-gray-600 hover:text-gray-800"
          >
            Reset All Filters
          </button>
        </div>
      </div>

      {filteredProviders.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg shadow-md">
          <h3 className="text-xl font-medium text-gray-900">No providers found</h3>
          <p className="mt-2 text-gray-600">Try adjusting your search filters</p>
          <button
            onClick={handleResetFilters}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Clear Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProviders.map(provider => (
            <div key={provider.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
              <div className="p-6">
                <div className="flex items-start">
                  <div className="w-20 h-20 rounded-full overflow-hidden mr-4 flex-shrink-0">
                    {provider.profileImageUrl ? (
                      <img 
                        src={provider.profileImageUrl} 
                        alt={`${provider.firstName} ${provider.lastName}`}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                        <span className="text-2xl font-bold text-gray-500">
                          {provider.firstName?.charAt(0)}{provider.lastName?.charAt(0)}
                        </span>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex-1">
                    <Link to={`/providers/public/${provider.id}`}>
                      <h3 className="font-bold text-xl hover:text-blue-600">
                        {provider.firstName} {provider.lastName}
                      </h3>
                    </Link>
                    
                    {provider.college && (
                      <p className="text-sm text-gray-600 mt-1">
                        {provider.college.name}
                      </p>
                    )}
                    
                    <div className="mt-2 flex items-center">
                      <div className="flex text-yellow-400 mr-2">
                        {[...Array(5)].map((_, i) => (
                          <svg
                            key={i}
                            className={`w-5 h-5 ${i < (provider.rating || 0) ? 'text-yellow-400' : 'text-gray-300'}`}
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                          </svg>
                        ))}
                      </div>
                      <span className="text-sm text-gray-600">
                        ({provider.completedRequests || 0} requests)
                      </span>
                    </div>
                    
                    {provider.services && provider.services.length > 0 && (
                      <div className="mt-1">
                        <span className="text-sm font-medium">
                          {(() => {
                            const prices = provider.services
                              .map(s => s.price)
                              .filter(price => price !== undefined && price !== null);
                            
                            if (prices.length === 0) return 'Price not set';
                            
                            const min = Math.min(...prices);
                            const max = Math.max(...prices);
                            
                            return min === max 
                              ? `$${min}` 
                              : `$${min} - $${max}`;
                          })()}
                        </span>
                      </div>
                    )}
                    
                    {provider.bio && (
                      <p className="mt-4 text-gray-700 line-clamp-3">
                        {provider.bio}
                      </p>
                    )}
                    
                    {provider.services && provider.services.length > 0 && (
                      <div className="mt-4">
                        <h4 className="text-sm font-medium text-gray-700 mb-2">Services Offered</h4>
                        <div className="flex flex-wrap gap-2">
                          {provider.services.slice(0, 3).map(service => (
                            <span 
                              key={service.id}
                              className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                            >
                              {service.name} (${service.price ?? '?'})
                            </span>
                          ))}
                          {provider.services.length > 3 && (
                            <span className="px-3 py-1 bg-gray-100 text-gray-800 rounded-full text-sm">
                              +{provider.services.length - 3} more
                            </span>
                          )}
                        </div>
                      </div>
                    )}
                    
                    <div className="mt-6 flex justify-between items-center">
                      <Link 
                        to={`/providers/public/${provider.id}`}
                        className="px-4 py-2 text-blue-600 hover:text-blue-800 font-medium"
                      >
                        View Profile
                      </Link>
                      
                      {user?.role === 'client' && (
                        <button
                          onClick={() => handleContactProvider(provider)}
                          disabled={!provider.phoneNumber}
                          className={`px-4 py-2 rounded-lg font-medium ${
                            provider.phoneNumber 
                              ? 'bg-green-600 text-white hover:bg-green-700' 
                              : 'bg-gray-200 text-gray-500 cursor-not-allowed'
                          }`}
                        >
                          {provider.phoneNumber ? 'Contact' : 'No Contact'}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}