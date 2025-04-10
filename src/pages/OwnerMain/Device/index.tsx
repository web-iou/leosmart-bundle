import React, {useCallback, useEffect, useRef, useState} from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  RefreshControl,
} from 'react-native';
import {Text, useTheme} from 'react-native-paper';
import {useTranslation} from 'react-i18next';
import AntDesign from 'react-native-vector-icons/AntDesign';
import {ExtendedMD3Theme} from '@/theme';
import SafeAreaLayout from '@/components/SafeAreaLayout';
import {useNativePopover} from '@/hooks/usePopover';
import {deviceApi, StationDTO} from '@/services/api/deviceApi';
import {useFocusEffect} from '@react-navigation/native';
import Device4G from '@/components/DeviceList/4G';
import {useRequest} from 'ahooks';
const ComponentMap = {
  '4G': Device4G,
};
const DevicePage = ({navigation}: ReactNavigation.Navigation<'OwnerMain'>) => {
  const {t} = useTranslation();
  const theme = useTheme() as ExtendedMD3Theme;
  const scrollRef = useRef<ScrollView>(null);
  const {
    data: deviceData,
    loading,
    mutate,
    run,
  } = useRequest(deviceApi.getInverterFirstPage, {
    manual: true,
    loadingDelay: 200,
    onSuccess: ({data}) => {
      //@ts-ignore

      mutate({
        ...data,
        ...deviceList[active],
      });
    },
    onFinally: () => {
      setRefreshing(false);
    },
  });
  const [refreshing, setRefreshing] = useState(false);
  const [showPopover, anchorRef] = useNativePopover();
  const [show, devicesRef] = useNativePopover();
  const [active, setActive] = useState(0);
  const [deviceList, setDeviceList] = useState<StationDTO['equipments']>([]);
  useFocusEffect(
    useCallback(() => {
      scrollRef.current?.scrollTo({y: 0, animated: false});
    deviceApi.getStationEquipment(1).then(({data}) => {
      setDeviceList(data.equipments);
    });
    }, []),
  );
  useEffect(() => {
    onRefresh();
  }, [active, deviceList]);
  const onRefresh = useCallback(() => {
    const id = deviceList[active]?.id;
    if (id) {
      setRefreshing(true);
      run(id);
    }
  }, [active, deviceList]);
  return (
    <SafeAreaLayout>
        {/* 设备标题 */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.deviceTitleContainer}
            ref={devicesRef}
            onPress={() => {
              show(
              deviceList
                .map(item => item.name)
                .concat(t('device.equipment_management')),
              new Array(deviceList.length).concat(
                AntDesign.getImageSourceSync('setting', 24, '#fff').uri,
              ),
              {
                menuWidth: 160,
                allowRoundedArrow: true,
                menuTextMargin: 20,
                menuRowHeight: 40,
              },
              ).then(index => {
              if (index === deviceList.length) {
                navigation.navigate('DeviceManage', {
                  setIndex: setActive,
                });
              } else {
                setActive(index!);
              }
              });
            }}>
            <View style={styles.deviceIconCircle}>
              <AntDesign name="swap" size={24} color="#FFFFFF" />
            </View>
          <Text style={[styles.deviceName, {color: theme.colors.onBackground}]}>
              {deviceList[active]?.name}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => {
              showPopover(
                ['扫一扫', 'SN序列号'],
                [
                  AntDesign.getImageSourceSync('scan1', 24, '#fff').uri,
                  AntDesign.getImageSourceSync('edit', 24, '#fff').uri,
                ],
              ).then(index => {
                if (index === 0) {
                  navigation.navigate('Scan');
                } else {
                  navigation.navigate({
                    name: 'SNCode',
                    params: {},
                  });
                }
              });
            }}>
            <AntDesign
              name="plus"
              ref={anchorRef}
              size={24}
              color={theme.colors.onBackground}
            />
          </TouchableOpacity>
        </View>
      <ScrollView
                    className="flex-1"
        ref={scrollRef}
        contentContainerStyle={{flex:1}}
        style={[{backgroundColor: theme.colors.background}]}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[theme.colors.primary]}
            tintColor={theme.colors.primary}
            progressBackgroundColor={theme.colors.surface}
          />
        }>
        {deviceData ? (
          React.createElement(
            //@ts-ignore
            ComponentMap[deviceData.state.equipType ?? '4G'],
            {
              deviceData,
              loading,
            },
          )
        ) : (
          <View className='flex-center flex-1'>
            <Text>暂时设备～～请添加</Text>
                </View>
        )}
      </ScrollView>
    </SafeAreaLayout>
  );
};

const styles = StyleSheet.create({
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
});
export default DevicePage;
