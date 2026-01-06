import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import '../../styles/main.css';
import '../../styles/animations.css';

const MiningCenter = () => {
  const { user } = useAuth();
  
  const [miningData, setMiningData] = useState({
    isMining: false,
    power: 18,
    multiplier: 1,
    currentEarnings: 180,
    todayEarnings: 2450,
    totalEarnings: 1845200,
    autoMining: false,
    boostTime: 0,
    level: 5,
    nextLevelCost: 50000
  });
  
  const [isAnimating, setIsAnimating] = useState(false);
  const [particles, setParticles] = useState([]);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);

  const handleMineClick = () => {
    if (isAnimating) return;
    
    setIsAnimating(true);
    
    // ایجاد ذرات
    const newParticles = [];
    for (let i = 0; i < 8; i++) {
      const angle = (i * 45 * Math.PI) / 180;
      const tx = Math.cos(angle) * 150;
      const ty = Math.sin(angle) * 150;
      
      newParticles.push({
        id: Date.now() + i,
        x: 0,
        y: 0,
        tx,
        ty,
        delay: i * 100
      });
    }
    setParticles(newParticles);
    
    // به‌روزرسانی درآمد
    setMiningData(prev => ({
      ...prev,
      todayEarnings: prev.todayEarnings + prev.currentEarnings,
      totalEarnings: prev.totalEarnings + prev.currentEarnings
    }));
    
    // ریست انیمیشن
    setTimeout(() => {
      setIsAnimating(false);
      setTimeout(() => {
        setParticles([]);
      }, 1000);
    }, 300);
  };

  const toggleAutoMining = () => {
    setMiningData(prev => ({
      ...prev,
      autoMining: !prev.autoMining,
      isMining: !prev.autoMining
    }));
    
    if (!miningData.autoMining) {
      // شبیه‌سازی استخراج اتوماتیک
      const interval = setInterval(() => {
        setMiningData(prev => ({
          ...prev,
          todayEarnings: prev.todayEarnings + prev.currentEarnings,
          totalEarnings: prev.totalEarnings + prev.currentEarnings
        }));
      }, 5000);
      
      return () => clearInterval(interval);
    }
  };

  const activateBoost = () => {
    if (miningData.boostTime > 0) return;
    
    setMiningData(prev => ({
      ...prev,
      multiplier: 3,
      boostTime: 30
    }));
    
    // تایمر بوست
    const interval = setInterval(() => {
      setMiningData(prev => {
        if (prev.boostTime <= 1) {
          clearInterval(interval);
          return {
            ...prev,
            multiplier: 1,
            boostTime: 0
          };
        }
        return {
          ...prev,
          boostTime: prev.boostTime - 1
        };
      });
    }, 1000);
  };

  const handleUpgrade = () => {
    if (user.sodBalance < miningData.nextLevelCost) {
      alert('موجودی SOD کافی نیست!');
      return;
    }
    
    setMiningData(prev => ({
      ...prev,
      power: prev.power + 5,
      level: prev.level + 1,
      nextLevelCost: prev.nextLevelCost * 2,
      currentEarnings: (prev.power + 5) * prev.multiplier
    }));
    
    setShowUpgradeModal(true);
    setTimeout(() => {
      setShowUpgradeModal(false);
    }, 2000);
  };

  return (
    <div className="mining-center">
      <div className="card">
        <div className="flex flex-col lg:flex-row items-center gap-8">
          {/* ماینر 3D */}
          <div className="flex-1 relative">
            <div className="relative w-full max-w-md mx-auto">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-transparent to-accent/10 rounded-3xl animate-three-d-float"></div>
              
              <div 
                className={`relative w-64 h-64 mx-auto cursor-pointer transition-all duration-300 ${
                  isAnimating ? 'scale-95' : 'hover:scale-105'
                }`}
                onClick={handleMineClick}
              >
                {/* حلقه بیرونی */}
                <div className="absolute inset-0 bg-gradient-to-br from-primary/30 to-accent/20 rounded-full blur-xl animate-mining-pulse"></div>
                
                {/* حلقه چرخان */}
                <div className="absolute inset-8 bg-gradient-to-tr from-primary/40 to-transparent rounded-full animate-mining-spin"></div>
                
                {/* هسته مرکزی */}
                <div className="absolute inset-12 bg-gradient-to-br from-bg-surface to-bg-card rounded-full border border-white/20 flex items-center justify-center">
                  <div className="text-5xl animate-mining-glow">
                    {isAnimating ? '⚡' : '💎'}
                  </div>
                </div>
                
                {/* نمایش قدرت */}
                <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 bg-glass backdrop-blur-sm px-4 py-2 rounded-full border border-white/10">
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-secondary">قدرت:</span>
                    <span className="text-lg font-bold text-primary">
                      {miningData.power}x
                    </span>
                    {miningData.multiplier > 1 && (
                      <span className="text-sm font-bold text-accent">
                        (×{miningData.multiplier})
                      </span>
                    )}
                  </div>
                </div>
                
                {/* نمایش درآمد کلیک */}
                <div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2">
                  <div className="bg-glass backdrop-blur-sm px-4 py-2 rounded-full border border-white/10">
                    <div className="text-center">
                      <div className="text-sm text-secondary">درآمد کلیک</div>
                      <div className="text-lg font-bold text-success">
                        +{miningData.currentEarnings} SOD
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* ذرات */}
                {particles.map(particle => (
                  <div
                    key={particle.id}
                    className="absolute w-2 h-2 bg-primary rounded-full animate-ripple"
                    style={{
                      top: '50%',
                      left: '50%',
                      transform: `translate(-50%, -50%)`,
                      animationDelay: `${particle.delay}ms`,
                      '--tx': `${particle.tx}px`,
                      '--ty': `${particle.ty}px`
                    }}
                  ></div>
                ))}
              </div>
              
              {/* دکمه کلیک */}
              <div className="text-center mt-12">
                <div className="text-sm text-secondary mb-2">
                  برای استخراج کلیک کنید
                </div>
                <button
                  className={`btn btn-primary btn-lg ${isAnimating ? 'animate-button-press' : ''}`}
                  onClick={handleMineClick}
                  disabled={isAnimating}
                >
                  {isAnimating ? (
                    <>
                      <i className="fas fa-bolt"></i>
                      در حال استخراج...
                    </>
                  ) : (
                    <>
                      <i className="fas fa-hard-hat"></i>
                      استخراج دستی
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
          
          {/* آمار و کنترل‌ها */}
          <div className="flex-1">
            <h3 className="text-2xl font-bold mb-6">آمار استخراج</h3>
            
            <div className="space-y-6">
              {/* آمار روزانه */}
              <div className="bg-glass rounded-xl p-6">
                <div className="flex justify-between items-center mb-4">
                  <div>
                    <div className="text-sm text-secondary">امروز</div>
                    <div className="text-2xl font-bold text-primary">
                      {miningData.todayEarnings.toLocaleString('fa-IR')} SOD
                    </div>
                  </div>
                  <div className="text-3xl">📊</div>
                </div>
                <div className="progress-bar">
                  <div 
                    className="progress-fill" 
                    style={{ width: `${(miningData.todayEarnings / 10000) * 100}%` }}
                  ></div>
                </div>
              </div>
              
              {/* آمار کلی */}
              <div className="bg-glass rounded-xl p-6">
                <div className="flex justify-between items-center">
                  <div>
                    <div className="text-sm text-secondary">کل استخراج</div>
                    <div className="text-2xl font-bold text-success">
                      {miningData.totalEarnings.toLocaleString('fa-IR')} SOD
                    </div>
                  </div>
                  <div className="text-3xl">💰</div>
                </div>
              </div>
              
              {/* کنترل‌ها */}
              <div className="grid grid-cols-2 gap-4">
                <button
                  className={`btn ${miningData.autoMining ? 'btn-success' : 'btn-outline'}`}
                  onClick={toggleAutoMining}
                >
                  <i className={`fas ${miningData.autoMining ? 'fa-robot' : 'fa-cog'}`}></i>
                  {miningData.autoMining ? 'خودکار فعال' : 'استخراج خودکار'}
                </button>
                
                <button
                  className={`btn ${miningData.boostTime > 0 ? 'btn-accent' : 'btn-outline'}`}
                  onClick={activateBoost}
                  disabled={miningData.boostTime > 0}
                >
                  <i className="fas fa-bolt"></i>
                  {miningData.boostTime > 0 ? `${miningData.boostTime}ثانیه` : 'افزایش قدرت'}
                </button>
                
                <button
                  className="btn btn-outline"
                  onClick={() => setShowUpgradeModal(true)}
                >
                  <i className="fas fa-chart-line"></i>
                  آمار پیشرفته
                </button>
                
                <button
                  className="btn btn-primary"
                  onClick={handleUpgrade}
                >
                  <i className="fas fa-arrow-up"></i>
                  ارتقاء ({miningData.nextLevelCost.toLocaleString('fa-IR')} SOD)
                </button>
              </div>
              
              {/* اطلاعات سطح */}
              <div className="bg-glass rounded-xl p-6">
                <div className="flex justify-between items-center mb-4">
                  <div>
                    <div className="text-sm text-secondary">سطح ماینر</div>
                    <div className="text-2xl font-bold">{miningData.level}</div>
                  </div>
                  <div className="text-3xl">🏆</div>
                </div>
                <div className="text-sm text-secondary">
                  تا سطح بعدی: {miningData.nextLevelCost.toLocaleString('fa-IR')} SOD
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* مودال ارتقاء */}
      {showUpgradeModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 animate-modal-fade-in">
          <div className="bg-bg-surface rounded-2xl p-8 max-w-md w-full mx-4 animate-modal-slide-up">
            <div className="text-center">
              <div className="w-20 h-20 bg-gradient-to-br from-primary to-secondary rounded-full flex items-center justify-center text-2xl mb-6 mx-auto animate-level-up">
                🎉
              </div>
              <h3 className="text-2xl font-bold mb-4">ارتقاء موفق!</h3>
              <p className="text-secondary mb-6">
                ماینر شما به سطح {miningData.level + 1} ارتقا یافت!
                <br />
                قدرت استخراج شما +۵ افزایش یافت.
              </p>
              <button
                className="btn btn-primary w-full"
                onClick={() => setShowUpgradeModal(false)}
              >
                باشه، متشکرم!
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MiningCenter;
