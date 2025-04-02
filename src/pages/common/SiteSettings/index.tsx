import React, {useState, useEffect} from 'react';
import {View, ScrollView} from 'react-native';
import {List, RadioButton, useTheme, Divider} from 'react-native-paper';
import {useTranslation} from 'react-i18next';
import {useDispatch, useSelector} from 'react-redux';
import {setSite} from '@/store/slices/siteSlice';
import {storage} from '@/utils/storage';
import SafeAreaLayout from '@/components/SafeAreaLayout';

interface Site {
  value: string;
  label: string;
  url: string;
}

const SiteSettingsScreen: React.FC<{navigation: any}> = ({navigation}) => {
  const {t} = useTranslation();
  const theme = useTheme();
  const dispatch = useDispatch();
  const currentSite = useSelector((state: any) => state.site?.currentSite || 'china');
  const [selectedSite, setSelectedSite] = useState<string>(currentSite);

  // 初始化时读取保存的站点设置
  useEffect(() => {
    const initSite = async () => {
      try {
        const savedSite = await storage.getStringAsync('site');
        if (savedSite) {
          const siteData = JSON.parse(savedSite);
          dispatch(setSite(siteData));
          setSelectedSite(siteData.currentSite);
        }
      } catch (error) {
        console.error('Error loading site settings:', error);
      }
    };
    initSite();
  }, [dispatch]);

  // 站点列表
  const sites: Site[] = [
    {
      value: 'china',
      label: t('site.china', {defaultValue: '中国站点'}),
      url: 'https://tsc2cloud.com',
    },
    {
      value: 'europe',
      label: t('site.europe', {defaultValue: '欧洲站点'}),
      url: 'https://eu.tsc2cloud.com',
    },
    {
      value: 'america',
      label: t('site.america', {defaultValue: '美洲站点'}),
      url: 'https://us.tsc2cloud.com',
    },
  ];

  // 更新站点设置
  const handleSiteChange = async (siteValue: string) => {
    try {
      const selectedSiteConfig = sites.find(site => site.value === siteValue);
      if (selectedSiteConfig) {
        const siteData = {
          currentSite: siteValue,
          siteUrl: selectedSiteConfig.url
        };
        
        setSelectedSite(siteValue);
        dispatch(setSite(siteData));
        
        // 保存到存储
        await storage.setAsync('site', JSON.stringify(siteData));
        
        // 返回上一页
        navigation.goBack();
      }
    } catch (error) {
      console.error('Error changing site:', error);
    }
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
            onValueChange={handleSiteChange}
            value={selectedSite}>
            {sites.map((site, index) => (
              <React.Fragment key={site.value}>
                <List.Item
                  title={site.label}
                  description={site.url}
                  onPress={() => handleSiteChange(site.value)}
                  right={() => (
                    <RadioButton
                      value={site.value}
                      status={
                        selectedSite === site.value ? 'checked' : 'unchecked'
                      }
                    />
                  )}
                />
                {index < sites.length - 1 && <Divider />}
              </React.Fragment>
            ))}
          </RadioButton.Group>
        </View>
      </ScrollView>

  );
};

export default SiteSettingsScreen; 