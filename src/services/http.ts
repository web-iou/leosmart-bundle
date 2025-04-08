import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse, AxiosError } from 'axios';
import { VITE_API_BASE_URL, VITE_API_URL, VITE_OAUTH2_MOBILE_CLIENT } from '../config/config';
import { storage } from '../utils/storage';
import { Platform, Linking, Alert } from 'react-native';
import RNFS from 'react-native-fs';
import store from '@/store';
import { showToast } from '@/store/slices/toastSlice';
import { navigateToLogin, isNavigationReady } from '@/navigation';

var Buffer = require('buffer/').Buffer;

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
  private isRefreshing: boolean = false;
  private refreshSubscribers: ((token: string) => void)[] = [];

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
      validateStatus: (status) => {
        // 只接受 2xx 的状态码，其他状态码都会进入错误处理
        return status >= 200 && status < 300;
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
        
        // 添加调试日志
        if (__DEV__) {
          console.log(`请求: ${config.method?.toUpperCase()} ${config.url}`);
          console.log('请求选项:', { 
            skipAuth: options.skipAuth, 
            skipErrorHandler: options.skipErrorHandler 
          });
        }
        
        try {
          // 如果不跳过认证，则添加 token
          if (!options.skipAuth) {
            // 使用异步方法获取token
            const token = await storage.getStringAsync('auth_token');
            if (token) {
              config.headers['Authorization'] = `Bearer ${token}`;
              if (__DEV__) console.log('添加Bearer认证头');
            } else {
              // 如果没有 token，可以添加 Basic 认证
              const basicAuth =Buffer.from(VITE_OAUTH2_MOBILE_CLIENT).toString('base64');
              config.headers['Authorization'] = `Basic ${basicAuth}`;
              if (__DEV__) console.log('添加Basic认证头');
            }
          } else {
            if (__DEV__) console.log('跳过认证，不添加Authorization头');
            // 如果明确设置了Authorization头，保留它
            if (config.headers['Authorization']) {
              if (__DEV__) console.log('使用已设置的Authorization头:', config.headers['Authorization']);
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

  // 添加刷新 token 的方法
  private async refreshToken(): Promise<boolean> {
    try {
      console.log('开始尝试刷新token...');
      const refreshToken = await storage.getStringAsync('refresh_token');
      if (!refreshToken) {
        console.log('没有找到refresh_token，无法刷新');
        return false;
      }

      console.log('找到refresh_token，准备发送刷新请求');
      // 先删除旧的auth_token
      await storage.deleteAsync('auth_token');
      
      // 直接使用axios而不是this.post，避免循环调用
      const refreshTokenUrl = `${VITE_API_BASE_URL}${VITE_API_URL}/auth/oauth2/token`;
      console.log('刷新token请求URL:', refreshTokenUrl);
      
      // 创建基本认证头
      const basicAuth = Buffer.from(VITE_OAUTH2_MOBILE_CLIENT).toString('base64');
      const authHeader = `Basic ${basicAuth}`;
      
      // 准备请求数据
      const requestData = {
        grant_type: 'refresh_token',
        refresh_token: refreshToken,
      };
      const lang = (await storage.getStringAsync('language')) || 'zh-CN';

      // 使用axios直接发出请求
      const response = await axios.post(refreshTokenUrl, requestData, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          Authorization: authHeader,
          Lng: lang,
        },
      });

      console.log('刷新token响应:', response.data);
      const responseData = response.data;
      
      if (responseData && responseData.access_token) {
        console.log('刷新token成功，保存新token');
        // 保存新的 token
        await storage.set('auth_token', responseData.access_token);
        await storage.set('refresh_token', responseData.refresh_token);
        
        // 通知所有等待的请求
        this.refreshSubscribers.forEach(callback => callback(responseData.access_token));
        this.refreshSubscribers = [];
        
        return true;
      } else {
        console.log('刷新token响应中没有access_token');
        return false;
      }
    } catch (error) {
      console.error('刷新token失败:', error);
      return false;
    }
  }

  // 添加导航到登录页面的方法
  private async navigateToLogin() {
    try {
      console.log('处理登录过期情况');
      
      // 清除认证相关的存储
      console.log('清除认证数据...');
      await storage.deleteAsync('auth_token');
      await storage.deleteAsync('refresh_token');
      await storage.deleteAsync('user_info');
      console.log('认证数据已清除');
      
      // 尝试使用导航API导航到登录页面
      console.log('尝试导航到登录页面...');
      
      // 先尝试直接使用导航API
      if (isNavigationReady()) {
        console.log('导航API已就绪，执行导航');
        navigateToLogin();
        return;
      }
      
      // 如果导航API未就绪，等待一段时间并重试
      console.log('导航API未就绪，将等待并重试...');
      let attempts = 0;
      const maxAttempts = 5;

      // 创建一个轮询函数来等待导航就绪
      const waitForNavigation = () => {
        return new Promise<void>((resolve, reject) => {
          const checkNav = () => {
            attempts++;
            console.log(`检查导航状态 (尝试 ${attempts}/${maxAttempts})...`);
            
            if (isNavigationReady()) {
              console.log('导航API已就绪');
              navigateToLogin();
              resolve();
            } else if (attempts >= maxAttempts) {
              console.log('达到最大尝试次数，显示警告');
              // 显示Alert告知用户手动退出并重新登录
              Alert.alert(
                '登录已过期',
                '您的登录信息已过期，请退出应用并重新登录',
                [{ text: '确定', onPress: () => console.log('用户确认了登录过期提示') }],
                { cancelable: false }
              );
              reject(new Error('导航API未能就绪'));
            } else {
              console.log('导航API仍未就绪，500ms后重试');
              setTimeout(checkNav, 500);
            }
          };
          
          checkNav();
        });
      };
      
      await waitForNavigation();
    } catch (e) {
      console.error('处理登录过期过程中出错:', e);
      // 如果导航失败，显示Alert
      Alert.alert(
        '登录已过期',
        '您的登录信息已过期，请退出应用并重新登录',
        [{ text: '确定', onPress: () => console.log('用户确认了登录过期提示') }],
        { cancelable: false }
      );
    }
  }

  // 添加订阅刷新 token 的方法
  private subscribeTokenRefresh(callback: (token: string) => void) {
    this.refreshSubscribers.push(callback);
  }

  // 设置响应拦截器
  private setupResponseInterceptor(): void {
    this.instance.interceptors.response.use(
      (response: AxiosResponse) => {
        const { data } = response;

        // 检查业务状态码
        if (data.code === 1) {
          const errorMessage = data.msg || '操作失败';
          if (typeof __DEV__ !== 'undefined' && __DEV__) {
            console.error('Business Error:', errorMessage);
          }
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
        
        return data;
      },
      async (error: AxiosError) => {
        const options = error.config as RequestOptions;
        const originalRequest = error.config;

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

        // 处理 401 未授权错误和 424 依赖失败错误
        if (status === 401 || status === 424) {
          // 检查是否是登录接口，如果是则直接返回错误
          if (originalRequest?.url?.includes('/auth/oauth2/token')) {
            return Promise.reject(error);
          }
          
          console.log(`收到${status}错误，准备处理token刷新...`);
          
          // 如果正在刷新 token，等待刷新完成
          if (this.isRefreshing) {
            console.log('正在刷新token中，将当前请求加入等待队列');
            return new Promise((resolve, reject) => {
              this.subscribeTokenRefresh((token: string) => {
                console.log('收到刷新后的token，重试请求');
                if (originalRequest) {
                  originalRequest.headers['Authorization'] = `Bearer ${token}`;
                  resolve(this.instance(originalRequest));
                } else {
                  reject(error);
                }
              });
            });
          }

          console.log('开始刷新token流程');
          this.isRefreshing = true;

          try {
            // 尝试刷新 token
            console.log('调用refreshToken方法');
            const refreshSuccess = await this.refreshToken();
            console.log('refreshToken结果:', refreshSuccess);
            
            if (refreshSuccess) {
              console.log('刷新token成功，重试原始请求');
              // 刷新成功，重试原始请求
              if (originalRequest) {
                const token = await storage.getStringAsync('auth_token');
                originalRequest.headers['Authorization'] = `Bearer ${token}`;
                return this.instance(originalRequest);
              }
            } else {
              // 刷新失败，调用navigateToLogin显示登录过期提示
              console.log('刷新token失败，导航到登录页面');
              try {
                await this.navigateToLogin();
                console.log('导航到登录页面成功');
              } catch (navError) {
                console.error('导航到登录页面失败:', navError);
              }
              
              // 无论导航是否成功，都返回统一的错误
              return Promise.reject({
                code: status,
                message: '登录已过期，请重新登录',
                success: false,
                data: null
              } as ApiErrorResponse);
            }
          } catch (refreshError) {
            console.error('刷新token过程中发生错误:', refreshError);
            // 刷新失败，调用navigateToLogin显示登录过期提示
            console.log('刷新token失败，导航到登录页面');
            try {
              await this.navigateToLogin();
              console.log('导航到登录页面成功');
            } catch (navError) {
              console.error('导航到登录页面失败:', navError);
            }
            
            // 无论导航是否成功，都返回统一的错误
            return Promise.reject({
              code: status,
              message: '登录已过期，请重新登录',
              success: false,
              data: null
            } as ApiErrorResponse);
          } finally {
            console.log('token刷新流程结束，重置isRefreshing标志');
            this.isRefreshing = false;
          }
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