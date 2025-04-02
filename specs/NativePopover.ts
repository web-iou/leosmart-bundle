import type {TurboModule} from 'react-native';
import {TurboModuleRegistry} from 'react-native';

/**
 * PopOver菜单配置接口
 */
export interface PopOverMenuConfiguration {
  /** 菜单文本外边距，默认为6 */
  menuTextMargin?: number;

  /** 菜单图标外边距，默认为6 */
  menuIconMargin?: number;

  /** 菜单行高 */
  menuRowHeight?: number;

  /** 菜单宽度 */
  menuWidth?: number;

  /** 菜单圆角半径 */
  menuCornerRadius?: number;

  /** 文本颜色 */
  textColor?: string;

  /** 背景颜色 */
  backgroundColor?: string;

  /** 边框颜色 */
  borderColor?: string;

  /** 边框宽度 */
  borderWidth?: number;

  /** 文本字体 */
  textFont?: {
    fontFamily?: string;
    fontSize?: number;
    fontWeight?: string | number;
  };

  /** 文本对齐方式 */
  textAlignment?: 'left' | 'center' | 'right' | 'justified' | 'natural';

  /** 分隔线边距 */
  separatorInset?: {
    top: number;
    left: number;
    bottom: number;
    right: number;
  };

  /** 是否忽略图像原始颜色，默认为false。如果设置为true，图像颜色将与textColor相同 */
  ignoreImageOriginalColor?: boolean;

  /** 是否允许圆角箭头，默认为false。如果设置为true，箭头将以圆角绘制 */
  allowRoundedArrow?: boolean;

  /** 动画持续时间（秒） */
  animationDuration?: number;

  /** 选中项的文本颜色 */
  selectedTextColor?: string;

  /** 选中项的单元格背景颜色 */
  selectedCellBackgroundColor?: string;

  /** 分隔线颜色 */
  separatorColor?: string;

  /** 阴影颜色 */
  shadowColor?: string;

  /** 阴影不透明度 */
  shadowOpacity?: number;

  /** 阴影半径 */
  shadowRadius?: number;

  /** 阴影X轴偏移量 */
  shadowOffsetX?: number;

  /** 阴影Y轴偏移量 */
  shadowOffsetY?: number;

  /** 覆盖背景颜色 */
  coverBackgroundColor?: string;

  /** 图像尺寸 */
  imageSize?: {
    width: number;
    height: number;
  };

  /** 水平边距 */
  horizontalMargin?: number;
}

export interface Spec extends TurboModule {
  /**
   * 显示 PopOverMenu，并返回选中的索引
   * @param anchorViewId 目标视图的原生 ID
   * @param menuItems 菜单项数组
   * @param icons 菜单项图标数组
   * @param config 菜单配置
   * @returns 选中的菜单索引
   */
  show: (
    anchorViewId: number,
    menuItems: string[],
    icons: string[],
    config?: PopOverMenuConfiguration,
  ) => Promise<number>;
}

export default TurboModuleRegistry.getEnforcing<Spec>('NativePopover') as Spec;
