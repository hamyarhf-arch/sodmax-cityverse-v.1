[file name]: mobile/src/context/AppContext.js
[file content begin]
import React, { createContext, useState, useContext, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { 
  getCurrentUser, 
  saveCurrentUser, 
  removeCurrentUser,
  getUserById,
  saveUser,
  getAppSettings,
  updateAppSettings,
  getUserTransactions,
  addTransaction,
  getUserNotifications,
  getUnreadNotificationsCount,
  addNotification,
  markNotificationAsRead,
  getUserReferrals,
  saveUserReferrals,
  getUserMissionData,
  saveUserMissionData,
  getUserMiningStats,
  saveUserMiningStats,
  formatNumber,
} from '@services/storage';

// ایجاد Context
const AppContext = createContext();

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};

export const AppProvider = ({ children }) => {
  // حالت‌های اصلی
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [appSettings, setAppSettings] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [unreadNotifications, setUnreadNotifications] = useState(0);
  const [transactions, setTransactions] = useState([]);
  const [referrals, setReferrals] = useState(null);
  const [missionData, setMissionData] = useState(null);
  const [miningStats, setMiningStats] = useState(null);
  
  // حالت‌های موقت
  const [isMining, setIsMining] = useState(false);
  const [isAutoMining, setIsAutoMining] = useState(false);
  const [miningBoost, setMiningBoost] = useState(false);
  const [miningMultiplier, setMiningMultiplier] = useState(1);

  // لود اولیه داده‌ها
  useEffect(() => {
    loadAppData();
  }, []);

  // راه‌اندازی تایمر استخراج خودکار
  useEffect(() => {
    let autoMiningInterval;
    
    if (isAutoMining && user) {
      autoMiningInterval = setInterval(() => {
        handleAutoMine();
      }, 5000); // هر 5 ثانیه
    }
    
    return () => {
      if (autoMiningInterval) {
        clearInterval(autoMiningInterval);
      }
    };
  }, [isAutoMining, user]);

  // لود تمام داده‌های اپلیکیشن
  const loadAppData = async () => {
    try {
      setIsLoading(true);
      
      // لود کاربر فعلی
      const currentUser = await getCurrentUser();
      if (currentUser) {
        setUser(currentUser);
        
        // لود داده‌های وابسته به کاربر
        await Promise.all([
          loadUserData(currentUser.id),
          loadSettings(),
        ]);
      }
      
      setIsLoading(false);
    } catch (error) {
      console.error('❌ خطا در لود داده‌های اپلیکیشن:', error);
      setIsLoading(false);
    }
  };

  // لود داده‌های کاربر
  const loadUserData = async (userId) => {
    try {
      const [
        userTransactions,
        userNotifications,
        userReferrals,
        userMissionData,
        userMiningStats,
      ] = await Promise.all([
        getUserTransactions(userId),
        getUserNotifications(userId),
        getUserReferrals(userId),
        getUserMissionData(userId),
        getUserMiningStats(userId),
      ]);
      
      setTransactions(userTransactions);
      setNotifications(userNotifications);
      setReferrals(userReferrals);
      setMissionData(userMissionData);
      setMiningStats(userMiningStats);
      
      // تعداد نوتیفیکیشن‌های خوانده نشده
      const unreadCount = await getUnreadNotificationsCount(userId);
      setUnreadNotifications(unreadCount);
      
      // بررسی فعال بودن استخراج خودکار
      if (user) {
        setIsAutoMining(user.autoMining || false);
        setMiningMultiplier(user.miningMultiplier || 1);
      }
    } catch (error) {
      console.error('❌ خطا در لود داده‌های کاربر:', error);
    }
  };

  // لود تنظیمات
  const loadSettings = async () => {
    try {
      const settings = await getAppSettings();
      setAppSettings(settings);
    } catch (error) {
      console.error('❌ خطا در لود تنظیمات:', error);
    }
  };

  // ==================== توابع کاربر ====================

  // ورود کاربر
  const loginUser = async (userData) => {
    try {
      await saveCurrentUser(userData);
      setUser(userData);
      await loadUserData(userData.id);
      return { success: true, user: userData };
    } catch (error) {
      console.error('❌ خطا در ورود کاربر:', error);
      return { success: false, error: error.message };
    }
  };

  // خروج کاربر
  const logoutUser = async () => {
    try {
      await removeCurrentUser();
      setUser(null);
      setTransactions([]);
      setNotifications([]);
      setReferrals(null);
      setMissionData(null);
      setMiningStats(null);
      setUnreadNotifications(0);
      setIsAutoMining(false);
      return { success: true };
    } catch (error) {
      console.error('❌ خطا در خروج کاربر:', error);
      return { success: false, error: error.message };
    }
  };

  // به‌روزرسانی کاربر
  const updateUser = async (updatedData) => {
    try {
      if (!user) {
        throw new Error('کاربری وارد نشده است');
      }
      
      const updatedUser = { ...user, ...updatedData };
      await saveUser(updatedUser);
      await saveCurrentUser(updatedUser);
      setUser(updatedUser);
      
      return { success: true, user: updatedUser };
    } catch (error) {
      console.error('❌ خطا در به‌روزرسانی کاربر:', error);
      return { success: false, error: error.message };
    }
  };

  // ==================== توابع استخراج ====================

  // استخراج دستی
  const handleManualMine = async () => {
    if (!user || isMining) return { success: false, earned: 0 };
    
    try {
      setIsMining(true);
      
      // محاسبه مقدار استخراج شده
      const baseMiningPower = user.miningPower || 5;
      const multiplier = miningMultiplier || 1;
      const earned = Math.floor(baseMiningPower * multiplier);
      
      // به‌روزرسانی کاربر
      const updatedUser = {
        ...user,
        sodBalance: (user.sodBalance || 0) + earned,
        todayEarned: (user.todayEarned || 0) + earned,
        totalMined: (user.totalMined || 0) + earned,
      };
      
      await updateUser(updatedUser);
      
      // ثبت تراکنش
      await addTransaction({
        userId: user.id,
        type: 'استخراج دستی',
        amount: earned,
        currency: 'SOD',
        status: 'موفق',
        icon: 'hard-hat',
        color: '#0066FF',
      });
      
      // به‌روزرسانی آمار استخراج
      if (miningStats) {
        const updatedStats = {
          ...miningStats,
          today: (miningStats.today || 0) + earned,
          total: (miningStats.total || 0) + earned,
          clicksToday: (miningStats.clicksToday || 0) + 1,
        };
        
        await saveUserMiningStats(updatedStats);
        setMiningStats(updatedStats);
      }
      
      // به‌روزرسانی مأموریت کلیک
      if (missionData && missionData.activeMissions) {
        const clickMission = missionData.activeMissions.find(
          mission => mission.type === 'click'
        );
        
        if (clickMission && clickMission.progress < clickMission.max) {
          const updatedMissions = missionData.activeMissions.map(mission => {
            if (mission.type === 'click') {
              return { ...mission, progress: mission.progress + 1 };
            }
            return mission;
          });
          
          const updatedMissionData = {
            ...missionData,
            activeMissions: updatedMissions,
          };
          
          await saveUserMissionData(updatedMissionData);
          setMissionData(updatedMissionData);
          
          // بررسی تکمیل مأموریت
          if (clickMission.progress + 1 >= clickMission.max) {
            completeMission(clickMission.id);
          }
        }
      }
      
      // بارگذاری مجدد داده‌ها
      await loadUserData(user.id);
      
      setIsMining(false);
      return { success: true, earned };
      
    } catch (error) {
      console.error('❌ خطا در استخراج دستی:', error);
      setIsMining(false);
      return { success: false, earned: 0, error: error.message };
    }
  };

  // استخراج خودکار
  const handleAutoMine = async () => {
    if (!user || !isAutoMining) return;
    
    try {
      const baseMiningPower = user.miningPower || 5;
      const multiplier = miningMultiplier || 1;
      const earned = Math.floor(baseMiningPower * multiplier * 0.5); // 50% قدرت دستی
      
      const updatedUser = {
        ...user,
        sodBalance: (user.sodBalance || 0) + earned,
        todayEarned: (user.todayEarned || 0) + earned,
        totalMined: (user.totalMined || 0) + earned,
      };
      
      await updateUser(updatedUser);
      
      // ثبت تراکنش هر 5 استخراج
      if (Math.random() < 0.2) { // 20% شانس ثبت تراکنش
        await addTransaction({
          userId: user.id,
          type: 'استخراج خودکار',
          amount: earned * 5,
          currency: 'SOD',
          status: 'موفق',
          icon: 'robot',
          color: '#00D4AA',
        });
      }
      
      // به‌روزرسانی آمار
      if (miningStats) {
        const updatedStats = {
          ...miningStats,
          today: (miningStats.today || 0) + earned,
          total: (miningStats.total || 0) + earned,
          autoMiningTime: (miningStats.autoMiningTime || 0) + 5,
        };
        
        await saveUserMiningStats(updatedStats);
        setMiningStats(updatedStats);
      }
      
    } catch (error) {
      console.error('❌ خطا در استخراج خودکار:', error);
    }
  };

  // تغییر وضعیت استخراج خودکار
  const toggleAutoMining = async () => {
    if (!user) return false;
    
    try {
      const newAutoMiningState = !isAutoMining;
      setIsAutoMining(newAutoMiningState);
      
      await updateUser({ autoMining: newAutoMiningState });
      
      // ارسال نوتیفیکیشن
      if (newAutoMiningState) {
        await addNotification({
          userId: user.id,
          title: '🤖 استخراج خودکار',
          message: 'استخراج خودکار فعال شد! هر 5 ثانیه SOD دریافت می‌کنید.',
          type: 'mining',
        });
      }
      
      return newAutoMiningState;
    } catch (error) {
      console.error('❌ خطا در تغییر وضعیت استخراج خودکار:', error);
      return false;
    }
  };

  // فعال کردن بوست استخراج
  const activateMiningBoost = async () => {
    if (!user) return false;
    
    try {
      // بررسی موجودی برای خرید بوست
      const boostCost = 5000;
      if (user.sodBalance < boostCost) {
        throw new Error('موجودی SOD کافی نیست');
      }
      
      // کسر هزینه
      const updatedUser = {
        ...user,
        sodBalance: user.sodBalance - boostCost,
      };
      
      await updateUser(updatedUser);
      
      // فعال کردن بوست
      setMiningBoost(true);
      setMiningMultiplier(3);
      
      // ثبت تراکنش
      await addTransaction({
        userId: user.id,
        type: 'خرید بوست',
        amount: -boostCost,
        currency: 'SOD',
        status: 'موفق',
        icon: 'bolt',
        color: '#FF6B35',
      });
      
      // ارسال نوتیفیکیشن
      await addNotification({
        userId: user.id,
        title: '⚡ قدرت افزایش یافت',
        message: 'بوست استخراج فعال شد! قدرت شما 3 برابر شده است.',
        type: 'mining',
      });
      
      // تایمر برای غیرفعال کردن بوست
      setTimeout(() => {
        setMiningBoost(false);
        setMiningMultiplier(1);
        
        addNotification({
          userId: user.id,
          title: '⚡ بوست تمام شد',
          message: 'زمان بوست استخراج شما به پایان رسید.',
          type: 'mining',
        });
      }, 30000); // 30 ثانیه
      
      return true;
    } catch (error) {
      console.error('❌ خطا در فعال کردن بوست:', error);
      return false;
    }
  };

  // ارتقاء ماینر
  const upgradeMiner = async () => {
    if (!user) return false;
    
    try {
      const upgradeCost = 50000;
      if (user.sodBalance < upgradeCost) {
        throw new Error('موجودی SOD کافی نیست');
      }
      
      // کسر هزینه و ارتقاء
      const updatedUser = {
        ...user,
        sodBalance: user.sodBalance - upgradeCost,
        miningPower: (user.miningPower || 5) + 5,
        level: (user.level || 1) + 1,
      };
      
      await updateUser(updatedUser);
      
      // ثبت تراکنش
      await addTransaction({
        userId: user.id,
        type: 'ارتقاء ماینر',
        amount: -upgradeCost,
        currency: 'SOD',
        status: 'موفق',
        icon: 'arrow-up',
        color: '#FF6B35',
      });
      
      // ارسال نوتیفیکیشن
      await addNotification({
        userId: user.id,
        title: '🆙 ارتقاء موفق',
        message: `ماینر شما به سطح ${updatedUser.level} ارتقا یافت! قدرت +۵ افزایش یافت.`,
        type: 'mining',
      });
      
      // به‌روزرسانی آمار
      if (miningStats) {
        const updatedStats = {
          ...miningStats,
          upgrades: (miningStats.upgrades || 0) + 1,
        };
        
        await saveUserMiningStats(updatedStats);
        setMiningStats(updatedStats);
      }
      
      return true;
    } catch (error) {
      console.error('❌ خطا در ارتقاء ماینر:', error);
      return false;
    }
  };

  // ==================== توابع مأموریت‌ها ====================

  // تکمیل مأموریت
  const completeMission = async (missionId) => {
    if (!user || !missionData) return false;
    
    try {
      const mission = missionData.activeMissions.find(m => m.id === missionId);
      if (!mission) return false;
      
      // افزودن پاداش
      const updatedUser = {
        ...user,
        tomanBalance: (user.tomanBalance || 0) + mission.reward,
        totalEarned: (user.totalEarned || 0) + mission.reward,
        completedMissions: (user.completedMissions || 0) + 1,
      };
      
      await updateUser(updatedUser);
      
      // ثبت تراکنش
      await addTransaction({
        userId: user.id,
        type: 'پاداش مأموریت',
        amount: mission.reward,
        currency: 'تومان',
        status: 'موفق',
        icon: 'trophy',
        color: '#10B981',
      });
      
      // حذف مأموریت از لیست فعال
      const updatedMissions = missionData.activeMissions.filter(
        m => m.id !== missionId
      );
      
      const updatedMissionData = {
        ...missionData,
        activeMissions: updatedMissions,
        completedMissions: (missionData.completedMissions || 0) + 1,
      };
      
      await saveUserMissionData(updatedMissionData);
      setMissionData(updatedMissionData);
      
      // ارسال نوتیفیکیشن
      await addNotification({
        userId: user.id,
        title: '✅ مأموریت تکمیل شد',
        message: `مأموریت "${mission.name}" تکمیل شد! +${mission.reward} تومان دریافت کردید.`,
        type: 'mission',
      });
      
      return true;
    } catch (error) {
      console.error('❌ خطا در تکمیل مأموریت:', error);
      return false;
    }
  };

  // دریافت پاداش روزانه
  const claimDailyReward = async () => {
    if (!user || !missionData) return false;
    
    try {
      if (!missionData.dailyMission.available || missionData.dailyMission.claimed) {
        throw new Error('پاداش روزانه قبلاً دریافت شده است');
      }
      
      const reward = missionData.dailyMission.reward;
      
      // افزودن پاداش
      const updatedUser = {
        ...user,
        tomanBalance: (user.tomanBalance || 0) + reward,
        totalEarned: (user.totalEarned || 0) + reward,
      };
      
      await updateUser(updatedUser);
      
      // ثبت تراکنش
      await addTransaction({
        userId: user.id,
        type: 'پاداش روزانه',
        amount: reward,
        currency: 'تومان',
        status: 'موفق',
        icon: 'calendar',
        color: '#10B981',
      });
      
      // به‌روزرسانی مأموریت روزانه
      const updatedMissionData = {
        ...missionData,
        dailyMission: {
          ...missionData.dailyMission,
          claimed: true,
        },
      };
      
      await saveUserMissionData(updatedMissionData);
      setMissionData(updatedMissionData);
      
      // ارسال نوتیفیکیشن
      await addNotification({
        userId: user.id,
        title: '📅 پاداش روزانه',
        message: `پاداش روزانه دریافت شد! +${reward} تومان به کیف پول شما اضافه شد.`,
        type: 'reward',
      });
      
      return true;
    } catch (error) {
      console.error('❌ خطا در دریافت پاداش روزانه:', error);
      return false;
    }
  };

  // ==================== توابع کیف پول ====================

  // برداشت تومان
  const withdrawToman = async (amount) => {
    if (!user) return false;
    
    try {
      if (user.tomanBalance < amount) {
        throw new Error('موجودی تومان کافی نیست');
      }
      
      if (amount < 10000) {
        throw new Error('حداقل مبلغ برداشت ۱۰,۰۰۰ تومان است');
      }
      
      // کسر موجودی
      const updatedUser = {
        ...user,
        tomanBalance: user.tomanBalance - amount,
      };
      
      await updateUser(updatedUser);
      
      // ثبت تراکنش
      await addTransaction({
        userId: user.id,
        type: 'برداشت تومان',
        amount: amount,
        currency: 'تومان',
        status: 'در حال پردازش',
        icon: 'download',
        color: '#00D4AA',
      });
      
      // ارسال نوتیفیکیشن
      await addNotification({
        userId: user.id,
        title: '💰 درخواست برداشت',
        message: `درخواست برداشت ${formatNumber(amount)} تومان ثبت شد. طی 24 ساعت واریز خواهد شد.`,
        type: 'transaction',
      });
      
      return true;
    } catch (error) {
      console.error('❌ خطا در برداشت تومان:', error);
      return false;
    }
  };

  // ==================== توابع دعوت ====================

  // اضافه کردن دعوت جدید
  const addReferralInvite = async (inviteData) => {
    if (!user || !referrals) return false;
    
    try {
      const updatedReferrals = {
        ...referrals,
        totalInvites: referrals.totalInvites + 1,
        pendingInvites: referrals.pendingInvites + 1,
        history: [
          { id: Date.now(), ...inviteData, date: 'امروز', status: 'در انتظار', earned: 0 },
          ...(referrals.history || []),
        ],
      };
      
      await saveUserReferrals(updatedReferrals);
      setReferrals(updatedReferrals);
      
      // به‌روزرسانی کاربر
      const updatedUser = {
        ...user,
        referralCount: (user.referralCount || 0) + 1,
      };
      
      await updateUser(updatedUser);
      
      return true;
    } catch (error) {
      console.error('❌ خطا در افزودن دعوت:', error);
      return false;
    }
  };

  // تأیید دعوت
  const confirmReferral = async (inviteId) => {
    if (!user || !referrals) return false;
    
    try {
      const referralHistory = referrals.history || [];
      const inviteIndex = referralHistory.findIndex(invite => invite.id === inviteId);
      
      if (inviteIndex === -1) return false;
      
      // به‌روزرسانی وضعیت دعوت
      const updatedHistory = [...referralHistory];
      updatedHistory[inviteIndex] = {
        ...updatedHistory[inviteIndex],
        status: 'فعال',
        earned: 1000,
      };
      
      const updatedReferrals = {
        ...referrals,
        pendingInvites: referrals.pendingInvites - 1,
        activeInvites: referrals.activeInvites + 1,
        totalEarned: referrals.totalEarned + 1000,
        history: updatedHistory,
      };
      
      await saveUserReferrals(updatedReferrals);
      setReferrals(updatedReferrals);
      
      // افزودن پاداش به کاربر
      const updatedUser = {
        ...user,
        tomanBalance: (user.tomanBalance || 0) + 1000,
        totalEarned: (user.totalEarned || 0) + 1000,
        referralEarnings: (user.referralEarnings || 0) + 1000,
      };
      
      await updateUser(updatedUser);
      
      // ثبت تراکنش
      await addTransaction({
        userId: user.id,
        type: 'پاداش دعوت',
        amount: 1000,
        currency: 'تومان',
        status: 'موفق',
        icon: 'user-plus',
        color: '#00D4AA',
      });
      
      // ارسال نوتیفیکیشن
      await addNotification({
        userId: user.id,
        title: '🤝 دعوت موفق',
        message: `دوست شما ثبت‌نام و تأیید شد! +۱,۰۰۰ تومان پاداش دریافت کردید.`,
        type: 'referral',
      });
      
      return true;
    } catch (error) {
      console.error('❌ خطا در تأیید دعوت:', error);
      return false;
    }
  };

  // ==================== توابع نوتیفیکیشن ====================

  // علامت‌گذاری نوتیفیکیشن به عنوان خوانده شده
  const markNotificationAsReadFunc = async (notificationId) => {
    try {
      await markNotificationAsRead(notificationId);
      
      // به‌روزرسانی لیست محلی
      const updatedNotifications = notifications.map(notification => {
        if (notification.id === notificationId) {
          return { ...notification, read: true };
        }
        return notification;
      });
      
      setNotifications(updatedNotifications);
      setUnreadNotifications(prev => Math.max(0, prev - 1));
      
      return true;
    } catch (error) {
      console.error('❌ خطا در علامت‌گذاری نوتیفیکیشن:', error);
      return false;
    }
  };

  // ==================== توابع تنظیمات ====================

  // به‌روزرسانی تنظیمات
  const updateAppSettingsFunc = async (newSettings) => {
    try {
      await updateAppSettings(newSettings);
      setAppSettings(prev => ({ ...prev, ...newSettings }));
      return true;
    } catch (error) {
      console.error('❌ خطا در به‌روزرسانی تنظیمات:', error);
      return false;
    }
  };

  // ==================== توابع کمکی ====================

  // فرمت اعداد
  const formatNumberFunc = (num) => {
    return formatNumber(num);
  };

  // دریافت آواتار از نام
  const getAvatarFromName = (name) => {
    return name ? name.charAt(0) : 'ع';
  };

  // ارزش context
  const value = {
    // حالت‌ها
    user,
    isLoading,
    appSettings,
    notifications,
    unreadNotifications,
    transactions,
    referrals,
    missionData,
    miningStats,
    isMining,
    isAutoMining,
    miningBoost,
    miningMultiplier,
    
    // توابع کاربر
    loginUser,
    logoutUser,
    updateUser,
    
    // توابع استخراج
    handleManualMine,
    toggleAutoMining,
    activateMiningBoost,
    upgradeMiner,
    
    // توابع مأموریت‌ها
    completeMission,
    claimDailyReward,
    
    // توابع کیف پول
    withdrawToman,
    
    // توابع دعوت
    addReferralInvite,
    confirmReferral,
    
    // توابع نوتیفیکیشن
    markNotificationAsRead: markNotificationAsReadFunc,
    
    // توابع تنظیمات
    updateAppSettings: updateAppSettingsFunc,
    
    // توابع کمکی
    formatNumber: formatNumberFunc,
    getAvatarFromName,
    
    // تابع ری‌لود
    reloadAppData: loadAppData,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export default AppContext;
[file content end]
