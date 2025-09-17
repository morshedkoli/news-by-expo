import React, { useState, useEffect } from 'react';
import { View } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import SplashScreen from './SplashScreen';
import AppNavigator from '../navigation/AppNavigator';

const SPLASH_SHOWN_KEY = '@news_hut_splash_shown';

const AppWrapper: React.FC = () => {
  const [showSplash, setShowSplash] = useState(true);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const initializeApp = async () => {
      try {
        // Check if splash was already shown in this session
        const splashShown = await AsyncStorage.getItem(SPLASH_SHOWN_KEY);
        
        // Always show splash on first app launch or if it's been a while
        const now = Date.now();
        const lastShown = splashShown ? parseInt(splashShown, 10) : 0;
        const timeDiff = now - lastShown;
        
        // Show splash if it's been more than 1 hour since last shown
        const shouldShowSplash = !splashShown || timeDiff > 3600000;
        
        if (!shouldShowSplash) {
          setShowSplash(false);
        }
        
        setIsReady(true);
      } catch (error) {
        console.warn('Error checking splash screen status:', error);
        setIsReady(true);
      }
    };

    initializeApp();
  }, []);

  const handleSplashFinish = async () => {
    try {
      // Mark splash as shown with current timestamp
      await AsyncStorage.setItem(SPLASH_SHOWN_KEY, Date.now().toString());
    } catch (error) {
      console.warn('Error saving splash screen status:', error);
    }
    
    setShowSplash(false);
  };

  if (!isReady) {
    return <View style={{ flex: 1, backgroundColor: '#FF5722' }} />;
  }

  if (showSplash) {
    return <SplashScreen onFinish={handleSplashFinish} />;
  }

  return <AppNavigator />;
};

export default AppWrapper;
