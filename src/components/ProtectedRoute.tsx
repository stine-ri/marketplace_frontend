// src/components/ProtectedRoute.tsx
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// Define the props interface for the ProtectedRoute component
interface ProtectedRouteProps {
  children: JSX.Element;
  requiredRole?: string;
}

// The ProtectedRoute component that checks authentication and authorization
export default function ProtectedRoute({ children, requiredRole }: ProtectedRouteProps) {
  // Destructure the auth context values
  const { user, loading } = useAuth(); // Fixed: Changed 'provider' to 'user' to match checks below

  // Show loading state while authentication status is being determined
  if (loading) {
    return <div>Loading...</div>; // Or a spinner
  }

  // Redirect to login if user is not authenticated
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Check if the user has the required role if one is specified
if (requiredRole && user.role !== requiredRole) {
  return <Navigate to="/" replace />;
}


  // If all checks pass, render the child components
  return children;
}