import { useState, useEffect, useCallback } from 'react';
import api from '../../api/api';
import { acceptInterest, rejectInterest, getRequestInterests } from '../../api/api';
import { ClientRequestCard } from '../NewFeature/CllientRequesrCard';
import useWebSocket from '../../hooks/useWebSocket';
import { PlusIcon, BellIcon, ArrowPathIcon, ShoppingBagIcon, Bars3Icon, XMarkIcon, FunnelIcon, ReceiptPercentIcon } from '@heroicons/react/24/outline';
import { NewRequestModal } from '../NewFeature/NewRequestModal';
import { useAuth } from '../../context/AuthContext';
import { Bid, Request, Product} from '../../types/types'; 
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import { ProductFilterModal } from '../NewFeature/ProductFilterModal';
import { ProductCard } from '../NewFeature/ProductCard';
import { PurchaseHistoryCard } from '../NewFeature/PurchaseHistoryCard';
import { PurchaseModal } from '../NewFeature/PurchaseModal';
import { getLocationString, parseLocation } from '../../utilis/location';
import { Star } from 'lucide-react';


interface Purchase {
  id: number;
  product: {
    name: string;
    price: string;
    image: string;
    provider: string;
  };
  quantity: number;
  totalPrice: string;
  status: 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled';
  createdAt: string;
}

// Testimonial Modal Component
const TestimonialModal = ({ isOpen, onClose, request, onSubmit }: {
  isOpen: boolean;
  onClose: () => void;
  request: any;
  onSubmit: () => void;
}) => {
  const [rating, setRating] = useState(5);
  const [reviewText, setReviewText] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://mkt-backend-sz2s.onrender.com';

  if (!isOpen || !request) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!reviewText.trim()) {
      toast.error('Please write a review');
      return;
    }

    setSubmitting(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/api/testimonials`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          requestId: request.id,
          providerId: request.acceptedProviderId,
          rating,
          reviewText,
          serviceCategory: request.service?.category,
          serviceName: request.service?.name || request.title,
        }),
      });

      if (response.ok) {
        toast.success('Review submitted! It will be visible after approval.');
        onSubmit();
        onClose();
        setRating(5);
        setReviewText('');
      } else {
        const error = await response.json();
        throw new Error(error.error || 'Failed to submit review');
      }
    } catch (error) {
      console.error('Error submitting review:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to submit review');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
        <h3 className="text-lg font-semibold mb-4">Leave a Review</h3>
        
        <form onSubmit={handleSubmit}>
          {/* Request Info */}
          <div className="mb-4 p-3 bg-gray-50 rounded-lg">
            <p className="text-sm font-medium text-gray-700">Service:</p>
            <p className="text-sm text-gray-600">{request.service?.name || request.title}</p>
          </div>

          {/* Rating */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Rating
            </label>
            <div className="flex items-center space-x-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  className="focus:outline-none"
                >
                  <Star
                    size={24}
                    fill={star <= rating ? "#fbbf24" : "none"}
                    className={star <= rating ? "text-yellow-400" : "text-gray-300"}
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Review Text */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Your Review
            </label>
            <textarea
              value={reviewText}
              onChange={(e) => setReviewText(e.target.value)}
              rows={4}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="Share your experience with this service..."
              required
            />
          </div>

          {/* Buttons */}
          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              disabled={submitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50"
            >
              {submitting ? 'Submitting...' : 'Submit Review'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export function ClientDashboard() {
  // Existing state
  const [requests, setRequests] = useState<Request[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showNewRequestModal, setShowNewRequestModal] = useState(false);
  const [activeTab, setActiveTab] = useState<'active' | 'completed'>('active');
  const [showNotifications, setShowNotifications] = useState(false);
  const [processingInterests, setProcessingInterests] = useState<Record<number, 'accept' | 'reject' | null>>({});
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  // Marketplace state
  const [showMarketplace, setShowMarketplace] = useState(false);
  const [showProductFilters, setShowProductFilters] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [productFilters, setProductFilters] = useState({
    category: '',
    minPrice: '',
    maxPrice: '',
    collegeId: ''
  });

  const { user } = useAuth();
  const userId = user?.userId;
  const { lastMessage, notifications, unreadCount } = useWebSocket();
  const [showPurchaseModal, setShowPurchaseModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [purchaseHistory, setPurchaseHistory] = useState<Purchase[]>([]);
  const [loadingPurchases, setLoadingPurchases] = useState(false);
  const [activeMainTab, setActiveMainTab] = useState<'requests' | 'marketplace' | 'purchases'>('requests');
  const navigate = useNavigate();
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [selectedRequestForReview, setSelectedRequestForReview] = useState<any>(null);
  const [userTestimonials, setUserTestimonials] = useState<any[]>([]);

  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://mkt-backend-sz2s.onrender.com';

  const fetchWithAuth = async (
    url: string,
    options: RequestInit = {}
  ): Promise<Response> => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        throw new Error('No authentication token found');
      }

      const response = await fetch(`${API_BASE_URL}${url}`, {
        ...options,
        headers: {
          ...options.headers,
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.status === 404) {
        // Special handling for chat rooms
        if (url.includes('/api/chat/')) {
          const parts = url.split('/');
          const chatRoomId = parts[parts.length - 1];

          // Attempt to create the chat room if it doesn't exist
          if (confirm('Chat room not found. Would you like to create it?')) {
            const createResponse: Response = await fetchWithAuth('/api/chat/from-interest', {
              method: 'POST',
              body: JSON.stringify({ interestId: chatRoomId })
            });
            return createResponse;
          }
        }
        throw new Error('The requested resource was not found');
      }

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      return response;
    } catch (error) {
      console.error('Fetch error:', error);
      throw error;
    }
  };

  const fetchRequests = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      if (!refreshing) setLoading(true);

      const response = await api.get('/api/client/requests', {
        headers: { Authorization: `Bearer ${token}` },
        params: {
          include: 'interests'
        }
      });

      if (response.data) {
        const baseURL = import.meta.env.VITE_API_BASE_URL || 'https://mkt-backend-sz2s.onrender.com';
        
        const normalizedRequests = response.data.map((request: Request) => {
          return {
            ...request,
            // DON'T process location here - keep it exactly as received
            // Let getLocationString handle all parsing when displaying
            interests: (request.interests || []).map(interest => ({
              ...interest,
              provider: interest.provider ? {
                ...interest.provider,
                profileImageUrl: interest.provider.profileImageUrl 
                  ? interest.provider.profileImageUrl.startsWith('http')
                    ? interest.provider.profileImageUrl
                    : `${baseURL}${interest.provider.profileImageUrl}`
                  : '/default-profile.png',
                user: interest.provider.user ? {
                  ...interest.provider.user,
                  avatar: interest.provider.user.avatar 
                    ? interest.provider.user.avatar.startsWith('http')
                      ? interest.provider.user.avatar
                      : `${baseURL}${interest.provider.user.avatar}`
                    : '/default-avatar.png'
                } : null
              } : null
            }))
          };
        });

        setRequests(normalizedRequests);
      }
    } catch (error) {
      console.error('Fetch error:', error);
      toast.error('Failed to load requests');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [refreshing]);

  // Initial load and refresh
  useEffect(() => {
    fetchRequests();
  }, [fetchRequests]);

  // Handle WebSocket updates for new bids from providers
  useEffect(() => {
    if (!lastMessage) return;

    try {
      // REMOVE this line - lastMessage is already parsed!
      // const data = JSON.parse(lastMessage.data);
      
      // Use lastMessage directly since it's already the parsed WebSocketMessage object
      console.log('WebSocket message:', lastMessage); // Debug log
      
      if (lastMessage.type === 'new_interest') {
        console.log('Processing new interest:', lastMessage); // Debug log
        setRequests(prev => prev.map(req =>
          req.id === lastMessage.data.requestId
            ? {
                ...req,
                interests: [
                  ...(req.interests || []),
                  {
                    id: lastMessage.data.interest.id,
                    requestId: lastMessage.data.requestId,
                    providerId: lastMessage.data.interest.providerId,
                    message: lastMessage.data.interest.message,
                    status: 'pending',
                    provider: lastMessage.data.provider,
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString(),
                  },
                ],
              }
            : req
        ));
        toast.info(`New interest from ${lastMessage.data.provider.user?.fullName || 'a provider'}`);
      }
    } catch (error) {
      console.error('WebSocket error:', error);
    }
  }, [lastMessage]);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchRequests();
  };

  const handleAcceptBid = async (requestId: number, bidId: number) => {
    try {
      await api.post(`/api/client/bids/${bidId}/accept`);

      // Update the request status and bids
      setRequests(prev =>
        prev.map(req =>
          req.id === requestId
            ? {
                ...req, // Preserve all original request data
                status: 'closed',
                bids: req.bids?.map((bid: Bid) =>
                  bid.id === bidId
                    ? { ...bid, status: 'accepted' }
                    : bid
                ) || []
              }
            : req
        )
      );
    } catch (error) {
      console.error('Error accepting bid:', error);
    }
  };

  const handleRejectBid = async (requestId: number, bidId: number) => {
    try {
      await api.post(`/api/client/bids/${bidId}/reject`);

      // Update the bid status to rejected
      setRequests(prev =>
        prev.map(req =>
          req.id === requestId
            ? {
                ...req, // Preserve all original request data
                bids: req.bids?.map((bid: Bid) =>
                  bid.id === bidId
                    ? { ...bid, status: 'rejected' }
                    : bid
                ) || []
              }
            : req
        )
      );
    } catch (error) {
      console.error('Error rejecting bid:', error);
    }
  };

  const createNewRequest = async (requestData: any) => {
    try {
      console.log('Creating new request with location:', requestData.location);

      // For backend storage, stringify objects, keep strings as-is
      const requestPayload = {
        ...requestData,
        location: typeof requestData.location === 'object' 
          ? JSON.stringify(requestData.location)
          : requestData.location
      };

      const response = await api.post('/api/client/requests', requestPayload);
      
      // Add new request to the list with the response data (backend format)
      const newRequest = {
        ...response.data,
        bids: [],
        createdAt: response.data.createdAt || new Date().toISOString()
      };
      
      setRequests(prev => [newRequest, ...prev]);
      setShowNewRequestModal(false);
      
      toast.success('Request created successfully!');
    } catch (error) {
      console.error('Error creating request:', error);
      toast.error('Failed to create request');
    }
  };

  const filteredRequests = requests.filter(request =>
    activeTab === 'active'
      ? request.status === 'open' || request.status === 'pending'
      : request.status === 'closed' || request.status === 'accepted'
  );

  const handleAcceptInterest = async (requestId: number, interestId: number) => {
    try {
      setProcessingInterests(prev => ({ ...prev, [interestId]: 'accept' }));
      
      // 1. Accept the interest and create chat room in one call
      const response = await api.post(`/api/interests/${interestId}/accept`);
      
      console.log('Backend response:', response.data); // Add this for debugging
      
      // The backend returns the full chat room object with 'id', not 'chatRoomId'
      if (!response.data?.id) {
        throw new Error('Chat room creation failed');
      }
      
      const chatRoomId = response.data.id; // Extract the ID
    
      // Skip verification for now since /api/chat/{id}/verify might not exist
      // await verifyChatRoom(chatRoomId);
      
      // 3. Update UI state
      setRequests(prev =>
        prev.map(req =>
          req.id === requestId
            ? {
                ...req,
                interests: req.interests?.map(interest =>
                  interest.id === interestId
                    ? {
                        ...interest,
                        status: 'accepted',
                        chatRoomId: chatRoomId
                      }
                    : interest
                ) || []
              }
            : req
        )
      );
      
      // 4. Navigate to chat
      navigate(`/api/chat/chats/${chatRoomId}`);
      
    } catch (error) {
      console.error('Error accepting interest:', error);
      if (error instanceof Error) {
        toast.error(
          <div>
            Failed to accept interest: {error.message}
            <button
              onClick={() => handleAcceptInterest(requestId, interestId)}
              className="ml-2 text-blue-500"
            >
              Retry
            </button>
          </div>
        );
      } else {
        toast.error(
          <div>
            Failed to accept interest
            <button
              onClick={() => handleAcceptInterest(requestId, interestId)}
              className="ml-2 text-blue-500"
            >
              Retry
            </button>
          </div>
        );
      }
    } finally {
      setProcessingInterests(prev => ({ ...prev, [interestId]: null }));
    }
  };

  const handleRejectInterest = async (requestId: number, interestId: number) => {
    try {
      await rejectInterest(interestId);
      
      setRequests(prev =>
        prev.map(req =>
          req.id === requestId
            ? {
                ...req,
                interests: req.interests?.map(interest =>
                  interest.id === interestId
                    ? { ...interest, status: 'rejected' }
                    : interest
                ) || []
              }
            : req
        )
      );
      
      toast.success("Interest rejected successfully!");
      return Promise.resolve();
    } catch (error) {
      console.error('Error rejecting interest:', error);
      toast.error("Failed to reject interest");
      return Promise.reject(error);
    }
  };

  // FIXED: function to fetch products with proper image URL handling
  const fetchProducts = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const params = new URLSearchParams();
      if (productFilters.category) params.append('category', productFilters.category);
      if (productFilters.minPrice) params.append('minPrice', productFilters.minPrice);
      if (productFilters.maxPrice) params.append('maxPrice', productFilters.maxPrice);
      if (productFilters.collegeId) params.append('collegeId', productFilters.collegeId);

      const response = await api.get<Product[]>(`/api/client/products?${params.toString()}`);
      
      // Helper function to normalize ONLY if needed
      const normalizeImageUrl = (imageUrl: string | null | undefined): string | null => {
        if (!imageUrl) return null;
        
        // If it's already an absolute URL, don't modify it
        if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
          return imageUrl;
        }
        
        // Only normalize relative URLs
        if (imageUrl.startsWith('/')) {
          return `${API_BASE_URL}${imageUrl}`;
        }
        
        return `${API_BASE_URL}/${imageUrl}`;
      };

      // Process products - backend should already have normalized images
      const productsWithImages = response.data.map(product => {
        console.log(`Raw product ${product.id}:`, {
          images: product.images,
          imageCount: product.images?.length || 0
        }); // Debug log

        // The backend already normalizes images, so we should use them directly
        // Only apply normalization if the images are still relative paths
        const processedImages = (product.images || []).map(imageUrl => {
          const normalized = normalizeImageUrl(imageUrl);
          console.log(`Image normalization: ${imageUrl} -> ${normalized}`);
          return normalized;
        }).filter(Boolean) as string[];

        return {
          ...product,
          images: processedImages,
          // Handle any legacy single image properties
          primaryImage: processedImages[0] || null,
          // Normalize provider profile image
          provider: product.provider ? {
            ...product.provider,
            profileImageUrl: normalizeImageUrl(product.provider.profileImageUrl)
          } : product.provider
        };
      });
      
      console.log('Final processed products:', productsWithImages.map(p => ({
        id: p.id,
        name: p.name,
        imageCount: p.images.length,
        firstImage: p.images[0]
      })));
      
      setProducts(productsWithImages);
    } catch (error) {
      console.error('Error fetching products:', error);
      toast.error('Failed to load products');
    }
  }, [productFilters, API_BASE_URL]);

  // Update the effect to fetch products
  useEffect(() => {
    if (showMarketplace) {
      fetchProducts();
    }
  }, [showMarketplace, fetchProducts]);

  // Close mobile menu when clicking outside
  const handleMobileMenuToggle = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  // Close notifications when clicking outside
  const handleNotificationToggle = () => {
    setShowNotifications(!showNotifications);
  };

  // purchase a product
  const handlePurchaseProduct = async (productId: number, purchaseData: {
    quantity: number;
    paymentMethod: string;
    shippingAddress: string;
  }) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      // Validate required fields before sending
      if (!purchaseData.quantity || purchaseData.quantity <= 0) {
        throw new Error('Invalid quantity specified');
      }
      
      if (!purchaseData.paymentMethod?.trim()) {
        throw new Error('Payment method is required');
      }
      
      if (!purchaseData.shippingAddress?.trim()) {
        throw new Error('Shipping address is required');
      }

      console.log('=== Purchase Request Debug ===');
      console.log('Product ID:', productId);
      console.log('Purchase Data:', purchaseData);
      console.log('Token present:', !!token);

      // Try the primary endpoint first with better error handling
      const requestBody = {
        quantity: Number(purchaseData.quantity),
        paymentMethod: purchaseData.paymentMethod.trim(),
        shippingAddress: purchaseData.shippingAddress.trim()
      };

      console.log('Request Body:', requestBody);

      const response = await fetch(`${API_BASE_URL}/api/client/products/${productId}/purchase`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(requestBody)
      });

      console.log('Response status:', response.status);
      console.log('Response headers:', Object.fromEntries(response.headers.entries()));

      // Get response text first
      const responseText = await response.text();
      console.log('Raw response:', responseText);

      let responseData;
      try {
        responseData = responseText ? JSON.parse(responseText) : {};
      } catch (parseError) {
        console.error('Failed to parse response as JSON:', parseError);
        console.error('Raw response that failed to parse:', responseText);
        throw new Error(`Invalid server response: ${responseText.substring(0, 100)}...`);
      }

      if (response.ok) {
        console.log('✅ Purchase successful:', responseData);
        
        // Call fetchPurchaseHistory if it exists
        fetchPurchaseHistory();
        
        return responseData;
      } else {
        // Enhanced error handling for different status codes
        console.error('❌ Purchase failed:', {
          status: response.status,
          statusText: response.statusText,
          responseData
        });

        let errorMessage = 'Purchase failed';
        
        switch (response.status) {
          case 400:
            errorMessage = responseData?.error || 'Invalid request data';
            break;
          case 401:
            errorMessage = 'Authentication failed';
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            window.location.href = '/login';
            return;
          case 403:
            errorMessage = 'Access denied';
            break;
          case 404:
            errorMessage = 'Product not found or endpoint unavailable';
            break;
          case 500:
            errorMessage = responseData?.error || 'Server error occurred';
            // If we have detailed error info from the server, include it
            if (responseData?.details) {
              console.error('Server error details:', responseData.details);
              if (process.env.NODE_ENV === 'development') {
                errorMessage += ': ' + responseData.details;
              }
            }
            break;
          default:
            errorMessage = responseData?.error || `HTTP ${response.status}: ${response.statusText}`;
        }

        throw new Error(errorMessage);
      }

    } catch (error) {
      console.error('=== Purchase Function Error ===');

      if (error instanceof Error) {
        console.error('Error type:', error.constructor.name);
        console.error('Error message:', error.message);
        console.error('Error stack:', error.stack);

        // Re-throw with more context if it's a network error
        if (error instanceof TypeError && error.message.includes('fetch')) {
          throw new Error(
            'Network error: Unable to connect to server. Please check your internet connection and server status.'
          );
        }

        throw error; // preserve original error if not network-related
      } else {
        console.error('Unknown error:', error);
        throw error; // still rethrow for unknown cases
      }

      console.error('===============================');
    }
  };

  // fetch purchase history
  const fetchPurchaseHistory = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      setLoadingPurchases(true);
      const response = await api.get('/api/client/products/purchases/history', {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data) {
        setPurchaseHistory(response.data);
      }
    } catch (error) {
      console.error('Error fetching purchase history:', error);
      toast.error('Failed to load purchase history');
    } finally {
      setLoadingPurchases(false);
    }
  }, []);

  // useEffect to fetch purchase history when the purchases tab is active
  useEffect(() => {
    if (activeMainTab === 'purchases') {
      fetchPurchaseHistory();
    }
  }, [activeMainTab, fetchPurchaseHistory]);

  const handleViewDetails = (product: Product) => {
    // Navigate to product details page
    navigate(`/products/${product.id}`);
  };

  const handlePurchase = (product: Product) => {
    setSelectedProduct(product);
    setShowPurchaseModal(true);
  };

  // Add this function to fetch user's testimonials
  const fetchUserTestimonials = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const response = await fetch(`${API_BASE_URL}/api/testimonials/my-reviews`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.ok) {
        const data = await response.json();
        setUserTestimonials(data);
      }
    } catch (error) {
      console.error('Error fetching user testimonials:', error);
    }
  }, [API_BASE_URL]);

  // Add this useEffect to fetch testimonials
  useEffect(() => {
    fetchUserTestimonials();
  }, [fetchUserTestimonials]);

  // Function to check if user can leave a review
  const canLeaveReview = (request: any) => {
    return (
      request.status === 'closed' && 
      !userTestimonials.some(t => t.requestId === request.id)
    );
  };

  // Add this function to handle review button click
  const handleLeaveReview = (request: any) => {
    setSelectedRequestForReview(request);
    setShowReviewModal(true);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header with improved mobile layout */}
      <header className="bg-white shadow-sm sticky top-0 z-40">
        <div className="mx-auto px-3 sm:px-4 lg:px-8 max-w-7xl">
          {/* Main header content */}
          <div className="flex items-center justify-between h-14 sm:h-16 lg:h-20">
            {/* Left side - Title and Mobile menu button */}
            <div className="flex items-center space-x-3 min-w-0 flex-1">
              {/* Mobile menu button */}
              <button
                type="button"
                className="lg:hidden inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500 transition-colors"
                onClick={handleMobileMenuToggle}
              >
                <span className="sr-only">Open main menu</span>
                {mobileMenuOpen ? (
                  <XMarkIcon className="block h-5 w-5 sm:h-6 sm:w-6" aria-hidden="true" />
                ) : (
                  <Bars3Icon className="block h-5 w-5 sm:h-6 sm:w-6" aria-hidden="true" />
                )}
              </button>
              
              {/* Title - Responsive sizing */}
              <h1 className="text-lg sm:text-xl lg:text-2xl xl:text-3xl font-bold text-gray-900 truncate">
                My Service Requests
              </h1>
            </div>
            
            {/* Right side - Desktop Navigation */}
            <div className="hidden lg:flex items-center space-x-4">
              {/* Main/Marketplace Toggle */}
              <div className="flex bg-gray-100 rounded-lg p-1">
                <button
                  onClick={() => {
                    setActiveMainTab('requests');
                    setShowMarketplace(false);
                  }}
                  className={`flex-1 px-3 py-2 rounded-md text-sm font-medium transition-all text-center ${
                    activeMainTab === 'requests' 
                      ? 'bg-white text-indigo-600 shadow-sm' 
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <span className="hidden sm:inline">My Requests</span>
                  <span className="sm:hidden">Requests</span>
                </button>
                <button
                  onClick={() => {
                    setActiveMainTab('marketplace');
                    setShowMarketplace(true);
                  }}
                  className={`flex-1 px-3 py-2 rounded-md text-sm font-medium transition-all text-center ${
                    activeMainTab === 'marketplace' 
                      ? 'bg-white text-indigo-600 shadow-sm' 
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  Marketplace
                </button>
                <button
                  onClick={() => {
                    setActiveMainTab('purchases');
                    setShowMarketplace(false);
                  }}
                  className={`flex-1 px-3 py-2 rounded-md text-sm font-medium transition-all text-center ${
                    activeMainTab === 'purchases' 
                      ? 'bg-white text-indigo-600 shadow-sm' 
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <span className="hidden sm:inline">My Purchases</span>
                  <span className="sm:hidden">Purchases</span>
                </button>
              </div>
              
              {/* Navigation Links */}
              <div className="flex items-center space-x-2">
                <Link 
                  to="/providers"
                  className="flex items-center px-3 py-2 text-sm font-medium text-gray-700 hover:text-indigo-600 hover:bg-gray-50 rounded-lg transition-colors"
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                  Find Providers
                </Link>
                <Link 
                  to="/chat"
                  className="flex items-center px-3 py-2 text-sm font-medium text-gray-700 hover:text-indigo-600 hover:bg-gray-50 rounded-lg transition-colors"
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                  Messages
                </Link>
              </div>
              
              {/* Action buttons */}
              <div className="flex items-center space-x-2">
                <button 
                  onClick={handleRefresh}
                  disabled={refreshing}
                  className="p-2 rounded-full hover:bg-gray-100 transition-colors"
                  title="Refresh requests"
                >
                  <ArrowPathIcon className={`h-5 w-5 text-gray-600 ${refreshing ? 'animate-spin' : ''}`} />
                </button>
                
                <div className="relative">
                  <button 
                    onClick={handleNotificationToggle}
                    className="p-2 rounded-full hover:bg-gray-100 transition-colors relative"
                  >
                    <BellIcon className="h-5 w-5 text-gray-600" />
                    {unreadCount > 0 && (
                      <span className="absolute -top-1 -right-1 h-5 w-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-medium">
                        {unreadCount > 9 ? '9+' : unreadCount}
                      </span>
                    )}
                  </button>
                  
                  {showNotifications && (
                    <>
                      {/* Backdrop */}
                      <div 
                        className="fixed inset-0 z-10"
                        onClick={() => setShowNotifications(false)}
                      />
                      {/* Notification dropdown */}
                      <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border overflow-hidden z-20">
                        <div className="p-3 border-b">
                          <h3 className="text-sm font-semibold text-gray-900">Notifications</h3>
                        </div>
                        <div className="max-h-80 overflow-y-auto">
                          {notifications.length === 0 ? (
                            <div className="p-4 text-center">
                              <BellIcon className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                              <p className="text-sm text-gray-500">No notifications</p>
                            </div>
                          ) : (
                            notifications.map(notification => (
                              <div 
                                key={notification.id} 
                                className={`p-3 border-b last:border-b-0 hover:bg-gray-50 ${
                                  !notification.isRead ? 'bg-blue-50 border-l-4 border-l-blue-500' : ''
                                }`}
                              >
                                <p className="font-medium text-sm text-gray-900">{notification.title}</p>
                                <p className="text-sm text-gray-600 mt-1">{notification.message}</p>
                                <p className="text-xs text-gray-500 mt-2">
                                  {new Date(notification.createdAt).toLocaleString()}
                                </p>
                              </div>
                            ))
                          )}
                        </div>
                      </div>
                    </>
                  )}
                </div>
                
                <button
                  onClick={() => setShowNewRequestModal(true)}
                  className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
                >
                  <PlusIcon className="-ml-1 mr-2 h-5 w-5" />
                  New Request
                </button>
              </div>
            </div>

            {/* Mobile action buttons */}
            <div className="lg:hidden flex items-center space-x-1">
              <button 
                onClick={handleRefresh}
                disabled={refreshing}
                className="p-2 rounded-full hover:bg-gray-100 transition-colors"
                title="Refresh"
              >
                <ArrowPathIcon className={`h-5 w-5 text-gray-600 ${refreshing ? 'animate-spin' : ''}`} />
              </button>
              
              <div className="relative">
                <button 
                  onClick={handleNotificationToggle}
                  className="p-2 rounded-full hover:bg-gray-100 transition-colors relative"
                >
                  <BellIcon className="h-5 w-5 text-gray-600" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 h-4 w-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-medium">
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                  )}
                </button>
                
                {showNotifications && (
                  <>
                    {/* Mobile backdrop */}
                    <div 
                      className="fixed inset-0 z-40"
                      onClick={() => setShowNotifications(false)}
                    />
                    {/* Mobile notification dropdown */}
                    <div className="absolute right-0 mt-2 w-72 sm:w-80 bg-white rounded-lg shadow-lg border overflow-hidden z-50">
                      <div className="p-3 border-b">
                        <h3 className="text-sm font-semibold text-gray-900">Notifications</h3>
                      </div>
                      <div className="max-h-64 sm:max-h-80 overflow-y-auto">
                        {notifications.length === 0 ? (
                          <div className="p-4 text-center">
                            <BellIcon className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                            <p className="text-sm text-gray-500">No notifications</p>
                          </div>
                        ) : (
                          notifications.map(notification => (
                            <div 
                              key={notification.id} 
                              className={`p-3 border-b last:border-b-0 ${
                                !notification.isRead ? 'bg-blue-50 border-l-4 border-l-blue-500' : ''
                              }`}
                            >
                              <p className="font-medium text-sm text-gray-900">{notification.title}</p>
                              <p className="text-sm text-gray-600 mt-1">{notification.message}</p>
                              <p className="text-xs text-gray-500 mt-2">
                                {new Date(notification.createdAt).toLocaleString()}
                              </p>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
          
          {/* Mobile Navigation - Enhanced layout */}
          {mobileMenuOpen && (
            <>
              {/* Mobile menu backdrop */}
              <div 
                className="lg:hidden fixed inset-0 z-30 bg-black bg-opacity-25"
                onClick={() => setMobileMenuOpen(false)}
              />
              
              {/* Mobile menu panel */}
              <div className="lg:hidden absolute left-0 right-0 top-full bg-white border-t shadow-lg z-40">
                <div className="p-4 space-y-4">
                  {/* Main/Marketplace Toggle - Mobile */}
                  <div className="flex bg-gray-100 rounded-lg p-1">
                    <button
                      onClick={() => {
                        setActiveMainTab('requests');
                        setShowMarketplace(false);
                        setMobileMenuOpen(false);
                      }}
                      className={`flex-1 px-2 py-2 rounded-md text-xs font-medium transition-all text-center ${
                        activeMainTab === 'requests' 
                          ? 'bg-white text-indigo-600 shadow-sm' 
                          : 'text-gray-500'
                      }`}
                    >
                      Requests
                    </button>
                    <button
                      onClick={() => {
                        setActiveMainTab('marketplace');
                        setShowMarketplace(true);
                        setMobileMenuOpen(false);
                      }}
                      className={`flex-1 px-2 py-2 rounded-md text-xs font-medium transition-all text-center ${
                        activeMainTab === 'marketplace' 
                          ? 'bg-white text-indigo-600 shadow-sm' 
                          : 'text-gray-500'
                      }`}
                    >
                      Market
                    </button>
                    <button
                      onClick={() => {
                        setActiveMainTab('purchases');
                        setShowMarketplace(false);
                        setMobileMenuOpen(false);
                      }}
                      className={`flex-1 px-2 py-2 rounded-md text-xs font-medium transition-all text-center ${
                        activeMainTab === 'purchases' 
                          ? 'bg-white text-indigo-600 shadow-sm' 
                          : 'text-gray-500'
                      }`}
                    >
                      Purchases
                    </button>
                  </div>
                  
                  {/* New Request button - Mobile */}
                  <button
                    onClick={() => {
                      setShowNewRequestModal(true);
                      setMobileMenuOpen(false);
                    }}
                    className="w-full inline-flex items-center justify-center px-4 py-3 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
                  >
                    <PlusIcon className="-ml-1 mr-2 h-5 w-5" />
                    New Request
                  </button>
                  
                  {/* Navigation Links */}
                  <div className="grid grid-cols-2 gap-2 pt-2 border-t border-gray-200">
                    <Link 
                      to="/providers"
                      className="flex items-center justify-center px-3 py-3 text-sm text-gray-700 hover:bg-gray-50 rounded-lg border border-gray-200 transition-colors"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                      <span className="text-xs sm:text-sm">Find Providers</span>
                    </Link>
                    <Link 
                      to="/chat"
                      className="flex items-center justify-center px-3 py-3 text-sm text-gray-700 hover:bg-gray-50 rounded-lg border border-gray-200 transition-colors"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                      </svg>
                      <span className="text-xs sm:text-sm">Messages</span>
                    </Link>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </header>

      {/* Main Content - Enhanced spacing and layout */}
      <main className="mx-auto px-3 sm:px-4 lg:px-8 py-4 sm:py-6 max-w-7xl">
        {activeMainTab === 'marketplace' ? (
          /* Marketplace View - Enhanced mobile layout */
          <div className="bg-white rounded-lg shadow-sm">
            {/* Marketplace header */}
            <div className="p-4 sm:p-6 border-b border-gray-200">
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
                <div>
                  <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Product Marketplace</h2>
                  <p className="text-sm text-gray-600 mt-1">Discover products from providers</p>
                </div>
                <button
                  onClick={() => setShowProductFilters(true)}
                  className="inline-flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors w-full sm:w-auto"
                >
                  <FunnelIcon className="h-4 w-4 mr-2" />
                  Filter Products
                </button>
              </div>
            </div>

            {/* Marketplace content */}
            <div className="p-4 sm:p-6">
              {products.length === 0 ? (
                <div className="text-center py-12">
                  <ShoppingBagIcon className="h-12 w-12 text-gray-400 mx-auto" />
                  <h3 className="mt-4 text-lg font-medium text-gray-900">No products found</h3>
                  <p className="mt-2 text-sm text-gray-500">
                    Try adjusting your filters or check back later.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
                  {products.map((product) => (
                    <ProductCard 
                      key={product.id}
                      product={product}
                      onViewDetails={handleViewDetails}
                      onPurchase={handlePurchase}
                      showPurchaseButton={true}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        ) : activeMainTab === 'purchases' ? (
          /* Purchase History View */
          <div className="bg-white rounded-lg shadow-sm">
            {/* Purchase History header */}
            <div className="p-4 sm:p-6 border-b border-gray-200">
              <div className="flex items-center gap-3">
                <ReceiptPercentIcon className="h-6 w-6 sm:h-8 sm:w-8 text-indigo-600" />
                <div>
                  <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Purchase History</h2>
                  <p className="text-sm text-gray-600 mt-1">Track your orders and purchases</p>
                </div>
              </div>
            </div>

            {/* Purchase History content */}
            <div className="p-4 sm:p-6">
              {loadingPurchases ? (
                <div className="flex justify-center items-center h-64">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 sm:h-12 sm:w-12 border-t-2 border-b-2 border-indigo-500 mx-auto"></div>
                    <p className="mt-4 text-sm text-gray-600">Loading purchases...</p>
                  </div>
                </div>
              ) : purchaseHistory.length === 0 ? (
                <div className="text-center py-12">
                  <ReceiptPercentIcon className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-4 text-lg font-medium text-gray-900">No purchases yet</h3>
                  <p className="mt-2 text-sm text-gray-500 max-w-sm mx-auto">
                    Your purchase history will appear here after you buy products from the marketplace.
                  </p>
                  <div className="mt-8">
                    <button
                      onClick={() => {
                        setActiveMainTab('marketplace');
                        setShowMarketplace(true);
                      }}
                      className="inline-flex items-center px-6 py-3 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
                    >
                      <ShoppingBagIcon className="-ml-1 mr-2 h-5 w-5" />
                      Browse Marketplace
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4 sm:space-y-6">
                  {purchaseHistory.map((purchase) => (
                    <PurchaseHistoryCard
                      key={purchase.id}
                      purchase={purchase}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        ) : (
          /* Requests View - Enhanced responsive layout */
          <>
            {/* Tabs - Improved mobile design */}
            <div className="bg-white rounded-lg shadow-sm mb-4 sm:mb-6">
              <div className="border-b border-gray-200">
                <nav className="flex">
                  <button
                    onClick={() => setActiveTab('active')}
                    className={`flex-1 py-4 px-1 text-center border-b-2 font-medium text-sm sm:text-base transition-colors ${
                      activeTab === 'active' 
                        ? 'border-indigo-500 text-indigo-600' 
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <span className="block sm:inline">Active</span>
                    <span className="block sm:inline sm:ml-1 text-xs sm:text-sm">
                      ({requests.filter(r => r.status === 'open' || r.status === 'pending').length})
                    </span>
                  </button>
                  <button
                    onClick={() => setActiveTab('completed')}
                    className={`flex-1 py-4 px-1 text-center border-b-2 font-medium text-sm sm:text-base transition-colors ${
                      activeTab === 'completed' 
                        ? 'border-indigo-500 text-indigo-600' 
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <span className="block sm:inline">Completed</span>
                    <span className="block sm:inline sm:ml-1 text-xs sm:text-sm">
                      ({requests.filter(r => r.status === 'closed' || r.status === 'accepted').length})
                    </span>
                  </button>
                </nav>
              </div>
            </div>

            {/* Loading State */}
            {loading ? (
              <div className="flex justify-center items-center h-64 bg-white rounded-lg shadow-sm">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-8 w-8 sm:h-12 sm:w-12 border-t-2 border-b-2 border-indigo-500 mx-auto"></div>
                  <p className="mt-4 text-sm text-gray-600">Loading requests...</p>
                </div>
              </div>
            ) : (
              <>
                {/* Empty State - Enhanced mobile layout */}
                {filteredRequests.length === 0 ? (
                  <div className="text-center py-12 sm:py-16 bg-white rounded-lg shadow-sm">
                    <svg
                      className="mx-auto h-12 w-12 sm:h-16 sm:w-16 text-gray-400"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      aria-hidden="true"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    <h3 className="mt-4 text-lg sm:text-xl font-medium text-gray-900">
                      No {activeTab === 'active' ? 'active' : 'completed'} requests
                    </h3>
                    <p className="mt-2 text-sm sm:text-base text-gray-500 max-w-sm mx-auto">
                      {activeTab === 'active' 
                        ? 'Get started by creating a new service request to connect with providers.'
                        : 'Your completed requests will appear here once services are fulfilled.'}
                    </p>
                    {activeTab === 'active' && (
                      <div className="mt-8">
                        <button
                          onClick={() => setShowNewRequestModal(true)}
                          className="inline-flex items-center px-6 py-3 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
                        >
                          <PlusIcon className="-ml-1 mr-2 h-5 w-5" />
                          Create Your First Request
                        </button>
                      </div>
                    )}
                  </div>
                ) : (
                  /* Requests List - Enhanced spacing */
                  <div className="space-y-4 sm:space-y-6">
                    {filteredRequests.map((request, index) => (
                      <div key={request.id || `request-${index}`}>
                        <ClientRequestCard
                          request={request}
                          bidsCount={request.bids?.length?.toString() || '0'}
                          bids={request.bids || []}
                          interests={request.interests || []} 
                          status={request.status || 'open'}
                          onAcceptBid={handleAcceptBid}
                          onRejectBid={handleRejectBid}
                          onAcceptInterest={handleAcceptInterest}
                          onRejectInterest={handleRejectInterest}
                        />
                        
                        {/* Review section for completed requests */}
                        {canLeaveReview(request) && (
                          <div className="mt-4 pt-4 border-t border-gray-200">
                            <button
                              onClick={() => handleLeaveReview(request)}
                              className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-indigo-600 bg-indigo-50 hover:bg-indigo-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
                            >
                              <Star className="h-4 w-4 mr-1" />
                              Leave a Review
                            </button>
                          </div>
                        )}
                        
                        {/* Show review status if already submitted */}
                        {userTestimonials.find(t => t.requestId === request.id) && (
                          <div className="mt-4 pt-4 border-t border-gray-200">
                            <div className="flex items-center text-sm text-green-600">
                              <svg className="h-4 w-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                              </svg>
                              Review submitted - {userTestimonials.find(t => t.requestId === request.id)?.status}
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}
          </>
        )}
      </main>

      {/* Floating Action Button for Mobile */}
      <div className="lg:hidden fixed bottom-6 right-4 z-30">
        {activeMainTab === 'requests' ? (
          <button
            onClick={() => setShowNewRequestModal(true)}
            className="inline-flex items-center justify-center w-14 h-14 border border-transparent rounded-full shadow-lg text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all transform hover:scale-105 active:scale-95"
          >
            <PlusIcon className="h-6 w-6" />
            <span className="sr-only">New Request</span>
          </button>
        ) : activeMainTab === 'marketplace' ? (
          <button
            onClick={() => setShowProductFilters(true)}
            className="inline-flex items-center justify-center w-14 h-14 border border-transparent rounded-full shadow-lg text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all transform hover:scale-105 active:scale-95"
          >
            <FunnelIcon className="h-6 w-6" />
            <span className="sr-only">Filter Products</span>
          </button>
        ) : (
          <button
            onClick={() => {
              setActiveMainTab('marketplace');
              setShowMarketplace(true);
            }}
            className="inline-flex items-center justify-center w-14 h-14 border border-transparent rounded-full shadow-lg text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all transform hover:scale-105 active:scale-95"
          >
            <ShoppingBagIcon className="h-6 w-6" />
            <span className="sr-only">Browse Marketplace</span>
          </button>
        )}
      </div>

      {/* Modals */}
      <NewRequestModal
        isOpen={showNewRequestModal}
        onClose={() => setShowNewRequestModal(false)}
        onSubmit={createNewRequest}
      />
      <ProductFilterModal
        isOpen={showProductFilters}
        onClose={() => setShowProductFilters(false)}
        onApply={(filters) => {
          setProductFilters(filters);
          setShowProductFilters(false);
          fetchProducts();
        }}
        currentFilters={productFilters}
      />
      <PurchaseModal
        isOpen={showPurchaseModal}
        onClose={() => setShowPurchaseModal(false)}
        product={selectedProduct}
        onPurchase={handlePurchaseProduct}
      />
      <TestimonialModal
        isOpen={showReviewModal}
        onClose={() => {
          setShowReviewModal(false);
          setSelectedRequestForReview(null);
        }}
        request={selectedRequestForReview}
        onSubmit={() => {
          fetchUserTestimonials(); // Refresh testimonials
          fetchRequests(); // Refresh requests if needed
        }}
      />
    </div>
  );
}