[file name]: mobile/src/navigation/AuthNavigator.js
[file content begin]
import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { useTheme } from '@context/ThemeContext';

// صفحات احراز هویت
import SplashScreen from '@screens/splash/SplashScreen';
import LoginScreen from '@screens/auth/LoginScreen';
import RegisterScreen from '@screens/auth/RegisterScreen';
import ForgotPasswordScreen from '@screens/auth/ForgotPasswordScreen';
import VerifyPhoneScreen from '@screens/auth/VerifyPhoneScreen';

const Stack = createStackNavigator();

const AuthNavigator = () => {
  const { theme } = useTheme();
  
  return (
    <Stack.Navigator
      initialRouteName="Splash"
      screenOptions={{
        headerStyle: {
          backgroundColor: theme.colors.background,
          elevation: 0,
          shadowOpacity: 0,
          borderBottomWidth: 0,
        },
        headerTintColor: theme.colors.text,
        headerTitleStyle: {
          fontFamily: theme.fonts.bold,
          fontSize: 18,
        },
        headerBackTitleVisible: false,
        cardStyle: {
          backgroundColor: theme.colors.background,
        },
        animationEnabled: true,
      }}
    >
      <Stack.Screen
        name="Splash"
        component={SplashScreen}
        options={{
          headerShown: false,
          animationTypeForReplace: 'pop',
        }}
      />
      
      <Stack.Screen
        name="Login"
        component={LoginScreen}
        options={{
          title: 'ورود به حساب',
          headerShown: true,
        }}
      />
      
      <Stack.Screen
        name="Register"
        component={RegisterScreen}
        options={{
          title: 'ثبت‌نام در SODmAX',
          headerShown: true,
        }}
      />
      
      <Stack.Screen
        name="ForgotPassword"
        component={ForgotPasswordScreen}
        options={{
          title: 'بازیابی رمز عبور',
          headerShown: true,
        }}
      />
      
      <Stack.Screen
        name="VerifyPhone"
        component={VerifyPhoneScreen}
        options={{
          title: 'تأیید شماره موبایل',
          headerShown: true,
        }}
      />
    </Stack.Navigator>
  );
};

export default AuthNavigator;
[file content end]
