[file name]: mobile/src/components/mining/MiningButton.js
[file content begin]
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Easing,
  Vibration,
} from 'react-native';
import { useTheme } from '@context/ThemeContext';
import { useApp } from '@context/AppContext';
import { useToast } from '@context/ToastContext';

const MiningButton = ({ onMine, showEffects = true }) => {
  const { theme } = useTheme();
  const { isMining, miningMultiplier } = useApp();
  const { showToast } = useToast();
  
  // انیمیشن‌ها
  const scaleAnim = useState(new Animated.Value(1))[0];
  const pulseAnim = useState(new Animated.Value(0))[0];
  const glowAnim = useState(new Animated.Value(0))[0];
  const clickAnim = useState(new Animated.Value(0))[0];
  
  // حالت‌ها
  const [isPressed, setIsPressed] = useState(false);
  const [comboCount, setComboCount] = useState(0);
  const [lastClickTime, setLastClickTime] = useState(0);
  const [particles, setParticles] = useState([]);

  // انیمیشن پالس
  useEffect(() => {
    if (showEffects) {
      const pulseAnimation = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 1500,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 0,
            duration: 1500,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
        ])
      );
      
      pulseAnimation.start();
      
      return () => {
        pulseAnimation.stop();
      };
    }
  }, [showEffects]);

  // انیمیشن درخشش
  useEffect(() => {
    if (showEffects) {
      const glowAnimation = Animated.loop(
        Animated.sequence([
          Animated.timing(glowAnim, {
            toValue: 1,
            duration: 2000,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(glowAnim, {
            toValue: 0.3,
            duration: 2000,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
        ])
      );
      
      glowAnimation.start();
      
      return () => {
        glowAnimation.stop();
      };
    }
  }, [showEffects]);

  // انیمیشن کلیک
  useEffect(() => {
    if (clickAnim._value > 0) {
      Animated.timing(clickAnim, {
        toValue: 0,
        duration: 300,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }).start();
    }
  }, [clickAnim._value]);

  // ایجاد افکت ذرات
  const createParticle = (x, y) => {
    if (!showEffects) return;
    
    const particleId = Date.now() + Math.random();
    const newParticle = {
      id: particleId,
      x,
      y,
      scale: new Animated.Value(0),
      opacity: new Animated.Value(1),
      translateY: new Animated.Value(0),
    };
    
    setParticles(prev => [...prev, newParticle]);
    
    // انیمیشن ذره
    Animated.parallel([
      Animated.timing(newParticle.scale, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(newParticle.opacity, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(newParticle.translateY, {
        toValue: -50,
        duration: 800,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setParticles(prev => prev.filter(p => p.id !== particleId));
    });
  };

  // تغییر حالت فشرده شدن
  const handlePressIn = () => {
    setIsPressed(true);
    Animated.spring(scaleAnim, {
      toValue: 0.95,
      friction: 3,
      useNativeDriver: true,
    }).start();
  };

  // رها کردن دکمه
  const handlePressOut = () => {
    setIsPressed(false);
    Animated.spring(scaleAnim, {
      toValue: 1,
      friction: 3,
      useNativeDriver: true,
    }).start();
  };

  // کلیک اصلی
  const handlePress = () => {
    if (isMining) return;
    
    // انیمیشن کلیک
    clickAnim.setValue(1);
    
    // ویبره
    Vibration.vibrate(50);
    
    // ایجاد ذرات
    if (showEffects) {
      for (let i = 0; i < 5; i++) {
        const x = Math.random() * 200 - 100;
        const y = Math.random() * 200 - 100;
        createParticle(x, y);
      }
    }
    
    // محاسبه کامبو
    const currentTime = Date.now();
    if (currentTime - lastClickTime < 1000) {
      setComboCount(prev => prev + 1);
      
      if ((comboCount + 1) % 10 === 0) {
        showToast('🔥 کامبو!', `کامبو x${comboCount + 1}! ادامه دهید!`, 'info');
      }
    } else {
      setComboCount(0);
    }
    setLastClickTime(currentTime);
    
    // اجرای تابع اصلی
    if (onMine) {
      onMine();
    }
  };

  // مقادیر interpolated
  const pulseScale = pulseAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 1.1],
  });

  const glowOpacity = glowAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 0.7],
  });

  const clickScale = clickAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 0.9],
  });

  return (
    <View style={styles.container}>
      {/* افکت ذرات */}
      {showEffects && particles.map(particle => (
        <Animated.View
          key={particle.id}
          style={[
            styles.particle,
            {
              left: '50%',
              top: '50%',
              marginLeft: particle.x,
              marginTop: particle.y,
              transform: [
                { scale: particle.scale },
                { translateY: particle.translateY },
              ],
              opacity: particle.opacity,
            },
          ]}
        >
          <Text style={[styles.particleText, { color: theme.colors.primary }]}>
            +{miningMultiplier || 1}
          </Text>
        </Animated.View>
      ))}
      
      {/* دکمه اصلی */}
      <TouchableOpacity
        activeOpacity={1}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        onPress={handlePress}
        disabled={isMining}
        style={styles.touchable}
      >
        <Animated.View
          style={[
            styles.buttonContainer,
            {
              transform: [
                { scale: Animated.multiply(scaleAnim, clickScale) },
              ],
            },
          ]}
        >
          {/* حلقه پالس */}
          {showEffects && (
            <Animated.View
              style={[
                styles.pulseRing,
                {
                  borderColor: theme.colors.primary,
                  transform: [{ scale: pulseScale }],
                  opacity: pulseAnim,
                },
              ]}
            />
          )}
          
          {/* درخشش */}
          {showEffects && (
            <Animated.View
              style={[
                styles.glow,
                {
                  backgroundColor: theme.colors.primary,
                  opacity: glowOpacity,
                },
              ]}
            />
          )}
          
          {/* دکمه اصلی */}
          <Animated.View
            style={[
              styles.mainButton,
              {
                backgroundColor: isPressed
                  ? theme.colors.primaryDark
                  : theme.colors.primary,
                borderColor: isPressed
                  ? theme.colors.primaryLight
                  : theme.colors.primaryLight + '80',
              },
            ]}
          >
            {/* افکت داخلی */}
            <View style={styles.innerGlow}>
              <View style={[styles.innerCircle, { backgroundColor: theme.colors.primaryLight + '20' }]} />
            </View>
            
            {/* آیکون و متن */}
            <View style={styles.buttonContent}>
              <Text style={styles.buttonIcon}>⚡</Text>
              <Text style={styles.buttonText}>
                {isMining ? 'در حال استخراج...' : 'کلیک برای استخراج'}
              </Text>
              
              {/* نمایش ضریب */}
              {miningMultiplier > 1 && (
                <View style={[styles.multiplierBadge, { backgroundColor: theme.colors.accent }]}>
                  <Text style={styles.multiplierText}>x{miningMultiplier}</Text>
                </View>
              )}
            </View>
          </Animated.View>
        </Animated.View>
      </TouchableOpacity>
      
      {/* نمایش کامبو */}
      {comboCount > 0 && (
        <Animated.View
          style={[
            styles.comboContainer,
            {
              opacity: clickAnim,
              transform: [
                { translateY: clickAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0, -20],
                })},
              ],
            },
          ]}
        >
          <Text style={[styles.comboText, { color: theme.colors.primary }]}>
            کامبو x{comboCount}!
          </Text>
        </Animated.View>
      )}
      
      {/* متن راهنما */}
      {showEffects && (
        <Text style={[styles.hintText, { color: theme.colors.secondary }]}>
          برای استخراج SOD کلیک کنید
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  touchable: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonContainer: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  pulseRing: {
    position: 'absolute',
    width: 220,
    height: 220,
    borderRadius: 110,
    borderWidth: 2,
    zIndex: 1,
  },
  glow: {
    position: 'absolute',
    width: 200,
    height: 200,
    borderRadius: 100,
    zIndex: 2,
  },
  mainButton: {
    width: 180,
    height: 180,
    borderRadius: 90,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    shadowColor: '#0066FF',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 30,
    elevation: 10,
    zIndex: 3,
    overflow: 'hidden',
  },
  innerGlow: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  innerCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
  },
  buttonContent: {
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 4,
  },
  buttonIcon: {
    fontSize: 48,
    marginBottom: 8,
  },
  buttonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
    textAlign: 'center',
    maxWidth: 120,
  },
  multiplierBadge: {
    position: 'absolute',
    top: -10,
    right: -10,
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'white',
  },
  multiplierText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  particle: {
    position: 'absolute',
    zIndex: 5,
  },
  particleText: {
    fontSize: 14,
    fontWeight: '900',
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  comboContainer: {
    position: 'absolute',
    top: -40,
    alignItems: 'center',
  },
  comboText: {
    fontSize: 16,
    fontWeight: '900',
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  hintText: {
    fontSize: 12,
    marginTop: 16,
    textAlign: 'center',
  },
});

export default MiningButton;
[file content end]
