// API utility functions with authentication support
import { buildApiUrl } from '../config/api';

// Create a custom fetch wrapper that includes authentication
export const authenticatedFetch = async (url, options = {}) => {
  const token = localStorage.getItem('adminToken');
  
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  // Add authorization header if token exists
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(url, {
    ...options,
    headers,
  });

  // Handle 401 unauthorized responses
  if (response.status === 401) {
    // Token is invalid, remove it and redirect to login
    localStorage.removeItem('adminToken');
    window.location.href = '/login';
    throw new Error('Authentication expired');
  }

  return response;
};

// Helper function to make authenticated API calls
export const apiCall = async (endpoint, options = {}) => {
  const url = typeof endpoint === 'string' ? buildApiUrl(endpoint) : endpoint;
  return authenticatedFetch(url, options);
};

export default authenticatedFetch;
