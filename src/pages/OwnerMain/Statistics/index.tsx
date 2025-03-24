import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Dimensions, ActivityIndicator } from 'react-native';
import { Text, Card, Button, useTheme, Menu, Divider } from 'react-native-paper';
import { useTranslation } from 'react-i18next';
import { VictoryBar, VictoryChart, VictoryTheme, VictoryAxis } from 'victory-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { ExtendedMD3Theme } from '@/theme';
import SafeAreaLayout from '@/components/SafeAreaLayout';

interface StatisticsPageProps {
  navigation: any;
}

// Helper function to simulate API delay
const sleep = (ms: number): Promise<void> => {
  return new Promise(resolve => {
    setTimeout(() => {
      resolve();
    }, ms);
  });
};

// 模拟每月发电量数据
const generateMockData = (year: number) => {
  // 生成随机数据，但保持3月最高
  const monthlyData = [
    { month: 1, power: 100 },    // 一月
    { month: 2, power: 140 },    // 二月 
    { month: 3, power: 220 },    // 三月
    { month: 4, power: 100 },    // 四月
    { month: 5, power: 130 },    // 五月
  ];
  
  // 添加剩余月份的模拟数据（如果当前年份是今年，则只显示到当前月份）
  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth() + 1;
  
  if (year < currentYear) {
    // 过去年份，显示全年数据
    for (let i = 6; i <= 12; i++) {
      monthlyData.push({ month: i, power: Math.floor(Math.random() * 150) + 50 });
    }
  } else if (year === currentYear) {
    // 当前年份，只显示到当前月份
    for (let i = 6; i <= currentMonth; i++) {
      monthlyData.push({ month: i, power: Math.floor(Math.random() * 150) + 50 });
    }
  }
  
  return monthlyData;
};

const StatisticsPage: React.FC<StatisticsPageProps> = ({ navigation: _navigation }) => {
  const { t } = useTranslation();
  const theme = useTheme() as ExtendedMD3Theme;
  const screenWidth = Dimensions.get('window').width;
  
  // 年份选择器状态
  const [yearMenuVisible, setYearMenuVisible] = useState(false);
  const [selectedYear, setSelectedYear] = useState(2023);
  const [loading, setLoading] = useState(false);
  
  // 数据状态
  const [monthlyData, setMonthlyData] = useState(generateMockData(selectedYear));
  
  // 计算Y轴最大值，给顶部留出一些空间
  const maxPower = Math.max(...monthlyData.map(item => item.power)) * 1.1;
  
  // 图表布局相关常量
  const yAxisWidth = 45; // 减小Y轴宽度，减少左侧空白
  const chartHeight = 350; // 图表高度
  const chartContentPadding = { top: 20, bottom: 50, left: 0, right: 20 }; // 图表内容内边距
  const yAxisPadding = { top: 20, bottom: 50, left: 30, right: 0 }; // 调整Y轴内边距，确保刻度值显示在可见区域内
  
  // 计算图表内容区域宽度 - 当数据超过6个月时，设置更宽的宽度以支持滑动
  const minChartContentWidth = screenWidth - 40 - yAxisWidth; // 最小内容宽度（屏幕宽度减去边距和Y轴宽度）
  const calculatedContentWidth = monthlyData.length * 60; // 根据数据数量计算的宽度
  const chartContentWidth = Math.max(minChartContentWidth, calculatedContentWidth); // 取较大值确保有足够空间
  
  // 可选年份列表（过去5年到当前年份）
  const currentYear = new Date().getFullYear();
  const yearOptions = Array.from({ length: 5 }, (_, i) => currentYear - i);
  
  // 当年份变化时，更新数据
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // 模拟API请求延迟
        await sleep(800);
        
        // 在实际应用中，这里应该调用API获取数据
        // const response = await statisticsApi.getMonthlyPowerGeneration(selectedYear);
        // setMonthlyData(response.data);
        
        // 使用模拟数据代替
        setMonthlyData(generateMockData(selectedYear));
      } catch (error) {
        console.error('Failed to fetch statistics data:', error);
        // 可以添加错误处理，例如显示错误提示
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [selectedYear]);
  
  // 打开/关闭年份选择菜单
  const toggleYearMenu = () => setYearMenuVisible(!yearMenuVisible);
  const closeYearMenu = () => setYearMenuVisible(false);
  
  // 选择年份
  const selectYear = (year: number) => {
    setSelectedYear(year);
    closeYearMenu();
  };

  return (
    <SafeAreaLayout>
      <ScrollView>
        <View style={styles.header}>
          <Text style={[styles.headerTitle, { color: theme.colors.onBackground }]}>
            {t('statistics.powerGeneration', { defaultValue: '发电量统计' })}
          </Text>
          
          <Menu
            visible={yearMenuVisible}
            onDismiss={closeYearMenu}
            anchor={
              <Button 
                mode="outlined" 
                onPress={toggleYearMenu}
                style={[styles.yearSelector, { borderColor: theme.colors.outline }]}
                labelStyle={{ color: theme.colors.onBackground }}
                contentStyle={{ flexDirection: 'row-reverse' }}
                icon={({ size, color }) => (
                  <Ionicons name="chevron-down" size={size} color={color} />
                )}
              >
                {selectedYear} {t('common.year', { defaultValue: '年' })}
              </Button>
            }
          >
            {yearOptions.map(year => (
              <Menu.Item
                key={year}
                onPress={() => selectYear(year)}
                title={`${year} ${t('common.year', { defaultValue: '年' })}`}
                titleStyle={{ 
                  color: year === selectedYear ? theme.colors.primary : theme.colors.onSurface 
                }}
              />
            ))}
          </Menu>
        </View>
        
        <Card style={[styles.chartCard, { backgroundColor: theme.colors.surface }]}>
          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={theme.colors.primary} />
              <Text style={{ color: theme.colors.onSurfaceVariant, marginTop: 10 }}>
                {t('common.loading', { defaultValue: '加载中...' })}
              </Text>
            </View>
          ) : (
            <View style={styles.chartContainer}>
              {/* 固定的Y轴 */}
              <View style={[styles.yAxisContainer, { width: yAxisWidth }]}>
                <VictoryAxis
                  dependentAxis
                  standalone
                  width={yAxisWidth}
                  height={chartHeight}
                  domain={[0, maxPower]}
                  padding={yAxisPadding}
                  tickValues={[0, Math.round(maxPower * 0.25), Math.round(maxPower * 0.5), Math.round(maxPower * 0.75), Math.round(maxPower)]}
                  tickFormat={(power) => `${Math.round(power)}`}
                  style={{
                    axis: { stroke: theme.colors.outline },
                    ticks: { stroke: theme.colors.outline, size: 5 },
                    tickLabels: { 
                      fill: theme.colors.onSurfaceVariant,
                      fontSize: 10, // 减小字体大小以适应缩小的空间
                      textAnchor: 'end',
                    },
                    grid: { stroke: "transparent" }
                  }}
                />
              </View>
              
              {/* 可滚动的图表内容 */}
              <ScrollView 
                horizontal 
                showsHorizontalScrollIndicator={true} 
                contentContainerStyle={styles.chartScrollContainer}
                style={styles.chartScrollView}
              >
                <View style={[styles.chartContent, { width: chartContentWidth }]}>
                  <VictoryChart
                    theme={VictoryTheme.material}
                    domainPadding={{ x: 20 }}
                    width={chartContentWidth}
                    height={chartHeight}
                    padding={chartContentPadding}
                    domain={{ y: [0, maxPower] }}
                  >
                    <VictoryAxis
                      crossAxis
                      tickFormat={(month) => `${month}${t('statistics.month', { defaultValue: '月' })}`}
                      style={{
                        axis: { stroke: theme.colors.outline },
                        ticks: { stroke: theme.colors.outline, size: 5 },
                        tickLabels: { 
                          fill: theme.colors.onSurfaceVariant,
                          fontSize: 12
                        },
                        grid: { stroke: "transparent" }
                      }}
                    />
                    <VictoryAxis
                      dependentAxis
                      crossAxis
                      tickValues={[0, Math.round(maxPower * 0.25), Math.round(maxPower * 0.5), Math.round(maxPower * 0.75), Math.round(maxPower)]}
                      tickFormat={() => ""}
                      style={{
                        axis: { stroke: theme.colors.outline },
                        ticks: { stroke: "transparent", size: 0 },
                        tickLabels: { 
                          fill: "transparent"
                        },
                        grid: { stroke: theme.colors.outline + '20', strokeDasharray: '5,5' }
                      }}
                    />
                    <VictoryBar
                      data={monthlyData}
                      x="month"
                      y="power"
                      barWidth={25}
                      cornerRadius={{ top: 6 }}
                      style={{
                        data: {
                          fill: '#FF9800',
                        }
                      }}
                      barRatio={0.7} // 控制柱子宽度与间距的比例
                      animate={{
                        duration: 500,
                        onLoad: { duration: 500 }
                      }}
                    />
                  </VictoryChart>
                </View>
              </ScrollView>
            </View>
          )}
        </Card>
        
        {/* 这里可以添加更多统计信息卡片 */}
        <Card style={[styles.summaryCard, { backgroundColor: theme.colors.surface }]}>
          <Card.Content>
            <Text style={[styles.summaryTitle, { color: theme.colors.onSurface }]}>
              {t('statistics.yearlyTotal', { defaultValue: '年度发电量总计' })}
            </Text>
            <Text style={[styles.summaryValue, { color: theme.colors.primary }]}>
              {loading ? 
                <ActivityIndicator size="small" color={theme.colors.primary} /> : 
                `${monthlyData.reduce((sum, item) => sum + item.power, 0)} kWh`
              }
            </Text>
            
            <Divider style={[styles.divider, { backgroundColor: theme.colors.outline + '30' }]} />
            
            <Text style={[styles.summaryTitle, { color: theme.colors.onSurface }]}>
              {t('statistics.monthlyAverage', { defaultValue: '月均发电量' })}
            </Text>
            <Text style={[styles.summaryValue, { color: theme.colors.primary }]}>
              {loading ? 
                <ActivityIndicator size="small" color={theme.colors.primary} /> : 
                `${Math.round(monthlyData.reduce((sum, item) => sum + item.power, 0) / monthlyData.length)} kWh`
              }
            </Text>
            
            <Divider style={[styles.divider, { backgroundColor: theme.colors.outline + '30' }]} />
            
            <Text style={[styles.summaryTitle, { color: theme.colors.onSurface }]}>
              {t('statistics.peakMonth', { defaultValue: '发电峰值月' })}
            </Text>
            <Text style={[styles.summaryValue, { color: theme.colors.primary }]}>
              {loading ? 
                <ActivityIndicator size="small" color={theme.colors.primary} /> : 
                `${monthlyData.reduce((max, item) => max.power > item.power ? max : item, { month: 0, power: 0 }).month}${t('statistics.month', { defaultValue: '月' })}`
              }
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