// src/utils/token.ts
export type DecodedToken = {
  id: string;
  email: string;
  role: 'admin' | 'client' | 'service_provider';
  exp?: number;
};

export const decodeToken = (token: string): DecodedToken | null => {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const payload = JSON.parse(atob(base64));
    
    return {
      id: payload.id,
      email: payload.email,
      role: payload.role,
      exp: payload.exp
    };
  } catch (error) {
    console.error('Token decoding failed:', error);
    return null;
  }
};

export const isTokenExpired = (token: string): boolean => {
  const payload = decodeToken(token);
  return !!payload?.exp && payload.exp < Date.now() / 1000;
};