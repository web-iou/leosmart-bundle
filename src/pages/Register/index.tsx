import React, {useState, useEffect} from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import {
  Text,
  TextInput,
  Appbar,
  useTheme,
  RadioButton,
  Divider,
} from 'react-native-paper';
import {useTranslation} from 'react-i18next';
import {userApi, RegisterParams} from '@/services/api/userApi';
import {showToast} from '@/store/slices/toastSlice';
import {useDispatch, useSelector} from 'react-redux';
import AntDesign from 'react-native-vector-icons/AntDesign';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import {ExtendedMD3Theme} from '@/theme';
import Picker from '@/components/Picker'; // 引入Picker组件
import {CountryItem} from '../common/CountryPicker';
import {
  fetchCountries,
  selectSelectedCountry,
  setSelectedCountry,
} from '@/store/slices/countrySlice';
import store, {AppDispatch} from '@/store';
// 定义国家和时区类型
interface Country {
  code: string;
  name: string;
}

interface Timezone {
  id: string;
  name: string;
}

// 定义站点类型
interface Site {
  code: string;
  name: string;
}

// 临时数据 - 后面会替换为API调用
const SITES: Site[] = [
  {code: 'Europe', name: '欧洲站'},
];

interface RegisterScreenProps {
  navigation: any;
}

// 定义注册步骤
enum RegisterStep {
  ROLE_SELECTION = 0,
  FORM_INPUT = 1,
  REGISTER_SUCCESS = 2,
}

const RegisterScreen = ({navigation}: RegisterScreenProps): React.ReactElement => {
  const {t, i18n} = useTranslation();
  const theme = useTheme() as ExtendedMD3Theme;
  const dispatch = useDispatch<AppDispatch>();
  // 站点选择
  const [selectedSite, setSelectedSite] = useState<string>('CN'); // 默认中国站
  const [sitePickerVisible, setSitePickerVisible] = useState<boolean>(false);
  const [siteNames] = useState<string[]>(
    SITES.map(site => site.name),
  );
  // 注册步骤状态
  const [currentStep, setCurrentStep] = useState<RegisterStep>(
    RegisterStep.ROLE_SELECTION,
  );

  // 第一步：角色选择
  const [userType, setUserType] = useState<number>(1); // 默认业主角色

  // 国家和时区
  const selectedCountry = useSelector(selectSelectedCountry);
  const [timezonePickerVisible, setTimezonePickerVisible] =
    useState<boolean>(false);
  const [timezoneList, setTimezoneList] = useState<CountryItem['zoneList']>([]);
  const [timezone, setTimezone] = useState<string>('');
  // 第二步：表单输入
  const [email, setEmail] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [parentCode, setParentCode] = useState('');
  const [nickname, setNickname] = useState('');
  // 状态控制
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [countdown, setCountdown] = useState<number>(0);
  const [errorMessage, setErrorMessage] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // 第三步：自动跳转登录倒计时
  const [redirectCountdown, setRedirectCountdown] = useState<number>(3);
  useEffect(() => {
    if (store.getState().country.countries.length === 0) {
      dispatch(fetchCountries())
        .unwrap()
        .then(value => {          
          //默认德国  后期这里替换地图厂商获取实际国家
          const result = value.find(item => {
            return item.value === 'Germany';
          })!;
          dispatch(
            setSelectedCountry({
              ...result,
              name: t(result.code),
            }),
          );
          setTimezone(result.zoneList[0].value);
        });
    }
  }, [dispatch, t]);

  // 尝试获取用户的国家和设置默认值
  useEffect(() => {
    if (selectedCountry) {
      setTimezoneList(
        selectedCountry.zoneList.map(item => {
          return {
            ...item,
            code: t(item.code),
          };
        }),
      );
      setTimezone(selectedCountry.zoneList[0].value);
    }
  }, [selectedCountry, t]);

  // 验证码倒计时逻辑
  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    if (countdown > 0) {
      timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    }
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [countdown]);

  // 注册成功后跳转登录倒计时
  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    if (
      currentStep === RegisterStep.REGISTER_SUCCESS &&
      redirectCountdown > 0
    ) {
      timer = setTimeout(
        () => setRedirectCountdown(redirectCountdown - 1),
        1000,
      );

      if (redirectCountdown === 1) {
        // 倒计时结束，跳转到登录页
        timer = setTimeout(() => {
          navigation.navigate('Login');
        }, 1000);
      }
    }
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [currentStep, redirectCountdown, navigation]);

  // 处理下一步
  const handleNext = () => {
    setCurrentStep(RegisterStep.FORM_INPUT);
  };

  // 发送验证码
  const handleSendVerificationCode = async () => {
    if (!email.trim()) {
      setErrorMessage(
        t('register.emailRequired', {defaultValue: '请输入邮箱地址'}),
      );
      return;
    }

    if (!/\S+@\S+\.\S+/.test(email)) {
      setErrorMessage(
        t('register.invalidEmail', {defaultValue: '邮箱格式不正确'}),
      );
      return;
    }

    try {
      setSending(true);
      setErrorMessage('');

      // 使用 userApi 发送验证码
      const response = await userApi.sendRegisterCode(email);

      if (response && response.code === 0) {
        // 发送成功，开始倒计时
        setCountdown(60);

        dispatch(
          showToast({
            message: t('register.codeSent', {defaultValue: '验证码已发送'}),
            type: 'success',
            duration: 2000,
          }),
        );
      } else {
        setErrorMessage(
          response?.message ||
            t('register.sendFailed', {defaultValue: '验证码发送失败'}),
        );
      }
    } catch (error) {
      console.error('Send verification code error:', error);
      setErrorMessage(
        t('common.networkError', {defaultValue: '网络请求异常，请稍后重试'}),
      );
    } finally {
      setSending(false);
    }
  };

  // 提交注册
  const handleRegister = async () => {
    // 表单验证
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setErrorMessage(
        t('register.emailInvalid', {defaultValue: '请输入有效的邮箱地址'}),
      );
      return;
    }

    if (!verificationCode) {
      setErrorMessage(
        t('register.codeRequired', {defaultValue: '请输入验证码'}),
      );
      return;
    }

    if (!password) {
      setErrorMessage(
        t('register.passwordRequired', {defaultValue: '请输入密码'}),
      );
      return;
    }

    if (password.length < 6) {
      setErrorMessage(
        t('register.passwordTooShort', {
          defaultValue: '密码长度不能少于6个字符',
        }),
      );
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage(
        t('register.passwordMismatch', {defaultValue: '两次输入的密码不一致'}),
      );
      return;
    }

    // 如果是安装商角色，验证公司名称
    if (userType === 2 && !companyName) {
      setErrorMessage(
        t('register.companyRequired', {defaultValue: '请输入公司名称'}),
      );
      return;
    }

    try {
      setLoading(true);
      setErrorMessage('');

      // 准备注册参数 - 包含国家和时区以及站点
      const registerParams: RegisterParams = {
        email,
        code: verificationCode,
        password,
        userType,
        lng: i18n.language,
        center: selectedSite, // Use the selected site as the data center
        county: selectedCountry?.value,
        timeZone: timezone,
      };

      // 如果是安装商/运营商，添加额外的参数
      if (userType === 2) {
        registerParams.companyName = companyName;
        if (parentCode) {
          registerParams.parentCode = parentCode;
        }
      }

      // 使用 userApi 注册
      const response = await userApi.register(registerParams);

      if (response && response.code === 0) {
        // 注册成功，进入第三步
        setCurrentStep(RegisterStep.REGISTER_SUCCESS);

        dispatch(
          showToast({
            message: t('register.success', {defaultValue: '注册成功'}),
            type: 'success',
            duration: 2000,
          }),
        );
      } else {
        setErrorMessage(
          response?.message ||
            t('register.failed', {defaultValue: '注册失败，请稍后重试'}),
        );
      }
    } catch (error) {
      console.error('Register error:', error);
      setErrorMessage(
        t('common.networkError', {defaultValue: '网络请求异常，请稍后重试'}),
      );
    } finally {
      setLoading(false);
    }
  };

  // 立即返回登录
  const handleReturnToLogin = () => {
    navigation.navigate('Login');
  };

  // 选择时区
  const handleSelectTimezone = (tz: string) => {
    setTimezone(tz);
    setTimezonePickerVisible(false);
  };

  // 获取当前选择的站点名称
  const getCurrentSiteName = () => {
    const site = SITES.find(s => s.code === selectedSite);
    return site ? site.name : '';
  };

  // 获取当前选择的时区名称
  const getCurrentTimezoneName = () => {
    const tz = timezoneList.find(t => t.value === timezone);
    return tz?.code;
  };
  return (
    <View
      style={[styles.container, {backgroundColor: theme.colors.background}]}>
      {/* <Appbar.Header>
        {currentStep !== RegisterStep.REGISTER_SUCCESS && (
          <Appbar.BackAction onPress={handleBackPress} />
        )}
        <Appbar.Content
          title={
            currentStep === RegisterStep.ROLE_SELECTION
              ? t('register.title', {defaultValue: '注册'})
              : currentStep === RegisterStep.FORM_INPUT
              ? t('register.title', {defaultValue: '注册'})
              : t('register.success', {defaultValue: '注册成功'})
          }
        />
      </Appbar.Header> */}

      <ScrollView contentContainerStyle={styles.content}>
        {/* 步骤1：选择角色 */}
        {currentStep === RegisterStep.ROLE_SELECTION && (
          <View className=" flex-1 p-6">
            {/* 站点选择 */}
            <View style={styles.inputGroup}>
              <Text style={[styles.label, {color: theme.colors.onSurface}]}>
                {t('user.current_site', {defaultValue: '当前站点'})}
              </Text>
              <View style={styles.inputContainer}>
                <AntDesign
                  name="earth"
                  size={14}
                  color={theme.colors.onSurfaceVariant}
                  style={styles.inputIcon}
                />
                <TouchableOpacity
                  style={[
                    styles.dropdownButton,
                    {
                      backgroundColor: theme.colors.inputBackground,
                      borderColor: theme.colors.outline,
                      borderWidth: 1,
                      borderRadius: 20,
                      height: 40,
                    },
                  ]}
                  onPress={() => setSitePickerVisible(true)}>
                  <Text
                    style={{
                      flex: 1,
                      color: theme.colors.onSurface,
                      paddingLeft: 36,
                    }}>
                    {getCurrentSiteName() ||
                      t('register.selectSite', {defaultValue: '选择站点'})}
                  </Text>
                  <MaterialIcons
                    name="arrow-drop-down"
                    size={24}
                    color={theme.colors.onSurfaceVariant}
                  />
                </TouchableOpacity>
              </View>
            </View>

            <Picker
              visible={sitePickerVisible}
              data={siteNames}
              defaultValue={getCurrentSiteName()}
              onCancel={() => setSitePickerVisible(false)}
              onConfirm={value => {
                const site = SITES.find(s => s.name === value);
                if (site) {
                  setSelectedSite(site.code);
                }
                setSitePickerVisible(false);
              }}
            />

            <Text
              style={[
                styles.sectionTitle,
                {color: theme.colors.onSurface, marginTop: 12},
              ]}>
              {t('message.userswhoOwnOrAlreadyOwnapowerStation', {
                defaultValue: '即将拥有电站或已拥有电站的用户',
              })}
            </Text>

            <View style={styles.roleContainer}>
              <TouchableOpacity
                style={[
                  styles.roleCard,
                  userType === 1 && {
                    borderColor: theme.colors.buttonPrimary,
                    borderWidth: 2,
                  },
                ]}
                onPress={() => setUserType(1)}>
                <View style={styles.radioWrapper}>
                  <RadioButton
                    value="1"
                    status={userType === 1 ? 'checked' : 'unchecked'}
                    onPress={() => setUserType(1)}
                    color={theme.colors.buttonPrimary}
                  />
                </View>
                <Text
                  style={[styles.roleTitle, {color: theme.colors.onSurface}]}>
                  {t('personal.Owner', {defaultValue: '业主'})}
                </Text>
                <Text
                  style={[
                    styles.roleDescription,
                    {color: theme.colors.onSurfaceVariant},
                  ]}>
                  {t('message.userswhoOwnOrAlreadyOwnapowerStation', {
                    defaultValue: '即将拥有电站或已拥有电站的用户',
                  })}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.roleCard,
                  userType === 2 && {
                    borderColor: theme.colors.buttonPrimary,
                    borderWidth: 2,
                  },
                ]}
                onPress={() => setUserType(2)}>
                <View style={styles.radioWrapper}>
                  <RadioButton
                    value="2"
                    status={userType === 2 ? 'checked' : 'unchecked'}
                    onPress={() => setUserType(2)}
                    color={theme.colors.buttonPrimary}
                  />
                </View>
                <Text
                  style={[styles.roleTitle, {color: theme.colors.onSurface}]}>
                  {t('register.installer', {defaultValue: '安装商/运营商'})}
                </Text>
                <Text
                  style={[
                    styles.roleDescription,
                    {color: theme.colors.onSurfaceVariant},
                  ]}>
                  {t('message.userswhoProvideServicesforPropertyOwners', {
                    defaultValue: '为业主提供服务的用户',
                  })}
                </Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={[
                styles.nextButton,
                {backgroundColor: theme.colors.buttonPrimary},
              ]}
              onPress={handleNext}>
              <Text style={styles.nextButtonText}>
                {t('register.next', {defaultValue: '下一步'})}
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {/* 步骤2：填写信息 */}
        {currentStep === RegisterStep.FORM_INPUT && (
          <View className=" flex-1 px-6 pt-6 pb-12">
            {/* 错误消息 */}
            {errorMessage ? (
              <View
                style={{
                  backgroundColor: theme.dark
                    ? 'rgba(217, 48, 37, 0.2)'
                    : 'rgba(255, 235, 238, 0.8)',
                  borderRadius: 8,
                  padding: 12,
                  marginBottom: 16,
                  borderLeftWidth: 4,
                  borderLeftColor: theme.dark ? '#FF6B6B' : '#D32F2F',
                }}>
                <Text
                  style={{
                    color: theme.dark ? '#FF6B6B' : '#D32F2F',
                    fontSize: 14,
                    fontWeight: '500',
                    lineHeight: 16,
                  }}>
                  {errorMessage}
                </Text>
              </View>
            ) : null}

            {/* 国家/地区选择 */}
            <View style={styles.inputGroup}>
              <Text style={[styles.label, {color: theme.colors.onSurface}]}>
                {t('userSetting.basicInfo.form.label.countryRegion', {
                  defaultValue: '国家/地区',
                })}
              </Text>
              <View style={styles.inputContainer}>
                <AntDesign
                  name="flag"
                  size={14}
                  color={theme.colors.onSurfaceVariant}
                  style={styles.inputIcon}
                />
                <TouchableOpacity
                  style={[
                    styles.dropdownButton,
                    {
                      backgroundColor: theme.colors.inputBackground,
                      borderColor: theme.colors.outline,
                      borderWidth: 1,
                      borderRadius: 20,
                      height: 40,
                    },
                  ]}
                  onPress={() => {
                    navigation.navigate('CountryPicker');
                  }}>
                  <Text
                    style={{
                      flex: 1,
                      color: theme.colors.onSurface,
                      paddingLeft: 36,
                    }}>
                    {selectedCountry?.name}
                  </Text>
                  <MaterialIcons
                    name="arrow-drop-down"
                    size={24}
                    color={theme.colors.onSurfaceVariant}
                  />
                </TouchableOpacity>
              </View>
            </View>

            {/* 时区选择 */}
            <View style={styles.inputGroup}>
              <Text style={[styles.label, {color: theme.colors.onSurface}]}>
                {t('sys.app.time.zone', {defaultValue: '时区'})}
              </Text>
              <View style={styles.inputContainer}>
                <AntDesign
                  name="clockcircleo"
                  size={14}
                  color={theme.colors.onSurfaceVariant}
                  style={styles.inputIcon}
                />
                <TouchableOpacity
                  style={[
                    styles.dropdownButton,
                    {
                      backgroundColor: theme.colors.inputBackground,
                      borderColor: theme.colors.outline,
                      borderWidth: 1,
                      borderRadius: 20,
                      height: 40,
                    },
                  ]}
                  onPress={() => setTimezonePickerVisible(true)}>
                  <Text
                    style={{
                      flex: 1,
                      color: theme.colors.onSurface,
                      paddingLeft: 36,
                    }}>
                    {getCurrentTimezoneName()}
                  </Text>
                  <MaterialIcons
                    name="arrow-drop-down"
                    size={24}
                    color={theme.colors.onSurfaceVariant}
                  />
                </TouchableOpacity>
              </View>
            </View>

            <Picker
              visible={timezonePickerVisible}
              data={timezoneList.map(item => item.code)}
              defaultValue={timezoneList[0]?.code}
              onCancel={() => setTimezonePickerVisible(false)}
              onConfirm={value => {
                const tz = timezoneList.find(t => t.code === value)!;
                handleSelectTimezone(tz.value);
              }}
            />

            <Divider
              style={{
                marginVertical: 12,
                backgroundColor: theme.colors.outlineVariant,
              }}
            />

            {/* 邮箱注册标题 */}
            <View style={styles.sectionHeader}>
              <Text
                style={[styles.sectionTitle, {color: theme.colors.onSurface}]}>
                {t('register.emailRegister', {defaultValue: '邮箱注册'})}
              </Text>
            </View>
            {/* 昵称字段 */}
            <View style={styles.sectionHeader}>
              <Text style={[styles.label, {color: theme.colors.onSurface}]}>
                {t('sysuser.nickname', {defaultValue: '昵称'})}
              </Text>
              <View style={styles.inputContainer}>
                <AntDesign
                  name="user"
                  size={22}
                  color={theme.colors.onSurfaceVariant}
                  style={styles.inputIcon}
                />
                <TextInput
                  style={[
                    styles.input,
                    {
                      backgroundColor: theme.colors.inputBackground,
                      height: 40,
                      borderRadius: 20,
                    },
                  ]}
                  mode="outlined"
                  placeholder={t('userSetting.form.error.nickname.required', {
                    defaultValue: '请输入昵称',
                  })}
                  value={nickname}
                  onChangeText={setNickname}
                  autoCapitalize="none"
                  outlineStyle={{borderRadius: 20}}
                />
              </View>
            </View>

            {/* 邮箱输入 */}
            <View style={styles.inputGroup}>
              <Text style={[styles.label, {color: theme.colors.onSurface}]}>
                {t('register.email', {defaultValue: '邮箱'})}
              </Text>
              <View style={styles.inputContainer}>
                <AntDesign
                  name="mail"
                  size={14}
                  color={theme.colors.onSurfaceVariant}
                  style={styles.inputIcon}
                />
                <TextInput
                  style={[
                    styles.input,
                    {
                      backgroundColor: theme.colors.inputBackground,
                      height: 40,
                      borderRadius: 20,
                    },
                  ]}
                  mode="outlined"
                  placeholder={t('register.enterEmail', {
                    defaultValue: '请输入邮箱',
                  })}
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  outlineStyle={{borderRadius: 20}}
                />
              </View>
            </View>

            {/* 验证码输入 */}
            <View style={styles.inputGroup}>
              <Text style={[styles.label, {color: theme.colors.onSurface}]}>
                {t('register.verificationCode', {defaultValue: '验证码'})}
              </Text>
              <View style={styles.verificationCodeContainer}>
                <View
                  style={[
                    styles.inputContainer,
                    {flex: 1, position: 'relative'},
                  ]}>
                  <AntDesign
                    name="key"
                    size={14}
                    color={theme.colors.onSurfaceVariant}
                    style={styles.inputIcon}
                  />
                  <TextInput
                    style={[
                      styles.input,
                      {
                        backgroundColor: theme.colors.inputBackground,
                        height: 40,
                        borderTopLeftRadius: 20,
                        borderBottomLeftRadius: 20,
                        borderTopRightRadius: 0,
                        borderBottomRightRadius: 0,
                        flex: 1,
                      },
                    ]}
                    mode="outlined"
                    placeholder={t('register.enterCode', {
                      defaultValue: '请输入验证码',
                    })}
                    value={verificationCode}
                    onChangeText={setVerificationCode}
                    keyboardType="number-pad"
                    outlineStyle={{
                      borderTopLeftRadius: 20,
                      borderBottomLeftRadius: 20,
                      borderTopRightRadius: 0,
                      borderBottomRightRadius: 0,
                    }}
                  />
                </View>
                <TouchableOpacity
                  style={[
                    styles.codeButton,
                    {
                      backgroundColor:
                        countdown > 0
                          ? theme.colors.buttonDisabled
                          : theme.colors.buttonPrimary,
                    },
                  ]}
                  onPress={handleSendVerificationCode}
                  disabled={countdown > 0 || sending}>
                  {sending ? (
                    <ActivityIndicator size="small" color="#FFFFFF" />
                  ) : (
                    <Text style={styles.codeButtonText}>
                      {countdown > 0
                        ? `${countdown}s`
                        : t('register.sendCode', {defaultValue: '发送验证码'})}
                    </Text>
                  )}
                </TouchableOpacity>
              </View>
            </View>

            {/* 密码输入 */}
            <View style={styles.inputGroup}>
              <Text style={[styles.label, {color: theme.colors.onSurface}]}>
                {t('register.password', {defaultValue: '密码'})}
              </Text>
              <View style={styles.inputContainer}>
                <AntDesign
                  name="lock"
                  size={14}
                  color={theme.colors.onSurfaceVariant}
                  style={styles.inputIcon}
                />
                <TextInput
                  style={[
                    styles.input,
                    {
                      backgroundColor: theme.colors.inputBackground,
                      height: 40,
                      borderRadius: 20,
                    },
                  ]}
                  mode="outlined"
                  placeholder={t('register.enterPassword', {
                    defaultValue: '请输入密码',
                  })}
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                  outlineStyle={{borderRadius: 20}}
                  right={
                    <TextInput.Icon
                      icon={showPassword ? 'eye' : 'eye-off'}
                      onPress={() => setShowPassword(!showPassword)}
                      size={14}
                    />
                  }
                />
              </View>
            </View>

            {/* 确认密码输入 */}
            <View style={styles.inputGroup}>
              <Text style={[styles.label, {color: theme.colors.onSurface}]}>
                {t('register.confirmPassword', {defaultValue: '确认密码'})}
              </Text>
              <View style={styles.inputContainer}>
                <AntDesign
                  name="lock"
                  size={14}
                  color={theme.colors.onSurfaceVariant}
                  style={styles.inputIcon}
                />
                <TextInput
                  style={[
                    styles.input,
                    {
                      backgroundColor: theme.colors.inputBackground,
                      height: 40,
                      borderRadius: 20,
                    },
                  ]}
                  mode="outlined"
                  placeholder={t('register.reenterPassword', {
                    defaultValue: '再次输入密码',
                  })}
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  secureTextEntry={!showConfirmPassword}
                  outlineStyle={{borderRadius: 20}}
                  right={
                    <TextInput.Icon
                      icon={showConfirmPassword ? 'eye' : 'eye-off'}
                      onPress={() =>
                        setShowConfirmPassword(!showConfirmPassword)
                      }
                      size={14}
                    />
                  }
                />
              </View>
            </View>

            {/* 安装商特有字段 */}
            {userType === 2 && (
              <View style={styles.inputGroup}>
                <Text style={[styles.label, {color: theme.colors.onSurface}]}>
                  {t('register.companyName', {defaultValue: '公司名称'})}
                </Text>
                <View style={styles.inputContainer}>
                  <AntDesign
                    name="business"
                    size={22}
                    color={theme.colors.onSurfaceVariant}
                    style={styles.inputIcon}
                  />
                  <TextInput
                    style={[
                      styles.input,
                      {
                        backgroundColor: theme.colors.inputBackground,
                        height: 40,
                        borderRadius: 20,
                      },
                    ]}
                    mode="outlined"
                    placeholder={t('register.enterCompanyName', {
                      defaultValue: '请输入公司名称',
                    })}
                    value={companyName}
                    onChangeText={setCompanyName}
                    outlineStyle={{borderRadius: 20}}
                  />
                </View>
              </View>
            )}

            <View style={styles.inputGroup}>
              <Text style={[styles.label, {color: theme.colors.onSurface}]}>
                {t('register.parentCode', {
                  defaultValue: '上级安装商、轻销商代码',
                })}
              </Text>
              <View style={styles.inputContainer}>
                <AntDesign
                  name="code"
                  size={22}
                  color={theme.colors.onSurfaceVariant}
                  style={styles.inputIcon}
                />
                <TextInput
                  style={[
                    styles.input,
                    {
                      backgroundColor: theme.colors.inputBackground,
                      height: 40,
                      borderRadius: 20,
                    },
                  ]}
                  mode="outlined"
                  placeholder={t('register.enterParentCode', {
                    defaultValue: '请输入',
                  })}
                  value={parentCode}
                  onChangeText={setParentCode}
                  outlineStyle={{borderRadius: 20}}
                />
              </View>
            </View>
            {/* 注册按钮 */}
            <TouchableOpacity
              style={[
                styles.registerButton,
                {
                  backgroundColor: loading
                    ? theme.colors.buttonDisabled
                    : theme.colors.buttonPrimary,
                },
              ]}
              onPress={handleRegister}
              disabled={loading}>
              {loading ? (
                <ActivityIndicator
                  size="small"
                  color="#FFFFFF"
                  style={{marginRight: 8}}
                />
              ) : null}
              <Text style={styles.registerButtonText}>
                {loading
                  ? t('register.registering', {defaultValue: '注册中...'})
                  : t('register.submit', {defaultValue: '注册'})}
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {/* 步骤3：注册成功 */}
        {currentStep === RegisterStep.REGISTER_SUCCESS && (
          <View style={styles.successContainer}>
            <View style={styles.successIconContainer}>
              <AntDesign
                name="checkcircle"
                size={72}
                color={theme.colors.buttonPrimary}
              />
            </View>

            <Text
              style={[styles.successTitle, {color: theme.colors.onSurface}]}>
              {t('register.successTitle', {defaultValue: '恭喜你！注册成功！'})}
            </Text>

            <Text
              style={[
                styles.successText,
                {color: theme.colors.onSurfaceVariant},
              ]}>
              {t('register.autoRedirect', {
                defaultValue: `${redirectCountdown} 秒后自动登录`,
              })}
            </Text>

            <TouchableOpacity
              style={[
                styles.loginButton,
                {backgroundColor: theme.colors.buttonPrimary},
              ]}
              onPress={handleReturnToLogin}>
              <Text style={styles.loginButtonText}>
                {t('register.backToLogin', {defaultValue: '立即返回登录'})}
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    // padding: 20,
    flexGrow: 1,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
    lineHeight: 18,
  },
  roleContainer: {
    marginBottom: 20,
  },
  roleCard: {
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    padding: 14,
    marginBottom: 14,
    position: 'relative',
  },
  radioWrapper: {
    position: 'absolute',
    right: 14,
    top: 14,
  },
  roleTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
    lineHeight: 18,
  },
  roleDescription: {
    fontSize: 13,
    lineHeight: 15,
  },
  nextButton: {
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  nextButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 15,
    lineHeight: 16,
  },
  sectionHeader: {
    marginBottom: 12,
    marginTop: 6,
  },
  inputGroup: {
    marginBottom: 10,
  },
  label: {
    marginBottom: 4,
    fontSize: 14,
    fontWeight: '500',
    lineHeight: 16,
  },
  inputContainer: {
    position: 'relative',
    flexDirection: 'row',
    alignItems: 'center',
  },
  inputIcon: {
    position: 'absolute',
    left: 12,
    zIndex: 2,
  },
  input: {
    flex: 1,
    paddingLeft: 36,
  },
  verificationCodeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 40,
  },
  codeButton: {
    height: 40,
    borderTopRightRadius: 20,
    borderBottomRightRadius: 20,
    paddingHorizontal: 16,
    justifyContent: 'center',
    alignItems: 'center',
    minWidth: 110,
  },
  codeButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 13,
    lineHeight: 14,
  },
  registerButton: {
    height: 40,
    borderRadius: 20,
    marginTop: 20,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  registerButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 15,
    lineHeight: 16,
  },
  successContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 50,
  },
  successIconContainer: {
    marginBottom: 20,
  },
  successTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 10,
    lineHeight: 22,
  },
  successText: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 16,
  },
  loginButton: {
    height: 40,
    borderRadius: 20,
    paddingHorizontal: 28,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  loginButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 15,
    lineHeight: 16,
  },
  dropdownButton: {
    height: 40,
    borderRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
    paddingRight: 12,
    justifyContent: 'space-between',
    backgroundColor: 'transparent',
    width: '100%',
  },
  selectedTimezone: {
    height: 40,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderWidth: 1,
    fontSize: 14,
    fontWeight: '400',
  },
  siteSelector: {
    height: 44,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    justifyContent: 'center',
    marginBottom: 20,
  },
});

export default RegisterScreen;
