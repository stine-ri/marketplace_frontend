import React, { useState } from 'react';
import { Star, MapPin, Clock, Package, ShoppingBag } from 'lucide-react';
export const FeaturedSection = () => {
  const [activeTab, setActiveTab] = useState('services');
  return <section className="py-12 lg:py-16 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold mb-2">Featured Listings</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Discover our top-rated services and products from trusted providers
            and sellers
          </p>
          <div className="flex justify-center mt-6">
            <div className="flex border border-gray-200 rounded-lg overflow-hidden">
              <button className={`px-6 py-2 font-medium ${activeTab === 'services' ? 'bg-blue-600 text-white' : 'bg-white text-gray-600'}`} onClick={() => setActiveTab('services')}>
                Services
              </button>
              <button className={`px-6 py-2 font-medium ${activeTab === 'products' ? 'bg-blue-600 text-white' : 'bg-white text-gray-600'}`} onClick={() => setActiveTab('products')}>
                Products
              </button>
            </div>
          </div>
        </div>
        {activeTab === 'services' ? <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {/* Service Card 1 */}
            <div className="bg-white rounded-lg overflow-hidden shadow-md border border-gray-100 transition-transform hover:-translate-y-1 hover:shadow-lg">
              <div className="relative">
                <img src="https://images.unsplash.com/photo-1581578731548-c64695cc6952?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80" alt="Web Development" className="w-full h-48 object-cover" />
                <div className="absolute top-2 right-2 bg-blue-600 text-white text-xs font-bold px-2 py-1 rounded">
                  Featured
                </div>
              </div>
              <div className="p-5">
                <div className="flex items-center mb-3">
                  <img src="https://randomuser.me/api/portraits/men/32.jpg" alt="Provider" className="w-10 h-10 rounded-full mr-3" />
                  <div>
                    <h4 className="font-medium">Alex Morgan</h4>
                    <div className="flex items-center text-yellow-500 text-sm">
                      <Star size={14} fill="currentColor" />
                      <Star size={14} fill="currentColor" />
                      <Star size={14} fill="currentColor" />
                      <Star size={14} fill="currentColor" />
                      <Star size={14} fill="currentColor" />
                      <span className="text-gray-600 ml-1">(47)</span>
                    </div>
                  </div>
                </div>
                <h3 className="text-lg font-bold mb-2">
                  Web Development & Design
                </h3>
                <p className="text-gray-600 text-sm mb-3">
                  Professional website development with responsive design and
                  SEO optimization.
                </p>
                <div className="flex items-center text-gray-500 text-sm mb-3">
                  <MapPin size={14} className="mr-1" />
                  <span>Remote</span>
                  <Clock size={14} className="ml-3 mr-1" />
                  <span>From 3 days</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-blue-600 font-bold">From $299</span>
                  <button className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700">
                    View Details
                  </button>
                </div>
              </div>
            </div>
            {/* Service Card 2 */}
            <div className="bg-white rounded-lg overflow-hidden shadow-md border border-gray-100 transition-transform hover:-translate-y-1 hover:shadow-lg">
              <div className="relative">
                <img src="https://images.unsplash.com/photo-1581578731548-c64695cc6952?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80" alt="Home Cleaning" className="w-full h-48 object-cover" />
              </div>
              <div className="p-5">
                <div className="flex items-center mb-3">
                  <img src="https://randomuser.me/api/portraits/women/44.jpg" alt="Provider" className="w-10 h-10 rounded-full mr-3" />
                  <div>
                    <h4 className="font-medium">Sarah Johnson</h4>
                    <div className="flex items-center text-yellow-500 text-sm">
                      <Star size={14} fill="currentColor" />
                      <Star size={14} fill="currentColor" />
                      <Star size={14} fill="currentColor" />
                      <Star size={14} fill="currentColor" />
                      <Star size={14} className="text-gray-300" />
                      <span className="text-gray-600 ml-1">(32)</span>
                    </div>
                  </div>
                </div>
                <h3 className="text-lg font-bold mb-2">
                  Home Cleaning Service
                </h3>
                <p className="text-gray-600 text-sm mb-3">
                  Professional home cleaning service with eco-friendly products
                  and attention to detail.
                </p>
                <div className="flex items-center text-gray-500 text-sm mb-3">
                  <MapPin size={14} className="mr-1" />
                  <span>Local</span>
                  <Clock size={14} className="ml-3 mr-1" />
                  <span>Same day</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-blue-600 font-bold">$25/hour</span>
                  <button className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700">
                    View Details
                  </button>
                </div>
              </div>
            </div>
            {/* Service Card 3 */}
            <div className="bg-white rounded-lg overflow-hidden shadow-md border border-gray-100 transition-transform hover:-translate-y-1 hover:shadow-lg">
              <div className="relative">
                <img src="https://images.unsplash.com/photo-1581578731548-c64695cc6952?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80" alt="Graphic Design" className="w-full h-48 object-cover" />
              </div>
              <div className="p-5">
                <div className="flex items-center mb-3">
                  <img src="https://randomuser.me/api/portraits/women/68.jpg" alt="Provider" className="w-10 h-10 rounded-full mr-3" />
                  <div>
                    <h4 className="font-medium">Emma Wilson</h4>
                    <div className="flex items-center text-yellow-500 text-sm">
                      <Star size={14} fill="currentColor" />
                      <Star size={14} fill="currentColor" />
                      <Star size={14} fill="currentColor" />
                      <Star size={14} fill="currentColor" />
                      <Star size={14} fill="currentColor" />
                      <span className="text-gray-600 ml-1">(56)</span>
                    </div>
                  </div>
                </div>
                <h3 className="text-lg font-bold mb-2">Graphic Design</h3>
                <p className="text-gray-600 text-sm mb-3">
                  Creative graphic design services including logos, branding,
                  and marketing materials.
                </p>
                <div className="flex items-center text-gray-500 text-sm mb-3">
                  <MapPin size={14} className="mr-1" />
                  <span>Remote</span>
                  <Clock size={14} className="ml-3 mr-1" />
                  <span>From 2 days</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-blue-600 font-bold">From $150</span>
                  <button className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700">
                    View Details
                  </button>
                </div>
              </div>
            </div>
            {/* Service Card 4 */}
            <div className="bg-white rounded-lg overflow-hidden shadow-md border border-gray-100 transition-transform hover:-translate-y-1 hover:shadow-lg">
              <div className="relative">
                <img src="https://images.unsplash.com/photo-1581578731548-c64695cc6952?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80" alt="Tutoring" className="w-full h-48 object-cover" />
              </div>
              <div className="p-5">
                <div className="flex items-center mb-3">
                  <img src="https://randomuser.me/api/portraits/men/75.jpg" alt="Provider" className="w-10 h-10 rounded-full mr-3" />
                  <div>
                    <h4 className="font-medium">David Chen</h4>
                    <div className="flex items-center text-yellow-500 text-sm">
                      <Star size={14} fill="currentColor" />
                      <Star size={14} fill="currentColor" />
                      <Star size={14} fill="currentColor" />
                      <Star size={14} fill="currentColor" />
                      <Star size={14} className="text-gray-300" />
                      <span className="text-gray-600 ml-1">(28)</span>
                    </div>
                  </div>
                </div>
                <h3 className="text-lg font-bold mb-2">
                  Math & Science Tutoring
                </h3>
                <p className="text-gray-600 text-sm mb-3">
                  Expert tutoring in mathematics, physics, and chemistry for
                  high school and college students.
                </p>
                <div className="flex items-center text-gray-500 text-sm mb-3">
                  <MapPin size={14} className="mr-1" />
                  <span>Online / In-person</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-blue-600 font-bold">$40/hour</span>
                  <button className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700">
                    View Details
                  </button>
                </div>
              </div>
            </div>
          </div> : <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {/* Product Card 1 */}
            <div className="bg-white rounded-lg overflow-hidden shadow-md border border-gray-100 transition-transform hover:-translate-y-1 hover:shadow-lg">
              <div className="relative">
                <img src="https://images.unsplash.com/photo-1581578731548-c64695cc6952?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80" alt="Wireless Headphones" className="w-full h-48 object-cover" />
                <div className="absolute top-2 right-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded">
                  20% OFF
                </div>
              </div>
              <div className="p-5">
                <div className="flex items-center mb-3">
                  <Package size={16} className="text-blue-600 mr-2" />
                  <span className="text-sm text-gray-600">Electronics</span>
                </div>
                <h3 className="text-lg font-bold mb-2">
                  Premium Wireless Headphones
                </h3>
                <p className="text-gray-600 text-sm mb-3">
                  Noise-cancelling wireless headphones with 30-hour battery
                  life.
                </p>
                <div className="flex items-center text-yellow-500 mb-3">
                  <Star size={14} fill="currentColor" />
                  <Star size={14} fill="currentColor" />
                  <Star size={14} fill="currentColor" />
                  <Star size={14} fill="currentColor" />
                  <Star size={14} className="text-gray-300" />
                  <span className="text-gray-600 ml-1 text-sm">(42)</span>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-gray-400 line-through text-sm">
                      $249
                    </span>
                    <span className="text-blue-600 font-bold ml-2">$199</span>
                  </div>
                  <button className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 flex items-center">
                    <ShoppingBag size={14} className="mr-1" />
                    Add to Cart
                  </button>
                </div>
              </div>
            </div>
            {/* Product Card 2 */}
            <div className="bg-white rounded-lg overflow-hidden shadow-md border border-gray-100 transition-transform hover:-translate-y-1 hover:shadow-lg">
              <div className="relative">
                <img src="https://images.unsplash.com/photo-1581578731548-c64695cc6952?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80" alt="Handmade Ceramic Mug" className="w-full h-48 object-cover" />
              </div>
              <div className="p-5">
                <div className="flex items-center mb-3">
                  <Package size={16} className="text-blue-600 mr-2" />
                  <span className="text-sm text-gray-600">Handmade Crafts</span>
                </div>
                <h3 className="text-lg font-bold mb-2">
                  Handmade Ceramic Mug Set
                </h3>
                <p className="text-gray-600 text-sm mb-3">
                  Set of 4 artisan ceramic mugs, each uniquely designed and
                  glazed.
                </p>
                <div className="flex items-center text-yellow-500 mb-3">
                  <Star size={14} fill="currentColor" />
                  <Star size={14} fill="currentColor" />
                  <Star size={14} fill="currentColor" />
                  <Star size={14} fill="currentColor" />
                  <Star size={14} fill="currentColor" />
                  <span className="text-gray-600 ml-1 text-sm">(19)</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-blue-600 font-bold">$65</span>
                  <button className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 flex items-center">
                    <ShoppingBag size={14} className="mr-1" />
                    Add to Cart
                  </button>
                </div>
              </div>
            </div>
            {/* Product Card 3 */}
            <div className="bg-white rounded-lg overflow-hidden shadow-md border border-gray-100 transition-transform hover:-translate-y-1 hover:shadow-lg">
              <div className="relative">
                <img src="https://images.unsplash.com/photo-1581578731548-c64695cc6952?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80" alt="Smart Watch" className="w-full h-48 object-cover" />
                <div className="absolute top-2 right-2 bg-green-500 text-white text-xs font-bold px-2 py-1 rounded">
                  New Arrival
                </div>
              </div>
              <div className="p-5">
                <div className="flex items-center mb-3">
                  <Package size={16} className="text-blue-600 mr-2" />
                  <span className="text-sm text-gray-600">Electronics</span>
                </div>
                <h3 className="text-lg font-bold mb-2">Smart Fitness Watch</h3>
                <p className="text-gray-600 text-sm mb-3">
                  Advanced fitness tracking with heart rate monitor and GPS.
                </p>
                <div className="flex items-center text-yellow-500 mb-3">
                  <Star size={14} fill="currentColor" />
                  <Star size={14} fill="currentColor" />
                  <Star size={14} fill="currentColor" />
                  <Star size={14} fill="currentColor" />
                  <Star size={14} className="text-gray-300" />
                  <span className="text-gray-600 ml-1 text-sm">(37)</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-blue-600 font-bold">$179</span>
                  <button className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 flex items-center">
                    <ShoppingBag size={14} className="mr-1" />
                    Add to Cart
                  </button>
                </div>
              </div>
            </div>
            {/* Product Card 4 */}
            <div className="bg-white rounded-lg overflow-hidden shadow-md border border-gray-100 transition-transform hover:-translate-y-1 hover:shadow-lg">
              <div className="relative">
                <img src="https://images.unsplash.com/photo-1581578731548-c64695cc6952?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80" alt="Leather Wallet" className="w-full h-48 object-cover" />
              </div>
              <div className="p-5">
                <div className="flex items-center mb-3">
                  <Package size={16} className="text-blue-600 mr-2" />
                  <span className="text-sm text-gray-600">Fashion</span>
                </div>
                <h3 className="text-lg font-bold mb-2">
                  Handcrafted Leather Wallet
                </h3>
                <p className="text-gray-600 text-sm mb-3">
                  Premium full-grain leather wallet with RFID blocking
                  technology.
                </p>
                <div className="flex items-center text-yellow-500 mb-3">
                  <Star size={14} fill="currentColor" />
                  <Star size={14} fill="currentColor" />
                  <Star size={14} fill="currentColor" />
                  <Star size={14} fill="currentColor" />
                  <Star size={14} fill="currentColor" />
                  <span className="text-gray-600 ml-1 text-sm">(24)</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-blue-600 font-bold">$49</span>
                  <button className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 flex items-center">
                    <ShoppingBag size={14} className="mr-1" />
                    Add to Cart
                  </button>
                </div>
              </div>
            </div>
          </div>}
        <div className="text-center mt-10">
          <button className="px-6 py-3 bg-white text-blue-600 border border-blue-600 rounded-md hover:bg-blue-50 font-medium">
            View All {activeTab === 'services' ? 'Services' : 'Products'}
          </button>
        </div>
      </div>
    </section>;
};