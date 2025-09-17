import React, { useCallback } from 'react';
import { ScrollView, View, StyleSheet, Share, Dimensions, Image } from 'react-native';
import { Text, Appbar, Chip, Divider, FAB } from 'react-native-paper';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import RenderHtml, { CustomRendererProps } from 'react-native-render-html';

import { useGetArticleQuery } from '../services/api';
import { RootStackParamList } from '../types';
import { COLORS, SPACING, FONT_SIZES } from '../constants';
import { formatDate, generateShareMessage, sanitizeHTML } from '../utils';
import { useAppSelector } from '../hooks/redux';

// Components
import OptimizedImage from '../components/OptimizedImage';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorState from '../components/ErrorState';
import Logo from '../components/Logo';

type ArticleReaderNavigationProp = StackNavigationProp<RootStackParamList, 'ArticleReader'>;
type ArticleReaderRouteProp = RouteProp<RootStackParamList, 'ArticleReader'>;

interface ArticleReaderScreenProps {
  navigation: ArticleReaderNavigationProp;
  route: ArticleReaderRouteProp;
}

const { width: screenWidth } = Dimensions.get('window');

const ArticleReaderScreen: React.FC<ArticleReaderScreenProps> = ({ navigation, route }) => {
  const { articleId } = route.params;
  const fontSize = useAppSelector(state => state.preferences.fontSize);
  
  const {
    data: article,
    error,
    isLoading,
    refetch,
  } = useGetArticleQuery(articleId);

  // Share article
  const handleShare = useCallback(async () => {
    if (!article) return;

    try {
      const shareMessage = generateShareMessage(article);
      await Share.share({
        message: shareMessage,
        title: article.title,
      });
    } catch (error) {
      console.error('Error sharing article:', error);
    }
  }, [article]);

  // Navigate back
  const handleGoBack = useCallback(() => {
    navigation.goBack();
  }, [navigation]);

  // Get font sizes based on user preference with fallback
  const validFontSize = (fontSize === 'small' || fontSize === 'medium' || fontSize === 'large') ? fontSize : 'medium';
  const fontSizes = FONT_SIZES[validFontSize];

  // HTML rendering configuration
  const htmlConfig = {
    contentWidth: screenWidth - (SPACING.md * 2),
    baseStyle: {
      fontSize: fontSizes.body,
      lineHeight: fontSizes.body * 1.5,
      color: COLORS.onBackground,
    },
    tagsStyles: {
      p: {
        marginBottom: SPACING.md,
        lineHeight: fontSizes.body * 1.6,
      },
      h1: {
        fontSize: fontSizes.title,
        fontWeight: '700' as const,
        marginBottom: SPACING.md,
        color: COLORS.onBackground,
      },
      h2: {
        fontSize: fontSizes.headline,
        fontWeight: '700' as const,
        marginBottom: SPACING.sm,
        color: COLORS.onBackground,
      },
      h3: {
        fontSize: fontSizes.headline - 2,
        fontWeight: '600' as const,
        marginBottom: SPACING.sm,
        color: COLORS.onBackground,
      },
      a: {
        color: COLORS.primary,
      },
      img: {
        marginVertical: SPACING.md,
      },
      blockquote: {
        borderLeftWidth: 4,
        borderLeftColor: COLORS.primary,
        paddingLeft: SPACING.md,
        marginLeft: SPACING.sm,
        fontStyle: 'italic' as const,
        backgroundColor: COLORS.surface,
        padding: SPACING.md,
        marginBottom: SPACING.md,
      },
      ul: {
        marginBottom: SPACING.md,
      },
      ol: {
        marginBottom: SPACING.md,
      },
      li: {
        marginBottom: SPACING.xs,
      },
    },
  };

  // Loading state
  if (isLoading) {
    return (
      <View style={styles.container}>
        <Appbar.Header style={styles.header}>
          <Appbar.BackAction onPress={handleGoBack} />
          <Appbar.Content title="Loading..." />
        </Appbar.Header>
        <LoadingSpinner message="Loading article..." />
      </View>
    );
  }

  // Error state
  if (error || !article) {
    return (
      <View style={styles.container}>
        <Appbar.Header style={styles.header}>
          <Appbar.BackAction onPress={handleGoBack} />
          <Appbar.Content title="Error" />
        </Appbar.Header>
        <ErrorState
          title="Failed to load article"
          message="We couldn't load this article. Please try again."
          onRetry={refetch}
        />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Appbar.Header style={styles.header}>
        <Appbar.BackAction onPress={handleGoBack} />
        <Appbar.Content title="Article" />
        <Appbar.Action icon="share-variant" onPress={handleShare} />
      </Appbar.Header>

      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Featured Image */}
        {article.imageUrl && article.imageUrl.trim() !== '' && (
          <Image
            source={{ uri: article.imageUrl }}
            style={styles.featuredImage}
            resizeMode="cover"
            onError={(error: any) => console.log('Article image load error:', error.nativeEvent?.error)}
            onLoad={() => console.log('Article image loaded successfully:', article.imageUrl)}
          />
        )}

        <View style={styles.contentContainer}>
          {/* Article Title */}
          <Text 
            variant="headlineLarge" 
            style={[styles.title, { fontSize: fontSizes.title }]}
          >
            {article.title}
          </Text>

          {/* Article Metadata */}
          <View style={styles.metadataContainer}>
            <View style={styles.metadataRow}>
              <Chip 
                mode="outlined" 
                compact 
                style={styles.categoryChip}
              >
                {article.category.name}
              </Chip>
              <View style={styles.dateContainer}>
                <Ionicons 
                  name="time-outline" 
                  size={16} 
                  color={COLORS.onBackground + '80'}
                />
                <Text variant="bodySmall" style={styles.metadataText}>
                  {formatDate(article.publishedAt)}
                </Text>
              </View>
            </View>
            
            <View style={styles.readingTimeContainer}>
              <Ionicons 
                name="book-outline" 
                size={16} 
                color={COLORS.onBackground + '80'}
              />
              <Text variant="bodySmall" style={styles.metadataText}>
                {article.readTime} min read
              </Text>
            </View>
          </View>

          <Divider style={styles.divider} />

          {/* Article Content */}
          <View style={styles.contentWrapper}>
            <RenderHtml
              contentWidth={htmlConfig.contentWidth}
              source={{ html: sanitizeHTML(article.content) }}
              baseStyle={htmlConfig.baseStyle}
              tagsStyles={htmlConfig.tagsStyles}
              renderers={{
                img: (props: CustomRendererProps<any>) => {
                  // Extract attributes from the img tag
                  const { src, width, height } = props.tnode.attributes;
                  
                  if (!src) return null;
                  
                  // Calculate image dimensions while maintaining aspect ratio
                  const imageWidth = width ? parseInt(width, 10) : htmlConfig.contentWidth;
                  const imageHeight = height ? parseInt(height, 10) : 200;
                  const finalWidth = Math.min(imageWidth, htmlConfig.contentWidth);
                  
                  return (
                    <OptimizedImage
                      source={{ uri: src }}
                      style={{
                        width: finalWidth,
                        height: imageHeight,
                        alignSelf: 'center',
                        marginVertical: SPACING.md,
                      }}
                      resizeMode="contain"
                      width={finalWidth}
                      height={imageHeight}
                      cacheEnabled={true}
                      quality={85}
                    />
                  );
                },
              }}
            />
          </View>

          {/* Bottom spacing for FAB */}
          <View style={styles.bottomSpacing} />
        </View>
      </ScrollView>

      {/* Share FAB */}
      <FAB
        icon={({ size, color }) => (
          <Ionicons name="share-social" size={size} color={color} />
        )}
        style={styles.fab}
        onPress={handleShare}
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
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  featuredImage: {
    width: '100%',
    height: 250,
  },
  contentContainer: {
    padding: SPACING.md,
  },
  title: {
    fontWeight: 'bold',
    marginBottom: SPACING.md,
    lineHeight: 32,
  },
  metadataContainer: {
    marginBottom: SPACING.lg,
  },
  metadataRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  categoryChip: {
    height: 28,
  },
  dateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  readingTimeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  metadataText: {
    marginLeft: 4,
    color: COLORS.onBackground + '80',
  },
  divider: {
    marginBottom: SPACING.lg,
  },
  contentWrapper: {
    marginBottom: SPACING.lg,
  },
  bottomSpacing: {
    height: 80, // Space for FAB
  },
  fab: {
    position: 'absolute',
    margin: SPACING.md,
    right: 0,
    bottom: 0,
    backgroundColor: COLORS.secondary,
  },
});

export default ArticleReaderScreen;