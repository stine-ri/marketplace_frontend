import React, { useState, useEffect } from 'react';
import { Star, MapPin, ArrowLeft, Award, CheckCircle, Clock, Users, Phone, MessageCircle, Mail } from 'lucide-react';

const ServiceDetails = ({ serviceId }: { serviceId: string }) => {
  const [service, setService] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const BASE_URL = 'https://mkt-backend-sz2s.onrender.com';

  useEffect(() => {
    const fetchServiceDetails = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${BASE_URL}/api/all/services/${serviceId}`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch service details');
        }
        
        const data = await response.json();
        setService(data);
      } catch (err) {
        console.error('Error fetching service details:', err);
        setError('Failed to load service details');
      } finally {
        setLoading(false);
      }
    };

    fetchServiceDetails();
  }, [serviceId]);

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

const handleWhatsAppContact = (provider: any) => {
  const providerName = provider.user?.full_name || `${provider.firstName} ${provider.lastName}`;
  const serviceName = service.name;
  const priceInfo = provider.price ? ` priced at KSh ${provider.price.toLocaleString()}` : '';
  
  const message = `Hello ${providerName},

I found your profile on quisells.com and I'm interested in your ${serviceName} service${priceInfo}.

Could you please provide more details about:
- Availability
- Service details
- Any additional information

Looking forward to hearing from you.

Best regards`;
  
  const phoneNumber = provider.phone || provider.user?.phone;
  
  if (!phoneNumber) {
    alert('No phone number available for this service provider. Please try another contact method or check back later.');
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

const handleSMSContact = (provider: any) => {
  const providerName = provider.user?.full_name || `${provider.firstName} ${provider.lastName}`;
  const serviceName = service.name;
  const priceInfo = provider.price ? ` (KSh ${provider.price.toLocaleString()})` : '';
  
  const message = `Hello ${providerName},

I found your profile on quisells.com and I'm interested in your ${serviceName} service${priceInfo}.

Please contact me at your earliest convenience to discuss further.

Thank you!`;
  
  const phoneNumber = provider.phone || provider.user?.phone;
  
  if (!phoneNumber) {
    alert('No phone number available for this service provider. Please try another contact method.');
    return;
  }
  
  const smsUrl = `sms:${phoneNumber}?body=${encodeURIComponent(message)}`;
  window.location.href = smsUrl;
};

  const handlePhoneCall = (provider: any) => {
    const phoneNumber = provider.phone || provider.user?.phone || '254700000000';
    window.location.href = `tel:${phoneNumber}`;
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
        <p className="mt-4 text-gray-600">Loading service details...</p>
      </div>
    </div>
  );

  if (error || !service) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="text-red-500 text-6xl mb-4">⚠️</div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Service Not Found</h2>
        <p className="text-gray-600 mb-4">{error || 'The service you\'re looking for doesn\'t exist.'}</p>
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
        <div className="container mx-auto px-4 py-6">
          <button 
            onClick={() => window.location.href = '/'}
            className="inline-flex items-center text-blue-600 hover:text-blue-700 mb-4"
          >
            <ArrowLeft size={20} className="mr-2" />
            Back to Home
          </button>
          <div className="flex items-start justify-between flex-wrap gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{service.name}</h1>
              <div className="flex items-center gap-4 mt-2 flex-wrap">
                <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
                  {service.category}
                </span>
                <div className="flex items-center text-gray-600 text-sm">
                  <Users size={16} className="mr-1" />
                  <span><strong>{service.providers?.length || 0}</strong> providers available</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Service Description */}
            <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
              <h2 className="text-xl font-semibold mb-4 flex items-center">
                <CheckCircle size={24} className="text-blue-600 mr-2" />
                Service Description
              </h2>
              <p className="text-gray-700 leading-relaxed">
                {service.description || 'Professional service with quality guaranteed. Our providers are experienced and vetted to ensure the best service delivery.'}
              </p>
            </div>

            {/* Available Providers */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h2 className="text-xl font-semibold mb-6 flex items-center">
                <Users size={24} className="text-blue-600 mr-2" />
                Available Service Providers ({service.providers?.length || 0})
              </h2>
              
              {service.providers && service.providers.length > 0 ? (
                <div className="space-y-6">
                  {service.providers.map((provider: any) => (
                    <div key={provider.id} className="border rounded-lg p-6 hover:shadow-md transition-shadow bg-gradient-to-r from-gray-50 to-white">
                      <div className="flex flex-col md:flex-row gap-6">
                        <div className="flex-shrink-0">
                          <img 
                            src={provider.profileImageUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(provider.user?.full_name || provider.firstName + ' ' + provider.lastName)}&background=3B82F6&color=fff&size=128`}
                            alt={provider.user?.full_name || `${provider.firstName} ${provider.lastName}`}
                            className="w-24 h-24 rounded-full object-cover border-4 border-white shadow-md mx-auto md:mx-0"
                          />
                        </div>

                        <div className="flex-1">
                          <div className="flex items-start justify-between mb-3 flex-wrap gap-2">
                            <div>
                              <h3 className="text-xl font-bold text-gray-900">
                                {provider.user?.full_name || `${provider.firstName} ${provider.lastName}`}
                              </h3>
                              {provider.bio && (
                                <p className="text-gray-600 mt-1 text-sm">{provider.bio}</p>
                              )}
                            </div>
                            <div className="text-right">
                              <div className="text-2xl font-bold text-blue-600 mb-1">
                                {provider.price ? `KSh ${provider.price.toLocaleString()}` : 'Contact for price'}
                              </div>
                              {provider.price && (
                                <span className="text-xs text-gray-500">per service</span>
                              )}
                            </div>
                          </div>
                          
                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
                            <div className="flex items-center">
                              {renderStars(provider.rating || 4.5)}
                              <span className="ml-2 text-sm font-semibold text-gray-700">
                                {(provider.rating || 4.5).toFixed(1)}
                              </span>
                            </div>
                            <div className="flex items-center text-gray-600 text-sm">
                              <Award size={16} className="mr-1 text-green-600" />
                              <span>{provider.completedRequests || 0} completed</span>
                            </div>
                            <div className="flex items-center text-gray-600 text-sm">
                              <MapPin size={16} className="mr-1 text-red-600" />
                              <span className="truncate">{provider.address || 'Nairobi, Kenya'}</span>
                            </div>
                          </div>

                          {provider.completedRequests > 0 && (
                            <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-4">
                              <div className="flex items-center text-green-800 text-sm">
                                <CheckCircle size={16} className="mr-2 flex-shrink-0" />
                                <span>
                                  Experienced provider with <strong>{provider.completedRequests}</strong> successful completions
                                </span>
                              </div>
                            </div>
                          )}

                          {/* Contact Options */}
                          <div className="space-y-2">
                            <p className="text-sm font-medium text-gray-700 mb-2">Contact this provider:</p>
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                              <button 
                                onClick={() => handleWhatsAppContact(provider)}
                                className="w-full bg-green-600 text-white px-4 py-2.5 rounded-lg hover:bg-green-700 transition-colors font-medium flex items-center justify-center gap-2 text-sm"
                              >
                                <MessageCircle size={16} />
                                <span>WhatsApp</span>
                              </button>
                              
                              <button 
                                onClick={() => handleSMSContact(provider)}
                                className="w-full bg-blue-600 text-white px-4 py-2.5 rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center justify-center gap-2 text-sm"
                              >
                                <Mail size={16} />
                                <span>SMS</span>
                              </button>
                              
                              <button 
                                onClick={() => handlePhoneCall(provider)}
                                className="w-full bg-purple-600 text-white px-4 py-2.5 rounded-lg hover:bg-purple-700 transition-colors font-medium flex items-center justify-center gap-2 text-sm"
                              >
                                <Phone size={16} />
                                <span>Call</span>
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                  <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">No Providers Available</h3>
                  <p className="text-gray-600 mb-4">There are no providers offering this service at the moment.</p>
                  <button 
                    onClick={() => window.location.href = '/register?role=service_provider'}
                    className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Become a Provider
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Service Info Card */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h3 className="font-semibold text-lg mb-4">Service Information</h3>
              <div className="space-y-3">
                <div className="flex items-start text-gray-700">
                  <CheckCircle className="w-5 h-5 mr-3 mt-0.5 text-green-600 flex-shrink-0" />
                  <div>
                    <div className="font-medium">Category</div>
                    <div className="text-sm text-gray-600">{service.category}</div>
                  </div>
                </div>
                <div className="flex items-start text-gray-700">
                  <Clock className="w-5 h-5 mr-3 mt-0.5 text-blue-600 flex-shrink-0" />
                  <div>
                    <div className="font-medium">Duration</div>
                    <div className="text-sm text-gray-600">Varies by provider</div>
                  </div>
                </div>
                <div className="flex items-start text-gray-700">
                  <Users className="w-5 h-5 mr-3 mt-0.5 text-purple-600 flex-shrink-0" />
                  <div>
                    <div className="font-medium">Available Providers</div>
                    <div className="text-sm text-gray-600">{service.providers?.length || 0} providers ready to serve</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Pricing Info */}
            {service.providers && service.providers.length > 0 && (
              <div className="bg-blue-50 rounded-lg border border-blue-200 p-6">
                <h3 className="font-semibold text-blue-900 mb-3">Pricing Information</h3>
                <div className="space-y-2 text-sm text-blue-800">
                  {(() => {
                    const prices = service.providers
                      .map((p: any) => p.price)
                      .filter((p: any) => p && p > 0);
                    
                    if (prices.length === 0) {
                      return <p>Contact providers for pricing details</p>;
                    }
                    
                    const minPrice = Math.min(...prices);
                    const maxPrice = Math.max(...prices);
                    
                    return (
                      <>
                        <div className="flex justify-between items-center">
                          <span>Starting from:</span>
                          <span className="font-bold text-lg">KSh {minPrice.toLocaleString()}</span>
                        </div>
                        {minPrice !== maxPrice && (
                          <div className="flex justify-between items-center">
                            <span>Up to:</span>
                            <span className="font-semibold">KSh {maxPrice.toLocaleString()}</span>
                          </div>
                        )}
                        <p className="text-xs mt-2 pt-2 border-t border-blue-300">
                          Prices may vary based on service complexity and provider experience
                        </p>
                      </>
                    );
                  })()}
                </div>
              </div>
            )}

            {/* Contact Info */}
            <div className="bg-green-50 rounded-lg border border-green-200 p-6">
              <h3 className="font-semibold text-green-900 mb-3 flex items-center">
                <MessageCircle size={18} className="mr-2" />
                How to Contact
              </h3>
              <div className="space-y-2 text-sm text-green-800">
                <div className="flex items-start">
                  <CheckCircle size={16} className="mr-2 mt-0.5 flex-shrink-0" />
                  <span>Choose your preferred provider</span>
                </div>
                <div className="flex items-start">
                  <CheckCircle size={16} className="mr-2 mt-0.5 flex-shrink-0" />
                  <span>Click WhatsApp, SMS, or Call</span>
                </div>
                <div className="flex items-start">
                  <CheckCircle size={16} className="mr-2 mt-0.5 flex-shrink-0" />
                  <span>Message is pre-filled for you</span>
                </div>
                <div className="flex items-start">
                  <CheckCircle size={16} className="mr-2 mt-0.5 flex-shrink-0" />
                  <span>Discuss details directly</span>
                </div>
              </div>
            </div>

            {/* Become Provider CTA */}
            <div className="bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg p-6 text-white">
              <h3 className="font-semibold text-lg mb-2">Are you a {service.name} provider?</h3>
              <p className="text-sm mb-4 text-blue-100">
                Join our platform and connect with clients looking for your services.
              </p>
              <button
                onClick={() => window.location.href = '/register?role=service_provider'}
                className="block w-full bg-white text-blue-600 py-2 rounded-lg hover:bg-gray-100 transition-colors font-semibold text-center"
              >
                Register as Provider
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ServiceDetails;