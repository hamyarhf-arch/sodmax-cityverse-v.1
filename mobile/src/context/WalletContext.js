// mobile/src/context/WalletContext.js
import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext';
import { useToast } from './ToastContext';
import api from '../services/api';

const WalletContext = createContext();

export const useWallet = () => useContext(WalletContext);

export const WalletProvider = ({ children }) => {
  const { user } = useAuth();
  const { showSuccess, showError, showInfo } = useToast();

  const [balances, setBalances] = useState({
    sod: 0,
    toman: 0,
    usdt: 0,
    total: 0,
  });

  const [transactions, setTransactions] = useState([]);
  const [walletStats, setWalletStats] = useState({
    totalEarned: 0,
    totalWithdrawn: 0,
    pendingWithdrawals: 0,
    conversionRate: 1,
  });

  const [addresses, setAddresses] = useState({
    sod: '',
    toman: '',
    usdt: '',
  });

  const [isLoading, setIsLoading] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  // بارگذاری داده‌های کیف پول
  const loadWalletData = useCallback(async () => {
    if (!user) return;

    try {
      setIsLoading(true);
      
      const [balanceRes, transactionsRes, statsRes, addressesRes] = await Promise.all([
        api.wallet.getBalance(user.id),
        api.wallet.getTransactionHistory(user.id, 20, 0),
        api.wallet.getStats(user.id),
        api.wallet.getWalletAddresses(user.id),
      ]);

      if (balanceRes.success) {
        setBalances(balanceRes.data);
      }

      if (transactionsRes.success) {
        setTransactions(transactionsRes.data);
      }

      if (statsRes.success) {
        setWalletStats(statsRes.data);
      }

      if (addressesRes.success) {
        setAddresses(addressesRes.data);
      }
    } catch (error) {
      console.error('Error loading wallet data:', error);
      showError('خطا در بارگذاری اطلاعات کیف پول');
    } finally {
      setIsLoading(false);
    }
  }, [user, showError]);

  // اضافه کردن موجودی
  const addBalance = useCallback((currency, amount) => {
    setBalances(prev => ({
      ...prev,
      [currency]: (prev[currency] || 0) + amount,
      total: prev.total + amount,
    }));

    // ثبت تراکنش
    const transaction = {
      id: Date.now(),
      type: 'افزایش موجودی',
      amount,
      currency,
      status: 'موفق',
      timestamp: new Date().toISOString(),
      description: `افزایش موجودی ${currency.toUpperCase()}`,
    };

    setTransactions(prev => [transaction, ...prev]);
  }, []);

  // کسر موجودی
  const deductBalance = useCallback((currency, amount) => {
    setBalances(prev => {
      const currentBalance = prev[currency] || 0;
      
      if (currentBalance < amount) {
        showError('موجودی کافی نیست');
        return prev;
      }

      return {
        ...prev,
        [currency]: currentBalance - amount,
        total: prev.total - amount,
      };
    });

    // ثبت تراکنش
    const transaction = {
      id: Date.now(),
      type: 'برداشت',
      amount: -amount,
      currency,
      status: 'موفق',
      timestamp: new Date().toISOString(),
      description: `برداشت ${currency.toUpperCase()}`,
    };

    setTransactions(prev => [transaction, ...prev]);
    return true;
  }, [showError]);

  // درخواست برداشت
  const requestWithdrawal = useCallback(async (currency, amount, address) => {
    if (!user) {
      showError('لطفاً ابتدا وارد شوید');
      return false;
    }

    // اعتبارسنجی موجودی
    const currentBalance = balances[currency] || 0;
    if (currentBalance < amount) {
      showError('موجودی کافی نیست');
      return false;
    }

    // اعتبارسنجی حداقل برداشت
    const minWithdrawal = {
      sod: 1000,
      toman: 10000,
      usdt: 10,
    };

    if (amount < minWithdrawal[currency]) {
      showError(`حداقل مبلغ برداشت ${minWithdrawal[currency]} ${currency.toUpperCase()} است`);
      return false;
    }

    setIsProcessing(true);

    try {
      const response = await api.wallet.withdraw(user.id, amount, currency, address);
      
      if (response.success) {
        // کسر از موجودی
        deductBalance(currency, amount);

        // به‌روزرسانی آمار
        setWalletStats(prev => ({
          ...prev,
          pendingWithdrawals: prev.pendingWithdrawals + amount,
          totalWithdrawn: prev.totalWithdrawn + amount,
        }));

        showSuccess(
          `درخواست برداشت ${amount.toLocaleString('fa-IR')} ${currency.toUpperCase()} ثبت شد. ` +
          `طی ۲۴ ساعت کاری واریز خواهد شد.`
        );

        return {
          success: true,
          withdrawalId: response.data.withdrawalId,
        };
      } else {
        showError(response.message || 'خطا در ثبت درخواست برداشت');
        return { success: false };
      }
    } catch (error) {
      console.error('Error requesting withdrawal:', error);
      showError('خطا در ثبت درخواست برداشت');
      return { success: false };
    } finally {
      setIsProcessing(false);
    }
  }, [user, balances, deductBalance, showSuccess, showError]);

  // خرید SOD
  const buySod = useCallback(async (amount, paymentMethod = 'toman') => {
    if (!user) {
      showError('لطفاً ابتدا وارد شوید');
      return false;
    }

    // اعتبارسنجی موجودی تومان
    if (paymentMethod === 'toman' && balances.toman < amount) {
      showError('موجودی تومان کافی نیست');
      return false;
    }

    setIsProcessing(true);

    try {
      const response = await api.wallet.buySod(user.id, amount, paymentMethod);
      
      if (response.success) {
        const { sodReceived, amountPaid } = response.data;

        // کسر از تومان و اضافه به SOD
        if (paymentMethod === 'toman') {
          deductBalance('toman', amountPaid);
        }
        
        addBalance('sod', sodReceived);

        showSuccess(
          `${sodReceived.toLocaleString('fa-IR')} SOD خریداری شد! ` +
          `مبلغ پرداختی: ${amountPaid.toLocaleString('fa-IR')} ${paymentMethod === 'toman' ? 'تومان' : 'USDT'}`
        );

        return { success: true, sodReceived };
      } else {
        showError(response.message || 'خطا در خرید SOD');
        return { success: false };
      }
    } catch (error) {
      console.error('Error buying SOD:', error);
      showError('خطا در خرید SOD');
      return { success: false };
    } finally {
      setIsProcessing(false);
    }
  }, [user, balances.toman, deductBalance, addBalance, showSuccess, showError]);

  // تبدیل ارز
  const convertCurrency = useCallback(async (fromCurrency, toCurrency, amount) => {
    if (!user) {
      showError('لطفاً ابتدا وارد شوید');
      return false;
    }

    // اعتبارسنجی موجودی
    const currentBalance = balances[fromCurrency] || 0;
    if (currentBalance < amount) {
      showError('موجودی کافی نیست');
      return false;
    }

    // اعتبارسنجی حداقل تبدیل
    const minConversion = {
      sod: 100,
      toman: 1000,
      usdt: 1,
    };

    if (amount < minConversion[fromCurrency]) {
      showError(`حداقل مبلغ تبدیل ${minConversion[fromCurrency]} ${fromCurrency.toUpperCase()} است`);
      return false;
    }

    setIsProcessing(true);

    try {
      const response = await api.wallet.convertCurrency(user.id, fromCurrency, toCurrency, amount);
      
      if (response.success) {
        const { convertedAmount, rate } = response.data;

        // کسر از ارز مبدا و اضافه به ارز مقصد
        deductBalance(fromCurrency, amount);
        addBalance(toCurrency, convertedAmount);

        showSuccess(
          `${amount.toLocaleString('fa-IR')} ${fromCurrency.toUpperCase()} ` +
          `به ${convertedAmount.toLocaleString('fa-IR')} ${toCurrency.toUpperCase()} ` +
          `تبدیل شد. نرخ: ${rate}`
        );

        return { success: true, convertedAmount, rate };
      } else {
        showError(response.message || 'خطا در تبدیل ارز');
        return { success: false };
      }
    } catch (error) {
      console.error('Error converting currency:', error);
      showError('خطا در تبدیل ارز');
      return { success: false };
    } finally {
      setIsProcessing(false);
    }
  }, [user, balances, deductBalance, addBalance, showSuccess, showError]);

  // اضافه کردن آدرس کیف پول
  const addWalletAddress = useCallback(async (currency, address, network) => {
    if (!user) {
      showError('لطفاً ابتدا وارد شوید');
      return false;
    }

    // اعتبارسنجی آدرس
    if (!address.trim()) {
      showError('لطفاً آدرس کیف پول را وارد کنید');
      return false;
    }

    setIsProcessing(true);

    try {
      const response = await api.wallet.addWalletAddress(user.id, currency, address, network);
      
      if (response.success) {
        setAddresses(prev => ({
          ...prev,
          [currency]: address,
        }));

        showSuccess('آدرس کیف پول با موفقیت اضافه شد');
        return { success: true };
      } else {
        showError(response.message || 'خطا در اضافه کردن آدرس کیف پول');
        return { success: false };
      }
    } catch (error) {
      console.error('Error adding wallet address:', error);
      showError('خطا در اضافه کردن آدرس کیف پول');
      return { success: false };
    } finally {
      setIsProcessing(false);
    }
  }, [user, showSuccess, showError]);

  // بررسی وضعیت برداشت
  const checkWithdrawalStatus = useCallback(async (withdrawalId) => {
    if (!user || !withdrawalId) return null;

    try {
      const response = await api.wallet.getWithdrawalStatus(user.id, withdrawalId);
      return response;
    } catch (error) {
      console.error('Error checking withdrawal status:', error);
      return null;
    }
  }, [user]);

  // دریافت کل موجودی به تومان
  const getTotalBalanceInToman = useCallback(() => {
    const { sod, toman, usdt } = balances;
    const { conversionRate } = walletStats;

    const sodInToman = sod * conversionRate;
    const usdtInToman = usdt * conversionRate * 50000; // فرض: هر USDT = 50,000 تومان
    
    return sodInToman + toman + usdtInToman;
  }, [balances, walletStats.conversionRate]);

  // فرمت موجودی
  const formatBalance = useCallback((amount, currency) => {
    const formatted = amount.toLocaleString('fa-IR');
    
    switch (currency) {
      case 'sod':
        return `${formatted} SOD`;
      case 'toman':
        return `${formatted} تومان`;
      case 'usdt':
        return `${formatted} USDT`;
      default:
        return formatted;
    }
  }, []);

  // فیلتر تراکنش‌ها
  const filterTransactions = useCallback((filters = {}) => {
    let filtered = [...transactions];

    if (filters.type) {
      filtered = filtered.filter(t => t.type === filters.type);
    }

    if (filters.currency) {
      filtered = filtered.filter(t => t.currency === filters.currency);
    }

    if (filters.status) {
      filtered = filtered.filter(t => t.status === filters.status);
    }

    if (filters.startDate) {
      filtered = filtered.filter(t => new Date(t.timestamp) >= new Date(filters.startDate));
    }

    if (filters.endDate) {
      filtered = filtered.filter(t => new Date(t.timestamp) <= new Date(filters.endDate));
    }

    return filtered;
  }, [transactions]);

  // بارگذاری اولیه
  useEffect(() => {
    if (user) {
      loadWalletData();
    }
  }, [user, loadWalletData]);

  // رفرش خودکار هر 30 ثانیه
  useEffect(() => {
    if (!user) return;

    const interval = setInterval(() => {
      loadWalletData();
    }, 30000);

    return () => clearInterval(interval);
  }, [user, loadWalletData]);

  const value = {
    balances,
    transactions,
    walletStats,
    addresses,
    isLoading,
    isProcessing,
    loadWalletData,
    addBalance,
    deductBalance,
    requestWithdrawal,
    buySod,
    convertCurrency,
    addWalletAddress,
    checkWithdrawalStatus,
    getTotalBalanceInToman,
    formatBalance,
    filterTransactions,
  };

  return (
    <WalletContext.Provider value={value}>
      {children}
    </WalletContext.Provider>
  );
};

// هوک برای دسترسی آسان به موجودی
export const useBalance = (currency) => {
  const { balances, formatBalance } = useWallet();
  const balance = balances[currency] || 0;
  
  return {
    raw: balance,
    formatted: formatBalance(balance, currency),
    isZero: balance === 0,
  };
};

// هوک برای دسترسی آسان به کل موجودی
export const useTotalBalance = () => {
  const { getTotalBalanceInToman } = useWallet();
  const total = getTotalBalanceInToman();
  
  return {
    raw: total,
    formatted: total.toLocaleString('fa-IR') + ' تومان',
  };
};

// هوک برای دسترسی آسان به تراکنش‌ها
export const useFilteredTransactions = (filters = {}) => {
  const { filterTransactions } = useWallet();
  return filterTransactions(filters);
};

export default WalletContext;
