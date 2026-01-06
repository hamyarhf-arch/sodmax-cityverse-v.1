import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import toast from 'react-hot-toast';
import './Auth.css';

const Login = () => {
    const [phone, setPhone] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({});

    const { login } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    const from = location.state?.from?.pathname || '/dashboard';

    const validateForm = () => {
        const newErrors = {};
        
        if (!phone.trim()) {
            newErrors.phone = 'شماره موبایل الزامی است';
        } else if (!/^09[0-9]{9}$/.test(phone)) {
            newErrors.phone = 'شماره موبایل معتبر وارد کنید';
        }

        if (!password) {
            newErrors.password = 'رمز عبور الزامی است';
        } else if (password.length < 6) {
            newErrors.password = 'رمز عبور باید حداقل ۶ کاراکتر باشد';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!validateForm()) return;

        setLoading(true);
        
        try {
            const result = await login(phone, password);
            
            if (result.success) {
                toast.success('خوش آمدید!');
                navigate(from, { replace: true });
            } else {
                setErrors({
                    general: result.error || 'خطا در ورود'
                });
                toast.error(result.error || 'خطا در ورود');
            }
        } catch (error) {
            console.error('Login error:', error);
            setErrors({
                general: 'خطا در ارتباط با سرور'
            });
            toast.error('خطا در ارتباط با سرور');
        } finally {
            setLoading(false);
        }
    };

    const handlePhoneChange = (e) => {
        const value = e.target.value.replace(/\D/g, '');
        if (value.length <= 11) {
            setPhone(value);
            if (errors.phone) {
                setErrors(prev => ({ ...prev, phone: '' }));
            }
        }
    };

    return (
        <div className="auth-container">
            <div className="auth-card">
                <div className="auth-header">
                    <div className="auth-logo">
                        <div className="auth-logo-icon">⚡</div>
                        <div className="auth-logo-text">
                            <div className="auth-logo-title">SODmAX</div>
                            <div className="auth-logo-subtitle">CityVerse Pro</div>
                        </div>
                    </div>
                    <h2 className="auth-title">ورود به حساب کاربری</h2>
                    <p className="auth-subtitle">لطفاً اطلاعات خود را وارد کنید</p>
                </div>

                {errors.general && (
                    <div className="auth-error">
                        <i className="fas fa-exclamation-circle"></i>
                        {errors.general}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="auth-form">
                    <div className="form-group">
                        <label htmlFor="phone" className="form-label">
                            شماره موبایل
                        </label>
                        <div className="input-with-prefix">
                            <span className="input-prefix">+98</span>
                            <input
                                id="phone"
                                type="tel"
                                value={phone}
                                onChange={handlePhoneChange}
                                placeholder="9123456789"
                                className={`form-input ${errors.phone ? 'error' : ''}`}
                                disabled={loading}
                                dir="ltr"
                            />
                        </div>
                        {errors.phone && (
                            <div className="form-error">
                                <i className="fas fa-exclamation-circle"></i>
                                {errors.phone}
                            </div>
                        )}
                    </div>

                    <div className="form-group">
                        <label htmlFor="password" className="form-label">
                            رمز عبور
                        </label>
                        <div className="password-input-container">
                            <input
                                id="password"
                                type={showPassword ? 'text' : 'password'}
                                value={password}
                                onChange={(e) => {
                                    setPassword(e.target.value);
                                    if (errors.password) {
                                        setErrors(prev => ({ ...prev, password: '' }));
                                    }
                                }}
                                placeholder="رمز عبور خود را وارد کنید"
                                className={`form-input ${errors.password ? 'error' : ''}`}
                                disabled={loading}
                            />
                            <button
                                type="button"
                                className="password-toggle"
                                onClick={() => setShowPassword(!showPassword)}
                                disabled={loading}
                            >
                                <i className={`fas fa-eye${showPassword ? '-slash' : ''}`}></i>
                            </button>
                        </div>
                        {errors.password && (
                            <div className="form-error">
                                <i className="fas fa-exclamation-circle"></i>
                                {errors.password}
                            </div>
                        )}
                    </div>

                    <div className="form-options">
                        <div className="remember-me">
                            <input
                                type="checkbox"
                                id="remember"
                                className="checkbox"
                            />
                            <label htmlFor="remember" className="checkbox-label">
                                مرا به خاطر بسپار
                            </label>
                        </div>
                        <Link to="/forgot-password" className="forgot-password">
                            رمز عبور را فراموش کرده‌اید؟
                        </Link>
                    </div>

                    <button
                        type="submit"
                        className="auth-btn"
                        disabled={loading}
                    >
                        {loading ? (
                            <>
                                <i className="fas fa-spinner fa-spin"></i>
                                در حال ورود...
                            </>
                        ) : (
                            <>
                                <i className="fas fa-sign-in-alt"></i>
                                ورود به حساب
                            </>
                        )}
                    </button>
                </form>

                <div className="auth-divider">
                    <span>یا</span>
                </div>

                <div className="social-login">
                    <button className="social-btn google" disabled={loading}>
                        <i className="fab fa-google"></i>
                        ورود با گوگل
                    </button>
                    <button className="social-btn apple" disabled={loading}>
                        <i className="fab fa-apple"></i>
                        ورود با اپل
                    </button>
                </div>

                <div className="auth-switch">
                    <span className="auth-switch-text">حساب کاربری ندارید؟</span>
                    <Link to="/register" className="auth-switch-btn">
                        ثبت‌نام کنید
                    </Link>
                </div>

                <div className="business-register">
                    <p>صاحب کسب‌وکار هستید؟</p>
                    <Link to="/business/register" className="business-register-btn">
                        <i className="fas fa-building"></i>
                        ثبت‌نام کسب‌وکار
                    </Link>
                </div>

                <div className="auth-terms">
                    با ورود، <Link to="/terms">قوانین و مقررات</Link> و{' '}
                    <Link to="/privacy">حریم خصوصی</Link> SODmAX CityVerse را می‌پذیرید.
                </div>
            </div>

            {/* Decorative elements */}
            <div className="auth-decoration">
                <div className="decoration-circle circle-1"></div>
                <div className="decoration-circle circle-2"></div>
                <div className="decoration-circle circle-3"></div>
            </div>
        </div>
    );
};

export default Login;
