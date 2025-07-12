import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    // Still checking authentication status
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!user) {
    // Not authenticated, redirect to home or a login page
    // Redirecting to home as we don't have a dedicated login page anymore
    return <Navigate to="/" replace />;
  }

  // Authenticated, render children
  return children;
};

export default ProtectedRoute;