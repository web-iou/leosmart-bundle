import React, {useEffect, useLayoutEffect, useState} from 'react';
import {View, StyleSheet, ScrollView, Switch, Alert} from 'react-native';
import {Text, useTheme, List, Divider} from 'react-native-paper';
import {useTranslation} from 'react-i18next';
import Icon from 'react-native-vector-icons/AntDesign';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import {ExtendedMD3Theme} from '@/theme';
import {deviceApi, EquipSetCommand} from '@/services/api/deviceApi';
import {StatusBar} from 'react-native';
import {showToast} from '@/store/slices/toastSlice';
import {useDispatch} from 'react-redux';

// 设备控制页面
const DeviceControl = ({
  route,
  navigation,
}: ReactNavigation.Navigation<'DeviceControl'>) => {
  const {t} = useTranslation();
  const theme = useTheme() as ExtendedMD3Theme;
  const dispatch = useDispatch();
  const {deviceId, deviceSn, deviceName} = route.params;

  // 设备信息状态
  const [deviceInfo, _setDeviceInfo] = useState({
    model: 'Smart-2023',
    version: 'v2.1.0',
    macAddress: 'A1:B2:C3:D4:E5:F6',
  });

  // 远程开关机状态
  const [remoteShutdownEnabled, setRemoteShutdownEnabled] = useState(false);
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
      title: deviceName || t('device.control', {defaultValue: '设置'}),
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
  }, [
    navigation,
    t,
    theme.colors.background,
    theme.colors.onBackground,
    deviceName,
  ]);

  // 处理远程开关机切换
  const handleRemoteShutdownToggle = async (value: boolean) => {
    try {
      setLoading(true);

      // 调用API设置设备参数
      const command: EquipSetCommand = {
        cmdType: 'remote_shutdown',
        value: value ? '1' : '0',
      };

      const {data: success} = await deviceApi.setEquipmentParams(
        deviceSn,
        command,
      );

      if (success) {
        setRemoteShutdownEnabled(value);
        dispatch(
          showToast({
            message: t('common.operationSuccess', {defaultValue: '操作成功'}),
            type: 'success',
          }),
        );
      } else {
        throw new Error('Operation failed');
      }
    } catch (error) {
      console.error('Failed to toggle remote shutdown:', error);
      dispatch(
        showToast({
          message: t('common.operationFailed', {defaultValue: '操作失败'}),
          type: 'error',
        }),
      );
      // 恢复原状态
      setRemoteShutdownEnabled(!value);
    } finally {
      setLoading(false);
    }
  };

  // 打开功率调节页面
  const openPowerAdjustment = () => {
    // TODO: 导航到功率调节页面
    Alert.prompt(
      t('device.powerAdjustment', {defaultValue: '功率调节'}),
      t('common.comingSoon', {defaultValue: '请输入功率'}),
      [
        {
          text: t('user.logOutCancel', {defaultValue: '取消'}),
        },
        {
          text: t('dytable.submit'),
          onPress(value) {
            !!value &&
              deviceApi.setEquipmentParams(deviceSn, {
                cmdType: '功率调节',
                value: value!,
              });
          },
        },
      ],
    );
  };

  return (
    <>
      <ScrollView
        style={[styles.container, {backgroundColor: theme.colors.background}]}>
        {/* 基本设置 */}
        <View style={styles.section}>
          <Text
            style={[
              styles.sectionTitle,
              {
                color: theme.dark
                  ? 'rgba(255, 255, 255, 0.7)'
                  : 'rgba(0, 0, 0, 0.6)',
              },
            ]}>
            {t('device.basicSettings', {defaultValue: '基本设置'})}
          </Text>

          <View style={[styles.card, {backgroundColor: theme.colors.surface}]}>
            {/* 功率调节 */}
            <List.Item
              title={t('device.powerAdjustment', {defaultValue: '功率调节'})}
              description={t('device.adjustOutputPower', {
                defaultValue: '调节设备输出功率',
              })}
              left={_props => (
                <View
                  style={[
                    styles.iconContainer,
                    {
                      backgroundColor: theme.dark
                        ? theme.colors.surfaceVariant
                        : theme.colors.primaryContainer,
                    },
                  ]}>
                  <Icon
                    style={{alignSelf: 'center'}}
                    name="dashboard"
                    size={22}
                    color={theme.colors.primary}
                  />
                </View>
              )}
              right={_props => (
                <Icon
                  style={{alignSelf: 'center'}}
                  name="right"
                  size={16}
                  color={theme.colors.onSurfaceVariant}
                />
              )}
              titleStyle={[styles.itemTitle, {color: theme.colors.onSurface}]}
              descriptionStyle={[
                styles.itemDescription,
                {color: theme.colors.onSurfaceVariant},
              ]}
              onPress={openPowerAdjustment}
              style={styles.listItem}
            />

            <Divider
              style={{
                backgroundColor: theme.dark
                  ? 'rgba(255, 255, 255, 0.1)'
                  : theme.colors.outlineVariant,
              }}
            />

            {/* 远程开关机 */}
            <List.Item
              title={t('device.remoteShutdown', {defaultValue: '远程开关机'})}
              description={t('device.remoteShutdownDesc', {
                defaultValue: '远程控制设备开关',
              })}
              left={_props => (
                <View
                  style={[
                    styles.iconContainer,
                    {
                      backgroundColor: theme.dark
                        ? theme.colors.surfaceVariant
                        : theme.colors.primaryContainer,
                    },
                  ]}>
                  <Icon
                    style={{alignSelf: 'center'}}
                    name="poweroff"
                    size={22}
                    color={theme.colors.primary}
                  />
                </View>
              )}
              right={_props => (
                <Switch
                  value={remoteShutdownEnabled}
                  onValueChange={handleRemoteShutdownToggle}
                  disabled={loading}
                  trackColor={{
                    false: theme.dark
                      ? 'rgba(255, 255, 255, 0.15)'
                      : theme.colors.outlineVariant,
                    true: theme.colors.primary,
                  }}
                  thumbColor={
                    remoteShutdownEnabled
                      ? theme.colors.onPrimary
                      : theme.dark
                      ? theme.colors.onSurfaceVariant
                      : theme.colors.surface
                  }
                  ios_backgroundColor={theme.colors.surfaceVariant}
                  style={styles.switch}
                />
              )}
              titleStyle={[styles.itemTitle, {color: theme.colors.onSurface}]}
              descriptionStyle={[
                styles.itemDescription,
                {color: theme.colors.onSurfaceVariant},
              ]}
              style={styles.listItem}
            />
          </View>
        </View>

        {/* 系统设置 */}
        <View style={styles.section}>
          <Text
            style={[
              styles.sectionTitle,
              {
                color: theme.dark
                  ? 'rgba(255, 255, 255, 0.7)'
                  : 'rgba(0, 0, 0, 0.6)',
              },
            ]}>
            {t('device.systemSettings', {defaultValue: '系统设置'})}
          </Text>

          <View style={[styles.card, {backgroundColor: theme.colors.surface}]}>
            {/* 恢复出厂设置 */}
            <List.Item
              title={t('device.factoryReset', {defaultValue: '恢复出厂设置'})}
              description={t('device.factoryResetDesc', {
                defaultValue: '重置所有数据及设置',
              })}
              left={_props => (
                <View
                  style={[
                    styles.iconContainer,
                    {
                      backgroundColor: theme.dark
                        ? theme.colors.surfaceVariant
                        : theme.colors.primaryContainer,
                    },
                  ]}>
                  <MaterialIcons
                    style={{alignSelf: 'center'}}
                    name="settings-backup-restore"
                    size={22}
                    color={theme.colors.primary}
                  />
                </View>
              )}
              right={_props => (
                <Icon
                  style={{alignSelf: 'center'}}
                  name="right"
                  size={16}
                  color={theme.colors.onSurfaceVariant}
                />
              )}
              titleStyle={[styles.itemTitle, {color: theme.colors.onSurface}]}
              descriptionStyle={[
                styles.itemDescription,
                {color: theme.colors.onSurfaceVariant},
              ]}
              onPress={() => {
                Alert.alert(
                  t('device.factoryReset', {defaultValue: '恢复出厂设置'}),
                  t('device.factoryResetConfirm', {
                    defaultValue: '确定要恢复出厂设置吗？此操作不可逆。',
                  }),
                  [
                    {
                      text: t('common.cancel', {defaultValue: '取消'}),
                      style: 'cancel',
                    },
                    {
                      text: t('common.confirm', {defaultValue: '确定'}),
                      onPress: () => {
                        deviceApi.setEquipmentParams(deviceSn, {
                          cmdType: '恢复出厂设置',
                          value: '1',
                        });
                      },
                    },
                  ],
                );
              }}
              style={styles.listItem}
            />

            <Divider
              style={{
                backgroundColor: theme.dark
                  ? 'rgba(255, 255, 255, 0.1)'
                  : theme.colors.outlineVariant,
              }}
            />

            {/* 安全信息 */}
            <List.Item
              title={t('device.securityInfo', {defaultValue: '安全信息'})}
              description={t('device.securityInfoDesc', {
                defaultValue: '查看设备安全认证信息',
              })}
              left={_props => (
                <View
                  style={[
                    styles.iconContainer,
                    {
                      backgroundColor: theme.dark
                        ? theme.colors.surfaceVariant
                        : theme.colors.primaryContainer,
                    },
                  ]}>
                  <Icon
                    style={{alignSelf: 'center'}}
                    name="Safety"
                    size={22}
                    color={theme.colors.primary}
                  />
                </View>
              )}
              right={_props => (
                <Icon
                  style={{alignSelf: 'center'}}
                  name="right"
                  size={16}
                  color={theme.colors.onSurfaceVariant}
                />
              )}
              titleStyle={[styles.itemTitle, {color: theme.colors.onSurface}]}
              descriptionStyle={[
                styles.itemDescription,
                {color: theme.colors.onSurfaceVariant},
              ]}
              onPress={() => {
                // TODO: 导航到安全信息页面
                Alert.alert(
                  t('device.securityInfo', {defaultValue: '安全信息'}),
                  t('common.comingSoon', {defaultValue: '即将推出，敬请期待'}),
                );
              }}
              style={styles.listItem}
            />
          </View>
        </View>

        {/* 设备信息 */}
        <View style={styles.section}>
          <Text
            style={[
              styles.sectionTitle,
              {
                color: theme.dark
                  ? 'rgba(255, 255, 255, 0.7)'
                  : 'rgba(0, 0, 0, 0.6)',
              },
            ]}>
            {t('device.deviceInfo', {defaultValue: '设备信息'})}
          </Text>

          <View style={[styles.card, {backgroundColor: theme.colors.surface}]}>
            <View style={styles.infoRow}>
              <Text
                style={[
                  styles.infoLabel,
                  {
                    color: theme.dark
                      ? 'rgba(255, 255, 255, 0.7)'
                      : 'rgba(0, 0, 0, 0.6)',
                  },
                ]}>
                {t('device.deviceId', {defaultValue: '设备型号'})}
              </Text>
              <Text style={[styles.infoValue, {color: theme.colors.primary}]}>
                {deviceInfo.model}
              </Text>
            </View>

            <Divider
              style={{
                backgroundColor: theme.dark
                  ? 'rgba(255, 255, 255, 0.1)'
                  : theme.colors.outlineVariant,
              }}
            />

            <View style={styles.infoRow}>
              <Text
                style={[
                  styles.infoLabel,
                  {
                    color: theme.dark
                      ? 'rgba(255, 255, 255, 0.7)'
                      : 'rgba(0, 0, 0, 0.6)',
                  },
                ]}>
                {t('device.softwareVersion', {defaultValue: '软件版本'})}
              </Text>
              <Text style={[styles.infoValue, {color: theme.colors.primary}]}>
                {deviceInfo.version}
              </Text>
            </View>

            <Divider
              style={{
                backgroundColor: theme.dark
                  ? 'rgba(255, 255, 255, 0.1)'
                  : theme.colors.outlineVariant,
              }}
            />

            <View style={styles.infoRow}>
              <Text
                style={[
                  styles.infoLabel,
                  {
                    color: theme.dark
                      ? 'rgba(255, 255, 255, 0.7)'
                      : 'rgba(0, 0, 0, 0.6)',
                  },
                ]}>
                {t('device.macAddress', {defaultValue: 'MAC 地址'})}
              </Text>
              <Text style={[styles.infoValue, {color: theme.colors.primary}]}>
                {deviceInfo.macAddress}
              </Text>
            </View>

            <Divider
              style={{
                backgroundColor: theme.dark
                  ? 'rgba(255, 255, 255, 0.1)'
                  : theme.colors.outlineVariant,
              }}
            />

            <View style={styles.infoRow}>
              <Text
                style={[
                  styles.infoLabel,
                  {
                    color: theme.dark
                      ? 'rgba(255, 255, 255, 0.7)'
                      : 'rgba(0, 0, 0, 0.6)',
                  },
                ]}>
                {t('device.internalId', {defaultValue: '设备ID'})}
              </Text>
              <Text style={[styles.infoValue, {color: theme.colors.primary}]}>
                {deviceId}
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  section: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '500',
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  card: {
    marginHorizontal: 16,
    borderRadius: 12,
  },
  listItem: {
    paddingVertical: 16,
    paddingRight: 12,
    alignItems: 'center',
  },
  itemTitle: {
    fontSize: 16,
    fontWeight: '500',
  },
  itemDescription: {
    fontSize: 14,
    marginTop: 3,
    lineHeight: 20,
  },
  iconContainer: {
    width: 42,
    height: 42,
    borderRadius: 21,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
    marginLeft: 8,
  },
  switch: {
    transform: [{scaleX: 0.85}, {scaleY: 0.85}], // 稍微缩小Switch使其更协调
    marginRight: -5, // 补偿缩小后的空间
    alignSelf: 'center',
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  infoLabel: {
    fontSize: 15,
  },
  infoValue: {
    fontSize: 15,
    fontWeight: '500',
  },
});

export default DeviceControl;
