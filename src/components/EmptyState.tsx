import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, Surface } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, SPACING } from '../constants';

interface EmptyStateProps {
  title?: string;
  message?: string;
  icon?: keyof typeof Ionicons.glyphMap;
}

const EmptyState: React.FC<EmptyStateProps> = ({
  title = 'No articles found',
  message = 'There are no articles available at the moment. Please check back later.',
  icon = 'newspaper-outline',
}) => {
  return (
    <View style={styles.container}>
      <Surface style={styles.emptyCard} elevation={0}>
        <LinearGradient
          colors={[COLORS.surface, COLORS.backgroundSecondary]}
          style={styles.gradient}
        >
          <View style={styles.iconContainer}>
            <LinearGradient
              colors={[COLORS.text.tertiary + '20', COLORS.text.tertiary + '10']}
              style={styles.iconBackground}
            >
              <Ionicons 
                name={icon} 
                size={32} 
                color={COLORS.text.tertiary} 
              />
            </LinearGradient>
          </View>
          
          <Text variant="headlineSmall" style={styles.title}>
            {title}
          </Text>
          
          <Text variant="bodyMedium" style={styles.message}>
            {message}
          </Text>
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
  emptyCard: {
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
    textAlign: 'center',
    color: COLORS.text.secondary,
    lineHeight: 22,
    fontWeight: '400',
  },
});

export default EmptyState;