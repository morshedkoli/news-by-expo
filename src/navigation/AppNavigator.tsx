import React, { useRef, useEffect } from 'react';
import { NavigationContainer, NavigationContainerRef } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { Provider as PaperProvider } from 'react-native-paper';
import { StatusBar } from 'expo-status-bar';
import navigationService from '../services/navigationService';

// Import screens (we'll create these next)
import HomeScreen from '../screens/HomeScreen';
import ArticleReaderScreen from '../screens/ArticleReaderScreen';
import NotificationDebug from '../components/NotificationDebug';
import SettingsScreen from '../screens/SettingsScreen';

import { RootStackParamList } from '../types';
import { useAppSelector } from '../hooks/redux';
import { COLORS } from '../constants';

const Stack = createStackNavigator<RootStackParamList>();

const AppNavigator: React.FC = () => {
  const navigationRef = useRef<NavigationContainerRef<RootStackParamList>>(null);
  const theme = useAppSelector(state => state.preferences.theme);

  useEffect(() => {
    navigationService.setNavigationRef(navigationRef.current);
  }, []);
  
  const paperTheme = {
    colors: {
      primary: COLORS.primary,
      accent: COLORS.secondary,
      background: theme === 'dark' ? COLORS.backgroundDark : COLORS.background,
      surface: theme === 'dark' ? COLORS.surfaceDark : COLORS.surface,
      text: theme === 'dark' ? COLORS.onBackgroundDark : COLORS.onBackground,
    },
  };

  const statusBarStyle = theme === 'dark' ? 'light' : 'dark';

  return (
    <PaperProvider theme={paperTheme}>
      <NavigationContainer ref={navigationRef}>
        <StatusBar style={statusBarStyle} />
        <Stack.Navigator
          initialRouteName="Home"
          screenOptions={{
            headerStyle: {
              backgroundColor: COLORS.primary,
            },
            headerTintColor: COLORS.onPrimary,
            headerTitleStyle: {
              fontWeight: 'bold',
            },
          }}
        >
          <Stack.Screen 
            name="Home" 
            component={HomeScreen}
            options={{ 
              headerShown: false, // Hide the navigation header since we have a custom one
            }}
          />
          <Stack.Screen 
            name="ArticleReader" 
            component={ArticleReaderScreen}
            options={{ 
              headerShown: false, // Hide default header since component has custom header
            }}
          />
          <Stack.Screen 
            name="ArticleDetail" 
            component={ArticleReaderScreen}
            options={{ 
              headerShown: false, // Hide default header since component has custom header
            }}
          />
          <Stack.Screen 
            name="Settings" 
            component={SettingsScreen}
            options={{ 
              headerShown: false, // Hide default header since component has custom header
            }}
          />
          <Stack.Screen 
            name="NotificationDebug" 
            component={NotificationDebug}
            options={{ 
              title: 'Notification Debug',
              headerShown: true,
            }}
          />
        </Stack.Navigator>
      </NavigationContainer>
    </PaperProvider>
  );
};

export default AppNavigator;