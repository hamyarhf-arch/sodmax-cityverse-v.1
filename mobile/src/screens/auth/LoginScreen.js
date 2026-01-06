import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Image,
  Alert,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/FontAwesome5';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { BlurView } from '@react-native-community/blur';

// Context
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';

// Components
import Button from '../../components/ui/Button';
import LoadingSpinner from '../../components/ui/LoadingSpinner';

// Constants
import Colors from '../../constants/Colors';
import Layout from '../../constants/Layout';

const LoginScreen = ({ navigation }) => {
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  const { login } = useAuth();
  const toast = useToast();

  const handleLogin = async () => {
    if (!phone.trim()) {
      toast.error('لطفاً شماره موبایل خود را وارد کنید');
      return;
    }

    if (!password.trim()) {
      toast.error('لطفاً رمز عبور خود را وارد کنید');
      return;
    }

    if (phone.length !== 11 || !phone.startsWith('09')) {
      toast.error('لطفاً شماره موبایل معتبر وارد کنید');
      return;
    }

    setIsLoading(true);

    try {
      await login(phone, password, rememberMe);
      toast.success('ورود موفق', 'خوش آمدید!');
    } catch (error) {
      console.error('Login error:', error);
      toast.error('خطا در ورود', error.message || 'اطلاعات ورود نامعتبر است');
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = () => {
    Alert.prompt(
      'بازیابی رمز عبور',
      'لطفاً شماره موبایل خود را وارد کنید:',
      [
        {
          text: 'انصراف',
          style: 'cancel',
        },
        {
          text: 'ارسال کد',
          onPress: (phoneNumber) => {
            if (phoneNumber && phoneNumber.length === 11 && phoneNumber.startsWith('09')) {
              toast.info('کد تأیید ارسال شد', 'کد به شماره شما پیامک شد');
              navigation.navigate('VerifyCode', { phone: phoneNumber });
            } else {
              toast.error('شماره موبایل نامعتبر');
            }
          },
        },
      ],
      'plain-text',
      phone
    );
  };

  const handleQuickLogin = () => {
    setPhone('09123456789');
    setPassword('123456');
    toast.info('اطلاعات تست وارد شد', 'می‌توانید دکمه ورود را بزنید');
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <LinearGradient
        colors={Colors.gradientDark}
        style={styles.background}
      />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Logo Header */}
        <View style={styles.logoContainer}>
          <LinearGradient
            colors={Colors.gradientPrimary}
            style={styles.logoBackground}
          >
            <Text style={styles.logoText}>⚡</Text>
          </LinearGradient>
          <View style={styles.logoTextContainer}>
            <Text style={styles.appName}>SODmAX</Text>
            <Text style={styles.appSubtitle}>CityVerse Pro</Text>
          </View>
        </View>

        {/* Auth Card */}
        <BlurView
          style={styles.blurView}
          blurType="dark"
          blurAmount={20}
          reducedTransparencyFallbackColor={Colors.bgSurface}
        >
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Text style={styles.cardTitle}>ورود به حساب</Text>
              <Text style={styles.cardSubtitle}>
                برای ادامه، اطلاعات حساب خود را وارد کنید
              </Text>
            </View>

            {/* Phone Input */}
            <View style={styles.inputContainer}>
              <View style={styles.inputLabelRow}>
                <Icon name="phone-alt" size={14} color={Colors.textSecondary} />
                <Text style={styles.inputLabel}>شماره موبایل</Text>
              </View>
              <View style={styles.inputWrapper}>
                <Text style={styles.prefix}>+98</Text>
                <TextInput
                  style={styles.input}
                  placeholder="9123456789"
                  placeholderTextColor={Colors.textTertiary}
                  value={phone}
                  onChangeText={setPhone}
                  keyboardType="phone-pad"
                  maxLength={11}
                  autoCapitalize="none"
                  editable={!isLoading}
                />
                {phone ? (
                  <TouchableOpacity
                    onPress={() => setPhone('')}
                    style={styles.clearButton}
                  >
                    <Ionicons name="close-circle" size={20} color={Colors.textTertiary} />
                  </TouchableOpacity>
                ) : null}
              </View>
            </View>

            {/* Password Input */}
            <View style={styles.inputContainer}>
              <View style={styles.inputLabelRow}>
                <Icon name="lock" size={14} color={Colors.textSecondary} />
                <Text style={styles.inputLabel}>رمز عبور</Text>
              </View>
              <View style={styles.inputWrapper}>
                <TextInput
                  style={[styles.input, { flex: 1 }]}
                  placeholder="رمز عبور خود را وارد کنید"
                  placeholderTextColor={Colors.textTertiary}
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                  editable={!isLoading}
                />
                <TouchableOpacity
                  onPress={() => setShowPassword(!showPassword)}
                  style={styles.eyeButton}
                >
                  <Icon
                    name={showPassword ? 'eye-slash' : 'eye'}
                    size={16}
                    color={Colors.textTertiary}
                  />
                </TouchableOpacity>
              </View>
            </View>

            {/* Remember Me & Forgot Password */}
            <View style={styles.rememberContainer}>
              <TouchableOpacity
                style={styles.rememberRow}
                onPress={() => setRememberMe(!rememberMe)}
                disabled={isLoading}
              >
                <View style={styles.checkbox}>
                  {rememberMe && (
                    <Ionicons name="checkmark" size={16} color={Colors.primary} />
                  )}
                </View>
                <Text style={styles.rememberText}>مرا به خاطر بسپار</Text>
              </TouchableOpacity>

              <TouchableOpacity onPress={handleForgotPassword} disabled={isLoading}>
                <Text style={styles.forgotText}>رمز عبور را فراموش کرده‌اید؟</Text>
              </TouchableOpacity>
            </View>

            {/* Login Button */}
            <Button
              title="ورود به حساب"
              onPress={handleLogin}
              loading={isLoading}
              style={styles.loginButton}
              gradient={Colors.gradientPrimary}
              icon="sign-in-alt"
            />

            {/* Divider */}
            <View style={styles.dividerContainer}>
              <View style={styles.divider} />
              <Text style={styles.dividerText}>یا</Text>
              <View style={styles.divider} />
            </View>

            {/* Register Button */}
            <Button
              title="ثبت‌نام در SODmAX"
              onPress={() => navigation.navigate('Register')}
              style={styles.registerButton}
              type="outline"
              icon="user-plus"
              disabled={isLoading}
            />

            {/* Quick Login (for testing) */}
            {__DEV__ && (
              <TouchableOpacity
                style={styles.quickLoginButton}
                onPress={handleQuickLogin}
                disabled={isLoading}
              >
                <Text style={styles.quickLoginText}>ورود سریع (تست)</Text>
              </TouchableOpacity>
            )}

            {/* Terms */}
            <Text style={styles.termsText}>
              با ورود به حساب،{' '}
              <Text style={styles.termsLink}>قوانین و مقررات</Text> و{' '}
              <Text style={styles.termsLink}>حریم خصوصی</Text>{' '}
              SODmAX CityVerse را می‌پذیرید.
            </Text>
          </View>
        </BlurView>

        {/* App Info */}
        <View style={styles.infoContainer}>
          <Text style={styles.infoText}>نسخه ۲.۰.۰ | Pro Edition</Text>
          <Text style={styles.copyrightText}>© ۲۰۲۴ تمامی حقوق محفوظ است</Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.bgPrimary,
  },
  background: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
  },
  scrollContent: {
    flexGrow: 1,
    padding: Layout.spacing.lg,
    paddingTop: Layout.spacing.xxl,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: Layout.spacing.xxl,
  },
  logoBackground: {
    width: 80,
    height: 80,
    borderRadius: Layout.borderRadius.lg,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Layout.spacing.md,
    ...Layout.shadow.md,
  },
  logoText: {
    fontSize: 40,
  },
  logoTextContainer: {
    alignItems: 'center',
  },
  appName: {
    fontSize: Layout.fontSize.xxl,
    fontWeight: '900',
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  appSubtitle: {
    fontSize: Layout.fontSize.xs,
    color: Colors.textTertiary,
    letterSpacing: 1,
  },
  blurView: {
    borderRadius: Layout.borderRadius.xl,
    overflow: 'hidden',
    marginBottom: Layout.spacing.xl,
  },
  card: {
    padding: Layout.spacing.xl,
    backgroundColor: Colors.bgSurface + 'CC',
  },
  cardHeader: {
    alignItems: 'center',
    marginBottom: Layout.spacing.xl,
  },
  cardTitle: {
    fontSize: Layout.fontSize.xl,
    fontWeight: '900',
    color: Colors.textPrimary,
    marginBottom: Layout.spacing.xs,
  },
  cardSubtitle: {
    fontSize: Layout.fontSize.xs,
    color: Colors.textTertiary,
    textAlign: 'center',
  },
  inputContainer: {
    marginBottom: Layout.spacing.lg,
  },
  inputLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Layout.spacing.xs,
    gap: Layout.spacing.xs,
  },
  inputLabel: {
    fontSize: Layout.fontSize.xxs,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: Layout.borderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    overflow: 'hidden',
  },
  prefix: {
    paddingHorizontal: Layout.spacing.md,
    color: Colors.textTertiary,
    fontSize: Layout.fontSize.sm,
    borderRightWidth: 1,
    borderRightColor: Colors.borderLight,
  },
  input: {
    flex: 1,
    padding: Layout.spacing.md,
    color: Colors.textPrimary,
    fontSize: Layout.fontSize.sm,
    fontFamily: Layout.isIOS ? 'Vazirmatn' : 'Vazirmatn-Regular',
  },
  clearButton: {
    padding: Layout.spacing.sm,
  },
  eyeButton: {
    padding: Layout.spacing.md,
    paddingLeft: Layout.spacing.sm,
  },
  rememberContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Layout.spacing.xl,
  },
  rememberRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Layout.spacing.sm,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: Layout.borderRadius.xs,
    borderWidth: 2,
    borderColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  rememberText: {
    fontSize: Layout.fontSize.xxs,
    color: Colors.textSecondary,
  },
  forgotText: {
    fontSize: Layout.fontSize.xxs,
    color: Colors.primary,
    fontWeight: '600',
  },
  loginButton: {
    marginBottom: Layout.spacing.lg,
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: Layout.spacing.lg,
  },
  divider: {
    flex: 1,
    height: 1,
    backgroundColor: Colors.borderLight,
  },
  dividerText: {
    paddingHorizontal: Layout.spacing.md,
    color: Colors.textTertiary,
    fontSize: Layout.fontSize.xs,
  },
  registerButton: {
    marginBottom: Layout.spacing.lg,
  },
  quickLoginButton: {
    padding: Layout.spacing.sm,
    alignItems: 'center',
    marginBottom: Layout.spacing.md,
  },
  quickLoginText: {
    fontSize: Layout.fontSize.xxs,
    color: Colors.textTertiary,
    textDecorationLine: 'underline',
  },
  termsText: {
    fontSize: Layout.fontSize.xxxs,
    color: Colors.textTertiary,
    textAlign: 'center',
    lineHeight: 18,
  },
  termsLink: {
    color: Colors.primary,
    fontWeight: '600',
  },
  infoContainer: {
    alignItems: 'center',
    marginTop: Layout.spacing.xl,
  },
  infoText: {
    fontSize: Layout.fontSize.xxxs,
    color: Colors.textTertiary,
    marginBottom: Layout.spacing.xs,
  },
  copyrightText: {
    fontSize: Layout.fontSize.xxxs,
    color: Colors.textMuted,
  },
});

export default LoginScreen;
