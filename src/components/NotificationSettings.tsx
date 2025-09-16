import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Switch, TouchableOpacity, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import newsNotificationService from '../services/newsNotificationService';
import { COLORS, SPACING } from '../constants';

interface NotificationSettingsProps {
  onSettingsChange?: (enabled: boolean) => void;
}

export default function NotificationSettings({ onSettingsChange }: NotificationSettingsProps) {
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const enabled = await newsNotificationService.getNotificationsEnabled();
      setNotificationsEnabled(enabled);
    } catch (error) {
      console.error('Failed to load notification settings:', error);
    }
  };

  const handleToggleNotifications = async (enabled: boolean) => {
    try {
      setLoading(true);
      await newsNotificationService.setNotificationsEnabled(enabled);
      setNotificationsEnabled(enabled);
      onSettingsChange?.(enabled);
      
      Alert.alert(
        'Notification Settings',
        enabled 
          ? 'You will now receive notifications when new articles are published.'
          : 'You will no longer receive notifications for new articles.',
        [{ text: 'OK' }]
      );
    } catch (error) {
      console.error('Failed to update notification settings:', error);
      Alert.alert('Error', 'Failed to update notification settings. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleTestNotification = async () => {
    try {
      setLoading(true);
      const count = await newsNotificationService.manualCheck();
      
      Alert.alert(
        'Test Complete',
        count > 0 
          ? `Found ${count} recent notifications.`
          : 'No new articles found. Test notification functionality is working.',
        [{ text: 'OK' }]
      );
    } catch (error) {
      console.error('Failed to test notifications:', error);
      Alert.alert('Error', 'Failed to test notifications. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Ionicons name="notifications-outline" size={24} color={COLORS.primary} />
        <Text style={styles.title}>Push Notifications</Text>
      </View>

      <View style={styles.settingItem}>
        <View style={styles.settingContent}>
          <Text style={styles.settingTitle}>New Article Notifications</Text>
          <Text style={styles.settingDescription}>
            Get notified when new articles are published
          </Text>
        </View>
        <Switch
          value={notificationsEnabled}
          onValueChange={handleToggleNotifications}
          disabled={loading}
          trackColor={{ false: COLORS.border.light, true: COLORS.primaryLight }}
          thumbColor={notificationsEnabled ? COLORS.primary : COLORS.border.medium}
        />
      </View>

      <TouchableOpacity 
        style={[styles.testButton, loading && styles.testButtonDisabled]}
        onPress={handleTestNotification}
        disabled={loading}
      >
        <Ionicons 
          name="checkmark-circle-outline" 
          size={20} 
          color={loading ? COLORS.text.tertiary : COLORS.primary} 
        />
        <Text style={[styles.testButtonText, loading && styles.testButtonTextDisabled]}>
          {loading ? 'Checking...' : 'Check for New Articles'}
        </Text>
      </TouchableOpacity>

      <View style={styles.infoSection}>
        <Ionicons name="information-circle-outline" size={16} color={COLORS.text.secondary} />
        <Text style={styles.infoText}>
          The app checks for new articles every 5 minutes when notifications are enabled. 
          You can also manually check using the button above.
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: SPACING.md,
    marginVertical: SPACING.sm,
    ...COLORS.shadows.small,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.text.primary,
    marginLeft: SPACING.sm,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border.light,
    marginBottom: SPACING.md,
  },
  settingContent: {
    flex: 1,
    marginRight: SPACING.md,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: COLORS.text.primary,
    marginBottom: 4,
  },
  settingDescription: {
    fontSize: 14,
    color: COLORS.text.secondary,
    lineHeight: 20,
  },
  testButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.backgroundSecondary,
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.border.light,
    marginBottom: SPACING.md,
  },
  testButtonDisabled: {
    opacity: 0.6,
  },
  testButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.primary,
    marginLeft: SPACING.xs,
  },
  testButtonTextDisabled: {
    color: COLORS.text.tertiary,
  },
  infoSection: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: COLORS.backgroundSecondary,
    padding: SPACING.sm,
    borderRadius: 8,
  },
  infoText: {
    fontSize: 12,
    color: COLORS.text.secondary,
    lineHeight: 16,
    marginLeft: SPACING.xs,
    flex: 1,
  },
});
