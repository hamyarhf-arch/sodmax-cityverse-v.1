import React, { useState } from 'react';
import '../../styles/main.css';
import '../../styles/animations.css';

const MissionCard = ({ mission, index, onClick }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  
  const progressPercentage = Math.round((mission.progress / mission.total) * 100);
  const timeRemaining = mission.deadline ? calculateTimeRemaining(mission.deadline) : null;
  
  const getMissionTypeIcon = (type) => {
    switch (type) {
      case 'click':
        return '👆';
      case 'mining':
        return '⚡';
      case 'referral':
        return '🤝';
      case 'social':
        return '📱';
      case 'game':
        return '🎮';
      case 'daily':
        return '📅';
      default:
        return '🎯';
    }
  };
  
  const getMissionColor = (type) => {
    switch (type) {
      case 'click':
        return 'primary';
      case 'mining':
        return 'accent';
      case 'referral':
        return 'success';
      case 'social':
        return 'info';
      case 'game':
        return 'purple';
      case 'daily':
        return 'warning';
      default:
        return 'primary';
    }
  };
  
  function calculateTimeRemaining(deadline) {
    const now = new Date();
    const end = new Date(deadline);
    const diff = end - now;
    
    if (diff <= 0) return 'تمام شده';
    
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    if (hours > 24) {
      const days = Math.floor(hours / 24);
      return `${days} روز`;
    }
    
    return `${hours} ساعت و ${minutes} دقیقه`;
  }

  const handleCardClick = () => {
    if (onClick) {
      onClick();
    } else {
      setIsExpanded(!isExpanded);
    }
  };

  const handleClaimReward = (e) => {
    e.stopPropagation();
    alert(`پاداش ${mission.reward.toLocaleString('fa-IR')} تومان دریافت شد!`);
    // در اینجا باید API فراخوانی شود
  };

  return (
    <div 
      className={`mission-card card cursor-pointer transition-all duration-300 hover:scale-[1.02] ${
        mission.status === 'completed' ? 'border-success/30' :
        mission.status === 'expired' ? 'border-error/30' :
        'border-transparent'
      }`}
      style={{ animationDelay: `${index * 0.1}s` }}
      onClick={handleCardClick}
    >
      <div className="flex flex-col sm:flex-row sm:items-center gap-4">
        {/* آیکون مأموریت */}
        <div className="flex-shrink-0">
          <div 
            className={`w-16 h-16 rounded-xl flex items-center justify-center text-2xl ${
              getMissionColor(mission.type) === 'primary' ? 'bg-primary/20 text-primary' :
              getMissionColor(mission.type) === 'accent' ? 'bg-accent/20 text-accent' :
              getMissionColor(mission.type) === 'success' ? 'bg-success/20 text-success' :
              getMissionColor(mission.type) === 'info' ? 'bg-info/20 text-info' :
              getMissionColor(mission.type) === 'purple' ? 'bg-purple-500/20 text-purple-500' :
              'bg-warning/20 text-warning'
            }`}
          >
            {getMissionTypeIcon(mission.type)}
          </div>
        </div>
        
        {/* اطلاعات اصلی */}
        <div className="flex-1 min-w-0">
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2 mb-3">
            <div>
              <h3 className="font-bold text-lg mb-1">{mission.title}</h3>
              <p className="text-secondary text-sm line-clamp-2">{mission.description}</p>
            </div>
            
            <div className="flex items-center gap-3">
              {mission.isNew && (
                <span className="bg-accent text-white text-xs font-bold px-2 py-1 rounded-full whitespace-nowrap">
                  جدید
                </span>
              )}
              {mission.isSpecial && (
                <span className="bg-gradient-to-r from-primary to-secondary text-white text-xs font-bold px-2 py-1 rounded-full whitespace-nowrap">
                  ویژه
                </span>
              )}
              <div className="text-lg font-bold text-accent whitespace-nowrap">
                +{mission.reward.toLocaleString('fa-IR')} تومان
              </div>
            </div>
          </div>
          
          {/* پیشرفت */}
          <div className="mb-3">
            <div className="flex justify-between text-sm mb-1">
              <span className="text-secondary">پیشرفت</span>
              <span className="font-bold">{progressPercentage}%</span>
            </div>
            <div className="progress-bar">
              <div 
                className="progress-fill" 
                style={{ width: `${progressPercentage}%` }}
              ></div>
            </div>
            <div className="flex justify-between text-xs text-tertiary mt-1">
              <span>{mission.progress.toLocaleString('fa-IR')} از {mission.total.toLocaleString('fa-IR')}</span>
              {timeRemaining && (
                <span className="flex items-center gap-1">
                  <i className="fas fa-clock"></i>
                  {timeRemaining}
                </span>
              )}
            </div>
          </div>
          
          {/* وضعیت و اقدامات */}
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className={`text-xs px-3 py-1 rounded-full ${
                mission.status === 'completed' ? 'bg-success/20 text-success' :
                mission.status === 'active' ? 'bg-primary/20 text-primary' :
                mission.status === 'expired' ? 'bg-error/20 text-error' :
                'bg-warning/20 text-warning'
              }`}>
                {mission.status === 'completed' ? 'تکمیل شده' :
                 mission.status === 'active' ? 'در حال انجام' :
                 mission.status === 'expired' ? 'منقضی شده' : 'در انتظار'}
              </div>
              
              <div className="text-xs text-tertiary">
                <i className="fas fa-users ml-1"></i>
                {mission.participants?.toLocaleString('fa-IR') || '۰'} نفر
              </div>
            </div>
            
            <div className="flex gap-2">
              {mission.status === 'completed' ? (
                <button 
                  className="btn btn-success btn-sm"
                  onClick={handleClaimReward}
                >
                  <i className="fas fa-gift"></i>
                  دریافت پاداش
                </button>
              ) : mission.status === 'active' ? (
                <button className="btn btn-primary btn-sm">
                  <i className="fas fa-play"></i>
                  ادامه مأموریت
                </button>
              ) : (
                <button className="btn btn-outline btn-sm">
                  <i className="fas fa-info-circle"></i>
                  جزئیات
                </button>
              )}
              
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
        </div>
      </div>
      
      {/* بخش توسعه یافته */}
      {isExpanded && (
        <div className="mt-6 pt-6 border-t border-white/10 animate-fadeIn">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* جزئیات مأموریت */}
            <div>
              <h4 className="font-bold mb-3">📋 جزئیات مأموریت</h4>
              <ul className="space-y-2">
                {mission.details?.map((detail, idx) => (
                  <li key={idx} className="flex items-center gap-2 text-sm">
                    <i className="fas fa-check text-success"></i>
                    <span>{detail}</span>
                  </li>
                ))}
              </ul>
              
              <div className="mt-4">
                <div className="text-sm text-secondary mb-2">پاداش‌های اضافی:</div>
                <div className="flex flex-wrap gap-2">
                  {mission.bonusRewards?.map((bonus, idx) => (
                    <span key={idx} className="bg-glass px-3 py-1 rounded-full text-xs">
                      {bonus}
                    </span>
                  ))}
                </div>
              </div>
            </div>
            
            {/* آمار و نکات */}
            <div>
              <h4 className="font-bold mb-3">📊 آمار و نکات</h4>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-secondary">نرخ تکمیل</span>
                  <span className="font-bold">{mission.completionRate || '۷۵'}%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-secondary">میانگین زمان تکمیل</span>
                  <span className="font-bold">{mission.avgCompletionTime || '۲ ساعت'}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-secondary">سختی</span>
                  <div className="flex gap-1">
                    {[...Array(5)].map((_, i) => (
                      <i 
                        key={i}
                        className={`fas fa-star ${i < (mission.difficulty || 3) ? 'text-accent' : 'text-tertiary'}`}
                      ></i>
                    ))}
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-secondary">تاریخ شروع</span>
                  <span className="font-bold">{mission.startDate || '۱۴۰۲/۰۵/۱۰'}</span>
                </div>
              </div>
              
              <div className="mt-4">
                <div className="text-sm text-secondary mb-2">🔧 ابزارهای مورد نیاز:</div>
                <div className="flex flex-wrap gap-2">
                  {mission.requirements?.map((req, idx) => (
                    <span key={idx} className="bg-glass px-3 py-1 rounded-full text-xs">
                      {req}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
          
          {/* اقدامات اضافی */}
          <div className="mt-6 pt-6 border-t border-white/10">
            <div className="flex flex-wrap gap-3">
              <button className="btn btn-outline btn-sm">
                <i className="fas fa-share-alt"></i>
                اشتراک‌گذاری
              </button>
              <button className="btn btn-outline btn-sm">
                <i className="fas fa-question-circle"></i>
                راهنمایی
              </button>
              <button className="btn btn-outline btn-sm">
                <i className="fas fa-flag"></i>
                گزارش مشکل
              </button>
              {mission.canRetry && (
                <button className="btn btn-primary btn-sm">
                  <i className="fas fa-redo"></i>
                  تلاش مجدد
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MissionCard;
