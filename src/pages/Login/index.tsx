import React, { useState, useEffect } from 'react';
import { View, ScrollView, TouchableOpacity, StyleSheet, Image, StatusBar, ImageBackground, Platform, useColorScheme, ActivityIndicator } from 'react-native';
import { Text, TextInput, Button, Checkbox, Portal, Dialog, RadioButton, Menu, useTheme } from 'react-native-paper';
import { useTranslation } from 'react-i18next';
import { userApi, LoginParams } from '@/services/api/userApi';
import { storage } from '@/utils/storage';
import { APP_SETTINGS } from '@/config/config';
import { useDispatch, useSelector } from 'react-redux';
import { setLanguageAsync } from '@/store/slices/languageSlice';
import { setTheme } from '@/store/slices/themeSlice';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { showToast } from '@/store/slices/toastSlice';
import Ionicons from 'react-native-vector-icons/Ionicons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { ThemeType, loginStyles, ExtendedMD3Theme } from '@/theme';

interface LoginScreenProps {
  navigation?: any;
}

const LoginScreen: React.FC<LoginScreenProps> = ({ navigation }) => {
  const { t, i18n } = useTranslation();
  const dispatch = useDispatch();
  const paperTheme = useTheme() as ExtendedMD3Theme; // 获取当前主题并指定类型
  const currentTheme = useSelector((state: any) => state.theme.themeType);
  const isDarkMode = currentTheme === 'dark' || (currentTheme === 'system' && useColorScheme() === 'dark');
  
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [languageDialogVisible, setLanguageDialogVisible] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState<string>(APP_SETTINGS.defaultLanguage);
  const [supportedLanguages, setSupportedLanguages] = useState(APP_SETTINGS.supportedLanguages);
  const [isInitializing, setIsInitializing] = useState(true);
  const [agreeToTerms, setAgreeToTerms] = useState(false);
  const [moreMenuVisible, setMoreMenuVisible] = useState(false);
  const [themeDialogVisible, setThemeDialogVisible] = useState(false);
  const [selectedTheme, setSelectedTheme] = useState<ThemeType>('light');

  // 获取支持的语言列表和初始化用户设置
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
        
        // 不再尝试从服务器获取支持的语言列表
        // 直接使用APP_SETTINGS中的默认列表
        
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
          // Update local state
          setSelectedTheme(storedTheme);
          
          // Also update Redux store to ensure app-wide consistency
          dispatch(setTheme(storedTheme));
        }
      } catch (error) {
        console.error('Error getting stored theme:', error);
      }
    };
    getTheme();
  }, [dispatch]);

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
        const userType = loginData.user_info?.userType;
        
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

  const openLanguageDialog = () => {
    setLanguageDialogVisible(true);
  };

  const closeLanguageDialog = () => {
    setLanguageDialogVisible(false);
  };

  const handleLanguageChange = async (lang: string) => {
    try {
      setLanguageDialogVisible(false);
      
      // 如果选择的是当前语言，不做处理
      if (lang === selectedLanguage) {
        return;
      }
      
      setSelectedLanguage(lang);
      
      // 使用Redux切换语言
      const success = await dispatch(setLanguageAsync(lang) as any);
      
      if (success) {
        dispatch(
          showToast({
            message: t('common.languageChangedSuccess', { defaultValue: '语言切换成功' }),
            type: 'success',
            duration: 2000
          })
        );
      } else {
        dispatch(
          showToast({
            message: t('common.languageChangeFailed', { defaultValue: '语言切换失败' }),
            type: 'error',
            duration: 2000
          })
        );
      }
    } catch (error) {
      console.error('Failed to change language:', error);
    }
  };

  // 切换主题
  const handleThemeChange = async (theme: ThemeType) => {
    try {
      setThemeDialogVisible(false);
      
      // 如果选择的是当前主题，不做处理
      if (theme === selectedTheme) {
        return;
      }
      
      setSelectedTheme(theme);
      
      // 存储主题设置
      await storage.setAsync('theme', theme);
      
      // 使用Redux切换主题
      dispatch(setTheme(theme));
      
      // 显示通知
      dispatch(
        showToast({
          message: t('common.themeChangedSuccess', { defaultValue: '主题切换成功' }),
          type: 'success',
          duration: 2000
        })
      );
    } catch (error) {
      console.error('Failed to change theme:', error);
      
      dispatch(
        showToast({
          message: t('common.themeChangeFailed', { defaultValue: '主题切换失败' }),
          type: 'error',
          duration: 2000
        })
      );
    }
  };

  // 处理服务条款点击
  const handleTermsPress = () => {
    // 根据当前语言选择合适的URL
    const url = i18n.language ===  'en-US' 
      ? 'http://114.55.0.234/private/agreement_en.html'
      : 'http://114.55.0.234/private/agreement_zh.html';
    
    navigation?.navigate('WebView', {
      title: t('login.termsOfService', { defaultValue: '服务条款' }),
      url
    });
  };

  // 处理隐私政策点击
  const handlePrivacyPress = () => {
    // 根据当前语言选择合适的URL
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
      <View style={loginStyles.loadingContainer}>
        <Text>{t('login.loading', { defaultValue: '加载中...' })}</Text>
      </View>
    );
  }

  // 获取语言标签
  const getLanguageLabel = (value: string) => {
    const language = supportedLanguages.find(lang => lang.value === value);
    return language ? language.label : value;
  };

  return (
    <ScrollView contentContainerStyle={[
      loginStyles.container, 
      { backgroundColor: isDarkMode ? paperTheme.colors.background : '#ffffff' }
    ]}>
      <StatusBar barStyle={isDarkMode ? "light-content" : "dark-content"} />
      
      {/* 顶部按钮区域 */}
      <View style={[
        loginStyles.topBar,
        { paddingHorizontal: 20, paddingTop: Platform.OS === 'ios' ? 50 : 20 }
      ]}>
        <View />
        <Menu
          visible={moreMenuVisible}
          onDismiss={() => setMoreMenuVisible(false)}
          anchor={
            <TouchableOpacity 
              style={[
                loginStyles.moreButton, 
                { 
                  backgroundColor: paperTheme.colors.moreButtonBg,
                  borderRadius: 20,
                  paddingHorizontal: 15,
                  paddingVertical: 8,
                  elevation: 2,
                  shadowColor: '#000',
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.1,
                  shadowRadius: 4
                }
              ]} 
              onPress={() => setMoreMenuVisible(true)}
            >
              <MaterialCommunityIcons 
                name="dots-horizontal" 
                size={22} 
                color={paperTheme.colors.moreButtonTextColor} 
              />
              <Text style={[
                loginStyles.moreButtonText,
                { 
                  color: paperTheme.colors.moreButtonTextColor,
                  marginLeft: 5,
                  fontSize: 14,
                  fontWeight: '500'
                }
              ]}>{t('common.more', { defaultValue: '更多' })}</Text>
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
      
      {/* 主内容区域 */}
      <View style={[
        loginStyles.content,
        { paddingHorizontal: 24 }
      ]}>
        {/* Logo和标题区域 */}
        <View style={[
          loginStyles.logoContainer,
          { marginBottom: 30, alignItems: 'center' }
        ]}>
          <Text style={[
            loginStyles.logoText,
            { 
              color: paperTheme.colors.logoColor,
              fontSize: 36,
              fontWeight: 'bold',
              marginBottom: 12,
              letterSpacing: 1
            }
          ]}>LEOSMART</Text>
          <Text style={[
            loginStyles.welcomeText,
            { 
              color: paperTheme.colors.welcomeTextColor,
              fontSize: 20,
              fontWeight: '600',
              marginBottom: 8,
              textAlign: 'center'
            }
          ]}>{t('login.title', { defaultValue: '欢迎使用智慧能源EMS系统' })}</Text>
         
        </View>
        
       
        
        {/* 登录表单 */}
        <View style={[
          loginStyles.formContainer,
          { 
            backgroundColor: isDarkMode ? 'rgba(30, 30, 30, 0.5)' : 'rgba(255, 255, 255, 0.8)',
            borderRadius: 16,
            padding: 20,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.1,
            shadowRadius: 8,
            elevation: 2
          }
        ]}>
          {/* 错误消息 */}
          {errorMessage ? (
            <View style={{
              backgroundColor: isDarkMode ? 'rgba(217, 48, 37, 0.1)' : 'rgba(255, 235, 238, 0.8)',
              borderRadius: 8,
              padding: 10,
              marginBottom: 16,
              borderLeftWidth: 4,
              borderLeftColor: '#D32F2F'
            }}>
              <Text style={[
                loginStyles.errorText,
                { 
                  color: isDarkMode ? '#FF6B6B' : '#D32F2F',
                  fontSize: 14
                }
              ]}>{errorMessage}</Text>
            </View>
          ) : null}
          
          {/* 用户名输入框 */}
          <TextInput
            style={[
              loginStyles.input, 
              { 
                backgroundColor: paperTheme.colors.inputBackground,
                borderRadius: 12,
                height: 60,
                marginBottom: 16
              }
            ]}
            mode="outlined"
            label={t('login.username', { defaultValue: '账号' })}
            value={username}
            onChangeText={setUsername}
            placeholder={t('table.email', { defaultValue: '邮箱/用户名' })}
            autoCapitalize="none"
            right={<TextInput.Icon icon="account" size={24} />}
            outlineStyle={{ borderRadius: 12 }}
          />
          
          {/* 密码输入框 */}
          <TextInput
            style={[
              loginStyles.input, 
              { 
                backgroundColor: paperTheme.colors.inputBackground,
                borderRadius: 12,
                height: 60,
                marginBottom: 16
              }
            ]}
            mode="outlined"
            label={t('login.password', { defaultValue: '密码' })}
            value={password}
            onChangeText={setPassword}
            secureTextEntry={!showPassword}
            placeholder={t('datasourceconf.password', { defaultValue: '请输入密码' })}
            right={
              <TextInput.Icon 
                icon={showPassword ? "eye" : "eye-off"} 
                onPress={() => setShowPassword(!showPassword)}
                size={24}
              />
            }
            outlineStyle={{ borderRadius: 12 }}
          />
          
          {/* 记住账号和忘记密码 */}
          <View style={[
            loginStyles.rememberForgotContainer,
            { marginVertical: 12 }
          ]}>
            <View style={[
              loginStyles.checkboxContainer,
              { alignItems: 'center' }
            ]}>
              <Checkbox
                status={rememberMe ? 'checked' : 'unchecked'}
                onPress={() => setRememberMe(!rememberMe)}
                color={paperTheme.colors.buttonPrimary}
                uncheckedColor={paperTheme.colors.checkboxBorderColor}
              />
              <Text style={[
                loginStyles.checkboxLabel,
                { 
                  color: paperTheme.colors.checkboxLabelColor,
                  marginLeft: 8,
                  fontSize: 14
                }
              ]}>{t('login.rememberMe', { defaultValue: '记住账号' })}</Text>
            </View>
            
            <TouchableOpacity onPress={() => navigation?.navigate('ResetPassword')}>
              <Text style={[
                loginStyles.forgotPasswordText,
                { 
                  color: paperTheme.colors.forgotPasswordColor,
                  fontSize: 14,
                  fontWeight: '500'
                }
              ]}>
                {t('login.forgotPassword', { defaultValue: '忘记密码' })}
              </Text>
            </TouchableOpacity>
          </View>
          
          {/* 服务条款 */}
          <View style={[
            loginStyles.termsContainer,
            { marginBottom: 20, alignItems: 'center' }
          ]}>
            <Checkbox
              status={agreeToTerms ? 'checked' : 'unchecked'}
              onPress={() => setAgreeToTerms(!agreeToTerms)}
              color={paperTheme.colors.buttonPrimary}
              uncheckedColor={paperTheme.colors.checkboxBorderColor}
            />
            <Text style={[
              loginStyles.termsText,
              { 
                color: paperTheme.colors.termsTextColor,
                marginLeft: 8,
                fontSize: 13,
                flex: 1,
                flexWrap: 'wrap'
              }
            ]}>
              {t('login.agreeTerms', { defaultValue: '我已阅读并同意' })}{' '}
              <Text 
                style={{ 
                  color: paperTheme.colors.termsLinkColor,
                  fontWeight: '500'
                }}
                onPress={handleTermsPress}
              >
                {t('login.termsOfService', { defaultValue: '服务条款' })}{' '}
              </Text>
              {t('common.and', { defaultValue: '和' })}{' '}
              <Text 
                style={{ 
                  color: paperTheme.colors.termsLinkColor,
                  fontWeight: '500'
                }}
                onPress={handlePrivacyPress}
              >
                {t('password.privacyPolicy', { defaultValue: '隐私政策' })}
              </Text>
            </Text>
          </View>
          
          {/* 登录按钮 */}
          <TouchableOpacity
            style={[
              loginStyles.loginButton, 
              { 
                backgroundColor: loading ? paperTheme.colors.buttonDisabled : paperTheme.colors.buttonPrimary,
                shadowColor: paperTheme.colors.buttonPrimary,
                height: 52,
                borderRadius: 12,
                marginTop: 8,
                elevation: 4,
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.2,
                shadowRadius: 8,
                flexDirection: 'row',
                justifyContent: 'center',
                alignItems: 'center'
              }
            ]}
            onPress={handleLogin}
            disabled={loading}
          >
            {loading && (
              <ActivityIndicator 
                size="small" 
                color={paperTheme.colors.buttonPrimaryText} 
                style={{ marginRight: 10 }}
              />
            )}
            <Text style={[
              loginStyles.loginButtonText, 
              { 
                color: paperTheme.colors.buttonPrimaryText,
                fontSize: 16,
                fontWeight: '600'
              }
            ]}>{loading ? t('common.loading', { defaultValue: '登录中...' }) : t('login.loginButton', { defaultValue: '登录' })}</Text>
          </TouchableOpacity>
          
          {/* 其他登录选项 */}
          <View style={[
            loginStyles.otherLoginContainer,
            { 
              marginTop: 24,
              justifyContent: 'space-around',
              paddingHorizontal: 20
            }
          ]}>
            <TouchableOpacity style={[
              loginStyles.otherLoginButton,
              {
                backgroundColor: isDarkMode ? 'rgba(50, 50, 50, 0.3)' : 'rgba(240, 240, 240, 0.8)',
                borderRadius: 12,
                padding: 12,
                alignItems: 'center',
                minWidth: 120
              }
            ]}>
              <MaterialCommunityIcons 
                name="account-off" 
                size={24} 
                color={paperTheme.colors.iconColor} 
              />
              <Text style={[
                loginStyles.otherLoginText,
                { 
                  color: paperTheme.colors.otherLoginTextColor,
                  marginTop: 8,
                  fontSize: 14,
                  fontWeight: '500'
                }
              ]}>{t('login.guestLogin', { defaultValue: '游客登录' })}</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[
                loginStyles.otherLoginButton,
                {
                  backgroundColor: isDarkMode ? 'rgba(50, 50, 50, 0.3)' : 'rgba(240, 240, 240, 0.8)',
                  borderRadius: 12,
                  padding: 12,
                  alignItems: 'center',
                  minWidth: 120
                }
              ]}
              onPress={() => navigation?.navigate('Register')}
            >
              <MaterialCommunityIcons 
                name="account-plus" 
                size={24} 
                color={paperTheme.colors.iconColor} 
              />
              <Text style={[
                loginStyles.otherLoginText,
                { 
                  color: paperTheme.colors.otherLoginTextColor,
                  marginTop: 8,
                  fontSize: 14,
                  fontWeight: '500'
                }
              ]}>{t('login.register', { defaultValue: '立即注册' })}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
      
      {/* 语言选择对话框 */}
      <Portal>
        <Dialog
          visible={languageDialogVisible}
          onDismiss={() => setLanguageDialogVisible(false)}
          style={[
            loginStyles.languageDialog,
            { backgroundColor: paperTheme.colors.dialogBackgroundColor }
          ]}
        >
          <Dialog.Title style={{ color: paperTheme.colors.dialogTitleColor }}>
            {t('common.selectLanguage', { defaultValue: '选择语言' })}
          </Dialog.Title>
          
          <Dialog.Content>
            <Text style={[
              loginStyles.dialogContentText,
              { color: paperTheme.colors.dialogTextColor }
            ]}>
              {t('common.languageHint', { defaultValue: '请选择您偏好的语言' })}
            </Text>
            
            <RadioButton.Group
              onValueChange={handleLanguageChange}
              value={selectedLanguage}
            >
              {supportedLanguages.map((lang) => (
                <RadioButton.Item
                  key={lang.value}
                  label={lang.label}
                  value={lang.value}
                  style={loginStyles.radioItem}
                  labelStyle={{ color: paperTheme.colors.dialogTitleColor }}
                  uncheckedColor={paperTheme.colors.checkboxBorderColor}
                  color={paperTheme.colors.buttonPrimary}
                />
              ))}
            </RadioButton.Group>
          </Dialog.Content>
          
          <Dialog.Actions>
            <Button onPress={() => setLanguageDialogVisible(false)} textColor={paperTheme.colors.buttonPrimary}>
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
          style={[
            loginStyles.languageDialog,
            { backgroundColor: paperTheme.colors.dialogBackgroundColor }
          ]}
        >
          <Dialog.Title style={{ color: paperTheme.colors.dialogTitleColor }}>
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
                style={loginStyles.radioItem}
                labelStyle={{ color: paperTheme.colors.dialogTitleColor }}
                uncheckedColor={paperTheme.colors.checkboxBorderColor}
                color={paperTheme.colors.buttonPrimary}
              />
              <RadioButton.Item
                label={t('settings.theme.dark', { defaultValue: '深色模式' })}
                value="dark"
                style={loginStyles.radioItem}
                labelStyle={{ color: paperTheme.colors.dialogTitleColor }}
                uncheckedColor={paperTheme.colors.checkboxBorderColor}
                color={paperTheme.colors.buttonPrimary}
              />
              <RadioButton.Item
                label={t('settings.theme.system', { defaultValue: '跟随系统' })}
                value="system"
                style={loginStyles.radioItem}
                labelStyle={{ color: paperTheme.colors.dialogTitleColor }}
                uncheckedColor={paperTheme.colors.checkboxBorderColor}
                color={paperTheme.colors.buttonPrimary}
              />
            </RadioButton.Group>
          </Dialog.Content>
          
          <Dialog.Actions>
            <Button onPress={() => setThemeDialogVisible(false)} textColor={paperTheme.colors.buttonPrimary}>
              {t('common.cancel', { defaultValue: '取消' })}
            </Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </ScrollView>
  );
};

export default LoginScreen; 