import axios, { AxiosInstance, AxiosResponse } from 'axios';
import { 
  ApiResponse, 
  PaginatedResponse, 
  User, 
  Product, 
  Category, 
  Order,
  LoginRequest,
  RegisterRequest,
  ProductRequest,
  OrderStatusRequest,
  SearchFilters
} from './types';

class ApiClient {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: process.env.NEXT_PUBLIC_API_URL,
      withCredentials: false, // Don't use cookies for JWT
      timeout: 30000, // 30 second timeout
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Request interceptor for JWT token
    this.client.interceptors.request.use((config) => {
      const token = this.getToken();
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    });

    // Response interceptor for error handling
    this.client.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          // Clear token on unauthorized
          this.clearToken();
          
          // Only redirect to login if not already on login or register page
          const currentPath = window.location.pathname;
          if (!currentPath.includes('/login') && !currentPath.includes('/register')) {
            window.location.href = '/login';
          }
        }
        return Promise.reject(error);
      }
    );
  }

  // Token management methods
  private getToken(): string | null {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('jwt_token');
    }
    return null;
  }

  private setToken(token: string): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem('jwt_token', token);
    }
  }

  private clearToken(): void {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('jwt_token');
    }
  }

  // Generic request method
  private async request<T>(config: any): Promise<ApiResponse<T>> {
    try {
      const response: AxiosResponse<ApiResponse<T>> = await this.client(config);
      console.log("response", response);
      
      return response.data;
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.message || error.message || 'An error occurred',
      };
    }
  }

  // Authentication APIs
  async login(data: LoginRequest): Promise<ApiResponse<{ user: User; token: string }>> {
    const response = await this.request<{ user: User; token: string }>({
      method: 'POST',
      url: '/auth/login',
      data,
    });
    
    // Store token on successful login
    if (response.success && response.data?.token) {
      this.setToken(response.data.token);
    }
    
    return response;
  }

  async register(data: RegisterRequest): Promise<ApiResponse<{ user: User; token: string }>> {
    const response = await this.request<{ user: User; token: string }>({
      method: 'POST',
      url: '/auth/register',
      data,
    });
    
    // Store token on successful registration
    if (response.success && response.data?.token) {
      this.setToken(response.data.token);
    }
    
    return response;
  }

  async googleAuth(token: string): Promise<ApiResponse<{ user: User; token: string }>> {
    const response = await this.request<{ user: User; token: string }>({
      method: 'POST',
      url: '/auth/google',
      data: { token },
    });
    
    // Store token on successful Google auth
    if (response.success && response.data?.token) {
      this.setToken(response.data.token);
    }
    
    return response;
  }

  async forgotPassword(email: string): Promise<ApiResponse<{ message: string }>> {
    return this.request<{ message: string }>({
      method: 'POST',
      url: '/auth/forgot-password',
      data: { email },
    });
  }

  async logout(): Promise<ApiResponse<{ message: string }>> {
    const response = await this.request<{ message: string }>({
      method: 'POST',
      url: '/auth/logout',
    });
    
    // Clear token on logout
    this.clearToken();
    
    return response;
  }

  // Product APIs
  

  async createProduct(data: ProductRequest): Promise<ApiResponse<Product>> {
    return this.request({
      method: 'POST',
      url: '/products',
      data,
    });
  }

  async updateProduct(id: string, data: Partial<ProductRequest>): Promise<ApiResponse<Product>> {
    return this.request({
      method: 'PUT',
      url: `/products/${id}`,
      data,
    });
  }

  async deleteProduct(id: string): Promise<ApiResponse<{ message: string }>> {
    return this.request({
      method: 'DELETE',
      url: `/products/${id}`,
    });
  }

  // Category APIs
  async getCategories(): Promise<ApiResponse<Category[]>> {
    try {
      console.log('Fetching categories from /categories/simple');
      const response = await this.request<Category[]>({
        method: 'GET',
        url: '/categories/simple',
      });
      
      if (response.success && response.data) {
        console.log(`Successfully fetched ${response.data.length} categories`);
        // Validate that we have proper Category objects
        const validCategories = response.data.filter(cat => 
          cat && typeof cat === 'object' && 
          typeof cat.id === 'string' && 
          typeof cat.name === 'string'
        );
        
        if (validCategories.length !== response.data.length) {
          console.warn(`Filtered out ${response.data.length - validCategories.length} invalid categories`);
        }
        
        return {
          success: true,
          data: validCategories,
          message: `Successfully fetched ${validCategories.length} categories`
        };
      }
      
      return response;
    } catch (error) {
      console.error('Error fetching categories:', error);
      return {
        success: false,
        error: 'Failed to fetch categories',
      };
    }
  }

  async createCategory(data: { name: string; description?: string }): Promise<ApiResponse<Category>> {
    return this.request({
      method: 'POST',
      url: '/categories',
      data,
    });
  }

  async updateCategory(id: string, data: { name: string; description?: string }): Promise<ApiResponse<Category>> {
    return this.request({
      method: 'PUT',
      url: `/categories/${id}`,
      data,
    });
  }

  async deleteCategory(id: string): Promise<ApiResponse<{ message: string }>> {
    return this.request({
      method: 'DELETE',
      url: `/categories/${id}`,
    });
  }

  

  // Order APIs
  async getOrders(page: number = 1, limit: number = 10): Promise<ApiResponse<PaginatedResponse<Order>>> {
    return this.request({
      method: 'GET',
      url: `/orders?page=${page}&limit=${limit}`,
    });
  }

  async createOrder(data: { items: { productId: string; quantity: number }[]; shippingAddress: any }): Promise<ApiResponse<Order>> {
    return this.request({
      method: 'POST',
      url: '/orders',
      data,
    });
  }

  async updateOrderStatus(id: string, data: OrderStatusRequest): Promise<ApiResponse<Order>> {
    return this.request({
      method: 'PUT',
      url: `/orders/${id}/status`,
      data,
    });
  }

  // User APIs (Admin only)
  async getUsers(page: number = 1, limit: number = 10): Promise<ApiResponse<PaginatedResponse<User>>> {
    return this.request({
      method: 'GET',
      url: `/users?page=${page}&limit=${limit}`,
    });
  }

  async blockUser(id: string): Promise<ApiResponse<User>> {
    return this.request({
      method: 'PUT',
      url: `/users/${id}/block`,
      data: { blocked: true },
    });
  }

  async unblockUser(id: string): Promise<ApiResponse<User>> {
    return this.request({
      method: 'PUT',
      url: `/users/${id}/block`,
      data: { blocked: false },
    });
  }

  // Get current user
  async getCurrentUser(): Promise<ApiResponse<User>> {
    return this.request({
      method: 'GET',
      url: '/auth/me',
    });
  }
}

export const apiClient = new ApiClient();
export default apiClient;