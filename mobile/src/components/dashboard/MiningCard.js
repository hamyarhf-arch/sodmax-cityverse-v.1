// mobile/src/components/dashboard/MiningCard.js
import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Easing,
  Dimensions,
} from 'react-native';
import { useMining } from '../../context/MiningContext';
import { useTheme } from '../../context/ThemeContext';

const { width } = Dimensions.get('window');

const MiningCard = ({
  onMinePress,
  onUpgradePress,
  onBoostPress,
  onStatsPress,
  compact = false,
  ...props
}) => {
  const { miningData, getMiningPower, getBoostTimeRemaining, formatBoostTime } = useMining();
  const theme = useTheme();
  
  const [rotation] = useState(new Animated.Value(0));
  const [scale] = useState(new Animated.Value(1));
  const [pulse] = useState(new Animated.Value(1));
  const [glow] = useState(new Animated.Value(0));
  const [isMining, setIsMining] = useState(false);

  // انیمیشن چرخش مداوم
  useEffect(() => {
    const rotationAnimation = Animated.loop(
      Animated.timing(rotation, {
        toValue: 1,
        duration: 20000,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    );
    
    const pulseAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, {
          toValue: 1.05,
          duration: 2000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(pulse, {
          toValue: 1,
          duration: 2000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    );
    
    rotationAnimation.start();
    pulseAnimation.start();

    return () => {
      rotationAnimation.stop();
      pulseAnimation.stop();
    };
  }, []);

  // انیمیشن درخشش
  const startGlowAnimation = () => {
    Animated.sequence([
      Animated.timing(glow, {
        toValue: 1,
        duration: 300,
        easing: Easing.out(Easing.exp),
        useNativeDriver: false,
      }),
      Animated.timing(glow, {
        toValue: 0,
        duration: 700,
        easing: Easing.out(Easing.exp),
        useNativeDriver: false,
      }),
    ]).start();
  };

  const handleMinePress = () => {
    // انیمیشن کلیک
    Animated.sequence([
      Animated.timing(scale, {
        toValue: 0.95,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(scale, {
        toValue: 1,
        duration: 200,
        easing: Easing.elastic(1),
        useNativeDriver: true,
      }),
    ]).start();

    setIsMining(true);
    startGlowAnimation();
    
    if (onMinePress) {
      onMinePress();
    }
    
    // ریست حالت استخراج
    setTimeout(() => setIsMining(false), 500);
  };

  const rotationInterpolate = rotation.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const glowInterpolate = glow.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 1],
  });

  const miningPower = getMiningPower();
  const boostTimeRemaining = getBoostTimeRemaining();
  const hasBoost = miningData.miningMultiplier > 1;

  if (compact) {
    return (
      <TouchableOpacity
        style={[styles.compactCard, props.style]}
        onPress={handleMinePress}
        activeOpacity={0.8}
      >
        <View style={styles.compactContent}>
          <Animated.View
            style={[
              styles.compactIcon,
              {
                transform: [
                  { scale: pulse },
                  { rotate: rotationInterpolate },
                ],
              },
            ]}
          >
            <Text style={[styles.compactIconText, { color: theme.colors.primary }]}>
              ⚡
            </Text>
          </Animated.View>
          
          <View style={styles.compactInfo}>
            <Text style={[styles.compactTitle, { color: theme.colors.text }]}>
              استخراج SOD
            </Text>
            <Text style={[styles.compactPower, { color: theme.colors.primary }]}>
              +{miningPower} SOD
            </Text>
            {hasBoost && (
              <View style={[styles.boostBadge, { backgroundColor: theme.colors.accent }]}>
                <Text style={styles.boostBadgeText}>
                  {miningData.miningMultiplier}x
                </Text>
              </View>
            )}
          </View>
        </View>
      </TouchableOpacity>
    );
  }

  return (
    <View style={[styles.card, props.style]}>
      {/* هدر */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={[styles.title, { color: theme.colors.text }]}>
            مرکز استخراج SOD
          </Text>
          <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>
            برای استخراج کلیک کنید
          </Text>
        </View>
        
        <View style={styles.headerRight}>
          {hasBoost && (
            <View style={[styles.boostTimer, { backgroundColor: theme.colors.accent }]}>
              <Text style={styles.boostTimerText}>
                {formatBoostTime(boostTimeRemaining)}
              </Text>
            </View>
          )}
        </View>
      </View>

      {/* دایره استخراج */}
      <TouchableOpacity
        style={styles.miningCircleContainer}
        onPress={handleMinePress}
        activeOpacity={0.7}
      >
        <Animated.View
          style={[
            styles.miningGlow,
            {
              opacity: glowInterpolate,
              backgroundColor: theme.colors.primary,
            },
          ]}
        />
        
        <Animated.View
          style={[
            styles.miningCircle,
            {
              borderColor: theme.colors.primary,
              transform: [
                { scale },
                { rotate: rotationInterpolate },
              ],
            },
          ]}
        >
          <Animated.View
            style={[
              styles.miningCore,
              {
                transform: [{ scale: pulse }],
              },
            ]}
          >
            <Text style={[styles.miningIcon, { color: theme.colors.primary }]}>
              ⚡
            </Text>
            <Text style={[styles.miningReward, { color: theme.colors.text }]}>
              +{miningPower} SOD
            </Text>
            {isMining && (
              <Animated.Text
                style={[
                  styles.miningClick,
                  {
                    color: theme.colors.primary,
                    opacity: glowInterpolate,
                  },
                ]}
              >
                کلیک!
              </Animated.Text>
            )}
          </Animated.View>
        </Animated.View>
      </TouchableOpacity>

      {/* دکمه‌های کنترل */}
      <View style={styles.controls}>
        <TouchableOpacity
          style={[
            styles.controlButton,
            { backgroundColor: theme.colors.surface },
          ]}
          onPress={onUpgradePress}
          activeOpacity={0.7}
        >
          <Text style={[styles.controlIcon, { color: theme.colors.primary }]}>
            ⬆️
          </Text>
          <Text style={[styles.controlText, { color: theme.colors.text }]}>
            ارتقاء
          </Text>
          <Text style={[styles.controlSubtext, { color: theme.colors.textSecondary }]}>
            سطح {miningData.minerLevel}
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[
            styles.controlButton,
            { backgroundColor: theme.colors.surface },
          ]}
          onPress={onBoostPress}
          activeOpacity={0.7}
        >
          <Text style={[
            styles.controlIcon,
            { color: hasBoost ? theme.colors.accent : theme.colors.primary }
          ]}>
            ⚡
          </Text>
          <Text style={[
            styles.controlText,
            { color: theme.colors.text }
          ]}>
            افزایش قدرت
          </Text>
          <Text style={[
            styles.controlSubtext,
            { color: theme.colors.textSecondary }
          ]}>
            {hasBoost ? `${miningData.miningMultiplier}x` : 'فعال کنید'}
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[
            styles.controlButton,
            { backgroundColor: theme.colors.surface },
          ]}
          onPress={onStatsPress}
          activeOpacity={0.7}
        >
          <Text style={[styles.controlIcon, { color: theme.colors.primary }]}>
            📊
          </Text>
          <Text style={[styles.controlText, { color: theme.colors.text }]}>
            آمار
          </Text>
          <Text style={[styles.controlSubtext, { color: theme.colors.textSecondary }]}>
            جزئیات
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[
            styles.controlButton,
            { 
              backgroundColor: miningData.autoMining ? 
                theme.colors.success + '20' : theme.colors.surface 
            },
          ]}
          onPress={() => {}}
          activeOpacity={0.7}
        >
          <Text style={[
            styles.controlIcon,
            { color: miningData.autoMining ? theme.colors.success : theme.colors.primary }
          ]}>
            🤖
          </Text>
          <Text style={[styles.controlText, { color: theme.colors.text }]}>
            خودکار
          </Text>
          <Text style={[
            styles.controlSubtext,
            { color: miningData.autoMining ? theme.colors.success : theme.colors.textSecondary }
          ]}>
            {miningData.autoMining ? 'فعال' : 'غیرفعال'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* آمار سریع */}
      <View style={styles.stats}>
        <View style={styles.statItem}>
          <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>
            امروز
          </Text>
          <Text style={[styles.statValue, { color: theme.colors.text }]}>
            {miningData.todayMined?.toLocaleString('fa-IR') || 0} SOD
          </Text>
        </View>
        
        <View style={styles.statItem}>
          <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>
            قدرت
          </Text>
          <Text style={[styles.statValue, { color: theme.colors.primary }]}>
            {miningPower}x
          </Text>
        </View>
        
        <View style={styles.statItem}>
          <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>
            کل
          </Text>
          <Text style={[styles.statValue, { color: theme.colors.success }]}>
            {miningData.totalMined?.toLocaleString('fa-IR') || 0} SOD
          </Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 24,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 24,
  },
  headerLeft: {
    flex: 1,
  },
  title: {
    fontSize: 20,
    fontWeight: '900',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 12,
  },
  headerRight: {
    marginLeft: 12,
  },
  boostTimer: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  boostTimerText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '700',
    fontFamily: 'monospace',
  },
  miningCircleContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
    position: 'relative',
  },
  miningGlow: {
    position: 'absolute',
    width: 180,
    height: 180,
    borderRadius: 90,
    opacity: 0.3,
    filter: 'blur(20px)',
  },
  miningCircle: {
    width: 160,
    height: 160,
    borderRadius: 80,
    borderWidth: 3,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0, 102, 255, 0.1)',
  },
  miningCore: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  miningIcon: {
    fontSize: 48,
    marginBottom: 12,
  },
  miningReward: {
    fontSize: 20,
    fontWeight: '900',
    marginBottom: 4,
  },
  miningClick: {
    fontSize: 14,
    fontWeight: '700',
  },
  controls: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
    gap: 12,
  },
  controlButton: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 12,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  controlIcon: {
    fontSize: 20,
    marginBottom: 8,
  },
  controlText: {
    fontSize: 12,
    fontWeight: '700',
    marginBottom: 2,
  },
  controlSubtext: {
    fontSize: 10,
  },
  stats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statLabel: {
    fontSize: 10,
    marginBottom: 4,
  },
  statValue: {
    fontSize: 14,
    fontWeight: '900',
  },
  compactCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  compactContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  compactIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0, 102, 255, 0.1)',
    marginLeft: 12,
  },
  compactIconText: {
    fontSize: 24,
  },
  compactInfo: {
    flex: 1,
  },
  compactTitle: {
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 4,
  },
  compactPower: {
    fontSize: 18,
    fontWeight: '900',
  },
  boostBadge: {
    position: 'absolute',
    top: 0,
    left: 0,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  boostBadgeText: {
    color: 'white',
    fontSize: 10,
    fontWeight: '900',
  },
});

export default MiningCard;
