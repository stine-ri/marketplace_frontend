import React from 'react';
import { Star, Quote } from 'lucide-react';
export const TestimonialsSection = () => {
  return <section className="py-12 lg:py-16 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-2">What Our Users Say</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Hear from our community of buyers, service providers, and sellers
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {/* Testimonial 1 */}
          <div className="bg-white p-6 rounded-lg shadow-md relative">
            <Quote size={40} className="absolute top-4 right-4 text-blue-100" />
            <div className="flex items-center mb-4">
              <img src="https://randomuser.me/api/portraits/women/23.jpg" alt="Customer" className="w-12 h-12 rounded-full mr-4" />
              <div>
                <h4 className="font-medium">Jennifer Lopez</h4>
                <p className="text-gray-500 text-sm">Buyer</p>
              </div>
            </div>
            <div className="flex items-center text-yellow-500 mb-3">
              <Star size={16} fill="currentColor" />
              <Star size={16} fill="currentColor" />
              <Star size={16} fill="currentColor" />
              <Star size={16} fill="currentColor" />
              <Star size={16} fill="currentColor" />
            </div>
            <p className="text-gray-600 mb-2">
              "I found an amazing graphic designer on MarketHub who perfectly
              captured my brand vision. The entire process from booking to
              delivery was seamless."
            </p>
            <p className="text-sm text-gray-500">
              Used the platform for: Graphic Design Services
            </p>
          </div>
          {/* Testimonial 2 */}
          <div className="bg-white p-6 rounded-lg shadow-md relative">
            <Quote size={40} className="absolute top-4 right-4 text-blue-100" />
            <div className="flex items-center mb-4">
              <img src="https://randomuser.me/api/portraits/men/47.jpg" alt="Provider" className="w-12 h-12 rounded-full mr-4" />
              <div>
                <h4 className="font-medium">Michael Johnson</h4>
                <p className="text-gray-500 text-sm">Service Provider</p>
              </div>
            </div>
            <div className="flex items-center text-yellow-500 mb-3">
              <Star size={16} fill="currentColor" />
              <Star size={16} fill="currentColor" />
              <Star size={16} fill="currentColor" />
              <Star size={16} fill="currentColor" />
              <Star size={16} className="text-gray-300" />
            </div>
            <p className="text-gray-600 mb-2">
              "As a plumber, MarketHub has transformed my business. I've gained
              steady clients and the booking system makes scheduling jobs so
              much easier."
            </p>
            <p className="text-sm text-gray-500">
              Service offered: Plumbing & Repairs
            </p>
          </div>
          {/* Testimonial 3 */}
          <div className="bg-white p-6 rounded-lg shadow-md relative">
            <Quote size={40} className="absolute top-4 right-4 text-blue-100" />
            <div className="flex items-center mb-4">
              <img src="https://randomuser.me/api/portraits/women/65.jpg" alt="Seller" className="w-12 h-12 rounded-full mr-4" />
              <div>
                <h4 className="font-medium">Sarah Williams</h4>
                <p className="text-gray-500 text-sm">Seller</p>
              </div>
            </div>
            <div className="flex items-center text-yellow-500 mb-3">
              <Star size={16} fill="currentColor" />
              <Star size={16} fill="currentColor" />
              <Star size={16} fill="currentColor" />
              <Star size={16} fill="currentColor" />
              <Star size={16} fill="currentColor" />
            </div>
            <p className="text-gray-600 mb-2">
              "I started selling my handmade jewelry on MarketHub last year and
              my sales have tripled! The platform makes it easy to showcase my
              products and connect with customers."
            </p>
            <p className="text-sm text-gray-500">
              Products: Handcrafted Jewelry
            </p>
          </div>
        </div>
      </div>
    </section>;
};