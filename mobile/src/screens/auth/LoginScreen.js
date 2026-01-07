// mobile/src/screens/auth/LoginScreen.js
import React, { useState, useContext } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Image,
} from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { AuthContext } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import Button from '../../components/ui/Button';

export default function LoginScreen({ navigation }) {
  const [phone, setPhone] = useState('09123456789');
  const [password, setPassword] = useState('123456');
  const [showPassword, setShowPassword] = useState(false);
  const { login } = useContext(AuthContext);
  const { showToast } = useToast();

  const handleLogin = async () => {
    if (!phone || !password) {
      showToast('لطفا شماره موبایل و رمز عبور را وارد کنید', 'error');
      return;
    }

    const result = await login(phone, password);
    if (result.success) {
      showToast(`خوش آمدید ${result.user.name}!`, 'success');
    } else {
      showToast(result.message, 'error');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
          {/* لوگو */}
          <View style={styles.logoContainer}>
            <View style={styles.logoIcon}>
              <Text style={styles.logoText}>⚡</Text>
            </View>
            <Text style={styles.logoTitle}>SODmAX</Text>
            <Text style={styles.logoSubtitle}>CityVerse Pro</Text>
          </View>

          {/* فرم ورود */}
          <View style={styles.formContainer}>
            <Text style={styles.formTitle}>ورود به حساب</Text>
            <Text style={styles.formSubtitle}>به حساب کاربری خود وارد شوید</Text>

            {/* شماره موبایل */}
            <View style={styles.inputContainer}>
              <Text style={styles.label}>شماره موبایل</Text>
              <TextInput
                style={styles.input}
                placeholder="مثال: 09123456789"
                value={phone}
                onChangeText={setPhone}
                keyboardType="phone-pad"
                placeholderTextColor="#6b7280"
              />
            </View>

            {/* رمز عبور */}
            <View style={styles.inputContainer}>
              <Text style={styles.label}>رمز عبور</Text>
              <View style={styles.passwordContainer}>
                <TextInput
                  style={[styles.input, { flex: 1 }]}
                  placeholder="رمز عبور خود را وارد کنید"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                  placeholderTextColor="#6b7280"
                />
                <TouchableOpacity
                  style={styles.eyeButton}
                  onPress={() => setShowPassword(!showPassword)}
                >
                  <FontAwesome
                    name={showPassword ? 'eye-slash' : 'eye'}
                    size={20}
                    color="#9ca3af"
                  />
                </TouchableOpacity>
              </View>
            </View>

            {/* دکمه ورود */}
            <Button
              title="ورود به حساب"
              onPress={handleLogin}
              icon="sign-in-alt"
              style={styles.loginButton}
            />

            {/* لینک‌ها */}
            <View style={styles.linksContainer}>
              <TouchableOpacity onPress={() => navigation.navigate('Register')}>
                <Text style={styles.linkText}>حساب کاربری ندارید؟ ثبت‌نام کنید</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => showToast('بازیابی رمز به زودی فعال می‌شود', 'info')}>
                <Text style={styles.linkText}>رمز عبور را فراموش کرده‌اید؟</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0f1c',
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 20,
    paddingVertical: 40,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logoIcon: {
    width: 80,
    height: 80,
    borderRadius: 20,
    backgroundColor: '#0066FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  logoText: {
    fontSize: 36,
    color: '#fff',
  },
  logoTitle: {
    fontSize: 32,
    fontWeight: '900',
    color: '#0066FF',
    marginBottom: 4,
  },
  logoSubtitle: {
    fontSize: 14,
    color: '#9ca3af',
  },
  formContainer: {
    backgroundColor: 'rgba(25, 35, 60, 0.9)',
    borderRadius: 24,
    padding: 24,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
  },
  formTitle: {
    fontSize: 24,
    fontWeight: '900',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 8,
  },
  formSubtitle: {
    fontSize: 14,
    color: '#9ca3af',
    textAlign: 'center',
    marginBottom: 24,
  },
  inputContainer: {
    marginBottom: 16,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: '#d1d5db',
    marginBottom: 8,
  },
  input: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 16,
    padding: 16,
    color: '#fff',
    fontSize: 14,
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  eyeButton: {
    position: 'absolute',
    left: 16,
    padding: 10,
  },
  loginButton: {
    marginTop: 16,
  },
  linksContainer: {
    marginTop: 24,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
    paddingTop: 16,
    gap: 12,
  },
  linkText: {
    fontSize: 13,
    color: '#9ca3af',
    textAlign: 'center',
  },
});
