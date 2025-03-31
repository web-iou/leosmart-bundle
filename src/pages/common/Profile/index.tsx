import React, {useState} from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import {Text, List, Switch, Divider, useTheme, Avatar} from 'react-native-paper';
import {useTranslation} from 'react-i18next';
import {storage} from '@/utils/storage';
import {ExtendedMD3Theme} from '@/theme';
import SafeAreaLayout from '@/components/SafeAreaLayout';
import ThemePortal from '@/components/ThemePortal';
import {useMMKVObject} from 'react-native-mmkv';

interface ProfilePageProps {
  navigation: any;
}

const ProfilePage: React.FC<ProfilePageProps> = ({navigation}) => {
  const {t} = useTranslation();
  const theme = useTheme() as ExtendedMD3Theme;
  const [userInfo, setUserInfo] = useMMKVObject(
    'user_info',
    storage.getInstance()!,
  );

  // 全场景模式开关状态
  const [globalMode, setGlobalMode] = useState<boolean>(false);
  const [show, setShow] = useState(false);

  // 处理用户退出登录
  const handleLogout = () => {
    Alert.alert(
      t('messageBox.logout'),
      t('user.logOutMessage'),
      [
        {
          text: t('user.logOutCancel'),
          style: 'cancel',
        },
        {
          text: t('user.logOutExit'),
          onPress: () => {
            storage.delete('auth_token');
            navigation.reset({
              index: 0,
              routes: [{name: 'Login'}],
            });
          },
        },
      ],
    );
  };

  // 切换全场景模式
  const toggleGlobalMode = () => {
    setGlobalMode(!globalMode);
  };

  // 导航到通用设置
  const goToGeneralSettings = () => {
    navigation.navigate('General');
  };

  // 导航到账号安全
  const goToAccountSecurity = () => {
    Alert.alert(
      t('message.box.title'),
      t('userSetting.SecuritySettings.placeholder.securityQuestion'),
    );
  };

  // 导航到皮肤设置
  const goToThemeSettings = () => {
    setShow(true);
  };

  // 导航到关于页面
  const goToAbout = () => {
    navigation.navigate('WebView', {
      title: t('common.about'),
      url: 'https://example.com/about',
    });
  };

  return (
    <SafeAreaLayout>
      <ScrollView
        style={[styles.container, {backgroundColor: theme.colors.background}]}>
        {/* 顶部用户名 */}
        <View style={styles.header}>
          <Avatar.Icon size={60} icon="account" style={{marginBottom: 10}} />
          <Text style={[styles.title2, {color: theme.colors.onBackground}]}>
            {userInfo?.username}
          </Text>
        </View>

        {/* 设置列表 */}
        <View
          style={[
            styles.settingsCard,
            {backgroundColor: theme.colors.surface},
          ]}>
          <List.Item
            title={t('common.general')}
            titleStyle={{color: theme.colors.onSurface}}
            left={props => <List.Icon {...props} icon="cog" color="#FF9800" />}
            right={props => (
              <List.Icon
                {...props}
                icon="chevron-right"
                color={theme.colors.onSurfaceVariant}
              />
            )}
            onPress={goToGeneralSettings}
          />

          <Divider style={{backgroundColor: theme.colors.outline + '20'}} />

          <List.Item
            title={t('userSetting.account_security')}
            titleStyle={{color: theme.colors.onSurface}}
            left={props => (
              <List.Icon {...props} icon="shield" color="#2196F3" />
            )}
            right={props => (
              <List.Icon
                {...props}
                icon="chevron-right"
                color={theme.colors.onSurfaceVariant}
              />
            )}
            onPress={goToAccountSecurity}
          />

          <Divider style={{backgroundColor: theme.colors.outline + '20'}} />

          <List.Item
            title={t('layout.skin')}
            titleStyle={{color: theme.colors.onSurface}}
            left={props => (
              <List.Icon {...props} icon="palette" color="#4CAF50" />
            )}
            right={props => (
              <List.Icon
                {...props}
                icon="chevron-right"
                color={theme.colors.onSurfaceVariant}
              />
            )}
            onPress={goToThemeSettings}
          />

          <Divider style={{backgroundColor: theme.colors.outline + '20'}} />

          <List.Item
            title={t('common.about')}
            titleStyle={{color: theme.colors.onSurface}}
            left={props => (
              <List.Icon {...props} icon="information" color="#FF5722" />
            )}
            right={props => (
              <List.Icon
                {...props}
                icon="chevron-right"
                color={theme.colors.onSurfaceVariant}
              />
            )}
            onPress={goToAbout}
          />
        </View>

        {/* 全场景模式开关 */}
        <View
          style={[
            styles.switchContainer,
            {backgroundColor: theme.colors.surface},
          ]}>
          <Text style={[styles.switchText, {color: theme.colors.onSurface}]}>
            {t('settings.full.scene.mode')}
          </Text>
          <Switch
            value={globalMode}
            onValueChange={toggleGlobalMode}
            color={theme.colors.primary}
          />
        </View>

        {/* 退出登录按钮 */}
        <TouchableOpacity
          style={[styles.logoutButton, {borderColor: theme.colors.error}]}
          onPress={handleLogout}>
          <Text style={[styles.logoutButtonText, {color: theme.colors.error}]}>
            {t('messageBox.logout')}
          </Text>
        </TouchableOpacity>
        <ThemePortal
          setThemeDialogVisible={setShow}
          themeDialogVisible={show}></ThemePortal>
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
  },
});

export default ProfilePage;
