import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import Ionicons from 'react-native-vector-icons/Ionicons';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';

// Screens
import LoginScreen from '../screens/auth/LoginScreen';
import RegisterScreen from '../screens/auth/RegisterScreen';
import DashboardScreen from '../screens/dashboard/DashboardScreen';
import MiningScreen from '../screens/mining/MiningScreen';
import WalletScreen from '../screens/wallet/WalletScreen';
import MissionsScreen from '../screens/missions/MissionsScreen';
import InviteScreen from '../screens/invite/InviteScreen';
import RewardsScreen from '../screens/rewards/RewardsScreen';
import ProfileScreen from '../screens/profile/ProfileScreen';
import SettingsScreen from '../screens/settings/SettingsScreen';
import SupportScreen from '../screens/support/SupportScreen';
import BusinessDashboardScreen from '../screens/business/BusinessDashboardScreen';

// Context
import { useAuth } from '../context/AuthContext';

// Constants
import Colors from '../constants/Colors';
import Layout from '../constants/Layout';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

const AuthStack = () => (
  <Stack.Navigator
    screenOptions={{
      headerShown: false,
      cardStyle: { backgroundColor: Colors.bgPrimary },
    }}
  >
    <Stack.Screen name="Login" component={LoginScreen} />
    <Stack.Screen name="Register" component={RegisterScreen} />
  </Stack.Navigator>
);

const MainTabNavigator = () => (
  <Tab.Navigator
    screenOptions={({ route }) => ({
      headerShown: false,
      tabBarStyle: {
        backgroundColor: Colors.bgSurface,
        borderTopColor: Colors.borderLight,
        height: Layout.bottomTabHeight,
        paddingBottom: Layout.isIOS ? 20 : 8,
        paddingTop: 8,
      },
      tabBarActiveTintColor: Colors.primary,
      tabBarInactiveTintColor: Colors.textTertiary,
      tabBarLabelStyle: {
        fontSize: 10,
        fontWeight: '600',
        marginTop: 4,
      },
      tabBarIcon: ({ focused, color, size }) => {
        let iconName;
        let IconComponent = Ionicons;

        switch (route.name) {
          case 'Dashboard':
            iconName = focused ? 'home' : 'home-outline';
            break;
          case 'Mining':
            iconName = focused ? 'hardware-chip' : 'hardware-chip-outline';
            break;
          case 'Wallet':
            IconComponent = FontAwesome5;
            iconName = 'wallet';
            size = focused ? 22 : 20;
            break;
          case 'Invite':
            iconName = focused ? 'person-add' : 'person-add-outline';
            break;
          case 'Rewards':
            iconName = focused ? 'gift' : 'gift-outline';
            break;
          case 'Profile':
            iconName = focused ? 'person-circle' : 'person-circle-outline';
            break;
          default:
            iconName = 'help-circle';
        }

        return <IconComponent name={iconName} size={size} color={color} />;
      },
    })}
  >
    <Tab.Screen 
      name="Dashboard" 
      component={DashboardScreen}
      options={{
        tabBarLabel: 'داشبورد',
      }}
    />
    <Tab.Screen 
      name="Mining" 
      component={MiningScreen}
      options={{
        tabBarLabel: 'استخراج',
        tabBarBadge: 'جدید',
      }}
    />
    <Tab.Screen 
      name="Wallet" 
      component={WalletScreen}
      options={{
        tabBarLabel: 'کیف پول',
      }}
    />
    <Tab.Screen 
      name="Invite" 
      component={InviteScreen}
      options={{
        tabBarLabel: 'دعوت',
      }}
    />
    <Tab.Screen 
      name="Rewards" 
      component={RewardsScreen}
      options={{
        tabBarLabel: 'پاداش‌ها',
      }}
    />
    <Tab.Screen 
      name="Profile" 
      component={ProfileScreen}
      options={{
        tabBarLabel: 'پروفایل',
      }}
    />
  </Tab.Navigator>
);

const MainStack = () => (
  <Stack.Navigator
    screenOptions={{
      headerShown: false,
      cardStyle: { backgroundColor: Colors.bgPrimary },
    }}
  >
    <Stack.Screen name="MainTabs" component={MainTabNavigator} />
    <Stack.Screen name="Settings" component={SettingsScreen} />
    <Stack.Screen name="Support" component={SupportScreen} />
    <Stack.Screen name="BusinessDashboard" component={BusinessDashboardScreen} />
  </Stack.Navigator>
);

const AppNavigator = () => {
  const { user, isLoading } = useAuth();

  // Show loading screen
  if (isLoading) {
    return null; // Or a loading component
  }

  return user ? <MainStack /> : <AuthStack />;
};

export default AppNavigator;
