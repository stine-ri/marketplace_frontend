import { useState, useEffect } from 'react';
import axios from 'axios';
import { useGeolocation } from '../../hooks/useGeolocation';

const baseURL = import.meta.env.VITE_API_BASE_URL || 'https://mkt-backend-sz2s.onrender.com';

interface Service {
  id: number;
  name: string;
  // add more fields if needed
}

interface College {
  id: number;
  name: string;
  // add other fields if needed
}


export default function ServiceRequestForm() {
  const [services, setServices] = useState<Service[]>([]);
  const [colleges, setColleges] = useState<College[]>([]);
  const [isService, setIsService] = useState(true);
  const [selectedService, setSelectedService] = useState('');
  const [productName, setProductName] = useState('');
  const [description, setDescription] = useState('');
  const [desiredPrice, setDesiredPrice] = useState('');
  const [useCollegeFilter, setUseCollegeFilter] = useState(false);
  const [selectedCollege, setSelectedCollege] = useState('');
  const [location, setLocation] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  const { latitude, longitude, error: geoError } = useGeolocation();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [servicesRes, collegesRes] = await Promise.all([
          axios.get(`${baseURL}/api/services`),
          axios.get(`${baseURL}/api/colleges`),
        ]);
        setServices(servicesRes.data);
        setColleges(collegesRes.data);
      } catch (err) {
        setError('Failed to load data');
      }
    };
    
    fetchData();
  }, []);

  useEffect(() => {
    if (geoError) {
      setError('Please enable location services for better results');
    } else if (latitude && longitude) {
      setLocation(`${latitude},${longitude}`);
    }
  }, [geoError, latitude, longitude]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setSuccess('');
    
    try {
      const requestData = {
        isService,
        serviceId: isService ? selectedService : null,
        productName: !isService ? productName : null,
        description,
        desiredPrice: parseFloat(desiredPrice),
        location,
        collegeFilter: useCollegeFilter ? selectedCollege : null,
        clientId: 1, // Replace with actual client ID from auth
      };
      
      const response = await axios.post(`${baseURL}/api/service-requests`, requestData);
      setSuccess('Your request has been submitted successfully!');
      // Reset form
      if (isService) setSelectedService('');
      else setProductName('');
      setDescription('');
      setDesiredPrice('');
      setUseCollegeFilter(false);
      setSelectedCollege('');
    } catch (err: unknown) {
  if (axios.isAxiosError(err)) {
    setError(err.response?.data?.message || 'Failed to submit request');
  } else {
    setError('An unexpected error occurred');
  }
} finally {
  setIsLoading(false);
}
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6">Request a Service or Product</h2>
      
      {error && <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">{error}</div>}
      {success && <div className="mb-4 p-3 bg-green-100 text-green-700 rounded">{success}</div>}
      
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">I want to:</label>
          <div className="flex gap-4">
            <label className="inline-flex items-center">
              <input
                type="radio"
                checked={isService}
                onChange={() => setIsService(true)}
                className="form-radio"
              />
              <span className="ml-2">Request a service</span>
            </label>
            <label className="inline-flex items-center">
              <input
                type="radio"
                checked={!isService}
                onChange={() => setIsService(false)}
                className="form-radio"
              />
              <span className="ml-2">Request a product</span>
            </label>
          </div>
        </div>
        
        {isService ? (
          <div className="mb-4">
            <label htmlFor="service" className="block text-sm font-medium mb-1">
              Service
            </label>
            <select
              id="service"
              value={selectedService}
              onChange={(e) => setSelectedService(e.target.value)}
              className="w-full p-2 border rounded"
              required
            >
              <option value="">Select a service</option>
              {services.map((service) => (
                <option key={service.id} value={service.id}>
                  {service.name}
                </option>
              ))}
            </select>
          </div>
        ) : (
          <div className="mb-4">
            <label htmlFor="product" className="block text-sm font-medium mb-1">
              Product Name
            </label>
            <input
              type="text"
              id="product"
              value={productName}
              onChange={(e) => setProductName(e.target.value)}
              className="w-full p-2 border rounded"
              required
            />
          </div>
        )}
        
        <div className="mb-4">
          <label htmlFor="description" className="block text-sm font-medium mb-1">
            Description
          </label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full p-2 border rounded"
            rows={3}
          />
        </div>
        
        <div className="mb-4">
          <label htmlFor="price" className="block text-sm font-medium mb-1">
            Desired Price ($)
          </label>
          <input
            type="number"
            id="price"
            value={desiredPrice}
            onChange={(e) => setDesiredPrice(e.target.value)}
            className="w-full p-2 border rounded"
            min="0"
            step="0.01"
            required
          />
        </div>
        
        <div className="mb-4">
          <label className="inline-flex items-center">
            <input
              type="checkbox"
              checked={useCollegeFilter}
              onChange={(e) => setUseCollegeFilter(e.target.checked)}
              className="form-checkbox"
            />
            <span className="ml-2">Only allow graduates from specific college to respond</span>
          </label>
          
          {useCollegeFilter && (
            <div className="mt-2">
              <select
                value={selectedCollege}
                onChange={(e) => setSelectedCollege(e.target.value)}
                className="w-full p-2 border rounded"
              >
                <option value="">Select a college</option>
                {colleges.map((college) => (
                  <option key={college.id} value={college.id}>
                    {college.name}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>
        
        <div className="mb-4">
          <label htmlFor="location" className="block text-sm font-medium mb-1">
            Location
          </label>
          <input
            type="text"
            id="location"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            className="w-full p-2 border rounded"
            required
          />
          {geoError && (
            <p className="text-sm text-red-600 mt-1">
              Couldn't get your location automatically. Please enter it manually.
            </p>
          )}
        </div>
        
        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 disabled:opacity-50"
        >
          {isLoading ? 'Submitting...' : 'Submit Request'}
        </button>
      </form>
    </div>
  );
}