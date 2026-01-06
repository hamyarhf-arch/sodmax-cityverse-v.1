// 📁 frontend/src/services/api.js
import axios from 'axios';
import toast from 'react-hot-toast';

// ایجاد instance از axios
const api = axios.create({
    baseURL: '/api',
    headers: {
        'Content-Type': 'application/json',
    },
    timeout: 10000, // 10 ثانیه
});

// اضافه کردن توکن به headers
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// مدیریت خطاها
api.interceptors.response.use(
    (response) => response,
    (error) => {
        const { response } = error;
        
        if (!response) {
            toast.error('خطا در ارتباط با سرور');
            return Promise.reject(error);
        }
        
        const { status, data } = response;
        
        switch (status) {
            case 401:
                if (!window.location.pathname.includes('/login')) {
                    localStorage.removeItem('token');
                    window.location.href = '/login?session=expired';
                }
                break;
                
            case 403:
                toast.error('دسترسی غیرمجاز');
                break;
                
            case 404:
                toast.error('منبع یافت نشد');
                break;
                
            case 429:
                toast.error('تعداد درخواست‌های شما بیش از حد مجاز است');
                break;
                
            case 500:
                toast.error('خطای سرور');
                break;
                
            default:
                if (data && data.error) {
                    toast.error(data.error);
                }
        }
        
        return Promise.reject(error);
    }
);

// توابع API
export const authAPI = {
    // ثبت‌نام کاربر
    register: (data) => api.post('/auth/register', data),
    
    // ورود کاربر
    login: (data) => api.post('/auth/login', data),
    
    // ثبت‌نام کسب‌وکار
    registerBusiness: (data) => api.post('/auth/business/register', data),
    
    // بررسی وضعیت احراز
    checkAuth: () => api.get('/auth/me'),
    
    // خروج
    logout: () => {
        localStorage.removeItem('token');
        delete api.defaults.headers.common['Authorization'];
    }
};

export const userAPI = {
    // دریافت پروفایل
    getProfile: () => api.get('/user/profile'),
    
    // به‌روزرسانی پروفایل
    updateProfile: (data) => api.put('/user/profile', data),
    
    // کیف پول
    getWallet: () => api.get('/user/wallet'),
    
    // درخواست برداشت
    withdraw: (data) => api.post('/user/withdraw', data),
    
    // زیرمجموعه‌ها
    getReferrals: () => api.get('/user/referrals'),
    
    // تاریخچه تراکنش‌ها
    getTransactions: (params) => api.get('/user/transactions', { params }),
    
    // استخراج دستی
    mine: () => api.post('/user/mine'),
    
    // تغییر وضعیت استخراج خودکار
    toggleAutoMining: () => api.post('/user/toggle-auto-mining'),
    
    // ارتقاء ماینر
    upgradeMiner: () => api.post('/user/upgrade-miner')
};

export const missionAPI = {
    // دریافت مأموریت‌های پیشنهادی
    getSuggestedMissions: (params) => api.get('/missions/suggested', { params }),
    
    // دریافت همه مأموریت‌ها
    getAllMissions: (params) => api.get('/missions', { params }),
    
    // دریافت جزئیات مأموریت
    getMissionDetails: (id) => api.get(`/missions/${id}`),
    
    // شروع مأموریت
    startMission: (id) => api.post(`/missions/${id}/start`),
    
    // تکمیل مأموریت
    completeMission: (id, data) => api.post(`/missions/${id}/complete`, data),
    
    // دریافت مأموریت‌های فعال کاربر
    getActiveMissions: () => api.get('/missions/active'),
    
    // دریافت تاریخچه مأموریت‌ها
    getMissionHistory: (params) => api.get('/missions/history', { params })
};

export const businessAPI = {
    // ایجاد کمپین جدید
    createCampaign: (data) => api.post('/business/campaigns', data),
    
    // دریافت کمپین‌های کسب‌وکار
    getCampaigns: (params) => api.get('/business/campaigns', { params }),
    
    // دریافت جزئیات کمپین
    getCampaignDetails: (id) => api.get(`/business/campaigns/${id}`),
    
    // به‌روزرسانی کمپین
    updateCampaign: (id, data) => api.put(`/business/campaigns/${id}`, data),
    
    // تأیید اقدام کاربر
    verifyAction: (actionId) => api.post(`/business/actions/${actionId}/verify`),
    
    // دریافت اقدامات در انتظار تأیید
    getPendingActions: (params) => api.get('/business/actions/pending', { params }),
    
    // دریافت آمار کسب‌وکار
    getBusinessStats: () => api.get('/business/stats'),
    
    // شارژ کیف پول
    deposit: (data) => api.post('/business/wallet/deposit', data)
};

export default api;
