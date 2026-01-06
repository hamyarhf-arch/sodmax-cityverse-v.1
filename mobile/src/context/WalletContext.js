import React, { createContext, useState, useContext, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Services
import api from '../services/api';
import { useAuth } from './AuthContext';
import { useToast } from './ToastContext';

const WalletContext = createContext();

export const useWallet = () => {
  const context = useContext(WalletContext);
  if (!context) {
    throw new Error('useWallet must be used within a WalletProvider');
  }
  return context;
};

export const WalletProvider = ({ children }) => {
  const { user, token, isAuthenticated } = useAuth();
  const toast = useToast();

  const [wallet, setWallet] = useState({
    SOD: 0,
    Toman: 0,
    USDT: 0,
    Busd: 0,
  });
  
  const [transactions, setTransactions] = useState([]);
  const [conversionRates, setConversionRates] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [withdrawalLimits, setWithdrawalLimits] = useState({
    min: 10000,
    max: 5000000,
    feePercent: 2.5,
  });

  useEffect(() => {
    if (isAuthenticated && user) {
      loadWalletData();
      loadConversionRates();
    }
  }, [isAuthenticated, user]);

  const loadWalletData = async () => {
    try {
      setIsLoading(true);
      
      // Try to load from cache first
      const cachedWallet = await AsyncStorage.getItem('sodmax_wallet_cache');
      const cachedTransactions = await AsyncStorage.getItem('sodmax_transactions_cache');
      
      if (cachedWallet) {
        setWallet(JSON.parse(cachedWallet));
      }
      
      if (cachedTransactions) {
        setTransactions(JSON.parse(cachedTransactions));
      }
      
      // Then fetch fresh data from API
      await refreshWallet();
      
    } catch (error) {
      console.error('Error loading wallet data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const refreshWallet = async () => {
    try {
      const [walletResponse, transactionsResponse] = await Promise.all([
        api.get('/wallet/balance'),
        api.get('/wallet/transactions', { params: { limit: 20 } }),
      ]);

      if (walletResponse.success) {
        setWallet(walletResponse.data.balances);
        await AsyncStorage.setItem('sodmax_wallet_cache', JSON.stringify(walletResponse.data.balances));
      }

      if (transactionsResponse.success) {
        setTransactions(transactionsResponse.data.transactions);
        await AsyncStorage.setItem('sodmax_transactions_cache', JSON.stringify(transactionsResponse.data.transactions));
      }
    } catch (error) {
      console.error('Error refreshing wallet:', error);
      throw error;
    }
  };

  const getConversionRates = async () => {
    try {
      const response = await api.get('/wallet/conversion-rates');
      if (response.success) {
        setConversionRates(response.data.rates);
        return response.data.rates;
      }
    } catch (error) {
      console.error('Error getting conversion rates:', error);
      // Fallback to default rates
      return {
        SOD_TO_Toman: 0.01,
        Toman_TO_USDT: 1/300000,
        USDT_TO_Busd: 1,
        Busd_TO_Toman: 300000,
      };
    }
  };

  const loadConversionRates = async () => {
    try {
      const rates = await getConversionRates();
      setConversionRates(rates);
    } catch (error) {
      console.error('Error loading conversion rates:', error);
    }
  };

  const convertCurrency = async (fromCurrency, toCurrency, amount) => {
    try {
      setIsLoading(true);
      
      const response = await api.post('/wallet/convert', {
        fromCurrency,
        toCurrency,
        amount: parseFloat(amount),
      });

      if (response.success) {
        // Update wallet with new balances
        setWallet(prev => ({
          ...prev,
          [fromCurrency]: prev[fromCurrency] - amount,
          [toCurrency]: prev[toCurrency] + response.data.convertedAmount,
        }));

        // Add transaction
        const newTransaction = {
          id: Date.now(),
          type: 'تبدیل',
          amount: -amount,
          currency: fromCurrency,
          convertedAmount: response.data.convertedAmount,
          convertedCurrency: toCurrency,
          fee: response.data.fee || 0,
          status: 'موفق',
          date: new Date().toLocaleString('fa-IR'),
          timestamp: Date.now(),
        };

        setTransactions(prev => [newTransaction, ...prev]);
        
        // Update cache
        await AsyncStorage.setItem('sodmax_wallet_cache', JSON.stringify(wallet));
        await AsyncStorage.setItem('sodmax_transactions_cache', JSON.stringify([newTransaction, ...transactions]));

        toast.success('تبدیل موفق', `${amount} ${fromCurrency} به ${response.data.convertedAmount} ${toCurrency} تبدیل شد`);
        
        return response.data;
      } else {
        throw new Error(response.message || 'خطا در تبدیل ارز');
      }
    } catch (error) {
      console.error('Convert currency error:', error);
      toast.error('خطا در تبدیل', error.message || 'خطا در انجام عملیات');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const withdrawFunds = async (currency, amount, walletAddress) => {
    try {
      setIsLoading(true);

      if (amount < withdrawalLimits.min) {
        throw new Error(`حداقل مبلغ برداشت ${withdrawalLimits.min.toLocaleString('fa-IR')} ${currency} است`);
      }

      if (amount > withdrawalLimits.max) {
        throw new Error(`حداکثر مبلغ برداشت ${withdrawalLimits.max.toLocaleString('fa-IR')} ${currency} است`);
      }

      if (amount > wallet[currency]) {
        throw new Error(`موجودی ${currency} کافی نیست`);
      }

      const response = await api.post('/wallet/withdraw', {
        currency,
        amount: parseFloat(amount),
        walletAddress,
        feePercent: withdrawalLimits.feePercent,
      });

      if (response.success) {
        // Update wallet
        const fee = (amount * withdrawalLimits.feePercent) / 100;
        const netAmount = amount - fee;
        
        setWallet(prev => ({
          ...prev,
          [currency]: prev[currency] - amount,
        }));

        // Add transaction
        const newTransaction = {
          id: Date.now(),
          type: 'برداشت',
          amount: -amount,
          currency,
          fee,
          netAmount,
          walletAddress,
          status: 'در انتظار',
          trackingId: response.data.trackingId,
          date: new Date().toLocaleString('fa-IR'),
          timestamp: Date.now(),
        };

        setTransactions(prev => [newTransaction, ...prev]);
        
        // Update cache
        await AsyncStorage.setItem('sodmax_wallet_cache', JSON.stringify(wallet));
        await AsyncStorage.setItem('sodmax_transactions_cache', JSON.stringify([newTransaction, ...transactions]));

        toast.success('درخواست ثبت شد', `برداشت ${netAmount.toLocaleString('fa-IR')} ${currency} ثبت شد. شماره پیگیری: ${response.data.trackingId}`);
        
        return response.data;
      } else {
        throw new Error(response.message || 'خطا در ثبت درخواست برداشت');
      }
    } catch (error) {
      console.error('Withdraw funds error:', error);
      toast.error('خطا در برداشت', error.message || 'خطا در انجام عملیات');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const depositFunds = async (currency, amount, method = 'gateway') => {
    try {
      setIsLoading(true);

      const response = await api.post('/wallet/deposit', {
        currency,
        amount: parseFloat(amount),
        method,
      });

      if (response.success) {
        if (response.data.paymentUrl) {
          // For gateway payments, return the payment URL
          return response.data;
        } else {
          // For direct deposits, update wallet
          setWallet(prev => ({
            ...prev,
            [currency]: prev[currency] + amount,
          }));

          // Add transaction
          const newTransaction = {
            id: Date.now(),
            type: 'واریز',
            amount,
            currency,
            method,
            status: 'موفق',
            date: new Date().toLocaleString('fa-IR'),
            timestamp: Date.now(),
          };

          setTransactions(prev => [newTransaction, ...prev]);
          
          // Update cache
          await AsyncStorage.setItem('sodmax_wallet_cache', JSON.stringify(wallet));
          await AsyncStorage.setItem('sodmax_transactions_cache', JSON.stringify([newTransaction, ...transactions]));

          toast.success('واریز موفق', `${amount.toLocaleString('fa-IR')} ${currency} به حساب شما واریز شد`);
          
          return response.data;
        }
      } else {
        throw new Error(response.message || 'خطا در واریز وجه');
      }
    } catch (error) {
      console.error('Deposit funds error:', error);
      toast.error('خطا در واریز', error.message || 'خطا در انجام عملیات');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const getTransactionHistory = async (filters = {}) => {
    try {
      const response = await api.get('/wallet/transactions', { params: filters });
      
      if (response.success) {
        setTransactions(response.data.transactions);
        await AsyncStorage.setItem('sodmax_transactions_cache', JSON.stringify(response.data.transactions));
        return response.data;
      }
    } catch (error) {
      console.error('Error getting transaction history:', error);
      throw error;
    }
  };

  const getTotalBalance = (currency = 'Toman') => {
    // Convert all balances to target currency
    let total = 0;
    
    Object.entries(wallet).forEach(([curr, amount]) => {
      if (curr === currency) {
        total += amount;
      } else {
        const rateKey = `${curr}_TO_${currency}`;
        const rate = conversionRates[rateKey] || 0;
        total += amount * rate;
      }
    });
    
    return total;
  };

  const formatBalance = (currency, amount) => {
    const formatter = new Intl.NumberFormat('fa-IR');
    return `${formatter.format(amount)} ${currency}`;
  };

  const value = {
    wallet,
    transactions,
    conversionRates,
    isLoading,
    withdrawalLimits,
    refreshWallet,
    convertCurrency,
    withdrawFunds,
    depositFunds,
    getTransactionHistory,
    getTotalBalance,
    formatBalance,
    getConversionRates,
  };

  return (
    <WalletContext.Provider value={value}>
      {children}
    </WalletContext.Provider>
  );
};

export default WalletContext;
