import React, { useState, useEffect } from 'react';
import { Search, Filter, Grid, List, Star, Heart, ShoppingCart, MapPin, Eye, ChevronDown, SlidersHorizontal, Loader, Store, Users, ChevronRight, Menu, X } from 'lucide-react';
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

const ProductsComponent = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedShop, setSelectedShop] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list' | 'shops'>('shops');
  const [showFilters, setShowFilters] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
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
    setActiveFilterSection(activeFilterSection === section ? null : section);
  };

  // Close mobile menu and filters when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (showMobileMenu && !target.closest('.mobile-menu') && !target.closest('.menu-button')) {
        setShowMobileMenu(false);
      }
      if (showFilters && !target.closest('.filter-sidebar') && !target.closest('.filter-button')) {
        setShowFilters(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showMobileMenu, showFilters]);

  // Load initial data
  useEffect(() => {
    const loadInitialData = async () => {
      await Promise.all([
        fetchCategories(),
        fetchAllProducts()
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
  const formatPrice = (price: string | number) => {
    const amount = typeof price === 'string' ? parseFloat(price) : price;
    if (isNaN(amount)) return 'KES 0';
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES',
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

  // Mobile-friendly filter sidebar component
  const FilterSidebar = () => (
    <div className={`lg:w-80 filter-sidebar ${showFilters ? 'block fixed inset-0 z-50 bg-white overflow-y-auto lg:static lg:bg-transparent' : 'hidden lg:block'}`}>
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 lg:sticky lg:top-8">
        {/* Mobile header */}
        {showFilters && (
          <div className="flex items-center justify-between mb-6 lg:hidden">
            <h2 className="text-xl font-bold text-gray-900">Filters</h2>
            <button 
              onClick={() => setShowFilters(false)}
              className="p-2 rounded-lg hover:bg-gray-100"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        )}

        {/* View Mode Selector */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-3">View Mode</h3>
          <div className="grid grid-cols-3 gap-2">
            <button
              onClick={() => setViewMode('shops')}
              className={`p-3 rounded-lg border text-center transition-colors ${
                viewMode === 'shops' 
                  ? 'bg-blue-50 border-blue-200 text-blue-600' 
                  : 'border-gray-200 text-gray-600 hover:bg-gray-50'
              }`}
            >
              <Store className="w-5 h-5 mx-auto mb-1" />
              <span className="text-xs">Shops</span>
            </button>
            <button
              onClick={() => setViewMode('grid')}
              className={`p-3 rounded-lg border text-center transition-colors ${
                viewMode === 'grid' 
                  ? 'bg-blue-50 border-blue-200 text-blue-600' 
                  : 'border-gray-200 text-gray-600 hover:bg-gray-50'
              }`}
            >
              <Grid className="w-5 h-5 mx-auto mb-1" />
              <span className="text-xs">Grid</span>
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-3 rounded-lg border text-center transition-colors ${
                viewMode === 'list' 
                  ? 'bg-blue-50 border-blue-200 text-blue-600' 
                  : 'border-gray-200 text-gray-600 hover:bg-gray-50'
              }`}
            >
              <List className="w-5 h-5 mx-auto mb-1" />
              <span className="text-xs">List</span>
            </button>
          </div>
        </div>

        {/* Categories - Mobile Accordion */}
        <div className="mb-8">
          <button
            onClick={() => toggleFilterSection('categories')}
            className="flex items-center justify-between w-full text-left mb-4 lg:cursor-default"
          >
            <h3 className="text-lg font-semibold text-gray-900">Categories</h3>
            <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform lg:hidden ${
              activeFilterSection === 'categories' ? 'rotate-180' : ''
            }`} />
          </button>
          <div className={`${activeFilterSection === 'categories' || !showFilters ? 'block' : 'hidden lg:block'}`}>
            <div className="space-y-2">
              {allCategoriesWithCounts.length > 0 ? (
                allCategoriesWithCounts.map(category => (
                  <button
                    key={category.id}
                    onClick={() => handleCategoryChange(category.id.toString())}
                    className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${
                      selectedCategory === category.id.toString()
                        ? 'bg-blue-50 text-blue-600 font-medium'
                        : 'text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex justify-between items-center">
                      <span className="truncate">{category.name}</span>
                      <span className="text-sm text-gray-400 ml-2 flex-shrink-0">({category.count})</span>
                    </div>
                  </button>
                ))
              ) : (
                <div className="text-gray-500 text-sm py-2">
                  {categoriesLoading ? 'Loading categories...' : 'No categories available'}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Price Range - Mobile Accordion */}
        <div className="mb-8">
          <button
            onClick={() => toggleFilterSection('price')}
            className="flex items-center justify-between w-full text-left mb-4 lg:cursor-default"
          >
            <h3 className="text-lg font-semibold text-gray-900">Price Range (KES)</h3>
            <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform lg:hidden ${
              activeFilterSection === 'price' ? 'rotate-180' : ''
            }`} />
          </button>
          <div className={`${activeFilterSection === 'price' || !showFilters ? 'block' : 'hidden lg:block'}`}>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm text-gray-600 mb-1 block">Min</label>
                  <input
                    type="number"
                    placeholder="0"
                    value={priceRange[0]}
                    onChange={(e) => setPriceRange([parseInt(e.target.value) || 0, priceRange[1]])}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  />
                </div>
                <div>
                  <label className="text-sm text-gray-600 mb-1 block">Max</label>
                  <input
                    type="number"
                    placeholder="10000000"
                    value={priceRange[1]}
                    onChange={(e) => setPriceRange([priceRange[0], parseInt(e.target.value) || 10000000])}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  />
                </div>
              </div>
              <div className="text-sm text-gray-500 text-center">
                Range: {formatPrice(priceRange[0])} - {formatPrice(priceRange[1])}
              </div>
            </div>
          </div>
        </div>

        {/* Sort By */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Sort By</h3>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
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
          <button
            onClick={() => setShowFilters(false)}
            className="w-full py-3 bg-blue-600 text-white rounded-lg font-medium mt-6 lg:hidden"
          >
            Apply Filters
          </button>
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
        <div className={`relative overflow-hidden ${isGrid ? 'h-48 sm:h-64' : 'md:w-64 h-48 md:h-auto'}`}>
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

          <div className="absolute top-3 left-3 flex gap-1 flex-wrap">
            {product.featured && (
              <span className="bg-blue-600 text-white px-2 py-1 rounded-full text-xs font-medium">
                Featured
              </span>
            )}
            {product.originalPrice && (
              <span className="bg-red-500 text-white px-2 py-1 rounded-full text-xs font-medium">
                Sale
              </span>
            )}
            <span className="bg-green-600 text-white px-2 py-1 rounded-full text-xs font-medium">
              {product.category}
            </span>
          </div>
          <div className="absolute top-3 right-3 flex gap-1">
            <button 
              className="p-2 bg-white rounded-full shadow-sm hover:bg-gray-50 transition-colors"
              onClick={() => handleWishlist(product.id)}
              disabled={processingAction === `wishlist-${product.id}`}
            >
              {processingAction === `wishlist-${product.id}` ? (
                <Loader className="w-4 h-4 animate-spin text-gray-600" />
              ) : (
                <Heart className="w-4 h-4 text-gray-600" />
              )}
            </button>
            <button 
              className="p-2 bg-white rounded-full shadow-sm hover:bg-gray-50 transition-colors"
              onClick={() => handleViewDetails(product.id)}
              disabled={processingAction === `view-${product.id}`}
            >
              {processingAction === `view-${product.id}` ? (
                <Loader className="w-4 h-4 animate-spin text-gray-600" />
              ) : (
                <Eye className="w-4 h-4 text-gray-600" />
              )}
            </button>
          </div>
        </div>
        
        <div className={`p-4 sm:p-6 ${isGrid ? '' : 'flex-1'}`}>
          <div className={`${isGrid ? '' : 'flex flex-col lg:flex-row lg:items-center justify-between'}`}>
            <div className={isGrid ? '' : 'flex-1'}>
              <h3 className={`font-semibold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors line-clamp-2 ${
                isGrid ? 'text-base sm:text-lg' : 'text-lg sm:text-xl'
              }`}>
                {product.name}
              </h3>
              
              <div className="flex items-center gap-3 mb-3 text-sm text-gray-600 flex-wrap">
                <div className="flex items-center gap-1">
                  <MapPin className="w-3 h-3 sm:w-4 sm:h-4" />
                  <span className="truncate">{product.location}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Star className="w-3 h-3 sm:w-4 sm:h-4 text-yellow-400 fill-current" />
                  {product.rating} ({product.reviews})
                </div>
              </div>
              
              <div className="flex flex-wrap gap-1 mb-3">
                {product.tags?.slice(0, 3).map((tag, index) => (
                  <span
                    key={index}
                    className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full"
                  >
                    {tag}
                  </span>
                ))}
                {product.tags && product.tags.length > 3 && (
                  <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                    +{product.tags.length - 3}
                  </span>
                )}
              </div>
            </div>
            
            <div className={`flex items-center justify-between mb-4 ${isGrid ? '' : 'lg:flex-col lg:items-end lg:gap-3 mt-3 lg:mt-0'}`}>
              <div className={`flex items-center gap-2 ${isGrid ? '' : 'lg:text-right'}`}>
                <span className={`font-bold text-gray-900 ${isGrid ? 'text-lg sm:text-xl' : 'text-xl sm:text-2xl'}`}>
                  {formatPrice(product.price)}
                </span>
                {product.originalPrice && (
                  <span className={`text-gray-500 line-through ${isGrid ? 'text-sm' : 'text-base'}`}>
                    {formatPrice(product.originalPrice)}
                  </span>
                )}
              </div>
              <span className={`text-sm ${product.inStock ? 'text-green-600' : 'text-red-600'} ${
                isGrid ? '' : 'lg:self-end'
              }`}>
                {product.inStock ? 'In Stock' : 'Out of Stock'}
              </span>
            </div>
          </div>
          
          <button
            onClick={() => handlePurchaseProduct(product.id)}
            disabled={processingAction === `purchase-${product.id}` || !product.inStock}
            className={`w-full py-2 sm:py-3 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 text-sm sm:text-base ${
              product.inStock
                ? processingAction === `purchase-${product.id}`
                  ? 'bg-blue-400 cursor-not-allowed'
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
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white flex items-center justify-center">
        <div className="text-center p-6 bg-white rounded-lg shadow-sm max-w-md mx-auto">
          <h2 className="text-xl font-semibold text-red-600 mb-2">Error loading products</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white">
      {/* Mobile Menu Overlay */}
      {showMobileMenu && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden" onClick={() => setShowMobileMenu(false)} />
      )}

      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-1 sm:mb-2">
                  Discover Amazing Products
                </h1>
                <p className="text-gray-600 text-sm sm:text-base">Find unique items from sellers around the world</p>
              </div>
              
              {/* Mobile Menu Button */}
              <button 
                className="p-2 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 lg:hidden menu-button"
                onClick={() => setShowMobileMenu(!showMobileMenu)}
              >
                <Menu className="w-6 h-6" />
              </button>
            </div>
            
            {/* Search and View Controls */}
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1 min-w-0">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 sm:w-5 sm:h-5" />
                <input
                  type="text"
                  placeholder="Search products, shops..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 sm:pl-10 pr-4 py-2 sm:py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-sm sm:text-base"
                />
              </div>
              
              <div className="flex gap-2 justify-between sm:justify-start">
                <button
                  onClick={() => setViewMode('shops')}
                  className={`p-2 sm:p-3 rounded-lg border flex-1 sm:flex-none text-center ${
                    viewMode === 'shops' ? 'bg-blue-50 border-blue-200 text-blue-600' : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                  }`}
                  title="View by Shops"
                >
                  <Store className="w-4 h-4 sm:w-5 sm:h-5 mx-auto" />
                </button>
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 sm:p-3 rounded-lg border flex-1 sm:flex-none text-center ${
                    viewMode === 'grid' ? 'bg-blue-50 border-blue-200 text-blue-600' : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <Grid className="w-4 h-4 sm:w-5 sm:h-5 mx-auto" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 sm:p-3 rounded-lg border flex-1 sm:flex-none text-center ${
                    viewMode === 'list' ? 'bg-blue-50 border-blue-200 text-blue-600' : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <List className="w-4 h-4 sm:w-5 sm:h-5 mx-auto" />
                </button>
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className="p-2 sm:p-3 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 lg:hidden filter-button"
                >
                  <SlidersHorizontal className="w-4 h-4 sm:w-5 sm:h-5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {showMobileMenu && (
        <div className="fixed top-0 right-0 h-full w-64 bg-white shadow-xl z-50 lg:hidden mobile-menu transform transition-transform">
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900">Menu</h2>
              <button 
                onClick={() => setShowMobileMenu(false)}
                className="p-2 rounded-lg hover:bg-gray-100"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="space-y-4">
              <button className="w-full text-left p-3 rounded-lg bg-blue-50 text-blue-600 font-medium">
                Home
              </button>
              <button className="w-full text-left p-3 rounded-lg hover:bg-gray-50">
                My Account
              </button>
              <button className="w-full text-left p-3 rounded-lg hover:bg-gray-50">
                Wishlist
              </button>
              <button className="w-full text-left p-3 rounded-lg hover:bg-gray-50">
                Orders
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Sidebar */}
          <FilterSidebar />

          {/* Products/Shops Content */}
          <div className="flex-1 products-section">
            <div className="flex items-center justify-between mb-4 sm:mb-6">
              <p className="text-gray-600 text-sm sm:text-base">
                {viewMode === 'shops' ? (
                  <>Showing {shopGroups.length} shops with {formattedProducts.length} products</>
                ) : (
                  <>Showing {formattedProducts.length} of {allProducts.length} products</>
                )}
                {selectedCategory !== 'all' && (
                  <span className="ml-2 text-blue-600 font-medium">
                    in {allCategoriesWithCounts.find(cat => cat.id === selectedCategory)?.name || 'Selected Category'}
                  </span>
                )}
              </p>
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="text-sm text-gray-500 hover:text-gray-700 underline"
                >
                  Clear search
                </button>
              )}
            </div>

            {formattedProducts.length === 0 ? (
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
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors text-sm sm:text-base"
                >
                  Reset Filters
                </button>
              </div>
            ) : viewMode === 'shops' ? (
              /* Shops View - FIXED: One producer can have products in multiple categories */
              <div className="space-y-4 sm:space-y-6">
                {shopGroups.map(shop => (
                  <div key={shop.providerId} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                    {/* Shop Header */}
                    <div 
                      className="p-4 sm:p-6 cursor-pointer hover:bg-gray-50 transition-colors"
                      onClick={() => toggleShopExpansion(shop.providerId)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3 sm:gap-4">
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
                            <h3 className="text-lg sm:text-xl font-semibold text-gray-900 truncate">{shop.shopName}</h3>
                            <p className="text-gray-600 text-sm truncate">{shop.providerName}</p>
                            <div className="flex items-center gap-3 mt-1 text-xs sm:text-sm text-gray-500 flex-wrap">
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
                        <div className="flex items-center gap-3 sm:gap-4">
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
                      <div className="border-t border-gray-100 p-4 sm:p-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
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
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
                {formattedProducts.map(product => (
                  <ProductCard key={product.id} product={product} layout="grid" />
                ))}
              </div>
            ) : (
              /* List View */
              <div className="space-y-4">
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
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-20 text-center">
          <h2 className="text-2xl sm:text-4xl lg:text-6xl font-bold mb-4 sm:mb-6">
            Register to Purchase Products
          </h2>
          <h3 className="text-xl sm:text-2xl lg:text-3xl font-semibold mb-6 sm:mb-8 text-blue-100">
            From Our Verified Sellers
          </h3>
          <p className="text-base sm:text-xl text-blue-100 mb-8 sm:mb-10 max-w-3xl mx-auto">
            Create an account to access exclusive deals, track your orders, and connect with trusted sellers worldwide.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 justify-center">
            <button 
              className="bg-white text-blue-600 px-6 sm:px-10 py-3 sm:py-4 rounded-lg sm:rounded-xl text-base sm:text-lg font-bold hover:bg-gray-50 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
              onClick={() => handleRegisterRedirect('client')}
            >
              Register as Buyer
            </button>
            <button 
              className="border-2 border-white text-white px-6 sm:px-10 py-3 sm:py-4 rounded-lg sm:rounded-xl text-base sm:text-lg font-bold hover:bg-white hover:text-blue-600 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
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