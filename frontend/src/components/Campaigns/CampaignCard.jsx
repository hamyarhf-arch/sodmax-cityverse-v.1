import React, { useState } from 'react';
import '../../styles/main.css';
import '../../styles/animations.css';

const CampaignCard = ({ campaign, index, onAction, showDetails = false, compact = false }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editedCampaign, setEditedCampaign] = useState({ ...campaign });

  const getStatusColor = (status) => {
    switch (status) {
      case 'active':
        return 'success';
      case 'paused':
        return 'warning';
      case 'completed':
        return 'secondary';
      case 'draft':
        return 'info';
      case 'pending':
        return 'accent';
      default:
        return 'tertiary';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'active':
        return 'فعال';
      case 'paused':
        return 'متوقف شده';
      case 'completed':
        return 'تکمیل شده';
      case 'draft':
        return 'پیش‌نویس';
      case 'pending':
        return 'در انتظار تأیید';
      default:
        return status;
    }
  };

  const calculateProgress = () => {
    if (campaign.budget === 0) return 0;
    return Math.min((campaign.spent / campaign.budget) * 100, 100);
  };

  const calculateROI = () => {
    if (campaign.spent === 0) return 0;
    // شبیه‌سازی ROI بر اساس تبدیل‌ها
    return ((campaign.conversions * 5000) / campaign.spent) * 100; // فرض: هر تبدیل ۵۰۰۰ تومان ارزش دارد
  };

  const handleAction = (action) => {
    if (onAction) {
      onAction(campaign.id, action);
    }
  };

  const handleSaveEdit = () => {
    // در اینجا باید API فراخوانی شود
    console.log('ذخیره تغییرات:', editedCampaign);
    setIsEditing(false);
    alert('تغییرات کمپین ذخیره شد');
  };

  const handleCancelEdit = () => {
    setEditedCampaign({ ...campaign });
    setIsEditing(false);
  };

  const renderCompactView = () => (
    <div className="campaign-card-compact card hover:scale-[1.02] transition-transform cursor-pointer">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className={`w-3 h-3 rounded-full bg-${getStatusColor(campaign.status)}`}></div>
          <div>
            <div className="font-bold">{campaign.name}</div>
            <div className="text-sm text-secondary">
              {campaign.startDate} تا {campaign.endDate}
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="text-right">
            <div className="text-sm text-secondary">بودجه</div>
            <div className="font-bold">{(campaign.budget / 1000000).toFixed(1)}M</div>
          </div>
          <div className="text-right">
            <div className="text-sm text-secondary">کلیک</div>
            <div className="font-bold text-success">{campaign.clicks.toLocaleString('fa-IR')}</div>
          </div>
          <button
            className="btn btn-ghost btn-sm"
            onClick={(e) => {
              e.stopPropagation();
              setIsExpanded(!isExpanded);
            }}
          >
            <i className={`fas fa-chevron-${isExpanded ? 'up' : 'down'}`}></i>
          </button>
        </div>
      </div>
      
      {isExpanded && (
        <div className="mt-4 pt-4 border-t border-white/10">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="text-sm text-secondary mb-1">هزینه شده</div>
              <div className="font-bold text-accent">{(campaign.spent / 1000000).toFixed(1)}M</div>
            </div>
            <div>
              <div className="text-sm text-secondary mb-1">تبدیل</div>
              <div className="font-bold text-primary">{campaign.conversions.toLocaleString('fa-IR')}</div>
            </div>
          </div>
          <div className="mt-4">
            <div className="flex justify-between text-sm mb-1">
              <span className="text-secondary">پیشرفت بودجه</span>
              <span className="font-bold">{calculateProgress().toFixed(1)}%</span>
            </div>
            <div className="progress-bar">
              <div 
                className="progress-fill" 
                style={{ width: `${calculateProgress()}%` }}
              ></div>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  if (compact) {
    return renderCompactView();
  }

  return (
    <div 
      className={`campaign-card card hover:scale-[1.02] transition-all ${
        campaign.status === 'active' ? 'border-success/30' :
        campaign.status === 'paused' ? 'border-warning/30' :
        'border-transparent'
      }`}
      style={{ animationDelay: `${index * 0.1}s` }}
    >
      {isEditing ? (
        /* حالت ویرایش */
        <div className="space-y-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold">ویرایش کمپین</h3>
            <div className="flex gap-2">
              <button 
                className="btn btn-success btn-sm"
                onClick={handleSaveEdit}
              >
                <i className="fas fa-save"></i>
                ذخیره
              </button>
              <button 
                className="btn btn-error btn-sm"
                onClick={handleCancelEdit}
              >
                <i className="fas fa-times"></i>
                انصراف
              </button>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="form-label">نام کمپین</label>
              <input
                type="text"
                className="form-input"
                value={editedCampaign.name}
                onChange={(e) => setEditedCampaign({ ...editedCampaign, name: e.target.value })}
              />
            </div>
            <div>
              <label className="form-label">بودجه (تومان)</label>
              <input
                type="number"
                className="form-input"
                value={editedCampaign.budget}
                onChange={(e) => setEditedCampaign({ ...editedCampaign, budget: parseInt(e.target.value) })}
              />
            </div>
            <div>
              <label className="form-label">تاریخ شروع</label>
              <input
                type="text"
                className="form-input"
                value={editedCampaign.startDate}
                onChange={(e) => setEditedCampaign({ ...editedCampaign, startDate: e.target.value })}
              />
            </div>
            <div>
              <label className="form-label">تاریخ پایان</label>
              <input
                type="text"
                className="form-input"
                value={editedCampaign.endDate}
                onChange={(e) => setEditedCampaign({ ...editedCampaign, endDate: e.target.value })}
              />
            </div>
            <div>
              <label className="form-label">وضعیت</label>
              <select
                className="form-select"
                value={editedCampaign.status}
                onChange={(e) => setEditedCampaign({ ...editedCampaign, status: e.target.value })}
              >
                <option value="active">فعال</option>
                <option value="paused">متوقف شده</option>
                <option value="completed">تکمیل شده</option>
                <option value="draft">پیش‌نویس</option>
              </select>
            </div>
            <div>
              <label className="form-label">هدف</label>
              <input
                type="text"
                className="form-input"
                value={editedCampaign.target || ''}
                onChange={(e) => setEditedCampaign({ ...editedCampaign, target: e.target.value })}
              />
            </div>
          </div>
          
          <div>
            <label className="form-label">توضیحات</label>
            <textarea
              className="form-textarea"
              rows={3}
              value={editedCampaign.description || ''}
              onChange={(e) => setEditedCampaign({ ...editedCampaign, description: e.target.value })}
            />
          </div>
        </div>
      ) : (
        /* حالت نمایش */
        <>
          <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6">
            {/* اطلاعات اصلی */}
            <div className="flex-1">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-xl font-bold">{campaign.name}</h3>
                    <span className={`bg-${getStatusColor(campaign.status)}/20 text-${getStatusColor(campaign.status)} text-xs font-bold px-3 py-1 rounded-full`}>
                      {getStatusText(campaign.status)}
                    </span>
                    {campaign.isSpecial && (
                      <span className="bg-gradient-to-r from-primary to-secondary text-white text-xs font-bold px-3 py-1 rounded-full">
                        ویژه
                      </span>
                    )}
                  </div>
                  <p className="text-secondary">{campaign.description || 'بدون توضیحات'}</p>
                </div>
                
                <div className="flex items-center gap-2">
                  <button 
                    className="btn btn-ghost btn-sm"
                    onClick={() => setIsEditing(true)}
                  >
                    <i className="fas fa-edit"></i>
                  </button>
                  <button 
                    className="btn btn-ghost btn-sm"
                    onClick={() => setIsExpanded(!isExpanded)}
                  >
                    <i className={`fas fa-chevron-${isExpanded ? 'up' : 'down'}`}></i>
                  </button>
                </div>
              </div>
              
              {/* آمار اصلی */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-glass rounded-xl p-4">
                  <div className="text-sm text-secondary mb-1">بودجه</div>
                  <div className="text-2xl font-bold text-primary">
                    {(campaign.budget / 1000000).toFixed(1)}M
                  </div>
                  <div className="text-xs text-tertiary mt-1">
                    {((campaign.spent / campaign.budget) * 100).toFixed(1)}% خرج شده
                  </div>
                </div>
                <div className="bg-glass rounded-xl p-4">
                  <div className="text-sm text-secondary mb-1">کلیک</div>
                  <div className="text-2xl font-bold text-success">
                    {campaign.clicks.toLocaleString('fa-IR')}
                  </div>
                  <div className="text-xs text-tertiary mt-1">
                    CTR: {campaign.ctr}%
                  </div>
                </div>
                <div className="bg-glass rounded-xl p-4">
                  <div className="text-sm text-secondary mb-1">تبدیل</div>
                  <div className="text-2xl font-bold text-accent">
                    {campaign.conversions.toLocaleString('fa-IR')}
                  </div>
                  <div className="text-xs text-tertiary mt-1">
                    نرخ تبدیل: {((campaign.conversions / campaign.clicks) * 100).toFixed(2)}%
                  </div>
                </div>
                <div className="bg-glass rounded-xl p-4">
                  <div className="text-sm text-secondary mb-1">بازگشت سرمایه</div>
                  <div className="text-2xl font-bold text-info">
                    {calculateROI().toFixed(0)}%
                  </div>
                  <div className="text-xs text-tertiary mt-1">
                    میانگین CPC: {Math.round(campaign.spent / campaign.clicks).toLocaleString('fa-IR')}
                  </div>
                </div>
              </div>
              
              {/* پیشرفت بودجه */}
              <div className="mb-6">
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-secondary">پیشرفت بودجه</span>
                  <span className="font-bold">{calculateProgress().toFixed(1)}%</span>
                </div>
                <div className="progress-bar h-3">
                  <div 
                    className="progress-fill h-3" 
                    style={{ width: `${calculateProgress()}%` }}
                  ></div>
                </div>
                <div className="flex justify-between text-xs text-tertiary mt-1">
                  <span>{campaign.spent.toLocaleString('fa-IR')} تومان خرج شده</span>
                  <span>{campaign.budget.toLocaleString('fa-IR')} تومان کل بودجه</span>
                </div>
              </div>
              
              {/* اطلاعات زمانی */}
              <div className="flex flex-wrap gap-6 text-sm">
                <div className="flex items-center gap-2">
                  <i className="fas fa-calendar-alt text-tertiary"></i>
                  <span>شروع: {campaign.startDate}</span>
                </div>
                <div className="flex items-center gap-2">
                  <i className="fas fa-calendar-check text-tertiary"></i>
                  <span>پایان: {campaign.endDate}</span>
                </div>
                {campaign.target && (
                  <div className="flex items-center gap-2">
                    <i className="fas fa-bullseye text-tertiary"></i>
                    <span>هدف: {campaign.target}</span>
                  </div>
                )}
                {campaign.channels && (
                  <div className="flex items-center gap-2">
                    <i className="fas fa-globe text-tertiary"></i>
                    <span>کانال‌ها: {campaign.channels.join('، ')}</span>
                  </div>
                )}
              </div>
            </div>
            
            {/* اقدامات */}
            <div className="lg:w-64 space-y-3">
              <div className="flex flex-col gap-2">
                {campaign.status === 'active' && (
                  <>
                    <button 
                      className="btn btn-warning w-full"
                      onClick={() => handleAction('pause')}
                    >
                      <i className="fas fa-pause"></i>
                      توقف کمپین
                    </button>
                    <button 
                      className="btn btn-success w-full"
                      onClick={() => handleAction('stop')}
                    >
                      <i className="fas fa-stop"></i>
                      تکمیل کمپین
                    </button>
                  </>
                )}
                {campaign.status === 'paused' && (
                  <button 
                    className="btn btn-success w-full"
                    onClick={() => handleAction('resume')}
                  >
                    <i className="fas fa-play"></i>
                    فعال‌سازی مجدد
                  </button>
                )}
                {(campaign.status === 'completed' || campaign.status === 'draft') && (
                  <button 
                    className="btn btn-primary w-full"
                    onClick={() => handleAction('restart')}
                  >
                    <i className="fas fa-redo"></i>
                    راه‌اندازی مجدد
                  </button>
                )}
                
                <button 
                  className="btn btn-outline w-full"
                  onClick={() => handleAction('duplicate')}
                >
                  <i className="fas fa-copy"></i>
                  تکثیر کمپین
                </button>
                <button 
                  className="btn btn-error btn-outline w-full"
                  onClick={() => {
                    if (confirm('آیا از حذف این کمپین مطمئن هستید؟')) {
                      handleAction('delete');
                    }
                  }}
                >
                  <i className="fas fa-trash"></i>
                  حذف کمپین
                </button>
              </div>
              
              {/* لینک‌های سریع */}
              <div className="pt-4 border-t border-white/10">
                <div className="text-sm text-secondary mb-2">لینک‌های سریع:</div>
                <div className="flex flex-wrap gap-2">
                  <button className="btn btn-ghost btn-sm">
                    <i className="fas fa-chart-bar"></i>
                    گزارش
                  </button>
                  <button className="btn btn-ghost btn-sm">
                    <i className="fas fa-eye"></i>
                    پیش‌نمایش
                  </button>
                  <button className="btn btn-ghost btn-sm">
                    <i className="fas fa-share-alt"></i>
                    اشتراک
                  </button>
                </div>
              </div>
            </div>
          </div>
          
          {/* بخش توسعه یافته */}
          {isExpanded && showDetails && (
            <div className="mt-8 pt-8 border-t border-white/10 animate-fadeIn">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* آمار روزانه */}
                <div>
                  <h4 className="font-bold mb-4">📊 آمار ۷ روز اخیر</h4>
                  <div className="space-y-3">
                    {Array.from({ length: 7 }).map((_, i) => {
                      const clicks = Math.floor(500 + Math.random() * 1000);
                      const conversions = Math.floor(clicks * 0.015);
                      
                      return (
                        <div key={i} className="flex justify-between items-center p-3 bg-glass rounded-lg">
                          <span className="text-sm">روز {i + 1}</span>
                          <div className="flex items-center gap-4">
                            <div className="text-right">
                              <div className="font-bold text-success">{clicks.toLocaleString('fa-IR')}</div>
                              <div className="text-xs text-tertiary">کلیک</div>
                            </div>
                            <div className="text-right">
                              <div className="font-bold text-primary">{conversions.toLocaleString('fa-IR')}</div>
                              <div className="text-xs text-tertiary">تبدیل</div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
                
                {/* تحلیل عملکرد */}
                <div>
                  <h4 className="font-bold mb-4">📈 تحلیل عملکرد</h4>
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-secondary">کیفیت کلیک</span>
                        <span className="font-bold text-success">عالی</span>
                      </div>
                      <div className="progress-bar">
                        <div className="progress-fill bg-success" style={{ width: '85%' }}></div>
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-secondary">نرخ بازگشت</span>
                        <span className="font-bold text-warning">متوسط</span>
                      </div>
                      <div className="progress-bar">
                        <div className="progress-fill bg-warning" style={{ width: '65%' }}></div>
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-secondary">رضایت کاربران</span>
                        <span className="font-bold text-info">خوب</span>
                      </div>
                      <div className="progress-bar">
                        <div className="progress-fill bg-info" style={{ width: '78%' }}></div>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* پیشنهادات بهینه‌سازی */}
                <div>
                  <h4 className="font-bold mb-4">💡 پیشنهادات بهینه‌سازی</h4>
                  <div className="space-y-3">
                    <div className="bg-success/10 border border-success/20 rounded-lg p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <i className="fas fa-check-circle text-success"></i>
                        <span className="font-bold">کاربران ۱۸-۳۰ سال</span>
                      </div>
                      <p className="text-sm text-secondary">نرخ تبدیل در این گروه ۴۵٪ بیشتر است. تبلیغات خود را متمرکز کنید.</p>
                    </div>
                    <div className="bg-warning/10 border border-warning/20 rounded-lg p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <i className="fas fa-exclamation-triangle text-warning"></i>
                        <span className="font-bold">ساعات عصر</span>
                      </div>
                      <p className="text-sm text-secondary">CTR در ساعت ۱۸-۲۲، ۲۳٪ بیشتر است. بودجه را تنظیم کنید.</p>
                    </div>
                    <div className="bg-info/10 border border-info/20 rounded-lg p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <i className="fas fa-lightbulb text-info"></i>
                        <span className="font-bold">محتوا تصویری</span>
                      </div>
                      <p className="text-sm text-secondary">تبلیغات ویدیویی نرخ تعامل ۶۰٪ بیشتری دارند.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default CampaignCard;
