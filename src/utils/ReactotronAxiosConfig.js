/**
 * Reactotron Axios Configuration
 * 配置Axios请求拦截器，使Reactotron能够监控网络请求
 */

import axios from 'axios';

// 安全地获取Reactotron实例
const getReactotron = () => {
  if (typeof console !== 'undefined' && console.tron) {
    return console.tron;
  }
  return null;
};

// 仅在开发环境中配置
if (typeof __DEV__ !== 'undefined' && __DEV__) {
  try {
    // 创建axios响应拦截器
    axios.interceptors.response.use(
      (response) => {
        // 请求成功，记录到Reactotron
        try {
          const reactotron = getReactotron();
          if (reactotron && reactotron.display) {
            reactotron.display({
              name: 'API RESPONSE',
              preview: `${response.config.method.toUpperCase()} ${response.status} ${response.config.url}`,
              value: {
                url: response.config.url,
                method: response.config.method.toUpperCase(),
                status: response.status,
                data: response.data,
                duration: response.headers['x-response-time'] || 'unknown',
                headers: response.headers,
              },
              important: response.status >= 400
            });
          }
        } catch (e) {
          console.log('Failed to log response to Reactotron:', e);
        }
        return response;
      },
      (error) => {
        // 请求失败，记录错误到Reactotron
        try {
          const reactotron = getReactotron();
          if (reactotron && reactotron.display) {
            reactotron.display({
              name: 'API ERROR',
              preview: error.message || 'API Error',
              value: {
                error: error.message,
                url: error.config?.url,
                method: error.config?.method?.toUpperCase(),
                status: error.response?.status,
                data: error.response?.data,
              },
              important: true
            });
          }
        } catch (e) {
          console.log('Failed to log error to Reactotron:', e);
        }
        return Promise.reject(error);
      }
    );

    // 创建axios请求拦截器
    axios.interceptors.request.use(
      (config) => {
        // 请求发送，记录到Reactotron
        try {
          const reactotron = getReactotron();
          if (reactotron && reactotron.display) {
            reactotron.display({
              name: 'API REQUEST',
              preview: `${config.method.toUpperCase()} ${config.url}`,
              value: {
                url: config.url,
                method: config.method.toUpperCase(),
                data: config.data,
                headers: config.headers,
              }
            });
          }
        } catch (e) {
          console.log('Failed to log request to Reactotron:', e);
        }
        return config;
      },
      (error) => {
        // 请求配置错误，记录到Reactotron
        try {
          const reactotron = getReactotron();
          if (reactotron && reactotron.display) {
            reactotron.display({
              name: 'REQUEST CONFIG ERROR',
              preview: error.message || 'Request Config Error',
              value: {
                error: error.message
              },
              important: true
            });
          }
        } catch (e) {
          console.log('Failed to log request error to Reactotron:', e);
        }
        return Promise.reject(error);
      }
    );

    console.log('🚀 Reactotron Axios interceptors configured');
  } catch (error) {
    console.warn('⚠️ Error setting up Reactotron Axios interceptors:', error);
  }
} else {
  console.log('⚠️ Reactotron Axios interceptors not configured - dev mode only');
} 