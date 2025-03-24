import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, Button, useTheme } from 'react-native-paper';
import { useTranslation } from 'react-i18next';
import { storage } from '../../utils/storage';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';

interface MainScreenProps {
  navigation?: any;
}

const MainScreen: React.FC<MainScreenProps> = ({ navigation }) => {
  const { t } = useTranslation();
  const theme = useTheme();
  const { isDarkMode } = useSelector((state: RootState) => state.theme);

  const handleLogout = () => {
    // 清除存储的令牌
    storage.delete('auth_token');
    storage.delete('refresh_token');
    
    // 跳转到登录页面
    navigation?.replace('Login');
  };

  const handleOpenSettings = () => {
    navigation?.navigate('Settings');
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Text style={[styles.title, { color: theme.colors.primary }]}>LeoSmart</Text>
      <Text style={[styles.subtitle, { color: theme.colors.onBackground }]}>
        {t('common.welcomeMessage', { defaultValue: '欢迎使用!' })}
      </Text>
      
      <View style={styles.buttonContainer}>
        <Button 
          mode="contained" 
          onPress={handleOpenSettings} 
          style={[styles.button, { backgroundColor: theme.colors.secondary }]}
        >
          {t('common.settings', { defaultValue: '设置' })}
        </Button>
        
        <Button 
          mode="contained" 
          onPress={handleLogout} 
          style={styles.button}
        >
          {t('common.logout', { defaultValue: '退出登录' })}
        </Button>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    marginBottom: 30,
    textAlign: 'center',
  },
  buttonContainer: {
    width: '100%',
    marginTop: 20,
  },
  button: {
    marginVertical: 10,
  },
});

export default MainScreen; 