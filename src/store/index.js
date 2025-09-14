// src/store/index.js
import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import attendanceReducer from './slices/attendanceSlice';
import kpiReducer from './slices/kpiSlice';
import taskReducer from './slices/taskSlice';

export const Store = configureStore({
  reducer: {
    auth: authReducer,
    attendance: attendanceReducer,
    kpi: kpiReducer,
    task: taskReducer,
  },
});