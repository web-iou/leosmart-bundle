import React, {useState, useEffect} from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Dimensions,
  ActivityIndicator,
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
import SafeAreaLayout from '@/components/SafeAreaLayout';
import {deviceApi, EquipTimeIndicatorDTO} from '@/services/api/deviceApi';
import dayjs from 'dayjs';

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

  // 图表类型配置
  const chartTypes = [
    {
      value: 'power',
      label: t('device.power', {defaultValue: '功率'}),
      unit: 'W',
      title: '功率曲线',
      dataKey: 'power',
    },
    {
      value: 'voltage',
      label: t('device.voltage', {defaultValue: '电压'}),
      unit: 'V',
      title: '电压曲线',
      dataKey: 'voltage',
    },
    {
      value: 'current',
      label: t('device.current', {defaultValue: '电流'}),
      unit: 'A',
      title: '电流曲线',
      dataKey: 'current',
    },
  ];

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

  const renderChart = (
    chartData: EquipTimeIndicatorDTO[],
    title: string,
    unit: string,
    dataKey: string,
  ) => {
    // 计算最大值，给Y轴留出一些空间
    const maxValue =
      Math.max(
        ...chartData.map(
          item => item[dataKey as keyof EquipTimeIndicatorDTO] as number,
        ),
      ) * 1.1;

    // 计算合适的图表宽度
    const dataPointWidth = 60;
    const calculatedWidth = Math.max(
      screenWidth - 32,
      chartData.length * dataPointWidth,
    );

    return (
      <Card style={[styles.chartCard, {backgroundColor: theme.colors.surface}]}>
        <Card.Content>
          <Text style={[styles.chartTitle, {color: theme.colors.onSurface}]}>
            {title}
          </Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={true}>
            <View style={{width: calculatedWidth}}>
              <VictoryChart
                theme={VictoryTheme.material}
                height={300}
                width={calculatedWidth}
                padding={{top: 50, bottom: 50, left: 60, right: 50}}
                domainPadding={{x: 20}}>
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
                  domain={[0, maxValue]}
                />
                <VictoryGroup>
                  <VictoryLine
                    data={chartData}
                    x="time"
                    y={dataKey}
                    style={{
                      data: {
                        stroke: theme.colors.primary,
                        strokeWidth: 2,
                      },
                    }}
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

  // 获取当前选中的图表配置
  const getCurrentChart = () => {
    const chart = chartTypes.find(type => type.value === selected)!;
    return {
      data,
      ...chart,
    };
  };

  return (
    <ScrollView style={styles.container}>
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
        <View style={styles.loadingContainer}>
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

export default EquipTimeChart;
