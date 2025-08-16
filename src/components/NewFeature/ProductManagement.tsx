import { useState, useEffect } from 'react';
import axios from 'axios';
import { getAuthHeaders } from '../../utilis/auth';
import { 
  FiSearch, 
  FiTrash2, 
  FiDownload,
  FiPlus,
  FiEdit3,
  FiEye,
  FiAlertCircle,
  FiX,
  FiPackage,
  FiImage,
  FiDollarSign,
  FiTag,
  FiUser,
  FiCalendar,
  FiChevronLeft,
  FiChevronRight,
  FiLoader,
  FiBarChart2,
  FiPieChart
} from 'react-icons/fi';
import { useMediaQuery } from 'react-responsive';
import { useAuth } from '../../context/AuthContext';

const baseURL = import.meta.env.VITE_API_BASE_URL || 'https://mkt-backend-sz2s.onrender.com';

interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  category: string;
  stock?: number;
  status: 'draft' | 'published' | 'archived';
  providerId: number;
  provider?: {
    id: number;
    firstName: string;
    lastName: string;
    phoneNumber: string;
    userId: number;
  };
  user?: {
    id: number;
    full_name: string;
    email: string;
    contact_phone?: string;
  };
  images?: Array<{
    id: number;
    url: string;
    isPrimary: boolean;
  }>;
  createdAt: string;
  updatedAt: string;
  imageUrl?: string;
}

interface ProductStats {
  totalProducts: number;
  productsByStatus: Array<{ status: string; count: number }>;
  productsByCategory: Array<{ category: string; count: number }>;
  avgPriceByCategory: Array<{ category: string; avgPrice: string }>;
  totalSales: number;
  recentProducts: number;
}

interface ProductFormData {
  name: string;
  description: string;
  price: number;
  category: string;
  providerId: number;
  status: 'draft' | 'published' | 'archived';
  stock?: number;
}

// Price formatting utilities
const formatPrice = (price: string | number | undefined | null): string => {
  if (price === undefined || price === null) return 'KSh 0.00';
  const numericPrice = typeof price === 'string' ? parseFloat(price) : price;
  if (isNaN(numericPrice)) return 'KSh 0.00';
  
  return `KSh ${numericPrice.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}`;
};
const ProductManagement = () => {
  const [activeTab, setActiveTab] = useState<'products' | 'stats'>('products');
  const [products, setProducts] = useState<Product[]>([]);
  const [stats, setStats] = useState<ProductStats | null>(null);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [selectedProducts, setSelectedProducts] = useState<number[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit' | 'view'>('create');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [formData, setFormData] = useState<ProductFormData>({
    name: '',
    description: '',
    price: 0,
    category: '',
    providerId: 0,
    status: 'draft',
    stock: 0
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const isMobile = useMediaQuery({ maxWidth: 640 });
  const isTablet = useMediaQuery({ minWidth: 641, maxWidth: 1024 });
  const { token, logout } = useAuth();

  const categories = [
    'Electronics',
    'Books',
    'Clothing',
    'Furniture',
    'Sports',
    'Beauty',
    'Other'
  ];

  const statusOptions = [
    { value: 'published', label: 'Published' },
    { value: 'draft', label: 'Draft' },
    { value: 'archived', label: 'Archived' }
  ];

  const transformProduct = (product: any): Product => {
    return {
      ...product,
      isAvailable: product.status === 'published',
      sellerId: product.provider?.userId,
      seller: product.user ? {
        id: product.user.id,
        firstName: product.provider?.firstName || '',
        lastName: product.provider?.lastName || '',
        email: product.user.email
      } : undefined,
      imageUrl: product.images?.find((img: any) => img.isPrimary)?.url || ''
    };
  };

  useEffect(() => {
    if (activeTab === 'products') {
      fetchProducts();
    } else {
      fetchStats();
    }
  }, [activeTab, currentPage, token]);

  useEffect(() => {
    filterProducts();
  }, [products, searchTerm, categoryFilter, statusFilter]);


const fetchProducts = async () => {
  setIsLoading(true);
  setError(null);
  
  try {
    if (!token) {
      throw new Error('No authentication token available');
    }

    const response = await axios.get(`${baseURL}/api/admin/product`, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      params: {
        page: currentPage,
        limit: isMobile ? 5 : isTablet ? 10 : 15
      }
    });

    // Debug: Log the full response
    console.log('API Response:', response.data);

    // Check the response structure
    if (!response.data.data) {
      throw new Error('Unexpected API response structure');
    }

    const transformedProducts = response.data.data.map(transformProduct);
    setProducts(transformedProducts);
    setTotalPages(response.data.pagination?.totalPages || 1);
    
  } catch (err: any) {
    console.error('Error fetching products:', err);
    if (err.response?.status === 401) {
      setError('Your session has expired. Please login again.');
      logout();
    } else {
      setError(err.response?.data?.message || 
              err.message || 
              'Failed to fetch products');
    }
  } finally {
    setIsLoading(false);
  }
};


  const fetchStats = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await axios.get(`${baseURL}/api/admin/product/stats/overview`, {
        headers: getAuthHeaders()
      });
      setStats(response.data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch statistics');
    } finally {
      setIsLoading(false);
    }
  };

  const filterProducts = () => {
    let filtered = products;

    if (searchTerm) {
      filtered = filtered.filter(product => 
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.category.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (categoryFilter) {
      filtered = filtered.filter(product => product.category === categoryFilter);
    }

    if (statusFilter) {
      filtered = filtered.filter(product => product.status === statusFilter);
    }

    setFilteredProducts(filtered);
  };

  const handleCreateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const response = await axios.post(`${baseURL}/api/admin/product`, formData, {
        headers: getAuthHeaders()
      });
      setProducts([transformProduct(response.data), ...products]);
      setSuccess('Product created successfully');
      resetForm();
      setShowModal(false);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create product');
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProduct) return;

    setError(null);
    setIsLoading(true);

    try {
      const response = await axios.put(
        `${baseURL}/api/admin/product/${selectedProduct.id}`, 
        formData,
        { headers: getAuthHeaders() }
      );
      setProducts(products.map(p => p.id === selectedProduct.id ? transformProduct(response.data) : p));
      setSuccess('Product updated successfully');
      resetForm();
      setShowModal(false);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to update product');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteProduct = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this product?')) return;

    try {
      await axios.delete(`${baseURL}/api/admin/product/${id}`, {
        headers: getAuthHeaders()
      });
      setProducts(products.filter(p => p.id !== id));
      setSelectedProducts(selectedProducts.filter(pid => pid !== id));
      setSuccess('Product deleted successfully');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to delete product');
    }
  };

  const handleBulkDelete = async () => {
    if (!window.confirm(`Are you sure you want to delete ${selectedProducts.length} products?`)) return;

    try {
      await axios.post(`${baseURL}/api/admin/product/bulk-delete`, 
        { ids: selectedProducts }, 
        { headers: getAuthHeaders() }
      );
      setProducts(products.filter(p => !selectedProducts.includes(p.id)));
      setSelectedProducts([]);
      setSuccess('Products deleted successfully');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to delete products');
    }
  };

  const handleExport = () => {
    const csvContent = [
      ['ID', 'Name', 'Description', 'Price', 'Category', 'Status', 'Stock', 'Provider', 'Created Date'].join(','),
      ...filteredProducts.map(product => [
        product.id,
        `"${product.name}"`,
        `"${product.description}"`,
        product.price,
        product.category,
        product.status,
        product.stock,
        `"${product.provider ? `${product.provider.firstName} ${product.provider.lastName}` : 'N/A'}"`,
        new Date(product.createdAt).toLocaleDateString()
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `products-${new Date().toISOString().slice(0,10)}.csv`;
    link.click();
  };

  const openModal = (mode: 'create' | 'edit' | 'view', product?: Product) => {
    setModalMode(mode);
    setSelectedProduct(product || null);
    if (product) {
      setFormData({
        name: product.name,
        description: product.description,
        price: product.price,
        category: product.category,
        providerId: product.providerId,
        status: product.status,
        stock: product.stock || 0
      });
    } else {
      resetForm();
    }
    setShowModal(true);
    setError(null);
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      price: 0,
      category: '',
      providerId: 0,
      status: 'draft',
      stock: 0
    });
    setSelectedProduct(null);
  };

  const closeModal = () => {
    setShowModal(false);
    resetForm();
    setError(null);
  };

  const renderStatusBadge = (status: string) => {
    const statusMap: Record<string, { color: string; text: string }> = {
      published: { color: 'bg-green-100 text-green-800', text: 'Published' },
      draft: { color: 'bg-yellow-100 text-yellow-800', text: 'Draft' },
      archived: { color: 'bg-gray-100 text-gray-800', text: 'Archived' }
    };

    const statusInfo = statusMap[status] || { color: 'bg-gray-100 text-gray-800', text: status };

    return (
      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${statusInfo.color}`}>
        {statusInfo.text}
      </span>
    );
  };

  const renderMobileProductCard = (product: Product) => (
    <div className="bg-white p-4 rounded-lg shadow-sm border mb-3">
      <div className="flex justify-between items-start">
        <div className="flex items-center space-x-3">
          {product.imageUrl ? (
            <img
              src={product.imageUrl}
              alt={product.name}
              className="w-12 h-12 rounded-lg object-cover"
            />
          ) : (
            <div className="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center">
              <FiImage className="text-gray-400" size={20} />
            </div>
          )}
          <div>
            <h3 className="font-medium text-gray-900">{product.name}</h3>
            <p className="text-sm text-gray-500">{formatPrice(product.price)}</p>
          </div>
        </div>
        {renderStatusBadge(product.status)}
      </div>
      <div className="mt-3 flex justify-between items-center">
        <div className="text-sm text-gray-500">
          <div className="flex items-center">
            <FiTag size={12} className="mr-1" />
            {product.category}
          </div>
          {product.provider && (
            <div className="flex items-center mt-1">
              <FiUser size={12} className="mr-1" />
              {product.provider.firstName} {product.provider.lastName}
            </div>
          )}
        </div>
        <div className="flex space-x-2">
          <button
            onClick={() => openModal('view', product)}
            className="text-blue-600 hover:text-blue-900 p-1 rounded hover:bg-blue-50"
            title="View"
          >
            <FiEye size={16} />
          </button>
          <button
            onClick={() => openModal('edit', product)}
            className="text-indigo-600 hover:text-indigo-900 p-1 rounded hover:bg-indigo-50"
            title="Edit"
          >
            <FiEdit3 size={16} />
          </button>
          <button
            onClick={() => handleDeleteProduct(product.id)}
            className="text-red-600 hover:text-red-900 p-1 rounded hover:bg-red-50"
            title="Delete"
          >
            <FiTrash2 size={16} />
          </button>
        </div>
      </div>
    </div>
  );

  const renderTableRow = (product: Product) => (
    <tr key={product.id} className="hover:bg-gray-50">
      <td className="px-4 py-4 whitespace-nowrap">
        <input
          type="checkbox"
          className="rounded"
          checked={selectedProducts.includes(product.id)}
          onChange={(e) => {
            if (e.target.checked) {
              setSelectedProducts([...selectedProducts, product.id]);
            } else {
              setSelectedProducts(selectedProducts.filter(id => id !== product.id));
            }
          }}
        />
      </td>
      <td className="px-4 py-4 whitespace-nowrap">
        {product.imageUrl ? (
          <img
            src={product.imageUrl}
            alt={product.name}
            className="w-12 h-12 rounded-lg object-cover"
          />
        ) : (
          <div className="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center">
            <FiImage className="text-gray-400" size={20} />
          </div>
        )}
      </td>
      <td className="px-4 py-4">
        <div className="flex flex-col">
          <div className="text-sm font-medium text-gray-900 truncate max-w-xs">
            {product.name}
          </div>
          <div className="text-sm text-gray-500 truncate max-w-xs">
            {product.description}
          </div>
          {product.stock !== undefined && (
            <div className="text-xs text-gray-400 mt-1">
              Stock: {product.stock}
            </div>
          )}
        </div>
      </td>
      <td className="px-4 py-4 whitespace-nowrap">
        <div className="flex items-center text-sm font-medium text-gray-900">
          <span>{formatPrice(product.price)}</span>
        </div>
      </td>
      <td className="px-4 py-4 whitespace-nowrap">
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
          <FiTag size={12} className="mr-1" />
          {product.category}
        </span>
      </td>
      <td className="px-4 py-4 whitespace-nowrap">
        {product.provider && (
          <div className="flex items-center">
            <FiUser size={14} className="mr-1 text-gray-400" />
            <div className="text-sm text-gray-900">
              {product.provider.firstName} {product.provider.lastName}
            </div>
          </div>
        )}
      </td>
      <td className="px-4 py-4 whitespace-nowrap">
        {renderStatusBadge(product.status)}
      </td>
      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
        <div className="flex items-center">
          <FiCalendar size={14} className="mr-1" />
          {new Date(product.createdAt).toLocaleDateString()}
        </div>
      </td>
      <td className="px-4 py-4 whitespace-nowrap text-sm font-medium">
        <div className="flex items-center space-x-2">
          <button
            onClick={() => openModal('view', product)}
            className="text-blue-600 hover:text-blue-900 p-1 rounded hover:bg-blue-50"
            title="View"
          >
            <FiEye size={16} />
          </button>
          <button
            onClick={() => openModal('edit', product)}
            className="text-indigo-600 hover:text-indigo-900 p-1 rounded hover:bg-indigo-50"
            title="Edit"
          >
            <FiEdit3 size={16} />
          </button>
          <button
            onClick={() => handleDeleteProduct(product.id)}
            className="text-red-600 hover:text-red-900 p-1 rounded hover:bg-red-50"
            title="Delete"
          >
            <FiTrash2 size={16} />
          </button>
        </div>
      </td>
    </tr>
  );

  const renderStatsDashboard = () => {
    if (!stats) return null;

    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Total Products Card */}
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-medium text-gray-500">Total Products</h3>
                <p className="text-3xl font-bold mt-2">{stats.totalProducts}</p>
              </div>
              <FiPackage className="text-blue-500 text-4xl" />
            </div>
          </div>

          {/* Total Sales Card */}
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-medium text-gray-500">Total Sales</h3>
                <p className="text-3xl font-bold mt-2">{stats.totalSales}</p>
              </div>
              <FiDollarSign className="text-green-500 text-4xl" />
            </div>
          </div>

          {/* Recent Products Card */}
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-medium text-gray-500">Recent Products (30d)</h3>
                <p className="text-3xl font-bold mt-2">{stats.recentProducts}</p>
              </div>
              <FiCalendar className="text-purple-500 text-4xl" />
            </div>
          </div>
        </div>

        {/* Status Distribution */}
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h3 className="text-lg font-medium text-gray-800 mb-4">Products by Status</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {stats.productsByStatus.map((item) => (
              <div key={`status-${item.status}`}className="flex items-center justify-between p-3 bg-gray-50 rounded">
                <span className="capitalize">{item.status}</span>
                <span className="font-bold">{item.count}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Category Distribution */}
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h3 className="text-lg font-medium text-gray-800 mb-4">Products by Category</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              {stats.productsByCategory.map((item) => (
                <div key={`category-${item.category}`}className="mb-2">
                  <div className="flex justify-between mb-1">
                    <span>{item.category}</span>
                    <span>{item.count}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div 
                      className="bg-blue-600 h-2.5 rounded-full" 
                      style={{ width: `${(item.count / stats.totalProducts) * 100}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
            <div>
              {stats.avgPriceByCategory.map((item) => (
               <div key={`avgprice-${item.category}`} className="mb-3 p-3 bg-gray-50 rounded">
  <div className="flex justify-between">
    <span>{item.category}</span>
    <span className="font-bold">{formatPrice(item.avgPrice)}</span>
  </div>
  <div className="text-sm text-gray-500">Average Price</div>
</div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="p-4 md:p-6 space-y-6">
      {/* Header with Tabs */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex items-center space-x-4">
          <h1 className="text-2xl font-bold text-gray-800">Product Management</h1>
          <div className="flex border-b border-gray-200">
            <button
              onClick={() => setActiveTab('products')}
              className={`px-4 py-2 font-medium ${activeTab === 'products' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500'}`}
            >
              Products
            </button>
            <button
              onClick={() => setActiveTab('stats')}
              className={`px-4 py-2 font-medium ${activeTab === 'stats' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500'}`}
            >
              <div className="flex items-center gap-2">
                <FiBarChart2 size={16} />
                Statistics
              </div>
            </button>
          </div>
        </div>

        {activeTab === 'products' && (
          <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
            <button
              onClick={() => openModal('create')}
              className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition shadow-sm w-full md:w-auto"
            >
              <FiPlus size={16} /> Add Product
            </button>
            {selectedProducts.length > 0 && (
              <button
                onClick={handleBulkDelete}
                className="flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition w-full md:w-auto"
              >
                <FiTrash2 size={16} /> Delete ({selectedProducts.length})
              </button>
            )}
            <button
              onClick={handleExport}
              className="flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition w-full md:w-auto"
            >
              <FiDownload size={16} /> Export
            </button>
          </div>
        )}
      </div>

      {/* Alerts */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg flex items-center justify-between">
          <div className="flex items-center">
            <FiAlertCircle className="mr-2" />
            {error}
          </div>
          <button onClick={() => setError(null)}>
            <FiX size={16} />
          </button>
        </div>
      )}

      {success && (
        <div className="bg-green-50 border border-green-200 text-green-700 p-4 rounded-lg flex items-center justify-between">
          <div className="flex items-center">
            <FiAlertCircle className="mr-2" />
            {success}
          </div>
          <button onClick={() => setSuccess(null)}>
            <FiX size={16} />
          </button>
        </div>
      )}

      {activeTab === 'products' ? (
        <>
          {/* Filters and Search */}
          <div className="bg-white p-4 rounded-lg shadow-sm border space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="relative">
                <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search products..."
                  className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <select
                className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
              >
                <option value="">All Categories</option>
                {categories.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
              <select
                className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="">All Status</option>
                {statusOptions.map(option => (
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Products Table */}
          <div className="bg-white rounded-lg shadow-sm border">
            {isLoading ? (
              <div className="flex justify-center items-center h-64">
                <FiLoader className="animate-spin text-blue-500 text-4xl" />
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="text-center py-12">
                <FiPackage className="mx-auto text-gray-400 text-5xl mb-4" />
                <p className="text-gray-500 text-lg">No products found</p>
                {searchTerm || categoryFilter || statusFilter ? (
                  <button
                    onClick={() => {
                      setSearchTerm('');
                      setCategoryFilter('');
                      setStatusFilter('');
                    }}
                    className="mt-4 text-blue-600 hover:text-blue-800"
                  >
                    Clear filters
                  </button>
                ) : null}
              </div>
            ) : isMobile ? (
              <div className="p-2">
                {filteredProducts.map(product => (
  <div key={product.id}>
    {renderMobileProductCard(product)}
  </div>
))}
              </div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left w-10">
                          <input
                            type="checkbox"
                            className="rounded"
                            checked={selectedProducts.length === filteredProducts.length && filteredProducts.length > 0}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedProducts(filteredProducts.map(p => p.id));
                              } else {
                                setSelectedProducts([]);
                              }
                            }}
                          />
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Image</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Product</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Price</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Provider</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Created</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {filteredProducts.map(renderTableRow)}
                    </tbody>
                  </table>
                </div>
                {totalPages > 1 && (
                  <div className="flex items-center justify-between px-4 py-3 border-t">
                    <button
                      onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                      disabled={currentPage === 1}
                      className={`flex items-center px-3 py-1 rounded ${currentPage === 1 ? 'text-gray-400 cursor-not-allowed' : 'text-gray-700 hover:bg-gray-100'}`}
                    >
                      <FiChevronLeft className="mr-1" /> Previous
                    </button>
                    <div className="text-sm text-gray-700">
                      Page {currentPage} of {totalPages}
                    </div>
                    <button
                      onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                      disabled={currentPage === totalPages}
                      className={`flex items-center px-3 py-1 rounded ${currentPage === totalPages ? 'text-gray-400 cursor-not-allowed' : 'text-gray-700 hover:bg-gray-100'}`}
                    >
                      Next <FiChevronRight className="ml-1" />
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </>
      ) : (
        <div className="bg-white rounded-lg shadow-sm border p-6">
          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <FiLoader className="animate-spin text-blue-500 text-4xl" />
            </div>
          ) : (
            renderStatsDashboard()
          )}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b">
              <h2 className="text-xl font-semibold text-gray-800">
                {modalMode === 'create' ? 'Create Product' : 
                 modalMode === 'edit' ? 'Edit Product' : 'Product Details'}
              </h2>
              <button
                onClick={closeModal}
                className="text-gray-400 hover:text-gray-600"
              >
                <FiX size={24} />
              </button>
            </div>

            <div className="p-6">
              {modalMode === 'view' && selectedProduct ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                      <p className="text-gray-900">{selectedProduct.name}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Price</label>
                      <p className="text-gray-900">{formatPrice(selectedProduct.price)}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                      <p className="text-gray-900">{selectedProduct.category}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                      <p className="text-gray-900">{renderStatusBadge(selectedProduct.status)}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Stock</label>
                      <p className="text-gray-900">{selectedProduct.stock || 0}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Provider ID</label>
                      <p className="text-gray-900">{selectedProduct.providerId}</p>
                    </div>
                    {selectedProduct.provider && (
                      <>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Provider Name</label>
                          <p className="text-gray-900">
                            {selectedProduct.provider.firstName} {selectedProduct.provider.lastName}
                          </p>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Provider Phone</label>
                          <p className="text-gray-900">{selectedProduct.provider.phoneNumber}</p>
                        </div>
                      </>
                    )}
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                      <p className="text-gray-900">{selectedProduct.description}</p>
                    </div>
                    {selectedProduct.imageUrl && (
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Image</label>
                        <img
                          src={selectedProduct.imageUrl}
                          alt={selectedProduct.name}
                          className="w-full h-48 object-cover rounded-lg"
                        />
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <form onSubmit={modalMode === 'create' ? handleCreateProduct : handleUpdateProduct} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Product Name *</label>
                      <input
                        type="text"
                        className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Price *</label>
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        value={formData.price}
                        onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })}
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Category *</label>
                      <select
                        className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        value={formData.category}
                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                        required
                      >
                        <option value="">Select Category</option>
                        {categories.map(category => (
                          <option key={category} value={category}>{category}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Status *</label>
                      <select
                        className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        value={formData.status}
                        onChange={(e) => setFormData({ 
                          ...formData, 
                          status: e.target.value as 'draft' | 'published' | 'archived' 
                        })}
                        required
                      >
                        {statusOptions.map(option => (
                          <option key={option.value} value={option.value}>{option.label}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Stock</label>
                      <input
                        type="number"
                        min="0"
                        className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        value={formData.stock}
                        onChange={(e) => setFormData({ ...formData, stock: parseInt(e.target.value) || 0 })}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Provider ID *</label>
                      <input
                        type="number"
                        min="1"
                        className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        value={formData.providerId}
                        onChange={(e) => setFormData({ ...formData, providerId: parseInt(e.target.value) || 0 })}
                        required
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Description *</label>
                      <textarea
                        rows={4}
                        className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        required
                      />
                    </div>
                  </div>

                  <div className="flex justify-end space-x-3 pt-4 border-t">
                    <button
                      type="button"
                      onClick={closeModal}
                      className="px-4 py-2 text-gray-700 border rounded-lg hover:bg-gray-50 transition"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isLoading}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
                    >
                      {isLoading ? (
                        <span className="flex items-center">
                          <FiLoader className="animate-spin mr-2" />
                          {modalMode === 'create' ? 'Creating...' : 'Updating...'}
                        </span>
                      ) : modalMode === 'create' ? 'Create Product' : 'Update Product'}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductManagement;