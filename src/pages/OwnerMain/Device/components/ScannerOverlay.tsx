import React, {useEffect} from 'react';
import {View, Dimensions, StyleSheet, Text, StatusBar} from 'react-native';
import {Canvas, Rect, LinearGradient, vec} from '@shopify/react-native-skia';
import {
  useSharedValue,
  useDerivedValue,
  withRepeat,
  withTiming,
  interpolate,
} from 'react-native-reanimated';
import {
  Camera,
  useCameraDevice,
  useCodeScanner,
} from 'react-native-vision-camera';
import {useIsFocused, useNavigation} from '@react-navigation/native';
import {useThrottleFn} from 'ahooks';
import {useTheme} from 'react-native-paper';
import {ExtendedMD3Theme} from '@/theme';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import NativeRinging from '~/specs/NativeRinging';

const {width} = Dimensions.get('window');
const scanBoxSize = width * 0.75; // 扫描框大小

export default () => {
  const isFocused = useIsFocused();
  const device = useCameraDevice('back');
  const isActive = isFocused;
  const theme = useTheme() as ExtendedMD3Theme;
  const insets = useSafeAreaInsets();
  const navigation =
    useNavigation<ReactNavigation.Navigation<'SNCode'>['navigation']>();

  // 设置状态栏样式
  useEffect(() => {
    StatusBar.setBarStyle(theme.dark ? 'light-content' : 'dark-content');
    StatusBar.setBackgroundColor('transparent');
    StatusBar.setTranslucent(true);
    
    return () => {
      StatusBar.setTranslucent(false);
      StatusBar.setBackgroundColor(theme.colors.background);
      StatusBar.setBarStyle('default');
    };
  }, [theme.dark, theme.colors.background]);

  // 使用 useCallback 包装节流函数，避免重复创建
  const handleCodeScanned = useThrottleFn(
    (codes: any[]) => {
      if (codes.length > 0) {
        navigation.push('SNCode', {code: codes[0].value});
        NativeRinging.ringing(1057);
      }
    },
    {
      leading: false,
      wait: 1000,
      trailing: false, // 禁用尾部执行
    },
  ).run;

  const codeScanner = useCodeScanner({
    codeTypes: ['ean-13', 'code-128','qr'],
    onCodeScanned: handleCodeScanned,
  });

  const yOffset = useSharedValue(0); // 扫描光条的 Y 轴偏移量
  // 扫描光条动画
  useEffect(() => {
    yOffset.value = withRepeat(
      withTiming(scanBoxSize, {duration: 2000}), // 2s 从上到下
      -1, // 无限循环
      false, // 不反向
    );
  }, [yOffset]);

  // 动态计算光条的 Y 位置
  const animatedYOffset = useDerivedValue(() => yOffset.value);

  // 动态计算光条的透明度
  const opacity = useDerivedValue(() =>
    interpolate(
      yOffset.value,
      [0, scanBoxSize / 2, scanBoxSize],
      [0.2, 1, 0.2],
    ),
  );

  // 确定扫描光条的颜色
  const scanLineColor = theme.dark ? 'rgba(0, 255, 0, 0.8)' : 'rgba(0, 150, 0, 0.8)';

  return (
    <View style={[styles.container, { 
      backgroundColor: theme.colors.background,
      paddingTop: insets.top // 添加顶部内边距，确保不覆盖状态栏
    }]}>
      {/* 相机预览 */}
      <Camera
        device={device!}
        style={StyleSheet.absoluteFill}
        codeScanner={codeScanner}
        isActive={isActive}
      />
      {/* 扫描框 */}
      <View style={[styles.scanBox, { 
        borderColor: theme.colors.outline,
        backgroundColor: theme.dark ? 'rgba(0,0,0,0.3)' : 'rgba(255,255,255,0.1)'
      }]}>
        {/* 扫描光条 */}
        <Canvas style={StyleSheet.absoluteFill}>
          <Rect
            x={0}
            y={animatedYOffset}
            width={scanBoxSize}
            height={4}
            opacity={opacity}>
            <LinearGradient
              start={vec(0, 0)}
              end={vec(scanBoxSize, 0)}
              colors={[
                'rgba(0, 255, 0, 0)', // 左端透明
                scanLineColor, // 中间绿色
                'rgba(0, 255, 0, 0)', // 右端透明
              ]}
            />
          </Rect>
        </Canvas>
      </View>

      {/* 提示文字 */}
      <Text style={{ color: theme.colors.onSurface, marginTop: 20, textAlign: 'center', fontSize: 14 }}>
        将二维码/条形码放入框内，即可自动扫描
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scanBox: {
    width: scanBoxSize,
    height: scanBoxSize,
    borderWidth: 1,
    position: 'relative',
    overflow: 'hidden',
    borderRadius: 12,
  },
});
