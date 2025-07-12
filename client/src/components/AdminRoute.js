import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const AdminRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    // Still checking authentication status
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  // Check if user is authenticated AND is an admin
  if (!user || user.role !== 'admin') {
    // Not authorized, redirect to home
    return <Navigate to="/" replace />;
  }

  // Authenticated and is admin, render children
  return children;
};

export default AdminRoute;