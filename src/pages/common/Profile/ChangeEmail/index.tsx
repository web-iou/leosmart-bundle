import React, { useState } from 'react';
import { View, ScrollView, TouchableOpacity } from 'react-native';
import { 
  TextInput,
  Button,
  useTheme, 
  Text,
  HelperText,
} from 'react-native-paper';
import { useTranslation } from 'react-i18next';
import { useForm, Controller } from 'react-hook-form';
import AntDesign from 'react-native-vector-icons/AntDesign';
import { ExtendedMD3Theme } from '@/theme';

type FormData = {
  newEmail: string;
  verifyCode: string;
  password: string;
};

interface ChangeEmailProps {
  onSubmit: (data: FormData) => Promise<void>;
}

const ChangeEmailScreen: React.FC<ChangeEmailProps> = ({ onSubmit }) => {
  const { t } = useTranslation();
  const theme = useTheme<ExtendedMD3Theme>();
  const [isLoading, setIsLoading] = useState(false);
  const [countdown, setCountdown] = useState(0);
  
  const { control, handleSubmit, formState: { errors }, watch } = useForm<FormData>({
    defaultValues: {
      newEmail: '',
      verifyCode: '',
      password: ''
    }
  });
  
  const watchedNewEmail = watch('newEmail');
  
  // 发送验证码
  const sendVerifyCode = () => {
    // 邮箱格式验证
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(watchedNewEmail)) return;
    
    setIsLoading(true);
    // 模拟发送验证码
    setTimeout(() => {
      setIsLoading(false);
      setCountdown(60);
      
      // 倒计时
      const timer = setInterval(() => {
        setCountdown(prev => {
          if (prev <= 1) {
            clearInterval(timer);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }, 1500);
  };
  
  // 提交处理
  const submitForm = async (data: FormData) => {
    setIsLoading(true);
    try {
      await onSubmit(data);
    } catch (error) {
      console.error('Change email error:', error);
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
          {/* 新邮箱 */}
          <View className="mb-4">
            <Text className="text-base mb-2 font-medium" style={{ color: theme.colors.onSurface }}>
              {t('account.newEmail', { defaultValue: '新邮箱' })}
            </Text>
            <Controller
              control={control}
              name="newEmail"
              rules={{
                required: t('validation.required', { defaultValue: '此字段为必填项' }),
                pattern: {
                  value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                  message: t('validation.emailFormat', { defaultValue: '请输入有效的邮箱地址' })
                }
              }}
              render={({ field: { onChange, value } }) => (
                <TextInput
                  mode="outlined"
                  placeholder={t('account.enterNewEmail', { defaultValue: '输入新邮箱' })}
                  value={value}
                  onChangeText={onChange}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  error={!!errors.newEmail}
                  style={{
                    flex: 1,
                    backgroundColor: theme.colors.inputBackground,
                    height: 40,
                    borderRadius: 20,
                  }}
                  outlineStyle={{ borderRadius: 20 }}
                  left={
                    <TextInput.Icon
                      icon={() => <AntDesign name="mail" size={22} color={theme.colors.onSurfaceVariant} />}
                    />
                  }
                />
              )}
            />
            {errors.newEmail && (
              <HelperText type="error" visible={!!errors.newEmail}>
                {errors.newEmail.message}
              </HelperText>
            )}
          </View>
          
          {/* 验证码 */}
          <View className="mb-4">
            <Text className="text-base mb-2 font-medium" style={{ color: theme.colors.onSurface }}>
              {t('account.verifyCode', { defaultValue: '验证码' })}
            </Text>
            <View className="flex-row items-center">
              <Controller
                control={control}
                name="verifyCode"
                rules={{
                  required: t('validation.required', { defaultValue: '此字段为必填项' }),
                  minLength: {
                    value: 6,
                    message: t('validation.verifyCodeLength', { defaultValue: '验证码长度必须为6位' })
                  }
                }}
                render={({ field: { onChange, value } }) => (
                  <TextInput
                    mode="outlined"
                    placeholder={t('account.enterVerifyCode', { defaultValue: '输入验证码' })}
                    value={value}
                    onChangeText={onChange}
                    keyboardType="number-pad"
                    maxLength={6}
                    error={!!errors.verifyCode}
                    style={{
                      flex: 1,
                      backgroundColor: theme.colors.inputBackground,
                      height: 40,
                      borderRadius: 20,
                      marginRight: 12,
                    }}
                    outlineStyle={{ borderRadius: 20 }}
                    left={
                      <TextInput.Icon
                        icon={() => <AntDesign name="safety" size={22} color={theme.colors.onSurfaceVariant} />}
                      />
                    }
                  />
                )}
              />
              <TouchableOpacity 
                onPress={sendVerifyCode}
                disabled={!watchedNewEmail || 
                         !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(watchedNewEmail) || 
                         countdown > 0 || 
                         isLoading}
                className="h-[40px] justify-center items-center px-4 rounded-full"
                style={{
                  backgroundColor: 
                    !watchedNewEmail || 
                    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(watchedNewEmail) || 
                    countdown > 0 
                      ? theme.colors.surfaceDisabled 
                      : theme.colors.primary
                }}
              >
                <Text style={{ color: 'white' }}>
                  {countdown > 0 
                    ? `${countdown}s` 
                    : t('account.sendCode', { defaultValue: '发送验证码' })}
                </Text>
              </TouchableOpacity>
            </View>
            {errors.verifyCode && (
              <HelperText type="error" visible={!!errors.verifyCode}>
                {errors.verifyCode.message}
              </HelperText>
            )}
          </View>
          
          {/* 当前密码 */}
          <View className="mb-6">
            <Text className="text-base mb-2 font-medium" style={{ color: theme.colors.onSurface }}>
              {t('account.password', { defaultValue: '当前密码' })}
            </Text>
            <Controller
              control={control}
              name="password"
              rules={{
                required: t('validation.required', { defaultValue: '此字段为必填项' })
              }}
              render={({ field: { onChange, value } }) => (
                <TextInput
                  mode="outlined"
                  placeholder={t('account.enterPassword', { defaultValue: '输入当前密码' })}
                  value={value}
                  onChangeText={onChange}
                  secureTextEntry
                  error={!!errors.password}
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
                      icon="eye-off"
                      size={22}
                    />
                  }
                />
              )}
            />
            {errors.password && (
              <HelperText type="error" visible={!!errors.password}>
                {errors.password.message}
              </HelperText>
            )}
          </View>
          
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

export default ChangeEmailScreen; 