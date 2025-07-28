// src/components/AdminPanel.tsx
import { useState, useEffect } from 'react';
import axios from 'axios';
import { Service, College } from '../../types/types';
import { FiSearch, FiTrash2, FiDownload } from 'react-icons/fi';


const baseURL = import.meta.env.VITE_API_BASE_URL || 'https://mkt-backend-sz2s.onrender.com';

export default function AdminPanel() {
  const [services, setServices] = useState<Service[]>([]);
  const [colleges, setColleges] = useState<College[]>([]);
  const [newService, setNewService] = useState('');
  const [newServiceCategory, setNewServiceCategory] = useState('');
  const [newCollege, setNewCollege] = useState('');
  const [activeTab, setActiveTab] = useState<'services' | 'colleges'>('services');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedItems, setSelectedItems] = useState<number[]>([]);

  // Fetch all data on initial load
  useEffect(() => {
    const fetchAllData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const [servicesRes, collegesRes] = await Promise.all([
          axios.get<Service[]>(`${baseURL}/api/services`),
          axios.get<College[]>(`${baseURL}/api/colleges`)
        ]);
        setServices(servicesRes.data);
        setColleges(collegesRes.data);
      } catch (err) {
        setError('Failed to load data. Please try again.');
        console.error('Error fetching data:', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchAllData();
  }, []);

  const handleAddService = async () => {
    if (!newService.trim()) {
      setError('Service name cannot be empty');
      return;
    }
    
    try {
      const res = await axios.post<Service>(`${baseURL}/api/services`, { 
        name: newService.trim(),
        category: newServiceCategory.trim() || undefined
      });
      setServices([...services, res.data]);
      setNewService('');
      setNewServiceCategory('');
      setError(null);
    } catch (err) {
      setError('Failed to add service');
      console.error('Error adding service:', err);
    }
  };

  const handleDeleteService = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this service?')) return;
    
    try {
      await axios.delete(`${baseURL}/api/services/${id}`);
      setServices(services.filter(service => service.id !== id));
      setSelectedItems(selectedItems.filter(itemId => itemId !== id));
    } catch (err) {
      setError('Failed to delete service');
      console.error('Error deleting service:', err);
    }
  };

  const handleAddCollege = async () => {
    if (!newCollege.trim()) {
      setError('College name cannot be empty');
      return;
    }
    
    try {
      const res = await axios.post<College>(`${baseURL}/api/colleges`, { 
        name: newCollege,
        location: ''
      });
      setColleges([...colleges, res.data]);
      setNewCollege('');
      setError(null);
    } catch (err) {
      setError('Failed to add college');
      console.error('Error adding college:', err);
    }
  };

  const handleDeleteCollege = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this college?')) return;
    
    try {
      await axios.delete(`${baseURL}/api/colleges/${id}`);
      setColleges(colleges.filter(college => college.id !== id));
      setSelectedItems(selectedItems.filter(itemId => itemId !== id));
    } catch (err) {
      setError('Failed to delete college');
      console.error('Error deleting college:', err);
    }
  };

  const handleBulkDelete = async () => {
    if (!window.confirm(`Are you sure you want to delete ${selectedItems.length} items?`)) return;
    
    try {
      if (activeTab === 'services') {
        await axios.post(`${baseURL}/api/services/bulk-delete`, { ids: selectedItems });
        setServices(services.filter(service => !selectedItems.includes(service.id)));
      } else {
        await axios.post(`${baseURL}/api/colleges/bulk-delete`, { ids: selectedItems });
        setColleges(colleges.filter(college => !selectedItems.includes(college.id)));
      }
      setSelectedItems([]);
    } catch (err) {
      setError('Failed to delete items');
    }
  };

  const handleExport = () => {
    const data = activeTab === 'services' ? services : colleges;
    const headers = activeTab === 'services' 
      ? ['ID', 'Name', 'Category'] 
      : ['ID', 'Name', 'Location'];
    
    const csvContent = [
      headers.join(','),
      ...data.map(item => 
        activeTab === 'services'
          ? `${item.id},"${item.name}","${(item as Service).category || ''}"`
          : `${item.id},"${item.name}","${(item as College).location || ''}"`
      )
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${activeTab}-${new Date().toISOString().slice(0,10)}.csv`;
    link.click();
  };

  const filteredServices = services.filter(service => 
    service.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (service.category && service.category.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const filteredColleges = colleges.filter(college => 
    college.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (college.location && college.location.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Admin Dashboard</h1>
      
      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">
          {error}
        </div>
      )}

      <div className="mb-4 flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <FiSearch className="absolute left-3 top-3 text-gray-400" />
          <input
            type="text"
            placeholder={`Search ${activeTab}...`}
            className="w-full pl-10 pr-4 py-2 border rounded"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex gap-2">
          {selectedItems.length > 0 && (
            <button
              onClick={handleBulkDelete}
              className="flex items-center gap-2 bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
            >
              <FiTrash2 /> Delete Selected
            </button>
          )}
          <button
            onClick={handleExport}
            className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
          >
            <FiDownload /> Export
          </button>
        </div>
      </div>

      <div className="flex border-b mb-6">
        <button
          className={`py-2 px-4 font-medium ${
            activeTab === 'services' 
              ? 'border-b-2 border-blue-500 text-blue-600' 
              : 'text-gray-500 hover:text-gray-700'
          }`}
          onClick={() => {
            setActiveTab('services');
            setSelectedItems([]);
          }}
        >
          Services
        </button>
        <button
          className={`py-2 px-4 font-medium ${
            activeTab === 'colleges' 
              ? 'border-b-2 border-blue-500 text-blue-600' 
              : 'text-gray-500 hover:text-gray-700'
          }`}
          onClick={() => {
            setActiveTab('colleges');
            setSelectedItems([]);
          }}
        >
          Colleges
        </button>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : activeTab === 'services' ? (
        <div className="space-y-6">
          <div>
            <h2 className="text-xl font-semibold mb-4">Add New Service</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Service Name</label>
                <input
                  type="text"
                  placeholder="Enter service name"
                  className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
                  value={newService}
                  onChange={(e) => setNewService(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                <input
                  type="text"
                  placeholder="Enter category"
                  className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
                  value={newServiceCategory}
                  onChange={(e) => setNewServiceCategory(e.target.value)}
                />
              </div>
            </div>
            <button
              onClick={handleAddService}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              Add Service
            </button>
          </div>

          <div>
            <h2 className="text-xl font-semibold mb-4">Current Services</h2>
            {filteredServices.length === 0 ? (
              <p className="text-gray-500">No services available</p>
            ) : (
              <div className="bg-white shadow rounded-lg overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        <input
                          type="checkbox"
                          checked={selectedItems.length === filteredServices.length && filteredServices.length > 0}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedItems(filteredServices.map(s => s.id));
                            } else {
                              setSelectedItems([]);
                            }
                          }}
                        />
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Name
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Category
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredServices.map(service => (
                      <tr key={service.id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <input
                            type="checkbox"
                            checked={selectedItems.includes(service.id)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedItems([...selectedItems, service.id]);
                              } else {
                                setSelectedItems(selectedItems.filter(id => id !== service.id));
                              }
                            }}
                          />
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {service.name}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {service.category || '-'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          <button
                            onClick={() => handleDeleteService(service.id)}
                            className="text-red-600 hover:text-red-900 px-2 py-1 rounded hover:bg-red-50"
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          <div>
            <h2 className="text-xl font-semibold mb-4">Add New College</h2>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Enter college name"
                className="flex-1 p-2 border rounded focus:ring-2 focus:ring-blue-500"
                value={newCollege}
                onChange={(e) => setNewCollege(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleAddCollege()}
              />
              <button
                onClick={handleAddCollege}
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
              >
                Add College
              </button>
            </div>
          </div>

          <div>
            <h2 className="text-xl font-semibold mb-4">Current Colleges</h2>
            {filteredColleges.length === 0 ? (
              <p className="text-gray-500">No colleges available</p>
            ) : (
              <div className="bg-white shadow rounded-lg overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        <input
                          type="checkbox"
                          checked={selectedItems.length === filteredColleges.length && filteredColleges.length > 0}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedItems(filteredColleges.map(c => c.id));
                            } else {
                              setSelectedItems([]);
                            }
                          }}
                        />
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Name
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Location
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredColleges.map(college => (
                      <tr key={college.id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <input
                            type="checkbox"
                            checked={selectedItems.includes(college.id)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedItems([...selectedItems, college.id]);
                              } else {
                                setSelectedItems(selectedItems.filter(id => id !== college.id));
                              }
                            }}
                          />
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {college.name}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {college.location || '-'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          <button
                            onClick={() => handleDeleteCollege(college.id)}
                            className="text-red-600 hover:text-red-900 px-2 py-1 rounded hover:bg-red-50"
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}