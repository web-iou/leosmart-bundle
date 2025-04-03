import React, {useState, useEffect} from 'react';
import {
  View,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  Platform,
  useColorScheme,
  ActivityIndicator,
} from 'react-native';
import {
  Text,
  TextInput,
  Button,
  Portal,
  Dialog,
  RadioButton,
  Menu,
  useTheme,
} from 'react-native-paper';
import {useTranslation} from 'react-i18next';
import {userApi, LoginParams} from '@/services/api/userApi';
import {storage} from '@/utils/storage';
import {APP_SETTINGS} from '@/config/config';
import {useDispatch, useSelector} from 'react-redux';
import {setLanguageAsync} from '@/store/slices/languageSlice';
import {setTheme} from '@/store/slices/themeSlice';
import {showToast} from '@/store/slices/toastSlice';
import AntDesign from 'react-native-vector-icons/AntDesign';
import {ThemeType, ExtendedMD3Theme} from '@/theme';
import Checkbox from '@/components/Checkbox';
import Action from '@/components/Action';
import {useNavigation} from '@react-navigation/native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';

interface LoginScreenProps {
  navigation?: any;
}

interface LoginResult {
  access_token: string;
  refresh_token: string;
  user_info: {
    userType: number;
    [key: string]: any;
  };
  user_id: string;
}

const LoginScreen: React.FC<LoginScreenProps> = ({navigation}) => {
  const {t, i18n} = useTranslation();
  const dispatch = useDispatch();
  const paperTheme = useTheme() as ExtendedMD3Theme;
  const currentTheme = useSelector((state: any) => state.theme.themeType);
  const systemColorScheme = useColorScheme();
  const isDarkMode =
    currentTheme === 'dark' ||
    (currentTheme === 'system' && systemColorScheme === 'dark');

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState<string>(
    APP_SETTINGS.defaultLanguage,
  );
  const [isInitializing, setIsInitializing] = useState(true);
  const [agreeToTerms, setAgreeToTerms] = useState(false);
  const [showMore, setShowMore] = useState(false);

  const insets = useSafeAreaInsets();

  // 初始化
  useEffect(() => {
    const initialize = async () => {
      try {
        setIsInitializing(true);

        // 等待存储系统准备好
        await storage.waitForReady();

        // 获取保存的语言
        const savedLanguage = await storage.getStringAsync('language');
        if (savedLanguage) {
          setSelectedLanguage(savedLanguage);
        }

        // 加载保存的用户名和密码（如果启用了记住账号）
        const savedUsername = await storage.getStringAsync('username');
        const savedPassword = await storage.getStringAsync('password');
        if (savedUsername) {
          setUsername(savedUsername);
          if (savedPassword) {
            setPassword(savedPassword);
          }
          setRememberMe(true);
        }
      } catch (error) {
        console.error('Error during initialization:', error);
      } finally {
        setIsInitializing(false);
      }
    };

    initialize();
  }, []);

  // 获取当前主题
  useEffect(() => {
    const getTheme = async () => {
      try {
        // 等待存储系统准备好
        await storage.waitForReady();

        const storedTheme = (await storage.getStringAsync(
          'theme',
        )) as ThemeType;
        if (storedTheme) {
          dispatch(setTheme(storedTheme));
        }
      } catch (error) {
        console.error('Error getting stored theme:', error);
      }
    };
    getTheme();
  }, [dispatch]);

  // 登录处理
  const handleLogin = async () => {
    try {
      // 表单验证
      if (!username.trim()) {
        setErrorMessage(
          t('login.usernameRequired', {defaultValue: '用户名不能为空'}),
        );
        return;
      }

      if (!password.trim()) {
        setErrorMessage(
          t('login.passwordRequired', {defaultValue: '密码不能为空'}),
        );
        return;
      }

      if (!agreeToTerms) {
        setErrorMessage(
          t('login.termsRequired', {
            defaultValue: '请阅读并同意服务条款和隐私政策',
          }),
        );
        return;
      }

      setLoading(true);
      setErrorMessage('');

      // 调用登录接口
      const loginParams: LoginParams = {
        username: username.trim(),
        password: password.trim(),
      };

      const response = await userApi.login(loginParams);

      // 检查返回的数据是否有效
      if (response) {
        const loginData = response as LoginResult;

        // 保存授权信息
        await storage.setAsync('auth_token', loginData.access_token);

        if (loginData.refresh_token) {
          await storage.setAsync('refresh_token', loginData.refresh_token);
        }
        // 缓存用户信息
        if (loginData.user_info) {
          await storage.setAsync(
            'user_info',
            JSON.stringify(loginData.user_info),
          );
        }

        // 保存用户ID
        if (loginData.user_id) {
          await storage.setAsync('user_id', loginData.user_id);
        }

        // 获取并缓存用户详细信息
        try {
          const userInfoResponse = await userApi.getUserInfo();
          if (userInfoResponse.code === 0 && userInfoResponse.data) {
            await storage.setAsync('user_info', JSON.stringify(userInfoResponse.data));
          }
        } catch (error) {
          console.error('Failed to fetch user info:', error);
        }

        // 如果选择了记住账号，则同时保存用户名和密码
        if (rememberMe) {
          await storage.setAsync('username', username.trim());
          await storage.setAsync('password', password.trim());
        } else {
          await storage.delete('username');
          await storage.delete('password');
        }

        // 根据角色类型跳转到不同页面
        const userType = loginData.user_info?.userType || 1;

        if (userType === 1) {
          // 业主角色
          navigation?.replace('OwnerMain');
        } else {
          // 安装商或运营商角色
          navigation?.replace('InstallerMain');
        }
      } else {
        setErrorMessage(
          response.message ||
            t('login.failMessage', {
              defaultValue: '登录失败，请检查用户名或密码',
            }),
        );
      }
    } catch (error) {
      console.error('Login error:', error);
      setErrorMessage(
        t('common.networkError', {defaultValue: '网络请求异常，请稍后重试'}),
      );
    } finally {
      setLoading(false);
    }
  };

  // 语言切换处理
  const handleLanguageChange = async (lang: string) => {
    try {
      setLanguageDialogVisible(false);

      if (lang === selectedLanguage) return;

      setSelectedLanguage(lang);
      await dispatch(setLanguageAsync(lang) as any);
      await storage.setAsync('language', lang);

      dispatch(
        showToast({
          message: t('common.languageChangedSuccess', {
            defaultValue: '语言切换成功',
          }),
          type: 'success',
          duration: 2000,
        }),
      );
    } catch (error) {
      console.error('Failed to change language:', error);
    }
  };

  // 处理服务条款点击
  const handleTermsPress = () => {
    const url = `http://114.55.0.234/private/agreement_${i18n.language}.html`;

    navigation?.navigate('WebView', {
      title: t('login.termsOfService', {defaultValue: '服务条款'}),
      url,
    });
  };

  // 处理隐私政策点击
  const handlePrivacyPress = () => {
    const url = `http://114.55.0.234/private/privacy_${i18n.language}.html`;

    navigation?.navigate('WebView', {
      title: t('password.privacyPolicy', {defaultValue: '隐私政策'}),
      url,
    });
  };

  const moreOptions = [
    {
      id: 'site',
      title: t('user.site_switch'),
      onPress: () => {
        setShowMore(false);
        navigation.navigate('SiteSettings');
      },
    },
    {
      id: 'theme',
      title: t('layout.skin'),
      onPress: () => {
        setShowMore(false);
        navigation.navigate('ThemeSettings');
      },
    },
    {
      id: 'language',
      title: t('settings.language'),
      onPress: () => {
        setShowMore(false);
        navigation.navigate('LanguageSettings');
      },
    },
  ];

  // 渲染加载指示器
  if (isInitializing) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={paperTheme.colors.primary} />
        <Text
          style={[styles.loadingText, {color: paperTheme.colors.onBackground}]}>
          {t('login.loading', {defaultValue: '加载中...'})}
        </Text>
      </View>
    );
  }

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: isDarkMode
            ? paperTheme.colors.background
            : '#FAFAFA',
        },
      ]}>
      <StatusBar
        barStyle={isDarkMode ? 'light-content' : 'dark-content'}
        backgroundColor="transparent"
        translucent
      />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled">
        {/* 顶部按钮区域 */}
        <View style={styles.topBar}>
          <View />
          <TouchableOpacity
            style={styles.moreButton}
            onPress={() => setShowMore(true)}>
            <Text style={{opacity: 0, width: 0, height: 0}}>{''}</Text>
            <AntDesign
              name="ellipsis1"
              size={24}
              color={paperTheme.colors.onSurface}
            />
          </TouchableOpacity>
        </View>

        {/* 标题区域 */}
        <View style={styles.headerContainer}>
          <Text style={[styles.logoText, {color: paperTheme.colors.logoColor}]}>
            LEOSMART
          </Text>
          <Text
            style={[
              styles.welcomeText,
              {color: paperTheme.colors.onBackground},
            ]}>
            {t('login.title', {defaultValue: '欢迎使用智慧能源EMS系统'})}
          </Text>
        </View>

        {/* 登录表单 */}
        <View style={styles.formContainer}>
          {/* 错误消息 */}
          {errorMessage ? (
            <View style={styles.errorContainer}>
              <AntDesign
                name="exclamationcircleo"
                size={14}
                color={paperTheme.colors.error}
                style={{marginRight: 8}}
              />
              <Text
                style={[styles.errorText, {color: paperTheme.colors.error}]}>
                {errorMessage}
              </Text>
            </View>
          ) : null}

          {/* 用户名输入框 */}
          <TextInput
            style={styles.input}
            mode="outlined"
            value={username}
            onChangeText={setUsername}
            placeholder={t('table.email', {defaultValue: '邮箱/用户名'})}
            autoCapitalize="none"
            right={<TextInput.Icon icon="account" size={14} />}
            outlineStyle={{borderRadius: 24}}
          />

          {/* 密码输入框 */}
          <TextInput
            style={styles.input}
            mode="outlined"
            value={password}
            onChangeText={setPassword}
            secureTextEntry={!showPassword}
            placeholder={t('datasourceconf.password', {
              defaultValue: '请输入密码',
            })}
            right={
              <TextInput.Icon
                icon={showPassword ? 'eye' : 'eye-off'}
                size={14}
                onPress={() => setShowPassword(!showPassword)}
              />
            }
            outlineStyle={{borderRadius: 24}}
          />

          {/* 记住账号和忘记密码 */}
          <View style={styles.rememberForgotContainer}>
            <View style={styles.checkboxContainer}>
              <Checkbox
                value={rememberMe}
                onPress={() => {
                  setRememberMe(!rememberMe);
                }}></Checkbox>
              <Text
                style={{
                  color: paperTheme.colors.onSurface,
                  marginLeft: 8,
                  fontSize: 12,
                  lineHeight: 14,
                }}>
                {t('login.rememberMe', {defaultValue: '记住账号'})}
              </Text>
            </View>

            <TouchableOpacity
              onPress={() => navigation?.navigate('ResetPassword')}>
              <Text
                style={{
                  color: paperTheme.colors.forgotPasswordColor,
                  fontSize: 12,
                  lineHeight: 14,
                }}>
                {t('login.forgotPassword', {defaultValue: '忘记密码'})}
              </Text>
            </TouchableOpacity>
          </View>

          {/* 服务条款 */}
          <View className="mb-4 flex-row items-center">
            <Checkbox
              value={agreeToTerms}
              onPress={() => setAgreeToTerms(!agreeToTerms)}
            />
            <Text
              style={{
                color: paperTheme.colors.termsTextColor,
                marginLeft: 8,
                fontSize: 12,
                flex: 1,
                lineHeight: 14,
              }}>
              <Text>
                {t('password.i_have_read_it', {defaultValue: '我已阅读并同意'})}
              </Text>{' '}
              <Text
                style={{
                  color: paperTheme.colors.termsLinkColor,
                  fontWeight: '500',
                  fontSize: 12,
                  lineHeight: 14,
                }}
                onPress={handleTermsPress}>
                {t('sys.serviceAgreement', {defaultValue: '服务条款'})}
              </Text>
              <Text> </Text>
              <Text>{t('common.and', {defaultValue: '和'})}</Text>
              <Text> </Text>
              <Text
                style={{
                  color: paperTheme.colors.termsLinkColor,
                  fontWeight: '500',
                  fontSize: 12,
                  lineHeight: 14,
                }}
                onPress={handlePrivacyPress}>
                {t('password.privacyPolicy', {defaultValue: '隐私政策'})}
              </Text>
            </Text>
          </View>

          {/* 登录按钮 */}
          <TouchableOpacity
            style={[
              styles.loginButton,
              {
                backgroundColor:
                  loading || !username || !password || !agreeToTerms
                    ? paperTheme.colors.buttonPrimary + '80'
                    : paperTheme.colors.buttonPrimary,
                borderRadius: 20,
              },
            ]}
            onPress={handleLogin}
            disabled={loading || !username || !password || !agreeToTerms}>
            {loading && (
              <ActivityIndicator
                size="small"
                color={paperTheme.colors.buttonPrimaryText}
                style={{marginRight: 10}}
              />
            )}
            <Text
              style={[
                styles.loginButtonText,
                {color: paperTheme.colors.buttonPrimaryText},
              ]}>
              {loading
                ? t('common.loading', {defaultValue: '登录中...'})
                : t('login.loginButton', {defaultValue: '登录'})}
            </Text>
          </TouchableOpacity>

          {/* 其他登录选项 */}
          <View style={styles.otherLoginContainer}>
            <TouchableOpacity
              style={styles.otherLoginButton}
              onPress={() => {}}>
              <Text
                style={[
                  styles.otherLoginText,
                  {color: paperTheme.colors.primary},
                ]}>
                {t('login.guestLogin', {defaultValue: '游客登录'})}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.otherLoginButton}
              onPress={() => navigation?.navigate('Register')}>
              <Text
                style={[
                  styles.otherLoginText,
                  {color: paperTheme.colors.primary},
                ]}>
                {t('login.register', {defaultValue: '立即注册'})}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      {/* 底部弹出菜单和遮罩 */}
      {showMore && (
        <View
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            zIndex: 999,
          }}>
          <TouchableOpacity
            style={{
              width: '100%',
              height: '100%',
            }}
            activeOpacity={1}
            onPress={() => setShowMore(false)}>
            <Text style={{width: 0, height: 0}}>{''}</Text>
          </TouchableOpacity>
        </View>
      )}
      <Action
        show={showMore}
        height={280 + insets.bottom}
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          borderTopLeftRadius: 16,
          borderTopRightRadius: 16,
          padding: 20,
          paddingBottom: 32 + insets.bottom,
          backgroundColor: paperTheme.colors.surface,
          shadowColor: '#000',
          shadowOffset: {
            width: 0,
            height: -2,
          },
          shadowOpacity: 0.1,
          shadowRadius: 4,
          elevation: 5,
          zIndex: 1000,
        }}>
        <View style={[styles.optionsContainer, {paddingBottom: 8}]}>
          {moreOptions.map(option => (
            <TouchableOpacity
              key={option.id}
              style={[
                styles.optionItem,
                {
                  paddingVertical: 16,
                },
              ]}
              onPress={option.onPress}>
              <Text
                style={[
                  styles.optionText,
                  {color: paperTheme.colors.onSurface},
                ]}>
                {option.title}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* 取消按钮 */}
        <TouchableOpacity
          onPress={() => setShowMore(false)}
          style={[
            styles.cancelButton,
            {
              marginTop: 24,
            },
          ]}>
          <Text style={[styles.cancelText, {color: paperTheme.colors.primary}]}>
            {t('common.cancel', {defaultValue: '取消'})}
          </Text>
        </TouchableOpacity>
      </Action>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingBottom: 40,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingBottom: 20,
  },
  moreButton: {
    padding: 8,
  },
  headerContainer: {
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 40,
  },
  logoText: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  welcomeText: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 8,
  },
  formContainer: {
    paddingHorizontal: 24,
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(211, 47, 47, 0.1)',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  errorText: {
    flex: 1,
    fontSize: 13,
  },
  input: {
    marginBottom: 16,
    height: 48,
    backgroundColor: 'transparent',
  },
  rememberForgotContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 2,
    marginBottom: 10,
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  termsContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  loginButton: {
    height: 48,
    borderRadius: 24,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 2,
    marginTop: 24,
  },
  loginButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  otherLoginContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 24,
    paddingHorizontal: 32,
  },
  otherLoginButton: {
    paddingVertical: 8,
  },
  otherLoginText: {
    fontSize: 14,
    fontWeight: '500',
  },
  optionsContainer: {
    gap: 16,
  },
  optionItem: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
  },
  optionText: {
    fontSize: 16,
    fontWeight: '500',
    textAlign: 'center',
  },
  cancelButton: {
    paddingVertical: 16,
    alignItems: 'center',
  },
  cancelText: {
    fontSize: 16,
    fontWeight: '500',
  },
});

export default LoginScreen;
