import {useCallback, useRef} from 'react';
import {findNodeHandle} from 'react-native';
import NativePopover from '../../specs/NativePopover';

export const useNativePopover = () => {
  const anchorRef = useRef(null);

  /**
   * 显示 Popover 菜单
   * @param menuItems 菜单选项
   * @param icons 图标选项
   * @returns Promise<number> 选中的索引
   */
  const showPopover = useCallback(
    async (
      menuItems: string[],
      icons: Parameters<typeof NativePopover.show>[2],
    ): Promise<number | null> => {
      if (!anchorRef.current) {
        console.warn('useNativePopover: anchorRef is not attached to a View.');
        return null;
      }

      const anchorViewId = findNodeHandle(anchorRef.current);
      if (!anchorViewId) {
        console.warn(
          'useNativePopover: Cannot find node handle for anchorRef.',
        );
        return null;
      }

      try {
        const selectedIndex = await NativePopover.show(
          anchorViewId,
          menuItems,
          icons,
        );
        return selectedIndex;
      } catch (error) {
        console.error('Error showing popover:', error);
        return null;
      }
    },
    [],
  );

  return [showPopover,anchorRef] as const;
};
