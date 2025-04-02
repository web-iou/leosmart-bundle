import http, {ApiResponse} from '../http';
import {encrypt} from '@/utils/crypto';
import {VITE_PWD_ENC_KEY} from '@/config/config';
// 用户信息接口
export interface UserInfo {
  id: string;
  username: string;
  nickname?: string;
  avatar?: string;
  email?: string;
  phone?: string;
  roles?: string[];
  permissions?: string[];
  status: number;
  createdAt: string;
  updatedAt: string;
}

// 登录请求参数接口
export interface LoginParams {
  username: string;
  password: string;
  captcha?: string;
  captchaId?: string;
  rememberMe?: boolean;
}

// 登录响应接口
export interface LoginResult {
  sub: string;
  clientId: string;
  iss: string;
  token_type: string;
  access_token: string;
  refresh_token: string;
  license: string;
  nbf: string;
  user_id: string;
  exp: string;
  expires_in: number;
  iat: string;
  jti: string;
  username: string;
  use_info: {
    password: string | null;
    username: string;
    authorities: any;
    accountNonExpired: boolean;
    accountNonLocked: boolean;
    credentialsNonExpired: boolean;
    enabled: boolean;
    attributes: any;
    id: string;
    deptId: string | null;
    phone: string | null;
    email: string;
    userType: number;
    name: string;
  };
}

// 注册请求参数接口
export interface RegisterParams {
  county?: string; // 注册国家/地区
  timeZone?: string; // 注册时区
  lng?: string; // 注册语言
  center?: string; // 数据中心
  userType: number; // 用户类型；业主:1;安装商:2
  code: string; // 邮箱验证码
  email: string; // 邮箱
  phone?: string; // 手机号码
  username?: string; // 用户账号
  password: string; // 密码
  companyName?: string; // 公司名称
  parentCompanyName?: string; // 上级公司名称，不用传入
  parentCode?: string; // 安装商或上级公司Code
}

// 修改密码请求参数接口
export interface ChangePasswordParams {
  newpassword1: string;
  password: string;
}

// 重置密码请求参数接口
export interface ResetPasswordParams {
  email: string;
  code: string;
  password: string;
}

// 添加修改邮箱的参数接口
export interface ChangeEmailParams {
  code: string;
  email: string;
}

// 用户 API 类
class UserApi {
  // 命名空间
  private namespace = '/user';

  // 登录
  public login(params: LoginParams): Promise<ApiResponse<LoginResult>> {
    return http.post(
      `/auth/oauth2/token`,
      {
        username: params.username,
        password: encrypt(params.password, VITE_PWD_ENC_KEY),
        grant_type: 'password',
        scope: 'server',
      },
      {
        headers: {
          skipAuth: true,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      },
    );
  }

  // 发送重置密码验证码
  public sendResetPasswordCode(email: string): Promise<ApiResponse<boolean>> {
    return http.post(`/admin/email/vld/${email}`);
  }

  // 重置密码
  public resetPassword(
    params: ResetPasswordParams,
  ): Promise<ApiResponse<boolean>> {
    return http.put(`/admin/register/email/change`, params);
  }

  // 发送注册验证码
  public sendRegisterCode(email: string): Promise<ApiResponse<boolean>> {
    return http.post(`/admin/email/reg/${email}`);
  }

  // 注册用户
  public register(params: RegisterParams): Promise<ApiResponse<boolean>> {
    return http.post(`/admin/register/mail`, params);
  }
  // 修改密码
  public changePassword(
    params: ChangePasswordParams,
  ): Promise<ApiResponse<UserInfo>> {
    return http.post(`/admin/user/password`, params);
  }
  // 获取国家及时区
  public getCountry(): Promise<
    ApiResponse<
      {
        code: string;
        value: string;
        zoneList: [
          {
            code: string;
            value: string;
          },
        ];
      }[]
    >
  > {
    return http.get(`/admin/register/country/zone`);
  }

  // 添加修改邮箱的方法
  public changeEmail(params: ChangeEmailParams): Promise<ApiResponse<boolean>> {
    return http.put('/admin/user/app/mail', params);
  }
}

// 创建并导出 UserApi 实例
export const userApi = new UserApi();
export default userApi;
