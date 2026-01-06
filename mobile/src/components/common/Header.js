// mobile/src/components/common/Header.js
import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Animated,
  StatusBar,
  Platform,
  Dimensions,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';

const { width } = Dimensions.get('window');

const Header = ({
  title,
  subtitle,
  showBack = true,
  showMenu = false,
  showNotifications = true,
  showProfile = true,
  showBalance = false,
  rightActions,
  leftActions,
  transparent = false,
  elevated = true,
  style,
  ...props
}) => {
  const navigation = useNavigation();
  const route = useRoute();
  const { user } = useAuth();
  const theme = useTheme();
  
  const [scrollY] = useState(new Animated.Value(0));
  const [notificationCount, setNotificationCount] = useState(3);
  const [isScrolled, setIsScrolled] = useState(false);

  // انیمیشن اسکرول هدر
  const headerHeight = scrollY.interpolate({
    inputRange: [0, 100],
    outputRange: [80, 60],
    extrapolate: 'clamp',
  });

  const headerOpacity = scrollY.interpolate({
    inputRange: [0, 50],
    outputRange: [1, 0.9],
    extrapolate: 'clamp',
  });

  const headerElevation = scrollY.interpolate({
    inputRange: [0, 1],
    outputRange: [0, elevated ? 4 : 0],
    extrapolate: 'clamp',
  });

  const handleBack = () => {
    if (navigation.canGoBack()) {
      navigation.goBack();
    }
  };

  const handleMenu = () => {
    navigation.toggleDrawer?.();
  };

  const handleNotifications = () => {
    navigation.navigate('Notifications');
  };

  const handleProfile = () => {
    navigation.navigate('Profile');
  };

  const getRouteTitle = () => {
    if (title) return title;
    
    switch (route.name) {
      case 'Dashboard':
        return 'داشبورد';
      case 'Mining':
        return 'استخراج';
      case 'Wallet':
        return 'کیف پول';
      case 'Missions':
        return 'مأموریت‌ها';
      case 'Rewards':
        return 'پاداش‌ها';
      case 'Invite':
        return 'دعوت دوستان';
      case 'Profile':
        return 'پروفایل';
      case 'Settings':
        return 'تنظیمات';
      case 'Support':
        return 'پشتیبانی';
      default:
        return route.name;
    }
  };

  const renderLeftActions = () => {
    if (leftActions) {
      return leftActions;
    }

    return (
      <View style={styles.leftActions}>
        {showBack && navigation.canGoBack() && (
          <TouchableOpacity
            style={[styles.actionButton, styles.backButton]}
            onPress={handleBack}
            activeOpacity={0.7}
          >
            <Text style={[styles.actionIcon, { color: theme.colors.text }]}>
              ←
            </Text>
          </TouchableOpacity>
        )}
        
        {showMenu && (
          <TouchableOpacity
            style={[styles.actionButton, styles.menuButton]}
            onPress={handleMenu}
            activeOpacity={0.7}
          >
            <Text style={[styles.actionIcon, { color: theme.colors.text }]}>
              ☰
            </Text>
          </TouchableOpacity>
        )}
      </View>
    );
  };

  const renderRightActions = () => {
    if (rightActions) {
      return rightActions;
    }

    return (
      <View style={styles.rightActions}>
        {showBalance && user && (
          <TouchableOpacity
            style={[styles.balanceButton, { backgroundColor: theme.colors.primary + '20' }]}
            onPress={() => navigation.navigate('Wallet')}
            activeOpacity={0.7}
          >
            <Text style={[styles.balanceText, { color: theme.colors.primary }]}>
              {user.balance?.toLocaleString('fa-IR') || 0} SOD
            </Text>
          </TouchableOpacity>
        )}
        
        {showNotifications && (
          <TouchableOpacity
            style={styles.actionButton}
            onPress={handleNotifications}
            activeOpacity={0.7}
          >
            <Text style={[styles.actionIcon, { color: theme.colors.text }]}>
              🔔
            </Text>
            {notificationCount > 0 && (
              <View style={[styles.notificationBadge, { backgroundColor: theme.colors.accent }]}>
                <Text style={styles.notificationCount}>
                  {notificationCount > 9 ? '9+' : notificationCount}
                </Text>
              </View>
            )}
          </TouchableOpacity>
        )}
        
        {showProfile && user && (
          <TouchableOpacity
            style={styles.profileButton}
            onPress={handleProfile}
            activeOpacity={0.7}
          >
            {user.avatar ? (
              <Image
                source={{ uri: user.avatar }}
                style={styles.profileImage}
              />
            ) : (
              <View style={[styles.profileAvatar, { backgroundColor: theme.colors.primary }]}>
                <Text style={styles.profileInitial}>
                  {user.name?.charAt(0) || 'ع'}
                </Text>
              </View>
            )}
          </TouchableOpacity>
        )}
      </View>
    );
  };

  const headerTitle = getRouteTitle();

  return (
    <Animated.View
      style={[
        styles.container,
        {
          height: headerHeight,
          opacity: headerOpacity,
          backgroundColor: transparent ? 'transparent' : theme.colors.surface,
          elevation: headerElevation,
          shadowOpacity: elevated ? 0.1 : 0,
        },
        style,
      ]}
    >
      <StatusBar
        backgroundColor={transparent ? 'transparent' : theme.colors.surface}
        barStyle={theme.isDark ? 'light-content' : 'dark-content'}
        translucent={transparent}
      />
      
      <View style={styles.content}>
        {/* اقدامات سمت چپ */}
        {renderLeftActions()}
        
        {/* عنوان */}
        <View style={styles.titleContainer}>
          <Text style={[styles.title, { color: theme.colors.text }]} numberOfLines={1}>
            {headerTitle}
          </Text>
          
          {subtitle && (
            <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]} numberOfLines={1}>
              {subtitle}
            </Text>
          )}
        </View>
        
        {/* اقدامات سمت راست */}
        {renderRightActions()}
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    paddingTop: Platform.OS === 'ios' ? 40 : StatusBar.currentHeight,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
    zIndex: 100,
  },
  content: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
  },
  leftActions: {
    flexDirection: 'row',
    alignItems: 'center',
    minWidth: 80,
  },
  rightActions: {
    flexDirection: 'row',
    alignItems: 'center',
    minWidth: 80,
    justifyContent: 'flex-end',
  },
  actionButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 4,
    position: 'relative',
  },
  backButton: {
    marginRight: 8,
  },
  menuButton: {
    marginRight: 4,
  },
  actionIcon: {
    fontSize: 20,
  },
  notificationBadge: {
    position: 'absolute',
    top: 2,
    left: 2,
    width: 18,
    height: 18,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  notificationCount: {
    color: 'white',
    fontSize: 10,
    fontWeight: '900',
  },
  balanceButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    marginRight: 8,
  },
  balanceText: {
    fontSize: 12,
    fontWeight: '700',
  },
  profileButton: {
    marginLeft: 8,
  },
  profileImage: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  profileAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  profileInitial: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  titleContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: '900',
    textAlign: 'center',
    marginBottom: 2,
  },
  subtitle: {
    fontSize: 11,
    textAlign: 'center',
  },
});

// انواع مختلف هدر
export const DashboardHeader = (props) => (
  <Header
    showBack={false}
    showMenu={true}
    showBalance={true}
    {...props}
  />
);

export const MiningHeader = (props) => (
  <Header
    title="استخراج SOD"
    subtitle="مرکز ماینینگ"
    showBalance={true}
    {...props}
  />
);

export const WalletHeader = (props) => (
  <Header
    title="کیف پول"
    subtitle="مدیریت موجودی و تراکنش‌ها"
    {...props}
  />
);

export const MissionsHeader = (props) => (
  <Header
    title="مأموریت‌ها"
    subtitle="انجام مأموریت و دریافت پاداش"
    {...props}
  />
);

export const RewardsHeader = (props) => (
  <Header
    title="پاداش‌ها"
    subtitle="جوایز و دستاوردها"
    {...props}
  />
);

export const InviteHeader = (props) => (
  <Header
    title="دعوت دوستان"
    subtitle="دعوت کنید، پاداش بگیرید"
    {...props}
  />
);

export const ProfileHeader = (props) => (
  <Header
    title="پروفایل"
    subtitle="مدیریت حساب کاربری"
    {...props}
  />
);

export const SettingsHeader = (props) => (
  <Header
    title="تنظیمات"
    subtitle="شخصی‌سازی برنامه"
    {...props}
  />
);

export const TransparentHeader = (props) => (
  <Header
    transparent={true}
    elevated={false}
    {...props}
  />
);

export default Header;
