import React from 'react';
import { ArrowRight, Briefcase, ShoppingBag } from 'lucide-react';

export const CtaSection = () => {
  const handleServiceProviderClick = () => {
    // Redirect to service provider registration
    window.location.href = '/register?type=service-provider';
  };

  const handleSellerClick = () => {
    // Redirect to seller registration
    window.location.href = '/register?type=seller';
  };

  return (
    <section className="py-12 lg:py-16 bg-gradient-to-r from-blue-600 to-indigo-700 text-white">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-white bg-opacity-10 rounded-lg p-8 backdrop-blur-sm">
            <div className="bg-blue-500 w-16 h-16 rounded-lg flex items-center justify-center mb-6">
              <Briefcase size={32} className="text-white" />
            </div>
            <h3 className="text-2xl font-bold mb-4">
              Become a Service Provider
            </h3>
            <p className="mb-6 text-blue-100">
              Share your skills and expertise with thousands of potential
              clients. Register to get available requests and start earning.
            </p>
            <ul className="mb-8 space-y-2">
              <li className="flex items-center">
                <div className="w-5 h-5 rounded-full bg-blue-400 mr-3 flex items-center justify-center">
                  <span className="text-xs">✓</span>
                </div>
                <span>Create a professional profile</span>
              </li>
              <li className="flex items-center">
                <div className="w-5 h-5 rounded-full bg-blue-400 mr-3 flex items-center justify-center">
                  <span className="text-xs">✓</span>
                </div>
                <span>Get notified of available service requests</span>
              </li>
              <li className="flex items-center">
                <div className="w-5 h-5 rounded-full bg-blue-400 mr-3 flex items-center justify-center">
                  <span className="text-xs">✓</span>
                </div>
                <span>Receive bookings and payments securely</span>
              </li>
            </ul>
            <button 
              onClick={handleServiceProviderClick}
              className="px-6 py-3 bg-white text-blue-600 rounded-md hover:bg-blue-50 font-medium flex items-center cursor-pointer transition-colors"
            >
              Register as Service Provider
              <ArrowRight size={16} className="ml-2" />
            </button>
          </div>

          <div className="bg-white bg-opacity-10 rounded-lg p-8 backdrop-blur-sm">
            <div className="bg-indigo-500 w-16 h-16 rounded-lg flex items-center justify-center mb-6">
              <ShoppingBag size={32} className="text-white" />
            </div>
            <h3 className="text-2xl font-bold mb-4">Become a Seller</h3>
            <p className="mb-6 text-blue-100">
              Reach new customers and grow your business. Register to start
              selling your products on our marketplace today.
            </p>
            <ul className="mb-8 space-y-2">
              <li className="flex items-center">
                <div className="w-5 h-5 rounded-full bg-indigo-400 mr-3 flex items-center justify-center">
                  <span className="text-xs">✓</span>
                </div>
                <span>Create your shop in minutes</span>
              </li>
              <li className="flex items-center">
                <div className="w-5 h-5 rounded-full bg-indigo-400 mr-3 flex items-center justify-center">
                  <span className="text-xs">✓</span>
                </div>
                <span>List unlimited products with photos</span>
              </li>
              <li className="flex items-center">
                <div className="w-5 h-5 rounded-full bg-indigo-400 mr-3 flex items-center justify-center">
                  <span className="text-xs">✓</span>
                </div>
                <span>Start selling and earning immediately</span>
              </li>
            </ul>
            <button 
              onClick={handleSellerClick}
              className="px-6 py-3 bg-white text-indigo-600 rounded-md hover:bg-blue-50 font-medium flex items-center cursor-pointer transition-colors"
            >
              Register as Seller
              <ArrowRight size={16} className="ml-2" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};