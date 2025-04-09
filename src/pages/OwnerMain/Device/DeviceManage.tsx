import React, {useEffect, useState} from 'react';
import {View, Alert, Pressable} from 'react-native';
import {Text, useTheme} from 'react-native-paper';
import {useTranslation} from 'react-i18next';
import {ExtendedMD3Theme} from '@/theme';
import {deviceApi, UserEquipmentDTO} from '@/services/api/deviceApi';
import {FlashList} from '@shopify/flash-list';
import {createShimmerPlaceholder} from 'react-native-shimmer-placeholder';
import LinearGradient from 'react-native-linear-gradient';
import Swipeable from 'react-native-gesture-handler/ReanimatedSwipeable';
import {useDispatch} from 'react-redux';
import {showToast} from '@/store/slices/toastSlice';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

// 创建 ShimmerPlaceholder 组件
const ShimmerPlaceholder = createShimmerPlaceholder(LinearGradient);

enum DeviceStatus {
  '离线' = 0,
  '在线' = 1,
  '告警' = 2,
}

const DeviceManage = ({
  navigation,
  route,
}: ReactNavigation.Navigation<'DeviceManage'>) => {
  const {t} = useTranslation();
  const theme = useTheme() as ExtendedMD3Theme;
  const dispatch = useDispatch();
  const [devices, setDevices] = useState<UserEquipmentDTO[]>([]);
  const [loading, setLoading] = useState(true);

  // 获取设备列表
  useEffect(() => {
    refresh();
  }, []);
  const refresh = () => {
    setLoading(true);
    deviceApi
      .getStationEquipment(1)
      .then(({data}) => {
        setDevices(
          data.equipments.map((item, index) => ({
            ...item,
            index,
          })) || [],
        );
      })
      .finally(() => {
        setLoading(false);
      });
  };
  // 处理删除设备
  const handleDeleteDevice = (device: UserEquipmentDTO) => {
    Alert.alert(
      t('common.confirm', {defaultValue: '确认'}),
      t('device.deleteConfirm', {defaultValue: '确定要删除该设备吗？'}),
      [
        {
          text: t('common.cancel', {defaultValue: '取消'}),
          style: 'cancel',
        },
        {
          text: t('common.delete', {defaultValue: '删除'}),
          style: 'destructive',
          onPress: () => {
            // 这里应该调用删除设备的API
            deviceApi.unbindDevice(device.id!).then(({data}) => {
              if (data) {
                refresh();
              }
              dispatch(
                showToast({
                  message: t(
                    data ? 'device.deleteSuccess' : '',
                    {
                      defaultValue: '删除失败',
                    },
                  ),
                  type: data ? 'success' : 'error',
                }),
              );
            });
          },
        },
      ],
    );
  };

  // 渲染设备项
  const renderDeviceItem = ({
    item,
  }: {
    item: UserEquipmentDTO & {index: number};
  }) => {
    const getStatusColor = (status: number) => {
      switch (status) {
        case 1:
          return '#4CAF50'; // 在线-绿色
        case 2:
          return '#FF9800'; // 告警-橙色
        default:
          return '#9E9E9E'; // 离线-灰色
      }
    };

    // 渲染右侧滑动操作
    const renderRightActions = () => {
      return (
        <Pressable
          className="h-full justify-center items-end rounded-xl overflow-hidden"
          onPress={() => {
            handleDeleteDevice(item);
          }}
          style={{backgroundColor: theme.colors.error}}>
          <View
            className="h-full w-20 justify-center items-center"
            style={{backgroundColor: theme.colors.error}}>
            <Text style={{color: '#FFFFFF'}}>
              {t('common.delete', {defaultValue: '删除'})}
            </Text>
          </View>
        </Pressable>
      );
    };

    return (
      <Swipeable renderRightActions={renderRightActions} rightThreshold={40}>
        <Pressable
          onPress={() => {
            route.params.setIndex(item.index!);
            navigation.goBack();
          }}
          className="p-4 rounded-xl border overflow-hidden justify-between flex-row"
          style={{
            backgroundColor: theme.colors.surface,
            borderColor: theme.colors.outlineVariant,
            paddingBottom: 16,
          }}>
          <View>
            <View className="flex-row justify-between items-center mb-2">
              <Text
                className="text-base font-medium"
                style={{color: theme.colors.onSurface}}>
                {item.name}
              </Text>
            </View>
            <Text
              className="text-sm"
              style={{color: theme.colors.onSurfaceVariant}}>
              SN: {item.sn}
            </Text>
          </View>
          <View className="flex-row items-center">
            <View
              className="w-2 h-2 rounded-full mr-1.5"
              style={{backgroundColor: getStatusColor(item.status || 0)}}
            />
            <Text
              className="text-sm mr-2"
              style={{color: theme.colors.onSurfaceVariant}}>
              {DeviceStatus[item.status || 0]}
            </Text>
            <Icon
              name="chevron-right"
              size={20}
              color={theme.colors.onSurfaceVariant}
            />
          </View>
        </Pressable>
      </Swipeable>
    );
  };

  // 渲染加载占位项
  const renderPlaceholderItem = () => {
    return (
      <View
        className="p-4 rounded-xl mb-3 border"
        style={{
          backgroundColor: theme.colors.surface,
          borderColor: theme.colors.outlineVariant,
        }}>
        <View className="flex-row justify-between items-center mb-2">
          <ShimmerPlaceholder
            style={{
              height: 20,
              width: 120,
              borderRadius: 4,
            }}
            shimmerColors={[
              theme.colors.surfaceVariant,
              theme.colors.surface,
              theme.colors.surfaceVariant,
            ]}
          />
          <View className="flex-row items-center">
            <ShimmerPlaceholder
              style={{
                height: 20,
                width: 60,
                borderRadius: 4,
                marginRight: 8,
              }}
              shimmerColors={[
                theme.colors.surfaceVariant,
                theme.colors.surface,
                theme.colors.surfaceVariant,
              ]}
            />
            <ShimmerPlaceholder
              style={{
                height: 20,
                width: 20,
                borderRadius: 4,
              }}
              shimmerColors={[
                theme.colors.surfaceVariant,
                theme.colors.surface,
                theme.colors.surfaceVariant,
              ]}
            />
          </View>
        </View>
        <ShimmerPlaceholder
          style={{
            height: 16,
            width: 160,
            borderRadius: 4,
          }}
          shimmerColors={[
            theme.colors.surfaceVariant,
            theme.colors.surface,
            theme.colors.surfaceVariant,
          ]}
        />
      </View>
    );
  };

  // 生成占位数据
  const placeholderData = Array(4).fill({});

  return (
    <View className="flex-1 px-4">
      <FlashList
        data={loading ? placeholderData : devices}
        renderItem={loading ? renderPlaceholderItem : renderDeviceItem}
        estimatedItemSize={80}
        keyExtractor={(item, index) =>
          loading ? `placeholder-${index}` : item.id?.toString() || ''
        }
        contentContainerStyle={{paddingVertical: 16}}
        ItemSeparatorComponent={() => <View className="h-3" />}
      />
    </View>
  );
};

export default DeviceManage;
