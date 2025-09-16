import React, { useRef, useEffect } from 'react';
import { ScrollView, StyleSheet, TouchableOpacity, View, Animated } from 'react-native';
import { Chip, Text, Surface, ActivityIndicator } from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';
import { Category } from '../types';
import { SPACING, COLORS } from '../constants';

interface CategoryTabsProps {
  categories: Category[];
  selectedCategory: string;
  onCategorySelect: (categoryId: string) => void;
  loading?: boolean;
  isFiltering?: boolean; // New prop to show filtering state
}

const CategoryTabs: React.FC<CategoryTabsProps> = ({
  categories,
  selectedCategory,
  onCategorySelect,
  loading = false,
  isFiltering = false,
}) => {
  const animatedValue = useRef(new Animated.Value(0)).current;
  const fadeValue = useRef(new Animated.Value(1)).current;

  // Animate when filtering state changes
  useEffect(() => {
    Animated.timing(fadeValue, {
      toValue: isFiltering ? 0.7 : 1,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, [isFiltering]);

  // Animate category selection
  const handleCategoryPress = (categoryId: string) => {
    if (categoryId !== selectedCategory && !isFiltering && !loading) {
      // Quick bounce animation
      Animated.sequence([
        Animated.timing(animatedValue, {
          toValue: 1,
          duration: 100,
          useNativeDriver: true,
        }),
        Animated.timing(animatedValue, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
      
      onCategorySelect(categoryId);
    }
  };

  // Add "All" category
  const allCategories = [
    { id: 'all', name: 'All', slug: 'all', createdAt: '' },
    ...categories,
  ];

  const renderCategory = (category: Category) => {
    const isSelected = selectedCategory === category.id;
    
    const scaleAnimation = animatedValue.interpolate({
      inputRange: [0, 1],
      outputRange: [1, 0.95],
    });

    return (
      <Animated.View
        key={category.id}
        style={[
          { transform: [{ scale: scaleAnimation }] },
          { opacity: fadeValue }
        ]}
      >
        <TouchableOpacity
          onPress={() => handleCategoryPress(category.id)}
          disabled={loading || isFiltering}
          style={[
            styles.categoryButton,
            (loading || isFiltering) && styles.disabledButton
          ]}
          activeOpacity={0.8}
        >
          {isSelected ? (
            <LinearGradient
              colors={[COLORS.primary, COLORS.primaryLight]}
              style={styles.selectedCategoryContainer}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              <View style={styles.selectedContent}>
                <Text style={styles.selectedCategoryText}>
                  {category.name}
                </Text>
                {isFiltering && isSelected && (
                  <ActivityIndicator 
                    animating={true} 
                    color={COLORS.text.inverse} 
                    size="small" 
                    style={styles.filteringIndicator}
                  />
                )}
              </View>
            </LinearGradient>
          ) : (
            <Surface style={[
              styles.unselectedCategoryContainer,
              (loading || isFiltering) && styles.disabledCategory
            ]} elevation={0}>
              <Text style={[
                styles.unselectedCategoryText,
                (loading || isFiltering) && styles.disabledText
              ]}>
                {category.name}
              </Text>
            </Surface>
          )}
        </TouchableOpacity>
      </Animated.View>
    );
  };

  return (
    <View style={styles.container}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        style={styles.scrollView}
        bounces={false}
        decelerationRate="fast"
      >
        {allCategories.map(renderCategory)}
      </ScrollView>
      {isFiltering && (
        <Animated.View 
          style={[
            styles.filteringOverlay,
            { opacity: fadeValue }
          ]}
        >
          <ActivityIndicator 
            animating={true} 
            color={COLORS.primary} 
            size="small" 
          />
          <Text style={styles.filteringText}>
            Filtering news...
          </Text>
        </Animated.View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.backgroundSecondary,
    paddingVertical: SPACING.sm,
  },
  scrollView: {
    backgroundColor: 'transparent',
  },
  scrollContent: {
    paddingHorizontal: SPACING.md,
    gap: SPACING.sm,
  },
  categoryButton: {
    marginRight: SPACING.sm,
  },
  disabledButton: {
    opacity: 0.6,
  },
  selectedCategoryContainer: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: 24,
    minHeight: 40,
    justifyContent: 'center',
    alignItems: 'center',
    ...COLORS.shadows.small,
  },
  selectedContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.xs,
  },
  filteringIndicator: {
    marginLeft: SPACING.xs,
  },
  unselectedCategoryContainer: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: 24,
    minHeight: 40,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border.light,
  },
  disabledCategory: {
    opacity: 0.5,
    backgroundColor: COLORS.border.light,
  },
  selectedCategoryText: {
    color: COLORS.text.inverse,
    fontSize: 14,
    fontWeight: '600',
    letterSpacing: 0.2,
  },
  unselectedCategoryText: {
    color: COLORS.text.secondary,
    fontSize: 14,
    fontWeight: '500',
    letterSpacing: 0.1,
  },
  disabledText: {
    color: COLORS.text.tertiary,
  },
  filteringOverlay: {
    position: 'absolute',
    bottom: -SPACING.md,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.xs,
    gap: SPACING.xs,
  },
  filteringText: {
    fontSize: 12,
    color: COLORS.text.secondary,
    fontWeight: '500',
  },
});

export default CategoryTabs;