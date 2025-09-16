import React, { useState, useCallback } from 'react';
import { View, FlatList, RefreshControl, StyleSheet } from 'react-native';
import { Text, Appbar, FAB } from 'react-native-paper';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native';
import { RootStackParamList, Article } from '../types';
import { COLORS, SPACING, APP_CONFIG } from '../constants';

// API and Components
import { useGetNewsQuery } from '../services/api';
import ArticleCard from '../components/ArticleCard';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorState from '../components/ErrorState';
import EmptyState from '../components/EmptyState';

type CategoryNavigationProp = StackNavigationProp<RootStackParamList, 'Category'>;
type CategoryRouteProp = RouteProp<RootStackParamList, 'Category'>;

interface CategoryScreenProps {
  navigation: CategoryNavigationProp;
  route: CategoryRouteProp;
}

const CategoryScreen: React.FC<CategoryScreenProps> = ({ navigation, route }) => {
  const { categoryId, categoryName } = route.params;
  const [page, setPage] = useState(1);
  const [refreshing, setRefreshing] = useState(false);

  // Fetch category-specific articles
  const {
    data: newsData,
    error: newsError,
    isLoading: newsLoading,
    refetch: refetchNews,
    isFetching: newsFetching,
  } = useGetNewsQuery({
    page,
    limit: APP_CONFIG.PAGINATION.DEFAULT_LIMIT,
    category: categoryId,
  });

  const handleGoBack = () => {
    navigation.goBack();
  };

  // Navigation handlers
  const handleArticlePress = useCallback((article: Article) => {
    navigation.navigate('ArticleReader', { articleId: article.id });
  }, [navigation]);

  // Pull to refresh handler
  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    setPage(1);
    try {
      await refetchNews();
    } finally {
      setRefreshing(false);
    }
  }, [refetchNews]);

  // Load more articles (pagination)
  const handleLoadMore = useCallback(() => {
    if (newsData?.hasMore && !newsFetching) {
      setPage(prevPage => prevPage + 1);
    }
  }, [newsData?.hasMore, newsFetching]);

  // Render item for FlatList
  const renderArticle = useCallback(({ item }: { item: Article }) => (
    <ArticleCard
      article={item}
      onPress={handleArticlePress}
    />
  ), [handleArticlePress]);

  // Render footer (loading more indicator)
  const renderFooter = () => {
    if (!newsFetching || page === 1) return null;
    return (
      <View style={styles.footerLoader}>
        <LoadingSpinner message="Loading more articles..." size="small" />
      </View>
    );
  };

  // Error state
  if (newsError && !newsData) {
    return (
      <View style={styles.container}>
        <Appbar.Header style={styles.header}>
          <Appbar.BackAction onPress={handleGoBack} />
          <Appbar.Content title={categoryName} />
        </Appbar.Header>
        <ErrorState
          title="Failed to load articles"
          message="Please check your internet connection and try again."
          onRetry={() => refetchNews()}
        />
      </View>
    );
  }

  // Loading state (first load)
  if (newsLoading && !newsData) {
    return (
      <View style={styles.container}>
        <Appbar.Header style={styles.header}>
          <Appbar.BackAction onPress={handleGoBack} />
          <Appbar.Content title={categoryName} />
        </Appbar.Header>
        <LoadingSpinner message={`Loading ${categoryName} articles...`} />
      </View>
    );
  }

  // Empty state
  if (newsData && newsData.news.length === 0) {
    return (
      <View style={styles.container}>
        <Appbar.Header style={styles.header}>
          <Appbar.BackAction onPress={handleGoBack} />
          <Appbar.Content title={categoryName} />
        </Appbar.Header>
        <EmptyState
          title="No articles found"
          message={`No articles found in the ${categoryName} category.`}
        />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Appbar.Header style={styles.header}>
        <Appbar.BackAction onPress={handleGoBack} />
        <Appbar.Content title={categoryName} />
      </Appbar.Header>
      
      <FlatList
        data={newsData?.news || []}
        renderItem={renderArticle}
        keyExtractor={(item) => item.id}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={[COLORS.primary]}
            tintColor={COLORS.primary}
            progressBackgroundColor={COLORS.background}
          />
        }
        ListFooterComponent={renderFooter}
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.5}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
        style={styles.flatList}
        removeClippedSubviews={true}
        maxToRenderPerBatch={10}
        updateCellsBatchingPeriod={100}
        initialNumToRender={10}
        windowSize={10}
      />

      <FAB
        icon="refresh"
        style={styles.fab}
        onPress={handleRefresh}
        loading={refreshing || newsFetching}
        disabled={refreshing || newsFetching}
        mode="elevated"
        size="medium"
        customSize={56}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    backgroundColor: COLORS.primary,
  },
  // FlatList Styles
  flatList: {
    backgroundColor: 'transparent',
  },
  listContent: {
    paddingBottom: SPACING.scale[20],
    paddingTop: SPACING.xs,
  },
  footerLoader: {
    padding: SPACING.lg,
    alignItems: 'center',
  },
  // FAB Styles
  fab: {
    position: 'absolute',
    right: SPACING.md,
    bottom: SPACING.scale[20],
    backgroundColor: COLORS.primary,
    borderRadius: 28,
    ...COLORS.shadows.medium,
  },
});

export default CategoryScreen;