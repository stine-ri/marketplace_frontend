import React from 'react';
import { Briefcase, Home, Paintbrush, Wrench, GraduationCap, Car, ShoppingBag, Monitor, Shirt, Gift } from 'lucide-react';
export const CategorySection = () => {
  return <section className="py-12 lg:py-16 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold mb-2">Browse by Category</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Find exactly what you need from our wide range of services and
            products
          </p>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {/* Service Categories */}
          <div className="bg-blue-50 rounded-lg p-5 text-center transition-transform hover:-translate-y-1 hover:shadow-md">
            <div className="bg-blue-100 w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4">
              <Briefcase size={24} className="text-blue-600" />
            </div>
            <h3 className="font-medium mb-1">Business</h3>
            <p className="text-sm text-gray-600">Marketing, Legal, Finance</p>
          </div>
          <div className="bg-green-50 rounded-lg p-5 text-center transition-transform hover:-translate-y-1 hover:shadow-md">
            <div className="bg-green-100 w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4">
              <Home size={24} className="text-green-600" />
            </div>
            <h3 className="font-medium mb-1">Home</h3>
            <p className="text-sm text-gray-600">
              Cleaning, Repairs, Gardening
            </p>
          </div>
          <div className="bg-purple-50 rounded-lg p-5 text-center transition-transform hover:-translate-y-1 hover:shadow-md">
            <div className="bg-purple-100 w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4">
              <Paintbrush size={24} className="text-purple-600" />
            </div>
            <h3 className="font-medium mb-1">Creative</h3>
            <p className="text-sm text-gray-600">
              Design, Writing, Photography
            </p>
          </div>
          <div className="bg-orange-50 rounded-lg p-5 text-center transition-transform hover:-translate-y-1 hover:shadow-md">
            <div className="bg-orange-100 w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4">
              <Wrench size={24} className="text-orange-600" />
            </div>
            <h3 className="font-medium mb-1">Technical</h3>
            <p className="text-sm text-gray-600">IT Support, Development</p>
          </div>
          <div className="bg-red-50 rounded-lg p-5 text-center transition-transform hover:-translate-y-1 hover:shadow-md">
            <div className="bg-red-100 w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4">
              <GraduationCap size={24} className="text-red-600" />
            </div>
            <h3 className="font-medium mb-1">Education</h3>
            <p className="text-sm text-gray-600">
              Tutoring, Coaching, Training
            </p>
          </div>
          {/* Product Categories */}
          <div className="bg-yellow-50 rounded-lg p-5 text-center transition-transform hover:-translate-y-1 hover:shadow-md">
            <div className="bg-yellow-100 w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4">
              <Monitor size={24} className="text-yellow-600" />
            </div>
            <h3 className="font-medium mb-1">Electronics</h3>
            <p className="text-sm text-gray-600">Gadgets, Computers, Audio</p>
          </div>
          <div className="bg-pink-50 rounded-lg p-5 text-center transition-transform hover:-translate-y-1 hover:shadow-md">
            <div className="bg-pink-100 w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4">
              <Shirt size={24} className="text-pink-600" />
            </div>
            <h3 className="font-medium mb-1">Fashion</h3>
            <p className="text-sm text-gray-600">
              Clothing, Accessories, Shoes
            </p>
          </div>
          <div className="bg-indigo-50 rounded-lg p-5 text-center transition-transform hover:-translate-y-1 hover:shadow-md">
            <div className="bg-indigo-100 w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4">
              <Gift size={24} className="text-indigo-600" />
            </div>
            <h3 className="font-medium mb-1">Handmade</h3>
            <p className="text-sm text-gray-600">Crafts, Art, Jewelry</p>
          </div>
          <div className="bg-cyan-50 rounded-lg p-5 text-center transition-transform hover:-translate-y-1 hover:shadow-md">
            <div className="bg-cyan-100 w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4">
              <Car size={24} className="text-cyan-600" />
            </div>
            <h3 className="font-medium mb-1">Automotive</h3>
            <p className="text-sm text-gray-600">Parts, Accessories, Tools</p>
          </div>
          <div className="bg-emerald-50 rounded-lg p-5 text-center transition-transform hover:-translate-y-1 hover:shadow-md">
            <div className="bg-emerald-100 w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4">
              <ShoppingBag size={24} className="text-emerald-600" />
            </div>
            <h3 className="font-medium mb-1">All Categories</h3>
            <p className="text-sm text-gray-600">Browse everything</p>
          </div>
        </div>
      </div>
    </section>;
};