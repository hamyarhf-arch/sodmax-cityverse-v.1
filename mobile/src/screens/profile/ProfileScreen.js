// mobile/src/screens/profile/ProfileScreen.js
import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  Image,
  Platform,
  Alert,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { useWallet } from '../../context/WalletContext';
import api from '../../services/api';

// کامپوننت‌های UI
import LoadingSpinner, { PageLoader } from '../../components/ui/LoadingSpinner';
import Button, { PrimaryButton, SecondaryButton } from '../../components/ui/Button';
import Card, { CardWithHeader } from '../../components/ui/Card';
import Input from '../../components/ui/Input';
import { useTheme } from '../../context/ThemeContext';

const ProfileScreen = () => {
  const { user, logout, updateUser } = useAuth();
  const { showSuccess, showError, showInfo } = useToast();
  const { balances } = useWallet();
  const theme = useTheme();

  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [userData, setUserData] = useState({
    name: '',
    phone: '',
    email: '',
    avatar: null,
  });
  const [stats, setStats] = useState({
    joinDate: '',
    lastLogin: '',
    totalSessions: 0,
    totalTime: 0,
    achievements: 0,
  });

  useEffect(() => {
    if (user) {
      loadProfileData();
    }
  }, [user]);

  const loadProfileData = async () => {
    try {
      setLoading(true);
      
      const [profileRes, statsRes] = await Promise.all([
        api.auth.getMe(),
        api.users.getUserStats(user.id),
      ]);

      if (profileRes.success) {
        const { name, phone, email, avatar } = profileRes.data;
        setUserData({ name, phone, email: email || '', avatar });
      }

      if (statsRes.success) {
        setStats(statsRes.data);
      }
    } catch (error) {
      console.error('Error loading profile data:', error);
      showError('خطا در بارگذاری اطلاعات پروفایل');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadProfileData();
  };

  const pickImage = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (status !== 'granted') {
        Alert.alert(
          'دسترسی لازم',
          'برای انتخاب تصویر، دسترسی به گالری لازم است.',
          [{ text: 'باشه' }]
        );
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
        base64: true,
      });

      if (!result.canceled && result.assets[0]) {
        const image = result.assets[0];
        
        // آپلود تصویر
        const response = await api.files.uploadProfileImage(user.id, {
          uri: image.uri,
          type: 'image/jpeg',
          name: 'profile.jpg',
        });

        if (response.success) {
          setUserData(prev => ({ ...prev, avatar: response.data.url }));
          updateUser({ ...user, avatar: response.data.url });
          showSuccess('تصویر پروفایل با موفقیت تغییر کرد');
        }
      }
    } catch (error) {
      console.error('Error picking image:', error);
      showError('خطا در انتخاب تصویر');
    }
  };

  const handleSaveProfile = async () => {
    if (!userData.name.trim()) {
      showError('لطفاً نام خود را وارد کنید');
      return;
    }

    try {
      const response = await api.auth.updateProfile(userData);
      
      if (response.success) {
        updateUser(response.data.user);
        setEditMode(false);
        showSuccess('پروفایل با موفقیت به‌روزرسانی شد');
      } else {
        showError(response.message || 'خطا در به‌روزرسانی پروفایل');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      showError('خطا در به‌روزرسانی پروفایل');
    }
  };

  const handleChangePassword = () => {
    Alert.prompt(
      'تغییر رمز عبور',
      'رمز عبور جدید را وارد کنید:',
      [
        { text: 'لغو', style: 'cancel' },
        {
          text: 'تغییر',
          onPress: async (password) => {
            if (!password || password.length < 6) {
              showError('رمز عبور باید حداقل ۶ کاراکتر باشد');
              return;
            }

            try {
              const response = await api.auth.changePassword('current-password', password);
              
              if (response.success) {
                showSuccess('رمز عبور با موفقیت تغییر کرد');
              } else {
                showError(response.message || 'خطا در تغییر رمز عبور');
              }
            } catch (error) {
              console.error('Error changing password:', error);
              showError('خطا در تغییر رمز عبور');
            }
          },
        },
      ],
      'secure-text'
    );
  };

  const handleLogout = () => {
    Alert.alert(
      'خروج از حساب',
      'آیا از خروج از حساب کاربری خود مطمئن هستید؟',
      [
        { text: 'لغو', style: 'cancel' },
        {
          text: 'خروج',
          style: 'destructive',
          onPress: async () => {
            try {
              await logout();
              showSuccess('با موفقیت از حساب خارج شدید');
            } catch (error) {
              console.error('Error logging out:', error);
              showError('خطا در خروج از حساب');
            }
          },
        },
      ]
    );
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('fa-IR');
  };

  const formatTime = (minutes) => {
    if (minutes < 60) return `${minutes} دقیقه`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours} ساعت و ${mins} دقیقه`;
  };

  if (loading && !refreshing) {
    return <PageLoader text="در حال بارگذاری پروفایل..." />;
  }

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[theme.colors.primary]}
            tintColor={theme.colors.primary}
          />
        }
      >
        {/* هدر پروفایل */}
        <View style={[styles.profileHeader, { backgroundColor: theme.colors.surface }]}>
          <TouchableOpacity onPress={pickImage} style={styles.avatarContainer}>
            {userData.avatar ? (
              <Image
                source={{ uri: userData.avatar }}
                style={styles.avatarImage}
              />
            ) : (
              <View style={[styles.avatarPlaceholder, { backgroundColor: theme.colors.primary }]}>
                <Text style={styles.avatarText}>
                  {userData.name ? userData.name.charAt(0) : 'ع'}
                </Text>
              </View>
            )}
            <View style={[styles.editAvatarBadge, { backgroundColor: theme.colors.primary }]}>
              <Text style={styles.editAvatarIcon}>✏️</Text>
            </View>
          </TouchableOpacity>

          <View style={styles.profileInfo}>
            {editMode ? (
              <Input
                value={userData.name}
                onChangeText={(text) => setUserData(prev => ({ ...prev, name: text }))}
                placeholder="نام و نام خانوادگی"
                style={styles.nameInput}
              />
            ) : (
              <Text style={[styles.profileName, { color: theme.colors.text }]}>
                {userData.name || 'کاربر'}
              </Text>
            )}
            
            <Text style={[styles.profilePhone, { color: theme.colors.textSecondary }]}>
              📱 {userData.phone}
            </Text>
            
            {userData.email && (
              <Text style={[styles.profileEmail, { color: theme.colors.textSecondary }]}>
                📧 {userData.email}
              </Text>
            )}

            <View style={styles.levelBadge}>
              <Text style={[styles.levelText, { color: 'white' }]}>
                سطح {user.level || 1}
              </Text>
            </View>
          </View>
        </View>

        {/* دکمه‌های ویرایش */}
        <View style={styles.editButtons}>
          {editMode ? (
            <>
              <PrimaryButton
                title="ذخیره تغییرات"
                onPress={handleSaveProfile}
                icon="save"
                style={styles.editButton}
              />
              <SecondaryButton
                title="لغو"
                onPress={() => {
                  setEditMode(false);
                  setUserData({
                    name: user.name || '',
                    phone: user.phone || '',
                    email: user.email || '',
                    avatar: user.avatar,
                  });
                }}
                icon="times"
                style={styles.editButton}
              />
            </>
          ) : (
            <PrimaryButton
              title="ویرایش پروفایل"
              onPress={() => setEditMode(true)}
              icon="edit"
              style={styles.editButton}
            />
          )}
        </View>

        {/* اطلاعات حساب */}
        <CardWithHeader
          title="💼 اطلاعات حساب"
          subtitle="جزئیات حساب کاربری شما"
          style={styles.infoCard}
        >
          <View style={styles.infoGrid}>
            <View style={styles.infoItem}>
              <Text style={[styles.infoLabel, { color: theme.colors.textSecondary }]}>
                شماره عضویت
              </Text>
              <Text style={[styles.infoValue, { color: theme.colors.text }]}>
                {user.id.toString().padStart(8, '0')}
              </Text>
            </View>
            
            <View style={styles.infoItem}>
              <Text style={[styles.infoLabel, { color: theme.colors.textSecondary }]}>
                تاریخ عضویت
              </Text>
              <Text style={[styles.infoValue, { color: theme.colors.text }]}>
                {formatDate(stats.joinDate)}
              </Text>
            </View>
            
            <View style={styles.infoItem}>
              <Text style={[styles.infoLabel, { color: theme.colors.textSecondary }]}>
                آخرین ورود
              </Text>
              <Text style={[styles.infoValue, { color: theme.colors.text }]}>
                {formatDate(stats.lastLogin)}
              </Text>
            </View>
            
            <View style={styles.infoItem}>
              <Text style={[styles.infoLabel, { color: theme.colors.textSecondary }]}>
                وضعیت حساب
              </Text>
              <View style={styles.statusBadge}>
                <View style={[styles.statusDot, { backgroundColor: theme.colors.success }]} />
                <Text style={[styles.statusText, { color: theme.colors.success }]}>
                  فعال
                </Text>
              </View>
            </View>
          </View>
        </CardWithHeader>

        {/* آمار فعالیت */}
        <CardWithHeader
          title="📊 آمار فعالیت"
          subtitle="فعالیت‌های شما در SODmAX"
          style={styles.statsCard}
        >
          <View style={styles.statsGrid}>
            <View style={styles.statItem}>
              <Text style={[styles.statValue, { color: theme.colors.primary }]}>
                {stats.totalSessions}
              </Text>
              <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>
                ورود موفق
              </Text>
            </View>
            
            <View style={styles.statItem}>
              <Text style={[styles.statValue, { color: theme.colors.success }]}>
                {formatTime(stats.totalTime)}
              </Text>
              <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>
                زمان حضور
              </Text>
            </View>
            
            <View style={styles.statItem}>
              <Text style={[styles.statValue, { color: theme.colors.accent }]}>
                {stats.achievements}
              </Text>
              <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>
                دستاورد
              </Text>
            </View>
            
            <View style={styles.statItem}>
              <Text style={[styles.statValue, { color: theme.colors.secondary }]}>
                {user.referralCount || 0}
              </Text>
              <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>
                زیرمجموعه
              </Text>
            </View>
          </View>
        </CardWithHeader>

        {/* موجودی‌ها */}
        <CardWithHeader
          title="💰 موجودی‌ها"
          subtitle="موجودی حساب‌های شما"
          style={styles.balanceCard}
        >
          <View style={styles.balanceGrid}>
            <View style={styles.balanceItem}>
              <View style={[styles.balanceIcon, { backgroundColor: theme.colors.primary + '20' }]}>
                <Text style={[styles.balanceIconText, { color: theme.colors.primary }]}>
                  ⚡
                </Text>
              </View>
              <View style={styles.balanceInfo}>
                <Text style={[styles.balanceLabel, { color: theme.colors.textSecondary }]}>
                  SOD
                </Text>
                <Text style={[styles.balanceValue, { color: theme.colors.text }]}>
                  {balances.sod?.toLocaleString('fa-IR') || 0}
                </Text>
              </View>
            </View>
            
            <View style={styles.balanceItem}>
              <View style={[styles.balanceIcon, { backgroundColor: theme.colors.success + '20' }]}>
                <Text style={[styles.balanceIconText, { color: theme.colors.success }]}>
                  💰
                </Text>
              </View>
              <View style={styles.balanceInfo}>
                <Text style={[styles.balanceLabel, { color: theme.colors.textSecondary }]}>
                  تومان
                </Text>
                <Text style={[styles.balanceValue, { color: theme.colors.text }]}>
                  {balances.toman?.toLocaleString('fa-IR') || 0}
                </Text>
              </View>
            </View>
            
            <View style={styles.balanceItem}>
              <View style={[styles.balanceIcon, { backgroundColor: '#3b82f620' }]}>
                <Text style={[styles.balanceIconText, { color: '#3b82f6' }]}>
                  💵
                </Text>
              </View>
              <View style={styles.balanceInfo}>
                <Text style={[styles.balanceLabel, { color: theme.colors.textSecondary }]}>
                  USDT
                </Text>
                <Text style={[styles.balanceValue, { color: theme.colors.text }]}>
                  {balances.usdt?.toLocaleString('fa-IR') || 0}
                </Text>
              </View>
            </View>
          </View>
        </CardWithHeader>

        {/* تنظیمات امنیتی */}
        <CardWithHeader
          title="🔐 امنیت حساب"
          subtitle="تنظیمات امنیتی حساب شما"
          style={styles.securityCard}
        >
          <View style={styles.securityList}>
            <TouchableOpacity
              style={styles.securityItem}
              onPress={handleChangePassword}
              activeOpacity={0.7}
            >
              <View style={styles.securityItemLeft}>
                <View style={[styles.securityIcon, { backgroundColor: theme.colors.warning + '20' }]}>
                  <Text style={[styles.securityIconText, { color: theme.colors.warning }]}>
                    🔑
                  </Text>
                </View>
                <View style={styles.securityInfo}>
                  <Text style={[styles.securityTitle, { color: theme.colors.text }]}>
                    تغییر رمز عبور
                  </Text>
                  <Text style={[styles.securityDesc, { color: theme.colors.textSecondary }]}>
                    رمز عبور خود را به‌روزرسانی کنید
                  </Text>
                </View>
              </View>
              <Text style={[styles.securityArrow, { color: theme.colors.textTertiary }]}>
                ←
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={styles.securityItem}
              onPress={() => showInfo('احراز هویت دو مرحله‌ای به زودی فعال خواهد شد')}
              activeOpacity={0.7}
            >
              <View style={styles.securityItemLeft}>
                <View style={[styles.securityIcon, { backgroundColor: theme.colors.success + '20' }]}>
                  <Text style={[styles.securityIconText, { color: theme.colors.success }]}>
                    ✅
                  </Text>
                </View>
                <View style={styles.securityInfo}>
                  <Text style={[styles.securityTitle, { color: theme.colors.text }]}>
                    احراز هویت دو مرحله‌ای
                  </Text>
                  <Text style={[styles.securityDesc, { color: theme.colors.textSecondary }]}>
                    فعال برای امنیت بیشتر
                  </Text>
                </View>
              </View>
              <Text style={[styles.securityArrow, { color: theme.colors.textTertiary }]}>
                ←
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={styles.securityItem}
              onPress={() => showInfo('جلسات فعال به زودی فعال خواهد شد')}
              activeOpacity={0.7}
            >
              <View style={styles.securityItemLeft}>
                <View style={[styles.securityIcon, { backgroundColor: theme.colors.info + '20' }]}>
                  <Text style={[styles.securityIconText, { color: theme.colors.info }]}>
                    📱
                  </Text>
                </View>
                <View style={styles.securityInfo}>
                  <Text style={[styles.securityTitle, { color: theme.colors.text }]}>
                    جلسات فعال
                  </Text>
                  <Text style={[styles.securityDesc, { color: theme.colors.textSecondary }]}>
                    مدیریت دستگاه‌های متصل
                  </Text>
                </View>
              </View>
              <Text style={[styles.securityArrow, { color: theme.colors.textTertiary }]}>
                ←
              </Text>
            </TouchableOpacity>
          </View>
        </CardWithHeader>

        {/* سایر تنظیمات */}
        <CardWithHeader
          title="⚙️ سایر تنظیمات"
          subtitle="تنظیمات اضافی حساب"
          style={styles.settingsCard}
        >
          <View style={styles.settingsList}>
            <TouchableOpacity
              style={styles.settingItem}
              onPress={() => showInfo('اعلان‌ها به زودی فعال خواهد شد')}
              activeOpacity={0.7}
            >
              <View style={styles.settingItemLeft}>
                <Text style={[styles.settingIcon, { color: theme.colors.primary }]}>
                  🔔
                </Text>
                <Text style={[styles.settingTitle, { color: theme.colors.text }]}>
                  تنظیمات اعلان‌ها
                </Text>
              </View>
              <Text style={[styles.settingArrow, { color: theme.colors.textTertiary }]}>
                ←
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={styles.settingItem}
              onPress={() => showInfo('زبان به زودی فعال خواهد شد')}
              activeOpacity={0.7}
            >
              <View style={styles.settingItemLeft}>
                <Text style={[styles.settingIcon, { color: theme.colors.success }]}>
                  🌐
                </Text>
                <Text style={[styles.settingTitle, { color: theme.colors.text }]}>
                  زبان و منطقه
                </Text>
              </View>
              <Text style={[styles.settingArrow, { color: theme.colors.textTertiary }]}>
                ←
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={styles.settingItem}
              onPress={() => showInfo('حریم خصوصی به زودی فعال خواهد شد')}
              activeOpacity={0.7}
            >
              <View style={styles.settingItemLeft}>
                <Text style={[styles.settingIcon, { color: theme.colors.warning }]}>
                  👁️
                </Text>
                <Text style={[styles.settingTitle, { color: theme.colors.text }]}>
                  حریم خصوصی
                </Text>
              </View>
              <Text style={[styles.settingArrow, { color: theme.colors.textTertiary }]}>
                ←
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={styles.settingItem}
              onPress={() => showInfo('پشتیبانی به زودی فعال خواهد شد')}
              activeOpacity={0.7}
            >
              <View style={styles.settingItemLeft}>
                <Text style={[styles.settingIcon, { color: theme.colors.info }]}>
                  🆘
                </Text>
                <Text style={[styles.settingTitle, { color: theme.colors.text }]}>
                  پشتیبانی و راهنما
                </Text>
              </View>
              <Text style={[styles.settingArrow, { color: theme.colors.textTertiary }]}>
                ←
              </Text>
            </TouchableOpacity>
          </View>
        </CardWithHeader>

        {/* دکمه خروج */}
        <Card style={styles.logoutCard}>
          <Button
            title="خروج از حساب کاربری"
            onPress={handleLogout}
            variant="error"
            icon="sign-out-alt"
            style={styles.logoutButton}
          />
          
          <Text style={[styles.versionText, { color: theme.colors.textTertiary }]}>
            SODmAX CityVerse v2.0.0 | Pro Edition
          </Text>
        </Card>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0f1c',
  },
  scrollView: {
    flex: 1,
  },
  profileHeader: {
    padding: 24,
    paddingTop: 40,
    alignItems: 'center',
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 16,
  },
  avatarImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 3,
    borderColor: 'white',
  },
  avatarPlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: 'white',
  },
  avatarText: {
    color: 'white',
    fontSize: 36,
    fontWeight: 'bold',
  },
  editAvatarBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'white',
  },
  editAvatarIcon: {
    fontSize: 14,
  },
  profileInfo: {
    alignItems: 'center',
  },
  profileName: {
    fontSize: 24,
    fontWeight: '900',
    marginBottom: 4,
    textAlign: 'center',
  },
  nameInput: {
    width: '80%',
    marginBottom: 8,
  },
  profilePhone: {
    fontSize: 14,
    marginBottom: 2,
  },
  profileEmail: {
    fontSize: 12,
    marginBottom: 12,
  },
  levelBadge: {
    backgroundColor: '#0066FF',
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 20,
    marginTop: 8,
  },
  levelText: {
    fontSize: 12,
    fontWeight: '700',
  },
  editButtons: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 16,
    paddingHorizontal: 16,
    gap: 12,
  },
  editButton: {
    flex: 1,
  },
  infoCard: {
    marginHorizontal: 16,
    marginTop: 16,
    marginBottom: 16,
  },
  infoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  infoItem: {
    width: '48%',
    marginBottom: 16,
  },
  infoLabel: {
    fontSize: 11,
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '700',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  statsCard: {
    marginHorizontal: 16,
    marginBottom: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  statItem: {
    width: '48%',
    alignItems: 'center',
    marginBottom: 16,
  },
  statValue: {
    fontSize: 18,
    fontWeight: '900',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 11,
  },
  balanceCard: {
    marginHorizontal: 16,
    marginBottom: 16,
  },
  balanceGrid: {
    gap: 12,
  },
  balanceItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderRadius: 12,
  },
  balanceIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 12,
  },
  balanceIconText: {
    fontSize: 20,
  },
  balanceInfo: {
    flex: 1,
  },
  balanceLabel: {
    fontSize: 12,
    marginBottom: 2,
  },
  balanceValue: {
    fontSize: 18,
    fontWeight: '900',
  },
  securityCard: {
    marginHorizontal: 16,
    marginBottom: 16,
  },
  securityList: {
    gap: 12,
  },
  securityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderRadius: 12,
  },
  securityItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  securityIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 12,
  },
  securityIconText: {
    fontSize: 18,
  },
  securityInfo: {
    flex: 1,
  },
  securityTitle: {
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 2,
  },
  securityDesc: {
    fontSize: 11,
  },
  securityArrow: {
    fontSize: 16,
    marginRight: 8,
  },
  settingsCard: {
    marginHorizontal: 16,
    marginBottom: 16,
  },
  settingsList: {
    gap: 8,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 8,
  },
  settingItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  settingIcon: {
    fontSize: 20,
    marginLeft: 12,
    width: 32,
  },
  settingTitle: {
    fontSize: 14,
    flex: 1,
  },
  settingArrow: {
    fontSize: 16,
  },
  logoutCard: {
    marginHorizontal: 16,
    marginBottom: 32,
    padding: 20,
    alignItems: 'center',
  },
  logoutButton: {
    width: '100%',
    marginBottom: 16,
  },
  versionText: {
    fontSize: 10,
    textAlign: 'center',
  },
});

export default ProfileScreen;
