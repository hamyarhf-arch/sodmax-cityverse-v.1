// mobile/src/components/wallet/BalanceCard.js
import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Easing,
} from 'react-native';
import { useTheme } from '../../context/ThemeContext';

const BalanceCard = ({
  title,
  amount,
  formattedAmount,
  icon,
  color,
  currency,
  onPress,
  selected = false,
  showChange = true,
  change = 0,
  trend,
  loading = false,
  compact = false,
  ...props
}) => {
  const theme = useTheme();
  const [scaleAnim] = useState(new Animated.Value(1));
  const [pulseAnim] = useState(new Animated.Value(1));
  const [amountAnim] = useState(new Animated.Value(0));
  const [displayAmount, setDisplayAmount] = useState('0');

  useEffect(() => {
    if (amount !== undefined) {
      // انیمیشن شمارش مقدار
      Animated.timing(amountAnim, {
        toValue: amount || 0,
        duration: 1500,
        easing: Easing.out(Easing.exp),
        useNativeDriver: false,
      }).start(({ finished }) => {
        if (finished) {
          setDisplayAmount(formattedAmount || amount?.toString() || '0');
        }
      });

      // انیمیشن پالس برای تغییرات
      if (change !== 0) {
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.1,
            duration: 300,
            easing: Easing.ease,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 300,
            easing: Easing.ease,
            useNativeDriver: true,
          }),
        ]).start();
      }
    }
  }, [amount, change]);

  const getCurrencyIcon = () => {
    if (icon) return icon;
    
    switch (currency) {
      case 'SOD':
        return '⚡';
      case 'تومان':
        return '💰';
      case 'USDT':
        return '💵';
      case 'USD':
        return '💲';
      case 'EUR':
        return '💶';
      case 'BTC':
        return '₿';
      case 'ETH':
        return 'Ξ';
      default:
        return '💳';
    }
  };

  const getCurrencyColor = () => {
    if (color) return color;
    
    switch (currency) {
      case 'SOD':
        return '#0066FF';
      case 'تومان':
        return '#10B981';
      case 'USDT':
        return '#3b82f6';
      case 'USD':
        return '#22c55e';
      case 'EUR':
        return '#6366f1';
      case 'BTC':
        return '#f59e0b';
      case 'ETH':
        return '#8b5cf6';
      default:
        return theme.colors.primary;
    }
  };

  const getChangeColor = () => {
    if (change > 0) return theme.colors.success;
    if (change < 0) return theme.colors.error;
    return theme.colors.textSecondary;
  };

  const getTrendIcon = () => {
    if (trend === 'up') return '📈';
    if (trend === 'down') return '📉';
    if (trend === 'stable') return '📊';
    if (trend === 'new') return '🆕';
    return '';
  };

  const handlePress = () => {
    if (onPress) {
      // انیمیشن کلیک
      Animated.sequence([
        Animated.timing(scaleAnim, {
          toValue: 0.95,
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

      onPress();
    }
  };

  const animatedAmount = amountAnim.interpolate({
    inputRange: [0, amount || 0],
    outputRange: ['0', amount?.toString() || '0'],
  });

  const cardColor = getCurrencyColor();

  if (compact) {
    return (
      <TouchableOpacity
        style={[
          styles.compactCard,
          selected && {
            borderColor: cardColor,
            backgroundColor: cardColor + '10',
          },
          props.style,
        ]}
        onPress={handlePress}
        activeOpacity={0.7}
      >
        <View style={styles.compactContent}>
          <View style={[styles.compactIcon, { backgroundColor: cardColor + '20' }]}>
            <Text style={[styles.compactIconText, { color: cardColor }]}>
              {getCurrencyIcon()}
            </Text>
          </View>
          
          <View style={styles.compactInfo}>
            <Text style={[styles.compactTitle, { color: theme.colors.textSecondary }]}>
              {title}
            </Text>
            
            {loading ? (
              <View style={styles.loadingAmount}>
                <View style={[styles.loadingBar, { backgroundColor: theme.colors.textSecondary + '30' }]} />
              </View>
            ) : (
              <Animated.Text
                style={[
                  styles.compactAmount,
                  { color: theme.colors.text },
                  selected && { color: cardColor },
                  { transform: [{ scale: pulseAnim }] },
                ]}
              >
                {formattedAmount || amount?.toLocaleString('fa-IR') || '0'}
              </Animated.Text>
            )}
          </View>
        </View>
      </TouchableOpacity>
    );
  }

  return (
    <Animated.View
      style={[
        styles.card,
        selected && {
          borderColor: cardColor,
          backgroundColor: cardColor + '10',
          transform: [{ scale: scaleAnim }],
        },
        props.style,
      ]}
    >
      <TouchableOpacity
        style={styles.touchable}
        onPress={handlePress}
        activeOpacity={0.8}
      >
        {/* هدر کارت */}
        <View style={styles.header}>
          <View style={styles.titleContainer}>
            <View style={[styles.iconContainer, { backgroundColor: cardColor + '20' }]}>
              <Text style={[styles.icon, { color: cardColor }]}>
                {getCurrencyIcon()}
              </Text>
            </View>
            
            <View style={styles.titleInfo}>
              <Text style={[styles.title, { color: theme.colors.text }]}>
                {title}
              </Text>
              {currency && (
                <Text style={[styles.currency, { color: theme.colors.textSecondary }]}>
                  {currency}
                </Text>
              )}
            </View>
          </View>
          
          {trend && (
            <Text style={styles.trendIcon}>
              {getTrendIcon()}
            </Text>
          )}
        </View>

        {/* مقدار */}
        <View style={styles.amountContainer}>
          {loading ? (
            <View style={styles.loadingAmount}>
              <View style={[styles.loadingBar, { backgroundColor: theme.colors.textSecondary + '30' }]} />
              <View style={[styles.loadingSubBar, { backgroundColor: theme.colors.textSecondary + '20' }]} />
            </View>
          ) : (
            <Animated.Text
              style={[
                styles.amount,
                { color: theme.colors.text },
                selected && { color: cardColor },
                { transform: [{ scale: pulseAnim }] },
              ]}
            >
              {formattedAmount ? (
                formattedAmount
              ) : (
                <>
                  <Animated.Text>
                    {animatedAmount}
                  </Animated.Text>
                  {currency && ` ${currency}`}
                </>
              )}
            </Animated.Text>
          )}
          
          {selected && (
            <View style={[styles.selectedBadge, { backgroundColor: cardColor }]}>
              <Text style={styles.selectedBadgeText}>✓</Text>
            </View>
          )}
        </View>

        {/* تغییرات و اطلاعات اضافی */}
        {(showChange && change !== undefined) && (
          <View style={styles.footer}>
            <View style={styles.changeContainer}>
              <Text style={[styles.changeText, { color: getChangeColor() }]}>
                {change > 0 ? '↑' : change < 0 ? '↓' : '↔'} {Math.abs(change)}%
              </Text>
              <Text style={[styles.changeLabel, { color: theme.colors.textTertiary }]}>
                از دیروز
              </Text>
            </View>
            
            <View style={styles.actions}>
              <TouchableOpacity
                style={[styles.actionButton, { backgroundColor: cardColor + '20' }]}
                onPress={() => {}}
                activeOpacity={0.7}
              >
                <Text style={[styles.actionIcon, { color: cardColor }]}>📤</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.actionButton, { backgroundColor: cardColor + '20' }]}
                onPress={() => {}}
                activeOpacity={0.7}
              >
                <Text style={[styles.actionIcon, { color: cardColor }]}>📥</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 16,
    padding: 16,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    marginBottom: 12,
  },
  touchable: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
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
  titleInfo: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 2,
  },
  currency: {
    fontSize: 12,
  },
  trendIcon: {
    fontSize: 20,
    marginTop: 4,
  },
  amountContainer: {
    position: 'relative',
    marginBottom: 16,
  },
  amount: {
    fontSize: 28,
    fontWeight: '900',
    textAlign: 'right',
    lineHeight: 36,
  },
  loadingAmount: {
    height: 36,
    justifyContent: 'center',
  },
  loadingBar: {
    height: 28,
    width: '70%',
    borderRadius: 6,
    alignSelf: 'flex-end',
  },
  loadingSubBar: {
    height: 12,
    width: '40%',
    borderRadius: 4,
    alignSelf: 'flex-end',
    marginTop: 4,
  },
  selectedBadge: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  selectedBadgeText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
  },
  changeContainer: {
    alignItems: 'flex-start',
  },
  changeText: {
    fontSize: 14,
    fontWeight: '900',
    marginBottom: 2,
  },
  changeLabel: {
    fontSize: 10,
  },
  actions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionIcon: {
    fontSize: 16,
  },
  compactCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    padding: 12,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    marginBottom: 8,
  },
  compactContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  compactIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },
  compactIconText: {
    fontSize: 20,
  },
  compactInfo: {
    flex: 1,
    alignItems: 'flex-end',
  },
  compactTitle: {
    fontSize: 11,
    marginBottom: 4,
  },
  compactAmount: {
    fontSize: 18,
    fontWeight: '900',
  },
});

// انواع مختلف کارت موجودی
export const SodBalanceCard = (props) => (
  <BalanceCard
    currency="SOD"
    icon="⚡"
    color="#0066FF"
    {...props}
  />
);

export const TomanBalanceCard = (props) => (
  <BalanceCard
    currency="تومان"
    icon="💰"
    color="#10B981"
    {...props}
  />
);

export const UsdtBalanceCard = (props) => (
  <BalanceCard
    currency="USDT"
    icon="💵"
    color="#3b82f6"
    {...props}
  />
);

export const BtcBalanceCard = (props) => (
  <BalanceCard
    currency="BTC"
    icon="₿"
    color="#f59e0b"
    {...props}
  />
);

export const EthBalanceCard = (props) => (
  <BalanceCard
    currency="ETH"
    icon="Ξ"
    color="#8b5cf6"
    {...props}
  />
);

// کارت موجودی با نمودار
export const ChartBalanceCard = ({ chartData = [], ...props }) => {
  const maxValue = Math.max(...chartData, 1);
  const chartHeight = 16;

  return (
    <BalanceCard {...props}>
      <View style={chartStyles.chartContainer}>
        {chartData.map((value, index) => (
          <View
            key={index}
            style={[
              chartStyles.chartBar,
              {
                height: (value / maxValue) * chartHeight,
                backgroundColor: props.color || '#0066FF',
                marginLeft: 1,
              },
            ]}
          />
        ))}
      </View>
    </BalanceCard>
  );
};

const chartStyles = StyleSheet.create({
  chartContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    height: 16,
    marginTop: 8,
  },
  chartBar: {
    flex: 1,
    borderRadius: 1,
  },
});

export default BalanceCard;
