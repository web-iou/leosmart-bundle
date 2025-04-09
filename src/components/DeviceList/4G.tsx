import {Card, Text, useTheme} from 'react-native-paper';
import {StyleSheet, View, Pressable} from 'react-native';
import {CDN_Url} from '@/config/config';
import FastImageWithSkel from '@/components/FastImageWithSkel';
import AntDesign from 'react-native-vector-icons/AntDesign';
import {useTranslation} from 'react-i18next';
import {ExtendedMD3Theme} from '@/theme';
import React, {useMemo} from 'react';
import {navigationRef} from '@/navigation';
import {formatRelativeTime} from '@/utils/timeUtils';

enum DeviceStatus {
  '离线' = 0,
  '运行中',
  '告警',
}
export default ({deviceData}: {deviceData: any}) => {
  const theme = useTheme() as ExtendedMD3Theme;
  const {t} = useTranslation();
  const formatTime = useMemo(() => {
    return formatRelativeTime(deviceData?.state.lastTime);
  }, [deviceData]);
  // 如果正在加载，显示骨架屏
  return (
    <>
      {/* 设备状态卡片 */}
      <Card style={[styles.card, {backgroundColor: theme.colors.surface}]}>
        <Card.Content>
          <View style={styles.statusSection}>
            <Text
              style={[styles.sectionTitle, {color: theme.colors.onSurface}]}>
              {t('device.status', {defaultValue: '设备状态'})}
            </Text>
            <View style={styles.runningStatus}>
              <View
                style={[
                  styles.statusDot,
                  {
                    backgroundColor:
                      deviceData?.state.state === 1 ? '#4CAF50' : '#F44336',
                  },
                ]}
              />
              <Text
                style={[
                  styles.runningStatusText,
                  {
                    color:
                      deviceData?.state.state === 1 ? '#4CAF50' : '#F44336',
                  },
                ]}>
                {DeviceStatus[deviceData?.state.state!]}
                {/* {deviceData?.status === 1
                    ? t('device.running', {defaultValue: '运行中'})
                    : t('device.stopped', {defaultValue: '已停止'})} */}
              </Text>
            </View>
          </View>

          <View style={styles.deviceDetailSection}>
            <View style={styles.deviceImageContainer}>
              <View style={styles.deviceImage}>
                {/* 这里放置设备图片，但在示例中使用颜色块替代 */}
                <FastImageWithSkel
                  style={styles.deviceImage}
                  defaultSource={require('@/assets/imgs/MP3000-1.png')}
                  source={{
                    uri: CDN_Url + deviceData.image,
                  }}></FastImageWithSkel>
              </View>
            </View>

            <View style={styles.deviceInfoContainer}>
              <View style={styles.infoRow}>
                <View style={styles.infoItem}>
                  <Text className="mb-2">{deviceData.sn}</Text>
                  <Text
                    style={[
                      styles.infoLabel,
                      {color: theme.colors.onSurfaceVariant},
                    ]}>
                    {t('device.lastUpdate', {defaultValue: '上次更新'})}
                  </Text>
                  <Text
                    style={[styles.infoValue, {color: theme.colors.onSurface}]}>
                    {formatTime}
                  </Text>
                </View>
              </View>

              <View style={styles.infoRow}>
                <View style={styles.infoItem}>
                  <Text
                    style={[
                      styles.infoLabel,
                      {color: theme.colors.onSurfaceVariant},
                    ]}>
                    {t('device.runningTime', {defaultValue: '运行时长'})}
                  </Text>
                  <Text
                    style={[styles.infoValue, {color: theme.colors.onSurface}]}>
                    {'168小时'}
                  </Text>
                </View>
                <View style={styles.infoItem}>
                  <Text
                    style={[
                      styles.infoLabel,
                      {color: theme.colors.onSurfaceVariant},
                    ]}>
                    {t('device.communication', {defaultValue: '通信状态'})}
                  </Text>
                  <Text style={[styles.infoValue, {color: '#4CAF50'}]}>
                    正常
                  </Text>
                </View>
              </View>
            </View>
          </View>
        </Card.Content>
      </Card>
      {/* 光伏功率 */}
      <Card style={[styles.card, {backgroundColor: theme.colors.surface}]}>
        <Card.Content>
          <View style={styles.powerSection}>
            <View style={styles.powerHeader}>
              <View style={styles.powerTitleContainer}>
                <AntDesign name="dashboard" size={24} color="#FF9800" />
                <Text
                  style={[
                    styles.sectionTitle,
                    {color: theme.colors.onSurface},
                  ]}>
                  {t('device.pv_power', {defaultValue: '光伏功率'})}
                </Text>
              </View>
              <Text style={[styles.totalPower, {color: '#FF9800'}]}>
                {deviceData?.pvPower.powerTotal.toFixed(1)}W
              </Text>
            </View>

            <View className="mt-2 flex-row flex-wrap justify-between gap-y-3">
              {Object.entries(deviceData?.pvPower!)
                .filter(([key]) => !key.includes('Total'))
                .map(([key, value]) => {
                  return (
                    <Pressable
                      key={key}
                      onPress={() => {
                        navigationRef.navigate('PVChart', {
                          id: deviceData.sn,
                        });
                      }}
                      style={[
                        styles.pvItem,
                        {backgroundColor: theme.colors.surfaceVariant},
                      ]}>
                      <Text
                        style={[
                          styles.pvLabel,
                          {color: theme.colors.onSurfaceVariant},
                        ]}>
                        {key.replace('power', '').toUpperCase()}
                      </Text>
                      <Text
                        style={[
                          styles.pvValue,
                          {color: theme.colors.onSurfaceVariant},
                        ]}>
                        {(value as number).toFixed(1)}W
                      </Text>
                    </Pressable>
                  );
                })}
            </View>
          </View>
        </Card.Content>
      </Card>
      {/* 输出功率和今日发电量 */}
      <View style={styles.rowContainer}>
        {/* 输出功率 */}
        <Card
          onPress={() => {
            // 在路由导航时传入设备ID
            navigationRef.navigate('EquipTimeChart', {
              id: deviceData.sn,
            });
          }}
          style={[styles.halfCard, {backgroundColor: theme.colors.surface}]}>
          <Card.Content>
            <View style={styles.powerCardHeader}>
              <AntDesign name="dashboard" size={24} color="#FF9800" />
              <Text
                style={[styles.cardSubtitle, {color: theme.colors.onSurface}]}>
                {t('device.outputPower', {defaultValue: '输出功率'})}
              </Text>
            </View>

            <Text style={[styles.powerValue, {color: '#FF9800'}]}>
              {deviceData?.out.powerTotal.toFixed(1)}W
            </Text>

            <View style={styles.powerDetailsRow}>
              <View style={styles.detailWithIcon}>
                <AntDesign
                  name="linechart"
                  size={16}
                  color={theme.colors.onSurfaceVariant}
                />
                <Text
                  style={[
                    styles.detailText,
                    {color: theme.colors.onSurfaceVariant},
                  ]}>
                  {t('device.voltage', {defaultValue: '电压'})}:{' '}
                  {deviceData?.out.voltage.toFixed(1)}V
                </Text>
              </View>
              <View style={styles.detailWithIcon}>
                <AntDesign
                  name="linechart"
                  size={16}
                  color={theme.colors.onSurfaceVariant}
                />
                <Text
                  style={[
                    styles.detailText,
                    {color: theme.colors.onSurfaceVariant},
                  ]}>
                  {t('device.current', {defaultValue: '电流'})}:{' '}
                  {deviceData?.out.current.toFixed(1)}A
                </Text>
              </View>
            </View>
          </Card.Content>
        </Card>

        {/* 今日发电量 */}
        <Card
          style={[styles.halfCard, {backgroundColor: theme.colors.surface}]}>
          <Card.Content>
            <View style={styles.powerCardHeader}>
              <AntDesign name="dashboard" size={24} color="#FF9800" />
              <Text
                style={[styles.cardSubtitle, {color: theme.colors.onSurface}]}>
                {t('device.todayGeneration', {defaultValue: '今日发电量'})}
              </Text>
            </View>

            <Text style={[styles.powerValue, {color: '#FF9800'}]}>
              {deviceData?.powerGen.genDay.toFixed(0)}kWh
            </Text>

            <View style={styles.powerDetailsRow}>
              <View style={styles.detailWithIcon}>
                <AntDesign
                  name="linechart"
                  size={16}
                  color={theme.colors.onSurfaceVariant}
                />
                <Text
                  style={[
                    styles.detailText,
                    {color: theme.colors.onSurfaceVariant},
                  ]}>
                  {t('device.totalGeneration', {defaultValue: '累计'})}:{' '}
                  {deviceData?.powerGen.genTotal.toFixed(0)}kWh
                </Text>
              </View>
              <View style={styles.detailWithIcon}>
                <Text>{''}</Text>
              </View>
            </View>
          </Card.Content>
        </Card>
      </View>
      {/* 设备控制 */}
      <Card
        style={[styles.card, {backgroundColor: theme.colors.surface}]}
        onPress={() => {
          navigationRef.navigate('DeviceControl', {
            deviceId: deviceData.id,
            deviceSn: deviceData.sn,
            deviceName: deviceData.name,
          });
        }}>
        <Card.Content>
          <View style={styles.controlHeader}>
            <View style={styles.controlTitleContainer}>
              <View
                style={[
                  styles.controlIcon,
                  {
                    backgroundColor: theme.dark
                      ? theme.colors.surfaceVariant
                      : theme.colors.primaryContainer,
                  },
                ]}>
                <AntDesign
                  name="setting"
                  size={22}
                  color={theme.colors.primary}
                  style={{alignSelf: 'center'}}
                />
              </View>
              <Text
                style={[
                  styles.sectionTitle,
                  {
                    color: theme.colors.onSurface,
                    textAlign: 'left',
                    marginLeft: 10,
                  },
                ]}>
                {t('device.control', {defaultValue: '设备控制'})}
              </Text>
            </View>
            <AntDesign
              name="right"
              size={18}
              color={theme.colors.onSurfaceVariant}
              style={{alignSelf: 'center'}}
            />
          </View>

          <View style={styles.signalStatus}>
            <View
              style={[
                styles.signalIconContainer,
                {
                  backgroundColor: theme.dark
                    ? 'rgba(255, 255, 255, 0.1)'
                    : theme.colors.surfaceVariant,
                  marginLeft: 5,
                },
              ]}>
              <AntDesign
                name="wifi"
                size={16}
                color="#4CAF50"
                style={{alignSelf: 'center'}}
              />
            </View>
            <Text
              style={[
                styles.signalText,
                {color: theme.colors.onSurfaceVariant},
              ]}>
              4G {t('device.signalStrength', {defaultValue: '信号强度'})}:{' '}
              <Text style={{color: '#4CAF50', fontWeight: '600'}}>优</Text>
            </Text>
          </View>
        </Card.Content>
      </Card>
      {/* 环境参数 */}
      {/* <Card style={[styles.card, {backgroundColor: theme.colors.surface}]}>
          <Card.Content>
            <View style={styles.environmentHeader}>
              <AntDesign name="dashboard" size={24} color="#FF9800" />
              <Text
                style={[styles.sectionTitle, {color: theme.colors.onSurface}]}>
                {t('device.environment', {defaultValue: '环境参数'})}
              </Text>
            </View>

            <View style={styles.environmentParams}>
              <View style={styles.environmentItem}>
                <Text
                  style={[
                    styles.environmentLabel,
                    {color: theme.colors.onSurfaceVariant},
                  ]}>
                  {t('device.temperature', {defaultValue: '温度'})}
                </Text>
                <Text
                  style={[
                    styles.environmentValue,
                    {color: theme.colors.onSurface},
                  ]}>
                  {deviceData.environment.temperature}°C
                </Text>
              </View>

              <View style={styles.environmentItem}>
                <Text
                  style={[
                    styles.environmentLabel,
                    {color: theme.colors.onSurfaceVariant},
                  ]}>
                  {t('device.humidity', {defaultValue: '湿度'})}
                </Text>
                <Text
                  style={[
                    styles.environmentValue,
                    {color: theme.colors.onSurface},
                  ]}>
                  {deviceData.environment.humidity}%
                </Text>
              </View>

              <View style={styles.environmentItem}>
                <Text
                  style={[
                    styles.environmentLabel,
                    {color: theme.colors.onSurfaceVariant},
                  ]}>
                  {t('device.noise', {defaultValue: '噪音'})}
                </Text>
                <Text
                  style={[
                    styles.environmentValue,
                    {color: theme.colors.onSurface},
                  ]}>
                  {deviceData.environment.noise}dB
                </Text>
              </View>
            </View>
          </Card.Content>
        </Card> */}
      {/* 告警信息 */}
      <Card style={[styles.card, {backgroundColor: theme.colors.surface}]}>
        <Card.Content>
          <View style={styles.alertHeader}>
            <AntDesign name="warning" size={24} color="#FF9800" />
            <Text
              style={[styles.sectionTitle, {color: theme.colors.onSurface}]}>
              {t('device.alerts', {defaultValue: '告警信息'})}
            </Text>
          </View>

          <View style={styles.systemMessage}>
            <View style={styles.systemMessageIcon}>
              <AntDesign name="infocircleo" size={20} color="#2196F3" />
            </View>
            <View style={styles.systemMessageContent}>
              <Text
                style={[
                  styles.systemMessageText,
                  {color: theme.colors.onSurface},
                ]}>
                {t('device.systemMessage', {defaultValue: '系统提示'})}
              </Text>
              <Text
                style={[styles.alertMessage, {color: theme.colors.onSurface}]}>
                设备运行正常，无告警信息
              </Text>
            </View>
            <Text
              style={[
                styles.alertTime,
                {color: theme.colors.onSurfaceVariant},
              ]}>
              12:30
            </Text>
          </View>
        </Card.Content>
      </Card>
    </>
  );
};
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  deviceTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  deviceIconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FF9800',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  deviceName: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  card: {
    margin: 16,
    borderRadius: 12,
    elevation: 1,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  statusSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  runningStatus: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 4,
  },
  runningStatusText: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  deviceDetailSection: {
    flexDirection: 'row',
    marginTop: 16,
  },
  deviceImageContainer: {
    width: 100,
  },
  deviceImage: {
    width: 80,
    height: 120,
    // backgroundColor: '#FF9800',
    borderRadius: 8,
  },
  deviceInfoContainer: {
    flex: 1,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  infoItem: {},
  infoLabel: {
    fontSize: 14,
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  powerSection: {},
  powerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  powerTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  totalPower: {
    fontSize: 22,
    fontWeight: 'bold',
  },
  pvGrid: {
    marginTop: 8,
  },
  pvRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  pvItem: {
    width: '48%',
    padding: 12,
    borderRadius: 8,
  },
  pvLabel: {
    fontSize: 14,
    marginBottom: 4,
  },
  pvValue: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  rowContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginHorizontal: 16,
    marginBottom: 16,
  },
  halfCard: {
    width: '48%',
    borderRadius: 12,
    elevation: 1,
    minHeight: 100,
  },
  powerCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  cardSubtitle: {
    fontSize: 14,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  powerValue: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  powerDetailsRow: {
    marginTop: 8,
  },
  detailWithIcon: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  detailText: {
    fontSize: 12,
    marginLeft: 4,
  },
  controlHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  controlTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  controlIcon: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#FFF0E0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  signalStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
    paddingLeft: 5,
    paddingBottom: 4,
    height: 30,
  },
  signalText: {
    fontSize: 14,
    marginLeft: 8,
    lineHeight: 18,
  },
  environmentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  environmentParams: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  environmentItem: {
    alignItems: 'center',
  },
  environmentLabel: {
    fontSize: 14,
    marginBottom: 8,
  },
  environmentValue: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  alertHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  systemMessage: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  systemMessageIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#E3F2FD',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  systemMessageContent: {
    flex: 1,
  },
  systemMessageText: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  alertMessage: {
    fontSize: 14,
  },
  alertTime: {
    fontSize: 12,
  },
  signalIconContainer: {
    width: 30,
    height: 30,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 6,
  },
});
