import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { OfflineArticle } from '../../types';

interface OfflineState {
  isOffline: boolean;
  articles: OfflineArticle[];
  syncInProgress: boolean;
  lastSyncTime: string | null;
  cacheSize: number; // in MB
}

const initialState: OfflineState = {
  isOffline: false,
  articles: [],
  syncInProgress: false,
  lastSyncTime: null,
  cacheSize: 0,
};

export const offlineSlice = createSlice({
  name: 'offline',
  initialState,
  reducers: {
    setOfflineStatus: (state, action: PayloadAction<boolean>) => {
      state.isOffline = action.payload;
    },
    addOfflineArticle: (state, action: PayloadAction<OfflineArticle>) => {
      const existingIndex = state.articles.findIndex(
        item => item.id === action.payload.id
      );
      if (existingIndex >= 0) {
        state.articles[existingIndex] = action.payload;
      } else {
        state.articles.push(action.payload);
      }
    },
    removeOfflineArticle: (state, action: PayloadAction<string>) => {
      state.articles = state.articles.filter(
        item => item.id !== action.payload
      );
    },
    updateLastAccessed: (state, action: PayloadAction<string>) => {
      const article = state.articles.find(item => item.id === action.payload);
      if (article) {
        article.lastAccessedAt = new Date().toISOString();
      }
    },
    setSyncInProgress: (state, action: PayloadAction<boolean>) => {
      state.syncInProgress = action.payload;
    },
    setLastSyncTime: (state, action: PayloadAction<string>) => {
      state.lastSyncTime = action.payload;
    },
    setCacheSize: (state, action: PayloadAction<number>) => {
      state.cacheSize = action.payload;
    },
    clearOldArticles: (state, action: PayloadAction<number>) => {
      // Remove articles older than specified hours
      const cutoffTime = new Date();
      cutoffTime.setHours(cutoffTime.getHours() - action.payload);
      
      state.articles = state.articles.filter(
        item => new Date(item.downloadedAt) > cutoffTime
      );
    },
  },
});

export const {
  setOfflineStatus,
  addOfflineArticle,
  removeOfflineArticle,
  updateLastAccessed,
  setSyncInProgress,
  setLastSyncTime,
  setCacheSize,
  clearOldArticles,
} = offlineSlice.actions;

export default offlineSlice.reducer;