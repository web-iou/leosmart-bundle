# API 服务说明文档

本项目使用 Axios 进行 HTTP 请求封装，提供了统一的 API 请求服务。

## 目录结构

```
services/
  ├── config.ts        # API 配置文件
  ├── http.ts          # HTTP 请求封装
  ├── README.md        # 本文档
  └── api/
      ├── index.ts     # API 服务统一导出
      ├── userApi.ts   # 用户相关 API
      └── ...          # 其他业务模块 API
```

## 使用方法

### 1. 导入 API 服务

```typescript
// 方法一：导入所有 API 服务
import api from '@/services/api';

// 使用示例
api.user.login(params).then(response => {
  console.log(response.data);
});

// 方法二：导入特定 API 服务
import { userApi } from '@/services/api';

// 使用示例
userApi.login(params).then(response => {
  console.log(response.data);
});
```

### 2. 请求响应格式

所有 API 响应都会统一为以下格式：

```typescript
interface ApiResponse<T> {
  code: number;         // 响应码，200 表示成功
  message: string;      // 响应消息
  data: T;              // 响应数据
  success: boolean;     // 是否成功
  timestamp: number;    // 时间戳
}
```

### 3. 错误处理

HTTP 请求封装已处理常见错误，如网络错误、超时、服务器错误等。您也可以在业务代码中进行额外处理：

```typescript
userApi.login(params)
  .then(response => {
    if (response.code==0) {
      // 处理成功响应
    } else {
      // 处理业务逻辑错误
      console.error(response.message);
    }
  })
  .catch(error => {
    // 处理请求异常
    console.error('请求异常:', error);
  });
```

### 4. 文件上传

```typescript
// 上传头像示例
userApi.uploadAvatar(filePath, 'avatar.jpg')
  .then(response => {
    if (response.code==0) {
      console.log('头像上传成功:', response.data.url);
    }
  });
```

### 5. 请求取消

```typescript
import http from '@/services/http';

// 创建取消标记
const cancelToken = http.createCancelToken();

// 发起可取消的请求
userApi.getUserInfo(cancelToken)
  .then(response => {
    console.log(response.data);
  });

// 在需要时取消请求
cancelToken.cancel('用户取消操作');
```

## 扩展 API 服务

如需添加新的 API 服务，请按照以下步骤进行：

1. 在 `services/api/` 目录下创建新的 API 服务文件，如 `productApi.ts`
2. 在新文件中定义相关接口和方法
3. 在 `services/api/index.ts` 中导入并导出新的 API 服务

```typescript
// 在 services/api/index.ts 中
import userApi from './userApi';
import productApi from './productApi';

export { userApi, productApi };

const api = {
  user: userApi,
  product: productApi,
};

export default api;
``` 