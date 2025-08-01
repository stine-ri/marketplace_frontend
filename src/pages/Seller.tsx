import React from 'react';
import { Store, User, TrendingUp, Users, Award, Shield, BarChart3, Settings, Eye, Clock, CheckCircle, DollarSign, Globe, Zap, Heart, Star, Briefcase, Smile } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const BecomeSellerNavbarContent = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleBecomeSellerClick = () => {
    navigate('/register');
  };

  // If user is not logged in, show enhanced marketplace showcase
  if (!user) {
    return (
      <div className="flex items-center gap-2 sm:gap-4">
        {/* Enhanced Marketplace Stats - Visible on all screens */}
        <div className="hidden sm:flex items-center gap-3 bg-white/90 backdrop-blur-sm p-2 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex items-center gap-4">
            {/* Stat 1 - Experts */}
            <div className="flex flex-col items-center">
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 bg-blue-500 rounded-full flex items-center justify-center animate-pulse">
                  <Users className="w-2 h-2 text-white" />
                </div>
                <span className="text-sm font-bold text-blue-700">15K+</span>
              </div>
              <span className="text-xs text-gray-600">Experts</span>
            </div>
            
            <div className="w-px h-6 bg-gray-200"></div>
            
            {/* Stat 2 - Earnings */}
            <div className="flex flex-col items-center">
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 bg-green-500 rounded-full flex items-center justify-center animate-pulse">
                  <DollarSign className="w-2 h-2 text-white" />
                </div>
                <span className="text-sm font-bold text-green-700">$2M+</span>
              </div>
              <span className="text-xs text-gray-600">Earned</span>
            </div>
            
            <div className="w-px h-6 bg-gray-200"></div>
            
            {/* Stat 3 - Ratings */}
            <div className="flex flex-col items-center">
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 bg-yellow-500 rounded-full flex items-center justify-center animate-pulse">
                  <Star className="w-2 h-2 text-white" />
                </div>
                <span className="text-sm font-bold text-yellow-700">4.9★</span>
              </div>
              <span className="text-xs text-gray-600">Avg Rating</span>
            </div>
            
            <div className="w-px h-6 bg-gray-200"></div>
            
            {/* Stat 4 - Projects */}
            <div className="flex flex-col items-center">
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 bg-purple-500 rounded-full flex items-center justify-center animate-pulse">
                  <Briefcase className="w-2 h-2 text-white" />
                </div>
                <span className="text-sm font-bold text-purple-700">50K+</span>
              </div>
              <span className="text-xs text-gray-600">Projects</span>
            </div>
          </div>
        </div>

        {/* Mobile Stats - Compact version */}
        <div className="flex sm:hidden items-center gap-2 bg-white p-1.5 rounded-lg shadow-sm">
          <div className="flex items-center gap-1 px-2 py-1">
            <Users className="w-3 h-3 text-blue-500" />
            <span className="text-xs font-bold text-blue-700">15K+</span>
          </div>
          <div className="flex items-center gap-1 px-2 py-1">
            <DollarSign className="w-3 h-3 text-green-500" />
            <span className="text-xs font-bold text-green-700">$2M+</span>
          </div>
        </div>

        {/* Enhanced Service Categories Preview - Hidden on mobile */}
        <div className="hidden lg:flex items-center gap-3 bg-gradient-to-r from-blue-50 to-purple-50 px-4 py-2 rounded-xl border border-blue-100 shadow-sm">
          <div className="flex items-center gap-4">
            {/* Service category icons with mini previews */}
            <div className="flex flex-col items-center group relative">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-full flex items-center justify-center shadow-md group-hover:shadow-lg transition-shadow">
                <span className="text-white text-sm font-bold">💻</span>
              </div>
              <span className="text-xs font-medium text-gray-700 mt-1 group-hover:text-blue-600 transition-colors">Tech</span>
              <div className="hidden group-hover:block absolute mt-10 bg-white p-2 rounded-lg shadow-lg border border-gray-200 z-10 w-40">
                <p className="text-xs text-gray-600">Web development, AI, Blockchain services</p>
              </div>
            </div>
            
            <div className="w-px h-8 bg-gray-200 rounded-full"></div>
            
            <div className="flex flex-col items-center group relative">
              <div className="w-8 h-8 bg-gradient-to-br from-pink-500 to-rose-500 rounded-full flex items-center justify-center shadow-md group-hover:shadow-lg transition-shadow">
                <span className="text-white text-sm font-bold">🎨</span>
              </div>
              <span className="text-xs font-medium text-gray-700 mt-1 group-hover:text-pink-600 transition-colors">Design</span>
              <div className="hidden group-hover:block absolute mt-10 bg-white p-2 rounded-lg shadow-lg border border-gray-200 z-10 w-40">
                <p className="text-xs text-gray-600">Logos, UI/UX, Illustrations</p>
              </div>
            </div>
            
            <div className="w-px h-8 bg-gray-200 rounded-full"></div>
            
            <div className="flex flex-col items-center group relative">
              <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-emerald-500 rounded-full flex items-center justify-center shadow-md group-hover:shadow-lg transition-shadow">
                <span className="text-white text-sm font-bold">📝</span>
              </div>
              <span className="text-xs font-medium text-gray-700 mt-1 group-hover:text-green-600 transition-colors">Writing</span>
              <div className="hidden group-hover:block absolute mt-10 bg-white p-2 rounded-lg shadow-lg border border-gray-200 z-10 w-40">
                <p className="text-xs text-gray-600">Content, Copywriting, Translation</p>
              </div>
            </div>
            
            <div className="w-px h-8 bg-gray-200 rounded-full"></div>
            
            <div className="flex flex-col items-center group relative">
              <div className="w-8 h-8 bg-gradient-to-br from-orange-500 to-yellow-500 rounded-full flex items-center justify-center shadow-md group-hover:shadow-lg transition-shadow">
                <span className="text-white text-sm font-bold">📈</span>
              </div>
              <span className="text-xs font-medium text-gray-700 mt-1 group-hover:text-orange-600 transition-colors">Marketing</span>
              <div className="hidden group-hover:block absolute mt-10 bg-white p-2 rounded-lg shadow-lg border border-gray-200 z-10 w-40">
                <p className="text-xs text-gray-600">SEO, Social Media, Advertising</p>
              </div>
            </div>
            
            <div className="relative group">
              <div className="text-xs text-gray-500 ml-1 px-2 py-1 bg-gray-100 rounded-full hover:bg-gray-200 transition-colors cursor-pointer">
                +50 more
              </div>
              <div className="hidden group-hover:block absolute right-0 mt-2 bg-white p-3 rounded-lg shadow-xl border border-gray-200 z-10 w-64">
                <h4 className="font-bold text-sm mb-2 text-gray-800">Popular Categories</h4>
                <div className="grid grid-cols-2 gap-2">
                  <span className="text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded-full">Video & Animation</span>
                  <span className="text-xs bg-purple-50 text-purple-700 px-2 py-1 rounded-full">Music & Audio</span>
                  <span className="text-xs bg-green-50 text-green-700 px-2 py-1 rounded-full">Business</span>
                  <span className="text-xs bg-yellow-50 text-yellow-700 px-2 py-1 rounded-full">Data Analytics</span>
                  <span className="text-xs bg-pink-50 text-pink-700 px-2 py-1 rounded-full">Photography</span>
                  <span className="text-xs bg-indigo-50 text-indigo-700 px-2 py-1 rounded-full">Legal</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile Service Categories Chips */}
        <div className="flex lg:hidden items-center gap-1 text-xs overflow-x-auto py-1 px-1">
          <span className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white px-2 py-1 rounded-full font-medium whitespace-nowrap flex items-center gap-1 shadow-sm">
            <span>💻</span>Tech
          </span>
          <span className="bg-gradient-to-r from-pink-500 to-rose-500 text-white px-2 py-1 rounded-full font-medium whitespace-nowrap flex items-center gap-1 shadow-sm">
            <span>🎨</span>Design
          </span>
          <span className="bg-gradient-to-r from-green-500 to-emerald-500 text-white px-2 py-1 rounded-full font-medium whitespace-nowrap flex items-center gap-1 shadow-sm">
            <span>📝</span>Writing
          </span>
          <span className="bg-gradient-to-r from-orange-500 to-yellow-500 text-white px-2 py-1 rounded-full font-medium whitespace-nowrap flex items-center gap-1 shadow-sm">
            <span>📈</span>Marketing
          </span>
          <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded-full font-medium whitespace-nowrap shadow-sm">
            +47 more
          </span>
        </div>

        {/* Enhanced Become Seller Button */}
        <div className="relative group">
          <button
            onClick={handleBecomeSellerClick}
            className="relative bg-gradient-to-r from-blue-600 via-purple-600 to-blue-700 hover:from-blue-700 hover:via-purple-700 hover:to-blue-800 text-white px-4 py-2 sm:px-5 sm:py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all duration-300 flex items-center gap-2 shadow-lg hover:shadow-xl transform hover:scale-105 overflow-hidden min-w-max"
          >
            {/* Animated background */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
            
            {/* Pulsing effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-blue-400/30 to-purple-400/30 animate-pulse opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            
            <Store className="w-4 h-4 z-10 animate-bounce" />
            <span className="z-10 font-bold">
              <span className="hidden sm:inline">Start Earning Today</span>
              <span className="sm:hidden">Join Now</span>
            </span>
            
            {/* Enhanced badges */}
            <div className="absolute -top-1 -right-1 flex gap-1">
              <span className="bg-gradient-to-r from-orange-400 to-red-500 text-white text-[0.6rem] px-1.5 py-0.5 rounded-full font-bold shadow-md animate-bounce">
                FREE
              </span>
            </div>
            
            {/* Success indicator */}
            <div className="absolute -bottom-1 -left-1 bg-gradient-to-r from-green-400 to-emerald-500 text-white text-[0.6rem] px-1.5 py-0.5 rounded-full font-bold shadow-md">
              ✓ 5min setup
            </div>
          </button>
          
          {/* Enhanced tooltip for mobile */}
          <div className="absolute left-0 mt-2 bg-white p-3 rounded-lg shadow-xl border border-gray-200 z-10 w-64 sm:hidden group-hover:block hidden">
            <h4 className="font-bold text-sm mb-2 text-gray-800">Why join as a seller?</h4>
            <div className="space-y-2">
              <div className="flex items-start gap-2">
                <DollarSign className="w-3 h-3 mt-0.5 text-green-500 flex-shrink-0" />
                <p className="text-xs text-gray-600">Keep 95% of your earnings</p>
              </div>
              <div className="flex items-start gap-2">
                <Globe className="w-3 h-3 mt-0.5 text-blue-500 flex-shrink-0" />
                <p className="text-xs text-gray-600">Reach global clients</p>
              </div>
              <div className="flex items-start gap-2">
                <Zap className="w-3 h-3 mt-0.5 text-yellow-500 flex-shrink-0" />
                <p className="text-xs text-gray-600">Fast onboarding</p>
              </div>
              <div className="flex items-start gap-2">
                <Smile className="w-3 h-3 mt-0.5 text-purple-500 flex-shrink-0" />
                <p className="text-xs text-gray-600">24/7 support</p>
              </div>
            </div>
          </div>
        </div>

        {/* Quick benefits tooltip - appears on larger screens */}
        <div className="hidden xl:flex flex-col gap-1 text-xs text-gray-600 bg-white/90 backdrop-blur-sm px-3 py-2 rounded-lg border border-gray-200 shadow-sm">
          <h4 className="font-bold text-sm mb-1 text-gray-800">Seller Benefits</h4>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse flex-shrink-0"></div>
            <div>
              <span className="font-medium">No listing fees</span>
              <p className="text-gray-500 text-xs">List as many services as you want</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse flex-shrink-0"></div>
            <div>
              <span className="font-medium">Keep 95% earnings</span>
              <p className="text-gray-500 text-xs">Lowest platform commission</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse flex-shrink-0"></div>
            <div>
              <span className="font-medium">24/7 support</span>
              <p className="text-gray-500 text-xs">Dedicated seller assistance</p>
            </div>
          </div>
          <div className="mt-1 pt-1 border-t border-gray-100">
            <div className="flex items-center gap-2">
              <Heart className="w-3 h-3 text-rose-500 flex-shrink-0" />
              <span className="text-xs text-gray-500">Trusted by 15,000+ professionals</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // For logged-in users, show role-specific welcome messages
  const firstName = user.full_name ? user.full_name.split(' ')[0] : user.email.split('@')[0];

  if (user.role === 'service_provider') {
    return (
      <div className="flex items-center gap-2 sm:gap-3">
        <div className="flex items-center gap-2 bg-gradient-to-r from-green-50 to-blue-50 px-3 py-2 rounded-lg border border-green-200 shadow-sm hover:shadow-md transition-shadow">
          <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-blue-500 rounded-full flex items-center justify-center shadow-md">
            <User className="w-4 h-4 text-white" />
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-gray-800">
                Welcome back, {firstName}
              </span>
              <span className="hidden sm:inline-block bg-gradient-to-r from-green-100 to-blue-100 text-green-700 px-2 py-1 text-xs rounded-full font-medium shadow-sm">
                Service Provider
              </span>
            </div>
            <p className="text-xs text-gray-600 hidden md:block">
              Ready to showcase your services and grow your business
            </p>
          </div>
        </div>
        
        {/* Provider quick stats */}
        <div className="hidden lg:flex items-center gap-3 text-xs text-gray-600">
          <div className="flex items-center gap-1 bg-green-50 px-2 py-1 rounded-full border border-green-100">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
            <span>Active</span>
          </div>
          <div className="flex items-center gap-1 bg-yellow-50 px-2 py-1 rounded-full border border-yellow-100">
            <Award className="w-3 h-3 text-yellow-500" />
            <span>4.8★ Rating</span>
          </div>
          <div className="flex items-center gap-1 bg-blue-50 px-2 py-1 rounded-full border border-blue-100">
            <Clock className="w-3 h-3 text-blue-500" />
            <span>12 Projects</span>
          </div>
          <button className="flex items-center gap-1 bg-gradient-to-r from-green-100 to-blue-100 hover:from-green-200 hover:to-blue-200 text-green-700 px-2 py-1 rounded-full transition-colors shadow-sm">
            <TrendingUp className="w-3 h-3" />
            <span>View Stats</span>
          </button>
        </div>
      </div>
    );
  }

  if (user.role === 'client') {
    return (
      <div className="flex items-center gap-2 sm:gap-3">
        <div className="flex items-center gap-2 bg-gradient-to-r from-blue-50 to-indigo-50 px-3 py-2 rounded-lg border border-blue-200 shadow-sm hover:shadow-md transition-shadow">
          <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full flex items-center justify-center shadow-md">
            <User className="w-4 h-4 text-white" />
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-gray-800">
                Welcome back, {firstName}
              </span>
              <span className="hidden sm:inline-block bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-700 px-2 py-1 text-xs rounded-full font-medium shadow-sm">
                Client
              </span>
            </div>
            <p className="text-xs text-gray-600 hidden md:block">
              Check out our services from top service providers in your dashboard
            </p>
          </div>
        </div>
        
        {/* Client quick action */}
        <div className="hidden lg:flex items-center gap-2 text-xs">
          <button className="flex items-center gap-1 bg-gradient-to-r from-blue-100 to-indigo-100 hover:from-blue-200 hover:to-indigo-200 text-blue-700 px-2 py-1 rounded-full transition-colors shadow-sm">
            <Eye className="w-3 h-3" />
            <span>Browse Services</span>
          </button>
          <button className="flex items-center gap-1 bg-gradient-to-r from-green-100 to-teal-100 hover:from-green-200 hover:to-teal-200 text-green-700 px-2 py-1 rounded-full transition-colors shadow-sm">
            <CheckCircle className="w-3 h-3" />
            <span>My Projects</span>
          </button>
        </div>
      </div>
    );
  }

  if (user.role === 'admin') {
    return (
      <div className="flex items-center gap-2 sm:gap-3">
        <div className="flex items-center gap-2 bg-gradient-to-r from-purple-50 to-pink-50 px-3 py-2 rounded-lg border border-purple-200 shadow-sm hover:shadow-md transition-shadow">
          <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center shadow-md">
            <Shield className="w-4 h-4 text-white" />
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-gray-800">
                Welcome, Administrator {firstName}
              </span>
              <span className="hidden sm:inline-block bg-gradient-to-r from-purple-100 to-pink-100 text-purple-700 px-2 py-1 text-xs rounded-full font-medium shadow-sm">
                Admin
              </span>
            </div>
            <p className="text-xs text-gray-600 hidden md:block">
              System oversight and platform management at your fingertips
            </p>
          </div>
        </div>
        
        {/* Admin quick stats */}
        <div className="hidden lg:flex items-center gap-3 text-xs text-gray-600">
          <div className="flex items-center gap-1 bg-green-50 px-2 py-1 rounded-full border border-green-100">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
            <span>System: Active</span>
          </div>
          <div className="flex items-center gap-1 bg-purple-50 px-2 py-1 rounded-full border border-purple-100">
            <BarChart3 className="w-3 h-3 text-purple-500" />
            <span>Analytics Dashboard</span>
          </div>
          <div className="flex items-center gap-1 bg-gray-50 px-2 py-1 rounded-full border border-gray-100">
            <Settings className="w-3 h-3 text-gray-500" />
            <span>Admin Controls</span>
          </div>
        </div>
      </div>
    );
  }

  return null;
};

export default BecomeSellerNavbarContent;