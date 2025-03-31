/*
 * @Author: wangjunwj wangjunwj@dinglicom.com
 * @Date: 2025-03-31 09:04:02
 * @LastEditors: wangjunwj wangjunwj@dinglicom.com
 * @LastEditTime: 2025-03-31 14:42:00
 * @FilePath: /leosmart/src/pages/InstallerMain/index.tsx
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
import React from 'react';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import {useTheme} from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import {useTranslation} from 'react-i18next';

// 导入页面组件
import Overview from './Overview';
import Monitor from './Monitor';
import Profile from '../common/Profile';

const Tab = createBottomTabNavigator();

interface InstallerMainScreenProps {
  navigation: any;
}

const InstallerMainScreen: React.FC<InstallerMainScreenProps> = () => {
  const theme = useTheme();
  const {t} = useTranslation();

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: theme.colors.outline,
        tabBarStyle: {
          borderTopWidth: 1,
          borderTopColor: theme.colors.outlineVariant,
          height: 60,
          paddingBottom: 8,
          backgroundColor: theme.colors.surface,
        },
      }}>
      <Tab.Screen
        name="Overview"
        component={Overview}
        options={{
          title: t('installer.overview', {defaultValue: '概览'}),
          tabBarIcon: ({color, size}) => (
            <Icon name="chart-box" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Monitor"
        component={Monitor}
        options={{
          title: t('installer.monitor', {defaultValue: '监控'}),
          tabBarIcon: ({color, size}) => (
            <Icon name="monitor-dashboard" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Mine"
        component={Profile}
        options={{
          title: t('installer.mine', {defaultValue: '我的'}),
          tabBarIcon: ({color, size}) => (
            <Icon name="account" size={size} color={color} />
          ),
        }}
      />
    </Tab.Navigator>
  );
};

export default InstallerMainScreen; 