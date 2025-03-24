import http, { ApiResponse } from '../http';
import { APP_SETTINGS } from '../../config/config';

// 语言项接口
export interface LanguageItem {
  label: string;
  value: string;
}

// 国际化API服务
class I18nApi {
  // 获取支持的语言列表
  public getSupportedLanguages(): Promise<ApiResponse<LanguageItem[]>> {
    return http.get('/admin/dict/type/language');
  }

  // 获取特定语言的翻译资源
  public getTranslation(lang: string): Promise<ApiResponse<any>> {
    return http.get(`/admin/trm/web/${lang}`);
  }

  // 获取所有语言的翻译资源 (新接口)
  public getAllTranslations(): Promise<ApiResponse<Record<string, any>>> {
    return http.get('/admin/trm/general');
  }

  // 获取默认语言列表（当API请求失败时使用）
  public getDefaultLanguages(): LanguageItem[] {
    return APP_SETTINGS.supportedLanguages;
  }
}

// 创建并导出实例
export const i18nApi = new I18nApi();
export default i18nApi; 