import { PayloadAction, createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { storage } from '../../utils/storage';
import i18n, { changeLanguage } from '../../i18n';
import { APP_SETTINGS } from '../../config/config';
import { LanguageItem } from '../../services/api/i18nApi';
import { fetchSupportedLanguages as fetchSupportedLanguagesI18n, fetchAllTranslations } from '../../i18n';

interface LanguageState {
  currentLanguage: string;
  supportedLanguages: LanguageItem[];
  isLoading: boolean;
  lastFetchedAllTranslations: number | null; // 上次获取所有翻译的时间戳
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

// 创建异步action：获取支持的语言列表
export const fetchSupportedLanguages = createAsyncThunk(
  'language/fetchSupportedLanguages',
  async () => {
    const languages = await fetchSupportedLanguagesI18n();
    return languages;
  }
);

// 创建异步action：获取所有翻译
export const fetchAllTranslationsAsync = createAsyncThunk(
  'language/fetchAllTranslations',
  async () => {
    const translations = await fetchAllTranslations();
    return translations !== null;
  }
);

// Initialize the state
const initialState: LanguageState = {
  currentLanguage: APP_SETTINGS.defaultLanguage, // 使用默认语言，会在初始化时被更新
  supportedLanguages: APP_SETTINGS.supportedLanguages, // 默认支持的语言列表
  isLoading: false,
  lastFetchedAllTranslations: null,
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
    setSupportedLanguages: (state, action: PayloadAction<LanguageItem[]>) => {
      state.supportedLanguages = action.payload;
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
    
    // 获取支持的语言列表处理
    builder.addCase(fetchSupportedLanguages.pending, (state) => {
      state.isLoading = true;
    });
    builder.addCase(fetchSupportedLanguages.fulfilled, (state, action) => {
      state.supportedLanguages = action.payload;
      state.isLoading = false;
    });
    builder.addCase(fetchSupportedLanguages.rejected, (state) => {
      state.isLoading = false;
    });
    
    // 获取所有翻译处理
    builder.addCase(fetchAllTranslationsAsync.pending, (state) => {
      state.isLoading = true;
    });
    builder.addCase(fetchAllTranslationsAsync.fulfilled, (state, action) => {
      if (action.payload) {
        state.lastFetchedAllTranslations = Date.now();
      }
      state.isLoading = false;
    });
    builder.addCase(fetchAllTranslationsAsync.rejected, (state) => {
      state.isLoading = false;
    });
  }
});

export const { setLanguage, setSupportedLanguages, setLoading } = languageSlice.actions;

export default languageSlice.reducer; 