import { Dimensions, Platform, StatusBar } from 'react-native';

const { width, height } = Dimensions.get('window');

export const Layout = {
  // Screen Dimensions
  window: {
    width,
    height,
  },
  
  // Platform
  isSmallDevice: width < 375,
  isMediumDevice: width >= 375 && width < 414,
  isLargeDevice: width >= 414,
  isIOS: Platform.OS === 'ios',
  isAndroid: Platform.OS === 'android',
  
  // Status Bar
  statusBarHeight: Platform.select({
    ios: 44,
    android: StatusBar.currentHeight,
    default: 0,
  }),
  
  // Header
  headerHeight: Platform.select({
    ios: 44,
    android: 56,
    default: 56,
  }),
  
  // Bottom Tab
  bottomTabHeight: Platform.select({
    ios: 83,
    android: 60,
    default: 60,
  }),
  
  // Spacing
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 40,
    xxxl: 48,
  },
  
  // Border Radius
  borderRadius: {
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 20,
    xxl: 24,
    round: 9999,
  },
  
  // Shadow
  shadow: {
    sm: {
      shadowColor: '#000',
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: 0.25,
      shadowRadius: 3.84,
      elevation: 2,
    },
    md: {
      shadowColor: '#000',
      shadowOffset: {
        width: 0,
        height: 4,
      },
      shadowOpacity: 0.3,
      shadowRadius: 4.65,
      elevation: 4,
    },
    lg: {
      shadowColor: '#000',
      shadowOffset: {
        width: 0,
        height: 8,
      },
      shadowOpacity: 0.44,
      shadowRadius: 10.32,
      elevation: 8,
    },
  },
  
  // Animation Durations
  animation: {
    fast: 200,
    normal: 300,
    slow: 500,
    verySlow: 1000,
  },
  
  // Font Sizes
  fontSize: {
    xxxs: 10,
    xxs: 12,
    xs: 14,
    sm: 16,
    md: 18,
    lg: 20,
    xl: 24,
    xxl: 28,
    xxxl: 32,
    huge: 48,
  },
  
  // Icon Sizes
  iconSize: {
    xs: 16,
    sm: 20,
    md: 24,
    lg: 28,
    xl: 32,
    xxl: 40,
    xxxl: 48,
  },
  
  // Button Sizes
  buttonSize: {
    xs: 32,
    sm: 40,
    md: 48,
    lg: 56,
    xl: 64,
  },
  
  // Input Sizes
  inputHeight: Platform.select({
    ios: 44,
    android: 48,
    default: 48,
  }),
  
  // Card Sizes
  cardPadding: Platform.select({
    ios: 16,
    android: 16,
    default: 16,
  }),
};

export default Layout;
