import React from 'react';
import {View, StyleSheet, ScrollView, TouchableOpacity, Dimensions} from 'react-native';
import {Text, useTheme} from 'react-native-paper';
import {useTranslation} from 'react-i18next';
import Icon from 'react-native-vector-icons/AntDesign';
import {LineChart} from 'react-native-chart-kit';
import {ExtendedMD3Theme} from '@/theme';
import SafeAreaLayout from '@/components/SafeAreaLayout';

const Overview: React.FC = () => {
  const {t} = useTranslation();
  const theme = useTheme() as ExtendedMD3Theme;
  const screenWidth = Dimensions.get('window').width;
  const chartWidth = Math.max(screenWidth * 1.2, 400);

  // 统计卡片数据
  const statsCards = [
    {
      title: t('installer.totalOrders', {defaultValue: '总设备'}),
      count: 300,
      status: '设备总数',
      color: theme.colors.primary,
      bgColor: theme.colors.primaryContainer,
      icon: 'mobile1',
    },
    {
      title: t('installer.processingOrders', {defaultValue: '在线设备'}),
      count: 270,
      status: '正常运行中',
      color: theme.colors.tertiary,
      bgColor: theme.colors.tertiaryContainer,
      icon: 'checkcircleo',
    },
    {
      title: t('installer.pendingOrders', {defaultValue: '离线设备'}),
      count: 10,
      status: '待处理',
      color: theme.colors.secondary,
      bgColor: theme.colors.secondaryContainer,
      icon: 'exclamationcircleo',
    },
    {
      title: t('installer.qualityOrders', {defaultValue: '故障设备'}),
      count: 5,
      status: '需要追踪',
      color: theme.colors.error,
      bgColor: theme.colors.errorContainer,
      icon: 'closecircleo',
    },
    {
      title: t('installer.attentionOrders', {defaultValue: '警告设备'}),
      count: 10,
      status: '需要关注',
      color: theme.colors.warning,
      bgColor: theme.colors.warningContainer,
      icon: 'warning',
    },
  ];

  // 图表数据
  const chartData = {
    labels: ['1月', '2月', '3月', '4月', '5月', '6月'],
    datasets: [
      {
        data: [20, 45, 28, 80, 99, 43],
      },
    ],
  };

  // 工具栏数据
  const tools = [
    {
      icon: 'bells',
      title: t('installer.alert', {defaultValue: '告警'}),
      color: theme.colors.warning,
    },
    {
      icon: 'setting',
      title: t('installer.networkConfig', {defaultValue: '网点配置'}),
      color: theme.colors.secondary,
    },
    {
      icon: 'tool',
      title: t('installer.localInspection', {defaultValue: '本地巡检'}),
      color: theme.colors.tertiary,
    },
  ];

  const renderChart = () => {
    const chartHeight = 250;
    const xAxisHeight = 10;
    const chartAreaHeight = chartHeight - xAxisHeight;
    const maxValue = Math.max(...chartData.datasets[0].data);
    const stepSize = Math.ceil(maxValue / 4);
    const yAxisLabels = Array.from({length: 5}, (_, i) => i * stepSize);

    return (
      <View style={styles.chartWrapper}>
        <View style={styles.chartHeader}>
          <Text style={[styles.chartTitle, {color: theme.colors.onSurface}]}>
            {t('installer.trendAnalysis', {defaultValue: '装机趋势分析'})}
          </Text>
          <TouchableOpacity style={styles.periodSelector}>
            <Text style={{color: theme.colors.primary}}>月</Text>
            <Icon name="down" size={16} color={theme.colors.primary} />
          </TouchableOpacity>
        </View>

        <View style={[styles.chartArea, {backgroundColor: theme.colors.surface}]}>
          {/* Y轴标签固定区域 */}
          <View style={styles.yAxisContainer}>
            {yAxisLabels.reverse().map((value, index) => (
              <View
                key={index}
                style={[
                  styles.yAxisLabel,
                  {
                    top: `${(index * 100) / (yAxisLabels.length - 1)}%`,
                  },
                ]}>
                <Text style={[styles.yAxisLabelText, {color: theme.colors.onSurface}]}>
                  {value}
                </Text>
              </View>
            ))}
          </View>

          <View style={styles.mainChartContainer}>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.chartScroll}
              contentContainerStyle={styles.chartScrollContent}
              scrollEventThrottle={16}>
              <View style={styles.chartContent}>
                <LineChart
                  data={{
                    ...chartData,
                    labels: Array(chartData.labels.length).fill(''),
                  }}
                  width={chartWidth}
                  height={chartAreaHeight - xAxisHeight}
                  chartConfig={{
                    backgroundColor: theme.colors.surface,
                    backgroundGradientFrom: theme.colors.surface,
                    backgroundGradientTo: theme.colors.surface,
                    decimalPlaces: 0,
                    color: () => theme.colors.primary,
                    labelColor: () => 'transparent',
                    propsForBackgroundLines: {
                      stroke: theme.colors.outlineVariant,
                      strokeWidth: 1,
                    },
                    propsForDots: {
                      r: '4',
                      strokeWidth: '2',
                      stroke: theme.colors.surface,
                    },
                  } as any}
                  bezier
                  style={styles.chart}
                  withDots
                  withShadow={false}
                  fromZero
                  withHorizontalLabels={false}
                  withVerticalLabels={false}
                />

                {/* X轴标签 */}
                <View style={[styles.xAxisContainer, {backgroundColor: theme.colors.surface}]}>
                  {chartData.labels.map((label, index) => (
                    <View
                      key={index}
                      style={[
                        styles.xAxisLabel,
                        {
                          left: index * ((chartWidth - 64) / (chartData.labels.length - 1)),
                          width: 40,
                        },
                      ]}>
                      <Text style={[styles.xAxisLabelText, {color: theme.colors.onSurface}]}>
                        {label}
                      </Text>
                    </View>
                  ))}
                </View>
              </View>
            </ScrollView>
          </View>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaLayout>
      <ScrollView
        style={[styles.container, {backgroundColor: theme.colors.background}]}>
        {/* 统计卡片区域 */}
        <View style={styles.statsContainer}>
          {statsCards.map((card, index) => (
            <View
              key={index}
              style={[
                styles.statsCard,
                {
                  backgroundColor: theme.colors.surfaceVariant,
                  marginBottom: index >= 3 ? 0 : 12,
                  flex: index === 4 ? 1 : undefined,
                  width: index === 4 ? '100%' : '48%',
                },
              ]}>
              <View style={styles.cardHeader}>
                <Icon name={card.icon} size={16} color={theme.colors.onSurfaceVariant} />
                <Text style={[styles.cardTitle, {color: theme.colors.onSurfaceVariant}]}>
                  {card.title}
                </Text>
              </View>
              <Text style={[styles.cardCount, {color: theme.colors.onSurfaceVariant}]}>
                {card.count}
              </Text>
              <Text style={[styles.cardStatus, {color: theme.colors.onSurfaceVariant}]}>
                {card.status}
              </Text>
            </View>
          ))}
        </View>

        {/* 趋势图表区域 */}
        <View style={[styles.chartContainer, {backgroundColor: theme.colors.surfaceVariant}]}>
          {renderChart()}
        </View>

        {/* 工具栏区域 */}
        <View style={styles.toolsContainer}>
          {tools.map((tool, index) => (
            <TouchableOpacity
              key={index}
              style={[
                styles.toolItem,
                {backgroundColor: theme.colors.surfaceVariant},
              ]}>
              <View
                style={[styles.toolIconContainer, {backgroundColor: theme.colors.surface}]}>
                <Icon name={tool.icon} size={24} color={tool.color} />
              </View>
              <Text style={[styles.toolTitle, {color: theme.colors.onSurfaceVariant}]}>
                {tool.title}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </SafeAreaLayout>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  statsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  statsCard: {
    width: '48%',
    height: 100,
    padding: 16,
    borderRadius: 12,
    justifyContent: 'space-between',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cardTitle: {
    fontSize: 14,
    marginLeft: 8,
    fontWeight: '500',
  },
  cardCount: {
    fontSize: 28,
    fontWeight: 'bold',
  },
  cardStatus: {
    fontSize: 12,
    marginTop: 4,
  },
  chartContainer: {
    borderRadius: 12,
    marginBottom: 16,
    padding: 16,
  },
  chartWrapper: {
    marginTop: 0,
    marginHorizontal: 0,
  },
  chartHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  chartTitle: {
    fontSize: 16,
    fontWeight: '500',
  },
  periodSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  chartArea: {
    position: 'relative',
    height: 220,
    borderRadius: 12,
    overflow: 'hidden',
    flexDirection: 'row',
  },
  yAxisContainer: {
    width: 50,
    height: '100%',
    position: 'relative',
    zIndex: 1,
    paddingRight: 8,
    paddingBottom: 24,
    justifyContent: 'space-between',
  },
  yAxisLabel: {
    position: 'absolute',
    right: 0,
    transform: [{translateY: -8}],
  },
  yAxisLabelText: {
    fontSize: 12,
    textAlign: 'right',
  },
  mainChartContainer: {
    flex: 1,
    height: '100%',
  },
  chartScroll: {
    flex: 1,
  },
  chartScrollContent: {
    flexGrow: 1,
  },
  chartContent: {
    flex: 1,
    position: 'relative',
  },
  chart: {
    borderRadius: 12,
    paddingRight: 64,
    marginLeft: -50,
    paddingBottom: 0,
  },
  xAxisContainer: {
    position: 'absolute',
    left: 50,
    right: 0,
    bottom: 0,
    height: 24,
  },
  xAxisLabel: {
    position: 'absolute',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  xAxisLabelText: {
    fontSize: 12,
  },
  toolsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  toolItem: {
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    flex: 1,
  },
  toolIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  toolTitle: {
    fontSize: 14,
    fontWeight: '500',
  },
});

export default Overview; 