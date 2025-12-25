// Axios API client configuration

import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  },
  timeout: 30000, // 30 seconds
  withCredentials: true // Include cookies for Supabase auth
});

// Request interceptor for adding auth tokens if needed
apiClient.interceptors.request.use(
  (config) => {
    // Add any auth headers here if needed
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      // Server responded with error status
      const apiError = {
        error: error.response.data?.error || 'API Error',
        message: error.response.data?.message || error.message,
        statusCode: error.response.status
      };
      return Promise.reject(apiError);
    } else if (error.request) {
      // Request made but no response
      return Promise.reject({
        error: 'Network Error',
        message: 'No response from server',
        statusCode: 0
      });
    } else {
      // Something else happened
      return Promise.reject({
        error: 'Request Error',
        message: error.message,
        statusCode: 0
      });
    }
  }
);
