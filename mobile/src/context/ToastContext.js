// mobile/src/context/ToastContext.js
import React, { createContext, useState, useContext, useCallback } from 'react';
import { ToastAndroid, Platform, Alert } from 'react-native';

const ToastContext = createContext();

export const useToast = () => useContext(ToastContext);

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);
  const [visible, setVisible] = useState(false);

  const showToast = useCallback((message, type = 'info', duration = 3000) => {
    if (Platform.OS === 'android') {
      ToastAndroid.showWithGravityAndOffset(
        message,
        ToastAndroid.LONG,
        ToastAndroid.BOTTOM,
        0,
        100
      );
    } else {
      // برای iOS از Alert استفاده می‌کنیم
      Alert.alert(
        type === 'error' ? 'خطا' : 
        type === 'success' ? 'موفق' : 
        type === 'warning' ? 'هشدار' : 'اطلاع',
        message,
        [{ text: 'باشه' }]
      );
    }

    // برای وب یا محیط‌های دیگر
    if (Platform.OS === 'web') {
      const toast = {
        id: Date.now(),
        message,
        type,
        duration,
      };
      
      setToasts(prev => [...prev, toast]);
      setVisible(true);
      
      setTimeout(() => {
        setToasts(prev => prev.filter(t => t.id !== toast.id));
        if (toasts.length <= 1) {
          setVisible(false);
        }
      }, duration);
    }
  }, [toasts.length]);

  const showSuccess = useCallback((message, duration = 3000) => {
    showToast(message, 'success', duration);
  }, [showToast]);

  const showError = useCallback((message, duration = 3000) => {
    showToast(message, 'error', duration);
  }, [showToast]);

  const showWarning = useCallback((message, duration = 3000) => {
    showToast(message, 'warning', duration);
  }, [showToast]);

  const showInfo = useCallback((message, duration = 3000) => {
    showToast(message, 'info', duration);
  }, [showToast]);

  const removeToast = useCallback((id) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  }, []);

  const value = {
    showToast,
    showSuccess,
    showError,
    showWarning,
    showInfo,
    removeToast,
    toasts,
    visible,
  };

  return (
    <ToastContext.Provider value={value}>
      {children}
    </ToastContext.Provider>
  );
};

// کامپوننت Toast برای محیط وب
export const ToastContainer = () => {
  const { toasts, removeToast } = useToast();
  
  if (toasts.length === 0) return null;

  return (
    <div style={{
      position: 'fixed',
      top: '20px',
      right: '20px',
      zIndex: 9999,
    }}>
      {toasts.map(toast => {
        const backgroundColor = 
          toast.type === 'success' ? '#10B981' :
          toast.type === 'error' ? '#EF4444' :
          toast.type === 'warning' ? '#F59E0B' : '#0066FF';
        
        return (
          <div
            key={toast.id}
            style={{
              backgroundColor,
              color: 'white',
              padding: '12px 16px',
              borderRadius: '8px',
              marginBottom: '10px',
              boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
              minWidth: '300px',
              maxWidth: '400px',
              animation: 'slideIn 0.3s ease-out',
            }}
            onClick={() => removeToast(toast.id)}
          >
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}>
              <div style={{ flex: 1 }}>
                <div style={{
                  fontWeight: 'bold',
                  marginBottom: '4px',
                  fontSize: '14px',
                }}>
                  {toast.type === 'success' ? '✅' : 
                   toast.type === 'error' ? '❌' : 
                   toast.type === 'warning' ? '⚠️' : 'ℹ️'} 
                  {toast.type === 'success' ? ' موفق' : 
                   toast.type === 'error' ? ' خطا' : 
                   toast.type === 'warning' ? ' هشدار' : ' اطلاع'}
                </div>
                <div style={{ fontSize: '13px' }}>{toast.message}</div>
              </div>
              <button
                onClick={() => removeToast(toast.id)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'white',
                  cursor: 'pointer',
                  fontSize: '18px',
                  marginLeft: '10px',
                }}
              >
                ×
              </button>
            </div>
          </div>
        );
      })}
      <style>
        {`
          @keyframes slideIn {
            from {
              transform: translateX(100%);
              opacity: 0;
            }
            to {
              transform: translateX(0);
              opacity: 1;
            }
          }
        `}
      </style>
    </div>
  );
};
