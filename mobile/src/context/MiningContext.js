// mobile/src/context/MiningContext.js
import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext';
import { useToast } from './ToastContext';
import api from '../services/api';

const MiningContext = createContext();

export const useMining = () => useContext(MiningContext);

export const MiningProvider = ({ children }) => {
  const { user } = useAuth();
  const { showSuccess, showError, showInfo } = useToast();

  const [miningData, setMiningData] = useState({
    isMining: false,
    miningPower: 5,
    miningMultiplier: 1,
    miningBoost: 1,
    autoMining: false,
    totalMined: 0,
    todayMined: 0,
    boostEndTime: null,
    minerLevel: 1,
    minerUpgradeCost: 10000,
    nextLevelPower: 10,
  });

  const [miningStats, setMiningStats] = useState({
    hourlyRate: 0,
    dailyRate: 0,
    weeklyRate: 0,
    totalEarned: 0,
    efficiency: 100,
    uptime: 0,
  });

  const [miningHistory, setMiningHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  // بارگذاری داده‌های استخراج
  const loadMiningData = useCallback(async () => {
    if (!user) return;

    try {
      setIsLoading(true);
      
      const [statsRes, historyRes] = await Promise.all([
        api.mining.getMiningStats(user.id),
        api.mining.getMiningHistory(user.id, 20),
      ]);

      if (statsRes.success) {
        setMiningData(prev => ({
          ...prev,
          ...statsRes.data,
        }));
        setMiningStats(statsRes.data.stats || {});
      }

      if (historyRes.success) {
        setMiningHistory(historyRes.data);
      }
    } catch (error) {
      console.error('Error loading mining data:', error);
      showError('خطا در بارگذاری اطلاعات استخراج');
    } finally {
      setIsLoading(false);
    }
  }, [user, showError]);

  // استخراج دستی
  const manualMine = useCallback(async () => {
    if (!user) {
      showError('لطفاً ابتدا وارد شوید');
      return;
    }

    try {
      const response = await api.mining.manualMine(user.id);
      
      if (response.success) {
        const earned = response.data.earned;
        
        setMiningData(prev => ({
          ...prev,
          totalMined: prev.totalMined + earned,
          todayMined: prev.todayMined + earned,
        }));

        // اضافه کردن به تاریخچه
        setMiningHistory(prev => [{
          id: Date.now(),
          type: 'manual',
          amount: earned,
          timestamp: new Date().toISOString(),
          description: 'استخراج دستی',
        }, ...prev.slice(0, 19)]);

        showSuccess(`+${earned} SOD استخراج شد!`);
        
        // بازگرداندن نتیجه برای افکت‌ها
        return earned;
      } else {
        showError(response.message || 'خطا در استخراج');
      }
    } catch (error) {
      console.error('Error in manual mining:', error);
      showError('خطا در استخراج');
    }
  }, [user, showSuccess, showError]);

  // شروع استخراج خودکار
  const startAutoMining = useCallback(async () => {
    if (!user) return;

    try {
      const response = await api.mining.startAutoMining(user.id);
      
      if (response.success) {
        setMiningData(prev => ({
          ...prev,
          autoMining: true,
        }));
        showSuccess('استخراج خودکار شروع شد!');
        return true;
      } else {
        showError(response.message || 'خطا در شروع استخراج خودکار');
        return false;
      }
    } catch (error) {
      console.error('Error starting auto mining:', error);
      showError('خطا در شروع استخراج خودکار');
      return false;
    }
  }, [user, showSuccess, showError]);

  // توقف استخراج خودکار
  const stopAutoMining = useCallback(async () => {
    if (!user) return;

    try {
      const response = await api.mining.stopAutoMining(user.id);
      
      if (response.success) {
        setMiningData(prev => ({
          ...prev,
          autoMining: false,
        }));
        showInfo('استخراج خودکار متوقف شد');
        return true;
      } else {
        showError(response.message || 'خطا در توقف استخراج خودکار');
        return false;
      }
    } catch (error) {
      console.error('Error stopping auto mining:', error);
      showError('خطا در توقف استخراج خودکار');
      return false;
    }
  }, [user, showInfo, showError]);

  // خرید بوست
  const buyBoost = useCallback(async (boostType = 'standard') => {
    if (!user) return;

    try {
      const response = await api.mining.buyBoost(user.id, boostType);
      
      if (response.success) {
        const { multiplier, duration } = response.data;
        
        setMiningData(prev => ({
          ...prev,
          miningMultiplier: multiplier,
          miningBoost: multiplier,
          boostEndTime: Date.now() + duration * 1000,
        }));

        // شروع تایمر بوست
        setTimeout(() => {
          setMiningData(prev => ({
            ...prev,
            miningMultiplier: 1,
            miningBoost: 1,
            boostEndTime: null,
          }));
          showInfo('افزایش قدرت استخراج به پایان رسید');
        }, duration * 1000);

        showSuccess(`افزایش قدرت ${multiplier}x فعال شد! (${duration} ثانیه)`);
        return true;
      } else {
        showError(response.message || 'خطا در خرید افزایش قدرت');
        return false;
      }
    } catch (error) {
      console.error('Error buying boost:', error);
      showError('خطا در خرید افزایش قدرت');
      return false;
    }
  }, [user, showSuccess, showError, showInfo]);

  // ارتقاء ماینر
  const upgradeMiner = useCallback(async () => {
    if (!user) return;

    try {
      const response = await api.mining.upgradeMiner(user.id);
      
      if (response.success) {
        const { newLevel, newPower, newCost } = response.data;
        
        setMiningData(prev => ({
          ...prev,
          minerLevel: newLevel,
          miningPower: newPower,
          minerUpgradeCost: newCost,
          nextLevelPower: newPower + 5,
        }));

        showSuccess(`ماینر به سطح ${newLevel} ارتقا یافت! قدرت +۵ افزایش یافت`);
        return true;
      } else {
        showError(response.message || 'خطا در ارتقاء ماینر');
        return false;
      }
    } catch (error) {
      console.error('Error upgrading miner:', error);
      showError('خطا در ارتقاء ماینر');
      return false;
    }
  }, [user, showSuccess, showError]);

  // دریافت قدرت استخراج
  const getMiningPower = useCallback(() => {
    return miningData.miningPower * miningData.miningMultiplier;
  }, [miningData.miningPower, miningData.miningMultiplier]);

  // دریافت سود ساعتی تخمینی
  const getHourlyEarnings = useCallback(() => {
    const basePower = miningData.miningPower;
    const multiplier = miningData.miningMultiplier;
    const efficiency = miningStats.efficiency / 100;
    
    return Math.floor(basePower * multiplier * efficiency * 3600);
  }, [miningData.miningPower, miningData.miningMultiplier, miningStats.efficiency]);

  // دریافت زمان باقی‌مانده بوست
  const getBoostTimeRemaining = useCallback(() => {
    if (!miningData.boostEndTime) return 0;
    
    const remaining = miningData.boostEndTime - Date.now();
    return Math.max(0, Math.floor(remaining / 1000));
  }, [miningData.boostEndTime]);

  // فرمت کردن زمان
  const formatBoostTime = useCallback((seconds) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }, []);

  // شبیه‌سازی استخراج خودکار (برای توسعه)
  const simulateAutoMining = useCallback(() => {
    if (!miningData.autoMining) return;

    const interval = setInterval(() => {
      const earned = Math.floor(miningData.miningPower * miningData.miningMultiplier * 0.1);
      
      if (earned > 0) {
        setMiningData(prev => ({
          ...prev,
          totalMined: prev.totalMined + earned,
          todayMined: prev.todayMined + earned,
        }));

        // اضافه کردن به تاریخچه
        setMiningHistory(prev => [{
          id: Date.now(),
          type: 'auto',
          amount: earned,
          timestamp: new Date().toISOString(),
          description: 'استخراج خودکار',
        }, ...prev.slice(0, 19)]);
      }
    }, 10000); // هر 10 ثانیه

    return () => clearInterval(interval);
  }, [miningData.autoMining, miningData.miningPower, miningData.miningMultiplier]);

  // شبیه‌سازی تایمر بوست
  const simulateBoostTimer = useCallback(() => {
    if (!miningData.boostEndTime) return;

    const interval = setInterval(() => {
      const remaining = getBoostTimeRemaining();
      
      if (remaining <= 0) {
        setMiningData(prev => ({
          ...prev,
          miningMultiplier: 1,
          miningBoost: 1,
          boostEndTime: null,
        }));
        clearInterval(interval);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [miningData.boostEndTime, getBoostTimeRemaining]);

  // بارگذاری اولیه و تنظیمات
  useEffect(() => {
    if (user) {
      loadMiningData();
    }
  }, [user, loadMiningData]);

  // تنظیم تایمرها
  useEffect(() => {
    const autoMiningCleanup = simulateAutoMining();
    const boostTimerCleanup = simulateBoostTimer();

    return () => {
      if (autoMiningCleanup) autoMiningCleanup();
      if (boostTimerCleanup) boostTimerCleanup();
    };
  }, [simulateAutoMining, simulateBoostTimer]);

  const value = {
    miningData,
    miningStats,
    miningHistory,
    isLoading,
    loadMiningData,
    manualMine,
    startAutoMining,
    stopAutoMining,
    buyBoost,
    upgradeMiner,
    getMiningPower,
    getHourlyEarnings,
    getBoostTimeRemaining,
    formatBoostTime,
  };

  return (
    <MiningContext.Provider value={value}>
      {children}
    </MiningContext.Provider>
  );
};

// هوک برای دسترسی آسان به قدرت استخراج
export const useMiningPower = () => {
  const { getMiningPower } = useMining();
  return getMiningPower();
};

// هوک برای دسترسی آسان به سود ساعتی
export const useHourlyEarnings = () => {
  const { getHourlyEarnings } = useMining();
  return getHourlyEarnings();
};

// هوک برای دسترسی آسان به زمان بوست
export const useBoostTimer = () => {
  const { getBoostTimeRemaining, formatBoostTime } = useMining();
  const remaining = getBoostTimeRemaining();
  
  return {
    remaining,
    formatted: formatBoostTime(remaining),
    isActive: remaining > 0,
  };
};

export default MiningContext;
