import React, { useState } from 'react';
import { Search, Menu, X, ShoppingCart, User } from 'lucide-react';
export const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  return <header className="bg-white shadow-sm sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center">
          <span className="text-2xl font-bold text-blue-600">MarketHub</span>
        </div>
        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-8">
          <a href="#" className="text-gray-700 hover:text-blue-600 font-medium">
            Services
          </a>
          <a href="#" className="text-gray-700 hover:text-blue-600 font-medium">
            Products
          </a>
          <a href="#" className="text-gray-700 hover:text-blue-600 font-medium">
            Become a Seller
          </a>
          <a href="#" className="text-gray-700 hover:text-blue-600 font-medium">
            Help
          </a>
        </nav>
        {/* Desktop Action Buttons */}
        <div className="hidden md:flex items-center space-x-4">
          <button className="p-2 text-gray-600 hover:text-blue-600">
            <Search size={20} />
          </button>
          <button className="p-2 text-gray-600 hover:text-blue-600">
            <ShoppingCart size={20} />
          </button>
          <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center">
            <User size={16} className="mr-2" />
            Sign In
          </button>
        </div>
        {/* Mobile Menu Button */}
        <button className="md:hidden p-2 text-gray-600" onClick={() => setIsMenuOpen(!isMenuOpen)}>
          {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>
      {/* Mobile Menu */}
      {isMenuOpen && <div className="md:hidden bg-white border-t">
          <div className="container mx-auto px-4 py-3 flex flex-col space-y-3">
            <a href="#" className="py-2 text-gray-700">
              Services
            </a>
            <a href="#" className="py-2 text-gray-700">
              Products
            </a>
            <a href="#" className="py-2 text-gray-700">
              Become a Seller
            </a>
            <a href="#" className="py-2 text-gray-700">
              Help
            </a>
            <div className="pt-2 flex space-x-4 border-t">
              <button className="p-2 text-gray-600">
                <Search size={20} />
              </button>
              <button className="p-2 text-gray-600">
                <ShoppingCart size={20} />
              </button>
              <button className="px-4 py-2 bg-blue-600 text-white rounded-md flex-grow flex items-center justify-center">
                <User size={16} className="mr-2" />
                Sign In
              </button>
            </div>
          </div>
        </div>}
    </header>;
};