import {type ReactNode, useLayoutEffect, useRef} from 'react';
import {type ViewStyle, Animated} from 'react-native';
export default ({
  show,
  style,
  children,
  height = 300,
}: {
  show: boolean;
  children: ReactNode;
  style: Omit<ViewStyle, 'height'>;
  height?: number;
}) => {
  const fadeAnim = useRef(new Animated.Value(height)).current;
  useLayoutEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: show ? 0 : height,
      duration: 400,
      useNativeDriver: true,
    }).start();
  }, [show, fadeAnim]);
  useLayoutEffect(() => {}, []);
  return (
    <Animated.View
      style={{
        transform: [
          {
            translateY: fadeAnim,
          },
        ],
        height,
        ...style,
      }}>
      {children}
    </Animated.View>
  );
};
