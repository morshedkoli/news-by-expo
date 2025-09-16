import { Platform } from 'react-native';
import * as FileSystem from 'expo-file-system/legacy';
import { Directory, File } from 'expo-file-system';
import { manipulateAsync, SaveFormat } from 'expo-image-manipulator';
import { APP_CONFIG } from '../constants';

// Define types for image service
interface ImageCacheEntry {
  uri: string;
  timestamp: number;
  size: number;
}

interface ImageCacheMap {
  [key: string]: ImageCacheEntry;
}

interface ImageOptions {
  width?: number;
  height?: number;
  quality?: number;
  resize?: boolean;
}

class ImageService {
  private cacheDirectory: string;
  private cacheMap: ImageCacheMap = {};
  private isInitialized = false;
  private maxCacheSize: number;

  constructor() {
    // Use appropriate cache directory based on platform
    this.cacheDirectory = `${FileSystem.cacheDirectory}images/`;
    // Convert MB to bytes for cache size limit
    this.maxCacheSize = APP_CONFIG.CACHE.MAX_SIZE_MB * 1024 * 1024;
    this.initializeCache();
  }

  /**
   * Initialize the cache directory and load cache metadata
   */
  private async initializeCache(): Promise<void> {
    try {
      // Handle platform differences
      if (Platform.OS === 'web') {
        // For web platform, just set the directory and initialize empty cache
        this.cacheDirectory = `${FileSystem.cacheDirectory}images/`;
        this.cacheMap = {};
        this.isInitialized = true;
        console.log('Image cache initialized for web');
        return;
      }
      
      // For native platforms, use the modern Directory API
      try {
        // Create cache directory if it doesn't exist
        await FileSystem.makeDirectoryAsync(`${FileSystem.cacheDirectory}images/`, { intermediates: true });
        this.cacheDirectory = `${FileSystem.cacheDirectory}images/`;
        
        // Try to load metadata if it exists
        try {
          const metadataPath = `${this.cacheDirectory}metadata.json`;
          const metadataInfo = await FileSystem.getInfoAsync(metadataPath);
          
          if (metadataInfo.exists) {
            const cacheMetadata = await FileSystem.readAsStringAsync(metadataPath);
            this.cacheMap = JSON.parse(cacheMetadata);
          } else {
            // If metadata doesn't exist, create a new one
            this.cacheMap = {};
            await this.saveCacheMetadata();
          }
        } catch (error) {
          // If metadata is invalid, create a new one
          this.cacheMap = {};
          await this.saveCacheMetadata();
        }
      } catch (dirError) {
        console.error('Failed to create cache directory:', dirError);
        // Fallback to memory-only cache
        this.cacheMap = {};
      }

      this.isInitialized = true;
      console.log('Image cache initialized');

      // Clean up old cache entries
      this.cleanCache();
    } catch (error) {
      console.error('Failed to initialize image cache:', error);
    }
  }

  /**
   * Save cache metadata to file
   */
  private async saveCacheMetadata(): Promise<void> {
    // Skip saving metadata on web platform
    if (Platform.OS === 'web') {
      return;
    }
    
    try {
      await FileSystem.writeAsStringAsync(
        `${this.cacheDirectory}metadata.json`,
        JSON.stringify(this.cacheMap)
      );
    } catch (error) {
      console.error('Failed to save cache metadata:', error);
    }
  }

  /**
   * Clean up old cache entries to stay within size limits
   */
  private async cleanCache(): Promise<void> {
    try {
      // Calculate current cache size
      let totalSize = 0;
      const entries = Object.entries(this.cacheMap);
      
      // Sort by timestamp (oldest first)
      entries.sort((a, b) => a[1].timestamp - b[1].timestamp);
      
      for (const [key, entry] of entries) {
        totalSize += entry.size;
      }

      // Remove oldest entries until we're under the size limit
      if (totalSize > this.maxCacheSize) {
        console.log(`Cache size (${totalSize / 1024 / 1024}MB) exceeds limit, cleaning...`);
        
        for (const [key, entry] of entries) {
          if (totalSize <= this.maxCacheSize) break;
          
          // Skip file deletion on web platform
          if (Platform.OS === 'web') {
            totalSize -= entry.size;
            delete this.cacheMap[key];
            continue;
          }
          
          try {
            const fileInfo = await FileSystem.getInfoAsync(entry.uri);
            if (fileInfo.exists) {
              await FileSystem.deleteAsync(entry.uri, { idempotent: true });
            }
            totalSize -= entry.size;
            delete this.cacheMap[key];
          } catch (error) {
            console.warn(`Failed to delete cached image: ${key}`, error);
          }
        }
        
        await this.saveCacheMetadata();
        console.log(`Cache cleaned, new size: ${totalSize / 1024 / 1024}MB`);
      }
    } catch (error) {
      console.error('Failed to clean cache:', error);
    }
  }

  /**
   * Get a cached image URI or download and cache it
   * @param url Remote image URL
   * @param options Image processing options
   * @returns Local URI of the cached image
   */
  async getImage(url: string, options?: ImageOptions): Promise<string> {
    if (!url || url.trim() === '') {
      throw new Error('Invalid image URL');
    }

    // Wait for cache initialization
    if (!this.isInitialized) {
      await new Promise<void>((resolve) => {
        const checkInit = () => {
          if (this.isInitialized) resolve();
          else setTimeout(checkInit, 100);
        };
        checkInit();
      });
    }

    // Create a cache key based on URL and options
    const optionsKey = options ? JSON.stringify(options) : '';
    const cacheKey = `${url}${optionsKey}`;

    // Check if image is already cached
    if (this.cacheMap[cacheKey]) {
      const cachedEntry = this.cacheMap[cacheKey];
      
      // Check if file exists in cache
      let fileExists = false;
      if (Platform.OS === 'web') {
        // On web, assume it doesn't exist since we can't check
        fileExists = false;
      } else {
        // On native platforms, check if file exists
        try {
          const fileInfo = await FileSystem.getInfoAsync(cachedEntry.uri);
          fileExists = fileInfo.exists;
        } catch (error) {
          fileExists = false;
        }
      }
      
      // If file exists in cache, update timestamp and return
      if (fileExists) {
        this.cacheMap[cacheKey].timestamp = Date.now();
        await this.saveCacheMetadata();
        return cachedEntry.uri;
      }
      
      // If file doesn't exist, remove from cache map
      delete this.cacheMap[cacheKey];
    }

    try {
      // Generate a unique filename
      const filename = url.split('/').pop() || `image-${Date.now()}`;
      const fileExt = filename.includes('.') ? filename.split('.').pop() : 'jpg';
      const localUri = `${this.cacheDirectory}${Date.now()}-${filename}`;
      
      // Download the image using appropriate API based on platform
      let downloadResult;
      if (Platform.OS === 'web') {
        // For web, we'll use fetch API and return a simplified result
        try {
          const response = await fetch(url);
          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }
          // Return a simplified result structure similar to FileSystem.downloadAsync
          downloadResult = {
            uri: localUri,
            status: response.status,
            headers: {
              'Content-Length': response.headers.get('Content-Length') || '0',
              'Content-Type': response.headers.get('Content-Type') || 'image/jpeg'
            }
          };
        } catch (error) {
          console.error('Failed to fetch image on web:', error);
          throw error;
        }
      } else {
        // For native platforms, use FileSystem.downloadAsync
        downloadResult = await FileSystem.downloadAsync(url, localUri);
      }
      
      // Process image if options are provided
      let finalUri = downloadResult.uri;
      let fileSize = downloadResult.headers['Content-Length'] ? 
        parseInt(downloadResult.headers['Content-Length']) : 0;
      
      // If Content-Length header is missing, calculate file size from the file
      if (!fileSize) {
        if (Platform.OS === 'web') {
          // On web, use a default size since we can't check
          fileSize = 1024 * 100; // Assume 100KB
        } else {
          // On native platforms, get file info
          const fileInfo = await FileSystem.getInfoAsync(finalUri);
          fileSize = (fileInfo as any).size || 1024 * 100; // Default to 100KB if size is not available
        }
      }
      
      if (options && options.resize && (options.width || options.height)) {
        const manipResult = await manipulateAsync(
          finalUri,
          [{ resize: { 
            width: options.width, 
            height: options.height 
          }}],
          { 
            compress: options.quality ? options.quality / 100 : 0.8,
            format: SaveFormat.JPEG
          }
        );
        
        // Replace with processed image
        finalUri = manipResult.uri;
        // Calculate file size after manipulation
        if (Platform.OS === 'web') {
          // On web, use the previous size or default
          fileSize = fileSize || 1024 * 100; // Default to 100KB if size is not available
        } else {
          // On native platforms, get file info
          try {
            const fileInfo = await FileSystem.getInfoAsync(finalUri);
            fileSize = (fileInfo as any).size || fileSize;
          } catch (error) {
            console.warn('Failed to get file size after manipulation:', error);
          }
        }
      }
      
      // Add to cache map
      this.cacheMap[cacheKey] = {
        uri: finalUri,
        timestamp: Date.now(),
        size: fileSize
      };
      
      await this.saveCacheMetadata();
      return finalUri;
    } catch (error) {
      console.error(`Failed to download and cache image: ${url}`, error);
      throw error;
    }
  }

  /**
   * Prefetch multiple images and cache them
   * @param urls Array of image URLs to prefetch
   * @param options Image processing options
   * @returns Array of results with success/failure status
   */
  async prefetchImages(urls: string[], options?: ImageOptions): Promise<{url: string, success: boolean}[]> {
    const results = [];
    
    for (const url of urls) {
      try {
        await this.getImage(url, options);
        results.push({ url, success: true });
      } catch (error) {
        results.push({ url, success: false });
      }
    }
    
    return results;
  }

  /**
   * Clear the entire image cache
   */
  async clearCache(): Promise<void> {
    // On web platform, just reset the cache map
    if (Platform.OS === 'web') {
      this.cacheMap = {};
      return;
    }
    
    try {
      // Delete the cache directory using legacy FileSystem API
      const dirInfo = await FileSystem.getInfoAsync(this.cacheDirectory);
      if (dirInfo.exists) {
        await FileSystem.deleteAsync(this.cacheDirectory, { idempotent: true });
      }
      
      // Recreate the cache directory
      await FileSystem.makeDirectoryAsync(`${FileSystem.cacheDirectory}images/`, { intermediates: true });
      
      // Update cache directory path
      this.cacheDirectory = `${FileSystem.cacheDirectory}images/`;
      
      // Reset cache map and save metadata
      this.cacheMap = {};
      await this.saveCacheMetadata();
      console.log('Image cache cleared');
    } catch (error) {
      console.error('Failed to clear image cache:', error);
      throw error;
    }
  }

  /**
   * Get cache statistics
   * @returns Object with cache stats
   */
  async getCacheStats(): Promise<{ count: number, size: number, maxSize: number }> {
    const entries = Object.values(this.cacheMap);
    const totalSize = entries.reduce((sum, entry) => sum + entry.size, 0);
    
    return {
      count: entries.length,
      size: totalSize,
      maxSize: this.maxCacheSize
    };
  }
}

// Export singleton instance
export const imageService = new ImageService();