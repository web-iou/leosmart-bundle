import React, { useEffect } from 'react';
import { BottomNavigation, useTheme } from 'react-native-paper';
import { useTranslation } from 'react-i18next';
import { useFocusEffect } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import AntDesign from 'react-native-vector-icons/AntDesign';
import DevicePage from './Device';
import StatisticsPage from './Statistics';
import ProfilePage from './Profile';
import { ExtendedMD3Theme } from '@/theme';

interface OwnerMainScreenProps {
  navigation: any;
}

const OwnerMainScreen: React.FC<OwnerMainScreenProps> = ({ navigation }) => {
  const { t } = useTranslation();
  const theme = useTheme() as ExtendedMD3Theme;
  const [index, setIndex] = React.useState(0);
  const insets = useSafeAreaInsets();
  
  // 确保在组件挂载时导航到设备选项卡
  useEffect(() => {
    // 将标签索引重置为设备选项卡（索引0）
    setIndex(0);
  }, []);
  
  // 监听屏幕获得焦点的事件，确保每次进入该页面时都显示设备页面
  useFocusEffect(
    React.useCallback(() => {
      // 当屏幕获得焦点时，将标签索引重置为设备选项卡
      setIndex(0);
      return () => {
        // 当屏幕失去焦点时的清理操作（如果需要）
      };
    }, [])
  );

  const [routes] = React.useState([
    { 
      key: 'devices', 
      title: t('ownerMain.devices', { defaultValue: '设备' }),
      focusedIcon: 'appstore1', 
      unfocusedIcon: 'appstore-o' 
    },
    { 
      key: 'statistics', 
      title: t('ownerMain.statistics', { defaultValue: '统计' }),
      focusedIcon: 'barschart', 
      unfocusedIcon: 'barschart' 
    },
    { 
      key: 'profile', 
      title: t('ownerMain.profile', { defaultValue: '我的' }),
      focusedIcon: 'user', 
      unfocusedIcon: 'user' 
    },
  ]);

  const renderScene = BottomNavigation.SceneMap({
    devices: () => <DevicePage navigation={navigation} />,
    statistics: () => <StatisticsPage navigation={navigation} />,
    profile: () => <ProfilePage navigation={navigation} />,
  });

  const renderIcon = ({ route, focused, color }: { route: { focusedIcon: string, unfocusedIcon: string }, focused: boolean, color: string }) => {
    // 根据选中状态显示不同的图标
    const iconName = focused ? route.focusedIcon : route.unfocusedIcon;
    return <AntDesign name={iconName} size={24} color={color} />;
  };

  return (
    <BottomNavigation
      navigationState={{ index, routes }}
      onIndexChange={setIndex}
      renderScene={renderScene}
      renderIcon={renderIcon}
      barStyle={{
        backgroundColor: theme.colors.surface,
        borderTopWidth: 1,
        borderTopColor: theme.colors.outline + '30', // 30 为透明度
        paddingBottom: insets.bottom, // 添加底部安全区域边距
        height: 56 + insets.bottom, // 调整高度以适应底部安全区域
      }}
      activeColor={theme.colors.primary}
      inactiveColor={theme.colors.onSurfaceVariant}
    />
  );
};

export default OwnerMainScreen; 