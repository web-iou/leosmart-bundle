import userApi from './userApi';

// 统一导出所有 API 服务
export { userApi };

// 默认导出所有 API 服务的集合
const api = {
  user: userApi,
  // 后续可以添加更多 API 服务
};

export default api; 