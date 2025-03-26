import React, {useEffect, useState} from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {
  NativeStackScreenProps,
  createNativeStackNavigator,
} from '@react-navigation/native-stack';
import {View, ActivityIndicator, StyleSheet} from 'react-native';
import {storage} from '@/utils/storage';

// 页面组件
import LoginScreen from '../pages/Login';
// MainScreen已移除，不再需要
import OwnerMainScreen from '../pages/OwnerMain';
import InstallerMainScreen from '../pages/InstallerMain';
import WebViewPage from '../pages/common/WebView';
import ResetPasswordScreen from '../pages/common/ResetPassword';
import RegisterScreen from '../pages/Register';

// 定义路由参数类型 - 只保留实际使用的路由
export type RootStackParamList = {
  Login: undefined;
  // Main: undefined; // 已移除，不再需要
  OwnerMain: undefined;
  InstallerMain: undefined;
  WebView: {
    title: string;
    url: string;
  };
  ResetPassword: undefined;
  Register: undefined;
  Scan: undefined;
  SNCode: {
    code?: string;
  };
};
declare global {
  namespace ReactNavigation {
    type Navigation<T extends keyof RootStackParamList> =
      NativeStackScreenProps<RootStackParamList, T>;
  }
}
// 创建路由栈
const Stack = createNativeStackNavigator<RootStackParamList>();

// 用户角色类型常量 - 简化为只有实际使用的角色
const USER_ROLE = {
  OWNER: 1, // 业主角色
};

// 路由配置
const AppNavigator: React.FC = () => {
  // 登录状态
  const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null);
  const [userType, setUserType] = useState<number | null>(null);

  useEffect(() => {
    checkLoginStatus();
  }, []);

  // 检查登录状态
  const checkLoginStatus = async () => {
    try {
      // 等待存储系统准备就绪
      await storage.waitForReady();

      // 检查用户是否已登录
      const authToken = await storage.getStringAsync('auth_token');

      if (!authToken) {
        setIsLoggedIn(false);
        return;
      }

      // 用户已登录，检查用户类型
      const userInfoStr = await storage.getStringAsync('user_info');
      if (!userInfoStr) {
        setIsLoggedIn(true);
        return;
      }

      try {
        const userInfo = JSON.parse(userInfoStr);
        setIsLoggedIn(true);
        setUserType(userInfo.userType);
      } catch (e) {
        console.error('Failed to parse user info:', e);
        setIsLoggedIn(false);
      }
    } catch (error) {
      console.error('Failed to check login status:', error);
      setIsLoggedIn(false);
    }
  };

  // 获取初始路由
  const getInitialRoute = () => {
    if (!isLoggedIn) return 'Login';

    // 简化逻辑：根据用户类型决定跳转到业主或安装商页面
    return userType === USER_ROLE.OWNER ? 'OwnerMain' : 'InstallerMain';
  };

  // 如果登录状态尚未确定，显示加载指示器
  if (isLoggedIn === null) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3498db" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName={getInitialRoute()}
        screenOptions={{
          headerShown: false,
          contentStyle: {backgroundColor: '#fff'},
        }}>
        {/* 登录页面 */}
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen
          name="Scan"
          component={
            require('../pages/OwnerMain/Device/components/addDevice').ScanCode
            }
          />
          <Stack.Screen
            name="SNCode"
            options={{
              headerShown: true,
              headerBackButtonDisplayMode: 'minimal',
            }}
            component={
              require('../pages/OwnerMain/Device/components/addDevice').SNCode
            }
          />
        {/* 业主主页 */}
        <Stack.Screen name="OwnerMain" component={OwnerMainScreen} />

        {/* 安装商/运营商主页 */}
        <Stack.Screen name="InstallerMain" component={InstallerMainScreen} />

        {/* 通用WebView页面 - 用于显示服务条款和隐私政策 */}
        <Stack.Screen name="WebView" component={WebViewPage} />

        {/* 重置密码页面 */}
        <Stack.Screen name="ResetPassword" component={ResetPasswordScreen} />

        {/* 注册页面 */}
        <Stack.Screen name="Register" component={RegisterScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ffffff',
  },
});

export default AppNavigator;
