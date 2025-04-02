import { NativeModules } from 'react-native';
import Reactotron from 'reactotron-react-native';
import { reactotronRedux } from 'reactotron-redux';
import mmkvPlugin from 'reactotron-react-native-mmkv';
import { storage } from './storage';  // 导入您的MMKV存储实例

// 获取开发机器的IP地址


// 创建Reactotron实例
const reactotron = Reactotron
  .configure()
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
  reactotron.connect();
  reactotron.clear();
  // 使Reactotron的console可用
  console.tron = reactotron;
}

export default reactotron; 