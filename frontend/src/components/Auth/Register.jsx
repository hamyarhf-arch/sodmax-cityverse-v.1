import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import './Auth.css';

const Register = () => {
  const navigate = useNavigate();
  const { register } = useAuth();
  
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    password: '',
    confirmPassword: '',
    referralCode: '',
    acceptTerms: false
  });
  
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [registrationSuccess, setRegistrationSuccess] = useState(false);

  const validateForm = () => {
    const newErrors = {};
    
    // نام
    if (!formData.name.trim()) {
      newErrors.name = 'نام و نام خانوادگی الزامی است';
    } else if (formData.name.trim().length < 2) {
      newErrors.name = 'نام باید حداقل ۲ کاراکتر باشد';
    }
    
    // شماره موبایل
    const phoneRegex = /^09[0-9]{9}$/;
    if (!formData.phone) {
      newErrors.phone = 'شماره موبایل الزامی است';
    } else if (!phoneRegex.test(formData.phone)) {
      newErrors.phone = 'شماره موبایل معتبر وارد کنید (مثال: 09123456789)';
    }
    
    // ایمیل (اختیاری)
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'ایمیل معتبر وارد کنید';
    }
    
    // رمز عبور
    if (!formData.password) {
      newErrors.password = 'رمز عبور الزامی است';
    } else if (formData.password.length < 6) {
      newErrors.password = 'رمز عبور باید حداقل ۶ کاراکتر باشد';
    } else if (!/(?=.*[A-Za-z])(?=.*\d)/.test(formData.password)) {
      newErrors.password = 'رمز عبور باید شامل حرف و عدد باشد';
    }
    
    // تکرار رمز عبور
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'تکرار رمز عبور الزامی است';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'رمز عبور با تکرار آن مطابقت ندارد';
    }
    
    // قوانین
    if (!formData.acceptTerms) {
      newErrors.acceptTerms = 'برای ثبت‌نام باید قوانین را بپذیرید';
    }
    
    return newErrors;
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    
    // حذف خطای مربوط به فیلد هنگام تغییر
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const formErrors = validateForm();
    if (Object.keys(formErrors).length > 0) {
      setErrors(formErrors);
      return;
    }
    
    setLoading(true);
    
    try {
      const result = await register({
        name: formData.name.trim(),
        phone: formData.phone,
        email: formData.email || undefined,
        password: formData.password,
        referralCode: formData.referralCode.trim() || undefined
      });
      
      if (result.success) {
        setRegistrationSuccess(true);
        setTimeout(() => {
          navigate('/dashboard');
        }, 2000);
      } else {
        setErrors({ general: result.message || 'خطا در ثبت‌نام' });
      }
    } catch (error) {
      setErrors({ general: 'خطا در ارتباط با سرور' });
      console.error('Registration error:', error);
    } finally {
      setLoading(false);
    }
  };

  if (registrationSuccess) {
    return (
      <div className="auth-container">
        <div className="auth-background"></div>
        <div className="auth-card">
          <div className="auth-success-message">
            <div className="auth-success-icon">✓</div>
            <h2 className="auth-success-title">ثبت‌نام موفق!</h2>
            <p className="auth-success-text">
              حساب کاربری شما با موفقیت ایجاد شد.
              <br />
              در حال انتقال به پنل کاربری...
            </p>
            <div className="loading-dots">
              <span></span>
              <span></span>
              <span></span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-container">
      <div className="auth-background"></div>
      <div className="auth-card">
        <div className="auth-logo">
          <div className="auth-logo-icon">⚡</div>
          <div className="auth-logo-text">
            <div className="auth-logo-title">SODmAX</div>
            <div className="auth-logo-subtitle">CityVerse Pro</div>
          </div>
        </div>
        
        <div className="auth-header">
          <h2 className="auth-title">ثبت‌نام در SODmAX</h2>
          <p className="auth-subtitle">حساب کاربری جدید ایجاد کنید</p>
        </div>
        
        <form className="auth-form" onSubmit={handleSubmit}>
          {errors.general && (
            <div className="auth-form-error show">
              <i className="fas fa-exclamation-circle"></i>
              {errors.general}
            </div>
          )}
          
          <div className="auth-form-group">
            <label className="auth-form-label" htmlFor="name">
              نام و نام خانوادگی
            </label>
            <input
              type="text"
              id="name"
              name="name"
              className={`auth-form-input ${errors.name ? 'error' : ''}`}
              placeholder="مثلاً: علی محمدی"
              value={formData.name}
              onChange={handleChange}
              disabled={loading}
              dir="rtl"
            />
            {errors.name && (
              <div className="auth-form-error show">
                <i className="fas fa-exclamation-circle"></i>
                {errors.name}
              </div>
            )}
          </div>
          
          <div className="auth-form-group">
            <label className="auth-form-label" htmlFor="phone">
              شماره موبایل
            </label>
            <input
              type="tel"
              id="phone"
              name="phone"
              className={`auth-form-input ${errors.phone ? 'error' : ''}`}
              placeholder="مثلاً: 09123456789"
              value={formData.phone}
              onChange={handleChange}
              disabled={loading}
              dir="ltr"
            />
            {errors.phone && (
              <div className="auth-form-error show">
                <i className="fas fa-exclamation-circle"></i>
                {errors.phone}
              </div>
            )}
          </div>
          
          <div className="auth-form-group">
            <label className="auth-form-label" htmlFor="email">
              ایمیل (اختیاری)
            </label>
            <input
              type="email"
              id="email"
              name="email"
              className={`auth-form-input ${errors.email ? 'error' : ''}`}
              placeholder="example@email.com"
              value={formData.email}
              onChange={handleChange}
              disabled={loading}
              dir="ltr"
            />
            {errors.email && (
              <div className="auth-form-error show">
                <i className="fas fa-exclamation-circle"></i>
                {errors.email}
              </div>
            )}
          </div>
          
          <div className="auth-form-group">
            <label className="auth-form-label" htmlFor="password">
              رمز عبور
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                id="password"
                name="password"
                className={`auth-form-input ${errors.password ? 'error' : ''}`}
                placeholder="حداقل ۶ کاراکتر"
                value={formData.password}
                onChange={handleChange}
                disabled={loading}
                dir="ltr"
              />
              <button
                type="button"
                className="auth-password-toggle"
                onClick={() => setShowPassword(!showPassword)}
                disabled={loading}
              >
                <i className={`fas ${showPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
              </button>
            </div>
            {errors.password && (
              <div className="auth-form-error show">
                <i className="fas fa-exclamation-circle"></i>
                {errors.password}
              </div>
            )}
          </div>
          
          <div className="auth-form-group">
            <label className="auth-form-label" htmlFor="confirmPassword">
              تکرار رمز عبور
            </label>
            <div className="relative">
              <input
                type={showConfirmPassword ? "text" : "password"}
                id="confirmPassword"
                name="confirmPassword"
                className={`auth-form-input ${errors.confirmPassword ? 'error' : ''}`}
                placeholder="رمز عبور را مجدداً وارد کنید"
                value={formData.confirmPassword}
                onChange={handleChange}
                disabled={loading}
                dir="ltr"
              />
              <button
                type="button"
                className="auth-password-toggle"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                disabled={loading}
              >
                <i className={`fas ${showConfirmPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
              </button>
            </div>
            {errors.confirmPassword && (
              <div className="auth-form-error show">
                <i className="fas fa-exclamation-circle"></i>
                {errors.confirmPassword}
              </div>
            )}
          </div>
          
          <div className="auth-form-group">
            <label className="auth-form-label" htmlFor="referralCode">
              کد دعوت (اختیاری)
            </label>
            <input
              type="text"
              id="referralCode"
              name="referralCode"
              className={`auth-form-input ${errors.referralCode ? 'error' : ''}`}
              placeholder="کد دعوت معرف خود را وارد کنید"
              value={formData.referralCode}
              onChange={handleChange}
              disabled={loading}
              dir="ltr"
            />
            <div className="text-xs text-tertiary mt-1">
              با وارد کردن کد دعوت، ۵۰۰ SOD هدیه اضافی دریافت می‌کنید
            </div>
          </div>
          
          <div className="auth-form-group">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                name="acceptTerms"
                checked={formData.acceptTerms}
                onChange={handleChange}
                disabled={loading}
                className="form-checkbox"
              />
              <span className="text-sm">
                <span>با </span>
                <a href="/terms" className="auth-link" target="_blank" rel="noopener noreferrer">
                  قوانین و مقررات
                </a>
                <span> و </span>
                <a href="/privacy" className="auth-link" target="_blank" rel="noopener noreferrer">
                  حریم خصوصی
                </a>
                <span> SODmAX موافقت می‌کنم</span>
              </span>
            </label>
            {errors.acceptTerms && (
              <div className="auth-form-error show">
                <i className="fas fa-exclamation-circle"></i>
                {errors.acceptTerms}
              </div>
            )}
          </div>
          
          <button
            type="submit"
            className="auth-button"
            disabled={loading}
          >
            {loading ? (
              <>
                <i className="fas fa-spinner fa-spin"></i>
                در حال ثبت‌نام...
              </>
            ) : (
              <>
                <i className="fas fa-user-plus"></i>
                ایجاد حساب کاربری
              </>
            )}
          </button>
        </form>
        
        <div className="auth-divider">یا</div>
        
        <div className="auth-social-buttons">
          <button type="button" className="auth-social-button google" disabled={loading}>
            <i className="fab fa-google"></i>
            ادامه با گوگل
          </button>
          <button type="button" className="auth-social-button" disabled={loading}>
            <i className="fas fa-sms"></i>
            ورود با پیامک
          </button>
        </div>
        
        <div className="auth-switch">
          <span className="auth-switch-text">قبلاً ثبت‌نام کرده‌اید؟</span>
          <Link to="/login" className="auth-switch-button">
            ورود به حساب
          </Link>
        </div>
        
        <div className="auth-terms">
          برای ثبت‌نام کسب‌وکار،{' '}
          <Link to="/business-register" className="auth-link">
            اینجا کلیک کنید
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Register;
