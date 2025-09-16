import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { UserPreferences } from '../../types';

const initialState: UserPreferences = {
  theme: 'auto',
  fontSize: 'medium',
  notificationsEnabled: true,
  offlineDownloadEnabled: true,
  selectedCategories: [],
};

// Helper function to validate fontSize
const validateFontSize = (fontSize: any): 'small' | 'medium' | 'large' => {
  const validSizes = ['small', 'medium', 'large'];
  return validSizes.includes(fontSize) ? fontSize : 'medium';
};

export const preferencesSlice = createSlice({
  name: 'preferences',
  initialState,
  reducers: {
    setTheme: (state, action: PayloadAction<'light' | 'dark' | 'auto'>) => {
      state.theme = action.payload;
    },
    setFontSize: (state, action: PayloadAction<'small' | 'medium' | 'large'>) => {
      state.fontSize = validateFontSize(action.payload);
    },
    toggleNotifications: (state) => {
      state.notificationsEnabled = !state.notificationsEnabled;
    },
    toggleOfflineDownload: (state) => {
      state.offlineDownloadEnabled = !state.offlineDownloadEnabled;
    },
    setSelectedCategories: (state, action: PayloadAction<string[]>) => {
      state.selectedCategories = action.payload;
    },
    addSelectedCategory: (state, action: PayloadAction<string>) => {
      if (!state.selectedCategories.includes(action.payload)) {
        state.selectedCategories.push(action.payload);
      }
    },
    removeSelectedCategory: (state, action: PayloadAction<string>) => {
      state.selectedCategories = state.selectedCategories.filter(
        id => id !== action.payload
      );
    },
    // Migration reducer to fix any invalid fontSize values
    migrateInvalidFontSize: (state) => {
      state.fontSize = validateFontSize(state.fontSize);
    },
  },
});

export const {
  setTheme,
  setFontSize,
  toggleNotifications,
  toggleOfflineDownload,
  setSelectedCategories,
  addSelectedCategory,
  removeSelectedCategory,
  migrateInvalidFontSize,
} = preferencesSlice.actions;

export default preferencesSlice.reducer;