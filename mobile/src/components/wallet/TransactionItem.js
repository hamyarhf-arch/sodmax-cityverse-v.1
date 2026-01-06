// mobile/src/components/wallet/TransactionItem.js
import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Animated,
} from 'react-native';
import { useTheme } from '../../context/ThemeContext';

const TransactionItem = ({
  transaction,
  onPress,
  compact = false,
  showDate = true,
  showStatus = true,
  animated = true,
  ...props
}) => {
  const theme = useTheme();
  const [scaleAnim] = useState(new Animated.Value(1));
  const [slideAnim] = useState(new Animated.Value(0));

  const {
    id,
    type,
    amount,
    currency,
    status = 'pending',
    date,
    time,
    description,
    icon = '💳',
    color,
    fee,
    hash,
    from,
    to,
  } = transaction;

  const isPositive = amount > 0;
  const isPending = status === 'pending';
  const isFailed = status === 'failed';
  const isCompleted = status === 'completed';

  const getStatusColor = () => {
    switch (status) {
      case 'completed':
        return theme.colors.success;
      case 'pending':
        return theme.colors.warning;
      case 'failed':
        return theme.colors.error;
      default:
        return theme.colors.textSecondary;
    }
  };

  const getTypeColor = () => {
    if (color) return color;
    
    if (isPositive) {
      return theme.colors.success;
    }
    
    switch (type) {
      case 'deposit':
        return '#10B981';
      case 'withdrawal':
        return '#EF4444';
      case 'transfer':
        return '#3b82f6';
      case 'exchange':
        return '#8b5cf6';
      case 'reward':
        return '#F59E0B';
      case 'referral':
        return '#00D4AA';
      case 'mining':
        return '#0066FF';
      case 'purchase':
        return '#EC4899';
      default:
        return theme.colors.primary;
    }
  };

  const getTypeIcon = () => {
    if (icon) return icon;
    
    switch (type) {
      case 'deposit':
        return '📥';
      case 'withdrawal':
        return '📤';
      case 'transfer':
        return '🔄';
      case 'exchange':
        return '💱';
      case 'reward':
        return '🎁';
      case 'referral':
        return '👥';
      case 'mining':
        return '⛏️';
      case 'purchase':
        return '🛒';
      default:
        return '💳';
    }
  };

  const getTypeLabel = () => {
    switch (type) {
      case 'deposit':
        return 'واریز';
      case 'withdrawal':
        return 'برداشت';
      case 'transfer':
        return 'انتقال';
      case 'exchange':
        return 'تبدیل';
      case 'reward':
        return 'پاداش';
      case 'referral':
        return 'دعوت';
      case 'mining':
        return 'استخراج';
      case 'purchase':
        return 'خرید';
      default:
        return type;
    }
  };

  const getStatusLabel = () => {
    switch (status) {
      case 'completed':
        return 'تکمیل شده';
      case 'pending':
        return 'در انتظار';
      case 'failed':
        return 'ناموفق';
      default:
        return status;
    }
  };

  const handlePress = () => {
    if (onPress) {
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
          easing: Animated.Easing.elastic(1),
          useNativeDriver: true,
        }),
      ]).start();

      onPress(transaction);
    }
  };

  const handleSwipe = (direction) => {
    // انیمیشن اسلاید
    Animated.timing(slideAnim, {
      toValue: direction === 'left' ? -60 : 60,
      duration: 200,
      useNativeDriver: true,
    }).start(() => {
      // بازگشت به حالت اول
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }).start();
    });
  };

  const typeColor = getTypeColor();
  const statusColor = getStatusColor();

  if (compact) {
    return (
      <Animated.View
        style={[
          styles.compactItem,
          {
            transform: [
              { scale: scaleAnim },
              { translateX: slideAnim },
            ],
          },
          props.style,
        ]}
      >
        <TouchableOpacity
          style={styles.compactTouchable}
          onPress={handlePress}
          activeOpacity={0.7}
          onLongPress={() => handleSwipe('left')}
        >
          <View style={styles.compactContent}>
            <View style={[styles.compactIcon, { backgroundColor: typeColor + '20' }]}>
              <Text style={[styles.compactIconText, { color: typeColor }]}>
                {getTypeIcon()}
              </Text>
            </View>
            
            <View style={styles.compactInfo}>
              <Text style={[styles.compactType, { color: theme.colors.text }]} numberOfLines={1}>
                {getTypeLabel()}
              </Text>
              {showDate && date && (
                <Text style={[styles.compactDate, { color: theme.colors.textSecondary }]}>
                  {date}
                </Text>
              )}
            </View>
            
            <View style={styles.compactAmountContainer}>
              <Text style={[
                styles.compactAmount,
                { color: isPositive ? theme.colors.success : theme.colors.error }
              ]}>
                {isPositive ? '+' : ''}{amount.toLocaleString('fa-IR')} {currency}
              </Text>
              
              {showStatus && (
                <View style={[styles.compactStatus, { backgroundColor: statusColor + '20' }]}>
                  <View style={[styles.compactStatusDot, { backgroundColor: statusColor }]} />
                  <Text style={[styles.compactStatusText, { color: statusColor }]}>
                    {getStatusLabel()}
                  </Text>
                </View>
              )}
            </View>
          </View>
        </TouchableOpacity>
      </Animated.View>
    );
  }

  return (
    <Animated.View
      style={[
        styles.item,
        {
          transform: [
            { scale: scaleAnim },
            { translateX: slideAnim },
          ],
          borderLeftColor: typeColor,
        },
        props.style,
      ]}
    >
      <TouchableOpacity
        style={styles.touchable}
        onPress={handlePress}
        activeOpacity={0.7}
        onLongPress={() => handleSwipe('left')}
      >
        {/* آیکون و اطلاعات اصلی */}
        <View style={styles.mainContent}>
          <View style={[styles.iconContainer, { backgroundColor: typeColor + '20' }]}>
            <Text style={[styles.icon, { color: typeColor }]}>
              {getTypeIcon()}
            </Text>
          </View>
          
          <View style={styles.infoContainer}>
            <View style={styles.infoHeader}>
              <Text style={[styles.type, { color: theme.colors.text }]}>
                {getTypeLabel()}
              </Text>
              
              <Text style={[
                styles.amount,
                { color: isPositive ? theme.colors.success : theme.colors.error }
              ]}>
                {isPositive ? '+' : ''}{amount.toLocaleString('fa-IR')} {currency}
              </Text>
            </View>
            
            {description && (
              <Text style={[styles.description, { color: theme.colors.textSecondary }]} numberOfLines={1}>
                {description}
              </Text>
            )}
            
            <View style={styles.infoFooter}>
              {showDate && (
                <Text style={[styles.date, { color: theme.colors.textTertiary }]}>
                  {date} {time && ` • ${time}`}
                </Text>
              )}
              
              {showStatus && (
                <View style={styles.statusContainer}>
                  <View style={[styles.statusDot, { backgroundColor: statusColor }]} />
                  <Text style={[styles.statusText, { color: statusColor }]}>
                    {getStatusLabel()}
                  </Text>
                </View>
              )}
            </View>
          </View>
        </View>

        {/* اطلاعات اضافی */}
        {(fee || hash || from || to) && (
          <View style={styles.extraInfo}>
            {fee && (
              <View style={styles.extraItem}>
                <Text style={[styles.extraLabel, { color: theme.colors.textSecondary }]}>
                  کارمزد:
                </Text>
                <Text style={[styles.extraValue, { color: theme.colors.text }]}>
                  {fee} {currency}
                </Text>
              </View>
            )}
            
            {hash && (
              <View style={styles.extraItem}>
                <Text style={[styles.extraLabel, { color: theme.colors.textSecondary }]}>
                  هش:
                </Text>
                <Text style={[styles.extraValue, { color: theme.colors.textTertiary }]} numberOfLines={1}>
                  {hash.substring(0, 16)}...
                </Text>
              </View>
            )}
            
            {from && (
              <View style={styles.extraItem}>
                <Text style={[styles.extraLabel, { color: theme.colors.textSecondary }]}>
                  از:
                </Text>
                <Text style={[styles.extraValue, { color: theme.colors.text }]} numberOfLines={1}>
                  {from}
                </Text>
              </View>
            )}
            
            {to && (
              <View style={styles.extraItem}>
                <Text style={[styles.extraLabel, { color: theme.colors.textSecondary }]}>
                  به:
                </Text>
                <Text style={[styles.extraValue, { color: theme.colors.text }]} numberOfLines={1}>
                  {to}
                </Text>
              </View>
            )}
          </View>
        )}

        {/* دکمه‌های عملیات */}
        <View style={styles.actions}>
          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: theme.colors.primary + '20' }]}
            onPress={() => {}}
            activeOpacity={0.7}
          >
            <Text style={[styles.actionIcon, { color: theme.colors.primary }]}>
              🔍
            </Text>
            <Text style={[styles.actionText, { color: theme.colors.primary }]}>
              جزئیات
            </Text>
          </TouchableOpacity>
          
          {isPending && (
            <TouchableOpacity
              style={[styles.actionButton, { backgroundColor: theme.colors.success + '20' }]}
              onPress={() => {}}
              activeOpacity={0.7}
            >
              <Text style={[styles.actionIcon, { color: theme.colors.success }]}>
                ✓
              </Text>
              <Text style={[styles.actionText, { color: theme.colors.success }]}>
                تأیید
              </Text>
            </TouchableOpacity>
          )}
          
          {isFailed && (
            <TouchableOpacity
              style={[styles.actionButton, { backgroundColor: theme.colors.error + '20' }]}
              onPress={() => {}}
              activeOpacity={0.7}
            >
              <Text style={[styles.actionIcon, { color: theme.colors.error }]}>
                🔄
              </Text>
              <Text style={[styles.actionText, { color: theme.colors.error }]}>
                تلاش مجدد
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  item: {
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderRadius: 12,
    padding: 12,
    borderLeftWidth: 3,
    borderLeftColor: '#0066FF',
    marginBottom: 8,
  },
  touchable: {
    flex: 1,
  },
  mainContent: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 12,
  },
  icon: {
    fontSize: 20,
  },
  infoContainer: {
    flex: 1,
  },
  infoHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  type: {
    fontSize: 14,
    fontWeight: '700',
    flex: 1,
    marginLeft: 8,
  },
  amount: {
    fontSize: 16,
    fontWeight: '900',
  },
  description: {
    fontSize: 11,
    marginBottom: 6,
  },
  infoFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  date: {
    fontSize: 10,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  statusText: {
    fontSize: 10,
    fontWeight: '600',
  },
  extraInfo: {
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
    borderRadius: 8,
    padding: 8,
    marginBottom: 12,
    gap: 4,
  },
  extraItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  extraLabel: {
    fontSize: 10,
  },
  extraValue: {
    fontSize: 10,
    fontWeight: '600',
    flex: 1,
    marginLeft: 8,
    textAlign: 'left',
  },
  actions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    borderRadius: 8,
    gap: 6,
  },
  actionIcon: {
    fontSize: 12,
  },
  actionText: {
    fontSize: 10,
    fontWeight: '700',
  },
  compactItem: {
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderRadius: 8,
    padding: 8,
    marginBottom: 4,
  },
  compactTouchable: {
    flex: 1,
  },
  compactContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  compactIcon: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },
  compactIconText: {
    fontSize: 16,
  },
  compactInfo: {
    flex: 1,
  },
  compactType: {
    fontSize: 12,
    fontWeight: '700',
    marginBottom: 2,
  },
  compactDate: {
    fontSize: 9,
  },
  compactAmountContainer: {
    alignItems: 'flex-end',
  },
  compactAmount: {
    fontSize: 14,
    fontWeight: '900',
    marginBottom: 4,
  },
  compactStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    gap: 4,
  },
  compactStatusDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
  },
  compactStatusText: {
    fontSize: 8,
    fontWeight: '700',
  },
});

// انواع مختلف آیتم تراکنش
export const DepositTransaction = (props) => (
  <TransactionItem
    type="deposit"
    icon="📥"
    color="#10B981"
    {...props}
  />
);

export const WithdrawalTransaction = (props) => (
  <TransactionItem
    type="withdrawal"
    icon="📤"
    color="#EF4444"
    {...props}
  />
);

export const TransferTransaction = (props) => (
  <TransactionItem
    type="transfer"
    icon="🔄"
    color="#3b82f6"
    {...props}
  />
);

export const ExchangeTransaction = (props) => (
  <TransactionItem
    type="exchange"
    icon="💱"
    color="#8b5cf6"
    {...props}
  />
);

export const RewardTransaction = (props) => (
  <TransactionItem
    type="reward"
    icon="🎁"
    color="#F59E0B"
    {...props}
  />
);

export const ReferralTransaction = (props) => (
  <TransactionItem
    type="referral"
    icon="👥"
    color="#00D4AA"
    {...props}
  />
);

export const MiningTransaction = (props) => (
  <TransactionItem
    type="mining"
    icon="⛏️"
    color="#0066FF"
    {...props}
  />
);

export default TransactionItem;
