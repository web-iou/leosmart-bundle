import React, {useEffect, useLayoutEffect, useState} from 'react';
import {
  View,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import {Text, useTheme} from 'react-native-paper';
import {useTranslation} from 'react-i18next';
import {ExtendedMD3Theme} from '@/theme';
import {deviceApi} from '@/services/api/deviceApi';
import {StatusBar} from 'react-native';
import {showToast} from '@/store/slices/toastSlice';
import {useDispatch} from 'react-redux';

// 功率设置页面
const PowerSettings = ({
  route,
  navigation,
}: ReactNavigation.Navigation<'PowerSettings'>) => {
  const {t} = useTranslation();
  const theme = useTheme() as ExtendedMD3Theme;
  const dispatch = useDispatch();
  const {deviceSn} = route.params;

  // 调节方式状态
  const [adjustmentMode, setAdjustmentMode] = useState<'有功功率' | '无功功率'>(
    '有功功率',
  );
  
  // 功率百分比
  const [powerPercentage, setPowerPercentage] = useState('');
  
  // 加载状态
  const [loading, setLoading] = useState(false);

  // 设置状态栏样式
  useEffect(() => {
    StatusBar.setBarStyle(theme.dark ? 'light-content' : 'dark-content');
    StatusBar.setBackgroundColor(theme.colors.background);
    return () => {
      StatusBar.setBarStyle('default');
    };
  }, [theme.dark, theme.colors.background]);

  // 设置标题栏样式
  useLayoutEffect(() => {
    navigation.setOptions({
      title: t('device.powerAdjustment', {defaultValue: '功率设置'}),
      headerStyle: {
        backgroundColor: theme.colors.background,
      },
      headerTintColor: theme.colors.onBackground,
      headerShadowVisible: false,
      headerTitleStyle: {
        fontSize: 18,
        fontWeight: '600',
      },
    });
  }, [navigation, t, theme.colors.background, theme.colors.onBackground]);

  // 处理保存按钮点击
  const handleSave = async () => {
    if (!powerPercentage.trim()) {
      dispatch(
        showToast({
          message: t('common.pleaseInputValue', {
            defaultValue: '请输入功率百分比',
          }),
          type: 'warning',
        }),
      );
      return;
    }

    const percentage = parseFloat(powerPercentage);
    if (isNaN(percentage) || percentage < 0 || percentage > 100) {
      dispatch(
        showToast({
          message: t('common.invalidValue', {
            defaultValue: '无效的值，请输入0-100的数字',
          }),
          type: 'error',
        }),
      );
      return;
    }

    try {
      setLoading(true);

      // 调用API设置设备参数
      const {data: success} = await deviceApi.setEquipmentParams(deviceSn, {
        cmdType: adjustmentMode === '有功功率' ? 'active_power' : 'reactive_power',
        value: powerPercentage,
      });

      if (success) {
        dispatch(
          showToast({
            message: t('common.saveSuccess', {defaultValue: '保存成功'}),
            type: 'success',
          }),
        );
        navigation.goBack();
      } else {
        throw new Error('Operation failed');
      }
    } catch (error) {
      console.error('Failed to save power settings:', error);
      dispatch(
        showToast({
          message: t('common.saveFailed', {defaultValue: '保存失败'}),
          type: 'error',
        }),
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={{flex: 1}}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView
        style={[styles.container, {backgroundColor: theme.colors.background}]}
        contentContainerStyle={{flexGrow: 1}}>
        {/* 调节方式 */}
        <View style={styles.section}>
          <Text style={[styles.label, {color: theme.colors.onBackground}]}>
            {t('device.adjustmentMode', {defaultValue: '调节方式：'})}
          </Text>
          <View style={styles.modeContainer}>
            <TouchableOpacity
              style={[
                styles.modeButton,
                adjustmentMode === '有功功率' && {
                  backgroundColor: theme.colors.primaryContainer,
                },
              ]}
              onPress={() => setAdjustmentMode('有功功率')}>
              <Text
                style={[
                  styles.modeText,
                  {
                    color:
                      adjustmentMode === '有功功率'
                        ? theme.colors.primary
                        : theme.colors.onBackground,
                  },
                ]}>
                {t('device.activePower', {defaultValue: '有功功率'})}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.modeButton,
                adjustmentMode === '无功功率' && {
                  backgroundColor: theme.colors.primaryContainer,
                },
              ]}
              onPress={() => setAdjustmentMode('无功功率')}>
              <Text
                style={[
                  styles.modeText,
                  {
                    color:
                      adjustmentMode === '无功功率'
                        ? theme.colors.primary
                        : theme.colors.onBackground,
                  },
                ]}>
                {t('device.reactivePower', {defaultValue: '无功功率'})}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* 功率百分比 */}
        <View style={styles.section}>
          <Text style={[styles.label, {color: theme.colors.onBackground}]}>
            {t('device.powerPercentage', {defaultValue: '有功功率百分百'})}
          </Text>
          <TextInput
            style={[
              styles.input,
              {
                backgroundColor: theme.colors.surface,
                color: theme.colors.onSurface,
                borderColor: theme.colors.outline,
              },
            ]}
            value={powerPercentage}
            onChangeText={setPowerPercentage}
            placeholder={t('common.pleaseInput', {defaultValue: '请输入'})}
            placeholderTextColor={theme.colors.onSurfaceVariant}
            keyboardType="numeric"
          />

          {/* 说明文本 */}
          <Text
            style={[styles.description, {color: theme.colors.onSurfaceVariant}]}>
            {t('device.powerDescription', {
              defaultValue:
                '指的是用户可以调整最大输出功率与额定功率的比例。',
            })}
          </Text>
        </View>

        {/* 确定按钮 */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[
              styles.confirmButton,
              {backgroundColor: theme.colors.primary},
              loading && {opacity: 0.7},
            ]}
            onPress={handleSave}
            disabled={loading}>
            <Text style={[styles.confirmText, {color: theme.colors.onPrimary}]}>
              {t('common.confirm', {defaultValue: '确定'})}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  section: {
    marginBottom: 24,
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 12,
  },
  modeContainer: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  modeButton: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 6,
    marginRight: 12,
  },
  modeText: {
    fontSize: 16,
  },
  input: {
    height: 50,
    borderWidth: 1,
    borderRadius: 6,
    paddingHorizontal: 12,
    fontSize: 16,
  },
  description: {
    fontSize: 14,
    marginTop: 8,
    lineHeight: 20,
  },
  buttonContainer: {
    marginTop: 'auto',
    paddingVertical: 16,
  },
  confirmButton: {
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
  },
  confirmText: {
    fontSize: 16,
    fontWeight: '500',
  },
});

export default PowerSettings; 