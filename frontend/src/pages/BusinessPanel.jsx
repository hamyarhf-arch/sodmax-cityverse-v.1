import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import CampaignList from '../components/Campaigns/CampaignList';
import CampaignForm from '../components/Campaigns/CampaignForm';
import '../styles/main.css';
import '../styles/animations.css';

const BusinessPanel = () => {
  const { user } = useAuth();
  
  const [activeTab, setActiveTab] = useState('dashboard');
  const [businessStats, setBusinessStats] = useState({
    totalCampaigns: 12,
    activeCampaigns: 5,
    totalBudget: 12500000,
    totalClicks: 84520,
    totalConversions: 1245,
    ctr: 1.47,
    avgCpc: 148
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
      endDate: '۱۴۰۲/۰۶/۱۰'
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
      endDate: '۱۴۰۲/۰۵/۱۵'
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
      endDate: '۱۴۰۲/۰۴/۰۱'
    }
  ]);

  const [performanceData] = useState([
    { day: 'دیروز', clicks: 1245, conversions: 18, ctr: 1.45 },
    { day: '۲ روز پیش', clicks: 1320, conversions: 20, ctr: 1.52 },
    { day: '۳ روز پیش', clicks: 1180, conversions: 17, ctr: 1.44 },
    { day: '۴ روز پیش', clicks: 1420, conversions: 21, ctr: 1.48 },
    { day: '۵ روز پیش', clicks: 1290, conversions: 19, ctr: 1.47 }
  ]);

  const handleCreateCampaign = (campaignData) => {
    const newCampaign = {
      id: campaigns.length + 1,
      ...campaignData,
      status: 'active',
      clicks: 0,
      conversions: 0,
      ctr: 0
    };
    setCampaigns([...campaigns, newCampaign]);
  };

  const handleEditCampaign = (campaignId, updatedData) => {
    setCampaigns(campaigns.map(campaign => 
      campaign.id === campaignId ? { ...campaign, ...updatedData } : campaign
    ));
  };

  const handleDeleteCampaign = (campaignId) => {
    setCampaigns(campaigns.filter(campaign => campaign.id !== campaignId));
  };

  const renderTabContent = () => {
    switch(activeTab) {
      case 'dashboard':
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
              </div>
              
              <div className="card card-success">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm text-secondary mb-1">بودجه کل</div>
                    <div className="text-3xl font-bold text-success">
                      {(businessStats.totalBudget / 1000000).toFixed(1)}M
                    </div>
                  </div>
                  <div className="text-2xl">💰</div>
                </div>
              </div>
              
              <div className="card card-accent">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm text-secondary mb-1">کلیک کل</div>
                    <div className="text-3xl font-bold text-accent">
                      {(businessStats.totalClicks / 1000).toFixed(1)}K
                    </div>
                  </div>
                  <div className="text-2xl">👆</div>
                </div>
              </div>
              
              <div className="card">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm text-secondary mb-1">نرخ تبدیل</div>
                    <div className="text-3xl font-bold">
                      {businessStats.ctr}%
                    </div>
                  </div>
                  <div className="text-2xl">📈</div>
                </div>
              </div>
            </div>

            {/* عملکرد اخیر */}
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
                  + کمپین جدید
                </button>
              </div>
              <CampaignList 
                campaigns={campaigns.filter(c => c.status === 'active')}
                onEdit={handleEditCampaign}
                onDelete={handleDeleteCampaign}
              />
            </div>
          </>
        );

      case 'campaigns':
        return (
          <div className="space-y-8">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">همه کمپین‌ها</h2>
              <button 
                className="btn btn-primary"
                onClick={() => setActiveTab('create')}
              >
                + کمپین جدید
              </button>
            </div>
            
            <CampaignList 
              campaigns={campaigns}
              onEdit={handleEditCampaign}
              onDelete={handleDeleteCampaign}
            />
          </div>
        );

      case 'create':
        return (
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center gap-4 mb-8">
              <button 
                className="btn btn-ghost"
                onClick={() => setActiveTab('campaigns')}
              >
                ← بازگشت
              </button>
              <h2 className="text-2xl font-bold">ایجاد کمپین جدید</h2>
            </div>
            
            <CampaignForm onSubmit={handleCreateCampaign} />
          </div>
        );

      case 'analytics':
        return (
          <div className="space-y-8">
            <h2 className="text-2xl font-bold">تحلیل‌های پیشرفته</h2>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="card">
                <h3 className="text-xl font-bold mb-4">توزیع کلیک بر اساس ساعت</h3>
                <div className="space-y-3">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <div key={i} className="flex items-center gap-4">
                      <span className="w-16 text-sm text-secondary">
                        {8 + i * 4}:00 - {12 + i * 4}:00
                      </span>
                      <div className="flex-1 h-4 bg-glass rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-gradient-to-r from-primary to-secondary"
                          style={{ width: `${30 + Math.random() * 40}%` }}
                        ></div>
                      </div>
                      <span className="w-16 text-sm font-bold text-right">
                        {Math.floor(100 + Math.random() * 400)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="card">
                <h3 className="text-xl font-bold mb-4">نرخ تبدیل بر اساس سن</h3>
                <div className="space-y-3">
                  {[
                    { age: '۱۸-۲۴', rate: 2.3 },
                    { age: '۲۵-۳۴', rate: 3.1 },
                    { age: '۳۵-۴۴', rate: 2.8 },
                    { age: '۴۵-۵۴', rate: 2.1 },
                    { age: '۵۵+', rate: 1.5 }
                  ].map((item, index) => (
                    <div key={index} className="flex items-center gap-4">
                      <span className="w-16 text-sm text-secondary">{item.age}</span>
                      <div className="flex-1 h-4 bg-glass rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-gradient-to-r from-secondary to-success"
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
              <h3 className="text-xl font-bold mb-4">هزینه در مقابل درآمد</h3>
              <div className="h-64 flex items-end gap-2">
                {Array.from({ length: 7 }).map((_, i) => (
                  <div key={i} className="flex-1 flex flex-col items-center">
                    <div className="text-xs text-secondary mb-1">روز {i + 1}</div>
                    <div className="flex gap-1 w-full" style={{ height: '200px' }}>
                      <div 
                        className="flex-1 bg-gradient-to-t from-primary to-primary/50 rounded-t"
                        style={{ height: `${40 + Math.random() * 60}%` }}
                      ></div>
                      <div 
                        className="flex-1 bg-gradient-to-t from-success to-success/50 rounded-t"
                        style={{ height: `${60 + Math.random() * 80}%` }}
                      ></div>
                    </div>
                    <div className="text-xs text-secondary mt-1">
                      <div>هزینه</div>
                      <div>درآمد</div>
                    </div>
                  </div>
                ))}
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
                    {(businessStats.totalBudget / 1000000).toFixed(1)}M
                  </div>
                  <div className="text-secondary">موجودی تومان</div>
                </div>
                <div className="text-center p-6 bg-glass rounded-xl">
                  <div className="text-4xl font-bold text-secondary mb-2">
                    {businessStats.totalClicks.toLocaleString('fa-IR')}
                  </div>
                  <div className="text-secondary">کلیک خرج شده</div>
                </div>
                <div className="text-center p-6 bg-glass rounded-xl">
                  <div className="text-4xl font-bold text-success mb-2">
                    {businessStats.avgCpc.toLocaleString('fa-IR')}
                  </div>
                  <div className="text-secondary">میانگین CPC (تومان)</div>
                </div>
              </div>
              
              <div className="flex gap-4">
                <button className="btn btn-primary flex-1">شارژ کیف پول</button>
                <button className="btn btn-outline flex-1">درخواست برداشت</button>
                <button className="btn btn-outline flex-1">گزارش مالی</button>
              </div>
            </div>

            <div className="card">
              <h2 className="text-2xl font-bold mb-6">آخرین تراکنش‌ها</h2>
              
              <div className="space-y-3">
                {[
                  { id: 1, type: 'شارژ کیف پول', amount: 5000000, date: 'امروز - ۱۴:۳۰', status: 'موفق' },
                  { id: 2, type: 'پرداخت کمپین', amount: -1245000, date: 'دیروز - ۱۰:۱۵', status: 'موفق' },
                  { id: 3, type: 'شارژ کیف پول', amount: 3000000, date: '۳ روز پیش - ۱۶:۴۵', status: 'موفق' },
                  { id: 4, type: 'پرداخت کمپین', amount: -2450000, date: '۵ روز پیش - ۰۹:۲۰', status: 'موفق' }
                ].map(transaction => (
                  <div key={transaction.id} className="flex justify-between items-center p-4 bg-glass rounded-lg">
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

      case 'settings':
        return (
          <div className="max-w-2xl mx-auto">
            <h2 className="text-2xl font-bold mb-8">تنظیمات کسب‌وکار</h2>
            
            <div className="card mb-8">
              <h3 className="text-xl font-bold mb-6">اطلاعات کسب‌وکار</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="form-label">نام کسب‌وکار</label>
                  <input type="text" className="form-input" defaultValue="شرکت نوآوران" />
                </div>
                
                <div>
                  <label className="form-label">شماره ثبت</label>
                  <input type="text" className="form-input" defaultValue="۱۲۳۴۵۶۷۸۹" />
                </div>
                
                <div>
                  <label className="form-label">شماره تماس</label>
                  <input type="tel" className="form-input" defaultValue="۰۲۱۱۲۳۴۵۶۷۸" />
                </div>
                
                <div>
                  <label className="form-label">آدرس سایت</label>
                  <input type="url" className="form-input" defaultValue="https://example.com" />
                </div>
                
                <div>
                  <label className="form-label">درباره کسب‌وکار</label>
                  <textarea className="form-textarea" rows={4} defaultValue="شرکت فعال در زمینه تکنولوژی و نوآوری" />
                </div>
                
                <button className="btn btn-primary w-full">ذخیره تغییرات</button>
              </div>
            </div>

            <div className="card">
              <h3 className="text-xl font-bold mb-6">تنظیمات اعلان‌ها</h3>
              
              <div className="space-y-4">
                {[
                  { label: 'اعلان‌های کمپین', checked: true },
                  { label: 'گزارش روزانه', checked: true },
                  { label: 'هشدار بودجه', checked: true },
                  { label: 'به‌روزرسانی‌ها', checked: false },
                  { label: 'اخبار بازاریابی', checked: true }
                ].map((setting, index) => (
                  <div key={index} className="flex justify-between items-center">
                    <span>{setting.label}</span>
                    <label className="switch">
                      <input type="checkbox" defaultChecked={setting.checked} />
                      <span className="slider round"></span>
                    </label>
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
    <div className="min-h-screen bg-gradient-to-b from-bg-primary via-bg-secondary to-bg-primary">
      <div className="container py-8">
        {/* هدر کسب‌وکار */}
        <div className="card mb-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="avatar avatar-xl bg-gradient-to-br from-secondary to-success">
                <span className="text-2xl">🏢</span>
              </div>
              <div>
                <h1 className="text-2xl font-bold">شرکت نوآوران</h1>
                <div className="flex items-center gap-2 text-secondary">
                  <span className="text-success">●</span>
                  <span>کسب‌وکار تأیید شده</span>
                  <span>•</span>
                  <span>عضویت از ۱۴۰۲/۰۳/۱۵</span>
                </div>
              </div>
            </div>
            
            <div className="flex gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">
                  {businessStats.totalCampaigns}
                </div>
                <div className="text-sm text-secondary">کمپین کل</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-success">
                  {(businessStats.totalBudget / 1000000).toFixed(1)}M
                </div>
                <div className="text-sm text-secondary">بودجه کل</div>
              </div>
            </div>
          </div>
        </div>

        {/* تب‌ها */}
        <div className="flex overflow-x-auto mb-8 pb-2 gap-1">
          {[
            { id: 'dashboard', label: 'داشبورد', icon: '📊' },
            { id: 'campaigns', label: 'کمپین‌ها', icon: '🎯' },
            { id: 'create', label: 'کمپین جدید', icon: '✨' },
            { id: 'analytics', label: 'تحلیل‌ها', icon: '📈' },
            { id: 'wallet', label: 'کیف پول', icon: '💰' },
            { id: 'settings', label: 'تنظیمات', icon: '⚙️' }
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

        {/* تبلیغات ویژه برای کسب‌وکار */}
        {activeTab === 'dashboard' && (
          <div className="mt-8 card bg-gradient-to-r from-primary/10 to-secondary/10 border-primary/20">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div>
                <h3 className="text-xl font-bold mb-2">🎉 طرح ویژه کسب‌وکار‌ها!</h3>
                <p className="text-secondary">
                  با خرید پلن طلایی، ۳۰٪ تخفیف در کلیه کمپین‌های خود دریافت کنید
                </p>
              </div>
              <button className="btn btn-primary whitespace-nowrap">
                مشاهده پلن‌ها
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BusinessPanel;
