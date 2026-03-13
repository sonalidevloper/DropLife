import { configureStore } from '@reduxjs/toolkit';
import authReducer from './authSlice';
import donorReducer from './donorSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    donor: donorReducer,
  },
});