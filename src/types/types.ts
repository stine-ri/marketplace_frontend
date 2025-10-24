// src/types/types.ts
import { Location } from '../utilis/location'; 
export type Service = {
  id: number;
  name: string;
  category?: string;
  price: number | string | null; 
  lat: number;
  lng: number;
  description?: string;
  // Add the missing properties:
  duration?: string;
  isPopular?: boolean;
  features?: string[];
  replace?: never; 
};

export type College = {
  id: number;
  name: string;
  location?: string;
};

// types.ts or types/types.ts
export interface Interest {
  id: number;
  providerId: number;
  requestId: number;
  message?: string;
  createdAt: string;
  updatedAt:string;
  isShortlisted?:string;
  chatRoomId?: number;
  proposedPrice?: number; 
  status: 'pending' | 'accepted' | 'rejected';
  provider?: {
    id: number;
    firstName: string;
    lastName: string;
    name: string;
    contact: string;
    avatar?: string;
    profileImageUrl?: string; 
      user?: {
      id: number;
      fullName: string;
      avatar?: string;
      profileImageUrl?: string; 
      created_at:string;
      updated_at:string
    };
  };
}


export interface Request {
  id: number;
  userId: number;
  serviceId?: number;
  productName?: string;
  isService: boolean;
  description?: string;
  desiredPrice: number;
  title: string;
  budget: number; 
  category: string; 
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
  status: 'open' | 'closed' | 'pending' | 'accepted'|'completed'|'archived'| 'expired';
  createdAt: string;
  updated_at:string;
  expiresAt?: string | null;
  archivedAt?: string | null;
  archivedByClient?: boolean;
  isExpired?: boolean;
  isArchived?: boolean;
  interests?: Interest[]; 
  bids?: Bid[];
  images?: string[] | Array<{ url: string; publicId?: string }>;
  college?: {
    id: number;
    name: string;
  };
   // Add these new properties for service list requests
  fromServiceList?: boolean;
  requestSource?: 'service_list' | 'regular';
  originalRequestType?: 'service_list' | 'regular';
  requestType?: 'service_list' | 'regular';
  // Add client info for service list requests
  client?: {
    id: number;
    name: string;
    email: string;
    phone?: string;
  };
}

// Only used where backend sends snake_case fields
export interface ClientRequest extends Request {
  desired_price: number; // override for use in components that consume backend directly
   // Ensure these properties are inherited from Request
  fromServiceList?: boolean;
  requestSource?: 'service_list' | 'regular';
  originalRequestType?: 'service_list' | 'regular';
  requestType?: 'service_list' | 'regular';
  client?: {
    id: number;
    name: string;
    email: string;
    phone?: string;
  };
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
  profileImageUrl?: string; 
  createdAt: string;
  updatedAt: string;
  college: College | null;
  services: Service[];

  user?: {
    id: number;
    fullName: string;
    avatar?: string;
  };
  pastWorks: PastWork[];
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
   avatar?: string;
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
  contact_phone:string,
  address:string,
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

export interface PastWork {
  id?: number;
  imageUrl: string;
  description: string;
  shouldDelete?: boolean;
}

// You might also want these additional types for forms and API responses
export type ProviderProfileFormData = Omit<ProviderProfile, 
  'userId' | 'createdAt' | 'updatedAt' | 'college' | 'servicesDetails'
> & {
   id?: number; 
  college?: College; // For form selection
  servicesDetails?: Service[]; // For displaying selected services
   pastWorks?: PastWork[];
   reviewCount?: number;
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


export interface Review {
  user: string;
  comment: string;
  rating: number;
}

export interface Product {
  id: number;
  providerId: number;
  name: string;
  description: string;
  price: string;
  images: (string | null | undefined)[];
  categoryId: number | null; 
  stock?: number;
  status: 'draft' | 'published' | 'archived';
  createdAt: string;
  updatedAt: string;

  // Legacy/compatibility properties
  image?: string | null; 
  primaryImage?: string | null;  
  imageUrl?: string | null;      

  provider: {
    firstName: string;
    lastName: string;
    rating?: number;
    profileImageUrl?: string | null | undefined;
  };

  // 🔹 Newly added optional properties
  featured?: boolean;
  originalPrice?: number;
  location?: string;
  rating?: number;
  reviews?: Review[];
  tags?: string[];
  inStock?: boolean; // alias for stock
}


export interface ProductSale {
  id: number;
  productId: number;
  customerId: number;
  quantity: number;
  totalPrice: number;
  status: 'pending' | 'completed' | 'cancelled';
  createdAt: string;
  updatedAt: string;
  customer: {
    name: string;
    email: string;
  };
  product: {
    name: string;
    mainImage: string;
  };
}
export interface ChatRoom {
  id: number;
  requestId: number;
  clientId: number;
  providerId: number;
  status: 'active' | 'closed';
  createdAt: string;
  updatedAt: string;
  lastMessage?: ChatMessage;
  request?: {
    productName: string;
  };
  unreadCount?: number;
  client?: User; 
  provider?: User | ProviderProfile; 
  fromInterest?: boolean; 
  
}

export interface ChatMessage {
  id: number;
  chatRoomId: number;
  senderId: number;
  content: string;
  isSystem: boolean;
  read: boolean;
  createdAt: string;
  sender?: {
    id: number;
    name: string;
    avatar?: string;
  };
}
export type CombinedChatRoom = ChatRoom & {
  fromInterest?: boolean;
  request?: Request;
  otherParty?: User;
};

export interface InterestWithChatRoom extends Interest {
  chatRoom: ChatRoom;
  request: Request;
}
export interface Category {
  id: number;
  name: string;
  description?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}
export interface InterestUI extends Omit<Interest, 'chatRoom' | 'request'> {
  chatRoom?: ChatRoom; // Make optional
  request?: Request; // Make optional
  isTemp?: boolean; // Flag to indicate temporary interest
}

// websocket
export interface ServiceRequest {
  id: number;
  requestTitle: string;
  description?: string;
  budgetMin?: string;
  budgetMax?: string;
  deadline?: string;
  urgency: 'low' | 'normal' | 'high' | 'urgent';
  location?: string;
  clientNotes?: string;
  status: 'pending' | 'accepted' | 'declined' | 'completed';
  createdAt: string;
  client: {
    id: number;
    full_name: string;
    avatar?: string;
    email?: string;
    phone?: string;
  };
  provider?: {
    id: number;
    full_name: string;
    avatar?: string;
  };
  service: {
    id: number;
    name: string;
    description?: string;
  };
  chatRoom?: {
    id: number;
  };
}

export interface WebSocketMessage {
  type: string;
  data: any;
}