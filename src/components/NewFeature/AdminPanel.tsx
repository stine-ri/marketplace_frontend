// src/components/AdminPanel.tsx - Updated with Support Management
import { useState, useEffect } from 'react';
import axios from 'axios';
import { Service, College, Category } from '../../types/types';
import { getAuthHeaders, isAdmin } from '../../utilis/auth';
import UserManagement from './UserManagement';
import BidManagement from '../NewFeature/BidsManagement';
import RequestManagement from '../NewFeature/RequestManagement';
import ProductManagement from './ProductManagement';
import InterestsManagement from './InterestManagement';
import SupportManagement from './SupportManagement';
import { 
  FiSearch, 
  FiTrash2, 
  FiDownload,
  FiAlertCircle,
  FiPackage,
  FiHome,
  FiUsers,
  FiSettings,
  FiMenu,
  FiX,
  FiDollarSign,
  FiMessageSquare,
  FiShoppingBag,
  FiMessageCircle,
  FiTag 
} from 'react-icons/fi';

const baseURL = import.meta.env.VITE_API_BASE_URL || 'https://mkt-backend-sz2s.onrender.com';

type AdminSection = 'services' | 'colleges' | 'users' | 'bids' | 'requests' | 'products' |'categories' | 'interests' | 'support' | 'settings';

export default function AdminPanel() {
  const [services, setServices] = useState<Service[]>([]);
  const [colleges, setColleges] = useState<College[]>([]);
  const [categories, setCategories] = useState<Category[]>([]); 
  const [newService, setNewService] = useState('');
  const [newServiceCategory, setNewServiceCategory] = useState('');
  const [newCollege, setNewCollege] = useState('');
  const [newCategory, setNewCategory] = useState('');
  const [newCategoryDescription, setNewCategoryDescription] = useState('');
  const [activeSection, setActiveSection] = useState<AdminSection>('services');
  const [activeTab, setActiveTab] = useState<'services' | 'colleges' | 'categories'>('services');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedItems, setSelectedItems] = useState<number[]>([]);
  const [sidebarOpen, setSidebarOpen] = useState(false);
   
  // Check admin access
  useEffect(() => {
    if (!isAdmin()) {
      setError('Access denied. Admin privileges required.');
      return;
    }
    if (activeSection === 'services' || activeSection === 'colleges' || activeSection === 'categories') {
      fetchAllData();
    }
  }, [activeSection]);

  // Fetch all data for services and colleges
  const fetchAllData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [servicesRes, collegesRes, categoriesRes] = await Promise.all([
        axios.get<Service[]>(`${baseURL}/api/services`, { headers: getAuthHeaders() }),
        axios.get<College[]>(`${baseURL}/api/colleges`, { headers: getAuthHeaders() }),
         axios.get<Category[]>(`${baseURL}/api/admin/categories`, { headers: getAuthHeaders() })
      ]);
      setServices(servicesRes.data);
      setColleges(collegesRes.data);
      setCategories(categoriesRes.data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load data. Please try again.');
      console.error('Error fetching data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddService = async () => {
    if (!newService.trim()) {
      setError('Service name cannot be empty');
      return;
    }
    
    try {
      const res = await axios.post<Service>(`${baseURL}/api/services`, { 
        name: newService.trim(),
        category: newServiceCategory.trim() || undefined
      }, { headers: getAuthHeaders() });
      setServices([...services, res.data]);
      setNewService('');
      setNewServiceCategory('');
      setError(null);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to add service');
      console.error('Error adding service:', err);
    }
  };

  const handleDeleteService = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this service?')) return;
    
    try {
      await axios.delete(`${baseURL}/api/services/${id}`, { headers: getAuthHeaders() });
      setServices(services.filter(service => service.id !== id));
      setSelectedItems(selectedItems.filter(itemId => itemId !== id));
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to delete service');
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
      }, { headers: getAuthHeaders() });
      setColleges([...colleges, res.data]);
      setNewCollege('');
      setError(null);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to add college');
      console.error('Error adding college:', err);
    }
  };

  const handleDeleteCollege = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this college?')) return;
    
    try {
      await axios.delete(`${baseURL}/api/colleges/${id}`, { headers: getAuthHeaders() });
      setColleges(colleges.filter(college => college.id !== id));
      setSelectedItems(selectedItems.filter(itemId => itemId !== id));
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to delete college');
      console.error('Error deleting college:', err);
    }
  };

  // Add category functions
  const handleAddCategory = async () => {
    if (!newCategory.trim()) {
      setError('Category name cannot be empty');
      return;
    }
    
    try {
      const res = await axios.post<Category>(`${baseURL}/api/admin/categories`, { 
        name: newCategory.trim(),
        description: newCategoryDescription.trim() || undefined
      }, { headers: getAuthHeaders() });
      setCategories([...categories, res.data]);
      setNewCategory('');
      setNewCategoryDescription('');
      setError(null);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to add category');
      console.error('Error adding category:', err);
    }
  };

  const handleDeleteCategory = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this category?')) return;
    
    try {
      await axios.delete(`${baseURL}/api/admin/categories/${id}`, { headers: getAuthHeaders() });
      setCategories(categories.filter(category => category.id !== id));
      setSelectedItems(selectedItems.filter(itemId => itemId !== id));
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to delete category');
      console.error('Error deleting category:', err);
    }
  };

 const handleBulkDelete = async () => {
    if (!window.confirm(`Are you sure you want to delete ${selectedItems.length} items?`)) return;
    
    try {
      if (activeTab === 'services') {
        await axios.post(`${baseURL}/api/services/bulk-delete`, 
          { ids: selectedItems }, 
          { headers: getAuthHeaders() }
        );
        setServices(services.filter(service => !selectedItems.includes(service.id)));
      } else if (activeTab === 'colleges') {
        await axios.post(`${baseURL}/api/colleges/bulk-delete`, 
          { ids: selectedItems }, 
          { headers: getAuthHeaders() }
        );
        setColleges(colleges.filter(college => !selectedItems.includes(college.id)));
      } else if (activeTab === 'categories') {
        // Bulk delete for categories
        await Promise.all(
          selectedItems.map(id => 
            axios.delete(`${baseURL}/api/admin/categories/${id}`, { headers: getAuthHeaders() })
          )
        );
        setCategories(categories.filter(category => !selectedItems.includes(category.id)));
      }
      setSelectedItems([]);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to delete items');
    }
  };


 const handleExport = () => {
    let data, headers;
    
    if (activeTab === 'services') {
      data = services;
      headers = ['ID', 'Name', 'Category'];
    } else if (activeTab === 'colleges') {
      data = colleges;
      headers = ['ID', 'Name', 'Location'];
    } else {
      data = categories;
      headers = ['ID', 'Name', 'Description', 'Status'];
    }
    
    const csvContent = [
      headers.join(','),
      ...data.map(item => {
        if (activeTab === 'services') {
          return `${item.id},"${item.name}","${(item as Service).category || ''}"`;
        } else if (activeTab === 'colleges') {
          return `${item.id},"${item.name}","${(item as College).location || ''}"`;
        } else {
          return `${item.id},"${item.name}","${(item as Category).description || ''}","${(item as Category).isActive ? 'Active' : 'Inactive'}"`;
        }
      })
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

  const filteredCategories = categories.filter(category => 
    category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (category.description && category.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  // Menu items including Support Management
  const menuItems = [
    { id: 'services', label: 'Services & Categories', icon: FiPackage },
    { id: 'products', label: 'Product Management', icon: FiShoppingBag },
    { id: 'users', label: 'User Management', icon: FiUsers },
    { id: 'requests', label: 'Request Management', icon: FiMessageSquare },
    { id: 'bids', label: 'Bid Management', icon: FiDollarSign },
    { id: 'interests', label: 'Interests Management', icon: FiUsers },
    { id: 'support', label: 'Support Tickets', icon: FiMessageCircle },
    { id: 'settings', label: 'Settings', icon: FiSettings }
  ];

  // Check admin access
  if (!isAdmin()) {
    return (
      <div className="container mx-auto p-6">
        <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg flex items-center">
          <FiAlertCircle className="mr-2" />
          Access denied. Admin privileges required.
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      } transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0`}>
        <div className="flex items-center justify-between h-16 px-6 bg-blue-600 text-white">
          <h2 className="text-xl font-semibold">Admin Panel</h2>
          <button
            className="lg:hidden"
            onClick={() => setSidebarOpen(false)}
          >
            <FiX size={24} />
          </button>
        </div>
        
        <nav className="mt-6">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setActiveSection(item.id as AdminSection);
                  setSidebarOpen(false);
                  setError(null);
                }}
                className={`w-full flex items-center px-6 py-3 text-left transition-colors ${
                  activeSection === item.id
                    ? 'bg-blue-50 text-blue-600 border-r-2 border-blue-600'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                <Icon className="mr-3" size={18} />
                {item.label}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="bg-white shadow-sm border-b px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <button
                className="lg:hidden mr-3"
                onClick={() => setSidebarOpen(true)}
              >
                <FiMenu size={24} />
              </button>
              <h1 className="text-2xl font-bold text-gray-800">
                {menuItems.find(item => item.id === activeSection)?.label || 'Dashboard'}
              </h1>
            </div>
            
            {error && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg flex items-center">
                <FiAlertCircle className="mr-2" />
                {error}
                <button 
                  onClick={() => setError(null)}
                  className="ml-2 text-red-500 hover:text-red-700"
                >
                  <FiX size={16} />
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-auto">
          {activeSection === 'users' ? (
            <UserManagement />
          ) : activeSection === 'bids' ? (
            <BidManagement />
          ) : activeSection === 'requests' ? (
            <RequestManagement />
          ) : activeSection === 'products' ? (
            <ProductManagement />
          ) : activeSection === 'interests' ? (
            <InterestsManagement />
          ) : activeSection === 'support' ? (
            <SupportManagement />
          ) : activeSection === 'settings' ? (
            <div className="p-6">
              <div className="bg-white rounded-lg shadow-sm border p-6">
                <h3 className="text-lg font-semibold mb-4">System Settings</h3>
                <p className="text-gray-600">Settings panel coming soon...</p>
              </div>
            </div>
          ) : (
            // Services, Colleges & Categories Management
            <div className="p-6 space-y-6">
              {/* Search and Controls */}
              <div className="flex flex-col md:flex-row gap-4">
                <div className="relative flex-1">
                  <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder={`Search ${activeTab}...`}
                    className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <div className="flex gap-2">
                  {selectedItems.length > 0 && (
                    <button
                      onClick={handleBulkDelete}
                      className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition shadow-sm"
                    >
                      <FiTrash2 size={16} /> Delete Selected
                    </button>
                  )}
                  <button
                    onClick={handleExport}
                    className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition shadow-sm"
                  >
                    <FiDownload size={16} /> Export
                  </button>
                </div>
              </div>

              {/* Tabs */}
              <div className="flex border-b mb-6 overflow-x-auto">
                <div className="flex space-x-1">
                  <button
                    className={`py-2 px-4 font-medium text-sm md:text-base rounded-t-lg transition ${
                      activeTab === 'services' 
                        ? 'border-b-2 border-blue-500 text-blue-600 bg-blue-50' 
                        : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                    }`}
                    onClick={() => {
                      setActiveTab('services');
                      setSelectedItems([]);
                    }}
                  >
                    Services
                  </button>
                  <button
                    className={`py-2 px-4 font-medium text-sm md:text-base rounded-t-lg transition ${
                      activeTab === 'colleges' 
                        ? 'border-b-2 border-blue-500 text-blue-600 bg-blue-50' 
                        : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                    }`}
                    onClick={() => {
                      setActiveTab('colleges');
                      setSelectedItems([]);
                    }}
                  >
                    Colleges
                  </button>
                  <button
                    className={`py-2 px-4 font-medium text-sm md:text-base rounded-t-lg transition ${
                      activeTab === 'categories' 
                        ? 'border-b-2 border-blue-500 text-blue-600 bg-blue-50' 
                        : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                    }`}
                    onClick={() => {
                      setActiveTab('categories');
                      setSelectedItems([]);
                    }}
                  >
                    Categories
                  </button>
                </div>
              </div>

              {isLoading ? (
                <div className="flex justify-center items-center h-64">
                  <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
                </div>
              ) : activeTab === 'services' ? (
                <div className="space-y-6">
                  <div className="bg-white p-4 md:p-6 rounded-lg shadow-sm border">
                    <h2 className="text-xl font-semibold mb-4 text-gray-800">Add New Service</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Service Name</label>
                        <input
                          type="text"
                          placeholder="Enter service name"
                          className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                          value={newService}
                          onChange={(e) => setNewService(e.target.value)}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                        <input
                          type="text"
                          placeholder="Enter category"
                          className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                          value={newServiceCategory}
                          onChange={(e) => setNewServiceCategory(e.target.value)}
                        />
                      </div>
                    </div>
                    <button
                      onClick={handleAddService}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition shadow-sm"
                    >
                      Add Service
                    </button>
                  </div>

                  <div className="bg-white p-4 md:p-6 rounded-lg shadow-sm border">
                    <h2 className="text-xl font-semibold mb-4 text-gray-800">Current Services</h2>
                    {filteredServices.length === 0 ? (
                      <div className="text-center py-8">
                        <FiPackage className="mx-auto text-gray-400 text-4xl mb-2" />
                        <p className="text-gray-500">No services available</p>
                      </div>
                    ) : (
                      <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                          <thead className="bg-gray-50">
                            <tr>
                              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-10">
                                <input
                                  type="checkbox"
                                  className="rounded focus:ring-blue-500"
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
                              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Name
                              </th>
                              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Category
                              </th>
                              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Actions
                              </th>
                            </tr>
                          </thead>
                          <tbody className="bg-white divide-y divide-gray-200">
                            {filteredServices.map(service => (
                              <tr key={service.id} className="hover:bg-gray-50">
                                <td className="px-4 py-4 whitespace-nowrap">
                                  <input
                                    type="checkbox"
                                    className="rounded focus:ring-blue-500"
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
                                <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                  {service.name}
                                </td>
                                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                                  {service.category || '-'}
                                </td>
                                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                                  <button
                                    onClick={() => handleDeleteService(service.id)}
                                    className="flex items-center text-red-600 hover:text-red-900 px-2 py-1 rounded-lg hover:bg-red-50 transition"
                                  >
                                    <FiTrash2 className="mr-1" size={14} /> Delete
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
             ) : activeTab === 'colleges' ? (
                <div className="space-y-6">
                  <div className="bg-white p-4 md:p-6 rounded-lg shadow-sm border">
                    <h2 className="text-xl font-semibold mb-4 text-gray-800">Add New College</h2>
                    <div className="flex flex-col md:flex-row gap-2">
                      <input
                        type="text"
                        placeholder="Enter college name"
                        className="flex-1 p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                        value={newCollege}
                        onChange={(e) => setNewCollege(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleAddCollege()}
                      />
                      <button
                        onClick={handleAddCollege}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition shadow-sm"
                      >
                        Add College
                      </button>
                    </div>
                  </div>

                  <div className="bg-white p-4 md:p-6 rounded-lg shadow-sm border">
                    <h2 className="text-xl font-semibold mb-4 text-gray-800">Current Colleges</h2>
                    {filteredColleges.length === 0 ? (
                      <div className="text-center py-8">
                        <FiHome className="mx-auto text-gray-400 text-4xl mb-2" />
                        <p className="text-gray-500">No colleges available</p>
                      </div>
                    ) : (
                      <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                          <thead className="bg-gray-50">
                            <tr>
                              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-10">
                                <input
                                  type="checkbox"
                                  className="rounded focus:ring-blue-500"
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
                              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Name
                              </th>
                              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Location
                              </th>
                              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Actions
                              </th>
                            </tr>
                          </thead>
                          <tbody className="bg-white divide-y divide-gray-200">
                            {filteredColleges.map(college => (
                              <tr key={college.id} className="hover:bg-gray-50">
                                <td className="px-4 py-4 whitespace-nowrap">
                                  <input
                                    type="checkbox"
                                    className="rounded focus:ring-blue-500"
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
                                <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                  {college.name}
                                </td>
                                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                                  {college.location || '-'}
                                </td>
                                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                                  <button
                                    onClick={() => handleDeleteCollege(college.id)}
                                    className="flex items-center text-red-600 hover:text-red-900 px-2 py-1 rounded-lg hover:bg-red-50 transition"
                                  >
                                    <FiTrash2 className="mr-1" size={14} /> Delete
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
              ) : activeTab === 'categories' ? (
                // Categories content
                <div className="space-y-6">
                  <div className="bg-white p-4 md:p-6 rounded-lg shadow-sm border">
                    <h2 className="text-xl font-semibold mb-4 text-gray-800">Add New Category</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Category Name</label>
                        <input
                          type="text"
                          placeholder="Enter category name"
                          className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                          value={newCategory}
                          onChange={(e) => setNewCategory(e.target.value)}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                        <input
                          type="text"
                          placeholder="Enter description"
                          className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                          value={newCategoryDescription}
                          onChange={(e) => setNewCategoryDescription(e.target.value)}
                        />
                      </div>
                    </div>
                    <button
                      onClick={handleAddCategory}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition shadow-sm"
                    >
                      Add Category
                    </button>
                  </div>

                  <div className="bg-white p-4 md:p-6 rounded-lg shadow-sm border">
                    <h2 className="text-xl font-semibold mb-4 text-gray-800">Current Categories</h2>
                    {filteredCategories.length === 0 ? (
                      <div className="text-center py-8">
                        <FiTag className="mx-auto text-gray-400 text-4xl mb-2" />
                        <p className="text-gray-500">No categories available</p>
                      </div>
                    ) : (
                      <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                          <thead className="bg-gray-50">
                            <tr>
                              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-10">
                                <input
                                  type="checkbox"
                                  className="rounded focus:ring-blue-500"
                                  checked={selectedItems.length === filteredCategories.length && filteredCategories.length > 0}
                                  onChange={(e) => {
                                    if (e.target.checked) {
                                      setSelectedItems(filteredCategories.map(c => c.id));
                                    } else {
                                      setSelectedItems([]);
                                    }
                                  }}
                                />
                              </th>
                              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Name
                              </th>
                              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Description
                              </th>
                              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Status
                              </th>
                              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Actions
                              </th>
                            </tr>
                          </thead>
                          <tbody className="bg-white divide-y divide-gray-200">
                            {filteredCategories.map(category => (
                              <tr key={category.id} className="hover:bg-gray-50">
                                <td className="px-4 py-4 whitespace-nowrap">
                                  <input
                                    type="checkbox"
                                    className="rounded focus:ring-blue-500"
                                    checked={selectedItems.includes(category.id)}
                                    onChange={(e) => {
                                      if (e.target.checked) {
                                        setSelectedItems([...selectedItems, category.id]);
                                      } else {
                                        setSelectedItems(selectedItems.filter(id => id !== category.id));
                                      }
                                    }}
                                  />
                                </td>
                                <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                  {category.name}
                                </td>
                                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                                  {category.description || '-'}
                                </td>
                                <td className="px-4 py-4 whitespace-nowrap">
                                  <span className={`px-2 py-1 text-xs rounded-full ${
                                    category.isActive 
                                      ? 'bg-green-100 text-green-800' 
                                      : 'bg-red-100 text-red-800'
                                  }`}>
                                    {category.isActive ? 'Active' : 'Inactive'}
                                  </span>
                                </td>
                                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                                  <button
                                    onClick={() => handleDeleteCategory(category.id)}
                                    className="flex items-center text-red-600 hover:text-red-900 px-2 py-1 rounded-lg hover:bg-red-50 transition"
                                  >
                                    <FiTrash2 className="mr-1" size={14} /> Delete
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
              ) : null}

            </div>
          )}
        </div>
      </div>
    </div>
  );
}