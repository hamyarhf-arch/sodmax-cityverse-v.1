// mobile/src/components/ui/Input.js
import React, { useState, forwardRef } from 'react';
import {
  View,
  TextInput,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
} from 'react-native';
import { useTheme } from '../../context/ThemeContext';

const Input = forwardRef(({
  label,
  placeholder,
  value,
  onChangeText,
  error,
  helperText,
  icon: Icon,
  rightIcon: RightIcon,
  onRightIconPress,
  secureTextEntry = false,
  disabled = false,
  multiline = false,
  numberOfLines = 1,
  keyboardType = 'default',
  autoCapitalize = 'none',
  autoCorrect = false,
  autoComplete = 'off',
  maxLength,
  style,
  inputStyle,
  labelStyle,
  errorStyle,
  helperStyle,
  iconColor,
  variant = 'default',
  size = 'medium',
  ...props
}, ref) => {
  const theme = useTheme();
  const [isFocused, setIsFocused] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [animation] = useState(new Animated.Value(0));

  const handleFocus = () => {
    setIsFocused(true);
    Animated.timing(animation, {
      toValue: 1,
      duration: 200,
      useNativeDriver: false,
    }).start();
  };

  const handleBlur = () => {
    setIsFocused(false);
    if (!value) {
      Animated.timing(animation, {
        toValue: 0,
        duration: 200,
        useNativeDriver: false,
      }).start();
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
    if (onRightIconPress) {
      onRightIconPress();
    }
  };

  const getVariantStyles = () => {
    switch (variant) {
      case 'primary':
        return {
          borderColor: isFocused ? theme.colors.primary : theme.colors.border,
          backgroundColor: disabled ? theme.colors.disabled : theme.colors.surface,
          borderWidth: 2,
        };
      case 'outline':
        return {
          borderColor: isFocused ? theme.colors.primary : theme.colors.border,
          backgroundColor: 'transparent',
          borderWidth: 1,
        };
      case 'filled':
        return {
          borderColor: 'transparent',
          backgroundColor: disabled ? theme.colors.disabled : theme.colors.surface,
        };
      case 'ghost':
        return {
          borderColor: 'transparent',
          backgroundColor: 'transparent',
          borderBottomWidth: 1,
          borderBottomColor: isFocused ? theme.colors.primary : theme.colors.border,
        };
      case 'success':
        return {
          borderColor: theme.colors.success,
          backgroundColor: theme.colors.surface,
          borderWidth: 1,
        };
      case 'error':
        return {
          borderColor: theme.colors.error,
          backgroundColor: theme.colors.surface,
          borderWidth: 1,
        };
      default:
        return {
          borderColor: isFocused ? theme.colors.primary : theme.colors.border,
          backgroundColor: disabled ? theme.colors.disabled : theme.colors.surface,
          borderWidth: 1,
        };
    }
  };

  const getSizeStyles = () => {
    switch (size) {
      case 'small':
        return {
          paddingVertical: 8,
          paddingHorizontal: 12,
          fontSize: 12,
        };
      case 'large':
        return {
          paddingVertical: 16,
          paddingHorizontal: 20,
          fontSize: 16,
        };
      case 'medium':
      default:
        return {
          paddingVertical: 12,
          paddingHorizontal: 16,
          fontSize: 14,
        };
    }
  };

  const variantStyles = getVariantStyles();
  const sizeStyles = getSizeStyles();

  const labelTop = animation.interpolate({
    inputRange: [0, 1],
    outputRange: [sizeStyles.paddingVertical, 0],
  });

  const labelFontSize = animation.interpolate({
    inputRange: [0, 1],
    outputRange: [sizeStyles.fontSize, 12],
  });

  const labelColor = animation.interpolate({
    inputRange: [0, 1],
    outputRange: [theme.colors.textSecondary, theme.colors.primary],
  });

  const renderIcon = () => {
    if (Icon) {
      if (typeof Icon === 'string') {
        return (
          <Text style={[styles.icon, { color: iconColor || theme.colors.textSecondary }]}>
            {Icon}
          </Text>
        );
      }
      return (
        <Icon
          size={20}
          color={iconColor || theme.colors.textSecondary}
          style={styles.icon}
        />
      );
    }
    return null;
  };

  const renderRightIcon = () => {
    if (secureTextEntry) {
      return (
        <TouchableOpacity onPress={togglePasswordVisibility} style={styles.rightIcon}>
          <Text style={[styles.rightIconText, { color: theme.colors.textSecondary }]}>
            {showPassword ? '👁️' : '👁️‍🗨️'}
          </Text>
        </TouchableOpacity>
      );
    }

    if (RightIcon) {
      if (typeof RightIcon === 'string') {
        return (
          <TouchableOpacity onPress={onRightIconPress} style={styles.rightIcon}>
            <Text style={[styles.rightIconText, { color: theme.colors.textSecondary }]}>
              {RightIcon}
            </Text>
          </TouchableOpacity>
        );
      }
      return (
        <TouchableOpacity onPress={onRightIconPress} style={styles.rightIcon}>
          <RightIcon
            size={20}
            color={theme.colors.textSecondary}
          />
        </TouchableOpacity>
      );
    }

    return null;
  };

  return (
    <View style={[styles.container, style]}>
      {label && (
        <Animated.Text
          style={[
            styles.label,
            {
              transform: [{ translateY: labelTop }],
              fontSize: labelFontSize,
              color: labelColor,
            },
            labelStyle,
          ]}
        >
          {label}
        </Animated.Text>
      )}

      <View
        style={[
          styles.inputContainer,
          variantStyles,
          error && { borderColor: theme.colors.error },
          disabled && { opacity: 0.6 },
        ]}
      >
        {renderIcon()}
        
        <TextInput
          ref={ref}
          style={[
            styles.input,
            sizeStyles,
            { color: theme.colors.text },
            multiline && { height: numberOfLines * 24, textAlignVertical: 'top' },
            inputStyle,
          ]}
          placeholder={placeholder}
          placeholderTextColor={theme.colors.textTertiary}
          value={value}
          onChangeText={onChangeText}
          onFocus={handleFocus}
          onBlur={handleBlur}
          secureTextEntry={secureTextEntry && !showPassword}
          editable={!disabled}
          multiline={multiline}
          numberOfLines={multiline ? numberOfLines : undefined}
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize}
          autoCorrect={autoCorrect}
          autoComplete={autoComplete}
          maxLength={maxLength}
          selectionColor={theme.colors.primary}
          {...props}
        />
        
        {renderRightIcon()}
      </View>

      {error && (
        <Text style={[styles.error, { color: theme.colors.error }, errorStyle]}>
          {error}
        </Text>
      )}

      {helperText && !error && (
        <Text style={[styles.helper, { color: theme.colors.textSecondary }, helperStyle]}>
          {helperText}
        </Text>
      )}
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  label: {
    position: 'absolute',
    right: 16,
    fontWeight: '600',
    zIndex: 1,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    overflow: 'hidden',
  },
  icon: {
    marginRight: 12,
    fontSize: 20,
  },
  input: {
    flex: 1,
    fontFamily: 'Vazirmatn',
    textAlign: 'right',
  },
  rightIcon: {
    paddingLeft: 12,
    paddingRight: 8,
  },
  rightIconText: {
    fontSize: 20,
  },
  error: {
    fontSize: 11,
    marginTop: 4,
    marginRight: 4,
  },
  helper: {
    fontSize: 11,
    marginTop: 4,
    marginRight: 4,
  },
});

// انواع مختلف Input
export const PrimaryInput = (props) => (
  <Input variant="primary" {...props} />
);

export const OutlineInput = (props) => (
  <Input variant="outline" {...props} />
);

export const FilledInput = (props) => (
  <Input variant="filled" {...props} />
);

export const GhostInput = (props) => (
  <Input variant="ghost" {...props} />
);

export const SuccessInput = (props) => (
  <Input variant="success" {...props} />
);

export const ErrorInput = (props) => (
  <Input variant="error" {...props} />
);

// Input مخصوص جستجو
export const SearchInput = ({ onSearch, ...props }) => {
  const [value, setValue] = useState('');

  const handleSearch = (text) => {
    setValue(text);
    if (onSearch) {
      onSearch(text);
    }
  };

  return (
    <Input
      placeholder="جستجو..."
      value={value}
      onChangeText={handleSearch}
      icon="🔍"
      variant="outline"
      {...props}
    />
  );
};

// Input مخصوص ایمیل
export const EmailInput = (props) => (
  <Input
    placeholder="example@email.com"
    keyboardType="email-address"
    autoCapitalize="none"
    autoComplete="email"
    icon="📧"
    {...props}
  />
);

// Input مخصوص شماره موبایل
export const PhoneInput = (props) => (
  <Input
    placeholder="09123456789"
    keyboardType="phone-pad"
    maxLength={11}
    icon="📱"
    {...props}
  />
);

// Input مخصوص رمز عبور
export const PasswordInput = ({ showToggle = true, ...props }) => (
  <Input
    placeholder="رمز عبور"
    secureTextEntry={showToggle}
    autoComplete="password"
    icon="🔒"
    {...props}
  />
);

export default Input;
