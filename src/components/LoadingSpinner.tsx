import React from 'react';
import { View, StyleSheet } from 'react-native';
import { ActivityIndicator, Text, Surface } from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, SPACING } from '../constants';

interface LoadingSpinnerProps {
  message?: string;
  size?: 'small' | 'large';
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ 
  message = 'Loading...', 
  size = 'large' 
}) => {
  return (
    <View style={styles.container}>
      <Surface style={styles.loadingCard} elevation={0}>
        <LinearGradient
          colors={[COLORS.surface, COLORS.backgroundSecondary]}
          style={styles.gradient}
        >
          <View style={styles.spinnerContainer}>
            <ActivityIndicator 
              size={size === 'large' ? 32 : 24} 
              color={COLORS.primary} 
              style={styles.spinner}
            />
          </View>
          {message && (
            <Text variant="bodyMedium" style={styles.message}>
              {message}
            </Text>
          )}
        </LinearGradient>
      </Surface>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.lg,
    backgroundColor: COLORS.backgroundSecondary,
  },
  loadingCard: {
    borderRadius: 16,
    overflow: 'hidden',
    minWidth: 200,
    ...COLORS.shadows.medium,
  },
  gradient: {
    padding: SPACING.lg,
    alignItems: 'center',
  },
  spinnerContainer: {
    marginBottom: SPACING.md,
  },
  spinner: {
    transform: [{ scale: 1.2 }],
  },
  message: {
    textAlign: 'center',
    color: COLORS.text.secondary,
    fontWeight: '500',
    letterSpacing: 0.2,
  },
});

export default LoadingSpinner;