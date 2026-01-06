import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useMission } from '../../contexts/MissionContext';
import MiningCenter from './MiningCenter';
import MissionCard from '../Missions/MissionCard';
import '../../styles/main.css';
import '../../styles/animations.css';

const UserDashboard = () => {
  const { user } = useAuth();
  const { missions, loading: missionsLoading } = useMission();
  
  const [dashboardStats, setDashboardStats] = useState({
    sodBalance: 1845200,
    tomanBalance: 28400,
    miningPower: 18,
    totalEarned: 124500,
    referralCount: 24,
    level: 5,
    todayEarnings: 2450,
    totalMined: 1845200,
    activeMissions: 3,
    completedMissions: 48
  });

  const [quickActions] = useState([
    {
      id: 1,
      icon: '⚡',
      label: 'استخراج دستی',
      description: 'دریافت SOD فوری',
      color: 'primary',
      action: 'mine',
      disabled: false
    },
    {
      id: 2,
      icon: '🤝',
      label: 'دعوت دوست',
      description: '+۱,۰۰۰ تومان پاداش',
      color: 'secondary',
      action: 'invite',
      disabled: false
    },
    {
      id: 3,
      icon: '💰',
      label: 'برداشت تومان',
      description: 'حداقل ۱۰,۰۰۰ تومان',
      color: 'success',
      action: 'withdraw',
      disabled: false
    },
    {
      id: 4,
      icon: '🎁',
      label: 'پاداش روزانه',
      description: '+۱,۰۰۰ تومان رایگان',
      color: 'accent',
      action: 'daily',
      disabled: false
    }
  ]);

  const [notifications, setNotifications] = useState([
    {
      id: 1,
      type: 'update',
      title: '🎉 به‌روزرسانی جدید',
      message: 'سیستم 3D و افکت‌های جدید اضافه شد!',
      time: '۵ دقیقه پیش',
      unread: true
    },
    {
      id: 2,
      type: 'reward',
      title: '💰 پاداش دریافت شد',
      message: 'مأموریت کلیک روزانه تکمیل شد! +۵۰۰ تومان',
      time: '۲ ساعت پیش',
      unread: true
    },
    {
      id: 3,
      type: 'referral',
      title: '🤝 دعوت موفق',
      message: 'دوست شما ثبت‌نام کرد! +۱,۰۰۰ تومان پاداش',
      time: '۱ روز پیش',
      unread: false
    },
    {
      id: 4,
      type: 'level',
      title: '🏆 افزایش سطح',
      message: 'به سطح ۵ رسیدید! پاداش ویژه دریافت کنید.',
      time: '۲ روز پیش',
      unread: false
    }
  ]);

  const [recentActivities] = useState([
    {
      id: 1,
      type: 'mining',
      title: 'استخراج دستی',
      amount: '+180 SOD',
      time: 'همین حالا',
      icon: '⚡',
      color: 'primary'
    },
    {
      id: 2,
      type: 'mission',
      title: 'تکمیل مأموریت',
      amount: '+500 تومان',
      time: '۲ ساعت پیش',
      icon: '🎯',
      color: 'secondary'
    },
    {
      id: 3,
      type: 'referral',
      title: 'پاداش دعوت',
      amount: '+1,000 تومان',
      time: '۱ روز پیش',
      icon: '🤝',
      color: 'success'
    },
    {
      id: 4,
      type: 'upgrade',
      title: 'ارتقاء ماینر',
      amount: '-25,000 SOD',
      time: '۲ روز پیش',
      icon: '⬆️',
      color: 'accent'
    }
  ]);

  const handleQuickAction = (action) => {
    switch (action) {
      case 'mine':
        alert('استخراج دستی انجام شد! +180 SOD');
        setDashboardStats(prev => ({
          ...prev,
          todayEarnings: prev.todayEarnings + 180,
          totalMined: prev.totalMined + 180,
          sodBalance: prev.sodBalance + 180
        }));
        break;
      case 'invite':
        navigator.clipboard.writeText(user?.referralLink || '');
        alert('لینک دعوت کپی شد!');
        break;
      case 'withdraw':
        if (dashboardStats.tomanBalance < 10000) {
          alert('حداقل مبلغ برداشت ۱۰,۰۰۰ تومان است');
        } else {
          alert('درخواست برداشت ثبت شد. طی ۲۴ ساعت کاری واریز می‌شود.');
          setDashboardStats(prev => ({ ...prev, tomanBalance: 0 }));
        }
        break;
      case 'daily':
        alert('پاداش روزانه دریافت شد! +۱,۰۰۰ تومان');
        setDashboardStats(prev => ({
          ...prev,
          tomanBalance: prev.tomanBalance + 1000,
          totalEarned: prev.totalEarned + 1000
        }));
        break;
    }
  };

  const markNotificationAsRead = (notificationId) => {
    setNotifications(prev =>
      prev.map(notif =>
        notif.id === notificationId ? { ...notif, unread: false } : notif
      )
    );
  };

  const unreadCount = notifications.filter(n => n.unread).length;

  return (
    <div className="user-dashboard">
      {/* هدر کاربر */}
      <div className="card mb-8 animate-fadeIn">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="avatar avatar-xl">
                {user?.name?.charAt(0) || 'ع'}
              </div>
              <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-success rounded-full border-2 border-bg-surface flex items-center justify-center">
                <div className="w-2 h-2 bg-white rounded-full"></div>
              </div>
            </div>
            <div>
              <h1 className="text-2xl font-bold">{user?.name || 'علی محمدی'}</h1>
              <div className="flex items-center gap-2 text-secondary">
                <span>سطح {dashboardStats.level}</span>
                <span>•</span>
                <span>{user?.phone || '۰۹۱۲۳۴۵۶۷۸۹'}</span>
                <span>•</span>
                <span className="text-success">آنلاین</span>
              </div>
            </div>
          </div>
          
          <div className="flex gap-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">
                {dashboardStats.totalEarned.toLocaleString('fa-IR')}
              </div>
              <div className="text-sm text-secondary">درآمد کل</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-secondary">
                {dashboardStats.referralCount}
              </div>
              <div className="text-sm text-secondary">زیرمجموعه</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-accent">
                {dashboardStats.completedMissions}
              </div>
              <div className="text-sm text-secondary">مأموریت</div>
            </div>
          </div>
        </div>
      </div>

      {/* آمار اصلی */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="card card-primary hover:scale-105 transition-transform">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-secondary mb-1">موجودی SOD</div>
              <div className="text-3xl font-bold text-primary">
                {dashboardStats.sodBalance.toLocaleString('fa-IR')}
              </div>
            </div>
            <div className="text-3xl animate-pulse">⚡</div>
          </div>
          <div className="mt-4">
            <Link to="/wallet" className="text-sm text-primary font-semibold flex items-center gap-1">
              مدیریت کیف پول
              <i className="fas fa-arrow-left"></i>
            </Link>
          </div>
        </div>
        
        <div className="card card-success hover:scale-105 transition-transform">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-secondary mb-1">موجودی تومان</div>
              <div className="text-3xl font-bold text-success">
                {dashboardStats.tomanBalance.toLocaleString('fa-IR')}
              </div>
            </div>
            <div className="text-3xl">💰</div>
          </div>
          <div className="mt-4">
            <button 
              className="text-sm text-success font-semibold flex items-center gap-1"
              onClick={() => handleQuickAction('withdraw')}
            >
              درخواست برداشت
              <i className="fas fa-arrow-left"></i>
            </button>
          </div>
        </div>
        
        <div className="card card-accent hover:scale-105 transition-transform">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-secondary mb-1">قدرت استخراج</div>
              <div className="text-3xl font-bold text-accent">
                {dashboardStats.miningPower}x
              </div>
            </div>
            <div className="text-3xl animate-mining-glow">⚡</div>
          </div>
          <div className="mt-4">
            <Link to="/mining" className="text-sm text-accent font-semibold flex items-center gap-1">
              ارتقاء ماینر
              <i className="fas fa-arrow-left"></i>
            </Link>
          </div>
        </div>
        
        <div className="card hover:scale-105 transition-transform">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-secondary mb-1">سطح کاربری</div>
              <div className="text-3xl font-bold">
                {dashboardStats.level}
              </div>
            </div>
            <div className="text-3xl">🏆</div>
          </div>
          <div className="mt-4">
            <div className="text-sm text-tertiary">
              تا سطح بعدی: ۵۰,۰۰۰ SOD
            </div>
          </div>
        </div>
      </div>

      {/* اقدامات سریع */}
      <div className="card mb-8">
        <h2 className="text-2xl font-bold mb-6">اقدامات سریع</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {quickActions.map(action => (
            <button
              key={action.id}
              className="flex flex-col items-center p-6 bg-glass rounded-xl hover:bg-glass/50 transition-all hover:scale-105 cursor-pointer"
              onClick={() => handleQuickAction(action.action)}
              disabled={action.disabled}
            >
              <div 
                className={`w-16 h-16 rounded-full flex items-center justify-center text-2xl mb-4 ${
                  action.color === 'primary' ? 'bg-primary/20 text-primary' :
                  action.color === 'secondary' ? 'bg-secondary/20 text-secondary' :
                  action.color === 'success' ? 'bg-success/20 text-success' :
                  'bg-accent/20 text-accent'
                }`}
              >
                {action.icon}
              </div>
              <div className="font-bold mb-2">{action.label}</div>
              <div className="text-sm text-secondary text-center">{action.description}</div>
            </button>
          ))}
        </div>
      </div>

      {/* مرکز استخراج */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">مرکز استخراج SOD</h2>
          <Link to="/mining" className="text-primary font-semibold flex items-center gap-1">
            مشاهده جزئیات
            <i className="fas fa-arrow-left"></i>
          </Link>
        </div>
        <MiningCenter />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* مأموریت‌های فعال */}
        <div className="card">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold">مأموریت‌های فعال</h2>
            <Link to="/missions" className="text-primary font-semibold flex items-center gap-1">
              همه مأموریت‌ها
              <i className="fas fa-arrow-left"></i>
            </Link>
          </div>
          
          {missionsLoading ? (
            <div className="flex justify-center py-12">
              <div className="loader"></div>
            </div>
          ) : missions.length > 0 ? (
            <div className="space-y-4">
              {missions.slice(0, 3).map(mission => (
                <MissionCard key={mission.id} mission={mission} />
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <div className="text-4xl mb-4">🎯</div>
              <div className="text-secondary mb-4">هیچ مأموریت فعالی ندارید</div>
              <button className="btn btn-primary">
                مشاهده مأموریت‌های جدید
              </button>
            </div>
          )}
        </div>

        {/* نوتیفیکیشن‌ها و فعالیت‌ها */}
        <div className="space-y-8">
          {/* نوتیفیکیشن‌ها */}
          <div className="card">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">نوتیفیکیشن‌ها</h2>
              <div className="flex items-center gap-2">
                {unreadCount > 0 && (
                  <span className="bg-accent text-white text-xs font-bold px-2 py-1 rounded-full">
                    {unreadCount} جدید
                  </span>
                )}
                <button 
                  className="text-primary font-semibold flex items-center gap-1"
                  onClick={() => setNotifications(prev => prev.map(n => ({ ...n, unread: false })))}
                >
                  علامت‌خوانده‌شدن همه
                </button>
              </div>
            </div>
            
            <div className="space-y-4 max-h-80 overflow-y-auto">
              {notifications.map(notification => (
                <div
                  key={notification.id}
                  className={`p-4 rounded-lg cursor-pointer transition-all hover:bg-glass ${
                    notification.unread ? 'bg-primary/5 border-r-4 border-primary' : 'bg-glass'
                  }`}
                  onClick={() => markNotificationAsRead(notification.id)}
                >
                  <div className="flex justify-between items-start mb-2">
                    <div className="font-bold">{notification.title}</div>
                    {notification.unread && (
                      <div className="w-2 h-2 bg-primary rounded-full"></div>
                    )}
                  </div>
                  <p className="text-secondary mb-2">{notification.message}</p>
                  <div className="text-sm text-tertiary">{notification.time}</div>
                </div>
              ))}
            </div>
          </div>

          {/* فعالیت‌های اخیر */}
          <div className="card">
            <h2 className="text-2xl font-bold mb-6">فعالیت‌های اخیر</h2>
            
            <div className="space-y-4">
              {recentActivities.map(activity => (
                <div key={activity.id} className="flex items-center gap-4 p-3 bg-glass rounded-lg">
                  <div 
                    className={`w-12 h-12 rounded-full flex items-center justify-center text-xl ${
                      activity.color === 'primary' ? 'bg-primary/20 text-primary' :
                      activity.color === 'secondary' ? 'bg-secondary/20 text-secondary' :
                      activity.color === 'success' ? 'bg-success/20 text-success' :
                      'bg-accent/20 text-accent'
                    }`}
                  >
                    {activity.icon}
                  </div>
                  <div className="flex-1">
                    <div className="font-bold">{activity.title}</div>
                    <div className="text-sm text-tertiary">{activity.time}</div>
                  </div>
                  <div className={`font-bold ${
                    activity.amount.startsWith('+') ? 'text-success' : 'text-accent'
                  }`}>
                    {activity.amount}
                  </div>
                </div>
              ))}
            </div>
            
            <div className="mt-6 text-center">
              <Link to="/transactions" className="text-primary font-semibold flex items-center justify-center gap-1">
                مشاهده تاریخچه کامل
                <i className="fas fa-arrow-left"></i>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* پنل دعوت */}
      <div className="card mt-8 bg-gradient-to-r from-primary/10 to-secondary/10 border-primary/20">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-6">
          <div>
            <h3 className="text-xl font-bold mb-2">🤝 دعوت دوستان، کسب درآمد نامحدود!</h3>
            <p className="text-secondary">
              با دعوت هر دوست، ۱,۰۰۰ تومان پاداش دریافت کنید. دوستان شما هم ۵۰۰ SOD هدیه می‌گیرند!
            </p>
          </div>
          <div className="flex gap-4">
            <button 
              className="btn btn-primary"
              onClick={() => handleQuickAction('invite')}
            >
              <i className="fas fa-copy"></i>
              کپی لینک دعوت
            </button>
            <Link to="/invite" className="btn btn-outline">
              مشاهده آمار دعوت
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserDashboard;
