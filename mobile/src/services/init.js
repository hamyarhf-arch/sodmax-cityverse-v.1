[file name]: mobile/src/services/init.js
[file content begin]
import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * سرویس راه‌اندازی اولیه اپلیکیشن
 * این فایل برای مقداردهی اولیه و لود داده‌های اولیه استفاده می‌شود
 */

// کلیدهای ذخیره‌سازی
export const STORAGE_KEYS = {
  USERS: 'sodmax_users',
  CURRENT_USER: 'sodmax_current_user',
  TRANSACTIONS: 'sodmax_transactions',
  NOTIFICATIONS: 'sodmax_notifications',
  REFERRALS: 'sodmax_referrals',
  SETTINGS: 'sodmax_settings',
  MISSION_DATA: 'sodmax_mission_data',
  MINING_STATS: 'sodmax_mining_stats',
};

/**
 * مقداردهی اولیه داده‌های اپلیکیشن
 */
export const initializeAppData = async () => {
  try {
    console.log('🚀 در حال راه‌اندازی داده‌های اولیه...');
    
    // بررسی و ایجاد داده‌های پیش‌فرض
    await initializeDefaultData();
    
    // لود تنظیمات کاربر
    const settings = await getAppSettings();
    
    // لود داده‌های کش
    await preloadCacheData();
    
    console.log('✅ راه‌اندازی اولیه با موفقیت انجام شد');
    return { success: true, settings };
  } catch (error) {
    console.error('❌ خطا در راه‌اندازی اولیه:', error);
    return { success: false, error: error.message };
  }
};

/**
 * ایجاد داده‌های پیش‌فرض در صورت نبودن
 */
const initializeDefaultData = async () => {
  const promises = [];
  
  // کاربران
  promises.push(initializeUsers());
  
  // تراکنش‌ها
  promises.push(initializeTransactions());
  
  // نوتیفیکیشن‌ها
  promises.push(initializeNotifications());
  
  // داده‌های دعوت
  promises.push(initializeReferrals());
  
  // تنظیمات
  promises.push(initializeSettings());
  
  // داده‌های مأموریت
  promises.push(initializeMissionData());
  
  // آمار استخراج
  promises.push(initializeMiningStats());
  
  await Promise.all(promises);
};

/**
 * ایجاد کاربران پیش‌فرض
 */
const initializeUsers = async () => {
  const existingUsers = await AsyncStorage.getItem(STORAGE_KEYS.USERS);
  if (!existingUsers) {
    const defaultUsers = [
      {
        id: 1,
        name: "علی محمدی",
        phone: "09123456789",
        password: "eWFxaWkxMjM0NTY=", // Base64: yaqii123456
        avatar: "ع",
        level: 5,
        totalEarned: 124500,
        referralCount: 24,
        referralEarnings: 124000,
        joinDate: "۱۴۰۲/۰۵/۱۰",
        lastLogin: new Date().toLocaleDateString('fa-IR'),
        sodBalance: 1845200,
        tomanBalance: 28400,
        usdtBalance: 120.5,
        miningPower: 18,
        miningMultiplier: 1,
        autoMining: false,
        todayEarned: 2450,
        totalMined: 1845200,
        completedMissions: 48,
        referralCode: "ALI12345",
        referralLink: "https://sodmax.city/invite/ali123",
        isPremium: false,
        premiumExpiry: null,
        lastDailyReward: null,
        streakDays: 5,
      }
    ];
    await AsyncStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(defaultUsers));
    console.log('✅ کاربران پیش‌فرض ایجاد شدند');
  }
};

/**
 * ایجاد تراکنش‌های پیش‌فرض
 */
const initializeTransactions = async () => {
  const existingTransactions = await AsyncStorage.getItem(STORAGE_KEYS.TRANSACTIONS);
  if (!existingTransactions) {
    const defaultTransactions = [
      {
        id: 1,
        userId: 1,
        type: "برداشت تومان",
        amount: 50000,
        currency: "تومان",
        status: "موفق",
        date: "امروز - ۱۴:۳۰",
        icon: "download",
        color: "#00D4AA"
      },
      {
        id: 2,
        userId: 1,
        type: "ارتقاء ماینر",
        amount: -25000,
        currency: "SOD",
        status: "موفق",
        date: "دیروز - ۱۰:۱۵",
        icon: "arrow-up",
        color: "#FF6B35"
      },
      {
        id: 3,
        userId: 1,
        type: "استخراج دستی",
        amount: 180,
        currency: "SOD",
        status: "موفق",
        date: "امروز - ۱۲:۴۵",
        icon: "hard-hat",
        color: "#0066FF"
      },
      {
        id: 4,
        userId: 1,
        type: "پاداش دعوت",
        amount: 1000,
        currency: "تومان",
        status: "موفق",
        date: "دیروز - ۱۶:۲۰",
        icon: "user-plus",
        color: "#00D4AA"
      },
      {
        id: 5,
        userId: 1,
        type: "پاداش مأموریت",
        amount: 500,
        currency: "تومان",
        status: "موفق",
        date: "۲ روز پیش - ۰۹:۱۰",
        icon: "trophy",
        color: "#10B981"
      }
    ];
    await AsyncStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(defaultTransactions));
    console.log('✅ تراکنش‌های پیش‌فرض ایجاد شدند');
  }
};

/**
 * ایجاد نوتیفیکیشن‌های پیش‌فرض
 */
const initializeNotifications = async () => {
  const existingNotifications = await AsyncStorage.getItem(STORAGE_KEYS.NOTIFICATIONS);
  if (!existingNotifications) {
    const defaultNotifications = [
      {
        id: 1,
        userId: 1,
        title: "🎉 به روزرسانی جدید",
        message: "سیستم 3D و افکت‌های جدید اضافه شد!",
        time: "۵ دقیقه پیش",
        read: false,
        type: "update"
      },
      {
        id: 2,
        userId: 1,
        title: "💰 پاداش دریافت شد",
        message: "مأموریت کلیک روزانه تکمیل شد! +۵۰۰ تومان",
        time: "۲ ساعت پیش",
        read: false,
        type: "reward"
      },
      {
        id: 3,
        userId: 1,
        title: "🤝 دعوت موفق",
        message: "دوست شما ثبت‌نام کرد! +۱,۰۰۰ تومان پاداش",
        time: "۱ روز پیش",
        read: false,
        type: "referral"
      },
      {
        id: 4,
        userId: 1,
        title: "⚡ قدرت افزایش یافت",
        message: "بوست استخراج شما فعال شد! قدرت ۳ برابر",
        time: "۳ ساعت پیش",
        read: true,
        type: "mining"
      },
      {
        id: 5,
        userId: 1,
        title: "🏆 مأموریت جدید",
        message: "مأموریت ویژه هفتگی اضافه شد! پاداش: ۵,۰۰۰ تومان",
        time: "۶ ساعت پیش",
        read: true,
        type: "mission"
      }
    ];
    await AsyncStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(defaultNotifications));
    console.log('✅ نوتیفیکیشن‌های پیش‌فرض ایجاد شدند');
  }
};

/**
 * ایجاد داده‌های دعوت پیش‌فرض
 */
const initializeReferrals = async () => {
  const existingReferrals = await AsyncStorage.getItem(STORAGE_KEYS.REFERRALS);
  if (!existingReferrals) {
    const defaultReferrals = [
      {
        id: 1,
        userId: 1,
        totalInvites: 24,
        activeInvites: 18,
        pendingInvites: 3,
        totalEarned: 124000,
        referralCode: "ALI12345",
        referralLink: "https://sodmax.city/invite/ali123",
        history: [
          { id: 1, name: "رضا احمدی", date: "امروز", status: "فعال", earned: 1000 },
          { id: 2, name: "مریم کریمی", date: "دیروز", status: "فعال", earned: 1000 },
          { id: 3, name: "حسن محمودی", date: "۲ روز پیش", status: "در انتظار", earned: 0 },
        ]
      }
    ];
    await AsyncStorage.setItem(STORAGE_KEYS.REFERRALS, JSON.stringify(defaultReferrals));
    console.log('✅ داده‌های دعوت پیش‌فرض ایجاد شدند');
  }
};

/**
 * ایجاد تنظیمات پیش‌فرض
 */
const initializeSettings = async () => {
  const existingSettings = await AsyncStorage.getItem(STORAGE_KEYS.SETTINGS);
  if (!existingSettings) {
    const defaultSettings = {
      userId: 1,
      darkMode: true,
      notifications: true,
      sound: true,
      vibration: true,
      autoMining: false,
      language: 'fa',
      currency: 'تومان',
      biometricLogin: false,
      dataSaving: false,
      appVersion: '2.0.0',
    };
    await AsyncStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(defaultSettings));
    console.log('✅ تنظیمات پیش‌فرض ایجاد شدند');
  }
};

/**
 * ایجاد داده‌های مأموریت پیش‌فرض
 */
const initializeMissionData = async () => {
  const existingMissionData = await AsyncStorage.getItem(STORAGE_KEYS.MISSION_DATA);
  if (!existingMissionData) {
    const defaultMissionData = {
      userId: 1,
      activeMissions: [
        { id: 1, name: "۱۰۰ کلیک در بازی", reward: 500, progress: 45, max: 100, type: "click", icon: "gamepad" },
        { id: 2, name: "دعوت ۵ دوست", reward: 1000, progress: 2, max: 5, type: "referral", icon: "user-plus" },
        { id: 3, name: "ارتقاء ماینر", reward: 3000, progress: 0, max: 1, type: "upgrade", icon: "arrow-up" },
      ],
      completedMissions: 48,
      dailyMission: {
        available: true,
        claimed: false,
        reward: 1000,
        type: "daily"
      },
      weeklyMission: {
        progress: 3,
        max: 7,
        reward: 5000,
        claimedDays: [1, 2, 3]
      }
    };
    await AsyncStorage.setItem(STORAGE_KEYS.MISSION_DATA, JSON.stringify(defaultMissionData));
    console.log('✅ داده‌های مأموریت پیش‌فرض ایجاد شدند');
  }
};

/**
 * ایجاد آمار استخراج پیش‌فرض
 */
const initializeMiningStats = async () => {
  const existingMiningStats = await AsyncStorage.getItem(STORAGE_KEYS.MINING_STATS);
  if (!existingMiningStats) {
    const defaultMiningStats = {
      userId: 1,
      today: 2450,
      yesterday: 3210,
      thisWeek: 15840,
      thisMonth: 65200,
      total: 1845200,
      bestDay: 4500,
      averagePerDay: 2150,
      clicksToday: 45,
      autoMiningTime: 0,
      boostUsed: 3,
      upgrades: 2
    };
    await AsyncStorage.setItem(STORAGE_KEYS.MINING_STATS, JSON.stringify(defaultMiningStats));
    console.log('✅ آمار استخراج پیش‌فرض ایجاد شدند');
  }
};

/**
 * دریافت تنظیمات اپلیکیشن
 */
export const getAppSettings = async () => {
  try {
    const settings = await AsyncStorage.getItem(STORAGE_KEYS.SETTINGS);
    return settings ? JSON.parse(settings) : null;
  } catch (error) {
    console.error('❌ خطا در دریافت تنظیمات:', error);
    return null;
  }
};

/**
 * ذخیره تنظیمات اپلیکیشن
 */
export const saveAppSettings = async (settings) => {
  try {
    await AsyncStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
    console.log('✅ تنظیمات ذخیره شدند');
    return true;
  } catch (error) {
    console.error('❌ خطا در ذخیره تنظیمات:', error);
    return false;
  }
};

/**
 * پیش‌لود داده‌های کش
 */
const preloadCacheData = async () => {
  try {
    // لود همزمان داده‌های مورد نیاز
    const cachePromises = [
      AsyncStorage.getItem(STORAGE_KEYS.USERS),
      AsyncStorage.getItem(STORAGE_KEYS.CURRENT_USER),
      AsyncStorage.getItem(STORAGE_KEYS.TRANSACTIONS),
    ];
    
    await Promise.all(cachePromises);
    console.log('✅ داده‌های کش با موفقیت لود شدند');
  } catch (error) {
    console.error('❌ خطا در لود داده‌های کش:', error);
  }
};

/**
 * پاک کردن تمام داده‌های اپلیکیشن
 * (فقط برای حالت توسعه)
 */
export const clearAllAppData = async () => {
  try {
    const keys = Object.values(STORAGE_KEYS);
    await AsyncStorage.multiRemove(keys);
    console.log('🗑️ تمام داده‌های اپلیکیشن پاک شدند');
    return true;
  } catch (error) {
    console.error('❌ خطا در پاک کردن داده‌ها:', error);
    return false;
  }
};

/**
 * بررسی نسخه اپلیکیشن و مهاجرت داده‌ها در صورت نیاز
 */
export const checkAndMigrateData = async () => {
  try {
    const settings = await getAppSettings();
    if (!settings) {
      console.log('📋 تنظیمات یافت نشد، نسخه اولیه');
      return { migrated: false, version: '1.0.0' };
    }
    
    const currentVersion = '2.0.0';
    const storedVersion = settings.appVersion || '1.0.0';
    
    if (storedVersion !== currentVersion) {
      console.log(`🔄 مهاجرت از نسخه ${storedVersion} به ${currentVersion}`);
      
      // در اینجا می‌توانید منطق مهاجرت داده‌ها را اضافه کنید
      
      // به‌روزرسانی نسخه در تنظیمات
      settings.appVersion = currentVersion;
      await saveAppSettings(settings);
      
      console.log('✅ مهاجرت داده‌ها با موفقیت انجام شد');
      return { migrated: true, from: storedVersion, to: currentVersion };
    }
    
    return { migrated: false, version: currentVersion };
  } catch (error) {
    console.error('❌ خطا در بررسی و مهاجرت داده‌ها:', error);
    return { migrated: false, error: error.message };
  }
};

/**
 * دریافت خلاصه وضعیت اپلیکیشن
 */
export const getAppStatus = async () => {
  try {
    const [
      users,
      currentUser,
      transactions,
      notifications,
      settings
    ] = await Promise.all([
      AsyncStorage.getItem(STORAGE_KEYS.USERS),
      AsyncStorage.getItem(STORAGE_KEYS.CURRENT_USER),
      AsyncStorage.getItem(STORAGE_KEYS.TRANSACTIONS),
      AsyncStorage.getItem(STORAGE_KEYS.NOTIFICATIONS),
      AsyncStorage.getItem(STORAGE_KEYS.SETTINGS),
    ]);
    
    return {
      usersCount: users ? JSON.parse(users).length : 0,
      hasCurrentUser: !!currentUser,
      transactionsCount: transactions ? JSON.parse(transactions).length : 0,
      notificationsCount: notifications ? JSON.parse(notifications).length : 0,
      settings: settings ? JSON.parse(settings) : null,
      initialized: true,
    };
  } catch (error) {
    console.error('❌ خطا در دریافت وضعیت اپلیکیشن:', error);
    return {
      initialized: false,
      error: error.message
    };
  }
};
[file content end]
