import React, { useState, ReactNode, useRef, useEffect } from 'react';
import { Search, Menu, X, User, LayoutDashboard, ChevronDown } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import NotificationBell from '../NewFeature/NotificationBell';
import logo from '../../assets/Logo-quisells-3d.svg';
interface NavbarProps {
  children?: ReactNode;
}

export function Navbar({ children }: NavbarProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isAuthDropdownOpen, setIsAuthDropdownOpen] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const authDropdownRef = useRef<HTMLDivElement>(null);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleMenuClose = () => setIsMenuOpen(false);

  const handleLogout = () => {
    logout();
    setIsMenuOpen(false);
  };

  const handleDashboardRedirect = () => {
    if (user?.role) {
      switch (user.role.toLowerCase()) {
        case 'admin':
          navigate('/admin/dashboard');
          break;
        case 'service_provider':
        case 'provider':
          navigate('/provider/dashboard');
          break;
        case 'product_seller':
        case 'seller':
          navigate('/seller/dashboard');
          break;
        case 'client':
        case 'customer':
          navigate('/client/dashboard');
          break;
        default:
          navigate('/');
      }
    } else {
      navigate('/');
    }
    setIsMenuOpen(false);
  };

  const getDashboardButtonText = () => {
    if (!user?.role) return 'Dashboard';
    
    switch (user.role.toLowerCase()) {
      case 'admin':
        return 'Admin Panel';
      case 'service_provider':
      case 'provider':
        return 'Provider Dashboard';
      case 'product_seller':
      case 'seller':
        return 'Seller Dashboard';
      case 'client':
      case 'customer':
        return 'My Dashboard';
      default:
        return 'Dashboard';
    }
  };

  const handleSearchToggle = () => {
    setIsSearchOpen(!isSearchOpen);
    if (!isSearchOpen) {
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 100);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setIsSearchOpen(false);
      setSearchQuery('');
    }
  };

  const handleSearchClose = () => {
    setIsSearchOpen(false);
    setSearchQuery('');
  };

  const handleAuthNavigation = (path: string) => {
    navigate(path);
    setIsAuthDropdownOpen(false);
    setIsMenuOpen(false);
  };

  // Close search when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchInputRef.current && !searchInputRef.current.contains(event.target as Node)) {
        setIsSearchOpen(false);
      }
    };

    if (isSearchOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isSearchOpen]);

  // Close auth dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (authDropdownRef.current && !authDropdownRef.current.contains(event.target as Node)) {
        setIsAuthDropdownOpen(false);
      }
    };

    if (isAuthDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isAuthDropdownOpen]);

  return (
    <header className="bg-white shadow-sm sticky top-0 z-50">
      <div className="container mx-auto px-4 py-2 sm:py-3">
        <div className="flex items-center justify-between">
      

{/* Logo - Fully responsive scaling */}
<div className="flex items-center flex-shrink-0 relative z-10">
  <Link to="/" className="flex items-center">
    <svg 
      viewBox="0 0 850 200" 
      xmlns="http://www.w3.org/2000/svg" 
      className="h-8 w-auto sm:h-10 md:h-14 lg:h-16 xl:h-20 hover:opacity-80 transition-opacity"
    >
      <defs>
        {/* Premium blue gradient */}
        <linearGradient id="blueGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style={{stopColor:"#1E3A8A", stopOpacity:1}} />
          <stop offset="50%" style={{stopColor:"#3B82F6", stopOpacity:1}} />
          <stop offset="100%" style={{stopColor:"#60A5FA", stopOpacity:1}} />
        </linearGradient>
        
        {/* Light blue accent */}
        <linearGradient id="lightBlue" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style={{stopColor:"#60A5FA", stopOpacity:1}} />
          <stop offset="100%" style={{stopColor:"#93C5FD", stopOpacity:1}} />
        </linearGradient>
        
        {/* Dark blue for depth */}
        <linearGradient id="darkBlue" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style={{stopColor:"#1E40AF", stopOpacity:1}} />
          <stop offset="100%" style={{stopColor:"#2563EB", stopOpacity:1}} />
        </linearGradient>
        
        {/* Enhanced shadow */}
        <filter id="enhancedShadow">
          <feDropShadow dx="0" dy="4" stdDeviation="5" floodColor="#1E3A8A" floodOpacity="0.3"/>
        </filter>
        
        {/* Glossy effect */}
        <filter id="gloss">
          <feGaussianBlur in="SourceAlpha" stdDeviation="2"/>
          <feOffset dx="0" dy="-2" result="offsetblur"/>
          <feFlood floodColor="#FFFFFF" floodOpacity="0.5"/>
          <feComposite in2="offsetblur" operator="in"/>
          <feMerge>
            <feMergeNode/>
            <feMergeNode in="SourceGraphic"/>
          </feMerge>
        </filter>
      </defs>
      
      {/* Enhanced 3D Q Icon with blue shades */}
      <g transform="translate(40, 35)">
        {/* Deeper back layer for more depth */}
        <path d="M 80 20 A 50 50 0 1 1 80 120 A 50 50 0 1 1 80 20 Z M 80 40 A 30 30 0 1 0 80 100 A 30 30 0 1 0 80 40 Z" 
              fill="url(#darkBlue)" 
              opacity="0.4"
              transform="translate(10, 10)"
              filter="url(#enhancedShadow)"/>
        
        {/* Mid layer for depth */}
        <path d="M 80 20 A 50 50 0 1 1 80 120 A 50 50 0 1 1 80 20 Z M 80 40 A 30 30 0 1 0 80 100 A 30 30 0 1 0 80 40 Z" 
              fill="url(#blueGradient)" 
              opacity="0.6"
              transform="translate(5, 5)"/>
        
        {/* Main Q ring with gradient */}
        <path d="M 80 20 A 50 50 0 1 1 80 120 A 50 50 0 1 1 80 20 Z M 80 40 A 30 30 0 1 0 80 100 A 30 30 0 1 0 80 40 Z" 
              fill="url(#blueGradient)"
              filter="url(#gloss)"/>
        
        {/* Bold diagonal tail with gradient */}
        <rect x="95" y="85" width="38" height="18" 
              fill="url(#blueGradient)" 
              rx="9"
              transform="rotate(45 114 94)"
              filter="url(#gloss)"/>
        
        {/* Enhanced glossy shine */}
        <ellipse cx="62" cy="42" rx="15" ry="22" 
                 fill="url(#lightBlue)" 
                 opacity="0.6"
                 transform="rotate(-30 62 42)"/>
        
        {/* Secondary shine accent */}
        <ellipse cx="70" cy="50" rx="8" ry="12" 
                 fill="white" 
                 opacity="0.4"
                 transform="rotate(-25 70 50)"/>
        
        {/* Inner glow circle */}
        <circle cx="80" cy="70" r="22" 
                fill="url(#lightBlue)" 
                opacity="0.25"/>
        
        {/* Center accent dot */}
        <circle cx="80" cy="70" r="8" 
                fill="#60A5FA" 
                opacity="0.8"/>
        
        {/* Modern detail lines */}
        <path d="M 50 70 L 110 70" 
              stroke="#93C5FD" 
              strokeWidth="2.5" 
              opacity="0.4"/>
        <path d="M 80 40 L 80 100" 
              stroke="#93C5FD" 
              strokeWidth="2.5" 
              opacity="0.3"/>
        
        {/* Sparkle accents */}
        <circle cx="105" cy="35" r="3" fill="#60A5FA">
          <animate attributeName="opacity" values="0.5;1;0.5" dur="2s" repeatCount="indefinite"/>
        </circle>
        <circle cx="55" cy="100" r="2.5" fill="#93C5FD">
          <animate attributeName="opacity" values="0.4;1;0.4" dur="2.5s" repeatCount="indefinite"/>
        </circle>
      </g>
      
      {/* Quisells text with enhanced styling */}
      <text x="210" y="118" 
            fontFamily="'Poppins', 'Inter', 'Segoe UI', sans-serif" 
            fontSize="88" 
            fontWeight="800" 
            fill="#0F172A"
            letterSpacing="-2">Quisells</text>
      
      {/* Blue gradient accent dot on 'i' */}
      <circle cx="320" cy="68" r="7" fill="url(#blueGradient)">
        <animate attributeName="r" values="7;8;7" dur="2s" repeatCount="indefinite"/>
      </circle>
      
      {/* Enhanced energy wave beneath */}
      <path d="M 210 142 Q 235 137, 260 142 Q 285 147, 310 142 Q 335 137, 360 142" 
            stroke="url(#blueGradient)" 
            strokeWidth="4.5" 
            strokeLinecap="round"
            fill="none"
            opacity="0.6"/>
      
      {/* Additional subtle wave for depth */}
      <path d="M 210 148 Q 235 145, 260 148 Q 285 151, 310 148 Q 335 145, 360 148" 
            stroke="url(#lightBlue)" 
            strokeWidth="2.5" 
            strokeLinecap="round"
            fill="none"
            opacity="0.4"/>
    </svg>
  </Link>
</div>
          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-6 xl:space-x-8">
            <Link 
              to="/services" 
              className="text-gray-700 hover:text-blue-600 font-medium transition-colors"
            >
              Services
            </Link>
            <Link 
              to="/servicesList" 
              className="text-gray-700 hover:text-blue-600 font-medium transition-colors"
            >
              Find Services
            </Link>
            <Link 
              to="/products" 
              className="text-gray-700 hover:text-blue-600 font-medium transition-colors"
            >
              Products
            </Link>
            <Link 
              to="/become-seller" 
              className="text-gray-700 hover:text-blue-600 font-medium transition-colors"
            >
              Become a Seller
            </Link>
            <Link 
              to="/help" 
              className="text-gray-700 hover:text-blue-600 font-medium transition-colors"
            >
              Help
            </Link>
          </nav>

          {/* Desktop Action Buttons */}
          <div className="hidden lg:flex items-center space-x-3">
            {/* Desktop Search */}
            <div className="relative">
              {isSearchOpen ? (
                <form onSubmit={handleSearchSubmit} className="flex items-center">
                  <div className="relative">
                    <input
                      ref={searchInputRef}
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search services, products..."
                      className="w-64 pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                    <Search size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  </div>
                  <button
                    type="button"
                    onClick={handleSearchClose}
                    className="ml-2 p-2 text-gray-600 hover:text-red-600 hover:bg-gray-100 rounded-md transition-colors"
                  >
                    <X size={18} />
                  </button>
                </form>
              ) : (
                <button 
                  onClick={handleSearchToggle}
                  className="p-2 text-gray-600 hover:text-blue-600 hover:bg-gray-100 rounded-md transition-colors"
                  aria-label="Search"
                >
                  <Search size={20} />
                </button>
              )}
            </div>

            {/* Dashboard Button - Only visible when logged in */}
            {user && (
              <button 
                onClick={handleDashboardRedirect}
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors flex items-center font-medium focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
              >
                <LayoutDashboard size={16} className="mr-2" />
                <span className="hidden xl:inline">{getDashboardButtonText()}</span>
                <span className="xl:hidden">Dashboard</span>
              </button>
            )}
            
            {user ? (
              <div className="flex items-center space-x-3">
                {(user as any)?.id && <NotificationBell userId={(user as any).id} />}
                <div className="flex items-center space-x-3">
                  <span className="text-gray-700 font-medium">
                       Hi, {user?.full_name || 'User'}
                  </span>

                  <button 
                    onClick={logout}
                    className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                  >
                    Logout
                  </button>
                </div>
              </div>
            ) : (
              <div className="relative" ref={authDropdownRef}>
                <button 
                  onClick={() => setIsAuthDropdownOpen(!isAuthDropdownOpen)}
                  className="px-4 py-2 border-2 border-blue-600 text-blue-600 rounded-md hover:bg-blue-50 transition-colors flex items-center font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                >
                  <User size={16} className="mr-2" />
                  Login or Register
                  <ChevronDown size={16} className="ml-2" />
                </button>
                
                {isAuthDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-md shadow-lg py-1 z-50">
                    <button
                      onClick={() => handleAuthNavigation('/login')}
                      className="w-full text-left px-4 py-2 text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors"
                    >
                      Login
                    </button>
                    <button
                      onClick={() => handleAuthNavigation('/register')}
                      className="w-full text-left px-4 py-2 text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors"
                    >
                      Register
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Mobile/Tablet Action Buttons */}
          <div className="flex lg:hidden items-center space-x-2">
            {/* Mobile Search */}
            <button 
              onClick={handleSearchToggle}
              className="p-2 text-gray-600 hover:text-blue-600 hover:bg-gray-100 rounded-md transition-colors"
              aria-label="Search"
            >
              <Search size={20} />
            </button>

            {/* Mobile Dashboard Button - Only visible when logged in */}
            {user && (
              <button 
                onClick={handleDashboardRedirect}
                className="p-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
                aria-label={getDashboardButtonText()}
              >
                <LayoutDashboard size={20} />
              </button>
            )}

            {/* Notification bell for authenticated users on mobile/tablet */}
            {user && (user as any)?.id && (
              <div className="hidden sm:block">
                <NotificationBell userId={(user as any).id} />
              </div>
            )}

            {/* Mobile Menu Button */}
            <button 
              className="p-2 text-gray-600 hover:text-blue-600 hover:bg-gray-100 rounded-md transition-colors" 
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              aria-label="Toggle navigation menu"
              aria-expanded={isMenuOpen}
            >
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Search Bar */}
        {isSearchOpen && (
          <div className="lg:hidden mt-4 pb-2">
            <form onSubmit={handleSearchSubmit}>
              <div className="relative">
                <input
                  ref={searchInputRef}
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search services, products..."
                  className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                <Search size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <button
                  type="button"
                  onClick={handleSearchClose}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 text-gray-600 hover:text-red-600 rounded-md transition-colors"
                >
                  <X size={18} />
                </button>
              </div>
            </form>
          </div>
        )}
      </div>

      {/* Mobile/Tablet Menu */}
      {isMenuOpen && (
        <div className="lg:hidden bg-white border-t shadow-lg">
          <div className="container mx-auto px-4 py-4">
            {/* Navigation Links */}
            <nav className="flex flex-col space-y-1 mb-4">
              <Link 
                to="/services" 
                className="py-3 px-2 text-gray-700 hover:text-blue-600 hover:bg-gray-50 rounded-md transition-colors font-medium" 
                onClick={handleMenuClose}
              >
                Services
              </Link>
              <Link 
                to="/servicesList" 
                className="py-3 px-2 text-gray-700 hover:text-blue-600 hover:bg-gray-50 rounded-md transition-colors font-medium" 
                onClick={handleMenuClose}
              >
                Find Services
              </Link>
              <Link 
                to="/products" 
                className="py-3 px-2 text-gray-700 hover:text-blue-600 hover:bg-gray-50 rounded-md transition-colors font-medium" 
                onClick={handleMenuClose}
              >
                Products
              </Link>
              <Link 
                to="/become-seller" 
                className="py-3 px-2 text-gray-700 hover:text-blue-600 hover:bg-gray-50 rounded-md transition-colors font-medium" 
                onClick={handleMenuClose}
              >
                Become a Seller
              </Link>
              <Link 
                to="/help" 
                className="py-3 px-2 text-gray-700 hover:text-blue-600 hover:bg-gray-50 rounded-md transition-colors font-medium" 
                onClick={handleMenuClose}
              >
                Help
              </Link>
            </nav>

            {/* Mobile Dashboard Section - Only visible when logged in */}
            {user && (
              <div className="mb-4 pb-4 border-b border-gray-200">
                <button 
                  onClick={handleDashboardRedirect}
                  className="w-full px-4 py-3 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors font-medium flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
                >
                  <LayoutDashboard size={18} className="mr-2" />
                  {getDashboardButtonText()}
                </button>
              </div>
            )}

            {/* User Authentication Section */}
            <div className="pt-4 border-t border-gray-200">
              {user ? (
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-2">
                    <span className="text-gray-700 font-medium">
                     Welcome, {user?.full_name || 'User'}
                    </span>
                    {(user as any)?.id && (
                      <div className="sm:hidden">
                        <NotificationBell userId={(user as any).id} />
                      </div>
                    )}
                  </div>
                  <button 
                    onClick={handleLogout}
                    className="w-full px-4 py-3 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors font-medium focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                  >
                    Logout
                  </button>
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="border-2 border-blue-600 rounded-md p-2">
                    <button
                      onClick={() => handleAuthNavigation('/login')}
                      className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors font-medium mb-2"
                    >
                      Login
                    </button>
                    <button
                      onClick={() => handleAuthNavigation('/register')}
                      className="w-full px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors font-medium"
                    >
                      Register
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}