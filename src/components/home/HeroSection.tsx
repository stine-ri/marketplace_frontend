import React, { useState, useEffect } from 'react';
import { Search } from 'lucide-react';
import axios, { AxiosError } from 'axios';
import { toast } from 'react-hot-toast';

type ResultItem = {
  id: number | string;
  name: string;
  category: string;
  description: string;
  price: number;
  images?: string[];
  image?: string;
  provider?: string;
};

const formatPrice = (price: number | string | undefined | null): string => {
  if (price === undefined || price === null) return 'KSh 0.00';
  
  // Convert price to number if it's a string
  const numericPrice = typeof price === 'string' ? parseFloat(price) : price;
  
  if (isNaN(numericPrice)) return 'KSh 0.00';
  
  return `KSh ${numericPrice.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}`;
};

export const HeroSection = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchType, setSearchType] = useState<'services' | 'products' | 'productsAll'>('services');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);

const handleSearch = async () => {
  // Only require search term for services and products search (not for productsAll)
  if (!searchQuery.trim() && searchType !== 'productsAll') {
    toast.error('Please enter a search term');
    return;
  }

  setIsSearching(true);
  setShowResults(true);

  try {
    let endpoint = '';
    let params = {};

    switch (searchType) {
      case 'services':
        endpoint = 'https://mkt-backend-sz2s.onrender.com/api/services';
        params = { q: searchQuery.toLowerCase() };
        break;
      case 'products':
        endpoint = 'https://mkt-backend-sz2s.onrender.com/api/products/search';
        params = { q: searchQuery.toLowerCase() };
        break;
      case 'productsAll':
        endpoint = 'https://mkt-backend-sz2s.onrender.com/api/products';
        params = {}; // No search params for productsAll
        break;
      default:
        throw new Error('Invalid search type');
    }

    const response = await axios.get(endpoint, {
      params,
      timeout: 10000,
      validateStatus: (status) => status < 500,
    });

    // Handle different response formats
    const apiResults = Array.isArray(response.data) 
      ? response.data 
      : response.data?.data || [];

    if (apiResults.length === 0) {
      setSearchResults([]);
      toast(
        searchType === 'productsAll'
          ? 'No products found'
          : `${searchQuery} is not yet in our system, but coming soon!`,
        { icon: 'ℹ️' }
      );
    } else {
      const formattedResults = apiResults.map((item: any) => ({
        id: item.id,
        name: item.name,
        category: item.category,
        description: item.description,
        price: item.price ? Number(item.price) : null,
        images: item.images || (item.image ? [item.image] : []),
        provider: item.provider || 'Unknown Provider',
      }));

      setSearchResults(formattedResults);
    }
  } catch (err: any) {
    console.error('Search error:', err);
    
    let errorMessage = 'Failed to search. Please try again.';
    if (axios.isAxiosError(err)) {
      errorMessage = err.response?.data?.error || err.message;
    } else if (err instanceof Error) {
      errorMessage = err.message;
    }

    toast.error(errorMessage);
    setSearchResults([]);
  } finally {
    setIsSearching(false);
  }
};

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <section className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white py-16 lg:py-24 relative">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">
            Find Services & Products in One Place
          </h1>
          <p className="text-xl mb-8 text-blue-100">
            Discover local service providers and unique products from sellers
            around the world.
          </p>
          
          {/* Search Bar */}
          <div className="bg-white rounded-lg p-2 flex flex-col md:flex-row items-center shadow-lg max-w-2xl mx-auto">
            <div className="flex-grow relative w-full mb-2 md:mb-0">
              <input 
                type="text" 
                placeholder="What are you looking for?" 
                className="w-full px-4 py-3 text-gray-800 focus:outline-none rounded-md md:rounded-r-none"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={handleKeyDown}
              />
            </div>
            
            <div className="relative w-full md:w-auto">
              <select 
                className="appearance-none bg-gray-100 border border-gray-300 md:border-l-0 px-4 py-3 text-gray-700 focus:outline-none rounded-md md:rounded-none w-full"
                value={searchType}
                onChange={(e) => setSearchType(e.target.value as 'services' | 'products')}
              >
                <option value="services">Services</option>
                <option value="products">Products</option>
              </select>
            </div>
            
            <button 
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-md flex items-center justify-center w-full md:w-auto mt-2 md:mt-0 md:rounded-l-none"
              onClick={handleSearch}
              disabled={isSearching}
            >
              {isSearching ? (
                <span className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Searching...
                </span>
              ) : (
                <span className="flex items-center">
                  <Search size={20} className="mr-2" />
                  Search
                </span>
              )}
            </button>
          </div>
          
          {/* Search Results */}
          {showResults && (
            <div className="mt-4 bg-white rounded-lg shadow-lg max-w-2xl mx-auto text-left max-h-96 overflow-y-auto">
              {searchResults.length === 0 ? (
                <div className="p-4 text-gray-700">
                  No {searchType} found for "{searchQuery}". Coming soon!
                </div>
              ) : (
                <ul className="divide-y divide-gray-200">
                  {searchResults.map((item) => (
                    <li key={item.id} className="p-4 hover:bg-gray-50 transition-colors">
                      <div className="flex items-start">
                        {item.images?.[0] && (
                          <img 
                            src={item.images[0]} 
                            alt={item.name} 
                            className="w-16 h-16 object-cover rounded-md mr-4"
                          />
                        )}
                        <div>
                          <h3 className="font-medium text-gray-900">{item.name}</h3>
                          <p className="text-sm text-gray-500">{item.category}</p>
                          {item.description && (
                            <p className="text-sm text-gray-600 mt-1">{item.description}</p>
                          )}
                          {item.price && (
                            <p className="text-sm font-medium text-blue-600 mt-1">
                              {formatPrice(item.price)}
                            </p>
                          )}
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
          
          {/* Popular Searches */}
          <div className="mt-8 flex flex-wrap justify-center gap-4 text-sm">
            <span className="text-blue-100">Popular:</span>
            <button 
              onClick={() => {
                setSearchQuery('Cleaning');
                setSearchType('services');
              }} 
              className="text-white hover:underline"
            >
              Cleaning
            </button>
            <button 
              onClick={() => {
                setSearchQuery('Plumbing');
                setSearchType('services');
              }} 
              className="text-white hover:underline"
            >
              Plumbing
            </button>
            <button 
              onClick={() => {
                setSearchQuery('Furniture');
                setSearchType('products');
              }} 
              className="text-white hover:underline"
            >
              Furniture
            </button>
            <button 
              onClick={() => {
                setSearchQuery('Handmade Crafts');
                setSearchType('products');
              }} 
              className="text-white hover:underline"
            >
              Handmade Crafts
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};