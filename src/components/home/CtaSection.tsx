import React from 'react';
import { ArrowRight, Briefcase, ShoppingBag, TrendingUp, Users, MapPin, Shield, Zap, DollarSign, Star, Check } from 'lucide-react';

export const CtaSection = () => {
  const handleServiceProviderClick = () => {
    window.location.href = '/register?type=service-provider'; 
  };

  const handleSellerClick = () => {
    window.location.href = '/register?type=seller'; 
  };

  return (
    <section 
      className="py-16 lg:py-24 bg-gradient-to-br from-blue-600 via-indigo-700 to-purple-800 text-white relative overflow-hidden"
      itemScope
      itemType="https://schema.org/WebPageElement"
    >
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-blue-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
        <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-purple-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-indigo-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <div className="text-center mb-12 lg:mb-16">
          <div className="inline-flex items-center justify-center px-4 py-2 mb-6 bg-white/20 backdrop-blur-sm rounded-full border border-white/30">
            <TrendingUp size={16} className="text-white mr-2" />
            <span className="text-sm font-semibold text-white tracking-wide">GROW YOUR BUSINESS</span>
          </div>
          
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4 sm:mb-6">
            Start Earning with Quisells Today
          </h2>
          
          <p className="text-blue-100 text-base sm:text-lg lg:text-xl max-w-3xl mx-auto leading-relaxed">
            Join successful <strong className="text-white">service providers</strong> and <strong className="text-white">sellers</strong> across Kenya. 
            Whether you're a freelancer, business owner, or entrepreneur, Quisells connects you with customers from <strong className="text-white">Nairobi to Mombasa</strong>. 
            Handle payments directly with your clients through <strong className="text-white">M-Pesa, bank transfers, or cash</strong> - you're in full control.
          </p>
        </div>

        {/* CTA Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
          {/* Service Provider Card */}
          <div 
            className="group bg-white/10 backdrop-blur-md rounded-2xl sm:rounded-3xl p-6 sm:p-8 lg:p-10 border-2 border-white/20 hover:border-white/40 transition-all duration-300 hover:bg-white/15 hover:shadow-2xl hover:-translate-y-1"
            itemScope
            itemType="https://schema.org/Service"
          >
            <div className="flex items-start justify-between mb-6">
              <div className="bg-gradient-to-br from-blue-400 to-blue-600 w-14 h-14 sm:w-16 sm:h-16 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                <Briefcase size={28} className="text-white" />
              </div>
              <div className="bg-blue-400/20 px-3 py-1 rounded-full text-xs sm:text-sm font-semibold">
                Popular
              </div>
            </div>

            <h3 className="text-2xl sm:text-3xl font-bold mb-3 sm:mb-4" itemProp="name">
              Become a Service Provider
            </h3>
            
            <p className="mb-6 sm:mb-8 text-blue-100 text-sm sm:text-base leading-relaxed" itemProp="description">
              Share your <strong className="text-white">skills and expertise</strong> with thousands of potential clients across Kenya. 
              Register to get available <strong className="text-white">service requests in your area</strong> and start earning today.
            </p>

            {/* Benefits Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mb-6 sm:mb-8">
              <div className="flex items-start">
                <div className="w-5 h-5 rounded-full bg-blue-400 mr-3 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Check size={14} className="text-white" />
                </div>
                <span className="text-sm sm:text-base">Professional profile showcase</span>
              </div>
              <div className="flex items-start">
                <div className="w-5 h-5 rounded-full bg-blue-400 mr-3 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Check size={14} className="text-white" />
                </div>
                <span className="text-sm sm:text-base">Instant service notifications</span>
              </div>
              <div className="flex items-start">
                <div className="w-5 h-5 rounded-full bg-blue-400 mr-3 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Check size={14} className="text-white" />
                </div>
                <span className="text-sm sm:text-base">Secure payment system</span>
              </div>
              <div className="flex items-start">
                <div className="w-5 h-5 rounded-full bg-blue-400 mr-3 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Check size={14} className="text-white" />
                </div>
                <span className="text-sm sm:text-base">Build your reputation</span>
              </div>
            </div>

            {/* Key Features */}
            <div className="bg-white/5 rounded-xl p-4 sm:p-5 mb-6 sm:mb-8 border border-white/10">
              <div className="flex items-center mb-3">
                <Zap size={18} className="text-yellow-300 mr-2" />
                <span className="font-semibold text-sm sm:text-base">Perfect for:</span>
              </div>
              <p className="text-blue-100 text-xs sm:text-sm">
                Plumbers, Electricians, Cleaners, Tutors, IT Experts, Designers, Photographers, Consultants, and more
              </p>
            </div>

            {/* SEO Keywords */}
            <span className="sr-only">
              service provider registration Kenya, freelance work Nairobi, become service provider, 
              professional services Kenya, skilled workers marketplace, earn money Kenya, 
              service jobs Nairobi, freelancer platform Kenya
            </span>

            <button 
              onClick={handleServiceProviderClick}
              className="w-full px-6 py-4 bg-white text-blue-600 rounded-xl hover:bg-blue-50 font-semibold flex items-center justify-center group-hover:shadow-xl transition-all duration-300 text-sm sm:text-base"
              aria-label="Register as a Service Provider"
            >
              <span>Register as Service Provider</span>
              <ArrowRight size={18} className="ml-2 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>

          {/* Seller Card */}
          <div 
            className="group bg-white/10 backdrop-blur-md rounded-2xl sm:rounded-3xl p-6 sm:p-8 lg:p-10 border-2 border-white/20 hover:border-white/40 transition-all duration-300 hover:bg-white/15 hover:shadow-2xl hover:-translate-y-1"
            itemScope
            itemType="https://schema.org/Service"
          >
            <div className="flex items-start justify-between mb-6">
              <div className="bg-gradient-to-br from-purple-400 to-indigo-600 w-14 h-14 sm:w-16 sm:h-16 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                <ShoppingBag size={28} className="text-white" />
              </div>
              <div className="bg-purple-400/20 px-3 py-1 rounded-full text-xs sm:text-sm font-semibold">
                Trending
              </div>
            </div>

            <h3 className="text-2xl sm:text-3xl font-bold mb-3 sm:mb-4" itemProp="name">
              Become a Seller
            </h3>
            
            <p className="mb-6 sm:mb-8 text-blue-100 text-sm sm:text-base leading-relaxed" itemProp="description">
              Reach new customers from <strong className="text-white">Nairobi to Mombasa</strong> and grow your business exponentially. 
              Register to start selling your products on <strong className="text-white">Kenya's fastest-growing marketplace</strong> today.
            </p>

            {/* Benefits Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mb-6 sm:mb-8">
              <div className="flex items-start">
                <div className="w-5 h-5 rounded-full bg-purple-400 mr-3 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Check size={14} className="text-white" />
                </div>
                <span className="text-sm sm:text-base">Quick shop setup</span>
              </div>
              <div className="flex items-start">
                <div className="w-5 h-5 rounded-full bg-purple-400 mr-3 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Check size={14} className="text-white" />
                </div>
                <span className="text-sm sm:text-base">Unlimited product listings</span>
              </div>
              <div className="flex items-start">
                <div className="w-5 h-5 rounded-full bg-purple-400 mr-3 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Check size={14} className="text-white" />
                </div>
                <span className="text-sm sm:text-base">Start earning instantly</span>
              </div>
              <div className="flex items-start">
                <div className="w-5 h-5 rounded-full bg-purple-400 mr-3 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Check size={14} className="text-white" />
                </div>
                <span className="text-sm sm:text-base">Analytics & insights</span>
              </div>
            </div>

            {/* Key Features */}
            <div className="bg-white/5 rounded-xl p-4 sm:p-5 mb-6 sm:mb-8 border border-white/10">
              <div className="flex items-center mb-3">
                <DollarSign size={18} className="text-green-300 mr-2" />
                <span className="font-semibold text-sm sm:text-base">Perfect for:</span>
              </div>
              <p className="text-blue-100 text-xs sm:text-sm">
                Fashion, Electronics, Handmade Crafts, Home Goods, Beauty Products, Automotive Parts, and all product categories
              </p>
            </div>

            {/* SEO Keywords */}
            <span className="sr-only">
              sell products online Kenya, online seller registration, e-commerce Kenya, 
              sell in Nairobi, marketplace seller, online shop Kenya, start selling online, 
              business Kenya, vendor registration Nairobi
            </span>

            <button 
              onClick={handleSellerClick}
              className="w-full px-6 py-4 bg-white text-indigo-600 rounded-xl hover:bg-blue-50 font-semibold flex items-center justify-center group-hover:shadow-xl transition-all duration-300 text-sm sm:text-base"
              aria-label="Register as a Seller"
            >
              <span>Register as Seller</span>
              <ArrowRight size={18} className="ml-2 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>

        {/* Bottom Trust Indicators */}
        <div className="mt-12 lg:mt-16 text-center">
          <p className="text-blue-100 text-sm sm:text-base mb-4">
            Trusted by professionals and businesses across Kenya
          </p>
          <div className="flex flex-wrap justify-center items-center gap-4 sm:gap-8">
            <div className="flex items-center text-xs sm:text-sm">
              <Shield size={16} className="mr-2 text-green-300" />
              <span>Verified Accounts</span>
            </div>
            <div className="flex items-center text-xs sm:text-sm">
              <Zap size={16} className="mr-2 text-yellow-300" />
              <span>Fast Payouts</span>
            </div>
            <div className="flex items-center text-xs sm:text-sm">
              <Users size={16} className="mr-2 text-blue-300" />
              <span>24/7 Support</span>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes blob {
          0% {
            transform: translate(0px, 0px) scale(1);
          }
          33% {
            transform: translate(30px, -50px) scale(1.1);
          }
          66% {
            transform: translate(-20px, 20px) scale(0.9);
          }
          100% {
            transform: translate(0px, 0px) scale(1);
          }
        }
        
        .animate-blob {
          animation: blob 7s infinite;
        }
        
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        
        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}</style>
    </section>
  );
};