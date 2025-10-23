import { useState, useEffect } from 'react';
import axios from 'axios';
import { getAuthHeaders, isAdmin } from '../../utilis/auth';
import { 
  FiSearch, 
  FiEye, 
  FiUsers, 
  FiAlertCircle,
  FiX,
  FiFilter,
  FiDollarSign,
  FiClock,
  FiCheckCircle,
  FiXCircle,
  FiMessageSquare,
  FiCalendar,
  FiUser,
  FiTool,
  FiRefreshCw
} from 'react-icons/fi';

// Types for bid data structure
interface Bid {
  id: number;
  requestId: number;
  providerId: number;
  price: number;
  message?: string;
  status: 'pending' | 'accepted' | 'rejected';
  isGraduateOfRequestedCollege: boolean;
  createdAt: string;
  updatedAt: string;
  provider?: {
    id: number;
    firstName: string;
    lastName: string;
    user?: {
      email: string;
    };
  };
  request?: {
    id: number;
    title: string;
    description: string;
    userId: number;
    status: string;
    user?: {
      name?: string;
      full_name?: string;
      email: string;
    };
    service?: {
      name: string;
      category: string;
    };
  };
}

const baseURL = import.meta.env.VITE_API_BASE_URL || 'https://mkt-backend-sz2s.onrender.com';

export default function BidManagement() {
  const [bids, setBids] = useState<Bid[]>([]);
  const [filteredBids, setFilteredBids] = useState<Bid[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [priceRange, setPriceRange] = useState<string>('all');
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedBid, setSelectedBid] = useState<Bid | null>(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0
  });

  // Helper functions
// Update these helper functions in your React component
const getProviderName = (bid: Bid) => {
  if (!bid.provider) return 'Unknown Provider';
  return `${bid.provider.firstName || ''} ${bid.provider.lastName || ''}`.trim() || 'Unknown Provider';
};

const getClientName = (bid: Bid) => {
  if (!bid.request?.user) return 'Unknown Client';
  return bid.request.user.full_name || 'Unknown Client';
};


  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES',
      minimumFractionDigits: 0,
    }).format(price);
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

  const getPriceRangeFilter = (price: number) => {
    if (price < 5000) return 'low';
    if (price < 20000) return 'medium';
    return 'high';
  };

  // Check admin status and fetch bids
  useEffect(() => {
    if (!isAdmin()) {
      setError('Access denied. Admin privileges required.');
      return;
    }
    fetchBids();
  }, [pagination.page, statusFilter]);

  // Filter bids based on search, status, and price range
  useEffect(() => {
    let filtered = bids;

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(bid => {
        const providerName = getProviderName(bid).toLowerCase();
        const clientName = getClientName(bid).toLowerCase();
        const requestTitle = (bid.request?.title || '').toLowerCase();
        const serviceName = (bid.request?.service?.name || '').toLowerCase();
        const searchLower = searchTerm.toLowerCase();
        
        return providerName.includes(searchLower) || 
               clientName.includes(searchLower) ||
               requestTitle.includes(searchLower) ||
               serviceName.includes(searchLower);
      });
    }

    // Apply status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(bid => bid.status === statusFilter);
    }

    // Apply price range filter
    if (priceRange !== 'all') {
      filtered = filtered.filter(bid => getPriceRangeFilter(bid.price) === priceRange);
    }

    setFilteredBids(filtered);
  }, [bids, searchTerm, statusFilter, priceRange]);

  const fetchBids = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      // 1. Get token from localStorage
      const token = localStorage.getItem('token');
      
      if (!token) {
        throw new Error('No authentication token found');
      }

    
      
      // 2. Make request to admin endpoint with query parameters
      const params = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString()
      });

      if (statusFilter !== 'all') {
        params.append('status', statusFilter);
      }

      const response = await axios.get(`${baseURL}/api/admin/bids?${params.toString()}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
     
      setBids(response.data.data);
      setPagination(prev => ({
        ...prev,
        total: response.data.pagination.total
      }));
      
    } catch (err: any) {
      console.error('Error fetching bids:', err);
      
      // Handle different error cases
      if (err.response) {
        if (err.response.status === 401) {
          setError('Session expired. Please login again.');
        } else if (err.response.status === 403) {
          setError('Access denied. Admin privileges required.');
        } else {
          setError(err.response.data?.message || 'Failed to fetch bids');
        }
      } else if (err.request) {
        setError('Network error. Please check your connection.');
      } else {
        setError(err.message || 'Failed to fetch bids');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateBidStatus = async (bidId: number, newStatus: 'accepted' | 'rejected') => {
    if (!window.confirm(`Are you sure you want to ${newStatus === 'accepted' ? 'accept' : 'reject'} this bid?`)) {
      return;
    }

    try {
      const endpoint = newStatus === 'accepted' ? `accept` : `reject`;
      await axios.post(`${baseURL}/api/bids/${bidId}/${endpoint}`, {}, {
        headers: getAuthHeaders()
      });
      
      // Refresh bids after status update
      fetchBids();
      setError(null);
    } catch (err: any) {
      setError(err.response?.data?.message || `Failed to ${newStatus} bid`);
      console.error(`Error ${newStatus}ing bid:`, err);
    }
  };

  const openDetailsModal = (bid: Bid) => {
    setSelectedBid(bid);
    setShowDetailsModal(true);
  };

  const handlePageChange = (newPage: number) => {
    setPagination(prev => ({
      ...prev,
      page: newPage
    }));
  };

  if (!isAdmin()) {
    return (
      <div className="container mx-auto p-6">
        <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg">
          <FiAlertCircle className="inline mr-2" />
          Access denied. Admin privileges required.
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 md:p-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 gap-4">
        <h1 className="text-2xl font-bold text-gray-800 flex items-center">
          <FiDollarSign className="mr-2" />
          Bid Management
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
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Bids</p>
              <p className="text-2xl font-bold text-gray-900">{pagination.total}</p>
            </div>
            <FiDollarSign className="text-blue-500 text-2xl" />
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Pending</p>
              <p className="text-2xl font-bold text-yellow-600">
                {bids.filter(b => b.status === 'pending').length}
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
                {bids.filter(b => b.status === 'accepted').length}
              </p>
            </div>
            <FiCheckCircle className="text-green-500 text-2xl" />
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Rejected</p>
              <p className="text-2xl font-bold text-red-600">
                {bids.filter(b => b.status === 'rejected').length}
              </p>
            </div>
            <FiXCircle className="text-red-500 text-2xl" />
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="mb-6 flex flex-col lg:flex-row gap-4">
        <div className="relative flex-1">
          <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search bids, providers, clients, or services..."
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

          <select
            value={priceRange}
            onChange={(e) => setPriceRange(e.target.value)}
            className="border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="all">All Prices</option>
            <option value="low">Under KES 5,000</option>
            <option value="medium">KES 5,000 - 20,000</option>
            <option value="high">Above KES 20,000</option>
          </select>

          <button
            onClick={() => fetchBids()}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition"
          >
            <FiRefreshCw size={16} /> Refresh
          </button>
        </div>
      </div>

      {/* Bids Table */}
      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
          {filteredBids.length === 0 ? (
            <div className="text-center py-8">
              <FiDollarSign className="mx-auto text-gray-400 text-4xl mb-2" />
              <p className="text-gray-500">No bids found</p>
              {bids.length === 0 && !isLoading && (
                <button
                  onClick={fetchBids}
                  className="mt-2 text-blue-600 hover:text-blue-800"
                >
                  Retry loading bids
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
          Bid ID
        </th>
        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
          Provider
        </th>
        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
          Client
        </th>
        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
          Service/Request
        </th>
        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
          Price
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
      {filteredBids.map((bid) => (
        <tr key={bid.id} className="hover:bg-gray-50 transition">
          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
            #{bid.id}
          </td>
          <td className="px-6 py-4 whitespace-nowrap">
            <div className="flex items-center">
              <FiUser className="mr-2 text-gray-400" />
              <div>
                <div className="text-sm font-medium text-gray-900">
                  {getProviderName(bid)}
                </div>
                <div className="text-sm text-gray-500">
                  {bid.provider?.user?.email || 'N/A'}
                </div>
              </div>
            </div>
          </td>
          <td className="px-6 py-4 whitespace-nowrap">
            <div className="text-sm text-gray-900">{getClientName(bid)}</div>
            <div className="text-sm text-gray-500">
              {bid.request?.user?.email || 'N/A'}
            </div>
          </td>
          <td className="px-6 py-4">
            <div className="text-sm text-gray-900">
              {bid.request?.title || 'N/A'}
            </div>
            <div className="text-sm text-gray-500">
              {bid.request?.service?.name || 'N/A'}
            </div>
          </td>
          <td className="px-6 py-4 whitespace-nowrap">
            <div className="text-sm font-semibold text-green-600">
              {formatPrice(bid.price)}
            </div>
          </td>
          <td className="px-6 py-4 whitespace-nowrap">
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadgeColor(bid.status)}`}>
              {bid.status === 'pending' && <FiClock className="mr-1" size={12} />}
              {bid.status === 'accepted' && <FiCheckCircle className="mr-1" size={12} />}
              {bid.status === 'rejected' && <FiXCircle className="mr-1" size={12} />}
              {bid.status.charAt(0).toUpperCase() + bid.status.slice(1)}
            </span>
          </td>
          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
            <div className="flex items-center">
              <FiCalendar className="mr-1" size={12} />
              {formatDate(bid.createdAt)}
            </div>
          </td>
          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
            <button
              onClick={() => openDetailsModal(bid)}
              className="text-blue-600 hover:text-blue-900 flex items-center"
            >
              <FiEye className="mr-1" size={16} />
              View
            </button>
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

      {/* Bid Details Modal */}
      {showDetailsModal && selectedBid && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full p-6 max-h-screen overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Bid Details</h3>
              <button
                onClick={() => setShowDetailsModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <FiX size={20} />
              </button>
            </div>
            
            <div className="space-y-6">
              {/* Bid Info */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-semibold mb-3 flex items-center">
                  <FiDollarSign className="mr-2" />
                  Bid Information
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Bid ID</p>
                    <p className="font-medium">#{selectedBid.id}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Price</p>
                    <p className="font-medium text-lg text-green-600">{formatPrice(selectedBid.price)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Status</p>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadgeColor(selectedBid.status)}`}>
                      {selectedBid.status.charAt(0).toUpperCase() + selectedBid.status.slice(1)}
                    </span>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Created</p>
                    <p className="font-medium">{formatDate(selectedBid.createdAt)}</p>
                  </div>
                </div>
                
                {selectedBid.message && (
                  <div className="mt-4">
                    <p className="text-sm text-gray-600 flex items-center mb-2">
                      <FiMessageSquare className="mr-1" size={14} />
                      Message
                    </p>
                    <div className="bg-white p-3 rounded border">
                      <p className="text-sm">{selectedBid.message}</p>
                    </div>
                  </div>
                )}
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
                    <p className="font-medium">{getProviderName(selectedBid)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Email</p>
                    <p className="font-medium">{selectedBid.provider?.user?.email || 'N/A'}</p>
                  </div>
                </div>
                {selectedBid.isGraduateOfRequestedCollege && (
                  <div className="mt-3">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                      ✓ Graduate of Requested College
                    </span>
                  </div>
                )}
              </div>

              {/* Request Info */}
              {selectedBid.request && (
                <div className="bg-green-50 p-4 rounded-lg">
                  <h4 className="font-semibold mb-3 flex items-center">
                    <FiTool className="mr-2" />
                    Request Details
                  </h4>
                  <div className="space-y-2">
                    <div>
                      <p className="text-sm text-gray-600">Title</p>
                      <p className="font-medium">{selectedBid.request.title}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Service</p>
                      <p className="font-medium">{selectedBid.request.service?.name || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Client</p>
                      <p className="font-medium">{getClientName(selectedBid)}</p>
                    </div>
                    {selectedBid.request.description && (
                      <div>
                        <p className="text-sm text-gray-600">Description</p>
                        <div className="bg-white p-3 rounded border mt-1">
                          <p className="text-sm">{selectedBid.request.description}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
            
            <div className="flex gap-2 mt-6">
              {selectedBid.status === 'pending' && (
                <>
                  <button
                    onClick={() => {
                      handleUpdateBidStatus(selectedBid.id, 'accepted');
                      setShowDetailsModal(false);
                    }}
                    className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-lg transition flex items-center justify-center gap-2"
                  >
                    <FiCheckCircle size={16} />
                    Accept Bid
                  </button>
                  <button
                    onClick={() => {
                      handleUpdateBidStatus(selectedBid.id, 'rejected');
                      setShowDetailsModal(false);
                    }}
                    className="flex-1 bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded-lg transition flex items-center justify-center gap-2"
                  >
                    <FiXCircle size={16} />
                    Reject Bid
                  </button>
                </>
              )}
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