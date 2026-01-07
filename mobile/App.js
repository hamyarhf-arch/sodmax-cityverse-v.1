// mobile/App.js
import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'react-native';
import AppNavigator from './src/navigation/AppNavigator';
import { AuthProvider } from './src/context/AuthContext';
import { AppProvider } from './src/context/AppContext';
import { ThemeProvider } from './src/context/ThemeContext';
import { MiningProvider } from './src/context/MiningContext';
import { WalletProvider } from './src/context/WalletContext';
import { ToastProvider } from './src/context/ToastContext';
import './src/i18n'; // ترجمه فارسی

export default function App() {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <AppProvider>
          <ThemeProvider>
            <MiningProvider>
              <WalletProvider>
                <ToastProvider>
                  <StatusBar barStyle="light-content" backgroundColor="#0a0f1c" />
                  <NavigationContainer>
                    <AppNavigator />
                  </NavigationContainer>
                </ToastProvider>
              </WalletProvider>
            </MiningProvider>
          </ThemeProvider>
        </AppProvider>
      </AuthProvider>
    </SafeAreaProvider>
  );
}
