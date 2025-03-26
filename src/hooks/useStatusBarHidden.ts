import {useLayoutEffect} from 'react';
import {StatusBar} from 'react-native';

export const useStatusBarHidden = () => {
  useLayoutEffect(() => {
    StatusBar.setHidden(true);
    // 确保状态栏使用暗色风格，与深色主题兼容
    StatusBar.setBarStyle('light-content');
    return () => {
      StatusBar.setHidden(false);
      // 恢复默认状态栏风格
      StatusBar.setBarStyle('default');
    };
  }, []);
};
