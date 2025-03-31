import React, {useState} from 'react';
import {StyleSheet, View, ScrollView} from 'react-native';
import {List, RadioButton, useTheme, Divider, Text} from 'react-native-paper';
import {useTranslation} from 'react-i18next';
import {useSelector} from 'react-redux';

interface Language {
  value: string;
  label: string;
}

const LanguageSettingsScreen: React.FC<{navigation: any}> = ({navigation}) => {
  const {t, i18n} = useTranslation();
  const theme = useTheme();
  const [selectedLanguage, setSelectedLanguage] = useState(i18n.language);

  // 可用语言列表
  const languages: Language[] = useSelector(
    state => state.language.supportedLanguages,
  );

  // 更新语言设置
  const handleLanguageChange = (langCode: string) => {
    setSelectedLanguage(langCode);
    i18n.changeLanguage(langCode);
    // 如果需要持久化存储语言设置，可以在这里添加
  };

  return (
    <ScrollView
      className="flex-1 p-4"
      style={{backgroundColor: theme.colors.background}}>
        <View
          className="rounded-xl overflow-hidden shadow mb-4"
          style={{backgroundColor: theme.colors.surface}}>
          <RadioButton.Group
            onValueChange={handleLanguageChange}
            value={selectedLanguage}>
            {languages.map((lang, index) => (
              <React.Fragment key={lang.value}>
                <List.Item
                  title={lang.label}
                  description={lang.label}
                  onPress={() => handleLanguageChange(lang.value)}
                  right={() => (
                    <RadioButton
                      value={lang.value}
                      status={
                        selectedLanguage === lang.value
                          ? 'checked'
                          : 'unchecked'
                      }
                    />
                  )}
                />
                {index < languages.length - 1 && <Divider />}
              </React.Fragment>
            ))}
          </RadioButton.Group>
        </View>
    </ScrollView>
  );
};
export default LanguageSettingsScreen;
