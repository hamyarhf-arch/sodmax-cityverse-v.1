import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import '../../styles/main.css';
import '../../styles/animations.css';

const MobileNav = () => {
  const location = useLocation();
  const { user, logout } = useAuth();
  
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState([
    { id: 1, title: '🎉 به‌روزرسانی جدید', message: 'سیستم 3D اضافه شد!', time: '۵ دقیقه پیش', unread: true },
    { id: 2, title: '💰 پاداش دریافت شد', message: 'مأموریت کلیک روزانه تکمیل شد!', time: '۲ ساعت پیش', unread: true },
    { id: 3, title: '🤝 دعوت موفق', message: 'دوست شما ثبت‌نام کرد!', time: '۱ روز پیش', unread: false },
    { id: 4, title: '🏆 افزایش سطح', message: 'به سطح ۵ رسیدید!', time: '۲ روز پیش', unread: false }
  ]);

  const navItems = [
    { id: 'dashboard', label: 'داشبورد', icon: 'fas fa-home', path: '/dashboard' },
    { id: 'mining', label: 'استخراج', icon: 'fas fa-hard-hat', path: '/mining' },
    { id: 'wallet', label: 'کیف پول', icon: 'fas fa-wallet', path: '/wallet' },
    { id: 'missions', label: 'مأموریت‌ها', icon: 'fas fa-tasks', path: '/missions' },
    { id: 'invite', label: 'دعوت دوستان', icon: 'fas fa-user-plus', path: '/invite' },
    { id: 'rewards', label: 'پاداش‌ها', icon: 'fas fa-gift', path: '/rewards' }
  ];

  const menuItems = [
    {
      group: 'اصلی',
      items: [
        { id: 'dashboard', label: 'داشبورد', icon: 'fas fa-chart-pie', path: '/dashboard' },
        { id: 'mining', label: 'استخراج', icon: 'fas fa-hard-hat', path: '/mining', badge: 'جدید' },
        { id: 'wallet', label: 'کیف پول', icon: 'fas fa-wallet', path: '/wallet' },
        { id: 'invite', label: 'دعوت دوستان', icon: 'fas fa-user-plus', path: '/invite', badge: '24' }
      ]
    },
    {
      group: 'بازی و سرگرمی',
      items: [
        { id: 'missions', label: 'مأموریت‌ها', icon: 'fas fa-tasks', path: '/missions', badge: '3' },
        { id: 'rewards', label: 'پاداش‌ها', icon: 'fas fa-gift', path: '/rewards' }
      ]
    },
    {
      group: 'سیستم',
      items: [
        { id: 'support', label: 'پشتیبانی', icon: 'fas fa-headset', path: '/support' },
        { id: 'settings', label: 'تنظیمات', icon: 'fas fa-cog', path: '/settings' },
        { id: 'profile', label: 'پروفایل', icon: 'fas fa-user', path: '/profile' }
      ]
    }
  ];

  useEffect(() => {
    // شناسایی تب فعال بر اساس مسیر
    const currentPath = location.pathname;
    const activeItem = navItems.find(item => currentPath.startsWith(item.path));
    if (activeItem) {
      setActiveTab(activeItem.id);
    }
  }, [location.pathname]);

  const unreadCount = notifications.filter(n => n.unread).length;

  const handleLogout = () => {
    if (confirm('آیا از خروج از حساب کاربری خود مطمئن هستید؟')) {
      logout();
      setIsOpen(false);
    }
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, unread: false })));
  };

  const toggleMenu = () => {
    setIsOpen(!isOpen);
    setShowNotifications(false);
  };

  const toggleNotifications = () => {
    setShowNotifications(!showNotifications);
    setIsOpen(false);
  };

  return (
    <>
      {/* نوار پایین موبایل */}
      <nav className="mobile-bottom-nav lg:hidden">
        {navItems.map(item => (
          <Link
            key={item.id}
            to={item.path}
            className={`bottom-nav-item ${activeTab === item.id ? 'active' : ''}`}
            onClick={() => setActiveTab(item.id)}
          >
            <i className={`${item.icon} bottom-nav-icon`}></i>
            <span className="bottom-nav-label">{item.label}</span>
          </Link>
        ))}
      </nav>

      {/* هدر موبایل */}
      <header className="mobile-header lg:hidden">
        <div className="logo-mobile">
          <div className="logo-icon-mobile">⚡</div>
          <div className="logo-text-mobile">
            <div className="logo-title-mobile">SODmAX</div>
            <div className="logo-subtitle-mobile">CityVerse Pro</div>
          </div>
        </div>
        
        <div className="header-actions-mobile">
          <button 
            className="header-btn relative"
            onClick={toggleNotifications}
          >
            <i className="fas fa-bell"></i>
            {unreadCount > 0 && (
              <span className="notification-badge">{unreadCount}</span>
            )}
          </button>
          <button 
            className="header-btn"
            onClick={toggleMenu}
          >
            <i className="fas fa-bars"></i>
          </button>
        </div>
      </header>

      {/* منوی کشویی */}
      <div className={`mobile-menu-overlay ${isOpen ? 'active' : ''}`}>
        <div className="menu-header-mobile">
          <div className="user-avatar-mobile">
            {user?.name?.charAt(0) || 'ع'}
          </div>
          <div className="user-info-mobile">
            <h4>{user?.name || 'علی محمدی'}</h4>
            <p>
              <span className="status-dot"></span>
              <span>آنلاین - سطح ۵</span>
            </p>
          </div>
        </div>
        
        <nav className="mobile-nav">
          {menuItems.map((group, groupIndex) => (
            <div key={groupIndex} className="nav-group-mobile">
              <div className="nav-group-title-mobile">{group.group}</div>
              {group.items.map(item => (
                <Link
                  key={item.id}
                  to={item.path}
                  className={`nav-item-mobile ${activeTab === item.id ? 'active' : ''}`}
                  onClick={() => {
                    setActiveTab(item.id);
                    setIsOpen(false);
                  }}
                >
                  <div className="nav-icon-mobile">
                    <i className={item.icon}></i>
                  </div>
                  <div className="nav-label-mobile">{item.label}</div>
                  {item.badge && (
                    <span className="nav-badge-mobile">{item.badge}</span>
                  )}
                </Link>
              ))}
            </div>
          ))}
        </nav>
        
        <div className="menu-stats-mobile">
          <div className="menu-stat">
            <div className="stat-value-menu">1.8M</div>
            <div className="stat-label-menu">SOD</div>
          </div>
          <div className="menu-stat">
            <div className="stat-value-menu">28K</div>
            <div className="stat-label-menu">تومان</div>
          </div>
          <div className="menu-stat">
            <div className="stat-value-menu">124K</div>
            <div className="stat-label-menu">درآمد کل</div>
          </div>
        </div>
      </div>

      {/* پنل نوتیفیکیشن‌ها */}
      <div className={`notification-panel-mobile ${showNotifications ? 'active' : ''}`}>
        <div className="notification-header-mobile">
          <h3>نوتیفیکیشن‌ها</h3>
          <div className="flex items-center gap-2">
            <button 
              className="btn btn-ghost btn-sm"
              onClick={markAllAsRead}
            >
              خواندن همه
            </button>
            <button 
              className="btn btn-ghost btn-sm"
              onClick={toggleNotifications}
            >
              <i className="fas fa-times"></i>
            </button>
          </div>
        </div>
        
        <div className="notification-list-mobile">
          {notifications.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-4xl mb-4">🔔</div>
              <div className="text-secondary">هیچ نوتیفیکیشنی وجود ندارد</div>
            </div>
          ) : (
            notifications.map(notification => (
              <div 
                key={notification.id}
                className={`notification-item-mobile ${notification.unread ? 'unread' : ''}`}
                onClick={() => {
                  setNotifications(prev => 
                    prev.map(n => 
                      n.id === notification.id ? { ...n, unread: false } : n
                    )
                  );
                }}
              >
                <div className="notification-icon-mobile">
                  <i className="fas fa-bell"></i>
                </div>
                <div className="notification-content-mobile">
                  <div className="notification-title-mobile">
                    {notification.title}
                  </div>
                  <div className="notification-message-mobile">
                    {notification.message}
                  </div>
                  <div className="notification-time-mobile">
                    {notification.time}
                  </div>
                </div>
                {notification.unread && (
                  <div className="notification-dot-mobile"></div>
                )}
              </div>
            ))
          )}
        </div>
        
        <div className="notification-footer-mobile">
          <button className="btn btn-primary w-full">
            مشاهده همه نوتیفیکیشن‌ها
          </button>
        </div>
      </div>

      {/* استایل‌های موبایل */}
      <style jsx>{`
        .mobile-bottom-nav {
          position: fixed;
          bottom: 0;
          left: 0;
          right: 0;
          background: var(--bg-surface);
          backdrop-filter: blur(20px);
          border-top: 1px solid rgba(255, 255, 255, 0.15);
          display: flex;
          justify-content: space-around;
          padding: var(--space-sm) 0;
          z-index: var(--z-fixed);
        }
        
        .mobile-header {
          background: var(--bg-surface);
          backdrop-filter: blur(20px);
          padding: var(--space-md);
          border-bottom: 1px solid rgba(255, 255, 255, 0.15);
          position: sticky;
          top: 0;
          z-index: var(--z-fixed);
          display: flex;
          align-items: center;
          justify-content: space-between;
        }
        
        .logo-mobile {
          display: flex;
          align-items: center;
          gap: var(--space-sm);
        }
        
        .logo-icon-mobile {
          width: 40px;
          height: 40px;
          background: var(--gradient-primary);
          border-radius: var(--radius-md);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 18px;
          font-weight: 900;
          color: white;
          box-shadow: var(--shadow-primary);
        }
        
        .logo-text-mobile {
          display: flex;
          flex-direction: column;
        }
        
        .logo-title-mobile {
          font-size: 16px;
          font-weight: 900;
          background: var(--gradient-primary);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          line-height: 1.2;
        }
        
        .logo-subtitle-mobile {
          font-size: 10px;
          color: var(--text-tertiary);
        }
        
        .header-actions-mobile {
          display: flex;
          gap: var(--space-sm);
        }
        
        .header-btn {
          width: 40px;
          height: 40px;
          border-radius: var(--radius-md);
          background: rgba(255, 255, 255, 0.1);
          border: 1px solid rgba(255, 255, 255, 0.2);
          color: var(--text-primary);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 16px;
          transition: all var(--transition-fast);
          position: relative;
        }
        
        .notification-badge {
          position: absolute;
          top: -4px;
          left: -4px;
          background: var(--accent);
          color: white;
          font-size: 10px;
          font-weight: 900;
          width: 18px;
          height: 18px;
          border-radius: var(--radius-full);
          display: flex;
          align-items: center;
          justify-content: center;
          border: 2px solid var(--bg-surface);
        }
        
        .mobile-menu-overlay {
          position: fixed;
          top: 0;
          right: -100%;
          width: 85%;
          height: 100%;
          background: var(--bg-surface);
          backdrop-filter: blur(30px);
          z-index: var(--z-modal);
          transition: right var(--transition-bounce);
          padding: var(--space-xl) var(--space-lg);
          overflow-y: auto;
          border-left: 1px solid rgba(255, 255, 255, 0.15);
          box-shadow: var(--shadow-lg);
        }
        
        .mobile-menu-overlay.active {
          right: 0;
        }
        
        .notification-panel-mobile {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: var(--bg-overlay);
          backdrop-filter: blur(20px);
          z-index: var(--z-modal);
          transform: translateY(-100%);
          transition: transform var(--transition-bounce);
          display: flex;
          flex-direction: column;
        }
        
        .notification-panel-mobile.active {
          transform: translateY(0);
        }
        
        .notification-header-mobile {
          padding: var(--space-md);
          border-bottom: 1px solid rgba(255, 255, 255, 0.15);
          display: flex;
          align-items: center;
          justify-content: space-between;
        }
        
        .notification-header-mobile h3 {
          font-size: 18px;
          font-weight: 900;
          margin: 0;
        }
        
        .notification-list-mobile {
          flex: 1;
          overflow-y: auto;
          padding: var(--space-md);
        }
        
        .notification-item-mobile {
          display: flex;
          align-items: flex-start;
          gap: var(--space-md);
          padding: var(--space-md);
          background: rgba(255, 255, 255, 0.05);
          border-radius: var(--radius-lg);
          margin-bottom: var(--space-sm);
          position: relative;
          cursor: pointer;
        }
        
        .notification-item-mobile.unread {
          background: rgba(0, 102, 255, 0.1);
          border-right: 4px solid var(--primary);
        }
        
        .notification-icon-mobile {
          width: 36px;
          height: 36px;
          background: var(--gradient-primary);
          border-radius: var(--radius-full);
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-size: 14px;
          flex-shrink: 0;
        }
        
        .notification-content-mobile {
          flex: 1;
          min-width: 0;
        }
        
        .notification-title-mobile {
          font-weight: 700;
          font-size: 14px;
          margin-bottom: 4px;
        }
        
        .notification-message-mobile {
          font-size: 12px;
          color: var(--text-secondary);
          line-height: 1.4;
          margin-bottom: 4px;
        }
        
        .notification-time-mobile {
          font-size: 11px;
          color: var(--text-tertiary);
        }
        
        .notification-dot-mobile {
          width: 8px;
          height: 8px;
          background: var(--primary);
          border-radius: var(--radius-full);
          position: absolute;
          top: 12px;
          right: 12px;
        }
        
        .notification-footer-mobile {
          padding: var(--space-md);
          border-top: 1px solid rgba(255, 255, 255, 0.15);
        }
        
        @media (min-width: 768px) {
          .mobile-menu-overlay {
            width: 300px;
          }
        }
      `}</style>
    </>
  );
};

export default MobileNav;
