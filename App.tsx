/**
 * LeoSmart App
 */

// 首先导入Reactotron配置 - 在任何应用代码之前导入
import './src/utils/ReactotronConfig';
// 导入Reactotron的axios配置
import './src/utils/ReactotronAxiosConfig';

import React, {useEffect, useState} from 'react';
import {View, useColorScheme} from 'react-native';
import {Provider as ReduxProvider} from 'react-redux';
import {PaperProvider} from 'react-native-paper';
import {useSelector, useDispatch} from 'react-redux';
import {GestureHandlerRootView} from 'react-native-gesture-handler';
import './global.css';
import {config} from './config';
// App specific imports
import store, {AppDispatch, RootState} from './src/store';
import AppNavigator from './src/routes';
import {LightAppTheme, DarkAppTheme} from './src/theme';
import './src/i18n';
import {setDarkMode} from './src/store/slices/themeSlice';

import Toast from '@/components/Toast';

// Reactotron类型声明扩展
declare global {
  interface Console {
    tron?: any;
  }
}

// Wrapped App component with theme support
const ThemedApp = () => {
  const systemColorScheme = useColorScheme();
  const dispatch = useDispatch<AppDispatch>();
  // Select theme from Redux store
  const {themeType, isDarkMode} = useSelector(
    (state: RootState) => state.theme,
  );

  // Update dark mode based on system or user preference
  useEffect(() => {
    let newDarkMode = false;

    if (themeType === 'system') {
      newDarkMode = systemColorScheme === 'dark';
    } else {
      newDarkMode = themeType === 'dark';
    }

    dispatch(setDarkMode(newDarkMode));
  }, [themeType, systemColorScheme, dispatch]);



  // Select the appropriate theme based on dark mode setting
  const theme = isDarkMode ? DarkAppTheme : LightAppTheme;

  // 在应用中添加一些调试语句
  if (__DEV__ && console.tron) {
    console.tron.log('Reactotron connected and available');
    console.tron.display({
      name: 'TEST',
      preview: 'Testing Reactotron',
      value: {test: 'value'},
    });
  }
  return (
    <PaperProvider theme={theme}>
      <GestureHandlerRootView>
        <View
          style={[
            config[systemColorScheme!],
            {
              flex: 1,
            },
          ]}>
          <AppNavigator />
          <Toast />
        </View>
      </GestureHandlerRootView>
    </PaperProvider>
  );
};

// Root App component with Redux Provider
function App(): React.JSX.Element {
  return (
    <ReduxProvider store={store}>
      <ThemedApp />
    </ReduxProvider>
  );
}

export default App;
