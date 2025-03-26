import React, {useState, useEffect} from 'react';
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

// Helper function to simulate API delay

// 模拟每月发电量数据
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
  const [monthlyData, setMonthlyData] = useState<Array<{power: number; time: string}>>([]);

  // 计算Y轴最大值，给顶部留出一些空间
  const maxPower = Math.max(...monthlyData.map(item => item.power)) * 1.1;

  // 图表布局相关常量
  const yAxisWidth = 45; // 减小Y轴宽度，减少左侧空白
  const chartHeight = 350; // 图表高度
  const chartContentPadding = {top: 20, bottom: 50, left: 0, right: 20}; // 图表内容内边距
  const yAxisPadding = {top: 20, bottom: 50, left: 30, right: 0}; // 调整Y轴内边距，确保刻度值显示在可见区域内

  // 计算图表内容区域宽度 - 当数据超过6个月时，设置更宽的宽度以支持滑动
  const minChartContentWidth = screenWidth - 40 - yAxisWidth; // 最小内容宽度（屏幕宽度减去边距和Y轴宽度）
  const calculatedContentWidth = monthlyData.length * 60; // 根据数据数量计算的宽度
  const chartContentWidth = Math.max(
    minChartContentWidth,
    calculatedContentWidth,
  ); // 取较大值确保有足够空间

  // 可选年份列表（过去5年到当前年份）
  const yearOptions = [
    {
      title: '月',
    },
    {
      title: '年',
    },
    {
      title: '总',
    },
  ];

  // 当选择变化时，更新数据
  useEffect(() => {
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
  }, [selected]);

  // 打开/关闭年份选择菜单
  const toggleYearMenu = () => setYearMenuVisible(!yearMenuVisible);
  const closeYearMenu = () => setYearMenuVisible(false);

  // 选择年份

  // 格式化时间显示
  const formatTime = (time: string) => {
    switch (selected) {
      case '月':
        // 显示具体日期，格式如：1日
        return dayjs(time).format('D日');
      case '年':
        // 显示月份，格式如：1月
        return dayjs(time).format('M月');
      case '总':
        // 显示年份，格式如：2024年
        return dayjs(time).format('YYYY年');
      default:
        return time;
    }
  };

  return (
    <SafeAreaLayout>
      <ScrollView>
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
                onPress={() => setSelected(item.title)}
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
          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={theme.colors.primary} />
              <Text
                style={{color: theme.colors.onSurfaceVariant, marginTop: 10}}>
                {t('common.loading', {defaultValue: '加载中...'})}
              </Text>
            </View>
          ) : (
            <View style={styles.chartContainer}>
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
                      fontSize: 10, // 减小字体大小以适应缩小的空间
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
                style={styles.chartScrollView}>
                <View style={[styles.chartContent, {width: chartContentWidth}]}>
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
                        duration: 500,
                        onLoad: {duration: 500},
                      }}
                    />
                  </VictoryChart>
                </View>
              </ScrollView>
            </View>
          )}
        </Card>

        {/* 这里可以添加更多统计信息卡片 */}
        <Card
          style={[styles.summaryCard, {backgroundColor: theme.colors.surface}]}>
          <Card.Content>
            <Text
              style={[styles.summaryTitle, {color: theme.colors.onSurface}]}>
              {t('statistics.yearlyTotal', {defaultValue: '年度发电量总计'})}
            </Text>
            <Text style={[styles.summaryValue, {color: theme.colors.primary}]}>
              {loading ? (
                <ActivityIndicator size="small" color={theme.colors.primary} />
              ) : (
                `${monthlyData.reduce((sum, item) => sum + item.power, 0).toFixed(2)} kWh`
              )}
            </Text>

            <Divider
              style={[
                styles.divider,
                {backgroundColor: theme.colors.outline + '30'},
              ]}
            />

            <Text
              style={[styles.summaryTitle, {color: theme.colors.onSurface}]}>
              {t('statistics.monthlyAverage', {defaultValue: '月均发电量'})}
            </Text>
            <Text style={[styles.summaryValue, {color: theme.colors.primary}]}>
              {loading ? (
                <ActivityIndicator size="small" color={theme.colors.primary} />
              ) : (
                `${Math.round(
                  monthlyData.reduce((sum, item) => sum + item.power, 0) /
                    (monthlyData.length || 1),
                )} kWh`
              )}
            </Text>

            <Divider
              style={[
                styles.divider,
                {backgroundColor: theme.colors.outline + '30'},
              ]}
            />

            <Text
              style={[styles.summaryTitle, {color: theme.colors.onSurface}]}>
              {t('statistics.peakMonth', {defaultValue: '发电峰值月'})}
            </Text>
            <Text style={[styles.summaryValue, {color: theme.colors.primary}]}>
              {loading ? (
                <ActivityIndicator size="small" color={theme.colors.primary} />
              ) : monthlyData.length > 0 ? (
                formatTime(
                  monthlyData.reduce(
                    (max, item) => (max.power > item.power ? max : item),
                    monthlyData[0],
                  ).time,
                )
              ) : (
                '-'
              )}
            </Text>
          </Card.Content>
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
    overflow: 'hidden',
    paddingVertical: 16,
    paddingHorizontal: 0, // 移除水平内边距，防止Y轴位置偏移
  },
  chartContainer: {
    flexDirection: 'row',
    height: 350,
    alignItems: 'flex-start', // 改为顶部对齐，确保轴线对齐
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
    overflow: 'hidden',
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

export default StatisticsPage;
