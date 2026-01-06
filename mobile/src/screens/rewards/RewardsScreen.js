// mobile/src/screens/rewards/RewardsScreen.js
import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  Dimensions,
  Animated,
  Easing,
} from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { useWallet } from '../../context/WalletContext';
import api from '../../services/api';

// کامپوننت‌های UI
import LoadingSpinner, { PageLoader } from '../../components/ui/LoadingSpinner';
import Button, { PrimaryButton, SuccessButton } from '../../components/ui/Button';
import Card, { CardWithHeader, StatCard } from '../../components/ui/Card';
import { useTheme } from '../../context/ThemeContext';

const { width } = Dimensions.get('window');

const RewardsScreen = () => {
  const { user } = useAuth();
  const { showSuccess, showError, showInfo } = useToast();
  const { addBalance } = useWallet();
  const theme = useTheme();

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [rewards, setRewards] = useState({
    daily: {
      available: false,
      claimed: false,
      streak: 0,
      nextReward: 0,
    },
    weekly: {
      available: false,
      claimed: false,
      progress: 0,
      total: 7,
    },
    monthly: {
      available: false,
      claimed: false,
      progress: 0,
      total: 30,
    },
    special: [],
    achievements: [],
  });
  const [rewardHistory, setRewardHistory] = useState([]);
  const [stats, setStats] = useState({
    totalClaimed: 0,
    dailyClaims: 0,
    weeklyClaims: 0,
    monthlyClaims: 0,
  });
  
  // انیمیشن‌ها
  const [pulseAnim] = useState(new Animated.Value(1));
  const [spinAnim] = useState(new Animated.Value(0));
  const [shakeAnim] = useState(new Animated.Value(0));

  useEffect(() => {
    loadRewardsData();
  }, []);

  // شروع انیمیشن‌ها
  useEffect(() => {
    // انیمیشن پالس برای پاداش روزانه
    const pulseAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.1,
          duration: 1000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    );

    // انیمیشن چرخش برای پاداش‌های ویژه
    const spinAnimation = Animated.loop(
      Animated.timing(spinAnim, {
        toValue: 1,
        duration: 20000,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    );

    pulseAnimation.start();
    spinAnimation.start();

    return () => {
      pulseAnimation.stop();
      spinAnimation.stop();
    };
  }, []);

  const loadRewardsData = async () => {
    try {
      setLoading(true);
      
      // بارگذاری موازی داده‌ها
      const [rewardsRes, historyRes, statsRes] = await Promise.all([
        api.rewards.getAvailableRewards(user.id),
        api.rewards.getRewardHistory(user.id, 10),
        api.rewards.getStats(user.id),
      ]);

      if (rewardsRes.success) {
        setRewards(rewardsRes.data);
      }

      if (historyRes.success) {
        setRewardHistory(historyRes.data);
      }

      if (statsRes.success) {
        setStats(statsRes.data);
      }
    } catch (error) {
      console.error('Error loading rewards data:', error);
      showError('خطا در بارگذاری اطلاعات پاداش‌ها');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadRewardsData();
  };

  // انیمیشن تکان دادن
  const startShakeAnimation = () => {
    Animated.sequence([
      Animated.timing(shakeAnim, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(shakeAnim, {
        toValue: -1,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(shakeAnim, {
        toValue: 0,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const spin = spinAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const shake = shakeAnim.interpolate({
    inputRange: [-1, 1],
    outputRange: ['-5deg', '5deg'],
  });

  const handleClaimDailyReward = async () => {
    try {
      const response = await api.rewards.claimDailyReward(user.id);
      
      if (response.success) {
        const { amount, currency, streak } = response.data;
        
        // افزودن به موجودی
        addBalance(currency, amount);
        
        // به‌روزرسانی وضعیت
        setRewards(prev => ({
          ...prev,
          daily: {
            ...prev.daily,
            available: false,
            claimed: true,
            streak: streak,
          },
        }));

        // به‌روزرسانی آمار
        setStats(prev => ({
          ...prev,
          totalClaimed: prev.totalClaimed + amount,
          dailyClaims: prev.dailyClaims + 1,
        }));

        // شروع انیمیشن‌ها
        startShakeAnimation();
        
        showSuccess(`پاداش روزانه دریافت شد! ${amount} ${currency === 'sod' ? 'SOD' : 'تومان'} 🎉`);
        
        // افزودن به تاریخچه
        setRewardHistory(prev => [{
          id: Date.now(),
          type: 'daily',
          amount,
          currency,
          timestamp: new Date().toISOString(),
          description: `پاداش روزانه (${streak} روز متوالی)`,
        }, ...prev]);

        return true;
      } else {
        showError(response.message || 'خطا در دریافت پاداش روزانه');
        return false;
      }
    } catch (error) {
      console.error('Error claiming daily reward:', error);
      showError('خطا در دریافت پاداش روزانه');
      return false;
    }
  };

  const handleClaimWeeklyReward = async () => {
    try {
      const response = await api.rewards.claimWeeklyReward(user.id);
      
      if (response.success) {
        const { amount, currency } = response.data;
        
        // افزودن به موجودی
        addBalance(currency, amount);
        
        // به‌روزرسانی وضعیت
        setRewards(prev => ({
          ...prev,
          weekly: {
            ...prev.weekly,
            available: false,
            claimed: true,
          },
        }));

        // به‌روزرسانی آمار
        setStats(prev => ({
          ...prev,
          totalClaimed: prev.totalClaimed + amount,
          weeklyClaims: prev.weeklyClaims + 1,
        }));

        showSuccess(`پاداش هفتگی دریافت شد! ${amount} ${currency === 'sod' ? 'SOD' : 'تومان'} 🎉`);
        
        // افزودن به تاریخچه
        setRewardHistory(prev => [{
          id: Date.now(),
          type: 'weekly',
          amount,
          currency,
          timestamp: new Date().toISOString(),
          description: 'پاداش هفتگی',
        }, ...prev]);

        return true;
      } else {
        showError(response.message || 'خطا در دریافت پاداش هفتگی');
        return false;
      }
    } catch (error) {
      console.error('Error claiming weekly reward:', error);
      showError('خطا در دریافت پاداش هفتگی');
      return false;
    }
  };

  const handleClaimSpecialReward = async (rewardId) => {
    try {
      const response = await api.rewards.claimSpecialReward(user.id, rewardId);
      
      if (response.success) {
        const { amount, currency, type } = response.data;
        
        // افزودن به موجودی
        addBalance(currency, amount);
        
        // حذف از لیست پاداش‌های ویژه
        setRewards(prev => ({
          ...prev,
          special: prev.special.filter(r => r.id !== rewardId),
        }));

        showSuccess(`پاداش ویژه "${type}" دریافت شد! ${amount} ${currency === 'sod' ? 'SOD' : 'تومان'}`);
        
        // افزودن به تاریخچه
        setRewardHistory(prev => [{
          id: Date.now(),
          type: 'special',
          amount,
          currency,
          timestamp: new Date().toISOString(),
          description: `پاداش ویژه: ${type}`,
        }, ...prev]);

        return true;
      } else {
        showError(response.message || 'خطا در دریافت پاداش ویژه');
        return false;
      }
    } catch (error) {
      console.error('Error claiming special reward:', error);
      showError('خطا در دریافت پاداش ویژه');
      return false;
    }
  };

  const handleClaimAllRewards = async () => {
    try {
      // درخواست دریافت همه پاداش‌ها
      showInfo('دریافت همه پاداش‌ها به زودی فعال خواهد شد');
      
      // شبیه‌سازی دریافت
      const totalAmount = 15000; // 15,000 تومان
      addBalance('toman', totalAmount);
      
      showSuccess(`همه پاداش‌ها دریافت شد! ${totalAmount.toLocaleString('fa-IR')} تومان 🎉`);
      
      // به‌روزرسانی آمار
      setStats(prev => ({
        ...prev,
        totalClaimed: prev.totalClaimed + totalAmount,
      }));

      return true;
    } catch (error) {
      console.error('Error claiming all rewards:', error);
      showError('خطا در دریافت همه پاداش‌ها');
      return false;
    }
  };

  const formatCurrency = (amount, currency) => {
    const formatted = amount.toLocaleString('fa-IR');
    
    switch (currency) {
      case 'sod':
        return `${formatted} SOD`;
      case 'toman':
        return `${formatted} تومان`;
      default:
        return formatted;
    }
  };

  if (loading && !refreshing) {
    return <PageLoader text="در حال بارگذاری پاداش‌ها..." />;
  }

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[theme.colors.primary]}
            tintColor={theme.colors.primary}
          />
        }
      >
        {/* هدر صفحه */}
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <Text style={[styles.headerTitle, { color: theme.colors.text }]}>
              پاداش‌ها و جوایز
            </Text>
            <Text style={[styles.headerSubtitle, { color: theme.colors.textSecondary }]}>
              دریافت پاداش و افزایش درآمد
            </Text>
          </View>
        </View>

        {/* آمار کلی */}
        <Card style={styles.statsCard}>
          <View style={styles.statsGrid}>
            <View style={styles.statItem}>
              <Text style={[styles.statValue, { color: theme.colors.primary }]}>
                {formatCurrency(stats.totalClaimed, 'toman')}
              </Text>
              <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>
                پاداش دریافتی
              </Text>
            </View>
            
            <View style={styles.statItem}>
              <Text style={[styles.statValue, { color: theme.colors.success }]}>
                {stats.dailyClaims}
              </Text>
              <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>
                روزانه
              </Text>
            </View>
            
            <View style={styles.statItem}>
              <Text style={[styles.statValue, { color: theme.colors.accent }]}>
                {stats.weeklyClaims}
              </Text>
              <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>
                هفتگی
              </Text>
            </View>
            
            <View style={styles.statItem}>
              <Text style={[styles.statValue, { color: theme.colors.secondary }]}>
                {stats.monthlyClaims}
              </Text>
              <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>
                ماهانه
              </Text>
            </View>
          </View>
        </Card>

        {/* پاداش روزانه */}
        <Card style={styles.dailyRewardCard}>
          <View style={styles.dailyHeader}>
            <View style={styles.dailyHeaderLeft}>
              <Animated.View 
                style={[
                  styles.dailyIcon,
                  { 
                    backgroundColor: rewards.daily.available ? theme.colors.success : theme.colors.gray,
                    transform: [
                      { scale: pulseAnim },
                      { rotate: shake },
                    ],
                  }
                ]}
              >
                <Text style={styles.dailyIconText}>
                  🎁
                </Text>
              </Animated.View>
              <View style={styles.dailyInfo}>
                <Text style={[styles.dailyTitle, { color: theme.colors.text }]}>
                  پاداش روزانه
                </Text>
                <Text style={[styles.dailySubtitle, { color: theme.colors.textSecondary }]}>
                  {rewards.daily.claimed ? 
                    `امروز دریافت کرده‌اید (${rewards.daily.streak} روز متوالی)` : 
                    'برای دریافت پاداش کلیک کنید'}
                </Text>
              </View>
            </View>
            
            <View style={styles.dailyStreak}>
              <Text style={[styles.streakText, { color: theme.colors.primary }]}>
                {rewards.daily.streach || 0}
              </Text>
              <Text style={[styles.streakLabel, { color: theme.colors.textSecondary }]}>
                روز متوالی
              </Text>
            </View>
          </View>
          
          <View style={styles.dailyProgress}>
            <View style={styles.progressBar}>
              <View 
                style={[
                  styles.progressFill, 
                  { 
                    width: `${(rewards.daily.streak % 7) * (100 / 7)}%`,
                    backgroundColor: theme.colors.primary 
                  }
                ]} 
              />
            </View>
            <Text style={[styles.progressText, { color: theme.colors.textTertiary }]}>
              روز {rewards.daily.streak % 7 || 7}/۷ - پاداش بزرگ‌تر بعدی: {rewards.daily.nextReward} تومان
            </Text>
          </View>
          
          <PrimaryButton
            title={rewards.daily.claimed ? 'امروز دریافت شده' : 'دریافت پاداش روزانه'}
            onPress={rewards.daily.claimed ? null : handleClaimDailyReward}
            disabled={rewards.daily.claimed}
            icon={rewards.daily.claimed ? 'check-circle' : 'gift'}
            style={styles.dailyButton}
          />
        </Card>

        {/* پاداش هفتگی */}
        <Card style={styles.weeklyRewardCard}>
          <View style={styles.weeklyHeader}>
            <View style={styles.weeklyHeaderLeft}>
              <View style={[
                styles.weeklyIcon,
                { backgroundColor: rewards.weekly.available ? theme.colors.accent : theme.colors.gray }
              ]}>
                <Text style={styles.weeklyIconText}>
                  📅
                </Text>
              </View>
              <View style={styles.weeklyInfo}>
                <Text style={[styles.weeklyTitle, { color: theme.colors.text }]}>
                  پاداش هفتگی
                </Text>
                <Text style={[styles.weeklySubtitle, { color: theme.colors.textSecondary }]}>
                  {rewards.weekly.claimed ? 
                    'این هفته دریافت کرده‌اید' : 
                    `${rewards.weekly.progress}/${rewards.weekly.total} روز کامل`}
                </Text>
              </View>
            </View>
            
            <View style={styles.weeklyAmount}>
              <Text style={[styles.amountText, { color: theme.colors.accent }]}>
                {formatCurrency(5000, 'toman')}
              </Text>
            </View>
          </View>
          
          <View style={styles.weeklyProgress}>
            <View style={styles.progressBar}>
              <View 
                style={[
                  styles.progressFill, 
                  { 
                    width: `${(rewards.weekly.progress / rewards.weekly.total) * 100}%`,
                    backgroundColor: theme.colors.accent 
                  }
                ]} 
              />
            </View>
            <Text style={[styles.progressText, { color: theme.colors.textTertiary }]}>
              پیشرفت هفتگی: {rewards.weekly.progress}/{rewards.weekly.total} روز
            </Text>
          </View>
          
          <SuccessButton
            title={rewards.weekly.claimed ? 'این هفته دریافت شده' : 'دریافت پاداش هفتگی'}
            onPress={rewards.weekly.claimed ? null : handleClaimWeeklyReward}
            disabled={rewards.weekly.claimed || rewards.weekly.progress < rewards.weekly.total}
            icon={rewards.weekly.claimed ? 'check-circle' : 'calendar-alt'}
            style={styles.weeklyButton}
          />
        </Card>

        {/* پاداش‌های ویژه */}
        <Card style={styles.specialRewardsCard}>
          <View style={styles.specialHeader}>
            <Text style={[styles.cardTitle, { color: theme.colors.text }]}>
              🎯 پاداش‌های ویژه
            </Text>
            <Text style={[styles.cardSubtitle, { color: theme.colors.textSecondary }]}>
              برای دستاوردهای خاص
            </Text>
          </View>
          
          {rewards.special.length === 0 ? (
            <View style={styles.emptySpecial}>
              <Text style={[styles.emptyText, { color: theme.colors.textSecondary }]}>
                در حال حاضر پاداش ویژه‌ای موجود نیست
              </Text>
              <Text style={[styles.emptySubtext, { color: theme.colors.textTertiary }]}>
                با انجام دستاوردهای جدید، پاداش‌های ویژه دریافت کنید
              </Text>
            </View>
          ) : (
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false}
              style={styles.specialScroll}
            >
              {rewards.special.map((reward, index) => (
                <Animated.View
                  key={reward.id}
                  style={[
                    styles.specialItem,
                    { 
                      transform: [
                        { rotate: spin },
                      ],
                      marginLeft: index === 0 ? 0 : 12,
                    }
                  ]}
                >
                  <TouchableOpacity
                    style={[
                      styles.specialItemContent,
                      { backgroundColor: theme.colors.surface }
                    ]}
                    onPress={() => handleClaimSpecialReward(reward.id)}
                    activeOpacity={0.8}
                  >
                    <View style={[
                      styles.specialIcon,
                      { backgroundColor: reward.color || theme.colors.primary }
                    ]}>
                      <Text style={styles.specialIconText}>
                        {reward.icon || '🎁'}
                      </Text>
                    </View>
                    <Text style={[styles.specialName, { color: theme.colors.text }]}>
                      {reward.name}
                    </Text>
                    <Text style={[styles.specialAmount, { color: theme.colors.primary }]}>
                      {formatCurrency(reward.amount, reward.currency)}
                    </Text>
                    <Text style={[styles.specialDesc, { color: theme.colors.textSecondary }]}>
                      {reward.description}
                    </Text>
                  </TouchableOpacity>
                </Animated.View>
              ))}
            </ScrollView>
          )}
        </Card>

        {/* دستاوردها */}
        <Card style={styles.achievementsCard}>
          <View style={styles.achievementsHeader}>
            <Text style={[styles.cardTitle, { color: theme.colors.text }]}>
              🏆 دستاوردهای شما
            </Text>
            <Text style={[styles.cardSubtitle, { color: theme.colors.textSecondary }]}>
              {rewards.achievements.filter(a => a.completed).length}/{rewards.achievements.length} تکمیل شده
            </Text>
          </View>
          
          <View style={styles.achievementsGrid}>
            {rewards.achievements.slice(0, 6).map(achievement => (
              <TouchableOpacity
                key={achievement.id}
                style={[
                  styles.achievementItem,
                  { 
                    backgroundColor: achievement.completed ? 
                      theme.colors.success + '20' : theme.colors.surface 
                  }
                ]}
                onPress={() => showInfo(
                  `${achievement.name}\n\n${achievement.description}\n\nپاداش: ${formatCurrency(achievement.reward, achievement.currency)}`,
                  'info'
                )}
                activeOpacity={0.8}
              >
                <View style={[
                  styles.achievementIcon,
                  { 
                    backgroundColor: achievement.completed ? 
                      theme.colors.success : theme.colors.gray 
                  }
                ]}>
                  <Text style={styles.achievementIconText}>
                    {achievement.icon || '🏅'}
                  </Text>
                </View>
                <Text style={[
                  styles.achievementName, 
                  { color: achievement.completed ? theme.colors.success : theme.colors.text }
                ]}>
                  {achievement.name}
                </Text>
                {achievement.completed && (
                  <View style={[styles.completedBadge, { backgroundColor: theme.colors.success }]}>
                    <Text style={styles.completedBadgeText}>✓</Text>
                  </View>
                )}
              </TouchableOpacity>
            ))}
          </View>
          
          {rewards.achievements.length > 6 && (
            <Button
              title="مشاهده همه دستاوردها"
              onPress={() => showInfo('صفحه دستاوردها به زودی فعال خواهد شد')}
              variant="ghost"
              icon="chevron-left"
              textStyle={{ color: theme.colors.primary }}
              style={styles.viewAllButton}
            />
          )}
        </Card>

        {/* تاریخچه پاداش‌ها */}
        <Card style={styles.historyCard}>
          <View style={styles.historyHeader}>
            <Text style={[styles.cardTitle, { color: theme.colors.text }]}>
              📜 تاریخچه پاداش‌ها
            </Text>
            
            <Button
              title="مشاهده همه"
              onPress={() => showInfo('صفحه تاریخچه کامل به زودی فعال خواهد شد')}
              variant="ghost"
              size="small"
              textStyle={{ color: theme.colors.primary, fontSize: 12 }}
            />
          </View>
          
          {rewardHistory.length === 0 ? (
            <View style={styles.emptyHistory}>
              <Text style={[styles.emptyText, { color: theme.colors.textSecondary }]}>
                هنوز پاداشی دریافت نکرده‌اید
              </Text>
              <Text style={[styles.emptySubtext, { color: theme.colors.textTertiary }]}>
                با دریافت اولین پاداش، تاریخچه اینجا نمایش داده می‌شود
              </Text>
            </View>
          ) : (
            <View style={styles.historyList}>
              {rewardHistory.slice(0, 5).map((item, index) => (
                <View key={index} style={styles.historyItem}>
                  <View style={styles.historyItemLeft}>
                    <View style={[
                      styles.historyIcon,
                      { 
                        backgroundColor: item.type === 'daily' ? theme.colors.success :
                                      item.type === 'weekly' ? theme.colors.accent :
                                      item.type === 'monthly' ? theme.colors.secondary :
                                      theme.colors.primary
                      }
                    ]}>
                      <Text style={styles.historyIconText}>
                        {item.type === 'daily' ? '📅' :
                         item.type === 'weekly' ? '🗓️' :
                         item.type === 'monthly' ? '📊' : '🎁'}
                      </Text>
                    </View>
                    <View style={styles.historyInfo}>
                      <Text style={[styles.historyTitle, { color: theme.colors.text }]}>
                        {item.description}
                      </Text>
                      <Text style={[styles.historyDate, { color: theme.colors.textSecondary }]}>
                        {new Date(item.timestamp).toLocaleDateString('fa-IR')}
                      </Text>
                    </View>
                  </View>
                  <Text style={[styles.historyAmount, { color: theme.colors.success }]}>
                    +{formatCurrency(item.amount, item.currency)}
                  </Text>
                </View>
              ))}
            </View>
          )}
        </Card>

        {/* دکمه دریافت همه */}
        {rewards.special.length > 0 && (
          <Card style={styles.claimAllCard}>
            <View style={styles.claimAllContent}>
              <Text style={[styles.claimAllTitle, { color: theme.colors.text }]}>
                🎉 {rewards.special.length} پاداش ویژه آماده دریافت!
              </Text>
              <Text style={[styles.claimAllDesc, { color: theme.colors.textSecondary }]}>
                همه پاداش‌های ویژه خود را یکجا دریافت کنید
              </Text>
              
              <SuccessButton
                title={`دریافت همه (${rewards.special.length})`}
                onPress={handleClaimAllRewards}
                icon="gift"
                style={styles.claimAllButton}
              />
            </View>
          </Card>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0f1c',
  },
  scrollView: {
    flex: 1,
  },
  header: {
    padding: 20,
    paddingTop: 40,
    paddingBottom: 10,
  },
  headerContent: {
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '900',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
  },
  statsCard: {
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 20,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  statItem: {
    alignItems: 'center',
    width: '48%',
    marginBottom: 16,
  },
  statValue: {
    fontSize: 16,
    fontWeight: '900',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 11,
  },
  dailyRewardCard: {
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 20,
  },
  dailyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  dailyHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  dailyIcon: {
    width: 56,
    height: 56,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 12,
  },
  dailyIconText: {
    fontSize: 28,
  },
  dailyInfo: {
    flex: 1,
  },
  dailyTitle: {
    fontSize: 18,
    fontWeight: '900',
    marginBottom: 4,
  },
  dailySubtitle: {
    fontSize: 12,
  },
  dailyStreak: {
    alignItems: 'center',
    marginRight: 8,
  },
  streakText: {
    fontSize: 24,
    fontWeight: '900',
  },
  streakLabel: {
    fontSize: 10,
  },
  dailyProgress: {
    marginBottom: 20,
  },
  progressBar: {
    height: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: 6,
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
  progressText: {
    fontSize: 10,
    textAlign: 'left',
  },
  dailyButton: {
    marginTop: 8,
  },
  weeklyRewardCard: {
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 20,
  },
  weeklyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  weeklyHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  weeklyIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 12,
  },
  weeklyIconText: {
    fontSize: 24,
  },
  weeklyInfo: {
    flex: 1,
  },
  weeklyTitle: {
    fontSize: 16,
    fontWeight: '900',
    marginBottom: 4,
  },
  weeklySubtitle: {
    fontSize: 12,
  },
  weeklyAmount: {
    alignItems: 'flex-end',
    marginRight: 8,
  },
  amountText: {
    fontSize: 18,
    fontWeight: '900',
  },
  weeklyProgress: {
    marginBottom: 20,
  },
  weeklyButton: {
    marginTop: 8,
  },
  specialRewardsCard: {
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 20,
  },
  specialHeader: {
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '900',
    marginBottom: 4,
  },
  cardSubtitle: {
    fontSize: 12,
  },
  emptySpecial: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  emptyText: {
    fontSize: 14,
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 12,
    textAlign: 'center',
  },
  specialScroll: {
    marginHorizontal: -20,
    paddingHorizontal: 20,
  },
  specialItem: {
    width: 140,
  },
  specialItemContent: {
    padding: 16,
    borderRadius: 16,
    alignItems: 'center',
  },
  specialIcon: {
    width: 60,
    height: 60,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  specialIconText: {
    fontSize: 28,
  },
  specialName: {
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 4,
    textAlign: 'center',
  },
  specialAmount: {
    fontSize: 16,
    fontWeight: '900',
    marginBottom: 8,
  },
  specialDesc: {
    fontSize: 10,
    textAlign: 'center',
    lineHeight: 14,
  },
  achievementsCard: {
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 20,
  },
  achievementsHeader: {
    marginBottom: 16,
  },
  achievementsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  achievementItem: {
    width: '31%',
    aspectRatio: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 12,
    marginBottom: 12,
    position: 'relative',
  },
  achievementIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  achievementIconText: {
    fontSize: 20,
  },
  achievementName: {
    fontSize: 10,
    fontWeight: '700',
    textAlign: 'center',
    lineHeight: 14,
  },
  completedBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  completedBadgeText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  viewAllButton: {
    marginTop: 8,
  },
  historyCard: {
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 20,
  },
  historyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  emptyHistory: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  historyList: {
    gap: 12,
  },
  historyItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderRadius: 12,
  },
  historyItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  historyIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 12,
  },
  historyIconText: {
    fontSize: 16,
  },
  historyInfo: {
    flex: 1,
  },
  historyTitle: {
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 2,
  },
  historyDate: {
    fontSize: 10,
  },
  historyAmount: {
    fontSize: 14,
    fontWeight: '900',
    marginRight: 8,
  },
  claimAllCard: {
    marginHorizontal: 16,
    marginBottom: 32,
    padding: 20,
  },
  claimAllContent: {
    alignItems: 'center',
  },
  claimAllTitle: {
    fontSize: 20,
    fontWeight: '900',
    marginBottom: 8,
    textAlign: 'center',
  },
  claimAllDesc: {
    fontSize: 13,
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 20,
  },
  claimAllButton: {
    minWidth: 200,
  },
});

export default RewardsScreen;
