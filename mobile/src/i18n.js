[file name]: mobile/src/i18n.js
[file content begin]
import I18n from 'react-native-i18n';
import { I18nManager } from 'react-native';

// Enable RTL
I18nManager.forceRTL(true);
I18nManager.allowRTL(true);

// Translations
I18n.translations = {
  fa: {
    // Common
    welcome: 'خوش آمدید',
    loading: 'در حال بارگذاری...',
    error: 'خطا',
    success: 'موفق',
    warning: 'هشدار',
    ok: 'تأیید',
    cancel: 'لغو',
    back: 'بازگشت',
    next: 'بعدی',
    save: 'ذخیره',
    delete: 'حذف',
    edit: 'ویرایش',
    search: 'جستجو',
    
    // Auth
    login: 'ورود',
    register: 'ثبت‌نام',
    logout: 'خروج',
    phone: 'شماره موبایل',
    password: 'رمز عبور',
    confirmPassword: 'تکرار رمز عبور',
    forgotPassword: 'فراموشی رمز عبور',
    name: 'نام و نام خانوادگی',
    email: 'ایمیل',
    referralCode: 'کد دعوت',
    
    // Navigation
    dashboard: 'داشبورد',
    mining: 'استخراج',
    wallet: 'کیف پول',
    missions: 'مأموریت‌ها',
    rewards: 'پاداش‌ها',
    profile: 'پروفایل',
    settings: 'تنظیمات',
    support: 'پشتیبانی',
    notifications: 'اعلان‌ها',
    
    // Mining
    mine: 'استخراج',
    autoMine: 'استخراج خودکار',
    miningPower: 'قدرت استخراج',
    miningBoost: 'افزایش قدرت',
    upgradeMiner: 'ارتقاء ماینر',
    todaysEarnings: 'درآمد امروز',
    totalMined: 'کل استخراج',
    
    // Wallet
    balance: 'موجودی',
    withdraw: 'برداشت',
    deposit: 'واریز',
    transaction: 'تراکنش',
    transactionHistory: 'تاریخچه تراکنش‌ها',
    currency: 'ارز',
    amount: 'مبلغ',
    
    // Missions
    activeMissions: 'مأموریت‌های فعال',
    completedMissions: 'مأموریت‌های تکمیل شده',
    missionReward: 'پاداش مأموریت',
    missionProgress: 'پیشرفت',
    complete: 'تکمیل',
    
    // Profile
    level: 'سطح',
    experience: 'تجربه',
    referrals: 'زیرمجموعه',
    totalEarned: 'درآمد کل',
    joinDate: 'تاریخ عضویت',
    lastLogin: 'آخرین ورود',
    
    // Settings
    darkMode: 'حالت تاریک',
    notifications: 'اعلان‌ها',
    language: 'زبان',
    currency: 'واحد پول',
    security: 'امنیت',
    about: 'درباره',
    
    // Support
    help: 'راهنما',
    contactUs: 'تماس با ما',
    faq: 'سوالات متداول',
    ticket: 'تیکت پشتیبانی',
    
    // Errors
    requiredField: 'این فیلد الزامی است',
    invalidPhone: 'شماره موبایل معتبر نیست',
    invalidPassword: 'رمز عبور باید حداقل ۶ کاراکتر باشد',
    passwordsNotMatch: 'رمز عبورها مطابقت ندارند',
    networkError: 'خطا در ارتباط با سرور',
    
    // Success Messages
    loginSuccess: 'ورود موفقیت‌آمیز بود',
    registerSuccess: 'ثبت‌نام موفقیت‌آمیز بود',
    mineSuccess: 'استخراج موفقیت‌آمیز بود',
    withdrawSuccess: 'درخواست برداشت ثبت شد',
    
    // App Specific
    sodmax: 'SODmAX CityVerse',
    tagline: 'پلتفرم پیشرفته درآمدزایی',
  }
};

// Default locale
I18n.locale = 'fa';
I18n.defaultLocale = 'fa';

// Fallback
I18n.fallbacks = true;

export default I18n;
[file content end]
