// frontend/src/services/api.js
import axios from 'axios';
import { toast } from 'react-hot-toast';

// Create axios instance
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  timeout: 30000, // 30 seconds
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    // Add auth token to requests if available
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // Add request ID for tracking
    config.headers['X-Request-ID'] = generateRequestId();
    
    // Log request in development
    if (import.meta.env.DEV) {
      console.log(`➡️ ${config.method.toUpperCase()} ${config.url}`, config.data || '');
    }
    
    return config;
  },
  (error) => {
    console.error('Request error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => {
    // Log response in development
    if (import.meta.env.DEV) {
      console.log(`⬅️ ${response.status} ${response.config.url}`, response.data);
    }
    
    // Handle successful responses
    if (response.data && typeof response.data === 'object') {
      // Add status code to response data
      response.data.statusCode = response.status;
      
      // Check for success field
      if (response.data.success === false && response.data.error) {
        // Show error toast for unsuccessful but 200 responses
        toast.error(response.data.error);
      }
    }
    
    return response;
  },
  (error) => {
    // Log error in development
    if (import.meta.env.DEV) {
      console.error(`❌ ${error.response?.status || 'NETWORK'} ${error.config?.url || ''}:`, error.message);
    }
    
    // Handle different error types
    if (!error.response) {
      // Network error
      toast.error('Network error. Please check your connection.');
      return Promise.reject({
        success: false,
        error: 'Network error',
        message: 'Unable to connect to server',
      });
    }
    
    const { status, data } = error.response;
    
    // Handle specific status codes
    switch (status) {
      case 400:
        toast.error(data.error || 'Bad request');
        break;
        
      case 401:
        // Unauthorized - clear token and redirect to login
        localStorage.removeItem('token');
        toast.error('Session expired. Please login again.');
        
        // Redirect to login page if not already there
        if (!window.location.pathname.includes('/login')) {
          setTimeout(() => {
            window.location.href = '/login';
          }, 1000);
        }
        break;
        
      case 403:
        toast.error(data.error || 'Access forbidden');
        break;
        
      case 404:
        toast.error(data.error || 'Resource not found');
        break;
        
      case 422:
        // Validation error
        if (data.errors && Array.isArray(data.errors)) {
          data.errors.forEach(err => {
            toast.error(`${err.field}: ${err.message}`);
          });
        } else {
          toast.error(data.error || 'Validation failed');
        }
        break;
        
      case 429:
        toast.error('Too many requests. Please wait a moment.');
        break;
        
      case 500:
        toast.error('Server error. Please try again later.');
        break;
        
      default:
        toast.error(data?.error || `Error ${status}: ${error.message}`);
    }
    
    // Return formatted error
    return Promise.reject({
      success: false,
      status,
      error: data?.error || 'Request failed',
      message: data?.message || error.message,
      errors: data?.errors,
      data: data,
    });
  }
);

// Helper function to generate request ID
function generateRequestId() {
  return 'req_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
}

// API endpoints object for easy reference
export const API_ENDPOINTS = {
  // Auth
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    REGISTER_BUSINESS: '/auth/register-business',
    VERIFY: '/auth/verify',
    MESSAGE: '/auth/message/:address',
    LOGOUT: '/auth/logout',
  },
  
  // Users
  USERS: {
    PROFILE: '/users/profile',
    UPDATE_PROFILE: '/users/profile',
    TRANSACTIONS: '/users/transactions',
    BALANCE: '/users/balance',
    STATS: '/users/stats',
    LEADERBOARD: '/users/leaderboard',
    SEARCH: '/users/search',
  },
  
  // Business
  BUSINESS: {
    CREATE: '/business',
    UPDATE: '/business/:id',
    LIST: '/business',
    DETAILS: '/business/:id',
    CAMPAIGNS: '/business/:id/campaigns',
    STATS: '/business/:id/stats',
  },
  
  // Missions
  MISSIONS: {
    AVAILABLE: '/missions/available',
    ACTIVE: '/missions/active',
    COMPLETED: '/missions/completed',
    DETAILS: '/missions/:id',
    START: '/missions/:id/start',
    COMPLETE: '/missions/:id/complete',
    PROOF: '/missions/:id/proof',
    PROGRESS: '/missions/:id/progress',
    LEADERBOARD: '/missions/:id/leaderboard',
    STATS: '/missions/stats',
    
    // Campaigns
    CAMPAIGNS: '/missions/campaigns',
    CAMPAIGN_DETAILS: '/missions/campaigns/:id',
    CREATE_CAMPAIGN: '/missions/campaigns',
    ADD_MISSION: '/missions/campaigns/:id/missions',
  },
  
  // Wallet
  WALLET: {
    BALANCE: '/wallet/balance',
    DEPOSIT: '/wallet/deposit',
    WITHDRAW: '/wallet/withdraw',
    TRANSFER: '/wallet/transfer',
    TRANSACTIONS: '/wallet/transactions',
  },
};

// Helper functions for common requests
export const apiHelpers = {
  // Auth
  login: (data) => api.post(API_ENDPOINTS.AUTH.LOGIN, data),
  register: (data) => api.post(API_ENDPOINTS.AUTH.REGISTER, data),
  registerBusiness: (data) => api.post(API_ENDPOINTS.AUTH.REGISTER_BUSINESS, data),
  verifyToken: () => api.get(API_ENDPOINTS.AUTH.VERIFY),
  getMessageForSigning: (address) => api.get(`/auth/message/${address}`),
  
  // Users
  getProfile: () => api.get(API_ENDPOINTS.USERS.PROFILE),
  updateProfile: (data) => api.put(API_ENDPOINTS.USERS.UPDATE_PROFILE, data),
  getTransactions: (params) => api.get(API_ENDPOINTS.USERS.TRANSACTIONS, { params }),
  getBalance: () => api.get(API_ENDPOINTS.USERS.BALANCE),
  getUserStats: () => api.get(API_ENDPOINTS.USERS.STATS),
  getLeaderboard: (params) => api.get(API_ENDPOINTS.USERS.LEADERBOARD, { params }),
  searchUsers: (query) => api.get(API_ENDPOINTS.USERS.SEARCH, { params: { query } }),
  
  // Business
  createBusiness: (data) => api.post(API_ENDPOINTS.BUSINESS.CREATE, data),
  updateBusiness: (id, data) => api.put(`/business/${id}`, data),
  getBusinesses: () => api.get(API_ENDPOINTS.BUSINESS.LIST),
  getBusinessDetails: (id) => api.get(`/business/${id}`),
  getBusinessCampaigns: (id) => api.get(`/business/${id}/campaigns`),
  getBusinessStats: (id) => api.get(`/business/${id}/stats`),
  
  // Missions
  getAvailableMissions: () => api.get(API_ENDPOINTS.MISSIONS.AVAILABLE),
  getActiveMissions: () => api.get(API_ENDPOINTS.MISSIONS.ACTIVE),
  getCompletedMissions: () => api.get(API_ENDPOINTS.MISSIONS.COMPLETED),
  getMissionDetails: (id) => api.get(`/missions/${id}`),
  startMission: (id) => api.post(`/missions/${id}/start`),
  completeMission: (id, data) => api.post(`/missions/${id}/complete`, data),
  submitProof: (id, data) => api.post(`/missions/${id}/proof`, data),
  getMissionProgress: (id) => api.get(`/missions/${id}/progress`),
  getMissionStats: () => api.get(API_ENDPOINTS.MISSIONS.STATS),
  getMissionLeaderboard: (id) => api.get(`/missions/${id}/leaderboard`),
  
  // Campaigns
  getCampaigns: () => api.get(API_ENDPOINTS.MISSIONS.CAMPAIGNS),
  getCampaignDetails: (id) => api.get(`/missions/campaigns/${id}`),
  createCampaign: (data) => api.post(API_ENDPOINTS.MISSIONS.CREATE_CAMPAIGN, data),
  addMissionToCampaign: (campaignId, data) => api.post(`/missions/campaigns/${campaignId}/missions`, data),
  
  // Wallet
  getWalletBalance: () => api.get(API_ENDPOINTS.WALLET.BALANCE),
  deposit: (data) => api.post(API_ENDPOINTS.WALLET.DEPOSIT, data),
  withdraw: (data) => api.post(API_ENDPOINTS.WALLET.WITHDRAW, data),
  transfer: (data) => api.post(API_ENDPOINTS.WALLET.TRANSFER, data),
  getWalletTransactions: (params) => api.get(API_ENDPOINTS.WALLET.TRANSACTIONS, { params }),
  
  // File upload helper
  uploadFile: async (file, endpoint = '/upload') => {
    const formData = new FormData();
    formData.append('file', file);
    
    return api.post(endpoint, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },
  
  // Cancel token for cancelling requests
  createCancelToken: () => axios.CancelToken.source(),
  
  // Check if error is a cancellation
  isCancel: (error) => axios.isCancel(error),
};

// Export both default and named exports
export default api;
export { apiHelpers };
