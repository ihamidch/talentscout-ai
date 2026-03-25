import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';

const ProtectedRoute = ({ allowedRoles }) => {
  const token = localStorage.getItem('token');
  const role = localStorage.getItem('role');

  // 1. If not logged in, send to login
  if (!token) {
    return <Navigate to="/login" replace />;
  }

  // 2. If logged in but role doesn't match, send to their default home
  if (allowedRoles && !allowedRoles.includes(role)) {
    return <Navigate to={role === 'recruiter' ? '/dashboard' : '/apply'} replace />;
  }

  // 3. If everything is fine, show the page (Outlet)
  return <Outlet />;
};

export default ProtectedRoute;