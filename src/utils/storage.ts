import { MMKV } from 'react-native-mmkv';
import { APP_SETTINGS } from '../config/config';

// 默认值
const DEFAULT_VALUES = {
  language: APP_SETTINGS.defaultLanguage,
  theme: 'system',
};

// 内存缓存，用于在MMKV初始化前使用
const memoryCache: Record<string, any> = {
  ...DEFAULT_VALUES
};

// 存储状态
let isReady = false;
let mmkvInstance: MMKV | null = null;
let initPromise: Promise<boolean> | null = null;
let initResolve: ((value: boolean) => void) | null = null;

// 创建Promise以等待初始化完成
initPromise = new Promise((resolve) => {
  initResolve = resolve;
});

// 初始化MMKV实例
const initializeStorage = () => {
  try {
    console.log('正在初始化MMKV...');
    
    // 创建MMKV实例
    mmkvInstance = new MMKV({
      id: 'leosmart-storage',
    });
    
    // 标记为已准备好
    isReady = true;
    console.log('MMKV初始化成功!');
    
    // 解析Promise
    if (initResolve) {
      initResolve(true);
    }
    
    return true;
  } catch (error) {
    console.error('MMKV初始化失败:', error);
    
    // 即使失败也解析Promise（但为false）
    if (initResolve) {
      initResolve(false);
    }
    
    return false;
  }
};

// 尝试初始化
setTimeout(initializeStorage, 0);

// 存储访问对象
export const storage = {
  // 等待存储准备好
  waitForReady: async (): Promise<boolean> => {
    if (isReady) return true;
    return initPromise || Promise.resolve(false);
  },
  
  // 检查存储是否已准备好
  isReady: (): boolean => {
    return isReady && mmkvInstance !== null;
  },
  
  // 获取字符串
  getString: (key: string, defaultValue: string = ''): string => {
    if (!isReady || !mmkvInstance) {
      // 从内存缓存中获取
      return (memoryCache[key] as string) || defaultValue;
    }
    
    try {
      return mmkvInstance.getString(key) || defaultValue;
    } catch (error) {
      console.error(`获取键${key}出错:`, error);
      return defaultValue;
    }
  },
  
  // 异步获取字符串
  getStringAsync: async (key: string, defaultValue: string = ''): Promise<string> => {
    await storage.waitForReady();
    return storage.getString(key, defaultValue);
  },
  
  // 设置值
  set: (key: string, value: string | number | boolean): boolean => {
    // 无论如何都存入内存缓存
    memoryCache[key] = value;
    
    if (!isReady || !mmkvInstance) {
      return false;
    }
    
    try {
      mmkvInstance.set(key, value);
      return true;
    } catch (error) {
      console.error(`设置键${key}出错:`, error);
      return false;
    }
  },
  
  // 异步设置值
  setAsync: async (key: string, value: string | number | boolean): Promise<boolean> => {
    memoryCache[key] = value;
    await storage.waitForReady();
    return storage.set(key, value);
  },
  
  // 删除键
  delete: (key: string): boolean => {
    // 删除内存缓存
    delete memoryCache[key];
    
    if (!isReady || !mmkvInstance) {
      return false;
    }
    
    try {
      mmkvInstance.delete(key);
      return true;
    } catch (error) {
      console.error(`删除键${key}出错:`, error);
      return false;
    }
  },
  
  // 异步删除键
  deleteAsync: async (key: string): Promise<boolean> => {
    delete memoryCache[key];
    await storage.waitForReady();
    return storage.delete(key);
  },
  
  // 获取原始实例
  getInstance: (): MMKV | null => {
    return mmkvInstance;
  }
};

export default storage; 