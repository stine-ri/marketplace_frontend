import { useState, useEffect } from 'react';
import axios, { AxiosError } from 'axios';
import { 
  FiSearch, 
  FiEye, 
  FiUsers, 
  FiAlertCircle,
  FiX,
  FiFilter,
  FiClock,
  FiCheckCircle,
  FiXCircle,
  FiMessageSquare,
  FiTrash2,
  FiPackage,
  FiUser 
} from 'react-icons/fi';
import { toast } from 'react-hot-toast';

interface Interest {
  id: number;
  status: 'pending' | 'accepted' | 'rejected';
  createdAt: string;
  provider: {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
    college: {
      id: number;
      name: string;
    };
  };
  request: {
    id: number;
    productName: string;
    description: string;
    status: string;
    service: {
      id: number;
      name: string;
      category: string;
    };
    user: {
      id: number;
      full_name: string;
      email: string;
    };
  };
  chatRoomId?: number;
}

const baseURL = import.meta.env.VITE_API_BASE_URL || 'https://mkt-backend-sz2s.onrender.com';

export default function InterestsManagement() {
  const [interests, setInterests] = useState<Interest[]>([]);
  const [filteredInterests, setFilteredInterests] = useState<Interest[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedInterest, setSelectedInterest] = useState<Interest | null>(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0
  });

  // Helper functions
  const getProviderName = (interest: Interest) => {
    if (!interest.provider) return 'Unknown Provider';
    return `${interest.provider.firstName || ''} ${interest.provider.lastName || ''}`.trim() || 'Unknown Provider';
  };

  const getClientName = (interest: Interest) => {
    if (!interest.request?.user) return 'Unknown Client';
    return interest.request.user.full_name || 'Unknown Client';
  };

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return 'N/A';
      return date.toLocaleDateString('en-KE', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return 'N/A';
    }
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'accepted': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Fetch interests
  const fetchInterests = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('No authentication token found');

      const params = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString()
      });

      if (statusFilter !== 'all') {
        params.append('status', statusFilter);
      }

      if (searchTerm) {
        params.append('search', searchTerm);
      }

      const response = await axios.get(`${baseURL}/api/admin/interests?${params.toString()}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      setInterests(response.data.data);
      setPagination(prev => ({
        ...prev,
        total: response.data.pagination.total
      }));
      
    } catch (error) {
      console.error('Error fetching interests:', error);
      
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 401) {
          setError('Session expired. Please login again.');
        } else if (error.response?.status === 403) {
          setError('Access denied. Admin privileges required.');
        } else {
          setError(error.response?.data?.error || 'Failed to fetch interests');
        }
      } else if (error instanceof Error) {
        setError(error.message || 'Failed to fetch interests');
      } else {
        setError('An unexpected error occurred');
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Delete interest
  const handleDeleteInterest = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this interest?')) return;

    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('No authentication token found');

      await axios.delete(`${baseURL}/api/admin/interests/${id}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      toast.success('Interest deleted successfully');
      fetchInterests();
    } catch (error) {
      console.error('Error deleting interest:', error);
      toast.error('Failed to delete interest');
    }
  };

  // Filter interests
  useEffect(() => {
    let filtered = interests;

    if (statusFilter !== 'all') {
      filtered = filtered.filter(i => i.status === statusFilter);
    }

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(i => 
        getProviderName(i).toLowerCase().includes(term) ||
        getClientName(i).toLowerCase().includes(term) ||
        i.request?.productName?.toLowerCase().includes(term) ||
        i.request?.service?.name.toLowerCase().includes(term)
      );
    }

    setFilteredInterests(filtered);
  }, [interests, searchTerm, statusFilter]);

  // Initial fetch
  useEffect(() => {
    fetchInterests();
  }, [pagination.page, statusFilter]);

  const handlePageChange = (newPage: number) => {
    setPagination(prev => ({
      ...prev,
      page: newPage
    }));
  };

  return (
    <div className="container mx-auto p-4 md:p-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 gap-4">
        <h1 className="text-2xl font-bold text-gray-800 flex items-center">
          <FiUsers className="mr-2" />
          Interests Management
        </h1>
        
        {error && (
          <div className="w-full md:w-auto p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg flex items-center">
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

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Interests</p>
              <p className="text-2xl font-bold text-gray-900">{pagination.total}</p>
            </div>
            <FiUsers className="text-blue-500 text-2xl" />
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Pending</p>
              <p className="text-2xl font-bold text-yellow-600">
                {interests.filter(i => i.status === 'pending').length}
              </p>
            </div>
            <FiClock className="text-yellow-500 text-2xl" />
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Accepted</p>
              <p className="text-2xl font-bold text-green-600">
                {interests.filter(i => i.status === 'accepted').length}
              </p>
            </div>
            <FiCheckCircle className="text-green-500 text-2xl" />
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="mb-6 flex flex-col lg:flex-row gap-4">
        <div className="relative flex-1">
          <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search interests, providers, clients, or services..."
            className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <div className="flex flex-col sm:flex-row gap-2">
          <div className="flex items-center gap-2">
            <FiFilter className="text-gray-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="accepted">Accepted</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>

          <button
            onClick={() => fetchInterests()}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition"
          >
            <FiSearch size={16} /> Search
          </button>
        </div>
      </div>

      {/* Interests Table */}
      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
          {filteredInterests.length === 0 ? (
            <div className="text-center py-8">
              <FiUsers className="mx-auto text-gray-400 text-4xl mb-2" />
              <p className="text-gray-500">No interests found</p>
              {interests.length === 0 && !isLoading && (
                <button
                  onClick={fetchInterests}
                  className="mt-2 text-blue-600 hover:text-blue-800"
                >
                  Retry loading interests
                </button>
              )}
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Provider
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Request
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Service
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Date
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredInterests.map((interest) => (
                      <tr key={interest.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div>
                              <div className="text-sm font-medium text-gray-900">
                                {getProviderName(interest)}
                              </div>
                              <div className="text-sm text-gray-500">
                                {interest.provider?.college?.name || 'No college'}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{interest.request?.productName}</div>
                          <div className="text-sm text-gray-500">
                            {getClientName(interest)}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {interest.request?.service?.name}
                          </div>
                          <div className="text-sm text-gray-500">
                            {interest.request?.service?.category}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadgeColor(interest.status)}`}>
                            {interest.status.charAt(0).toUpperCase() + interest.status.slice(1)}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {formatDate(interest.createdAt)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex space-x-2">
                            <button
                              onClick={() => {
                                setSelectedInterest(interest);
                                setShowDetailsModal(true);
                              }}
                              className="text-blue-600 hover:text-blue-900"
                            >
                              <FiEye size={16} />
                            </button>
                            <button
                              onClick={() => handleDeleteInterest(interest.id)}
                              className="text-red-600 hover:text-red-900"
                            >
                              <FiTrash2 size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              
              {/* Pagination controls */}
              <div className="flex items-center justify-between px-4 py-3 bg-gray-50 border-t border-gray-200">
                <div className="flex-1 flex justify-between sm:hidden">
                  <button
                    onClick={() => handlePageChange(pagination.page - 1)}
                    disabled={pagination.page === 1}
                    className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => handlePageChange(pagination.page + 1)}
                    disabled={pagination.page * pagination.limit >= pagination.total}
                    className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                  >
                    Next
                  </button>
                </div>
                <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm text-gray-700">
                      Showing <span className="font-medium">{(pagination.page - 1) * pagination.limit + 1}</span> to{' '}
                      <span className="font-medium">
                        {Math.min(pagination.page * pagination.limit, pagination.total)}
                      </span>{' '}
                      of <span className="font-medium">{pagination.total}</span> results
                    </p>
                  </div>
                  <div>
                    <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                      <button
                        onClick={() => handlePageChange(pagination.page - 1)}
                        disabled={pagination.page === 1}
                        className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
                      >
                        <span className="sr-only">Previous</span>
                        <FiXCircle className="h-5 w-5" aria-hidden="true" />
                      </button>
                      {/* Page numbers */}
                      {Array.from({ length: Math.ceil(pagination.total / pagination.limit) }, (_, i) => i + 1)
                        .slice(
                          Math.max(0, pagination.page - 3),
                          Math.min(Math.ceil(pagination.total / pagination.limit), pagination.page + 2)
                        )
                        .map((page) => (
                          <button
                            key={page}
                            onClick={() => handlePageChange(page)}
                            className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                              pagination.page === page
                                ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
                                : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                            }`}
                          >
                            {page}
                          </button>
                        ))}
                      <button
                        onClick={() => handlePageChange(pagination.page + 1)}
                        disabled={pagination.page * pagination.limit >= pagination.total}
                        className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
                      >
                        <span className="sr-only">Next</span>
                        <FiCheckCircle className="h-5 w-5" aria-hidden="true" />
                      </button>
                    </nav>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      )}

      {/* Interest Details Modal */}
      {showDetailsModal && selectedInterest && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full p-6 max-h-screen overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Interest Details</h3>
              <button
                onClick={() => setShowDetailsModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <FiX size={20} />
              </button>
            </div>
            
            <div className="space-y-6">
              {/* Interest Info */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-semibold mb-3 flex items-center">
                  <FiUsers className="mr-2" />
                  Interest Information
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Interest ID</p>
                    <p className="font-medium">#{selectedInterest.id}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Status</p>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadgeColor(selectedInterest.status)}`}>
                      {selectedInterest.status.charAt(0).toUpperCase() + selectedInterest.status.slice(1)}
                    </span>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Created</p>
                    <p className="font-medium">{formatDate(selectedInterest.createdAt)}</p>
                  </div>
                  {selectedInterest.chatRoomId && (
                    <div>
                      <p className="text-sm text-gray-600">Chat Room ID</p>
                      <p className="font-medium">#{selectedInterest.chatRoomId}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Provider Info */}
              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="font-semibold mb-3 flex items-center">
                  <FiUser className="mr-2" />
                  Service Provider
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Name</p>
                    <p className="font-medium">{getProviderName(selectedInterest)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Email</p>
                    <p className="font-medium">{selectedInterest.provider?.email || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">College</p>
                    <p className="font-medium">{selectedInterest.provider?.college?.name || 'N/A'}</p>
                  </div>
                </div>
              </div>

              {/* Request Info */}
              {selectedInterest.request && (
                <div className="bg-green-50 p-4 rounded-lg">
                  <h4 className="font-semibold mb-3 flex items-center">
                    <FiPackage className="mr-2" />
                    Request Details
                  </h4>
                  <div className="space-y-2">
                    <div>
                      <p className="text-sm text-gray-600">Product/Service</p>
                      <p className="font-medium">{selectedInterest.request.productName}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Service Category</p>
                      <p className="font-medium">
                        {selectedInterest.request.service?.name} ({selectedInterest.request.service?.category})
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Client</p>
                      <p className="font-medium">
                        {getClientName(selectedInterest)} ({selectedInterest.request.user?.email})
                      </p>
                    </div>
                    {selectedInterest.request.description && (
                      <div>
                        <p className="text-sm text-gray-600">Description</p>
                        <div className="bg-white p-3 rounded border mt-1">
                          <p className="text-sm">{selectedInterest.request.description}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
            
            <div className="flex gap-2 mt-6">
              <button
                onClick={() => setShowDetailsModal(false)}
                className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-700 py-2 px-4 rounded-lg transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}