import React from 'react';
import { Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';

const ProtectedRoute = ({
  children,
  adminOnly = false,
  hospitalOnly = false,
  requiredRole = null
}) => {
  const { user, token } = useSelector((state) => state.auth);

  // 🔐 Not logged in
  if (!token || !user) {
    return <Navigate to="/login" replace />;
  }

  // 🔴 Admin only
  if (adminOnly && user.role !== 'admin') {
    return <Navigate to="/home" replace />;
  }

  // 🏥 Hospital only
  if (hospitalOnly && user.role !== 'hospital') {
    return <Navigate to="/home" replace />;
  }

  // 🎯 Specific role check (flexible)
  if (requiredRole && user.role !== requiredRole) {
    return <Navigate to="/home" replace />;
  }

  return children;
};

export default ProtectedRoute;