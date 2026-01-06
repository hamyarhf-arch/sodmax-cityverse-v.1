import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Config from 'react-native-config';
import NetInfo from '@react-native-community/netinfo';
import { Platform } from 'react-native';

// Create axios instance
const api = axios.create({
  baseURL: Config.API_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'Accept-Language': 'fa',
    'User-Agent': `SODmAX-Mobile/${Config.APP_VERSION}/${Platform.OS}/${Platform.Version}`,
  },
});

// Request interceptor
api.interceptors.request.use(
  async (config) => {
    // Check network connection
    const netState = await NetInfo.fetch();
    if (!netState.isConnected) {
      throw new Error('اتصال اینترنت برقرار نیست');
    }

    // Add token if available
    const token = await AsyncStorage.getItem(Config.AUTH_TOKEN_KEY);
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Add device info
    config.headers['X-Device-ID'] = Config.DEVICE_ID || 'unknown';
    config.headers['X-App-Version'] = Config.APP_VERSION;
    config.headers['X-Platform'] = Platform.OS;

    // For POST/PUT requests, add timestamp
    if (['post', 'put', 'patch'].includes(config.method)) {
      config.data = {
        ...config.data,
        _timestamp: Date.now(),
        _platform: Platform.OS,
      };
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => {
    // Handle successful responses
    return response.data;
  },
  async (error) => {
    // Handle errors
    if (error.response) {
      // Server responded with error
      const { status, data } = error.response;

      switch (status) {
        case 401:
          // Unauthorized - clear token and redirect to login
          await AsyncStorage.multiRemove([
            Config.AUTH_TOKEN_KEY,
            Config.REFRESH_TOKEN_KEY,
            'sodmax_user',
          ]);
          
          // You might want to use a navigation service here
          // navigationService.navigate('Login');
          break;

        case 403:
          // Forbidden
          throw new Error(data.message || 'دسترسی غیرمجاز');

        case 404:
          // Not found
          throw new Error(data.message || 'منبع یافت نشد');

        case 422:
          // Validation error
          const validationErrors = data.errors || {};
          const errorMessages = Object.values(validationErrors).flat();
          throw new Error(errorMessages.join('\n') || 'خطای اعتبارسنجی');

        case 429:
          // Rate limited
          throw new Error('درخواست‌های زیادی ارسال کرده‌اید. لطفاً چند لحظه صبر کنید');

        case 500:
        case 502:
        case 503:
        case 504:
          // Server errors
          throw new Error('خطای سرور. لطفاً بعداً تلاش کنید');

        default:
          throw new Error(data.message || `خطای ${status}`);
      }
    } else if (error.request) {
      // Request made but no response
      if (error.code === 'ECONNABORTED') {
        throw new Error('زمان درخواست به پایان رسید');
      } else if (error.message === 'Network Error') {
        throw new Error('خطای شبکه. اتصال اینترنت خود را بررسی کنید');
      } else {
        throw new Error('خطا در ارتباط با سرور');
      }
    } else {
      // Something else happened
      throw new error;
    }
  }
);

// API methods
const apiService = {
  // Auth
  login: (data) => api.post('/auth/login', data),
  register: (data) => api.post('/auth/register', data),
  logout: () => api.post('/auth/logout'),
  verifyPhone: (data) => api.post('/auth/verify-phone', data),
  forgotPassword: (data) => api.post('/auth/forgot-password', data),
  resetPassword: (data) => api.post('/auth/reset-password', data),
  refreshToken: (data) => api.post('/auth/refresh', data),

  // User
  getProfile: () => api.get('/user/profile'),
  updateProfile: (data) => api.put('/user/profile', data),
  changePassword: (data) => api.post('/user/change-password', data),
  getReferrals: (params) => api.get('/user/referrals', { params }),
  getUserStats: () => api.get('/user/stats'),

  // Mining
  getMiningStats: () => api.get('/mining/stats'),
  manualMine: (data) => api.post('/mining/mine', data),
  autoMine: (data) => api.post('/mining/auto-mine', data),
  toggleAutoMining: (data) => api.post('/mining/toggle-auto', data),
  boostMining: (data) => api.post('/mining/boost', data),
  upgradeMiner: (data) => api.post('/mining/upgrade', data),
  getUpgrades: () => api.get('/mining/upgrades'),
  getMiningHistory: (params) => api.get('/mining/history', { params }),

  // Wallet
  getWalletBalance: () => api.get('/wallet/balance'),
  convertCurrency: (data) => api.post('/wallet/convert', data),
  withdrawFunds: (data) => api.post('/wallet/withdraw', data),
  depositFunds: (data) => api.post('/wallet/deposit', data),
  getTransactions: (params) => api.get('/wallet/transactions', { params }),
  getConversionRates: () => api.get('/wallet/conversion-rates'),
  getWithdrawalMethods: () => api.get('/wallet/withdrawal-methods'),
  getDepositMethods: () => api.get('/wallet/deposit-methods'),

  // Missions
  getMissions: (params) => api.get('/missions', { params }),
  getMissionDetails: (id) => api.get(`/missions/${id}`),
  startMission: (id) => api.post(`/missions/${id}/start`),
  completeMission: (id) => api.post(`/missions/${id}/complete`),
  claimReward: (id) => api.post(`/missions/${id}/claim`),

  // Rewards
  getDailyReward: () => api.get('/rewards/daily'),
  claimDailyReward: () => api.post('/rewards/daily/claim'),
  getAvailableRewards: () => api.get('/rewards/available'),
  claimReward: (id) => api.post(`/rewards/${id}/claim`),

  // Invite
  getInviteStats: () => api.get('/invite/stats'),
  generateInviteLink: () => api.post('/invite/generate-link'),
  getReferralHistory: (params) => api.get('/invite/history', { params }),
  validateReferralCode: (code) => api.post('/invite/validate-code', { code }),

  // Business
  getBusinessProfile: () => api.get('/business/profile'),
  updateBusinessProfile: (data) => api.put('/business/profile', data),
  createCampaign: (data) => api.post('/business/campaigns', data),
  getCampaigns: (params) => api.get('/business/campaigns', { params }),
  getCampaignAnalytics: (id) => api.get(`/business/campaigns/${id}/analytics`),

  // Support
  createTicket: (data) => api.post('/support/tickets', data),
  getTickets: (params) => api.get('/support/tickets', { params }),
  getTicketMessages: (id) => api.get(`/support/tickets/${id}/messages`),
  sendMessage: (id, data) => api.post(`/support/tickets/${id}/messages`, data),
  getFAQs: (params) => api.get('/support/faqs', { params }),

  // System
  getAppConfig: () => api.get('/system/config'),
  getNotifications: (params) => api.get('/system/notifications', { params }),
  markNotificationAsRead: (id) => api.post(`/system/notifications/${id}/read`),
  clearNotifications: () => api.delete('/system/notifications'),

  // File upload
  uploadFile: (file, type = 'avatar') => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('type', type);
    
    return api.post('/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },

  // Set/remove token
  setToken: (token) => {
    api.defaults.headers.Authorization = `Bearer ${token}`;
  },
  removeToken: () => {
    delete api.defaults.headers.Authorization;
  },

  // Mock API for development
  mock: {
    login: async (phone, password) => {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      if (phone === '09123456789' && password === '123456') {
        return {
          success: true,
          data: {
            token: 'mock_jwt_token',
            refreshToken: 'mock_refresh_token',
            user: {
              id: 1,
              name: 'علی محمدی',
              phone: '09123456789',
              email: 'ali@example.com',
              avatar: 'ع',
              level: 5,
              totalEarned: 124500,
              referralCount: 24,
              sodBalance: 1845200,
              tomanBalance: 28400,
              joinDate: '۱۴۰۲/۰۵/۱۰',
              lastLogin: 'امروز',
              role: 'user',
            },
          },
        };
      } else {
        throw new Error('شماره موبایل یا رمز عبور اشتباه است');
      }
    },

    getWalletBalance: async () => {
      await new Promise(resolve => setTimeout(resolve, 500));
      
      return {
        success: true,
        data: {
          balances: {
            SOD: 1845200,
            Toman: 28400,
            USDT: 120.5,
            Busd: 0,
          },
          totalInToman: 1845200 * 0.01 + 28400 + 120.5 * 300000,
        },
      };
    },

    getMiningStats: async () => {
      await new Promise(resolve => setTimeout(resolve, 300));
      
      return {
        success: true,
        data: {
          level: 5,
          power: 18,
          rewardPerClick: 18,
          totalMined: 1845200,
          todayEarned: 2450,
          multiplier: 1,
          efficiency: 1.2,
          autoMining: false,
          boostActive: false,
        },
      };
    },
  },
};

// Export the API service
export default apiService;
