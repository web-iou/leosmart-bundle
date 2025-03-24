import React from 'react';
import { StyleSheet, Platform, StatusBar } from 'react-native';
import { useTheme } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ExtendedMD3Theme } from '@/theme';

interface SafeAreaLayoutProps {
  children: React.ReactNode;
  edges?: Array<'top' | 'right' | 'bottom' | 'left'>;
  style?: object;
}

/**
 * 提供安全区域处理的布局组件，确保内容不会与状态栏重叠
 */
const SafeAreaLayout: React.FC<SafeAreaLayoutProps> = ({ 
  children, 
  edges = ['top', 'right', 'left'], 
  style 
}) => {
  const theme = useTheme() as ExtendedMD3Theme;
  
  // 在Android上，我们需要添加状态栏高度的paddingTop
  const androidStatusBarHeight = Platform.OS === 'android' ? StatusBar.currentHeight || 0 : 0;
  
  return (
    <SafeAreaView 
      style={[
        styles.container, 
        { backgroundColor: theme.colors.background },
        Platform.OS === 'android' && { paddingTop: androidStatusBarHeight },
        style
      ]}
      edges={edges}
    >
      {children}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default SafeAreaLayout; 