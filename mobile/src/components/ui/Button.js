import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  View,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/FontAwesome5';

// Constants
import Colors from '../../constants/Colors';
import Layout from '../../constants/Layout';

const Button = ({
  title,
  onPress,
  type = 'primary',
  size = 'medium',
  disabled = false,
  loading = false,
  style,
  textStyle,
  icon,
  iconPosition = 'left',
  iconSize = 16,
  gradient,
  children,
  ...props
}) => {
  const getButtonStyle = () => {
    const baseStyle = styles.button;
    const sizeStyle = styles[size];
    const typeStyle = styles[type];
    const disabledStyle = disabled ? styles.disabled : {};
    
    return [baseStyle, sizeStyle, typeStyle, disabledStyle, style];
  };

  const getTextStyle = () => {
    const baseStyle = styles.text;
    const sizeStyle = styles[`${size}Text`];
    const typeStyle = styles[`${type}Text`];
    const disabledStyle = disabled ? styles.disabledText : {};
    
    return [baseStyle, sizeStyle, typeStyle, disabledStyle, textStyle];
  };

  const renderIcon = () => {
    if (!icon) return null;
    
    return (
      <Icon
        name={icon}
        size={iconSize}
        color={disabled ? Colors.textTertiary : styles[`${type}Text`].color}
        style={iconPosition === 'left' ? styles.iconLeft : styles.iconRight}
      />
    );
  };

  const renderContent = () => {
    if (loading) {
      return (
        <ActivityIndicator
          size="small"
          color={type === 'outline' || type === 'ghost' ? Colors.primary : Colors.white}
        />
      );
    }

    return (
      <>
        {iconPosition === 'left' && renderIcon()}
        {children || <Text style={getTextStyle()}>{title}</Text>}
        {iconPosition === 'right' && renderIcon()}
      </>
    );
  };

  const renderButton = () => {
    const buttonContent = (
      <View style={styles.contentContainer}>
        {renderContent()}
      </View>
    );

    if (gradient && type !== 'outline' && type !== 'ghost') {
      return (
        <LinearGradient
          colors={gradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={getButtonStyle()}
        >
          {buttonContent}
        </LinearGradient>
      );
    }

    return buttonContent;
  };

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || loading}
      style={getButtonStyle()}
      activeOpacity={0.8}
      {...props}
    >
      {renderButton()}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: Layout.borderRadius.lg,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  contentContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  
  // Sizes
  small: {
    paddingVertical: Layout.spacing.sm,
    paddingHorizontal: Layout.spacing.lg,
    minHeight: Layout.buttonSize.sm,
  },
  medium: {
    paddingVertical: Layout.spacing.md,
    paddingHorizontal: Layout.spacing.xl,
    minHeight: Layout.buttonSize.md,
  },
  large: {
    paddingVertical: Layout.spacing.lg,
    paddingHorizontal: Layout.spacing.xxl,
    minHeight: Layout.buttonSize.lg,
  },
  
  // Types
  primary: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  secondary: {
    backgroundColor: Colors.secondary,
    borderColor: Colors.secondary,
  },
  accent: {
    backgroundColor: Colors.accent,
    borderColor: Colors.accent,
  },
  success: {
    backgroundColor: Colors.success,
    borderColor: Colors.success,
  },
  error: {
    backgroundColor: Colors.error,
    borderColor: Colors.error,
  },
  warning: {
    backgroundColor: Colors.warning,
    borderColor: Colors.warning,
  },
  outline: {
    backgroundColor: 'transparent',
    borderColor: Colors.primary,
  },
  ghost: {
    backgroundColor: 'transparent',
    borderWidth: 0,
  },
  premium: {
    backgroundColor: Colors.premium,
    borderColor: Colors.premiumDark,
  },
  
  // Disabled state
  disabled: {
    opacity: 0.6,
  },
  
  // Text styles
  text: {
    fontWeight: '700',
    textAlign: 'center',
  },
  smallText: {
    fontSize: Layout.fontSize.xs,
  },
  mediumText: {
    fontSize: Layout.fontSize.sm,
  },
  largeText: {
    fontSize: Layout.fontSize.md,
  },
  
  // Text colors by type
  primaryText: {
    color: Colors.white,
  },
  secondaryText: {
    color: Colors.white,
  },
  accentText: {
    color: Colors.white,
  },
  successText: {
    color: Colors.white,
  },
  errorText: {
    color: Colors.white,
  },
  warningText: {
    color: Colors.white,
  },
  outlineText: {
    color: Colors.primary,
  },
  ghostText: {
    color: Colors.primary,
  },
  premiumText: {
    color: Colors.black,
  },
  disabledText: {
    color: Colors.textTertiary,
  },
  
  // Icon styles
  iconLeft: {
    marginRight: Layout.spacing.sm,
  },
  iconRight: {
    marginLeft: Layout.spacing.sm,
  },
  
  // Shadow
  shadow: Layout.shadow.md,
});

export default Button;
