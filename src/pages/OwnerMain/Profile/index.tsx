import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { Text, List, Switch, Divider, useTheme } from 'react-native-paper';
import { useTranslation } from 'react-i18next';
import { storage } from '@/utils/storage';
import { ExtendedMD3Theme } from '@/theme';
import SafeAreaLayout from '@/components/SafeAreaLayout';

interface ProfilePageProps {
  navigation: any;
}

const ProfilePage: React.FC<ProfilePageProps> = ({ navigation }) => {
  const { t } = useTranslation();
  const theme = useTheme() as ExtendedMD3Theme;
  
  // 全局景观模式开关状态
  const [globalMode, setGlobalMode] = useState<boolean>(false);

  // 处理用户退出登录
  const handleLogout = () => {
    Alert.alert(
      t('profile.logoutTitle', { defaultValue: '退出登录' }),
      t('profile.logoutConfirm', { defaultValue: '确定要退出登录吗？' }),
      [
        {
          text: t('common.cancel', { defaultValue: '取消' }),
          style: 'cancel'
        },
        {
          text: t('common.confirm', { defaultValue: '确定' }),
          onPress: () => {
            // 清除认证令牌
            storage.delete('auth_token');
            // 导航回登录页面
            navigation.reset({
              index: 0,
              routes: [{ name: 'Login' }],
            });
          }
        }
      ]
    );
  };

  // 切换全球景模式
  const toggleGlobalMode = () => {
    setGlobalMode(!globalMode);
    // 实际应用中调用相关API来切换模式
  };

  // 导航到通用设置
  const goToGeneralSettings = () => {
    Alert.alert(
      t('profile.featureNotAvailable', { defaultValue: '功能未开放' }),
      t('profile.comingSoon', { defaultValue: '此功能即将上线，敬请期待！' })
    );
  };

  // 导航到账号安全
  const goToAccountSecurity = () => {
    Alert.alert(
      t('profile.featureNotAvailable', { defaultValue: '功能未开放' }),
      t('profile.comingSoon', { defaultValue: '此功能即将上线，敬请期待！' })
    );
  };

  // 导航到皮肤设置
  const goToThemeSettings = () => {
    Alert.alert(
      t('profile.featureNotAvailable', { defaultValue: '功能未开放' }),
      t('profile.comingSoon', { defaultValue: '此功能即将上线，敬请期待！' })
    );
  };

  // 导航到关于页面
  const goToAbout = () => {
    navigation.navigate('WebView', { 
      title: t('about.title', { defaultValue: '关于我们' }),
      url: 'https://example.com/about'
    });
  };

  return (
    <SafeAreaLayout>
      <ScrollView style={[styles.container, { backgroundColor: theme.colors.background }]}>
        {/* 顶部用户名 */}
        <View style={styles.header}>
          <Text style={[styles.title, { color: theme.colors.onSurfaceVariant }]}>
            Neo
          </Text>
          <Text style={[styles.title2, { color: theme.colors.onBackground }]}>
            Neo
          </Text>
        </View>

        {/* 设置列表 */}
        <View style={[styles.settingsCard, { backgroundColor: theme.colors.surface }]}>
          <List.Item
            title={t('profile.general', { defaultValue: '通用' })}
            titleStyle={{ color: theme.colors.onSurface }}
            left={props => <List.Icon {...props} icon="cog" color="#FF9800" />}
            right={props => <List.Icon {...props} icon="chevron-right" color={theme.colors.onSurfaceVariant} />}
            onPress={goToGeneralSettings}
          />

          <Divider style={{ backgroundColor: theme.colors.outline + '20' }} />

          <List.Item
            title={t('profile.accountSecurity', { defaultValue: '账号安全' })}
            titleStyle={{ color: theme.colors.onSurface }}
            left={props => <List.Icon {...props} icon="shield" color="#2196F3" />}
            right={props => <List.Icon {...props} icon="chevron-right" color={theme.colors.onSurfaceVariant} />}
            onPress={goToAccountSecurity}
          />

          <Divider style={{ backgroundColor: theme.colors.outline + '20' }} />

          <List.Item
            title={t('profile.theme', { defaultValue: '皮肤' })}
            titleStyle={{ color: theme.colors.onSurface }}
            left={props => <List.Icon {...props} icon="palette" color="#4CAF50" />}
            right={props => <List.Icon {...props} icon="chevron-right" color={theme.colors.onSurfaceVariant} />}
            onPress={goToThemeSettings}
          />

          <Divider style={{ backgroundColor: theme.colors.outline + '20' }} />

          <List.Item
            title={t('profile.about', { defaultValue: '关于' })}
            titleStyle={{ color: theme.colors.onSurface }}
            left={props => <List.Icon {...props} icon="information" color="#FF5722" />}
            right={props => <List.Icon {...props} icon="chevron-right" color={theme.colors.onSurfaceVariant} />}
            onPress={goToAbout}
          />
        </View>

        {/* 全球景模式开关 */}
        <View style={[styles.switchContainer, { backgroundColor: theme.colors.surface }]}>
          <Text style={[styles.switchText, { color: theme.colors.onSurface }]}>
            {t('profile.globalMode', { defaultValue: '全球景模式' })}
          </Text>
          <Switch
            value={globalMode}
            onValueChange={toggleGlobalMode}
            color={theme.colors.primary}
          />
        </View>

        {/* 退出登录按钮 */}
        <TouchableOpacity 
          style={[styles.logoutButton, { borderColor: theme.colors.error }]}
          onPress={handleLogout}
        >
          <Text style={[styles.logoutButtonText, { color: theme.colors.error }]}>
            {t('profile.logout', { defaultValue: '退出登录' })}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaLayout>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    alignItems: 'center',
    paddingVertical: 30,
  },
  title: {
    fontSize: 24,
    marginBottom: 10,
  },
  title2: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  settingsCard: {
    marginHorizontal: 16,
    borderRadius: 12,
    overflow: 'hidden',
    elevation: 1,
    marginBottom: 16,
  },
  switchContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginHorizontal: 16,
    borderRadius: 12,
    marginBottom: 24,
  },
  switchText: {
    fontSize: 16,
  },
  logoutButton: {
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 16,
    marginBottom: 24,
    padding: 14,
    borderRadius: 8,
    borderWidth: 1,
  },
  logoutButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
  }
});

export default ProfilePage; 