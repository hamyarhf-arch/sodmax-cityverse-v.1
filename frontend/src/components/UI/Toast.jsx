import React, { useState, useEffect, createContext, useContext } from 'react';
import './Toast.css';

const ToastContext = createContext();

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const addToast = (toast) => {
    const id = Date.now();
    const newToast = {
      id,
      ...toast,
      duration: toast.duration || 5000,
    };
    
    setToasts(prev => [...prev, newToast]);
    
    return id;
  };

  const removeToast = (id) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  };

  const showToast = (message, options = {}) => {
    return addToast({
      message,
      type: options.type || 'info',
      title: options.title,
      duration: options.duration,
      icon: options.icon,
      position: options.position || 'top-right',
      onClose: options.onClose,
      action: options.action
    });
  };

  const success = (message, options = {}) => {
    return showToast(message, {
      type: 'success',
      icon: 'fa-check-circle',
      title: options.title || 'موفقیت',
      ...options
    });
  };

  const error = (message, options = {}) => {
    return showToast(message, {
      type: 'error',
      icon: 'fa-exclamation-circle',
      title: options.title || 'خطا',
      ...options
    });
  };

  const warning = (message, options = {}) => {
    return showToast(message, {
      type: 'warning',
      icon: 'fa-exclamation-triangle',
      title: options.title || 'هشدار',
      ...options
    });
  };

  const info = (message, options = {}) => {
    return showToast(message, {
      type: 'info',
      icon: 'fa-info-circle',
      title: options.title || 'اطلاعیه',
      ...options
    });
  };

  const loading = (message, options = {}) => {
    return showToast(message, {
      type: 'loading',
      icon: 'fa-spinner fa-spin',
      title: options.title || 'در حال پردازش',
      duration: null, // بدون timeout
      ...options
    });
  };

  const dismiss = (id) => {
    removeToast(id);
  };

  const dismissAll = () => {
    setToasts([]);
  };

  const value = {
    toasts,
    addToast,
    removeToast,
    showToast,
    success,
    error,
    warning,
    info,
    loading,
    dismiss,
    dismissAll
  };

  return (
    <ToastContext.Provider value={value}>
      {children}
      <ToastContainer />
    </ToastContext.Provider>
  );
};

const ToastContainer = () => {
  const { toasts, removeToast } = useToast();

  // گروه‌بندی توست‌ها بر اساس موقعیت
  const groupedToasts = toasts.reduce((groups, toast) => {
    const position = toast.position || 'top-right';
    if (!groups[position]) {
      groups[position] = [];
    }
    groups[position].push(toast);
    return groups;
  }, {});

  const positions = ['top-left', 'top-center', 'top-right', 'bottom-left', 'bottom-center', 'bottom-right'];

  return (
    <>
      {positions.map(position => (
        <div key={position} className={`toast-container toast-${position}`}>
          {groupedToasts[position]?.map(toast => (
            <ToastItem
              key={toast.id}
              toast={toast}
              onClose={() => removeToast(toast.id)}
            />
          ))}
        </div>
      ))}
    </>
  );
};

const ToastItem = ({ toast, onClose }) => {
  const [isExiting, setIsExiting] = useState(false);
  const [progress, setProgress] = useState(100);

  useEffect(() => {
    // اگر توست مدت‌دار باشد
    if (toast.duration && toast.duration > 0) {
      const startTime = Date.now();
      
      const updateProgress = () => {
        const elapsed = Date.now() - startTime;
        const remaining = Math.max(0, toast.duration - elapsed);
        const progressPercent = (remaining / toast.duration) * 100;
        setProgress(progressPercent);
      };

      const progressInterval = setInterval(updateProgress, 50);

      const timer = setTimeout(() => {
        handleClose();
      }, toast.duration);

      return () => {
        clearTimeout(timer);
        clearInterval(progressInterval);
      };
    }
  }, [toast.duration]);

  const handleClose = () => {
    setIsExiting(true);
    setTimeout(() => {
      onClose();
      if (toast.onClose) {
        toast.onClose();
      }
    }, 300);
  };

  const handleAction = () => {
    if (toast.action && toast.action.onClick) {
      toast.action.onClick();
    }
    handleClose();
  };

  const getToastTypeClass = () => {
    const typeClasses = {
      success: 'toast-success',
      error: 'toast-error',
      warning: 'toast-warning',
      info: 'toast-info',
      loading: 'toast-loading'
    };
    return typeClasses[toast.type] || 'toast-info';
  };

  const getDefaultIcon = () => {
    const icons = {
      success: 'fa-check-circle',
      error: 'fa-exclamation-circle',
      warning: 'fa-exclamation-triangle',
      info: 'fa-info-circle',
      loading: 'fa-spinner fa-spin'
    };
    return icons[toast.type] || 'fa-info-circle';
  };

  const icon = toast.icon || getDefaultIcon();

  return (
    <div className={`toast-item ${getToastTypeClass()} ${isExiting ? 'toast-exit' : ''}`}>
      <div className="toast-content">
        <div className="toast-icon">
          <i className={`fas ${icon}`}></i>
        </div>
        
        <div className="toast-body">
          {toast.title && (
            <div className="toast-title">{toast.title}</div>
          )}
          <div className="toast-message">{toast.message}</div>
          
          {toast.action && (
            <button 
              className="toast-action"
              onClick={handleAction}
            >
              {toast.action.label}
            </button>
          )}
        </div>
        
        <button 
          className="toast-close"
          onClick={handleClose}
          aria-label="بستن"
        >
          <i className="fas fa-times"></i>
        </button>
      </div>
      
      {toast.duration && toast.duration > 0 && (
        <div className="toast-progress">
          <div 
            className="toast-progress-bar" 
            style={{ width: `${progress}%` }}
          ></div>
        </div>
      )}
    </div>
  );
};

// هوک ساده برای استفاده سریع
export const useSimpleToast = () => {
  const toast = useToast();
  
  return {
    show: toast.showToast,
    success: toast.success,
    error: toast.error,
    warning: toast.warning,
    info: toast.info,
    loading: toast.loading,
    dismiss: toast.dismiss,
    dismissAll: toast.dismissAll
  };
};

export default ToastContainer;
