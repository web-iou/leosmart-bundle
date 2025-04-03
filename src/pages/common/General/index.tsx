/*
 * @Author: wangjunwj wangjunwj@dinglicom.com
 * @Date: 2025-04-01 09:21:20
 * @LastEditors: wangjunwj wangjunwj@dinglicom.com
 * @LastEditTime: 2025-04-03 09:14:37
 * @FilePath: /leosmart/src/pages/common/General/index.tsx
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
import React from 'react';
import {StyleSheet, View} from 'react-native';
import {List, useTheme, Divider} from 'react-native-paper';
import {useTranslation} from 'react-i18next';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { useNavigation } from '@react-navigation/native';
import AntDesign from 'react-native-vector-icons/AntDesign';

interface FeatureListProps {
  onVendorPress: () => void;
  currentLanguage: string;
  currentVendor?: string;
}

const FeatureList: React.FC<FeatureListProps> = ({
  onVendorPress,
  currentLanguage,
  currentVendor,
}) => {
  const theme = useTheme();
  const navigation = useNavigation<ReactNavigation.Navigation['navigation']>();
  const {t} = useTranslation();
  const onLanguagePress = () => {
    navigation.navigate('LanguageSettings');
  };
  return (
    <View
      style={[styles.container, {backgroundColor: theme.colors.background}]}>
      <List.Section>
        <List.Item
          title={t('settings.language')}
          description={currentLanguage}
          left={props => (
            <List.Icon
              {...props}
              icon={({size, color}) => (
                 <AntDesign
                  name="earth"
                  size={14}
                  color={theme.colors.onSurfaceVariant}
                  style={styles.inputIcon}
                />
              )}
            />
          )}
          right={props => <List.Icon {...props} icon="chevron-right" />}
          onPress={onLanguagePress}
          style={styles.listItem}
        />
        <Divider />
        <List.Item
          title={t('settings.vendor')}
          description={currentVendor || t('settings.selectVendor')}
          left={props => (
            <List.Icon
              {...props}
              icon={({size, color}) => (
                <MaterialCommunityIcons
                  name="account-group"
                  size={size}
                  color={color}
                />
              )}
            />
          )}
          right={props => <List.Icon {...props} icon="chevron-right" />}
          onPress={onVendorPress}
          style={styles.listItem}
        />
      </List.Section>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 8,
    marginHorizontal: 16,
    marginVertical: 8,
    overflow: 'hidden',
    elevation: 1,
  },
  listItem: {
    paddingVertical: 12,
  },
});

export default FeatureList;
