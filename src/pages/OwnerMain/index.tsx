/*
 * @Author: wangjunwj wangjunwj@dinglicom.com
 * @Date: 2025-03-31 10:50:05
 * @LastEditors: cx19940809 
 * @LastEditTime: 2025-04-01 09:18:25
 * @FilePath: /leosmart/src/pages/OwnerMain/index.tsx
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
import React, { useMemo, useCallback } from 'react';
import { BottomNavigation, useTheme } from 'react-native-paper';
import { useTranslation } from 'react-i18next';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import AntDesign from 'react-native-vector-icons/AntDesign';
import DevicePage from './Device';
import StatisticsPage from './Statistics';
import ProfilePage from '../common/Profile';
import {ExtendedMD3Theme} from '@/theme';

interface OwnerMainScreenProps {
  navigation: any;
  route: any;
}

const OwnerMainScreen: React.FC<OwnerMainScreenProps> = ({
  navigation,
  route,
}) => {
  const {t} = useTranslation();
  const theme = useTheme() as ExtendedMD3Theme;
  const [index, setIndex] = React.useState(0);
  const insets = useSafeAreaInsets();

  // 使用 useMemo 缓存路由配置
  const routes = useMemo(
    () => [
      {
        key: 'devices',
        title: t('ownerMain.devices', {defaultValue: '设备'}),
        focusedIcon: 'appstore1',
        unfocusedIcon: 'appstore-o',
      },
      {
        key: 'statistics',
        title: t('ownerMain.statistics', {defaultValue: '统计'}),
        focusedIcon: 'barschart',
        unfocusedIcon: 'barschart',
      },
      {
        key: 'profile',
        title: t('ownerMain.profile', {defaultValue: '我的'}),
        focusedIcon: 'user',
        unfocusedIcon: 'user',
      },
    ],
    [t],
  );

  // 使用 useMemo 缓存场景映射
  const renderScene = useMemo(
    () =>
      BottomNavigation.SceneMap({
        devices: () => <DevicePage navigation={navigation} route={route} />,
        statistics: () => <StatisticsPage navigation={navigation} />,
        profile: () => <ProfilePage navigation={navigation} />,
      }),
    [navigation, route],
  );

  // 使用 useCallback 缓存图标渲染函数
  const renderIcon = useCallback(
    ({
      route,
      focused,
      color,
    }: {
      route: {focusedIcon: string; unfocusedIcon: string};
      focused: boolean;
      color: string;
    }) => {
      const iconName = focused ? route.focusedIcon : route.unfocusedIcon;
      return <AntDesign name={iconName} size={24} color={color} />;
    },
    [],
  );

  // 使用 useCallback 缓存索引变化处理函数
  const handleIndexChange = useCallback((newIndex: number) => {
    setIndex(newIndex);
  }, []);

  // 监听屏幕获得焦点的事件
  // 使用 useMemo 缓存底部导航栏样式
  const barStyle = useMemo(
    () => ({
      backgroundColor: theme.colors.surface,
      borderTopWidth: 1,
      borderTopColor: theme.colors.outline + '30',
      paddingBottom: insets.bottom,
      height: 56 + insets.bottom,
    }),
    [theme.colors.surface, theme.colors.outline, insets.bottom],
  );

  return (
    <BottomNavigation
      navigationState={{index, routes}}
      onIndexChange={handleIndexChange}
      renderScene={renderScene}
      renderIcon={renderIcon}
      barStyle={barStyle}
      activeColor={theme.colors.primary}
      inactiveColor={theme.colors.onSurfaceVariant}
      sceneAnimationEnabled={false} // 禁用场景切换动画
      sceneAnimationType="shifting" // 使用 shifting 类型的动画
      shifting={true} // 启用 shifting 模式
      compact={true} // 使用紧凑模式
      keyboardHidesNavigationBar={true} // 键盘弹出时隐藏导航栏
    />
  );
};

export default React.memo(OwnerMainScreen); // 使用 React.memo 包装组件
