import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Text, TextInput, Appbar, useTheme } from 'react-native-paper';
import { useTranslation } from 'react-i18next';
import { userApi, ResetPasswordParams } from '@/services/api/userApi';
import { showToast } from '@/store/slices/toastSlice';
import { useDispatch } from 'react-redux';
import AntDesign from 'react-native-vector-icons/AntDesign';
import { ExtendedMD3Theme } from '@/theme';

interface ResetPasswordScreenProps {
  navigation: any;
}

const ResetPasswordScreen: React.FC<ResetPasswordScreenProps> = ({ navigation }) => {
  const { t } = useTranslation();
  const theme = useTheme() as ExtendedMD3Theme;
  const dispatch = useDispatch();

  const [email, setEmail] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [errorMessage, setErrorMessage] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    if (countdown > 0) {
      timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    }
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [countdown]);

  const handleBackPress = () => {
    navigation.goBack();
  };

  const handleSendVerificationCode = async () => {
    // 验证邮箱格式
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setErrorMessage(t('resetPassword.emailInvalid', { defaultValue: '请输入有效的邮箱地址' }));
      return;
    }

    try {
      setSending(true);
      setErrorMessage('');
      setCountdown(60);
      // 使用 userApi 发送验证码
      const response = await userApi.sendResetPasswordCode(email);
      
      if (response && response.code === 0) {
        // 发送成功，开始倒计时
       
        dispatch(
          showToast({
            message: t('resetPassword.codeSent', { defaultValue: '验证码已发送' }),
            type: 'success',
            duration: 2000
          })
        );
      } else {
        setErrorMessage(response?.message || t('resetPassword.sendFailed', { defaultValue: '验证码发送失败' }));
      }
    } catch (error) {
      console.error('Send verification code error:', error);
      setErrorMessage(t('common.networkError', { defaultValue: '网络请求异常，请稍后重试' }));
    } finally {
      setSending(false);
    }
  };

  const handleResetPassword = async () => {
    // 表单验证
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setErrorMessage(t('resetPassword.emailInvalid', { defaultValue: '请输入有效的邮箱地址' }));
      return;
    }
    
    if (!verificationCode) {
      setErrorMessage(t('resetPassword.codeRequired', { defaultValue: '请输入验证码' }));
      return;
    }
    
    if (!newPassword) {
      setErrorMessage(t('resetPassword.newPasswordRequired', { defaultValue: '请输入新密码' }));
      return;
    }
    
    if (newPassword.length < 6) {
      setErrorMessage(t('resetPassword.passwordTooShort', { defaultValue: '密码长度不能少于6个字符' }));
      return;
    }
    
    if (newPassword !== confirmPassword) {
      setErrorMessage(t('resetPassword.passwordMismatch', { defaultValue: '两次输入的密码不一致' }));
      return;
    }
    
    try {
      setLoading(true);
      setErrorMessage('');
      
      // 使用 userApi 重置密码
      const resetParams: ResetPasswordParams = {
        email,
        code: verificationCode,
        password: newPassword
      };
      
      const response = await userApi.resetPassword(resetParams);
      
      if (response && response.code === 0) {
        dispatch(
          showToast({
            message: t('resetPassword.resetSuccess', { defaultValue: '密码修改成功' }),
            type: 'success',
            duration: 2000
          })
        );
        
        // 密码重置成功，返回登录页
        setTimeout(() => {
          navigation.navigate('Login');
        }, 1500);
      } else {
        setErrorMessage(response?.message || t('resetPassword.resetFailed', { defaultValue: '密码重置失败' }));
      }
    } catch (error) {
      console.error('Reset password error:', error);
      setErrorMessage(t('common.networkError', { defaultValue: '网络请求异常，请稍后重试' }));
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Appbar.Header>
        <Appbar.BackAction onPress={handleBackPress} />
        <Appbar.Content title={t('resetPassword.title', { defaultValue: '找回密码' })} />
      </Appbar.Header>

      <ScrollView contentContainerStyle={styles.content}>
        {/* 错误消息 */}
        {errorMessage ? (
          <View style={{
            backgroundColor: theme.dark ? 'rgba(217, 48, 37, 0.2)' : 'rgba(255, 235, 238, 0.8)',
            borderRadius: 8,
            padding: 12,
            marginBottom: 16,
            borderLeftWidth: 4,
            borderLeftColor: theme.dark ? '#FF6B6B' : '#D32F2F'
          }}>
            <Text style={{ 
              color: theme.dark ? '#FF6B6B' : '#D32F2F', 
              fontSize: 14,
              fontWeight: '500'
            }}>
              {errorMessage}
            </Text>
          </View>
        ) : null}

        {/* 邮箱输入 */}
        <View style={styles.inputGroup}>
          <Text style={[styles.label, { color: theme.colors.onSurface }]}>
            {t('resetPassword.email', { defaultValue: '邮箱' })}
          </Text>
          <View style={styles.inputContainer}>
            <AntDesign 
              name="mail" 
              size={24} 
              color={theme.colors.onSurfaceVariant} 
              style={styles.inputIcon} 
            />
            <TextInput
              style={[
                styles.input, 
                { 
                  backgroundColor: theme.colors.inputBackground,
                  height: 48,
                  borderRadius: 24 
                }
              ]}
              mode="outlined"
              placeholder={t('resetPassword.enterEmail', { defaultValue: '请输入邮箱' })}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              outlineStyle={{ borderRadius: 24 }}
            />
          </View>
        </View>

        {/* 验证码输入 */}
        <View style={styles.inputGroup}>
          <Text style={[styles.label, { color: theme.colors.onSurface }]}>
            {t('resetPassword.verificationCode', { defaultValue: '验证码' })}
          </Text>
          <View style={styles.verificationCodeContainer}>
            <View style={[styles.inputContainer, { flex: 1 }]}>
              <AntDesign 
                name="key" 
                size={24} 
                color={theme.colors.onSurfaceVariant} 
                style={styles.inputIcon} 
              />
              <TextInput
                style={[
                  styles.input, 
                  { 
                    backgroundColor: theme.colors.inputBackground,
                    height: 48,
                    borderRadius: 24
                  }
                ]}
                mode="outlined"
                placeholder={t('resetPassword.enterCode', { defaultValue: '请输入验证码' })}
                value={verificationCode}
                onChangeText={setVerificationCode}
                keyboardType="number-pad"
                outlineStyle={{ borderRadius: 24 }}
              />
            </View>
            <TouchableOpacity
              style={[
                styles.sendCodeButton,
                { backgroundColor: countdown > 0 ? theme.colors.buttonDisabled : theme.colors.buttonPrimary }
              ]}
              onPress={handleSendVerificationCode}
              disabled={countdown > 0 || sending}
            >
              {sending ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <Text style={styles.sendCodeButtonText}>
                  {countdown > 0 
                    ? `${countdown}s` 
                    : t('resetPassword.sendCode', { defaultValue: '发送验证码' })}
                </Text>
              )}
            </TouchableOpacity>
          </View>
        </View>

        {/* 新密码输入 */}
        <View style={styles.inputGroup}>
          <Text style={[styles.label, { color: theme.colors.onSurface }]}>
            {t('resetPassword.newPassword', { defaultValue: '新密码' })}
          </Text>
          <View style={styles.inputContainer}>
            <AntDesign 
              name="lock" 
              size={24} 
              color={theme.colors.onSurfaceVariant} 
              style={styles.inputIcon} 
            />
            <TextInput
              style={[
                styles.input, 
                { 
                  backgroundColor: theme.colors.inputBackground,
                  height: 48,
                  borderRadius: 24 
                }
              ]}
              mode="outlined"
              placeholder={t('resetPassword.enterNewPassword', { defaultValue: '请输入新密码' })}
              value={newPassword}
              onChangeText={setNewPassword}
              secureTextEntry={!showNewPassword}
              outlineStyle={{ borderRadius: 24 }}
              right={
                <TextInput.Icon 
                  icon={showNewPassword ? "eye" : "eye-off"} 
                  onPress={() => setShowNewPassword(!showNewPassword)}
                  size={24}
                />
              }
            />
          </View>
        </View>

        {/* 确认密码输入 */}
        <View style={styles.inputGroup}>
          <Text style={[styles.label, { color: theme.colors.onSurface }]}>
            {t('resetPassword.confirmPassword', { defaultValue: '再次输入新密码' })}
          </Text>
          <View style={styles.inputContainer}>
            <AntDesign 
              name="lock" 
              size={24} 
              color={theme.colors.onSurfaceVariant} 
              style={styles.inputIcon} 
            />
            <TextInput
              style={[
                styles.input, 
                { 
                  backgroundColor: theme.colors.inputBackground,
                  height: 48,
                  borderRadius: 24 
                }
              ]}
              mode="outlined"
              placeholder={t('resetPassword.reenterPassword', { defaultValue: '再次输入新密码' })}
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry={!showConfirmPassword}
              outlineStyle={{ borderRadius: 24 }}
              right={
                <TextInput.Icon 
                  icon={showConfirmPassword ? "eye" : "eye-off"} 
                  onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                  size={24}
                />
              }
            />
          </View>
        </View>

        {/* 确认按钮 */}
        <TouchableOpacity
          style={[
            styles.resetButton,
            { backgroundColor: loading ? theme.colors.buttonDisabled : theme.colors.buttonPrimary }
          ]}
          onPress={handleResetPassword}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator size="small" color="#FFFFFF" style={{ marginRight: 8 }} />
          ) : null}
          <Text style={styles.resetButtonText}>
            {loading 
              ? t('resetPassword.resetting', { defaultValue: '正在修改...' }) 
              : t('resetPassword.confirm', { defaultValue: '确定修改' })}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 24,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    marginBottom: 8,
    fontSize: 16,
    fontWeight: '500',
  },
  inputContainer: {
    position: 'relative',
    flexDirection: 'row',
    alignItems: 'center',
  },
  inputIcon: {
    position: 'absolute',
    left: 12,
    zIndex: 1,
  },
  input: {
    flex: 1,
    paddingLeft: 48,
  },
  verificationCodeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  sendCodeButton: {
    height: 48,
    marginLeft: 8,
    borderRadius: 24,
    paddingHorizontal: 12,
    justifyContent: 'center',
    alignItems: 'center',
    width: 110
  },
  sendCodeButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 14,
  },
  resetButton: {
    height: 56,
    borderRadius: 28,
    marginTop: 24,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  resetButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 16,
  },
});

export default ResetPasswordScreen; 