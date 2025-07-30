import React, { useState } from 'react';
import { Search, MapPin, Star, ShoppingBag, Wrench, ChevronRight } from 'lucide-react';

interface PopularItem {
  name: string;
  icon: string;
  rating: number;
  providers?: number;
  sellers?: number;
}

interface FeaturedItem {
  id: number;
  type: 'service' | 'product';
  title: string;
  provider?: string;
  seller?: string;
  location: string;
  rating: number;
  reviews: number;
  price: string;
  image: string;
  tags: string[];
}

const ServicesProductsComponent = () => {
  const [activeTab, setActiveTab] = useState<'services' | 'products'>('services');
  const [searchQuery, setSearchQuery] = useState('');

  const popularServices: PopularItem[] = [
    { name: 'Web Design', icon: '💻', rating: 4.8, providers: 245 },
    { name: 'Home Cleaning', icon: '🏠', rating: 4.9, providers: 189 },
    { name: 'Tutoring', icon: '📚', rating: 4.7, providers: 156 },
    { name: 'Photography', icon: '📸', rating: 4.8, providers: 134 },
    { name: 'Landscaping', icon: '🌿', rating: 4.6, providers: 98 },
    { name: 'Pet Care', icon: '🐕', rating: 4.9, providers: 87 }
  ];

  const popularProducts: PopularItem[] = [
    { name: 'Electronics', icon: '⚡', rating: 4.7, sellers: 1250 },
    { name: 'Handmade Crafts', icon: '🎨', rating: 4.8, sellers: 890 },
    { name: 'Home Decor', icon: '🏺', rating: 4.6, sellers: 645 },
    { name: 'Fashion', icon: '👕', rating: 4.7, sellers: 1100 },
    { name: 'Books', icon: '📖', rating: 4.8, sellers: 456 },
    { name: 'Sports & Outdoors', icon: '⚽', rating: 4.5, sellers: 567 }
  ];

  const featuredItems: FeaturedItem[] = [
    {
      id: 1,
      type: 'service',
      title: 'Professional Web Development',
      provider: 'TechCraft Solutions',
      location: 'New York, NY',
      rating: 4.9,
      reviews: 127,
      price: 'Starting at $299',
      image: 'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=400&h=300&auto=format&fit=crop',
      tags: ['Responsive', 'E-commerce', 'SEO']
    },
    {
      id: 2,
      type: 'product',
      title: 'Handcrafted Ceramic Vases',
      seller: 'Artisan Pottery Co.',
      location: 'Portland, OR',
      rating: 4.8,
      reviews: 89,
      price: '$45 - $120',
      image: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=300&auto=format&fit=crop',
      tags: ['Handmade', 'Eco-friendly', 'Custom']
    },
    {
      id: 3,
      type: 'service',
      title: 'Deep House Cleaning',
      provider: 'Sparkle Clean Pro',
      location: 'Los Angeles, CA',
      rating: 4.9,
      reviews: 203,
      price: '$80 - $150',
      image: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=400&h=300&auto=format&fit=crop',
      tags: ['Same Day', 'Eco Products', 'Insured']
    },
    {
      id: 4,
      type: 'product',
      title: 'Premium Gaming Headset',
      seller: 'AudioTech Store',
      location: 'Austin, TX',
      rating: 4.7,
      reviews: 156,
      price: '$129.99',
      image: 'https://images.unsplash.com/photo-1599669454699-248893623440?w=400&h=300&auto=format&fit=crop',
      tags: ['Wireless', '7.1 Surround', 'RGB']
    }
  ];

  const currentItems = activeTab === 'services' 
    ? featuredItems.filter(item => item.type === 'service')
    : featuredItems.filter(item => item.type === 'product');

  const currentPopular = activeTab === 'services' ? popularServices : popularProducts;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white">
      {/* Hero Section */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-20">
          <div className="text-center">
            <h1 className="text-4xl lg:text-6xl font-bold text-gray-900 mb-6">
              Find Services & Products
              <span className="block text-blue-600">in One Place</span>
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
              Discover local service providers and unique products from sellers around the world.
            </p>
            
            {/* Tab Navigation */}
            <div className="flex justify-center mb-8">
              <div className="bg-gray-100 p-1 rounded-lg inline-flex">
                <button
                  onClick={() => setActiveTab('services')}
                  className={`px-6 py-3 rounded-md font-medium transition-all duration-200 flex items-center gap-2 ${
                    activeTab === 'services'
                      ? 'bg-white text-blue-600 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <Wrench className="w-4 h-4" />
                  Services
                </button>
                <button
                  onClick={() => setActiveTab('products')}
                  className={`px-6 py-3 rounded-md font-medium transition-all duration-200 flex items-center gap-2 ${
                    activeTab === 'products'
                      ? 'bg-white text-blue-600 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <ShoppingBag className="w-4 h-4" />
                  Products
                </button>
              </div>
            </div>

            {/* Search Bar */}
            <div className="max-w-2xl mx-auto relative">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder={`Search ${activeTab}...`}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-lg shadow-sm"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Popular Categories */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Popular Categories</h2>
          <p className="text-gray-600">Browse trending {activeTab} in your area</p>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {currentPopular.map((item) => (
            <div
              key={`${item.name}-${item.icon}`}
              className="bg-white rounded-xl p-6 text-center hover:shadow-lg transition-all duration-300 cursor-pointer border border-gray-100 hover:border-blue-200 group"
            >
              <div className="text-3xl mb-3 group-hover:scale-110 transition-transform duration-300">
                {item.icon}
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">{item.name}</h3>
              <div className="flex items-center justify-center gap-1 mb-1">
                <Star className="w-4 h-4 text-yellow-400 fill-current" />
                <span className="text-sm text-gray-600">{item.rating}</span>
              </div>
              <p className="text-xs text-gray-500">
                {activeTab === 'services' ? item.providers : item.sellers} {activeTab === 'services' ? 'providers' : 'sellers'}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Featured Items */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Featured {activeTab === 'services' ? 'Services' : 'Products'}
            </h2>
            <p className="text-gray-600">Top-rated options just for you</p>
          </div>
          <button className="text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1">
            View All
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-2 gap-6">
          {currentItems.map((item) => (
            <div
              key={item.id}
              className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 border border-gray-100 hover:border-blue-200 group"
            >
              <div className="relative overflow-hidden">
                <img
                  src={item.image}
                  alt={item.title}
                  className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute top-4 left-4">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                    item.type === 'service' 
                      ? 'bg-blue-100 text-blue-800' 
                      : 'bg-green-100 text-green-800'
                  }`}>
                    {item.type === 'service' ? 'Service' : 'Product'}
                  </span>
                </div>
              </div>
              
              <div className="p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
                  {item.title}
                </h3>
                <p className="text-blue-600 font-medium mb-2">
                  {item.type === 'service' ? item.provider : item.seller}
                </p>
                
                <div className="flex items-center gap-4 mb-3 text-sm text-gray-600">
                  <div className="flex items-center gap-1">
                    <MapPin className="w-4 h-4" />
                    {item.location}
                  </div>
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 text-yellow-400 fill-current" />
                    {item.rating} ({item.reviews})
                  </div>
                </div>
                
                <div className="flex flex-wrap gap-2 mb-4">
                  {item.tags.map((tag) => (
                    <span
                      key={tag}
                      className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-lg font-bold text-gray-900">
                    {item.price}
                  </span>
                  <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors">
                    {item.type === 'service' ? 'Book Now' : 'View Details'}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Register Section */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
          <h2 className="text-4xl lg:text-6xl font-bold mb-6">
            Register to View and Request Services
          </h2>
          <h3 className="text-2xl lg:text-3xl font-semibold mb-8 text-blue-100">
            From Our Service Providers
          </h3>
          <p className="text-xl text-blue-100 mb-10 max-w-3xl mx-auto">
            Join our platform to connect with verified service providers and access exclusive products from trusted sellers worldwide.
          </p>
          <div className="flex flex-col sm:flex-row gap-6 justify-center">
            <button className="bg-white text-blue-600 px-10 py-4 rounded-xl text-lg font-bold hover:bg-gray-50 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1">
              Register as Customer
            </button>
            <button className="border-2 border-white text-white px-10 py-4 rounded-xl text-lg font-bold hover:bg-white hover:text-blue-600 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1">
              Register as Provider
            </button>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-blue-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
          <h2 className="text-3xl font-bold mb-4">
            Ready to Get Started?
          </h2>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            Join thousands of satisfied customers who found exactly what they needed.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-50 transition-colors">
              Browse Services
            </button>
            <button className="border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-blue-600 transition-colors">
              Shop Products
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ServicesProductsComponent;