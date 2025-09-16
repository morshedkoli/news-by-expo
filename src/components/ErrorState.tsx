import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, Button, Surface } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, SPACING } from '../constants';

interface ErrorStateProps {
  title?: string;
  message?: string;
  buttonText?: string;
  onRetry?: () => void;
  icon?: keyof typeof Ionicons.glyphMap;
}

const ErrorState: React.FC<ErrorStateProps> = ({
  title = 'Something went wrong',
  message = 'We encountered an error while loading the content. Please try again.',
  buttonText = 'Try Again',
  onRetry,
  icon = 'alert-circle-outline',
}) => {
  return (
    <View style={styles.container}>
      <Surface style={styles.errorCard} elevation={0}>
        <LinearGradient
          colors={[COLORS.surface, COLORS.backgroundSecondary]}
          style={styles.gradient}
        >
          <View style={styles.iconContainer}>
            <LinearGradient
              colors={[COLORS.error + '20', COLORS.error + '10']}
              style={styles.iconBackground}
            >
              <Ionicons 
                name={icon} 
                size={32} 
                color={COLORS.error} 
              />
            </LinearGradient>
          </View>
          
          <Text variant="headlineSmall" style={styles.title}>
            {title}
          </Text>
          
          <Text variant="bodyMedium" style={styles.message}>
            {message}
          </Text>
          
          {onRetry && (
            <Button 
              mode="contained" 
              onPress={onRetry}
              style={styles.button}
              buttonColor={COLORS.primary}
              contentStyle={styles.buttonContent}
              labelStyle={styles.buttonLabel}
            >
              {buttonText}
            </Button>
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
  errorCard: {
    borderRadius: 16,
    overflow: 'hidden',
    maxWidth: 320,
    ...COLORS.shadows.medium,
  },
  gradient: {
    padding: SPACING.lg,
    alignItems: 'center',
  },
  iconContainer: {
    marginBottom: SPACING.md,
  },
  iconBackground: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    marginBottom: SPACING.md,
    textAlign: 'center',
    fontWeight: '700',
    color: COLORS.text.primary,
    letterSpacing: -0.2,
  },
  message: {
    marginBottom: SPACING.xl,
    textAlign: 'center',
    color: COLORS.text.secondary,
    lineHeight: 22,
    fontWeight: '400',
  },
  button: {
    borderRadius: 12,
    minWidth: 140,
    ...COLORS.shadows.small,
  },
  buttonContent: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
  },
  buttonLabel: {
    fontWeight: '600',
    letterSpacing: 0.2,
  },
});

export default ErrorState;