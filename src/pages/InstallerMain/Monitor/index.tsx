import React, {useState, useEffect} from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
} from 'react-native';
import {Text, useTheme, Avatar} from 'react-native-paper';
import {useTranslation} from 'react-i18next';
import Icon from 'react-native-vector-icons/AntDesign';
import {ExtendedMD3Theme} from '@/theme';
import SafeAreaLayout from '@/components/SafeAreaLayout';
import {RouteProp, useRoute} from '@react-navigation/native';

type RootStackParamList = {
  Monitor: {
    filter?: string;
  };
};

type MonitorScreenRouteProp = RouteProp<RootStackParamList, 'Monitor'>;

interface DeviceItem {
  id: string;
  name: string;
  status: 'running' | 'offline' | 'warning';
  user: string;
  sn: string;
  model: string;
  lastOnline?: string;
}

const Monitor: React.FC = () => {
  const {t} = useTranslation();
  const theme = useTheme() as ExtendedMD3Theme;
  const route = useRoute<MonitorScreenRouteProp>();
  const [searchText, setSearchText] = useState('');
  const [activeTab, setActiveTab] = useState('all');

  // 处理路由参数
  useEffect(() => {
    if (route.params?.filter) {
      setActiveTab(route.params.filter);
    }
  }, [route.params?.filter]);

  // 模拟设备数据，实际应从API获取
  const [devices] = useState<DeviceItem[]>([
    {
      id: 'A1',
      name: t('device.equipment') + ' A1',
      status: 'running',
      user: 'Alexander.Johnson@tsun-eess.com',
      sn: 'TSUN-MS2000-A1B2C3',
      model: 'MS2000 Pro',
      lastOnline: t('workplace.minute', {count: 2}),
    },
    {
      id: 'B2',
      name: t('device.equipment') + ' B2',
      status: 'offline',
      user: 'Emily.Williams@tsun-eess.com',
      sn: 'TSUN-MS2000-D4E5F6',
      model: 'MS2000 Pro',
      lastOnline: t('workplace.minute', {count: 5}),
    },
    {
      id: 'C3',
      name: t('device.equipment') + ' C3',
      status: 'warning',
      user: 'Michael.Brown@tsun-eess.com',
      sn: 'TSUN-MS2000-G7H8I9',
      model: 'MS2000 Pro',
      lastOnline: t('common.general'),
    },
  ]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'running':
        return theme.colors.primary;
      case 'offline':
        return theme.colors.outline;
      case 'warning':
        return theme.colors.error;
      default:
        return theme.colors.outline;
    }
  };

  // const getStatusText = (status: string) => {
  //   switch (status) {
  //     case 'running':
  //       return t('device.equipment_control');
  //     case 'offline':
  //       return t('device.equipment');
  //     case 'warning':
  //       return t('user.alarminformation');
  //     default:
  //       return '';
  //   }
  // };

  // 筛选标签数据
  const filterTabs = [
    {
      id: 'all',
      title: t('monitor.chat.options.all'),
      count: 300,
      color: theme.colors.primary,
      bgColor: theme.colors.primary + '15',
    },
    {
      id: 'online',
      title: t('monitor.tab.title.online'),
      count: 270,
      color: theme.colors.primary,
      bgColor: theme.colors.primary + '15',
    },
    {
      id: 'offline',
      title: t('monitor.tab.title.offline'),
      count: 20,
      color: theme.colors.outline,
      bgColor: theme.colors.surfaceVariant,
    },
    {
      id: 'fault',
      title: t('monitor.tab.title.fault'),
      count: 10,
      color: theme.colors.error,
      bgColor: theme.colors.error + '15',
    },
  ];

  const renderDeviceItem = ({item}: {item: DeviceItem}) => (
    <TouchableOpacity
      style={[
        styles.deviceCard,
        {
          backgroundColor: theme.colors.surface,
          borderColor: theme.colors.outlineVariant + '15',
        },
      ]}>
      <View style={styles.cardContainer}>
        {/* 左侧设备图片 */}
        <View 
          style={[
            styles.imageContainer, 
            {backgroundColor: theme.colors.primary + '10'}
          ]}>
          <Avatar.Icon 
            size={60} 
            icon="devices" 
            color={theme.colors.primary}
            style={{backgroundColor: 'transparent'}}
          />
          <View
            style={[
              styles.statusIndicator,
              {
                backgroundColor: getStatusColor(item.status),
                borderColor: theme.colors.surface,
              },
            ]}
          />
        </View>

        {/* 右侧设备信息 */}
        <View style={styles.contentContainer}>
          <View style={styles.deviceHeader}>
            <Text 
              style={[
                styles.deviceName, 
                {color: theme.colors.primary}
              ]}>
              {item.name}
            </Text>
            <Text
              style={[
                styles.timeText,
                {color: theme.colors.onSurfaceVariant},
              ]}>
              {item.lastOnline}
            </Text>
          </View>

          <View style={styles.deviceInfo}>
            <Text style={[styles.infoText, {color: theme.colors.onSurfaceVariant}]}>
              {t('sysuser.name')}: {item.user}
            </Text>
            <Text style={[styles.infoText, {color: theme.colors.onSurfaceVariant}]}>
              SN: {item.sn}
            </Text>
            <Text style={[styles.infoText, {color: theme.colors.onSurfaceVariant}]}>
              {t('common.general')}: {item.model}
            </Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaLayout>
      <View style={styles.container}>
        {/* 搜索栏 */}
        <View
          style={[
            styles.searchBar,
            {
              backgroundColor: theme.colors.surface,
              borderColor: theme.colors.primary + '15',
            },
          ]}>
          <Icon
            name="search1"
            size={20}
            color={theme.colors.primary}
            style={styles.searchIcon}
          />
          <TextInput
            style={[styles.searchInput, {color: theme.colors.onSurface}]}
            placeholder={t('pb.search') + t('device.equipment') + '/' + t('common.general')}
            placeholderTextColor={theme.colors.onSurfaceVariant}
            value={searchText}
            onChangeText={setSearchText}
          />
          {searchText ? (
            <TouchableOpacity onPress={() => setSearchText('')}>
              <Icon
                name="close"
                size={20}
                color={theme.colors.primary}
                style={styles.clearIcon}
              />
            </TouchableOpacity>
          ) : null}
        </View>

        {/* 筛选标签 */}
        <View style={styles.tabContainer}>
          {filterTabs.map(tab => (
            <TouchableOpacity
              key={tab.id}
              onPress={() => setActiveTab(tab.id)}
              style={[
                styles.tab,
                {
                  backgroundColor:
                    activeTab === tab.id ? tab.bgColor : 'transparent',
                  borderColor: activeTab === tab.id ? 'transparent' : theme.colors.primary + '15',
                  borderWidth: 1,
                },
              ]}>
              <Text
                style={[
                  styles.tabText,
                  {
                    color: activeTab === tab.id ? tab.color : theme.colors.onSurfaceVariant,
                    fontWeight: activeTab === tab.id ? '600' : 'normal',
                  },
                ]}>
                {tab.title}
                <Text style={styles.countText}> ({tab.count})</Text>
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* 设备列表 */}
        <FlatList
          data={devices}
          renderItem={renderDeviceItem}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
        />
      </View>
    </SafeAreaLayout>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 24,
    borderWidth: 1,
    marginBottom: 16,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    padding: 0,
  },
  clearIcon: {
    padding: 4,
  },
  tabContainer: {
    flexDirection: 'row',
    marginBottom: 16,
    gap: 8,
  },
  tab: {
    flex: 1,
    paddingHorizontal: 8,
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabText: {
    fontSize: 14,
  },
  countText: {
    fontSize: 13,
  },
  listContainer: {
    gap: 12,
    paddingBottom: 16,
  },
  deviceCard: {
    borderRadius: 16,
    padding: 12,
    borderWidth: 1,
  },
  cardContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  imageContainer: {
    width: 90,
    height: 90,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  statusIndicator: {
    position: 'absolute',
    width: 12,
    height: 12,
    borderRadius: 6,
    right: -2,
    top: -2,
    borderWidth: 2,
  },
  contentContainer: {
    flex: 1,
  },
  deviceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  deviceName: {
    fontSize: 16,
    fontWeight: '500',
  },
  timeText: {
    fontSize: 13,
  },
  deviceInfo: {
    gap: 6,
  },
  infoText: {
    fontSize: 14,
  },
});

export default Monitor; 