import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated } from 'react-native';
import Svg, { Circle, Path, Rect, Text, Defs, LinearGradient, Stop, G } from 'react-native-svg';

interface LogoProps {
  size?: number;
  style?: any;
  animated?: boolean;
  theme?: 'light' | 'dark' | 'auto';
}

const Logo: React.FC<LogoProps> = ({ size = 64, style, animated = false, theme = 'light' }) => {
  const scale = size / 512; // Scale factor based on original 512x512 size
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
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          tension: 100,
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
          <LinearGradient id="roofGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <Stop offset="0%" stopColor="#FF7043" stopOpacity={0.8} />
            <Stop offset="100%" stopColor="#FF5722" stopOpacity={0} />
          </LinearGradient>
        </Defs>
        
        {/* Background circle for better app icon appearance */}
        <Circle cx="256" cy="256" r="240" fill="#F8F9FA" />
        
        {/* House shape with orange roof */}
        <G>
          {/* Roof shadow for depth */}
          <Path d="M256 80 L420 200 L420 215 L92 215 L92 200 L256 80 Z" fill="#E64A19" opacity={0.3} />
          
          {/* Main roof */}
          <Path 
            d="M256 70 L415 195 L415 205 L97 205 L97 195 L256 70 Z" 
            fill="#FF5722" 
            stroke="#263238" 
            strokeWidth="12" 
            strokeLinejoin="round"
          />
          
          {/* Roof highlight */}
          <Path d="M256 70 L415 195 L97 195 L256 70 Z" fill="url(#roofGradient)" />
          
          {/* Roof dot */}
          <Circle cx="256" cy="150" r="10" fill="#263238" />
          
          {/* House body shadow */}
          <Rect x="105" y="205" width="302" height="222" rx="20" ry="20" fill="#E0E0E0" opacity={0.3} />
          
          {/* House body */}
          <Rect x="112" y="280" width="288" height="152" rx="16" ry="16" fill={themeColors.houseBody} stroke={themeColors.strokeColor} strokeWidth="8" />
          
          {/* NEWS text */}
          <Text 
            x="256" 
            y="290" 
            fontFamily="Arial Black, Arial, sans-serif" 
            fontSize="48" 
            fontWeight="900" 
            textAnchor="middle" 
            fill={themeColors.textColor}
          >
            NEWS
          </Text>
          
          {/* News lines (left side) */}
          <Rect x="130" y="320" width="70" height="6" rx="3" fill={themeColors.textColor} />
          <Rect x="130" y="335" width="70" height="6" rx="3" fill={themeColors.textColor} />
          <Rect x="130" y="350" width="50" height="6" rx="3" fill={themeColors.textColor} />
          
          {/* News image placeholder (right side) */}
          <Rect x="320" y="320" width="62" height="40" rx="6" fill={themeColors.textColor} />
        </G>
      </Svg>
    </Animated.View>
  );
};

export default Logo;
