import React, { useState } from 'react';
import CampaignCard from './CampaignCard';
import '../../styles/main.css';
import '../../styles/animations.css';

const CampaignList = ({ campaigns, onAction, showDetails = false, compact = false }) => {
  const [filter, setFilter] = useState('all');
  const [sortBy, setSortBy] = useState('date');
  const [searchTerm, setSearchTerm] = useState('');

  const filteredCampaigns = campaigns.filter(campaign => {
    // فیلتر وضعیت
    if (filter !== 'all' && campaign.status !== filter) {
      return false;
    }
    
    // فیلتر جستجو
    if (searchTerm && !campaign.name.toLowerCase().includes(searchTerm.toLowerCase())) {
      return false;
    }
    
    return true;
  });

  const sortedCampaigns = [...filteredCampaigns].sort((a, b) => {
    if (sortBy === 'date') {
      return new Date(b.createdAt) - new Date(a.createdAt);
    }
    if (sortBy === 'budget') {
      return b.budget - a.budget;
    }
    if (sortBy === 'performance') {
      return (b.conversions / b.clicks) - (a.conversions / a.clicks);
    }
    if (sortBy === 'name') {
      return a.name.localeCompare(b.name);
    }
    return 0;
  });

  const campaignStats = {
    total: campaigns.length,
    active: campaigns.filter(c => c.status === 'active').length,
    paused: campaigns.filter(c => c.status === 'paused').length,
    completed: campaigns.filter(c => c.status === 'completed').length,
    totalBudget: campaigns.reduce((sum, c) => sum + c.budget, 0),
    totalSpent: campaigns.reduce((sum, c) => sum + c.spent, 0),
    totalClicks: campaigns.reduce((sum, c) => sum + c.clicks, 0),
    totalConversions: campaigns.reduce((sum, c) => sum + c.conversions, 0),
    avgCtr: campaigns.length > 0 
      ? (campaigns.reduce((sum, c) => sum + c.ctr, 0) / campaigns.length).toFixed(2)
      : 0
  };

  const handleBulkAction = (action) => {
    const selectedCampaigns = sortedCampaigns.filter(c => c.selected);
    if (selectedCampaigns.length === 0) {
      alert('لطفاً حداقل یک کمپین را انتخاب کنید');
      return;
    }
    
    switch (action) {
      case 'pause':
        if (confirm(`آیا می‌خواهید ${selectedCampaigns.length} کمپین را متوقف کنید؟`)) {
          selectedCampaigns.forEach(campaign => onAction?.(campaign.id, 'pause'));
        }
        break;
      case 'resume':
        if (confirm(`آیا می‌خواهید ${selectedCampaigns.length} کمپین را فعال کنید؟`)) {
          selectedCampaigns.forEach(campaign => onAction?.(campaign.id, 'resume'));
        }
        break;
      case 'delete':
        if (confirm(`آیا از حذف ${selectedCampaigns.length} کمپین مطمئن هستید؟`)) {
          selectedCampaigns.forEach(campaign => onAction?.(campaign.id, 'delete'));
        }
        break;
      case 'duplicate':
        alert(`در حال تکثیر ${selectedCampaigns.length} کمپین...`);
        break;
    }
  };

  if (compact) {
    return (
      <div className="campaign-list-compact">
        <div className="space-y-3">
          {sortedCampaigns.slice(0, 3).map((campaign, index) => (
            <CampaignCard
              key={campaign.id}
              campaign={campaign}
              index={index}
              onAction={onAction}
              compact={true}
            />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="campaign-list">
      {/* فیلترها و جستجو */}
      <div className="card mb-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6">
          <div>
            <h2 className="text-2xl font-bold">کمپین‌ها</h2>
            <div className="text-secondary mt-1">
              {campaignStats.active} کمپین فعال از {campaignStats.total} کمپین
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="relative">
              <input
                type="text"
                placeholder="جستجو در کمپین‌ها..."
                className="form-input pr-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <i className="fas fa-search absolute right-3 top-1/2 transform -translate-y-1/2 text-tertiary"></i>
            </div>
            
            <select
              className="form-select w-40"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
            >
              <option value="all">همه وضعیت‌ها</option>
              <option value="active">فعال</option>
              <option value="paused">متوقف شده</option>
              <option value="completed">تکمیل شده</option>
              <option value="draft">پیش‌نویس</option>
            </select>
            
            <select
              className="form-select w-40"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
            >
              <option value="date">تاریخ (جدیدترین)</option>
              <option value="budget">بودجه (زیاد به کم)</option>
              <option value="performance">عملکرد (بهترین)</option>
              <option value="name">نام (الفبا)</option>
            </select>
          </div>
        </div>

        {/* آمار سریع */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-glass rounded-xl p-4">
            <div className="text-sm text-secondary mb-1">بودجه کل</div>
            <div className="text-2xl font-bold text-primary">
              {(campaignStats.totalBudget / 1000000).toFixed(1)}M
            </div>
            <div className="text-xs text-tertiary mt-1">
              {((campaignStats.totalSpent / campaignStats.totalBudget) * 100).toFixed(1)}% خرج شده
            </div>
          </div>
          <div className="bg-glass rounded-xl p-4">
            <div className="text-sm text-secondary mb-1">کلیک کل</div>
            <div className="text-2xl font-bold text-success">
              {(campaignStats.totalClicks / 1000).toFixed(1)}K
            </div>
            <div className="text-xs text-tertiary mt-1">
              {campaignStats.totalConversions.toLocaleString('fa-IR')} تبدیل
            </div>
          </div>
          <div className="bg-glass rounded-xl p-4">
            <div className="text-sm text-secondary mb-1">میانگین CTR</div>
            <div className="text-2xl font-bold text-accent">
              {campaignStats.avgCtr}%
            </div>
            <div className="text-xs text-tertiary mt-1">
              نرخ کلیک متوسط
            </div>
          </div>
          <div className="bg-glass rounded-xl p-4">
            <div className="text-sm text-secondary mb-1">کمپین فعال</div>
            <div className="text-2xl font-bold">
              {campaignStats.active}
            </div>
            <div className="text-xs text-tertiary mt-1">
              {campaignStats.paused} متوقف شده
            </div>
          </div>
        </div>
      </div>

      {/* اقدامات گروهی */}
      <div className="card mb-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <button
              className="btn btn-outline"
              onClick={() => handleBulkAction('pause')}
            >
              <i className="fas fa-pause"></i>
              توقف گروهی
            </button>
            <button
              className="btn btn-outline"
              onClick={() => handleBulkAction('resume')}
            >
              <i className="fas fa-play"></i>
              فعال‌سازی گروهی
            </button>
            <button
              className="btn btn-outline"
              onClick={() => handleBulkAction('duplicate')}
            >
              <i className="fas fa-copy"></i>
              تکثیر گروهی
            </button>
            <button
              className="btn btn-error btn-outline"
              onClick={() => handleBulkAction('delete')}
            >
              <i className="fas fa-trash"></i>
              حذف گروهی
            </button>
          </div>
          
          <div className="text-sm text-secondary">
            {sortedCampaigns.length} کمپین یافت شد
          </div>
        </div>
      </div>

      {/* لیست کمپین‌ها */}
      <div className="space-y-4">
        {sortedCampaigns.length === 0 ? (
          <div className="card">
            <div className="text-center py-12">
              <div className="text-5xl mb-6">🎯</div>
              <h3 className="text-xl font-bold mb-4">هیچ کمپینی یافت نشد</h3>
              <p className="text-secondary mb-6">
                {searchTerm ? 'هیچ کمپینی با این مشخصات پیدا نشد.' : 'هنوز کمپینی ایجاد نکرده‌اید.'}
              </p>
              {!searchTerm && (
                <button className="btn btn-primary">
                  <i className="fas fa-plus"></i>
                  ایجاد اولین کمپین
                </button>
              )}
            </div>
          </div>
        ) : (
          sortedCampaigns.map((campaign, index) => (
            <CampaignCard
              key={campaign.id}
              campaign={campaign}
              index={index}
              onAction={onAction}
              showDetails={showDetails}
            />
          ))
        )}
      </div>

      {/* پنل پیشنهادات */}
      {sortedCampaigns.length > 0 && filter === 'active' && (
        <div className="card mt-8 bg-gradient-to-r from-primary/10 to-secondary/10 border-primary/20">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <h3 className="text-xl font-bold mb-2">🚀 بهینه‌سازی کمپین‌ها</h3>
              <p className="text-secondary">
                با تحلیل پیشرفته، عملکرد کمپین‌های خود را تا ۴۰٪ بهبود بخشید.
              </p>
            </div>
            <div className="flex gap-4">
              <button className="btn btn-primary">
                <i className="fas fa-chart-line"></i>
                تحلیل پیشرفته
              </button>
              <button className="btn btn-outline">
                <i className="fas fa-lightbulb"></i>
                دریافت پیشنهادات
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CampaignList;
