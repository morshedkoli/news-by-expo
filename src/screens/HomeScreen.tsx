import React, { useState, useCallback, useEffect, useRef } from 'react';
import { View, FlatList, RefreshControl, StyleSheet, StatusBar, Text, Platform, TouchableOpacity, Animated, Dimensions } from 'react-native';
import { Appbar, FAB, Surface, IconButton, Searchbar, TextInput } from 'react-native-paper';
import { useFocusEffect } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useGetNewsQuery, useGetCategoriesQuery } from '../services/api';
import { RootStackParamList, Article } from '../types';
import { COLORS, SPACING, APP_CONFIG } from '../constants';
import { imageService } from '../services/imageService';

// Components
import ArticleCard from '../components/ArticleCard';
import CategoryTabs from '../components/CategoryTabs';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorState from '../components/ErrorState';
import EmptyState from '../components/EmptyState';

type HomeScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Home'>;

interface HomeScreenProps {
  navigation: HomeScreenNavigationProp;
}

const HomeScreen: React.FC<HomeScreenProps> = ({ navigation }) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [page, setPage] = useState(1);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isSearchMode, setIsSearchMode] = useState(false);
  
  // Animation refs
  const searchAnimation = useRef(new Animated.Value(0)).current;
  const searchInputRef = useRef<any>(null);
  const screenWidth = Dimensions.get('window').width;

  // API Queries
  const {
    data: newsData,
    error: newsError,
    isLoading: newsLoading,
    refetch: refetchNews,
    isFetching: newsFetching,
  } = useGetNewsQuery({
    page,
    limit: APP_CONFIG.PAGINATION.DEFAULT_LIMIT,
    category: selectedCategory === 'all' ? undefined : selectedCategory,
    search: searchQuery.trim() || undefined,
  });
  
  // Prefetch images when news data is loaded
  useEffect(() => {
    if (newsData?.news && newsData.news.length > 0) {
      // Extract image URLs from articles
      const imageUrls = newsData.news
        .filter((article: Article) => article.imageUrl && article.imageUrl.trim() !== '')
        .map((article: Article) => article.imageUrl);
      
      // Prefetch images
      if (imageUrls.length > 0) {
        imageService.prefetchImages(imageUrls);
      }
    }
  }, [newsData?.news]);

  const {
    data: categories = [],
    error: categoriesError,
    isLoading: categoriesLoading,
  } = useGetCategoriesQuery();

  // Navigation handlers
  const handleArticlePress = useCallback((article: Article) => {
    navigation.navigate('ArticleReader', { articleId: article.id });
  }, [navigation]);

  const handleSettingsPress = useCallback(() => {
    navigation.navigate('Settings');
  }, [navigation]);

  // Search handlers with animation
  const handleSearchPress = useCallback(() => {
    console.log('Search button pressed, entering search mode');
    setIsSearchMode(true);
    
    // Animate search box expansion
    Animated.timing(searchAnimation, {
      toValue: 1,
      duration: 300,
      useNativeDriver: false,
    }).start();
  }, [searchAnimation]);

  const handleSearchCancel = useCallback(() => {
    console.log('Search cancelled, exiting search mode');
    
    // Animate search box collapse
    Animated.timing(searchAnimation, {
      toValue: 0,
      duration: 300,
      useNativeDriver: false,
    }).start(() => {
      setIsSearchMode(false);
      setSearchQuery('');
      setPage(1);
    });
  }, [searchAnimation]);

  const handleSearchSubmit = useCallback(() => {
    console.log('Search submitted with query:', searchQuery);
    const trimmedQuery = searchQuery.trim();
    if (trimmedQuery) {
      console.log('Executing search for:', trimmedQuery);
      setPage(1);
      setSelectedCategory('all'); // Reset category when searching
    } else {
      console.log('Empty search query, keeping focus');
    }
  }, [searchQuery]);

  // Category selection handler with improved filtering
  const handleCategorySelect = useCallback((categoryId: string) => {
    if (categoryId !== selectedCategory) {
      console.log(`Switching category from ${selectedCategory} to ${categoryId}`);
      setSelectedCategory(categoryId);
      setPage(1); // Reset pagination when switching categories
    }
  }, [selectedCategory]);

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

  // Focus effect to refresh data when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      // Optionally refetch data when screen comes into focus
      // refetchNews();
    }, [])
  );

  // Render item for FlatList
  const renderArticle = useCallback(({ item }: { item: Article }) => (
    <ArticleCard
      article={item}
      onPress={handleArticlePress}
    />
  ), [handleArticlePress]);

  // Render header component
  const renderHeader = () => (
    <CategoryTabs
      categories={categories}
      selectedCategory={selectedCategory}
      onCategorySelect={handleCategorySelect}
      loading={categoriesLoading}
      isFiltering={newsFetching && page === 1}
    />
  );

  // Render footer (loading more indicator)
  const renderFooter = () => {
    if (!newsFetching || page === 1) return null;
    return (
      <View style={styles.footerLoader}>
        <LoadingSpinner message="Loading more articles..." size="small" />
      </View>
    );
  };

  // Custom Header Component with expandable search
  const ModernHeader = () => {
    console.log('ModernHeader rendering, isSearchMode:', isSearchMode);
    
    const searchWidth = searchAnimation.interpolate({
      inputRange: [0, 1],
      outputRange: [0, screenWidth - 140], // Leave space for cancel button
    });

    const titleOpacity = searchAnimation.interpolate({
      inputRange: [0, 1],
      outputRange: [1, 0],
    });

    const searchOpacity = searchAnimation.interpolate({
      inputRange: [0, 1],
      outputRange: [0, 1],
    });
    
    return (
      <Surface style={styles.headerSurface} elevation={0}>
        <LinearGradient
          colors={COLORS.gradients.header}
          style={styles.headerGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <SafeAreaView edges={['top']} style={styles.headerSafeArea}>
            <StatusBar barStyle="light-content" backgroundColor={COLORS.primaryDark} />
            <View style={styles.headerContent}>
              {!isSearchMode ? (
                <>
                  {/* Title Section */}
                  <View style={styles.headerLeft}>
                    <Text style={styles.headerTitle}>News</Text>
                    <Text style={styles.headerSubtitle}>Stay updated with latest news</Text>
                  </View>

                  {/* Header Buttons */}
                  <View style={styles.headerRight}>
                    <TouchableOpacity
                      onPress={handleSearchPress}
                      style={styles.headerButton}
                      activeOpacity={0.7}
                      hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                    >
                      <Ionicons 
                        name="search-outline" 
                        size={24} 
                        color={COLORS.text.inverse} 
                      />
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={handleSettingsPress}
                      style={styles.headerButton}
                      activeOpacity={0.7}
                      hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                    >
                      <Ionicons 
                        name="settings-outline" 
                        size={24} 
                        color={COLORS.text.inverse} 
                      />
                    </TouchableOpacity>
                  </View>
                </>
              ) : (
                <>
                  {/* Logo/Back Button */}
                  <TouchableOpacity
                    onPress={handleSearchCancel}
                    style={styles.backButton}
                    activeOpacity={0.7}
                  >
                    <Ionicons 
                      name="arrow-back" 
                      size={24} 
                      color={COLORS.text.inverse} 
                    />
                  </TouchableOpacity>

                  {/* Centered Search Section */}
                  <Animated.View style={[
                    styles.centeredSearchSection, 
                    { 
                      opacity: searchOpacity,
                    }
                  ]}>
                    <View style={styles.searchInputContainer}>
                      <TextInput
                        ref={searchInputRef}
                        placeholder="Search news..."
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                        onSubmitEditing={handleSearchSubmit}
                        style={styles.expandedSearchInput}
                        mode="outlined"
                        dense
                        outlineColor="transparent"
                        activeOutlineColor={COLORS.primary}
                        textColor={COLORS.text.primary}
                        placeholderTextColor={COLORS.text.secondary}
                        autoFocus={true}
                        multiline={false}
                        numberOfLines={1}
                        blurOnSubmit={false}
                        returnKeyType="search"
                        right={searchQuery.length > 0 ? (
                          <TextInput.Icon 
                            icon="close" 
                            onPress={() => setSearchQuery('')}
                          />
                        ) : undefined}
                      />
                      <TouchableOpacity
                        onPress={handleSearchSubmit}
                        style={[
                          styles.searchButton,
                          !searchQuery.trim() && styles.searchButtonDisabled
                        ]}
                        disabled={!searchQuery.trim()}
                        activeOpacity={0.7}
                      >
                        <Ionicons 
                          name="search" 
                          size={20} 
                          color={searchQuery.trim() ? COLORS.text.inverse : COLORS.text.tertiary} 
                        />
                      </TouchableOpacity>
                    </View>
                  </Animated.View>

                  {/* Settings Button */}
                  <TouchableOpacity
                    onPress={handleSettingsPress}
                    style={styles.headerButton}
                    activeOpacity={0.7}
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                  >
                    <Ionicons 
                      name="settings-outline" 
                      size={24} 
                      color={COLORS.text.inverse} 
                    />
                  </TouchableOpacity>
                </>
              )}
            </View>
          </SafeAreaView>
        </LinearGradient>
      </Surface>
    );
  };

  // Error state
  if (newsError && !newsData) {
    return (
      <View style={styles.container}>
        <ModernHeader />
        <ErrorState
          title="Failed to load news"
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
        <ModernHeader />
        <LoadingSpinner message="Loading latest news..." />
      </View>
    );
  }

  // Empty state
  if (newsData && newsData.news.length === 0) {
    const getEmptyMessage = () => {
      if (searchQuery.trim()) {
        return `No articles found for "${searchQuery}"`;
      }
      if (selectedCategory === 'all') {
        return "There are no articles available at the moment.";
      }
      return "No articles found in this category.";
    };

    return (
      <View style={styles.container}>
        <ModernHeader />
        {!isSearchMode && renderHeader()}
        <EmptyState
          title="No articles found"
          message={getEmptyMessage()}
        />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ModernHeader />
      
      
      <FlatList
        data={newsData?.news || []}
        renderItem={renderArticle}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={!isSearchMode ? renderHeader : null}
        ListFooterComponent={renderFooter}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={[COLORS.primary]}
            tintColor={COLORS.primary}
            progressBackgroundColor={COLORS.background}
          />
        }
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
    backgroundColor: COLORS.backgroundSecondary,
  },
  // Modern Header Styles
  headerSurface: {
    elevation: 0,
    shadowOpacity: 0,
  },
  headerGradient: {
    paddingBottom: SPACING.sm,
  },
  headerSafeArea: {
    backgroundColor: 'transparent',
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    minHeight: 60,
  },
  searchHeaderContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    minHeight: 60,
    gap: SPACING.sm,
  },
  headerSearchbar: {
    backgroundColor: COLORS.surface,
    borderRadius: 25,
    flex: 1,
    marginHorizontal: SPACING.xs,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  headerSearchInput: {
    color: COLORS.text.primary,
    fontSize: 16,
    paddingLeft: SPACING.sm,
  },
  headerLeft: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: COLORS.text.inverse,
    letterSpacing: -0.5,
  },
  headerSubtitle: {
    fontSize: 14,
    color: COLORS.text.inverse + 'CC',
    marginTop: 2,
    fontWeight: '400',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerButton: {
    margin: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    padding: 8,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 40,
    minHeight: 40,
  },
  // Search Header Styles
  searchInputWrapper: {
    flex: 1,
    marginHorizontal: SPACING.xs,
  },
  searchSubmitButton: {
    backgroundColor: COLORS.surface,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: 20,
    minWidth: 50,
    alignItems: 'center',
    justifyContent: 'center',
    ...COLORS.shadows.small,
  },
  searchSubmitButtonDisabled: {
    backgroundColor: COLORS.border.light,
    opacity: 0.5,
  },
  searchSubmitText: {
    color: COLORS.primary,
    fontSize: 14,
    fontWeight: '600',
  },
  searchSubmitTextDisabled: {
    color: COLORS.text.tertiary,
  },
  // Content Styles
  flatList: {
    backgroundColor: 'transparent',
    flex: 1,
  },
  listContent: {
    paddingBottom: SPACING.scale[20],
    paddingTop: SPACING.xs,
  },
  footerLoader: {
    padding: SPACING.lg,
    alignItems: 'center',
  },
  // Search Container Styles
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    backgroundColor: COLORS.background,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border.light,
  },
  searchBar: {
    flex: 1,
    backgroundColor: COLORS.surface,
    borderRadius: 25,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  cancelButton: {
    marginLeft: SPACING.sm,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
  },
  cancelText: {
    color: COLORS.primary,
    fontSize: 16,
    fontWeight: '600',
  },
  // Search Section Styles
  searchSection: {
    height: 40,
    justifyContent: 'center',
  },
  centeredSearchSection: {
    flex: 1,
    height: 40,
    justifyContent: 'center',
    marginHorizontal: SPACING.md,
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
  },
  backButton: {
    margin: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    padding: 8,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 40,
    minHeight: 40,
  },
  expandedSearchInput: {
    backgroundColor: COLORS.surface,
    borderRadius: 20,
    fontSize: 16,
    flex: 1,
  },
  searchButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 20,
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    ...COLORS.shadows.small,
  },
  searchButtonDisabled: {
    backgroundColor: COLORS.border.light,
    opacity: 0.5,
  },
  cancelHeaderButton: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  cancelHeaderText: {
    color: COLORS.text.inverse,
    fontSize: 16,
    fontWeight: '600',
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

export default HomeScreen;