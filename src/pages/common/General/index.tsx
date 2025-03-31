/*
 * @Author: cx19940809
 * @Date: 2025-03-31 09:09:25
 * @LastEditors: cx19940809 
 * @LastEditTime: 2025-03-31 09:26:05
 * @FilePath: /leosmart/src/pages/common/General/index.tsx
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
import React from 'react';
import {StyleSheet, View} from 'react-native';
import {List, useTheme, Divider} from 'react-native-paper';
import {useTranslation} from 'react-i18next';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { useNavigation } from '@react-navigation/native';

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
  const navigation = useNavigation();
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
                <MaterialCommunityIcons
                  name="translate"
                  size={size}
                  color={color}
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
