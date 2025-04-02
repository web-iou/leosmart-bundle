import {createSlice, PayloadAction} from '@reduxjs/toolkit';

interface SiteState {
  currentSite: string;
  siteUrl: string;
}

const initialState: SiteState = {
  currentSite: 'china',
  siteUrl: 'https://tsc2cloud.com',
};

const siteSlice = createSlice({
  name: 'site',
  initialState,
  reducers: {
    setSite: (state, action: PayloadAction<SiteState>) => {
      state.currentSite = action.payload.currentSite;
      state.siteUrl = action.payload.siteUrl;
    },
  },
});

export const {setSite} = siteSlice.actions;
export default siteSlice.reducer; 