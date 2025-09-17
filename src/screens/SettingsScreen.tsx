import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Text, Appbar, List, Switch, Button } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../types';
import { COLORS, SPACING, APP_CONFIG } from '../constants';
import { useAppSelector, useAppDispatch } from '../hooks/redux';
import { setTheme, setFontSize, toggleNotifications } from '../store/slices/preferencesSlice';
import NotificationSettings from '../components/NotificationSettings';
import Logo from '../components/Logo';

type SettingsNavigationProp = StackNavigationProp<RootStackParamList, 'Settings'>;

interface SettingsScreenProps {
  navigation: SettingsNavigationProp;
}

const SettingsScreen: React.FC<SettingsScreenProps> = ({ navigation }) => {
  const dispatch = useAppDispatch();
  const preferences = useAppSelector(state => state.preferences);

  const handleGoBack = () => {
    navigation.goBack();
  };

  const handleThemeChange = () => {
    const themes: ('light' | 'dark' | 'auto')[] = ['light', 'dark', 'auto'];
    const currentIndex = themes.indexOf(preferences.theme);
    const nextIndex = (currentIndex + 1) % themes.length;
    dispatch(setTheme(themes[nextIndex]));
  };

  const handleFontSizeChange = () => {
    const sizes: ('small' | 'medium' | 'large')[] = ['small', 'medium', 'large'];
    const validFontSize = sizes.includes(preferences.fontSize as any) ? preferences.fontSize : 'medium';
    const currentIndex = sizes.indexOf(validFontSize as any);
    const nextIndex = (currentIndex + 1) % sizes.length;
    dispatch(setFontSize(sizes[nextIndex]));
  };

  const handleNotificationToggle = () => {
    dispatch(toggleNotifications());
  };

  return (
    <View style={styles.container}>
      <Appbar.Header style={styles.header}>
        <Appbar.BackAction onPress={handleGoBack} />
        <Appbar.Content title="Settings" />
      </Appbar.Header>
      
      <ScrollView style={styles.scrollView}>
        <List.Section>
          <List.Subheader>Appearance</List.Subheader>
          
          <List.Item
            title="Theme"
            description={`Current: ${preferences.theme}`}
            left={props => <List.Icon {...props} icon="palette-outline" />}
            right={() => (
              <Button mode="outlined" onPress={handleThemeChange}>
                {preferences.theme}
              </Button>
            )}
          />
          
          <List.Item
            title="Font Size"
            description={`Current: ${['small', 'medium', 'large'].includes(preferences.fontSize) ? preferences.fontSize : 'medium'}`}
            left={props => <List.Icon {...props} icon="format-size" />}
            right={() => (
              <Button mode="outlined" onPress={handleFontSizeChange}>
                {['small', 'medium', 'large'].includes(preferences.fontSize) ? preferences.fontSize : 'medium'}
              </Button>
            )}
          />
        </List.Section>

        <List.Section>
          <List.Subheader>Notifications</List.Subheader>
          
          <NotificationSettings 
            onSettingsChange={(enabled) => {
              // Sync with Redux store
              if (enabled !== preferences.notificationsEnabled) {
                dispatch(toggleNotifications());
              }
            }}
          />
          
          <List.Item
            title="Notification Debug"
            description="Debug notification functionality"
            left={props => <List.Icon {...props} icon="bug-outline" />}
            onPress={() => navigation.navigate('NotificationDebug')}
          />
        </List.Section>

        <List.Section>
          <List.Subheader>About</List.Subheader>
          
          <List.Item
            title="App Version"
            description={APP_CONFIG.VERSION}
            left={props => <List.Icon {...props} icon="information-outline" />}
          />
          
          <List.Item
            title="App Name"
            description={APP_CONFIG.NAME}
            left={props => <List.Icon {...props} icon="application-outline" />}
          />
        </List.Section>

        <View style={styles.footer}>
          <Logo size={48} style={styles.footerLogo} />
          <Text variant="bodySmall" style={styles.footerText}>
            Built with React Native & Expo
          </Text>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    backgroundColor: COLORS.primary,
  },
  scrollView: {
    flex: 1,
  },
  footer: {
    padding: SPACING.lg,
    alignItems: 'center',
  },
  footerLogo: {
    marginBottom: SPACING.sm,
  },
  footerText: {
    color: COLORS.onBackground + '60',
    textAlign: 'center',
  },
});

export default SettingsScreen;