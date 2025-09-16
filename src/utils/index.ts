/**
 * Utility functions for the News Mobile App
 */

// Format date for display
export const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  const now = new Date();
  const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));

  if (diffInHours < 1) {
    return 'Just now';
  } else if (diffInHours < 24) {
    return `${diffInHours}h ago`;
  } else if (diffInHours < 48) {
    return 'Yesterday';
  } else {
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined,
    });
  }
};

// Calculate reading time based on content length
export const calculateReadingTime = (content: string): number => {
  const wordsPerMinute = 200;
  const textLength = content.replace(/<[^>]*>/g, '').split(/\s+/).length;
  const readingTime = Math.ceil(textLength / wordsPerMinute);
  return Math.max(1, readingTime);
};

// Sanitize HTML content for security
export const sanitizeHTML = (html: string): string => {
  return html.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
};

// Validate image URL
export const validateImageURL = (url: string): boolean => {
  const allowedDomains = ['cloudinary.com', 'your-domain.com', 'localhost'];
  try {
    const urlObj = new URL(url);
    return allowedDomains.some(domain => urlObj.hostname.includes(domain));
  } catch {
    return false;
  }
};

// Truncate text with ellipsis
export const truncateText = (text: string, maxLength: number): string => {
  if (text.length <= maxLength) return text;
  return text.substr(0, maxLength).trim() + '...';
};

// Generate excerpt from HTML content
export const generateExcerpt = (htmlContent: string, maxLength: number = 150): string => {
  const textContent = htmlContent.replace(/<[^>]*>/g, '');
  return truncateText(textContent, maxLength);
};

// Debounce function for search
export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  wait: number
): ((...args: Parameters<T>) => void) => {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};

// Check if device is online
export const isOnline = async (): Promise<boolean> => {
  try {
    const response = await fetch('https://www.google.com/favicon.ico', {
      method: 'HEAD',
      cache: 'no-cache',
    });
    return response.ok;
  } catch {
    return false;
  }
};

// Format file size
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

// Generate share message
export const generateShareMessage = (article: { title: string; excerpt: string; id: string }): string => {
  return `${article.title}\n\n${article.excerpt}\n\nRead more: https://your-app.com/article/${article.id}`;
};

// Validate article data
export const validateArticle = (article: any): boolean => {
  return !!(
    article &&
    article.id &&
    article.title &&
    article.content &&
    article.category &&
    article.publishedAt
  );
};