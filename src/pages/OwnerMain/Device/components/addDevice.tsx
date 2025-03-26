import {Alert, Linking, Pressable, StyleSheet, Text, View, StatusBar} from 'react-native';
import {useTranslation} from 'react-i18next';
import {useEffect, useLayoutEffect, useState} from 'react';
import {useCameraPermission} from 'react-native-vision-camera';
import ScannerOverlay from './ScannerOverlay';
import {Button, useTheme} from 'react-native-paper';
import Icon from 'react-native-vector-icons/AntDesign';
import EvilIcons from 'react-native-vector-icons/EvilIcons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import {launchImageLibrary} from 'react-native-image-picker';
import NativeFlashLight from '~/specs/NativeFlashLight';
import NativeScan from '~/specs/NativeScan';
import {TextInput} from 'react-native-paper';
import {showToast} from '@/store/slices/toastSlice';
import {deviceApi} from '@/services/api/deviceApi';
import {useDispatch} from 'react-redux';
import {ExtendedMD3Theme} from '@/theme';
import {SafeAreaView} from 'react-native-safe-area-context';

export const ScanCode = ({navigation}: ReactNavigation.Navigation<'Scan'>) => {
  const {hasPermission, requestPermission} = useCameraPermission();
  const [open, setOpen] = useState(false);
  const theme = useTheme() as ExtendedMD3Theme;
  
  // 设置状态栏样式
  useEffect(() => {
    StatusBar.setBarStyle(theme.dark ? 'light-content' : 'dark-content');
    StatusBar.setBackgroundColor(theme.colors.background);
    return () => {
      StatusBar.setBarStyle('default');
    };
  }, [theme.dark, theme.colors.background]);
  
  useLayoutEffect(() => {
    if (!hasPermission) {
      requestPermission().then(value => {
        if (!value) {
          Alert.alert(
            'Permission Denied',
            'You need to enable camera permission to use this feature.',
            [
              {
                text: 'Cancel',
              },
              {
                text: 'Open Settings',
                onPress: () => {
                  Linking.openSettings();
                },
              },
            ],
          );
        }
      });
    }
  }, [hasPermission, requestPermission]);
  useEffect(() => {
    if (open) {
      NativeFlashLight.open();
    } else {
      NativeFlashLight.close();
    }
    return () => {
      if (open) {
        NativeFlashLight.close();
      }
    };
  }, [open]);
  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]} edges={['top', 'bottom']}>
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <ScannerOverlay />
        <Pressable
          className=" absolute left-8"
          style={{
            top: 16,
          }}
          onPress={() => {
            navigation.goBack();
          }}>
          <Icon name="leftcircle" size={28} color={theme.colors.onSurfaceVariant} />
        </Pressable>
        <Pressable
          className=" absolute left-8 z-40 rounded-full p-2.5 gap-y-2 justify-center items-center bottom-24"
          onPress={() => {
            launchImageLibrary({
              mediaType: 'photo',
              quality: 1,
              includeBase64: false,
              includeExtra: true,
            }).then(value => {
              if (value?.errorCode === 'permission') {
                Alert.alert(
                  'Permission Denied',
                  'You need to enable permission to use this feature.',
                  [
                    {
                      text: 'Cancel',
                    },
                    {
                      text: 'Open Settings',
                      onPress: () => {
                        Linking.openSettings();
                      },
                    },
                  ],
                );
              } else if (value.assets?.[0].uri) {
                NativeScan.scanBarcodeFromImage(value.assets[0].uri).then(
                  code => {
                    navigation.navigate('SNCode', {code});
                  },
                );
              }
            });
          }}>
          <View className=" items-center justify-center bg-primary-400 size-12 rounded-full" style={{ backgroundColor: theme.colors.primary }}>
            <EvilIcons
              name="image"
              className="text-center"
              size={32}
              color={theme.colors.onPrimary}
            />
          </View>
          <Text className=" text-white" style={{ color: theme.colors.onSurface }}>相册导入</Text>
        </Pressable>
        <Pressable
          className=" absolute right-8 z-40 rounded-full p-2.5 gap-y-2 justify-center items-center bottom-24"
          onPress={() => {
            setOpen(!open);
          }}>
          <View className=" items-center justify-center bg-primary-400 size-12 rounded-full" style={{ backgroundColor: theme.colors.primary }}>
            <MaterialCommunityIcons
              name={!open ? 'flashlight' : 'flashlight-off'}
              className=" text-center"
              size={32}
              color={theme.colors.onPrimary}
            />
          </View>
          <Text className=" text-white" style={{ color: theme.colors.onSurface }}>
            {!open ? '打开手电筒' : '关闭手电筒'}
          </Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
};

export const SNCode = ({
  route: {
    params: {code},
  },
  navigation,
}: ReactNavigation.Navigation<'SNCode'>) => {
  const {t} = useTranslation();
  const dispatch = useDispatch();
  const theme = useTheme() as ExtendedMD3Theme;
  const [formData, setFormData] = useState({
    code: code ?? '',
    name: '',
  });
  const [errors, setErrors] = useState({
    code: '',
    name: '',
  });
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
      title: 'SNCode',
      headerStyle: {
        backgroundColor: theme.colors.background,
      },
      headerTintColor: theme.colors.onBackground,
      headerShadowVisible: false,
    });
  }, [navigation, theme.colors.background, theme.colors.onBackground]);

  // 表单验证
  const validateForm = () => {
    let isValid = true;
    const newErrors = {
      code: '',
      name: '',
    };

    if (!formData.code?.trim()) {
      newErrors.code = t('device.snCodeRequired', {
        defaultValue: '请输入SN序列号',
      });
      isValid = false;
    }

    if (!formData.name.trim()) {
      newErrors.name = t('device.nameRequired', {
        defaultValue: '请输入设备名称',
      });
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  // 处理提交
  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    try {
      setLoading(true);

      // 检查SN码是否存在
      const {data: isExist} = await deviceApi.checkSNCode(formData.code);
      if (isExist) {
        dispatch(showToast({
          message: t('device.snCodeExist', {defaultValue: 'SN序列号已存在'}),
          type: 'error',
        }));
        return;
      }

      // 添加设备
      await deviceApi.addDevice({
        sn: formData.code,
        name: formData.name,
      });

      dispatch(showToast({
        message: t('device.addSuccess', {defaultValue: '添加成功'}),
        type: 'success',
      }));

      navigation.replace('OwnerMain');
    } catch (error) {
      console.log(error);

      dispatch(showToast({
        message: t('common.operationFailed', {defaultValue: '操作失败'}),
        type: 'error',
      }));
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]} edges={['top', 'bottom']}>
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <View style={[styles.formContainer, { backgroundColor: theme.colors.background, paddingHorizontal: 32, marginTop: 16 }]}>
          {/* SN码输入框 */}
          <TextInput
            style={[styles.input, { backgroundColor: theme.colors.inputBackground }]}
            mode="outlined"
            label={t('device.snCode', {defaultValue: 'SN序列号'})}
            value={formData.code}
            onChangeText={text => {
              setFormData(prev => ({...prev, code: text}));
              setErrors(prev => ({...prev, code: ''}));
            }}
            error={!!errors.code}
            disabled={!!code}
            outlineStyle={{ borderRadius: 20 }}
          />
          {errors.code ? (
            <Text style={[styles.errorText, {color: theme.colors.error}]}>
              {errors.code}
            </Text>
          ) : null}

          {/* 设备名称输入框 */}
          <TextInput
            style={[styles.input, { backgroundColor: theme.colors.inputBackground }]}
            mode="outlined"
            label={t('device.name', {defaultValue: '设备名称'})}
            value={formData.name}
            onChangeText={text => {
              setFormData(prev => ({...prev, name: text}));
              setErrors(prev => ({...prev, name: ''}));
            }}
            error={!!errors.name}
            outlineStyle={{ borderRadius: 20 }}
          />
          {errors.name ? (
            <Text style={[styles.errorText, {color: theme.colors.error}]}>
              {errors.name}
            </Text>
          ) : null}

          {/* 提交按钮 */}
          <Button
            mode="contained"
            style={[styles.button, { backgroundColor: loading ? theme.colors.buttonDisabled : theme.colors.buttonPrimary }]}
            loading={loading}
            disabled={loading}
            onPress={handleSubmit}>
            {t('common.submit', {defaultValue: '提交'})}
          </Button>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  formContainer: {
    flex: 1,
  },
  input: {
    marginBottom: 8,
    height: 40,
    borderRadius: 20,
  },
  errorText: {
    fontSize: 12,
    marginBottom: 16,
    marginTop: -4,
    marginLeft: 8,
  },
  button: {
    marginTop: 24,
    height: 40,
    justifyContent: 'center',
    borderRadius: 20,
  },
});
