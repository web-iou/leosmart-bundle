/*
 * @Author: wangjunwj wangjunwj@dinglicom.com
 * @Date: 2025-04-03 09:15:38
 * @LastEditors: cx19940809 
 * @LastEditTime: 2025-04-08 13:34:57
 * @FilePath: /leosmart/src/navigation/index.ts
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
import { type RootStackParamList } from '@/routes';
import { createNavigationContainerRef } from '@react-navigation/native';

export const navigationRef = createNavigationContainerRef<RootStackParamList>();

// 添加导航到登录页面的辅助函数
export const navigateToLogin = () => {
  if (navigationRef.isReady()) {
    // 使用reset方法确保用户无法返回到之前的页面
    navigationRef.reset({
      index: 0,
      routes: [{ name: 'Login' }],
    });
    return true;
  }
  return false;
};

// 检查导航引用是否准备就绪
export const isNavigationReady = () => {
  return navigationRef.isReady();
};