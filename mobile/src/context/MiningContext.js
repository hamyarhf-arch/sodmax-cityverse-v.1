import React, { createContext, useState, useContext, useEffect, useRef } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AppState, Vibration } from 'react-native';

// Services
import api from '../services/api';
import { useAuth } from './AuthContext';
import { useToast } from './ToastContext';
import { useWallet } from './WalletContext';

const MiningContext = createContext();

export const useMining = () => {
  const context = useContext(MiningContext);
  if (!context) {
    throw new Error('useMining must be used within a MiningProvider');
  }
  return context;
};

export const MiningProvider = ({ children }) => {
  const { user, token, isAuthenticated } = useAuth();
  const { wallet, refreshWallet } = useWallet();
  const toast = useToast();

  // State
  const [miningStats, setMiningStats] = useState({
    level: 1,
    power: 5,
    rewardPerClick: 5,
    totalMined: 0,
    todayEarned: 0,
    multiplier: 1,
    efficiency: 1,
  });
  
  const [autoMining, setAutoMining] = useState(false);
  const [boostActive, setBoostActive] = useState(false);
  const [boostEndTime, setBoostEndTime] = useState(null);
  const [miningHistory, setMiningHistory] = useState([]);
  const [isMining, setIsMining] = useState(false);
  const [upgrades, setUpgrades] = useState([]);

  // Refs
  const autoMiningInterval = useRef(null);
  const boostTimerInterval = useRef(null);
  const appState = useRef(AppState.currentState);

  useEffect(() => {
    if (isAuthenticated && user) {
      loadMiningData();
      
      // Restore auto mining if it was active
      restoreAutoMining();
    }

    // Setup app state listener
    const subscription = AppState.addEventListener('change', handleAppStateChange);

    return () => {
      // Cleanup
      stopAutoMining();
      stopBoostTimer();
      subscription.remove();
    };
  }, [isAuthenticated, user]);

  useEffect(() => {
    // Check and update boost status
    if (boostActive && boostEndTime) {
      const now = Date.now();
      if (now >= boostEndTime) {
        deactivateBoost();
      }
    }
  }, [boostActive, boostEndTime]);

  const loadMiningData = async () => {
    try {
      // Load from cache
      const cachedStats = await AsyncStorage.getItem('sodmax_mining_stats');
      const cachedHistory = await AsyncStorage.getItem('sodmax_mining_history');
      const cachedUpgrades = await AsyncStorage.getItem('sodmax_mining_upgrades');
      const cachedAutoMining = await AsyncStorage.getItem('sodmax_auto_mining');
      const cachedBoost = await AsyncStorage.getItem('sodmax_boost_active');

      if (cachedStats) {
        setMiningStats(JSON.parse(cachedStats));
      }

      if (cachedHistory) {
        setMiningHistory(JSON.parse(cachedHistory));
      }

      if (cachedUpgrades) {
        setUpgrades(JSON.parse(cachedUpgrades));
      }

      if (cachedAutoMining === 'true') {
        setAutoMining(true);
      }

      if (cachedBoost) {
        const boostData = JSON.parse(cachedBoost);
        if (boostData.active && boostData.endTime > Date.now()) {
          setBoostActive(true);
          setBoostEndTime(boostData.endTime);
          startBoostTimer(boostData.endTime);
        }
      }

      // Then fetch from API
      await refreshMiningData();
      
    } catch (error) {
      console.error('Error loading mining data:', error);
    }
  };

  const refreshMiningData = async () => {
    try {
      const [statsResponse, upgradesResponse] = await Promise.all([
        api.get('/mining/stats'),
        api.get('/mining/upgrades'),
      ]);

      if (statsResponse.success) {
        setMiningStats(statsResponse.data);
        await AsyncStorage.setItem('sodmax_mining_stats', JSON.stringify(statsResponse.data));
      }

      if (upgradesResponse.success) {
        setUpgrades(upgradesResponse.data.upgrades);
        await AsyncStorage.setItem('sodmax_mining_upgrades', JSON.stringify(upgradesResponse.data.upgrades));
      }
    } catch (error) {
      console.error('Error refreshing mining data:', error);
    }
  };

  const restoreAutoMining = async () => {
    try {
      const wasActive = await AsyncStorage.getItem('sodmax_auto_mining');
      if (wasActive === 'true' && isAuthenticated) {
        startAutoMining();
      }
    } catch (error) {
      console.error('Error restoring auto mining:', error);
    }
  };

  const manualMine = async () => {
    if (isMining) return 0;

    try {
      setIsMining(true);
      
      // Calculate reward
      const baseReward = miningStats.power;
      const multiplier = boostActive ? 3 : miningStats.multiplier;
      const efficiency = miningStats.efficiency;
      const reward = Math.floor(baseReward * multiplier * efficiency);

      // Simulate API call
      const response = await api.post('/mining/mine', {
        amount: reward,
        boost: boostActive,
        timestamp: Date.now(),
      });

      if (response.success) {
        // Update stats
        const newStats = {
          ...miningStats,
          totalMined: miningStats.totalMined + reward,
          todayEarned: miningStats.todayEarned + reward,
        };

        setMiningStats(newStats);
        await AsyncStorage.setItem('sodmax_mining_stats', JSON.stringify(newStats));

        // Add to history
        const newHistory = [
          {
            id: Date.now(),
            amount: reward,
            type: 'manual',
            boost: boostActive,
            timestamp: Date.now(),
            date: new Date().toLocaleString('fa-IR'),
          },
          ...miningHistory.slice(0, 49), // Keep last 50 items
        ];

        setMiningHistory(newHistory);
        await AsyncStorage.setItem('sodmax_mining_history', JSON.stringify(newHistory));

        // Update wallet (simulated)
        // In real app, this would come from API response
        await refreshWallet();

        // Vibration feedback
        Vibration.vibrate([50, 30, 50]);

        toast.success('استخراج موفق', `+${reward} SOD دریافت کردید!`);
        
        return reward;
      } else {
        throw new Error(response.message || 'خطا در استخراج');
      }
    } catch (error) {
      console.error('Manual mine error:', error);
      toast.error('خطا در استخراج', error.message || 'خطا در انجام عملیات');
      return 0;
    } finally {
      setIsMining(false);
    }
  };

  const toggleAutoMining = async () => {
    if (autoMining) {
      stopAutoMining();
      await AsyncStorage.setItem('sodmax_auto_mining', 'false');
      toast.info('استخراج خودکار متوقف شد');
    } else {
      startAutoMining();
      await AsyncStorage.setItem('sodmax_auto_mining', 'true');
      toast.success('استخراج خودکار فعال شد');
    }
  };

  const startAutoMining = () => {
    if (autoMiningInterval.current) {
      clearInterval(autoMiningInterval.current);
    }

    setAutoMining(true);
    
    autoMiningInterval.current = setInterval(async () => {
      if (!isAuthenticated) {
        stopAutoMining();
        return;
      }

      try {
        const reward = miningStats.power * miningStats.efficiency * (boostActive ? 3 : miningStats.multiplier);
        
        // Simulate auto mining
        const response = await api.post('/mining/auto-mine', {
          amount: reward,
          interval: 5000,
          boost: boostActive,
        });

        if (response.success) {
          // Update stats
          const newStats = {
            ...miningStats,
            totalMined: miningStats.totalMined + reward,
            todayEarned: miningStats.todayEarned + reward,
          };

          setMiningStats(newStats);
          await AsyncStorage.setItem('sodmax_mining_stats', JSON.stringify(newStats));

          // Update wallet periodically
          if (Date.now() % 30000 === 0) { // Every 30 seconds
            await refreshWallet();
          }
        }
      } catch (error) {
        console.error('Auto mining error:', error);
        stopAutoMining();
      }
    }, 5000); // Every 5 seconds
  };

  const stopAutoMining = () => {
    if (autoMiningInterval.current) {
      clearInterval(autoMiningInterval.current);
      autoMiningInterval.current = null;
    }
    setAutoMining(false);
  };

  const boostMining = async () => {
    if (boostActive) {
      toast.info('افزایش قدرت در حال حاضر فعال است');
      return;
    }

    try {
      const cost = 5000; // SOD cost for boost
      
      if (wallet.SOD < cost) {
        toast.error('موجودی SOD کافی نیست');
        return;
      }

      const response = await api.post('/mining/boost', {
        duration: 30000, // 30 seconds
        cost,
      });

      if (response.success) {
        // Activate boost
        const endTime = Date.now() + 30000;
        setBoostActive(true);
        setBoostEndTime(endTime);
        
        // Start boost timer
        startBoostTimer(endTime);

        // Save boost state
        const boostData = {
          active: true,
          endTime,
          activatedAt: Date.now(),
        };
        
        await AsyncStorage.setItem('sodmax_boost_active', JSON.stringify(boostData));

        // Update wallet (deduct cost)
        // In real app, this would come from API response
        await refreshWallet();

        toast.success('افزایش قدرت فعال شد!', 'استخراج ۳ برابر شد (۳۰ ثانیه)');
        return true;
      } else {
        throw new Error(response.message || 'خطا در فعال‌سازی افزایش قدرت');
      }
    } catch (error) {
      console.error('Boost mining error:', error);
      toast.error('خطا در افزایش قدرت', error.message || 'خطا در انجام عملیات');
      return false;
    }
  };

  const deactivateBoost = () => {
    setBoostActive(false);
    setBoostEndTime(null);
    stopBoostTimer();
    
    AsyncStorage.removeItem('sodmax_boost_active');
    toast.info('افزایش قدرت به پایان رسید');
  };

  const startBoostTimer = (endTime) => {
    if (boostTimerInterval.current) {
      clearInterval(boostTimerInterval.current);
    }

    boostTimerInterval.current = setInterval(() => {
      const now = Date.now();
      if (now >= endTime) {
        deactivateBoost();
      }
    }, 1000);
  };

  const stopBoostTimer = () => {
    if (boostTimerInterval.current) {
      clearInterval(boostTimerInterval.current);
      boostTimerInterval.current = null;
    }
  };

  const upgradeMiner = async (upgradeId = null) => {
    try {
      let upgrade;
      
      if (upgradeId) {
        upgrade = upgrades.find(u => u.id === upgradeId);
        if (!upgrade) {
          throw new Error('ارتقاء یافت نشد');
        }
      }

      const cost = upgrade ? upgrade.cost : 50000; // Default cost
      
      if (wallet.SOD < cost) {
        throw new Error('موجودی SOD کافی نیست');
      }

      const response = await api.post('/mining/upgrade', {
        upgradeId,
        cost,
      });

      if (response.success) {
        // Update mining stats
        const newStats = {
          ...miningStats,
          level: miningStats.level + 1,
          power: miningStats.power + (upgrade?.powerBonus || 5),
          rewardPerClick: miningStats.rewardPerClick + (upgrade?.rewardBonus || 1),
        };

        setMiningStats(newStats);
        await AsyncStorage.setItem('sodmax_mining_stats', JSON.stringify(newStats));

        // Update upgrades list
        if (upgrade) {
          const newUpgrades = upgrades.map(u => 
            u.id === upgradeId 
              ? { ...u, level: u.level + 1, cost: Math.floor(u.cost * 1.5) }
              : u
          );
          
          setUpgrades(newUpgrades);
          await AsyncStorage.setItem('sodmax_mining_upgrades', JSON.stringify(newUpgrades));
        }

        // Update wallet (deduct cost)
        await refreshWallet();

        toast.success('ارتقاء موفق', `سطح ماینر به ${newStats.level} ارتقا یافت!`);
        return true;
      } else {
        throw new Error(response.message || 'خطا در ارتقاء ماینر');
      }
    } catch (error) {
      console.error('Upgrade miner error:', error);
      toast.error('خطا در ارتقاء', error.message || 'خطا در انجام عملیات');
      return false;
    }
  };

  const getMiningEfficiency = () => {
    // Calculate efficiency based on upgrades and level
    let efficiency = 1;
    
    upgrades.forEach(upgrade => {
      if (upgrade.efficiencyBonus) {
        efficiency += upgrade.efficiencyBonus * upgrade.level;
      }
    });
    
    return Math.min(efficiency, 2); // Max 200% efficiency
  };

  const resetDailyEarnings = async () => {
    try {
      const response = await api.post('/mining/reset-daily');
      
      if (response.success) {
        const newStats = {
          ...miningStats,
          todayEarned: 0,
        };
        
        setMiningStats(newStats);
        await AsyncStorage.setItem('sodmax_mining_stats', JSON.stringify(newStats));
        
        return true;
      }
    } catch (error) {
      console.error('Error resetting daily earnings:', error);
      return false;
    }
  };

  const handleAppStateChange = (nextAppState) => {
    if (appState.current.match(/inactive|background/) && nextAppState === 'active') {
      // App came to foreground
      if (autoMining) {
        // Sync mining data
        refreshMiningData();
        refreshWallet();
      }
      
      // Check if boost expired while app was in background
      if (boostActive && boostEndTime && Date.now() >= boostEndTime) {
        deactivateBoost();
      }
    } else if (nextAppState.match(/inactive|background/)) {
      // App going to background
      // Save current state
      saveMiningState();
    }
    
    appState.current = nextAppState;
  };

  const saveMiningState = async () => {
    try {
      await AsyncStorage.multiSet([
        ['sodmax_mining_stats', JSON.stringify(miningStats)],
        ['sodmax_mining_history', JSON.stringify(miningHistory)],
        ['sodmax_mining_upgrades', JSON.stringify(upgrades)],
        ['sodmax_auto_mining', autoMining ? 'true' : 'false'],
        ['sodmax_boost_active', JSON.stringify({
          active: boostActive,
          endTime: boostEndTime,
        })],
      ]);
    } catch (error) {
      console.error('Error saving mining state:', error);
    }
  };

  const value = {
    miningStats,
    autoMining,
    boostActive,
    miningHistory,
    upgrades,
    isMining,
    manualMine,
    toggleAutoMining,
    boostMining,
    upgradeMiner,
    refreshMiningData,
    getMiningEfficiency,
    resetDailyEarnings,
  };

  return (
    <MiningContext.Provider value={value}>
      {children}
    </MiningContext.Provider>
  );
};

export default MiningContext;
