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

  // Helper functions
  const getProviderName = (bid: Bid) => {
    if (!bid.provider) return 'Unknown Provider';
    return `${bid.provider.firstName || ''} ${bid.provider.lastName || ''}`.trim() || 'Unknown Provider';
  };

  const getClientName = (bid: Bid) => {
    if (!bid.request?.user) return 'Unknown Client';
    return bid.request.user.full_name || bid.request.user.name || 'Unknown Client';
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
  }, []);

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
      console.log('Fetching all bids...');
      const response = await axios.get<Bid[]>(`${baseURL}/api/provider/bids`, {
        headers: getAuthHeaders()
      });
      console.log('Bids fetched:', response.data);
      setBids(response.data);
    } catch (err: any) {
      console.error('Error fetching bids:', err);
      setError(err.response?.data?.message || 'Failed to fetch bids');
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
              <p className="text-2xl font-bold text-gray-900">{bids.length}</p>
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
            onClick={fetchBids}
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
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Provider
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Client
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Request
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Price
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Created
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredBids.map(bid => (
                    <tr key={bid.id} className="hover:bg-gray-50">
                      <td className="px-4 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center">
                            <FiUser className="text-blue-600" size={14} />
                          </div>
                          <div className="ml-3">
                            <div className="text-sm font-medium text-gray-900">
                              {getProviderName(bid)}
                            </div>
                            <div className="text-sm text-gray-500">
                              {bid.provider?.user?.email || 'N/A'}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {getClientName(bid)}
                        </div>
                        <div className="text-sm text-gray-500">
                          {bid.request?.user?.email || 'N/A'}
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <div className="text-sm font-medium text-gray-900">
                          {bid.request?.title || 'N/A'}
                        </div>
                        <div className="text-sm text-gray-500 flex items-center">
                          <FiTool className="mr-1" size={12} />
                          {bid.request?.service?.name || 'No service'}
                        </div>
                        {bid.isGraduateOfRequestedCollege && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-purple-100 text-purple-800 mt-1">
                            College Match
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {formatPrice(bid.price)}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadgeColor(bid.status)}`}>
                          {bid.status.charAt(0).toUpperCase() + bid.status.slice(1)}
                        </span>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                        <div className="flex items-center">
                          <FiCalendar className="mr-1" size={12} />
                          {formatDate(bid.createdAt)}
                        </div>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                        <div className="flex gap-2">
                          <button
                            onClick={() => openDetailsModal(bid)}
                            className="text-blue-600 hover:text-blue-900 p-1 rounded hover:bg-blue-50 transition"
                            title="View details"
                          >
                            <FiEye size={14} />
                          </button>
                          {bid.status === 'pending' && (
                            <>
                              <button
                                onClick={() => handleUpdateBidStatus(bid.id, 'accepted')}
                                className="text-green-600 hover:text-green-900 p-1 rounded hover:bg-green-50 transition"
                                title="Accept bid"
                              >
                                <FiCheckCircle size={14} />
                              </button>
                              <button
                                onClick={() => handleUpdateBidStatus(bid.id, 'rejected')}
                                className="text-red-600 hover:text-red-900 p-1 rounded hover:bg-red-50 transition"
                                title="Reject bid"
                              >
                                <FiXCircle size={14} />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
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