import axios, { AxiosInstance, AxiosError, InternalAxiosRequestConfig } from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

// Token refresh management to prevent race conditions
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value?: any) => void;
  reject: (reason?: any) => void;
}> = [];

const processQueue = (error: any = null, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });

  failedQueue = [];
};

// Create axios instance
export const apiClient: AxiosInstance = axios.create({
  baseURL: API_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor - Add auth token and detailed logging
apiClient.interceptors.request.use(
  (config) => {
    const startTime = Date.now();
    // Store start time for duration calculation
    (config as any).metadata = { startTime };

    // Get token from localStorage
    if (typeof window !== 'undefined') {
      const authStore = localStorage.getItem('moa-auth-storage');
      if (authStore) {
        try {
          const { state } = JSON.parse(authStore);
          const token = state?.user?.token;

          if (token) {
            config.headers.Authorization = `Bearer ${token}`;
          }

          // Detailed logging in development
          if (process.env.NODE_ENV === 'development') {
            console.log(`\n📤 [API REQUEST] ${config.method?.toUpperCase()} ${config.url}`);
            console.log(`   Base URL: ${config.baseURL}`);
            console.log(`   Headers:`, {
              ...config.headers,
              Authorization: token ? `Bearer ${token.substring(0, 20)}...` : 'None',
            });

            if (config.params && Object.keys(config.params).length > 0) {
              console.log(`   Query Params:`, config.params);
            }

            if (config.data) {
              console.log(`   Request Body:`, config.data);
            }

            console.log(`   Token present: ${!!token}`);
          }
        } catch (error) {
          console.error('Failed to parse auth storage:', error);
        }
      } else {
        if (process.env.NODE_ENV === 'development') {
          console.log(`\n📤 [API REQUEST] ${config.method?.toUpperCase()} ${config.url}`);
          console.log(`   ⚠️  No auth store found in localStorage`);
        }
      }
    }
    return config;
  },
  (error) => {
    if (process.env.NODE_ENV === 'development') {
      console.error('\n❌ [API REQUEST ERROR]', error.message);
    }
    return Promise.reject(error);
  }
);

// Response interceptor - Handle errors and auto-refresh with detailed logging
apiClient.interceptors.response.use(
  (response) => {
    // Calculate request duration
    const duration = (response.config as any).metadata?.startTime
      ? Date.now() - (response.config as any).metadata.startTime
      : 0;

    // Detailed logging in development
    if (process.env.NODE_ENV === 'development') {
      console.log(`\n📥 [API RESPONSE] ${response.config.method?.toUpperCase()} ${response.config.url} - ${response.status}`);
      console.log(`   Duration: ${duration}ms`);
      console.log(`   Status: ${response.status} ${response.statusText}`);

      if (response.headers) {
        console.log(`   Content-Type: ${response.headers['content-type']}`);
      }

      // Log response data (truncate if too large)
      if (response.data) {
        const dataStr = JSON.stringify(response.data);
        if (dataStr.length < 1000) {
          console.log(`   Response Data:`, response.data);
        } else {
          console.log(`   Response Data: [Large response, ${dataStr.length} characters]`);
          console.log(`   Response Preview:`, dataStr.substring(0, 200) + '...');
        }
      }
      console.log(`${'─'.repeat(80)}\n`);
    }

    return response;
  },
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    if (error.response) {
      const { status, data } = error.response;

      // Handle 401 - Try to refresh token
      if (status === 401 && originalRequest && !originalRequest._retry) {
        // Skip refresh for login/register/refresh endpoints
        if (
          originalRequest.url?.includes('/auth/login') ||
          originalRequest.url?.includes('/auth/register') ||
          originalRequest.url?.includes('/auth/refresh')
        ) {
          return Promise.reject(error);
        }

        // If already refreshing, queue this request
        if (isRefreshing) {
          return new Promise((resolve, reject) => {
            failedQueue.push({ resolve, reject });
          })
            .then((token) => {
              if (originalRequest.headers) {
                originalRequest.headers.Authorization = `Bearer ${token}`;
              }
              return apiClient(originalRequest);
            })
            .catch((err) => {
              return Promise.reject(err);
            });
        }

        originalRequest._retry = true;
        isRefreshing = true;

        // Get refresh token from storage
        if (typeof window !== 'undefined') {
          const authStore = localStorage.getItem('moa-auth-storage');
          if (authStore) {
            try {
              const { state } = JSON.parse(authStore);
              const refreshToken = state?.user?.refreshToken;

              if (refreshToken) {
                // Try to refresh token
                try {
                  const response = await axios.post(`${API_URL}/api/auth/refresh`, {
                    refreshToken,
                  });

                  if (response.data.success) {
                    const { token, refreshToken: newRefreshToken } = response.data.data;

                    // Update tokens in store
                    const parsedStore = JSON.parse(authStore);
                    if (parsedStore.state?.user) {
                      parsedStore.state.user.token = token;
                      parsedStore.state.user.refreshToken = newRefreshToken;
                      localStorage.setItem('moa-auth-storage', JSON.stringify(parsedStore));
                    }

                    // Update authorization header for original request
                    if (originalRequest.headers) {
                      originalRequest.headers.Authorization = `Bearer ${token}`;
                    }

                    // Process queued requests
                    processQueue(null, token);
                    isRefreshing = false;

                    // Retry original request
                    return apiClient(originalRequest);
                  }
                } catch (refreshError) {
                  // Refresh failed - clear auth and redirect
                  processQueue(refreshError, null);
                  isRefreshing = false;
                  localStorage.removeItem('moa-auth-storage');
                  window.location.href = '/login';
                  return Promise.reject(refreshError);
                }
              }
            } catch (parseError) {
              console.error('Failed to parse auth storage:', parseError);
            }
          }

          // No refresh token or failed to get it - clear auth and redirect
          isRefreshing = false;
          localStorage.removeItem('moa-auth-storage');
          window.location.href = '/login';
        }
      }

      // Enhanced error logging in development
      if (process.env.NODE_ENV === 'development') {
        const duration = (error.config as any)?.metadata?.startTime
          ? Date.now() - (error.config as any).metadata.startTime
          : 0;

        console.error(`\n❌ [API ERROR] ${error.config?.method?.toUpperCase()} ${error.config?.url} - ${status}`);
        console.error(`   Duration: ${duration}ms`);
        console.error(`   Status: ${status}`);
        console.error(`   Error Data:`, data);
        console.error(`${'─'.repeat(80)}\n`);
      } else {
        console.error('API Error:', {
          status,
          data,
          url: error.config?.url,
        });
      }
    } else if (error.request) {
      if (process.env.NODE_ENV === 'development') {
        console.error('\n❌ [NETWORK ERROR]');
        console.error(`   Message: ${error.message}`);
        console.error(`   URL: ${error.config?.url}`);
        console.error(`   Request was made but no response received`);
        console.error(`${'─'.repeat(80)}\n`);
      } else {
        console.error('Network Error:', error.message);
      }
    } else {
      if (process.env.NODE_ENV === 'development') {
        console.error('\n❌ [REQUEST SETUP ERROR]');
        console.error(`   Message: ${error.message}`);
        console.error(`${'─'.repeat(80)}\n`);
      } else {
        console.error('Error:', error.message);
      }
    }

    return Promise.reject(error);
  }
);

export default apiClient;
