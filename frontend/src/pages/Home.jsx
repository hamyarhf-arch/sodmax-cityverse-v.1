import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import '../styles/main.css';
import '../styles/animations.css';

const Home = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalUsers: 12543,
    totalBusinesses: 892,
    totalMined: '4.2M',
    totalRewards: '12.5M'
  });

  const features = [
    {
      icon: '⚡',
      title: 'استخراج هوشمند',
      description: 'با سیستم ماینینگ هوشمند SODmAX، به صورت خودکار درآمد کسب کنید',
      color: 'var(--primary)'
    },
    {
      icon: '🏙️',
      title: 'شهر دیجیتال',
      description: 'در شهر دیجیتال SODmAX کسب‌وکار خود را راه‌اندازی کنید',
      color: 'var(--secondary)'
    },
    {
      icon: '🎯',
      title: 'مأموریت‌ها',
      description: 'با انجام مأموریت‌های جذاب، پاداش‌های ویژه دریافت کنید',
      color: 'var(--accent)'
    },
    {
      icon: '🤝',
      title: 'سیستم دعوت',
      description: 'دوستان خود را دعوت کنید و از هر دعوت درآمد کسب نمایید',
      color: 'var(--success)'
    },
    {
      icon: '💰',
      title: 'کیف پول چند ارزی',
      description: 'از چندین ارز مختلف پشتیبانی می‌کند و امکان تبدیل آسان',
      color: 'var(--premium)'
    },
    {
      icon: '🛡️',
      title: 'امنیت بالا',
      description: 'با سیستم امنیتی پیشرفته، دارایی‌های شما کاملاً محافظت می‌شوند',
      color: 'var(--info)'
    }
  ];

  const testimonials = [
    {
      name: 'علی محمدی',
      role: 'کاربر فعال',
      text: 'ظرف ۳ ماه بیش از ۵۰ میلیون تومان از طریق SODmAX درآمد کسب کردم!',
      avatar: 'ع'
    },
    {
      name: 'شرکت نوآوران',
      role: 'کسب‌وکار',
      text: 'بازاریابی فوق‌العاده‌ای داشتیم. مشتریان جدید زیادی جذب کردیم.',
      avatar: 'ن'
    },
    {
      name: 'سارا کریمی',
      role: 'اینفلوئنسر',
      text: 'بهترین پلتفرم برای همکاری با برندها و کسب درآمد آنلاین.',
      avatar: 'س'
    }
  ];

  return (
    <div className="min-h-screen">
      {/* هیرو */}
      <section className="relative overflow-hidden py-20">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-bg-primary z-0">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%239C92AC" fill-opacity="0.05"%3E%3Cpath d="M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-20"></div>
        </div>
        
        <div className="container relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="animate-fadeIn">
              <div className="inline-flex items-center gap-2 mb-6 px-4 py-2 bg-glass rounded-full">
                <span className="w-2 h-2 bg-primary rounded-full animate-pulse"></span>
                <span className="text-sm font-semibold">پلتفرم پیشرفته درآمدزایی</span>
              </div>
              
              <h1 className="text-5xl lg:text-6xl font-black mb-6 bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent animate-text-reveal">
                شهر آینده را
                <br />
                <span className="animate-sod-pulse">همین حالا تجربه کن</span>
              </h1>
              
              <p className="text-xl text-secondary mb-8">
                SODmAX CityVerse اولین پلتفرم ترکیبی استخراج، بازی‌سازی و کسب‌وکار دیجیتال
                با قابلیت درآمدزایی واقعی
              </p>
              
              <div className="flex flex-wrap gap-4">
                {user ? (
                  <>
                    <Link 
                      to="/dashboard" 
                      className="btn btn-primary btn-lg animate-hover"
                    >
                      ورود به پنل کاربری
                    </Link>
                    <Link 
                      to="/business" 
                      className="btn btn-outline btn-lg"
                    >
                      پنل کسب‌وکار
                    </Link>
                  </>
                ) : (
                  <>
                    <Link 
                      to="/register" 
                      className="btn btn-primary btn-lg"
                    >
                      شروع رایگان
                    </Link>
                    <Link 
                      to="/login" 
                      className="btn btn-outline btn-lg"
                    >
                      ورود به حساب
                    </Link>
                  </>
                )}
              </div>
              
              <div className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-4 bg-glass rounded-xl">
                  <div className="text-2xl font-bold text-primary mb-1">{stats.totalUsers.toLocaleString('fa-IR')}</div>
                  <div className="text-sm text-tertiary">کاربر فعال</div>
                </div>
                <div className="text-center p-4 bg-glass rounded-xl">
                  <div className="text-2xl font-bold text-secondary mb-1">{stats.totalBusinesses.toLocaleString('fa-IR')}</div>
                  <div className="text-sm text-tertiary">کسب‌وکار</div>
                </div>
                <div className="text-center p-4 bg-glass rounded-xl">
                  <div className="text-2xl font-bold text-accent mb-1">{stats.totalMined}</div>
                  <div className="text-sm text-tertiary">SOD استخراج شده</div>
                </div>
                <div className="text-center p-4 bg-glass rounded-xl">
                  <div className="text-2xl font-bold text-success mb-1">{stats.totalRewards}</div>
                  <div className="text-sm text-tertiary">تومان پاداش</div>
                </div>
              </div>
            </div>
            
            <div className="relative">
              <div className="relative w-full h-[500px]">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-transparent to-accent/10 rounded-3xl animate-three-d-float"></div>
                <div className="absolute inset-4 bg-gradient-to-tl from-bg-surface to-bg-card rounded-2xl border border-white/10 shadow-2xl overflow-hidden">
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(0,102,255,0.15),transparent_50%)]"></div>
                  
                  {/* ماینر 3D */}
                  <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                    <div className="relative w-64 h-64 animate-mining-pulse">
                      <div className="absolute inset-0 bg-gradient-to-br from-primary/30 to-accent/20 rounded-full blur-xl"></div>
                      <div className="absolute inset-8 bg-gradient-to-tr from-primary/40 to-transparent rounded-full animate-mining-spin"></div>
                      <div className="absolute inset-12 bg-gradient-to-br from-bg-surface to-bg-card rounded-full border border-white/20 flex items-center justify-center">
                        <div className="text-5xl animate-mining-glow">⚡</div>
                      </div>
                      
                      {/* ذرات */}
                      {[...Array(8)].map((_, i) => (
                        <div 
                          key={i}
                          className="absolute w-2 h-2 bg-primary rounded-full"
                          style={{
                            top: '50%',
                            left: '50%',
                            transform: `rotate(${i * 45}deg) translateX(80px)`,
                            animation: `miningParticle 2s infinite ${i * 0.25}s`
                          }}
                        ></div>
                      ))}
                    </div>
                  </div>
                  
                  {/* شهر دیجیتال */}
                  <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 w-48">
                    <div className="flex justify-between items-end">
                      {[...Array(5)].map((_, i) => (
                        <div 
                          key={i}
                          className="bg-gradient-to-t from-primary to-secondary rounded-t-lg animate-building-rise"
                          style={{
                            width: `${20 + i * 5}px`,
                            height: `${40 + i * 15}px`,
                            animationDelay: `${i * 0.1}s`
                          }}
                        >
                          <div className="h-1 bg-white/20 mt-2 mx-1 rounded"></div>
                          <div className="h-1 bg-white/20 mt-1 mx-1 rounded"></div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
              
              {/* افکت‌های اضافی */}
              <div className="absolute -top-4 -right-4 w-32 h-32 bg-primary/10 rounded-full blur-3xl"></div>
              <div className="absolute -bottom-4 -left-4 w-32 h-32 bg-accent/10 rounded-full blur-3xl"></div>
            </div>
          </div>
        </div>
      </section>

      {/* ویژگی‌ها */}
      <section className="py-20 bg-gradient-to-b from-bg-primary to-bg-secondary">
        <div className="container">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">
              چرا <span className="text-primary">SODmAX CityVerse</span>؟
            </h2>
            <p className="text-xl text-secondary max-w-3xl mx-auto">
              ترکیبی منحصربه‌فرد از تکنولوژی، بازی‌سازی و اقتصاد دیجیتال
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <div 
                key={index}
                className="card group hover:animate-card-hover cursor-pointer"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div 
                  className="w-16 h-16 rounded-2xl flex items-center justify-center text-2xl mb-6"
                  style={{ 
                    background: `linear-gradient(135deg, ${feature.color}20, ${feature.color}40)`,
                    color: feature.color
                  }}
                >
                  {feature.icon}
                </div>
                
                <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
                <p className="text-secondary mb-4">{feature.description}</p>
                
                <div className="flex items-center text-primary font-semibold group-hover:gap-2 transition-all">
                  <span>اطلاعات بیشتر</span>
                  <svg className="w-4 h-4 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* نحوه کار */}
      <section className="py-20">
        <div className="container">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">
              تنها در <span className="text-primary">۴ مرحله</span> شروع کنید
            </h2>
            <p className="text-xl text-secondary max-w-3xl mx-auto">
              راه‌اندازی حساب و شروع درآمدزایی در کمتر از ۵ دقیقه
            </p>
          </div>
          
          <div className="relative">
            <div className="absolute top-1/2 left-0 right-0 h-1 bg-gradient-to-r from-primary via-secondary to-accent transform -translate-y-1/2 hidden lg:block"></div>
            
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 relative">
              {[
                { number: '۱', title: 'ثبت‌نام', desc: 'ثبت‌نام رایگان در کمتر از ۱ دقیقه' },
                { number: '۲', title: 'تأیید هویت', desc: 'تأیید شماره موبایل و دریافت هدیه' },
                { number: '۳', title: 'شروع استخراج', desc: 'فعال‌سازی ماینر و شروع کسب درآمد' },
                { number: '۴', title: 'درآمدزایی', desc: 'انجام مأموریت‌ها و دعوت دوستان' }
              ].map((step, index) => (
                <div key={index} className="relative">
                  <div className="bg-bg-surface rounded-2xl p-8 text-center relative z-10">
                    <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-2xl font-bold mb-6 mx-auto">
                      {step.number}
                    </div>
                    <h3 className="text-xl font-bold mb-3">{step.title}</h3>
                    <p className="text-secondary">{step.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          <div className="text-center mt-12">
            <Link 
              to="/register" 
              className="btn btn-primary btn-lg animate-pulse"
            >
              رایگان شروع کنید
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </Link>
          </div>
        </div>
      </section>

      {/* نظرات کاربران */}
      <section className="py-20 bg-gradient-to-b from-bg-secondary to-bg-primary">
        <div className="container">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">
              کاربران درباره ما چه می‌گویند؟
            </h2>
            <p className="text-xl text-secondary max-w-3xl mx-auto">
              به جمع هزاران کاربر راضی SODmAX بپیوندید
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="card">
                <div className="flex items-center gap-4 mb-6">
                  <div className="avatar avatar-lg">
                    {testimonial.avatar}
                  </div>
                  <div>
                    <div className="font-bold">{testimonial.name}</div>
                    <div className="text-sm text-secondary">{testimonial.role}</div>
                  </div>
                </div>
                
                <p className="text-secondary mb-4">"{testimonial.text}"</p>
                
                <div className="flex text-yellow-400">
                  {[...Array(5)].map((_, i) => (
                    <svg key={i} className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                      <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                    </svg>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA نهایی */}
      <section className="py-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-transparent to-secondary/10"></div>
        
        <div className="container relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-5xl font-bold mb-6">
              آماده‌اید درآمد خود را
              <span className="text-primary block">مضاعف کنید؟</span>
            </h2>
            
            <p className="text-xl text-secondary mb-8 max-w-2xl mx-auto">
              همین حالا به SODmAX CityVerse بپیوندید و از فرصت‌های بی‌نظیر درآمدزایی در شهر دیجیتال استفاده کنید
            </p>
            
            <div className="flex flex-wrap gap-4 justify-center">
              {user ? (
                <Link 
                  to="/dashboard" 
                  className="btn btn-primary btn-lg px-8"
                >
                  ادامه فعالیت
                </Link>
              ) : (
                <>
                  <Link 
                    to="/register" 
                    className="btn btn-primary btn-lg px-8"
                  >
                    ثبت‌نام رایگان
                  </Link>
                  <Link 
                    to="/login" 
                    className="btn btn-outline btn-lg px-8"
                  >
                    ورود به حساب
                  </Link>
                </>
              )}
            </div>
            
            <div className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-primary mb-1">۷۲۴/۷</div>
                <div className="text-sm text-tertiary">پشتیبانی</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-secondary mb-1">۱۰۰٪</div>
                <div className="text-sm text-tertiary">ضمانت امنیت</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-accent mb-1">۰ تومان</div>
                <div className="text-sm text-tertiary">هزینه شروع</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-success mb-1">۱۰۰۰+</div>
                <div className="text-sm text-tertiary">پرداخت روزانه</div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
