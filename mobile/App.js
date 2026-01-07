[file name]: mobile/App.js
[file content begin]
import React, { useEffect, useState } from 'react';
import { StatusBar } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { ThemeProvider } from '@context/ThemeContext';
import { ToastProvider } from '@context/ToastContext';
import { AuthProvider } from '@context/AuthContext';
import { AppProvider } from '@context/AppContext';
import { MiningProvider } from '@context/MiningContext';
import { WalletProvider } from '@context/WalletContext';
import AppNavigator from '@navigation/AppNavigator';
import SplashScreen from '@screens/splash/SplashScreen';

// Import i18n for RTL support
import './src/i18n';

export default function App() {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate loading time
    setTimeout(() => {
      setIsLoading(false);
    }, 2000);
  }, []);

  if (isLoading) {
    return <SplashScreen />;
  }

  return (
    <ThemeProvider>
      <ToastProvider>
        <AuthProvider>
          <AppProvider>
            <MiningProvider>
              <WalletProvider>
                <NavigationContainer>
                  <StatusBar 
                    barStyle="light-content" 
                    backgroundColor="#0a0f1c" 
                  />
                  <AppNavigator />
                </NavigationContainer>
              </WalletProvider>
            </MiningProvider>
          </AppProvider>
        </AuthProvider>
      </ToastProvider>
    </ThemeProvider>
  );
}
[file content end]
