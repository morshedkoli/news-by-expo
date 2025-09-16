# News Mobile App

A React Native Expo app that connects to your admin dashboard backend to display news articles.

## 📱 Features

- **News Feed**: Browse latest articles with infinite scroll
- **Categories**: Filter articles by category
- **Article Reader**: Rich text reading experience with HTML support
- **Search**: Find articles (placeholder implementation)
- **Settings**: Theme, font size, and notification preferences
- **Offline Support**: Ready for offline reading implementation
- **Share**: Share articles via system share sheet

## 🚀 Getting Started

### Prerequisites

- Node.js (v18 or later)
- npm or yarn
- Expo CLI (`npm install -g @expo/cli`)
- Android Studio (for Android development)

### Installation

1. **Clone and navigate to the project:**
   ```bash
   cd NewsApp
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure your backend URL:**
   - Open `src/constants/index.ts`
   - Update `API_CONFIG.BASE_URL` with your admin dashboard URL

4. **Start the development server:**
   ```bash
   npx expo start
   ```

5. **Run on device:**
   - Press `a` for Android emulator
   - Scan QR code with Expo Go app on physical device

## 🔧 Configuration

### Backend Integration

Update the API base URL in `src/constants/index.ts`:

```typescript
export const API_CONFIG = {
  BASE_URL: 'https://your-admin-dashboard.vercel.app/api',
  // ... other config
};
```

### App Settings

Modify app configuration in `app.json`:

```json
{
  "expo": {
    "name": "Your News App",
    "android": {
      "package": "com.yourcompany.newsapp"
    }
  }
}
```

## 📱 Building for Production

### Android APK (for testing)

```bash
npx expo build:android --type apk
```

### Android AAB (for Play Store)

```bash
npx expo build:android --type app-bundle
```

## 🏗️ Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── ArticleCard.tsx
│   ├── CategoryTabs.tsx
│   ├── LoadingSpinner.tsx
│   └── ...
├── screens/            # App screens
│   ├── HomeScreen.tsx
│   ├── ArticleReaderScreen.tsx
│   └── ...
├── navigation/         # Navigation configuration
├── services/           # API services
├── store/             # Redux store and slices
├── types/             # TypeScript definitions
├── utils/             # Helper functions
├── hooks/             # Custom React hooks
└── constants/         # App constants
```

## 🔌 API Integration

The app expects these API endpoints from your admin dashboard:

- `GET /api/news` - Fetch articles with pagination
- `GET /api/news/:id` - Fetch single article
- `GET /api/categories` - Fetch categories
- `POST /api/fcm-token` - Register FCM token (for notifications)

### Example API Response

```json
{
  "news": [
    {
      "id": "1",
      "title": "Article Title",
      "content": "<p>HTML content...</p>",
      "excerpt": "Article excerpt...",
      "featuredImage": "https://...",
      "category": {
        "id": "1",
        "name": "Technology",
        "slug": "tech"
      },
      "publishedAt": "2024-01-01T00:00:00Z",
      "readTime": 5
    }
  ],
  "total": 100,
  "page": 1,
  "hasMore": true
}
```

## 🎨 Customization

### Colors and Themes

Update colors in `src/constants/index.ts`:

```typescript
export const COLORS = {
  primary: '#1976D2',      // Your brand primary color
  secondary: '#DC004E',    // Your brand secondary color
  // ... other colors
};
```

### Fonts and Typography

Modify font sizes in `src/constants/index.ts`:

```typescript
export const FONT_SIZES = {
  small: { body: 14, headline: 18, title: 20 },
  medium: { body: 16, headline: 20, title: 22 },
  large: { body: 18, headline: 22, title: 24 },
};
```

## 🚧 TODO

- [ ] Implement search functionality
- [ ] Add push notifications with Firebase
- [ ] Implement offline reading with SQLite
- [ ] Add user authentication
- [ ] Implement article bookmarking
- [ ] Add analytics tracking
- [ ] Implement sharing analytics
- [ ] Add pull-to-refresh animations
- [ ] Implement category-specific screens

## 📚 Tech Stack

- **React Native** - Mobile app framework
- **Expo** - Development platform
- **TypeScript** - Type safety
- **Redux Toolkit** - State management
- **RTK Query** - API data fetching
- **React Navigation** - Navigation
- **React Native Paper** - UI components (Material Design)
- **React Native Render HTML** - HTML content rendering

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 📞 Support

For support, please contact [your-email@example.com] or create an issue in the repository.