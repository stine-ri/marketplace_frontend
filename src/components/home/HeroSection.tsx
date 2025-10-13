import React, { useState } from 'react';
import { Search, TrendingUp, Sparkles, X, ChevronRight } from 'lucide-react';

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
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState<'success' | 'error' | 'info'>('info');

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
    setToastMessage(message);
    setToastType(type);
    setTimeout(() => setToastMessage(''), 4000);
  };

  const handleSearch = async () => {
    if (!searchQuery.trim() && searchType !== 'productsAll') {
      showToast('Please enter a search term', 'error');
      return;
    }

    setIsSearching(true);
    setShowResults(true);

    try {
      let endpoint = '';
      let url = '';

      switch (searchType) {
        case 'services':
          endpoint = 'https://mkt-backend-sz2s.onrender.com/api/services';
          url = `${endpoint}?q=${encodeURIComponent(searchQuery.toLowerCase())}`;
          break;
        case 'products':
          endpoint = 'https://mkt-backend-sz2s.onrender.com/api/products/search';
          url = `${endpoint}?q=${encodeURIComponent(searchQuery.toLowerCase())}`;
          break;
        case 'productsAll':
          url = 'https://mkt-backend-sz2s.onrender.com/api/products';
          break;
        default:
          throw new Error('Invalid search type');
      }

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);

      const response = await fetch(url, {
        signal: controller.signal,
      });

      clearTimeout(timeoutId);
      
      let data = await response.json();
      let apiResults = Array.isArray(data) ? data : data?.data || [];

      // Additional client-side filtering for services if backend doesn't filter properly
      if (searchType === 'services' && searchQuery.trim()) {
        const searchTerm = searchQuery.toLowerCase().trim();
        apiResults = apiResults.filter((item: any) => {
          const nameMatch = item.name?.toLowerCase().includes(searchTerm);
          const categoryMatch = item.category?.toLowerCase().includes(searchTerm);
          const descriptionMatch = item.description?.toLowerCase().includes(searchTerm);
          return nameMatch || categoryMatch || descriptionMatch;
        });
      }

      if (apiResults.length === 0) {
        setSearchResults([]);
        if (searchType === 'productsAll') {
          showToast('No products available at the moment. Please check back later!', 'info');
        } else {
          showToast(`No ${searchType} found for "${searchQuery}". Try different keywords!`, 'info');
        }
      } else {
        const formattedResults = apiResults.map((item: any) => {
          // Format provider information
          let providerInfo = null;
          if (item.provider) {
            if (typeof item.provider === 'string') {
              providerInfo = { name: item.provider };
            } else {
              providerInfo = {
                name: item.provider.firstName && item.provider.lastName
                  ? `${item.provider.firstName} ${item.provider.lastName}`.trim()
                  : item.provider.firstName || item.provider.lastName || 'Unknown Provider',
                phone: item.provider.phone || item.provider.phoneNumber || null,
                rating: item.provider.rating || null,
                profileImage: item.provider.profileImageUrl || item.provider.profileImage || null
              };
            }
          }

          return {
            id: item.id,
            name: item.name,
            category: item.category || item.categoryName || 'Uncategorized',
            description: item.description,
            price: item.price ? Number(item.price) : null,
            images: item.images || (item.image ? [item.image] : []),
            provider: providerInfo,
            providerCount: item.providerCount || null,
          };
        });

        setSearchResults(formattedResults);
        showToast(`Found ${formattedResults.length} results`, 'success');
      }
    } catch (err: any) {
      console.error('Search error:', err);
      let errorMessage = 'Search temporarily unavailable. Please try again later.';
      if (err.name === 'AbortError') {
        errorMessage = 'Search timed out. Please try again.';
      }
      showToast(errorMessage, 'error');
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

  const popularSearches = [
    { term: 'Cleaning', type: 'services', icon: '✨' },
    { term: 'Plumbing', type: 'services', icon: '🔧' },
    { term: 'Furniture', type: 'products', icon: '🛋️' },
    { term: 'Handmade Crafts', type: 'products', icon: '🎨' },
  ];

  return (
    <>
      <section 
        className="relative bg-gradient-to-br from-indigo-600 via-purple-600 to-blue-700 text-white overflow-hidden"
        role="search"
        aria-label="Hero search section"
      >
        {/* Animated Background Elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse" style={{ animationDelay: '1s' }}></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-indigo-500 rounded-full mix-blend-multiply filter blur-xl opacity-10 animate-pulse" style={{ animationDelay: '2s' }}></div>
        </div>

        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-24 relative z-10">
          <div className="max-w-4xl mx-auto">
            {/* Header Content */}
            <div className="text-center mb-8 sm:mb-12 animate-fadeIn">
              <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full mb-6 text-sm font-medium">
                <Sparkles size={16} className="text-yellow-300" />
                <span>Trusted by 10,000+ customers</span>
              </div>
              
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-4 sm:mb-6 leading-tight">
                Find Local Services &<br className="hidden sm:block" />
                <span className="bg-gradient-to-r from-yellow-300 to-pink-300 bg-clip-text text-transparent">
                  Quality Products
                </span>
              </h1>
              
              <p className="text-base sm:text-lg md:text-xl text-blue-50 max-w-2xl mx-auto px-4">
                Connect with verified local service providers and discover unique products from trusted sellers in your area
              </p>
            </div>
            
            {/* Enhanced Search Bar */}
            <div className="bg-white rounded-2xl shadow-2xl p-2 sm:p-3 backdrop-blur-lg max-w-3xl mx-auto transform transition-all hover:shadow-3xl">
              <div className="flex flex-col lg:flex-row gap-2">
                {/* Search Input */}
                <div className="flex-grow relative">
                  <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                    <Search size={20} className="text-gray-400" />
                  </div>
                  <input 
                    type="search"
                    placeholder="Search for services or products..."
                    className="w-full pl-12 pr-4 py-3 sm:py-4 text-gray-800 bg-gray-50 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all text-sm sm:text-base"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={handleKeyDown}
                    aria-label="Search query"
                  />
                </div>
                
                {/* Type Selector */}
                <div className="relative w-full lg:w-auto">
                  <select 
                    className="appearance-none w-full lg:w-40 bg-gray-50 border-0 px-4 py-3 sm:py-4 text-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer text-sm sm:text-base font-medium"
                    value={searchType}
                    onChange={(e) => setSearchType(e.target.value as 'services' | 'products')}
                    aria-label="Search type"
                  >
                    <option value="services">Services</option>
                    <option value="products">Products</option>
                  </select>
                  <ChevronRight size={16} className="absolute right-4 top-1/2 transform -translate-y-1/2 rotate-90 text-gray-500 pointer-events-none" />
                </div>
                
                {/* Search Button */}
                <button 
                  className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white px-6 sm:px-8 py-3 sm:py-4 rounded-xl flex items-center justify-center gap-2 transition-all transform hover:scale-105 active:scale-95 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none text-sm sm:text-base font-semibold"
                  onClick={handleSearch}
                  disabled={isSearching}
                  aria-label="Search button"
                >
                  {isSearching ? (
                    <>
                      <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      <span className="hidden sm:inline">Searching...</span>
                    </>
                  ) : (
                    <>
                      <Search size={20} />
                      <span className="hidden sm:inline">Search</span>
                    </>
                  )}
                </button>
              </div>
            </div>
            
            {/* Search Results */}
            {showResults && (
              <div className="mt-6 bg-white rounded-2xl shadow-2xl max-w-3xl mx-auto overflow-hidden animate-slideUp">
                {searchResults.length === 0 ? (
                  <div className="p-8 sm:p-12 text-center">
                    <div className="text-6xl sm:text-7xl mb-4 opacity-50">🔍</div>
                    <h3 className="text-lg sm:text-xl font-semibold text-gray-800 mb-2">No results found</h3>
                    <p className="text-sm sm:text-base text-gray-600 mb-1">
                      {searchQuery ? (
                        <>We couldn't find any {searchType} matching "<strong className="text-gray-800">{searchQuery}</strong>"</>
                      ) : (
                        <>No {searchType} available at the moment</>
                      )}
                    </p>
                    <p className="text-xs sm:text-sm text-gray-500 mb-6">
                      Try different keywords or check back soon as we add new listings daily
                    </p>
                    <button 
                      onClick={() => setShowResults(false)}
                      className="inline-flex items-center gap-2 text-indigo-600 hover:text-indigo-700 font-medium text-sm sm:text-base transition-colors"
                    >
                      <X size={16} />
                      Close results
                    </button>
                  </div>
                ) : (
                  <>
                    <div className="p-4 sm:p-5 bg-gradient-to-r from-indigo-50 to-purple-50 border-b flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <TrendingUp size={18} className="text-indigo-600" />
                        <span className="text-sm sm:text-base text-gray-700 font-medium">
                          <strong className="text-indigo-600">{searchResults.length}</strong> {searchType}{searchResults.length !== 1 ? 's' : ''} found
                          {searchQuery && <span className="hidden sm:inline"> for "{searchQuery}"</span>}
                        </span>
                      </div>
                      <button 
                        onClick={() => setShowResults(false)}
                        className="text-gray-500 hover:text-gray-700 p-1 hover:bg-white rounded-lg transition-all"
                        aria-label="Close results"
                      >
                        <X size={20} />
                      </button>
                    </div>
                    <div className="max-h-96 sm:max-h-[28rem] overflow-y-auto">
                      <ul className="divide-y divide-gray-100">
                        {searchResults.map((item, index) => (
                          <li 
                            key={item.id} 
                            className="p-4 sm:p-5 hover:bg-gradient-to-r hover:from-indigo-50 hover:to-purple-50 transition-all cursor-pointer group"
                            style={{ animationDelay: `${index * 50}ms` }}
                          >
                            <div className="flex gap-4">
                              {item.images?.[0] ? (
                                <div className="flex-shrink-0">
                                  <img 
                                    src={item.images[0]} 
                                    alt={item.name}
                                    className="w-16 h-16 sm:w-20 sm:h-20 object-cover rounded-xl shadow-md group-hover:shadow-lg transition-shadow"
                                  />
                                </div>
                              ) : (
                                <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-xl flex items-center justify-center flex-shrink-0">
                                  <span className="text-2xl sm:text-3xl">{searchType === 'services' ? '🛠️' : '📦'}</span>
                                </div>
                              )}
                              <div className="flex-1 min-w-0">
                                <h3 className="font-semibold text-gray-900 text-base sm:text-lg mb-1 truncate group-hover:text-indigo-600 transition-colors">
                                  {item.name}
                                </h3>
                                <p className="text-xs sm:text-sm text-indigo-600 font-medium mb-2 inline-flex items-center gap-1">
                                  <span className="w-2 h-2 bg-indigo-600 rounded-full"></span>
                                  {item.category}
                                </p>
                                {item.description && (
                                  <p className="text-xs sm:text-sm text-gray-600 line-clamp-2 mb-2">{item.description}</p>
                                )}
                                <div className="flex flex-col gap-2">
                                  {/* Price */}
                                  {item.price !== null && item.price !== undefined && (
                                    <span className="text-sm sm:text-base font-bold text-indigo-600">
                                      {formatPrice(item.price)}
                                    </span>
                                  )}
                                  
                                  {/* Provider Info for Products */}
                                  {searchType !== 'services' && item.provider && (
                                    <div className="flex flex-col gap-1">
                                      <div className="flex items-center gap-2">
                                        {item.provider.profileImage && (
                                          <img 
                                            src={item.provider.profileImage} 
                                            alt={item.provider.name}
                                            className="w-6 h-6 rounded-full object-cover"
                                          />
                                        )}
                                        <span className="text-xs text-gray-700 font-medium">
                                          {item.provider.name || 'Unknown Seller'}
                                        </span>
                                        {item.provider.rating && (
                                          <span className="text-xs text-yellow-600 flex items-center gap-0.5">
                                            ⭐ {Number(item.provider.rating).toFixed(1)}
                                          </span>
                                        )}
                                      </div>
                                      {item.provider.phone && (
                                        <a 
                                          href={`tel:${item.provider.phone}`}
                                          className="text-xs text-blue-600 hover:text-blue-700 flex items-center gap-1 font-medium"
                                        >
                                          📞 {item.provider.phone}
                                        </a>
                                      )}
                                    </div>
                                  )}
                                  
                                  {/* Provider Count for Services */}
                                  {searchType === 'services' && item.providerCount !== null && (
                                    <span className="text-xs text-gray-600 bg-green-50 px-2 py-1 rounded-full inline-flex items-center gap-1 w-fit">
                                      <span className="text-green-600">✓</span>
                                      {item.providerCount} {item.providerCount === 1 ? 'Provider' : 'Providers'} Available
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </>
                )}
              </div>
            )}
            
            {/* Popular Searches */}
            <div className="mt-8 sm:mt-10 text-center">
              <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3">
                <span className="text-xs sm:text-sm text-blue-100 font-medium flex items-center gap-1">
                  <TrendingUp size={14} />
                  Popular searches:
                </span>
                {popularSearches.map((item, index) => (
                  <button 
                    key={index}
                    onClick={() => {
                      setSearchQuery(item.term);
                      setSearchType(item.type as 'services' | 'products');
                    }} 
                    className="inline-flex items-center gap-1.5 bg-white/10 hover:bg-white/20 backdrop-blur-sm px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm font-medium transition-all hover:scale-105 active:scale-95"
                  >
                    <span>{item.icon}</span>
                    <span>{item.term}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Wave Divider */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-auto">
            <path d="M0 120L60 110C120 100 240 80 360 70C480 60 600 60 720 65C840 70 960 80 1080 85C1200 90 1320 90 1380 90L1440 90V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0Z" fill="white"/>
          </svg>
        </div>
      </section>

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-50 animate-slideUp">
          <div className={`px-4 sm:px-6 py-3 sm:py-4 rounded-xl shadow-2xl backdrop-blur-lg max-w-sm ${
            toastType === 'error' ? 'bg-red-500 text-white' :
            toastType === 'success' ? 'bg-green-500 text-white' :
            'bg-blue-500 text-white'
          }`}>
            <div className="flex items-center gap-3">
              <span className="text-lg sm:text-xl">
                {toastType === 'error' ? '❌' : toastType === 'success' ? '✅' : 'ℹ️'}
              </span>
              <p className="text-sm sm:text-base font-medium">{toastMessage}</p>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.6s ease-out;
        }
        .animate-slideUp {
          animation: slideUp 0.4s ease-out;
        }
      `}</style>
    </>
  );
}