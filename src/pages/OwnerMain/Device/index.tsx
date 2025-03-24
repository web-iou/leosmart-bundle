import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, RefreshControl } from 'react-native';
import { Text, Card, useTheme } from 'react-native-paper';
import { useTranslation } from 'react-i18next';
import AntDesign from 'react-native-vector-icons/AntDesign';
import { ExtendedMD3Theme } from '@/theme';
import SafeAreaLayout from '@/components/SafeAreaLayout';

interface DevicePageProps {
  navigation: any;
}

const DevicePage: React.FC<DevicePageProps> = ({ navigation: _navigation }) => {
  const { t } = useTranslation();
  const theme = useTheme() as ExtendedMD3Theme;
  const [refreshing, setRefreshing] = useState(false);

  // 模拟设备数据 - 实际开发中会从API获取
  const deviceData = {
    name: 'Leo inverter',
    status: {
      running: true,
      workingStatus: '正常工作中',
      lastUpdate: '1分钟前',
      runningTime: '168小时',
      communicationStatus: '良好'
    },
    pvPower: {
      total: 1200,
      pv1: 400,
      pv2: 400,
      pv3: 400,
      pv4: 400
    },
    outputPower: {
      power: 1200,
      voltage: 220,
      current: 5.5
    },
    generation: {
      today: 3.1,
      total: 330
    },
    control: {
      signalStrength: '优'
    },
    environment: {
      temperature: 28,
      humidity: 65,
      noise: 45
    },
    alerts: [
      {
        message: '设备运行正常，无告警信息',
        time: '12:30'
      }
    ]
  };

  const onRefresh = () => {
    setRefreshing(true);
    // 这里应该调用API刷新设备数据
    // 模拟API调用延迟
    setTimeout(() => {
      setRefreshing(false);
    }, 1000);
  };

  return (
    <SafeAreaLayout>
      <ScrollView 
        style={[styles.container, { backgroundColor: theme.colors.background }]}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* 设备标题 */}
        <View style={styles.header}>
          <View style={styles.deviceTitleContainer}>
            <View style={styles.deviceIconCircle}>
              <AntDesign 
                name="thunderbolt" 
                size={24} 
                color="#FFFFFF" 
              />
            </View>
            <Text style={[styles.deviceName, { color: theme.colors.onBackground }]}>
              {deviceData.name}
            </Text>
          </View>
          <TouchableOpacity onPress={onRefresh}>
            <AntDesign 
              name="reload1" 
              size={24} 
              color={theme.colors.onBackground} 
            />
          </TouchableOpacity>
        </View>
        
        {/* 设备状态卡片 */}
        <Card style={[styles.card, { backgroundColor: theme.colors.surface }]}>
          <Card.Content>
            <View style={styles.statusSection}>
              <Text style={[styles.sectionTitle, { color: theme.colors.onSurface }]}>
                {t('device.status', { defaultValue: '设备状态' })}
              </Text>
              <View style={styles.runningStatus}>
                <View style={[styles.statusDot, { backgroundColor: deviceData.status.running ? '#4CAF50' : '#F44336' }]} />
                <Text style={[styles.runningStatusText, { color: deviceData.status.running ? '#4CAF50' : '#F44336' }]}>
                  {deviceData.status.running 
                    ? t('device.running', { defaultValue: '运行中' })
                    : t('device.stopped', { defaultValue: '已停止' })}
                </Text>
              </View>
            </View>

            <View style={styles.deviceDetailSection}>
              <View style={styles.deviceImageContainer}>
                <View style={styles.deviceImage}>
                  {/* 这里放置设备图片，但在示例中使用颜色块替代 */}
                </View>
              </View>
              
              <View style={styles.deviceInfoContainer}>
                <View style={styles.infoRow}>
                  <View style={styles.infoItem}>
                    <Text style={[styles.infoLabel, { color: theme.colors.onSurfaceVariant }]}>
                      {t('device.lastUpdate', { defaultValue: '上次更新' })}
                    </Text>
                    <Text style={[styles.infoValue, { color: theme.colors.onSurface }]}>
                      {deviceData.status.lastUpdate}
                    </Text>
                  </View>
                </View>
                
                <View style={styles.infoRow}>
                  <View style={styles.infoItem}>
                    <Text style={[styles.infoLabel, { color: theme.colors.onSurfaceVariant }]}>
                      {t('device.runningTime', { defaultValue: '运行时长' })}
                    </Text>
                    <Text style={[styles.infoValue, { color: theme.colors.onSurface }]}>
                      {deviceData.status.runningTime}
                    </Text>
                  </View>
                  <View style={styles.infoItem}>
                    <Text style={[styles.infoLabel, { color: theme.colors.onSurfaceVariant }]}>
                      {t('device.communication', { defaultValue: '通信状态' })}
                    </Text>
                    <Text style={[styles.infoValue, { color: '#4CAF50' }]}>
                      {deviceData.status.communicationStatus}
                    </Text>
                  </View>
                </View>
              </View>
            </View>
          </Card.Content>
        </Card>

        {/* 光伏功率 */}
        <Card style={[styles.card, { backgroundColor: theme.colors.surface }]}>
          <Card.Content>
            <View style={styles.powerSection}>
              <View style={styles.powerHeader}>
                <View style={styles.powerTitleContainer}>
                  <AntDesign 
                    name="iconfontdesktop" 
                    size={24} 
                    color="#FF9800" 
                  />
                  <Text style={[styles.sectionTitle, { color: theme.colors.onSurface }]}>
                    {t('device.pv_power', { defaultValue: '光伏功率' })}
                  </Text>
                </View>
                <Text style={[styles.totalPower, { color: '#FF9800' }]}>
                  {deviceData.pvPower.total}W
                </Text>
              </View>

              <View style={styles.pvGrid}>
                <View style={styles.pvRow}>
                  <View style={[styles.pvItem, { backgroundColor: theme.colors.surfaceVariant }]}>
                    <Text style={[styles.pvLabel, { color: theme.colors.onSurfaceVariant }]}>
                      PV1
                    </Text>
                    <Text style={[styles.pvValue, { color: theme.colors.onSurfaceVariant }]}>
                      {deviceData.pvPower.pv1}W
                    </Text>
                  </View>
                  <View style={[styles.pvItem, { backgroundColor: theme.colors.surfaceVariant }]}>
                    <Text style={[styles.pvLabel, { color: theme.colors.onSurfaceVariant }]}>
                      PV2
                    </Text>
                    <Text style={[styles.pvValue, { color: theme.colors.onSurfaceVariant }]}>
                      {deviceData.pvPower.pv2}W
                    </Text>
                  </View>
                </View>
                <View style={styles.pvRow}>
                  <View style={[styles.pvItem, { backgroundColor: theme.colors.surfaceVariant }]}>
                    <Text style={[styles.pvLabel, { color: theme.colors.onSurfaceVariant }]}>
                      PV3
                    </Text>
                    <Text style={[styles.pvValue, { color: theme.colors.onSurfaceVariant }]}>
                      {deviceData.pvPower.pv3}W
                    </Text>
                  </View>
                  <View style={[styles.pvItem, { backgroundColor: theme.colors.surfaceVariant }]}>
                    <Text style={[styles.pvLabel, { color: theme.colors.onSurfaceVariant }]}>
                      PV4
                    </Text>
                    <Text style={[styles.pvValue, { color: theme.colors.onSurfaceVariant }]}>
                      {deviceData.pvPower.pv4}W
                    </Text>
                  </View>
                </View>
              </View>
            </View>
          </Card.Content>
        </Card>

        {/* 输出功率和今日发电量 */}
        <View style={styles.rowContainer}>
          {/* 输出功率 */}
          <Card style={[styles.halfCard, { backgroundColor: theme.colors.surface }]}>
            <Card.Content>
              <View style={styles.powerCardHeader}>
                <AntDesign 
                  name="iconfontdesktop" 
                  size={24} 
                  color="#FF9800" 
                />
                <Text style={[styles.cardSubtitle, { color: theme.colors.onSurface }]}>
                  {t('device.outputPower', { defaultValue: '输出功率' })}
                </Text>
              </View>
              
              <Text style={[styles.powerValue, { color: '#FF9800' }]}>
                {deviceData.outputPower.power}W
              </Text>
              
              <View style={styles.powerDetailsRow}>
                <View style={styles.detailWithIcon}>
                  <AntDesign 
                    name="iconfontdesktop" 
                    size={16} 
                    color={theme.colors.onSurfaceVariant} 
                  />
                  <Text style={[styles.detailText, { color: theme.colors.onSurfaceVariant }]}>
                    {t('device.voltage', { defaultValue: '电压' })}: {deviceData.outputPower.voltage}V
                  </Text>
                </View>
                <View style={styles.detailWithIcon}>
                  <AntDesign 
                    name="iconfontdesktop" 
                    size={16} 
                    color={theme.colors.onSurfaceVariant} 
                  />
                  <Text style={[styles.detailText, { color: theme.colors.onSurfaceVariant }]}>
                    {t('device.current', { defaultValue: '电流' })}: {deviceData.outputPower.current}A
                  </Text>
                </View>
              </View>
            </Card.Content>
          </Card>

          {/* 今日发电量 */}
          <Card style={[styles.halfCard, { backgroundColor: theme.colors.surface }]}>
            <Card.Content>
              <View style={styles.powerCardHeader}>
                <AntDesign 
                  name="iconfontdesktop" 
                  size={24} 
                  color="#FF9800" 
                />
                <Text style={[styles.cardSubtitle, { color: theme.colors.onSurface }]}>
                  {t('device.todayGeneration', { defaultValue: '今日发电量' })}
                </Text>
              </View>
              
              <Text style={[styles.powerValue, { color: '#FF9800' }]}>
                {deviceData.generation.today}kWh
              </Text>
              
              <View style={styles.powerDetailsRow}>
                <View style={styles.detailWithIcon}>
                  <AntDesign 
                    name="chart-line" 
                    size={16} 
                    color={theme.colors.onSurfaceVariant} 
                  />
                  <Text style={[styles.detailText, { color: theme.colors.onSurfaceVariant }]}>
                    {t('device.totalGeneration', { defaultValue: '累计' })}: {deviceData.generation.total}kWh
                  </Text>
                </View>
              </View>
            </Card.Content>
          </Card>
        </View>

        {/* 设备控制 */}
        <Card style={[styles.card, { backgroundColor: theme.colors.surface }]}>
          <Card.Content>
            <View style={styles.controlHeader}>
              <View style={styles.controlIcon}>
                <AntDesign 
                  name="setting" 
                  size={24} 
                  color="#FF9800" 
                />
              </View>
              <Text style={[styles.sectionTitle, { color: theme.colors.onSurface }]}>
                {t('device.control', { defaultValue: '设备控制' })}
              </Text>
              <AntDesign name="right" size={20} color={theme.colors.onSurfaceVariant} />
            </View>
            
            <View style={styles.signalStatus}>
              <AntDesign name="wifi" size={20} color="#4CAF50" />
              <Text style={[styles.signalText, { color: theme.colors.onSurfaceVariant }]}>
                4G {t('device.signalStrength', { defaultValue: '信号强度' })}: {deviceData.control.signalStrength}
              </Text>
            </View>
          </Card.Content>
        </Card>

        {/* 环境参数 */}
        <Card style={[styles.card, { backgroundColor: theme.colors.surface }]}>
          <Card.Content>
            <View style={styles.environmentHeader}>
              <AntDesign 
                name="dashboard" 
                size={24} 
                color="#FF9800" 
              />
              <Text style={[styles.sectionTitle, { color: theme.colors.onSurface }]}>
                {t('device.environment', { defaultValue: '环境参数' })}
              </Text>
            </View>
            
            <View style={styles.environmentParams}>
              <View style={styles.environmentItem}>
                <Text style={[styles.environmentLabel, { color: theme.colors.onSurfaceVariant }]}>
                  {t('device.temperature', { defaultValue: '温度' })}
                </Text>
                <Text style={[styles.environmentValue, { color: theme.colors.onSurface }]}>
                  {deviceData.environment.temperature}°C
                </Text>
              </View>
              
              <View style={styles.environmentItem}>
                <Text style={[styles.environmentLabel, { color: theme.colors.onSurfaceVariant }]}>
                  {t('device.humidity', { defaultValue: '湿度' })}
                </Text>
                <Text style={[styles.environmentValue, { color: theme.colors.onSurface }]}>
                  {deviceData.environment.humidity}%
                </Text>
              </View>
              
              <View style={styles.environmentItem}>
                <Text style={[styles.environmentLabel, { color: theme.colors.onSurfaceVariant }]}>
                  {t('device.noise', { defaultValue: '噪音' })}
                </Text>
                <Text style={[styles.environmentValue, { color: theme.colors.onSurface }]}>
                  {deviceData.environment.noise}dB
                </Text>
              </View>
            </View>
          </Card.Content>
        </Card>

        {/* 告警信息 */}
        <Card style={[styles.card, { backgroundColor: theme.colors.surface }]}>
          <Card.Content>
            <View style={styles.alertHeader}>
              <AntDesign 
                name="warning" 
                size={24} 
                color="#FF9800" 
              />
              <Text style={[styles.sectionTitle, { color: theme.colors.onSurface }]}>
                {t('device.alerts', { defaultValue: '告警信息' })}
              </Text>
            </View>

            <View style={styles.systemMessage}>
              <View style={styles.systemMessageIcon}>
                <AntDesign name="infocirlceo" size={20} color="#2196F3" />
              </View>
              <View style={styles.systemMessageContent}>
                <Text style={[styles.systemMessageText, { color: theme.colors.onSurface }]}>
                  {t('device.systemMessage', { defaultValue: '系统提示' })}
                </Text>
                <Text style={[styles.alertMessage, { color: theme.colors.onSurface }]}>
                  设备运行正常，无告警信息
                </Text>
              </View>
              <Text style={[styles.alertTime, { color: theme.colors.onSurfaceVariant }]}>
                12:30
              </Text>
            </View>
          </Card.Content>
        </Card>
      </ScrollView>
    </SafeAreaLayout>
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
    marginHorizontal: 16,
    marginBottom: 16,
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
    backgroundColor: '#FF9800',
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
  },
  controlIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFF0E0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  signalStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
  },
  signalText: {
    fontSize: 14,
    marginLeft: 8,
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
});

export default DevicePage; 