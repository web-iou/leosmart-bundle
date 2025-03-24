import { PayloadAction, createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { storage } from '../../utils/storage';
import i18n, { changeLanguage } from '../../i18n';
import { APP_SETTINGS } from '../../config/config';

interface LanguageState {
  currentLanguage: string;
  availableLanguages: string[];
  isLoading: boolean;
}

// 创建异步action：初始化语言状态
export const initializeLanguage = createAsyncThunk(
  'language/initialize',
  async () => {
    await storage.waitForReady();
    const lang = await storage.getStringAsync('language') || APP_SETTINGS.defaultLanguage;
    return lang;
  }
);

// 创建异步action：设置语言
export const setLanguageAsync = createAsyncThunk(
  'language/setLanguage',
  async (language: string) => {
    await storage.waitForReady();
    await storage.setAsync('language', language);
    await changeLanguage(language);
    return language;
  }
);

// Initialize the state
const initialState: LanguageState = {
  currentLanguage: APP_SETTINGS.defaultLanguage, // 使用默认语言，会在初始化时被更新
  availableLanguages: ['en-US', 'zh-CN'], // 默认可用语言
  isLoading: false,
};

export const languageSlice = createSlice({
  name: 'language',
  initialState,
  reducers: {
    setLanguage: (state, action: PayloadAction<string>) => {
      state.currentLanguage = action.payload;
      // 同步更新只更新状态，不执行存储操作（应该使用setLanguageAsync）
      i18n.changeLanguage(action.payload);
    },
    setAvailableLanguages: (state, action: PayloadAction<string[]>) => {
      state.availableLanguages = action.payload;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
  },
  extraReducers: (builder) => {
    // 初始化语言处理
    builder.addCase(initializeLanguage.pending, (state) => {
      state.isLoading = true;
    });
    builder.addCase(initializeLanguage.fulfilled, (state, action) => {
      state.currentLanguage = action.payload;
      state.isLoading = false;
      i18n.changeLanguage(action.payload);
    });
    builder.addCase(initializeLanguage.rejected, (state) => {
      state.isLoading = false;
    });
    
    // 设置语言处理
    builder.addCase(setLanguageAsync.pending, (state) => {
      state.isLoading = true;
    });
    builder.addCase(setLanguageAsync.fulfilled, (state, action) => {
      state.currentLanguage = action.payload;
      state.isLoading = false;
    });
    builder.addCase(setLanguageAsync.rejected, (state) => {
      state.isLoading = false;
    });
  }
});

export const { setLanguage, setAvailableLanguages, setLoading } = languageSlice.actions;

export default languageSlice.reducer; 