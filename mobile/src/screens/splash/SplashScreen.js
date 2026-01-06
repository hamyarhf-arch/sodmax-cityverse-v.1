[file name]: mobile/src/screens/splash/SplashScreen.js
[file content begin]
import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Easing,
  Dimensions,
} from 'react-native';
import { useTheme } from '@context/ThemeContext';
import { initializeAppData, getAppStatus } from '@services/init';

const { width, height } = Dimensions.get('window');

const SplashScreen = ({ navigation }) => {
  const { theme } = useTheme();
  
  // انیمیشن‌ها
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;
  const textAnim = useRef(new Animated.Value(0)).current;
  
  // متون برای تایپ کردن
  const texts = [
    'در حال بارگذاری...',
    'راه‌اندازی سرویس‌ها...',
    'لود داده‌های کاربری...',
    'آماده‌سازی رابط کاربری...',
    'تقریباً آماده است!',
  ];
  const [currentText, setCurrentText] = React.useState(0);

  useEffect(() => {
    // شروع انیمیشن‌ها
    startAnimations();
    
    // شروع فرآیند راه‌اندازی
    initializeApp();
  }, []);

  const startAnimations = () => {
    // انیمیشن fade in
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
    }).start();

    // انیمیشن scale
    Animated.timing(scaleAnim, {
      toValue: 1,
      duration: 1000,
      easing: Easing.elastic(1.2),
      useNativeDriver: true,
    }).start();

    // انیمیشن چرخش لوگو
    Animated.loop(
      Animated.timing(rotateAnim, {
        toValue: 1,
        duration: 3000,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    ).start();

    // انیمیشن پیشرفت
    Animated.timing(progressAnim, {
      toValue: 1,
      duration: 4000,
      easing: Easing.bezier(0.4, 0, 0.2, 1),
      useNativeDriver: false,
    }).start();

    // تغییر متن‌ها
    const textInterval = setInterval(() => {
      setCurrentText((prev) => {
        if (prev < texts.length - 1) {
          return prev + 1;
        }
        return prev;
      });
    }, 800);

    return () => clearInterval(textInterval);
  };

  const initializeApp = async () => {
    try {
      console.log('🚀 شروع فرآیند راه‌اندازی اپلیکیشن...');
      
      // راه‌اندازی داده‌های اولیه
      const initResult = await initializeAppData();
      
      if (!initResult.success) {
        throw new Error(initResult.error || 'خطا در راه‌اندازی اولیه');
      }
      
      // دریافت وضعیت اپلیکیشن
      const appStatus = await getAppStatus();
      console.log('📊 وضعیت اپلیکیشن:', appStatus);
      
      // تاخیر مصنوعی برای نمایش اسپلش اسکرین
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // بررسی وجود کاربر فعلی
      const hasCurrentUser = appStatus.hasCurrentUser;
      
      // هدایت به صفحه مناسب
      setTimeout(() => {
        if (hasCurrentUser) {
          navigation.replace('Main');
        } else {
          navigation.replace('Auth', { screen: 'Login' });
        }
      }, 500);
      
    } catch (error) {
      console.error('❌ خطا در راه‌اندازی اپلیکیشن:', error);
      
      // در صورت خطا، به صفحه خطا هدایت شود
      setTimeout(() => {
        navigation.replace('Auth', { screen: 'Login' });
      }, 1000);
    }
  };

  const rotateInterpolate = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const progressWidth = progressAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
  });

  const textOpacity = textAnim.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [0, 1, 0],
  });

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* افکت‌های پس‌زمینه */}
      <View style={styles.backgroundEffects}>
        <View style={[styles.circle, styles.circle1]} />
        <View style={[styles.circle, styles.circle2]} />
        <View style={[styles.circle, styles.circle3]} />
      </View>
      
      {/* محتوای اصلی */}
      <View style={styles.content}>
        {/* لوگو */}
        <Animated.View
          style={[
            styles.logoContainer,
            {
              opacity: fadeAnim,
              transform: [
                { scale: scaleAnim },
                { rotate: rotateInterpolate },
              ],
            },
          ]}
        >
          <View style={[styles.logo, { backgroundColor: theme.colors.primary }]}>
            <Text style={styles.logoText}>⚡</Text>
          </View>
        </Animated.View>
        
        {/* متن عنوان */}
        <Animated.View style={{ opacity: fadeAnim, marginTop: 40 }}>
          <Text style={[styles.title, { color: theme.colors.text }]}>
            SODmAX CityVerse
          </Text>
          <Text style={[styles.subtitle, { color: theme.colors.secondary }]}>
            پلتفرم پیشرفته درآمدزایی
          </Text>
        </Animated.View>
        
        {/* نوار پیشرفت */}
        <View style={styles.progressContainer}>
          <View style={[styles.progressBar, { backgroundColor: 'rgba(255,255,255,0.1)' }]}>
            <Animated.View
              style={[
                styles.progressFill,
                {
                  width: progressWidth,
                  backgroundColor: theme.colors.primary,
                },
              ]}
            />
          </View>
          
          {/* متن در حال لود */}
          <Text style={[styles.loadingText, { color: theme.colors.secondary }]}>
            {texts[currentText]}
          </Text>
        </View>
        
        {/* اطلاعات نسخه */}
        <View style={styles.versionContainer}>
          <Text style={[styles.versionText, { color: theme.colors.muted }]}>
            نسخه ۲.۰.۰
          </Text>
          <Text style={[styles.copyrightText, { color: theme.colors.muted }]}>
            © ۲۰۲۴ SODmAX
          </Text>
        </View>
      </View>
      
      {/* افکت‌های جلوه‌بخش */}
      <View style={styles.floatingEffects}>
        <Animated.View
          style={[
            styles.floatingEffect,
            styles.effect1,
            { opacity: fadeAnim },
          ]}
        />
        <Animated.View
          style={[
            styles.floatingEffect,
            styles.effect2,
            { opacity: fadeAnim },
          ]}
        />
        <Animated.View
          style={[
            styles.floatingEffect,
            styles.effect3,
            { opacity: fadeAnim },
          ]}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backgroundEffects: {
    position: 'absolute',
    width: '100%',
    height: '100%',
  },
  circle: {
    position: 'absolute',
    borderRadius: 1000,
    opacity: 0.1,
  },
  circle1: {
    width: 400,
    height: 400,
    backgroundColor: '#0066FF',
    top: -100,
    left: -100,
  },
  circle2: {
    width: 300,
    height: 300,
    backgroundColor: '#00D4AA',
    bottom: -50,
    right: -50,
  },
  circle3: {
    width: 200,
    height: 200,
    backgroundColor: '#FF6B35',
    top: '40%',
    right: '20%',
  },
  content: {
    alignItems: 'center',
    paddingHorizontal: 32,
    zIndex: 1,
  },
  logoContainer: {
    marginBottom: 20,
  },
  logo: {
    width: 120,
    height: 120,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#0066FF',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 10,
  },
  logoText: {
    fontSize: 60,
    color: 'white',
  },
  title: {
    fontSize: 28,
    fontWeight: '900',
    textAlign: 'center',
    marginBottom: 8,
    fontFamily: 'Vazirmatn-Bold',
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    opacity: 0.8,
    fontFamily: 'Vazirmatn-Regular',
  },
  progressContainer: {
    width: '100%',
    marginTop: 60,
    alignItems: 'center',
  },
  progressBar: {
    width: '100%',
    height: 6,
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: 16,
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
  loadingText: {
    fontSize: 14,
    fontFamily: 'Vazirmatn-Medium',
  },
  versionContainer: {
    position: 'absolute',
    bottom: 40,
    alignItems: 'center',
  },
  versionText: {
    fontSize: 12,
    marginBottom: 4,
    fontFamily: 'Vazirmatn-Regular',
  },
  copyrightText: {
    fontSize: 11,
    opacity: 0.7,
    fontFamily: 'Vazirmatn-Light',
  },
  floatingEffects: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    pointerEvents: 'none',
  },
  floatingEffect: {
    position: 'absolute',
    backgroundColor: '#0066FF',
    borderRadius: 100,
    opacity: 0.05,
  },
  effect1: {
    width: 80,
    height: 80,
    top: '20%',
    left: '10%',
  },
  effect2: {
    width: 60,
    height: 60,
    top: '60%',
    right: '15%',
  },
  effect3: {
    width: 40,
    height: 40,
    bottom: '30%',
    left: '20%',
  },
});

export default SplashScreen;
[file content end]
