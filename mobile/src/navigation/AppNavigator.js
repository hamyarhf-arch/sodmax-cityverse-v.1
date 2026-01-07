// mobile/src/navigation/AppNavigator.js
import React, { useContext } from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { FontAwesome5, FontAwesome, Ionicons, MaterialIcons } from '@expo/vector-icons';

// Screens
import LoginScreen from '../screens/auth/LoginScreen';
import RegisterScreen from '../screens/auth/RegisterScreen';
import DashboardScreen from '../screens/dashboard/DashboardScreen';
import MiningScreen from '../screens/mining/MiningScreen';
import WalletScreen from '../screens/wallet/WalletScreen';
import InviteScreen from '../screens/invite/InviteScreen';
import MissionsScreen from '../screens/missions/MissionsScreen';
import RewardsScreen from '../screens/rewards/RewardsScreen';
import ProfileScreen from '../screens/profile/ProfileScreen';
import SettingsScreen from '../screens/settings/SettingsScreen';
import SupportScreen from '../screens/support/SupportScreen';

// Context
import { AuthContext } from '../context/AuthContext';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        tabBarStyle: {
          backgroundColor: '#131a2d',
          borderTopColor: 'rgba(255,255,255,0.15)',
          height: 60,
          paddingBottom: 8,
          paddingTop: 8,
        },
        tabBarActiveTintColor: '#0066FF',
        tabBarInactiveTintColor: '#9ca3af',
        headerShown: false,
      }}
    >
      <Tab.Screen 
        name="Dashboard" 
        component={DashboardScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <FontAwesome5 name="home" size={22} color={color} />
          ),
          tabBarLabel: 'داشبورد',
        }}
      />
      <Tab.Screen 
        name="Mining" 
        component={MiningScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <FontAwesome5 name="hard-hat" size={22} color={color} />
          ),
          tabBarLabel: 'استخراج',
        }}
      />
      <Tab.Screen 
        name="Wallet" 
        component={WalletScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <FontAwesome5 name="wallet" size={22} color={color} />
          ),
          tabBarLabel: 'کیف پول',
        }}
      />
      <Tab.Screen 
        name="Invite" 
        component={InviteScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <FontAwesome name="user-plus" size={22} color={color} />
          ),
          tabBarLabel: 'دعوت دوستان',
        }}
      />
      <Tab.Screen 
        name="Rewards" 
        component={RewardsScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <FontAwesome name="gift" size={22} color={color} />
          ),
          tabBarLabel: 'پاداش‌ها',
        }}
      />
    </Tab.Navigator>
  );
}

export default function AppNavigator() {
  const { user } = useContext(AuthContext);

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {!user ? (
        // اگر کاربر وارد نشده
        <>
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="Register" component={RegisterScreen} />
        </>
      ) : (
        // اگر کاربر وارد شده
        <>
          <Stack.Screen name="MainTabs" component={MainTabs} />
          <Stack.Screen name="Profile" component={ProfileScreen} />
          <Stack.Screen name="Settings" component={SettingsScreen} />
          <Stack.Screen name="Support" component={SupportScreen} />
          <Stack.Screen name="Missions" component={MissionsScreen} />
        </>
      )}
    </Stack.Navigator>
  );
}
