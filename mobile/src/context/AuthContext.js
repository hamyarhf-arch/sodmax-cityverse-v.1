import React, { createContext, useState, useContext, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Keychain from 'react-native-keychain';
import { Platform } from 'react-native';

// Services
import api from '../services/api';
import { useToast } from './ToastContext';

// Constants
import Config from 'react-native-config';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [refreshToken, setRefreshToken] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const toast = useToast();

  useEffect(() => {
    // Check for existing session on app start
    loadStoredSession();
  }, []);

  const loadStoredSession = async () => {
    try {
      setIsLoading(true);

      // Try to load from secure storage first
      let storedToken = null;
      let storedRefreshToken = null;
      let storedUser = null;

      if (Config.ENABLE_BIOMETRIC === 'true') {
        // Try to get from keychain (biometric)
        try {
          const credentials = await Keychain.getInternetCredentials('sodmax_auth');
          if (credentials) {
            storedToken = credentials.password;
          }
        } catch (error) {
          console.log('Keychain access failed:', error);
        }
      }

      // Fallback to AsyncStorage
      if (!storedToken) {
        storedToken = await AsyncStorage.getItem(Config.AUTH_TOKEN_KEY);
        storedRefreshToken = await AsyncStorage.getItem(Config.REFRESH_TOKEN_KEY);
        const userString = await AsyncStorage.getItem('sodmax_user');
        storedUser = userString ? JSON.parse(userString) : null;
      }

      if (storedToken && storedUser) {
        // Set token in API service
        api.setToken(storedToken);
        
        // Validate token with server
        try {
          const response = await api.get('/auth/validate');
          if (response.success) {
            setToken(storedToken);
            setRefreshToken(storedRefreshToken);
            setUser(storedUser);
            setIsAuthenticated(true);
          } else {
            // Token is invalid, clear storage
            await clearStorage();
          }
        } catch (error) {
          console.log('Token validation failed:', error);
          await clearStorage();
        }
      }
    } catch (error) {
      console.error('Error loading stored session:', error);
      await clearStorage();
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (phone, password, rememberMe = false) => {
    try {
      const response = await api.post('/auth/login', {
        phone,
        password,
        deviceInfo: {
          platform: Platform.OS,
          version: Platform.Version,
        },
      });

      if (response.success) {
        const { token, refreshToken, user } = response.data;

        // Save tokens
        await saveTokens(token, refreshToken, rememberMe);
        
        // Save user data
        await AsyncStorage.setItem('sodmax_user', JSON.stringify(user));

        // Update state
        setToken(token);
        setRefreshToken(refreshToken);
        setUser(user);
        setIsAuthenticated(true);
        api.setToken(token);

        // Save biometric if enabled and requested
        if (rememberMe && Config.ENABLE_BIOMETRIC === 'true') {
          await saveToKeychain(token, phone);
        }

        return response.data;
      } else {
        throw new Error(response.message || 'خطا در ورود');
      }
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };

  const register = async (userData) => {
    try {
      const response = await api.post('/auth/register', userData);

      if (response.success) {
        const { token, refreshToken, user } = response.data;

        // Save tokens
        await saveTokens(token, refreshToken);
        
        // Save user data
        await AsyncStorage.setItem('sodmax_user', JSON.stringify(user));

        // Update state
        setToken(token);
        setRefreshToken(refreshToken);
        setUser(user);
        setIsAuthenticated(true);
        api.setToken(token);

        return response.data;
      } else {
        throw new Error(response.message || 'خطا در ثبت‌نام');
      }
    } catch (error) {
      console.error('Register error:', error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      // Call logout API
      if (token) {
        await api.post('/auth/logout', { refreshToken });
      }

      // Clear storage
      await clearStorage();

      // Update state
      setToken(null);
      setRefreshToken(null);
      setUser(null);
      setIsAuthenticated(false);
      api.setToken(null);

      toast.success('با موفقیت خارج شدید');
    } catch (error) {
      console.error('Logout error:', error);
      // Still clear local storage even if API call fails
      await clearStorage();
      setToken(null);
      setRefreshToken(null);
      setUser(null);
      setIsAuthenticated(false);
      api.setToken(null);
    }
  };

  const updateUser = async (updates) => {
    try {
      const response = await api.put('/user/profile', updates);

      if (response.success) {
        const updatedUser = { ...user, ...updates };
        setUser(updatedUser);
        await AsyncStorage.setItem('sodmax_user', JSON.stringify(updatedUser));
        return updatedUser;
      } else {
        throw new Error(response.message || 'خطا در به‌روزرسانی پروفایل');
      }
    } catch (error) {
      console.error('Update user error:', error);
      throw error;
    }
  };

  const refreshAccessToken = async () => {
    try {
      if (!refreshToken) {
        throw new Error('No refresh token available');
      }

      const response = await api.post('/auth/refresh', { refreshToken });

      if (response.success) {
        const { token: newToken, refreshToken: newRefreshToken } = response.data;

        // Save new tokens
        await saveTokens(newToken, newRefreshToken);

        // Update state
        setToken(newToken);
        setRefreshToken(newRefreshToken);
        api.setToken(newToken);

        return newToken;
      } else {
        throw new Error('Failed to refresh token');
      }
    } catch (error) {
      console.error('Token refresh error:', error);
      await logout();
      throw error;
    }
  };

  const saveTokens = async (token, refreshToken, rememberMe = false) => {
    try {
      await AsyncStorage.setItem(Config.AUTH_TOKEN_KEY, token);
      await AsyncStorage.setItem(Config.REFRESH_TOKEN_KEY, refreshToken);

      if (rememberMe) {
        // Store for longer duration
        await AsyncStorage.setItem('sodmax_remember', 'true');
      }
    } catch (error) {
      console.error('Error saving tokens:', error);
      throw error;
    }
  };

  const saveToKeychain = async (token, username) => {
    try {
      await Keychain.setInternetCredentials(
        'sodmax_auth',
        username,
        token,
        {
          accessible: Keychain.ACCESSIBLE.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
          securityLevel: Keychain.SECURITY_LEVEL.SECURE_SOFTWARE,
        }
      );
    } catch (error) {
      console.error('Error saving to keychain:', error);
    }
  };

  const clearStorage = async () => {
    try {
      // Clear AsyncStorage
      await AsyncStorage.multiRemove([
        Config.AUTH_TOKEN_KEY,
        Config.REFRESH_TOKEN_KEY,
        'sodmax_user',
        'sodmax_remember',
      ]);

      // Clear Keychain
      if (Config.ENABLE_BIOMETRIC === 'true') {
        try {
          await Keychain.resetInternetCredentials('sodmax_auth');
        } catch (error) {
          console.log('Keychain clear failed:', error);
        }
      }
    } catch (error) {
      console.error('Error clearing storage:', error);
    }
  };

  const changePassword = async (oldPassword, newPassword) => {
    try {
      const response = await api.post('/auth/change-password', {
        oldPassword,
        newPassword,
      });

      if (response.success) {
        return true;
      } else {
        throw new Error(response.message || 'خطا در تغییر رمز عبور');
      }
    } catch (error) {
      console.error('Change password error:', error);
      throw error;
    }
  };

  const requestPasswordReset = async (phone) => {
    try {
      const response = await api.post('/auth/forgot-password', { phone });

      if (response.success) {
        return response.data;
      } else {
        throw new Error(response.message || 'خطا در درخواست بازیابی');
      }
    } catch (error) {
      console.error('Password reset request error:', error);
      throw error;
    }
  };

  const verifyResetCode = async (phone, code) => {
    try {
      const response = await api.post('/auth/verify-reset-code', {
        phone,
        code,
      });

      if (response.success) {
        return response.data;
      } else {
        throw new Error(response.message || 'کد تأیید نامعتبر است');
      }
    } catch (error) {
      console.error('Verify reset code error:', error);
      throw error;
    }
  };

  const resetPassword = async (phone, code, newPassword) => {
    try {
      const response = await api.post('/auth/reset-password', {
        phone,
        code,
        newPassword,
      });

      if (response.success) {
        return true;
      } else {
        throw new Error(response.message || 'خطا در بازنشانی رمز عبور');
      }
    } catch (error) {
      console.error('Reset password error:', error);
      throw error;
    }
  };

  const isAdmin = user?.role === 'admin' || user?.role === 'super_admin';

  const value = {
    user,
    token,
    refreshToken,
    isLoading,
    isAuthenticated,
    isAdmin,
    login,
    register,
    logout,
    updateUser,
    refreshAccessToken,
    changePassword,
    requestPasswordReset,
    verifyResetCode,
    resetPassword,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
