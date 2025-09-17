import React, { useEffect, useRef } from 'react';
import { Animated } from 'react-native';
import Svg, { Circle, Path, Rect, Text, Defs, LinearGradient, Stop, G } from 'react-native-svg';

interface LogoCompactProps {
  size?: number;
  style?: any;
  animated?: boolean;
  theme?: 'light' | 'dark' | 'auto';
}

const LogoCompact: React.FC<LogoCompactProps> = ({ size = 32, style, animated = false, theme = 'light' }) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;

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
    if (animated) {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          tension: 120,
          friction: 8,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      fadeAnim.setValue(1);
      scaleAnim.setValue(1);
    }
  }, [animated, fadeAnim, scaleAnim]);

  const animatedStyle = animated ? {
    opacity: fadeAnim,
    transform: [{ scale: scaleAnim }],
  } : {};

  return (
    <Animated.View style={[{ width: size, height: size }, style, animatedStyle]}>
      <Svg width={size} height={size} viewBox="0 0 512 512">
        <Defs>
          <LinearGradient id="compactRoofGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <Stop offset="0%" stopColor="#FF7043" stopOpacity={0.8} />
            <Stop offset="100%" stopColor="#FF5722" stopOpacity={0} />
          </LinearGradient>
        </Defs>
        
        {/* Simplified house shape for compact view */}
        <G>
          {/* Main roof */}
          <Path 
            d="M256 80 L400 180 L400 190 L112 190 L112 180 L256 80 Z" 
            fill="#FF5722" 
            stroke="#263238" 
            strokeWidth="8" 
            strokeLinejoin="round"
          />
          
          {/* Roof highlight */}
          <Path d="M256 80 L400 180 L112 180 L256 80 Z" fill="url(#compactRoofGradient)" />
          
          {/* House body */}
          <Rect x="120" y="180" width="272" height="252" rx="16" ry="16" fill={themeColors.houseBody} stroke={themeColors.strokeColor} strokeWidth="8" />
          
          {/* Simplified "N" for NEWS */}
          <Text 
            x="256" 
            y="320" 
            fontFamily="Arial Black, Arial, sans-serif" 
            fontSize="120" 
            fontWeight="900" 
            textAnchor="middle" 
            fill={themeColors.textColor}
          >
            N
          </Text>
        </G>
      </Svg>
    </Animated.View>
  );
};

export default LogoCompact;
