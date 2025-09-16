# Push Notifications Setup Guide

This guide explains how to set up push notifications for the NewsApp when new articles are created by the admin.

## Overview

The NewsApp now supports push notifications through multiple channels:
1. **Polling-based notifications** - Checks for new articles every 5 minutes
2. **Real-time webhook notifications** - Instant notifications via WebSocket connection
3. **Manual push notifications** - Admin can send custom notifications

## Architecture

```
Admin Panel → Creates New Article → Triggers Notification
                                 ↓
                    ┌─────────────────────────────┐
                    │     Notification Flow       │
                    └─────────────────────────────┘
                                 ↓
        ┌────────────────────────────────────────────────┐
        │                                                │
        ▼                                                ▼
   Webhook Service                              Polling Service
   (Real-time)                                  (Every 5 minutes)
        │                                                │
        └────────────────────────────────────────────────┘
                                 ↓
                    ┌─────────────────────────────┐
                    │    Notification Service     │
                    └─────────────────────────────┘
                                 ↓
                    ┌─────────────────────────────┐
                    │      Push Notification      │
                    │    (Expo Push Service)      │
                    └─────────────────────────────┘
                                 ↓
                         User's Device
```

## Components

### 1. NotificationService (`src/services/notificationService.ts`)
- Handles Expo push token registration
- Manages notification permissions
- Processes incoming notifications
- Handles notification taps and navigation

### 2. NewsNotificationService (`src/services/newsNotificationService.ts`)
- Polls for new articles every 5 minutes
- Sends notifications for new articles
- Manages notification settings
- Tracks sent notifications

### 3. WebhookService (`src/services/webhookService.ts`)
- Establishes WebSocket connection for real-time updates
- Handles webhook messages from admin panel
- Provides instant notifications when articles are published

### 4. NotificationSettings Component (`src/components/NotificationSettings.tsx`)
- User interface for notification preferences
- Toggle notifications on/off
- Manual check for new articles
- Test notification functionality

## Admin Panel Integration

### Required API Endpoints

The admin panel should implement these endpoints:

#### 1. Token Registration
```
POST /api/notifications/tokens
Content-Type: application/json

{
  "token": "ExponentPushToken[...]",
  "deviceId": "unique_device_id",
  "platform": "ios|android",
  "isActive": true,
  "deviceInfo": {
    "brand": "Apple",
    "manufacturer": "Apple",
    "modelName": "iPhone 14",
    "osName": "iOS",
    "osVersion": "16.0",
    "platform": "ios",
    "appVersion": "1.0.0"
  },
  "userId": "optional_user_id"
}
```

#### 2. Send Push Notification
```
POST /api/notifications/send
Content-Type: application/json

{
  "title": "📰 Breaking News",
  "body": "New article published: Article Title",
  "data": {
    "type": "news",
    "articleId": "article_id_here",
    "newsId": "article_id_here",
    "category": "Technology"
  },
  "priority": "high"
}
```

#### 3. WebSocket Connection
```
WebSocket: wss://your-domain.com/ws?token=ExponentPushToken[...]

Message Format:
{
  "type": "new_article",
  "data": {
    "id": "article_id",
    "title": "Article Title",
    "excerpt": "Article excerpt...",
    "imageUrl": "https://...",
    "category": {
      "id": "cat_id",
      "name": "Category Name"
    },
    "createdAt": "2023-12-01T10:00:00Z",
    "publishedAt": "2023-12-01T10:00:00Z"
  },
  "timestamp": "2023-12-01T10:00:00Z"
}
```

### Implementation Steps for Admin Panel

#### 1. When Creating a New Article

```javascript
// After successfully creating and publishing an article
const article = await createArticle(articleData);

if (article.isPublished) {
  // Send push notifications to all registered devices
  await sendPushNotifications({
    title: `📰 ${article.title}`,
    body: article.excerpt || 'New article available to read',
    data: {
      type: 'news',
      articleId: article.id,
      newsId: article.id,
      category: article.category?.name
    }
  });

  // Send real-time webhook notification
  await broadcastWebhook({
    type: 'new_article',
    data: {
      id: article.id,
      title: article.title,
      excerpt: article.excerpt,
      imageUrl: article.imageUrl,
      category: article.category,
      createdAt: article.createdAt,
      publishedAt: article.publishedAt
    },
    timestamp: new Date().toISOString()
  });
}
```

#### 2. Push Notification Service Implementation

```javascript
const { Expo } = require('expo-server-sdk');
const expo = new Expo();

async function sendPushNotifications(notificationData) {
  // Get all active device tokens from database
  const tokens = await getActiveDeviceTokens();
  
  const messages = tokens.map(token => ({
    to: token.token,
    sound: 'default',
    title: notificationData.title,
    body: notificationData.body,
    data: notificationData.data,
    priority: 'high',
    channelId: 'news-updates'
  }));

  // Send notifications in chunks
  const chunks = expo.chunkPushNotifications(messages);
  
  for (const chunk of chunks) {
    try {
      const receipts = await expo.sendPushNotificationsAsync(chunk);
      console.log('Push notifications sent:', receipts);
    } catch (error) {
      console.error('Error sending push notifications:', error);
    }
  }
}
```

#### 3. WebSocket Server Implementation

```javascript
const WebSocket = require('ws');

const wss = new WebSocket.Server({
  port: 8080,
  verifyClient: (info) => {
    // Verify the token from query parameters
    const token = new URL(info.req.url, 'http://localhost').searchParams.get('token');
    return isValidToken(token);
  }
});

wss.on('connection', (ws, req) => {
  const token = new URL(req.url, 'http://localhost').searchParams.get('token');
  console.log('WebSocket connected:', token);
  
  ws.on('close', () => {
    console.log('WebSocket disconnected:', token);
  });
});

// Broadcast to all connected clients
function broadcastWebhook(message) {
  wss.clients.forEach(client => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify(message));
    }
  });
}
```

## Mobile App Configuration

### 1. App.json Configuration
```json
{
  "expo": {
    "notification": {
      "icon": "./assets/icon.png",
      "color": "#1976D2",
      "androidMode": "default",
      "androidCollapsedTitle": "News Updates"
    },
    "plugins": [
      [
        "expo-notifications",
        {
          "icon": "./assets/icon.png",
          "color": "#1976D2",
          "defaultChannel": "news-updates"
        }
      ]
    ]
  }
}
```

### 2. Required Permissions

#### Android (app.json)
```json
{
  "android": {
    "permissions": [
      "INTERNET",
      "ACCESS_NETWORK_STATE",
      "RECEIVE_BOOT_COMPLETED",
      "VIBRATE",
      "WAKE_LOCK"
    ]
  }
}
```

#### iOS
Permissions are handled automatically by Expo.

## User Experience

### 1. Notification Settings
Users can control notifications through the Settings screen:
- Enable/disable push notifications
- Test notification functionality
- Check for new articles manually

### 2. Notification Behavior
- **Foreground**: Shows in-app notification
- **Background**: Shows system notification
- **Tap**: Navigates to the specific article
- **Badge**: Updates app icon badge count

### 3. Notification Content
- **Title**: "📰 [Article Title]"
- **Body**: Article excerpt or "New article available to read"
- **Icon**: App icon with news emoji
- **Action**: Tap to read article

## Testing

### 1. Test Notification Flow
1. Open the app and go to Settings
2. Ensure notifications are enabled
3. Use "Check for New Articles" button
4. Create a new article in admin panel
5. Verify notification is received

### 2. Debug Tools
- Use the Notification Debug screen in Settings
- Check console logs for notification events
- Verify token registration in admin panel

### 3. Testing Checklist
- [ ] App requests notification permissions
- [ ] Device token is registered with backend
- [ ] New article triggers notification
- [ ] Notification tap navigates to article
- [ ] Settings allow enabling/disabling notifications
- [ ] WebSocket connection works for real-time updates
- [ ] Polling works when WebSocket is unavailable

## Troubleshooting

### Common Issues

#### 1. Notifications Not Received
- Check if permissions are granted
- Verify device token is registered
- Ensure app is not in Do Not Disturb mode
- Check if notifications are enabled in app settings

#### 2. WebSocket Connection Fails
- Fallback to polling-based notifications
- Check network connectivity
- Verify WebSocket server is running
- Check token authentication

#### 3. Navigation Not Working
- Ensure NavigationService is properly initialized
- Check if ArticleDetail route exists
- Verify article ID is passed correctly

### Debug Commands

```bash
# Check notification permissions
adb shell dumpsys notification

# View app logs
npx expo logs --platform android
npx expo logs --platform ios

# Test push notification
curl -X POST "https://exp.host/--/api/v2/push/send" \
  -H "Content-Type: application/json" \
  -d '{
    "to": "ExponentPushToken[...]",
    "title": "Test Notification",
    "body": "This is a test notification"
  }'
```

## Security Considerations

1. **Token Validation**: Always validate device tokens before sending notifications
2. **Rate Limiting**: Implement rate limiting to prevent notification spam
3. **User Consent**: Respect user preferences and allow opt-out
4. **Data Privacy**: Don't include sensitive information in notification payload
5. **Authentication**: Secure WebSocket connections with proper authentication

## Performance Optimization

1. **Batch Notifications**: Send notifications in batches to avoid API limits
2. **Token Cleanup**: Remove inactive tokens periodically
3. **Efficient Polling**: Use smart polling intervals based on user activity
4. **WebSocket Reconnection**: Implement exponential backoff for reconnections
5. **Local Storage**: Cache notification settings locally

## Monitoring and Analytics

Track these metrics:
- Notification delivery rate
- User engagement with notifications
- WebSocket connection stability
- Token registration success rate
- Article view rate from notifications

This completes the push notification setup for the NewsApp. The system provides both real-time and polling-based notifications to ensure users are always informed about new articles.
