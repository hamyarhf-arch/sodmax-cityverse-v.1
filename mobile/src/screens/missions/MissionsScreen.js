// mobile/src/screens/missions/MissionsScreen.js
import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  SectionList,
  Dimensions,
} from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import api from '../../services/api';

// کامپوننت‌های UI
import LoadingSpinner, { PageLoader } from '../../components/ui/LoadingSpinner';
import Button, { PrimaryButton, SecondaryButton } from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import MissionCard from '../../components/missions/MissionCard';
import { useTheme } from '../../context/ThemeContext';

const { width } = Dimensions.get('window');

const MissionsScreen = () => {
  const { user } = useAuth();
  const { showSuccess, showError, showInfo } = useToast();
  const theme = useTheme();

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [missions, setMissions] = useState({
    active: [],
    available: [],
    completed: [],
    special: [],
  });
  const [achievements, setAchievements] = useState([]);
  const [stats, setStats] = useState({
    totalCompleted: 0,
    totalRewards: 0,
    activeCount: 0,
  });
  const [selectedTab, setSelectedTab] = useState('active');

  useEffect(() => {
    loadMissionsData();
  }, []);

  const loadMissionsData = async () => {
    try {
      setLoading(true);
      
      // بارگذاری موازی داده‌ها
      const [activeRes, achievementsRes, statsRes] = await Promise.all([
        api.missions.getActiveMissions(user.id),
        api.missions.getAchievements(user.id),
        api.missions.getStats(user.id),
      ]);

      if (activeRes.success) {
        setMissions({
          ...missions,
          active: activeRes.data,
        });
      }

      if (achievementsRes.success) {
        setAchievements(achievementsRes.data);
      }

      if (statsRes.success) {
        setStats(statsRes.data);
      }
    } catch (error) {
      console.error('Error loading missions data:', error);
      showError('خطا در بارگذاری اطلاعات مأموریت‌ها');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadMissionsData();
  };

  const handleStartMission = async (missionId) => {
    try {
      const response = await api.missions.startMission(user.id, missionId);
      
      if (response.success) {
        showSuccess('مأموریت با موفقیت شروع شد!');
        loadMissionsData();
      } else {
        showError(response.message || 'خطا در شروع مأموریت');
      }
    } catch (error) {
      console.error('Error starting mission:', error);
      showError('خطا در شروع مأموریت');
    }
  };

  const handleCompleteMission = async (missionId) => {
    try {
      const response = await api.missions.completeMission(user.id, missionId);
      
      if (response.success) {
        showSuccess(`مأموریت تکمیل شد! ${response.reward} تومان دریافت کردید.`);
        loadMissionsData();
      } else {
        showError(response.message || 'خطا در تکمیل مأموریت');
      }
    } catch (error) {
      console.error('Error completing mission:', error);
      showError('خطا در تکمیل مأموریت');
    }
  };

  const handleClaimReward = async (missionId) => {
    try {
      const response = await api.missions.claimReward(user.id, missionId);
      
      if (response.success) {
        showSuccess('پاداش با موفقیت دریافت شد!');
        loadMissionsData();
      } else {
        showError(response.message || 'خطا در دریافت پاداش');
      }
    } catch (error) {
      console.error('Error claiming reward:', error);
      showError('خطا در دریافت پاداش');
    }
  };

  const renderMissionItem = ({ item }) => (
    <MissionCard
      mission={item}
      onStart={() => handleStartMission(item.id)}
      onComplete={() => handleCompleteMission(item.id)}
      onClaim={() => handleClaimReward(item.id)}
      onPress={() => showInfo(
        `${item.title}\n\n${item.description}\n\nپاداش: ${item.reward} تومان\nپیشرفت: ${item.progress}/${item.total}`,
        'info'
      )}
    />
  );

  const renderAchievementItem = ({ item }) => (
    <Card style={styles.achievementCard}>
      <View style={styles.achievementHeader}>
        <View style={[
          styles.achievementIcon,
          { backgroundColor: item.completed ? theme.colors.success : theme.colors.gray }
        ]}>
          <Text style={styles.achievementIconText}>
            {item.icon || '🏆'}
          </Text>
        </View>
        <View style={styles.achievementInfo}>
          <Text style={[styles.achievementTitle, { color: theme.colors.text }]}>
            {item.title}
          </Text>
          <Text style={[styles.achievementDesc, { color: theme.colors.textSecondary }]}>
            {item.description}
          </Text>
        </View>
        {item.completed && (
          <View style={[styles.completedBadge, { backgroundColor: theme.colors.success }]}>
            <Text style={styles.completedBadgeText}>تکمیل شده</Text>
          </View>
        )}
      </View>
      {!item.completed && (
        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <View 
              style={[
                styles.progressFill, 
                { 
                  width: `${(item.progress / item.total) * 100}%`,
                  backgroundColor: theme.colors.primary 
                }
              ]} 
            />
          </View>
          <Text style={[styles.progressText, { color: theme.colors.textTertiary }]}>
            {item.progress}/{item.total}
          </Text>
        </View>
      )}
    </Card>
  );

  if (loading && !refreshing) {
    return <PageLoader text="در حال بارگذاری مأموریت‌ها..." />;
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
              مأموریت‌ها و دستاوردها
            </Text>
            <Text style={[styles.headerSubtitle, { color: theme.colors.textSecondary }]}>
              انجام مأموریت‌ها و دریافت پاداش
            </Text>
          </View>
        </View>

        {/* آمار کلی */}
        <Card style={styles.statsCard}>
          <View style={styles.statsGrid}>
            <View style={styles.statItem}>
              <Text style={[styles.statValue, { color: theme.colors.primary }]}>
                {stats.totalCompleted}
              </Text>
              <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>
                تکمیل شده
              </Text>
            </View>
            
            <View style={styles.statItem}>
              <Text style={[styles.statValue, { color: theme.colors.success }]}>
                {stats.totalRewards.toLocaleString('fa-IR')}
              </Text>
              <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>
                تومان پاداش
              </Text>
            </View>
            
            <View style={styles.statItem}>
              <Text style={[styles.statValue, { color: theme.colors.accent }]}>
                {stats.activeCount}
              </Text>
              <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>
                فعال
              </Text>
            </View>
          </View>
        </Card>

        {/* تب‌های مأموریت‌ها */}
        <View style={styles.tabsContainer}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {[
              { id: 'active', label: 'فعال', count: missions.active.length },
              { id: 'available', label: 'در دسترس', count: missions.available.length },
              { id: 'completed', label: 'تکمیل شده', count: missions.completed.length },
              { id: 'special', label: 'ویژه', count: missions.special.length },
              { id: 'achievements', label: 'دستاوردها', count: achievements.length },
            ].map(tab => (
              <TouchableOpacity
                key={tab.id}
                style={[
                  styles.tab,
                  selectedTab === tab.id && [styles.tabActive, { borderBottomColor: theme.colors.primary }]
                ]}
                onPress={() => setSelectedTab(tab.id)}
              >
                <Text style={[
                  styles.tabLabel,
                  { color: selectedTab === tab.id ? theme.colors.primary : theme.colors.textSecondary }
                ]}>
                  {tab.label}
                </Text>
                {tab.count > 0 && (
                  <View style={[
                    styles.tabBadge,
                    { backgroundColor: selectedTab === tab.id ? theme.colors.primary : theme.colors.gray }
                  ]}>
                    <Text style={styles.tabBadgeText}>{tab.count}</Text>
                  </View>
                )}
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* محتوای تب انتخاب شده */}
        <View style={styles.tabContent}>
          {selectedTab === 'active' && (
            <>
              {missions.active.length === 0 ? (
                <Card style={styles.emptyCard}>
                  <Text style={[styles.emptyTitle, { color: theme.colors.text }]}>
                    هیچ مأموریت فعالی ندارید
                  </Text>
                  <Text style={[styles.emptyText, { color: theme.colors.textSecondary }]}>
                    برای مشاهده مأموریت‌های جدید، این صفحه را رفرش کنید یا کمی صبر کنید
                  </Text>
                  <SecondaryButton
                    title="بارگذاری مجدد"
                    onPress={onRefresh}
                    icon="refresh"
                    style={styles.emptyButton}
                  />
                </Card>
              ) : (
                <View style={styles.missionsList}>
                  {missions.active.map(mission => (
                    <MissionCard
                      key={mission.id}
                      mission={mission}
                      onStart={() => handleStartMission(mission.id)}
                      onComplete={() => handleCompleteMission(mission.id)}
                      onClaim={() => handleClaimReward(mission.id)}
                    />
                  ))}
                </View>
              )}
            </>
          )}

          {selectedTab === 'achievements' && (
            <>
              {achievements.length === 0 ? (
                <Card style={styles.emptyCard}>
                  <Text style={[styles.emptyTitle, { color: theme.colors.text }]}>
                    هنوز دستاوردی کسب نکرده‌اید
                  </Text>
                  <Text style={[styles.emptyText, { color: theme.colors.textSecondary }]}>
                    با انجام مأموریت‌ها، دستاوردهای مختلف کسب کنید
                  </Text>
                </Card>
              ) : (
                <View style={styles.achievementsList}>
                  {achievements.map(achievement => (
                    <View key={achievement.id} style={styles.achievementItem}>
                      {renderAchievementItem({ item: achievement })}
                    </View>
                  ))}
                </View>
              )}
            </>
          )}

          {selectedTab === 'completed' && (
            <Card style={styles.emptyCard}>
              <Text style={[styles.emptyTitle, { color: theme.colors.text }]}>
                این بخش به زودی فعال خواهد شد
              </Text>
              <Text style={[styles.emptyText, { color: theme.colors.textSecondary }]}>
                لیست مأموریت‌های تکمیل شده به زودی در اینجا نمایش داده می‌شود
              </Text>
            </Card>
          )}

          {selectedTab === 'available' && (
            <Card style={styles.emptyCard}>
              <Text style={[styles.emptyTitle, { color: theme.colors.text }]}>
                این بخش به زودی فعال خواهد شد
              </Text>
              <Text style={[styles.emptyText, { color: theme.colors.textSecondary }]}>
                مأموریت‌های در دسترس به زودی در اینجا نمایش داده می‌شود
              </Text>
            </Card>
          )}

          {selectedTab === 'special' && (
            <Card style={styles.emptyCard}>
              <Text style={[styles.emptyTitle, { color: theme.colors.text }]}>
                این بخش به زودی فعال خواهد شد
              </Text>
              <Text style={[styles.emptyText, { color: theme.colors.textSecondary }]}>
                مأموریت‌های ویژه به زودی در اینجا نمایش داده می‌شود
              </Text>
            </Card>
          )}
        </View>

        {/* مأموریت‌های ویژه امروز */}
        <Card style={styles.specialCard}>
          <View style={styles.specialHeader}>
            <Text style={[styles.specialTitle, { color: theme.colors.text }]}>
              ⭐ مأموریت ویژه امروز
            </Text>
            <View style={[styles.timeBadge, { backgroundColor: theme.colors.accent }]}>
              <Text style={styles.timeBadgeText}>۲۴:۰۰:۰۰</Text>
            </View>
          </View>
          
          <Text style={[styles.specialDesc, { color: theme.colors.textSecondary }]}>
            دعوت ۳ دوست جدید و دریافت ۵,۰۰۰ تومان پاداش ویژه
          </Text>
          
          <View style={styles.progressContainer}>
            <View style={styles.progressBar}>
              <View 
                style={[
                  styles.progressFill, 
                  { 
                    width: '33%',
                    backgroundColor: theme.colors.accent 
                  }
                ]} 
              />
            </View>
            <Text style={[styles.progressText, { color: theme.colors.textTertiary }]}>
              ۱/۳ دعوت
            </Text>
          </View>
          
          <PrimaryButton
            title="شرکت در مأموریت ویژه"
            onPress={() => showInfo('مأموریت ویژه امروز به زودی فعال خواهد شد')}
            icon="star"
            style={styles.specialButton}
          />
        </Card>
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
    justifyContent: 'space-between',
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statValue: {
    fontSize: 20,
    fontWeight: '900',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
  },
  tabsContainer: {
    marginHorizontal: 16,
    marginBottom: 16,
  },
  tab: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginRight: 8,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
    flexDirection: 'row',
    alignItems: 'center',
  },
  tabActive: {
    borderBottomWidth: 2,
  },
  tabLabel: {
    fontSize: 14,
    fontWeight: '600',
  },
  tabBadge: {
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 6,
  },
  tabBadgeText: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
  },
  tabContent: {
    marginHorizontal: 16,
    marginBottom: 16,
  },
  emptyCard: {
    padding: 32,
    alignItems: 'center',
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptyText: {
    fontSize: 13,
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 20,
  },
  emptyButton: {
    marginTop: 8,
  },
  missionsList: {
    gap: 12,
  },
  achievementsList: {
    gap: 12,
  },
  achievementCard: {
    padding: 16,
  },
  achievementHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  achievementIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 12,
  },
  achievementIconText: {
    fontSize: 24,
  },
  achievementInfo: {
    flex: 1,
  },
  achievementTitle: {
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 4,
  },
  achievementDesc: {
    fontSize: 12,
    lineHeight: 18,
  },
  completedBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  completedBadgeText: {
    color: 'white',
    fontSize: 10,
    fontWeight: '700',
  },
  progressContainer: {
    marginTop: 8,
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
    fontSize: 11,
    textAlign: 'left',
  },
  specialCard: {
    marginHorizontal: 16,
    marginBottom: 32,
    padding: 20,
  },
  specialHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  specialTitle: {
    fontSize: 16,
    fontWeight: '900',
  },
  timeBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  timeBadgeText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '700',
    fontFamily: 'monospace',
  },
  specialDesc: {
    fontSize: 13,
    lineHeight: 20,
    marginBottom: 16,
  },
  specialButton: {
    marginTop: 12,
  },
});

export default MissionsScreen;
