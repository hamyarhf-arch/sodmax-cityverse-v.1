import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import CampaignList from '../Campaigns/CampaignList';
import CampaignForm from '../Campaigns/CampaignForm';
import '../../styles/main.css';
import '../../styles/animations.css';

const BusinessDashboard = () => {
  const { user } = useAuth();
  
  const [activeTab, setActiveTab] = useState('overview');
  const [businessStats, setBusinessStats] = useState({
    totalCampaigns: 12,
    activeCampaigns: 5,
    totalBudget: 12500000,
    spentBudget: 7695000,
    remainingBudget: 4805000,
    totalClicks: 84520,
    totalConversions: 1245,
    ctr: 1.47,
    avgCpc: 148,
    roi: 215
  });

  const [campaigns, setCampaigns] = useState([
    {
      id: 1,
      name: 'تبلیغات کفش ورزشی',
      status: 'active',
      budget: 2000000,
      spent: 1245000,
      clicks: 12450,
      conversions: 186,
      ctr: 1.5,
      startDate: '۱۴۰۲/۰۵/۱۰',
      endDate: '۱۴۰۲/۰۶/۱۰',
      target: 'مردان ۱۸-۳۵ سال',
      channels: ['تلگرام', 'اینستاگرام']
    },
    {
      id: 2,
      name: 'معرفی اپلیکیشن',
      status: 'paused',
      budget: 5000000,
      spent: 2450000,
      clicks: 36500,
      conversions: 548,
      ctr: 1.5,
      startDate: '۱۴۰۲/۰۴/۱۵',
      endDate: '۱۴۰۲/۰۵/۱۵',
      target: 'کاربران اندروید',
      channels: ['گوگل', 'سروش']
    },
    {
      id: 3,
      name: 'کمپین فروش ویژه',
      status: 'completed',
      budget: 3000000,
      spent: 3000000,
      clicks: 20200,
      conversions: 303,
      ctr: 1.5,
      startDate: '۱۴۰۲/۰۳/۰۱',
      endDate: '۱۴۰۲/۰۴/۰۱',
      target: 'عمومی',
      channels: ['همه پلتفرم‌ها']
    },
    {
      id: 4,
      name: 'برندینگ محصول جدید',
      status: 'active',
      budget: 2500000,
      spent: 950000,
      clicks: 8500,
      conversions: 128,
      ctr: 1.5,
      startDate: '۱۴۰۲/۰۵/۲۰',
      endDate: '۱۴۰۲/۰۶/۲۰',
      target: 'زنان ۲۵-۴۵ سال',
      channels: ['اینستاگرام', 'تلگرام']
    }
  ]);

  const [performanceData] = useState([
    { day: 'دیروز', clicks: 1245, conversions: 18, ctr: 1.45, spent: 184000 },
    { day: '۲ روز پیش', clicks: 1320, conversions: 20, ctr: 1.52, spent: 195000 },
    { day: '۳ روز پیش', clicks: 1180, conversions: 17, ctr: 1.44, spent: 174000 },
    { day: '۴ روز پیش', clicks: 1420, conversions: 21, ctr: 1.48, spent: 210000 },
    { day: '۵ روز پیش', clicks: 1290, conversions: 19, ctr: 1.47, spent: 191000 }
  ]);

  const [quickInsights] = useState([
    {
      id: 1,
      title: 'بهترین زمان تبلیغ',
      value: '۱۸:۰۰ - ۲۲:۰۰',
      change: '+۲۳٪',
      trend: 'up',
      icon: '📈'
    },
    {
      id: 2,
      title: 'محبوب‌ترین پلتفرم',
      value: 'اینستاگرام',
      change: '+۱۸٪',
      trend: 'up',
      icon: '📱'
    },
    {
      id: 3,
      title: 'میانگین CPC',
      value: '۱۴۸ تومان',
      change: '-۵٪',
      trend: 'down',
      icon: '💰'
    },
    {
      id: 4,
      title: 'نرخ بازگشت سرمایه',
      value: '۲۱۵٪',
      change: '+۱۲٪',
      trend: 'up',
      icon: '📊'
    }
  ]);

  const handleCreateCampaign = (campaignData) => {
    const newCampaign = {
      id: campaigns.length + 1,
      ...campaignData,
      status: 'active',
      clicks: 0,
      conversions: 0,
      ctr: 0,
      spent: 0
    };
    setCampaigns([...campaigns, newCampaign]);
    setBusinessStats(prev => ({
      ...prev,
      totalCampaigns: prev.totalCampaigns + 1,
      activeCampaigns: prev.activeCampaigns + 1
    }));
    setActiveTab('campaigns');
  };

  const handleCampaignAction = (campaignId, action) => {
    setCampaigns(campaigns.map(campaign => {
      if (campaign.id === campaignId) {
        switch (action) {
          case 'pause':
            return { ...campaign, status: 'paused' };
          case 'resume':
            return { ...campaign, status: 'active' };
          case 'stop':
            return { ...campaign, status: 'completed' };
          default:
            return campaign;
        }
      }
      return campaign;
    }));
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return (
          <>
            {/* آمار کلی */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              <div className="card card-primary">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm text-secondary mb-1">کمپین فعال</div>
                    <div className="text-3xl font-bold text-primary">
                      {businessStats.activeCampaigns}
                    </div>
                  </div>
                  <div className="text-2xl">🎯</div>
                </div>
                <div className="mt-4">
                  <div className="text-xs text-secondary">
                    از {businessStats.totalCampaigns} کمپین
                  </div>
                </div>
              </div>
              
              <div className="card card-success">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm text-secondary mb-1">بودجه باقی‌مانده</div>
                    <div className="text-3xl font-bold text-success">
                      {(businessStats.remainingBudget / 1000000).toFixed(1)}M
                    </div>
                  </div>
                  <div className="text-2xl">💰</div>
                </div>
                <div className="mt-4">
                  <div className="progress-bar">
                    <div 
                      className="progress-fill bg-success" 
                      style={{ 
                        width: `${(businessStats.remainingBudget / businessStats.totalBudget) * 100}%` 
                      }}
                    ></div>
                  </div>
                </div>
              </div>
              
              <div className="card card-accent">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm text-secondary mb-1">کلیک امروز</div>
                    <div className="text-3xl font-bold text-accent">
                      {performanceData[0].clicks.toLocaleString('fa-IR')}
                    </div>
                  </div>
                  <div className="text-2xl">👆</div>
                </div>
                <div className="mt-4">
                  <div className="text-xs text-secondary">
                    {performanceData[0].conversions} تبدیل
                  </div>
                </div>
              </div>
              
              <div className="card">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm text-secondary mb-1">میانگین CPC</div>
                    <div className="text-3xl font-bold">
                      {businessStats.avgCpc}
                    </div>
                  </div>
                  <div className="text-2xl">📊</div>
                </div>
                <div className="mt-4">
                  <div className="text-xs text-success">
                    {quickInsights[2].change} نسبت به دیروز
                  </div>
                </div>
              </div>
            </div>

            {/* بینش سریع */}
            <div className="card mb-8">
              <h2 className="text-2xl font-bold mb-6">بینش سریع</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {quickInsights.map(insight => (
                  <div key={insight.id} className="bg-glass rounded-xl p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="text-2xl">{insight.icon}</div>
                      <div className={`text-sm font-bold ${
                        insight.trend === 'up' ? 'text-success' : 'text-accent'
                      }`}>
                        {insight.change}
                      </div>
                    </div>
                    <div className="text-sm text-secondary mb-1">{insight.title}</div>
                    <div className="text-lg font-bold">{insight.value}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* عملکرد ۵ روز اخیر */}
            <div className="card mb-8">
              <h2 className="text-2xl font-bold mb-6">عملکرد ۵ روز اخیر</h2>
              
              <div className="overflow-x-auto">
                <table className="table w-full">
                  <thead>
                    <tr>
                      <th>روز</th>
                      <th>کلیک</th>
                      <th>تبدیل</th>
                      <th>CTR</th>
                      <th>هزینه</th>
                      <th>عملکرد</th>
                    </tr>
                  </thead>
                  <tbody>
                    {performanceData.map((data, index) => (
                      <tr key={index}>
                        <td>{data.day}</td>
                        <td className="font-bold">{data.clicks.toLocaleString('fa-IR')}</td>
                        <td className="font-bold text-success">{data.conversions.toLocaleString('fa-IR')}</td>
                        <td className="font-bold text-primary">{data.ctr}%</td>
                        <td className="font-bold text-accent">{data.spent.toLocaleString('fa-IR')} تومان</td>
                        <td>
                          <div className="w-24 h-2 bg-glass rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-gradient-to-r from-primary to-secondary"
                              style={{ width: `${(data.conversions / 25) * 100}%` }}
                            ></div>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* کمپین‌های فعال */}
            <div className="mb-8">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold">کمپین‌های فعال</h2>
                <button 
                  className="btn btn-primary"
                  onClick={() => setActiveTab('create')}
                >
                  <i className="fas fa-plus"></i>
                  کمپین جدید
                </button>
              </div>
              <CampaignList 
                campaigns={campaigns.filter(c => c.status === 'active')}
                onAction={handleCampaignAction}
                compact={true}
              />
            </div>
          </>
        );

      case 'campaigns':
        return (
          <div className="space-y-8">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">همه کمپین‌ها</h2>
              <div className="flex gap-2">
                <button 
                  className="btn btn-primary"
                  onClick={() => setActiveTab('create')}
                >
                  <i className="fas fa-plus"></i>
                  کمپین جدید
                </button>
                <button className="btn btn-outline">
                  <i className="fas fa-download"></i>
                  خروجی گزارش
                </button>
              </div>
            </div>
            
            <CampaignList 
              campaigns={campaigns}
              onAction={handleCampaignAction}
              showDetails={true}
            />
          </div>
        );

      case 'create':
        return (
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center gap-4 mb-8">
              <button 
                className="btn btn-ghost"
                onClick={() => setActiveTab('overview')}
              >
                <i className="fas fa-arrow-right"></i>
                بازگشت به داشبورد
              </button>
              <h2 className="text-2xl font-bold">ایجاد کمپین جدید</h2>
            </div>
            
            <CampaignForm 
              onSubmit={handleCreateCampaign}
              onCancel={() => setActiveTab('overview')}
            />
          </div>
        );

      case 'analytics':
        return (
          <div className="space-y-8">
            <h2 className="text-2xl font-bold">تحلیل‌های پیشرفته</h2>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="card">
                <h3 className="text-xl font-bold mb-4">توزیع کلیک بر اساس ساعت روز</h3>
                <div className="space-y-3">
                  {Array.from({ length: 6 }).map((_, i) => {
                    const hourStart = 8 + i * 4;
                    const hourEnd = 12 + i * 4;
                    const percentage = 30 + Math.random() * 40;
                    
                    return (
                      <div key={i} className="flex items-center gap-4">
                        <span className="w-20 text-sm text-secondary">
                          {hourStart}:۰۰ - {hourEnd}:۰۰
                        </span>
                        <div className="flex-1 h-4 bg-glass rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-gradient-to-r from-primary to-secondary"
                            style={{ width: `${percentage}%` }}
                          ></div>
                        </div>
                        <span className="w-16 text-sm font-bold text-right">
                          {Math.floor(percentage)}%
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
              
              <div className="card">
                <h3 className="text-xl font-bold mb-4">نرخ تبدیل بر اساس گروه سنی</h3>
                <div className="space-y-3">
                  {[
                    { age: '۱۸-۲۴', rate: 2.3, color: 'from-blue-500 to-cyan-500' },
                    { age: '۲۵-۳۴', rate: 3.1, color: 'from-green-500 to-emerald-500' },
                    { age: '۳۵-۴۴', rate: 2.8, color: 'from-purple-500 to-pink-500' },
                    { age: '۴۵-۵۴', rate: 2.1, color: 'from-orange-500 to-red-500' },
                    { age: '۵۵+', rate: 1.5, color: 'from-gray-500 to-slate-500' }
                  ].map((item, index) => (
                    <div key={index} className="flex items-center gap-4">
                      <span className="w-16 text-sm text-secondary">{item.age}</span>
                      <div className="flex-1 h-4 bg-glass rounded-full overflow-hidden">
                        <div 
                          className={`h-full bg-gradient-to-r ${item.color}`}
                          style={{ width: `${item.rate * 20}%` }}
                        ></div>
                      </div>
                      <span className="w-16 text-sm font-bold text-right">{item.rate}%</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            
            <div className="card">
              <h3 className="text-xl font-bold mb-4">هزینه در مقابل درآمد - ۷ روز اخیر</h3>
              <div className="h-64 flex items-end gap-2">
                {Array.from({ length: 7 }).map((_, i) => {
                  const costHeight = 40 + Math.random() * 60;
                  const revenueHeight = 60 + Math.random() * 80;
                  
                  return (
                    <div key={i} className="flex-1 flex flex-col items-center">
                      <div className="text-xs text-secondary mb-1">روز {i + 1}</div>
                      <div className="flex gap-1 w-full" style={{ height: '200px' }}>
                        <div 
                          className="flex-1 bg-gradient-to-t from-primary to-primary/50 rounded-t"
                          style={{ height: `${costHeight}%` }}
                        ></div>
                        <div 
                          className="flex-1 bg-gradient-to-t from-success to-success/50 rounded-t"
                          style={{ height: `${revenueHeight}%` }}
                        ></div>
                      </div>
                      <div className="text-xs text-secondary mt-1">
                        <div>هزینه</div>
                        <div>درآمد</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        );

      case 'wallet':
        return (
          <div className="space-y-8">
            <div className="card">
              <h2 className="text-2xl font-bold mb-6">کیف پول کسب‌وکار</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="text-center p-6 bg-glass rounded-xl">
                  <div className="text-4xl font-bold text-primary mb-2">
                    {(businessStats.remainingBudget / 1000000).toFixed(1)}M
                  </div>
                  <div className="text-secondary">موجودی تومان</div>
                </div>
                <div className="text-center p-6 bg-glass rounded-xl">
                  <div className="text-4xl font-bold text-secondary mb-2">
                    {(businessStats.spentBudget / 1000000).toFixed(1)}M
                  </div>
                  <div className="text-secondary">خرج شده</div>
                </div>
                <div className="text-center p-6 bg-glass rounded-xl">
                  <div className="text-4xl font-bold text-success mb-2">
                    {businessStats.roi}%
                  </div>
                  <div className="text-secondary">بازگشت سرمایه</div>
                </div>
              </div>
              
              <div className="flex gap-4">
                <button className="btn btn-primary flex-1">
                  <i className="fas fa-plus"></i>
                  شارژ کیف پول
                </button>
                <button className="btn btn-outline flex-1">
                  <i className="fas fa-download"></i>
                  درخواست برداشت
                </button>
                <button className="btn btn-outline flex-1">
                  <i className="fas fa-file-invoice"></i>
                  گزارش مالی
                </button>
              </div>
            </div>

            <div className="card">
              <h2 className="text-2xl font-bold mb-6">آخرین تراکنش‌ها</h2>
              
              <div className="space-y-3">
                {[
                  { id: 1, type: 'شارژ کیف پول', amount: 5000000, date: 'امروز - ۱۴:۳۰', status: 'موفق' },
                  { id: 2, type: 'پرداخت کمپین', amount: -1245000, date: 'دیروز - ۱۰:۱۵', status: 'موفق' },
                  { id: 3, type: 'شارژ کیف پول', amount: 3000000, date: '۳ روز پیش - ۱۶:۴۵', status: 'موفق' },
                  { id: 4, type: 'پرداخت کمپین', amount: -2450000, date: '۵ روز پیش - ۰۹:۲۰', status: 'موفق' },
                  { id: 5, type: 'برداشت', amount: -2000000, date: '۱ هفته پیش - ۱۱:۱۰', status: 'موفق' }
                ].map(transaction => (
                  <div key={transaction.id} className="flex justify-between items-center p-4 bg-glass rounded-lg hover:bg-glass/50 transition-colors cursor-pointer">
                    <div>
                      <div className="font-bold">{transaction.type}</div>
                      <div className="text-sm text-secondary">{transaction.date}</div>
                    </div>
                    <div className={`font-bold ${transaction.amount > 0 ? 'text-success' : 'text-accent'}`}>
                      {transaction.amount > 0 ? '+' : ''}{Math.abs(transaction.amount).toLocaleString('fa-IR')} تومان
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="business-dashboard">
      {/* هدر کسب‌وکار */}
      <div className="card mb-8 animate-fadeIn">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="avatar avatar-xl bg-gradient-to-br from-secondary to-success">
                <span className="text-2xl">🏢</span>
              </div>
              <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-success rounded-full border-2 border-bg-surface flex items-center justify-center">
                <i className="fas fa-check text-xs text-white"></i>
              </div>
            </div>
            <div>
              <h1 className="text-2xl font-bold">شرکت نوآوران</h1>
              <div className="flex items-center gap-2 text-secondary">
                <span className="text-success">●</span>
                <span>کسب‌وکار تأیید شده</span>
                <span>•</span>
                <span>عضویت از ۱۴۰۲/۰۳/۱۵</span>
                <span>•</span>
                <span>سطح طلایی</span>
              </div>
            </div>
          </div>
          
          <div className="flex gap-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">
                {businessStats.totalCampaigns}
              </div>
              <div className="text-sm text-secondary">کمپین کل</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-success">
                {businessStats.totalConversions.toLocaleString('fa-IR')}
              </div>
              <div className="text-sm text-secondary">تبدیل موفق</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-accent">
                {businessStats.roi}%
              </div>
              <div className="text-sm text-secondary">ROI</div>
            </div>
          </div>
        </div>
      </div>

      {/* تب‌ها */}
      <div className="flex overflow-x-auto mb-8 pb-2 gap-1">
        {[
          { id: 'overview', label: 'نمای کلی', icon: '📊', active: true },
          { id: 'campaigns', label: 'کمپین‌ها', icon: '🎯' },
          { id: 'create', label: 'کمپین جدید', icon: '✨' },
          { id: 'analytics', label: 'تحلیل‌ها', icon: '📈' },
          { id: 'wallet', label: 'کیف پول', icon: '💰' },
          { id: 'audience', label: 'مخاطبان', icon: '👥' }
        ].map(tab => (
          <button
            key={tab.id}
            className={`flex items-center gap-2 px-6 py-3 rounded-lg whitespace-nowrap transition-all ${
              activeTab === tab.id 
                ? 'bg-primary text-white shadow-lg' 
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

      {/* پنل پشتیبانی */}
      {activeTab === 'overview' && (
        <div className="mt-8 card bg-gradient-to-r from-primary/10 to-secondary/10 border-primary/20">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <h3 className="text-xl font-bold mb-2">🎯 به دنبال بهترین نتایج هستید؟</h3>
              <p className="text-secondary">
                مشاوران متخصص ما می‌توانند به شما در بهینه‌سازی کمپین‌ها و افزایش بازگشت سرمایه کمک کنند.
              </p>
            </div>
            <div className="flex gap-4">
              <button className="btn btn-primary">
                <i className="fas fa-headset"></i>
                درخواست مشاوره
              </button>
              <button className="btn btn-outline">
                مشاهده پلن‌های ویژه
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BusinessDashboard;
