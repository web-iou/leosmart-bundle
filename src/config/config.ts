// env.js
export const VITE_API_BASE_URL = 'http://114.55.0.234';
export const VITE_IS_MICRO = true;
export const VITE_ADMIN_PROXY_PATH = 'http://114.55.0.234';
export const VITE_GEN_PROXY_PATH = 'http://114.55.0.234';
export const VITE_API_URL = '/api';
export const VITE_VERIFY_ENABLE = true;
// export const VITE_OAUTH2_PASSWORD_CLIENT = 'tsc:tsc';
export const VITE_OAUTH2_MOBILE_CLIENT = 'app:app';
export const VITE_PWD_ENC_KEY = 'thanks,tsc2cloud';
export const VITE_CLIENT_RSC = 'opt';

// 应用设置
export const APP_SETTINGS = {
  // 应用版本
  version: '1.0.0',
  
  // 本地存储键
  storage: {
    token: 'auth_token',
    refreshToken: 'refresh_token',
    user: 'user_info',
    language: 'language',
    theme: 'theme',
  },
  
  // 请求超时时间（毫秒）
  requestTimeout: 10000,
  
  // 默认语言
  defaultLanguage: 'zh-CN',
  
  // 支持的语言
  supportedLanguages: [
    { label: '中文', value: 'zh-CN' },
    { label: 'English', value: 'en-US' },
    { label: 'Deutsch', value: 'de-DE' },
  ],
  
  // 默认主题
  defaultTheme: 'light',
  
  // 支持的主题
  supportedThemes: ['light', 'dark'],
};

export default APP_SETTINGS;
