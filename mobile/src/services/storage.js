[file name]: mobile/src/services/storage.js
[file content begin]
import AsyncStorage from '@react-native-async-storage/async-storage';
import { STORAGE_KEYS } from './init';

/**
 * سرویس مدیریت ذخیره‌سازی اپلیکیشن
 * این فایل شامل تمام عملیات‌های ذخیره و بازیابی داده‌ها می‌شود
 */

// ==================== توابع اصلی ====================

/**
 * ذخیره داده در AsyncStorage
 * @param {string} key - کلید ذخیره‌سازی
 * @param {any} data - داده برای ذخیره
 * @returns {Promise<boolean>} - موفقیت عملیات
 */
export const saveData = async (key, data) => {
  try {
    const jsonData = JSON.stringify(data);
    await AsyncStorage.setItem(key, jsonData);
    return true;
  } catch (error) {
    console.error(`❌ خطا در ذخیره ${key}:`, error);
    return false;
  }
};

/**
 * بازیابی داده از AsyncStorage
 * @param {string} key - کلید ذخیره‌سازی
 * @returns {Promise<any>} - داده بازیابی شده
 */
export const getData = async (key) => {
  try {
    const jsonData = await AsyncStorage.getItem(key);
    return jsonData ? JSON.parse(jsonData) : null;
  } catch (error) {
    console.error(`❌ خطا در بازیابی ${key}:`, error);
    return null;
  }
};

/**
 * حذف داده از AsyncStorage
 * @param {string} key - کلید ذخیره‌سازی
 * @returns {Promise<boolean>} - موفقیت عملیات
 */
export const removeData = async (key) => {
  try {
    await AsyncStorage.removeItem(key);
    return true;
  } catch (error) {
    console.error(`❌ خطا در حذف ${key}:`, error);
    return false;
  }
};

/**
 * پاک کردن تمام داده‌های اپلیکیشن
 * @returns {Promise<boolean>} - موفقیت عملیات
 */
export const clearAllData = async () => {
  try {
    await AsyncStorage.clear();
    console.log('🗑️ تمام داده‌های ذخیره‌شده پاک شدند');
    return true;
  } catch (error) {
    console.error('❌ خطا در پاک کردن تمام داده‌ها:', error);
    return false;
  }
};

// ==================== توابع کاربران ====================

/**
 * دریافت تمام کاربران
 * @returns {Promise<Array>} - لیست کاربران
 */
export const getAllUsers = async () => {
  return await getData(STORAGE_KEYS.USERS) || [];
};

/**
 * ذخیره تمام کاربران
 * @param {Array} users - لیست کاربران
 * @returns {Promise<boolean>} - موفقیت عملیات
 */
export const saveAllUsers = async (users) => {
  return await saveData(STORAGE_KEYS.USERS, users);
};

/**
 * دریافت کاربر بر اساس ID
 * @param {number} userId - شناسه کاربر
 * @returns {Promise<Object|null>} - کاربر یافت شده
 */
export const getUserById = async (userId) => {
  const users = await getAllUsers();
  return users.find(user => user.id === userId) || null;
};

/**
 * دریافت کاربر بر اساس شماره موبایل
 * @param {string} phone - شماره موبایل
 * @returns {Promise<Object|null>} - کاربر یافت شده
 */
export const getUserByPhone = async (phone) => {
  const users = await getAllUsers();
  return users.find(user => user.phone === phone) || null;
};

/**
 * افزودن یا به‌روزرسانی کاربر
 * @param {Object} userData - داده‌های کاربر
 * @returns {Promise<boolean>} - موفقیت عملیات
 */
export const saveUser = async (userData) => {
  try {
    const users = await getAllUsers();
    const existingIndex = users.findIndex(user => user.id === userData.id);
    
    if (existingIndex >= 0) {
      // به‌روزرسانی کاربر موجود
      users[existingIndex] = { ...users[existingIndex], ...userData };
    } else {
      // افزودن کاربر جدید
      users.push(userData);
    }
    
    return await saveAllUsers(users);
  } catch (error) {
    console.error('❌ خطا در ذخیره کاربر:', error);
    return false;
  }
};

/**
 * دریافت کاربر فعلی
 * @returns {Promise<Object|null>} - کاربر فعلی
 */
export const getCurrentUser = async () => {
  return await getData(STORAGE_KEYS.CURRENT_USER);
};

/**
 * ذخیره کاربر فعلی
 * @param {Object} user - کاربر
 * @returns {Promise<boolean>} - موفقیت عملیات
 */
export const saveCurrentUser = async (user) => {
  return await saveData(STORAGE_KEYS.CURRENT_USER, user);
};

/**
 * حذف کاربر فعلی (خروج از حساب)
 * @returns {Promise<boolean>} - موفقیت عملیات
 */
export const removeCurrentUser = async () => {
  return await removeData(STORAGE_KEYS.CURRENT_USER);
};

// ==================== توابع تراکنش‌ها ====================

/**
 * دریافت تمام تراکنش‌های کاربر
 * @param {number} userId - شناسه کاربر
 * @returns {Promise<Array>} - لیست تراکنش‌ها
 */
export const getUserTransactions = async (userId) => {
  const allTransactions = await getData(STORAGE_KEYS.TRANSACTIONS) || [];
  return allTransactions.filter(transaction => transaction.userId === userId);
};

/**
 * افزودن تراکنش جدید
 * @param {Object} transactionData - داده‌های تراکنش
 * @returns {Promise<Object|null>} - تراکنش ذخیره شده
 */
export const addTransaction = async (transactionData) => {
  try {
    const allTransactions = await getData(STORAGE_KEYS.TRANSACTIONS) || [];
    
    const newTransaction = {
      id: Date.now(),
      ...transactionData,
      date: new Date().toLocaleDateString('fa-IR') + ' - ' + 
            new Date().toLocaleTimeString('fa-IR', { hour: '2-digit', minute: '2-digit' }),
    };
    
    allTransactions.unshift(newTransaction);
    await saveData(STORAGE_KEYS.TRANSACTIONS, allTransactions);
    
    return newTransaction;
  } catch (error) {
    console.error('❌ خطا در افزودن تراکنش:', error);
    return null;
  }
};

/**
 * دریافت آخرین تراکنش‌های کاربر
 * @param {number} userId - شناسه کاربر
 * @param {number} limit - تعداد تراکنش‌ها
 * @returns {Promise<Array>} - لیست تراکنش‌ها
 */
export const getRecentTransactions = async (userId, limit = 10) => {
  const transactions = await getUserTransactions(userId);
  return transactions.slice(0, limit);
};

// ==================== توابع نوتیفیکیشن‌ها ====================

/**
 * دریافت تمام نوتیفیکیشن‌های کاربر
 * @param {number} userId - شناسه کاربر
 * @returns {Promise<Array>} - لیست نوتیفیکیشن‌ها
 */
export const getUserNotifications = async (userId) => {
  const allNotifications = await getData(STORAGE_KEYS.NOTIFICATIONS) || [];
  return allNotifications.filter(notification => notification.userId === userId);
};

/**
 * دریافت تعداد نوتیفیکیشن‌های خوانده نشده
 * @param {number} userId - شناسه کاربر
 * @returns {Promise<number>} - تعداد خوانده نشده‌ها
 */
export const getUnreadNotificationsCount = async (userId) => {
  const notifications = await getUserNotifications(userId);
  return notifications.filter(notification => !notification.read).length;
};

/**
 * افزودن نوتیفیکیشن جدید
 * @param {Object} notificationData - داده‌های نوتیفیکیشن
 * @returns {Promise<Object|null>} - نوتیفیکیشن ذخیره شده
 */
export const addNotification = async (notificationData) => {
  try {
    const allNotifications = await getData(STORAGE_KEYS.NOTIFICATIONS) || [];
    
    const newNotification = {
      id: Date.now(),
      ...notificationData,
      time: 'همین حالا',
      read: false,
    };
    
    allNotifications.unshift(newNotification);
    await saveData(STORAGE_KEYS.NOTIFICATIONS, allNotifications);
    
    return newNotification;
  } catch (error) {
    console.error('❌ خطا در افزودن نوتیفیکیشن:', error);
    return null;
  }
};

/**
 * علامت‌گذاری نوتیفیکیشن به عنوان خوانده شده
 * @param {number} notificationId - شناسه نوتیفیکیشن
 * @returns {Promise<boolean>} - موفقیت عملیات
 */
export const markNotificationAsRead = async (notificationId) => {
  try {
    const allNotifications = await getData(STORAGE_KEYS.NOTIFICATIONS) || [];
    const notificationIndex = allNotifications.findIndex(n => n.id === notificationId);
    
    if (notificationIndex >= 0) {
      allNotifications[notificationIndex].read = true;
      await saveData(STORAGE_KEYS.NOTIFICATIONS, allNotifications);
      return true;
    }
    
    return false;
  } catch (error) {
    console.error('❌ خطا در علامت‌گذاری نوتیفیکیشن:', error);
    return false;
  }
};

/**
 * حذف تمام نوتیفیکیشن‌های کاربر
 * @param {number} userId - شناسه کاربر
 * @returns {Promise<boolean>} - موفقیت عملیات
 */
export const clearUserNotifications = async (userId) => {
  try {
    const allNotifications = await getData(STORAGE_KEYS.NOTIFICATIONS) || [];
    const filteredNotifications = allNotifications.filter(
      notification => notification.userId !== userId
    );
    
    await saveData(STORAGE_KEYS.NOTIFICATIONS, filteredNotifications);
    return true;
  } catch (error) {
    console.error('❌ خطا در پاک کردن نوتیفیکیشن‌ها:', error);
    return false;
  }
};

// ==================== توابع دعوت و زیرمجموعه ====================

/**
 * دریافت داده‌های دعوت کاربر
 * @param {number} userId - شناسه کاربر
 * @returns {Promise<Object|null>} - داده‌های دعوت
 */
export const getUserReferrals = async (userId) => {
  const allReferrals = await getData(STORAGE_KEYS.REFERRALS) || [];
  return allReferrals.find(referral => referral.userId === userId) || null;
};

/**
 * ذخیره داده‌های دعوت کاربر
 * @param {Object} referralData - داده‌های دعوت
 * @returns {Promise<boolean>} - موفقیت عملیات
 */
export const saveUserReferrals = async (referralData) => {
  try {
    const allReferrals = await getData(STORAGE_KEYS.REFERRALS) || [];
    const existingIndex = allReferrals.findIndex(r => r.userId === referralData.userId);
    
    if (existingIndex >= 0) {
      allReferrals[existingIndex] = referralData;
    } else {
      allReferrals.push(referralData);
    }
    
    await saveData(STORAGE_KEYS.REFERRALS, allReferrals);
    return true;
  } catch (error) {
    console.error('❌ خطا در ذخیره داده‌های دعوت:', error);
    return false;
  }
};

/**
 * افزودن دعوت جدید برای کاربر
 * @param {number} userId - شناسه کاربر
 * @param {Object} inviteData - داده‌های دعوت جدید
 * @returns {Promise<boolean>} - موفقیت عملیات
 */
export const addReferral = async (userId, inviteData) => {
  try {
    const referrals = await getUserReferrals(userId);
    if (!referrals) return false;
    
    referrals.totalInvites += 1;
    referrals.pendingInvites += 1;
    referrals.history = referrals.history || [];
    referrals.history.unshift({
      id: Date.now(),
      ...inviteData,
    });
    
    return await saveUserReferrals(referrals);
  } catch (error) {
    console.error('❌ خطا در افزودن دعوت:', error);
    return false;
  }
};

// ==================== توابع تنظیمات ====================

/**
 * دریافت تنظیمات اپلیکیشن
 * @returns {Promise<Object>} - تنظیمات
 */
export const getAppSettings = async () => {
  const settings = await getData(STORAGE_KEYS.SETTINGS);
  return settings || {
    darkMode: true,
    notifications: true,
    sound: true,
    vibration: true,
    autoMining: false,
    language: 'fa',
    currency: 'تومان',
    biometricLogin: false,
    dataSaving: false,
  };
};

/**
 * ذخیره تنظیمات اپلیکیشن
 * @param {Object} settings - تنظیمات
 * @returns {Promise<boolean>} - موفقیت عملیات
 */
export const saveAppSettings = async (settings) => {
  return await saveData(STORAGE_KEYS.SETTINGS, settings);
};

/**
 * به‌روزرسانی تنظیمات کاربر
 * @param {Object} updatedSettings - تنظیمات به‌روز شده
 * @returns {Promise<boolean>} - موفقیت عملیات
 */
export const updateAppSettings = async (updatedSettings) => {
  try {
    const currentSettings = await getAppSettings();
    const newSettings = { ...currentSettings, ...updatedSettings };
    return await saveAppSettings(newSettings);
  } catch (error) {
    console.error('❌ خطا در به‌روزرسانی تنظیمات:', error);
    return false;
  }
};

// ==================== توابع مأموریت‌ها ====================

/**
 * دریافت داده‌های مأموریت کاربر
 * @param {number} userId - شناسه کاربر
 * @returns {Promise<Object>} - داده‌های مأموریت
 */
export const getUserMissionData = async (userId) => {
  const allMissionData = await getData(STORAGE_KEYS.MISSION_DATA) || [];
  const userMissionData = allMissionData.find(data => data.userId === userId);
  
  return userMissionData || {
    userId,
    activeMissions: [],
    completedMissions: 0,
    dailyMission: { available: true, claimed: false, reward: 1000 },
    weeklyMission: { progress: 0, max: 7, reward: 5000, claimedDays: [] },
  };
};

/**
 * ذخیره داده‌های مأموریت کاربر
 * @param {Object} missionData - داده‌های مأموریت
 * @returns {Promise<boolean>} - موفقیت عملیات
 */
export const saveUserMissionData = async (missionData) => {
  try {
    const allMissionData = await getData(STORAGE_KEYS.MISSION_DATA) || [];
    const existingIndex = allMissionData.findIndex(data => data.userId === missionData.userId);
    
    if (existingIndex >= 0) {
      allMissionData[existingIndex] = missionData;
    } else {
      allMissionData.push(missionData);
    }
    
    await saveData(STORAGE_KEYS.MISSION_DATA, allMissionData);
    return true;
  } catch (error) {
    console.error('❌ خطا در ذخیره داده‌های مأموریت:', error);
    return false;
  }
};

// ==================== توابع آمار استخراج ====================

/**
 * دریافت آمار استخراج کاربر
 * @param {number} userId - شناسه کاربر
 * @returns {Promise<Object>} - آمار استخراج
 */
export const getUserMiningStats = async (userId) => {
  const allMiningStats = await getData(STORAGE_KEYS.MINING_STATS) || [];
  const userStats = allMiningStats.find(stats => stats.userId === userId);
  
  return userStats || {
    userId,
    today: 0,
    yesterday: 0,
    thisWeek: 0,
    thisMonth: 0,
    total: 0,
    bestDay: 0,
    averagePerDay: 0,
    clicksToday: 0,
    autoMiningTime: 0,
    boostUsed: 0,
    upgrades: 0,
  };
};

/**
 * ذخیره آمار استخراج کاربر
 * @param {Object} miningStats - آمار استخراج
 * @returns {Promise<boolean>} - موفقیت عملیات
 */
export const saveUserMiningStats = async (miningStats) => {
  try {
    const allMiningStats = await getData(STORAGE_KEYS.MINING_STATS) || [];
    const existingIndex = allMiningStats.findIndex(stats => stats.userId === miningStats.userId);
    
    if (existingIndex >= 0) {
      allMiningStats[existingIndex] = miningStats;
    } else {
      allMiningStats.push(miningStats);
    }
    
    await saveData(STORAGE_KEYS.MINING_STATS, allMiningStats);
    return true;
  } catch (error) {
    console.error('❌ خطا در ذخیره آمار استخراج:', error);
    return false;
  }
};

// ==================== توابع کمکی ====================

/**
 * بررسی وجود داده برای کلید خاص
 * @param {string} key - کلید ذخیره‌سازی
 * @returns {Promise<boolean>} - وجود دارد یا نه
 */
export const hasData = async (key) => {
  try {
    const value = await AsyncStorage.getItem(key);
    return value !== null;
  } catch (error) {
    console.error(`❌ خطا در بررسی ${key}:`, error);
    return false;
  }
};

/**
 * دریافت چندین کلید به صورت همزمان
 * @param {Array} keys - آرایه کلیدها
 * @returns {Promise<Array>} - مقادیر
 */
export const multiGet = async (keys) => {
  try {
    const values = await AsyncStorage.multiGet(keys);
    return values.map(([key, value]) => ({
      key,
      value: value ? JSON.parse(value) : null,
    }));
  } catch (error) {
    console.error('❌ خطا در دریافت چندین کلید:', error);
    return [];
  }
};

/**
 * ذخیره چندین کلید به صورت همزمان
 * @param {Array} keyValuePairs - آرایه جفت کلید-مقدار
 * @returns {Promise<boolean>} - موفقیت عملیات
 */
export const multiSet = async (keyValuePairs) => {
  try {
    const stringifiedPairs = keyValuePairs.map(([key, value]) => [
      key,
      JSON.stringify(value),
    ]);
    
    await AsyncStorage.multiSet(stringifiedPairs);
    return true;
  } catch (error) {
    console.error('❌ خطا در ذخیره چندین کلید:', error);
    return false;
  }
};

/**
 * فرمت اعداد
 * @param {number} num - عدد
 * @returns {string} - عدد فرمت شده
 */
export const formatNumber = (num) => {
  if (!num && num !== 0) return '0';
  
  if (num >= 1000000) {
    return (num / 1000000).toFixed(2) + 'M';
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'K';
  }
  return Math.floor(num).toString();
};

/**
 * هش رمز عبور (ساده)
 * @param {string} password - رمز عبور
 * @returns {string} - رمز هش شده
 */
export const hashPassword = (password) => {
  // در نسخه واقعی از bcrypt یا روش امن استفاده کنید
  return btoa(password);
};

/**
 * بررسی تطابق رمز عبور
 * @param {string} password - رمز عبور
 * @param {string} hashedPassword - رمز هش شده
 * @returns {boolean} - تطابق دارد یا نه
 */
export const verifyPassword = (password, hashedPassword) => {
  return hashPassword(password) === hashedPassword;
};
[file content end]
