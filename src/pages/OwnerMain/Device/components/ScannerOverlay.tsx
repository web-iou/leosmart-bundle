import React, {useEffect} from 'react';
import {View, Dimensions, StyleSheet, Text} from 'react-native';
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
import NativeImagePicker from '~/specs/NativeImagePicker';
import {useIsFocused, useNavigation} from '@react-navigation/native';
import {useThrottleFn} from 'ahooks';
const {width} = Dimensions.get('window');
const scanBoxSize = width * 0.75; // 扫描框大小

export default () => {
  const isFocused = useIsFocused();
  const device = useCameraDevice('back');
  const isActive = isFocused;
  const navigation =
    useNavigation<RootStackScreenProps<'AddDeviceBySNCode'>['navigation']>();
  const codeScanner = useCodeScanner({
    codeTypes: ['ean-13', 'code-128'],
    onCodeScanned: useThrottleFn(
      codes => {
        navigation.push('AddDeviceBySNCode', {code: codes[0].value});
        NativeImagePicker.notice();
      },
      {
        wait: 1000,
      },
    ).run,
  });
  const yOffset = useSharedValue(0); // 扫描光条的 Y 轴偏移量
  // 扫描光条动画
  useEffect(() => {
    yOffset.value = withRepeat(
      withTiming(scanBoxSize, {duration: 2000}), // 2s 从上到下
      -1, // 无限循环
      false, // 不反向
    );
  }, []);

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

  return (
    <View className=" flex-1 items-center justify-center bg-black">
      {/* 相机预览 */}
      <Camera
        device={device!}
        style={StyleSheet.absoluteFill}
        codeScanner={codeScanner}
        isActive={isActive}
      />
      {/* 扫描框 */}
      <View style={styles.scanBox}>
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
                'rgba(0, 255, 0, 0.8)', // 中间绿色
                'rgba(0, 255, 0, 0)', // 右端透明
              ]}
            />
          </Rect>
        </Canvas>
      </View>

      {/* 提示文字 */}
      <Text className=" mt-5 text-white text-center text-sm">
        将二维码/条形码放入框内，即可自动扫描
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  scanBox: {
    width: scanBoxSize,
    height: scanBoxSize,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.8)',
    position: 'relative',
    overflow: 'hidden',
    borderRadius: 12,
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
});
