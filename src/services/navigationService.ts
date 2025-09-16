import { NavigationContainerRef } from '@react-navigation/native';
import { RootStackParamList } from '../types';

class NavigationService {
  private navigationRef: NavigationContainerRef<RootStackParamList> | null = null;

  setNavigationRef(ref: NavigationContainerRef<RootStackParamList> | null) {
    this.navigationRef = ref;
  }

  navigate(name: keyof RootStackParamList, params?: any) {
    if (this.navigationRef?.isReady()) {
      this.navigationRef.navigate(name as any, params);
    } else {
      console.warn('Navigation ref not ready or not set');
    }
  }

  navigateToArticle(articleId: string) {
    this.navigate('ArticleDetail', { id: articleId });
  }

  navigateToHome() {
    this.navigate('Home');
  }

  goBack() {
    if (this.navigationRef?.canGoBack()) {
      this.navigationRef.goBack();
    }
  }

  reset(routeName: keyof RootStackParamList, params?: any) {
    if (this.navigationRef?.isReady()) {
      this.navigationRef.reset({
        index: 0,
        routes: [{ name: routeName as any, params }],
      });
    }
  }

  getCurrentRoute() {
    if (this.navigationRef?.isReady()) {
      return this.navigationRef.getCurrentRoute();
    }
    return null;
  }

  isReady() {
    return this.navigationRef?.isReady() ?? false;
  }
}

export const navigationService = new NavigationService();
export default navigationService;
