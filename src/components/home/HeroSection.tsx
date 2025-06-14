import React from 'react';
import { Search } from 'lucide-react';
export const HeroSection = () => {
  return <section className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white py-16 lg:py-24">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">
            Find Services & Products in One Place
          </h1>
          <p className="text-xl mb-8 text-blue-100">
            Discover local service providers and unique products from sellers
            around the world.
          </p>
          <div className="bg-white rounded-lg p-2 flex items-center shadow-lg max-w-2xl mx-auto">
            <div className="flex-grow relative">
              <input type="text" placeholder="What are you looking for?" className="w-full px-4 py-3 text-gray-800 focus:outline-none" />
            </div>
            <div className="relative">
              <select className="appearance-none bg-transparent border-l border-gray-300 px-4 py-3 text-gray-500 focus:outline-none">
                <option value="services">Services</option>
                <option value="products">Products</option>
              </select>
            </div>
            <button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-md flex items-center">
              <Search size={20} className="mr-2" />
              Search
            </button>
          </div>
          <div className="mt-8 flex flex-wrap justify-center gap-4 text-sm">
            <span className="text-blue-100">Popular:</span>
            <a href="#" className="text-white hover:underline">
              Web Design
            </a>
            <a href="#" className="text-white hover:underline">
              Home Cleaning
            </a>
            <a href="#" className="text-white hover:underline">
              Electronics
            </a>
            <a href="#" className="text-white hover:underline">
              Handmade Crafts
            </a>
            <a href="#" className="text-white hover:underline">
              Tutoring
            </a>
          </div>
        </div>
      </div>
    </section>;
};