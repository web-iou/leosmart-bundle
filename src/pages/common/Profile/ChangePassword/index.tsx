import React, { useState } from 'react';
import { View, ScrollView } from 'react-native';
import { 
  TextInput,
  Button,
  useTheme, 
  HelperText,
  Text
} from 'react-native-paper';
import { useTranslation } from 'react-i18next';
import { useForm, Controller } from 'react-hook-form';
import AntDesign from 'react-native-vector-icons/AntDesign';
import { ExtendedMD3Theme } from '@/theme';
import { userApi } from '@/services/api';

type FormData = {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
};

const ChangePasswordScreen = () => {
  const { t } = useTranslation();
  const theme = useTheme() as ExtendedMD3Theme;
  
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  const { control, handleSubmit, formState: { errors }, watch } = useForm<FormData>({
    defaultValues: {
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    }
  });
  
  const newPassword = watch('newPassword');
  
  // 提交处理
  const submitForm = async (data: FormData) => {
    setIsLoading(true);
    try {
      // await userApi.resetPassword({pass})
    } catch (error) {
      console.error('Change password error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View className="flex-1" style={{ backgroundColor: theme.colors.background }}>
      <ScrollView 
        className="flex-1"
        keyboardShouldPersistTaps="handled"
      >
        <View className="p-4">
          {/* 当前密码 */}
          <View className="mb-4">
            <Text className="text-base mb-2 font-medium" style={{ color: theme.colors.onSurface }}>
              {t('account.currentPassword', { defaultValue: '当前密码' })}
            </Text>
            <Controller
              control={control}
              name="currentPassword"
              rules={{
                required: t('validation.required', { defaultValue: '此字段为必填项' })
              }}
              render={({ field: { onChange, value } }) => (
                <TextInput
                  mode="outlined"
                  placeholder={t('account.enterCurrentPassword', { defaultValue: '输入当前密码' })}
                  value={value}
                  onChangeText={onChange}
                  secureTextEntry={!showCurrentPassword}
                  error={!!errors.currentPassword}
                  style={{
                    flex: 1,
                    backgroundColor: theme.colors.inputBackground,
                    height: 40,
                    borderRadius: 20,
                  }}
                  outlineStyle={{ borderRadius: 20 }}
                  left={
                    <TextInput.Icon
                      icon={() => <AntDesign name="lock" size={22} color={theme.colors.onSurfaceVariant} />}
                    />
                  }
                  right={
                    <TextInput.Icon 
                      icon={showCurrentPassword ? "eye" : "eye-off"} 
                      onPress={() => setShowCurrentPassword(!showCurrentPassword)}
                      size={22}
                    />
                  }
                />
              )}
            />
            {errors.currentPassword && (
              <HelperText type="error" visible={!!errors.currentPassword}>
                {errors.currentPassword.message}
              </HelperText>
            )}
          </View>
          
          {/* 新密码 */}
          <View className="mb-4">
            <Text className="text-base mb-2 font-medium" style={{ color: theme.colors.onSurface }}>
              {t('account.newPassword', { defaultValue: '新密码' })}
            </Text>
            <Controller
              control={control}
              name="newPassword"
              rules={{
                required: t('validation.required', { defaultValue: '此字段为必填项' }),
                minLength: {
                  value: 6,
                  message: t('validation.passwordMinLength', { 
                    defaultValue: '密码长度至少为6位' 
                  })
                },
              }}
              render={({ field: { onChange, value } }) => (
                <TextInput
                  mode="outlined"
                  placeholder={t('account.enterNewPassword', { defaultValue: '输入新密码' })}
                  value={value}
                  onChangeText={onChange}
                  secureTextEntry={!showNewPassword}
                  error={!!errors.newPassword}
                  style={{
                    flex: 1,
                    backgroundColor: theme.colors.inputBackground,
                    height: 40,
                    borderRadius: 20,
                  }}
                  outlineStyle={{ borderRadius: 20 }}
                  left={
                    <TextInput.Icon
                      icon={() => <AntDesign name="key" size={22} color={theme.colors.onSurfaceVariant} />}
                    />
                  }
                  right={
                    <TextInput.Icon 
                      icon={showNewPassword ? "eye" : "eye-off"} 
                      onPress={() => setShowNewPassword(!showNewPassword)}
                      size={22}
                    />
                  }
                />
              )}
            />
            {errors.newPassword && (
              <HelperText type="error" visible={!!errors.newPassword}>
                {errors.newPassword.message}
              </HelperText>
            )}
          </View>
          
          {/* 确认密码 */}
          <View className="mb-4">
            <Text className="text-base mb-2 font-medium" style={{ color: theme.colors.onSurface }}>
              {t('account.confirmPassword', { defaultValue: '确认密码' })}
            </Text>
            <Controller
              control={control}
              name="confirmPassword"
              rules={{
                required: t('validation.required', { defaultValue: '此字段为必填项' }),
                validate: value => 
                  value === newPassword || 
                  t('account.passwordMismatch', { defaultValue: '两次输入的密码不一致' })
              }}
              render={({ field: { onChange, value } }) => (
                <TextInput
                  mode="outlined"
                  placeholder={t('account.confirmNewPassword', { defaultValue: '再次输入新密码' })}
                  value={value}
                  onChangeText={onChange}
                  secureTextEntry={!showConfirmPassword}
                  error={!!errors.confirmPassword}
                  style={{
                    flex: 1,
                    backgroundColor: theme.colors.inputBackground,
                    height: 40,
                    borderRadius: 20,
                  }}
                  outlineStyle={{ borderRadius: 20 }}
                  left={
                    <TextInput.Icon
                      icon={() => <AntDesign name="Safety" size={22} color={theme.colors.onSurfaceVariant} />}
                    />
                  }
                  right={
                    <TextInput.Icon 
                      icon={showConfirmPassword ? "eye" : "eye-off"} 
                      onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                      size={22}
                    />
                  }
                />
              )}
            />
            {errors.confirmPassword && (
              <HelperText type="error" visible={!!errors.confirmPassword}>
                {errors.confirmPassword.message}
              </HelperText>
            )}
          </View>
          
          <Text 
            className="text-xs mb-6 px-1 leading-relaxed"
            style={{ color: theme.colors.onSurfaceVariant }}
          >
            {t('account.passwordTip', { 
              defaultValue: '为了保证账户安全，请创建一个强密码，避免使用生日、手机号等容易被猜测的密码。' 
            })}
          </Text>
          
          <Button 
            mode="contained" 
            onPress={handleSubmit(submitForm)}
            className="py-1.5 rounded-full"
            disabled={isLoading}
            loading={isLoading}
          >
            {t('common.confirm', { defaultValue: '确认修改' })}
          </Button>
        </View>
      </ScrollView>
    </View>
  );
};

export default ChangePasswordScreen; 