// mobile/src/services/api.js
import axios from 'axios';

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:5000/api';

class ApiService {
  constructor() {
    this.client = axios.create({
      baseURL: API_BASE_URL,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      timeout: 30000,
    });

    // Interceptor برای اضافه کردن توکن
    this.client.interceptors.request.use(
      config => {
        const token = localStorage.getItem('auth_token');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      error => Promise.reject(error)
    );

    // Interceptor برای مدیریت خطاها
    this.client.interceptors.response.use(
      response => response.data,
      error => {
        if (error.response) {
          switch (error.response.status) {
            case 401:
              // عدم احراز هویت
              localStorage.removeItem('auth_token');
              window.location.href = '/login';
              break;
            case 403:
              console.error('دسترسی غیرمجاز');
              break;
            case 404:
              console.error('منبع یافت نشد');
              break;
            case 500:
              console.error('خطای سرور');
              break;
          }
        }
        return Promise.reject(error);
      }
    );
  }

  // ==================== احراز هویت ====================
  auth = {
    // ورود
    login: (phone, password) => 
      this.client.post('/auth/login', { phone, password }),

    // ثبت‌نام
    register: (userData) => 
      this.client.post('/auth/register', userData),

    // دریافت اطلاعات کاربر
    getMe: () => 
      this.client.get('/auth/me'),

    // به‌روزرسانی پروفایل
    updateProfile: (userData) => 
      this.client.put('/auth/profile', userData),

    // تغییر رمز عبور
    changePassword: (currentPassword, newPassword) => 
      this.client.post('/auth/change-password', { currentPassword, newPassword }),

    // بازیابی رمز عبور
    forgotPassword: (phone) => 
      this.client.post('/auth/forgot-password', { phone }),

    // تأیید کد بازیابی
    verifyResetCode: (phone, code) => 
      this.client.post('/auth/verify-reset-code', { phone, code }),

    // بازنشانی رمز عبور
    resetPassword: (phone, code, newPassword) => 
      this.client.post('/auth/reset-password', { phone, code, newPassword }),
  };

  // ==================== کاربران ====================
  users = {
    // دریافت اطلاعات کاربر
    getUser: (userId) => 
      this.client.get(`/users/${userId}`),

    // دریافت زیرمجموعه‌ها
    getReferrals: (userId) => 
      this.client.get(`/users/${userId}/referrals`),

    // به‌روزرسانی اطلاعات کاربر
    updateUser: (userId, userData) => 
      this.client.put(`/users/${userId}`, userData),

    // دریافت آمار کاربر
    getUserStats: (userId) => 
      this.client.get(`/users/${userId}/stats`),

    // ارتقاء سطح
    upgradeLevel: (userId) => 
      this.client.post(`/users/${userId}/upgrade`),
  };

  // ==================== استخراج ====================
  mining = {
    // استخراج دستی
    manualMine: (userId) => 
      this.client.post(`/mining/manual/${userId}`),

    // شروع استخراج خودکار
    startAutoMining: (userId) => 
      this.client.post(`/mining/auto/start/${userId}`),

    // توقف استخراج خودکار
    stopAutoMining: (userId) => 
      this.client.post(`/mining/auto/stop/${userId}`),

    // خرید بوست
    buyBoost: (userId, boostType) => 
      this.client.post(`/mining/boost/${userId}`, { boostType }),

    // ارتقاء ماینر
    upgradeMiner: (userId) => 
      this.client.post(`/mining/upgrade/${userId}`),

    // دریافت آمار استخراج
    getMiningStats: (userId) => 
      this.client.get(`/mining/stats/${userId}`),

    // دریافت تاریخچه استخراج
    getMiningHistory: (userId, limit = 50) => 
      this.client.get(`/mining/history/${userId}?limit=${limit}`),
  };

  // ==================== کیف پول ====================
  wallet = {
    // دریافت موجودی
    getBalance: (userId) => 
      this.client.get(`/wallet/balance/${userId}`),

    // برداشت
    withdraw: (userId, amount, currency, walletAddress) => 
      this.client.post(`/wallet/withdraw/${userId}`, { amount, currency, walletAddress }),

    // تبدیل ارز
    convertCurrency: (userId, fromCurrency, toCurrency, amount) => 
      this.client.post(`/wallet/convert/${userId}`, { fromCurrency, toCurrency, amount }),

    // خرید SOD
    buySod: (userId, amount, paymentMethod) => 
      this.client.post(`/wallet/buy-sod/${userId}`, { amount, paymentMethod }),

    // دریافت تاریخچه تراکنش‌ها
    getTransactionHistory: (userId, limit = 50, offset = 0) => 
      this.client.get(`/wallet/transactions/${userId}?limit=${limit}&offset=${offset}`),

    // بررسی وضعیت برداشت
    getWithdrawalStatus: (userId, withdrawalId) => 
      this.client.get(`/wallet/withdrawal-status/${userId}/${withdrawalId}`),

    // دریافت آدرس‌های کیف پول
    getWalletAddresses: (userId) => 
      this.client.get(`/wallet/addresses/${userId}`),

    // اضافه کردن آدرس کیف پول
    addWalletAddress: (userId, currency, address, network) => 
      this.client.post(`/wallet/addresses/${userId}`, { currency, address, network }),
  };

  // ==================== مأموریت‌ها ====================
  missions = {
    // دریافت مأموریت‌های فعال
    getActiveMissions: (userId) => 
      this.client.get(`/missions/active/${userId}`),

    // دریافت همه مأموریت‌ها
    getAllMissions: (userId, filter = 'all') => 
      this.client.get(`/missions/all/${userId}?filter=${filter}`),

    // دریافت مأموریت خاص
    getMission: (missionId) => 
      this.client.get(`/missions/${missionId}`),

    // شروع مأموریت
    startMission: (userId, missionId) => 
      this.client.post(`/missions/start/${userId}`, { missionId }),

    // تکمیل مأموریت
    completeMission: (userId, missionId) => 
      this.client.post(`/missions/complete/${userId}`, { missionId }),

    // دریافت پاداش
    claimReward: (userId, missionId) => 
      this.client.post(`/missions/claim/${userId}`, { missionId }),

    // دریافت دستاوردها
    getAchievements: (userId) => 
      this.client.get(`/missions/achievements/${userId}`),
  };

  // ==================== پاداش‌ها ====================
  rewards = {
    // دریافت پاداش‌های موجود
    getAvailableRewards: (userId) => 
      this.client.get(`/rewards/available/${userId}`),

    // دریافت پاداش روزانه
    claimDailyReward: (userId) => 
      this.client.post(`/rewards/daily/${userId}`),

    // دریافت پاداش هفتگی
    claimWeeklyReward: (userId) => 
      this.client.post(`/rewards/weekly/${userId}`),

    // دریافت پاداش ماهانه
    claimMonthlyReward: (userId) => 
      this.client.post(`/rewards/monthly/${userId}`),

    // دریافت پاداش ویژه
    claimSpecialReward: (userId, rewardId) => 
      this.client.post(`/rewards/special/${userId}`, { rewardId }),

    // دریافت تاریخچه پاداش‌ها
    getRewardHistory: (userId, limit = 30) => 
      this.client.get(`/rewards/history/${userId}?limit=${limit}`),
  };

  // ==================== دعوت دوستان ====================
  referrals = {
    // دریافت اطلاعات دعوت
    getReferralInfo: (userId) => 
      this.client.get(`/referrals/info/${userId}`),

    // دریافت لینک دعوت
    getReferralLink: (userId) => 
      this.client.get(`/referrals/link/${userId}`),

    // دریافت لیست دعوت‌ها
    getReferralList: (userId, status = 'all') => 
      this.client.get(`/referrals/list/${userId}?status=${status}`),

    // ثبت دعوت جدید
    addReferral: (userId, referredPhone) => 
      this.client.post(`/referrals/add/${userId}`, { referredPhone }),

    // تأیید دعوت
    confirmReferral: (userId, referralId) => 
      this.client.post(`/referrals/confirm/${userId}`, { referralId }),

    // دریافت پاداش دعوت
    claimReferralReward: (userId, referralId) => 
      this.client.post(`/referrals/claim/${userId}`, { referralId }),

    // دریافت آمار دعوت
    getReferralStats: (userId) => 
      this.client.get(`/referrals/stats/${userId}`),
  };

  // ==================== نوتیفیکیشن‌ها ====================
  notifications = {
    // دریافت نوتیفیکیشن‌ها
    getNotifications: (userId, limit = 20) => 
      this.client.get(`/notifications/${userId}?limit=${limit}`),

    // علامت‌گذاری به عنوان خوانده شده
    markAsRead: (userId, notificationId) => 
      this.client.post(`/notifications/mark-read/${userId}`, { notificationId }),

    // علامت‌گذاری همه به عنوان خوانده شده
    markAllAsRead: (userId) => 
      this.client.post(`/notifications/mark-all-read/${userId}`),

    // حذف نوتیفیکیشن
    deleteNotification: (userId, notificationId) => 
      this.client.delete(`/notifications/${userId}/${notificationId}`),

    // دریافت تعداد نوتیفیکیشن‌های خوانده نشده
    getUnreadCount: (userId) => 
      this.client.get(`/notifications/unread-count/${userId}`),

    // ارسال نوتیفیکیشن
    sendNotification: (userId, title, message, type = 'info') => 
      this.client.post(`/notifications/send/${userId}`, { title, message, type }),
  };

  // ==================== کسب‌وکارها ====================
  businesses = {
    // دریافت لیست کسب‌وکارها
    getAllBusinesses: (filters = {}) => 
      this.client.get('/businesses', { params: filters }),

    // دریافت کسب‌وکار خاص
    getBusiness: (businessId) => 
      this.client.get(`/businesses/${businessId}`),

    // ایجاد کمپین
    createCampaign: (businessId, campaignData) => 
      this.client.post(`/businesses/${businessId}/campaigns`, campaignData),

    // دریافت کمپین‌های کسب‌وکار
    getBusinessCampaigns: (businessId) => 
      this.client.get(`/businesses/${businessId}/campaigns`),

    // ثبت‌نام در کمپین
    joinCampaign: (userId, campaignId) => 
      this.client.post(`/campaigns/join/${userId}`, { campaignId }),

    // تکمیل کمپین
    completeCampaign: (userId, campaignId) => 
      this.client.post(`/campaigns/complete/${userId}`, { campaignId }),
  };

  // ==================== پشتیبانی ====================
  support = {
    // ایجاد تیکت
    createTicket: (userId, title, message, category) => 
      this.client.post('/support/tickets', { userId, title, message, category }),

    // دریافت تیکت‌ها
    getTickets: (userId, status = 'all') => 
      this.client.get(`/support/tickets/${userId}?status=${status}`),

    // دریافت یک تیکت
    getTicket: (ticketId) => 
      this.client.get(`/support/tickets/${ticketId}`),

    // پاسخ به تیکت
    replyToTicket: (ticketId, message) => 
      this.client.post(`/support/tickets/${ticketId}/reply`, { message }),

    // بستن تیکت
    closeTicket: (ticketId) => 
      this.client.post(`/support/tickets/${ticketId}/close`),

    // دریافت سوالات متداول
    getFAQs: (category = 'all') => 
      this.client.get(`/support/faqs?category=${category}`),
  };

  // ==================== فایل‌ها ====================
  files = {
    // آپلود تصویر پروفایل
    uploadProfileImage: (userId, file) => {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('userId', userId);
      
      return this.client.post('/files/upload/profile', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
    },

    // آپلود فایل
    uploadFile: (userId, file, type) => {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('userId', userId);
      formData.append('type', type);
      
      return this.client.post('/files/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
    },
  };

  // ==================== سرویس‌های کمکی ====================
  utils = {
    // بررسی وضعیت سرور
    checkServerStatus: () => 
      this.client.get('/health'),

    // دریافت نسخه
    getVersion: () => 
      this.client.get('/version'),

    // دریافت تنظیمات
    getSettings: () => 
      this.client.get('/settings'),

    // به‌روزرسانی تنظیمات
    updateSettings: (settings) => 
      this.client.put('/settings', settings),
  };
}

// ایجاد نمونه singleton
const api = new ApiService();
export default api;
