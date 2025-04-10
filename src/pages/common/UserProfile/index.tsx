import React, {useState, useEffect} from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Linking,
} from 'react-native';
import {Text, TextInput, useTheme, Avatar} from 'react-native-paper';
import {useTranslation} from 'react-i18next';
import {ExtendedMD3Theme} from '@/theme';
import {useMMKVObject} from 'react-native-mmkv';
import {storage} from '@/utils/storage';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import {CountryItem} from '@/pages/common/CountryPicker';
import {useDispatch, useSelector, shallowEqual} from 'react-redux';
import {
  fetchCountries,
  selectSelectedCountry,
  setSelectedCountry,
} from '@/store/slices/countrySlice';
import store from '@/store';
import Picker from '@/components/Picker';
import {userApi} from '@/services/api/userApi';
import {showToast} from '@/store/slices/toastSlice';
import {launchImageLibrary} from 'react-native-image-picker';
import fs from 'react-native-fs';
import {CDN_Url, VITE_API_BASE_URL} from '@/config/config';
import FastImage from 'react-native-fast-image';
interface UserInfo {
  username?: string;
  email?: string;
  userType?: number;
  nickname?: string;
  county?: string;
  timeZone?: string;
  center?: string;
  avatar?: string;
  instCode?: string;
  instName?: string;
  userId?: number;
}

const UserProfileScreen: React.FC<{navigation: any}> = ({navigation}) => {
  const {t} = useTranslation();
  const theme = useTheme() as ExtendedMD3Theme;
  const dispatch = useDispatch();
  const [userInfo] = useMMKVObject<UserInfo>(
    'user_info',
    storage.getInstance()!,
  );
  // 状态管理
  const [nickname, setNickname] = useState(userInfo?.nickname || '');
  const selectedCountry = useSelector(selectSelectedCountry, shallowEqual);
  const [timezonePickerVisible, setTimezonePickerVisible] = useState(false);
  const [timezoneList, setTimezoneList] = useState<CountryItem['zoneList']>([]);
  const [timezone, setTimezone] = useState<string>(userInfo?.timeZone || '');
  const [loading, setLoading] = useState(false);
  const [avatar, setAvatar] = useState(userInfo?.avatar || '');
  // 监听用户信息变化，更新表单数据
  // 初始化国家和时区数据
  useEffect(() => {
    console.log('Initializing countries with userInfo:', userInfo);
    if (store.getState().country.countries.length === 0) {
      dispatch(fetchCountries())
        .unwrap()
        .then(value => {
          console.log('Fetched countries:', value);
          // 如果用户信息中有国家信息，则查找对应的国家
          if (userInfo?.county) {
            console.log('Looking for country:', userInfo.county);
            const result = value.find(item => item.value === userInfo.county);
            console.log('Found country result:', result);
            if (result) {
              dispatch(
                setSelectedCountry({
                  ...result,
                  name: t(result.code),
                }),
              );
              // 如果用户信息中有时区信息，则设置对应的时区
              if (userInfo.timeZone) {
                console.log(
                  'Setting timezone from userInfo:',
                  userInfo.timeZone,
                );
                setTimezone(userInfo.timeZone);
              } else {
                setTimezone(result.zoneList[0].value);
              }
            }
          } else {
            // 如果没有国家信息，则使用第一个国家
            const firstCountry = value[0];
            dispatch(
              setSelectedCountry({
                ...firstCountry,
                name: t(firstCountry.code),
              }),
            );
            setTimezone(firstCountry.zoneList[0].value);
          }
        });
    } else {
      // 如果已经有国家数据，直接设置
      const countries = store.getState().country.countries;
      if (userInfo?.county) {
        const result = countries.find(item => item.value === userInfo.county);
        if (result) {
          dispatch(
            setSelectedCountry({
              ...result,
              // name: t(result.code),
            }),
          );
          requestAnimationFrame(() => {
            if (userInfo.timeZone) {
              setTimezone(userInfo.timeZone);
            }
          });
        }
      }
    }
  }, [dispatch, t, userInfo?.county, userInfo?.timeZone]);

  // 更新时区列表
  useEffect(() => {
    console.log(
      'Updating timezone list with selectedCountry:',
      selectedCountry,
    );
    if (selectedCountry) {
      const newTimezoneList = selectedCountry.zoneList.map(item => ({
        ...item,
        code: t(item.code),
      }));
      console.log('New timezone list:', newTimezoneList);
      setTimezoneList(newTimezoneList);

      // 只有在没有设置时区的情况下才设置默认时区
      setTimezone(selectedCountry.zoneList[0].value);
    }
  }, [selectedCountry]);

  // 获取当前选择的时区名称
  const getCurrentTimezoneName = () => {
    const tz = timezoneList.find(t => t.value === timezone);
    console.log('Getting timezone name for:', timezone, 'Found:', tz);
    return tz?.code ?? '';
  };

  // 处理选择国家
  const handleSelectCountry = () => {
    navigation.navigate('CountryPicker');
  };

  // 处理选择时区
  const handleSelectTimezone = (value: string) => {
    setTimezone(value);
    setTimezonePickerVisible(false);
  };

  // 添加处理邮箱修改的函数
  const handleEmailChange = () => {
    navigation.navigate('ChangeEmail');
  };

  // 处理保存
  const handleSave = async () => {
    try {
      setLoading(true);

      // 准备更新参数
      const updateParams = {
        nickname: nickname || undefined,
        county: selectedCountry?.value || undefined,
        timeZone: timezone || undefined,
        center: userInfo?.center || undefined,
        email: userInfo?.email || undefined,
        avatar,
        instCode: userInfo?.instCode || undefined,
      };

      // 调用更新接口
      const response = await userApi.updateUserInfo(updateParams);

      if (response.code === 0) {
        // 更新成功后获取最新的用户信息
        const userInfoResponse = await userApi.getUserInfo();
        if (userInfoResponse.code === 0 && userInfoResponse.data) {
          // 更新缓存中的用户信息
          storage
            .getInstance()
            ?.set('user_info', JSON.stringify(userInfoResponse.data));
        }

        // 显示成功提示
        dispatch(
          showToast({
            message: t('common.saveSuccess', {defaultValue: '保存成功'}),
            type: 'success',
            duration: 2000,
          }),
        );

        // 返回上一页
        navigation.goBack();
      } else {
        // 显示错误信息
        dispatch(
          showToast({
            message:
              response.message ||
              t('common.saveFailed', {defaultValue: '保存失败'}),
            type: 'error',
            duration: 2000,
          }),
        );
      }
    } catch (error) {
      console.error('Failed to save user info:', error);
      dispatch(
        showToast({
          message: t('common.networkError', {
            defaultValue: '网络请求异常，请稍后重试',
          }),
          type: 'error',
          duration: 2000,
        }),
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView
      style={[styles.container, {backgroundColor: theme.colors.background}]}>
      {/* 头像部分 */}
      <View style={styles.avatarSection}>
        <View style={styles.avatarContainer}>
          {avatar ? (
            <FastImage
              source={{uri: avatar}}
              style={{width: 100, height: 100, borderRadius: 100}}></FastImage>
          ) : (
            <Avatar.Icon
              size={100}
              icon="account"
              style={{backgroundColor: theme.colors.surfaceVariant}}
            />
          )}
          <TouchableOpacity
            style={styles.editAvatarButton}
            onPress={() => {
              launchImageLibrary({
                mediaType: 'photo',
                quality: 0.8,
                includeBase64: false,
                includeExtra: true,
              })
                .then(async value => {
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
                  } else if ((value.assets?.length ?? 0) > 0) {
                    fs.uploadFiles({
                      files: (value.assets ?? []).map(item => {
                        return {
                          filename: item.fileName!,
                          name: 'file',
                          filepath: item.uri!.replace('file:///', ''),
                          filetype: item.type!,
                        };
                      }),
                      headers: {
                        Authorization: `Bearer ${storage
                          .getInstance()
                          ?.getString('auth_token')}`,
                      },
                      toUrl: `${VITE_API_BASE_URL}/api/admin/sys-file/upload`,
                    }).promise.then(({body}) => {
                      const {data} = JSON.parse(body);
                      const imageUrl = CDN_Url + data.url;
                      setAvatar(imageUrl);
                    });
                  }
                })
                .catch(err => {
                  console.log(err);
                });
            }}>
            <MaterialIcons
              name="photo-camera"
              size={24}
              color={theme.colors.onSurfaceVariant}
            />
          </TouchableOpacity>
        </View>
      </View>

      {/* 表单部分 */}
      <View style={styles.formSection}>
        {/* 昵称 */}
        <View style={styles.inputGroup}>
          <Text style={[styles.label, {color: theme.colors.onSurface}]}>
            {t('userSetting.form.error.nickname.required', {
              defaultValue: '昵称',
            })}
          </Text>
          <TextInput
            mode="outlined"
            value={nickname}
            onChangeText={setNickname}
            placeholder={t('userSetting.form.error.nickname.required', {
              defaultValue: '请输入昵称',
            })}
            style={[styles.input, {backgroundColor: theme.colors.surface}]}
            outlineStyle={{borderRadius: 8}}
          />
        </View>

        {/* 国家或地区 */}
        <View style={styles.inputGroup}>
          <Text style={[styles.label, {color: theme.colors.onSurface}]}>
            {t('userSetting.basicInfo.form.label.countryRegion', {
              defaultValue: '国家/地区',
            })}
          </Text>
          <TouchableOpacity
            style={[
              styles.pickerButton,
              {backgroundColor: theme.colors.surface},
            ]}
            onPress={handleSelectCountry}>
            <Text style={{color: theme.colors.onSurface}}>
              {t(selectedCountry?.code!) ||
                t('userSetting.basicInfo.form.placeholder.countryRegion', {
                  defaultValue: '请选择国家/地区',
                })}
            </Text>
            <MaterialIcons
              name="keyboard-arrow-right"
              size={24}
              color={theme.colors.onSurfaceVariant}
            />
          </TouchableOpacity>
        </View>

        {/* 时区 */}
        <View style={styles.inputGroup}>
          <Text style={[styles.label, {color: theme.colors.onSurface}]}>
            {t('userSetting.basicInfo.form.label.timezone', {
              defaultValue: '时区',
            })}
          </Text>
          <TouchableOpacity
            style={[
              styles.pickerButton,
              {backgroundColor: theme.colors.surface},
            ]}
            onPress={() => setTimezonePickerVisible(true)}>
            <Text style={{color: theme.colors.onSurface}}>
              {getCurrentTimezoneName()}
            </Text>
            <MaterialIcons
              name="keyboard-arrow-right"
              size={24}
              color={theme.colors.onSurfaceVariant}
            />
          </TouchableOpacity>
        </View>

        {/* 邮箱 - 只读 */}
        <View style={styles.inputGroup}>
          <Text style={[styles.label, {color: theme.colors.onSurface}]}>
            {t('userSetting.SecuritySettings.form.label.email', {
              defaultValue: '邮箱',
            })}
          </Text>
          <TouchableOpacity
            style={[
              styles.pickerButton,
              {backgroundColor: theme.colors.surface},
            ]}
            onPress={handleEmailChange}>
            <Text style={{color: theme.colors.onSurfaceVariant}}>
              {userInfo?.email}
            </Text>
            <MaterialIcons
              name="keyboard-arrow-right"
              size={24}
              color={theme.colors.onSurfaceVariant}
            />
          </TouchableOpacity>
        </View>

        {/* 安装商运营商 - 如果是安装商角色才显示 */}
        {userInfo?.userType === 2 && (
          <View style={styles.inputGroup}>
            <Text style={[styles.label, {color: theme.colors.onSurface}]}>
              {t('userSetting.basicInfo.form.label.installerCode', {
                defaultValue: '安装商代码',
              })}
            </Text>
            <TouchableOpacity
              style={[
                styles.pickerButton,
                {backgroundColor: theme.colors.surface},
              ]}>
              <Text style={{color: theme.colors.onSurfaceVariant}}>TTEC34</Text>
              <MaterialIcons
                name="keyboard-arrow-right"
                size={24}
                color={theme.colors.onSurfaceVariant}
              />
            </TouchableOpacity>
          </View>
        )}

        {/* 公司名称 - 如果是安装商角色才显示 */}
        {userInfo?.userType === 2 && (
          <View style={styles.inputGroup}>
            <Text style={[styles.label, {color: theme.colors.onSurface}]}>
              {t('userSetting.basicInfo.form.label.companyName', {
                defaultValue: '公司名称',
              })}
            </Text>
            <Text
              style={[
                styles.companyName,
                {color: theme.colors.onSurfaceVariant},
              ]}>
              Leo新能源科技有限公司
            </Text>
          </View>
        )}
      </View>

      {/* 确定按钮 */}
      <TouchableOpacity
        style={[
          styles.saveButton,
          {
            backgroundColor: loading
              ? theme.colors.primary + '80'
              : theme.colors.primary,
          },
        ]}
        onPress={handleSave}
        disabled={loading}>
        <Text style={[styles.saveButtonText, {color: theme.colors.onPrimary}]}>
          {loading
            ? t('common.saving', {defaultValue: '保存中...'})
            : t('common.confirm', {defaultValue: '确定'})}
        </Text>
      </TouchableOpacity>

      {/* 时区选择器 */}
      <Picker
        visible={timezonePickerVisible}
        data={timezoneList.map(item => item.code)}
        defaultValue={getCurrentTimezoneName()}
        onCancel={() => setTimezonePickerVisible(false)}
        onConfirm={value => {
          const tz = timezoneList.find(t => t.code === value);
          if (tz) {
            handleSelectTimezone(tz.value);
          }
        }}
      />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  avatarSection: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  avatarContainer: {
    position: 'relative',
  },
  editAvatarButton: {
    position: 'absolute',
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    borderRadius: 20,
    padding: 8,
  },
  formSection: {
    paddingHorizontal: 16,
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
  pickerButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    height: 44,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.12)',
  },
  companyName: {
    fontSize: 16,
    paddingVertical: 8,
  },
  saveButton: {
    margin: 16,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '500',
  },
});

export default UserProfileScreen;
