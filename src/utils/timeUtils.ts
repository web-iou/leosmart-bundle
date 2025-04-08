import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import 'dayjs/locale/zh-cn';

// 初始化dayjs插件
dayjs.extend(relativeTime);
dayjs.locale('zh-cn');

/**
 * 将标准时间格式转换为相对时间格式
 * 例如：将"2025-04-08 14:47:36"转换为"1分钟前"、"1小时前"、"1天前"等
 * 
 * @param timeString 标准时间格式字符串，如"2025-04-08 14:47:36"
 * @returns 相对时间字符串，如"1分钟前"、"1小时前"、"1天前"等
 */
export const formatRelativeTime = (timeString: string): string => {
  if (!timeString) return '';
  
  try {
    // 解析时间字符串
    const date = dayjs(timeString);
    
    // 检查时间是否有效
    if (!date.isValid()) {
      return timeString;
    }
    
    // 计算相对时间
    const now = dayjs();
    const diffMinutes = now.diff(date, 'minute');
    const diffHours = now.diff(date, 'hour');
    const diffDays = now.diff(date, 'day');
    
    // 根据时间差返回不同的格式
    if (diffMinutes < 1) {
      return '刚刚';
    } else if (diffMinutes < 60) {
      return `${diffMinutes}分钟前`;
    } else if (diffHours < 24) {
      return `${diffHours}小时前`;
    } else if (diffDays < 30) {
      return `${diffDays}天前`;
    } else {
      // 超过30天，显示具体日期
      return date.format('YYYY-MM-DD');
    }
  } catch (error) {
    console.error('格式化相对时间出错:', error);
    return timeString;
  }
}; 