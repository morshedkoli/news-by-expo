import React, { useEffect, useRef, useState } from 'react';
import { View, StyleSheet, StatusBar, Animated, Dimensions } from 'react-native';
import { Text } from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, SPACING, APP_CONFIG } from '../constants';
import Logo from './Logo';

interface SplashScreenProps {
  onFinish?: () => void;
}

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

const SplashScreen: React.FC<SplashScreenProps> = ({ onFinish }) => {
  const [showContent, setShowContent] = useState(false);
  
  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.3)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const titleFadeAnim = useRef(new Animated.Value(0)).current;
  const subtitleFadeAnim = useRef(new Animated.Value(0)).current;
  const backgroundFadeAnim = useRef(new Animated.Value(0)).current;
  const dot1Anim = useRef(new Animated.Value(0.3)).current;
  const dot2Anim = useRef(new Animated.Value(0.3)).current;
  const dot3Anim = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    // Start background fade immediately
    Animated.timing(backgroundFadeAnim, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();

    // Delay content appearance slightly
    const contentTimer = setTimeout(() => {
      setShowContent(true);
    }, 200);

    // Logo animation sequence
    const logoSequence = Animated.sequence([
      // Logo appears with scale and fade
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          tension: 50,
          friction: 8,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 800,
          useNativeDriver: true,
        }),
      ]),
      // Small delay before title
      Animated.delay(300),
      // Title appears
      Animated.timing(titleFadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      // Small delay before subtitle
      Animated.delay(200),
      // Subtitle appears
      Animated.timing(subtitleFadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
    ]);

    logoSequence.start();

    // Start dot animations after subtitle appears
    const startDotAnimations = () => {
      const dotAnimation = Animated.loop(
        Animated.stagger(200, [
          Animated.sequence([
            Animated.timing(dot1Anim, { toValue: 1, duration: 400, useNativeDriver: true }),
            Animated.timing(dot1Anim, { toValue: 0.3, duration: 400, useNativeDriver: true }),
          ]),
          Animated.sequence([
            Animated.timing(dot2Anim, { toValue: 1, duration: 400, useNativeDriver: true }),
            Animated.timing(dot2Anim, { toValue: 0.3, duration: 400, useNativeDriver: true }),
          ]),
          Animated.sequence([
            Animated.timing(dot3Anim, { toValue: 1, duration: 400, useNativeDriver: true }),
            Animated.timing(dot3Anim, { toValue: 0.3, duration: 400, useNativeDriver: true }),
          ]),
        ])
      );
      dotAnimation.start();
    };

    const dotTimer = setTimeout(startDotAnimations, 2000);

    // Auto finish after animation completes
    const finishTimer = setTimeout(() => {
      onFinish?.();
    }, 3500);

    return () => {
      clearTimeout(contentTimer);
      clearTimeout(dotTimer);
      clearTimeout(finishTimer);
    };
  }, [onFinish, fadeAnim, scaleAnim, slideAnim, titleFadeAnim, subtitleFadeAnim, backgroundFadeAnim, dot1Anim, dot2Anim, dot3Anim]);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.primaryDark} />
      <Animated.View style={[styles.backgroundContainer, { opacity: backgroundFadeAnim }]}>
        <LinearGradient
          colors={[...COLORS.gradients.header, COLORS.primaryDark]}
          style={styles.gradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        />
      </Animated.View>
      
      {showContent && (
        <Animated.View 
          style={[
            styles.content,
            {
              opacity: fadeAnim,
              transform: [
                { scale: scaleAnim },
                { translateY: slideAnim }
              ]
            }
          ]}
        >
          <View style={styles.logoContainer}>
            <Logo size={140} animated={true} style={styles.logo} />
          </View>
          
          <Animated.View 
            style={[
              styles.textContainer,
              { opacity: titleFadeAnim }
            ]}
          >
            <Text variant="headlineLarge" style={styles.title}>
              {APP_CONFIG.NAME}
            </Text>
          </Animated.View>
          
          <Animated.View 
            style={[
              styles.subtitleContainer,
              { opacity: subtitleFadeAnim }
            ]}
          >
            <Text variant="bodyLarge" style={styles.subtitle}>
              Your trusted news companion
            </Text>
            <View style={styles.loadingDots}>
              <Animated.View style={[styles.dot, styles.dot1, { opacity: dot1Anim }]} />
              <Animated.View style={[styles.dot, styles.dot2, { opacity: dot2Anim }]} />
              <Animated.View style={[styles.dot, styles.dot3, { opacity: dot3Anim }]} />
            </View>
          </Animated.View>
        </Animated.View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  backgroundContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  gradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    alignItems: 'center',
    paddingHorizontal: SPACING.xl,
    flex: 1,
    justifyContent: 'center',
  },
  logoContainer: {
    marginBottom: SPACING.xl,
    alignItems: 'center',
  },
  logo: {
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  textContainer: {
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  title: {
    color: COLORS.text.inverse,
    fontWeight: '700',
    textAlign: 'center',
    letterSpacing: -0.5,
    fontSize: 32,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  subtitleContainer: {
    alignItems: 'center',
  },
  subtitle: {
    color: COLORS.text.inverse + 'CC',
    textAlign: 'center',
    fontWeight: '400',
    fontSize: 16,
    marginBottom: SPACING.lg,
  },
  loadingDots: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: SPACING.md,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.text.inverse + '80',
    marginHorizontal: 4,
  },
  dot1: {
    // First dot - no additional styles needed
  },
  dot2: {
    // Second dot - no additional styles needed
  },
  dot3: {
    // Third dot - no additional styles needed
  },
});

export default SplashScreen;
