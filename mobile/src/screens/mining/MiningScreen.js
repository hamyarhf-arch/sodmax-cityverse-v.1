import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Animated,
  Easing,
  Dimensions,
  Vibration,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/FontAwesome5';
import LottieView from 'lottie-react-native';
import { BlurView } from '@react-native-community/blur';

// Context
import { useMining } from '../../context/MiningContext';
import { useToast } from '../../context/ToastContext';

// Components
import StatCard from '../../components/dashboard/StatCard';
import MiningButton from '../../components/mining/MiningButton';
import UpgradeCard from '../../components/mining/UpgradeCard';

// Constants
import Colors from '../../constants/Colors';
import Layout from '../../constants/Layout';

const { width, height } = Dimensions.get('window');

const MiningScreen = () => {
  const {
    miningStats,
    manualMine,
    toggleAutoMining,
    boostMining,
    upgradeMiner,
    autoMining,
    boostActive,
  } = useMining();
  
  const toast = useToast();

  // Animation refs
  const spinAnim = useRef(new Animated.Value(0)).current;
  const floatAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const glowAnim = useRef(new Animated.Value(0)).current;

  // State
  const [miningHistory, setMiningHistory] = useState([
    { day: 'امروز', amount: 2450 },
    { day: 'دیروز', amount: 3210 },
    { day: 'هفته', amount: 15840 },
  ]);

  const [upgrades, setUpgrades] = useState([
    { id: 1, name: 'پردازشگر', level: 3, cost: 50000, bonus: '+۵ قدرت' },
    { id: 2, name: 'خنک‌کننده', level: 2, cost: 30000, bonus: '-۲۰٪ مصرف' },
    { id: 3, name: 'منبع تغذیه', level: 1, cost: 75000, bonus: '+۳۰٪ سرعت' },
  ]);

  // Start animations
  useEffect(() => {
    // Continuous rotation
    Animated.loop(
      Animated.timing(spinAnim, {
        toValue: 1,
        duration: 20000,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    ).start();

    // Floating animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(floatAnim, {
          toValue: 1,
          duration: 3000,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(floatAnim, {
          toValue: 0,
          duration: 3000,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ])
    ).start();

    // Pulse animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.1,
          duration: 1500,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1500,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ])
    ).start();

    // Glow animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(glowAnim, {
          toValue: 1,
          duration: 2000,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(glowAnim, {
          toValue: 0,
          duration: 2000,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  const handleManualMine = async () => {
    try {
      const earned = await manualMine();
      
      // Vibration feedback
      Vibration.vibrate([50, 30, 50]);
      
      // Show floating reward
      showFloatingReward(earned);
      
    } catch (error) {
      toast.error('خطا در استخراج', error.message);
    }
  };

  const showFloatingReward = (amount) => {
    // Create floating reward animation
    const floatingTextAnim = new Animated.Value(0);
    
    Animated.sequence([
      Animated.timing(floatingTextAnim, {
        toValue: 1,
        duration: 1000,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.delay(500),
      Animated.timing(floatingTextAnim, {
        toValue: 0,
        duration: 500,
        easing: Easing.in(Easing.cubic),
        useNativeDriver: true,
      }),
    ]).start();
  };

  const handleUpgrade = async (upgradeId) => {
    const upgrade = upgrades.find(u => u.id === upgradeId);
    if (!upgrade) return;

    try {
      const success = await upgradeMiner();
      if (success) {
        toast.success('ارتقاء موفق', `سطح ${upgrade.name} افزایش یافت!`);
        
        // Update local state
        setUpgrades(prev => 
          prev.map(u => 
            u.id === upgradeId 
              ? { ...u, level: u.level + 1, cost: Math.floor(u.cost * 1.5) }
              : u
          )
        );
      }
    } catch (error) {
      toast.error('خطا در ارتقاء', error.message);
    }
  };

  const spin = spinAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const translateY = floatAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -20],
  });

  const glowOpacity = glowAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 0.6],
  });

  const scale = pulseAnim;

  return (
    <ScrollView 
      style={styles.container}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={styles.contentContainer}
    >
      {/* Header */}
      <LinearGradient
        colors={[Colors.bgSurface, 'transparent']}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <View>
            <Text style={styles.headerTitle}>⚡ مرکز استخراج</Text>
            <Text style={styles.headerSubtitle}>
              قدرت فعلی: {miningStats.power}x
              {boostActive && ' ⚡ بوست فعال!'}
            </Text>
          </View>
          <View style={styles.headerStats}>
            <Text style={styles.headerStat}>
              {miningStats.todayEarned?.toLocaleString('fa-IR') || '۰'}
            </Text>
            <Text style={styles.headerStatLabel}>امروز</Text>
          </View>
        </View>
      </LinearGradient>

      {/* Mining Core */}
      <View style={styles.miningCoreContainer}>
        <BlurView
          style={styles.minerBackground}
          blurType="dark"
          blurAmount={20}
        >
          <Animated.View
            style={[
              styles.minerCircle,
              {
                transform: [
                  { rotate: spin },
                  { translateY },
                  { scale },
                ],
              },
            ]}
          >
            <LinearGradient
              colors={['rgba(0, 102, 255, 0.15)', 'rgba(30, 41, 59, 0.9)', 'rgba(0, 102, 255, 0.05)']}
              style={StyleSheet.absoluteFillObject}
            />
            
            <Animated.View
              style={[
                styles.glowEffect,
                {
                  opacity: glowOpacity,
                },
              ]}
            />

            <TouchableOpacity
              style={styles.minerTouchArea}
              activeOpacity={0.8}
              onPress={handleManualMine}
            >
              <View style={styles.coreContent}>
                <Animated.Text
                  style={[
                    styles.coreIcon,
                    {
                      transform: [{ rotate: spin }],
                    },
                  ]}
                >
                  ⚡
                </Animated.Text>
                <Text style={styles.clickReward}>
                  +{miningStats.rewardPerClick} SOD
                </Text>
                <Text style={styles.clickHint}>
                  برای استخراج ضربه بزنید
                </Text>
              </View>
            </TouchableOpacity>
          </Animated.View>
        </BlurView>

        {/* Mining Stats */}
        <View style={styles.miningStats}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>
              {miningStats.totalMined?.toLocaleString('fa-IR') || '۰'}
            </Text>
            <Text style={styles.statLabel}>کل استخراج</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{miningStats.level || '۱'}</Text>
            <Text style={styles.statLabel}>سطح</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{miningStats.power || '۵'}x</Text>
            <Text style={styles.statLabel}>قدرت</Text>
          </View>
        </View>
      </View>

      {/* Mining Controls */}
      <View style={styles.controlsContainer}>
        <Text style={styles.sectionTitle}>کنترل استخراج</Text>
        <View style={styles.controlsGrid}>
          <MiningButton
            icon="robot"
            label="خودکار"
            active={autoMining}
            onPress={toggleAutoMining}
            color={Colors.primary}
            style={styles.controlButton}
          />
          <MiningButton
            icon="bolt"
            label="افزایش قدرت"
            active={boostActive}
            onPress={boostMining}
            color={Colors.accent}
            style={styles.controlButton}
          />
          <MiningButton
            icon="arrow-up"
            label="ارتقاء"
            onPress={() => handleUpgrade(1)}
            color={Colors.secondary}
            style={styles.controlButton}
          />
          <MiningButton
            icon="chart-bar"
            label="آمار"
            onPress={() => toast.info('آمار دقیق', 'صفحه آمار به زودی اضافه می‌شود')}
            color={Colors.textTertiary}
            style={styles.controlButton}
          />
        </View>
      </View>

      {/* Mining History */}
      <View style={styles.historyContainer}>
        <Text style={styles.sectionTitle}>تاریخچه استخراج</Text>
        <BlurView
          style={styles.historyCard}
          blurType="dark"
          blurAmount={10}
        >
          {miningHistory.map((item, index) => (
            <View key={index} style={styles.historyItem}>
              <Text style={styles.historyDay}>{item.day}</Text>
              <View style={styles.historyBarContainer}>
                <View style={styles.historyBarBackground}>
                  <LinearGradient
                    colors={Colors.gradientPrimary}
                    style={[
                      styles.historyBar,
                      { width: `${Math.min(100, (item.amount / 5000) * 100)}%` },
                    ]}
                  />
                </View>
              </View>
              <Text style={styles.historyAmount}>
                +{item.amount.toLocaleString('fa-IR')} SOD
              </Text>
            </View>
          ))}
        </BlurView>
      </View>

      {/* Upgrades */}
      <View style={styles.upgradesContainer}>
        <View style={styles.upgradesHeader}>
          <Text style={styles.sectionTitle}>ارتقاء تجهیزات</Text>
          <TouchableOpacity>
            <Text style={styles.seeAllText}>مشاهده همه</Text>
          </TouchableOpacity>
        </View>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.upgradesScroll}
          contentContainerStyle={styles.upgradesContent}
        >
          {upgrades.map((upgrade) => (
            <UpgradeCard
              key={upgrade.id}
              upgrade={upgrade}
              onUpgrade={() => handleUpgrade(upgrade.id)}
              style={styles.upgradeCard}
            />
          ))}
        </ScrollView>
      </View>

      {/* Boost Status */}
      {boostActive && (
        <LinearGradient
          colors={['rgba(255, 107, 53, 0.2)', 'rgba(255, 107, 53, 0.05)']}
          style={styles.boostBanner}
        >
          <View style={styles.boostContent}>
            <Icon name="bolt" size={20} color={Colors.accent} />
            <View style={styles.boostTextContainer}>
              <Text style={styles.boostTitle}>⚡ افزایش قدرت فعال!</Text>
              <Text style={styles.boostSubtitle}>
                استخراج شما ۳ برابر شده است
              </Text>
            </View>
            <View style={styles.boostTimer}>
              <LottieView
                source={require('../../assets/animations/timer.json')}
                autoPlay
                loop
                style={styles.boostTimerIcon}
              />
              <Text style={styles.boostTimerText}>۳۰s</Text>
            </View>
          </View>
        </LinearGradient>
      )}

      {/* Tips */}
      <BlurView
        style={styles.tipsContainer}
        blurType="dark"
        blurAmount={10}
      >
        <View style={styles.tipsContent}>
          <Icon name="lightbulb" size={16} color={Colors.premium} />
          <Text style={styles.tipsText}>
            💡 نکته: استخراج خودکار را فعال کنید تا حتی زمانی که اپ باز نیست هم درآمد کسب کنید!
          </Text>
        </View>
      </BlurView>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.bgPrimary,
  },
  contentContainer: {
    paddingBottom: Layout.spacing.xxl,
  },
  header: {
    paddingTop: Layout.spacing.xl,
    paddingHorizontal: Layout.spacing.lg,
    paddingBottom: Layout.spacing.xl,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: Layout.fontSize.xl,
    fontWeight: '900',
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: Layout.fontSize.xs,
    color: Colors.textTertiary,
  },
  headerStats: {
    alignItems: 'flex-end',
  },
  headerStat: {
    fontSize: Layout.fontSize.xxl,
    fontWeight: '900',
    color: Colors.primary,
  },
  headerStatLabel: {
    fontSize: Layout.fontSize.xxs,
    color: Colors.textTertiary,
    marginTop: 2,
  },
  miningCoreContainer: {
    alignItems: 'center',
    marginVertical: Layout.spacing.xl,
  },
  minerBackground: {
    width: width * 0.7,
    height: width * 0.7,
    borderRadius: width * 0.35,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    marginBottom: Layout.spacing.xl,
    borderWidth: 3,
    borderColor: 'rgba(0, 102, 255, 0.3)',
    ...Layout.shadow.lg,
  },
  minerCircle: {
    width: '90%',
    height: '90%',
    borderRadius: width * 0.315,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  glowEffect: {
    position: 'absolute',
    width: '120%',
    height: '120%',
    borderRadius: width * 0.35,
    backgroundColor: Colors.primary,
  },
  minerTouchArea: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  coreContent: {
    alignItems: 'center',
    zIndex: 1,
  },
  coreIcon: {
    fontSize: 48,
    marginBottom: Layout.spacing.md,
  },
  clickReward: {
    fontSize: Layout.fontSize.xl,
    fontWeight: '900',
    color: Colors.textPrimary,
    textShadowColor: 'rgba(0, 102, 255, 0.8)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 10,
    marginBottom: Layout.spacing.xs,
  },
  clickHint: {
    fontSize: Layout.fontSize.xxs,
    color: Colors.textTertiary,
  },
  miningStats: {
    flexDirection: 'row',
    backgroundColor: Colors.bgSurface,
    borderRadius: Layout.borderRadius.lg,
    padding: Layout.spacing.lg,
    width: width * 0.9,
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statValue: {
    fontSize: Layout.fontSize.lg,
    fontWeight: '900',
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: Layout.fontSize.xxs,
    color: Colors.textTertiary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  statDivider: {
    width: 1,
    height: '60%',
    backgroundColor: Colors.borderLight,
    alignSelf: 'center',
  },
  controlsContainer: {
    paddingHorizontal: Layout.spacing.lg,
    marginBottom: Layout.spacing.xl,
  },
  sectionTitle: {
    fontSize: Layout.fontSize.md,
    fontWeight: '900',
    color: Colors.textPrimary,
    marginBottom: Layout.spacing.md,
  },
  controlsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Layout.spacing.md,
  },
  controlButton: {
    flex: 1,
    minWidth: width * 0.4,
  },
  historyContainer: {
    paddingHorizontal: Layout.spacing.lg,
    marginBottom: Layout.spacing.xl,
  },
  historyCard: {
    borderRadius: Layout.borderRadius.lg,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  historyItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Layout.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  historyItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Layout.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  historyItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Layout.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  historyDay: {
    width: 60,
    fontSize: Layout.fontSize.xs,
    color: Colors.textSecondary,
  },
  historyBarContainer: {
    flex: 1,
    marginHorizontal: Layout.spacing.md,
  },
  historyBarBackground: {
    height: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: Layout.borderRadius.round,
    overflow: 'hidden',
  },
  historyBar: {
    height: '100%',
    borderRadius: Layout.borderRadius.round,
  },
  historyAmount: {
    fontSize: Layout.fontSize.xs,
    fontWeight: '700',
    color: Colors.primary,
    minWidth: 80,
    textAlign: 'left',
  },
  upgradesContainer: {
    marginBottom: Layout.spacing.xl,
  },
  upgradesHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Layout.spacing.lg,
    marginBottom: Layout.spacing.md,
  },
  seeAllText: {
    fontSize: Layout.fontSize.xxs,
    color: Colors.primary,
    fontWeight: '700',
  },
  upgradesScroll: {
    marginHorizontal: -Layout.spacing.lg,
    paddingHorizontal: Layout.spacing.lg,
  },
  upgradesContent: {
    gap: Layout.spacing.md,
  },
  upgradeCard: {
    width: width * 0.6,
    marginRight: Layout.spacing.md,
  },
  boostBanner: {
    marginHorizontal: Layout.spacing.lg,
    marginBottom: Layout.spacing.xl,
    borderRadius: Layout.borderRadius.lg,
    borderWidth: 1,
    borderColor: 'rgba(255, 107, 53, 0.3)',
    overflow: 'hidden',
  },
  boostContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Layout.spacing.lg,
    gap: Layout.spacing.md,
  },
  boostTextContainer: {
    flex: 1,
  },
  boostTitle: {
    fontSize: Layout.fontSize.sm,
    fontWeight: '900',
    color: Colors.accent,
    marginBottom: 2,
  },
  boostSubtitle: {
    fontSize: Layout.fontSize.xxs,
    color: Colors.textTertiary,
  },
  boostTimer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Layout.spacing.xs,
  },
  boostTimerIcon: {
    width: 24,
    height: 24,
  },
  boostTimerText: {
    fontSize: Layout.fontSize.xs,
    fontWeight: '900',
    color: Colors.accent,
  },
  tipsContainer: {
    marginHorizontal: Layout.spacing.lg,
    borderRadius: Layout.borderRadius.lg,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  tipsContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Layout.spacing.md,
    gap: Layout.spacing.md,
  },
  tipsText: {
    flex: 1,
    fontSize: Layout.fontSize.xxs,
    color: Colors.textSecondary,
    lineHeight: 16,
  },
});

export default MiningScreen;
