import React, { createContext, useState, useContext, useCallback } from 'react';
import Toast from 'react-native-toast-message';
import { Vibration } from 'react-native';

const ToastContext = createContext();

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

export const ToastProvider = ({ children }) => {
  const [toastQueue, setToastQueue] = useState([]);
  const [currentToast, setCurrentToast] = useState(null);

  const show = useCallback((type, text1, text2, options = {}) => {
    const toast = {
      id: Date.now() + Math.random(),
      type,
      text1,
      text2,
      position: options.position || 'top',
      visibilityTime: options.visibilityTime || 4000,
      autoHide: options.autoHide !== false,
      topOffset: options.topOffset || 40,
      bottomOffset: options.bottomOffset || 40,
      onShow: options.onShow,
      onHide: options.onHide,
      onPress: options.onPress,
      props: options.props || {},
    };

    if (options.vibrate) {
      const pattern = typeof options.vibrate === 'boolean' ? [100] : options.vibrate;
      Vibration.vibrate(pattern);
    }

    // Add to queue
    setToastQueue(prev => [...prev, toast]);

    // If no current toast, show this one
    if (!currentToast) {
      showNextToast();
    }
  }, [currentToast]);

  const showNextToast = () => {
    if (toastQueue.length === 0) {
      setCurrentToast(null);
      return;
    }

    const nextToast = toastQueue[0];
    setCurrentToast(nextToast);
    setToastQueue(prev => prev.slice(1));

    Toast.show({
      type: nextToast.type,
      text1: nextToast.text1,
      text2: nextToast.text2,
      position: nextToast.position,
      visibilityTime: nextToast.visibilityTime,
      autoHide: nextToast.autoHide,
      topOffset: nextToast.topOffset,
      bottomOffset: nextToast.bottomOffset,
      onShow: () => {
        if (nextToast.onShow) nextToast.onShow();
      },
      onHide: () => {
        if (nextToast.onHide) nextToast.onHide();
        showNextToast();
      },
      onPress: nextToast.onPress,
      props: nextToast.props,
    });
  };

  const hide = useCallback(() => {
    Toast.hide();
    setCurrentToast(null);
  }, []);

  const success = useCallback((text1, text2, options = {}) => {
    show('success', text1, text2, { ...options, vibrate: true });
  }, [show]);

  const error = useCallback((text1, text2, options = {}) => {
    show('error', text1, text2, { ...options, vibrate: [100, 50, 100] });
  }, [show]);

  const info = useCallback((text1, text2, options = {}) => {
    show('info', text1, text2, options);
  }, [show]);

  const warning = useCallback((text1, text2, options = {}) => {
    show('warning', text1, text2, options);
  }, [show]);

  const loading = useCallback((text1, text2, options = {}) => {
    show('loading', text1, text2, { ...options, autoHide: false });
  }, [show]);

  const custom = useCallback((component, options = {}) => {
    Toast.show({
      type: 'custom',
      props: { component },
      ...options,
    });
  }, []);

  const clearQueue = useCallback(() => {
    setToastQueue([]);
    hide();
  }, [hide]);

  const value = {
    show,
    hide,
    success,
    error,
    info,
    warning,
    loading,
    custom,
    clearQueue,
    currentToast,
    queueLength: toastQueue.length,
  };

  return (
    <ToastContext.Provider value={value}>
      {children}
      <Toast />
    </ToastContext.Provider>
  );
};

export default ToastContext;
