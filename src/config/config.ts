/*
 * @Author: wangjunwj wangjunwj@dinglicom.com
 * @Date: 2025-03-31 09:04:02
 * @LastEditors: wangjunwj wangjunwj@dinglicom.com
 * @LastEditTime: 2025-04-03 13:07:10
 * @FilePath: /leosmart/src/config/config.ts
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
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
export const CDN_Url="http://114.55.0.234/api";
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
