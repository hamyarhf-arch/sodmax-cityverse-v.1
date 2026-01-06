import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Animated,
  Dimensions,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/FontAwesome5';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { BlurView } from '@react-native-community/blur';

// Context
import { useAuth } from '../../context/AuthContext';
import { useMining } from '../../context/MiningContext';
import { useWallet } from '../../context/WalletContext';
import { useToast } from '../../context/ToastContext';

// Components
import StatCard from '../../components/dashboard/StatCard';
import MiningCard from '../../components/dashboard/MiningCard';
import MissionCard from '../../components/missions/MissionCard';
import QuickAction from '../../components/dashboard/QuickAction';
import LoadingSpinner from '../../components/ui/LoadingSpinner';

// Constants
import Colors from '../../constants/Colors';
import Layout from '../../constants/Layout';

const { width } = Dimensions.get('window');

const DashboardScreen = ({ navigation }) => {
  const { user } = useAuth();
  const { miningStats, manualMine, autoMining } = useMining();
  const { wallet, refreshWallet } = useWallet();
  const toast = useToast();

  const [refreshing, setRefreshing] = useState(false);
  const [stats, setStats] = useState({
    totalEarned: 0,
    todayEarned: 0,
    referralCount: 0,
    level: 1,
  });

  const [missions, setMissions] = useState([
    {
      id: 1,
      title: '۱۰۰ کلیک در بازی',
      description: 'در بازی کلیک کنید و پاداش بگیرید',
      reward: 500,
      progress: 45,
      total: 100,
      currency: 'تومان',
      icon: 'gamepad',
    },
    {
      id: 2,
      title: 'دعوت ۵ دوست',
      description: 'دوستان خود را دعوت کنید',
      reward: 1000,
      progress: 2,
      total: 5,
      currency: 'تومان',
      icon: 'user-plus',
    },
  ]);

  const [quickActions] = useState([
    { id: 1, icon: 'wallet', label: 'کیف پول', color: Colors.primary, screen: 'Wallet' },
    { id: 2, icon: 'gift', label: 'پاداش‌ها', color: Colors.secondary, screen: 'Rewards' },
    { id: 3, icon: 'share-alt', label: 'دعوت', color: Colors.accent, screen: 'Invite' },
    { id: 4, icon: 'cog', label: 'تنظیمات', color: Colors.textTertiary, screen: 'Settings' },
  ]);

  const fadeAnim = new Animated.Value(0);
  const slideAnim = new Animated.Value(50);

  useEffect(() => {
    // Load initial data
    loadDashboardData();

    // Start animations
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const loadDashboardData = async () => {
    try {
      // In a real app, this would be an API call
      setStats({
        totalEarned: user?.totalEarned || 124500,
        todayEarned: miningStats?.todayEarned || 2450,
        referralCount: user?.referralCount || 24,
        level: user?.level || 5,
      });
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await Promise.all([
      loadDashboardData(),
      refreshWallet(),
    ]);
    setRefreshing(false);
    toast.success('به‌روزرسانی انجام شد');
  };

  const handleQuickAction = (screen) => {
    navigation.navigate(screen);
  };

  const handleMissionPress = (mission) => {
    toast.info(mission.title, `${mission.progress}/${mission.total} تکمیل شده`);
  };

  const handleMiningPress = () => {
    navigation.navigate('Mining');
  };

  const handleNotificationPress = () => {
    toast.info('اعلان‌ها', 'صفحه اعلان‌ها به زودی اضافه می‌شود');
  };

  const handleProfilePress = () => {
    navigation.navigate('Profile');
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <LinearGradient
        colors={[Colors.bgSurface, Colors.bgPrimary]}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <TouchableOpacity onPress={handleProfilePress} style={styles.profileButton}>
            <LinearGradient
              colors={Colors.gradientPrimary}
              style={styles.avatar}
            >
              <Text style={styles.avatarText}>
                {user?.name?.charAt(0) || 'ع'}
              </Text>
            </LinearGradient>
            <View style={styles.userInfo}>
              <Text style={styles.userName}>{user?.name || 'کاربر مهمان'}</Text>
              <View style={styles.userLevel}>
                <View style={styles.levelDot} />
                <Text style={styles.levelText}>سطح {stats.level}</Text>
              </View>
            </View>
          </TouchableOpacity>

          <TouchableOpacity onPress={handleNotificationPress} style={styles.notificationButton}>
            <Ionicons name="notifications-outline" size={24} color={Colors.textPrimary} />
            <View style={styles.notificationBadge}>
              <Text style={styles.badgeText}>3</Text>
            </View>
          </TouchableOpacity>
        </View>
      </LinearGradient>

      {/* Content */}
      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={Colors.primary}
            colors={[Colors.primary]}
          />
        }
      >
        <Animated.View
          style={[
            styles.animatedContent,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          {/* Welcome Banner */}
          <BlurView
            style={styles.welcomeBanner}
            blurType="dark"
            blurAmount={10}
          >
            <LinearGradient
              colors={Colors.gradientGlass}
              style={styles.welcomeContent}
            >
              <View style={styles.welcomeTextContainer}>
                <Text style={styles.welcomeTitle}>👋 خوش آمدید!</Text>
                <Text style={styles.welcomeSubtitle}>
                  امروز هم می‌توانید درآمد کسب کنید
                </Text>
              </View>
              <View style={styles.welcomeStats}>
                <Text style={styles.welcomeStat}>+{stats.todayEarned.toLocaleString('fa-IR')}</Text>
                <Text style={styles.welcomeStatLabel}>درآمد امروز</Text>
              </View>
            </LinearGradient>
          </BlurView>

          {/* Quick Stats */}
          <View style={styles.statsGrid}>
            <StatCard
              title="درآمد کل"
              value={stats.totalEarned.toLocaleString('fa-IR')}
              currency="تومان"
              icon="money-bill-wave"
              color={Colors.primary}
              onPress={() => handleQuickAction('Wallet')}
            />
            <StatCard
              title="SOD"
              value={wallet?.SOD?.toLocaleString('fa-IR') || '۰'}
              icon="coins"
              color={Colors.secondary}
              onPress={() => handleQuickAction('Wallet')}
            />
            <StatCard
              title="زیرمجموعه"
              value={stats.referralCount.toString()}
              icon="users"
              color={Colors.accent}
              onPress={() => handleQuickAction('Invite')}
            />
          </View>

          {/* Mining Center */}
          <MiningCard
            onPress={handleMiningPress}
            miningStats={miningStats}
            onManualMine={manualMine}
            autoMining={autoMining}
          />

          {/* Quick Actions */}
          <View style={styles.quickActionsContainer}>
            <Text style={styles.sectionTitle}>دسترسی سریع</Text>
            <View style={styles.quickActionsGrid}>
              {quickActions.map((action) => (
                <QuickAction
                  key={action.id}
                  icon={action.icon}
                  label={action.label}
                  color={action.color}
                  onPress={() => handleQuickAction(action.screen)}
                />
              ))}
            </View>
          </View>

          {/* Active Missions */}
          <View style={styles.missionsContainer}>
            <View style={styles.missionsHeader}>
              <Text style={styles.sectionTitle}>مأموریت‌های فعال</Text>
              <TouchableOpacity onPress={() => navigation.navigate('Missions')}>
                <Text style={styles.seeAllText}>مشاهده همه</Text>
              </TouchableOpacity>
            </View>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.missionsScroll}
            >
              {missions.map((mission) => (
                <MissionCard
                  key={mission.id}
                  mission={mission}
                  onPress={() => handleMissionPress(mission)}
                  style={styles.missionCard}
                />
              ))}
            </ScrollView>
          </View>

          {/* Daily Bonus */}
          <TouchableOpacity
            style={styles.dailyBonusCard}
            onPress={() => toast.success('🎁 پاداش روزانه دریافت شد!', '+۵۰۰ تومان')}
          >
            <LinearGradient
              colors={Colors.gradientSecondary}
              style={styles.dailyBonusContent}
            >
              <View style={styles.bonusIcon}>
                <Icon name="gift" size={24} color={Colors.white} />
              </View>
              <View style={styles.bonusInfo}>
                <Text style={styles.bonusTitle}>پاداش روزانه آماده است!</Text>
                <Text style={styles.bonusSubtitle}>هر روز وارد شوید و پاداش دریافت کنید</Text>
              </View>
              <View style={styles.bonusAction}>
                <Text style={styles.bonusButtonText}>دریافت</Text>
              </View>
            </LinearGradient>
          </TouchableOpacity>

          {/* Recent Activity */}
          <View style={styles.activityContainer}>
            <Text style={styles.sectionTitle}>فعالیت اخیر</Text>
            <View style={styles.activityList}>
              {[
                { id: 1, title: 'استخراج دستی', amount: '+۱۸۰ SOD', time: '۵ دقیقه پیش', icon: 'hard-hat' },
                { id: 2, title: 'پاداش دعوت', amount: '+۱,۰۰۰ تومان', time: '۲ ساعت پیش', icon: 'user-plus' },
                { id: 3, title: 'کلیک در بازی', amount: '+۵۰۰ تومان', time: '۱ روز پیش', icon: 'gamepad' },
              ].map((activity) => (
                <TouchableOpacity key={activity.id} style={styles.activityItem}>
                  <View style={styles.activityIcon}>
                    <Icon name={activity.icon} size={16} color={Colors.primary} />
                  </View>
                  <View style={styles.activityDetails}>
                    <Text style={styles.activityTitle}>{activity.title}</Text>
                    <Text style={styles.activityTime}>{activity.time}</Text>
                  </View>
                  <Text style={styles.activityAmount}>{activity.amount}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </Animated.View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.bgPrimary,
  },
  header: {
    paddingTop: Layout.statusBarHeight + Layout.spacing.sm,
    paddingBottom: Layout.spacing.lg,
    paddingHorizontal: Layout.spacing.lg,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  profileButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Layout.spacing.md,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: Layout.borderRadius.lg,
    justifyContent: 'center',
    alignItems: 'center',
    ...Layout.shadow.sm,
  },
  avatarText: {
    fontSize: Layout.fontSize.xl,
    fontWeight: '900',
    color: Colors.white,
  },
  userInfo: {
    justifyContent: 'center',
  },
  userName: {
    fontSize: Layout.fontSize.md,
    fontWeight: '900',
    color: Colors.textPrimary,
    marginBottom: 2,
  },
  userLevel: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Layout.spacing.xs,
  },
  levelDot: {
    width: 8,
    height: 8,
    borderRadius: Layout.borderRadius.round,
    backgroundColor: Colors.secondary,
  },
  levelText: {
    fontSize: Layout.fontSize.xxs,
    color: Colors.textTertiary,
  },
  notificationButton: {
    position: 'relative',
    padding: Layout.spacing.sm,
  },
  notificationBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: Colors.accent,
    width: 18,
    height: 18,
    borderRadius: Layout.borderRadius.round,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: Colors.bgSurface,
  },
  badgeText: {
    fontSize: Layout.fontSize.xxxs,
    color: Colors.white,
    fontWeight: '900',
  },
  content: {
    flex: 1,
  },
  animatedContent: {
    padding: Layout.spacing.lg,
    paddingTop: 0,
  },
  welcomeBanner: {
    borderRadius: Layout.borderRadius.xl,
    overflow: 'hidden',
    marginBottom: Layout.spacing.lg,
    ...Layout.shadow.md,
  },
  welcomeContent: {
    padding: Layout.spacing.lg,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  welcomeTextContainer: {
    flex: 1,
  },
  welcomeTitle: {
    fontSize: Layout.fontSize.lg,
    fontWeight: '900',
    color: Colors.textPrimary,
    marginBottom: Layout.spacing.xs,
  },
  welcomeSubtitle: {
    fontSize: Layout.fontSize.xs,
    color: Colors.textTertiary,
  },
  welcomeStats: {
    alignItems: 'center',
  },
  welcomeStat: {
    fontSize: Layout.fontSize.xxl,
    fontWeight: '900',
    color: Colors.secondary,
  },
  welcomeStatLabel: {
    fontSize: Layout.fontSize.xxs,
    color: Colors.textTertiary,
    marginTop: 2,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Layout.spacing.md,
    marginBottom: Layout.spacing.lg,
  },
  quickActionsContainer: {
    marginBottom: Layout.spacing.xl,
  },
  sectionTitle: {
    fontSize: Layout.fontSize.md,
    fontWeight: '900',
    color: Colors.textPrimary,
    marginBottom: Layout.spacing.md,
  },
  quickActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Layout.spacing.md,
  },
  missionsContainer: {
    marginBottom: Layout.spacing.xl,
  },
  missionsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Layout.spacing.md,
  },
  seeAllText: {
    fontSize: Layout.fontSize.xxs,
    color: Colors.primary,
    fontWeight: '700',
  },
  missionsScroll: {
    marginHorizontal: -Layout.spacing.lg,
    paddingHorizontal: Layout.spacing.lg,
  },
  missionCard: {
    marginRight: Layout.spacing.md,
    width: width * 0.7,
  },
  dailyBonusCard: {
    borderRadius: Layout.borderRadius.xl,
    overflow: 'hidden',
    marginBottom: Layout.spacing.xl,
    ...Layout.shadow.md,
  },
  dailyBonusContent: {
    padding: Layout.spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Layout.spacing.lg,
  },
  bonusIcon: {
    width: 48,
    height: 48,
    borderRadius: Layout.borderRadius.lg,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  bonusInfo: {
    flex: 1,
  },
  bonusTitle: {
    fontSize: Layout.fontSize.md,
    fontWeight: '900',
    color: Colors.white,
    marginBottom: 2,
  },
  bonusSubtitle: {
    fontSize: Layout.fontSize.xxs,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  bonusAction: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: Layout.spacing.lg,
    paddingVertical: Layout.spacing.sm,
    borderRadius: Layout.borderRadius.lg,
  },
  bonusButtonText: {
    fontSize: Layout.fontSize.sm,
    fontWeight: '900',
    color: Colors.white,
  },
  activityContainer: {
    marginBottom: Layout.spacing.xl,
  },
  activityList: {
    backgroundColor: Colors.bgSurface,
    borderRadius: Layout.borderRadius.lg,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Layout.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Layout.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Layout.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  activityIcon: {
    width: 36,
    height: 36,
    borderRadius: Layout.borderRadius.md,
    backgroundColor: 'rgba(0, 102, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Layout.spacing.md,
  },
  activityDetails: {
    flex: 1,
  },
  activityTitle: {
    fontSize: Layout.fontSize.sm,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: 2,
  },
  activityTime: {
    fontSize: Layout.fontSize.xxs,
    color: Colors.textTertiary,
  },
  activityAmount: {
    fontSize: Layout.fontSize.sm,
    fontWeight: '900',
    color: Colors.secondary,
  },
});

export default DashboardScreen;
