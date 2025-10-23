
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
import WhatsAppMessaging from './AdminMessaging';
import { showToast } from '../../utilis/toast';
import { toast } from 'react-hot-toast';
import AdminSettings from './AdminSettings';
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
  FiTag,
  FiBell,
  FiEdit2,
  FiRefreshCw
} from 'react-icons/fi';

const baseURL = import.meta.env.VITE_API_BASE_URL || 'https://mkt-backend-sz2s.onrender.com';

type AdminSection = 'services' | 'colleges' | 'users' | 'bids' | 'requests' | 'products' |'categories' | 'interests' | 'support' | 'settings'|'messaging';

// Admin Notification System
interface AdminNotification {
  id: string;
  type: 'error' | 'warning' | 'info';
  title: string;
  message: string;
  timestamp: Date;
  action?: {
    label: string;
    handler: () => void;
  };
}

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
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [collegeToDelete, setCollegeToDelete] = useState<College | null>(null);
  
  // Admin notifications state
  const [notifications, setNotifications] = useState<AdminNotification[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);
  
  // Editing states
  const [editingItem, setEditingItem] = useState<{type: 'service' | 'college' | 'category', id: number} | null>(null);
  const [editValue, setEditValue] = useState('');

  // Admin notification helper
  const addAdminNotification = (notification: Omit<AdminNotification, 'id' | 'timestamp'>) => {
    const newNotification: AdminNotification = {
      ...notification,
      id: Date.now().toString(),
      timestamp: new Date()
    };
    setNotifications(prev => [newNotification, ...prev].slice(0, 10)); // Keep last 10 notifications
  };

  // Enhanced error reporting function
  const reportToAdmin = async (issue: string, details: any) => {
    try {
      // Send to admin endpoint (you'll need to implement this on your backend)
      await axios.post(`${baseURL}/api/admin/notifications`, {
        type: 'system_issue',
        title: 'Database Constraint Violation',
        message: issue,
        details: details,
        timestamp: new Date().toISOString()
      }, { headers: getAuthHeaders() });
      
      // Add to local notifications
      addAdminNotification({
        type: 'error',
        title: 'Database Issue Reported',
        message: issue,
        action: {
          label: 'View User Management',
          handler: () => setActiveSection('users')
        }
      });
    } catch (err) {
      console.error('Failed to report to admin:', err);
    }
  };

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

  // Fetch all data for services, colleges, and categories
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
      const errorMessage = err.response?.data?.message || 'Failed to load data. Please try again.';
      setError(errorMessage);
      addAdminNotification({
        type: 'error',
        title: 'Data Loading Failed',
        message: errorMessage
      });
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
      showToast.success('Service added successfully');
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Failed to add service';
      setError(errorMessage);
      showToast.error(errorMessage);
      console.error('Error adding service:', err);
    }
  };

  const handleDeleteService = async (id: number) => {
    const serviceName = services.find(s => s.id === id)?.name || 'this service';
    
    if (!window.confirm(`Are you sure you want to delete "${serviceName}"?`)) return;
    
    try {
      const loadingToast = toast.loading(`Deleting "${serviceName}"...`);
      
      await axios.delete(`${baseURL}/api/services/${id}`, { headers: getAuthHeaders() });
      
      toast.dismiss(loadingToast);
      showToast.success(`"${serviceName}" has been successfully deleted`);
      
      setServices(services.filter(service => service.id !== id));
      setSelectedItems(selectedItems.filter(itemId => itemId !== id));
      
    } catch (err: any) {
      toast.dismiss();
      
      if (err.response?.status === 409) {
        const errorMessage = `Cannot delete "${serviceName}" because it's being used by active service providers.`;
        showToast.error(errorMessage);
        addAdminNotification({
          type: 'warning',
          title: 'Service Deletion Blocked',
          message: errorMessage,
          action: {
            label: 'Manage Users',
            handler: () => setActiveSection('users')
          }
        });
      } else {
        showToast.error('Failed to delete service. Please try again.');
      }
      
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
        name: newCollege.trim(),
        location: ''
      }, { headers: getAuthHeaders() });
      setColleges([...colleges, res.data]);
      setNewCollege('');
      setError(null);
      showToast.success('College added successfully');
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Failed to add college';
      setError(errorMessage);
      showToast.error(errorMessage);
      console.error('Error adding college:', err);
    }
  };

  const openDeleteModal = (college: College) => {
    setCollegeToDelete(college);
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = async () => {
    if (!collegeToDelete) return;
    
    await handleDeleteCollege(collegeToDelete.id);
    setShowDeleteModal(false);
    setCollegeToDelete(null);
  };

  const handleDeleteCollege = async (id: number) => {
    const collegeName = colleges.find(c => c.id === id)?.name || 'this college';
    
    try {
      const loadingToast = toast.loading(`Deleting "${collegeName}"...`);
      
      const response = await axios.delete(`${baseURL}/api/colleges/${id}`, { 
        headers: getAuthHeaders() 
      });
      
      toast.dismiss(loadingToast);
      showToast.success(`"${collegeName}" has been successfully deleted`);
      
      setColleges(colleges.filter(college => college.id !== id));
      setSelectedItems(selectedItems.filter(itemId => itemId !== id));
      
    } catch (err: any) {
      toast.dismiss();
      
      if (err.response?.status === 409) {
        const providerCount = err.response.data?.providerCount || 0;
        const errorMessage = `Cannot delete "${collegeName}" - it has ${providerCount} associated service provider${providerCount !== 1 ? 's' : ''}`;
        
        showToast.error(errorMessage);
        
        // Report this foreign key constraint issue to admin
        await reportToAdmin(
          `Foreign Key Constraint Violation: College "${collegeName}" cannot be deleted due to ${providerCount} associated providers`,
          {
            collegeId: id,
            collegeName: collegeName,
            providerCount: providerCount,
            error: err.response.data
          }
        );
        
      } else if (err.response?.status === 404) {
        showToast.warning(`"${collegeName}" was not found. It may have already been deleted.`);
        setColleges(colleges.filter(college => college.id !== id));
      } else {
        const genericError = 'An unexpected error occurred while deleting the college.';
        showToast.error(genericError);
        
        // Report unexpected errors
        await reportToAdmin(
          `Unexpected error deleting college "${collegeName}"`,
          {
            collegeId: id,
            collegeName: collegeName,
            error: err.response?.data || err.message
          }
        );
      }
      
      console.error('Error deleting college:', err);
    }
  };

  // Enhanced category functions with better error handling
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
      showToast.success('Category added successfully');
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Failed to add category';
      setError(errorMessage);
      showToast.error(errorMessage);
      console.error('Error adding category:', err);
    }
  };

  const handleDeleteCategory = async (id: number) => {
    const categoryName = categories.find(c => c.id === id)?.name || 'this category';
    
    if (!window.confirm(`Are you sure you want to delete "${categoryName}"?`)) return;
    
    try {
      const loadingToast = toast.loading(`Deleting "${categoryName}"...`);
      
      await axios.delete(`${baseURL}/api/admin/categories/${id}`, { headers: getAuthHeaders() });
      
      toast.dismiss(loadingToast);
      showToast.success(`"${categoryName}" has been successfully deleted`);
      
      setCategories(categories.filter(category => category.id !== id));
      setSelectedItems(selectedItems.filter(itemId => itemId !== id));
      
    } catch (err: any) {
      toast.dismiss();
      
      if (err.response?.status === 409) {
        const errorMessage = `Cannot delete "${categoryName}" because it's being used by existing services or products.`;
        showToast.error(errorMessage);
        
        await reportToAdmin(
          `Foreign Key Constraint: Category "${categoryName}" cannot be deleted due to dependencies`,
          {
            categoryId: id,
            categoryName: categoryName,
            error: err.response.data
          }
        );
      } else {
        showToast.error('Failed to delete category. Please try again.');
      }
      
      console.error('Error deleting category:', err);
    }
  };

  // Enhanced bulk delete with better error handling
  const handleBulkDelete = async () => {
    if (!window.confirm(`Are you sure you want to delete ${selectedItems.length} items?`)) return;
    
    const loadingToast = toast.loading(`Deleting ${selectedItems.length} items...`);
    let successCount = 0;
    let errorCount = 0;
    const errors: string[] = [];
    
    try {
      if (activeTab === 'services') {
        for (const id of selectedItems) {
          try {
            await axios.delete(`${baseURL}/api/services/${id}`, { headers: getAuthHeaders() });
            successCount++;
          } catch (err: any) {
            errorCount++;
            const serviceName = services.find(s => s.id === id)?.name || `Service ${id}`;
            errors.push(`${serviceName}: ${err.response?.data?.message || 'Unknown error'}`);
          }
        }
        setServices(services.filter(service => !selectedItems.includes(service.id) || errors.some(e => e.includes(service.name))));
        
      } else if (activeTab === 'colleges') {
        for (const id of selectedItems) {
          try {
            await axios.delete(`${baseURL}/api/colleges/${id}`, { headers: getAuthHeaders() });
            successCount++;
          } catch (err: any) {
            errorCount++;
            const collegeName = colleges.find(c => c.id === id)?.name || `College ${id}`;
            errors.push(`${collegeName}: ${err.response?.data?.message || 'Unknown error'}`);
          }
        }
        setColleges(colleges.filter(college => !selectedItems.includes(college.id) || errors.some(e => e.includes(college.name))));
        
      } else if (activeTab === 'categories') {
        for (const id of selectedItems) {
          try {
            await axios.delete(`${baseURL}/api/admin/categories/${id}`, { headers: getAuthHeaders() });
            successCount++;
          } catch (err: any) {
            errorCount++;
            const categoryName = categories.find(c => c.id === id)?.name || `Category ${id}`;
            errors.push(`${categoryName}: ${err.response?.data?.message || 'Unknown error'}`);
          }
        }
        setCategories(categories.filter(category => !selectedItems.includes(category.id) || errors.some(e => e.includes(category.name))));
      }
      
      toast.dismiss(loadingToast);
      
      if (errorCount === 0) {
        showToast.success(`Successfully deleted all ${successCount} items`);
      } else if (successCount > 0) {
        showToast.warning(`Deleted ${successCount} items, ${errorCount} failed`);
        
        // Report bulk delete issues
        await reportToAdmin(
          `Bulk delete partially failed: ${errorCount} items could not be deleted`,
          { errors, successCount, errorCount }
        );
      } else {
        showToast.error(`Failed to delete any items`);
      }
      
      setSelectedItems([]);
      
    } catch (err: any) {
      toast.dismiss(loadingToast);
      showToast.error('Bulk delete operation failed');
      console.error('Bulk delete error:', err);
    }
  };

  // Enhanced export function
  const handleExport = () => {
    let data, headers, filename;
    
    if (activeTab === 'services') {
      data = services;
      headers = ['ID', 'Name', 'Category', 'Created Date'];
      filename = `services-${new Date().toISOString().slice(0,10)}.csv`;
    } else if (activeTab === 'colleges') {
      data = colleges;
      headers = ['ID', 'Name', 'Location', 'Provider Count'];
      filename = `colleges-${new Date().toISOString().slice(0,10)}.csv`;
    } else {
      data = categories;
      headers = ['ID', 'Name', 'Description', 'Status', 'Created Date'];
      filename = `categories-${new Date().toISOString().slice(0,10)}.csv`;
    }
    
    const csvContent = [
      headers.join(','),
      ...data.map(item => {
        if (activeTab === 'services') {
          const service = item as Service;
          return `${service.id},"${service.name}","${service.category || ''}","${new Date().toISOString()}"`;
        } else if (activeTab === 'colleges') {
          const college = item as College;
          return `${college.id},"${college.name}","${college.location || ''}",""`;
        } else {
          const category = item as Category;
          return `${category.id},"${category.name}","${category.description || ''}","${category.isActive ? 'Active' : 'Inactive'}","${new Date().toISOString()}"`;
        }
      })
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
    
    showToast.success(`Exported ${data.length} ${activeTab} to ${filename}`);
  };

  // Filter functions
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

  // Menu items
  const menuItems = [
    { id: 'services', label: 'Services & Categories', icon: FiPackage },
    { id: 'products', label: 'Product Management', icon: FiShoppingBag },
    { id: 'users', label: 'User Management', icon: FiUsers },
    { id: 'requests', label: 'Request Management', icon: FiMessageSquare },
    { id: 'bids', label: 'Bid Management', icon: FiDollarSign },
     { id: 'messaging', label: 'WhatsApp Messaging', icon: FiMessageCircle }, 
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
            
            <div className="flex items-center gap-4">
              {/* Admin Notifications */}
              <div className="relative">
                <button
                  onClick={() => setShowNotifications(!showNotifications)}
                  className="relative p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition"
                >
                  <FiBell size={20} />
                  {notifications.length > 0 && (
                    <span className="absolute -top-1 -right-1 h-4 w-4 bg-red-500 text-white rounded-full text-xs flex items-center justify-center">
                      {notifications.length > 9 ? '9+' : notifications.length}
                    </span>
                  )}
                </button>
                
                {showNotifications && (
                  <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border z-50 max-h-96 overflow-y-auto">
                    <div className="p-4 border-b">
                      <h3 className="font-semibold text-gray-800">Admin Notifications</h3>
                    </div>
                    {notifications.length === 0 ? (
                      <div className="p-4 text-center text-gray-500">
                        No notifications
                      </div>
                    ) : (
                      <div className="divide-y">
                        {notifications.map((notification) => (
                          <div key={notification.id} className="p-4 hover:bg-gray-50">
                            <div className="flex items-start gap-3">
                              <div className={`p-1 rounded-full ${
                                notification.type === 'error' ? 'bg-red-100' :
                                notification.type === 'warning' ? 'bg-yellow-100' : 'bg-blue-100'
                              }`}>
                                <FiAlertCircle className={`w-4 h-4 ${
                                  notification.type === 'error' ? 'text-red-600' :
                                  notification.type === 'warning' ? 'text-yellow-600' : 'text-blue-600'
                                }`} />
                              </div>
                              <div className="flex-1">
                                <h4 className="font-medium text-gray-800 text-sm">{notification.title}</h4>
                                <p className="text-gray-600 text-sm mt-1">{notification.message}</p>
                                <p className="text-xs text-gray-400 mt-2">
                                  {notification.timestamp.toLocaleTimeString()}
                                </p>
                                {notification.action && (
                                  <button
                                    onClick={() => {
                                      notification.action?.handler();
                                      setShowNotifications(false);
                                    }}
                                    className="mt-2 text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded hover:bg-blue-200 transition"
                                  >
                                    {notification.action.label}
                                  </button>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                    {notifications.length > 0 && (
                      <div className="p-4 border-t">
                        <button
                          onClick={() => setNotifications([])}
                          className="w-full text-center text-sm text-gray-500 hover:text-gray-700"
                        >
                          Clear all notifications
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {error && (
                <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg flex items-center max-w-md">
                  <FiAlertCircle className="mr-2 flex-shrink-0" />
                  <span className="text-sm">{error}</span>
                  <button 
                    onClick={() => setError(null)}
                    className="ml-2 text-red-500 hover:text-red-700 flex-shrink-0"
                  >
                    <FiX size={16} />
                  </button>
                </div>
              )}
            </div>
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
          ) : activeSection === 'messaging' ? (
            <WhatsAppMessaging />
          ) : activeSection === 'products' ? (
            <ProductManagement />
          ) : activeSection === 'interests' ? (
            <InterestsManagement />
          ) : activeSection === 'support' ? (
            <SupportManagement />
           ) : activeSection === 'settings' ? (
  <AdminSettings />
) : (
            // Services, Colleges & Categories Management (existing content with enhancements)
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
                      <FiTrash2 size={16} /> Delete Selected ({selectedItems.length})
                    </button>
                  )}
                  <button
                    onClick={handleExport}
                    className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition shadow-sm"
                  >
                    <FiDownload size={16} /> Export
                  </button>
                  <button
                    onClick={fetchAllData}
                    className="flex items-center gap-2 bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg transition shadow-sm"
                  >
                    <FiRefreshCw size={16} /> Refresh
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
                    Services ({services.length})
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
                    Colleges ({colleges.length})
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
                    Categories ({categories.length})
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
                          onKeyPress={(e) => e.key === 'Enter' && handleAddService()}
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
                          onKeyPress={(e) => e.key === 'Enter' && handleAddService()}
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
                    <div className="flex justify-between items-center mb-4">
                      <h2 className="text-xl font-semibold text-gray-800">Current Services</h2>
                      <div className="text-sm text-gray-500">
                        Showing {filteredServices.length} of {services.length} services
                      </div>
                    </div>
                    {filteredServices.length === 0 ? (
                      <div className="text-center py-8">
                        <FiPackage className="mx-auto text-gray-400 text-4xl mb-2" />
                        <p className="text-gray-500">
                          {searchTerm ? 'No services match your search' : 'No services available'}
                        </p>
                        {searchTerm && (
                          <button
                            onClick={() => setSearchTerm('')}
                            className="text-blue-600 hover:text-blue-800 text-sm mt-2"
                          >
                            Clear search
                          </button>
                        )}
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
                                ID
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
                                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                                  #{service.id}
                                </td>
                                <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                  {editingItem?.type === 'service' && editingItem?.id === service.id ? (
                                    <input
                                      type="text"
                                      value={editValue}
                                      onChange={(e) => setEditValue(e.target.value)}
                                      onKeyPress={(e) => {
                                        if (e.key === 'Enter') {
                                          // Handle save edit
                                          setEditingItem(null);
                                          // Add API call to update service
                                        }
                                      }}
                                      onBlur={() => setEditingItem(null)}
                                      className="w-full p-1 border rounded"
                                      autoFocus
                                    />
                                  ) : (
                                    <span 
                                      onDoubleClick={() => {
                                        setEditingItem({type: 'service', id: service.id});
                                        setEditValue(service.name);
                                      }}
                                      className="cursor-pointer hover:bg-gray-100 px-1 py-0.5 rounded"
                                    >
                                      {service.name}
                                    </span>
                                  )}
                                </td>
                                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                                  {service.category || (
                                    <span className="text-gray-400 italic">No category</span>
                                  )}
                                </td>
                                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                                  <div className="flex items-center gap-2">
                                    <button
                                      onClick={() => {
                                        setEditingItem({type: 'service', id: service.id});
                                        setEditValue(service.name);
                                      }}
                                      className="flex items-center text-blue-600 hover:text-blue-900 px-2 py-1 rounded-lg hover:bg-blue-50 transition"
                                    >
                                      <FiEdit2 className="mr-1" size={14} /> Edit
                                    </button>
                                    <button
                                      onClick={() => handleDeleteService(service.id)}
                                      className="flex items-center text-red-600 hover:text-red-900 px-2 py-1 rounded-lg hover:bg-red-50 transition"
                                    >
                                      <FiTrash2 className="mr-1" size={14} /> Delete
                                    </button>
                                  </div>
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
                    <div className="flex justify-between items-center mb-4">
                      <h2 className="text-xl font-semibold text-gray-800">Current Colleges</h2>
                      <div className="text-sm text-gray-500">
                        Showing {filteredColleges.length} of {colleges.length} colleges
                      </div>
                    </div>
                    
                    {/* Warning message for foreign key constraints */}
                    <div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                      <div className="flex items-start">
                        <FiAlertCircle className="text-yellow-600 mt-0.5 mr-2 flex-shrink-0" size={16} />
                        <div className="text-sm">
                          <p className="text-yellow-800 font-medium">Important Note:</p>
                          <p className="text-yellow-700 mt-1">
                            Colleges with associated service providers cannot be deleted due to database constraints. 
                            Please reassign or remove providers in User Management first.
                          </p>
                        </div>
                      </div>
                    </div>
                    
                    {filteredColleges.length === 0 ? (
                      <div className="text-center py-8">
                        <FiHome className="mx-auto text-gray-400 text-4xl mb-2" />
                        <p className="text-gray-500">
                          {searchTerm ? 'No colleges match your search' : 'No colleges available'}
                        </p>
                        {searchTerm && (
                          <button
                            onClick={() => setSearchTerm('')}
                            className="text-blue-600 hover:text-blue-800 text-sm mt-2"
                          >
                            Clear search
                          </button>
                        )}
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
                                ID
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
                                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                                  #{college.id}
                                </td>
                                <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                  {editingItem?.type === 'college' && editingItem?.id === college.id ? (
                                    <input
                                      type="text"
                                      value={editValue}
                                      onChange={(e) => setEditValue(e.target.value)}
                                      onKeyPress={(e) => {
                                        if (e.key === 'Enter') {
                                          setEditingItem(null);
                                          // Add API call to update college
                                        }
                                      }}
                                      onBlur={() => setEditingItem(null)}
                                      className="w-full p-1 border rounded"
                                      autoFocus
                                    />
                                  ) : (
                                    <span 
                                      onDoubleClick={() => {
                                        setEditingItem({type: 'college', id: college.id});
                                        setEditValue(college.name);
                                      }}
                                      className="cursor-pointer hover:bg-gray-100 px-1 py-0.5 rounded"
                                    >
                                      {college.name}
                                    </span>
                                  )}
                                </td>
                                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                                  {college.location || (
                                    <span className="text-gray-400 italic">No location</span>
                                  )}
                                </td>
                                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                                  <div className="flex items-center gap-2">
                                    <button
                                      onClick={() => {
                                        setEditingItem({type: 'college', id: college.id});
                                        setEditValue(college.name);
                                      }}
                                      className="flex items-center text-blue-600 hover:text-blue-900 px-2 py-1 rounded-lg hover:bg-blue-50 transition"
                                    >
                                      <FiEdit2 className="mr-1" size={14} /> Edit
                                    </button>
                                    <button
                                      onClick={() => openDeleteModal(college)}
                                      className="flex items-center text-red-600 hover:text-red-900 px-2 py-1 rounded-lg hover:bg-red-50 transition"
                                    >
                                      <FiTrash2 className="mr-1" size={14} /> Delete
                                    </button>
                                  </div>
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
                          onKeyPress={(e) => e.key === 'Enter' && handleAddCategory()}
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
                          onKeyPress={(e) => e.key === 'Enter' && handleAddCategory()}
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
                    <div className="flex justify-between items-center mb-4">
                      <h2 className="text-xl font-semibold text-gray-800">Current Categories</h2>
                      <div className="text-sm text-gray-500">
                        Showing {filteredCategories.length} of {categories.length} categories
                      </div>
                    </div>
                    {filteredCategories.length === 0 ? (
                      <div className="text-center py-8">
                        <FiTag className="mx-auto text-gray-400 text-4xl mb-2" />
                        <p className="text-gray-500">
                          {searchTerm ? 'No categories match your search' : 'No categories available'}
                        </p>
                        {searchTerm && (
                          <button
                            onClick={() => setSearchTerm('')}
                            className="text-blue-600 hover:text-blue-800 text-sm mt-2"
                          >
                            Clear search
                          </button>
                        )}
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
                                ID
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
                                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                                  #{category.id}
                                </td>
                                <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                  {editingItem?.type === 'category' && editingItem?.id === category.id ? (
                                    <input
                                      type="text"
                                      value={editValue}
                                      onChange={(e) => setEditValue(e.target.value)}
                                      onKeyPress={(e) => {
                                        if (e.key === 'Enter') {
                                          setEditingItem(null);
                                          // Add API call to update category
                                        }
                                      }}
                                      onBlur={() => setEditingItem(null)}
                                      className="w-full p-1 border rounded"
                                      autoFocus
                                    />
                                  ) : (
                                    <span 
                                      onDoubleClick={() => {
                                        setEditingItem({type: 'category', id: category.id});
                                        setEditValue(category.name);
                                      }}
                                      className="cursor-pointer hover:bg-gray-100 px-1 py-0.5 rounded"
                                    >
                                      {category.name}
                                    </span>
                                  )}
                                </td>
                                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                                  {category.description || (
                                    <span className="text-gray-400 italic">No description</span>
                                  )}
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
                                  <div className="flex items-center gap-2">
                                    <button
                                      onClick={() => {
                                        setEditingItem({type: 'category', id: category.id});
                                        setEditValue(category.name);
                                      }}
                                      className="flex items-center text-blue-600 hover:text-blue-900 px-2 py-1 rounded-lg hover:bg-blue-50 transition"
                                    >
                                      <FiEdit2 className="mr-1" size={14} /> Edit
                                    </button>
                                    <button
                                      onClick={() => handleDeleteCategory(category.id)}
                                      className="flex items-center text-red-600 hover:text-red-900 px-2 py-1 rounded-lg hover:bg-red-50 transition"
                                    >
                                      <FiTrash2 className="mr-1" size={14} /> Delete
                                    </button>
                                  </div>
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

              {/* Delete College Modal */}
              {showDeleteModal && collegeToDelete && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                  <div className="bg-white rounded-lg p-6 max-w-md w-full">
                    <div className="flex items-center mb-4">
                      <FiAlertCircle className="text-red-600 mr-3" size={24} />
                      <h3 className="text-lg font-semibold text-gray-800">
                        Confirm Deletion
                      </h3>
                    </div>
                                          <div className="mb-6">
                      <p className="text-gray-600 mb-3">
                        Are you sure you want to delete <strong>"{collegeToDelete.name}"</strong>?
                      </p>
                      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                        <div className="flex items-start">
                          <FiAlertCircle className="text-yellow-600 mt-0.5 mr-2 flex-shrink-0" size={16} />
                          <div className="text-sm text-yellow-800">
                            <p className="font-medium mb-1">Warning:</p>
                            <p>If this college has associated service providers, the deletion will fail due to database constraints. You'll need to reassign those providers first in User Management.</p>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="flex justify-end gap-3">
                      <button
                        onClick={() => {
                          setShowDeleteModal(false);
                          setCollegeToDelete(null);
                        }}
                        className="px-4 py-2 text-gray-600 hover:text-gray-800 rounded-lg border border-gray-300 hover:bg-gray-50 transition"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleConfirmDelete}
                        className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
                      >
                        Delete College
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Click outside notifications to close */}
              {showNotifications && (
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setShowNotifications(false)}
                />
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}