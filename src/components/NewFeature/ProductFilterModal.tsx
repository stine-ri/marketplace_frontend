import { useState, useEffect } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { toast } from 'react-toastify';

interface ProductFilterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApply: (filters: {
    category: string;
    minPrice: string;
    maxPrice: string;
    collegeId: string;
  }) => void;
  currentFilters: {
    category: string;
    minPrice: string;
    maxPrice: string;
    collegeId: string;
  };
}

interface College {
  id: number;
  name: string;
}

interface Category {
  id: number;
  name: string;
  description?: string;
  isActive: boolean;
}

export const ProductFilterModal = ({
  isOpen,
  onClose,
  onApply,
  currentFilters
}: ProductFilterModalProps) => {
  const [filters, setFilters] = useState(currentFilters);
  const [colleges, setColleges] = useState<College[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState({
    colleges: false,
    categories: false
  });
  const [error, setError] = useState({
    colleges: '',
    categories: ''
  });

  const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://mkt-backend-sz2s.onrender.com';

  const getAuthHeaders = () => {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('No authentication token found');
    }
    return {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    };
  };

  const fetchColleges = async () => {
    try {
      setLoading(prev => ({ ...prev, colleges: true }));
      setError(prev => ({ ...prev, colleges: '' }));
      
      const headers = getAuthHeaders();
      const response = await fetch(`${BASE_URL}/api/colleges`, { headers });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setColleges(data);
    } catch (err) {
      console.error('Error fetching colleges:', err);
      setError(prev => ({ ...prev, colleges: 'Failed to load colleges' }));
      toast.error('Failed to load colleges');
    } finally {
      setLoading(prev => ({ ...prev, colleges: false }));
    }
  };

  const fetchCategories = async () => {
    try {
      setLoading(prev => ({ ...prev, categories: true }));
      setError(prev => ({ ...prev, categories: '' }));
      
      const headers = getAuthHeaders();
      const response = await fetch(`${BASE_URL}/api/admin/categories`, { headers });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const categoriesData: Category[] = await response.json();
      // Filter only active categories
      const activeCategories = categoriesData.filter(category => category.isActive);
      setCategories(activeCategories);
    } catch (err) {
      console.error('Error fetching categories:', err);
      setError(prev => ({ ...prev, categories: 'Failed to load categories' }));
      toast.error('Failed to load categories');
    } finally {
      setLoading(prev => ({ ...prev, categories: false }));
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchColleges();
      fetchCategories();
    }
  }, [isOpen]);

  const handleApply = () => {
    onApply(filters);
    onClose();
  };

  const handleReset = () => {
    setFilters({
      category: '',
      minPrice: '',
      maxPrice: '',
      collegeId: ''
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-medium text-gray-900">Filter Products</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-500"
            >
              <XMarkIcon className="h-6 w-6" />
            </button>
          </div>

          {/* Category Filter */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Category
            </label>
            {loading.categories ? (
              <div className="animate-pulse h-10 bg-gray-200 rounded-md"></div>
            ) : error.categories ? (
              <div className="text-red-500 text-sm">{error.categories}</div>
            ) : (
              <select
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                value={filters.category}
                onChange={(e) => setFilters({...filters, category: e.target.value})}
              >
                <option value="">All Categories</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Price Range Filter */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Price Range
            </label>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-gray-500 mb-1">Min</label>
                <input
                  type="number"
                  placeholder="Min price"
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  value={filters.minPrice}
                  onChange={(e) => setFilters({...filters, minPrice: e.target.value})}
                  min="0"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Max</label>
                <input
                  type="number"
                  placeholder="Max price"
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  value={filters.maxPrice}
                  onChange={(e) => setFilters({...filters, maxPrice: e.target.value})}
                  min={filters.minPrice || "0"}
                />
              </div>
            </div>
          </div>

          {/* College Filter */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              College
            </label>
            {loading.colleges ? (
              <div className="animate-pulse h-10 bg-gray-200 rounded-md"></div>
            ) : error.colleges ? (
              <div className="text-red-500 text-sm">{error.colleges}</div>
            ) : (
              <select
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                value={filters.collegeId}
                onChange={(e) => setFilters({...filters, collegeId: e.target.value})}
              >
                <option value="">All Colleges</option>
                {colleges.map((college) => (
                  <option key={college.id} value={college.id.toString()}>
                    {college.name}
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex justify-between mt-8">
            <button
              onClick={handleReset}
              className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Reset Filters
            </button>
            <div className="space-x-3">
              <button
                onClick={onClose}
                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleApply}
                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                disabled={loading.colleges || loading.categories}
              >
                {loading.colleges || loading.categories ? 'Loading...' : 'Apply Filters'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};