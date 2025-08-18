// src/utils/testimonials.ts
export interface Testimonial {
  id: string;
  name: string;
  role: string;
  rating: number;
  content: string;
  type: 'service' | 'provider' | 'product';
  serviceType?: string;
  productType?: string;
  avatar?: string;
  gender?: 'male' | 'female';
}

export const fetchPublicTestimonials = async (limit = 6): Promise<Testimonial[]> => {
  try {
    const response = await fetch(`https://mkt-backend-sz2s.onrender.com/api/testimonials/public?limit=${limit}`);
    if (!response.ok) throw new Error('Failed to fetch');
    return await response.json();
  } catch (error) {
    console.error('Error fetching testimonials:', error);
    return [];
  }
};