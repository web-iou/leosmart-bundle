import React, { useState, useEffect } from 'react';
import { 
  View, 
  ScrollView, 
  TouchableOpacity, 
  StyleSheet, 
  StatusBar, 
  Platform, 
  useColorScheme, 
  ActivityIndicator 
} from 'react-native';
import { 
  Text, 
  TextInput, 
  Button, 
  Checkbox, 
  Portal, 
  Dialog, 
  RadioButton, 
  Menu, 
  useTheme 
} from 'react-native-paper';
import { useTranslation } from 'react-i18next';
import { userApi, LoginParams } from '@/services/api/userApi';
import { storage } from '@/utils/storage';
import { APP_SETTINGS } from '@/config/config';
import { useDispatch, useSelector } from 'react-redux';
import { setLanguageAsync } from '@/store/slices/languageSlice';
import { setTheme } from '@/store/slices/themeSlice';
import { showToast } from '@/store/slices/toastSlice';
import AntDesign from 'react-native-vector-icons/AntDesign';
import { ThemeType, ExtendedMD3Theme } from '@/theme';

interface LoginScreenProps {
  navigation?: any;
}

const LoginScreen: React.FC<LoginScreenProps> = ({ navigation }) => {
  const { t, i18n } = useTranslation();
  const dispatch = useDispatch();
  const paperTheme = useTheme() as ExtendedMD3Theme;
  const currentTheme = useSelector((state: any) => state.theme.themeType);
  const systemColorScheme = useColorScheme();
  const isDarkMode = currentTheme === 'dark' || (currentTheme === 'system' && systemColorScheme === 'dark');
  
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [languageDialogVisible, setLanguageDialogVisible] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState<string>(APP_SETTINGS.defaultLanguage);
  const [supportedLanguages] = useState(APP_SETTINGS.supportedLanguages);
  const [isInitializing, setIsInitializing] = useState(true);
  const [agreeToTerms, setAgreeToTerms] = useState(false);
  const [moreMenuVisible, setMoreMenuVisible] = useState(false);
  const [themeDialogVisible, setThemeDialogVisible] = useState(false);
  const [selectedTheme, setSelectedTheme] = useState<ThemeType>('light');

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
        
        const storedTheme = await storage.getStringAsync('theme') as ThemeType;
        if (storedTheme) {
          setSelectedTheme(storedTheme);
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
        setErrorMessage(t('login.usernameRequired', { defaultValue: '用户名不能为空' }));
        return;
      }
      
      if (!password.trim()) {
        setErrorMessage(t('login.passwordRequired', { defaultValue: '密码不能为空' }));
        return;
      }

      if (!agreeToTerms) {
        setErrorMessage(t('login.termsRequired', { defaultValue: '请阅读并同意服务条款和隐私政策' }));
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
      if (response && response.access_token) {
        const loginData = response;
        
        // 保存授权信息
        await storage.setAsync('auth_token', loginData.access_token);
        
        if (loginData.refresh_token) {
          await storage.setAsync('refresh_token', loginData.refresh_token);
        }

        // 缓存用户信息
        if (loginData.use_info) {
          await storage.setAsync('user_info', JSON.stringify(loginData.use_info));
        }

        // 保存用户ID
        if (loginData.user_id) {
          await storage.setAsync('user_id', loginData.user_id);
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
        const userType = loginData.use_info?.userType || 1;
        
        if (userType === 1) {
          // 业主角色
          navigation?.replace('OwnerMain');
        } else {
          // 安装商或运营商角色
          navigation?.replace('InstallerMain');
        }
      } else {
        setErrorMessage(response.message || t('login.failMessage', { defaultValue: '登录失败，请检查用户名或密码' }));
      }
    } catch (error) {
      console.error('Login error:', error);
      setErrorMessage(t('common.networkError', { defaultValue: '网络请求异常，请稍后重试' }));
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
          message: t('common.languageChangedSuccess', { defaultValue: '语言切换成功' }),
          type: 'success',
          duration: 2000
        })
      );
    } catch (error) {
      console.error('Failed to change language:', error);
    }
  };

  // 主题切换处理
  const handleThemeChange = async (theme: ThemeType) => {
    try {
      setThemeDialogVisible(false);
      
      if (theme === selectedTheme) return;
      
      setSelectedTheme(theme);
      await storage.setAsync('theme', theme);
      dispatch(setTheme(theme));
      
      dispatch(
        showToast({
          message: t('common.themeChangedSuccess', { defaultValue: '主题切换成功' }),
          type: 'success',
          duration: 2000
        })
      );
    } catch (error) {
      console.error('Failed to change theme:', error);
    }
  };

  // 处理服务条款点击
  const handleTermsPress = () => {
    const url = i18n.language === 'en-US' 
      ? 'http://114.55.0.234/private/agreement_en.html'
      : 'http://114.55.0.234/private/agreement_zh.html';
    
    navigation?.navigate('WebView', {
      title: t('login.termsOfService', { defaultValue: '服务条款' }),
      url
    });
  };

  // 处理隐私政策点击
  const handlePrivacyPress = () => {
    const url = i18n.language === 'en-US' 
      ? 'http://114.55.0.234/private/privacy_en.html'
      : 'http://114.55.0.234/private/privacy_zh.html';
    
    navigation?.navigate('WebView', {
      title: t('password.privacyPolicy', { defaultValue: '隐私政策' }),
      url
    });
  };

  // 渲染加载指示器
  if (isInitializing) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={paperTheme.colors.primary} />
        <Text style={[styles.loadingText, { color: paperTheme.colors.onBackground }]}>
          {t('login.loading', { defaultValue: '加载中...' })}
        </Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: isDarkMode ? paperTheme.colors.background : '#FAFAFA' }]}>
      <StatusBar barStyle={isDarkMode ? "light-content" : "dark-content"} backgroundColor="transparent" translucent />
      
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        {/* 顶部按钮区域 */}
        <View style={styles.topBar}>
          <View />
          <Menu
            visible={moreMenuVisible}
            onDismiss={() => setMoreMenuVisible(false)}
            anchor={
              <TouchableOpacity 
                style={[styles.moreButton, { backgroundColor: paperTheme.colors.surface }]} 
                onPress={() => setMoreMenuVisible(true)}
              >
                <AntDesign 
                  name="ellipsis1" 
                  size={20} 
                  color={paperTheme.colors.onSurface} 
                />
                <Text style={{ color: paperTheme.colors.onSurface, marginLeft: 4 }}>
                  {t('common.more', { defaultValue: '更多' })}
                </Text>
              </TouchableOpacity>
            }
          >
            <Menu.Item 
              leadingIcon="translate" 
              onPress={() => {
                setMoreMenuVisible(false);
                setLanguageDialogVisible(true);
              }} 
              title={t('login.switchLanguage', { defaultValue: '切换语言' })} 
            />
            <Menu.Item 
              leadingIcon="theme-light-dark" 
              onPress={() => {
                setMoreMenuVisible(false);
                setThemeDialogVisible(true);
              }} 
              title={t('settings.appearance', { defaultValue: '主题切换' })} 
            />
          </Menu>
        </View>
        
        {/* 标题区域 */}
        <View style={styles.headerContainer}>
          <Text style={[styles.logoText, { color: paperTheme.colors.logoColor }]}>
            LEOSMART
          </Text>
          <Text style={[styles.welcomeText, { color: paperTheme.colors.onBackground }]}>
            {t('login.title', { defaultValue: '欢迎使用智慧能源EMS系统' })}
          </Text>
        </View>
        
        {/* 登录表单 */}
        <View style={[styles.formContainer, { backgroundColor: paperTheme.colors.surface }]}>
          {/* 错误消息 */}
          {errorMessage ? (
            <View style={styles.errorContainer}>
              <AntDesign 
                name="exclamationcircleo" 
                size={20} 
                color={paperTheme.colors.error} 
                style={{ marginRight: 8 }}
              />
              <Text style={[styles.errorText, { color: paperTheme.colors.error }]}>
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
            placeholder={t('table.email', { defaultValue: '邮箱/用户名' })}
            autoCapitalize="none"
            right={<TextInput.Icon icon="account" />}
            outlineStyle={{ borderRadius: 24 }}
          />
          
          {/* 密码输入框 */}
          <TextInput
            style={styles.input}
            mode="outlined"
            value={password}
            onChangeText={setPassword}
            secureTextEntry={!showPassword}
            placeholder={t('datasourceconf.password', { defaultValue: '请输入密码' })}
            right={
              <TextInput.Icon 
                icon={showPassword ? "eye" : "eye-off"} 
                onPress={() => setShowPassword(!showPassword)}
              />
            }
            outlineStyle={{ borderRadius: 24 }}
          />
          
          {/* 记住账号和忘记密码 */}
          <View style={styles.rememberForgotContainer}>
            <View style={styles.checkboxContainer}>
              <Checkbox
                status={rememberMe ? 'checked' : 'unchecked'}
                onPress={() => setRememberMe(!rememberMe)}
                color={paperTheme.colors.primary}
              />
              <Text style={{ color: paperTheme.colors.onSurface, marginLeft: 8 }}>
                {t('login.rememberMe', { defaultValue: '记住账号' })}
              </Text>
            </View>
            
            <TouchableOpacity onPress={() => navigation?.navigate('ResetPassword')}>
              <Text style={{ color: paperTheme.colors.forgotPasswordColor }}>
                {t('login.forgotPassword', { defaultValue: '忘记密码' })}
              </Text>
            </TouchableOpacity>
          </View>
          
          {/* 服务条款 */}
          <View style={styles.termsContainer}>
            <Checkbox
              status={agreeToTerms ? 'checked' : 'unchecked'}
              onPress={() => setAgreeToTerms(!agreeToTerms)}
              color={paperTheme.colors.primary}
            />
            <Text style={{ color: paperTheme.colors.termsTextColor, marginLeft: 8, fontSize: 13, flex: 1 }}>
              {t('login.agreeTerms', { defaultValue: '我已阅读并同意' })}{' '}
              <Text 
                style={{ color: paperTheme.colors.termsLinkColor, fontWeight: '500' }}
                onPress={handleTermsPress}
              >
                {t('login.termsOfService', { defaultValue: '服务条款' })}{' '}
              </Text>
              {t('common.and', { defaultValue: '和' })}{' '}
              <Text 
                style={{ color: paperTheme.colors.termsLinkColor, fontWeight: '500' }}
                onPress={handlePrivacyPress}
              >
                {t('password.privacyPolicy', { defaultValue: '隐私政策' })}
              </Text>
            </Text>
          </View>
          
          {/* 登录按钮 */}
          <TouchableOpacity
            style={[
              styles.loginButton, 
              { 
                backgroundColor: loading || !username || !password || !agreeToTerms 
                  ? paperTheme.colors.buttonPrimary + '80' 
                  : paperTheme.colors.buttonPrimary,
                borderRadius: 24
              }
            ]}
            onPress={handleLogin}
            disabled={loading || !username || !password || !agreeToTerms}
          >
            {loading && (
              <ActivityIndicator size="small" color={paperTheme.colors.buttonPrimaryText} style={{ marginRight: 10 }} />
            )}
            <Text style={[styles.loginButtonText, { color: paperTheme.colors.buttonPrimaryText }]}>
              {loading 
                ? t('common.loading', { defaultValue: '登录中...' }) 
                : t('login.loginButton', { defaultValue: '登录' })
              }
            </Text>
          </TouchableOpacity>
          
          {/* 其他登录选项 */}
          <View style={styles.otherLoginContainer}>
            <Button 
              mode="outlined" 
              icon="account-off"
              style={styles.otherButton}
            >
              {t('login.guestLogin', { defaultValue: '游客登录' })}
            </Button>
            
            <Button 
              mode="outlined"
              icon="account-plus"
              style={styles.otherButton}
              onPress={() => navigation?.navigate('Register')}
            >
              {t('login.register', { defaultValue: '立即注册' })}
            </Button>
          </View>
        </View>
      </ScrollView>
      
      {/* 语言选择对话框 */}
      <Portal>
        <Dialog
          visible={languageDialogVisible}
          onDismiss={() => setLanguageDialogVisible(false)}
        >
          <Dialog.Title>
            {t('common.selectLanguage', { defaultValue: '选择语言' })}
          </Dialog.Title>
          
          <Dialog.Content>
            <RadioButton.Group
              onValueChange={handleLanguageChange}
              value={selectedLanguage}
            >
              {supportedLanguages.map((lang) => (
                <RadioButton.Item
                  key={lang.value}
                  label={lang.label}
                  value={lang.value}
                />
              ))}
            </RadioButton.Group>
          </Dialog.Content>
          
          <Dialog.Actions>
            <Button onPress={() => setLanguageDialogVisible(false)}>
              {t('common.cancel', { defaultValue: '取消' })}
            </Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
      
      {/* 主题选择对话框 */}
      <Portal>
        <Dialog
          visible={themeDialogVisible}
          onDismiss={() => setThemeDialogVisible(false)}
        >
          <Dialog.Title>
            {t('settings.appearance', { defaultValue: '选择主题' })}
          </Dialog.Title>
          
          <Dialog.Content>
            <RadioButton.Group
              onValueChange={(value) => handleThemeChange(value as ThemeType)}
              value={selectedTheme}
            >
              <RadioButton.Item
                label={t('settings.theme.light', { defaultValue: '浅色模式' })}
                value="light"
              />
              <RadioButton.Item
                label={t('settings.theme.dark', { defaultValue: '深色模式' })}
                value="dark"
              />
              <RadioButton.Item
                label={t('settings.theme.system', { defaultValue: '跟随系统' })}
                value="system"
              />
            </RadioButton.Group>
          </Dialog.Content>
          
          <Dialog.Actions>
            <Button onPress={() => setThemeDialogVisible(false)}>
              {t('common.cancel', { defaultValue: '取消' })}
            </Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
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
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
    elevation: 1,
  },
  headerContainer: {
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 40,
  },
  logoText: {
    fontSize: 36,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  welcomeText: {
    fontSize: 18,
    textAlign: 'center',
    marginBottom: 8,
  },
  formContainer: {
    borderRadius: 16,
    padding: 24,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
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
    fontSize: 14,
  },
  input: {
    marginBottom: 16,
    height: 48,
  },
  rememberForgotContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 16,
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  termsContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 24,
  },
  loginButton: {
    height: 48,
    borderRadius: 24,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 2,
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
  },
  otherButton: {
    flex: 1,
    marginHorizontal: 8,
    borderRadius: 24,
  },
});

export default LoginScreen; 