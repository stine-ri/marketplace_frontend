import React, { useState } from 'react';
import { Search, Filter, Grid, List, Star, Heart, ShoppingCart, MapPin, Eye, ChevronDown, SlidersHorizontal } from 'lucide-react';

const ProductsComponent = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [viewMode, setViewMode] = useState('grid');
  const [showFilters, setShowFilters] = useState(false);
  const [priceRange, setPriceRange] = useState([0, 1000]);
  const [sortBy, setSortBy] = useState('popular');

  const categories = [
    { id: 'all', name: 'All Products', count: 2840 },
    { id: 'electronics', name: 'Electronics', count: 456 },
    { id: 'fashion', name: 'Fashion', count: 678 },
    { id: 'home', name: 'Home & Garden', count: 389 },
    { id: 'crafts', name: 'Handmade Crafts', count: 234 },
    { id: 'books', name: 'Books', count: 567 },
    { id: 'sports', name: 'Sports & Outdoors', count: 345 },
    { id: 'beauty', name: 'Beauty & Health', count: 289 }
  ];

  const products = [
    {
      id: 1,
      title: 'Premium Wireless Headphones',
      seller: 'AudioTech Store',
      location: 'San Francisco, CA',
      price: 199.99,
      originalPrice: 249.99,
      rating: 4.8,
      reviews: 127,
      image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=400&auto=format&fit=crop',
      category: 'electronics',
      tags: ['Wireless', 'Noise Cancelling', 'Premium'],
      inStock: true,
      shipping: 'Free shipping',
      featured: true
    },
    {
      id: 2,
      title: 'Handcrafted Ceramic Vase Set',
      seller: 'Artisan Pottery Co.',
      location: 'Portland, OR',
      price: 89.99,
      originalPrice: null,
      rating: 4.9,
      reviews: 89,
      image: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=400&auto=format&fit=crop',
      category: 'crafts',
      tags: ['Handmade', 'Eco-friendly', 'Unique'],
      inStock: true,
      shipping: '$5.99 shipping',
      featured: false
    },
    {
      id: 3,
      title: 'Organic Cotton T-Shirt',
      seller: 'EcoWear Fashion',
      location: 'Austin, TX',
      price: 29.99,
      originalPrice: 39.99,
      rating: 4.6,
      reviews: 203,
      image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400&h=400&auto=format&fit=crop',
      category: 'fashion',
      tags: ['Organic', 'Sustainable', 'Comfortable'],
      inStock: true,
      shipping: 'Free shipping over $25',
      featured: true
    },
    {
      id: 4,
      title: 'Smart Home Security Camera',
      seller: 'SecureTech Solutions',
      location: 'Seattle, WA',
      price: 149.99,
      originalPrice: 199.99,
      rating: 4.7,
      reviews: 156,
      image: 'https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=400&h=400&auto=format&fit=crop',
      category: 'electronics',
      tags: ['Smart', 'HD Video', 'Night Vision'],
      inStock: true,
      shipping: 'Free shipping',
      featured: false
    },
    {
      id: 5,
      title: 'Vintage Leather Journal',
      seller: 'Craftsman Books',
      location: 'Boston, MA',
      price: 45.99,
      originalPrice: null,
      rating: 4.8,
      reviews: 92,
      image: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=400&h=400&auto=format&fit=crop',
      category: 'books',
      tags: ['Vintage', 'Leather', 'Handbound'],
      inStock: true,
      shipping: '$3.99 shipping',
      featured: false
    },
    {
      id: 6,
      title: 'Modern Plant Pot Collection',
      seller: 'Urban Garden Co.',
      location: 'Denver, CO',
      price: 34.99,
      originalPrice: 49.99,
      rating: 4.5,
      reviews: 78,
      image: 'https://images.unsplash.com/photo-1485955900006-10f4d324d411?w=400&h=400&auto=format&fit=crop',
      category: 'home',
      tags: ['Modern', 'Ceramic', 'Set of 3'],
      inStock: false,
      shipping: 'Free shipping',
      featured: true
    }
  ];

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         product.seller.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory;
    const matchesPrice = product.price >= priceRange[0] && product.price <= priceRange[1];
    
    return matchesSearch && matchesCategory && matchesPrice;
  });

  const sortedProducts = filteredProducts.sort((a, b) => {
    switch (sortBy) {
      case 'price-low':
        return a.price - b.price;
      case 'price-high':
        return b.price - a.price;
      case 'rating':
        return b.rating - a.rating;
      case 'newest':
        return b.id - a.id;
      default:
        return b.featured ? 1 : -1;
    }
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div>
              <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-2">
                Discover Amazing Products
              </h1>
              <p className="text-gray-600">Find unique items from sellers around the world</p>
            </div>
            
            {/* Search and View Controls */}
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1 min-w-80">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search products..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                />
              </div>
              
              <div className="flex gap-2">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-3 rounded-lg border ${viewMode === 'grid' ? 'bg-blue-50 border-blue-200 text-blue-600' : 'border-gray-200 text-gray-600 hover:bg-gray-50'}`}
                >
                  <Grid className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-3 rounded-lg border ${viewMode === 'list' ? 'bg-blue-50 border-blue-200 text-blue-600' : 'border-gray-200 text-gray-600 hover:bg-gray-50'}`}
                >
                  <List className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className="p-3 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 lg:hidden"
                >
                  <SlidersHorizontal className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar */}
          <div className={`lg:w-80 ${showFilters ? 'block' : 'hidden lg:block'}`}>
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 sticky top-8">
              {/* Categories */}
              <div className="mb-8">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Categories</h3>
                <div className="space-y-2">
                  {categories.map(category => (
                    <button
                      key={category.id}
                      onClick={() => setSelectedCategory(category.id)}
                      className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${
                        selectedCategory === category.id
                          ? 'bg-blue-50 text-blue-600 font-medium'
                          : 'text-gray-600 hover:bg-gray-50'
                      }`}
                    >
                      <div className="flex justify-between items-center">
                        <span>{category.name}</span>
                        <span className="text-sm text-gray-400">({category.count})</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Price Range */}
              <div className="mb-8">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Price Range</h3>
                <div className="space-y-4">
                  <div className="flex items-center gap-4">
                    <input
                      type="number"
                      placeholder="Min"
                      value={priceRange[0]}
                      onChange={(e) => setPriceRange([parseInt(e.target.value) || 0, priceRange[1]])}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                    />
                    <span className="text-gray-400">to</span>
                    <input
                      type="number"
                      placeholder="Max"
                      value={priceRange[1]}
                      onChange={(e) => setPriceRange([priceRange[0], parseInt(e.target.value) || 1000])}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                    />
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
            </div>
          </div>

          {/* Products Grid/List */}
          <div className="flex-1">
            <div className="flex items-center justify-between mb-6">
              <p className="text-gray-600">
                Showing {sortedProducts.length} of {products.length} products
              </p>
            </div>

            {viewMode === 'grid' ? (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {sortedProducts.map(product => (
                  <div
                    key={product.id}
                    className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 border border-gray-100 group"
                  >
                    <div className="relative overflow-hidden">
                      <img
                        src={product.image}
                        alt={product.title}
                        className="w-full h-64 object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute top-4 left-4 flex gap-2">
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
                      </div>
                      <div className="absolute top-4 right-4 flex gap-2">
                        <button className="p-2 bg-white rounded-full shadow-sm hover:bg-gray-50 transition-colors">
                          <Heart className="w-4 h-4 text-gray-600" />
                        </button>
                        <button className="p-2 bg-white rounded-full shadow-sm hover:bg-gray-50 transition-colors">
                          <Eye className="w-4 h-4 text-gray-600" />
                        </button>
                      </div>
                    </div>
                    
                    <div className="p-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors line-clamp-2">
                        {product.title}
                      </h3>
                      <p className="text-blue-600 font-medium mb-2">{product.seller}</p>
                      
                      <div className="flex items-center gap-4 mb-3 text-sm text-gray-600">
                        <div className="flex items-center gap-1">
                          <MapPin className="w-4 h-4" />
                          {product.location}
                        </div>
                        <div className="flex items-center gap-1">
                          <Star className="w-4 h-4 text-yellow-400 fill-current" />
                          {product.rating} ({product.reviews})
                        </div>
                      </div>
                      
                      <div className="flex flex-wrap gap-1 mb-4">
                        {product.tags.map((tag, index) => (
                          <span
                            key={index}
                            className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                      
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                          <span className="text-xl font-bold text-gray-900">
                            ${product.price}
                          </span>
                          {product.originalPrice && (
                            <span className="text-sm text-gray-500 line-through">
                              ${product.originalPrice}
                            </span>
                          )}
                        </div>
                        <span className={`text-sm ${product.inStock ? 'text-green-600' : 'text-red-600'}`}>
                          {product.inStock ? 'In Stock' : 'Out of Stock'}
                        </span>
                      </div>
                      
                      <p className="text-sm text-gray-500 mb-4">{product.shipping}</p>
                      
                      <button
                        disabled={!product.inStock}
                        className={`w-full py-3 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 ${
                          product.inStock
                            ? 'bg-blue-600 hover:bg-blue-700 text-white'
                            : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                        }`}
                      >
                        <ShoppingCart className="w-4 h-4" />
                        {product.inStock ? 'Add to Cart' : 'Out of Stock'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                {sortedProducts.map(product => (
                  <div
                    key={product.id}
                    className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 border border-gray-100"
                  >
                    <div className="flex flex-col md:flex-row">
                      <div className="relative md:w-64 h-48 md:h-auto overflow-hidden">
                        <img
                          src={product.image}
                          alt={product.title}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute top-4 left-4 flex gap-2">
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
                        </div>
                      </div>
                      
                      <div className="flex-1 p-6">
                        <div className="flex flex-col lg:flex-row lg:items-center justify-between">
                          <div className="flex-1">
                            <h3 className="text-xl font-semibold text-gray-900 mb-2 hover:text-blue-600 transition-colors">
                              {product.title}
                            </h3>
                            <p className="text-blue-600 font-medium mb-2">{product.seller}</p>
                            
                            <div className="flex items-center gap-4 mb-3 text-sm text-gray-600">
                              <div className="flex items-center gap-1">
                                <MapPin className="w-4 h-4" />
                                {product.location}
                              </div>
                              <div className="flex items-center gap-1">
                                <Star className="w-4 h-4 text-yellow-400 fill-current" />
                                {product.rating} ({product.reviews})
                              </div>
                            </div>
                            
                            <div className="flex flex-wrap gap-1 mb-4">
                              {product.tags.map((tag, index) => (
                                <span
                                  key={index}
                                  className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full"
                                >
                                  {tag}
                                </span>
                              ))}
                            </div>
                            
                            <p className="text-sm text-gray-500">{product.shipping}</p>
                          </div>
                          
                          <div className="flex flex-col items-end gap-4 mt-4 lg:mt-0">
                            <div className="text-right">
                              <div className="flex items-center gap-2">
                                <span className="text-2xl font-bold text-gray-900">
                                  ${product.price}
                                </span>
                                {product.originalPrice && (
                                  <span className="text-lg text-gray-500 line-through">
                                    ${product.originalPrice}
                                  </span>
                                )}
                              </div>
                              <span className={`text-sm ${product.inStock ? 'text-green-600' : 'text-red-600'}`}>
                                {product.inStock ? 'In Stock' : 'Out of Stock'}
                              </span>
                            </div>
                            
                            <div className="flex gap-2">
                              <button className="p-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                                <Heart className="w-5 h-5 text-gray-600" />
                              </button>
                              <button className="p-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                                <Eye className="w-5 h-5 text-gray-600" />
                              </button>
                              <button
                                disabled={!product.inStock}
                                className={`px-6 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 ${
                                  product.inStock
                                    ? 'bg-blue-600 hover:bg-blue-700 text-white'
                                    : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                }`}
                              >
                                <ShoppingCart className="w-4 h-4" />
                                {product.inStock ? 'Add to Cart' : 'Out of Stock'}
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Register Section */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
          <h2 className="text-4xl lg:text-6xl font-bold mb-6">
            Register to Purchase Products
          </h2>
          <h3 className="text-2xl lg:text-3xl font-semibold mb-8 text-blue-100">
            From Our Verified Sellers
          </h3>
          <p className="text-xl text-blue-100 mb-10 max-w-3xl mx-auto">
            Create an account to access exclusive deals, track your orders, and connect with trusted sellers worldwide.
          </p>
          <div className="flex flex-col sm:flex-row gap-6 justify-center">
            <button className="bg-white text-blue-600 px-10 py-4 rounded-xl text-lg font-bold hover:bg-gray-50 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1">
              Register as Buyer
            </button>
            <button className="border-2 border-white text-white px-10 py-4 rounded-xl text-lg font-bold hover:bg-white hover:text-blue-600 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1">
              Register as Seller
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductsComponent;