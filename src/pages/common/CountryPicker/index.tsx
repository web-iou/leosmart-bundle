import React, {useState, useRef} from 'react';
import {View, TouchableOpacity} from 'react-native';
import {Text, List, Divider, useTheme, TextInput} from 'react-native-paper';
import {FlashList} from '@shopify/flash-list';
import {useTranslation} from 'react-i18next';
import AntDesign from 'react-native-vector-icons/AntDesign';
import {ExtendedMD3Theme} from '@/theme';
import {selectCountries, setSelectedCountry} from '@/store/slices/countrySlice';
import {useDispatch, useSelector} from 'react-redux';

export type CountryItem = {
  code: string;
  value: string;
  zoneList: {
    code: string;
    value: string;
  }[];
};

type AlphabetSection = {
  letter: string;
  countries: CountryItem[];
  index: number; // 用于定位
};

const CountryPicker = ({
  navigation,
}: ReactNavigation.Navigation<'CountryPicker'>) => {
  const {t} = useTranslation();
  const theme = useTheme<ExtendedMD3Theme>();
  const countries = useSelector(selectCountries);
  const dispatch = useDispatch();
  const [filteredCountries, setFilteredCountries] =
    useState<CountryItem[]>(countries);
  const [alphabetSections, setAlphabetSections] = useState<AlphabetSection[]>(
    [],
  );
  const [searchQuery, setSearchQuery] = useState('');
  const [activeLetter, setActiveLetter] = useState('');
  const flashListRef = useRef<FlashList<CountryItem>>(null);

  // 获取国家数据
  // useEffect(() => {
  //   const fetchCountries = async () => {
  //     try {
  //       setLoading(true);
  //       const response = await userApi.getCountry();
  //       // if (response.data && Array.isArray(response.data)) {
  //       // 按国家名称排序
  //       //   const sortedCountries = [...response.data].sort((a, b) =>
  //       //     a.value.localeCompare(b.value)
  //       //   );
  //       //   setCountries(response.data);
  //       //   setFilteredCountries(response.data);
  //       // 生成字母索引
  //       //   generateAlphabetSections(sortedCountries);
  //       // }
  //       const result = response.data.map(item => {
  //         return {
  //           ...item,
  //           name: t(item.code),
  //         };
  //       });
  //       setCountries(result);
  //       setFilteredCountries(result);
  //     } catch (err) {
  //       console.error('Error fetching countries:', err);
  //       setError(
  //         t('common.errorFetchingData', {defaultValue: '获取数据失败，请重试'}),
  //       );
  //     } finally {
  //       setLoading(false);
  //     }
  //   };

  //   fetchCountries();
  // }, []);

  // 生成字母索引分组
  const generateAlphabetSections = (data: CountryItem[]) => {
    const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
    const sections: AlphabetSection[] = [];

    let currentIndex = 0;

    alphabet.forEach(letter => {
      const countriesForLetter = data.filter(country =>
        country.value.toUpperCase().startsWith(letter),
      );

      if (countriesForLetter.length > 0) {
        sections.push({
          letter,
          countries: countriesForLetter,
          index: currentIndex,
        });
        currentIndex += countriesForLetter.length;
      }
    });

    setAlphabetSections(sections);
  };

  // 搜索处理
  const handleSearch = (query: string) => {
    setSearchQuery(query);
    if (!!query) {
      const filtered = countries.filter(country =>
        t(country.code).toLowerCase().includes(query.toLowerCase()),
      );
      setFilteredCountries(filtered);
    } else {
      setFilteredCountries(countries);
    }

    // if (!query.trim()) {
    //   setFilteredCountries(countries);
    // } else {
    //   const filtered = countries.filter(country =>
    //     country.value.toLowerCase().includes(query.toLowerCase()),
    //   );
    //   setFilteredCountries(filtered);
    // }

    // 重新生成字母索引
    // generateAlphabetSections(
    //   query.trim()
    //     ? countries.filter(country =>
    //         country.value.toLowerCase().includes(query.toLowerCase()),
    //       )
    //     : countries,
    // );
  };

  // 点击字母快速跳转
  const scrollToLetter = (letter: string) => {
    const section = alphabetSections.find(s => s.letter === letter);
    if (section && flashListRef.current) {
      flashListRef.current.scrollToIndex({
        index: section.index,
        viewPosition: 0,
        animated: true,
      });
      setActiveLetter(letter);

      // 短暂高亮后恢复
      setTimeout(() => {
        setActiveLetter('');
      }, 1500);
    }
  };

  // 渲染国家项
  const renderCountryItem = ({item}: {item: CountryItem}) => (
    <TouchableOpacity
      onPress={() => {
        dispatch(setSelectedCountry(item));
        navigation.goBack();
      }}>
      <List.Item
        title={t(item.code)}
        right={props => <List.Icon {...props} icon="chevron-right" />}
        className="py-1"
        titleStyle={{fontWeight: '500'}}
      />
      <Divider />
    </TouchableOpacity>
  );

  // 字母索引渲染
  const renderAlphabetSidebar = () => {
    return (
      <View className="absolute right-1 top-0 bottom-0 justify-center z-10">
        <View
          className="rounded-full py-1 px-0.5 overflow-hidden"
          style={{
            backgroundColor: theme.colors.surfaceVariant,
            elevation: 2,
            shadowColor: '#000',
            shadowOffset: {width: 0, height: 1},
            shadowOpacity: 0.22,
            shadowRadius: 2.22,
          }}>
          {alphabetSections.map(section => (
            <TouchableOpacity
              key={section.letter}
              onPress={() => scrollToLetter(section.letter)}
              className="py-0.5">
              <Text
                className="text-xs font-medium text-center w-6"
                style={{
                  color:
                    activeLetter === section.letter
                      ? theme.colors.primary
                      : theme.colors.onSurface,
                  fontWeight:
                    activeLetter === section.letter ? 'bold' : 'normal',
                }}>
                {section.letter}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    );
  };

  return (
    <View
      className="flex-1 px-4 pt-4"
      style={{backgroundColor: theme.colors.background}}>
      {/* 搜索栏 */}
      <View className="pb-2">
        <View className="flex-row items-center">
          <View className="flex-row items-center flex-1 relative">
            <AntDesign
              name="search1"
              size={14}
              color={theme.colors.onSurfaceVariant}
              style={{
                position: 'absolute',
                left: 12,
                zIndex: 1,
              }}
            />
            <TextInput
              mode="outlined"
              placeholder={t('country.search', {defaultValue: '搜索国家/地区'})}
              value={searchQuery}
              onChangeText={handleSearch}
              className="flex-1"
              style={{
                backgroundColor: theme.colors.inputBackground,
                height: 40,
                width: '100%',
              }}
              outlineStyle={{
                borderRadius: 20,
                borderColor: theme.colors.outline,
              }}
              contentStyle={{
                paddingLeft: 40,
              }}
              right={
                searchQuery ? (
                  <TextInput.Icon
                    icon="close"
                    onPress={() => handleSearch('')}
                    size={20}
                  />
                ) : null
              }
            />
          </View>
        </View>
      </View>

      <View className="flex-1">
        {/* {renderAlphabetSidebar()} */}
        <FlashList
          ref={flashListRef}
          data={filteredCountries}
          renderItem={renderCountryItem}
          estimatedItemSize={43} // 估计每个项目的高度，对性能很重要
          keyExtractor={item => item.value}
          contentContainerStyle={{paddingBottom: 20}}
          ListEmptyComponent={
            <View className="flex-1 justify-center items-center p-8">
              <Text style={{color: theme.colors.onSurfaceVariant}}>
                {t('country.noResults', {
                  defaultValue: '未找到匹配的国家/地区',
                })}
              </Text>
            </View>
          }
        />
      </View>
    </View>
  );
};

export default CountryPicker;
