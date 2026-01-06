import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useMission } from '../contexts/MissionContext';
import MiningCenter from '../components/Dashboard/MiningCenter';
import MissionList from '../components/Missions/MissionList';
import WalletBalance from '../components/Wallet/WalletBalance';
import TransactionHistory from '../components/Wallet/TransactionHistory';
import '../styles/main.css';
import '../styles/animations.css';

const UserPanel = () => {
  const { user } = useAuth();
  const { missions, loading: missionsLoading } = useMission();
  
  const [activeTab, setActiveTab] = useState('dashboard');
  const [userStats, setUserStats] = useState({
    sodBalance: 1845200,
    tomanBalance: 28400,
    miningPower: 18,
    totalEarned: 124500,
    referralCount: 24,
    level: 5,
    todayEarned: 2450,
    totalMined: 1845200
  });

  const [quickActions] = useState([
    { id: 1, icon: '⚡', label: 'استخراج دستی', action: 'mine', color: 'primary' },
    { id: 2, icon: '🤝', label: 'دعوت دوست', action: 'invite', color: 'secondary' },
    { id: 3, icon: '💰', label: 'برداشت', action: 'withdraw', color: 'success' },
    { id: 4, icon: '🎁', label: 'پاداش روزانه', action: 'daily', color: 'accent' }
  ]);

  const [notifications] = useState([
    { id: 1, title: '🎉 به روزرسانی سیستم', message: 'سیستم 3D جدید اضافه شد!', time: '۵ دقیقه پیش', unread: true },
    { id: 2, title: '💰 پاداش دریافت شد', message: 'مأموریت کلیک روزانه تکمیل شد!', time: '۲ ساعت پیش', unread: true },
    { id: 3, title: '🤝 دعوت موفق', message: 'دوست شما ثبت‌نام کرد! +۱,۰۰۰ تومان', time: '۱ روز پیش', unread: false }
  ]);

  useEffect(() => {
    // در واقعیت از API دریافت می‌شود
    // fetchUserStats();
  }, []);

  const handleQuickAction = (action) => {
    switch(action) {
      case 'mine':
        alert('استخراج دستی انجام شد!');
        break;
      case 'invite':
        navigator.clipboard.writeText(user?.referralLink || '');
        alert('لینک دعوت کپی شد!');
        break;
      case 'withdraw':
        alert('صفحه برداشت باز شد!');
        break;
      case 'daily':
        alert('پاداش روزانه دریافت شد!');
        break;
    }
  };

  const renderTabContent = () => {
    switch(activeTab) {
      case 'dashboard':
        return (
          <>
            {/* آمار سریع */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              <div className="card card-primary">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm text-secondary mb-1">موجودی SOD</div>
                    <div className="text-3xl font-bold text-primary">
                      {userStats.sodBalance.toLocaleString('fa-IR')}
                    </div>
                  </div>
                  <div className="text-2xl">⚡</div>
                </div>
              </div>
              
              <div className="card card-success">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm text-secondary mb-1">موجودی تومان</div>
                    <div className="text-3xl font-bold text-success">
                      {userStats.tomanBalance.toLocaleString('fa-IR')}
                    </div>
                  </div>
                  <div className="text-2xl">💰</div>
                </div>
              </div>
              
              <div className="card card-accent">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm text-secondary mb-1">قدرت استخراج</div>
                    <div className="text-3xl font-bold text-accent">
                      {userStats.miningPower}x
                    </div>
                  </div>
                  <div className="text-2xl">⚡</div>
                </div>
              </div>
              
              <div className="card">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm text-secondary mb-1">سطح کاربری</div>
                    <div className="text-3xl font-bold">
                      {userStats.level}
                    </div>
                  </div>
                  <div className="text-2xl">🏆</div>
                </div>
              </div>
            </div>

            {/* اقدامات سریع */}
            <div className="mb-8">
              <h2 className="text-2xl font-bold mb-4">اقدامات سریع</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {quickActions.map(action => (
                  <button
                    key={action.id}
                    className="card hover:scale-105 transition-transform cursor-pointer text-center"
                    onClick={() => handleQuickAction(action.action)}
                  >
                    <div 
                      className={`w-12 h-12 rounded-full flex items-center justify-center text-xl mb-3 mx-auto ${
                        action.color === 'primary' ? 'bg-primary/20 text-primary' :
                        action.color === 'secondary' ? 'bg-secondary/20 text-secondary' :
                        action.color === 'success' ? 'bg-success/20 text-success' :
                        'bg-accent/20 text-accent'
                      }`}
                    >
                      {action.icon}
                    </div>
                    <div className="font-semibold">{action.label}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* مرکز استخراج */}
            <div className="mb-8">
              <h2 className="text-2xl font-bold mb-4">مرکز استخراج SOD</h2>
              <MiningCenter />
            </div>

            {/* مأموریت‌های فعال */}
            <div className="mb-8">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold">مأموریت‌های فعال</h2>
                <button className="text-primary font-semibold">
                  مشاهده همه →
                </button>
              </div>
              <MissionList missions={missions.slice(0, 3)} loading={missionsLoading} />
            </div>
          </>
        );

      case 'mining':
        return (
          <div className="space-y-8">
            <div className="card">
              <h2 className="text-2xl font-bold mb-6">آمار استخراج</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="text-center p-6 bg-glass rounded-xl">
                  <div className="text-4xl font-bold text-primary mb-2">
                    {userStats.todayEarned.toLocaleString('fa-IR')}
                  </div>
                  <div className="text-secondary">امروز</div>
                </div>
                <div className="text-center p-6 bg-glass rounded-xl">
                  <div className="text-4xl font-bold text-secondary mb-2">
                    {userStats.totalMined.toLocaleString('fa-IR')}
                  </div>
                  <div className="text-secondary">کل استخراج</div>
                </div>
                <div className="text-center p-6 bg-glass rounded-xl">
                  <div className="text-4xl font-bold text-accent mb-2">
                    {userStats.miningPower}x
                  </div>
                  <div className="text-secondary">قدرت فعلی</div>
                </div>
              </div>
              
              <h3 className="text-xl font-bold mb-4">تاریخچه استخراج</h3>
              <div className="space-y-2">
                {[
                  { day: 'امروز', amount: userStats.todayEarned },
                  { day: 'دیروز', amount: 3210 },
                  { day: '۲ روز پیش', amount: 2980 },
                  { day: '۳ روز پیش', amount: 3450 }
                ].map((item, index) => (
                  <div key={index} className="flex justify-between items-center p-4 bg-glass rounded-lg">
                    <span>{item.day}</span>
                    <span className="font-bold text-primary">+{item.amount.toLocaleString('fa-IR')} SOD</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="card">
              <h2 className="text-2xl font-bold mb-6">ارتقاء ماینر</h2>
              <div className="text-center mb-8">
                <div className="text-5xl font-bold text-primary mb-2">سطح {userStats.level}</div>
                <div className="text-secondary">تا سطح بعدی: ۵۰,۰۰۰ SOD</div>
              </div>
              
              <div className="space-y-4 mb-8">
                <div className="flex justify-between items-center">
                  <span>قدرت فعلی</span>
                  <span className="font-bold">{userStats.miningPower}x</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>قدرت بعدی</span>
                  <span className="font-bold text-success">{(userStats.miningPower + 5)}x</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>هزینه ارتقاء</span>
                  <span className="font-bold text-accent">۵۰,۰۰۰ SOD</span>
                </div>
              </div>
              
              <button className="btn btn-primary w-full">
                ارتقاء ماینر (۵۰,۰۰۰ SOD)
              </button>
            </div>
          </div>
        );

      case 'wallet':
        return (
          <div className="space-y-8">
            <WalletBalance />
            <TransactionHistory />
          </div>
        );

      case 'invite':
        return (
          <div className="space-y-8">
            <div className="card">
              <h2 className="text-2xl font-bold mb-6">دعوت دوستان و کسب درآمد</h2>
              
              <div className="text-center mb-8">
                <div className="text-5xl mb-4">🤝</div>
                <div className="text-3xl font-bold mb-2">
                  {userStats.referralCount} دوست دعوت کرده‌اید
                </div>
                <div className="text-xl text-secondary">
                  تاکنون <span className="text-success font-bold">۱۲۴,۰۰۰ تومان</span> از دعوت دوستان کسب کرده‌اید
                </div>
              </div>
              
              <div className="mb-8">
                <div className="text-sm text-secondary mb-2">لینک دعوت اختصاصی شما</div>
                <div className="flex gap-2">
                  <input 
                    type="text" 
                    value={user?.referralLink || 'https://sodmax.city/invite/'}
                    className="flex-1 form-input"
                    readOnly
                  />
                  <button className="btn btn-primary">
                    کپی لینک
                  </button>
                </div>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-4 bg-glass rounded-xl">
                  <div className="text-2xl font-bold text-primary">{userStats.referralCount}</div>
                  <div className="text-sm text-secondary">کل دعوت‌ها</div>
                </div>
                <div className="text-center p-4 bg-glass rounded-xl">
                  <div className="text-2xl font-bold text-secondary">۱۸</div>
                  <div className="text-sm text-secondary">فعال</div>
                </div>
                <div className="text-center p-4 bg-glass rounded-xl">
                  <div className="text-2xl font-bold text-accent">۳</div>
                  <div className="text-sm text-secondary">در انتظار</div>
                </div>
                <div className="text-center p-4 bg-glass rounded-xl">
                  <div className="text-2xl font-bold text-success">۱۲۴K</div>
                  <div className="text-sm text-secondary">درآمد کل</div>
                </div>
              </div>
            </div>

            <div className="card">
              <h2 className="text-2xl font-bold mb-6">اشتراک‌گذاری</h2>
              
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
                {['واتساپ', 'تلگرام', 'اینستاگرام'].map((platform, index) => (
                  <button key={index} className="btn btn-outline">
                    {platform}
                  </button>
                ))}
              </div>
              
              <div>
                <div className="text-sm text-secondary mb-2">کد دعوت اختصاصی</div>
                <div className="flex gap-2">
                  <div className="flex-1 form-input font-mono text-center">
                    {user?.referralCode || 'ALI12345'}
                  </div>
                  <button className="btn btn-primary">
                    کپی کد
                  </button>
                </div>
              </div>
            </div>
          </div>
        );

      case 'notifications':
        return (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold mb-6">نوتیفیکیشن‌ها</h2>
            
            {notifications.map(notification => (
              <div 
                key={notification.id}
                className={`card cursor-pointer ${notification.unread ? 'border-primary/30' : ''}`}
              >
                <div className="flex justify-between items-start mb-2">
                  <div className="font-bold">{notification.title}</div>
                  {notification.unread && (
                    <span className="w-2 h-2 bg-primary rounded-full"></span>
                  )}
                </div>
                <p className="text-secondary mb-2">{notification.message}</p>
                <div className="text-sm text-tertiary">{notification.time}</div>
              </div>
            ))}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-bg-primary via-bg-secondary to-bg-primary">
      <div className="container py-8">
        {/* هدر کاربر */}
        <div className="card mb-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="avatar avatar-xl">
                {user?.name?.charAt(0) || 'ع'}
              </div>
              <div>
                <h1 className="text-2xl font-bold">{user?.name || 'علی محمدی'}</h1>
                <div className="flex items-center gap-2 text-secondary">
                  <span className="text-success">●</span>
                  <span>سطح {userStats.level}</span>
                  <span>•</span>
                  <span>{user?.phone || '۰۹۱۲۳۴۵۶۷۸۹'}</span>
                </div>
              </div>
            </div>
            
            <div className="flex gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">
                  {userStats.totalEarned.toLocaleString('fa-IR')}
                </div>
                <div className="text-sm text-secondary">درآمد کل</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-secondary">
                  {userStats.referralCount}
                </div>
                <div className="text-sm text-secondary">زیرمجموعه</div>
              </div>
            </div>
          </div>
        </div>

        {/* تب‌ها */}
        <div className="flex overflow-x-auto mb-8 pb-2 gap-1">
          {[
            { id: 'dashboard', label: 'داشبورد', icon: '📊' },
            { id: 'mining', label: 'استخراج', icon: '⚡' },
            { id: 'wallet', label: 'کیف پول', icon: '💰' },
            { id: 'invite', label: 'دعوت دوستان', icon: '🤝' },
            { id: 'missions', label: 'مأموریت‌ها', icon: '🎯' },
            { id: 'notifications', label: 'نوتیفیکیشن‌ها', icon: '🔔' }
          ].map(tab => (
            <button
              key={tab.id}
              className={`flex items-center gap-2 px-6 py-3 rounded-lg whitespace-nowrap transition-colors ${
                activeTab === tab.id 
                  ? 'bg-primary text-white' 
                  : 'bg-glass hover:bg-glass/50'
              }`}
              onClick={() => setActiveTab(tab.id)}
            >
              <span>{tab.icon}</span>
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* محتوای تب */}
        <div className="animate-fadeIn">
          {renderTabContent()}
        </div>

        {/* نوتیفیکیشن شناور */}
        {notifications.some(n => n.unread) && (
          <button
            className="fixed bottom-6 left-6 w-14 h-14 bg-primary rounded-full flex items-center justify-center text-white shadow-lg hover:scale-110 transition-transform animate-bounce"
            onClick={() => setActiveTab('notifications')}
          >
            <span className="relative">
              🔔
              <span className="absolute -top-1 -right-1 w-3 h-3 bg-accent rounded-full animate-pulse"></span>
            </span>
          </button>
        )}
      </div>
    </div>
  );
};

export default UserPanel;
