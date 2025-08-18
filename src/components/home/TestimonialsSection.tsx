// src/components/TestimonialsSection.tsx
import  { useState, useEffect } from 'react';
import { Star, Quote } from 'lucide-react';
import { Testimonial, fetchPublicTestimonials } from '../../utilis/testimonials';

const TestimonialsSection = () => {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPublicTestimonials().then(data => {
      setTestimonials(data);
      setLoading(false);
    });
  }, []);

  if (loading) {
    return (
      <section className="py-12 lg:py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-2">What Our Users Say</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Loading testimonials...
            </p>
          </div>
        </div>
      </section>
    );
  }

  if (testimonials.length === 0) {
    return (
      <section className="py-12 lg:py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-2">What Our Users Say</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Testimonials will be available when our clients write reviews. Check back soon!
            </p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-12 lg:py-16 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-2">What Our Users Say</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Hear from our community of buyers, service providers, and sellers
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {testimonials.map((testimonial) => (
            <div key={testimonial.id} className="bg-white p-6 rounded-lg shadow-md relative">
              <Quote size={40} className="absolute top-4 right-4 text-blue-100" />
              <div className="flex items-center mb-4">
                <img 
                  src={testimonial.avatar || `https://randomuser.me/api/portraits/${testimonial.gender === 'female' ? 'women' : 'men'}/${Math.floor(Math.random() * 100)}.jpg`} 
                  alt={testimonial.name} 
                  className="w-12 h-12 rounded-full mr-4" 
                />
                <div>
                  <h4 className="font-medium">{testimonial.name}</h4>
                  <p className="text-gray-500 text-sm">{testimonial.role}</p>
                </div>
              </div>
              <div className="flex items-center text-yellow-500 mb-3">
                {[...Array(5)].map((_, i) => (
                  <Star 
                    key={i} 
                    size={16} 
                    fill={i < testimonial.rating ? "currentColor" : "none"} 
                    className={i < testimonial.rating ? "text-yellow-500" : "text-gray-300"} 
                  />
                ))}
              </div>
              <p className="text-gray-600 mb-2">"{testimonial.content}"</p>
              <p className="text-sm text-gray-500">
                {testimonial.type === 'service' 
                  ? `Used the platform for: ${testimonial.serviceType || 'Service'}`
                  : testimonial.type === 'provider'
                  ? `Service offered: ${testimonial.serviceType || 'Service'}`
                  : `Products: ${testimonial.productType || 'Product'}`}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;