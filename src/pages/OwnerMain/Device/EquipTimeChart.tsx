import React, {useState, useEffect, useLayoutEffect} from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Dimensions,
  ActivityIndicator,
  StatusBar,
} from 'react-native';
import {Text, Card, useTheme, SegmentedButtons} from 'react-native-paper';
import {useTranslation} from 'react-i18next';
import {
  VictoryLine,
  VictoryChart,
  VictoryTheme,
  VictoryAxis,
  VictoryGroup,
} from 'victory-native';
import {ExtendedMD3Theme} from '@/theme';
import {deviceApi, EquipTimeIndicatorDTO} from '@/services/api/deviceApi';
import dayjs from 'dayjs';
import { SafeAreaView } from 'react-native-safe-area-context';
import {useNavigation} from '@react-navigation/native';

interface EquipTimeChartProps {
  route: {
    params: {
      id: number;
    };
  };
}

const EquipTimeChart: React.FC<EquipTimeChartProps> = ({route}) => {
  const {t} = useTranslation();
  const theme = useTheme() as ExtendedMD3Theme;
  const screenWidth = Dimensions.get('window').width;
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState('power');
  const [data, setData] = useState<EquipTimeIndicatorDTO[]>([]);
  const navigation = useNavigation();

  // 设置标题栏样式
  useLayoutEffect(() => {
    navigation.setOptions({
      title: t('device.equipTimeData', {defaultValue: '设备时间数据'}),
      headerStyle: {
        backgroundColor: theme.colors.background,
      },
      headerTintColor: theme.colors.onBackground,
      headerShadowVisible: false,
    });
  }, [navigation, theme.colors.background, theme.colors.onBackground, t]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await deviceApi.getEquipTimeIndicator(route.params.id);
        setData(response.data);
      } catch (error) {
        console.error('Failed to fetch equipment time data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [route.params.id]);

  // 设置状态栏样式
  useEffect(() => {
    StatusBar.setBarStyle(theme.dark ? 'light-content' : 'dark-content');
    StatusBar.setBackgroundColor(theme.colors.background);
    
    // 返回清理函数
    return () => {
      StatusBar.setBarStyle('default');
    };
  }, [theme.dark, theme.colors.background]);

  const renderChart = (
    chartData: EquipTimeIndicatorDTO[],
    title: string,
    unit: string,
    dataKey: keyof EquipTimeIndicatorDTO,
  ) => {
    if (!chartData.length) {
      return (
        <Card style={[styles.chartCard, {backgroundColor: theme.colors.surface, borderColor: theme.colors.outline, borderWidth: 1}]}>
          <Card.Content>
            <Text style={[styles.chartTitle, {color: theme.colors.onSurface}]}>
              {title}
            </Text>
            <View style={[styles.emptyStateContainer, {backgroundColor: theme.colors.surface}]}>
              <Text style={{color: theme.colors.onSurfaceVariant}}>
                {t('common.noData', {defaultValue: '暂无数据'})}
              </Text>
            </View>
          </Card.Content>
        </Card>
      );
    }

    // 获取所有指标的最大值
    let allValues: number[] = [];
    chartData.forEach(item => {
      const value = item[dataKey];
      if (typeof value === 'number') allValues.push(value);
    });
    const maxValue = Math.max(...allValues, 0);

    const dataPointWidth = 60;
    const calculatedWidth = Math.max(
      screenWidth - 32,
      chartData.length * dataPointWidth,
    );

    // 线条颜色，使用主题颜色
    const lineColor = theme.colors.primary;

    // 自定义图表主题，基于应用主题
    const chartTheme = {
      ...VictoryTheme.material,
      background: { fill: theme.colors.surface },
      axis: {
        style: {
          axis: { stroke: theme.colors.outline },
          grid: { stroke: 'transparent' },
          ticks: { stroke: theme.colors.outline, size: 5 },
          tickLabels: { fill: theme.colors.onSurfaceVariant, fontSize: 10 }
        }
      }
    };

    return (
      <Card style={[styles.chartCard, {backgroundColor: theme.colors.surface, borderColor: theme.colors.outline, borderWidth: 1}]}>
        <Card.Content>
          <Text style={[styles.chartTitle, {color: theme.colors.onSurface}]}>
            {title}
          </Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={true}>
            <View style={{width: calculatedWidth, backgroundColor: theme.colors.surface}}>
              <VictoryChart
                theme={chartTheme}
                height={300}
                width={calculatedWidth}
                padding={{top: 50, bottom: 50, left: 60, right: 50}}
                domainPadding={{x: 20}}
                style={{
                  background: { fill: theme.colors.surface }
                }}>
                <VictoryAxis
                  tickFormat={time => dayjs(time).format('HH:mm')}
                  style={{
                    axis: {stroke: theme.colors.outline},
                    tickLabels: {
                      fill: theme.colors.onSurfaceVariant,
                      fontSize: 10,
                      angle: -45,
                      textAnchor: 'end',
                    },
                    grid: {stroke: 'transparent'},
                  }}
                  tickCount={chartData.length}
                />
                <VictoryAxis
                  dependentAxis
                  tickFormat={value => `${value}${unit}`}
                  style={{
                    axis: {stroke: theme.colors.outline},
                    tickLabels: {
                      fill: theme.colors.onSurfaceVariant,
                      fontSize: 10,
                    },
                  }}
                  domain={[0, maxValue * 1.1]}
                />
                <VictoryGroup>
                  <VictoryLine
                    data={chartData}
                    x="time"
                    y={dataKey}
                    style={{data: {stroke: lineColor, strokeWidth: 2}}}
                    interpolation="monotoneX"
                  />
                </VictoryGroup>
              </VictoryChart>
            </View>
          </ScrollView>
        </Card.Content>
      </Card>
    );
  };

  const chartTypes = [
    {
      value: 'power',
      label: t('device.power', {defaultValue: '功率'}),
      unit: 'W',
      title: '功率曲线',
      dataKey: 'power' as keyof EquipTimeIndicatorDTO,
    },
    {
      value: 'voltage',
      label: t('device.voltage', {defaultValue: '电压'}),
      unit: 'V',
      title: '电压曲线',
      dataKey: 'voltage' as keyof EquipTimeIndicatorDTO,
    },
    {
      value: 'current',
      label: t('device.current', {defaultValue: '电流'}),
      unit: 'A',
      title: '电流曲线',
      dataKey: 'current' as keyof EquipTimeIndicatorDTO,
    },
  ];

  const getCurrentChart = () => {
    const chart = chartTypes.find(type => type.value === selected);
    return {
      data,
      title: chart?.title || '数据曲线',
      unit: chart?.unit || '',
      dataKey: chart?.dataKey || 'power',
    };
  };

  return (
    <SafeAreaView style={{flex: 1, backgroundColor: theme.colors.background}}>
      <ScrollView style={[styles.container, {backgroundColor: theme.colors.background}]}>
        <View style={styles.header}>
          <Text style={[styles.pageTitle, {color: theme.colors.onBackground}]}>
            {t('device.equipTimeData', {defaultValue: '设备时间数据'})}
          </Text>
          <SegmentedButtons
            value={selected}
            onValueChange={setSelected}
            buttons={chartTypes.map(type => ({
              value: type.value,
              label: type.label,
            }))}
            style={styles.segmentedButtons}
          />
        </View>

        {loading ? (
          <View style={[styles.loadingContainer, {backgroundColor: theme.colors.surface}]}>
            <ActivityIndicator size="large" color={theme.colors.primary} />
            <Text style={{color: theme.colors.onSurfaceVariant, marginTop: 10}}>
              {t('common.loading', {defaultValue: '加载中...'})}
            </Text>
          </View>
        ) : (
          <>
            {renderChart(
              getCurrentChart().data,
              getCurrentChart().title,
              getCurrentChart().unit,
              getCurrentChart().dataKey,
            )}
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  header: {
    marginBottom: 16,
  },
  pageTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  segmentedButtons: {
    marginBottom: 16,
  },
  chartCard: {
    marginBottom: 16,
    borderRadius: 12,
    overflow: 'hidden',
  },
  chartTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: 300,
  },
  emptyStateContainer: {
    height: 300,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default EquipTimeChart;
