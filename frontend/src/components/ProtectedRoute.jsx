import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";

/**
 * ProtectedRoute — wraps pages that require authentication.
 *
 * Props:
 *  - role: "admin" | "donor" | "hospital" | "user"  → enforce specific role
 *  - hospitalOnly: boolean → shorthand for role="hospital"
 *  - children: React node
 */
export default function ProtectedRoute({ children, role, hospitalOnly }) {
  const { user, token } = useSelector((state) => state.auth);
  const location = useLocation();

  // Not logged in → send to login
  if (!token || !user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Hospital-only pages
  if (hospitalOnly && user.role !== "hospital" && user.role !== "admin") {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Role-specific pages
  if (role && user.role !== role && user.role !== "admin") {
    // Redirect to the user's correct dashboard instead of 403
    const dashboardMap = {
      donor: "/donor/dashboard",
      hospital: "/hospital/dashboard",
      user: "/user/dashboard",
      admin: "/admin/dashboard",
    };
    return <Navigate to={dashboardMap[user.role] || "/"} replace />;
  }

  return children;
}