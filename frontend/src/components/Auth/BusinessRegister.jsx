import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import './Auth.css';

const BusinessRegister = () => {
  const navigate = useNavigate();
  const { registerBusiness } = useAuth();
  
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    // مرحله ۱: اطلاعات پایه
    businessType: 'individual',
    businessName: '',
    ownerName: '',
    phone: '',
    email: '',
    password: '',
    confirmPassword: '',
    
    // مرحله ۲: اطلاعات کسب‌وکار
    registrationNumber: '',
    nationalId: '',
    website: '',
    category: '',
    description: '',
    
    // مرحله ۳: اطلاعات تماس
    address: '',
    city: '',
    province: '',
    postalCode: '',
    
    // شرایط
    acceptTerms: false,
    acceptBusinessTerms: false
  });
  
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [registrationSuccess, setRegistrationSuccess] = useState(false);

  const businessTypes = [
    { id: 'individual', label: 'شخصی / فریلنسر', icon: '👤' },
    { id: 'company', label: 'شرکت / مؤسسه', icon: '🏢' },
    { id: 'startup', label: 'استارتاپ', icon: '🚀' },
    { id: 'agency', label: 'آژانس', icon: '🎯' }
  ];

  const businessCategories = [
    'تکنولوژی و فناوری',
    'بازاریابی و تبلیغات',
    'خدمات مالی',
    'آموزش',
    'خرده‌فروشی',
    'خدمات غذایی',
    'گردشگری',
    'سلامت و زیبایی',
    'سایر'
  ];

  const validateStep = (stepNumber) => {
    const newErrors = {};
    
    if (stepNumber === 1) {
      // نوع کسب‌وکار
      if (!formData.businessType) {
        newErrors.businessType = 'نوع کسب‌وکار را انتخاب کنید';
      }
      
      // نام کسب‌وکار
      if (!formData.businessName.trim()) {
        newErrors.businessName = 'نام کسب‌وکار الزامی است';
      } else if (formData.businessName.trim().length < 2) {
        newErrors.businessName = 'نام کسب‌وکار باید حداقل ۲ کاراکتر باشد';
      }
      
      // نام مالک
      if (!formData.ownerName.trim()) {
        newErrors.ownerName = 'نام مالک الزامی است';
      }
      
      // شماره موبایل
      const phoneRegex = /^09[0-9]{9}$/;
      if (!formData.phone) {
        newErrors.phone = 'شماره موبایل الزامی است';
      } else if (!phoneRegex.test(formData.phone)) {
        newErrors.phone = 'شماره موبایل معتبر وارد کنید';
      }
      
      // ایمیل
      if (!formData.email) {
        newErrors.email = 'ایمیل الزامی است';
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
        newErrors.email = 'ایمیل معتبر وارد کنید';
      }
      
      // رمز عبور
      if (!formData.password) {
        newErrors.password = 'رمز عبور الزامی است';
      } else if (formData.password.length < 8) {
        newErrors.password = 'رمز عبور باید حداقل ۸ کاراکتر باشد';
      } else if (!/(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*?&])/.test(formData.password)) {
        newErrors.password = 'رمز عبور باید شامل حرف، عدد و کاراکتر خاص باشد';
      }
      
      // تکرار رمز عبور
      if (!formData.confirmPassword) {
        newErrors.confirmPassword = 'تکرار رمز عبور الزامی است';
      } else if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = 'رمز عبور با تکرار آن مطابقت ندارد';
      }
    }
    
    if (stepNumber === 2) {
      // شماره ثبت
      if (formData.businessType !== 'individual' && !formData.registrationNumber) {
        newErrors.registrationNumber = 'شماره ثبت الزامی است';
      }
      
      // شناسه ملی
      if (formData.businessType !== 'individual' && !formData.nationalId) {
        newErrors.nationalId = 'شناسه ملی الزامی است';
      }
      
      // دسته‌بندی
      if (!formData.category) {
        newErrors.category = 'دسته‌بندی کسب‌وکار را انتخاب کنید';
      }
    }
    
    if (stepNumber === 3) {
      // آدرس
      if (!formData.address.trim()) {
        newErrors.address = 'آدرس الزامی است';
      }
      
      // شهر
      if (!formData.city.trim()) {
        newErrors.city = 'شهر الزامی است';
      }
      
      // استان
      if (!formData.province.trim()) {
        newErrors.province = 'استان الزامی است';
      }
      
      // کد پستی
      if (!formData.postalCode) {
        newErrors.postalCode = 'کد پستی الزامی است';
      } else if (!/^\d{10}$/.test(formData.postalCode)) {
        newErrors.postalCode = 'کد پستی باید ۱۰ رقم باشد';
      }
    }
    
    return newErrors;
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleBusinessTypeSelect = (type) => {
    setFormData(prev => ({ ...prev, businessType: type }));
    if (errors.businessType) {
      setErrors(prev => ({ ...prev, businessType: '' }));
    }
  };

  const handleCategorySelect = (category) => {
    setFormData(prev => ({ ...prev, category }));
    if (errors.category) {
      setErrors(prev => ({ ...prev, category: '' }));
    }
  };

  const handleNextStep = () => {
    const stepErrors = validateStep(step);
    if (Object.keys(stepErrors).length > 0) {
      setErrors(stepErrors);
      return;
    }
    
    setErrors({});
    setStep(prev => prev + 1);
  };

  const handlePrevStep = () => {
    setStep(prev => prev - 1);
    setErrors({});
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const stepErrors = validateStep(3);
    if (Object.keys(stepErrors).length > 0) {
      setErrors(stepErrors);
      return;
    }
    
    if (!formData.acceptTerms || !formData.acceptBusinessTerms) {
      setErrors({
        terms: 'برای ثبت‌نام باید همه شرایط را بپذیرید'
      });
      return;
    }
    
    setLoading(true);
    
    try {
      const result = await registerBusiness({
        businessType: formData.businessType,
        businessName: formData.businessName.trim(),
        ownerName: formData.ownerName.trim(),
        phone: formData.phone,
        email: formData.email,
        password: formData.password,
        registrationNumber: formData.registrationNumber.trim() || undefined,
        nationalId: formData.nationalId.trim() || undefined,
        website: formData.website.trim() || undefined,
        category: formData.category,
        description: formData.description.trim() || undefined,
        address: formData.address.trim(),
        city: formData.city.trim(),
        province: formData.province.trim(),
        postalCode: formData.postalCode
      });
      
      if (result.success) {
        setRegistrationSuccess(true);
        setTimeout(() => {
          navigate('/business/dashboard');
        }, 3000);
      } else {
        setErrors({ general: result.message || 'خطا در ثبت‌نام کسب‌وکار' });
      }
    } catch (error) {
      setErrors({ general: 'خطا در ارتباط با سرور' });
      console.error('Business registration error:', error);
    } finally {
      setLoading(false);
    }
  };

  const renderStepContent = () => {
    switch(step) {
      case 1:
        return (
          <>
            <div className="auth-header">
              <h2 className="auth-title">ثبت‌نام کسب‌وکار</h2>
              <p className="auth-subtitle">مرحله ۱ از ۳: اطلاعات پایه</p>
            </div>
            
            {errors.general && (
              <div className="auth-form-error show">
                <i className="fas fa-exclamation-circle"></i>
                {errors.general}
              </div>
            )}
            
            <div className="auth-form">
              <div className="auth-form-group">
                <label className="auth-form-label">نوع کسب‌وکار</label>
                <div className="auth-business-type">
                  {businessTypes.map(type => (
                    <button
                      key={type.id}
                      type="button"
                      className={`auth-business-option ${
                        formData.businessType === type.id ? 'selected' : ''
                      }`}
                      onClick={() => handleBusinessTypeSelect(type.id)}
                    >
                      <div className="auth-business-option-icon">{type.icon}</div>
                      <div>{type.label}</div>
                    </button>
                  ))}
                </div>
                {errors.businessType && (
                  <div className="auth-form-error show">
                    <i className="fas fa-exclamation-circle"></i>
                    {errors.businessType}
                  </div>
                )}
              </div>
              
              <div className="auth-form-group">
                <label className="auth-form-label" htmlFor="businessName">
                  نام کسب‌وکار
                </label>
                <input
                  type="text"
                  id="businessName"
                  name="businessName"
                  className={`auth-form-input ${errors.businessName ? 'error' : ''}`}
                  placeholder="نام رسمی کسب‌وکار"
                  value={formData.businessName}
                  onChange={handleChange}
                  disabled={loading}
                  dir="rtl"
                />
                {errors.businessName && (
                  <div className="auth-form-error show">
                    <i className="fas fa-exclamation-circle"></i>
                    {errors.businessName}
                  </div>
                )}
              </div>
              
              <div className="auth-form-group">
                <label className="auth-form-label" htmlFor="ownerName">
                  نام مالک / مدیرعامل
                </label>
                <input
                  type="text"
                  id="ownerName"
                  name="ownerName"
                  className={`auth-form-input ${errors.ownerName ? 'error' : ''}`}
                  placeholder="نام و نام خانوادگی"
                  value={formData.ownerName}
                  onChange={handleChange}
                  disabled={loading}
                  dir="rtl"
                />
                {errors.ownerName && (
                  <div className="auth-form-error show">
                    <i className="fas fa-exclamation-circle"></i>
                    {errors.ownerName}
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
                  placeholder="09123456789"
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
                  ایمیل
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  className={`auth-form-input ${errors.email ? 'error' : ''}`}
                  placeholder="business@example.com"
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
                    placeholder="حداقل ۸ کاراکتر شامل حرف، عدد و کاراکتر خاص"
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
                    placeholder="تکرار رمز عبور"
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
            </div>
          </>
        );
        
      case 2:
        return (
          <>
            <button
              type="button"
              className="auth-back-button"
              onClick={handlePrevStep}
              disabled={loading}
            >
              <i className="fas fa-arrow-right"></i>
              مرحله قبل
            </button>
            
            <div className="auth-header">
              <h2 className="auth-title">اطلاعات کسب‌وکار</h2>
              <p className="auth-subtitle">مرحله ۲ از ۳: جزئیات کسب‌وکار</p>
            </div>
            
            <div className="auth-form">
              {formData.businessType !== 'individual' && (
                <>
                  <div className="auth-form-group">
                    <label className="auth-form-label" htmlFor="registrationNumber">
                      شماره ثبت
                    </label>
                    <input
                      type="text"
                      id="registrationNumber"
                      name="registrationNumber"
                      className={`auth-form-input ${errors.registrationNumber ? 'error' : ''}`}
                      placeholder="شماره ثبت رسمی"
                      value={formData.registrationNumber}
                      onChange={handleChange}
                      disabled={loading}
                      dir="ltr"
                    />
                    {errors.registrationNumber && (
                      <div className="auth-form-error show">
                        <i className="fas fa-exclamation-circle"></i>
                        {errors.registrationNumber}
                      </div>
                    )}
                  </div>
                  
                  <div className="auth-form-group">
                    <label className="auth-form-label" htmlFor="nationalId">
                      شناسه ملی
                    </label>
                    <input
                      type="text"
                      id="nationalId"
                      name="nationalId"
                      className={`auth-form-input ${errors.nationalId ? 'error' : ''}`}
                      placeholder="شناسه ملی"
                      value={formData.nationalId}
                      onChange={handleChange}
                      disabled={loading}
                      dir="ltr"
                    />
                    {errors.nationalId && (
                      <div className="auth-form-error show">
                        <i className="fas fa-exclamation-circle"></i>
                        {errors.nationalId}
                      </div>
                    )}
                  </div>
                </>
              )}
              
              <div className="auth-form-group">
                <label className="auth-form-label" htmlFor="website">
                  وب‌سایت (اختیاری)
                </label>
                <input
                  type="url"
                  id="website"
                  name="website"
                  className="auth-form-input"
                  placeholder="https://example.com"
                  value={formData.website}
                  onChange={handleChange}
                  disabled={loading}
                  dir="ltr"
                />
              </div>
              
              <div className="auth-form-group">
                <label className="auth-form-label">دسته‌بندی کسب‌وکار</label>
                <div className="grid grid-cols-2 gap-2">
                  {businessCategories.map(category => (
                    <button
                      key={category}
                      type="button"
                      className={`btn btn-outline btn-sm ${formData.category === category ? 'btn-primary' : ''}`}
                      onClick={() => handleCategorySelect(category)}
                      disabled={loading}
                    >
                      {category}
                    </button>
                  ))}
                </div>
                {errors.category && (
                  <div className="auth-form-error show">
                    <i className="fas fa-exclamation-circle"></i>
                    {errors.category}
                  </div>
                )}
              </div>
              
              <div className="auth-form-group">
                <label className="auth-form-label" htmlFor="description">
                  توضیحات کسب‌وکار (اختیاری)
                </label>
                <textarea
                  id="description"
                  name="description"
                  className="auth-form-input"
                  rows={4}
                  placeholder="توضیحات درباره کسب‌وکار، خدمات و فعالیت‌ها"
                  value={formData.description}
                  onChange={handleChange}
                  disabled={loading}
                  dir="rtl"
                />
              </div>
            </div>
          </>
        );
        
      case 3:
        return (
          <>
            <button
              type="button"
              className="auth-back-button"
              onClick={handlePrevStep}
              disabled={loading}
            >
              <i className="fas fa-arrow-right"></i>
              مرحله قبل
            </button>
            
            <div className="auth-header">
              <h2 className="auth-title">اطلاعات تماس</h2>
              <p className="auth-subtitle">مرحله ۳ از ۳: اطلاعات تماس و نهایی‌سازی</p>
            </div>
            
            <div className="auth-form">
              <div className="auth-form-group">
                <label className="auth-form-label" htmlFor="address">
                  آدرس کامل
                </label>
                <textarea
                  id="address"
                  name="address"
                  className={`auth-form-input ${errors.address ? 'error' : ''}`}
                  rows={3}
                  placeholder="آدرس کامل کسب‌وکار"
                  value={formData.address}
                  onChange={handleChange}
                  disabled={loading}
                  dir="rtl"
                />
                {errors.address && (
                  <div className="auth-form-error show">
                    <i className="fas fa-exclamation-circle"></i>
                    {errors.address}
                  </div>
                )}
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="auth-form-group">
                  <label className="auth-form-label" htmlFor="province">
                    استان
                  </label>
                  <input
                    type="text"
                    id="province"
                    name="province"
                    className={`auth-form-input ${errors.province ? 'error' : ''}`}
                    placeholder="استان"
                    value={formData.province}
                    onChange={handleChange}
                    disabled={loading}
                    dir="rtl"
                  />
                  {errors.province && (
                    <div className="auth-form-error show">
                      <i className="fas fa-exclamation-circle"></i>
                      {errors.province}
                    </div>
                  )}
                </div>
                
                <div className="auth-form-group">
                  <label className="auth-form-label" htmlFor="city">
                    شهر
                  </label>
                  <input
                    type="text"
                    id="city"
                    name="city"
                    className={`auth-form-input ${errors.city ? 'error' : ''}`}
                    placeholder="شهر"
                    value={formData.city}
                    onChange={handleChange}
                    disabled={loading}
                    dir="rtl"
                  />
                  {errors.city && (
                    <div className="auth-form-error show">
                      <i className="fas fa-exclamation-circle"></i>
                      {errors.city}
                    </div>
                  )}
                </div>
              </div>
              
              <div className="auth-form-group">
                <label className="auth-form-label" htmlFor="postalCode">
                  کد پستی
                </label>
                <input
                  type="text"
                  id="postalCode"
                  name="postalCode"
                  className={`auth-form-input ${errors.postalCode ? 'error' : ''}`}
                  placeholder="۱۰ رقم کد پستی"
                  value={formData.postalCode}
                  onChange={handleChange}
                  disabled={loading}
                  dir="ltr"
                  maxLength={10}
                />
                {errors.postalCode && (
                  <div className="auth-form-error show">
                    <i className="fas fa-exclamation-circle"></i>
                    {errors.postalCode}
                  </div>
                )}
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
                    با{' '}
                    <a href="/terms" className="auth-link" target="_blank" rel="noopener noreferrer">
                      قوانین و مقررات عمومی
                    </a>
                    {' '}SODmAX موافقت می‌کنم
                  </span>
                </label>
              </div>
              
              <div className="auth-form-group">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    name="acceptBusinessTerms"
                    checked={formData.acceptBusinessTerms}
                    onChange={handleChange}
                    disabled={loading}
                    className="form-checkbox"
                  />
                  <span className="text-sm">
                    با{' '}
                    <a href="/business-terms" className="auth-link" target="_blank" rel="noopener noreferrer">
                      شرایط خاص کسب‌وکار
                    </a>
                    {' '}و قوانین کمپین‌سازی موافقت می‌کنم
                  </span>
                </label>
              </div>
              
              {errors.terms && (
                <div className="auth-form-error show">
                  <i className="fas fa-exclamation-circle"></i>
                  {errors.terms}
                </div>
              )}
            </div>
          </>
        );
        
      default:
        return null;
    }
  };

  if (registrationSuccess) {
    return (
      <div className="auth-container">
        <div className="auth-background"></div>
        <div className="auth-card">
          <div className="auth-success-message">
            <div className="auth-success-icon">🏢</div>
            <h2 className="auth-success-title">ثبت‌نام موفق!</h2>
            <p className="auth-success-text">
              حساب کسب‌وکار شما با موفقیت ایجاد شد.
              <br />
              تیم پشتیبانی طی ۲۴ ساعت کاری برای تأیید نهایی با شما تماس خواهد گرفت.
              <br />
              در حال انتقال به پنل کسب‌وکار...
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
          <div className="auth-logo-icon">🏢</div>
          <div className="auth-logo-text">
            <div className="auth-logo-title">SODmAX Business</div>
            <div className="auth-logo-subtitle">CityVerse Pro</div>
          </div>
        </div>
        
        {renderStepContent()}
        
        <div className="mt-8">
          {step < 3 ? (
            <button
              type="button"
              className="auth-button"
              onClick={handleNextStep}
              disabled={loading}
            >
              {loading ? (
                <>
                  <i className="fas fa-spinner fa-spin"></i>
                  در حال پردازش...
                </>
              ) : (
                <>
                  مرحله بعد
                  <i className="fas fa-arrow-left"></i>
                </>
              )}
            </button>
          ) : (
            <button
              type="button"
              className="auth-button"
              onClick={handleSubmit}
              disabled={loading}
            >
              {loading ? (
                <>
                  <i className="fas fa-spinner fa-spin"></i>
                  در حال ثبت‌نام...
                </>
              ) : (
                <>
                  <i className="fas fa-check-circle"></i>
                  تکمیل ثبت‌نام
                </>
              )}
            </button>
          )}
        </div>
        
        <div className="auth-switch">
          <span className="auth-switch-text">حساب کاربری دارید؟</span>
          <Link to="/login" className="auth-switch-button">
            ورود به حساب
          </Link>
        </div>
        
        <div className="auth-terms">
          برای ثبت‌نام کاربر عادی،{' '}
          <Link to="/register" className="auth-link">
            اینجا کلیک کنید
          </Link>
        </div>
        
        {/* نمایش پیشرفت */}
        <div className="mt-6">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-secondary">مرحله {step} از ۳</span>
            <span className="text-sm font-bold">{Math.round((step / 3) * 100)}%</span>
          </div>
          <div className="progress-bar">
            <div 
              className="progress-fill" 
              style={{ width: `${(step / 3) * 100}%` }}
            ></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BusinessRegister;
