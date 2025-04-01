/*
 * @Author: cx19940809 
 * @Date: 2025-03-31 13:46:36
 * @LastEditors: cx19940809 
 * @LastEditTime: 2025-03-31 14:21:52
 * @FilePath: /leosmart/src/pages/AccountSecurity/index.tsx
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
import React from 'react';
import { View, ScrollView } from 'react-native';
import { 
  List, 
  useTheme, 
  Divider, 
  Card,
  Text
} from 'react-native-paper';
import { useTranslation } from 'react-i18next';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';


const AccountSecurityScreen: React.FC<ReactNavigation.Navigation> = ({navigation}) => {
  const { t } = useTranslation();
  const theme = useTheme();

  return (
    <View className="flex-1 px-6" style={{ backgroundColor: theme.colors.background }}>
      <ScrollView className="flex-1">
        <Text 
          className="text-sm font-medium mt-4 mb-2 ml-4"
          style={{ color: theme.colors.onSurfaceVariant }}
        >
          {t('account.securitySettings', { defaultValue: '安全设置' })}
        </Text>
        
        <Card 
          className="mx-4 rounded-xl overflow-hidden shadow"
          style={{ backgroundColor: theme.colors.surface }}
        >
          <List.Item
            title={t('account.changeEmail', { defaultValue: '修改绑定邮箱' })}
            description={t('account.changeEmailDesc', { defaultValue: '更改当前账户绑定的邮箱地址' })}
            left={props => (
              <List.Icon 
                {...props} 
                icon={({ size, color }) => (
                  <MaterialCommunityIcons name="email-edit-outline" size={size} color={color} />
                )}
              />
            )}
            right={props => <List.Icon {...props} icon="chevron-right" />}
            onPress={()=>{
              navigation.navigate('ChangeEmail');
            }}
            className="py-3"
          />
          <Divider />
          <List.Item
            title={t('account.changePassword', { defaultValue: '修改密码' })}
            description={t('account.changePasswordDesc', { defaultValue: '更改您的账户登录密码' })}
            left={props => (
              <List.Icon 
                {...props} 
                icon={({ size, color }) => (
                  <MaterialCommunityIcons name="lock-reset" size={size} color={color} />
                )}
              />
            )}
            right={props => <List.Icon {...props} icon="chevron-right" />}
            onPress={()=>{
              navigation.navigate('ChangePassword');
            }}
            className="py-3"
          />
        </Card>
        
        <Text 
          className="text-xs mt-4 mx-4 px-3 italic leading-relaxed"
          style={{ color: theme.colors.onSurfaceVariant }}
        >
          {t('account.securityTip', { 
            defaultValue: '安全提示：建议定期更换密码，并使用包含字母、数字和特殊字符的组合以提高账户安全性。' 
          })}
        </Text>
      </ScrollView>
    </View>
  );
};

export default AccountSecurityScreen; 