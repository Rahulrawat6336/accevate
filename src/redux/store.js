import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import otpReducer from './slices/otpSlice';
import dashboardReducer from './slices/dashboardSlice';

const store = configureStore({
  reducer: {
    auth: authReducer,
    otp: otpReducer,
    dashboard: dashboardReducer,
  },
  middleware: getDefaultMiddleware =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});

export default store;
