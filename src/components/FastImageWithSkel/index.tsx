import LinearGradient from 'react-native-linear-gradient';
import ShimmerPlaceHolder from 'react-native-shimmer-placeholder';
import FastImage, {type FastImageProps} from 'react-native-fast-image';
import {useState} from 'react';
export default ({style, ...rest}: Omit<FastImageProps, 'onLoadEnd'>) => {
  const [isLoaded, setIsLoaded] = useState(false);
  return (
    <ShimmerPlaceHolder
      style={style}
      LinearGradient={LinearGradient}
      visible={isLoaded}>
      <FastImage {...rest} style={style} onLoadEnd={() => setIsLoaded(true)} />
    </ShimmerPlaceHolder>
  );
};
