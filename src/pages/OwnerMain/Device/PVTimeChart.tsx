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
  VictoryLegend,
  VictoryGroup,
} from 'victory-native';
import {ExtendedMD3Theme} from '@/theme';
import {deviceApi} from '@/services/api/deviceApi';
import dayjs from 'dayjs';
import {useNavigation} from '@react-navigation/native';

interface PVTimeChartProps {
  route: {
    params: {
      id: number;
    };
  };
}

const PVTimeChart: React.FC<PVTimeChartProps> = ({route}) => {
  const {t} = useTranslation();
  const theme = useTheme() as ExtendedMD3Theme;
  const screenWidth = Dimensions.get('window').width;
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState('power');
  const [data, setData] = useState<{
    power: Array<{
      time: string;
      pv1Indicator?: number;
      pv2Indicator?: number;
      pv3Indicator?: number;
      pv4Indicator?: number;
    }>;
    voltage: Array<{
      time: string;
      pv1Indicator?: number;
      pv2Indicator?: number;
      pv3Indicator?: number;
      pv4Indicator?: number;
    }>;
    current: Array<{
      time: string;
      pv1Indicator?: number;
      pv2Indicator?: number;
      pv3Indicator?: number;
      pv4Indicator?: number;
    }>;
  }>({
    power: [],
    voltage: [],
    current: [],
  });
  const navigation = useNavigation();

  // 设置标题栏样式
  useLayoutEffect(() => {
    navigation.setOptions({
      title: t('device.pvTimeData', {defaultValue: 'PV时间数据'}),
      headerStyle: {
        backgroundColor: theme.colors.background,
      },
      headerTintColor: theme.colors.onBackground,
      headerShadowVisible: false,
    });
  }, [navigation, theme.colors.background, theme.colors.onBackground, t]);

  // 设置状态栏样式
  useEffect(() => {
    StatusBar.setBarStyle(theme.dark ? 'light-content' : 'dark-content');
    StatusBar.setBackgroundColor(theme.colors.background);

    // 返回清理函数
    return () => {
      StatusBar.setBarStyle('default');
    };
  }, [theme.dark, theme.colors.background]);

  useEffect(() => {
    const fetchData = async () => {      
      try {
        setLoading(true);
        const response = await deviceApi.getPvTimeIndicator(route.params.id);
        setData(response.data);
      } catch (error) {
        console.error('Failed to fetch PV time data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [route.params.id]);

  const renderChart = (
    data: Array<{
      time: string;
      pv1Indicator?: number;
      pv2Indicator?: number;
      pv3Indicator?: number;
      pv4Indicator?: number;
    }>,
    title: string,
    unit: string,
  ) => {
    // 使用更兼容的方式计算最大值
    let allValues: number[] = [];
    data.forEach(item => {
      if (item.pv1Indicator !== undefined) allValues.push(item.pv1Indicator);
      if (item.pv2Indicator !== undefined) allValues.push(item.pv2Indicator);
      if (item.pv3Indicator !== undefined) allValues.push(item.pv3Indicator);
      if (item.pv4Indicator !== undefined) allValues.push(item.pv4Indicator);
    });
    const maxValue = Math.max(...allValues, 0);

    const dataPointWidth = 60;
    const calculatedWidth = Math.max(
      screenWidth - 32,
      data.length * dataPointWidth,
    );

    // 定义图表线条颜色，使用主题中的颜色或兼容的固定颜色
    const lineColors = {
      pv1: theme.dark ? '#FFA726' : '#FF9800', // 橙色
      pv2: theme.dark ? '#42A5F5' : '#2196F3', // 蓝色
      pv3: theme.dark ? '#66BB6A' : '#4CAF50', // 绿色
      pv4: theme.dark ? '#AB47BC' : '#9C27B0', // 紫色
    };

    // 自定义图表主题，基于应用主题
    const chartTheme = {
      ...VictoryTheme.material,
      background: {fill: theme.colors.surface},
      axis: {
        style: {
          axis: {stroke: theme.colors.outline},
          grid: {stroke: 'transparent'},
          ticks: {stroke: theme.colors.outline, size: 5},
          tickLabels: {fill: theme.colors.onSurfaceVariant, fontSize: 10},
        },
      },
    };

    return (
      <Card
        style={[
          styles.chartCard,
          {
            backgroundColor: theme.colors.surface,
            borderColor: theme.colors.outline,
            borderWidth: 1,
          },
        ]}>
        <Card.Content>
          <Text style={[styles.chartTitle, {color: theme.colors.onSurface}]}>
            {title}
          </Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={true}>
            <View
              style={{
                width: calculatedWidth,
                backgroundColor: theme.colors.surface,
              }}>
              <VictoryChart
                theme={chartTheme}
                height={300}
                width={calculatedWidth}
                padding={{top: 50, bottom: 50, left: 60, right: 50}}
                domainPadding={{x: 20}}
                style={{
                  background: {fill: theme.colors.surface},
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
                  tickCount={data.length}
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
                <VictoryLegend
                  x={50}
                  y={10}
                  orientation="horizontal"
                  gutter={20}
                  data={[
                    {name: 'PV1', symbol: {fill: lineColors.pv1}},
                    {name: 'PV2', symbol: {fill: lineColors.pv2}},
                    {name: 'PV3', symbol: {fill: lineColors.pv3}},
                    {name: 'PV4', symbol: {fill: lineColors.pv4}},
                  ]}
                  style={{
                    labels: {fill: theme.colors.onSurface},
                  }}
                />
                <VictoryGroup>
                  <VictoryLine
                    data={data}
                    x="time"
                    y="pv1Indicator"
                    style={{data: {stroke: lineColors.pv1, strokeWidth: 2}}}
                    interpolation="monotoneX"
                  />
                  <VictoryLine
                    data={data}
                    x="time"
                    y="pv2Indicator"
                    style={{data: {stroke: lineColors.pv2, strokeWidth: 2}}}
                    interpolation="monotoneX"
                  />
                  <VictoryLine
                    data={data}
                    x="time"
                    y="pv3Indicator"
                    style={{data: {stroke: lineColors.pv3, strokeWidth: 2}}}
                    interpolation="monotoneX"
                  />
                  <VictoryLine
                    data={data}
                    x="time"
                    y="pv4Indicator"
                    style={{data: {stroke: lineColors.pv4, strokeWidth: 2}}}
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
    },
    {
      value: 'voltage',
      label: t('device.voltage', {defaultValue: '电压'}),
      unit: 'V',
      title: '电压曲线',
    },
    {
      value: 'current',
      label: t('device.current', {defaultValue: '电流'}),
      unit: 'A',
      title: '电流曲线',
    },
  ];

  const getCurrentChart = () => {
    const chart = chartTypes.find(type => type.value === selected);
    return {
      data: data[selected as keyof typeof data],
      title: chart?.title || '数据曲线',
      unit: chart?.unit || '',
    };
  };

  return (
    <ScrollView
      style={[styles.container, {backgroundColor: theme.colors.background}]}>
      <View style={styles.header}>
        <Text style={[styles.pageTitle, {color: theme.colors.onBackground}]}>
          {t('device.pvTimeData', {defaultValue: 'PV时间数据'})}
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
        <View
          style={[
            styles.loadingContainer,
            {backgroundColor: theme.colors.surface},
          ]}>
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
          )}
        </>
      )}
    </ScrollView>
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
});

export default PVTimeChart;
