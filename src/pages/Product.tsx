import React, { useState, useEffect,  useCallback, useMemo  } from 'react';
import { Search, Filter, Grid, List, Star, Heart, ShoppingCart, MapPin, Eye, ChevronDown, SlidersHorizontal, Loader, Store, Users, ChevronRight, Menu, X, Mail, Phone , MessageCircle, ExternalLink } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';

// Define interfaces to match the backend data structure
export interface Review {
  user: string;
  comment: string;
  rating: number;
}

export interface Product {
  id: number;
  providerId: number;
  name: string;
  description: string;
  price: string;
  images: string[];
  categoryId: number | null; 
  stock?: number;
  status: 'draft' | 'published' | 'archived';
  createdAt: string;
  updatedAt: string;

  // Legacy/compatibility properties
  image?: string | null; 
  primaryImage?: string | null;  
  imageUrl?: string | null;      

  provider: {
    id: number;
    firstName: string;
    lastName: string;
    rating?: number;
    profileImageUrl?: string | null | undefined;
    shopName?: string;
    location?: string;
  };

  // Optional properties
  featured?: boolean;
  originalPrice?: number;
  location?: string;
  rating?: number;
  reviews?: Review[];
  tags?: string[];
  inStock?: boolean;
}

export interface Category {
  id: number;
  name: string;
  description?: string;
  count?: number;
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

// Internal component interface for formatted products
interface FormattedProduct {
  id: string;
  name: string;
  description: string;
  price: string;
  originalPrice?: string | null;
  rating: number;
  reviews: number;
  images: string[];
  category: string;
  categoryId: number | null;
  tags: string[];
  inStock: boolean;
  shipping: string;
  featured: boolean;
  createdAt: string;
  status: string;
  location: string;
  provider: string;
  providerId: number;
  providerData: Product['provider'];
}

// Interface for grouped shops/producers
interface ShopGroup {
  providerId: number;
  providerName: string;
  shopName: string;
  rating: number;
  profileImageUrl?: string | null;
  location: string;
  products: FormattedProduct[];
  categories: Set<string>;
  totalProducts: number;
}

// Add new interface for product requests
export interface ProductRequest {
  id?: number;
  productName: string;
  description: string;
  desiredPrice?: number;
  quantity: number;
  categoryId?: number;
  urgency: 'low' | 'medium' | 'high';
  contactPhone: string;
  contactMethod: 'sms' | 'call' | 'whatsapp';
  location: string;
  collegeId?: number;
}

// Enhanced ProductRequest interface with location-based pricing
export interface ProductRequest {
  id?: number;
  productName: string;
  description: string;
  desiredPrice?: number;
  quantity: number;
  categoryId?: number;
  urgency: 'low' | 'medium' | 'high';
  contactPhone: string;
  contactMethod: 'sms' | 'call' | 'whatsapp';
  location: string;
  collegeId?: number;
  estimatedCost?: number;
  deliveryMethod?: string;
  preferredContactTime?: string;
   providerId?: number;
}
export interface Provider {
  id: number;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  profileImageUrl?: string | null;
  shopName?: string;
  location?: string;
  rating?: number;
  college?: {
    id: number;
    name: string;
  };
  services?: Array<{
    id: number;
    name: string;
    price: number;
  }>;
}

// Location-based pricing configuration
interface LocationPricing {
  country: string;
  region: string;
  currency: string;
  smsCost: number;
  whatsappCost: number;
  callCostPerMinute: number;
  serviceFee: number;
}

interface RequestServiceModalProps {
  showRequestModal: boolean;
  setShowRequestModal: (show: boolean) => void;
  currentRequest: Partial<ProductRequest>;
  setCurrentRequest: React.Dispatch<React.SetStateAction<Partial<ProductRequest>>>;
  requestProcessing: boolean;
  handleProductRequest: () => Promise<void>;
  getCurrencySymbol: (location?: string) => string;
  calculateEstimatedCost: (request: Partial<ProductRequest>) => number;
  formatPrice: (price: string | number, location?: string) => string;
  selectedProvider?: Provider | null;
}

// Then define the component with proper typing
const RequestServiceModal: React.FC<RequestServiceModalProps> = ({ 
  showRequestModal, 
  setShowRequestModal, 
  currentRequest, 
  setCurrentRequest, 
  requestProcessing,
  handleProductRequest,
  getCurrencySymbol,
  calculateEstimatedCost,
  formatPrice,
  selectedProvider
}) => {
  if (!showRequestModal) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white rounded-xl max-w-lg w-full max-h-[95vh] overflow-y-auto">
        <div className="p-4 sm:p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg sm:text-xl font-bold text-gray-900">Request a Product</h3>
            <button 
              onClick={() => setShowRequestModal(false)}
              className="p-2 rounded-lg hover:bg-gray-100 touch-manipulation"
            >
              <X className="w-5 h-5 sm:w-6 sm:h-6" />
            </button>
          </div>
  {/* Show selected provider info */}
          {selectedProvider && (
            <div className="mb-4 p-3 bg-blue-50 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                  {selectedProvider.profileImageUrl ? (
                    <img 
                      src={selectedProvider.profileImageUrl} 
                      alt={selectedProvider.shopName || `${selectedProvider.firstName} ${selectedProvider.lastName}`}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                  ) : (
                    <Store className="w-5 h-5 text-blue-600" />
                  )}
                </div>
                <div>
                  <h4 className="font-semibold text-blue-900">
                    {selectedProvider.shopName || `${selectedProvider.firstName} ${selectedProvider.lastName}`}
                  </h4>
                  <p className="text-blue-700 text-sm">Provider selected • Phone autofilled</p>
                </div>
              </div>
            </div>
          )}

          <div className="space-y-4">
            {/* Product Details */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Product Name *
              </label>
              <input
                type="text"
                value={currentRequest.productName || ''}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                  setCurrentRequest(prev => ({ ...prev, productName: e.target.value }));
                }}
                className="w-full px-3 py-2.5 sm:py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-base sm:text-sm"
                placeholder="What product are you looking for?"
                autoComplete="off"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description *
              </label>
              <textarea
                value={currentRequest.description || ''}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => {
                  setCurrentRequest(prev => ({ ...prev, description: e.target.value }));
                }}
                rows={3}
                className="w-full px-3 py-2.5 sm:py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-base sm:text-sm resize-none"
                placeholder="Describe the product in detail..."
                autoComplete="off"
              />
            </div>

            <div className="grid grid-cols-2 gap-3 sm:gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Quantity
                </label>
                <input
                  type="number"
                  value={currentRequest.quantity || 1}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                    const value = parseInt(e.target.value);
                    setCurrentRequest(prev => ({ ...prev, quantity: isNaN(value) || value < 1 ? 1 : value }));
                  }}
                  className="w-full px-3 py-2.5 sm:py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-base sm:text-sm"
                  min="1"
                  autoComplete="off"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Desired Price ({getCurrencySymbol(currentRequest.location)})
                </label>
                <input
                  type="number"
                  value={currentRequest.desiredPrice || ''}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                    const value = parseFloat(e.target.value);
                    setCurrentRequest(prev => ({ 
                      ...prev, 
                      desiredPrice: isNaN(value) ? undefined : value 
                    }));
                  }}
                  className="w-full px-3 py-2.5 sm:py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-base sm:text-sm"
                  placeholder="max price you're willing to pay"
                  min="0"
                  step="0.01"
                  autoComplete="off"
                />
              </div>
            </div>

            {/* Contact Information */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Your Location *
              </label>
              <input
                type="text"
                value={currentRequest.location || ''}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                  setCurrentRequest(prev => ({ ...prev, location: e.target.value }));
                }}
                className="w-full px-3 py-2.5 sm:py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-base sm:text-sm"
                placeholder="e.g., Nairobi, Kenya"
                autoComplete="off"
              />
            </div>

             <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Phone Number *
                {selectedProvider && (
                  <span className="text-green-600 text-xs ml-2">(Autofilled from selected provider)</span>
                )}
              </label>
              <input
                type="tel"
                value={currentRequest.contactPhone || ''}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                  setCurrentRequest(prev => ({ ...prev, contactPhone: e.target.value }));
                }}
                className="w-full px-3 py-2.5 sm:py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-base sm:text-sm"
                placeholder="+254 XXX XXX XXX"
                autoComplete="tel"
              />
            </div>

            {/* Communication Method */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Preferred Contact Method *
              </label>
              <div className="grid grid-cols-3 gap-2">
                {(['whatsapp', 'sms', 'call'] as const).map(method => (
                  <button
                    key={method}
                    type="button"
                    onClick={() => {
                      setCurrentRequest(prev => ({ ...prev, contactMethod: method }));
                    }}
                    className={`p-2.5 sm:p-3 rounded-lg border text-center transition-colors touch-manipulation ${
                      currentRequest.contactMethod === method
                        ? 'bg-blue-50 border-blue-200 text-blue-600'
                        : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    {method === 'whatsapp' && <MessageCircle className="w-4 h-4 sm:w-5 sm:h-5 mx-auto mb-1" />}
                    {method === 'sms' && <Mail className="w-4 h-4 sm:w-5 sm:h-5 mx-auto mb-1" />}
                    {method === 'call' && <Phone className="w-4 h-4 sm:w-5 sm:h-5 mx-auto mb-1" />}
                    <span className="text-xs capitalize">{method}</span>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Urgency Level
              </label>
              <select
                value={currentRequest.urgency || 'medium'}
                onChange={(e: React.ChangeEvent<HTMLSelectElement>) => {
                  setCurrentRequest(prev => ({ 
                    ...prev, 
                    urgency: e.target.value as 'low' | 'medium' | 'high'
                  }));
                }}
                className="w-full px-3 py-2.5 sm:py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-base sm:text-sm"
              >
                <option value="low">Low - Within a week</option>
                <option value="medium">Medium - Within 2-3 days</option>
                <option value="high">High - Urgent (today/tomorrow)</option>
              </select>
            </div>

            {/* Cost Estimate */}
            {currentRequest.location && currentRequest.contactMethod && calculateEstimatedCost(currentRequest) > 0 && (
              <div className="bg-blue-50 p-3 sm:p-4 rounded-lg">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-blue-900">Estimated Service Cost:</span>
                  <span className="text-base sm:text-lg font-bold text-blue-600">
                    {formatPrice(calculateEstimatedCost(currentRequest), currentRequest.location)}
                  </span>
                </div>
                <p className="text-xs text-blue-700 mt-1">
                  This includes service fee and communication costs for {currentRequest.contactMethod}
                </p>
              </div>
            )}

            {currentRequest.contactMethod && (
              <div className="bg-green-50 p-3 sm:p-4 rounded-lg">
                <div className="flex items-start gap-2">
                  <ExternalLink className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                  <div className="text-sm text-green-800">
                    <p className="font-medium mb-1">Ready to send via {currentRequest.contactMethod?.toUpperCase()}!</p>
                    <p>
                      {currentRequest.contactMethod === 'whatsapp' && 'Will open WhatsApp with your request message'}
                      {currentRequest.contactMethod === 'sms' && 'Will open your SMS app with the request message'}
                      {currentRequest.contactMethod === 'call' && 'Will initiate a phone call to the number'}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Submit Button */}
            <button
              onClick={handleProductRequest}
              disabled={requestProcessing || !currentRequest.productName || !currentRequest.description || !currentRequest.contactPhone}
              className="w-full py-3 sm:py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:bg-blue-400 disabled:cursor-not-allowed text-base touch-manipulation"
            >
              {requestProcessing ? (
                <div className="flex items-center justify-center gap-2">
                  <Loader className="w-4 h-4 animate-spin" />
                  <span>Processing Request...</span>
                </div>
              ) : (
                <div className="flex items-center justify-center gap-2">
                  {currentRequest.contactMethod === 'whatsapp' && <MessageCircle className="w-4 h-4" />}
                  {currentRequest.contactMethod === 'sms' && <Mail className="w-4 h-4" />}
                  {currentRequest.contactMethod === 'call' && <Phone className="w-4 h-4" />}
                  <span>Send Request via {currentRequest.contactMethod?.toUpperCase()}</span>
                </div>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
const ProductsComponent = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedShop, setSelectedShop] = useState<string | null>(null);
    const [viewMode, setViewMode] = useState<'grid' | 'list' | 'shops' | 'providers'>('shops');
  const [showFilters, setShowFilters] = useState(false);
  const [priceRange, setPriceRange] = useState([0, 10000000]);
  const [sortBy, setSortBy] = useState('popular');
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [processingAction, setProcessingAction] = useState<string | null>(null);
  const [expandedShops, setExpandedShops] = useState<Set<number>>(new Set());
  const [activeFilterSection, setActiveFilterSection] = useState<string | null>(null);
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [requestProcessing, setRequestProcessing] = useState(false);
  const [showCommunicationModal, setShowCommunicationModal] = useState(false);
  const [currentRequest, setCurrentRequest] = useState<Partial<ProductRequest>>({
    urgency: 'medium',
    contactMethod: 'whatsapp',
    quantity: 1
  }); 
   // Location-based pricing data
  const [locationPricing, setLocationPricing] = useState<LocationPricing[]>([
    {
      country: 'Kenya',
      region: 'Nairobi',
      currency: 'KES',
      smsCost: 1,
      whatsappCost: 0,
      callCostPerMinute: 5,
      serviceFee: 50
    },
    {
      country: 'Kenya',
      region: 'Other',
      currency: 'KES',
      smsCost: 2,
      whatsappCost: 0,
      callCostPerMinute: 7,
      serviceFee: 75
    },
    {
      country: 'Uganda',
      region: 'Kampala',
      currency: 'UGX',
      smsCost: 100,
      whatsappCost: 0,
      callCostPerMinute: 500,
      serviceFee: 5000
    },
    {
      country: 'Tanzania',
      region: 'Dar es Salaam',
      currency: 'TZS',
      smsCost: 50,
      whatsappCost: 0,
      callCostPerMinute: 200,
      serviceFee: 2500
    }
  ]);
  const [providers, setProviders] = useState<Provider[]>([]);
  const [providersLoading, setProvidersLoading] = useState(true);
  const [selectedProvider, setSelectedProvider] = useState<Provider | null>(null);
  const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://mkt-backend-sz2s.onrender.com';

  // Get user from AuthContext
  const { user, isAuthenticated } = useAuth();

  // Enhanced authentication handlers
  const showLoginPrompt = (action: string) => {
    toast.info(
      <div className="flex flex-col space-y-2">
        <span>Please login to {action}</span>
        <button
          onClick={() => window.location.href = '/login'}
          className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700 transition-colors"
        >
          Login Now
        </button>
      </div>,
      {
        position: "top-right",
        autoClose: 5000,
        closeOnClick: false,
      }
    );
  };

  const showSuccessMessage = (message: string) => {
    toast.success(message, {
      position: "top-right",
      autoClose: 3000,
    });
  };

  // Enhanced wishlist and view handlers
  const handleWishlist = async (productId: string) => {
    if (!isAuthenticated) {
      showLoginPrompt('add to wishlist');
      return;
    }

    setProcessingAction(`wishlist-${productId}`);
    try {
      await new Promise(resolve => setTimeout(resolve, 800));
      showSuccessMessage('Added to wishlist!');
    } catch (error) {
      console.error('Wishlist error:', error);
      toast.error('Failed to add to wishlist');
    } finally {
      setProcessingAction(null);
    }
  };

  const handleViewDetails = async (productId: string) => {
    if (!isAuthenticated) {
      showLoginPrompt('view product details');
      return;
    }

    if (user && user.role && user.role.toLowerCase() !== 'client') {
      toast.info(
        <div className="flex flex-col space-y-2">
          <span>You need a client account to view product details</span>
          <button
            onClick={() => window.location.href = '/register?role=client'}
            className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700 transition-colors"
          >
            Register as Client
          </button>
        </div>,
        {
          position: "top-right",
          autoClose: 5000,
          closeOnClick: false,
        }
      );
      return;
    }

    setProcessingAction(`view-${productId}`);
    try {
      await new Promise(resolve => setTimeout(resolve, 800));
      window.location.href = `/marketplace?product=${productId}`;
    } catch (error) {
      console.error('View details error:', error);
      toast.error('Failed to load product details');
    } finally {
      setProcessingAction(null);
    }
  };

  const handlePurchaseProduct = async (
    productId: string,
    purchaseData?: {
      quantity?: number;
      paymentMethod?: string;
      shippingAddress?: string;
    }
  ) => {
    if (!isAuthenticated) {
      showLoginPrompt('purchase products');
      setTimeout(() => {
        window.location.href = '/register';
      }, 1500);
      return;
    }

    if (user && user.role && user.role.toLowerCase() === 'client') {
      const defaultPurchaseData = {
        quantity: 1,
        paymentMethod: 'card',
        shippingAddress: '',
        ...purchaseData,
      };

      const productData = encodeURIComponent(
        JSON.stringify({
          productId: parseInt(productId),
          ...defaultPurchaseData,
        })
      );

      window.location.href = `/marketplace?product=${productId}&action=purchase&data=${productData}`;
    } else {
      toast.info(
        <div className="flex flex-col space-y-2">
          <span>You need a client account to purchase products</span>
          <button
            onClick={() => (window.location.href = '/register?role=client')}
            className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700 transition-colors"
          >
            Register as Client
          </button>
        </div>,
        {
          position: 'top-right',
          autoClose: 5000,
          closeOnClick: false,
        }
      );
    }
  };

  // Fetch categories from backend
  const fetchCategories = async () => {
    try {
      setCategoriesLoading(true);
      const response = await fetch(`${BASE_URL}/api/public/categories`);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch categories: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (Array.isArray(data)) {
        setCategories(data);
      } else {
        console.warn('Categories response is not an array:', data);
        setCategories([]);
      }
    } catch (err) {
      console.error('Error fetching categories:', err);
      setCategories([]);
    } finally {
      setCategoriesLoading(false);
    }
  };

  // Fetch ALL products from backend
  const fetchAllProducts = async () => {
    try {
      setLoading(true);
      const url = `${BASE_URL}/api/products`;
      
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch products: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (Array.isArray(data)) {
        setAllProducts(data);
        setError(null);
      } else {
        throw new Error('Products response is not an array');
      }
    } catch (err) {
      console.error('Error fetching products:', err);
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError(String(err));
      }
      setAllProducts([]);
    } finally {
      setLoading(false);
    }
  };

  // Client-side filtering function
  const getFilteredProducts = () => {
    let filtered = [...allProducts];

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(product => 
        product.name.toLowerCase().includes(query) ||
        product.description.toLowerCase().includes(query) ||
        (product.provider.firstName && product.provider.firstName.toLowerCase().includes(query)) ||
        (product.provider.lastName && product.provider.lastName.toLowerCase().includes(query)) ||
        (product.provider.shopName && product.provider.shopName.toLowerCase().includes(query))
      );
    }

    // Apply category filter
    if (selectedCategory !== 'all' && selectedCategory !== 'uncategorized') {
      const categoryId = parseInt(selectedCategory);
      if (!isNaN(categoryId)) {
        filtered = filtered.filter(product => 
          product.categoryId === categoryId
        );
      }
    } else if (selectedCategory === 'uncategorized') {
      filtered = filtered.filter(product => 
        product.categoryId === null || product.categoryId === undefined
      );
    }

    // Apply price range filter
    filtered = filtered.filter(product => {
      const price = parseFloat(product.price);
      return !isNaN(price) && price >= priceRange[0] && price <= priceRange[1];
    });

    // Apply sorting
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        case 'price-low':
          return parseFloat(a.price) - parseFloat(b.price);
        case 'price-high':
          return parseFloat(b.price) - parseFloat(a.price);
        case 'rating':
          return (b.rating || 0) - (a.rating || 0);
        case 'popular':
        default:
          return (b.reviews?.length || 0) - (a.reviews?.length || 0);
      }
    });

    return filtered;
  };

  // Get category name by ID
  const getCategoryNameById = (categoryId: number | null) => {
    if (!categoryId) return 'Uncategorized';
    const category = categories.find(cat => cat.id === categoryId);
    return category ? category.name : 'Uncategorized';
  };

  // Format product data
  const formatProduct = (product: Product): FormattedProduct => {
    const fallbackImage = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KICA8cmVjdCB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgZmlsbD0iI2Y4ZjlmYSIvPgogIDx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0iQXJiaXJhLCBzYW5zLXNlcmlmIiBmb250LXNpemU9IjE2IiBmaWxsPSIjNmI3MzgwIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBkeT0iMC4zZW0iPk5vIEltYWdlIEF2YWlsYWJsZTwvdGV4dD4KPC9zdmc+Cg==';
    
    const formatProviderName = (provider: Product['provider']) => {
      if (!provider) return 'Registered Provider';
      
      if (provider.shopName) {
        return provider.shopName;
      }
      
      const firstName = provider.firstName || '';
      const lastName = provider.lastName || '';
      
      if (firstName || lastName) {
        return `${firstName} ${lastName}`.trim();
      }
      
      return 'Registered Provider';
    };
    
    const getReviewCount = (reviews?: Review[]) => {
      if (Array.isArray(reviews)) {
        return reviews.length;
      }
      return Math.floor(Math.random() * 100) + 10;
    };
    
    return {
      id: product.id.toString(),
      name: product.name || 'Unnamed Product',
      description: product.description || '',
      price: product.price || '0',
      originalPrice: product.originalPrice ? product.originalPrice.toString() : null,
      rating: product.rating ? Number(product.rating) : 4.5,
      reviews: getReviewCount(product.reviews),
      images: Array.isArray(product.images) && product.images.length > 0 ? product.images : [fallbackImage],
      category: getCategoryNameById(product.categoryId),
      categoryId: product.categoryId,
      tags: Array.isArray(product.tags) ? product.tags : ['new', 'popular'],
      inStock: product.inStock ?? (product.stock ? product.stock > 0 : true),
      shipping: '',
      featured: product.featured || Math.random() > 0.7,
      createdAt: product.createdAt || new Date().toISOString(),
      status: product.status || 'published',
      location: product.location || product.provider.location || 'Nairobi, Kenya',
      provider: formatProviderName(product.provider),
      providerId: product.providerId,
      providerData: product.provider
    };
  };

  // Group products by shop/producer - FIXED: One producer can have products in multiple categories
  const groupProductsByShop = (products: FormattedProduct[]): ShopGroup[] => {
    const shopMap = new Map<number, ShopGroup>();
    
    products.forEach(product => {
      if (!shopMap.has(product.providerId)) {
        const shopName = product.providerData.shopName || 
                        `${product.providerData.firstName || ''} ${product.providerData.lastName || ''}`.trim() ||
                        `Shop ${product.providerId}`;
        
        shopMap.set(product.providerId, {
          providerId: product.providerId,
          providerName: `${product.providerData.firstName || ''} ${product.providerData.lastName || ''}`.trim() || 'Unknown Provider',
          shopName,
          rating: product.providerData.rating || 4.0,
          profileImageUrl: product.providerData.profileImageUrl,
          location: product.location,
          products: [],
          categories: new Set(),
          totalProducts: 0
        });
      }
      
      const shop = shopMap.get(product.providerId)!;
      shop.products.push(product);
      if (product.category) {
        shop.categories.add(product.category);
      }
      shop.totalProducts++;
    });
    
    // Sort shops by number of products (descending) and then by name
    return Array.from(shopMap.values()).sort((a, b) => {
      if (b.totalProducts !== a.totalProducts) {
        return b.totalProducts - a.totalProducts;
      }
      return a.shopName.localeCompare(b.shopName);
    });
  };

  // Get categories with counts
  const getCategoriesWithCounts = () => {
    const searchFilteredProducts = searchQuery.trim() 
      ? allProducts.filter(product => {
          const query = searchQuery.toLowerCase();
          return product.name.toLowerCase().includes(query) ||
                 product.description.toLowerCase().includes(query) ||
                 (product.provider.firstName && product.provider.firstName.toLowerCase().includes(query)) ||
                 (product.provider.lastName && product.provider.lastName.toLowerCase().includes(query)) ||
                 (product.provider.shopName && product.provider.shopName.toLowerCase().includes(query));
        })
      : allProducts;

    const categoryCounts = categories.map(cat => {
      const count = searchFilteredProducts.filter(product => 
        product.categoryId === cat.id
      ).length;
      return {
        id: cat.id.toString(),
        name: cat.name,
        count
      };
    });

    const uncategorizedCount = searchFilteredProducts.filter(product => 
      !product.categoryId || product.categoryId === null
    ).length;

    const allCategoriesWithCounts = [
      { 
        id: 'all', 
        name: 'All Products', 
        count: searchFilteredProducts.length 
      }
    ];

    const categoriesToShow = searchQuery.trim() 
      ? categoryCounts.filter(cat => cat.count > 0)
      : categoryCounts;
    
    allCategoriesWithCounts.push(...categoriesToShow);

    if (uncategorizedCount > 0) {
      allCategoriesWithCounts.push({
        id: 'uncategorized',
        name: 'Uncategorized',
        count: uncategorizedCount
      });
    }

    return allCategoriesWithCounts;
  };

  // Toggle shop expansion
  const toggleShopExpansion = (providerId: number) => {
    const newExpandedShops = new Set(expandedShops);
    if (newExpandedShops.has(providerId)) {
      newExpandedShops.delete(providerId);
    } else {
      newExpandedShops.add(providerId);
    }
    setExpandedShops(newExpandedShops);
  };

  // Toggle filter section on mobile

const toggleFilterSection = (section: string) => {
  if (window.innerWidth < 1024) {
    // On mobile, automatically expand the section when clicked
    setActiveFilterSection(activeFilterSection === section ? null : section);
  }
  // On desktop, sections are always expanded
};

  // Close filters when clicking outside
useEffect(() => {
  const handleClickOutside = (event: MouseEvent) => {
    const target = event.target as HTMLElement;
    // Remove mobile menu condition
    if (showFilters && !target.closest('.filter-sidebar') && !target.closest('.filter-button')) {
      setShowFilters(false);
    }
  };

  document.addEventListener('mousedown', handleClickOutside);
  return () => document.removeEventListener('mousedown', handleClickOutside);
}, [showFilters]); // Remove showMobileMenu from dependencies

  // Load initial data
  useEffect(() => {
    const loadInitialData = async () => {
      await Promise.all([
        fetchCategories(),
        fetchAllProducts(),
        fetchProviders()
      ]);
    };
    loadInitialData();
  }, []);

  // Reset selections when categories change
  useEffect(() => {
    if (categories.length > 0 && selectedCategory !== 'all') {
      const categoryExists = categories.some(cat => cat.id.toString() === selectedCategory);
      if (!categoryExists && selectedCategory !== 'uncategorized') {
        setSelectedCategory('all');
      }
    }
  }, [categories, selectedCategory]);

  const filteredProducts = getFilteredProducts();
  const formattedProducts = filteredProducts.map(formatProduct);
  const shopGroups = groupProductsByShop(formattedProducts);
  const allCategoriesWithCounts = getCategoriesWithCounts();

  // Enhanced price formatting for KSH
  const formatPrice = (price: string | number, location?: string): string => {
    const amount = typeof price === 'string' ? parseFloat(price) : price;
    if (isNaN(amount)) return `${getCurrencySymbol(location)} 0`;
    
    const currency = getCurrencySymbol(location);
    const locale = currency === 'UGX' ? 'en-UG' : 
                  currency === 'TZS' ? 'en-TZ' : 'en-KE';
    
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0
    }).format(amount);
  };

  // Handle category selection
  const handleCategoryChange = (categoryId: string) => {
    setSelectedCategory(categoryId);
    setSelectedShop(null);
    if (window.innerWidth <= 1024) {
      setShowFilters(false);
      const productsSection = document.querySelector('.products-section');
      if (productsSection) {
        productsSection.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  // Handle shop selection
  const handleShopSelect = (shopId: string) => {
    setSelectedShop(shopId);
    setViewMode('grid');
  };

  // Enhanced register redirect handler
  const handleRegisterRedirect = (role: 'client' | 'seller' = 'client') => {
    if (!isAuthenticated) {
      window.location.href = `/register?role=${role}`;
    } else {
      window.location.href = `/register?role=${role}`;
    }
  };

  // Add function to fetch providers
  const fetchProviders = async () => {
    try {
      setProvidersLoading(true);
      const response = await fetch(`${BASE_URL}/api/provider/public/all`);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch providers: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.success && Array.isArray(data.data)) {
        setProviders(data.data);
      } else {
        console.warn('Providers response is not in expected format:', data);
        setProviders([]);
      }
    } catch (err) {
      console.error('Error fetching providers:', err);
      setProviders([]);
    } finally {
      setProvidersLoading(false);
    }
  };
// Add function to handle provider selection
  const handleProviderSelect = (provider: Provider) => {
    if (!isAuthenticated) {
      showLoginPrompt('select providers');
      return;
    }

    setSelectedProvider(provider);
    
    // Autofill the phone number in the request form
    setCurrentRequest(prev => ({
      ...prev,
      contactPhone: provider.phoneNumber,
      providerId: provider.id
    }));
    
    // Show the request modal
    setShowRequestModal(true);
    
    toast.success(`Selected ${provider.shopName || `${provider.firstName} ${provider.lastName}`}. Phone number autofilled!`);
  };
// Add this component inside your ProductsComponent
const ProvidersList = () => {
  if (providersLoading) {
    return (
      <div className="flex justify-center items-center py-8">
        <Loader className="w-6 h-6 animate-spin text-blue-600" />
        <span className="ml-2 text-gray-600">Loading providers...</span>
      </div>
    );
  }

  if (providers.length === 0) {
    return (
      <div className="text-center py-8 bg-white rounded-lg border border-gray-200">
        <Users className="w-12 h-12 text-gray-300 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">No Providers Available</h3>
        <p className="text-gray-600 mb-4">No service providers are currently available.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
      {providers.map(provider => (
        <div
          key={provider.id}
          className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 sm:p-6 hover:shadow-md transition-shadow cursor-pointer touch-manipulation"
          onClick={() => handleProviderSelect(provider)}
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center flex-shrink-0">
              {provider.profileImageUrl ? (
                <img 
                  src={provider.profileImageUrl} 
                  alt={provider.shopName || `${provider.firstName} ${provider.lastName}`}
                  className="w-12 h-12 sm:w-16 sm:h-16 rounded-full object-cover"
                />
              ) : (
                <Store className="w-6 h-6 sm:w-8 sm:h-8 text-blue-600" />
              )}
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="text-base sm:text-lg font-semibold text-gray-900 truncate">
                {provider.shopName || `${provider.firstName} ${provider.lastName}`}
              </h3>
              <p className="text-gray-600 text-sm truncate">
                {provider.college?.name || 'Independent Provider'}
              </p>
              {provider.rating && (
                <div className="flex items-center gap-1 mt-1">
                  <Star className="w-3 h-3 sm:w-4 sm:h-4 text-yellow-400 fill-current" />
                  <span className="text-xs sm:text-sm text-gray-600">{provider.rating.toFixed(1)}</span>
                </div>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <MapPin className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
              <span className="truncate">{provider.location || 'Location not specified'}</span>
            </div>
            
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Phone className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
              <span className="truncate font-mono">{provider.phoneNumber}</span>
            </div>
          </div>

          {provider.services && provider.services.length > 0 && (
            <div className="mt-3">
              <div className="flex flex-wrap gap-1">
                {provider.services.slice(0, 3).map(service => (
                  <span
                    key={service.id}
                    className="px-2 py-1 bg-blue-50 text-blue-600 text-xs rounded-full"
                  >
                    {service.name}
                  </span>
                ))}
                {provider.services.length > 3 && (
                  <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                    +{provider.services.length - 3} more
                  </span>
                )}
              </div>
            </div>
          )}

          <div className="mt-4 pt-3 border-t border-gray-100">
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleProviderSelect(provider);
              }}
              className="w-full py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors text-sm touch-manipulation"
            >
              Request Product
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};
 // New function to calculate estimated cost based on location and contact method
  const calculateEstimatedCost = (request: Partial<ProductRequest>): number => {
    if (!request.location || !request.contactMethod) return 0;
    
    const pricing = locationPricing.find(lp => 
      request.location?.toLowerCase().includes(lp.region.toLowerCase()) ||
      request.location?.toLowerCase().includes(lp.country.toLowerCase())
    ) || locationPricing[0]; // Default to first pricing
    
    let baseCost = pricing.serviceFee;
    
    switch (request.contactMethod) {
      case 'sms':
        baseCost += pricing.smsCost;
        break;
      case 'whatsapp':
        baseCost += pricing.whatsappCost;
        break;
      case 'call':
        baseCost += pricing.callCostPerMinute * 3; // Assume 3 minutes average call
        break;
    }
    
    return baseCost;
  };

  // Enhanced communication functions that redirect to respective apps
  const initiateContact = (request: ProductRequest) => {
    const message = encodeURIComponent(`Product Request: ${request.productName}\n\nDescription: ${request.description}\nQuantity: ${request.quantity}\nDesired Price: ${request.desiredPrice ? getCurrencySymbol(request.location) + ' ' + request.desiredPrice : 'Not specified'}\nUrgency: ${request.urgency}\nLocation: ${request.location}\n\nPlease respond with availability and pricing.`);
    
    const cleanPhone = request.contactPhone.replace(/\D/g, '');
    
    switch (request.contactMethod) {
      case 'sms':
        // For mobile devices, this will open the default SMS app
        if (/iPhone|iPad|iPod|Android/i.test(navigator.userAgent)) {
          window.location.href = `sms:${cleanPhone}?body=${message}`;
        } else {
          // For desktop, show instructions
          setShowCommunicationModal(true);
        }
        break;
      case 'whatsapp':
        const whatsappUrl = `https://wa.me/${cleanPhone}?text=${message}`;
        window.open(whatsappUrl, '_blank');
        break;
      case 'call':
        window.location.href = `tel:${cleanPhone}`;
        break;
    }
  };

  // Function to handle product request submission - NO BACKEND CALL
  const handleProductRequest = async () => {
    if (!currentRequest.productName || !currentRequest.description || !currentRequest.contactPhone) {
      toast.error('Please fill in all required fields');
      return;
    }

    if (!isAuthenticated) {
      showLoginPrompt('submit product requests');
      return;
    }

    setRequestProcessing(true);
    
    try {
      const requestData: ProductRequest = {
        productName: currentRequest.productName!,
        description: currentRequest.description!,
        quantity: currentRequest.quantity || 1,
        urgency: currentRequest.urgency || 'medium',
        contactPhone: currentRequest.contactPhone!,
        contactMethod: currentRequest.contactMethod || 'whatsapp',
        location: currentRequest.location || 'Nairobi, Kenya',
        desiredPrice: currentRequest.desiredPrice,
        categoryId: currentRequest.categoryId,
        collegeId: currentRequest.collegeId,
        estimatedCost: calculateEstimatedCost(currentRequest)
      };

      // Simulate processing time
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Initiate contact via selected method
      initiateContact(requestData);

      toast.success(`Product request submitted! Opening ${requestData.contactMethod} to send your request.`);
      setShowRequestModal(false);
      setCurrentRequest({
        urgency: 'medium',
        contactMethod: 'whatsapp',
        quantity: 1
      });
      
    } catch (error) {
      console.error('Error submitting product request:', error);
      toast.error('Failed to submit product request. Please try again.');
    } finally {
      setRequestProcessing(false);
    }
  };

  // Update estimated cost when location or contact method changes
const getCurrentEstimatedCost = () => {
  if (currentRequest.location && currentRequest.contactMethod) {
    return calculateEstimatedCost(currentRequest);
  }
  return 0;
};

  // Helper function to get currency symbol based on location
  const getCurrencySymbol = (location?: string): string => {
    if (!location) return 'KES';
    const pricing = locationPricing.find(lp => 
      location.toLowerCase().includes(lp.region.toLowerCase()) ||
      location.toLowerCase().includes(lp.country.toLowerCase())
    );
    return pricing?.currency || 'KES';
  };

  // Communication Instructions Modal
  const CommunicationModal = () => (
    <div className={`fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4 ${showCommunicationModal ? 'block' : 'hidden'}`}>
      <div className="bg-white rounded-xl max-w-md w-full">
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold text-gray-900">Send SMS Instructions</h3>
            <button 
              onClick={() => setShowCommunicationModal(false)}
              className="p-2 rounded-lg hover:bg-gray-100 touch-manipulation"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <div className="space-y-4">
            <div className="bg-blue-50 p-4 rounded-lg">
              <h4 className="font-semibold text-blue-900 mb-2">Send SMS to:</h4>
              <p className="text-blue-800 font-mono text-lg">{currentRequest.contactPhone}</p>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-semibold text-gray-900 mb-2">Message to send:</h4>
              <p className="text-gray-700 text-sm">
                Product Request: {currentRequest.productName}
                <br /><br />
                Description: {currentRequest.description}
                <br />
                Quantity: {currentRequest.quantity}
                <br />
                Urgency: {currentRequest.urgency}
                <br />
                Location: {currentRequest.location}
                <br /><br />
                Please respond with availability and pricing.
              </p>
            </div>

            <button
              onClick={() => setShowCommunicationModal(false)}
              className="w-full py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors touch-manipulation"
            >
              I've Sent the SMS
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  
  // Mobile-friendly filter sidebar component
// Mobile-friendly filter sidebar component
const FilterSidebar = () => (
  <div className={`lg:w-80 filter-sidebar ${showFilters ? 'block fixed inset-0 z-50 bg-white overflow-y-auto lg:static lg:bg-transparent' : 'hidden lg:block'}`}>
    <div className="bg-white rounded-xl p-4 sm:p-6 shadow-sm border border-gray-100 lg:sticky lg:top-8 h-full lg:h-auto">
      {/* Mobile header */}
      {showFilters && (
        <div className="flex items-center justify-between mb-6 lg:hidden">
          <h2 className="text-xl font-bold text-gray-900">Filters</h2>
          <button 
            onClick={() => setShowFilters(false)}
            className="p-2 rounded-lg hover:bg-gray-100 touch-manipulation"
          >
            <X className="w-6 h-6" />
          </button>
        </div>
      )}

      {/* Desktop header (hidden on mobile) */}
      {!showFilters && (
        <div className="hidden lg:block mb-6">
          <h2 className="text-xl font-bold text-gray-900">Filters</h2>
        </div>
      )}

      {/* View Mode Selector - Always visible */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-3">View Mode</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {[
            { mode: 'shops', icon: Store, label: 'Shops' },
            { mode: 'grid', icon: Grid, label: 'Grid' },
            { mode: 'list', icon: List, label: 'List' },
            { mode: 'providers', icon: Users, label: 'Providers' }
          ].map(({ mode, icon: Icon, label }) => (
            <button
              key={mode}
              onClick={() => {
                setViewMode(mode as 'shops' | 'grid' | 'list' | 'providers');
                // Close filters on mobile when a view mode is selected
                if (window.innerWidth < 1024) {
                  setShowFilters(false);
                }
              }}
              className={`p-2.5 sm:p-3 rounded-lg border text-center transition-colors touch-manipulation flex flex-col items-center justify-center ${
                viewMode === mode 
                  ? 'bg-blue-50 border-blue-200 text-blue-600' 
                  : 'border-gray-200 text-gray-600 hover:bg-gray-50'
              }`}
            >
              <Icon className="w-4 h-4 sm:w-5 sm:h-5 mb-1 sm:mb-2" />
              <span className="text-xs font-medium">{label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Categories Section */}
      <div className="mb-6">
        <div className="flex items-center justify-between w-full text-left mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Categories</h3>
          <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform lg:hidden ${
            activeFilterSection === 'categories' ? 'rotate-180' : ''
          }`} />
        </div>
        
        <div className="space-y-2 max-h-60 overflow-y-auto">
          {allCategoriesWithCounts.length > 0 ? (
            allCategoriesWithCounts.map(category => (
              <button
                key={category.id}
                onClick={() => {
                  handleCategoryChange(category.id.toString());
                  // Close filters on mobile when a category is selected
                  if (window.innerWidth < 1024) {
                    setShowFilters(false);
                  }
                }}
                className={`w-full text-left px-3 py-2.5 rounded-lg transition-colors touch-manipulation flex justify-between items-center ${
                  selectedCategory === category.id.toString()
                    ? 'bg-blue-50 text-blue-600 font-medium'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                <span className="truncate text-sm">{category.name}</span>
                <span className="text-xs text-gray-400 ml-2 flex-shrink-0">({category.count})</span>
              </button>
            ))
          ) : (
            <div className="text-gray-500 text-sm py-2 text-center">
              {categoriesLoading ? 'Loading categories...' : 'No categories available'}
            </div>
          )}
        </div>
      </div>

      {/* Price Range Section */}
      <div className="mb-6">
        <div className="flex items-center justify-between w-full text-left mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Price Range (KES)</h3>
          <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform lg:hidden ${
            activeFilterSection === 'price' ? 'rotate-180' : ''
          }`} />
        </div>
        
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm text-gray-600 mb-1 block">Min</label>
              <input
                type="number"
                placeholder="0"
                value={priceRange[0]}
                onChange={(e) => setPriceRange([parseInt(e.target.value) || 0, priceRange[1]])}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-sm"
              />
            </div>
            <div>
              <label className="text-sm text-gray-600 mb-1 block">Max</label>
              <input
                type="number"
                placeholder="10000000"
                value={priceRange[1]}
                onChange={(e) => setPriceRange([priceRange[0], parseInt(e.target.value) || 10000000])}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-sm"
              />
            </div>
          </div>
          <div className="text-sm text-gray-500 text-center">
            Range: {formatPrice(priceRange[0])} - {formatPrice(priceRange[1])}
          </div>
        </div>
      </div>

      {/* Sort By Section */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-3">Sort By</h3>
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className="w-full px-3 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-sm"
        >
          <option value="popular">Most Popular</option>
          <option value="newest">Newest First</option>
          <option value="price-low">Price: Low to High</option>
          <option value="price-high">Price: High to Low</option>
          <option value="rating">Highest Rated</option>
        </select>
      </div>

      {/* Mobile Apply Filters Button */}
      {showFilters && (
        <div className="lg:hidden mt-6 pt-4 border-t border-gray-200">
          <button
            onClick={() => setShowFilters(false)}
            className="w-full py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors touch-manipulation"
          >
            Apply Filters
          </button>
        </div>
      )}
    </div>
  </div>
);

  // Product card component for reusability
  const ProductCard = ({ product, layout = 'grid' }: { product: FormattedProduct; layout?: 'grid' | 'list' }) => {
    const isGrid = layout === 'grid';
    
    return (
      <div className={`bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 border border-gray-100 group ${
        isGrid ? '' : 'flex flex-col md:flex-row'
      }`}>
        <div className={`relative overflow-hidden ${isGrid ? 'h-48 sm:h-56 md:h-64' : 'md:w-64 h-48 md:h-auto'}`}>
          <img
            src={product.images[0]}
            alt={product.name}
            className={`w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 ${
              isGrid ? '' : 'md:h-full'
            }`}
            onError={(e) => {
              const fallbackSvg = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KICA8cmVjdCB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgZmlsbD0iI2Y4ZjlmYSIvPgogIDx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0iQXJiaXJhLCBzYW5zLXNlcmlmIiBmb250LXNpemU9IjE2IiBmaWxsPSIjNmI3MzgwIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBkeT0iMC4zZW0iPk5vIEltYWdlIEF2YWlsYWJsZTwvdGV4dD4KPC9zdmc+Cg==';
              (e.target as HTMLImageElement).src = fallbackSvg;
            }}
          />

          <div className="absolute top-2 sm:top-3 left-2 sm:left-3 flex gap-1 flex-wrap">
            {product.featured && (
              <span className="bg-blue-600 text-white px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full text-xs font-medium">
                Featured
              </span>
            )}
            {product.originalPrice && (
              <span className="bg-red-500 text-white px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full text-xs font-medium">
                Sale
              </span>
            )}
            <span className="bg-green-600 text-white px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full text-xs font-medium">
              {product.category}
            </span>
          </div>
          <div className="absolute top-2 sm:top-3 right-2 sm:right-3 flex gap-1">
            <button 
              className="p-1.5 sm:p-2 bg-white rounded-full shadow-sm hover:bg-gray-50 transition-colors touch-manipulation"
              onClick={() => handleWishlist(product.id)}
              disabled={processingAction === `wishlist-${product.id}`}
            >
              {processingAction === `wishlist-${product.id}` ? (
                <Loader className="w-3 h-3 sm:w-4 sm:h-4 animate-spin text-gray-600" />
              ) : (
                <Heart className="w-3 h-3 sm:w-4 sm:h-4 text-gray-600" />
              )}
            </button>
            <button 
              className="p-1.5 sm:p-2 bg-white rounded-full shadow-sm hover:bg-gray-50 transition-colors touch-manipulation"
              onClick={() => handleViewDetails(product.id)}
              disabled={processingAction === `view-${product.id}`}
            >
              {processingAction === `view-${product.id}` ? (
                <Loader className="w-3 h-3 sm:w-4 sm:h-4 animate-spin text-gray-600" />
              ) : (
                <Eye className="w-3 h-3 sm:w-4 sm:h-4 text-gray-600" />
              )}
            </button>
          </div>
        </div>
        
        <div className={`p-3 sm:p-4 md:p-6 ${isGrid ? '' : 'flex-1'}`}>
          <div className={`${isGrid ? '' : 'flex flex-col lg:flex-row lg:items-center justify-between'}`}>
            <div className={isGrid ? '' : 'flex-1'}>
              <h3 className={`font-semibold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors line-clamp-2 ${
                isGrid ? 'text-sm sm:text-base md:text-lg' : 'text-base sm:text-lg md:text-xl'
              }`}>
                {product.name}
              </h3>
              
              <div className="flex items-center gap-2 sm:gap-3 mb-3 text-xs sm:text-sm text-gray-600 flex-wrap">
                <div className="flex items-center gap-1">
                  <MapPin className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                  <span className="truncate">{product.location}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Star className="w-3 h-3 sm:w-4 sm:h-4 text-yellow-400 fill-current flex-shrink-0" />
                  <span>{product.rating} ({product.reviews})</span>
                </div>
              </div>
              
              <div className="flex flex-wrap gap-1 mb-3">
                {product.tags?.slice(0, 3).map((tag, index) => (
                  <span
                    key={index}
                    className="px-1.5 sm:px-2 py-0.5 sm:py-1 bg-gray-100 text-gray-600 text-xs rounded-full"
                  >
                    {tag}
                  </span>
                ))}
                {product.tags && product.tags.length > 3 && (
                  <span className="px-1.5 sm:px-2 py-0.5 sm:py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                    +{product.tags.length - 3}
                  </span>
                )}
              </div>
            </div>
            
            <div className={`flex items-center justify-between mb-3 sm:mb-4 ${isGrid ? '' : 'lg:flex-col lg:items-end lg:gap-3 mt-3 lg:mt-0'}`}>
              <div className={`flex items-center gap-2 ${isGrid ? '' : 'lg:text-right'}`}>
                <span className={`font-bold text-gray-900 ${isGrid ? 'text-base sm:text-lg md:text-xl' : 'text-lg sm:text-xl md:text-2xl'}`}>
                  {formatPrice(product.price, product.location)}
                </span>
                {product.originalPrice && (
                  <span className={`text-gray-500 line-through ${isGrid ? 'text-xs sm:text-sm' : 'text-sm sm:text-base'}`}>
                    {formatPrice(product.originalPrice, product.location)}
                  </span>
                )}
              </div>
              <span className={`text-xs sm:text-sm ${product.inStock ? 'text-green-600' : 'text-red-600'} ${
                isGrid ? '' : 'lg:self-end'
              }`}>
                {product.inStock ? 'In Stock' : 'Out of Stock'}
              </span>
            </div>
          </div>
          
          <button
            onClick={() => handlePurchaseProduct(product.id)}
            disabled={processingAction === `purchase-${product.id}` || !product.inStock}
            className={`w-full py-2.5 sm:py-3 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 text-sm sm:text-base touch-manipulation ${
              product.inStock
                ? processingAction === `purchase-${product.id}`
                  ? 'bg-blue-400 cursor-not-allowed text-white'
                  : 'bg-blue-600 hover:bg-blue-700 text-white'
                : 'bg-gray-100 text-gray-400 cursor-not-allowed'
            }`}
          >
            {processingAction === `purchase-${product.id}` ? (
              <>
                <Loader className="w-4 h-4 animate-spin mr-1" />
                Processing...
              </>
            ) : (
              <>
                <ShoppingCart className="w-4 h-4" />
                {product.inStock ? 'Add to Cart' : 'Out of Stock'}
              </>
            )}
          </button>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading products...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white flex items-center justify-center p-4">
        <div className="text-center p-6 bg-white rounded-lg shadow-sm max-w-md mx-auto">
          <h2 className="text-xl font-semibold text-red-600 mb-2">Error loading products</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors touch-manipulation"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white">
       {/* Request Service Modal */}
      <RequestServiceModal
  showRequestModal={showRequestModal}
  setShowRequestModal={setShowRequestModal}
  currentRequest={currentRequest}
  setCurrentRequest={setCurrentRequest}
  requestProcessing={requestProcessing}
  handleProductRequest={handleProductRequest}
  getCurrencySymbol={getCurrencySymbol}
  calculateEstimatedCost={calculateEstimatedCost}
  formatPrice={formatPrice}
  selectedProvider={selectedProvider} 
/>
      
      {/* Communication Instructions Modal */}
      <CommunicationModal />


      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-4 sm:py-6">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900 mb-1 sm:mb-2">
                  Discover Amazing Products
                </h1>
                <p className="text-gray-600 text-sm sm:text-base">Find unique items or request custom products</p>
              </div>
            </div>
            
{/* Search and View Controls */}
<div className="flex flex-col gap-3">
  {/* Top Row: Search Bar */}
  <div className="relative w-full">
    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 sm:w-5 sm:h-5" />
    <input
      type="text"
      placeholder="Search products, shops, providers..."
      value={searchQuery}
      onChange={(e) => setSearchQuery(e.target.value)}
      className="w-full pl-10 pr-4 py-3 sm:py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-base"
    />
  </div>
  
  {/* Bottom Row: Buttons */}
  <div className="flex flex-col xs:flex-row gap-2 w-full">
    {/* Request Product Button - Full width on mobile, auto on larger */}
    <button
      onClick={() => setShowRequestModal(true)}
      className="px-4 py-3 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors text-sm whitespace-nowrap touch-manipulation flex items-center justify-center gap-2 xs:flex-1 sm:flex-none min-w-0"
    >
      <MessageCircle className="w-4 h-4 flex-shrink-0" />
      <span className="truncate">Request Product</span>
    </button>

    {/* View Mode Buttons - Scrollable on mobile */}
    <div className="flex gap-1 overflow-x-auto pb-1 scrollbar-hide"> {/* Added scroll for mobile */}
      <button
        onClick={() => setViewMode('shops')}
        className={`p-2 rounded-lg border text-center touch-manipulation flex items-center gap-1 flex-shrink-0 min-w-[60px] ${
          viewMode === 'shops' 
            ? 'bg-blue-50 border-blue-200 text-blue-600' 
            : 'border-gray-200 text-gray-600 hover:bg-gray-50'
        }`}
      >
        <Store className="w-4 h-4 flex-shrink-0" />
        <span className="text-xs whitespace-nowrap">Shops</span>
      </button>
      
      <button
        onClick={() => setViewMode('grid')}
        className={`p-2 rounded-lg border text-center touch-manipulation flex items-center gap-1 flex-shrink-0 min-w-[60px] ${
          viewMode === 'grid' 
            ? 'bg-blue-50 border-blue-200 text-blue-600' 
            : 'border-gray-200 text-gray-600 hover:bg-gray-50'
        }`}
      >
        <Grid className="w-4 h-4 flex-shrink-0" />
        <span className="text-xs whitespace-nowrap">Grid</span>
      </button>
      
      <button
        onClick={() => setViewMode('list')}
        className={`p-2 rounded-lg border text-center touch-manipulation flex items-center gap-1 flex-shrink-0 min-w-[60px] ${
          viewMode === 'list' 
            ? 'bg-blue-50 border-blue-200 text-blue-600' 
            : 'border-gray-200 text-gray-600 hover:bg-gray-50'
        }`}
      >
        <List className="w-4 h-4 flex-shrink-0" />
        <span className="text-xs whitespace-nowrap">List</span>
      </button>
      
      <button
        onClick={() => setViewMode('providers')}
        className={`p-2 rounded-lg border text-center touch-manipulation flex items-center gap-1 flex-shrink-0 min-w-[70px] ${
          viewMode === 'providers' 
            ? 'bg-blue-50 border-blue-200 text-blue-600' 
            : 'border-gray-200 text-gray-600 hover:bg-gray-50'
        }`}
      >
        <Users className="w-4 h-4 flex-shrink-0" />
        <span className="text-xs whitespace-nowrap">Providers</span>
      </button>
      
      {/* Filter Button - Only show on mobile */}
<button
  onClick={() => setShowFilters(!showFilters)}
  className="p-2 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 lg:hidden touch-manipulation flex items-center gap-1 flex-shrink-0 min-w-[60px] bg-white shadow-sm"
>
  <SlidersHorizontal className="w-4 h-4 flex-shrink-0" />
  <span className="text-xs whitespace-nowrap">Filters</span>
</button>
    </div>
  </div>
</div>
          </div>
        </div>
      </div>

    

      <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-4 sm:py-6">
        <div className="flex flex-col lg:flex-row gap-4 sm:gap-6">
          {/* Sidebar */}
          <FilterSidebar />

          {/* Products/Shops Content */}
       <div className="flex-1 products-section">
  <div className="flex items-center justify-between mb-4 sm:mb-6">
    <p className="text-gray-600 text-sm sm:text-base">
      {viewMode === 'shops' ? (
        <>Showing {shopGroups.length} shops with {formattedProducts.length} products</>
      ) : viewMode === 'providers' ? (
        <>Showing {providers.length} service providers</>
      ) : (
        <>Showing {formattedProducts.length} of {allProducts.length} products</>
      )}
      {selectedCategory !== 'all' && viewMode !== 'providers' && (
        <span className="ml-2 text-blue-600 font-medium">
          in {allCategoriesWithCounts.find(cat => cat.id === selectedCategory)?.name || 'Selected Category'}
        </span>
      )}
    </p>
    {searchQuery && viewMode !== 'providers' && (
      <button
        onClick={() => setSearchQuery('')}
        className="text-sm text-gray-500 hover:text-gray-700 underline touch-manipulation"
      >
        Clear search
      </button>
    )}
  </div>

  {/* Conditional rendering for different view modes */}
  {viewMode === 'providers' ? (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl sm:text-2xl font-bold text-gray-900">
          Available Service Providers
        </h2>
        <p className="text-gray-600 text-sm sm:text-base">
          {providers.length} providers available
        </p>
      </div>
      <ProvidersList />
    </div>
  ) : formattedProducts.length === 0 ? (
    <div className="bg-white rounded-xl p-6 sm:p-12 text-center shadow-sm border border-gray-100">
      <div className="mb-4">
        <Search className="w-12 h-12 sm:w-16 sm:h-16 text-gray-300 mx-auto mb-4" />
        <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">No products found</h3>
        <p className="text-gray-600 mb-6 text-sm sm:text-base">
          {selectedCategory !== 'all' 
            ? `No products found in the selected category${searchQuery ? ' matching your search' : ''}.`
            : searchQuery 
              ? `No products match "${searchQuery}". Try different keywords.`
              : 'No products available at the moment.'
          }
        </p>
      </div>
      <button
        onClick={() => {
          setSearchQuery('');
          setSelectedCategory('all');
          setPriceRange([0, 10000000]);
          setShowFilters(false);
        }}
        className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors text-sm sm:text-base touch-manipulation"
      >
        Reset Filters
      </button>
    </div>
  ) : viewMode === 'shops' ? (
    /* Shops View */
    <div className="space-y-4 sm:space-y-6">
      {shopGroups.map(shop => (
        <div key={shop.providerId} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          {/* Shop Header */}
          <div 
            className="p-4 sm:p-6 cursor-pointer hover:bg-gray-50 transition-colors touch-manipulation"
            onClick={() => toggleShopExpansion(shop.providerId)}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3 sm:gap-4 min-w-0 flex-1">
                <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center flex-shrink-0">
                  {shop.profileImageUrl ? (
                    <img 
                      src={shop.profileImageUrl} 
                      alt={shop.shopName}
                      className="w-12 h-12 sm:w-16 sm:h-16 rounded-full object-cover"
                    />
                  ) : (
                    <Store className="w-6 h-6 sm:w-8 sm:h-8 text-blue-600" />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="text-base sm:text-lg md:text-xl font-semibold text-gray-900 truncate">{shop.shopName}</h3>
                  <p className="text-gray-600 text-sm truncate">{shop.providerName}</p>
                  <div className="flex items-center gap-2 sm:gap-3 mt-1 text-xs sm:text-sm text-gray-500 flex-wrap">
                    <span className="flex items-center gap-1 truncate">
                      <MapPin className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                      <span className="truncate">{shop.location}</span>
                    </span>
                    <span className="flex items-center gap-1">
                      <Star className="w-3 h-3 sm:w-4 sm:h-4 text-yellow-400 fill-current flex-shrink-0" />
                      {shop.rating.toFixed(1)}
                    </span>
                    <span>{shop.totalProducts} products</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3 sm:gap-4 flex-shrink-0">
                <div className="text-right hidden sm:block">
                  <div className="text-sm text-gray-500">Categories</div>
                  <div className="text-sm font-medium text-gray-700">
                    {Array.from(shop.categories).slice(0, 2).join(', ')}
                    {shop.categories.size > 2 && ` +${shop.categories.size - 2} more`}
                  </div>
                </div>
                <ChevronRight 
                  className={`w-4 h-4 sm:w-5 sm:h-5 text-gray-400 transition-transform flex-shrink-0 ${
                    expandedShops.has(shop.providerId) ? 'rotate-90' : ''
                  }`}
                />
              </div>
            </div>
          </div>

          {/* Shop Products (Collapsible) */}
          {expandedShops.has(shop.providerId) && (
            <div className="border-t border-gray-100 p-3 sm:p-4 md:p-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3 sm:gap-4 md:gap-6">
                {shop.products.map(product => (
                  <ProductCard key={product.id} product={product} layout="grid" />
                ))}
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  ) : viewMode === 'grid' ? (
    /* Grid View */
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3 sm:gap-4 md:gap-6">
      {formattedProducts.map(product => (
        <ProductCard key={product.id} product={product} layout="grid" />
      ))}
    </div>
  ) : (
    /* List View */
    <div className="space-y-3 sm:space-y-4">
      {formattedProducts.map(product => (
        <ProductCard key={product.id} product={product} layout="list" />
      ))}
    </div>
  )}
</div>
        </div>
      </div>

      {/* Register Section */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white">
        <div className="max-w-5xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-8 sm:py-10 md:py-14 text-center">
          <h2 className="text-xl sm:text-2xl md:text-4xl lg:text-5xl font-bold mb-3 sm:mb-4 md:mb-6">
            Can't Find What You Need?
          </h2>
          <h3 className="text-base sm:text-lg md:text-2xl font-semibold mb-4 sm:mb-6 md:mb-8 text-blue-100">
            Request Any Product & We'll Find It For You!
          </h3>
          <p className="text-sm sm:text-base md:text-lg lg:text-xl text-blue-100 mb-6 sm:mb-8 md:mb-10 max-w-2xl mx-auto">
            Register now to access exclusive deals, request custom products, and connect with trusted sellers worldwide.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 md:gap-6 justify-center max-w-md sm:max-w-none mx-auto">
            <button 
              className="bg-white text-blue-600 px-4 sm:px-6 md:px-8 py-2.5 sm:py-3 rounded-lg sm:rounded-xl text-sm sm:text-base md:text-lg font-bold hover:bg-gray-50 transition-all duration-300 shadow-md hover:shadow-lg transform hover:-translate-y-1 touch-manipulation"
              onClick={() => handleRegisterRedirect('client')}
            >
              Register as Buyer
            </button>
            <button 
              className="border-2 border-white text-white px-4 sm:px-6 md:px-8 py-2.5 sm:py-3 rounded-lg sm:rounded-xl text-sm sm:text-base md:text-lg font-bold hover:bg-white hover:text-blue-600 transition-all duration-300 shadow-md hover:shadow-lg transform hover:-translate-y-1 touch-manipulation"
              onClick={() => handleRegisterRedirect('seller')}
            >
              Register as Seller
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductsComponent;