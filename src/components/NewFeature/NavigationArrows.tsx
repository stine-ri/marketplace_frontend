import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/solid';

interface NavigationArrowsProps {
  className?: string;
}

export const NavigationArrows: React.FC<NavigationArrowsProps> = ({ className = '' }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  // Don't show arrows on login and register pages
  const isAuthPage = location.pathname === '/login' || location.pathname === '/register';
  
  // Hide arrows when scrolling down, show when scrolling up
  useEffect(() => {
    if (isAuthPage) return;

    const controlNavbar = () => {
      if (typeof window !== 'undefined') {
        if (window.scrollY > lastScrollY && window.scrollY > 100) {
          setIsVisible(false);
        } else {
          setIsVisible(true);
        }
        setLastScrollY(window.scrollY);
      }
    };

    window.addEventListener('scroll', controlNavbar);
    return () => window.removeEventListener('scroll', controlNavbar);
  }, [lastScrollY, isAuthPage]);

  if (isAuthPage) {
    return null;
  }

  const handleGoBack = () => {
    navigate(-1);
  };

  const handleGoForward = () => {
    navigate(1);
  };

  return (
    <div className={`fixed bottom-6 right-6 z-50 flex items-center space-x-2 transition-all duration-300 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-20 opacity-0'} ${className}`}>
      <button
        onClick={handleGoBack}
        className="p-3 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full shadow-lg hover:from-blue-600 hover:to-blue-700 transition-all duration-300 transform hover:-translate-y-1 focus:outline-none focus:ring-4 focus:ring-blue-300/50 group"
        aria-label="Go back"
      >
        <ChevronLeftIcon className="w-5 h-5 text-white transition-transform duration-300 group-hover:scale-110" />
      </button>
      
      <button
        onClick={handleGoForward}
        className="p-3 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full shadow-lg hover:from-blue-600 hover:to-blue-700 transition-all duration-300 transform hover:-translate-y-1 focus:outline-none focus:ring-4 focus:ring-blue-300/50 group"
        aria-label="Go forward"
      >
        <ChevronRightIcon className="w-5 h-5 text-white transition-transform duration-300 group-hover:scale-110" />
      </button>
    </div>
  );
};