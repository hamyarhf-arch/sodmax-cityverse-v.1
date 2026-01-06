import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import './MobileNav.css';

const MobileNav = () => {
  const location = useLocation();
  const { user, logout } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('dashboard');
  const [notificationsCount, setNotificationsCount] = useState(0);

  const navItems = [
    {
      id: 'dashboard',
      icon: 'fas fa-home',
      label: 'داشبورد',
      path: '/dashboard',
      badge: null
    },
    {
      id: 'mining',
      icon: 'fas fa-hard-hat',
      label: 'استخراج',
      path: '/mining',
      badge: 'جدید'
    },
    {
      id: 'wallet',
      icon: 'fas fa-wallet',
      label: 'کیف پول',
      path: '/wallet',
      badge: null
    },
    {
      id: 'missions',
      icon: 'fas fa-tasks',
      label: 'مأموریت‌ها',
      path: '/missions',
      badge: '3'
    },
    {
      id: 'invite',
      icon: 'fas fa-user-plus',
      label: 'دعوت دوستان',
      path: '/invite',
      badge: user?.referralCount > 0 ? user.referralCount.toString() : null
    },
    {
      id: 'rewards',
      icon: 'fas fa-gift',
      label: 'پاداش‌ها',
      path: '/rewards',
      badge: null
    },
    {
      id: 'campaigns',
      icon: 'fas fa-bullhorn',
      label: 'کمپین‌ها',
      path: '/campaigns',
      badge: null
    },
    {
      id: 'support',
      icon: 'fas fa-headset',
      label: 'پشتیبانی',
      path: '/support',
      badge: null
    },
    {
      id: 'settings',
      icon: 'fas fa-cog',
      label: 'تنظیمات',
      path: '/settings',
      badge: null
    },
    {
      id: 'profile',
      icon: 'fas fa-user',
      label: 'پروفایل',
      path: '/profile',
      badge: null
    }
  ];

  const menuItems = [
    {
      group: 'اصلی',
      items: [
        { id: 'dashboard', icon: 'fas fa-chart-pie', label: 'داشبورد', path: '/dashboard' },
        { id: 'mining', icon: 'fas fa-hard-hat', label: 'استخراج', path: '/mining', badge: 'جدید' },
        { id: 'wallet', icon: 'fas fa-wallet', label: 'کیف پول', path: '/wallet' },
        { id: 'invite', icon: 'fas fa-user-plus', label: 'دعوت دوستان', path: '/invite', badge: user?.referralCount > 0 ? user.referralCount.toString() : null }
      ]
    },
    {
      group: 'بازی و سرگرمی',
      items: [
        { id: 'missions', icon: 'fas fa-tasks', label: 'مأموریت‌ها', path: '/missions', badge: '3' },
        { id: 'rewards', icon: 'fas fa-gift', label: 'پاداش‌ها', path: '/rewards' },
        { id: 'campaigns', icon: 'fas fa-bullhorn', label: 'کمپین‌ها', path: '/campaigns' }
      ]
    },
    {
      group: 'سیستم',
      items: [
        { id: 'support', icon: 'fas fa-headset', label: 'پشتیبانی', path: '/support' },
        { id: 'settings', icon: 'fas fa-cog', label: 'تنظیمات', path: '/settings' },
        { id: 'profile', icon: 'fas fa-user', label: 'پروفایل', path: '/profile' },
        { id: 'logout', icon: 'fas fa-sign-out-alt', label: 'خروج', action: 'logout' }
      ]
    }
  ];

  useEffect(() => {
    // تشخیص بخش فعال بر اساس مسیر
    const path = location.pathname;
    const activeItem = navItems.find(item => item.path === path) || navItems[0];
    setActiveSection(activeItem.id);

    // بستن منو هنگام تغییر مسیر
    setIsOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    // شبیه‌سازی تعداد نوتیفیکیشن‌های خوانده نشده
    const count = Math.floor(Math.random() * 5);
    setNotificationsCount(count);
  }, []);

  const handleLogout = async () => {
    try {
      await logout();
      window.location.href = '/login';
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const handleMenuItemClick = (item) => {
    if (item.action === 'logout') {
      handleLogout();
    }
    setIsOpen(false);
  };

  const getInitials = (name) => {
    if (!name) return 'ع';
    const parts = name.split(' ');
    if (parts.length === 1) return parts[0].charAt(0);
    return parts[0].charAt(0) + parts[1].charAt(0);
  };

  const toggleMenu = () => {
    setIsOpen(!isOpen);
    // جلوگیری از اسکرول بدن هنگام باز بودن منو
    if (!isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
  };

  // بستن منو هنگام کلیک خارج
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isOpen && !event.target.closest('.mobile-nav-container') && !event.target.closest('.menu-toggle')) {
        setIsOpen(false);
        document.body.style.overflow = '';
      }
    };

    const handleEscape = (event) => {
      if (isOpen && event.key === 'Escape') {
        setIsOpen(false);
        document.body.style.overflow = '';
      }
    };

    document.addEventListener('click', handleClickOutside);
    document.addEventListener('keydown', handleEscape);

    return () => {
      document.removeEventListener('click', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  return (
    <>
      {/* هدر موبایل */}
      <header className="mobile-header">
        <div className="mobile-header-content">
          <Link to="/dashboard" className="mobile-logo">
            <div className="logo-icon">⚡</div>
            <div className="logo-text">
              <div className="logo-title">SODmAX</div>
              <div className="logo-subtitle">CityVerse</div>
            </div>
          </Link>

          <div className="mobile-header-actions">
            <button 
              className="header-action-btn notification-btn"
              onClick={() => window.location.href = '/notifications'}
            >
              <i className="fas fa-bell"></i>
              {notificationsCount > 0 && (
                <span className="notification-badge">{notificationsCount}</span>
              )}
            </button>

            <button 
              className="header-action-btn menu-toggle"
              onClick={toggleMenu}
              aria-label={isOpen ? 'بستن منو' : 'باز کردن منو'}
            >
              <i className={isOpen ? 'fas fa-times' : 'fas fa-bars'}></i>
            </button>
          </div>
        </div>
      </header>

      {/* منوی کشویی */}
      <div className={`mobile-menu-overlay ${isOpen ? 'active' : ''}`}>
        <div className="mobile-menu-content">
          {/* هدر منو */}
          <div className="menu-header">
            <div className="user-avatar">
              {getInitials(user?.name || 'کاربر')}
            </div>
            <div className="user-info">
              <h3 className="user-name">{user?.name || 'کاربر مهمان'}</h3>
              <div className="user-status">
                <span className="status-dot online"></span>
                <span className="status-text">
                  سطح {user?.level || '۱'} | آنلاین
                </span>
              </div>
            </div>
            <button 
              className="menu-close"
              onClick={toggleMenu}
              aria-label="بستن منو"
            >
              <i className="fas fa-times"></i>
            </button>
          </div>

          {/* آمار سریع */}
          <div className="menu-stats">
            <div className="menu-stat">
              <div className="stat-value">{user?.sodBalance?.toLocaleString('fa-IR') || '۰'}</div>
              <div className="stat-label">SOD</div>
            </div>
            <div className="menu-stat">
              <div className="stat-value">{user?.tomanBalance?.toLocaleString('fa-IR') || '۰'}</div>
              <div className="stat-label">تومان</div>
            </div>
            <div className="menu-stat">
              <div className="stat-value">{user?.referralCount || '۰'}</div>
              <div className="stat-label">زیرمجموعه</div>
            </div>
          </div>

          {/* آیتم‌های منو */}
          <nav className="mobile-menu-nav">
            {menuItems.map((group, groupIndex) => (
              <div key={groupIndex} className="menu-group">
                <div className="menu-group-title">{group.group}</div>
                <div className="menu-items">
                  {group.items.map((item) => (
                    <Link
                      key={item.id}
                      to={item.path || '#'}
                      className={`menu-item ${activeSection === item.id ? 'active' : ''}`}
                      onClick={() => handleMenuItemClick(item)}
                    >
                      <div className="menu-item-icon">
                        <i className={item.icon}></i>
                      </div>
                      <div className="menu-item-label">{item.label}</div>
                      {item.badge && (
                        <span className="menu-item-badge">{item.badge}</span>
                      )}
                    </Link>
                  ))}
                </div>
              </div>
            ))}
          </nav>

          {/* فوتر منو */}
          <div className="menu-footer">
            <div className="app-version">
              <i className="fas fa-info-circle"></i>
              <span>نسخه ۲.۰.۰</span>
            </div>
            <button 
              className="dark-mode-toggle"
              onClick={() => {
                // تغییر تم
                const html = document.documentElement;
                const isDark = html.classList.contains('dark');
                if (isDark) {
                  html.classList.remove('dark');
                  localStorage.setItem('theme', 'light');
                } else {
                  html.classList.add('dark');
                  localStorage.setItem('theme', 'dark');
                }
              }}
            >
              <i className="fas fa-moon"></i>
              <span>حالت شب</span>
            </button>
          </div>
        </div>
      </div>

      {/* نوار پایین */}
      <nav className="mobile-bottom-nav">
        {navItems.slice(0, 5).map((item) => (
          <Link
            key={item.id}
            to={item.path}
            className={`bottom-nav-item ${activeSection === item.id ? 'active' : ''}`}
            onClick={() => setActiveSection(item.id)}
          >
            <div className="bottom-nav-icon">
              <i className={item.icon}></i>
              {item.badge && (
                <span className="bottom-nav-badge">{item.badge}</span>
              )}
            </div>
            <div className="bottom-nav-label">{item.label}</div>
          </Link>
        ))}
      </nav>
    </>
  );
};

export default MobileNav;
