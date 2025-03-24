import { NativeModules } from 'react-native';
import Reactotron from 'reactotron-react-native';
import { reactotronRedux } from 'reactotron-redux';
import mmkvPlugin from 'reactotron-react-native-mmkv';
import { storage } from './storage';  // 导入您的MMKV存储实例

// 获取开发机器的IP地址
let scriptHostname;
if (__DEV__) {
  const scriptURL = NativeModules.SourceCode?.scriptURL;
  scriptHostname = scriptURL ? scriptURL.split('://')[1].split(':')[0] : 'localhost';
}

// 创建Reactotron实例
const reactotron = Reactotron
  .configure({
    name: 'LeoSmart App',
    host: scriptHostname || 'localhost', // 默认连接到localhost
    // 可选: 指定端口，默认是9090
    port: 9090,
  })
  .useReactNative({
    networking: {
      // 移除ignoreUrls规则，以便能捕获所有网络请求
      // 显示请求和响应体
      ignoreContentTypes: /^(image)\/.*$/i, // 只忽略图片内容
    },
    editor: true, // 支持在编辑器中打开源文件
    errors: { veto: (stackFrame) => false }, // 或者设置为true
    overlay: false, // 禁用开发覆盖层
  })
  .use(reactotronRedux()) // 添加Redux监控
  // 条件性地添加MMKV监控
  // 为了避免storage.addOnValueChangedListener未定义错误，我们确保仅在存储实例可用时添加MMKV插件
  
// 在开发环境中连接
if (__DEV__) {
  try {
    // 获取原始的MMKV实例
    const mmkvInstance = storage.getInstance();
    
    // 只有当MMKV实例可用时才添加MMKV插件
    if (mmkvInstance) {
      reactotron.use(mmkvPlugin({ storage: mmkvInstance }));
    } else {
      console.warn('⚠️ Reactotron MMKV插件未配置 - MMKV实例不可用');
    }
  } catch (err) {
    console.warn('⚠️ Reactotron MMKV插件配置错误:', err);
  }
  
  reactotron.connect();
  reactotron.clear();
  
  // 使Reactotron的console可用
  console.tron = reactotron;
}

export default reactotron; 