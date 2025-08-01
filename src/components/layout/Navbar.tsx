import React, { useState, ReactNode } from 'react';
import { Search, Menu, X, User } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import NotificationBell from '../NewFeature/NotificationBell';

interface NavbarProps {
  children?: ReactNode;
}

export function Navbar({ children }: NavbarProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user, logout } = useAuth();

  const handleMenuClose = () => setIsMenuOpen(false);

  const handleLogout = () => {
    logout();
    setIsMenuOpen(false);
  };

  return (
    <header className="bg-white shadow-sm sticky top-0 z-50">
      <div className="container mx-auto px-4 py-3 sm:py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center flex-shrink-0">
            <Link 
              to="/" 
              className="text-xl sm:text-2xl font-bold text-blue-600 hover:text-blue-700 transition-colors"
            >
              Quisells
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
            <button 
              className="p-2 text-gray-600 hover:text-blue-600 hover:bg-gray-100 rounded-md transition-colors"
              aria-label="Search"
            >
              <Search size={20} />
            </button>
            
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
              <div className="flex items-center space-x-2">
                <Link 
                  to="/login" 
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                >
                  <User size={16} className="mr-2" />
                  Sign In
                </Link>
                <Link 
                  to="/register" 
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
                >
                  Register
                </Link>
              </div>
            )}
          </div>

          {/* Mobile/Tablet Action Buttons */}
          <div className="flex lg:hidden items-center space-x-2">
            {/* Search button for mobile/tablet */}
            <button 
              className="p-2 text-gray-600 hover:text-blue-600 hover:bg-gray-100 rounded-md transition-colors"
              aria-label="Search"
            >
              <Search size={20} />
            </button>

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
                  <Link 
                    to="/login" 
                    className="w-full px-4 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors font-medium text-center block focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                    onClick={handleMenuClose}
                  >
                    Sign In
                  </Link>
                  <Link 
                    to="/register" 
                    className="w-full px-4 py-3 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors font-medium text-center block focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
                    onClick={handleMenuClose}
                  >
                    Register
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}