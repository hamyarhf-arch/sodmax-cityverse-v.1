[file name]: mobile/src/screens/auth/LoginScreen.js
[file content begin]
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { useTheme } from '@context/ThemeContext';
import { useAuth } from '@context/AuthContext';
import { useToast } from '@context/ToastContext';
import Input from '@components/ui/Input';
import Button from '@components/ui/Button';
import Card from '@components/ui/Card';
import LoadingSpinner from '@components/ui/LoadingSpinner';

const LoginScreen = ({ navigation }) => {
  const { theme } = useTheme();
  const { login } = useAuth();
  const { showToast } = useToast();

  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async () => {
    if (!phone.trim() || !password.trim()) {
      showToast('⚠️ خطا', 'لطفاً تمام فیلدها را پر کنید', 'error');
      return;
    }

    // Validate phone number
    const phoneRegex = /^09[0-9]{9}$/;
    if (!phoneRegex.test(phone)) {
      showToast('⚠️ خطا', 'شماره موبایل معتبر وارد کنید', 'error');
      return;
    }

    if (password.length < 6) {
      showToast('⚠️ خطا', 'رمز عبور باید حداقل ۶ کاراکتر باشد', 'error');
      return;
    }

    setIsLoading(true);

    try {
      // Simulate API call
      setTimeout(async () => {
        const result = await login(phone, password);
        
        if (result.success) {
          showToast('✅ ورود موفق', `خوش آمدید ${result.user.name}!`, 'success');
          // Navigation will be handled by AuthContext
        } else {
          showToast('❌ خطا', result.message || 'ورود ناموفق', 'error');
        }
        
        setIsLoading(false);
      }, 1500);
    } catch (error) {
      showToast('❌ خطا', 'خطا در ارتباط با سرور', 'error');
      setIsLoading(false);
    }
  };

  const handleForgotPassword = () => {
    showToast('🔐 بازیابی رمز', 'این قابلیت به زودی فعال خواهد شد', 'info');
  };

  const handleRegister = () => {
    navigation.navigate('Register');
  };

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={[styles.logoContainer, { backgroundColor: theme.colors.primary }]}>
            <Text style={styles.logoText}>⚡</Text>
          </View>
          <Text style={[styles.title, { color: theme.colors.text }]}>
            ورود به SODmAX
          </Text>
          <Text style={[styles.subtitle, { color: theme.colors.secondary }]}>
            به حساب کاربری خود وارد شوید
          </Text>
        </View>

        {/* Login Form */}
        <Card style={styles.card}>
          <Input
            label="شماره موبایل"
            value={phone}
            onChangeText={setPhone}
            placeholder="مثلاً: 09123456789"
            keyboardType="phone-pad"
            icon="phone"
            maxLength={11}
          />

          <Input
            label="رمز عبور"
            value={password}
            onChangeText={setPassword}
            placeholder="رمز عبور خود را وارد کنید"
            secureTextEntry={!showPassword}
            icon="lock"
            rightIcon={showPassword ? 'eye-off' : 'eye'}
            onRightIconPress={() => setShowPassword(!showPassword)}
          />

          <TouchableOpacity
            onPress={handleForgotPassword}
            style={styles.forgotPassword}
          >
            <Text style={[styles.forgotText, { color: theme.colors.primary }]}>
              رمز عبور را فراموش کرده‌اید؟
            </Text>
          </TouchableOpacity>

          <Button
            title={isLoading ? 'در حال ورود...' : 'ورود به حساب'}
            onPress={handleLogin}
            disabled={isLoading}
            icon={isLoading ? null : 'log-in'}
            style={styles.loginButton}
          />

          {/* Divider */}
          <View style={styles.dividerContainer}>
            <View style={[styles.divider, { backgroundColor: theme.colors.border }]} />
            <Text style={[styles.dividerText, { color: theme.colors.secondary }]}>
              یا
            </Text>
            <View style={[styles.divider, { backgroundColor: theme.colors.border }]} />
          </View>

          <Button
            title="ثبت‌نام در SODmAX"
            onPress={handleRegister}
            type="outline"
            icon="user-plus"
          />
        </Card>

        {/* Info */}
        <View style={styles.infoContainer}>
          <Text style={[styles.infoText, { color: theme.colors.muted }]}>
            با ورود به حساب،{' '}
            <Text style={[styles.link, { color: theme.colors.primary }]}>
              قوانین و مقررات
            </Text>{' '}
            و{' '}
            <Text style={[styles.link, { color: theme.colors.primary }]}>
              حریم خصوصی
            </Text>{' '}
            SODmAX CityVerse را می‌پذیرید.
          </Text>
        </View>

        {/* Quick Test User */}
        <TouchableOpacity
          onPress={() => {
            setPhone('09123456789');
            setPassword('123456');
          }}
          style={[styles.testButton, { borderColor: theme.colors.primary }]}
        >
          <Text style={[styles.testText, { color: theme.colors.primary }]}>
            🚀 استفاده از کاربر تستی
          </Text>
        </TouchableOpacity>
      </ScrollView>

      {isLoading && <LoadingSpinner />}
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    padding: 20,
    paddingTop: 60,
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logoContainer: {
    width: 80,
    height: 80,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  logoText: {
    fontSize: 40,
    color: 'white',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
  },
  card: {
    marginBottom: 20,
  },
  forgotPassword: {
    alignSelf: 'flex-start',
    marginBottom: 20,
    marginTop: -5,
  },
  forgotText: {
    fontSize: 13,
    fontWeight: '600',
  },
  loginButton: {
    marginBottom: 20,
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 20,
  },
  divider: {
    flex: 1,
    height: 1,
  },
  dividerText: {
    paddingHorizontal: 15,
    fontSize: 13,
  },
  infoContainer: {
    marginTop: 20,
    paddingHorizontal: 10,
  },
  infoText: {
    fontSize: 12,
    textAlign: 'center',
    lineHeight: 18,
  },
  link: {
    fontWeight: 'bold',
  },
  testButton: {
    marginTop: 30,
    padding: 12,
    borderWidth: 1,
    borderRadius: 10,
    alignItems: 'center',
  },
  testText: {
    fontSize: 13,
    fontWeight: '600',
  },
});

export default LoginScreen;
[file content end]
