/**
 * API Service Layer for RentIQ Rwanda
 * Centralized Axios configuration and API methods
 */
import axios from 'axios';

// Get API base URL from environment variable
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

// Create Axios instance with default config
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000, // 30 second timeout
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor - add auth tokens, logging, etc.
apiClient.interceptors.request.use(
  (config) => {
    // Log request in development
    if (import.meta.env.DEV) {
      console.log(`🚀 API Request: ${config.method.toUpperCase()} ${config.url}`);
    }
    
    // Add authentication token if available (for future use)
    const token = localStorage.getItem('auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    return config;
  },
  (error) => {
    console.error('Request Error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor - handle errors globally
apiClient.interceptors.response.use(
  (response) => {
    // Log response in development
    if (import.meta.env.DEV) {
      console.log(`✅ API Response: ${response.config.url}`, response.data);
    }
    return response;
  },
  (error) => {
    // Handle different error types
    if (error.response) {
      // Server responded with error status
      const { status, data } = error.response;
      
      console.error(`❌ API Error ${status}:`, data);
      
      // Handle specific error codes
      switch (status) {
        case 400:
          error.userMessage = data.detail?.detail || 'Invalid input data. Please check your entries.';
          break;
        case 404:
          error.userMessage = 'Resource not found.';
          break;
        case 422:
          // Extract the actual Pydantic validation message if available
          error.userMessage = data?.detail?.[0]?.msg
            || data?.detail
            || 'Validation error. Please check your entries and try again.';
          break;
        case 500:
          error.userMessage = 'Server error. Please try again later.';
          break;
        case 503:
          error.userMessage = 'Model not available. The system is being prepared.';
          break;
        default:
          error.userMessage = data.detail?.error || 'An unexpected error occurred.';
      }
    } else if (error.request) {
      // Request made but no response received
      console.error('❌ Network Error:', error.message);
      error.userMessage = 'Network error. Please check your internet connection.';
    } else {
      // Error in request setup
      console.error('❌ Request Setup Error:', error.message);
      error.userMessage = 'Failed to make request. Please try again.';
    }
    
    return Promise.reject(error);
  }
);

/**
 * API Methods
 */

// Health Check
export const checkHealth = async () => {
  const response = await apiClient.get('/');
  return response.data;
};

// Predict rent price
export const predictRent = async (propertyData) => {
  const response = await apiClient.post('/api/predict', propertyData);
  return response.data;
};

// Batch predict
export const batchPredict = async (propertiesArray) => {
  const response = await apiClient.post('/api/predict/batch', propertiesArray);
  return response.data;
};

// Get prediction examples
export const getPredictionExamples = async () => {
  const response = await apiClient.get('/api/predict/examples');
  return response.data;
};

// Get prediction history
export const getPredictionHistory = async (params = {}) => {
  const { limit = 20, skip = 0, district = null } = params;
  
  const queryParams = new URLSearchParams({
    limit: limit.toString(),
    skip: skip.toString(),
  });
  
  if (district) {
    queryParams.append('district', district);
  }
  
  const response = await apiClient.get(`/api/history?${queryParams}`);
  return response.data;
};

// Get prediction by ID
export const getPredictionById = async (predictionId) => {
  const response = await apiClient.get(`/api/history/${predictionId}`);
  return response.data;
};

// Get prediction statistics
export const getPredictionStatistics = async () => {
  const response = await apiClient.get('/api/history/statistics/summary');
  return response.data;
};

// Export predictions to CSV
export const exportPredictionsCSV = async () => {
  const response = await apiClient.get('/api/history/export/csv');
  return response.data;
};

// Clear history (admin only)
export const clearHistory = async () => {
  const response = await apiClient.delete('/api/history/clear?confirm=true');
  return response.data;
};

// Get API version
export const getVersion = async () => {
  const response = await apiClient.get('/version');
  return response.data;
};

/**
 * Helper Functions
 */

// Format currency (RWF)
export const formatRWF = (amount) => {
  return 'RWF ' + new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

// Format currency (USD)
export const formatUSD = (amount) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
};

// Format date
export const formatDate = (dateString) => {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
};

// Get price tier color (for UI badges)
export const getPriceTier = (rentRWF) => {
  if (rentRWF < 50000) {
    return {
      tier: 'Affordable',
      color: 'green',
      bgColor: 'bg-green-100',
      textColor: 'text-green-800',
    };
  } else if (rentRWF < 150000) {
    return {
      tier: 'Mid-Range',
      color: 'amber',
      bgColor: 'bg-amber-100',
      textColor: 'text-amber-800',
    };
  } else {
    return {
      tier: 'Premium',
      color: 'red',
      bgColor: 'bg-red-100',
      textColor: 'text-red-800',
    };
  }
};

// Validate property form data
export const validatePropertyData = (data) => {
  const errors = {};

  // String/select fields that must be non-empty strings
  const selectFields = [
    'district', 'sector',
    'wall_material', 'floor_material', 'roof_material',
    'road_access', 'urban_rural'
  ];
  selectFields.forEach(field => {
    if (!data[field]) errors[field] = 'This field is required';
  });

  // Numeric fields that must be present and > 0
  if (!data.location_zone)
    errors.location_zone = 'This field is required';

  if (!data.property_arrangement)
    errors.property_arrangement = 'Please select how the property is arranged';

  if (data.num_bedrooms === '' || data.num_bedrooms === undefined || data.num_bedrooms === null)
    errors.num_bedrooms = 'This field is required';

  if (data.num_rooms_total === '' || data.num_rooms_total === undefined || data.num_rooms_total === null)
    errors.num_rooms_total = 'This field is required';

  if (data.floor_area_sqm === '' || data.floor_area_sqm === undefined || data.floor_area_sqm === null)
    errors.floor_area_sqm = 'This field is required';

  if (data.num_bedrooms && (data.num_bedrooms < 1 || data.num_bedrooms > 10))
    errors.num_bedrooms = 'Must be between 1 and 10';

  if (data.num_rooms_total && data.num_bedrooms && data.num_rooms_total < data.num_bedrooms)
    errors.num_rooms_total = 'Must be greater than or equal to bedrooms';

  if (data.floor_area_sqm && (data.floor_area_sqm < 10 || data.floor_area_sqm > 500))
    errors.floor_area_sqm = 'Must be between 10 and 500 sqm';



  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

// Default export
export default apiClient;
