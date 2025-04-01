import {setTheme} from '@/store/slices/themeSlice';
import {showToast} from '@/store/slices/toastSlice';
import {ThemeType} from '@/theme';
import storage from '@/utils/storage';
import {forwardRef, useImperativeHandle, useState} from 'react';
import {useTranslation} from 'react-i18next';
import {Button, Dialog, Portal, RadioButton} from 'react-native-paper';
import {useDispatch} from 'react-redux';

export default forwardRef(
  ({setThemeDialogVisible, themeDialogVisible}: {setThemeDialogVisible: (value:boolean)=>void, themeDialogVisible: boolean}, ref) => {
    const {t} = useTranslation();
    const dispatch = useDispatch();
    const [selectedTheme, setSelectedTheme] = useState('light');
    const handleThemeChange = async (theme: ThemeType) => {
      try {
        setThemeDialogVisible(false);
        if (theme === selectedTheme) return;
        setSelectedTheme(theme);
        await storage.setAsync('theme', theme);
        dispatch(setTheme(theme));
        dispatch(
          showToast({
            message: t('common.themeChangedSuccess', {
              defaultValue: '主题切换成功',
            }),
            type: 'success',
            duration: 2000,
          }),
        );
      } catch (error) {
        console.error('Failed to change theme:', error);
      }
    };
    useImperativeHandle(
      ref,
      () => {
        return {
          setSelectedTheme,
        };
      },
      [],
    );
    return (
      <Portal>
        <Dialog
          visible={themeDialogVisible}
          onDismiss={() => setThemeDialogVisible(false)}>
          <Dialog.Title>
            {t('settings.appearance', {defaultValue: '选择主题'})}
          </Dialog.Title>

          <Dialog.Content>
            <RadioButton.Group
              onValueChange={value => handleThemeChange(value as ThemeType)}
              value={selectedTheme}>
              <RadioButton.Item
                label={t('settings.theme.light', {defaultValue: '浅色模式'})}
                value="light"
              />
              <RadioButton.Item
                label={t('settings.theme.dark', {defaultValue: '深色模式'})}
                value="dark"
              />
              <RadioButton.Item
                label={t('settings.theme.system', {defaultValue: '跟随系统'})}
                value="system"
              />
            </RadioButton.Group>
          </Dialog.Content>

          <Dialog.Actions>
            <Button onPress={() => setThemeDialogVisible(false)}>
              {t('common.cancel', {defaultValue: '取消'})}
            </Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    );
  },
);
