import AsyncStorage from '@react-native-async-storage/async-storage';
import newsNotificationService from './newsNotificationService';
import { API_CONFIG } from '../constants';

interface WebhookPayload {
  type: 'new_article' | 'article_updated' | 'article_deleted';
  data: {
    id: string;
    title: string;
    excerpt: string;
    imageUrl?: string;
    category?: {
      id: string;
      name: string;
    };
    createdAt: string;
    publishedAt?: string;
  };
  timestamp: string;
}

class WebhookService {
  private websocket: WebSocket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = API_CONFIG.WEBSOCKET.MAX_RECONNECT_ATTEMPTS;
  private reconnectDelay = API_CONFIG.WEBSOCKET.RECONNECT_DELAY;
  private isConnecting = false;

  async initialize(): Promise<void> {
    try {
      // Check if WebSocket is enabled in configuration
      if (!API_CONFIG.WEBSOCKET.ENABLED) {
        console.log('📡 WebSocket disabled in configuration. Real-time notifications unavailable.');
        return;
      }

      // Check if real-time notifications are enabled
      const realtimeEnabled = await AsyncStorage.getItem('realtime_notifications');
      if (realtimeEnabled === 'false') {
        console.log('📡 Real-time notifications disabled by user');
        return;
      }

      await this.connect();
    } catch (error) {
      console.error('Failed to initialize webhook service:', error);
    }
  }

  private async connect(): Promise<void> {
    if (this.isConnecting || this.websocket?.readyState === WebSocket.OPEN) {
      return;
    }

    try {
      this.isConnecting = true;
      
      // Get device token for authentication
      const deviceToken = await AsyncStorage.getItem('expo_push_token');
      if (!deviceToken) {
        console.log('📡 No device token available for webhook connection');
        this.isConnecting = false;
        return;
      }

      // Use WebSocket URL from configuration
      const websocketUrl = `${API_CONFIG.WEBSOCKET.URL}?token=${encodeURIComponent(deviceToken)}`;
      
      console.log('📡 Attempting WebSocket connection...');
      this.websocket = new WebSocket(websocketUrl);

      // Set a connection timeout
      const connectionTimeout = setTimeout(() => {
        if (this.websocket && this.websocket.readyState === WebSocket.CONNECTING) {
          console.log('📡 WebSocket connection timeout, closing...');
          this.websocket.close();
          this.isConnecting = false;
        }
      }, 5000);

      this.websocket.onopen = () => {
        console.log('📡 Webhook connection established');
        clearTimeout(connectionTimeout);
        this.reconnectAttempts = 0;
        this.reconnectDelay = 1000;
        this.isConnecting = false;
      };

      this.websocket.onmessage = (event) => {
        this.handleWebhookMessage(event.data);
      };

      this.websocket.onclose = (event) => {
        clearTimeout(connectionTimeout);
        this.isConnecting = false;
        
        // Handle different close codes
        if (event.code === 1006 || event.reason.includes('404')) {
          console.log('📡 WebSocket endpoint not available (404). Real-time notifications disabled.');
          this.reconnectAttempts = this.maxReconnectAttempts; // Stop trying to reconnect
          return;
        }
        
        console.log('📡 Webhook connection closed:', event.code, event.reason);
        this.scheduleReconnect();
      };

      this.websocket.onerror = (error) => {
        clearTimeout(connectionTimeout);
        console.log('📡 WebSocket connection failed - endpoint may not be available');
        this.isConnecting = false;
        
        // Don't log the full error object as it's verbose
        // Instead, check if this is a 404 error and handle gracefully
        if (this.reconnectAttempts === 0) {
          console.log('📡 WebSocket service unavailable. App will work without real-time notifications.');
        }
      };

    } catch (error) {
      console.log('📡 Failed to initialize WebSocket connection:', error instanceof Error ? error.message : 'Unknown error');
      this.isConnecting = false;
      this.scheduleReconnect();
    }
  }

  private scheduleReconnect(): void {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.log('📡 Max reconnection attempts reached. Real-time notifications will be disabled.');
      return;
    }

    this.reconnectAttempts++;
    const delay = Math.min(this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1), 30000); // Cap at 30 seconds

    console.log(`📡 Scheduling reconnection attempt ${this.reconnectAttempts} in ${delay}ms`);
    
    setTimeout(() => {
      this.connect();
    }, delay);
  }

  private async handleWebhookMessage(data: string): Promise<void> {
    try {
      const payload: WebhookPayload = JSON.parse(data);
      console.log('📡 Received webhook message:', payload.type);

      switch (payload.type) {
        case 'new_article':
          await this.handleNewArticle(payload.data);
          break;
        case 'article_updated':
          await this.handleArticleUpdated(payload.data);
          break;
        case 'article_deleted':
          await this.handleArticleDeleted(payload.data);
          break;
        default:
          console.log('📡 Unknown webhook message type:', payload.type);
      }
    } catch (error) {
      console.error('Failed to handle webhook message:', error);
    }
  }

  private async handleNewArticle(articleData: any): Promise<void> {
    try {
      console.log('📡 Handling new article webhook:', articleData.title);
      
      // Send push notification via news notification service
      await newsNotificationService.handleWebhookNotification(articleData);
      
      // Track webhook notification received
      await this.trackWebhookReceived('new_article', articleData.id);
      
    } catch (error) {
      console.error('Failed to handle new article webhook:', error);
    }
  }

  private async handleArticleUpdated(articleData: any): Promise<void> {
    try {
      console.log('📡 Article updated via webhook:', articleData.title);
      
      // For updated articles, we might want to send a different type of notification
      // or just log it for now
      await this.trackWebhookReceived('article_updated', articleData.id);
      
    } catch (error) {
      console.error('Failed to handle article updated webhook:', error);
    }
  }

  private async handleArticleDeleted(articleData: any): Promise<void> {
    try {
      console.log('📡 Article deleted via webhook:', articleData.id);
      
      // Handle article deletion (maybe clear from cache, etc.)
      await this.trackWebhookReceived('article_deleted', articleData.id);
      
    } catch (error) {
      console.error('Failed to handle article deleted webhook:', error);
    }
  }

  private async trackWebhookReceived(type: string, articleId: string): Promise<void> {
    try {
      const webhookHistory = await AsyncStorage.getItem('webhook_history');
      const history = webhookHistory ? JSON.parse(webhookHistory) : [];
      
      history.push({
        type,
        articleId,
        receivedAt: new Date().toISOString(),
      });

      // Keep only last 100 webhook events
      const recentHistory = history.slice(-100);
      
      await AsyncStorage.setItem('webhook_history', JSON.stringify(recentHistory));
    } catch (error) {
      console.error('Failed to track webhook:', error);
    }
  }

  async setRealtimeEnabled(enabled: boolean): Promise<void> {
    try {
      await AsyncStorage.setItem('realtime_notifications', enabled.toString());
      
      if (enabled) {
        await this.connect();
      } else {
        this.disconnect();
      }
      
      console.log(`📡 Real-time notifications ${enabled ? 'enabled' : 'disabled'}`);
    } catch (error) {
      console.error('Failed to update real-time notification settings:', error);
    }
  }

  async getRealtimeEnabled(): Promise<boolean> {
    try {
      const enabled = await AsyncStorage.getItem('realtime_notifications');
      return enabled !== 'false'; // Default to true
    } catch {
      return true;
    }
  }

  disconnect(): void {
    if (this.websocket) {
      this.websocket.close();
      this.websocket = null;
    }
    this.reconnectAttempts = 0;
    console.log('📡 Webhook service disconnected');
  }

  getConnectionStatus(): 'connected' | 'connecting' | 'disconnected' {
    if (this.websocket?.readyState === WebSocket.OPEN) {
      return 'connected';
    } else if (this.isConnecting) {
      return 'connecting';
    } else {
      return 'disconnected';
    }
  }

  async getWebhookHistory(): Promise<any[]> {
    try {
      const webhookHistory = await AsyncStorage.getItem('webhook_history');
      return webhookHistory ? JSON.parse(webhookHistory) : [];
    } catch {
      return [];
    }
  }

  cleanup(): void {
    this.disconnect();
  }
}

export const webhookService = new WebhookService();
export default webhookService;
