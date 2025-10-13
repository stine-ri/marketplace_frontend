import { useState, useEffect } from 'react';
import { Star, Quote, ChevronLeft, ChevronRight, User } from 'lucide-react';

export interface Testimonial {
  id: string;
  name: string;
  role: string;
  content: string;
  rating: number;
  avatar?: string;
  gender?: 'male' | 'female';
  type: 'client' | 'customer' | 'service_provider' | 'provider' | 'product_seller' | 'seller';
  serviceType?: string;
  productType?: string;
  date?: string;
}

// Mock data generator
const generateMockTestimonials = (): Testimonial[] => [
  {
    id: '1',
    name: 'Sarah Johnson',
    role: 'Freelance Designer',
    content: 'This platform has completely transformed how I find clients. The interface is intuitive and the community is amazing!',
    rating: 5,
    gender: 'female',
    type: 'service_provider',
    serviceType: 'Graphic Design',
    date: '2025-09-15'
  },
  {
    id: '2',
    name: 'Mike Chen',
    role: 'Small Business Owner',
    content: 'As a client, I found exactly what I needed in hours instead of days. The quality of services exceeded my expectations.',
    rating: 5,
    gender: 'male',
    type: 'client',
    serviceType: 'Web Development',
    date: '2025-09-22'
  },
  {
    id: '3',
    name: 'Emily Rodriguez',
    role: 'Marketing Consultant',
    content: 'The platform made it so easy to showcase my skills and connect with clients who value quality work.',
    rating: 4,
    gender: 'female',
    type: 'provider',
    serviceType: 'Digital Marketing',
    date: '2025-09-28'
  },
  {
    id: '4',
    name: 'David Thompson',
    role: 'Startup Founder',
    content: 'We found incredible talent for our project. The review system helped us make informed decisions quickly.',
    rating: 5,
    gender: 'male',
    type: 'customer',
    serviceType: 'Mobile App Development',
    date: '2025-10-02'
  },
  {
    id: '5',
    name: 'Lisa Wang',
    role: 'E-commerce Seller',
    content: 'Selling my digital products has never been easier. The platform handles everything from payments to delivery.',
    rating: 4,
    gender: 'female',
    type: 'product_seller',
    productType: 'Digital Templates',
    date: '2025-10-05'
  },
  {
    id: '6',
    name: 'Alex Kumar',
    role: 'Content Creator',
    content: 'Outstanding platform for creative professionals. The support team is responsive and the features keep getting better.',
    rating: 5,
    gender: 'male',
    type: 'service_provider',
    serviceType: 'Video Editing',
    date: '2025-10-08'
  }
];

// Simulate API call delay
const fetchPublicTestimonials = (): Promise<Testimonial[]> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(generateMockTestimonials());
    }, 1000);
  });
};

const TestimonialsSection = () => {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    fetchPublicTestimonials().then(data => {
      setTestimonials(data);
      setLoading(false);
    });
  }, []);

  const nextSlide = () => {
    setCurrentSlide((prev) => 
      prev === testimonials.length - 1 ? 0 : prev + 1
    );
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => 
      prev === 0 ? testimonials.length - 1 : prev - 1
    );
  };

  const getTypeConfig = (type: string) => {
    switch (type) {
      case 'client':
      case 'customer':
        return {
          color: 'bg-blue-500',
          gradient: 'from-blue-500 to-blue-600',
          badge: 'bg-blue-100 text-blue-700 border-blue-200',
          label: 'Client'
        };
      case 'service_provider':
      case 'provider':
        return {
          color: 'bg-emerald-500',
          gradient: 'from-emerald-500 to-emerald-600',
          badge: 'bg-emerald-100 text-emerald-700 border-emerald-200',
          label: 'Service Provider'
        };
      case 'product_seller':
      case 'seller':
        return {
          color: 'bg-purple-500',
          gradient: 'from-purple-500 to-purple-600',
          badge: 'bg-purple-100 text-purple-700 border-purple-200',
          label: 'Seller'
        };
      default:
        return {
          color: 'bg-gray-500',
          gradient: 'from-gray-500 to-gray-600',
          badge: 'bg-gray-100 text-gray-700 border-gray-200',
          label: 'User'
        };
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const getAvatarColor = (name: string) => {
    const colors = [
      'from-rose-400 to-rose-600',
      'from-orange-400 to-orange-600',
      'from-amber-400 to-amber-600',
      'from-lime-400 to-lime-600',
      'from-emerald-400 to-emerald-600',
      'from-teal-400 to-teal-600',
      'from-cyan-400 to-cyan-600',
      'from-blue-400 to-blue-600',
      'from-indigo-400 to-indigo-600',
      'from-violet-400 to-violet-600',
      'from-purple-400 to-purple-600',
      'from-fuchsia-400 to-fuchsia-600',
      'from-pink-400 to-pink-600',
    ];
    const index = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % colors.length;
    return colors[index];
  };

  if (loading) {
    return (
      <section className="py-20 lg:py-32 bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 relative overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute inset-0 opacity-40">
          <div className="absolute top-20 left-10 w-72 h-72 bg-blue-300 rounded-full mix-blend-multiply filter blur-3xl animate-pulse"></div>
          <div className="absolute bottom-20 right-10 w-72 h-72 bg-indigo-300 rounded-full mix-blend-multiply filter blur-3xl animate-pulse"></div>
        </div>

        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-16">
            <div className="inline-flex items-center justify-center px-4 py-2 mb-6 bg-white/60 backdrop-blur-sm rounded-full border border-blue-200">
              <Quote size={16} className="text-blue-600 mr-2" />
              <span className="text-sm font-semibold text-blue-700">Testimonials</span>
            </div>
            <h2 className="text-5xl lg:text-6xl font-bold mb-6 bg-gradient-to-r from-slate-900 via-blue-800 to-indigo-900 bg-clip-text text-transparent">
              What Our Community Says
            </h2>
            <p className="text-slate-600 text-xl max-w-2xl mx-auto">
              Loading testimonials...
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="bg-white/80 backdrop-blur-sm p-8 rounded-3xl shadow-lg animate-pulse border border-slate-200">
                <div className="flex items-center mb-6">
                  <div className="w-16 h-16 rounded-2xl bg-slate-200 mr-4"></div>
                  <div className="flex-1">
                    <div className="h-5 bg-slate-200 rounded w-3/4 mb-3"></div>
                    <div className="h-4 bg-slate-200 rounded w-1/2"></div>
                  </div>
                </div>
                <div className="flex mb-4">
                  {[...Array(5)].map((_, j) => (
                    <div key={j} className="w-5 h-5 bg-slate-200 rounded mr-1"></div>
                  ))}
                </div>
                <div className="space-y-3">
                  <div className="h-4 bg-slate-200 rounded"></div>
                  <div className="h-4 bg-slate-200 rounded w-5/6"></div>
                  <div className="h-4 bg-slate-200 rounded w-4/6"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-20 lg:py-32 bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 relative overflow-hidden">
      {/* Decorative elements */}
      <div className="absolute inset-0 opacity-40">
        <div className="absolute top-20 left-10 w-72 h-72 bg-blue-300 rounded-full mix-blend-multiply filter blur-3xl animate-blob"></div>
        <div className="absolute bottom-20 right-10 w-72 h-72 bg-indigo-300 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-2000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-4000"></div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center mb-20">
          <div className="inline-flex items-center justify-center px-4 py-2 mb-6 bg-white/60 backdrop-blur-sm rounded-full border border-blue-200 shadow-sm">
            <Quote size={16} className="text-blue-600 mr-2" />
            <span className="text-sm font-semibold text-blue-700 tracking-wide">TESTIMONIALS</span>
          </div>
          <h2 className="text-5xl lg:text-6xl font-bold mb-6 bg-gradient-to-r from-slate-900 via-blue-800 to-indigo-900 bg-clip-text text-transparent leading-tight">
            What Our Community Says
          </h2>
          <p className="text-slate-600 text-xl max-w-3xl mx-auto leading-relaxed">
            Hear from our community of clients, service providers, and sellers who are thriving on our platform
          </p>
        </div>

        {/* Desktop Grid Layout */}
        <div className="hidden lg:grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {testimonials.map((testimonial) => {
            const typeConfig = getTypeConfig(testimonial.type);
            const avatarGradient = getAvatarColor(testimonial.name);
            
            return (
              <div 
                key={testimonial.id} 
                className="bg-white/90 backdrop-blur-sm p-8 rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-500 relative group hover:-translate-y-3 border border-slate-200/50 hover:border-blue-200"
              >
                <div className="absolute -top-6 -right-6 w-24 h-24 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-2xl"></div>
                
                <Quote size={40} className="absolute top-6 right-6 text-slate-100 group-hover:text-blue-100 transition-colors duration-300" />
                
                <div className="flex items-start mb-6 relative">
                  <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${avatarGradient} flex items-center justify-center text-white font-bold text-xl shadow-lg mr-4 ring-4 ring-white`}>
                    {getInitials(testimonial.name)}
                  </div>
                  <div className="flex-1">
                    <h4 className="font-bold text-slate-900 text-lg mb-1">{testimonial.name}</h4>
                    <p className="text-slate-500 text-sm mb-2">{testimonial.role}</p>
                    <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${typeConfig.badge} border`}>
                      {typeConfig.label}
                    </span>
                  </div>
                </div>

                <div className="flex items-center mb-5">
                  {[...Array(5)].map((_, i) => (
                    <Star 
                      key={i} 
                      size={18} 
                      fill={i < testimonial.rating ? "currentColor" : "none"} 
                      className={i < testimonial.rating ? "text-amber-400" : "text-slate-300"} 
                    />
                  ))}
                  <span className="ml-2 text-sm text-slate-600 font-semibold">
                    {testimonial.rating}.0
                  </span>
                </div>

                <p className="text-slate-700 mb-6 leading-relaxed text-base relative z-10">
                  "{testimonial.content}"
                </p>

                <div className="pt-5 border-t border-slate-100">
                  <div className="flex items-center text-sm text-slate-600 font-medium mb-2">
                    <div className={`w-2 h-2 rounded-full bg-gradient-to-br ${typeConfig.gradient} mr-2`}></div>
                    {testimonial.type === 'client' || testimonial.type === 'customer'
                      ? `Purchased: ${testimonial.serviceType || 'Services'}`
                      : (testimonial.type === 'service_provider' || testimonial.type === 'provider')
                      ? `Service: ${testimonial.serviceType || 'Professional Services'}`
                      : `Products: ${testimonial.productType || 'Various Items'}`}
                  </div>
                  {testimonial.date && (
                    <p className="text-xs text-slate-400 font-medium">
                      {new Date(testimonial.date).toLocaleDateString('en-US', { 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric' 
                      })}
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Mobile Carousel */}
        <div className="lg:hidden relative">
          <div className="overflow-hidden rounded-3xl">
            <div 
              className="flex transition-transform duration-500 ease-out"
              style={{ transform: `translateX(-${currentSlide * 100}%)` }}
            >
              {testimonials.map((testimonial) => {
                const typeConfig = getTypeConfig(testimonial.type);
                const avatarGradient = getAvatarColor(testimonial.name);
                
                return (
                  <div key={testimonial.id} className="w-full flex-shrink-0 px-2">
                    <div className="bg-white/90 backdrop-blur-sm p-6 rounded-3xl shadow-xl border border-slate-200/50 relative">
                      <Quote size={32} className="absolute top-4 right-4 text-slate-100" />
                      
                      <div className="flex items-start mb-5">
                        <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${avatarGradient} flex items-center justify-center text-white font-bold text-lg shadow-lg mr-3 ring-4 ring-white flex-shrink-0`}>
                          {getInitials(testimonial.name)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-bold text-slate-900 mb-1 truncate">{testimonial.name}</h4>
                          <p className="text-slate-500 text-xs mb-2 truncate">{testimonial.role}</p>
                          <span className={`inline-block px-2.5 py-1 rounded-full text-xs font-semibold ${typeConfig.badge} border`}>
                            {typeConfig.label}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center mb-4">
                        {[...Array(5)].map((_, i) => (
                          <Star 
                            key={i} 
                            size={16} 
                            fill={i < testimonial.rating ? "currentColor" : "none"} 
                            className={i < testimonial.rating ? "text-amber-400" : "text-slate-300"} 
                          />
                        ))}
                        <span className="ml-2 text-sm text-slate-600 font-semibold">
                          {testimonial.rating}.0
                        </span>
                      </div>

                      <p className="text-slate-700 mb-5 text-sm leading-relaxed">
                        "{testimonial.content}"
                      </p>

                      <div className="pt-4 border-t border-slate-100">
                        <div className="flex items-center text-xs text-slate-600 font-medium">
                          <div className={`w-1.5 h-1.5 rounded-full bg-gradient-to-br ${typeConfig.gradient} mr-2 flex-shrink-0`}></div>
                          <span className="truncate">
                            {testimonial.type === 'client' || testimonial.type === 'customer'
                              ? `Purchased: ${testimonial.serviceType || 'Services'}`
                              : (testimonial.type === 'service_provider' || testimonial.type === 'provider')
                              ? `Service: ${testimonial.serviceType || 'Professional Services'}`
                              : `Products: ${testimonial.productType || 'Various Items'}`}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Carousel Controls */}
          {testimonials.length > 1 && (
            <>
              <button
                onClick={prevSlide}
                className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 bg-white hover:bg-slate-50 text-slate-800 rounded-full p-3 shadow-xl transition-all duration-300 hover:scale-110 border border-slate-200 z-10"
                aria-label="Previous testimonial"
              >
                <ChevronLeft size={24} />
              </button>
              <button
                onClick={nextSlide}
                className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 bg-white hover:bg-slate-50 text-slate-800 rounded-full p-3 shadow-xl transition-all duration-300 hover:scale-110 border border-slate-200 z-10"
                aria-label="Next testimonial"
              >
                <ChevronRight size={24} />
              </button>
              
              {/* Dots Indicator */}
              <div className="flex justify-center mt-8 space-x-2">
                {testimonials.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setCurrentSlide(i)}
                    className={`h-2 rounded-full transition-all duration-300 ${
                      i === currentSlide 
                        ? 'bg-gradient-to-r from-blue-500 to-indigo-600 w-8' 
                        : 'bg-slate-300 w-2 hover:bg-slate-400'
                    }`}
                    aria-label={`Go to testimonial ${i + 1}`}
                  />
                ))}
              </div>
            </>
          )}
        </div>

        {/* Empty State */}
        {testimonials.length === 0 && (
          <div className="text-center py-16">
            <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-2xl p-16 max-w-2xl mx-auto border border-slate-200">
              <div className="w-20 h-20 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Quote size={40} className="text-blue-600" />
              </div>
              <h3 className="text-3xl font-bold text-slate-900 mb-4">
                No Testimonials Yet
              </h3>
              <p className="text-slate-600 text-lg mb-10 leading-relaxed">
                Be the first to share your experience! Your review will help others discover our platform.
              </p>
              <button className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold py-4 px-10 rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl hover:-translate-y-1">
                Write Your Review
              </button>
            </div>
          </div>
        )}
      </div>

      <style>{`
        @keyframes blob {
          0%, 100% { transform: translate(0, 0) scale(1); }
          25% { transform: translate(20px, -20px) scale(1.1); }
          50% { transform: translate(-20px, 20px) scale(0.9); }
          75% { transform: translate(20px, 20px) scale(1.05); }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}</style>
    </section>
  );
};

export default TestimonialsSection;