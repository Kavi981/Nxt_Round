import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from '../config/api';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch user on initial load to check session status
    fetchUser();
  }, []);

  const fetchUser = async () => {
    try {
      setLoading(true);
      // The backend /api/auth/me now checks the session
      const response = await axios.get('/api/auth/me');
      setUser(response.data);
    } catch (error) {
      // If /me fails (e.g., not authenticated), clear user
      console.error('Error fetching user session:', error);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  // Login function now initiates Google OAuth redirect
  const login = () => {
    // Redirect the user to the backend's Google OAuth route
    // Use the appropriate backend URL based on environment
    const backendUrl = process.env.NODE_ENV === 'development' 
      ? 'http://localhost:5000' 
      : 'https://nxt-round.onrender.com';
    window.location.href = `${backendUrl}/api/auth/google`;
  };

  // Register function is removed as registration happens via Google OAuth

  const logout = async () => {
    try {
      await axios.get('/api/auth/logout'); // Call backend logout endpoint
      setUser(null);
      // No need to remove token or headers as we use sessions now
    } catch (error) {
      console.error('Error logging out:', error);
      // Even if backend logout fails, clear frontend state
      setUser(null);
    }
  };

  const value = {
    user,
    loading,
    login,
    // register is removed
    logout,
    fetchUser // Expose fetchUser if needed elsewhere (e.g., after callback)
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};