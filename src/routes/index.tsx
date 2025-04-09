import React, {useEffect, useLayoutEffect, useState} from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {
  NativeStackScreenProps,
  createNativeStackNavigator,
} from '@react-navigation/native-stack';
import {
  View,
  ActivityIndicator,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import {storage} from '@/utils/storage';
import {useTheme} from 'react-native-paper';
import {ExtendedMD3Theme} from '@/theme';
import {navigationRef} from '@/navigation';
import AntDesign from 'react-native-vector-icons/AntDesign';

// 页面组件
import LoginScreen from '../pages/Login';
// MainScreen已移除，不再需要
import OwnerMainScreen from '../pages/OwnerMain';
import InstallerMainScreen from '../pages/InstallerMain';
import WebViewPage from '../pages/common/WebView';
import ResetPasswordScreen from '../pages/common/ResetPassword';
import RegisterScreen from '../pages/Register';
import {useTranslation} from 'react-i18next';
import ThemeSettingsScreen from '../pages/common/ThemeSettings';
import SiteSettingsScreen from '../pages/common/SiteSettings';
import UserProfileScreen from '@/pages/common/UserProfile';
import ChangeEmailScreen from '@/pages/common/ChangeEmail';
import {useNativePopover} from '@/hooks/usePopover';
import PowerSettingsScreen from '@/pages/OwnerMain/Device/PowerSettings';
import {useDispatch} from 'react-redux';
import {AppDispatch} from '@/store';
import {initializeI18n} from '@/i18n';
import {
  initializeLanguage,
  fetchSupportedLanguages,
  fetchAllTranslationsAsync,
} from '@/store/slices/languageSlice';
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
  PVChart: {
    id: string | number;
  };
  EquipTimeChart: {
    id: string | number;
  };
  DeviceControl: {
    deviceId: number;
    deviceSn: string;
    deviceName?: string;
  };
  DeviceManage: {
    setIndex: (index: number) => void;
  };
  LanguageSettings: undefined;
  CountryPicker: {
    onSelectCountry: (value: any) => void;
  };
  ThemeSettings: undefined;
  SiteSettings: undefined;
  UserProfile: undefined;
  PowerSettings: {
    deviceSn: string;
  };
  [key: string]: any;
};
declare global {
  namespace ReactNavigation {
    type Navigation<T extends keyof RootStackParamList = ''> =
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
  const theme = useTheme() as ExtendedMD3Theme;
  const {t} = useTranslation();
  const dispatch = useDispatch<AppDispatch>();
  // 登录状态
  const [loading, setLoading] = useState<boolean>(false);
  const [userType, setUserType] = useState<number | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showPopover, anchorRef] = useNativePopover();
  // Initialize i18n
  useLayoutEffect(() => {
    setLoading(true);
    const init = () => {
      try {
        // 初始化国际化
        // 获取支持的语言列表
        dispatch(fetchSupportedLanguages())
          .unwrap()
          .then(async lngs => {
            await initializeI18n(lngs);
            checkLoginStatus();
            // dispatch(initializeLanguage() as any);
            dispatch(fetchAllTranslationsAsync() as any);
          })
          .finally(() => {
            setLoading(false);
          });

        // 获取所有翻译
      } catch (error) {
        console.error('Failed to initialize i18n:', error);
      }
    };

    init();
  }, []);
  // 检查登录状态
  const checkLoginStatus = () => {
    const authToken = storage.getString('auth_token');
    const userInfoStr = storage.getString('user_info');
    if (userInfoStr) {
      const userInfo = JSON.parse(userInfoStr);
      setUserType(userInfo.userType);
    }
    setIsLoggedIn(!!authToken);
  };

  // 获取初始路由
  const getInitialRoute = () => {
    if (!isLoggedIn) return 'Login';

    // 简化逻辑：根据用户类型决定跳转到业主或安装商页面
    return userType === USER_ROLE.OWNER ? 'OwnerMain' : 'InstallerMain';
  };

  // 如果登录状态尚未确定，显示加载指示器
  if (loading) {
    return (
      <View
        style={[
          styles.loadingContainer,
          {backgroundColor: theme.colors.background},
        ]}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  // 当导航容器准备就绪时的回调
  const onNavigationReady = () => {
    console.log('导航容器已就绪');
  };

  return (
    <NavigationContainer ref={navigationRef} onReady={onNavigationReady}>
      <Stack.Navigator
        initialRouteName={getInitialRoute()}
        screenOptions={{
          headerShown: false,
          contentStyle: {backgroundColor: theme.colors.background},
          // 为所有显示标题栏的页面提供默认样式
          headerStyle: {
            backgroundColor: theme.colors.background,
          },
          headerTintColor: theme.colors.onBackground,
          headerShadowVisible: false,
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
        <Stack.Screen
          name="DeviceManage"
          options={{
            headerShown: true,
            headerBackButtonDisplayMode: 'minimal',
            headerRight: () => {
              return (
                <TouchableOpacity
                  onPress={() => {
                    showPopover(
                      ['扫一扫', 'SN序列号'],
                      [
                        AntDesign.getImageSourceSync('scan1', 24, '#fff').uri,
                        AntDesign.getImageSourceSync('edit', 24, '#fff').uri,
                      ],
                    ).then(index => {
                      if (index === 0) {
                        navigationRef.navigate('Scan');
                      } else {
                        navigationRef.navigate({
                          name: 'SNCode',
                          params: {},
                        });
                      }
                    });
                  }}>
                  <AntDesign
                    name="plus"
                    ref={anchorRef}
                    size={24}
                    color={theme.colors.onBackground}
                  />
                </TouchableOpacity>
              );
            },
          }}
          component={require('../pages/OwnerMain/Device/DeviceManage').default}
        />
        <Stack.Screen
          name="General"
          options={{
            headerBackButtonDisplayMode: 'minimal',
            headerShown: true,
            headerTitle: t('common.general', {defaultValue: '通用'}),
          }}
          component={require('@/pages/common/General').default}
        />
        <Stack.Screen
          name="CountryPicker"
          options={{
            headerBackButtonDisplayMode: 'minimal',
            headerShown: true,
            headerTitle: t('userSetting.basicInfo.form.label.countryRegion', {
              defaultValue: '国家/地区',
            }),
          }}
          component={require('@/pages/common/CountryPicker').default}
        />
        <Stack.Screen
          name="AccountSecurity"
          options={{
            headerBackButtonDisplayMode: 'minimal',
            headerShown: true,
            headerTitle: t('userSetting.account_security', {
              defaultValue: '账户安全',
            }),
          }}
          component={require('@/pages/common/Profile/AccountSecurity').default}
        />
        <Stack.Screen
          name="ChangeEmail"
          options={{
            headerBackButtonDisplayMode: 'minimal',
            headerShown: true,
            headerTitle: t('userSetting.SecuritySettings.form.label.email', {
              defaultValue: '安全邮箱',
            }),
          }}
          component={ChangeEmailScreen}
        />
        <Stack.Screen
          name="ChangePassword"
          options={{
            headerBackButtonDisplayMode: 'minimal',
            headerShown: true,
            headerTitle: t('sys.operation.validate', {
              defaultValue: '修改密码',
            }),
          }}
          component={require('@/pages/common/Profile/ChangePassword').default}
        />
        <Stack.Screen
          name="LanguageSettings"
          options={{
            headerBackButtonDisplayMode: 'minimal',
            headerShown: true,
            headerTitle: t('user.title1'),
          }}
          component={require('@/pages/common/LanguageSettings').default}
        />
        <Stack.Screen
          name="PVChart"
          options={{
            headerShown: true,
            headerBackButtonDisplayMode: 'minimal',
          }}
          component={require('@/pages/OwnerMain/Device/PVTimeChart').default}
        />
        <Stack.Screen
          name="EquipTimeChart"
          component={require('@/pages/OwnerMain/Device/EquipTimeChart').default}
          options={{
            headerShown: true,
            headerBackButtonDisplayMode: 'minimal',
          }}
        />
        <Stack.Screen
          name="DeviceControl"
          component={require('@/pages/OwnerMain/Device/DeviceControl').default}
          options={{
            headerShown: true,
            headerBackButtonDisplayMode: 'minimal',
          }}
        />
        {/* 业主主页 */}
        <Stack.Screen
          name="OwnerMain"
          component={OwnerMainScreen}
          options={{
            gestureEnabled: false,
          }}
        />

        {/* 安装商/运营商主页 */}
        <Stack.Screen name="InstallerMain" component={InstallerMainScreen} />

        {/* 通用WebView页面 - 用于显示服务条款和隐私政策 */}
        <Stack.Screen name="WebView" component={WebViewPage} />

        {/* 重置密码页面 */}
        <Stack.Screen name="ResetPassword" component={ResetPasswordScreen} />

        {/* 注册页面 */}
        <Stack.Screen
          name="Register"
          component={RegisterScreen}
          options={{
            headerBackButtonDisplayMode: 'minimal',
            headerShown: true,
            title: t('sys.operation.register'),
          }}
        />

        <Stack.Screen
          name="ThemeSettings"
          component={ThemeSettingsScreen}
          options={{
            headerBackButtonDisplayMode: 'minimal',
            headerShown: true,
            title: t('layout.skin'),
          }}
        />

        <Stack.Screen
          name="SiteSettings"
          component={SiteSettingsScreen}
          options={{
            headerBackButtonDisplayMode: 'minimal',
            headerShown: true,
            title: t('user.site_switch'),
          }}
        />

        <Stack.Screen
          name="UserProfile"
          component={UserProfileScreen}
          options={{
            headerBackButtonDisplayMode: 'minimal',
            headerShown: true,
            title: t('user.profile'),
          }}
        />

        <Stack.Screen
          name="PowerSettings"
          component={PowerSettingsScreen}
          options={{
            headerBackButtonDisplayMode: 'minimal',
            headerShown: true,
            title: t('user.power_settings'),
          }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default AppNavigator;
