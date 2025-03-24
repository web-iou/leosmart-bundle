import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { storage } from '@/utils/storage';

interface RolePageTemplateProps {
  navigation: any;
  title: string;
  description: string;
  alternateRoleName: string; // 用于切换按钮的文本
  alternateRouteName: string; // 要切换到的路由名称
}

const RolePageTemplate: React.FC<RolePageTemplateProps> = ({ 
  navigation, 
  title, 
  description, 
  alternateRoleName,
  alternateRouteName 
}) => {
  const handleLogout = async () => {
    // 清除所有与登录相关的存储
    await Promise.all([
      storage.delete('auth_token'),
      storage.delete('refresh_token'),
      storage.delete('user_info'),
      storage.delete('user_id')
    ]);
    
    navigation.replace('Login');
  };

  return (
    <View style={styles.pageContainer}>
      <Text style={styles.pageTitle}>{title}</Text>
      <Text style={styles.pageDescription}>{description}</Text>
      
      <View style={styles.buttonContainer}>
        <TouchableOpacity 
          style={styles.button} 
          onPress={() => navigation.replace(alternateRouteName)}
        >
          <Text style={styles.buttonText}>切换到{alternateRoleName}页面</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.button, styles.logoutButton]} 
          onPress={handleLogout}
        >
          <Text style={styles.buttonText}>退出登录</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  pageContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  pageTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  pageDescription: {
    fontSize: 16,
    marginBottom: 30,
    textAlign: 'center',
  },
  buttonContainer: {
    width: '100%',
    maxWidth: 300,
    marginTop: 20,
  },
  button: {
    backgroundColor: '#3498db',
    padding: 15,
    borderRadius: 8,
    marginBottom: 15,
    alignItems: 'center',
  },
  logoutButton: {
    backgroundColor: '#e74c3c',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default RolePageTemplate; 