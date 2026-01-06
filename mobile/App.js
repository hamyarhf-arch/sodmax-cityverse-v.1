import React, { useEffect } from 'react';
import { StatusBar, LogBox } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import RNBootSplash from 'react-native-bootsplash';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

// Contexts
import { AuthProvider } from './src/context/AuthContext';
import { ToastProvider } from './src/context/ToastContext';
import { MiningProvider } from './src/context/MiningContext';
import { WalletProvider } from './src/context/WalletContext';

// Navigation
import AppNavigator from './src/navigation/AppNavigator';

// Services
import { initializeApp } from './src/services/init';

// Ignore specific warnings
LogBox.ignoreLogs([
  'Non-serializable values were found in the navigation state',
  'Require cycle:',
]);

const App = () => {
  useEffect(() => {
    const init = async () => {
      try {
        // Initialize app services
        await initializeApp();
        
        // Hide splash screen
        await RNBootSplash.hide({ fade: true });
      } catch (error) {
        console.error('App initialization error:', error);
      }
    };

    init();
  }, []);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <AuthProvider>
          <ToastProvider>
            <MiningProvider>
              <WalletProvider>
                <NavigationContainer>
                  <StatusBar
                    barStyle="light-content"
                    backgroundColor="#0a0f1c"
                    translucent={true}
                  />
                  <AppNavigator />
                </NavigationContainer>
              </WalletProvider>
            </MiningProvider>
          </ToastProvider>
        </AuthProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
};

export default App;
