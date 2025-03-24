import { PayloadAction, createSlice } from '@reduxjs/toolkit';
import { ThemeType, getStoredThemeType, setStoredThemeType } from '../../theme';

interface ThemeState {
  themeType: ThemeType;
  isDarkMode: boolean;
}

// Initialize the state
const initialState: ThemeState = {
  themeType: getStoredThemeType(),
  isDarkMode: false, // This will be updated in app components
};

export const themeSlice = createSlice({
  name: 'theme',
  initialState,
  reducers: {
    setTheme: (state, action: PayloadAction<ThemeType>) => {
      state.themeType = action.payload;
      setStoredThemeType(action.payload);
    },
    setDarkMode: (state, action: PayloadAction<boolean>) => {
      state.isDarkMode = action.payload;
    },
  },
});

export const { setTheme, setDarkMode } = themeSlice.actions;

export default themeSlice.reducer;