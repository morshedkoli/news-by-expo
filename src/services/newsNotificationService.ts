import AsyncStorage from '@react-native-async-storage/async-storage';
import notificationService from './notificationService';
import { API_CONFIG } from '../constants';

interface NewArticleData {
  id: string;
  title: string;
  excerpt: string;
  category?: {
    id: string;
    name: string;
  };
  imageUrl?: string;
  createdAt: string;
}

class NewsNotificationService {
  private pollInterval: NodeJS.Timeout | null = null;
  private lastCheckedTimestamp: string | null = null;
  private isPolling = false;

  async initialize(): Promise<void> {
    try {
      // Get last checked timestamp from storage
      this.lastCheckedTimestamp = await AsyncStorage.getItem('last_news_check');
      
      // Start polling for new articles every 5 minutes
      this.startPolling();
      
      console.log('📰 News notification service initialized');
    } catch (error) {
      console.error('Failed to initialize news notification service:', error);
    }
  }

  startPolling(): void {
    if (this.isPolling) return;
    
    this.isPolling = true;
    
    // Check immediately
    this.checkForNewArticles();
    
    // Then check every 5 minutes
    this.pollInterval = setInterval(() => {
      this.checkForNewArticles();
    }, 5 * 60 * 1000); // 5 minutes
    
    console.log('📰 Started polling for new articles');
  }

  stopPolling(): void {
    if (this.pollInterval) {
      clearInterval(this.pollInterval);
      this.pollInterval = null;
    }
    this.isPolling = false;
    console.log('📰 Stopped polling for new articles');
  }

  async checkForNewArticles(): Promise<void> {
    try {
      const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.NEWS}?published=true&limit=10&sort=createdAt:desc`);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      const articles = data.news || [];

      if (articles.length === 0) return;

      // If this is the first check, just update the timestamp without sending notifications
      if (!this.lastCheckedTimestamp) {
        await this.updateLastCheckedTimestamp(articles[0].createdAt);
        return;
      }

      // Find new articles since last check
      const lastChecked = new Date(this.lastCheckedTimestamp);
      const newArticles = articles.filter((article: any) => 
        new Date(article.createdAt) > lastChecked
      );

      if (newArticles.length > 0) {
        console.log(`📰 Found ${newArticles.length} new articles`);
        
        // Send notifications for new articles (limit to 3 most recent to avoid spam)
        const articlesToNotify = newArticles.slice(0, 3);
        
        for (const article of articlesToNotify) {
          await this.sendNewArticleNotification(article);
          // Small delay between notifications
          await new Promise(resolve => setTimeout(resolve, 1000));
        }

        // Update last checked timestamp to the most recent article
        await this.updateLastCheckedTimestamp(newArticles[0].createdAt);
      }
    } catch (error) {
      console.error('Failed to check for new articles:', error);
    }
  }

  private async sendNewArticleNotification(article: NewArticleData): Promise<void> {
    try {
      // Check if notifications are enabled
      const notificationsEnabled = await AsyncStorage.getItem('notifications_enabled');
      if (notificationsEnabled === 'false') {
        console.log('📰 Notifications disabled, skipping notification');
        return;
      }

      await notificationService.handleNewsNotification(article);
      
      // Track notification sent
      await this.trackNotificationSent(article.id);
      
      console.log(`📰 Sent notification for article: ${article.title}`);
    } catch (error) {
      console.error('Failed to send new article notification:', error);
    }
  }

  private async updateLastCheckedTimestamp(timestamp: string): Promise<void> {
    try {
      this.lastCheckedTimestamp = timestamp;
      await AsyncStorage.setItem('last_news_check', timestamp);
    } catch (error) {
      console.error('Failed to update last checked timestamp:', error);
    }
  }

  private async trackNotificationSent(articleId: string): Promise<void> {
    try {
      const sentNotifications = await AsyncStorage.getItem('sent_notifications');
      const notifications = sentNotifications ? JSON.parse(sentNotifications) : [];
      
      notifications.push({
        articleId,
        sentAt: new Date().toISOString(),
      });

      // Keep only last 50 notifications to prevent storage bloat
      const recentNotifications = notifications.slice(-50);
      
      await AsyncStorage.setItem('sent_notifications', JSON.stringify(recentNotifications));
    } catch (error) {
      console.error('Failed to track notification:', error);
    }
  }

  // Method to handle webhook notifications from admin panel
  async handleWebhookNotification(articleData: NewArticleData): Promise<void> {
    try {
      console.log('📰 Received webhook notification for new article:', articleData.title);
      
      // Send immediate notification
      await this.sendNewArticleNotification(articleData);
      
      // Update last checked timestamp
      await this.updateLastCheckedTimestamp(articleData.createdAt);
      
    } catch (error) {
      console.error('Failed to handle webhook notification:', error);
    }
  }

  // Method to manually trigger check for new articles
  async manualCheck(): Promise<number> {
    await this.checkForNewArticles();
    
    // Return count of notifications in last hour for feedback
    try {
      const sentNotifications = await AsyncStorage.getItem('sent_notifications');
      if (!sentNotifications) return 0;
      
      const notifications = JSON.parse(sentNotifications);
      const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
      
      return notifications.filter((n: any) => 
        new Date(n.sentAt) > oneHourAgo
      ).length;
    } catch {
      return 0;
    }
  }

  // Method to enable/disable notifications
  async setNotificationsEnabled(enabled: boolean): Promise<void> {
    try {
      await AsyncStorage.setItem('notifications_enabled', enabled.toString());
      
      if (enabled) {
        this.startPolling();
      } else {
        this.stopPolling();
      }
      
      console.log(`📰 News notifications ${enabled ? 'enabled' : 'disabled'}`);
    } catch (error) {
      console.error('Failed to update notification settings:', error);
    }
  }

  async getNotificationsEnabled(): Promise<boolean> {
    try {
      const enabled = await AsyncStorage.getItem('notifications_enabled');
      return enabled !== 'false'; // Default to true
    } catch {
      return true;
    }
  }

  cleanup(): void {
    this.stopPolling();
  }
}

export const newsNotificationService = new NewsNotificationService();
export default newsNotificationService;
