// src/utils/location.ts

export type Location =GeoCoordinates &  {
  address: string;
  lat: number;
  lng: number;

  placeId?: string; // For Google Maps or similar services
};
// src/types/location.ts
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

// utils/location.ts
export const parseLocation = (location: unknown): Location | null => {
  if (isLocationObject(location)) return location;
  if (typeof location === 'string') {
    try {
      const parsed = JSON.parse(location);
      if (isLocationObject(parsed)) return parsed;
      return null;
    } catch {
      return null;
    }
  }
  return null;
};

export const getLocationString = (location: unknown): string => {
  const parsed = parseLocation(location);
  return parsed?.address || 'Location specified';
};
