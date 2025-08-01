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
  updatedAt: string; // 
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
  createdAt: string;        // Frontend/existing components use this
  name: string;             // Frontend/existing components use this
  updatedAt: string;
  isActive?: boolean;
  providerId?: number;
  providerProfile?: ProviderProfile;
  
  // Backend compatibility fields (optional)
  created_at?: string;      // Backend uses this
  updated_at?: string;      // Backend might use this
  full_name?: string;       // Backend uses this
};

export type CreateUserData = {
  name: string;
  email: string;
  password: string;
  role: 'admin' | 'client' | 'service_provider';
};

export type UpdateUserData = {
  name?: string;
  email?: string;
  role?: 'admin' | 'client' | 'service_provider';
  isActive?: boolean;
};

// Helper type for raw backend response
export type BackendUser = {
  id: number;
  email: string;
  role: 'admin' | 'client' | 'service_provider';
  isVerified: boolean;
  created_at: string;       // Backend format
  full_name: string;        // Backend format
  updated_at: string;       // Backend format
  isActive?: boolean;
  providerId?: number;
  providerProfile?: ProviderProfile;
};

// Utility functions to convert between formats
export const normalizeUser = (backendUser: BackendUser): User => ({
  ...backendUser,
  name: backendUser.full_name,           // Map full_name to name
  createdAt: backendUser.created_at,     // Map created_at to createdAt
  updatedAt: backendUser.updated_at,     // Map updated_at to updatedAt
  full_name: backendUser.full_name,      // Keep original for compatibility
  created_at: backendUser.created_at,    // Keep original for compatibility
});

export const denormalizeUser = (user: User): Partial<BackendUser> => ({
  id: user.id,
  email: user.email,
  role: user.role,
  full_name: user.name,                  // Map name to full_name for backend
  isActive: user.isActive,
});


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