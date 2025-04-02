import React, {useState, useEffect} from 'react';
import {View, StyleSheet, TouchableOpacity} from 'react-native';
import {Text, TextInput, useTheme} from 'react-native-paper';
import {useTranslation} from 'react-i18next';
import {ExtendedMD3Theme} from '@/theme';
import SafeAreaLayout from '@/components/SafeAreaLayout';
import {userApi} from '@/services/api/userApi';
import {showToast} from '@/store/slices/toastSlice';
import {useDispatch} from 'react-redux';
import {useMMKVObject} from 'react-native-mmkv';
import {storage} from '@/utils/storage';

interface UserInfo {
  email?: string;
  // ... 其他用户信息字段
}

const ChangeEmailScreen: React.FC<{navigation: any}> = ({navigation}) => {
  const {t} = useTranslation();
  const theme = useTheme() as ExtendedMD3Theme;
  const dispatch = useDispatch();
  const [userInfo] = useMMKVObject<UserInfo>('user_info', storage.getInstance()!);

  const [email, setEmail] = useState(userInfo?.email || '');
  const [verificationCode, setVerificationCode] = useState('');
  const [countdown, setCountdown] = useState(0);
  const [loading, setLoading] = useState(false);

  // 当用户信息更新时，更新邮箱输入框
  useEffect(() => {
    if (userInfo?.email) {
      setEmail(userInfo.email);
    }
  }, [userInfo?.email]);

  // 倒计时效果
  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    if (countdown > 0) {
      timer = setTimeout(() => {
        setCountdown(prev => prev - 1);
      }, 1000);
    }
    return () => {
      if (timer) {
        clearTimeout(timer);
      }
    };
  }, [countdown]);

  // 发送验证码
  const handleSendCode = async () => {
    if (!email.trim() || !/\S+@\S+\.\S+/.test(email)) {
      dispatch(
        showToast({
          message: t('validation.emailFormat', {defaultValue: '请输入有效的邮箱地址'}),
          type: 'error',
          duration: 2000,
        }),
      );
      return;
    }

    // 检查新邮箱是否与当前邮箱相同
    if (email.trim() === userInfo?.email) {
      dispatch(
        showToast({
          message: t('validation.sameEmail', {defaultValue: '新邮箱不能与当前邮箱相同'}),
          type: 'error',
          duration: 2000,
        }),
      );
      return;
    }

    try {
      setLoading(true);
      const response = await userApi.sendRegisterCode(email);
      
      if (response.code === 0) {
        setCountdown(60);
        dispatch(
          showToast({
            message: t('common.codeSent', {defaultValue: '验证码已发送'}),
            type: 'success',
            duration: 2000,
          }),
        );
      } else {
        dispatch(
          showToast({
            message: response.message || t('common.sendCodeFailed', {defaultValue: '发送验证码失败'}),
            type: 'error',
            duration: 2000,
          }),
        );
      }
    } catch (error) {
      console.error('Send code error:', error);
      dispatch(
        showToast({
          message: t('common.networkError', {defaultValue: '网络请求异常，请稍后重试'}),
          type: 'error',
          duration: 2000,
        }),
      );
    } finally {
      setLoading(false);
    }
  };

  // 提交修改
  const handleSubmit = async () => {
    if (!email.trim() || !verificationCode.trim()) {
      dispatch(
        showToast({
          message: t('validation.required', {defaultValue: '请填写完整信息'}),
          type: 'error',
          duration: 2000,
        }),
      );
      return;
    }

    // 检查新邮箱是否与当前邮箱相同
    if (email.trim() === userInfo?.email) {
      dispatch(
        showToast({
          message: t('validation.sameEmail', {defaultValue: '新邮箱不能与当前邮箱相同'}),
          type: 'error',
          duration: 2000,
        }),
      );
      return;
    }

    try {
      setLoading(true);
      const response = await userApi.changeEmail({
        email: email.trim(),
        code: verificationCode.trim(),
      });

      if (response.code === 0) {
        dispatch(
          showToast({
            message: t('common.updateSuccess', {defaultValue: '修改成功'}),
            type: 'success',
            duration: 2000,
          }),
        );
        // 更新成功后返回
        navigation.goBack();
      } else {
        dispatch(
          showToast({
            message: response.message || t('common.updateFailed', {defaultValue: '修改失败'}),
            type: 'error',
            duration: 2000,
          }),
        );
      }
    } catch (error) {
      console.error('Change email error:', error);
      dispatch(
        showToast({
          message: t('common.networkError', {defaultValue: '网络请求异常，请稍后重试'}),
          type: 'error',
          duration: 2000,
        }),
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaLayout>
      <View style={[styles.container, {backgroundColor: theme.colors.background}]}>
        <View style={styles.content}>
          {/* 新邮箱输入 */}
          <View style={styles.inputGroup}>
            <Text style={[styles.label, {color: theme.colors.onSurface}]}>
              {t('userSetting.SecuritySettings.form.label.newEmail', {defaultValue: '新邮箱'})}
            </Text>
            <TextInput
              mode="outlined"
              value={email}
              onChangeText={setEmail}
              placeholder={t('userSetting.SecuritySettings.form.placeholder.newEmail', {defaultValue: '请输入新邮箱'})}
              keyboardType="email-address"
              autoCapitalize="none"
              style={[styles.input, {backgroundColor: theme.colors.surface}]}
              outlineStyle={{borderRadius: 8}}
            />
          </View>

          {/* 验证码输入 */}
          <View style={styles.inputGroup}>
            <Text style={[styles.label, {color: theme.colors.onSurface}]}>
              {t('userSetting.SecuritySettings.form.label.verificationCode', {defaultValue: '验证码'})}
            </Text>
            <View style={styles.codeContainer}>
              <TextInput
                mode="outlined"
                value={verificationCode}
                onChangeText={setVerificationCode}
                placeholder={t('userSetting.SecuritySettings.form.placeholder.verificationCode', {defaultValue: '请输入验证码'})}
                keyboardType="number-pad"
                style={[styles.codeInput, {backgroundColor: theme.colors.surface}]}
                outlineStyle={{borderRadius: 8}}
              />
              <TouchableOpacity
                style={[
                  styles.sendCodeButton,
                  {
                    backgroundColor: countdown > 0 ? theme.colors.surfaceDisabled : theme.colors.primary,
                  },
                ]}
                onPress={handleSendCode}
                disabled={countdown > 0 || loading}>
                <Text style={{color: theme.colors.onPrimary}}>
                  {countdown > 0
                    ? `${countdown}s`
                    : t('common.sendCode', {defaultValue: '发送验证码'})}
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* 提交按钮 */}
          <TouchableOpacity
            style={[
              styles.submitButton,
              {
                backgroundColor: loading ? theme.colors.surfaceDisabled : theme.colors.primary,
              },
            ]}
            onPress={handleSubmit}
            disabled={loading}>
            <Text style={[styles.submitButtonText, {color: theme.colors.onPrimary}]}>
              {t('common.confirm', {defaultValue: '确定'})}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaLayout>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 16,
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    marginBottom: 8,
  },
  input: {
    height: 44,
  },
  codeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  codeInput: {
    flex: 1,
    height: 44,
  },
  sendCodeButton: {
    height: 44,
    paddingHorizontal: 16,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  submitButton: {
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 32,
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: '500',
  },
});

export default ChangeEmailScreen; 