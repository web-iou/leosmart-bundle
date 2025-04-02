import React, {useState} from 'react';
import {View, ScrollView} from 'react-native';
import {List, RadioButton, useTheme, Divider} from 'react-native-paper';
import {useTranslation} from 'react-i18next';
import {useDispatch, useSelector} from 'react-redux';
import {setTheme} from '@/store/slices/themeSlice';
import {storage} from '@/utils/storage';
import {ThemeType} from '@/theme';
import SafeAreaLayout from '@/components/SafeAreaLayout';

interface ThemeOption {
  value: ThemeType;
  label: string;
}

const ThemeSettingsScreen: React.FC<{navigation: any}> = ({_navigation}) => {
  const {t} = useTranslation();
  const theme = useTheme();
  const dispatch = useDispatch();
  const currentTheme = useSelector((state: any) => state.theme.themeType);
  const [selectedTheme, setSelectedTheme] = useState<ThemeType>(currentTheme);

  // 主题选项列表
  const themeOptions: ThemeOption[] = [
    {
      value: 'light',
      label: t('theme.light', {defaultValue: '浅色'}),
    },
    {
      value: 'dark',
      label: t('theme.dark', {defaultValue: '深色'}),
    },
    {
      value: 'system',
      label: t('theme.system', {defaultValue: '跟随系统'}),
    },
  ];

  // 更新主题设置
  const handleThemeChange = async (themeType: ThemeType) => {
    setSelectedTheme(themeType);
    dispatch(setTheme(themeType));
    await storage.setAsync('theme', themeType);
  };

  return (

      <ScrollView style={{backgroundColor: theme.colors.background}}>
        <View
          style={{
            margin: 16,
            borderRadius: 12,
            overflow: 'hidden',
            backgroundColor: theme.colors.surface,
            shadowColor: '#000',
            shadowOffset: {width: 0, height: 1},
            shadowOpacity: 0.2,
            shadowRadius: 1.41,
            elevation: 2,
          }}>
          <RadioButton.Group
            onValueChange={value => handleThemeChange(value as ThemeType)}
            value={selectedTheme}>
            {themeOptions.map((themeOption, index) => (
              <React.Fragment key={themeOption.value}>
                <List.Item
                  title={themeOption.label}
                  onPress={() => handleThemeChange(themeOption.value)}
                  right={() => (
                    <RadioButton
                      value={themeOption.value}
                      status={
                        selectedTheme === themeOption.value ? 'checked' : 'unchecked'
                      }
                    />
                  )}
                />
                {index < themeOptions.length - 1 && <Divider />}
              </React.Fragment>
            ))}
          </RadioButton.Group>
        </View>
      </ScrollView>

  );
};

export default ThemeSettingsScreen; 