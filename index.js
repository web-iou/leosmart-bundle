/**
 * @format
 */

// 添加Codegen补丁
if (process.env.NODE_ENV !== 'production') {
  const originalConsoleError = console.error;
  console.error = (...args) => {
    if (
      typeof args[0] === 'string' &&
      args[0].includes("Codegen didn't run for")
    ) {
      return;
    }
    originalConsoleError(...args);
  };
}

import {AppRegistry} from 'react-native';
import App from './App';
import {name as appName} from './app.json';

AppRegistry.registerComponent(appName, () => App);
