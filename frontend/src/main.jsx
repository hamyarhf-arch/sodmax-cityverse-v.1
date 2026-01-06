import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter as Router } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { Toaster } from 'react-hot-toast';
import { HelmetProvider } from 'react-helmet-async';
import { AuthProvider } from './contexts/AuthContext';
import { MissionProvider } from './contexts/MissionContext';
import { WalletProvider } from './contexts/WalletContext';
import { BusinessProvider } from './contexts/BusinessContext';
import App from './App';
import './styles/main.css';

// Create Query Client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      cacheTime: 10 * 60 * 1000, // 10 minutes
      retry: 1,
      refetchOnWindowFocus: false,
      refetchOnMount: true,
      refetchOnReconnect: true,
    },
  },
});

// Configure React Query DevTools based on environment
const enableDevTools = import.meta.env.DEV;

// Set document direction for RTL
document.documentElement.dir = 'rtl';

// Hide loading screen
const hideLoadingScreen = () => {
  const loadingScreen = document.getElementById('loading-screen');
  if (loadingScreen) {
    loadingScreen.style.opacity = '0';
    setTimeout(() => {
      loadingScreen.style.display = 'none';
    }, 500);
  }
};

// Initialize app
const initApp = () => {
  const root = ReactDOM.createRoot(document.getElementById('root'));
  
  root.render(
    <React.StrictMode>
      <HelmetProvider>
        <QueryClientProvider client={queryClient}>
          <Router>
            <AuthProvider>
              <MissionProvider>
                <WalletProvider>
                  <BusinessProvider>
                    <App />
                    
                    {/* Toast Notifications */}
                    <Toaster
                      position="top-center"
                      reverseOrder={false}
                      gutter={12}
                      containerStyle={{
                        top: 80,
                      }}
                      toastOptions={{
                        duration: 4000,
                        style: {
                          background: '#1e293b',
                          color: '#f8fafc',
                          border: '1px solid #334155',
                          borderRadius: '12px',
                          fontFamily: 'Vazirmatn, sans-serif',
                          fontSize: '14px',
                          boxShadow: '0 10px 25px rgba(0, 0, 0, 0.3)',
                          maxWidth: '400px',
                          padding: '16px',
                        },
                        success: {
                          iconTheme: {
                            primary: '#10b981',
                            secondary: '#ffffff',
                          },
                          style: {
                            borderLeft: '4px solid #10b981',
                          },
                        },
                        error: {
                          iconTheme: {
                            primary: '#ef4444',
                            secondary: '#ffffff',
                          },
                          style: {
                            borderLeft: '4px solid #ef4444',
                          },
                        },
                        loading: {
                          iconTheme: {
                            primary: '#3b82f6',
                            secondary: '#ffffff',
                          },
                          style: {
                            borderLeft: '4px solid #3b82f6',
                          },
                        },
                      }}
                    />
                    
                    {/* React Query DevTools (Development only) */}
                    {enableDevTools && <ReactQueryDevtools initialIsOpen={false} />}
                  </BusinessProvider>
                </WalletProvider>
              </MissionProvider>
            </AuthProvider>
          </Router>
        </QueryClientProvider>
      </HelmetProvider>
    </React.StrictMode>
  );
  
  // Hide loading screen after render
  setTimeout(hideLoadingScreen, 500);
};

// Error boundary for initialization
try {
  initApp();
} catch (error) {
  console.error('Failed to initialize app:', error);
  
  // Show error screen
  const root = document.getElementById('root');
  if (root) {
    root.innerHTML = `
      <div style="
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: linear-gradient(135deg, #0a0f1c 0%, #131a2d 100%);
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        padding: 20px;
        text-align: center;
        font-family: 'Vazirmatn', sans-serif;
        color: white;
      ">
        <div style="font-size: 48px; margin-bottom: 20px;">⚠️</div>
        <h1 style="font-size: 24px; margin-bottom: 16px; color: #ef4444;">
          خطا در بارگذاری برنامه
        </h1>
        <p style="color: #9ca3af; margin-bottom: 24px; max-width: 500px;">
          متأسفانه در بارگذاری برنامه مشکلی پیش آمده است. لطفاً صفحه را Refresh کنید.
        </p>
        <button onclick="window.location.reload()" style="
          background: linear-gradient(135deg, #0066FF 0%, #3395FF 100%);
          color: white;
          border: none;
          padding: 12px 24px;
          border-radius: 12px;
          font-family: 'Vazirmatn', sans-serif;
          font-size: 16px;
          font-weight: 600;
          cursor: pointer;
          transition: transform 0.2s ease;
        ">
          🔄 بارگذاری مجدد
        </button>
      </div>
    `;
  }
  
  hideLoadingScreen();
}

// Performance monitoring (optional)
if (import.meta.env.PROD) {
  // Report web vitals
  const reportWebVitals = (onPerfEntry) => {
    if (onPerfEntry && onPerfEntry instanceof Function) {
      import('web-vitals').then(({ getCLS, getFID, getFCP, getLCP, getTTFB }) => {
        getCLS(onPerfEntry);
        getFID(onPerfEntry);
        getFCP(onPerfEntry);
        getLCP(onPerfEntry);
        getTTFB(onPerfEntry);
      });
    }
  };
  
  // You can add your analytics provider here
  // reportWebVitals(console.log);
}

// Service Worker Registration
if ('serviceWorker' in navigator && import.meta.env.PROD) {
  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register('/sw.js')
      .then((registration) => {
        console.log('SW registered: ', registration);
      })
      .catch((registrationError) => {
        console.log('SW registration failed: ', registrationError);
      });
  });
}

// Offline detection
window.addEventListener('online', () => {
  // You can show a toast or update UI when online
  console.log('App is online');
});

window.addEventListener('offline', () => {
  // You can show a toast or update UI when offline
  console.log('App is offline');
});

// Export for potential module usage
export { queryClient };
