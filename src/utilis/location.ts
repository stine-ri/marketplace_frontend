// Enhanced utils/location.ts
export type Location = GeoCoordinates & {
  address: string;
  lat: number;
  lng: number;
  placeId?: string; // For Google Maps or similar services
};

export type GeoCoordinates = {
  lat: number;
  lng: number;
};

export type Address = {
  street: string;
  city: string;
  state?: string;
  postalCode?: string;
  country?: string;
};

export function isLocationObject(loc: unknown): loc is Location {
  return (
    typeof loc === 'object' &&
    loc !== null &&
    'address' in loc &&
    'lat' in loc &&
    'lng' in loc
  );
}

// Enhanced parseLocation function
export const parseLocation = (location: unknown): Location | null => {
  if (isLocationObject(location)) return location;
  
  if (typeof location === 'string') {
    // Handle empty or invalid JSON strings
    if (!location.trim() || location.trim() === '{}') return null;
    
    try {
      const parsed = JSON.parse(location);
      if (isLocationObject(parsed)) return parsed;
      return null;
    } catch {
      return null;
    }
  }
  
  // Handle plain objects that might not match Location interface exactly
  if (typeof location === 'object' && location !== null) {
    const loc = location as any;
    
    // Check if it has coordinates and some form of address/name
    if ((loc.lat || loc.latitude) && (loc.lng || loc.longitude)) {
      return {
        lat: loc.lat || loc.latitude,
        lng: loc.lng || loc.longitude,
        address: loc.address || loc.name || loc.formatted_address || 'Location specified'
      };
    }
    
    // If it only has address-like properties
    if (loc.address || loc.name || loc.formatted_address) {
      return {
        lat: 0, // Default coordinates
        lng: 0,
        address: loc.address || loc.name || loc.formatted_address
      };
    }
  }
  
  return null;
};

// Enhanced getLocationString function
export const getLocationString = (location: unknown): string => {
  const parsed = parseLocation(location);
  if (parsed) {
    return parsed.address;
  }
  
  // Handle plain string locations
  if (typeof location === 'string' && location.trim() && location.trim() !== '{}') {
    try {
      JSON.parse(location); // Test if it's JSON
      return 'Location specified'; // It's JSON but not parseable as Location
    } catch {
      return location; // It's a plain string location
    }
  }
  
  return 'Location not specified';
};

// New function to get display info with coordinates
export const getLocationDisplay = (location: unknown): {
  display: string;
  coords?: { lat: number; lng: number };
} => {
  const parsed = parseLocation(location);
  
  if (parsed) {
    return {
      display: parsed.address,
      coords: parsed.lat !== 0 || parsed.lng !== 0 ? { lat: parsed.lat, lng: parsed.lng } : undefined
    };
  }
  
  // Handle plain string locations
  if (typeof location === 'string' && location.trim() && location.trim() !== '{}') {
    try {
      JSON.parse(location); // Test if it's JSON
      return { display: 'Location specified' };
    } catch {
      return { display: location }; // It's a plain string location
    }
  }
  
  return { display: 'Location not specified' };
};

// Function to format coordinates for display
export const formatCoordinates = (lat: number, lng: number): string => {
  return `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
};

// Function to check if location has valid coordinates
export const hasValidCoordinates = (location: unknown): boolean => {
  const parsed = parseLocation(location);
  return parsed ? (parsed.lat !== 0 || parsed.lng !== 0) : false;
};