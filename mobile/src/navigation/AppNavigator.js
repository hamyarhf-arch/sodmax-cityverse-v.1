[file name]: mobile/src/navigation/AppNavigator.js
[file content begin]
import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useTheme } from '@context/ThemeContext';
import { useAuth } from '@context/AuthContext';
import Icon from 'react-native-vector-icons/Feather';

// Auth Screens
import LoginScreen from '@screens/auth/LoginScreen';
import RegisterScreen from '@screens/auth/RegisterScreen';
import ForgotPasswordScreen from '@screens/auth/ForgotPasswordScreen';

// Main Screens
import DashboardScreen from '@screens/dashboard/DashboardScreen';
import MiningScreen from '@screens/mining/MiningScreen';
import WalletScreen from '@screens/wallet/WalletScreen';
import MissionsScreen from '@screens/missions/MissionsScreen';
import InviteScreen from '@screens/invite/InviteScreen';
import RewardsScreen from '@screens/rewards/RewardsScreen';
import ProfileScreen from '@screens/profile/ProfileScreen';
import SettingsScreen from '@screens/settings/SettingsScreen';
import SupportScreen from '@screens/support/SupportScreen';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

// Bottom Tab Navigator for main app
const MainTabNavigator = () => {
  const { theme } = useTheme();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;
          
          switch (route.name) {
            case 'Dashboard':
              iconName = 'home';
              break;
            case 'Mining':
              iconName = 'activity';
              break;
            case 'Wallet':
              iconName = 'credit-card';
              break;
            case 'Invite':
              iconName = 'users';
              break;
            case 'Rewards':
              iconName = 'gift';
              break;
            case 'Profile':
              iconName = 'user';
              break;
            default:
              iconName = 'circle';
          }

          return <Icon name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: theme.colors.secondary,
        tabBarStyle: {
          backgroundColor: theme.colors.background,
          borderTopColor: 'rgba(255,255,255,0.1)',
          height: 60,
          paddingBottom: 10,
          paddingTop: 10,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
        },
        headerStyle: {
          backgroundColor: theme.colors.background,
          elevation: 0,
          shadowOpacity: 0,
        },
        headerTintColor: theme.colors.text,
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      })}
    >
      <Tab.Screen 
        name="Dashboard" 
        component={DashboardScreen} 
        options={{ title: 'داشبورد' }}
      />
      <Tab.Screen 
        name="Mining" 
        component={MiningScreen} 
        options={{ title: 'استخراج' }}
      />
      <Tab.Screen 
        name="Wallet" 
        component={WalletScreen} 
        options={{ title: 'کیف پول' }}
      />
      <Tab.Screen 
        name="Invite" 
        component={InviteScreen} 
        options={{ title: 'دعوت دوستان' }}
      />
      <Tab.Screen 
        name="Rewards" 
        component={RewardsScreen} 
        options={{ title: 'پاداش‌ها' }}
      />
      <Tab.Screen 
        name="Profile" 
        component={ProfileScreen} 
        options={{ title: 'پروفایل' }}
      />
    </Tab.Navigator>
  );
};

// Main App Navigator
const AppNavigator = () => {
  const { user } = useAuth();

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {user ? (
        // User is logged in - show main app
        <>
          <Stack.Screen name="Main" component={MainTabNavigator} />
          <Stack.Screen 
            name="Settings" 
            component={SettingsScreen} 
            options={{ 
              headerShown: true, 
              title: 'تنظیمات',
              headerBackTitle: 'بازگشت'
            }} 
          />
          <Stack.Screen 
            name="Support" 
            component={SupportScreen} 
            options={{ 
              headerShown: true, 
              title: 'پشتیبانی',
              headerBackTitle: 'بازگشت'
            }} 
          />
        </>
      ) : (
        // User is not logged in - show auth screens
        <>
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen 
            name="Register" 
            component={RegisterScreen} 
            options={{ 
              headerShown: true, 
              title: 'ثبت‌نام',
              headerBackTitle: 'بازگشت'
            }} 
          />
          <Stack.Screen 
            name="ForgotPassword" 
            component={ForgotPasswordScreen} 
            options={{ 
              headerShown: true, 
              title: 'بازیابی رمز',
              headerBackTitle: 'بازگشت'
            }} 
          />
        </>
      )}
    </Stack.Navigator>
  );
};

export default AppNavigator;
[file content end]
