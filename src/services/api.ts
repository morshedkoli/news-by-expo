import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { Article, Category, NewsResponse, NewsQueryParams } from '../types';
import { API_CONFIG } from '../constants';

// Enhanced base query with better error handling
const baseQueryWithRetry = fetchBaseQuery({
  baseUrl: API_CONFIG.BASE_URL,
  timeout: API_CONFIG.TIMEOUT,
  prepareHeaders: (headers) => {
    headers.set('Content-Type', 'application/json');
    return headers;
  },
  // Transform HTTP errors into more user-friendly messages
  responseHandler: async (response) => {
    if (!response.ok) {
      const errorData = await response.text();
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    return response.json();
  },
});

// Retry logic wrapper
const baseQueryWithRetryLogic = async (args: any, api: any, extraOptions: any) => {
  let result = await baseQueryWithRetry(args, api, extraOptions);
  
  // Retry on network errors or 5xx errors
  if (result.error && typeof result.error.status === 'number' && result.error.status >= 500) {
    let retryCount = 0;
    while (retryCount < API_CONFIG.RETRY_ATTEMPTS) {
      await new Promise(resolve => setTimeout(resolve, 1000 * (retryCount + 1))); // Exponential backoff
      result = await baseQueryWithRetry(args, api, extraOptions);
      if (!result.error || (typeof result.error.status === 'number' && result.error.status < 500)) break;
      retryCount++;
    }
  }
  
  return result;
};

export const newsApi = createApi({
  reducerPath: 'newsApi',
  baseQuery: baseQueryWithRetryLogic,
  tagTypes: ['News', 'Category'],
  endpoints: (builder) => ({
    getNews: builder.query<NewsResponse, NewsQueryParams>({
      query: ({ page = 1, limit = 20, category, search }) => {
        const params: any = { 
          page, 
          limit, 
          published: true 
        };
        
        // Remove server-side filtering since API doesn't filter properly
        // We'll do client-side filtering in transformResponse instead
        
        // Handle search filtering
        if (search && search.trim()) {
          params.search = search.trim();
        }
        
        return {
          url: API_CONFIG.ENDPOINTS.NEWS,
          params
        };
      },
      transformResponse: (response: any, meta: any, arg: NewsQueryParams): NewsResponse => {
        // Transform the API response to match our expected format
        try {
          if (response && response.news && Array.isArray(response.news)) {
            let transformedNews = response.news.map((article: any) => ({
              ...article,
              // Ensure all required fields are present
              excerpt: article.excerpt || article.content?.replace(/<[^>]*>/g, '').substring(0, 150) + '...' || '',
              readTime: article.readTime || Math.ceil((article.content?.replace(/<[^>]*>/g, '').length || 0) / 200) || 1,
              // imageUrl is already in the correct format from API
            }));
            
            // Client-side filtering since API doesn't filter properly
            if (arg.category && arg.category !== 'all') {
              transformedNews = transformedNews.filter((article: any) => 
                article.categoryId === arg.category || article.category?.id === arg.category
              );
            }
            
            // Client-side search filtering
            if (arg.search && arg.search.trim()) {
              const searchTerm = arg.search.trim().toLowerCase();
              console.log('Filtering articles with search term:', searchTerm);
              console.log('Total articles before filtering:', transformedNews.length);
              
              transformedNews = transformedNews.filter((article: any) => {
                const titleMatch = article.title?.toLowerCase().includes(searchTerm);
                const contentMatch = article.content?.toLowerCase().includes(searchTerm);
                const excerptMatch = article.excerpt?.toLowerCase().includes(searchTerm);
                const categoryMatch = article.category?.name?.toLowerCase().includes(searchTerm);
                
                const matches = titleMatch || contentMatch || excerptMatch || categoryMatch;
                if (matches) {
                  console.log('Article matches search:', article.title);
                }
                return matches;
              });
              
              console.log('Total articles after filtering:', transformedNews.length);
            }
            
            return {
              news: transformedNews,
              total: transformedNews.length,
              page: response.page || 1,
              hasMore: false, // Since we're filtering client-side, disable pagination
            };
          }
          // Fallback for different response formats
          return {
            news: [],
            total: 0,
            page: 1,
            hasMore: false,
          };
        } catch (error) {
          console.warn('Error transforming news response:', error);
          return {
            news: [],
            total: 0,
            page: 1,
            hasMore: false,
          };
        }
      },
      transformErrorResponse: (response: any) => {
        // Transform error responses into user-friendly messages
        if (response.status === 'FETCH_ERROR') {
          return {
            status: 'NETWORK_ERROR',
            message: 'Please check your internet connection and try again.',
          };
        }
        if (response.status === 'TIMEOUT_ERROR') {
          return {
            status: 'TIMEOUT',
            message: 'Request timed out. Please try again.',
          };
        }
        if (response.status >= 500) {
          return {
            status: 'SERVER_ERROR',
            message: 'Server is temporarily unavailable. Please try again later.',
          };
        }
        if (response.status === 404) {
          return {
            status: 'NOT_FOUND',
            message: 'News content not found.',
          };
        }
        return {
          status: response.status || 'UNKNOWN_ERROR',
          message: response.data?.message || 'An unexpected error occurred.',
        };
      },
      providesTags: (result) => 
        result
          ? [
              ...result.news.map(({ id }) => ({ type: 'News' as const, id })),
              { type: 'News', id: 'LIST' },
            ]
          : [{ type: 'News', id: 'LIST' }],
      // Serialize query args for caching - treat undefined and 'all' category the same
      serializeQueryArgs: ({ queryArgs }) => {
        const { page, category, search, ...rest } = queryArgs;
        const normalizedCategory = !category || category === 'all' ? undefined : category;
        const normalizedSearch = search && search.trim() ? search.trim() : undefined;
        return { ...rest, category: normalizedCategory, search: normalizedSearch };
      },
      merge: (currentCache, newItems, { arg }) => {
        // Don't merge if this is a search, category change, or page 1 - replace instead
        if (arg.page === 1 || arg.search) {
          return newItems;
        }
        return {
          ...newItems,
          news: [...currentCache.news, ...newItems.news],
        };
      },
      forceRefetch({ currentArg, previousArg }) {
        // Force refetch if page changes OR category changes OR search changes
        return currentArg?.page !== previousArg?.page || 
               currentArg?.category !== previousArg?.category ||
               currentArg?.search !== previousArg?.search;
      },
    }),
    getArticle: builder.query<Article, string>({
      query: (id) => `${API_CONFIG.ENDPOINTS.NEWS}/${id}`,
      transformErrorResponse: (response: any) => {
        if (response.status === 'FETCH_ERROR') {
          return {
            status: 'NETWORK_ERROR',
            message: 'Please check your internet connection and try again.',
          };
        }
        if (response.status === 404) {
          return {
            status: 'NOT_FOUND',
            message: 'Article not found.',
          };
        }
        return {
          status: response.status || 'UNKNOWN_ERROR',
          message: response.data?.message || 'Failed to load article.',
        };
      },
      providesTags: (result, error, id) => [{ type: 'News', id }],
    }),
    getCategories: builder.query<Category[], void>({
      query: () => API_CONFIG.ENDPOINTS.CATEGORIES,
      transformErrorResponse: (response: any) => {
        if (response.status === 'FETCH_ERROR') {
          return {
            status: 'NETWORK_ERROR',
            message: 'Please check your internet connection and try again.',
          };
        }
        return {
          status: response.status || 'UNKNOWN_ERROR',
          message: 'Failed to load categories.',
        };
      },
      providesTags: [{ type: 'Category', id: 'LIST' }],
    }),
    registerFCMToken: builder.mutation<void, { token: string; platform: string }>({
      query: (body) => ({
        url: API_CONFIG.ENDPOINTS.FCM_TOKEN,
        method: 'POST',
        body,
      }),
    }),
  }),
});

export const {
  useGetNewsQuery,
  useGetArticleQuery,
  useGetCategoriesQuery,
  useRegisterFCMTokenMutation,
} = newsApi;