import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse, AxiosError } from 'axios';
import { VITE_API_BASE_URL, VITE_API_URL, VITE_OAUTH2_MOBILE_CLIENT } from '../config/config';
import { storage } from '../utils/storage';
import { Platform, Linking } from 'react-native';
import RNFS from 'react-native-fs';
import store from '@/store';
import { showToast } from '@/store/slices/toastSlice';
var Buffer = require('buffer/').Buffer; // 添加这行
// 定义响应数据的接口
export interface ApiResponse<T = any> {
  code: number;
  data: T;
  message: string;
  success: boolean;
}

// 定义错误响应的接口
export interface ApiErrorResponse {
  code: number;
  message: string;
  success: boolean;
  data: any;
}

// 定义请求配置的接口
export interface RequestOptions extends AxiosRequestConfig {
  skipErrorHandler?: boolean;
  skipAuth?: boolean;
  retryCount?: number;
  cancelToken?: any;
}

// HTTP实例状态
let isReady = false;
let httpInstance: Http | null = null;
let initPromise: Promise<Http> | null = null;

// 添加Reactotron日志记录工具
const log = (obj: any) => {
  if (typeof __DEV__ !== 'undefined' && __DEV__ && typeof console !== 'undefined' && (console as any).tron) {
    try {
      (console as any).tron.log(obj);
    } catch (e) {
      console.warn('Reactotron log failed:', e);
    }
  }
};

// 添加Reactotron错误记录工具
const error = (obj: any) => {
  if (typeof __DEV__ !== 'undefined' && __DEV__ && typeof console !== 'undefined' && (console as any).tron) {
    try {
      (console as any).tron.error(obj);
    } catch (e) {
      console.warn('Reactotron error log failed:', e);
    }
  }
};

// 创建 HTTP 类
class Http {
  // Axios 实例
  private instance: AxiosInstance;
  // 基础 URL
  private baseURL: string;
  // 默认请求头
  private defaultHeaders: Record<string, string>;
  // 默认超时时间: 10秒
  private timeout: number = 10000;

  constructor() {
    this.baseURL = `${VITE_API_BASE_URL}${VITE_API_URL}`;
    this.defaultHeaders = {
      'Content-Type': 'application/json',
      // 'Accept': 'application/json'
    };

    // 创建 Axios 实例
    this.instance = axios.create({
      baseURL: this.baseURL,
      timeout: this.timeout,
      headers: this.defaultHeaders,
      validateStatus(status){
        return status>=200 && status<500
      }
    });

    // 设置请求拦截器
    this.setupRequestInterceptor();
    // 设置响应拦截器
    this.setupResponseInterceptor();
  }

  // 设置请求拦截器
  private setupRequestInterceptor(): void {
    this.instance.interceptors.request.use(
      async (config) => {
        // 从请求选项中获取特殊配置
        const options = config as RequestOptions;
        
        try {
          // 如果不跳过认证，则添加 token
          if (!options.skipAuth) {
            // 使用异步方法获取token
            const token = await storage.getStringAsync('auth_token');
            if (token) {
              config.headers['Authorization'] = `Bearer ${token}`;
            } else {
              // 如果没有 token，可以添加 Basic 认证
              const basicAuth =Buffer.from(VITE_OAUTH2_MOBILE_CLIENT).toString('base64');
              config.headers['Authorization'] = `Basic ${basicAuth}`;
            }
          }
          
          // 添加设备信息、语言等
          const lang = await storage.getStringAsync('language') || 'zh-CN';
          config.headers['LNG'] = lang;
        } catch (error) {
          console.warn('Failed to get data from storage in request interceptor:', error);
          // 在存储不可用时也能使用默认值继续请求
          if (!options.skipAuth && !config.headers['Authorization']) {
            const basicAuth = Buffer.from(VITE_OAUTH2_MOBILE_CLIENT).toString('base64');
            config.headers['Authorization'] = `Basic ${basicAuth}`;
          }
          
          if (!config.headers['LNG']) {
            config.headers['LNG'] = 'en';
          }
        }
        
        // 添加设备平台信息
        config.headers['X-Platform'] = Platform.OS;
        
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );
  }

  // 设置响应拦截器
  private setupResponseInterceptor(): void {
    this.instance.interceptors.response.use(
      (response: AxiosResponse) => {
        const { data } = response;
        
        // 检查业务状态码
        if (data.code === 1) {
          // 业务处理失败
          const errorMessage = data.msg || '操作失败';
          // 显示错误提示
          if (typeof __DEV__ !== 'undefined' && __DEV__) {
            console.error('Business Error:', errorMessage);
          }
          // 使用 dispatch 触发 showToast action
          store.dispatch(showToast({
            message: errorMessage,
            type: 'error',
            duration: 3000
          }));
          return Promise.reject({
            code: 1,
            message: errorMessage,
            success: false,
            data: data.data
          } as ApiErrorResponse);
        }
        
        // 业务处理成功
        return data;
      },
      async (error: AxiosError) => {
        const options = error.config as RequestOptions;
        
        // 如果设置了跳过错误处理，则直接抛出错误
        if (options?.skipErrorHandler) {
          return Promise.reject(error);
        }

        // 处理网络错误
        if (!error.response) {
          const errorMessage = '网络错误，请检查网络连接';
          if (typeof __DEV__ !== 'undefined' && __DEV__) {
            console.error('Network Error:', error.message);
          }
          // 使用 store 的 showToast 显示错误消息
          store.dispatch(showToast({
            message: errorMessage,
            type: 'error',
            duration: 3000
          }));
          return Promise.reject({
            code: -1,
            message: errorMessage,
            success: false,
            data: null
          } as ApiErrorResponse);
        }

        // 处理 HTTP 状态码错误
        const { status } = error.response;
        const errorData = error.response.data as Record<string, any>;

        // 处理 401 未授权错误，可能需要重新登录
        if (status === 401) {
          const errorMessage = '登录已过期，请重新登录';
          if (typeof __DEV__ !== 'undefined' && __DEV__) {
            console.error('Unauthorized, please login again');
          }
          // 使用 store 的 showToast 显示错误消息
          store.dispatch(showToast({
            message: errorMessage,
            type: 'error',
            duration: 3000
          }));
          try {
            await storage.deleteAsync('auth_token');
          } catch (e) {
            console.warn('Failed to delete auth token:', e);
          }
          // 如果有全局事件总线，可以发送登出事件
          // eventBus.emit('auth:logout');
        }

        // 处理 403 禁止访问错误
        if (status === 403) {
          const errorMessage = '没有权限访问';
          if (typeof __DEV__ !== 'undefined' && __DEV__) {
            console.error('Forbidden access');
          }
          // 使用 store 的 showToast 显示错误消息
          store.dispatch(showToast({
            message: errorMessage,
            type: 'error',
            duration: 3000
          }));
        }

        // 处理 404 资源不存在错误
        if (status === 404) {
          const errorMessage = '请求的资源不存在';
          if (typeof __DEV__ !== 'undefined' && __DEV__) {
            console.error('Resource not found');
          }
          // 使用 store 的 showToast 显示错误消息
          store.dispatch(showToast({
            message: errorMessage,
            type: 'error',
            duration: 3000
          }));
        }

        // 处理 500 服务器错误
        if (status >= 500) {
          const errorMessage = '服务器错误，请稍后重试';
          if (typeof __DEV__ !== 'undefined' && __DEV__) {
            console.error('Server error');
          }
          // 使用 store 的 showToast 显示错误消息
          store.dispatch(showToast({
            message: errorMessage,
            type: 'error',
            duration: 3000
          }));
        }

        // 返回格式化后的错误对象
        const errorMessage = errorData?.message || '请求失败';
        // 使用 store 的 showToast 显示错误消息
        store.dispatch(showToast({
          message: errorMessage,
          type: 'error',
          duration: 3000
        }));
        return Promise.reject({
          code: status,
          message: errorMessage,
          success: false,
          data: errorData
        } as ApiErrorResponse);
      }
    );
  }

  // GET 请求
  public get<T = any>(url: string, params?: any, options?: RequestOptions): Promise<ApiResponse<T>> {
    const cancelToken = options?.cancelToken;
    return this.instance.get(url, { params, ...options, cancelToken });
  }

  // POST 请求
  public post<T = any>(url: string, data?: any, options?: RequestOptions): Promise<ApiResponse<T>> {
    return this.instance.post(url, data, options);
  }

  // PUT 请求
  public put<T = any>(url: string, data?: any, options?: RequestOptions): Promise<ApiResponse<T>> {
    return this.instance.put(url, data, options);
  }

  // DELETE 请求
  public delete<T = any>(url: string, options?: RequestOptions): Promise<ApiResponse<T>> {
    return this.instance.delete(url, options);
  }

  // PATCH 请求
  public patch<T = any>(url: string, data?: any, options?: RequestOptions): Promise<ApiResponse<T>> {
    return this.instance.patch(url, data, options);
  }

  // 上传文件
  public upload<T = any>(url: string, filePath: string, fileName: string, options?: RequestOptions): Promise<ApiResponse<T>> {
    const formData = new FormData();
    
    // 创建文件对象
    const fileObj = {
      uri: filePath,
      name: fileName,
      type: this.getMimeType(fileName)
    };
    
    formData.append('file', fileObj as any);
    
    const uploadOptions: RequestOptions = {
      ...options,
      headers: {
        'Content-Type': 'multipart/form-data',
        ...options?.headers
      }
    };
    
    return this.post<T>(url, formData, uploadOptions);
  }

  // 下载文件 - 适配 React Native
  public async download(url: string, filePath: string, params?: any): Promise<string> {
    const queryString = params ? 
      '?' + Object.keys(params)
              .map(key => `${encodeURIComponent(key)}=${encodeURIComponent(params[key])}`)
              .join('&') : '';
    
    let token = '';
    try {
      token = await storage.getStringAsync('auth_token');
    } catch (error) {
      console.warn('Failed to get auth token for download:', error);
    }
    
    const headers: Record<string, string> = {};
    
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    
    const downloadUrl = this.baseURL + url + queryString;
    
    try {
      // 使用 React Native FS 下载文件
      const result = await RNFS.downloadFile({
        fromUrl: downloadUrl,
        toFile: filePath,
        headers: headers,
      }).promise;
      
      if (result.statusCode === 200) {
        return filePath;
      } else {
        throw new Error(`Download failed with status code ${result.statusCode}`);
      }
    } catch (error) {
      console.error('Download error:', error);
      throw error;
    }
  }

  // 打开外部链接
  public openUrl(url: string): void {
    Linking.openURL(url).catch(err => 
      console.error('An error occurred while opening the URL:', err)
    );
  }

  // 获取 MIME 类型
  private getMimeType(fileName: string): string {
    const ext = fileName.split('.').pop()?.toLowerCase() || '';
    const mimeTypes: Record<string, string> = {
      'jpg': 'image/jpeg',
      'jpeg': 'image/jpeg',
      'png': 'image/png',
      'gif': 'image/gif',
      'pdf': 'application/pdf',
      'doc': 'application/msword',
      'docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'xls': 'application/vnd.ms-excel',
      'xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'zip': 'application/zip',
      'mp3': 'audio/mpeg',
      'mp4': 'video/mp4',
    };
    
    return mimeTypes[ext] || 'application/octet-stream';
  }
}

// 初始化并获取HTTP实例
export const initHttp = async (): Promise<Http> => {
  if (isReady && httpInstance) {
    return httpInstance;
  }
  
  if (initPromise) {
    return initPromise;
  }
  
  initPromise = new Promise<Http>(async (resolve) => {
    try {
      // 确保存储系统已初始化
      await storage.waitForReady();
      console.log('Storage ready for HTTP client initialization');
    } catch (error) {
      console.warn('Storage initialization issue, continuing with HTTP client:', error);
    }
    
    // 创建HTTP实例
    httpInstance = new Http();
    isReady = true;
    resolve(httpInstance);
  });
  
  return initPromise;
};

// 导出HTTP实例访问器(异步)
export const http = {
  async get<T = any>(url: string, params?: any, options?: RequestOptions): Promise<ApiResponse<T>> {
    const client = await initHttp();
    return client.get<T>(url, params, options);
  },
  
  async post<T = any>(url: string, data?: any, options?: RequestOptions): Promise<ApiResponse<T>> {
    const client = await initHttp();
    return client.post<T>(url, data, options);
  },
  
  async put<T = any>(url: string, data?: any, options?: RequestOptions): Promise<ApiResponse<T>> {
    const client = await initHttp();
    return client.put<T>(url, data, options);
  },
  
  async delete<T = any>(url: string, options?: RequestOptions): Promise<ApiResponse<T>> {
    const client = await initHttp();
    return client.delete<T>(url, options);
  },
  
  async patch<T = any>(url: string, data?: any, options?: RequestOptions): Promise<ApiResponse<T>> {
    const client = await initHttp();
    return client.patch<T>(url, data, options);
  },
  
  async upload<T = any>(url: string, filePath: string, fileName: string, options?: RequestOptions): Promise<ApiResponse<T>> {
    const client = await initHttp();
    return client.upload<T>(url, filePath, fileName, options);
  },
  
  async download(url: string, filePath: string, params?: any): Promise<string> {
    const client = await initHttp();
    return client.download(url, filePath, params);
  },
  
  openUrl(url: string): void {
    if (httpInstance) {
      httpInstance.openUrl(url);
    } else {
      Linking.openURL(url).catch(err => 
        console.error('An error occurred while opening the URL:', err)
      );
    }
  }
};

export default http; 