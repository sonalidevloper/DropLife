import React, { useEffect } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { toast } from 'react-toastify';

const ProtectedRoute = ({ children, role }) => {
  const navigate = useNavigate();
  const { user, token } = useSelector((state) => state.auth);

  useEffect(() => {
    // If no token, redirect to login
    if (!token) {
      toast.warning('Please login to access this page');
    }
    
    // If role doesn't match, show error
    if (token && role && user?.role !== role) {
      toast.error('Access denied. Insufficient permissions.');
    }
  }, [token, role, user]);

  // Check if user is authenticated
  if (!token || !user) {
    return <Navigate to="/login" replace />;
  }

  // Check if user has the required role
  if (role && user.role !== role) {
    // Redirect based on user's actual role
    switch(user.role) {
      case 'admin':
        return <Navigate to="/admin/dashboard" replace />;
      case 'donor':
        return <Navigate to="/donor/dashboard" replace />;
      case 'hospital':
        return <Navigate to="/hospital/dashboard" replace />;
      case 'user':
        return <Navigate to="/user/dashboard" replace />;
      default:
        return <Navigate to="/home" replace />;
    }
  }

  return children;
};

export default ProtectedRoute;