// Core types for the News Mobile App

export interface Article {
  id: string;
  title: string;
  content: string; // HTML content
  excerpt: string;
  imageUrl: string; // Changed from featuredImage to match API response
  categoryId: string;
  category: Category;
  createdAt: string;
  updatedAt: string;
  publishedAt: string;
  isPublished: boolean;
  views: number;
  likes: number;
  shares: number;
  readTime: number; // in minutes
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  createdAt: string;
}

export interface NewsResponse {
  news: Article[];
  total: number;
  page: number;
  hasMore: boolean;
}

export interface ApiError {
  message: string;
  status?: number;
}

export interface NewsNotification {
  type: 'new_article' | 'breaking_news' | 'category_update';
  articleId?: string;
  title: string;
  body: string;
  category?: string;
  image?: string;
  priority?: 'normal' | 'high';
}

export interface UserPreferences {
  theme: 'light' | 'dark' | 'auto';
  fontSize: 'small' | 'medium' | 'large';
  notificationsEnabled: boolean;
  offlineDownloadEnabled: boolean;
  selectedCategories: string[];
}

export interface OfflineArticle {
  id: string;
  article: Article;
  downloadedAt: string;
  lastAccessedAt: string;
}

// Navigation types
export type RootStackParamList = {
  Home: undefined;
  ArticleReader: { articleId: string };
  ArticleDetail: { id: string };
  Category: { categoryId: string };
  Settings: undefined;
  NotificationDebug: undefined;
};

// API Query parameters
export interface NewsQueryParams {
  page?: number;
  limit?: number;
  category?: string;
  search?: string;
  published?: boolean;
}