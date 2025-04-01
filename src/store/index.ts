import { configureStore } from '@reduxjs/toolkit';
import themeReducer from './slices/themeSlice';
import languageReducer from './slices/languageSlice';
import toastReducer from './slices/toastSlice';
import countryReducer from './slices/countrySlice';

// 配置store
export const store = configureStore({
  reducer: {
    theme: themeReducer,
    language: languageReducer,
    toast: toastReducer,
    country: countryReducer,
  },
  middleware: (getDefaultMiddleware) => 
    getDefaultMiddleware({
      serializableCheck: false,
    }),
  enhancers: (getDefaultEnhancers) => {
    const enhancers = getDefaultEnhancers();
    // // 仅在开发环境中使用Reactotron
    // if (__DEV__ && Reactotron.createEnhancer) {
    //   enhancers.push(Reactotron.createEnhancer());
    // }
    return enhancers;
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export default store; 