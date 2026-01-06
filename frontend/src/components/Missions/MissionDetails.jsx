import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useMission } from '../../contexts/MissionContext';
import '../../styles/main.css';
import '../../styles/animations.css';

const MissionDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { getMissionById, completeMission, loading } = useMission();
  
  const [mission, setMission] = useState(null);
  const [activeTab, setActiveTab] = useState('details');
  const [progress, setProgress] = useState(0);
  const [isCompleting, setIsCompleting] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  useEffect(() => {
    const fetchMission = async () => {
      const missionData = await getMissionById(id);
      if (missionData) {
        setMission(missionData);
        setProgress(missionData.progress || 0);
      }
    };
    
    fetchMission();
  }, [id, getMissionById]);

  const handleProgressUpdate = (newProgress) => {
    setProgress(Math.min(newProgress, mission.total));
  };

  const handleCompleteMission = async () => {
    if (progress < mission.total) {
      alert(`برای تکمیل مأموریت باید ${mission.total - progress} واحد دیگر پیشرفت کنید!`);
      return;
    }
    
    setIsCompleting(true);
    
    try {
      const result = await completeMission(mission.id);
      if (result.success) {
        setShowSuccessModal(true);
        setTimeout(() => {
          setShowSuccessModal(false);
          navigate('/missions');
        }, 3000);
      } else {
        alert(result.message || 'خطا در تکمیل مأموریت');
      }
    } catch (error) {
      alert('خطا در ارتباط با سرور');
    } finally {
      setIsCompleting(false);
    }
  };

  const progressPercentage = Math.round((progress / mission?.total) * 100);

  if (loading || !mission) {
    return (
      <div className="mission-details">
        <div className="container py-8">
          <div className="card">
            <div className="flex justify-center py-12">
              <div className="loader"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mission-details">
      <div className="container py-8">
        {/* دکمه بازگشت */}
        <button 
          className="btn btn-ghost mb-6"
          onClick={() => navigate('/missions')}
        >
          <i className="fas fa-arrow-right"></i>
          بازگشت به لیست مأموریت‌ها
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* ستون چپ - اطلاعات اصلی */}
          <div className="lg:col-span-2 space-y-8">
            {/* هدر مأموریت */}
            <div className="card">
              <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 mb-6">
                <div className="flex items-start gap-4">
                  <div 
                    className={`w-20 h-20 rounded-2xl flex items-center justify-center text-3xl ${
                      mission.type === 'click' ? 'bg-primary/20 text-primary' :
                      mission.type === 'mining' ? 'bg-accent/20 text-accent' :
                      mission.type === 'referral' ? 'bg-success/20 text-success' :
                      'bg-info/20 text-info'
                    }`}
                  >
                    {mission.type === 'click' ? '👆' :
                     mission.type === 'mining' ? '⚡' :
                     mission.type === 'referral' ? '🤝' :
                     mission.type === 'social' ? '📱' : '🎯'}
                  </div>
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <h1 className="text-2xl font-bold">{mission.title}</h1>
                      {mission.isSpecial && (
                        <span className="bg-gradient-to-r from-primary to-secondary text-white text-xs font-bold px-3 py-1 rounded-full">
                          ویژه
                        </span>
                      )}
                      {mission.isNew && (
                        <span className="bg-accent text-white text-xs font-bold px-3 py-1 rounded-full">
                          جدید
                        </span>
                      )}
                    </div>
                    <p className="text-secondary">{mission.description}</p>
                    
                    <div className="flex flex-wrap gap-4 mt-4">
                      <div className="flex items-center gap-2">
                        <i className="fas fa-users text-tertiary"></i>
                        <span className="text-sm">{mission.participants?.toLocaleString('fa-IR') || '۰'} شرکت‌کننده</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <i className="fas fa-clock text-tertiary"></i>
                        <span className="text-sm">زمان تخمینی: {mission.estimatedTime || '۲ ساعت'}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <i className="fas fa-star text-tertiary"></i>
                        <span className="text-sm">سختی: {mission.difficulty || 'متوسط'}</span>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="text-center">
                  <div className="text-3xl font-bold text-accent mb-2">
                    +{mission.reward.toLocaleString('fa-IR')} تومان
                  </div>
                  <div className="text-sm text-secondary">پاداش اصلی</div>
                  {mission.bonusReward && (
                    <div className="text-sm text-success mt-1">
                      +{mission.bonusReward} پاداش اضافی
                    </div>
                  )}
                </div>
              </div>

              {/* پیشرفت */}
              <div className="mb-8">
                <div className="flex justify-between items-center mb-4">
                  <div>
                    <div className="text-sm text-secondary">پیشرفت شما</div>
                    <div className="text-2xl font-bold">{progressPercentage}%</div>
                  </div>
                  <div className="text-sm text-secondary">
                    {progress.toLocaleString('fa-IR')} از {mission.total.toLocaleString('fa-IR')}
                  </div>
                </div>
                
                <div className="progress-bar h-4">
                  <div 
                    className="progress-fill h-4" 
                    style={{ width: `${progressPercentage}%` }}
                  ></div>
                </div>
                
                <div className="flex justify-between items-center mt-4">
                  <button 
                    className="btn btn-outline btn-sm"
                    onClick={() => handleProgressUpdate(progress - 1)}
                    disabled={progress <= 0}
                  >
                    <i className="fas fa-minus"></i>
                    کاهش
                  </button>
                  
                  <button 
                    className="btn btn-primary"
                    onClick={() => handleProgressUpdate(progress + 1)}
                    disabled={progress >= mission.total}
                  >
                    <i className="fas fa-plus"></i>
                    افزایش پیشرفت
                  </button>
                </div>
              </div>
            </div>

            {/* تب‌ها */}
            <div className="card">
              <div className="flex overflow-x-auto mb-6 pb-2 gap-1">
                {[
                  { id: 'details', label: 'جزئیات', icon: '📋' },
                  { id: 'steps', label: 'مراحل', icon: '🎯' },
                  { id: 'rewards', label: 'پاداش‌ها', icon: '💰' },
                  { id: 'leaderboard', label: 'جدول برترین‌ها', icon: '🏆' },
                  { id: 'tips', label: 'نکات و راهنما', icon: '💡' }
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

              {/* محتوای تب‌ها */}
              <div className="animate-fadeIn">
                {activeTab === 'details' && (
                  <div>
                    <h3 className="text-xl font-bold mb-4">جزئیات مأموریت</h3>
                    <div className="space-y-4">
                      <p className="text-secondary leading-relaxed">
                        {mission.fullDescription || mission.description}
                      </p>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="bg-glass rounded-xl p-4">
                          <div className="text-sm text-secondary mb-2">🎯 هدف مأموریت</div>
                          <p>{mission.objective || 'رسیدن به حداکثر پیشرفت در مدت زمان مشخص'}</p>
                        </div>
                        <div className="bg-glass rounded-xl p-4">
                          <div className="text-sm text-secondary mb-2">📅 مدت زمان</div>
                          <p>{mission.duration || 'تا زمان انقضا: ' + (mission.deadline || 'نامحدود')}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'steps' && (
                  <div>
                    <h3 className="text-xl font-bold mb-4">مراحل تکمیل مأموریت</h3>
                    <div className="space-y-4">
                      {mission.steps?.map((step, index) => (
                        <div key={index} className="flex items-start gap-4 p-4 bg-glass rounded-xl">
                          <div className="flex-shrink-0 w-8 h-8 bg-primary/20 text-primary rounded-full flex items-center justify-center font-bold">
                            {index + 1}
                          </div>
                          <div>
                            <div className="font-bold mb-2">{step.title}</div>
                            <p className="text-secondary">{step.description}</p>
                            {step.tip && (
                              <div className="mt-2 text-sm text-success">
                                <i className="fas fa-lightbulb"></i> نکته: {step.tip}
                              </div>
                            )}
                          </div>
                          {step.completed && (
                            <div className="ml-auto">
                              <i className="fas fa-check-circle text-success text-xl"></i>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {activeTab === 'rewards' && (
                  <div>
                    <h3 className="text-xl font-bold mb-4">پاداش‌های مأموریت</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                      <div className="bg-gradient-to-br from-primary/20 to-primary/5 rounded-xl p-6 text-center">
                        <div className="text-3xl mb-2">💰</div>
                        <div className="text-xl font-bold text-primary mb-2">
                          +{mission.reward.toLocaleString('fa-IR')} تومان
                        </div>
                        <div className="text-sm text-secondary">پاداش اصلی</div>
                      </div>
                      
                      <div className="bg-gradient-to-br from-success/20 to-success/5 rounded-xl p-6 text-center">
                        <div className="text-3xl mb-2">⚡</div>
                        <div className="text-xl font-bold text-success mb-2">
                          +{mission.xpReward || '۵۰۰'} XP
                        </div>
                        <div className="text-sm text-secondary">امتیاز تجربه</div>
                      </div>
                      
                      <div className="bg-gradient-to-br from-accent/20 to-accent/5 rounded-xl p-6 text-center">
                        <div className="text-3xl mb-2">🎁</div>
                        <div className="text-xl font-bold text-accent mb-2">
                          +{mission.bonusReward || '۲۵۰'} SOD
                        </div>
                        <div className="text-sm text-secondary">پاداش ویژه</div>
                      </div>
                    </div>
                    
                    <div className="bg-glass rounded-xl p-6">
                      <h4 className="font-bold mb-4">پاداش‌های مرحله‌ای</h4>
                      <div className="space-y-3">
                        {mission.stageRewards?.map((stage, index) => (
                          <div key={index} className="flex justify-between items-center p-3 rounded-lg bg-bg-surface">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 bg-primary/20 rounded-full flex items-center justify-center">
                                {index + 1}
                              </div>
                              <div>
                                <div className="font-bold">{stage.title}</div>
                                <div className="text-sm text-secondary">{stage.requirement}</div>
                              </div>
                            </div>
                            <div className="text-success font-bold">+{stage.reward}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'leaderboard' && (
                  <div>
                    <h3 className="text-xl font-bold mb-4">جدول برترین‌ها</h3>
                    <div className="overflow-x-auto">
                      <table className="table w-full">
                        <thead>
                          <tr>
                            <th>رتبه</th>
                            <th>کاربر</th>
                            <th>پیشرفت</th>
                            <th>زمان</th>
                            <th>پاداش</th>
                          </tr>
                        </thead>
                        <tbody>
                          {mission.leaderboard?.map((user, index) => (
                            <tr key={index}>
                              <td>
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                                  index === 0 ? 'bg-gradient-to-br from-yellow-500 to-yellow-300 text-black' :
                                  index === 1 ? 'bg-gradient-to-br from-gray-400 to-gray-300 text-white' :
                                  index === 2 ? 'bg-gradient-to-br from-amber-700 to-amber-600 text-white' :
                                  'bg-glass'
                                }`}>
                                  {index + 1}
                                </div>
                              </td>
                              <td>
                                <div className="flex items-center gap-2">
                                  <div className="avatar avatar-sm">
                                    {user.name.charAt(0)}
                                  </div>
                                  <div>
                                    <div className="font-bold">{user.name}</div>
                                    <div className="text-xs text-secondary">سطح {user.level}</div>
                                  </div>
                                </div>
                              </td>
                              <td>
                                <div className="w-24 h-2 bg-glass rounded-full overflow-hidden">
                                  <div 
                                    className="h-full bg-gradient-to-r from-primary to-secondary"
                                    style={{ width: `${user.progress}%` }}
                                  ></div>
                                </div>
                              </td>
                              <td>{user.time}</td>
                              <td className="font-bold text-success">+{user.reward.toLocaleString('fa-IR')}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {activeTab === 'tips' && (
                  <div>
                    <h3 className="text-xl font-bold mb-4">نکات و راهنمایی</h3>
                    <div className="space-y-4">
                      <div className="bg-glass rounded-xl p-6">
                        <div className="flex items-center gap-3 mb-4">
                          <div className="w-12 h-12 bg-success/20 rounded-xl flex items-center justify-center text-xl">
                            💡
                          </div>
                          <div>
                            <div className="font-bold">راهکارهای سریع</div>
                            <div className="text-sm text-secondary">برای تکمیل سریع‌تر مأموریت</div>
                          </div>
                        </div>
                        <ul className="space-y-3">
                          {mission.tips?.map((tip, index) => (
                            <li key={index} className="flex items-start gap-2">
                              <i className="fas fa-check text-success mt-1"></i>
                              <span>{tip}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                      
                      <div className="bg-glass rounded-xl p-6">
                        <div className="flex items-center gap-3 mb-4">
                          <div className="w-12 h-12 bg-primary/20 rounded-xl flex items-center justify-center text-xl">
                            ⚠️
                          </div>
                          <div>
                            <div className="font-bold">نکات مهم</div>
                            <div className="text-sm text-secondary">مواردی که باید رعایت کنید</div>
                          </div>
                        </div>
                        <ul className="space-y-3">
                          <li className="flex items-start gap-2">
                            <i className="fas fa-exclamation-triangle text-accent mt-1"></i>
                            <span>مأموریت پس از انقضا قابل تکمیل نیست</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <i className="fas fa-exclamation-triangle text-accent mt-1"></i>
                            <span>پیشرفت شما پس از خروج ذخیره می‌شود</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <i className="fas fa-exclamation-triangle text-accent mt-1"></i>
                            <span>فقط یک بار می‌توانید پاداش را دریافت کنید</span>
                          </li>
                        </ul>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* ستون راست - اقدامات و اطلاعات */}
          <div className="space-y-8">
            {/* پنل اقدامات */}
            <div className="card">
              <h3 className="text-xl font-bold mb-6">اقدامات مأموریت</h3>
              
              <div className="space-y-4">
                {mission.status === 'completed' ? (
                  <div className="text-center py-8">
                    <div className="text-5xl mb-4">🎉</div>
                    <div className="font-bold text-lg mb-2">مأموریت تکمیل شده!</div>
                    <div className="text-secondary mb-6">
                      شما این مأموریت را با موفقیت به پایان رساندید.
                    </div>
                    <button className="btn btn-success w-full" disabled>
                      <i className="fas fa-gift"></i>
                      پاداش دریافت شده
                    </button>
                  </div>
                ) : (
                  <>
                    <button
                      className="btn btn-primary w-full"
                      onClick={handleCompleteMission}
                      disabled={progress < mission.total || isCompleting}
                    >
                      {isCompleting ? (
                        <>
                          <i className="fas fa-spinner fa-spin"></i>
                          در حال تکمیل...
                        </>
                      ) : progress >= mission.total ? (
                        <>
                          <i className="fas fa-check-circle"></i>
                          تکمیل مأموریت و دریافت پاداش
                        </>
                      ) : (
                        <>
                          <i className="fas fa-play"></i>
                          ادامه مأmوریت ({mission.total - progress} واحد باقی‌مانده)
                        </>
                      )}
                    </button>
                    
                    <button className="btn btn-outline w-full">
                      <i className="fas fa-share-alt"></i>
                      اشتراک‌گذاری با دوستان
                    </button>
                    
                    <button className="btn btn-ghost w-full">
                      <i className="fas fa-question-circle"></i>
                      درخواست راهنمایی
                    </button>
                  </>
                )}
              </div>
            </div>

            {/* اطلاعات فنی */}
            <div className="card">
              <h3 className="text-xl font-bold mb-6">📊 اطلاعات فنی</h3>
              
              <div className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-secondary">شناسه مأموریت</span>
                  <span className="font-mono">{mission.id}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-secondary">نوع مأموریت</span>
                  <span className="font-bold">{mission.type}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-secondary">سطح دشواری</span>
                  <div className="flex gap-1">
                    {[...Array(5)].map((_, i) => (
                      <i 
                        key={i}
                        className={`fas fa-star ${i < (mission.difficultyLevel || 3) ? 'text-accent' : 'text-tertiary'}`}
                      ></i>
                    ))}
                  </div>
                </div>
                <div className="flex justify-between">
                  <span className="text-secondary">تاریخ ایجاد</span>
                  <span>{mission.createdAt || '۱۴۰۲/۰۵/۱۰'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-secondary">آخرین بروزرسانی</span>
                  <span>{mission.updatedAt || 'امروز'}</span>
                </div>
              </div>
            </div>

            {/* پنل زمان */}
            <div className="card">
              <h3 className="text-xl font-bold mb-6">⏳ زمان باقی‌مانده</h3>
              
              <div className="text-center">
                {mission.deadline ? (
                  <>
                    <div className="text-5xl font-bold text-accent mb-4">
                      {mission.timeRemaining?.split(' ')[0] || '۲۴'}
                    </div>
                    <div className="text-secondary mb-6">
                      {mission.timeRemaining?.includes('روز') ? 'روز' : 'ساعت'} تا انقضا
                    </div>
                    <div className="text-sm text-tertiary">
                      تاریخ انقضا: {mission.deadline}
                    </div>
                  </>
                ) : (
                  <div className="text-secondary">این مأموریت محدودیت زمانی ندارد</div>
                )}
              </div>
            </div>

            {/* پنل پشتیبانی */}
            <div className="card bg-gradient-to-r from-primary/10 to-secondary/10 border-primary/20">
              <div className="text-center">
                <div className="text-3xl mb-4">🤝</div>
                <h4 className="font-bold mb-2">نیاز به کمک دارید؟</h4>
                <p className="text-secondary text-sm mb-4">
                  تیم پشتیبانی ما ۲۴/۷ آماده کمک به شماست
                </p>
                <button className="btn btn-primary w-full">
                  <i className="fas fa-headset"></i>
                  ارتباط با پشتیبانی
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* مودال موفقیت */}
      {showSuccessModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 animate-modal-fade-in">
          <div className="bg-bg-surface rounded-2xl p-8 max-w-md w-full mx-4 animate-modal-slide-up">
            <div className="text-center">
              <div className="w-20 h-20 bg-gradient-to-br from-success to-emerald-500 rounded-full flex items-center justify-center text-2xl mb-6 mx-auto animate-level-up">
                🎉
              </div>
              <h3 className="text-2xl font-bold mb-4">تبریک! 🎊</h3>
              <p className="text-secondary mb-6">
                مأموریت "<strong>{mission.title}</strong>" با موفقیت تکمیل شد!
                <br />
                پاداش <span className="text-success font-bold">{mission.reward.toLocaleString('fa-IR')} تومان</span> به حساب شما واریز شد.
              </p>
              <div className="bg-glass rounded-xl p-6 mb-6">
                <div className="text-sm text-secondary mb-2">پاداش‌های دریافتی:</div>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>پاداش اصلی:</span>
                    <span className="font-bold text-success">+{mission.reward.toLocaleString('fa-IR')} تومان</span>
                  </div>
                  {mission.xpReward && (
                    <div className="flex justify-between">
                      <span>امتیاز تجربه:</span>
                      <span className="font-bold text-primary">+{mission.xpReward} XP</span>
                    </div>
                  )}
                  {mission.bonusReward && (
                    <div className="flex justify-between">
                      <span>پاداش ویژه:</span>
                      <span className="font-bold text-accent">+{mission.bonusReward} SOD</span>
                    </div>
                  )}
                </div>
              </div>
              <button
                className="btn btn-primary w-full"
                onClick={() => {
                  setShowSuccessModal(false);
                  navigate('/missions');
                }}
              >
                مشاهده مأموریت‌های دیگر
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MissionDetails;
