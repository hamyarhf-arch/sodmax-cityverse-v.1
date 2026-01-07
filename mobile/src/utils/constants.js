// mobile/src/utils/constants.js
export const COLORS = {
  primary: '#0066FF',
  primaryDark: '#0052CC',
  primaryLight: '#3395FF',
  secondary: '#00D4AA',
  accent: '#FF6B35',
  premium: '#FFD700',
  success: '#10B981',
  error: '#EF4444',
  warning: '#F59E0B',
  
  bgPrimary: '#0a0f1c',
  bgSecondary: '#131a2d',
  bgSurface: 'rgba(25, 35, 60, 0.9)',
  bgCard: 'rgba(30, 41, 59, 0.8)',
  
  textPrimary: '#ffffff',
  textSecondary: '#d1d5db',
  textTertiary: '#9ca3af',
  textMuted: '#6b7280',
};

export const GRADIENTS = {
  primary: ['#0066FF', '#3395FF'],
  secondary: ['#00D4AA', '#06b6d4'],
  accent: ['#FF6B35', '#f97316'],
  premium: ['#FFD700', '#fbbf24'],
  dark: ['#0a0f1c', '#1a2332'],
};

export const SIZES = {
  xs: 6,
  sm: 12,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 40,
};

export const BORDER_RADIUS = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  full: 9999,
};

export const SHADOWS = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 3,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 5,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.5,
    shadowRadius: 32,
    elevation: 10,
  },
};
