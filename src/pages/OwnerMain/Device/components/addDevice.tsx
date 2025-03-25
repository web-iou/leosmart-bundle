import {
  Alert,
  Linking,
  Pressable,
  Text,
  View,
  useWindowDimensions,
} from 'react-native';
import {useTranslation} from 'react-i18next';
import {useEffect, useLayoutEffect, useState} from 'react';
import {useCameraPermission} from 'react-native-vision-camera';
// import FlashLight from '@/components/flashLight';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {useFocusEffect, useNavigation} from '@react-navigation/native';
import {useStatusBarHidden} from '@/hooks/useStatusBarHidden';
// import Photo from '@/components/photo';
// import {addDevice, checkSNCode} from '@/apis/device';
import ScannerOverlay from './ScannerOverlay';
import {Button} from 'react-native-paper';
import Icon from 'react-native-vector-icons/AntDesign';
import EvilIcons from 'react-native-vector-icons/EvilIcons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import NativeFlashLight from '~/specs/NativeFlashLight';
import {launchImageLibrary} from 'react-native-image-picker';
console.log(launchImageLibrary);

// export const SNCode = ({
//   route: {
//     params: {code},
//   },
// }: RootStackScreenProps<'AddDeviceBySNCode'>) => {
//   const {t} = useTranslation();
//   const [loading, setLoading] = useState(false);
//   const navigation =
//     useNavigation<RootStackScreenProps<'AddDeviceBySNCode'>['navigation']>();
//   const {
//     formState: {errors},
//     control,
//     handleSubmit,
//   } = useForm<{code: string; name: string}>({
//     defaultValues: {
//       code,
//     },
//   });
//   const onSubmit = (data: any) => {
//     setLoading(true);
//     checkSNCode(data.code)
//       .then(result => {
//         if (result) {
//           Alert.alert('提示', 'SN序列号已存在', [
//             {
//               text: '确定',
//             },
//           ]);
//         } else {
//           return addDevice({
//             sn: data.code,
//             name: data.name,
//           }).then(() => {
//             showToast({
//               message: '添加成功',
//             });
//             navigation.replace('Home');
//           });
//         }
//       })
//       .finally(() => {
//         setLoading(false);
//       });
//   };
//   return (
//     <View className="w-full p-6">
//       {/* Account Input */}
//       <FormControl
//         isInvalid={!!errors?.code}
//         size="lg"
//         // isRequired={true}
//         className="mb-4">
//         <FormControlLabel>
//           <FormControlLabelText>{'SN序列号'}</FormControlLabelText>
//         </FormControlLabel>
//         <Controller
//           name="code"
//           control={control}
//           rules={{
//             required: '请输入SN序列号' || t('login.form.userName.placeholder'),
//             // validate: value => {
//             //   if (!testAccount(value))
//             //     return 'Please enter a valid mobile number or email';
//             //   return true;
//             // },
//           }}
//           render={({field: {onChange, value}}) => (
//             <Input className="bg-gray-50 rounded-2xl border-0 shadow-sm">
//               <InputField
//                 className="text-base h-14 pl-5"
//                 // placeholder={t('login.form.userName.placeholder')}
//                 value={value}
//                 onChangeText={onChange}
//                 autoCapitalize="none"
//                 keyboardType="email-address"
//               />
//             </Input>
//           )}
//         />
//         {errors?.code && (
//           <FormControlError>
//             <FormControlErrorIcon as={AlertCircleIcon} />
//             <FormControlErrorText className="text-xs ml-1">
//               {errors?.code?.message}
//             </FormControlErrorText>
//           </FormControlError>
//         )}
//       </FormControl>

//       <FormControl
//         isInvalid={!!errors.name}
//         size="lg"
//         isRequired={true}
//         className="mb-4">
//         <Controller
//           name="name"
//           control={control}
//           rules={
//             {
//               // required: t('datasourceconf.inputpasswordTip'),
//             }
//           }
//           render={({field: {onChange, onBlur, value}}) => (
//             <Input className="bg-gray-50 rounded-2xl border-0 shadow-sm">
//               <InputField
//                 className="text-base h-14 pl-5"
//                 placeholder={'请输入设备名称'}
//                 onBlur={onBlur}
//                 value={value}
//                 onChangeText={onChange}
//               />
//             </Input>
//           )}
//         />
//         {errors?.name && (
//           <FormControlError>
//             <FormControlErrorIcon as={AlertCircleIcon} />
//             <FormControlErrorText className="text-xs ml-1">
//               {errors?.name?.message}
//             </FormControlErrorText>
//           </FormControlError>
//         )}
//       </FormControl>

//       {/* Login Button */}
//       <Button
//         className="bg-[#FF8A00] active:bg-[#E67A00] rounded-full h-14 shadow-lg"
//         size="lg"
//         variant="solid"
//         disabled={loading}
//         onPress={handleSubmit(onSubmit)}>
//         {loading ? <ButtonSpinner /> : null}
//         <ButtonText className="text-lg font-semibold">
//           {/* {t('password.accountBtnText')} */}
//           添加
//         </ButtonText>
//       </Button>
//     </View>
//   );
// };
export const ScanCode = () => {
  const {hasPermission, requestPermission} = useCameraPermission();
  const navigation = useNavigation();
  const {top, bottom} = useSafeAreaInsets();
  const [open, setOpen] = useState(false);
  useStatusBarHidden();
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
  }, []);
  const onSubmit = (code: string) => {
    NativeFlashLight.notice();
    navigation.navigate({
      name: 'AddDeviceBySNCode',
      params: {code},
    });
  };
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
    <View className="flex-1">
      <ScannerOverlay></ScannerOverlay>
      <Pressable
        style={{
          position: 'absolute',
          top: top + 10,
          left: 32,
        }}
        onPress={() => {
          navigation.goBack();
        }}>
        <Icon name="leftcircle" size={28} color={'rgb(230,230,231)'}></Icon>
      </Pressable>
      <Pressable
        className=" absolute left-8 z-40 rounded-full p-2.5 gap-y-2 justify-center items-center"
        style={{
          bottom: 100,
        }}
        onPress={() => {
          launchImageLibrary({
            mediaType: 'photo',
            quality: 1,
            includeBase64: false,
          }).then(value => {
            console.log(value);
          });
        }}>
        <View className=" items-center justify-center bg-primary-400 size-12 rounded-full">
          <EvilIcons
            name="image"
            style={{
              textAlign: 'center',
            }}
            size={32}
            color={'rgb(230,230,231)'}></EvilIcons>
        </View>
        <Text className=" text-white">相册导入</Text>
      </Pressable>
      <Pressable
        className=" absolute right-8 z-40 rounded-full p-2.5 gap-y-2 justify-center items-center"
        style={{
          bottom: 100,
        }}
        onPress={() => {
          setOpen(!open);
        }}>
        <View className=" items-center justify-center bg-primary-400 size-12 rounded-full">
          <MaterialCommunityIcons
            name={!open ? 'flashlight' : 'flashlight-off'}
            style={{
              textAlign: 'center',
            }}
            size={32}
            color={'rgb(230,230,231)'}></MaterialCommunityIcons>
        </View>
        <Text className=" text-white">
          {!open ? '打开手电筒' : '关闭手电筒'}
        </Text>
      </Pressable>
    </View>
  );
};
