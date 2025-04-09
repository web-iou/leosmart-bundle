import {createSlice, createAsyncThunk, PayloadAction} from '@reduxjs/toolkit';
import {userApi} from '@/services/api';
import {RootState} from '../index';
import {t} from 'i18next';

// 国家数据接口
export interface CountryItem {
  code: string;
  value: string;
  zoneList: {
    code: string;
    value: string;
  }[];
}

// 国家状态接口
interface CountryState {
  countries: CountryItem[];
  loading: boolean;
  error: string | null;
  selectedCountry: CountryItem | null;
  selectedTimeZone: {code: string; value: string} | null;
}

// 初始状态
const initialState: CountryState = {
  countries: [],
  loading: false,
  error: null,
  selectedCountry: null,
  selectedTimeZone: null,
};

// 异步 Thunk Action - 获取国家列表
export const fetchCountries = createAsyncThunk(
  'country/fetchCountries',
  async (_, {rejectWithValue}) => {
    try {
      const response = await userApi.getCountry();

      if (response.data) {
        // 按国家名称字母排序
        return response.data;
      }

      return rejectWithValue('获取国家数据失败');
    } catch (error) {
      console.error('Error fetching countries:', error);
      return rejectWithValue('网络错误，请稍后重试');
    }
  },
);

// 创建 Country Slice
const countrySlice = createSlice({
  name: 'country',
  initialState,
  reducers: {
    // 设置选中的国家
    setSelectedCountry: (state, action: PayloadAction<CountryItem | null>) => {
      state.selectedCountry = action.payload;
      state.selectedTimeZone = action.payload?.zoneList?.[0] || null;
    },

    // 设置选中的时区
    setSelectedTimeZone: (
      state,
      action: PayloadAction<{code: string; value: string} | null>,
    ) => {
      state.selectedTimeZone = action.payload;
    },

    // 重置选择
    resetCountrySelection: state => {
      state.selectedCountry = null;
      state.selectedTimeZone = null;
    },
  },
  extraReducers: builder => {
    builder
      // 处理异步请求状态
      .addCase(fetchCountries.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCountries.fulfilled, (state, action) => {
        state.loading = false;
        state.countries=action.payload

      })
      .addCase(fetchCountries.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

// 导出 Actions
export const {setSelectedCountry, setSelectedTimeZone, resetCountrySelection} =
  countrySlice.actions;

// 导出 Selectors
export const selectCountries = (state: RootState) => state.country.countries;
export const selectCountryLoading = (state: RootState) => state.country.loading;
export const selectCountryError = (state: RootState) => state.country.error;
export const selectSelectedCountry = (state: RootState) =>
  state.country.selectedCountry;
export const selectSelectedTimeZone = (state: RootState) =>
  state.country.selectedTimeZone;

// 导出 Reducer
export default countrySlice.reducer;
