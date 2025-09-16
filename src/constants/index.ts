// App constants and configuration
import Constants from 'expo-constants';

// Get environment variables from expo config
const getEnvVar = (key: string, defaultValue?: string): string => {
  return Constants.expoConfig?.extra?.[key] || process.env[key] || defaultValue || '';
};

export const API_CONFIG = {
  BASE_URL: getEnvVar('API_URL', 'https://news-admin-panel-ruby.vercel.app/api'),
  ENDPOINTS: {
    NEWS: '/news',
    CATEGORIES: '/categories',
    FCM_TOKEN: '/fcm-token',
    NOTIFICATIONS: '/notifications',
  },
  TIMEOUT: 10000,
  RETRY_ATTEMPTS: 3,
};

export const APP_CONFIG = {
  NAME: 'News App',
  VERSION: '1.0.0',
  BUNDLE_ID: 'com.yourcompany.newsapp',
  PAGINATION: {
    DEFAULT_LIMIT: 20,
    MAX_LIMIT: 50,
  },
  CACHE: {
    MAX_ARTICLES: 50,
    MAX_SIZE_MB: 500,
    EXPIRY_HOURS: 24,
  },
};

export const COLORS = {
  primary: '#2563EB', // Modern blue
  primaryLight: '#3B82F6',
  primaryDark: '#1D4ED8',
  secondary: '#EC4899', // Modern pink
  accent: '#10B981', // Emerald green
  background: '#FFFFFF',
  backgroundSecondary: '#F8FAFC', // Slightly gray background
  surface: '#FFFFFF',
  surfaceVariant: '#F1F5F9',
  onPrimary: '#FFFFFF',
  onBackground: '#0F172A', // Dark slate
  onSurface: '#1E293B',
  text: {
    primary: '#0F172A',
    secondary: '#475569',
    tertiary: '#64748B',
    inverse: '#FFFFFF',
  },
  border: {
    light: '#E2E8F0',
    medium: '#CBD5E1',
    dark: '#94A3B8',
  },
  error: '#EF4444',
  success: '#10B981',
  warning: '#F59E0B',
  info: '#3B82F6',
  // Dark theme variants
  backgroundDark: '#0F172A',
  surfaceDark: '#1E293B',
  onBackgroundDark: '#F8FAFC',
  // Gradients
  gradients: {
    primary: ['#2563EB', '#3B82F6'] as const,
    header: ['#1E40AF', '#3B82F6'] as const,
    card: ['#FFFFFF', '#F8FAFC'] as const,
  },
  // Shadows
  shadows: {
    small: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.05,
      shadowRadius: 2,
      elevation: 2,
    },
    medium: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.1,
      shadowRadius: 8,
      elevation: 4,
    },
    large: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.15,
      shadowRadius: 16,
      elevation: 8,
    },
  },
};

export const FONT_SIZES = {
  small: {
    body: 14,
    headline: 18,
    title: 20,
  },
  medium: {
    body: 16,
    headline: 20,
    title: 22,
  },
  large: {
    body: 18,
    headline: 22,
    title: 24,
  },
};

export const SPACING = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
  // Modern spacing scale
  scale: {
    0: 0,
    1: 4,
    2: 8,
    3: 12,
    4: 16,
    5: 20,
    6: 24,
    8: 32,
    10: 40,
    12: 48,
    16: 64,
    20: 80,
  },
};

export const ANALYTICS_EVENTS = {
  // App lifecycle
  APP_OPEN: 'app_open',
  APP_BACKGROUND: 'app_background',
  
  // Content engagement
  ARTICLE_VIEW: 'article_view',
  ARTICLE_SHARE: 'article_share',
  ARTICLE_BOOKMARK: 'article_bookmark',
  
  // Navigation
  CATEGORY_SELECT: 'category_select',
  SEARCH_PERFORM: 'search_perform',
  
  // Features
  NOTIFICATION_RECEIVE: 'notification_receive',
  NOTIFICATION_OPEN: 'notification_open',
  OFFLINE_READ: 'offline_read',
  
  // User preferences
  THEME_CHANGE: 'theme_change',
  FONT_SIZE_CHANGE: 'font_size_change',
};