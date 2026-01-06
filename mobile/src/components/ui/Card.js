// mobile/src/components/ui/Card.js
import React from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  TouchableWithoutFeedback,
} from 'react-native';
import { useTheme } from '../../context/ThemeContext';

const Card = ({
  children,
  style,
  onPress,
  variant = 'default',
  elevation = 2,
  padding = 'medium',
  borderRadius = 'medium',
  border = false,
  shadow = true,
  ...props
}) => {
  const theme = useTheme();
  
  const getVariantStyles = () => {
    switch (variant) {
      case 'primary':
        return {
          backgroundColor: theme.colors.primary + '15', // 15% opacity
          borderColor: theme.colors.primary,
        };
      case 'secondary':
        return {
          backgroundColor: theme.colors.surface,
          borderColor: theme.colors.border,
        };
      case 'success':
        return {
          backgroundColor: theme.colors.success + '15',
          borderColor: theme.colors.success,
        };
      case 'warning':
        return {
          backgroundColor: theme.colors.warning + '15',
          borderColor: theme.colors.warning,
        };
      case 'error':
        return {
          backgroundColor: theme.colors.error + '15',
          borderColor: theme.colors.error,
        };
      case 'glass':
        return {
          backgroundColor: 'rgba(255, 255, 255, 0.1)',
          borderColor: 'rgba(255, 255, 255, 0.2)',
          backdropFilter: 'blur(10px)',
        };
      case 'dark':
        return {
          backgroundColor: theme.colors.surfaceDark,
          borderColor: theme.colors.borderDark,
        };
      default:
        return {
          backgroundColor: theme.colors.surface,
          borderColor: 'transparent',
        };
    }
  };

  const getPadding = () => {
    switch (padding) {
      case 'none':
        return 0;
      case 'small':
        return 12;
      case 'large':
        return 24;
      case 'medium':
      default:
        return 16;
    }
  };

  const getBorderRadius = () => {
    switch (borderRadius) {
      case 'none':
        return 0;
      case 'small':
        return 8;
      case 'large':
        return 20;
      case 'xlarge':
        return 28;
      case 'medium':
      default:
        return 12;
    }
  };

  const getShadow = () => {
    if (!shadow) return {};
    
    switch (elevation) {
      case 0:
        return {};
      case 1:
        return {
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 1 },
          shadowOpacity: 0.05,
          shadowRadius: 2,
          elevation: 1,
        };
      case 2:
        return {
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.1,
          shadowRadius: 4,
          elevation: 2,
        };
      case 3:
        return {
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.15,
          shadowRadius: 8,
          elevation: 3,
        };
      case 4:
        return {
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 8 },
          shadowOpacity: 0.2,
          shadowRadius: 16,
          elevation: 4,
        };
      case 5:
        return {
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 16 },
          shadowOpacity: 0.25,
          shadowRadius: 24,
          elevation: 5,
        };
      default:
        return {};
    }
  };

  const variantStyles = getVariantStyles();
  const paddingValue = getPadding();
  const borderRadiusValue = getBorderRadius();
  const shadowStyles = getShadow();

  const cardStyles = [
    styles.card,
    variantStyles,
    {
      padding: paddingValue,
      borderRadius: borderRadiusValue,
    },
    border && {
      borderWidth: 1,
    },
    shadowStyles,
    style,
  ];

  const renderContent = () => (
    <View style={cardStyles} {...props}>
      {children}
    </View>
  );

  if (onPress) {
    return (
      <TouchableOpacity onPress={onPress} activeOpacity={0.8}>
        {renderContent()}
      </TouchableOpacity>
    );
  }

  return renderContent();
};

const styles = StyleSheet.create({
  card: {
    overflow: 'hidden',
  },
});

// انواع مختلف کارت
export const PrimaryCard = (props) => (
  <Card variant="primary" {...props} />
);

export const SecondaryCard = (props) => (
  <Card variant="secondary" {...props} />
);

export const SuccessCard = (props) => (
  <Card variant="success" {...props} />
);

export const WarningCard = (props) => (
  <Card variant="warning" {...props} />
);

export const ErrorCard = (props) => (
  <Card variant="error" {...props} />
);

export const GlassCard = (props) => (
  <Card variant="glass" {...props} />
);

export const DarkCard = (props) => (
  <Card variant="dark" {...props} />
);

// کارت با هدر
export const CardWithHeader = ({ 
  title, 
  subtitle, 
  icon, 
  action, 
  children, 
  ...props 
}) => {
  const theme = useTheme();
  
  return (
    <Card {...props}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          {icon && (
            <View style={[styles.iconContainer, { backgroundColor: theme.colors.primary + '20' }]}>
              {icon}
            </View>
          )}
          <View style={styles.headerText}>
            {title && (
              <Text style={[styles.title, { color: theme.colors.text }]}>
                {title}
              </Text>
            )}
            {subtitle && (
              <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>
                {subtitle}
              </Text>
            )}
          </View>
        </View>
        {action && (
          <View style={styles.headerAction}>
            {action}
          </View>
        )}
      </View>
      {children && (
        <View style={styles.content}>
          {children}
        </View>
      )}
    </Card>
  );
};

// کارت با فوتر
export const CardWithFooter = ({ 
  footer, 
  children, 
  ...props 
}) => {
  const theme = useTheme();
  
  return (
    <Card {...props}>
      <View style={styles.content}>
        {children}
      </View>
      {footer && (
        <View style={[styles.footer, { borderTopColor: theme.colors.border }]}>
          {footer}
        </View>
      )}
    </Card>
  );
};

// کارت آمار
export const StatCard = ({ 
  title, 
  value, 
  change, 
  icon, 
  color, 
  ...props 
}) => {
  const theme = useTheme();
  const cardColor = color || theme.colors.primary;
  
  return (
    <Card 
      style={[styles.statCard, { borderLeftColor: cardColor, borderLeftWidth: 4 }]} 
      {...props}
    >
      <View style={styles.statHeader}>
        {icon && (
          <View style={[styles.statIcon, { backgroundColor: cardColor + '20' }]}>
            {icon}
          </View>
        )}
        <Text style={[styles.statTitle, { color: theme.colors.textSecondary }]}>
          {title}
        </Text>
      </View>
      <Text style={[styles.statValue, { color: theme.colors.text }]}>
        {value}
      </Text>
      {change !== undefined && (
        <View style={styles.statChange}>
          <Text style={[
            styles.changeText, 
            { color: change >= 0 ? theme.colors.success : theme.colors.error }
          ]}>
            {change >= 0 ? '↑' : '↓'} {Math.abs(change)}%
          </Text>
        </View>
      )}
    </Card>
  );
};

const cardStyles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 12,
  },
  headerText: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 2,
  },
  subtitle: {
    fontSize: 12,
  },
  headerAction: {
    marginRight: 4,
  },
  content: {
    // محتوای اصلی
  },
  footer: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
  },
  statCard: {
    padding: 16,
  },
  statHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  statIcon: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },
  statTitle: {
    fontSize: 12,
    flex: 1,
  },
  statValue: {
    fontSize: 24,
    fontWeight: '900',
    marginBottom: 4,
  },
  statChange: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  changeText: {
    fontSize: 11,
    fontWeight: '700',
  },
});

export default Card;
