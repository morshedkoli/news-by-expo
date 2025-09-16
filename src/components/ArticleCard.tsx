import React from 'react';
import { View, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { Card, Text, Chip, Surface } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Article } from '../types';
import { formatDate } from '../utils';
import { SPACING, COLORS } from '../constants';
import OptimizedImage from './OptimizedImage';

interface ArticleCardProps {
  article: Article;
  onPress: (article: Article) => void;
  isOffline?: boolean;
}

const ArticleCard: React.FC<ArticleCardProps> = ({ article, onPress, isOffline = false }) => {
  const handlePress = () => {
    onPress(article);
  };

  return (
    <Surface style={styles.container} elevation={0}>
      <TouchableOpacity onPress={handlePress} style={styles.touchable} activeOpacity={0.95}>
        <Card style={styles.card} mode="elevated">
          {/* Image Section */}
          {article.imageUrl && article.imageUrl.trim() !== '' ? (
            <View style={styles.imageContainer}>
              <Image
                source={{ uri: article.imageUrl }}
                style={styles.image}
                resizeMode="cover"
                onError={(error: any) => console.log('Image load error:', error.nativeEvent?.error)}
                onLoad={() => console.log('Image loaded successfully:', article.imageUrl)}
              />
              {/* Gradient Overlay */}
              <LinearGradient
                colors={['transparent', 'rgba(0,0,0,0.1)']}
                style={styles.imageOverlay}
              />
              {/* Category Chip on Image */}
              <View style={styles.categoryOverlay}>
                <Chip 
                  mode="flat" 
                  compact 
                  style={styles.categoryChipOverlay}
                  textStyle={styles.categoryTextOverlay}
                >
                  {article.category.name}
                </Chip>
              </View>
            </View>
          ) : (
            /* Fallback when no image */
            <View style={styles.noImageContainer}>
              <LinearGradient
                colors={[COLORS.primary + '20', COLORS.primary + '10']}
                style={styles.noImageGradient}
              >
                <Ionicons name="newspaper-outline" size={32} color={COLORS.primary} />
              </LinearGradient>
              <View style={styles.categoryOverlay}>
                <Chip 
                  mode="outlined" 
                  compact 
                  style={styles.categoryChip}
                  textStyle={styles.categoryText}
                >
                  {article.category.name}
                </Chip>
              </View>
            </View>
          )}
          
          <Card.Content style={styles.content}>
            {/* Date and Reading Time */}
            <View style={styles.metaRow}>
              <View style={styles.dateContainer}>
                {isOffline && (
                  <View style={styles.offlineIndicator}>
                    <Ionicons 
                      name="download" 
                      size={12} 
                      color={COLORS.success}
                    />
                  </View>
                )}
                <Text variant="bodySmall" style={styles.dateText}>
                  {formatDate(article.publishedAt)}
                </Text>
              </View>
              <View style={styles.readingTime}>
                <Ionicons 
                  name="time-outline" 
                  size={12} 
                  color={COLORS.text.tertiary}
                />
                <Text variant="bodySmall" style={styles.readingTimeText}>
                  {article.readTime}m
                </Text>
              </View>
            </View>

            {/* Title */}
            <Text 
              variant="headlineSmall" 
              numberOfLines={2} 
              style={styles.title}
            >
              {article.title}
            </Text>

            {/* Excerpt */}
            <Text 
              variant="bodyMedium" 
              numberOfLines={2} 
              style={styles.excerpt}
            >
              {article.excerpt}
            </Text>
          </Card.Content>
        </Card>
      </TouchableOpacity>
    </Surface>
  );
};

const styles = StyleSheet.create({
  container: {
    marginHorizontal: SPACING.md,
    marginVertical: SPACING.sm,
    borderRadius: 16,
    backgroundColor: 'transparent',
    ...COLORS.shadows.medium,
  },
  touchable: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  card: {
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: COLORS.surface,
    elevation: 0,
  },
  // Image Styles
  imageContainer: {
    position: 'relative',
    height: 180,
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  imageOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 60,
  },
  categoryOverlay: {
    position: 'absolute',
    top: SPACING.sm,
    left: SPACING.sm,
  },
  categoryChipOverlay: {
    backgroundColor: COLORS.surface + 'E6',
    borderRadius: 20,
    height: 28,
  },
  categoryTextOverlay: {
    fontSize: 11,
    fontWeight: '600',
    color: COLORS.text.primary,
  },
  // No Image Styles
  noImageContainer: {
    height: 120,
    position: 'relative',
    overflow: 'hidden',
  },
  noImageGradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  // Content Styles
  content: {
    padding: SPACING.md,
    paddingTop: SPACING.md,
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  dateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  offlineIndicator: {
    marginRight: SPACING.xs,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: COLORS.success + '20',
    justifyContent: 'center',
    alignItems: 'center',
  },
  dateText: {
    color: COLORS.text.tertiary,
    fontSize: 12,
    fontWeight: '500',
  },
  readingTime: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  readingTimeText: {
    color: COLORS.text.tertiary,
    fontSize: 12,
    fontWeight: '500',
  },
  title: {
    marginBottom: SPACING.sm,
    fontWeight: '700',
    lineHeight: 24,
    color: COLORS.text.primary,
    letterSpacing: -0.2,
  },
  excerpt: {
    color: COLORS.text.secondary,
    lineHeight: 20,
    fontWeight: '400',
  },
  // Category Chip (for no image case)
  categoryChip: {
    height: 28,
    backgroundColor: COLORS.surfaceVariant,
    borderColor: COLORS.border.light,
    borderRadius: 20,
  },
  categoryText: {
    fontSize: 11,
    fontWeight: '600',
    color: COLORS.text.secondary,
  },
});

export default ArticleCard;