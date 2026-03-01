import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';
import axiosInstance from '../api/axiosInstance';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    // Tab Isolation: Use sessionStorage instead of localStorage to prevent cross-account leakage
    const savedUser = sessionStorage.getItem('user');
    try {
      return savedUser ? JSON.parse(savedUser) : null;
    } catch (e) {
      console.error("Failed to parse saved user", e);
      return null;
    }
  });

  // Start as true only if we don't have a cached user; otherwise, render immediately
  const [loading, setLoading] = useState(() => !sessionStorage.getItem('user'));

  const checkAuthStatus = React.useCallback(async () => {
    try {
      const token = sessionStorage.getItem('token');

      // Prepare headers
      const headers = {};
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await axiosInstance.get(
        '/auth/auth-status',
        {
          headers: headers
        }
      );

      if (response.data.success && response.data.user) {
        setUser(response.data.user);
        sessionStorage.setItem('user', JSON.stringify(response.data.user)); // Update cache
        console.log('✅ User authenticated via:', response.data.authMethod);
      } else {
        // Backend now returns 200 with success: false for unauthenticated users
        setUser(null);
        sessionStorage.removeItem('token');
        sessionStorage.removeItem('user');
      }
    } catch (error) {
      console.log('❌ Authentication check error:', error.message);
      setUser(null);
      sessionStorage.removeItem('token');
      sessionStorage.removeItem('user'); // Also remove user from sessionStorage
    } finally {
      // Ensure axiosInstance has the current token from THIS tab's state
      const currentToken = sessionStorage.getItem('token');
      if (currentToken) {
        axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${currentToken}`;
      }
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    checkAuthStatus();
  }, [checkAuthStatus]);

  // ✅ ADD THIS FUNCTION - For OTP and regular login
  const login = (token, userData) => {
    console.log('🔄 AuthContext login called with:', { token, userData });

    // Store in sessionStorage (Tab Isolated)
    sessionStorage.setItem('token', token);
    sessionStorage.setItem('user', JSON.stringify(userData));

    // Set axios default header for THIS tab instance
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${token}`;

    // Update state
    setUser(userData);

    console.log('✅ User logged in via AuthContext:', userData);
  };

  const loginWithGoogle = () => {
    window.location.href = `${import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000'}/api/auth/google`;
  };

  const logout = async () => {
    try {
      await axios.post(
        `${import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000'}/api/auth/logout`,
        {},
        { withCredentials: true }
      );
    } catch (error) {
      console.log('Logout endpoint error (might be expected)');
    } finally {
      setUser(null);
      sessionStorage.removeItem('token');
      sessionStorage.removeItem('user'); // Also remove user from sessionStorage
      delete axios.defaults.headers.common['Authorization']; // Remove axios header
      window.location.href = '/login';
    }
  };

  // Set user manually after login (keep this for compatibility)
  const setUserData = (userData) => {
    setUser(userData);
    sessionStorage.setItem('user', JSON.stringify(userData)); // Sync with cache
  };

  const value = {
    user,
    loading,
    login, // ✅ ADD THIS
    loginWithGoogle,
    logout,
    checkAuthStatus,
    setUserData
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
