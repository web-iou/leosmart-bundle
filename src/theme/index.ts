import { MD3DarkTheme, MD3LightTheme, adaptNavigationTheme, MD3Theme } from 'react-native-paper';
import { 
  DarkTheme as NavigationDarkTheme, 
  DefaultTheme as NavigationDefaultTheme 
} from '@react-navigation/native';
import { storage } from '../utils/storage';
import { StyleSheet, FlexAlignType } from 'react-native';

// 扩展 MD3Colors 类型以包含我们的自定义颜色
export interface CustomColors {
  logoColor: string;
  welcomeTextColor: string;
  subTextColor: string;
  languageSelectorBg: string;
  languageSelectorText: string;
  inputBackground: string;
  checkboxLabelColor: string;
  forgotPasswordColor: string;
  termsTextColor: string;
  termsLinkColor: string;
  buttonPrimary: string;
  buttonPrimaryText: string;
  buttonDisabled: string;
  otherLoginTextColor: string;
  bottomOptionTextColor: string;
  moreButtonBg: string;
  moreButtonTextColor: string;
  iconColor: string;
  checkboxBorderColor: string;
  checkboxBackgroundColor: string;
  dialogBackgroundColor: string;
  dialogTitleColor: string;
  dialogTextColor: string;
  warning: string;
  warningContainer: string;
}

// Custom color palettes
const lightColors = {
  ...MD3LightTheme.colors,
  primary: '#FF7D00',
  secondary: '#f1c40f',
  tertiary: '#2ecc71',
  background: '#FAFAFA',
  surface: '#FFFFFF',
  error: '#FF4D4F',
  
  // 添加登录页面特定颜色
  logoColor: '#FF7D00',
  welcomeTextColor: '#1F2937',
  subTextColor: '#6B7280',
  languageSelectorBg: 'rgba(255, 125, 0, 0.08)',
  languageSelectorText: '#4B5563',
  inputBackground: '#FFFFFF',
  checkboxLabelColor: '#4B5563',
  forgotPasswordColor: '#4B5563',
  termsTextColor: '#6B7280',
  termsLinkColor: '#FF7D00',
  buttonPrimary: '#FF7D00',
  buttonPrimaryText: '#FFFFFF',
  buttonDisabled: '#E5E7EB',
  otherLoginTextColor: '#4B5563',
  bottomOptionTextColor: '#6B7280',
  moreButtonBg: 'rgba(255, 125, 0, 0.08)',
  moreButtonTextColor: '#1F2937',
  iconColor: '#6B7280',
  checkboxBorderColor: '#D1D5DB',
  checkboxBackgroundColor: '#FFFFFF',
  dialogBackgroundColor: '#FFFFFF',
  dialogTitleColor: '#1F2937',
  dialogTextColor: '#4B5563',
  warning: '#FFA726',
  warningContainer: '#FFF3E0',
} as const;

const darkColors = {
  ...MD3DarkTheme.colors,
  primary: '#FF7D00',
  secondary: '#f1c40f',
  tertiary: '#2ecc71',
  background: '#121212',
  surface: '#1e1e1e',
  error: '#e74c3c',
  
  // 添加登录页面特定颜色 - 暗色主题
  logoColor: '#FF7D00',
  welcomeTextColor: '#fff',
  subTextColor: '#aaa',
  languageSelectorBg: 'rgba(255, 255, 255, 0.1)',
  languageSelectorText: '#fff',
  inputBackground: '#1e1e1e',
  checkboxLabelColor: '#aaa',
  forgotPasswordColor: '#aaa',
  termsTextColor: '#aaa',
  termsLinkColor: '#FF9500',
  buttonPrimary: '#FF7D00',
  buttonPrimaryText: '#FFFFFF',
  buttonDisabled: '#444444',
  otherLoginTextColor: '#aaa',
  bottomOptionTextColor: '#aaa',
  moreButtonBg: 'rgba(255, 255, 255, 0.1)',
  moreButtonTextColor: '#fff',
  iconColor: '#aaa',
  checkboxBorderColor: '#aaa',
  checkboxBackgroundColor: 'rgba(60, 60, 60, 0.8)',
  dialogBackgroundColor: '#2a2a2a',
  dialogTitleColor: '#ffffff',
  dialogTextColor: '#cccccc',
  warning: '#FFB74D',
  warningContainer: '#2D2416',
} as const;

// 自定义字体变体配置
const customFonts = {
  regular: {
    fontFamily: 'System',
    fontWeight: 'normal' as const,
  },
  medium: {
    fontFamily: 'System',
    fontWeight: '500' as const,
  },
  bold: {
    fontFamily: 'System',
    fontWeight: 'bold' as const,
  },
  heavy: {
    fontFamily: 'System',
    fontWeight: '900' as const,
  },
};

// 文本变体配置
const fontConfig = {
  displayLarge: {
    ...customFonts.bold,
    fontSize: 28,
    lineHeight: 34,
  },
  displayMedium: {
    ...customFonts.bold,
    fontSize: 24,
    lineHeight: 30,
  },
  displaySmall: {
    ...customFonts.bold,
    fontSize: 20,
    lineHeight: 26,
  },
  headlineLarge: {
    ...customFonts.bold,
    fontSize: 18,
    lineHeight: 24,
  },
  headlineMedium: {
    ...customFonts.medium,
    fontSize: 16,
    lineHeight: 22,
  },
  headlineSmall: {
    ...customFonts.medium,
    fontSize: 14,
    lineHeight: 20,
  },
  titleLarge: {
    ...customFonts.medium,
    fontSize: 16,
    lineHeight: 22,
  },
  titleMedium: {
    ...customFonts.medium,
    fontSize: 14,
    lineHeight: 20,
  },
  titleSmall: {
    ...customFonts.medium,
    fontSize: 13,
    lineHeight: 19,
  },
  bodyLarge: {
    ...customFonts.regular,
    fontSize: 16,
    lineHeight: 22,
  },
  bodyMedium: {
    ...customFonts.regular,
    fontSize: 14,
    lineHeight: 20,
  },
  bodySmall: {
    ...customFonts.regular,
    fontSize: 12,
    lineHeight: 18,
  },
  labelLarge: {
    ...customFonts.medium,
    fontSize: 14,
    lineHeight: 20,
  },
  labelMedium: {
    ...customFonts.medium,
    fontSize: 12,
    lineHeight: 18,
  },
  labelSmall: {
    ...customFonts.medium,
    fontSize: 11,
    lineHeight: 16,
  },
};

// 登录页面的通用样式
export const loginStyles = StyleSheet.create({
  container: {
    flex: 1,
  },
  topBar: {
    flexDirection: 'row' as const,
    justifyContent: 'space-between' as const,
    alignItems: 'center' as FlexAlignType,
    padding: 16,
  },
  moreButton: {
    padding: 8,
    borderRadius: 16,
  },
  moreButtonText: {
    fontWeight: '500' as const,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  logoContainer: {
    alignItems: 'center' as FlexAlignType,
    marginBottom: 40,
  },
  logoText: {
    fontSize: 38,
    fontWeight: 'bold' as const,
    textAlign: 'center' as const,
    marginBottom: 15,
    letterSpacing: 2,
  },
  welcomeText: {
    fontSize: 22,
    fontWeight: '500' as const,
    marginTop: 15,
    textAlign: 'center' as const,
    letterSpacing: 4,
  },
  subText: {
    fontSize: 16,
    textAlign: 'center' as const,
  },
  languageSelector: {
    flexDirection: 'row' as const,
    alignItems: 'center' as FlexAlignType,
    padding: 8,
    borderRadius: 16,
    marginBottom: 20,
  },
  languageSelectorText: {
    fontSize: 14,
    marginHorizontal: 8,
  },
  formContainer: {
    marginBottom: 20,
  },
  input: {
    height: 56,
    fontSize: 16,
    borderRadius: 8,
    marginBottom: 20,
  },
  rememberForgotContainer: {
    flexDirection: 'row' as const,
    justifyContent: 'space-between' as const,
    alignItems: 'center' as FlexAlignType,
    marginBottom: 15,
  },
  checkboxContainer: {
    flexDirection: 'row' as const,
    alignItems: 'center' as FlexAlignType,
  },
  checkboxLabel: {
    marginLeft: 8,
    fontSize: 14,
  },
  forgotPasswordText: {
    fontSize: 14,
  },
  termsContainer: {
    flexDirection: 'row' as const,
    alignItems: 'center' as FlexAlignType,
    marginBottom: 20,
  },
  termsText: {
    fontSize: 14,
    flexShrink: 1,
  },
  errorText: {
    color: '#f13a59',
    marginBottom: 16,
    textAlign: 'center' as const,
  },
  loginButton: {
    height: 52,
    borderRadius: 26,
    justifyContent: 'center' as const,
    alignItems: 'center' as FlexAlignType,
    marginBottom: 30,
    marginTop: 10,
    elevation: 3,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  loginButtonText: {
    fontSize: 18,
    fontWeight: 'bold' as const,
  },
  otherLoginContainer: {
    flexDirection: 'row' as const,
    justifyContent: 'space-between' as const,
    paddingHorizontal: 40,
    marginBottom: 40,
  },
  otherLoginButton: {
    padding: 10,
  },
  otherLoginText: {
    fontSize: 15,
  },
  bottomOptions: {
    flexDirection: 'row' as const,
    justifyContent: 'center' as const,
    alignItems: 'center' as FlexAlignType,
    marginTop: 10,
  },
  bottomOptionItem: {
    paddingHorizontal: 15,
    paddingVertical: 5,
  },
  bottomOptionText: {
    fontSize: 14,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center' as const,
    alignItems: 'center' as FlexAlignType,
  },
  languageDialog: {
    borderRadius: 12,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    padding: 2,
  },
  dialogContentText: {
    textAlign: 'center' as const,
    fontSize: 14,
    marginTop: 8,
    marginBottom: 12,
  },
  radioItem: {
    borderRadius: 8,
    marginVertical: 4,
    paddingVertical: 6,
  },
});

// 扩展主题接口
export interface ExtendedMD3Theme extends MD3Theme {
  colors: MD3Theme['colors'] & CustomColors;
}

// Adapt the themes for navigation and paper
const { LightTheme, DarkTheme } = adaptNavigationTheme({
  reactNavigationLight: NavigationDefaultTheme,
  reactNavigationDark: NavigationDarkTheme,
});

// Combine theming for navigation and paper
export const LightAppTheme = {
  ...MD3LightTheme,
  ...LightTheme,
  colors: lightColors,
  fonts: fontConfig,
} as ExtendedMD3Theme;

export const DarkAppTheme = {
  ...MD3DarkTheme,
  ...DarkTheme,
  colors: darkColors,
  fonts: fontConfig,
} as ExtendedMD3Theme;

// Theme context and provider
export type ThemeType = 'light' | 'dark' | 'system';

// Helper functions to get current theme
export const getStoredThemeType = async (): Promise<ThemeType> => {
  try {
    // 确保存储系统初始化完成
    await storage.waitForReady();
    const theme = await storage.getStringAsync('theme');
    return (theme as ThemeType) || 'system';
  } catch (error) {
    console.warn('Failed to get theme from storage, using system default:', error);
    return 'system';
  }
};

export const setStoredThemeType = async (theme: ThemeType): Promise<void> => {
  try {
    await storage.setAsync('theme', theme);
  } catch (error) {
    console.error('Failed to store theme setting:', error);
  }
};

// 为非异步环境提供同步API（通常使用缓存，不保证最新值）
export const getStoredThemeTypeSync = (): ThemeType => {
  try {
    const theme = storage.getString('theme');
    return (theme as ThemeType) || 'system';
  } catch (error) {
    console.warn('Failed to get theme from storage, using system default:', error);
    return 'system';
  }
};

export default {
  light: LightAppTheme,
  dark: DarkAppTheme,
  getStoredThemeType,
  setStoredThemeType,
  getStoredThemeTypeSync,
  loginStyles,
}; 