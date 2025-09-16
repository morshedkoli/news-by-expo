import { configureStore } from '@reduxjs/toolkit';
import { setupListeners } from '@reduxjs/toolkit/query';
import { newsApi } from '../services/api';
import preferencesReducer from './slices/preferencesSlice';
import offlineReducer from './slices/offlineSlice';

export const store = configureStore({
  reducer: {
    [newsApi.reducerPath]: newsApi.reducer,
    preferences: preferencesReducer,
    offline: offlineReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE'],
      },
    }).concat(newsApi.middleware),
});

// Enable listener behavior for the store
setupListeners(store.dispatch);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;