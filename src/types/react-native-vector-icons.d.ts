declare module 'react-native-vector-icons/Ionicons' {
  import { ComponentClass } from 'react';
  import { TextProps } from 'react-native';

  interface IconProps extends TextProps {
    name: string;
    size?: number;
    color?: string;
  }

  const Icon: ComponentClass<IconProps>;
  export default Icon;
}

declare module 'react-native-vector-icons/MaterialCommunityIcons' {
  import { ComponentClass } from 'react';
  import { TextProps } from 'react-native';

  interface IconProps extends TextProps {
    name: string;
    size?: number;
    color?: string;
  }

  const Icon: ComponentClass<IconProps>;
  export default Icon;
} 