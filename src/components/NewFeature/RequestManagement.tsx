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
  FiRefreshCw,
  FiMapPin,
  FiPackage,
  FiEdit,
  FiTrash2
} from 'react-icons/fi';

// Types for request data structure
interface Request {
  id: number;
  userId: number;
  serviceId?: number;
  productName?: string;
  isService: boolean;
  description?: string;
  desiredPrice: number;
  location?: string;
  collegeFilterId?: number;
  status: 'open' | 'closed' | 'in_progress' | 'completed' | 'cancelled';
  createdAt: string;
  updatedAt: string;
  user?: {
    id: number;
    email: string;
    role: string;
    name?: string;
    full_name?: string;
  };
  service?: {
    id: number;
    name: string;
    category?: string;
  };
  college?: {
    id: number;
    name: string;
    location?: string;
  };
  bids?: Bid[];
}

interface Bid {
  id: number;
  requestId: number;
  providerId: number;
  price: number;
  message?: string;
  status: 'pending' | 'accepted' | 'rejected';
  createdAt: string;
  provider?: {
    id: number;
    firstName: string;
    lastName: string;
  };
}

const baseURL = import.meta.env.VITE_API_BASE_URL || 'https://mkt-backend-sz2s.onrender.com';

export default function RequestManagement() {
  const [requests, setRequests] = useState<Request[]>([]);
  const [filteredRequests, setFilteredRequests] = useState<Request[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all'); // service or product
  const [priceRange, setPriceRange] = useState<string>('all');
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<Request | null>(null);

  // Helper functions
  const getClientName = (request: Request) => {
    if (!request.user) return 'Unknown Client';
    return request.user.full_name || request.user.name || 'Unknown Client';
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
      case 'open': return 'bg-green-100 text-green-800';
      case 'in_progress': return 'bg-blue-100 text-blue-800';
      case 'completed': return 'bg-purple-100 text-purple-800';
      case 'closed': return 'bg-gray-100 text-gray-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriceRangeFilter = (price: number) => {
    if (price < 5000) return 'low';
    if (price < 20000) return 'medium';
    return 'high';
  };

  const parseLocation = (locationStr?: string) => {
    if (!locationStr) return null;
    try {
      return JSON.parse(locationStr);
    } catch {
      return null;
    }
  };

  // Check admin status and fetch requests
  useEffect(() => {
    if (!isAdmin()) {
      setError('Access denied. Admin privileges required.');
      return;
    }
    fetchRequests();
  }, []);

  // Filter requests based on search, status, type, and price range
  useEffect(() => {
    let filtered = requests;

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(request => {
        const clientName = getClientName(request).toLowerCase();
        const serviceName = (request.service?.name || '').toLowerCase();
        const productName = (request.productName || '').toLowerCase();
        const description = (request.description || '').toLowerCase();
        const searchLower = searchTerm.toLowerCase();
        
        return clientName.includes(searchLower) || 
               serviceName.includes(searchLower) ||
               productName.includes(searchLower) ||
               description.includes(searchLower);
      });
    }

    // Apply status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(request => request.status === statusFilter);
    }

    // Apply type filter
    if (typeFilter !== 'all') {
      if (typeFilter === 'service') {
        filtered = filtered.filter(request => request.isService);
      } else if (typeFilter === 'product') {
        filtered = filtered.filter(request => !request.isService);
      }
    }

    // Apply price range filter
    if (priceRange !== 'all') {
      filtered = filtered.filter(request => getPriceRangeFilter(request.desiredPrice) === priceRange);
    }

    setFilteredRequests(filtered);
  }, [requests, searchTerm, statusFilter, typeFilter, priceRange]);
  
// fetch requests

  const fetchRequests = async () => {
    setIsLoading(true);
    setError(null);
    try {
      console.log('Fetching all requests...');
      // Since there's no specific admin requests endpoint, we'll assume there's a general requests endpoint
      const response = await axios.get<Request[]>(`${baseURL}/api/admin/bids/requests`, {
        headers: getAuthHeaders()
      });
      console.log('Requests fetched:', response.data);
      setRequests(response.data);
    } catch (err: any) {
      console.error('Error fetching requests:', err);
      setError(err.response?.data?.message || 'Failed to fetch requests');
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateRequestStatus = async (requestId: number, newStatus: string) => {
    if (!window.confirm(`Are you sure you want to change this request status to ${newStatus}?`)) {
      return;
    }

    try {
      await axios.patch(`${baseURL}/api/requests/${requestId}`, 
        { status: newStatus }, 
        { headers: getAuthHeaders() }
      );
      
      // Refresh requests after status update
      fetchRequests();
      setError(null);
    } catch (err: any) {
      setError(err.response?.data?.message || `Failed to update request status`);
      console.error(`Error updating request status:`, err);
    }
  };

  const handleDeleteRequest = async (requestId: number) => {
    if (!window.confirm('Are you sure you want to delete this request? This action cannot be undone.')) {
      return;
    }

    try {
      await axios.delete(`${baseURL}/api/requests/${requestId}`, {
        headers: getAuthHeaders()
      });
      
      // Refresh requests after deletion
      fetchRequests();
      setError(null);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to delete request');
      console.error('Error deleting request:', err);
    }
  };

  const openDetailsModal = (request: Request) => {
    setSelectedRequest(request);
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
          <FiMessageSquare className="mr-2" />
          Request Management
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
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Requests</p>
              <p className="text-2xl font-bold text-gray-900">{requests.length}</p>
            </div>
            <FiMessageSquare className="text-blue-500 text-2xl" />
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Open</p>
              <p className="text-2xl font-bold text-green-600">
                {requests.filter(r => r.status === 'open').length}
              </p>
            </div>
            <FiCheckCircle className="text-green-500 text-2xl" />
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">In Progress</p>
              <p className="text-2xl font-bold text-blue-600">
                {requests.filter(r => r.status === 'in_progress').length}
              </p>
            </div>
            <FiClock className="text-blue-500 text-2xl" />
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Completed</p>
              <p className="text-2xl font-bold text-purple-600">
                {requests.filter(r => r.status === 'completed').length}
              </p>
            </div>
            <FiCheckCircle className="text-purple-500 text-2xl" />
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Services</p>
              <p className="text-2xl font-bold text-indigo-600">
                {requests.filter(r => r.isService).length}
              </p>
            </div>
            <FiTool className="text-indigo-500 text-2xl" />
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="mb-6 flex flex-col lg:flex-row gap-4">
        <div className="relative flex-1">
          <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search requests, clients, services, or products..."
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
              <option value="open">Open</option>
              <option value="in_progress">In Progress</option>
              <option value="completed">Completed</option>
              <option value="closed">Closed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>

          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="all">All Types</option>
            <option value="service">Services</option>
            <option value="product">Products</option>
          </select>

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
            onClick={fetchRequests}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition"
          >
            <FiRefreshCw size={16} /> Refresh
          </button>
        </div>
      </div>

      {/* Requests Table */}
      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
          {filteredRequests.length === 0 ? (
            <div className="text-center py-8">
              <FiMessageSquare className="mx-auto text-gray-400 text-4xl mb-2" />
              <p className="text-gray-500">No requests found</p>
              {requests.length === 0 && !isLoading && (
                <button
                  onClick={fetchRequests}
                  className="mt-2 text-blue-600 hover:text-blue-800"
                >
                  Retry loading requests
                </button>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Client
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Request
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Type
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Price
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Bids
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
                  {filteredRequests.map(request => (
                    <tr key={request.id} className="hover:bg-gray-50">
                      <td className="px-4 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center">
                            <FiUser className="text-blue-600" size={14} />
                          </div>
                          <div className="ml-3">
                            <div className="text-sm font-medium text-gray-900">
                              {getClientName(request)}
                            </div>
                            <div className="text-sm text-gray-500">
                              {request.user?.email || 'N/A'}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <div className="text-sm font-medium text-gray-900">
                          {request.isService ? request.service?.name : request.productName}
                        </div>
                        <div className="text-sm text-gray-500">
                          {request.description && request.description.length > 50 
                            ? `${request.description.substring(0, 50)}...`
                            : request.description || 'No description'
                          }
                        </div>
                        {request.college && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-purple-100 text-purple-800 mt-1">
                            {request.college.name}
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          request.isService 
                            ? 'bg-blue-100 text-blue-800' 
                            : 'bg-green-100 text-green-800'
                        }`}>
                          {request.isService ? (
                            <>
                              <FiTool className="mr-1" size={10} />
                              Service
                            </>
                          ) : (
                            <>
                              <FiPackage className="mr-1" size={10} />
                              Product
                            </>
                          )}
                        </span>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {formatPrice(request.desiredPrice)}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadgeColor(request.status)}`}>
                          {request.status.charAt(0).toUpperCase() + request.status.slice(1).replace('_', ' ')}
                        </span>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                        <div className="flex items-center">
                          <FiDollarSign className="mr-1" size={12} />
                          {request.bids?.length || 0} bids
                        </div>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                        <div className="flex items-center">
                          <FiCalendar className="mr-1" size={12} />
                          {formatDate(request.createdAt)}
                        </div>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                        <div className="flex gap-2">
                          <button
                            onClick={() => openDetailsModal(request)}
                            className="text-blue-600 hover:text-blue-900 p-1 rounded hover:bg-blue-50 transition"
                            title="View details"
                          >
                            <FiEye size={14} />
                          </button>
                          <button
                            onClick={() => handleDeleteRequest(request.id)}
                            className="text-red-600 hover:text-red-900 p-1 rounded hover:bg-red-50 transition"
                            title="Delete request"
                          >
                            <FiTrash2 size={14} />
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
      )}

      {/* Request Details Modal */}
      {showDetailsModal && selectedRequest && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-4xl w-full p-6 max-h-screen overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Request Details</h3>
              <button
                onClick={() => setShowDetailsModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <FiX size={20} />
              </button>
            </div>
            
            <div className="space-y-6">
              {/* Request Info */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-semibold mb-3 flex items-center">
                  <FiMessageSquare className="mr-2" />
                  Request Information
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Request ID</p>
                    <p className="font-medium">#{selectedRequest.id}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Type</p>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      selectedRequest.isService 
                        ? 'bg-blue-100 text-blue-800' 
                        : 'bg-green-100 text-green-800'
                    }`}>
                      {selectedRequest.isService ? 'Service' : 'Product'}
                    </span>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">
                      {selectedRequest.isService ? 'Service' : 'Product'}
                    </p>
                    <p className="font-medium">
                      {selectedRequest.isService ? selectedRequest.service?.name : selectedRequest.productName}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Desired Price</p>
                    <p className="font-medium text-lg text-green-600">{formatPrice(selectedRequest.desiredPrice)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Status</p>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadgeColor(selectedRequest.status)}`}>
                      {selectedRequest.status.charAt(0).toUpperCase() + selectedRequest.status.slice(1).replace('_', ' ')}
                    </span>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Created</p>
                    <p className="font-medium">{formatDate(selectedRequest.createdAt)}</p>
                  </div>
                </div>
                
                {selectedRequest.description && (
                  <div className="mt-4">
                    <p className="text-sm text-gray-600 flex items-center mb-2">
                      <FiMessageSquare className="mr-1" size={14} />
                      Description
                    </p>
                    <div className="bg-white p-3 rounded border">
                      <p className="text-sm">{selectedRequest.description}</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Client Info */}
              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="font-semibold mb-3 flex items-center">
                  <FiUser className="mr-2" />
                  Client Information
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Name</p>
                    <p className="font-medium">{getClientName(selectedRequest)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Email</p>
                    <p className="font-medium">{selectedRequest.user?.email || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Role</p>
                    <p className="font-medium capitalize">{selectedRequest.user?.role || 'N/A'}</p>
                  </div>
                </div>
              </div>

              {/* Location Info */}
              {selectedRequest.location && (
                <div className="bg-green-50 p-4 rounded-lg">
                  <h4 className="font-semibold mb-3 flex items-center">
                    <FiMapPin className="mr-2" />
                    Location Information
                  </h4>
                  <div className="bg-white p-3 rounded border">
                    <p className="text-sm">{selectedRequest.location}</p>
                  </div>
                </div>
              )}

              {/* College Filter */}
              {selectedRequest.college && (
                <div className="bg-purple-50 p-4 rounded-lg">
                  <h4 className="font-semibold mb-3 flex items-center">
                    <FiUsers className="mr-2" />
                    College Filter
                  </h4>
                  <div className="space-y-2">
                    <div>
                      <p className="text-sm text-gray-600">College</p>
                      <p className="font-medium">{selectedRequest.college.name}</p>
                    </div>
                    {selectedRequest.college.location && (
                      <div>
                        <p className="text-sm text-gray-600">Location</p>
                        <p className="font-medium">{selectedRequest.college.location}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Bids */}
              {selectedRequest.bids && selectedRequest.bids.length > 0 && (
                <div className="bg-yellow-50 p-4 rounded-lg">
                  <h4 className="font-semibold mb-3 flex items-center">
                    <FiDollarSign className="mr-2" />
                    Bids ({selectedRequest.bids.length})
                  </h4>
                  <div className="space-y-3">
                    {selectedRequest.bids.map((bid) => (
                      <div key={bid.id} className="bg-white p-3 rounded border">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <p className="font-medium">
                              {bid.provider ? `${bid.provider.firstName} ${bid.provider.lastName}` : 'Unknown Provider'}
                            </p>
                            <p className="text-sm text-gray-600">
                              Price: {formatPrice(bid.price)}
                            </p>
                            {bid.message && (
                              <p className="text-sm text-gray-600 mt-1">
                                Message: {bid.message}
                              </p>
                            )}
                          </div>
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            bid.status === 'accepted' ? 'bg-green-100 text-green-800' :
                            bid.status === 'rejected' ? 'bg-red-100 text-red-800' :
                            'bg-yellow-100 text-yellow-800'
                          }`}>
                            {bid.status.charAt(0).toUpperCase() + bid.status.slice(1)}
                          </span>
                        </div>
                        <div className="text-xs text-gray-500 mt-2">
                          {formatDate(bid.createdAt)}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
            
            <div className="flex gap-2 mt-6">
              <select
                value={selectedRequest.status}
                onChange={(e) => {
                  handleUpdateRequestStatus(selectedRequest.id, e.target.value);
                  setShowDetailsModal(false);
                }}
                className="flex-1 border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="open">Open</option>
                <option value="in_progress">In Progress</option>
                <option value="completed">Completed</option>
                <option value="closed">Closed</option>
                <option value="cancelled">Cancelled</option>
              </select>
              <button
                onClick={() => {
                  handleDeleteRequest(selectedRequest.id);
                  setShowDetailsModal(false);
                }}
                className="bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded-lg transition flex items-center gap-2"
              >
                <FiTrash2 size={16} />
                Delete
              </button>
              <button
                onClick={() => setShowDetailsModal(false)}
                className="bg-gray-300 hover:bg-gray-400 text-gray-700 py-2 px-4 rounded-lg transition"
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