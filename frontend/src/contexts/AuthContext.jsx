// 📁 frontend/src/contexts/AuthContext.jsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '../services/api';
import toast from 'react-hot-toast';

const AuthContext = createContext({});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [business, setBusiness] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    // بررسی وضعیت احراز هنگام بارگذاری
    useEffect(() => {
        checkAuth();
    }, []);

    const checkAuth = async () => {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                setLoading(false);
                return;
            }

            const { data } = await authAPI.checkAuth();
            if (data.authenticated) {
                setUser(data.user);
                setBusiness(data.business);
                setIsAuthenticated(true);
            } else {
                localStorage.removeItem('token');
            }
        } catch (error) {
            console.error('Auth check error:', error);
            localStorage.removeItem('token');
        } finally {
            setLoading(false);
        }
    };

    const login = async (phone, password) => {
        try {
            const { data } = await authAPI.login({ phone, password });
            
            if (data.success) {
                localStorage.setItem('token', data.token);
                setUser(data.user);
                setIsAuthenticated(true);
                toast.success('خوش آمدید!');
                return { success: true, user: data.user };
            } else {
                throw new Error(data.error);
            }
        } catch (error) {
            toast.error(error.message || 'خطا در ورود');
            return { success: false, error: error.message };
        }
    };

    const register = async (userData) => {
        try {
            const { data } = await authAPI.register(userData);
            
            if (data.success) {
                localStorage.setItem('token', data.token);
                setUser(data.user);
                setIsAuthenticated(true);
                toast.success('ثبت‌نام موفقیت‌آمیز بود!');
                return { success: true, user: data.user };
            } else {
                throw new Error(data.error);
            }
        } catch (error) {
            toast.error(error.message || 'خطا در ثبت‌نام');
            return { success: false, error: error.message };
        }
    };

    const registerBusiness = async (businessData) => {
        try {
            const { data } = await authAPI.registerBusiness(businessData);
            
            if (data.success) {
                localStorage.setItem('token', data.token);
                setUser(data.user);
                setBusiness(data.business);
                setIsAuthenticated(true);
                toast.success('کسب‌وکار شما ثبت شد!');
                return { 
                    success: true, 
                    user: data.user, 
                    business: data.business 
                };
            } else {
                throw new Error(data.error);
            }
        } catch (error) {
            toast.error(error.message || 'خطا در ثبت کسب‌وکار');
            return { success: false, error: error.message };
        }
    };

    const logout = () => {
        localStorage.removeItem('token');
        setUser(null);
        setBusiness(null);
        setIsAuthenticated(false);
        authAPI.logout();
        toast.success('با موفقیت خارج شدید');
    };

    const updateProfile = async (profileData) => {
        try {
            // این تابع بعداً کامل می‌شود
            console.log('Update profile:', profileData);
        } catch (error) {
            toast.error('خطا در به‌روزرسانی پروفایل');
        }
    };

    const value = {
        user,
        business,
        loading,
        isAuthenticated,
        login,
        register,
        registerBusiness,
        logout,
        updateProfile,
        checkAuth
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};
