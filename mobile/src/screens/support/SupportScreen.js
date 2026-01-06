[file name]: mobile/src/screens/support/SupportScreen.js
[file content begin]
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Linking,
  Alert,
} from 'react-native';
import { useTheme } from '@context/ThemeContext';
import { useToast } from '@context/ToastContext';
import Card from '@components/ui/Card';
import Input from '@components/ui/Input';
import Button from '@components/ui/Button';
import LoadingSpinner from '@components/ui/LoadingSpinner';
import Header from '@components/common/Header';

const SupportScreen = ({ navigation }) => {
  const { theme } = useTheme();
  const { showToast } = useToast();
  
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('faq');

  // سوالات متداول
  const faqItems = [
    {
      id: 1,
      question: 'چگونه می‌توانم SOD استخراج کنم؟',
      answer: 'برای استخراج SOD کافیست به بخش "مرکز استخراج" بروید و روی ماینر کلیک کنید. همچنین می‌توانید استخراج خودکار را فعال کنید.',
    },
    {
      id: 2,
      question: 'چگونه می‌توانم موجودی خود را برداشت کنم؟',
      answer: 'به بخش "کیف پول" بروید و روی دکمه "برداشت" کلیک کنید. حداقل مبلغ برداشت ۱۰,۰۰۰ تومان است و طی ۲۴ ساعت کاری واریز می‌شود.',
    },
    {
      id: 3,
      question: 'چگونه دوستانم را دعوت کنم؟',
      answer: 'به بخش "دعوت دوستان" بروید و لینک دعوت یا کد اختصاصی خود را برای دوستانتان ارسال کنید.',
    },
    {
      id: 4,
      question: 'پاداش دعوت چقدر است؟',
      answer: 'به ازای هر دعوت موفق و فعال، ۱,۰۰۰ تومان پاداش دریافت می‌کنید.',
    },
    {
      id: 5,
      question: 'چگونه سطح کاربری خود را افزایش دهم؟',
      answer: 'با انجام مأموریت‌ها، دعوت دوستان و ارتقاء ماینر می‌توانید سطح خود را افزایش دهید.',
    },
  ];

  // راه‌های ارتباطی
  const contactMethods = [
    {
      id: 1,
      title: 'چت آنلاین',
      description: 'پاسخگویی ۲۴ ساعته',
      icon: '💬',
      action: () => startChatSupport(),
    },
    {
      id: 2,
      title: 'تماس تلفنی',
      description: '۰۲۱-۱۲۳۴۵۶۷۸',
      icon: '📞',
      action: () => callSupport(),
    },
    {
      id: 3,
      title: 'ایمیل',
      description: 'support@sodmax.city',
      icon: '📧',
      action: () => emailSupport(),
    },
    {
      id: 4,
      title: 'تلگرام',
      description: '@sodmax_support',
      icon: '📱',
      action: () => telegramSupport(),
    },
  ];

  // آموزش‌ها
  const tutorials = [
    {
      id: 1,
      title: 'آموزش کامل استخراج',
      duration: '۵ دقیقه',
      icon: '⚡',
    },
    {
      id: 2,
      title: 'نحوه دعوت دوستان',
      duration: '۳ دقیقه',
      icon: '🤝',
    },
    {
      id: 3,
      title: 'راهنمای کیف پول',
      duration: '۴ دقیقه',
      icon: '💰',
    },
    {
      id: 4,
      title: 'آموزش مأموریت‌ها',
      duration: '۶ دقیقه',
      icon: '🎯',
    },
  ];

  const startChatSupport = () => {
    showToast('💬 چت آنلاین', 'اتصال به اپراتور...', 'info');
    // در اینجا می‌توانید منطق اتصال به چت آنلاین را پیاده‌سازی کنید
  };

  const callSupport = () => {
    Linking.openURL('tel:+982112345678').catch(() => {
      showToast('⚠️ خطا', 'امکان برقراری تماس وجود ندارد', 'error');
    });
  };

  const emailSupport = () => {
    Linking.openURL('mailto:support@sodmax.city').catch(() => {
      showToast('⚠️ خطا', 'امکان ارسال ایمیل وجود ندارد', 'error');
    });
  };

  const telegramSupport = () => {
    Linking.openURL('https://t.me/sodmax_support').catch(() => {
      showToast('⚠️ خطا', 'امکان باز کردن تلگرام وجود ندارد', 'error');
    });
  };

  const handleSubmitTicket = () => {
    if (!name.trim() || !email.trim() || !subject.trim() || !message.trim()) {
      showToast('⚠️ خطا', 'لطفاً تمام فیلدها را پر کنید', 'error');
      return;
    }

    setLoading(true);
    
    // شبیه‌سازی ارسال تیکت
    setTimeout(() => {
      setLoading(false);
      showToast('✅ تیکت ارسال شد', 'تیکت پشتیبانی شما با موفقیت ثبت شد. به زودی با شما تماس خواهیم گرفت.', 'success');
      
      // پاک کردن فرم
      setName('');
      setEmail('');
      setSubject('');
      setMessage('');
    }, 2000);
  };

  const renderFAQ = () => (
    <View style={styles.section}>
      <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
        ❓ سوالات متداول
      </Text>
      
      {faqItems.map((item) => (
        <Card key={item.id} style={styles.faqCard}>
          <TouchableOpacity
            onPress={() => {
              Alert.alert(item.question, item.answer, [{ text: 'متوجه شدم' }]);
            }}
          >
            <View style={styles.faqItem}>
              <Text style={[styles.question, { color: theme.colors.text }]}>
                {item.question}
              </Text>
              <Text style={[styles.answer, { color: theme.colors.secondary }]}>
                {item.answer.substring(0, 50)}...
              </Text>
              <Text style={[styles.readMore, { color: theme.colors.primary }]}>
                برای مشاهده کامل کلیک کنید
              </Text>
            </View>
          </TouchableOpacity>
        </Card>
      ))}
    </View>
  );

  const renderContact = () => (
    <View style={styles.section}>
      <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
        📞 راه‌های ارتباطی
      </Text>
      
      <View style={styles.contactGrid}>
        {contactMethods.map((method) => (
          <TouchableOpacity
            key={method.id}
            style={[styles.contactCard, { backgroundColor: theme.colors.card }]}
            onPress={method.action}
          >
            <Text style={styles.contactIcon}>{method.icon}</Text>
            <Text style={[styles.contactTitle, { color: theme.colors.text }]}>
              {method.title}
            </Text>
            <Text style={[styles.contactDesc, { color: theme.colors.secondary }]}>
              {method.description}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  const renderTutorials = () => (
    <View style={styles.section}>
      <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
        🎬 آموزش‌ها
      </Text>
      
      {tutorials.map((tutorial) => (
        <Card key={tutorial.id} style={styles.tutorialCard}>
          <View style={styles.tutorialRow}>
            <View style={styles.tutorialIconContainer}>
              <Text style={styles.tutorialIcon}>{tutorial.icon}</Text>
            </View>
            <View style={styles.tutorialInfo}>
              <Text style={[styles.tutorialTitle, { color: theme.colors.text }]}>
                {tutorial.title}
              </Text>
              <Text style={[styles.tutorialDuration, { color: theme.colors.secondary }]}>
                ⏱️ {tutorial.duration}
              </Text>
            </View>
            <TouchableOpacity
              style={[styles.playButton, { backgroundColor: theme.colors.primary }]}
            >
              <Text style={styles.playButtonText}>▶️</Text>
            </TouchableOpacity>
          </View>
        </Card>
      ))}
    </View>
  );

  const renderTicketForm = () => (
    <View style={styles.section}>
      <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
        📝 ارسال تیکت پشتیبانی
      </Text>
      
      <Card>
        <Input
          label="نام و نام خانوادگی"
          value={name}
          onChangeText={setName}
          placeholder="نام خود را وارد کنید"
          icon="user"
        />
        
        <Input
          label="ایمیل"
          value={email}
          onChangeText={setEmail}
          placeholder="example@email.com"
          keyboardType="email-address"
          icon="mail"
        />
        
        <Input
          label="موضوع"
          value={subject}
          onChangeText={setSubject}
          placeholder="موضوع درخواست خود را وارد کنید"
          icon="file-text"
        />
        
        <Input
          label="پیام"
          value={message}
          onChangeText={setMessage}
          placeholder="پیام خود را با جزئیات بنویسید..."
          multiline
          numberOfLines={4}
          icon="message-square"
        />
        
        <Button
          title={loading ? 'در حال ارسال...' : 'ارسال تیکت'}
          onPress={handleSubmitTicket}
          disabled={loading}
          icon={loading ? null : 'send'}
          style={styles.submitButton}
        />
      </Card>
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Header
        title="پشتیبانی"
        showBackButton={true}
        onBackPress={() => navigation.goBack()}
      />
      
      <View style={styles.tabContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <TouchableOpacity
            style={[
              styles.tab,
              activeTab === 'faq' && [styles.activeTab, { borderBottomColor: theme.colors.primary }],
            ]}
            onPress={() => setActiveTab('faq')}
          >
            <Text
              style={[
                styles.tabText,
                activeTab === 'faq' && { color: theme.colors.primary },
              ]}
            >
              سوالات متداول
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[
              styles.tab,
              activeTab === 'contact' && [styles.activeTab, { borderBottomColor: theme.colors.primary }],
            ]}
            onPress={() => setActiveTab('contact')}
          >
            <Text
              style={[
                styles.tabText,
                activeTab === 'contact' && { color: theme.colors.primary },
              ]}
            >
              تماس با ما
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[
              styles.tab,
              activeTab === 'tutorials' && [styles.activeTab, { borderBottomColor: theme.colors.primary }],
            ]}
            onPress={() => setActiveTab('tutorials')}
          >
            <Text
              style={[
                styles.tabText,
                activeTab === 'tutorials' && { color: theme.colors.primary },
              ]}
            >
              آموزش‌ها
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[
              styles.tab,
              activeTab === 'ticket' && [styles.activeTab, { borderBottomColor: theme.colors.primary }],
            ]}
            onPress={() => setActiveTab('ticket')}
          >
            <Text
              style={[
                styles.tabText,
                activeTab === 'ticket' && { color: theme.colors.primary },
              ]}
            >
              ارسال تیکت
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </View>
      
      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {activeTab === 'faq' && renderFAQ()}
        {activeTab === 'contact' && renderContact()}
        {activeTab === 'tutorials' && renderTutorials()}
        {activeTab === 'ticket' && renderTicketForm()}
        
        <View style={styles.infoBox}>
          <Text style={[styles.infoTitle, { color: theme.colors.text }]}>
            ℹ️ اطلاعات مفید
          </Text>
          <Text style={[styles.infoText, { color: theme.colors.secondary }]}>
            • ساعات کاری: ۲۴ ساعته{'\n'}
            • پاسخگویی: حداکثر ۲۴ ساعت{'\n'}
            • زبان پشتیبانی: فارسی و انگلیسی{'\n'}
            • شماره اضطراری: ۰۹۱۲۳۴۵۶۷۸۹
          </Text>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  tabContainer: {
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.1)',
  },
  tab: {
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  activeTab: {
    borderBottomWidth: 3,
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#9ca3af',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
    marginTop: 8,
  },
  faqCard: {
    marginBottom: 12,
  },
  faqItem: {
    padding: 4,
  },
  question: {
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 6,
  },
  answer: {
    fontSize: 13,
    lineHeight: 20,
    marginBottom: 4,
  },
  readMore: {
    fontSize: 11,
    marginTop: 4,
  },
  contactGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  contactCard: {
    width: '48%',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 12,
  },
  contactIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  contactTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 4,
    textAlign: 'center',
  },
  contactDesc: {
    fontSize: 11,
    textAlign: 'center',
  },
  tutorialCard: {
    marginBottom: 12,
  },
  tutorialRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  tutorialIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,102,255,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  tutorialIcon: {
    fontSize: 20,
  },
  tutorialInfo: {
    flex: 1,
  },
  tutorialTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 2,
  },
  tutorialDuration: {
    fontSize: 12,
  },
  playButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  playButtonText: {
    fontSize: 16,
  },
  submitButton: {
    marginTop: 16,
  },
  infoBox: {
    padding: 16,
    borderRadius: 12,
    backgroundColor: 'rgba(0,102,255,0.05)',
    marginTop: 8,
    marginBottom: 32,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  infoText: {
    fontSize: 13,
    lineHeight: 22,
  },
});

export default SupportScreen;
[file content end]
