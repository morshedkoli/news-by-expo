import React, { useEffect, useRef } from 'react';
import { Animated } from 'react-native';
import Svg, { Path, Rect, Text, Defs, LinearGradient, Stop, G } from 'react-native-svg';

interface PullToRefreshLogoProps {
  size?: number;
  style?: any;
  refreshing?: boolean;
  theme?: 'light' | 'dark' | 'auto';
}

const PullToRefreshLogo: React.FC<PullToRefreshLogoProps> = ({ 
  size = 40, 
  style, 
  refreshing = false, 
  theme = 'light' 
}) => {
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;

  // Theme-based colors
  const getThemeColors = () => {
    switch (theme) {
      case 'dark':
        return {
          houseBody: '#2C2C2C',
          textColor: '#FFFFFF',
          strokeColor: '#FFFFFF',
        };
      case 'light':
      default:
        return {
          houseBody: '#FFFFFF',
          textColor: '#263238',
          strokeColor: '#263238',
        };
    }
  };

  const themeColors = getThemeColors();

  useEffect(() => {
    if (refreshing) {
      // Continuous rotation when refreshing
      const rotationAnimation = Animated.loop(
        Animated.timing(rotateAnim, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: true,
        })
      );

      // Pulse effect
      const pulseAnimation = Animated.loop(
        Animated.sequence([
          Animated.timing(scaleAnim, {
            toValue: 1.1,
            duration: 800,
            useNativeDriver: true,
          }),
          Animated.timing(scaleAnim, {
            toValue: 1,
            duration: 800,
            useNativeDriver: true,
          }),
        ])
      );

      rotationAnimation.start();
      pulseAnimation.start();

      return () => {
        rotationAnimation.stop();
        pulseAnimation.stop();
      };
    } else {
      // Reset animations
      rotateAnim.setValue(0);
      scaleAnim.setValue(1);
    }
  }, [refreshing, rotateAnim, scaleAnim]);

  const rotation = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const animatedStyle = {
    transform: [
      { rotate: rotation },
      { scale: scaleAnim },
    ],
  };

  return (
    <Animated.View style={[{ width: size, height: size }, style, animatedStyle]}>
      <Svg width={size} height={size} viewBox="0 0 512 512">
        <Defs>
          <LinearGradient id="refreshRoofGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <Stop offset="0%" stopColor="#FF7043" stopOpacity={0.8} />
            <Stop offset="100%" stopColor="#FF5722" stopOpacity={0} />
          </LinearGradient>
        </Defs>
        
        {/* Simplified refresh logo */}
        <G>
          {/* Main roof */}
          <Path 
            d="M256 80 L400 180 L400 190 L112 190 L112 180 L256 80 Z" 
            fill="#FF5722" 
            stroke={themeColors.strokeColor} 
            strokeWidth="8" 
            strokeLinejoin="round"
          />
          
          {/* Roof highlight */}
          <Path d="M256 80 L400 180 L112 180 L256 80 Z" fill="url(#refreshRoofGradient)" />
          
          {/* House body */}
          <Rect x="120" y="180" width="272" height="252" rx="16" ry="16" fill={themeColors.houseBody} stroke={themeColors.strokeColor} strokeWidth="8" />
          
          {/* Refresh arrow in center */}
          <Path 
            d="M256 240 L256 360 M220 300 L256 240 L292 300" 
            stroke={themeColors.textColor} 
            strokeWidth="12" 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            fill="none"
          />
        </G>
      </Svg>
    </Animated.View>
  );
};

export default PullToRefreshLogo;
