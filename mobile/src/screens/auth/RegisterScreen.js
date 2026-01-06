// mobile/src/screens/auth/RegisterScreen.js
import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import api from '../../services/api';

// کامپوننت‌های UI
import Button, { PrimaryButton } from '../../components/ui/Button';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import Input from '../../components/ui/Input';
import Card from '../../components/ui/Card';
import { useTheme } from '../../context/ThemeContext';

const RegisterScreen = () => {
  const navigation = useNavigation();
  const { login } = useAuth();
  const { showSuccess, showError } = useToast();
  const theme = useTheme();

  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    password: '',
    confirmPassword: '',
    referralCode: '',
  });
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const validateForm = () => {
    const newErrors = {};

    // اعتبارسنجی نام
    if (!formData.name.trim()) {
      newErrors.name = 'نام و نام خانوادگی الزامی است';
    } else if (formData.name.trim().length < 2) {
      newErrors.name = 'نام باید حداقل ۲ کاراکتر باشد';
    }

    // اعتبارسنجی شماره موبایل
    const phoneRegex = /^09[0-9]{9}$/;
    if (!formData.phone.trim()) {
      newErrors.phone = 'شماره موبایل الزامی است';
    } else if (!phoneRegex.test(formData.phone.trim())) {
      newErrors.phone = 'شماره موبایل معتبر وارد کنید (مثال: 09123456789)';
    }

    // اعتبارسنجی رمز عبور
    if (!formData.password) {
      newErrors.password = 'رمز عبور الزامی است';
    } else if (formData.password.length < 6) {
      newErrors.password = 'رمز عبور باید حداقل ۶ کاراکتر باشد';
    }

    // اعتبارسنجی تکرار رمز عبور
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'تکرار رمز عبور الزامی است';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'رمز عبور با تکرار آن مطابقت ندارد';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleRegister = async () => {
    if (!validateForm()) {
      showError('لطفاً خطاهای فرم را برطرف کنید');
      return;
    }

    setLoading(true);

    try {
      const userData = {
        name: formData.name.trim(),
        phone: formData.phone.trim(),
        password: formData.password,
        referralCode: formData.referralCode.trim() || null,
      };

      // تماس با API
      const response = await api.auth.register(userData);

      if (response.success) {
        // ذخیره توکن
        if (response.token) {
          localStorage.setItem('auth_token', response.token);
        }

        // ذخیره اطلاعات کاربر
        if (response.user) {
          login(response.user);
        }

        showSuccess(
          `ثبت‌نام موفق! ${response.referralBonus ? `${response.referralBonus} SOD پاداش دعوت دریافت کردید. ` : ''}به SODmAX خوش آمدید!`
        );

        // هدایت به صفحه اصلی
        navigation.reset({
          index: 0,
          routes: [{ name: 'Main' }],
        });
      } else {
        showError(response.message || 'خطا در ثبت‌نام');
      }
    } catch (error) {
      console.error('Registration error:', error);
      showError('خطا در ارتباط با سرور. لطفاً دوباره تلاش کنید.');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));

    // پاک کردن خطای فیلد هنگام تایپ
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: '',
      }));
    }
  };

  const handleLoginRedirect = () => {
    navigation.navigate('Login');
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <ScrollView 
          style={styles.container}
          contentContainerStyle={styles.contentContainer}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.logoContainer}>
            <View style={[styles.logo, { backgroundColor: theme.colors.primary }]}>
              <Text style={styles.logoText}>⚡</Text>
            </View>
            <Text style={[styles.logoTitle, { color: theme.colors.text }]}>
              SODmAX
            </Text>
            <Text style={[styles.logoSubtitle, { color: theme.colors.textSecondary }]}>
              CityVerse Pro
            </Text>
          </View>

          <Card style={styles.formCard}>
            <Text style={[styles.title, { color: theme.colors.text }]}>
              ایجاد حساب جدید
            </Text>
            
            <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>
              حساب کاربری خود را ایجاد کنید
            </Text>

            <View style={styles.form}>
              {/* فیلد نام */}
              <Input
                label="نام و نام خانوادگی"
                placeholder="مثلاً: علی محمدی"
                value={formData.name}
                onChangeText={(text) => handleInputChange('name', text)}
                error={errors.name}
                autoCapitalize="words"
                icon="user"
              />

              {/* فیلد شماره موبایل */}
              <Input
                label="شماره موبایل"
                placeholder="مثلاً: 09123456789"
                value={formData.phone}
                onChangeText={(text) => handleInputChange('phone', text)}
                error={errors.phone}
                keyboardType="phone-pad"
                maxLength={11}
                icon="phone"
              />

              {/* فیلد رمز عبور */}
              <Input
                label="رمز عبور"
                placeholder="حداقل ۶ کاراکتر"
                value={formData.password}
                onChangeText={(text) => handleInputChange('password', text)}
                error={errors.password}
                secureTextEntry={!showPassword}
                icon="lock"
                rightIcon={showPassword ? 'eye-off' : 'eye'}
                onRightIconPress={() => setShowPassword(!showPassword)}
              />

              {/* فیلد تکرار رمز عبور */}
              <Input
                label="تکرار رمز عبور"
                placeholder="رمز عبور را مجدداً وارد کنید"
                value={formData.confirmPassword}
                onChangeText={(text) => handleInputChange('confirmPassword', text)}
                error={errors.confirmPassword}
                secureTextEntry={!showConfirmPassword}
                icon="lock"
                rightIcon={showConfirmPassword ? 'eye-off' : 'eye'}
                onRightIconPress={() => setShowConfirmPassword(!showConfirmPassword)}
              />

              {/* فیلد کد دعوت */}
              <Input
                label="کد دعوت (اختیاری)"
                placeholder="کد دعوت معرف خود را وارد کنید"
                value={formData.referralCode}
                onChangeText={(text) => handleInputChange('referralCode', text)}
                error={errors.referralCode}
                icon="gift"
              />

              {/* دکمه ثبت‌نام */}
              <PrimaryButton
                title={loading ? 'در حال ایجاد حساب...' : 'ایجاد حساب کاربری'}
                onPress={handleRegister}
                disabled={loading}
                fullWidth
                icon={loading ? null : 'user-plus'}
                style={styles.submitButton}
              />

              {/* پیام قوانین */}
              <Text style={[styles.terms, { color: theme.colors.textTertiary }]}>
                با ثبت‌نام،{' '}
                <Text 
                  style={{ color: theme.colors.primary }}
                  onPress={() => showInfo('صفحه قوانین به زودی فعال خواهد شد')}
                >
                  قوانین و مقررات
                </Text>{' '}
                و{' '}
                <Text 
                  style={{ color: theme.colors.primary }}
                  onPress={() => showInfo('صفحه حریم خصوصی به زودی فعال خواهد شد')}
                >
                  حریم خصوصی
                </Text>{' '}
                SODmAX CityVerse را می‌پذیرید.
              </Text>
            </View>
          </Card>

          {/* لینک ورود */}
          <View style={styles.switchContainer}>
            <Text style={[styles.switchText, { color: theme.colors.textSecondary }]}>
              قبلاً ثبت‌نام کرده‌اید؟{' '}
            </Text>
            <Button
              title="ورود به حساب"
              onPress={handleLoginRedirect}
              variant="ghost"
              textStyle={{ color: theme.colors.primary }}
            />
          </View>
        </ScrollView>
      </TouchableWithoutFeedback>

      {/* نمایش لودینگ */}
      {loading && (
        <View style={styles.loadingOverlay}>
          <LoadingSpinner type="pulse" text="در حال ایجاد حساب کاربری..." />
        </View>
      )}
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0f1c',
  },
  contentContainer: {
    flexGrow: 1,
    padding: 20,
    paddingBottom: 40,
  },
  logoContainer: {
    alignItems: 'center',
    marginTop: 40,
    marginBottom: 30,
  },
  logo: {
    width: 80,
    height: 80,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 15,
  },
  logoText: {
    fontSize: 40,
  },
  logoTitle: {
    fontSize: 28,
    fontWeight: '900',
    marginBottom: 4,
  },
  logoSubtitle: {
    fontSize: 14,
    fontWeight: '500',
  },
  formCard: {
    padding: 24,
    borderRadius: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: '900',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 24,
  },
  form: {
    gap: 16,
  },
  submitButton: {
    marginTop: 8,
  },
  terms: {
    fontSize: 11,
    textAlign: 'center',
    lineHeight: 1.5,
    marginTop: 16,
  },
  switchContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 24,
    paddingTop: 24,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
  },
  switchText: {
    fontSize: 13,
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
  },
});

export default RegisterScreen;
