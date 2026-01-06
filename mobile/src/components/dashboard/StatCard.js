// mobile/src/components/dashboard/StatCard.js
import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Easing,
} from 'react-native';
import { useTheme } from '../../context/ThemeContext';

const StatCard = ({
  title,
  value,
  change,
  icon,
  color,
  onPress,
  loading = false,
  animated = true,
  formatValue,
  suffix = '',
  prefix = '',
  subtitle,
  trend,
  ...props
}) => {
  const theme = useTheme();
  const [animatedValue] = useState(new Animated.Value(0));
  const [scaleValue] = useState(new Animated.Value(1));
  const [displayValue, setDisplayValue] = useState('0');

  useEffect(() => {
    if (animated && value !== undefined) {
      // انیمیشن شمارش
      Animated.timing(animatedValue, {
        toValue: parseFloat(value) || 0,
        duration: 1500,
        easing: Easing.out(Easing.exp),
        useNativeDriver: false,
      }).start(({ finished }) => {
        if (finished) {
          setDisplayValue(formatValue ? formatValue(value) : value.toString());
        }
      });

      // انیمیشن پالس
      Animated.sequence([
        Animated.timing(scaleValue, {
          toValue: 1.05,
          duration: 200,
          easing: Easing.ease,
          useNativeDriver: true,
        }),
        Animated.timing(scaleValue, {
          toValue: 1,
          duration: 200,
          easing: Easing.ease,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      setDisplayValue(formatValue ? formatValue(value) : value?.toString() || '0');
    }
  }, [value, animated]);

  const animatedNumber = animatedValue.interpolate({
    inputRange: [0, parseFloat(value) || 0],
    outputRange: ['0', value?.toString() || '0'],
  });

  const getChangeColor = () => {
    if (!change) return theme.colors.textSecondary;
    return change > 0 ? theme.colors.success : theme.colors.error;
  };

  const getTrendIcon = () => {
    if (!trend) return null;
    
    switch (trend) {
      case 'up':
        return '📈';
      case 'down':
        return '📉';
      case 'stable':
        return '📊';
      case 'new':
        return '🆕';
      default:
        return '📊';
    }
  };

  const renderValue = () => {
    if (loading) {
      return (
        <View style={styles.loadingValue}>
          <View style={[styles.loadingBar, { backgroundColor: theme.colors.textSecondary + '30' }]} />
        </View>
      );
    }

    if (animated && value !== undefined) {
      return (
        <Animated.Text
          style={[
            styles.value,
            { 
              color: color || theme.colors.text,
              transform: [{ scale: scaleValue }],
            },
          ]}
        >
          {prefix}
          <Animated.Text>
            {animated ? animatedNumber : displayValue}
          </Animated.Text>
          {suffix}
        </Animated.Text>
      );
    }

    return (
      <Text style={[styles.value, { color: color || theme.colors.text }]}>
        {prefix}{displayValue}{suffix}
      </Text>
    );
  };

  const cardContent = (
    <View style={[styles.card, props.style]}>
      {/* هدر کارت */}
      <View style={styles.header}>
        <View style={styles.titleContainer}>
          {icon && (
            <View style={[styles.iconContainer, { backgroundColor: (color || theme.colors.primary) + '20' }]}>
              {typeof icon === 'string' ? (
                <Text style={[styles.iconText, { color: color || theme.colors.primary }]}>
                  {icon}
                </Text>
              ) : (
                icon
              )}
            </View>
          )}
          <Text style={[styles.title, { color: theme.colors.textSecondary }]}>
            {title}
          </Text>
        </View>
        
        {trend && (
          <Text style={styles.trendIcon}>
            {getTrendIcon()}
          </Text>
        )}
      </View>

      {/* مقدار */}
      <View style={styles.valueContainer}>
        {renderValue()}
        
        {subtitle && (
          <Text style={[styles.subtitle, { color: theme.colors.textTertiary }]}>
            {subtitle}
          </Text>
        )}
      </View>

      {/* تغییرات */}
      {(change !== undefined || trend) && (
        <View style={styles.footer}>
          {change !== undefined && (
            <View style={styles.changeContainer}>
              <Text style={[styles.changeText, { color: getChangeColor() }]}>
                {change > 0 ? '↑' : change < 0 ? '↓' : '↔'} {Math.abs(change)}%
              </Text>
              <Text style={[styles.changeLabel, { color: theme.colors.textTertiary }]}>
                از دوره قبل
              </Text>
            </View>
          )}
          
          <View style={styles.spacer} />
        </View>
      )}
    </View>
  );

  if (onPress) {
    return (
      <TouchableOpacity
        onPress={onPress}
        activeOpacity={0.7}
        style={styles.touchable}
      >
        {cardContent}
      </TouchableOpacity>
    );
  }

  return cardContent;
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    minHeight: 120,
  },
  touchable: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconContainer: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },
  iconText: {
    fontSize: 16,
  },
  title: {
    fontSize: 12,
    fontWeight: '600',
    flex: 1,
  },
  trendIcon: {
    fontSize: 16,
  },
  valueContainer: {
    marginBottom: 8,
  },
  value: {
    fontSize: 24,
    fontWeight: '900',
    textAlign: 'right',
    lineHeight: 32,
  },
  loadingValue: {
    height: 32,
    justifyContent: 'center',
  },
  loadingBar: {
    height: 24,
    width: '60%',
    borderRadius: 4,
    alignSelf: 'flex-end',
  },
  subtitle: {
    fontSize: 10,
    textAlign: 'right',
    marginTop: 2,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  changeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  changeText: {
    fontSize: 11,
    fontWeight: '700',
    marginLeft: 4,
  },
  changeLabel: {
    fontSize: 9,
  },
  spacer: {
    flex: 1,
  },
});

// انواع مختلف کارت آمار
export const PrimaryStatCard = (props) => (
  <StatCard color="#0066FF" icon="⚡" {...props} />
);

export const SuccessStatCard = (props) => (
  <StatCard color="#10B981" icon="💰" {...props} />
);

export const WarningStatCard = (props) => (
  <StatCard color="#F59E0B" icon="⚠️" {...props} />
);

export const AccentStatCard = (props) => (
  <StatCard color="#FF6B35" icon="🔥" {...props} />
);

export const SecondaryStatCard = (props) => (
  <StatCard color="#00D4AA" icon="📊" {...props} />
);

// کارت‌های خاص
export const BalanceStatCard = ({ currency = 'SOD', ...props }) => {
  const getIcon = () => {
    switch (currency) {
      case 'SOD':
        return '⚡';
      case 'تومان':
        return '💰';
      case 'USDT':
        return '💵';
      default:
        return '💳';
    }
  };

  return (
    <StatCard
      icon={getIcon()}
      suffix={` ${currency}`}
      {...props}
    />
  );
};

export const MiningStatCard = (props) => (
  <StatCard
    icon="⛏️"
    color="#0066FF"
    suffix=" SOD/ساعت"
    {...props}
  />
);

export const ReferralStatCard = (props) => (
  <StatCard
    icon="👥"
    color="#00D4AA"
    {...props}
  />
);

export const MissionStatCard = (props) => (
  <StatCard
    icon="🎯"
    color="#FF6B35"
    {...props}
  />
);

// کارت با نمودار کوچک
export const ChartStatCard = ({ data = [], ...props }) => {
  const maxValue = Math.max(...data, 1);
  const chartHeight = 20;

  return (
    <StatCard {...props}>
      <View style={styles.chartContainer}>
        {data.map((value, index) => (
          <View
            key={index}
            style={[
              styles.chartBar,
              {
                height: (value / maxValue) * chartHeight,
                backgroundColor: props.color || '#0066FF',
                marginLeft: 2,
              },
            ]}
          />
        ))}
      </View>
    </StatCard>
  );
};

const extendedStyles = StyleSheet.create({
  chartContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    height: 20,
    marginTop: 8,
  },
  chartBar: {
    flex: 1,
    borderRadius: 2,
  },
});

export default StatCard;
