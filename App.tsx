import React, { useEffect } from 'react';
import { Provider, useDispatch } from 'react-redux';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { store } from './src/store';
import { migrateInvalidFontSize } from './src/store/slices/preferencesSlice';
import AppNavigator from './src/navigation/AppNavigator';
import NotificationHandler from './src/components/NotificationHandler';

// Migration component to fix any invalid state
const AppInitializer: React.FC = () => {
  const dispatch = useDispatch();

  useEffect(() => {
    // Fix any invalid fontSize values from previous versions
    dispatch(migrateInvalidFontSize());
  }, [dispatch]);

  return (
    <NotificationHandler>
      <AppNavigator />
    </NotificationHandler>
  );
};

export default function App() {
  return (
    <Provider store={store}>
      <SafeAreaProvider>
        <AppInitializer />
      </SafeAreaProvider>
    </Provider>
  );
}
