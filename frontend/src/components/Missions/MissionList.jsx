import React, { useState } from 'react';
import MissionCard from './MissionCard';
import '../../styles/main.css';
import '../../styles/animations.css';

const MissionList = ({ missions, loading, onMissionClick, showFilters = true }) => {
  const [filter, setFilter] = useState('all');
  const [sortBy, setSortBy] = useState('progress');

  const filteredMissions = missions.filter(mission => {
    if (filter === 'all') return true;
    if (filter === 'active') return mission.status === 'active';
    if (filter === 'completed') return mission.status === 'completed';
    if (filter === 'new') return mission.isNew;
    if (filter === 'high-reward') return mission.reward >= 1000;
    return true;
  });

  const sortedMissions = [...filteredMissions].sort((a, b) => {
    if (sortBy === 'progress') {
      return (b.progress / b.total) - (a.progress / a.total);
    }
    if (sortBy === 'reward') {
      return b.reward - a.reward;
    }
    if (sortBy === 'time') {
      return new Date(a.deadline) - new Date(b.deadline);
    }
    return 0;
  });

  const missionStats = {
    total: missions.length,
    active: missions.filter(m => m.status === 'active').length,
    completed: missions.filter(m => m.status === 'completed').length,
    totalRewards: missions.reduce((sum, mission) => sum + (mission.completed ? mission.reward : 0), 0)
  };

  if (loading) {
    return (
      <div className="mission-list">
        <div className="card">
          <div className="flex justify-center py-12">
            <div className="loader"></div>
          </div>
        </div>
      </div>
    );
  }

  if (missions.length === 0) {
    return (
      <div className="mission-list">
        <div className="card">
          <div className="text-center py-12">
            <div className="text-5xl mb-6">🎯</div>
            <h3 className="text-xl font-bold mb-4">هیچ مأموریتی یافت نشد</h3>
            <p className="text-secondary mb-6">
              در حال حاضر مأموریت فعالی وجود ندارد.
              <br />
            کمی بعد بازگردید یا مأموریت‌های ویژه را بررسی کنید.
            </p>
            <button className="btn btn-primary">
              <i className="fas fa-sync-alt"></i>
              بروزرسانی مأموریت‌ها
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mission-list">
      {showFilters && (
        <div className="card mb-6">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6">
            <div>
              <h2 className="text-2xl font-bold">مأموریت‌ها</h2>
              <div className="text-secondary mt-1">
                {missionStats.active} مأموریت فعال از {missionStats.total} مأموریت
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <div className="flex gap-1">
                <button
                  className={`px-4 py-2 rounded-lg transition-colors ${
                    filter === 'all' ? 'bg-primary text-white' : 'bg-glass'
                  }`}
                  onClick={() => setFilter('all')}
                >
                  همه
                </button>
                <button
                  className={`px-4 py-2 rounded-lg transition-colors ${
                    filter === 'active' ? 'bg-primary text-white' : 'bg-glass'
                  }`}
                  onClick={() => setFilter('active')}
                >
                  فعال
                </button>
                <button
                  className={`px-4 py-2 rounded-lg transition-colors ${
                    filter === 'high-reward' ? 'bg-primary text-white' : 'bg-glass'
                  }`}
                  onClick={() => setFilter('high-reward')}
                >
                  پاداش بالا
                </button>
              </div>
              
              <select
                className="form-select w-40"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
              >
                <option value="progress">پیشرفت</option>
                <option value="reward">پاداش</option>
                <option value="time">زمان باقی‌مانده</option>
              </select>
            </div>
          </div>

          {/* آمار سریع */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-glass rounded-xl p-4">
              <div className="text-sm text-secondary mb-1">مأموریت فعال</div>
              <div className="text-2xl font-bold text-primary">{missionStats.active}</div>
            </div>
            <div className="bg-glass rounded-xl p-4">
              <div className="text-sm text-secondary mb-1">تکمیل شده</div>
              <div className="text-2xl font-bold text-success">{missionStats.completed}</div>
            </div>
            <div className="bg-glass rounded-xl p-4">
              <div className="text-sm text-secondary mb-1">کل پاداش</div>
              <div className="text-2xl font-bold text-accent">{missionStats.totalRewards.toLocaleString('fa-IR')}</div>
            </div>
            <div className="bg-glass rounded-xl p-4">
              <div className="text-sm text-secondary mb-1">درصد پیشرفت</div>
              <div className="text-2xl font-bold">
                {missionStats.total > 0 ? Math.round((missionStats.completed / missionStats.total) * 100) : 0}%
              </div>
            </div>
          </div>
        </div>
      )}

      {/* لیست مأموریت‌ها */}
      <div className="space-y-4">
        {sortedMissions.map((mission, index) => (
          <MissionCard
            key={mission.id}
            mission={mission}
            index={index}
            onClick={() => onMissionClick && onMissionClick(mission.id)}
          />
        ))}
      </div>

      {/* مأموریت‌های ویژه */}
      {filter === 'all' && (
        <div className="mt-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-1 h-8 bg-gradient-to-b from-primary to-secondary rounded-full"></div>
            <h3 className="text-xl font-bold">مأموریت‌های ویژه</h3>
            <span className="bg-gradient-to-r from-primary to-secondary text-white text-xs font-bold px-3 py-1 rounded-full">
              ویژه
            </span>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {missions
              .filter(m => m.isSpecial)
              .slice(0, 2)
              .map(mission => (
                <div key={mission.id} className="card border-2 border-primary/30 relative overflow-hidden">
                  <div className="absolute top-4 right-4">
                    <span className="bg-primary text-white text-xs font-bold px-3 py-1 rounded-full">
                      ویژه
                    </span>
                  </div>
                  
                  <div className="flex items-start gap-4">
                    <div className="w-16 h-16 bg-gradient-to-br from-primary to-secondary rounded-xl flex items-center justify-center text-2xl">
                      👑
                    </div>
                    <div className="flex-1">
                      <h4 className="font-bold text-lg mb-2">{mission.title}</h4>
                      <p className="text-secondary text-sm mb-4">{mission.description}</p>
                      
                      <div className="flex justify-between items-center">
                        <div className="text-accent font-bold text-lg">
                          +{mission.reward.toLocaleString('fa-IR')} تومان
                        </div>
                        <button className="btn btn-primary btn-sm">
                          شرکت در مأموریت
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* پنل دعوت به مأموریت */}
      {missionStats.active === 0 && (
        <div className="card mt-8 bg-gradient-to-r from-primary/10 to-secondary/10 border-primary/20">
          <div className="text-center py-8">
            <div className="text-5xl mb-6">🚀</div>
            <h3 className="text-xl font-bold mb-4">آماده چالش جدید هستید؟</h3>
            <p className="text-secondary mb-6">
              با شرکت در مأموریت‌های ویژه، پاداش‌های فوق‌العاده دریافت کنید!
            </p>
            <div className="flex gap-4 justify-center">
              <button className="btn btn-primary">
                <i className="fas fa-bolt"></i>
                مأموریت‌های لحظه‌ای
              </button>
              <button className="btn btn-outline">
                <i className="fas fa-users"></i>
                مأموریت گروهی
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MissionList;
