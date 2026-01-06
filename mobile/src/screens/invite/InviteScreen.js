// mobile/src/screens/invite/InviteScreen.js
import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  Share,
  Clipboard,
  Platform,
  Linking,
  Dimensions,
} from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import api from '../../services/api';

// کامپوننت‌های UI
import LoadingSpinner, { PageLoader } from '../../components/ui/LoadingSpinner';
import Button, { PrimaryButton, SecondaryButton, SuccessButton } from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import Input from '../../components/ui/Input';
import { useTheme } from '../../context/ThemeContext';

const { width } = Dimensions.get('window');

const InviteScreen = () => {
  const { user } = useAuth();
  const { showSuccess, showError, showInfo } = useToast();
  const theme = useTheme();

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [referralData, setReferralData] = useState({
    totalInvites: 0,
    activeInvites: 0,
    pendingInvites: 0,
    totalEarned: 0,
    referralCode: '',
    referralLink: '',
    recentInvites: [],
  });
  const [referralInput, setReferralInput] = useState('');
  const [stats, setStats] = useState({
    todayInvites: 0,
    weekInvites: 0,
    monthInvites: 0,
    topReferrer: false,
  });

  useEffect(() => {
    loadReferralData();
  }, []);

  const loadReferralData = async () => {
    try {
      setLoading(true);
      
      // بارگذاری موازی داده‌ها
      const [referralRes, statsRes] = await Promise.all([
        api.referrals.getReferralInfo(user.id),
        api.referrals.getReferralStats(user.id),
      ]);

      if (referralRes.success) {
        setReferralData(referralRes.data);
      }

      if (statsRes.success) {
        setStats(statsRes.data);
      }
    } catch (error) {
      console.error('Error loading referral data:', error);
      showError('خطا در بارگذاری اطلاعات دعوت');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadReferralData();
  };

  const copyToClipboard = async (text) => {
    try {
      if (Platform.OS === 'web') {
        await navigator.clipboard.writeText(text);
      } else {
        Clipboard.setString(text);
      }
      showSuccess('متن با موفقیت کپی شد!');
    } catch (error) {
      console.error('Error copying to clipboard:', error);
      showError('خطا در کپی کردن متن');
    }
  };

  const shareReferralLink = async () => {
    const message = `به SODmAX CityVerse بپیوندید! 🌟\n\nبا استفاده از لینک زیر ثبت‌نام کنید و ۱۰۰۰ SOD هدیه دریافت کنید:\n${referralData.referralLink}\n\nکد دعوت: ${referralData.referralCode}`;
    
    try {
      if (Platform.OS === 'web') {
        if (navigator.share) {
          await navigator.share({
            title: 'دعوت به SODmAX CityVerse',
            text: message,
            url: referralData.referralLink,
          });
        } else {
          copyToClipboard(message);
        }
      } else {
        await Share.share({
          message,
          title: 'دعوت به SODmAX CityVerse',
        });
      }
    } catch (error) {
      console.error('Error sharing:', error);
      copyToClipboard(message);
    }
  };

  const shareViaWhatsApp = () => {
    const message = `به SODmAX CityVerse بپیوندید! 🌟\n\nبا استفاده از لینک زیر ثبت‌نام کنید و ۱۰۰۰ SOD هدیه دریافت کنید:\n${referralData.referralLink}\n\nکد دعوت: ${referralData.referralCode}`;
    const url = `whatsapp://send?text=${encodeURIComponent(message)}`;
    
    Linking.openURL(url).catch(() => {
      showInfo('واتساپ نصب نیست یا قابل دسترسی نمی‌باشد');
      copyToClipboard(message);
    });
  };

  const shareViaTelegram = () => {
    const message = `به SODmAX CityVerse بپیوندید! 🌟\n\nبا استفاده از لینک زیر ثبت‌نام کنید و ۱۰۰۰ SOD هدیه دریافت کنید:\n${referralData.referralLink}\n\nکد دعوت: ${referralData.referralCode}`;
    const url = `tg://msg?text=${encodeURIComponent(message)}`;
    
    Linking.openURL(url).catch(() => {
      showInfo('تلگرام نصب نیست یا قابل دسترسی نمی‌باشد');
      copyToClipboard(message);
    });
  };

  const handleAddReferral = async () => {
    if (!referralInput.trim()) {
      showError('لطفاً شماره موبایل دوست خود را وارد کنید');
      return;
    }

    try {
      const response = await api.referrals.addReferral(user.id, referralInput.trim());
      
      if (response.success) {
        showSuccess('دعوت با موفقیت ثبت شد! پس از ثبت‌نام دوستتان، پاداش دریافت خواهید کرد.');
        setReferralInput('');
        loadReferralData();
      } else {
        showError(response.message || 'خطا در ثبت دعوت');
      }
    } catch (error) {
      console.error('Error adding referral:', error);
      showError('خطا در ثبت دعوت');
    }
  };

  const handleClaimReward = async (referralId) => {
    try {
      const response = await api.referrals.claimReferralReward(user.id, referralId);
      
      if (response.success) {
        showSuccess('پاداش دعوت با موفقیت دریافت شد!');
        loadReferralData();
      } else {
        showError(response.message || 'خطا در دریافت پاداش');
      }
    } catch (error) {
      console.error('Error claiming reward:', error);
      showError('خطا در دریافت پاداش');
    }
  };

  const formatCurrency = (amount) => {
    return amount.toLocaleString('fa-IR');
  };

  if (loading && !refreshing) {
    return <PageLoader text="در حال بارگذاری اطلاعات دعوت..." />;
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
        {/* هدر صفحه */}
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <Text style={[styles.headerTitle, { color: theme.colors.text }]}>
              دعوت دوستان و کسب درآمد
            </Text>
            <Text style={[styles.headerSubtitle, { color: theme.colors.textSecondary }]}>
              دعوت کنید، پاداش بگیرید!
            </Text>
          </View>
        </View>

        {/* آمار کلی */}
        <Card style={styles.statsCard}>
          <View style={styles.statsGrid}>
            <View style={styles.statItem}>
              <Text style={[styles.statValue, { color: theme.colors.primary }]}>
                {referralData.totalInvites}
              </Text>
              <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>
                کل دعوت‌ها
              </Text>
            </View>
            
            <View style={styles.statItem}>
              <Text style={[styles.statValue, { color: theme.colors.success }]}>
                {referralData.activeInvites}
              </Text>
              <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>
                فعال
              </Text>
            </View>
            
            <View style={styles.statItem}>
              <Text style={[styles.statValue, { color: theme.colors.accent }]}>
                {referralData.pendingInvites}
              </Text>
              <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>
                در انتظار
              </Text>
            </View>
            
            <View style={styles.statItem}>
              <Text style={[styles.statValue, { color: theme.colors.secondary }]}>
                {formatCurrency(referralData.totalEarned)}
              </Text>
              <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>
                درآمد کل
              </Text>
            </View>
          </View>
        </Card>

        {/* لینک دعوت */}
        <Card style={styles.linkCard}>
          <Text style={[styles.cardTitle, { color: theme.colors.text }]}>
            لینک دعوت اختصاصی شما
          </Text>
          
          <View style={styles.linkContainer}>
            <TouchableOpacity
              style={[styles.linkBox, { backgroundColor: theme.colors.surface }]}
              onPress={() => copyToClipboard(referralData.referralLink)}
              activeOpacity={0.8}
            >
              <Text style={[styles.linkText, { color: theme.colors.primary }]} numberOfLines={2}>
                {referralData.referralLink}
              </Text>
            </TouchableOpacity>
            
            <PrimaryButton
              title="کپی لینک"
              onPress={() => copyToClipboard(referralData.referralLink)}
              icon="copy"
              style={styles.copyButton}
            />
          </View>
          
          <Text style={[styles.linkNote, { color: theme.colors.textSecondary }]}>
            این لینک را برای دوستان خود ارسال کنید
          </Text>
        </Card>

        {/* کد دعوت */}
        <Card style={styles.codeCard}>
          <Text style={[styles.cardTitle, { color: theme.colors.text }]}>
            کد دعوت اختصاصی
          </Text>
          
          <View style={styles.codeContainer}>
            <View style={[styles.codeBox, { backgroundColor: theme.colors.surface }]}>
              <Text style={[styles.codeText, { color: theme.colors.text }]}>
                {referralData.referralCode}
              </Text>
            </View>
            
            <SecondaryButton
              title="کپی کد"
              onPress={() => copyToClipboard(referralData.referralCode)}
              icon="copy"
              style={styles.copyCodeButton}
            />
          </View>
          
          <Text style={[styles.codeNote, { color: theme.colors.textSecondary }]}>
            دوستان می‌توانند این کد را در صفحه ثبت‌نام وارد کنند
          </Text>
        </Card>

        {/* دکمه‌های اشتراک‌گذاری */}
        <Card style={styles.shareCard}>
          <Text style={[styles.cardTitle, { color: theme.colors.text }]}>
            اشتراک‌گذاری سریع
          </Text>
          
          <View style={styles.shareGrid}>
            <TouchableOpacity
              style={[styles.shareButton, { backgroundColor: '#25D366' }]}
              onPress={shareViaWhatsApp}
              activeOpacity={0.8}
            >
              <Text style={styles.shareButtonIcon}>📱</Text>
              <Text style={styles.shareButtonText}>واتساپ</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.shareButton, { backgroundColor: '#0088cc' }]}
              onPress={shareViaTelegram}
              activeOpacity={0.8}
            >
              <Text style={styles.shareButtonIcon}>✈️</Text>
              <Text style={styles.shareButtonText}>تلگرام</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.shareButton, { backgroundColor: theme.colors.primary }]}
              onPress={shareReferralLink}
              activeOpacity={0.8}
            >
              <Text style={styles.shareButtonIcon}>🔗</Text>
              <Text style={styles.shareButtonText}>اشتراک</Text>
            </TouchableOpacity>
          </View>
        </Card>

        {/* دعوت با شماره موبایل */}
        <Card style={styles.inviteCard}>
          <Text style={[styles.cardTitle, { color: theme.colors.text }]}>
            دعوت مستقیم با شماره موبایل
          </Text>
          
          <Text style={[styles.inviteDesc, { color: theme.colors.textSecondary }]}>
            شماره موبایل دوست خود را وارد کنید تا دعوت‌نامه برای او ارسال شود
          </Text>
          
          <View style={styles.inviteForm}>
            <Input
              placeholder="مثلاً: 09123456789"
              value={referralInput}
              onChangeText={setReferralInput}
              keyboardType="phone-pad"
              maxLength={11}
              icon="phone"
              style={styles.inviteInput}
            />
            
            <SuccessButton
              title="ارسال دعوت"
              onPress={handleAddReferral}
              icon="send"
              disabled={!referralInput.trim()}
              style={styles.inviteButton}
            />
          </View>
        </Card>

        {/* پاداش دعوت */}
        <Card style={styles.rewardCard}>
          <View style={styles.rewardHeader}>
            <View style={[styles.rewardIcon, { backgroundColor: theme.colors.success }]}>
              <Text style={styles.rewardIconText}>🎁</Text>
            </View>
            <View style={styles.rewardInfo}>
              <Text style={[styles.rewardTitle, { color: theme.colors.text }]}>
                پاداش دعوت
              </Text>
              <Text style={[styles.rewardDesc, { color: theme.colors.textSecondary }]}>
                به ازای هر دعوت موفق
              </Text>
            </View>
          </View>
          
          <View style={styles.rewardDetails}>
            <View style={styles.rewardDetail}>
              <Text style={[styles.rewardDetailLabel, { color: theme.colors.textSecondary }]}>
                پاداش شما
              </Text>
              <Text style={[styles.rewardDetailValue, { color: theme.colors.success }]}>
                ۱,۰۰۰ تومان
              </Text>
            </View>
            
            <View style={styles.rewardDetail}>
              <Text style={[styles.rewardDetailLabel, { color: theme.colors.textSecondary }]}>
                پاداش دوست
              </Text>
              <Text style={[styles.rewardDetailValue, { color: theme.colors.primary }]}>
                ۵۰۰ SOD
              </Text>
            </View>
          </View>
        </Card>

        {/* دعوت‌های اخیر */}
        <Card style={styles.recentCard}>
          <View style={styles.recentHeader}>
            <Text style={[styles.cardTitle, { color: theme.colors.text }]}>
              دعوت‌های اخیر
            </Text>
            
            <Button
              title="مشاهده همه"
              onPress={() => showInfo('صفحه لیست کامل دعوت‌ها به زودی فعال خواهد شد')}
              variant="ghost"
              size="small"
              textStyle={{ color: theme.colors.primary, fontSize: 12 }}
            />
          </View>
          
          {referralData.recentInvites.length === 0 ? (
            <View style={styles.emptyRecent}>
              <Text style={[styles.emptyRecentText, { color: theme.colors.textSecondary }]}>
                هنوز دعوتی ثبت نکرده‌اید
              </Text>
              <Text style={[styles.emptyRecentSubtext, { color: theme.colors.textTertiary }]}>
                با دعوت دوستان، لیست دعوت‌های شما اینجا نمایش داده می‌شود
              </Text>
            </View>
          ) : (
            <View style={styles.recentList}>
              {referralData.recentInvites.slice(0, 3).map((invite, index) => (
                <View key={index} style={styles.recentItem}>
                  <View style={styles.recentItemLeft}>
                    <View style={[
                      styles.recentAvatar,
                      { backgroundColor: invite.active ? theme.colors.success : theme.colors.gray }
                    ]}>
                      <Text style={styles.recentAvatarText}>
                        {invite.name.charAt(0)}
                      </Text>
                    </View>
                    <View style={styles.recentInfo}>
                      <Text style={[styles.recentName, { color: theme.colors.text }]}>
                        {invite.name}
                      </Text>
                      <Text style={[styles.recentPhone, { color: theme.colors.textSecondary }]}>
                        {invite.phone}
                      </Text>
                    </View>
                  </View>
                  
                  <View style={styles.recentItemRight}>
                    <Text style={[
                      styles.recentStatus,
                      { 
                        color: invite.active ? theme.colors.success : 
                               invite.pending ? theme.colors.warning : theme.colors.error 
                      }
                    ]}>
                      {invite.active ? 'فعال' : invite.pending ? 'در انتظار' : 'رد شده'}
                    </Text>
                    {invite.active && (
                      <SuccessButton
                        title="دریافت پاداش"
                        onPress={() => handleClaimReward(invite.id)}
                        size="small"
                        style={styles.claimButton}
                      />
                    )}
                  </View>
                </View>
              ))}
            </View>
          )}
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
  header: {
    padding: 20,
    paddingTop: 40,
    paddingBottom: 10,
  },
  headerContent: {
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '900',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
  },
  statsCard: {
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 20,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  statItem: {
    alignItems: 'center',
    width: '48%',
    marginBottom: 16,
  },
  statValue: {
    fontSize: 24,
    fontWeight: '900',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
  },
  linkCard: {
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 20,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '900',
    marginBottom: 16,
  },
  linkContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  linkBox: {
    flex: 1,
    padding: 12,
    borderRadius: 12,
    marginLeft: 8,
  },
  linkText: {
    fontSize: 12,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    textAlign: 'center',
  },
  copyButton: {
    minWidth: 100,
  },
  linkNote: {
    fontSize: 11,
    textAlign: 'center',
  },
  codeCard: {
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 20,
  },
  codeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  codeBox: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    marginLeft: 8,
  },
  codeText: {
    fontSize: 20,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    fontWeight: '900',
    textAlign: 'center',
    letterSpacing: 2,
  },
  copyCodeButton: {
    minWidth: 100,
  },
  codeNote: {
    fontSize: 11,
    textAlign: 'center',
  },
  shareCard: {
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 20,
  },
  shareGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  shareButton: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 16,
    borderRadius: 12,
  },
  shareButtonIcon: {
    fontSize: 24,
    marginBottom: 8,
  },
  shareButtonText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '700',
  },
  inviteCard: {
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 20,
  },
  inviteDesc: {
    fontSize: 13,
    lineHeight: 20,
    marginBottom: 16,
  },
  inviteForm: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  inviteInput: {
    flex: 1,
  },
  inviteButton: {
    minWidth: 120,
  },
  rewardCard: {
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 20,
  },
  rewardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  rewardIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 12,
  },
  rewardIconText: {
    fontSize: 24,
  },
  rewardInfo: {
    flex: 1,
  },
  rewardTitle: {
    fontSize: 16,
    fontWeight: '900',
    marginBottom: 4,
  },
  rewardDesc: {
    fontSize: 12,
  },
  rewardDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 16,
  },
  rewardDetail: {
    flex: 1,
    alignItems: 'center',
    padding: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
  },
  rewardDetailLabel: {
    fontSize: 11,
    marginBottom: 4,
  },
  rewardDetailValue: {
    fontSize: 16,
    fontWeight: '900',
  },
  recentCard: {
    marginHorizontal: 16,
    marginBottom: 32,
    padding: 20,
  },
  recentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  emptyRecent: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  emptyRecentText: {
    fontSize: 14,
    marginBottom: 8,
  },
  emptyRecentSubtext: {
    fontSize: 12,
    textAlign: 'center',
  },
  recentList: {
    gap: 12,
  },
  recentItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderRadius: 12,
  },
  recentItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  recentAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 12,
  },
  recentAvatarText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '700',
  },
  recentInfo: {
    flex: 1,
  },
  recentName: {
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 2,
  },
  recentPhone: {
    fontSize: 11,
  },
  recentItemRight: {
    alignItems: 'flex-end',
  },
  recentStatus: {
    fontSize: 11,
    fontWeight: '700',
    marginBottom: 4,
  },
  claimButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
});

export default InviteScreen;
