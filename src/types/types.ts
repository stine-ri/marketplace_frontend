// src/types/types.ts
import { Location } from '../utilis/location'; 
export type Service = {
  id: number;
  name: string;
  category?: string;
  price?: number; 
  lat: number;
  lng: number;
};

export type College = {
  id: number;
  name: string;
  location?: string;
};

export interface Request {
  id: number;
  userId: number;
  serviceId?: number;
  productName?: string;
  isService: boolean;
  description?: string;
  desiredPrice: number;
  title: string;
  budget: number; // ✅ Add this
  category: string; // ✅ Add this
  location: string | Location;
  latitude?: number;
  longitude?: number;
  serviceName: string; 
  desired_price: number;
  subcategory?: string;
  urgency?: 'low' | 'medium' | 'high';
  preferredTime?: string; // or use Date if you're storing date objects
  specialRequirements?: string;
  notes?: string;
  collegeFilterId?: number;
  status: 'open' | 'closed' | 'pending' | 'accepted';
  created_at: string;
  bids?: Bid[];
  college?: {
    id: number;
    name: string;
  };
}

// Only used where backend sends snake_case fields
export interface ClientRequest extends Request {
  desired_price: number; // override for use in components that consume backend directly
}
export interface Bid {
  id: number;
  requestId: number;
  providerId: number;
  price: number;
  message?: string;
  isGraduateOfRequestedCollege: boolean;
  status: 'pending' | 'accepted' | 'rejected' | 'countered' | 'withdrawn';

  createdAt: string;
  provider?: {
    id: number;
    firstName: string;
    lastName: string;
    rating?: number;
    completedRequests?: number;
  };
}

export type Notification = {
  id: number;
  type: 'new_request' | 'bid_accepted' | 'message';
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
  link?: string;
  icon?: string;
};

export interface ProviderProfile {
  id: number;
  userId: number;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  collegeId: number;
  latitude: number | null;
  longitude: number | null;
  address: string;
  bio: string;
  isProfileComplete: boolean;
  rating: number | null;
  completedRequests: number;
  profileImageUrl?: string; // ✅ Add this if it's optional
  createdAt: string;
  updatedAt: string;
  college: College | null;
  services: Service[];
}


export type User = {
  id: number;
  email: string;
  role: 'admin' | 'client' | 'service_provider';
  isVerified: boolean;
  createdAt: string;
  providerId?: number;
  providerProfile?: ProviderProfile; // Optional nested provider profile
};

// You might also want these additional types for forms and API responses
export type ProviderProfileFormData = Omit<ProviderProfile, 
  'id' | 'userId' | 'createdAt' | 'updatedAt' | 'college' | 'servicesDetails'
> & {
  college?: College; // For form selection
  servicesDetails?: Service[]; // For displaying selected services
};

export type ProviderProfileUpdateResponse = {
  profile: ProviderProfile;
  message: string;
};
export interface CreateBidPayload {
  providerId: number;
  requestId: number;
  price: number;
  message?: string;
}