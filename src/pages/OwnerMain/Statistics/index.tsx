import React, {useState, useEffect, useMemo, useCallback} from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Dimensions,
  ActivityIndicator,
} from 'react-native';
import {Text, Card, Button, useTheme, Menu, Divider} from 'react-native-paper';
import {useTranslation} from 'react-i18next';
import {
  VictoryBar,
  VictoryChart,
  VictoryTheme,
  VictoryAxis,
} from 'victory-native';
import AntDesign from 'react-native-vector-icons/AntDesign';
import {ExtendedMD3Theme} from '@/theme';
import SafeAreaLayout from '@/components/SafeAreaLayout';
import {deviceApi} from '@/services/api/deviceApi';
import dayjs from 'dayjs';

interface StatisticsPageProps {
  navigation: any;
}

// 使用memo优化图表组件
const PowerGenerationChart = React.memo(
  ({
    monthlyData,
    maxPower,
    chartContentWidth,
    chartHeight,
    chartContentPadding,
    formatTime,
    theme,
    selected,
  }: {
    monthlyData: any[];
    maxPower: number;
    chartContentWidth: number;
    chartHeight: number;
    chartContentPadding: any;
    formatTime: any;
    theme: any;
    selected: string;
  }) => {
    if (!monthlyData?.length) return null;

    return (
      <VictoryChart
        theme={VictoryTheme.material}
        domainPadding={{x: 20}}
        width={chartContentWidth}
        height={chartHeight}
        padding={chartContentPadding}
        domain={{y: [0, maxPower]}}>
        <VictoryAxis
          crossAxis
          tickFormat={(_, index) => {
            const item = monthlyData[index];
            return item ? formatTime(item.time) : '';
          }}
          style={{
            axis: {stroke: theme.colors.outline},
            ticks: {stroke: theme.colors.outline, size: 5},
            tickLabels: {
              fill: theme.colors.onSurfaceVariant,
              fontSize: 12,
            },
            grid: {stroke: 'transparent'},
          }}
        />
        <VictoryAxis
          dependentAxis
          crossAxis
          tickValues={[
            0,
            Math.round(maxPower * 0.25),
            Math.round(maxPower * 0.5),
            Math.round(maxPower * 0.75),
            Math.round(maxPower),
          ]}
          tickFormat={() => ''}
          style={{
            axis: {stroke: theme.colors.outline},
            ticks: {stroke: 'transparent', size: 0},
            tickLabels: {
              fill: 'transparent',
            },
            grid: {
              stroke: theme.colors.outline + '20',
              strokeDasharray: '5,5',
            },
          }}
        />
        <VictoryBar
          data={monthlyData}
          x="time"
          y="power"
          barWidth={25}
          cornerRadius={{top: 6}}
          style={{
            data: {
              fill: '#FF9800',
            },
          }}
          barRatio={0.7}
          animate={{
            duration: 300, // 减少动画时间
            onLoad: {duration: 300},
          }}
        />
      </VictoryChart>
    );
  },
);

// 统计摘要卡片组件
const StatisticsSummaryCard = React.memo(
  ({
    monthlyData,
    loading,
    formatTime,
    theme,
    t,
  }: {
    monthlyData: any[];
    loading: boolean;
    formatTime: any;
    theme: any;
    t: any;
  }) => {
    // 使用useMemo缓存计算结果
    const totalPower = useMemo(
      () => monthlyData.reduce((sum, item) => sum + item.power, 0).toFixed(2),
      [monthlyData],
    );

    const averagePower = useMemo(
      () =>
        Math.round(
          monthlyData.reduce((sum, item) => sum + item.power, 0) /
            (monthlyData.length || 1),
        ),
      [monthlyData],
    );

    const peakMonth = useMemo(() => {
      if (!monthlyData.length) return '-';
      return formatTime(
        monthlyData.reduce(
          (max, item) => (max.power > item.power ? max : item),
          monthlyData[0],
        ).time,
      );
    }, [monthlyData, formatTime]);

    return (
      <Card.Content>
        <Text style={[styles.summaryTitle, {color: theme.colors.onSurface}]}>
          {t('statistics.yearlyTotal', {defaultValue: '年度发电量总计'})}
        </Text>
        <Text style={[styles.summaryValue, {color: theme.colors.primary}]}>
          {loading ? (
            <ActivityIndicator size="small" color={theme.colors.primary} />
          ) : (
            `${totalPower} kWh`
          )}
        </Text>

        <Divider
          style={[
            styles.divider,
            {backgroundColor: theme.colors.outline + '30'},
          ]}
        />

        <Text style={[styles.summaryTitle, {color: theme.colors.onSurface}]}>
          {t('statistics.monthlyAverage', {defaultValue: '月均发电量'})}
        </Text>
        <Text style={[styles.summaryValue, {color: theme.colors.primary}]}>
          {loading ? (
            <ActivityIndicator size="small" color={theme.colors.primary} />
          ) : (
            `${averagePower} kWh`
          )}
        </Text>

        <Divider
          style={[
            styles.divider,
            {backgroundColor: theme.colors.outline + '30'},
          ]}
        />

        <Text style={[styles.summaryTitle, {color: theme.colors.onSurface}]}>
          {t('statistics.peakMonth', {defaultValue: '发电峰值月'})}
        </Text>
        <Text style={[styles.summaryValue, {color: theme.colors.primary}]}>
          {loading ? (
            <ActivityIndicator size="small" color={theme.colors.primary} />
          ) : (
            peakMonth
          )}
        </Text>
      </Card.Content>
    );
  },
);

const StatisticsPage: React.FC<StatisticsPageProps> = ({
  navigation: _navigation,
}) => {
  const {t} = useTranslation();
  const theme = useTheme() as ExtendedMD3Theme;
  const screenWidth = Dimensions.get('window').width;

  // 年份选择器状态
  const [yearMenuVisible, setYearMenuVisible] = useState(false);
  const [selected, setSelected] = useState('月');
  const [loading, setLoading] = useState(false);

  // 数据状态
  const [monthlyData, setMonthlyData] = useState<
    Array<{power: number; time: string}>
  >([]);

  // 使用useMemo缓存计算结果，避免重复计算
  const maxPower = useMemo(() => {
    if (!monthlyData.length) return 100; // 设置默认值避免NaN
    return Math.max(...monthlyData.map(item => item.power)) * 1.1;
  }, [monthlyData]);

  // 图表布局相关常量 - 使用useMemo缓存计算结果
  const yAxisWidth = 45;
  const chartHeight = 350;
  const chartContentPadding = useMemo(
    () => ({top: 20, bottom: 50, left: 0, right: 20}),
    [],
  );
  const yAxisPadding = useMemo(
    () => ({top: 20, bottom: 50, left: 30, right: 0}),
    [],
  );

  // 计算图表内容区域宽度
  const chartDimensions = useMemo(() => {
    const minChartContentWidth = screenWidth - 40 - yAxisWidth;
    const calculatedContentWidth = monthlyData.length * 60;
    return {
      chartContentWidth: Math.max(minChartContentWidth, calculatedContentWidth),
    };
  }, [screenWidth, monthlyData.length, yAxisWidth]);

  // 可选年份列表
  const yearOptions = useMemo(
    () => [{title: '月'}, {title: '年'}, {title: '总'}],
    [],
  );

  // 格式化时间显示 - 使用useCallback避免重新创建函数
  const formatTime = useCallback(
    (time: string) => {
      switch (selected) {
        case '月':
          return dayjs(time).format('D日');
        case '年':
          return dayjs(time).format('M月');
        case '总':
          return dayjs(time).format('YYYY年');
        default:
          return time;
      }
    },
    [selected],
  );

  // 当选择变化时，更新数据 - 使用useCallback
  const fetchData = useCallback(() => {
    setLoading(true);
    deviceApi
      .queryGenEle(1, {
        grain: yearOptions.findIndex(item => item.title === selected) + 1,
      })
      .then(({data}) => {
        setMonthlyData(
          data.map(({powerGen, time}) => ({
            power: powerGen,
            time: time,
          })),
        );
      })
      .finally(() => {
        setLoading(false);
      });
  }, [selected, yearOptions]);

  // 当选择变化时，更新数据
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // 打开/关闭年份选择菜单
  const toggleYearMenu = useCallback(
    () => setYearMenuVisible(!yearMenuVisible),
    [yearMenuVisible],
  );
  const closeYearMenu = useCallback(() => setYearMenuVisible(false), []);
  const selectMenuItem = useCallback(
    (title: string) => () => {
      setSelected(title);
      closeYearMenu();
    },
    [closeYearMenu],
  );

  return (
    <SafeAreaLayout>
      <ScrollView removeClippedSubviews={true}>
        <View style={styles.header}>
          <Text
            style={[styles.headerTitle, {color: theme.colors.onBackground}]}>
            {t('statistics.powerGeneration', {defaultValue: '发电量统计'})}
          </Text>

          <Menu
            visible={yearMenuVisible}
            onDismiss={closeYearMenu}
            anchor={
              <Button
                mode="outlined"
                onPress={toggleYearMenu}
                style={[
                  styles.yearSelector,
                  {borderColor: theme.colors.outline},
                ]}
                labelStyle={{color: theme.colors.onBackground}}
                contentStyle={{flexDirection: 'row-reverse'}}
                icon={({size, color}) => (
                  <AntDesign name="down" size={size} color={color} />
                )}>
                {selected}
              </Button>
            }>
            {yearOptions.map(item => (
              <Menu.Item
                key={item.title}
                onPress={selectMenuItem(item.title)}
                title={item.title}
                titleStyle={{
                  color:
                    selected === item.title
                      ? theme.colors.primary
                      : theme.colors.onSurface,
                }}
              />
            ))}
          </Menu>
        </View>

        <Card
          style={[styles.chartCard, {backgroundColor: theme.colors.surface}]}>
          <Card.Content>
            {loading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={theme.colors.primary} />
                <Text
                  style={{color: theme.colors.onSurfaceVariant, marginTop: 10}}>
                  {t('common.loading', {defaultValue: '加载中...'})}
                </Text>
              </View>
            ) : (
              <View style={[styles.chartContainer, {overflow: 'hidden'}]}>
                {/* 固定的Y轴 */}
                <View style={[styles.yAxisContainer, {width: yAxisWidth}]}>
                  <VictoryAxis
                    dependentAxis
                    standalone
                    width={yAxisWidth}
                    height={chartHeight}
                    domain={[0, maxPower]}
                    padding={yAxisPadding}
                    tickValues={[
                      0,
                      Math.round(maxPower * 0.25),
                      Math.round(maxPower * 0.5),
                      Math.round(maxPower * 0.75),
                      Math.round(maxPower),
                    ]}
                    tickFormat={power => `${Math.round(power)}`}
                    style={{
                      axis: {stroke: theme.colors.outline},
                      ticks: {stroke: theme.colors.outline, size: 5},
                      tickLabels: {
                        fill: theme.colors.onSurfaceVariant,
                        fontSize: 10,
                        textAnchor: 'end',
                      },
                      grid: {stroke: 'transparent'},
                    }}
                  />
                </View>

                {/* 可滚动的图表内容 */}
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={true}
                  contentContainerStyle={styles.chartScrollContainer}
                  style={styles.chartScrollView}
                  removeClippedSubviews={true}>
                  <View
                    style={[
                      styles.chartContent,
                      {width: chartDimensions.chartContentWidth},
                    ]}>
                    <PowerGenerationChart
                      monthlyData={monthlyData}
                      maxPower={maxPower}
                      chartContentWidth={chartDimensions.chartContentWidth}
                      chartHeight={chartHeight}
                      chartContentPadding={chartContentPadding}
                      formatTime={formatTime}
                      theme={theme}
                      selected={selected}
                    />
                  </View>
                </ScrollView>
              </View>
            )}
          </Card.Content>
        </Card>

        <Card
          style={[styles.summaryCard, {backgroundColor: theme.colors.surface}]}>
          <View style={{overflow: 'hidden'}}>
            <StatisticsSummaryCard
              monthlyData={monthlyData}
              loading={loading}
              formatTime={formatTime}
              theme={theme}
              t={t}
            />
          </View>
        </Card>
      </ScrollView>
    </SafeAreaLayout>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: 'bold',
  },
  yearSelector: {
    height: 40,
    borderRadius: 8,
  },
  chartCard: {
    margin: 16,
    marginTop: 0,
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 0,
  },
  chartContainer: {
    flexDirection: 'row',
    height: 350,
    alignItems: 'flex-start',
  },
  yAxisContainer: {
    height: 350,
  },
  chartScrollView: {
    flex: 1,
  },
  chartScrollContainer: {
    flexGrow: 1,
  },
  chartContent: {
    height: 350,
  },
  loadingContainer: {
    height: 350,
    justifyContent: 'center',
    alignItems: 'center',
  },
  summaryCard: {
    margin: 16,
    marginTop: 0,
    borderRadius: 12,
    paddingVertical: 16,
  },
  summaryTitle: {
    fontSize: 14,
    marginBottom: 4,
  },
  summaryValue: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  divider: {
    marginVertical: 12,
  },
});

export default React.memo(StatisticsPage);
