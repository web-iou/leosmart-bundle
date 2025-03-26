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
  VictoryLegend,
  VictoryGroup,
} from 'victory-native';
import {ExtendedMD3Theme} from '@/theme';
import SafeAreaLayout from '@/components/SafeAreaLayout';
import {deviceApi} from '@/services/api/deviceApi';
import dayjs from 'dayjs';

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
    const maxValue = Math.max(
      ...data.flatMap(item => [
        item.pv1Indicator || 0,
        item.pv2Indicator || 0,
        item.pv3Indicator || 0,
        item.pv4Indicator || 0,
      ]),
    );

    const dataPointWidth = 60;
    const calculatedWidth = Math.max(
      screenWidth - 32,
      data.length * dataPointWidth
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
                    {name: 'PV1', symbol: {fill: '#FF9800'}},
                    {name: 'PV2', symbol: {fill: '#2196F3'}},
                    {name: 'PV3', symbol: {fill: '#4CAF50'}},
                    {name: 'PV4', symbol: {fill: '#9C27B0'}},
                  ]}
                />
                <VictoryGroup>
                  <VictoryLine
                    data={data}
                    x="time"
                    y="pv1Indicator"
                    style={{data: {stroke: '#FF9800', strokeWidth: 2}}}
                    interpolation="monotoneX"
                  />
                  <VictoryLine
                    data={data}
                    x="time"
                    y="pv2Indicator"
                    style={{data: {stroke: '#2196F3', strokeWidth: 2}}}
                    interpolation="monotoneX"
                  />
                  <VictoryLine
                    data={data}
                    x="time"
                    y="pv3Indicator"
                    style={{data: {stroke: '#4CAF50', strokeWidth: 2}}}
                    interpolation="monotoneX"
                  />
                  <VictoryLine
                    data={data}
                    x="time"
                    y="pv4Indicator"
                    style={{data: {stroke: '#9C27B0', strokeWidth: 2}}}
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
      ...chart,
    };
  };

  return (
      <ScrollView style={styles.container}>
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
            )}
          </>
        )}
      </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding:16,
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