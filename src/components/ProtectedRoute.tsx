import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';

interface ProtectedRouteProps {
  allowedRoles?: ('SUPER_ADMIN' | 'MANAGER' | 'TEACHER' | 'STUDENT' | 'PUBLIC_STUDENT' | 'EMPLOYEE')[];
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ allowedRoles }) => {
  const { isAuthenticated, isLoading, user, hasRole } = useAuth();

  if (isLoading) {
    return <div>Loading authentication...</div>; // Or a spinner component
  }

  if (!isAuthenticated) {
    toast.error('You need to log in to access this page.');
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !hasRole(allowedRoles)) {
    toast.error('You do not have permission to access this page.');
    return <Navigate to="/" replace />; // Redirect to home or a permission denied page
  }

  return <Outlet />;
};

export default ProtectedRoute;