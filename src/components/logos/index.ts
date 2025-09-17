// Logo Components Export Index
// Centralized exports for all News Hut logo components

export { default as Logo } from '../Logo';
export { default as LogoCompact } from '../LogoCompact';
export { default as PullToRefreshLogo } from '../PullToRefreshLogo';
export { default as SplashScreen } from '../SplashScreen';

// Logo component types
export type LogoTheme = 'light' | 'dark' | 'auto';

export interface BaseLogoProps {
  size?: number;
  style?: any;
  animated?: boolean;
  theme?: LogoTheme;
}
