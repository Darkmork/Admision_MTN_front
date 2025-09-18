/**
 * HTTP Client Service
 * Configured for MTN Microservices Architecture
 */

import axios, { AxiosInstance, AxiosResponse, AxiosError } from 'axios';

class HttpClient {
  private axiosInstance: AxiosInstance;
  private metrics = {
    requestCount: 0,
    errorCount: 0,
    lastRequestTime: null as Date | null,
    responseTime: [] as number[]
  };

  constructor() {
    // Get base URL from environment variables (API Gateway)
    const baseURL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';
    
    this.axiosInstance = axios.create({
      baseURL,
      timeout: parseInt(import.meta.env.VITE_API_TIMEOUT) || 30000,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
    });

    this.setupInterceptors();
  }

  private setupInterceptors() {
    // Request interceptor
    this.axiosInstance.interceptors.request.use(
      (config) => {
        this.metrics.requestCount++;
        this.metrics.lastRequestTime = new Date();
        
        // Add timestamp for response time calculation
        (config as any).startTime = Date.now();
        
        // Request logging removed for security
        return config;
      },
      (error) => {
        this.metrics.errorCount++;
        // Error details removed for security
        return Promise.reject(error);
      }
    );

    // Response interceptor
    this.axiosInstance.interceptors.response.use(
      (response: AxiosResponse) => {
        const startTime = (response.config as any).startTime;
        if (startTime) {
          const responseTime = Date.now() - startTime;
          this.metrics.responseTime.push(responseTime);
          // Response logging removed for security
        }
        return response;
      },
      (error: AxiosError) => {
        this.metrics.errorCount++;
        const startTime = (error.config as any)?.startTime;
        if (startTime) {
          const responseTime = Date.now() - startTime;
          this.metrics.responseTime.push(responseTime);
          // Error logging removed for security
        }
        return Promise.reject(error);
      }
    );
  }

  // HTTP Methods
  async get<T = any>(url: string, config?: any): Promise<AxiosResponse<T>> {
    return this.axiosInstance.get(url, config);
  }

  async post<T = any>(url: string, data?: any, config?: any): Promise<AxiosResponse<T>> {
    return this.axiosInstance.post(url, data, config);
  }

  async put<T = any>(url: string, data?: any, config?: any): Promise<AxiosResponse<T>> {
    return this.axiosInstance.put(url, data, config);
  }

  async delete<T = any>(url: string, config?: any): Promise<AxiosResponse<T>> {
    return this.axiosInstance.delete(url, config);
  }

  async patch<T = any>(url: string, data?: any, config?: any): Promise<AxiosResponse<T>> {
    return this.axiosInstance.patch(url, data, config);
  }

  // Configuration methods
  setBaseURL(baseURL: string) {
    this.axiosInstance.defaults.baseURL = baseURL;
  }

  setTimeout(timeout: number) {
    this.axiosInstance.defaults.timeout = timeout;
  }

  setRetryConfig(config: { attempts?: number; delay?: number; jitter?: boolean }) {
    // Simple retry logic - could be enhanced with exponential backoff
    // Retry config logging removed for security
  }

  // Health check method
  async healthCheck(): Promise<boolean> {
    try {
      const response = await this.axiosInstance.get('/health');
      return response.status === 200;
    } catch (error) {
      // Health check error logging removed for security
      return false;
    }
  }

  // Metrics methods
  getMetrics() {
    const avgResponseTime = this.metrics.responseTime.length > 0 
      ? this.metrics.responseTime.reduce((a, b) => a + b, 0) / this.metrics.responseTime.length 
      : 0;

    return {
      requestCount: this.metrics.requestCount,
      errorCount: this.metrics.errorCount,
      successRate: this.metrics.requestCount > 0 
        ? ((this.metrics.requestCount - this.metrics.errorCount) / this.metrics.requestCount) * 100 
        : 0,
      averageResponseTime: Math.round(avgResponseTime),
      lastRequestTime: this.metrics.lastRequestTime,
    };
  }

  clearMetrics() {
    this.metrics = {
      requestCount: 0,
      errorCount: 0,
      lastRequestTime: null,
      responseTime: []
    };
  }

  // Get the underlying axios instance if needed
  getAxiosInstance(): AxiosInstance {
    return this.axiosInstance;
  }
}

// Export singleton instance
const httpClient = new HttpClient();
export default httpClient;