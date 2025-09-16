import React from 'react';
import { Image, ImageProps, StyleSheet, View, Text, Platform } from 'react-native';
import { ActivityIndicator } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../constants';
import { imageService } from '../services/imageService';

interface OptimizedImageProps extends Omit<ImageProps, 'source'> {
  source: { uri: string };
  style?: any;
  resizeMode?: 'cover' | 'contain' | 'stretch' | 'repeat' | 'center';
  showLoading?: boolean;
  width?: number;
  height?: number;
  quality?: number;
  cacheEnabled?: boolean;
}

const OptimizedImage: React.FC<OptimizedImageProps> = ({
  source,
  style,
  resizeMode = 'cover',
  showLoading = true,
  width,
  height,
  quality = 80,
  cacheEnabled = true,
  ...props
}) => {
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState(false);
  const [imageUri, setImageUri] = React.useState<string | null>(null);

  // Load and cache image
  React.useEffect(() => {
    let isMounted = true;
    
    const loadImage = async () => {
      // Validate image source URI
      if (!source || !source.uri || source.uri.trim() === '') {
        if (isMounted) {
          setLoading(false);
          setError(true);
        }
        return;
      }
      
      try {
        if (isMounted) {
          setError(false);
          setLoading(true);
        }
        
        // Use image service if caching is enabled
        if (cacheEnabled) {
          const cachedUri = await imageService.getImage(source.uri, {
            width,
            height,
            quality,
            resize: !!(width || height)
          });
          
          if (isMounted) {
            setImageUri(cachedUri);
          }
        } else {
          // Use original URI if caching is disabled
          if (isMounted) {
            setImageUri(source.uri);
          }
        }
      } catch (err) {
        console.warn('Failed to load image:', source.uri, err);
        if (isMounted) {
          setError(true);
          setLoading(false);
        }
      }
    };
    
    loadImage();
    
    return () => {
      isMounted = false;
    };
  }, [source, width, height, quality, cacheEnabled]);

  const handleLoadEnd = () => {
    setLoading(false);
  };

  const handleError = () => {
    console.warn('Image failed to load:', imageUri || source?.uri);
    setLoading(false);
    setError(true);
  };

  return (
    <View style={[styles.container, style]}>
      {!error && imageUri && (
        <Image
          source={{ uri: imageUri }}
          style={style}
          resizeMode={resizeMode}
          onLoadEnd={handleLoadEnd}
          onError={handleError}
          {...props}
        />
      )}
      
      {loading && showLoading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="small" color={COLORS.primary} />
        </View>
      )}
      
      {error && (
        <View style={styles.errorContainer}>
          <Ionicons name="image-outline" size={24} color={COLORS.onBackground + '50'} />
          <Text style={styles.errorText}>Image unavailable</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.surface,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingContainer: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
  },
  errorContainer: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    flexDirection: 'column',
    gap: 8,
  },
  errorText: {
    fontSize: 12,
    color: COLORS.onBackground + '70',
    textAlign: 'center',
  },
});

export default OptimizedImage;