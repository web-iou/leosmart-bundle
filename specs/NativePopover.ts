import type {TurboModule} from 'react-native';
import {TurboModuleRegistry} from 'react-native';

export interface Spec extends TurboModule {
  /**
   * 显示 PopOverMenu，并返回选中的索引
   * @param anchorViewId 目标视图的原生 ID
   * @param menuItems 菜单项数组
   * @returns 选中的菜单索引
   */
  show: (
    anchorViewId: number,
    menuItems: string[],
    icons?:string[],
  ) => Promise<number>;
}

export default TurboModuleRegistry.getEnforcing<Spec>('NativePopover') as Spec;
