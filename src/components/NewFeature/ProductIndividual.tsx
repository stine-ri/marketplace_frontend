import React, { useState, useEffect } from 'react';
import { Star, MapPin, ArrowLeft, Package, Phone, MessageCircle, Mail, ShoppingCart, Award, CheckCircle } from 'lucide-react';

const ProductDetails = ({ productId }: { productId: string }) => {
  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState(0);
  const BASE_URL = 'https://mkt-backend-sz2s.onrender.com';

  useEffect(() => {
    const fetchProductDetails = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${BASE_URL}/api/products/${productId}`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch product details');
        }
        
        const data = await response.json();
        console.log('Product data:', data); // Debug log
        console.log('Provider phone:', data.provider?.phone); // Debug log
        setProduct(data);
      } catch (err) {
        console.error('Error fetching product details:', err);
        setError('Failed to load product details');
      } finally {
        setLoading(false);
      }
    };

    fetchProductDetails();
  }, [productId]);

  const formatPhoneForWhatsApp = (phone: string | null | undefined): string => {
    if (!phone) {
      console.error('No phone number provided');
      return '';
    }
    
    // Remove all non-numeric characters including + sign
    let cleaned = String(phone).replace(/\D/g, '');
    
    console.log('Original phone:', phone);
    console.log('Cleaned phone:', cleaned);
    
    // Handle different Kenyan phone number formats
    if (cleaned.startsWith('254')) {
      // Already has country code
      return cleaned;
    } else if (cleaned.startsWith('0')) {
      // Kenyan format starting with 0 (e.g., 0712345678)
      return '254' + cleaned.substring(1);
    } else if (cleaned.length === 9) {
      // 9 digits without leading 0 (e.g., 712345678)
      return '254' + cleaned;
    } else if (cleaned.length === 10 && cleaned.startsWith('7')) {
      // 10 digits starting with 7
      return '254' + cleaned;
    }
    
    console.warn('Unexpected phone format:', phone, 'cleaned:', cleaned);
    return cleaned;
  };

  const handleWhatsAppContact = () => {
    const sellerName = product.provider 
      ? `${product.provider.firstName} ${product.provider.lastName}` 
      : 'Seller';
    
    const message = `Hello ${sellerName},

I found your listing on quisells.com and I'm interested in purchasing "${product.name}" listed at KSh ${product.price.toLocaleString()}.

Could you please confirm:
- Is this item still available?
- What is the condition?
- When can I collect/receive it?

Looking forward to your response.

Best regards`;
    
    // Get phone number from provider
    const phoneNumber = product.provider?.phone;
    
    console.log('Attempting WhatsApp contact with phone:', phoneNumber); // Debug log
    
    if (!phoneNumber) {
      alert('No phone number available for this seller. Please try another contact method or check back later.');
      console.error('Provider data:', product.provider); // Debug log
      return;
    }
    
    const formattedPhone = formatPhoneForWhatsApp(phoneNumber);
    
    if (!formattedPhone || formattedPhone.length < 10) {
      alert('Unable to connect via WhatsApp due to invalid phone number format. Please try SMS or Call instead.');
      console.error('Invalid formatted phone:', formattedPhone, 'from:', phoneNumber);
      return;
    }
    
    const whatsappUrl = `https://wa.me/${formattedPhone}?text=${encodeURIComponent(message)}`;
    console.log('Opening WhatsApp URL:', whatsappUrl);
    
    window.open(whatsappUrl, '_blank');
  };

  const handleSMSContact = () => {
    const sellerName = product.provider 
      ? `${product.provider.firstName} ${product.provider.lastName}` 
      : 'Seller';
    
    const message = `Hello ${sellerName},

I found your listing on quisells.com and I'm interested in purchasing "${product.name}" (KSh ${product.price.toLocaleString()}).

Is this item still available? Please contact me to discuss further.

Thank you!`;
    
    // Get phone number from provider
    const phoneNumber = product.provider?.phone;
    
    console.log('Attempting SMS contact with phone:', phoneNumber); // Debug log
    
    if (!phoneNumber) {
      alert('No phone number available for this seller. Please try another contact method.');
      console.error('Provider data:', product.provider); // Debug log
      return;
    }
    
    const formattedPhone = formatPhoneForWhatsApp(phoneNumber);
    
    if (!formattedPhone) {
      alert('Invalid phone number format. Please try calling instead.');
      return;
    }
    
    const smsUrl = `sms:${formattedPhone}?body=${encodeURIComponent(message)}`;
    window.location.href = smsUrl;
  };

  const handlePhoneCall = () => {
    // Get phone number from provider
    const phoneNumber = product.provider?.phone;
    
    console.log('Attempting phone call with phone:', phoneNumber); // Debug log
    
    if (!phoneNumber) {
      alert('No phone number available for this seller. Please try another contact method.');
      console.error('Provider data:', product.provider); // Debug log
      return;
    }
    
    const formattedPhone = formatPhoneForWhatsApp(phoneNumber);
    
    if (!formattedPhone) {
      alert('Invalid phone number format.');
      return;
    }
    
    window.location.href = `tel:${formattedPhone}`;
  };

  const renderStars = (rating: number) => {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    
    return (
      <div className="flex items-center text-yellow-400">
        {Array.from({ length: 5 }, (_, i) => (
          <Star
            key={i}
            size={16}
            className={i < fullStars ? 'fill-current' : 
                      i === fullStars && hasHalfStar ? 'fill-current opacity-50' : 'text-gray-300'}
          />
        ))}
      </div>
    );
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Loading product details...</p>
      </div>
    </div>
  );

  if (error || !product) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="text-red-500 text-6xl mb-4">⚠️</div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Product Not Found</h2>
        <p className="text-gray-600 mb-4">{error || 'The product you\'re looking for doesn\'t exist.'}</p>
        <button 
          onClick={() => window.location.href = '/'}
          className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
        >
          Back to Home
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4">
          <button 
            onClick={() => window.location.href = '/'}
            className="inline-flex items-center text-blue-600 hover:text-blue-700 mb-4"
          >
            <ArrowLeft size={20} className="mr-2" />
            Back to Home
          </button>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Product Images */}
          <div>
            <div className="bg-white rounded-lg shadow-sm border p-4 mb-4">
              <img 
                src={product.images?.[selectedImage] || `https://via.placeholder.com/600x400?text=${encodeURIComponent(product.name)}`}
                alt={product.name}
                className="w-full h-96 object-cover rounded-lg"
              />
            </div>
            
            {product.images && product.images.length > 1 && (
              <div className="flex space-x-2 overflow-x-auto pb-2">
                {product.images.map((image: string, index: number) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(index)}
                    className={`flex-shrink-0 w-20 h-20 border-2 rounded-lg overflow-hidden transition-all ${
                      selectedImage === index ? 'border-blue-600 scale-105' : 'border-gray-200 hover:border-blue-300'
                    }`}
                  >
                    <img 
                      src={image} 
                      alt={`${product.name} ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div>
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <div className="flex items-center gap-2 mb-2">
                <Package className="text-blue-600" size={20} />
                <span className="text-sm text-gray-600 font-medium">{product.categoryName}</span>
              </div>

              <h1 className="text-3xl font-bold text-gray-900 mb-4">{product.name}</h1>
              
              <div className="flex items-center space-x-4 mb-4">
                <div className="flex items-center">
                  {renderStars(product.provider?.rating || 4.5)}
                  <span className="ml-2 font-semibold">{(product.provider?.rating || 4.5).toFixed(1)}</span>
                </div>
                <span className="text-gray-400">•</span>
                <span className="text-gray-600">{product.provider?.completedSales || 0} sales</span>
              </div>

              <div className="text-4xl font-bold text-green-600 mb-6">
                KSh {product.price.toLocaleString()}
              </div>

              {product.stock !== null && (
                <div className="mb-6">
                  {product.stock > 0 ? (
                    <div className="flex items-center text-green-600 bg-green-50 px-4 py-2 rounded-lg">
                      <CheckCircle size={18} className="mr-2" />
                      <span className="font-medium">{product.stock} units in stock</span>
                    </div>
                  ) : (
                    <div className="flex items-center text-red-600 bg-red-50 px-4 py-2 rounded-lg">
                      <span className="font-medium">Out of stock</span>
                    </div>
                  )}
                </div>
              )}

              <p className="text-gray-700 leading-relaxed mb-6 border-t pt-6">
                {product.description}
              </p>

              {/* Seller Info */}
              <div className="border-t border-b py-6 mb-6">
                <h3 className="font-semibold text-lg mb-4">Sold by</h3>
                <div className="flex items-center space-x-4">
                  <img 
                    src={product.provider?.profileImageUrl || `https://ui-avatars.com/api/?name=${product.provider?.firstName}+${product.provider?.lastName}&background=10B981&color=fff&size=96`}
                    alt={product.provider?.firstName}
                    className="w-16 h-16 rounded-full object-cover border-2 border-gray-200"
                  />
                  <div className="flex-1">
                    <div className="font-semibold text-lg">
                      {product.provider?.firstName} {product.provider?.lastName}
                    </div>
                    <div className="flex items-center text-sm text-gray-600 mt-1">
                      {renderStars(product.provider?.rating || 4.5)}
                      <span className="ml-2">{(product.provider?.rating || 4.5).toFixed(1)}</span>
                      <span className="mx-2">•</span>
                      <Award size={14} className="mr-1" />
                      <span>{product.provider?.completedSales || 0} sales</span>
                    </div>
                    <div className="flex items-center text-sm text-gray-600 mt-1">
                      <MapPin className="w-4 h-4 mr-1" />
                      <span>{product.provider?.address || 'Nairobi, Kenya'}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Contact Options */}
              <div className="space-y-3">
                <p className="text-sm font-medium text-gray-700">Contact seller to purchase:</p>
                
                <button 
                  onClick={handleWhatsAppContact}
                  disabled={product.stock === 0}
                  className="w-full bg-green-600 text-white py-4 rounded-lg hover:bg-green-700 transition-colors font-semibold flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <MessageCircle className="w-5 h-5" />
                  <span>Contact via WhatsApp</span>
                </button>

                <div className="grid grid-cols-2 gap-3">
                  <button 
                    onClick={handleSMSContact}
                    disabled={product.stock === 0}
                    className="bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors font-semibold flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Mail className="w-4 h-4" />
                    <span>SMS</span>
                  </button>

                  <button 
                    onClick={handlePhoneCall}
                    disabled={product.stock === 0}
                    className="bg-purple-600 text-white py-3 rounded-lg hover:bg-purple-700 transition-colors font-semibold flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Phone className="w-4 h-4" />
                    <span>Call</span>
                  </button>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-4">
                  <div className="flex items-start">
                    <MessageCircle size={20} className="text-blue-600 mr-3 mt-0.5 flex-shrink-0" />
                    <div className="text-sm text-blue-800">
                      <p className="font-medium mb-1">Quick & Easy Contact</p>
                      <p>Click any button above and we'll pre-fill a message for you. The seller will receive your inquiry instantly!</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Product Details */}
              <div className="mt-6 pt-6 border-t space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Category:</span>
                  <span className="font-medium">{product.categoryName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Condition:</span>
                  <span className="font-medium">{product.condition || 'New'}</span>
                </div>
                {product.stock !== null && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Availability:</span>
                    <span className={`font-medium ${product.stock > 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {product.stock > 0 ? `${product.stock} in stock` : 'Out of stock'}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Become Seller CTA */}
            <div className="bg-gradient-to-br from-green-600 to-blue-600 rounded-lg p-6 text-white mt-6">
              <h3 className="font-semibold text-lg mb-2">Want to sell your products?</h3>
              <p className="text-sm mb-4 text-green-100">
                Join our marketplace and reach thousands of potential customers.
              </p>
              <button
                onClick={() => window.location.href = '/register?role=product_seller'}
                className="block w-full bg-white text-blue-600 py-2 rounded-lg hover:bg-gray-100 transition-colors font-semibold text-center"
              >
                Register as Seller
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetails;