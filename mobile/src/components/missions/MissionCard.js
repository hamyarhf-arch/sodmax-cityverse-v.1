// mobile/src/components/missions/MissionCard.js
import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Easing,
} from 'react-native';
import { useTheme } from '../../context/ThemeContext';

const MissionCard = ({
  mission,
  onStart,
  onComplete,
  onClaim,
  onPress,
  compact = false,
  showProgress = true,
  showReward = true,
  showStatus = true,
  animated = true,
  ...props
}) => {
  const theme = useTheme();
  const [progressAnim] = useState(new Animated.Value(0));
  const [scaleAnim] = useState(new Animated.Value(1));
  const [pulseAnim] = useState(new Animated.Value(1));
  const [shakeAnim] = useState(new Animated.Value(0));

  const {
    id,
    title,
    description,
    reward,
    progress = 0,
    total = 100,
    status = 'available', // available, in_progress, completed, claimed
    type = 'daily', // daily, weekly, monthly, special, achievement
    icon = '🎯',
    color,
    deadline,
    difficulty = 'easy', // easy, medium, hard, expert
    category,
  } = mission;

  const isCompleted = progress >= total;
  const isClaimable = status === 'completed' && !mission.claimed;
  const isInProgress = status === 'in_progress' && progress < total;
  const isAvailable = status === 'available';

  useEffect(() => {
    if (animated) {
      // انیمیشن پیشرفت
      Animated.timing(progressAnim, {
        toValue: progress / total,
        duration: 1000,
        easing: Easing.out(Easing.exp),
        useNativeDriver: false,
      }).start();

      // انیمیشن پالس برای مأموریت‌های قابل تکمیل
      if (isClaimable) {
        const pulseAnimation = Animated.loop(
          Animated.sequence([
            Animated.timing(pulseAnim, {
              toValue: 1.05,
              duration: 800,
              easing: Easing.inOut(Easing.ease),
              useNativeDriver: true,
            }),
            Animated.timing(pulseAnim, {
              toValue: 1,
              duration: 800,
              easing: Easing.inOut(Easing.ease),
              useNativeDriver: true,
            }),
          ])
        );
        pulseAnimation.start();
        return () => pulseAnimation.stop();
      }
    }
  }, [progress, total, isClaimable]);

  const getStatusColor = () => {
    switch (status) {
      case 'completed':
        return theme.colors.success;
      case 'in_progress':
        return theme.colors.primary;
      case 'claimed':
        return theme.colors.secondary;
      case 'available':
      default:
        return theme.colors.textSecondary;
    }
  };

  const getDifficultyColor = () => {
    switch (difficulty) {
      case 'easy':
        return theme.colors.success;
      case 'medium':
        return theme.colors.warning;
      case 'hard':
        return theme.colors.error;
      case 'expert':
        return theme.colors.accent;
      default:
        return theme.colors.textSecondary;
    }
  };

  const getTypeIcon = () => {
    switch (type) {
      case 'daily':
        return '📅';
      case 'weekly':
        return '🗓️';
      case 'monthly':
        return '📊';
      case 'special':
        return '🎁';
      case 'achievement':
        return '🏆';
      default:
        return icon || '🎯';
    }
  };

  const getCategoryColor = () => {
    if (color) return color;
    
    switch (category) {
      case 'mining':
        return '#0066FF';
      case 'referral':
        return '#00D4AA';
      case 'wallet':
        return '#10B981';
      case 'game':
        return '#FF6B35';
      case 'social':
        return '#8B5CF6';
      default:
        return theme.colors.primary;
    }
  };

  const handlePress = () => {
    if (onPress) {
      onPress(mission);
    }
    
    // انیمیشن کلیک
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 0.98,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 200,
        easing: Easing.elastic(1),
        useNativeDriver: true,
      }),
    ]).start();
  };

  const handleAction = () => {
    if (isClaimable && onClaim) {
      onClaim(id);
    } else if (isAvailable && onStart) {
      onStart(id);
    } else if (isInProgress && onComplete) {
      onComplete(id);
    }
    
    // انیمیشن تکان خوردن
    Animated.sequence([
      Animated.timing(shakeAnim, {
        toValue: 5,
        duration: 50,
        useNativeDriver: true,
      }),
      Animated.timing(shakeAnim, {
        toValue: -5,
        duration: 50,
        useNativeDriver: true,
      }),
      Animated.timing(shakeAnim, {
        toValue: 0,
        duration: 50,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const renderActionButton = () => {
    let buttonText = '';
    let buttonColor = theme.colors.primary;
    
    if (isClaimable) {
      buttonText = 'دریافت پاداش';
      buttonColor = theme.colors.success;
    } else if (isAvailable) {
      buttonText = 'شروع مأموریت';
      buttonColor = theme.colors.primary;
    } else if (isInProgress) {
      buttonText = 'تکمیل مأموریت';
      buttonColor = theme.colors.warning;
    } else if (status === 'claimed') {
      buttonText = 'دریافت شده';
      buttonColor = theme.colors.secondary;
    } else {
      return null;
    }

    return (
      <TouchableOpacity
        style={[styles.actionButton, { backgroundColor: buttonColor }]}
        onPress={handleAction}
        disabled={status === 'claimed'}
        activeOpacity={0.8}
      >
        <Text style={styles.actionButtonText}>
          {buttonText}
        </Text>
      </TouchableOpacity>
    );
  };

  if (compact) {
    return (
      <Animated.View
        style={[
          styles.compactCard,
          {
            transform: [
              { scale: scaleAnim },
              { translateX: shakeAnim },
            ],
            borderLeftColor: getCategoryColor(),
          },
          props.style,
        ]}
      >
        <TouchableOpacity
          style={styles.compactTouchable}
          onPress={handlePress}
          activeOpacity={0.7}
        >
          <View style={styles.compactHeader}>
            <View style={styles.compactIconContainer}>
              <Text style={[styles.compactIcon, { color: getCategoryColor() }]}>
                {getTypeIcon()}
              </Text>
            </View>
            
            <View style={styles.compactInfo}>
              <Text style={[styles.compactTitle, { color: theme.colors.text }]} numberOfLines={1}>
                {title}
              </Text>
              {showProgress && (
                <Text style={[styles.compactProgress, { color: theme.colors.textSecondary }]}>
                  {progress}/{total}
                </Text>
              )}
            </View>
            
            {showReward && (
              <View style={[styles.compactReward, { backgroundColor: getCategoryColor() + '20' }]}>
                <Text style={[styles.compactRewardText, { color: getCategoryColor() }]}>
                  {reward} تومان
                </Text>
              </View>
            )}
          </View>
          
          {showProgress && (
            <View style={styles.compactProgressBar}>
              <Animated.View
                style={[
                  styles.compactProgressFill,
                  {
                    width: progressAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: ['0%', '100%'],
                    }),
                    backgroundColor: getCategoryColor(),
                  },
                ]}
              />
            </View>
          )}
        </TouchableOpacity>
      </Animated.View>
    );
  }

  return (
    <Animated.View
      style={[
        styles.card,
        {
          transform: [
            { scale: scaleAnim },
            { translateX: shakeAnim },
          ],
          borderLeftColor: getCategoryColor(),
        },
        isClaimable && {
          transform: [
            { scale: pulseAnim },
            { translateX: shakeAnim },
          ],
        },
        props.style,
      ]}
    >
      <TouchableOpacity
        style={styles.touchable}
        onPress={handlePress}
        activeOpacity={0.7}
      >
        {/* هدر مأموریت */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <View style={[styles.iconContainer, { backgroundColor: getCategoryColor() + '20' }]}>
              <Animated.Text
                style={[
                  styles.icon,
                  { 
                    color: getCategoryColor(),
                    transform: isClaimable ? [{ scale: pulseAnim }] : [],
                  },
                ]}
              >
                {getTypeIcon()}
              </Animated.Text>
            </View>
            
            <View style={styles.titleContainer}>
              <Text style={[styles.title, { color: theme.colors.text }]}>
                {title}
              </Text>
              
              <View style={styles.metaContainer}>
                <View style={[styles.difficultyBadge, { backgroundColor: getDifficultyColor() + '20' }]}>
                  <Text style={[styles.difficultyText, { color: getDifficultyColor() }]}>
                    {difficulty === 'easy' ? 'آسان' :
                     difficulty === 'medium' ? 'متوسط' :
                     difficulty === 'hard' ? 'سخت' : 'حرفه‌ای'}
                  </Text>
                </View>
                
                {deadline && (
                  <Text style={[styles.deadline, { color: theme.colors.textTertiary }]}>
                    ⏰ {deadline}
                  </Text>
                )}
              </View>
            </View>
          </View>
          
          {showReward && (
            <View style={[styles.rewardContainer, { backgroundColor: getCategoryColor() + '20' }]}>
              <Text style={[styles.rewardText, { color: getCategoryColor() }]}>
                {reward} تومان
              </Text>
            </View>
          )}
        </View>

        {/* توضیحات */}
        {description && (
          <Text style={[styles.description, { color: theme.colors.textSecondary }]}>
            {description}
          </Text>
        )}

        {/* نوار پیشرفت */}
        {showProgress && (
          <View style={styles.progressContainer}>
            <View style={styles.progressHeader}>
              <Text style={[styles.progressText, { color: theme.colors.textSecondary }]}>
                پیشرفت
              </Text>
              <Text style={[styles.progressNumbers, { color: theme.colors.text }]}>
                {progress}/{total}
              </Text>
            </View>
            
            <View style={styles.progressBar}>
              <Animated.View
                style={[
                  styles.progressFill,
                  {
                    width: progressAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: ['0%', '100%'],
                    }),
                    backgroundColor: getCategoryColor(),
                  },
                ]}
              />
            </View>
            
            <Text style={[styles.progressPercentage, { color: getCategoryColor() }]}>
              {Math.round((progress / total) * 100)}%
            </Text>
          </View>
        )}

        {/* فوتر */}
        <View style={styles.footer}>
          <View style={styles.footerLeft}>
            {showStatus && (
              <View style={styles.statusContainer}>
                <View style={[styles.statusDot, { backgroundColor: getStatusColor() }]} />
                <Text style={[styles.statusText, { color: getStatusColor() }]}>
                  {status === 'available' ? 'در دسترس' :
                   status === 'in_progress' ? 'در حال انجام' :
                   status === 'completed' ? 'تکمیل شده' : 'دریافت شده'}
                </Text>
              </View>
            )}
            
            {category && (
              <View style={[styles.categoryBadge, { backgroundColor: getCategoryColor() + '20' }]}>
                <Text style={[styles.categoryText, { color: getCategoryColor() }]}>
                  {category === 'mining' ? 'استخراج' :
                   category === 'referral' ? 'دعوت دوستان' :
                   category === 'wallet' ? 'کیف پول' :
                   category === 'game' ? 'بازی' :
                   category === 'social' ? 'اجتماعی' : category}
                </Text>
              </View>
            )}
          </View>
          
          {renderActionButton()}
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 16,
    padding: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#0066FF',
    marginBottom: 12,
  },
  touchable: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    flex: 1,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 12,
  },
  icon: {
    fontSize: 24,
  },
  titleContainer: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 6,
  },
  metaContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 8,
  },
  difficultyBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  difficultyText: {
    fontSize: 10,
    fontWeight: '700',
  },
  deadline: {
    fontSize: 10,
  },
  rewardContainer: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    minWidth: 80,
    alignItems: 'center',
  },
  rewardText: {
    fontSize: 14,
    fontWeight: '900',
  },
  description: {
    fontSize: 12,
    lineHeight: 18,
    marginBottom: 16,
  },
  progressContainer: {
    marginBottom: 16,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  progressText: {
    fontSize: 11,
  },
  progressNumbers: {
    fontSize: 12,
    fontWeight: '700',
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
  progressPercentage: {
    fontSize: 10,
    fontWeight: '700',
    textAlign: 'left',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  footerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '600',
  },
  categoryBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  categoryText: {
    fontSize: 10,
    fontWeight: '700',
  },
  actionButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    minWidth: 120,
    alignItems: 'center',
  },
  actionButtonText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '700',
  },
  compactCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    padding: 12,
    borderLeftWidth: 3,
    borderLeftColor: '#0066FF',
    marginBottom: 8,
  },
  compactTouchable: {
    flex: 1,
  },
  compactHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  compactIconContainer: {
    marginLeft: 8,
  },
  compactIcon: {
    fontSize: 20,
  },
  compactInfo: {
    flex: 1,
  },
  compactTitle: {
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 2,
  },
  compactProgress: {
    fontSize: 10,
  },
  compactReward: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  compactRewardText: {
    fontSize: 11,
    fontWeight: '700',
  },
  compactProgressBar: {
    height: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 2,
    overflow: 'hidden',
  },
  compactProgressFill: {
    height: '100%',
    borderRadius: 2,
  },
});

// انواع مختلف کارت مأموریت
export const DailyMissionCard = (props) => (
  <MissionCard
    type="daily"
    icon="📅"
    color="#10B981"
    {...props}
  />
);

export const WeeklyMissionCard = (props) => (
  <MissionCard
    type="weekly"
    icon="🗓️"
    color="#0066FF"
    {...props}
  />
);

export const MonthlyMissionCard = (props) => (
  <MissionCard
    type="monthly"
    icon="📊"
    color="#8B5CF6"
    {...props}
  />
);

export const SpecialMissionCard = (props) => (
  <MissionCard
    type="special"
    icon="🎁"
    color="#FF6B35"
    {...props}
  />
);

export const AchievementCard = (props) => (
  <MissionCard
    type="achievement"
    icon="🏆"
    color="#F59E0B"
    {...props}
  />
);

// کارت مأموریت استخراج
export const MiningMissionCard = (props) => (
  <MissionCard
    category="mining"
    icon="⛏️"
    color="#0066FF"
    {...props}
  />
);

// کارت مأموریت دعوت
export const ReferralMissionCard = (props) => (
  <MissionCard
    category="referral"
    icon="👥"
    color="#00D4AA"
    {...props}
  />
);

export default MissionCard;
