import React, { useEffect, useRef } from 'react';
import { AppState, AppStateStatus } from 'react-native';
import notificationService from '../services/notificationService';
import newsNotificationService from '../services/newsNotificationService';
import webhookService from '../services/webhookService';

interface NotificationHandlerProps {
  children: React.ReactNode;
}

const NotificationHandler: React.FC<NotificationHandlerProps> = ({ children }) => {
  const appState = useRef(AppState.currentState);

  useEffect(() => {
    // Initialize notification service
    initializeNotifications();

    // Handle app state changes
    const subscription = AppState.addEventListener('change', handleAppStateChange);

    return () => {
      // Cleanup listeners
      notificationService.cleanup();
      newsNotificationService.cleanup();
      webhookService.cleanup();
      subscription?.remove();
    };
  }, []);

  const initializeNotifications = async () => {
    try {
      console.log('Initializing notifications...');
      const success = await notificationService.initialize();
      if (success) {
        console.log('Notifications initialized successfully');
        
        // Initialize news notification service
        await newsNotificationService.initialize();
        console.log('News notification service initialized');
        
        // Initialize webhook service for real-time notifications
        await webhookService.initialize();
        console.log('Webhook service initialized');
      } else {
        console.log('Failed to initialize notifications');
      }
    } catch (error) {
      console.error('Failed to initialize notification service:', error);
    }
  };

  const handleAppStateChange = (nextAppState: AppStateStatus) => {
    if (appState.current.match(/inactive|background/) && nextAppState === 'active') {
      console.log('App has come to the foreground');
      // Clear notifications when app becomes active
      notificationService.clearAllNotifications();
    }
    appState.current = nextAppState;
  };

  return <>{children}</>;
};

export default NotificationHandler;
