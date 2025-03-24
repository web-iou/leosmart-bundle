import './utils/ReactotronConfig';
import './utils/ReactotronAxiosConfig';
import React, { useEffect, useState } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Provider as PaperProvider, ActivityIndicator } from 'react-native-paper';
import { View, StyleSheet, Text, StatusBar } from 'react-native';
import { Provider as ReduxProvider, useSelector } from 'react-redux';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { initializeI18n } from './i18n';
import AppNavigator from './routes';
import { LightAppTheme, DarkAppTheme } from './theme';
import { storage } from './utils/storage';
import store from './store';
import Toast from './components/Toast';

// ThemeWrapper component to get theme from Redux store
const ThemeWrapper = ({ children }: { children: React.ReactNode }) => {
  const themeType = useSelector((state: any) => state.theme.themeType);
  
  // Determine the theme based on the state
  const theme = themeType === 'dark' ? DarkAppTheme : LightAppTheme;
  
  return (
    <PaperProvider theme={theme}>
      <SafeAreaProvider>
        <StatusBar 
          backgroundColor={theme.colors.background}
          barStyle={themeType === 'dark' ? 'light-content' : 'dark-content'}
        />
        {children}
      </SafeAreaProvider>
    </PaperProvider>
  );
};

const App: React.FC = () => {
  const [isInitialized, setInitialized] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 在应用启动时初始化
  useEffect(() => {
    const initialize = async () => {
      try {
        // 首先等待存储系统准备好
        console.log('等待存储系统准备就绪...');
        const storageReady = await storage.waitForReady();
        console.log('存储系统状态:', storageReady ? '就绪' : '未就绪');
        
        // 即使存储不就绪也继续初始化（会使用内存缓存）
        console.log('初始化国际化...');
        await initializeI18n();
        console.log('初始化完成。');
        
        setInitialized(true);
      } catch (error: any) {
        console.error('初始化失败:', error);
        setError(error.message || '应用初始化失败');
        // 即使失败也标记为已初始化，这样用户至少能看到错误信息
        setInitialized(true);
      }
    };

    initialize();
  }, []);

  if (!isInitialized) {
    return (
      <PaperProvider theme={LightAppTheme}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={LightAppTheme.colors.primary} />
          <Text style={styles.loadingText}>正在加载...</Text>
        </View>
      </PaperProvider>
    );
  }

  if (error) {
    return (
      <PaperProvider theme={LightAppTheme}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>出错了</Text>
          <Text style={styles.errorDetail}>{error}</Text>
        </View>
      </PaperProvider>
    );
  }

  return (
    <ReduxProvider store={store}>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <ThemeWrapper>
          <AppNavigator />
          <Toast />
        </ThemeWrapper>
      </GestureHandlerRootView>
    </ReduxProvider>
  );
};

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ffffff',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    padding: 20,
  },
  errorText: {
    fontSize: 20,
    color: '#f13a59',
    marginBottom: 10,
  },
  errorDetail: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
});

export default App; 