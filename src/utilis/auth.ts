// utilis/auth.ts
export const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  };
};

export const isAdmin = () => {
  try {
    const token = localStorage.getItem('token');
    console.log('Token in isAdmin():', token); // Debug log
    
    if (!token) {
      console.log('No token found in localStorage');
      return false;
    }
    
    // Decode JWT token manually (simple base64 decode for payload)
    const payload = JSON.parse(atob(token.split('.')[1]));
    console.log('Token payload in isAdmin:', payload); // Debug log
    console.log('Role check result:', payload.role === 'admin'); // Debug log
    
    return payload.role === 'admin';
  } catch (error) {
    console.error('Error checking admin status:', error);
    return false;
  }
};

export const getCurrentUser = () => {
  try {
    const token = localStorage.getItem('token');
    if (!token) return null;
    
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload;
  } catch (error) {
    console.error('Error getting current user:', error);
    return null;
  }
};