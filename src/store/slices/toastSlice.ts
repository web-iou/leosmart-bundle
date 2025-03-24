import { createSlice, PayloadAction } from '@reduxjs/toolkit';

// Toast消息的类型定义
export interface ToastMessage {
  message: string;
  type: 'success' | 'error' | 'info' | 'warning';
  duration?: number;
  position?: 'top' | 'bottom';
}

// Toast状态接口
interface ToastState {
  visible: boolean;
  message: string;
  type: 'success' | 'error' | 'info' | 'warning';
  duration: number;
  position: 'top' | 'bottom';
}

// 初始状态
const initialState: ToastState = {
  visible: false,
  message: '',
  type: 'info',
  duration: 3000,
  position: 'bottom'
};

// 创建Toast切片
const toastSlice = createSlice({
  name: 'toast',
  initialState,
  reducers: {
    showToast: (state, action: PayloadAction<ToastMessage>) => {
      state.visible = true;
      state.message = action.payload.message;
      state.type = action.payload.type;
      state.duration = action.payload.duration || 3000;
      state.position = action.payload.position || 'bottom';
    },
    hideToast: (state) => {
      state.visible = false;
    },
  }
});

// 导出actions和reducer
export const { showToast, hideToast } = toastSlice.actions;
export default toastSlice.reducer; 