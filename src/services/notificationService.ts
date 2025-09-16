import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';
import Constants from 'expo-constants';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface NotificationData extends Record<string, unknown> {
  articleId?: string;
  title?: string;
  body?: string;
  type?: 'news' | 'general';
}

// Configure notification behavior
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

class ExpoNotificationService {
  private expoPushToken: string | null = null;
  private notificationListener: Notifications.Subscription | null = null;
  private responseListener: Notifications.Subscription | null = null;

  // Initialize notification service
  async initialize(): Promise<boolean> {
    try {
      console.log('🚀 Starting notification service initialization...');
      
      // Request permissions
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;
      console.log('📋 Current permission status:', existingStatus);

      if (existingStatus !== 'granted') {
        console.log('🔐 Requesting notification permissions...');
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
        console.log('✅ Permission request result:', status);
      }

      if (finalStatus !== 'granted') {
        console.log('❌ Notification permission not granted');
        return false;
      }

      // Setup listeners FIRST before getting token
      console.log('🎧 Setting up notification listeners...');
      this.setupNotificationListeners();

      // Configure notification channel (Android)
      if (Platform.OS === 'android') {
        console.log('📱 Setting up Android notification channel...');
        await this.setupAndroidChannel();
      }

      // Get Expo push token
      console.log('🔑 Getting Expo push token...');
      const token = await this.getExpoPushToken();
      if (token) {
        console.log('📤 Registering token with backend...');
        await this.registerToken(token);
      } else {
        console.log('⚠️ Failed to get push token');
      }

      console.log('✅ Notification service initialized successfully');
      return true;
    } catch (error) {
      console.error('❌ Notification initialization failed:', error);
      return false;
    }
  }

  async getExpoPushToken(): Promise<string | null> {
    try {
      if (!Device.isDevice) {
        console.log('Must use physical device for push notifications');
        return null;
      }

      const token = await Notifications.getExpoPushTokenAsync({
        projectId: Constants.expoConfig?.extra?.eas?.projectId || 'your-expo-project-id',
      });

      console.log('Expo Push Token:', token.data);
      this.expoPushToken = token.data;
      return token.data;
    } catch (error) {
      console.error('Failed to get push token:', error);
      return null;
    }
  }

  async registerToken(expoPushToken: string): Promise<void> {
    try {
      const deviceId = await this.getDeviceId();
      const deviceInfo = await this.getDeviceInfo();

      const tokenData = {
        token: expoPushToken,
        deviceId: deviceId,
        platform: Platform.OS,
        isActive: true,
        deviceInfo: deviceInfo,
        userId: await this.getUserId(),
      };

      // Replace with your admin URL
      const response = await fetch('https://news-admin-panel-ruby.vercel.app/api/notifications/tokens', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(tokenData),
      });

      if (response.ok) {
        console.log('Token registered successfully');
        await AsyncStorage.setItem('expo_push_token', expoPushToken);
        await AsyncStorage.setItem('token_registered', 'true');
      } else {
        throw new Error(`Registration failed: ${response.status}`);
      }
    } catch (error) {
      console.error('Token registration failed:', error);
    }
  }

  async getDeviceId(): Promise<string> {
    let deviceId = await AsyncStorage.getItem('device_id');
    if (!deviceId) {
      deviceId = `${Platform.OS}_${Constants.sessionId}_${Date.now()}`;
      await AsyncStorage.setItem('device_id', deviceId);
    }
    return deviceId;
  }

  async getDeviceInfo() {
    return {
      brand: Device.brand,
      manufacturer: Device.manufacturer,
      modelName: Device.modelName,
      osName: Device.osName,
      osVersion: Device.osVersion,
      platform: Platform.OS,
      appVersion: Constants.expoConfig?.version || '1.0.0',
    };
  }

  async getUserId(): Promise<string | null> {
    return await AsyncStorage.getItem('user_id');
  }

  setupNotificationListeners(): void {
    // Listener for notifications received while app is running
    this.notificationListener = Notifications.addNotificationReceivedListener(notification => {
      console.log('Notification received:', notification);
      this.handleNotificationReceived(notification);
    });

    // Listener for when user taps on notification
    this.responseListener = Notifications.addNotificationResponseReceivedListener(response => {
      console.log('Notification response:', response);
      this.handleNotificationResponse(response);
    });
  }

  handleNotificationReceived(notification: Notifications.Notification): void {
    const { title, body, data } = notification.request.content;
    console.log(`🔔 Notification received in foreground: ${title} - ${body}`, data);
    
    // Show alert for foreground notifications
    if (title || body) {
      // You can customize this to show a custom in-app notification
      console.log('📱 Showing foreground notification alert');
    }
    
    Notifications.setBadgeCountAsync(1);
  }

  handleNotificationResponse(response: Notifications.NotificationResponse): void {
    const { data } = response.notification.request.content;
    
    if (data?.newsId || data?.articleId) {
      const articleId = (data.newsId || data.articleId) as string;
      this.navigateToNews(articleId);
    } else if (data?.type === 'news') {
      // Handle news type notifications
      if (data.articleId) {
        this.navigateToNews(data.articleId as string);
      } else {
        this.navigateToHome();
      }
    } else if (data?.type === 'general') {
      this.navigateToHome();
    } else {
      // Default to home for unknown notification types
      this.navigateToHome();
    }
    
    Notifications.setBadgeCountAsync(0);
  }

  navigateToNews(newsId: string): void {
    console.log(`Navigate to news: ${newsId}`);
    // Import navigationService dynamically to avoid circular imports
    import('./navigationService').then(({ default: navigationService }) => {
      navigationService.navigateToArticle(newsId);
    }).catch(error => {
      console.error('Failed to navigate to article:', error);
    });
  }

  navigateToHome(): void {
    console.log('Navigate to home');
    // Import navigationService dynamically to avoid circular imports
    import('./navigationService').then(({ default: navigationService }) => {
      navigationService.navigateToHome();
    }).catch(error => {
      console.error('Failed to navigate to home:', error);
    });
  }

  // Enhanced method to handle news notifications specifically
  async handleNewsNotification(article: any): Promise<void> {
    try {
      const title = `📰 ${article.title}`;
      const body = article.excerpt || 'New article available to read';
      const data = {
        type: 'news' as const,
        articleId: article.id,
        newsId: article.id,
        title: article.title,
        category: article.category?.name,
      };

      await this.scheduleLocalNotification(title, body, data);
      console.log('News notification scheduled:', title);
    } catch (error) {
      console.error('Failed to handle news notification:', error);
    }
  }

  async setupAndroidChannel(): Promise<void> {
    await Notifications.setNotificationChannelAsync('news-updates', {
      name: 'News Updates',
      importance: Notifications.AndroidImportance.HIGH,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#3b82f6',
      sound: 'default',
    });
  }

  async scheduleLocalNotification(title: string, body: string, data: NotificationData = {}): Promise<void> {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: title,
        body: body,
        data: data,
        sound: 'default',
      },
      trigger: null,
    });
  }

  async clearAllNotifications(): Promise<void> {
    await Notifications.dismissAllNotificationsAsync();
    await Notifications.setBadgeCountAsync(0);
  }

  cleanup(): void {
    if (this.notificationListener) {
      this.notificationListener.remove();
    }
    if (this.responseListener) {
      this.responseListener.remove();
    }
  }

  getPushToken(): string | null {
    return this.expoPushToken;
  }
}

export const notificationService = new ExpoNotificationService();
export default notificationService;
