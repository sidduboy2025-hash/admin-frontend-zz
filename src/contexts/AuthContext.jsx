import React, { createContext, useContext, useState, useEffect } from 'react';
import { buildApiUrl, API_CONFIG } from '../config/api';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);

  // Check if user is already logged in on app start
  useEffect(() => {
    checkAuthStatus();
  }, []);

  // Improved auth check that preserves session on refresh unless token is explicitly invalid (401)
  const checkAuthStatus = async () => {
    const token = localStorage.getItem('adminToken');
    if (!token) {
      setIsAuthenticated(false);
      setLoading(false);
      return;
    }

    // Optimistically mark as authenticated so UI doesn't flicker or redirect on refresh
    setIsAuthenticated(true);
    setLoading(false); // We don't block the UI waiting for verify

    try {
      const response = await fetch(buildApiUrl(API_CONFIG.ENDPOINTS.AUTH.VERIFY), {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const userData = await response.json();
        setUser(userData);
      } else if (response.status === 401) {
        // Only clear token & de-authenticate on an explicit unauthorized response
        localStorage.removeItem('adminToken');
        setIsAuthenticated(false);
        setUser(null);
      } else {
        // For other errors (network, 5xx, 404) keep the optimistic auth state;
        // devs can inspect console to diagnose backend issues
        console.warn('Token verify non-401 error:', response.status);
      }
    } catch (error) {
      // Network or unexpected error – keep user logged in (optimistic) unless we know it's invalid
      console.error('Auth verify request failed:', error);
    }
  };

  const login = async (username, password) => {
    try {
      const response = await fetch(buildApiUrl(API_CONFIG.ENDPOINTS.AUTH.LOGIN), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });

      if (!response.ok) {
        const error = await response.text();
        throw new Error(error || 'Login failed');
      }

      const data = await response.json();
      
      // Store token and user data
      localStorage.setItem('adminToken', data.token);
      setUser(data.user || { username });
      setIsAuthenticated(true);
      
      return { success: true };
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, error: error.message };
    }
  };

  const logout = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      if (token) {
        // Call logout endpoint
        await fetch(buildApiUrl(API_CONFIG.ENDPOINTS.AUTH.LOGOUT), {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Clear local storage and state regardless of API call result
      localStorage.removeItem('adminToken');
      setIsAuthenticated(false);
      setUser(null);
    }
  };

  const value = {
    isAuthenticated,
    user,
    loading,
    login,
    logout,
    checkAuthStatus,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
