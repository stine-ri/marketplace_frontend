// src/pages/ProvidersList.tsx
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { ProviderProfile, Service, College } from '../types/types';

const baseURL = import.meta.env.VITE_API_BASE_URL || 'https://mkt-backend-sz2s.onrender.com';

export default function ProvidersList() {
  const [providers, setProviders] = useState<ProviderProfile[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [colleges, setColleges] = useState<College[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState({
    serviceId: '',
    collegeId: '',
    searchQuery: ''
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        const params = new URLSearchParams();
        if (filters.serviceId) params.append('serviceId', filters.serviceId);
        if (filters.collegeId) params.append('collegeId', filters.collegeId);
        if (filters.searchQuery) params.append('search', filters.searchQuery);

        const [providersRes, servicesRes, collegesRes] = await Promise.all([
          axios.get(`${baseURL}/api/provider/all?${params.toString()}`),
          axios.get(`${baseURL}/api/services`),
          axios.get(`${baseURL}/api/colleges`)
        ]);
        
        setProviders(providersRes.data);
        setServices(servicesRes.data);
        setColleges(collegesRes.data);
      } catch (err) {
        setError('Failed to load providers');
        console.error('Error fetching providers:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [filters]);

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
        <div className="p-4 bg-red-100 text-red-700 rounded">
          {error}
          <button 
            onClick={() => window.location.reload()}
            className="ml-4 px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-8">Available Service Providers</h1>
      
      {/* Filters Section */}
      <div className="bg-white p-4 rounded-lg shadow-md mb-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Service</label>
            <select
              value={filters.serviceId}
              onChange={(e) => setFilters({...filters, serviceId: e.target.value})}
              className="w-full p-2 border border-gray-300 rounded"
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
              className="w-full p-2 border border-gray-300 rounded"
            >
              <option value="">All Colleges</option>
              {colleges.map(college => (
                <option key={college.id} value={college.id}>
                  {college.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
            <input
              type="text"
              value={filters.searchQuery}
              onChange={(e) => setFilters({...filters, searchQuery: e.target.value})}
              placeholder="Search providers..."
              className="w-full p-2 border border-gray-300 rounded"
            />
          </div>
        </div>
      </div>

      {/* Providers Grid */}
      {providers.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          No service providers found matching your criteria
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {providers.map(provider => (
            <div key={provider.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
              <Link to={`/providers/${provider.id}`}>
                <div className="p-4">
                  <div className="flex items-center">
                    <div className="w-16 h-16 rounded-full overflow-hidden mr-4">
                      {provider.profileImageUrl ? (
                        <img 
                          src={provider.profileImageUrl} 
                          alt={`${provider.firstName} ${provider.lastName}`}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                          <span className="text-xl font-bold text-gray-500">
                            {provider.firstName?.charAt(0)}{provider.lastName?.charAt(0)}
                          </span>
                        </div>
                      )}
                    </div>
                    <div>
                      <h3 className="font-bold text-lg">{provider.firstName} {provider.lastName}</h3>
                      {provider.college && (
                        <p className="text-sm text-gray-600">{provider.college.name}</p>
                      )}
                    </div>
                  </div>
                  
                  <div className="mt-4">
                    <div className="flex items-center">
                      <div className="flex text-yellow-400 mr-1">
                        {[...Array(5)].map((_, i) => (
                          <svg
                            key={i}
                            className={`w-4 h-4 ${i < (provider.rating || 0) ? 'text-yellow-400' : 'text-gray-300'}`}
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
                  </div>
                  
                  {provider.services && provider.services.length > 0 && (
                    <div className="mt-3">
                      <div className="flex flex-wrap gap-1">
                        {provider.services.slice(0, 3).map(service => (
                          <span 
                            key={service.id}
                            className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs"
                          >
                            {service.name}
                          </span>
                        ))}
                        {provider.services.length > 3 && (
                          <span className="px-2 py-1 bg-gray-100 text-gray-800 rounded-full text-xs">
                            +{provider.services.length - 3} more
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}