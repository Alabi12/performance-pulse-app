// src/store/slices/attendanceSlice.js
import { createSlice } from '@reduxjs/toolkit';

// Mock initial data for demonstration
const mockHistory = [
  {
    date: new Date(Date.now() - 86400000).toISOString().split('T')[0], // Yesterday
    clockIn: { timestamp: new Date(Date.now() - 86400000 - 28800000).toISOString(), type: 'clock-in' },
    clockOut: { timestamp: new Date(Date.now() - 86400000 - 10800000).toISOString(), type: 'clock-out' }
  },
  {
    date: new Date(Date.now() - 2 * 86400000).toISOString().split('T')[0], // 2 days ago
    clockIn: { timestamp: new Date(Date.now() - 2 * 86400000 - 25200000).toISOString(), type: 'clock-in' },
    clockOut: { timestamp: new Date(Date.now() - 2 * 86400000 - 9000000).toISOString(), type: 'clock-out' }
  }
];

const initialState = {
  todayAttendance: null,
  history: mockHistory,
  isLoading: false,
};

const attendanceSlice = createSlice({
  name: 'attendance',
  initialState,
  reducers: {
    clockIn: (state, action) => {
      const today = new Date().toISOString().split('T')[0];
      const existingEntryIndex = state.history.findIndex(entry => entry.date === today);
      
      if (existingEntryIndex === -1) {
        // New day
        state.history.unshift({
          date: today,
          clockIn: action.payload,
          clockOut: null
        });
      } else {
        // Existing day - update clock in
        state.history[existingEntryIndex].clockIn = action.payload;
      }
      
      state.todayAttendance = state.history.find(entry => entry.date === today);
    },
    clockOut: (state, action) => {
      const today = new Date().toISOString().split('T')[0];
      const existingEntryIndex = state.history.findIndex(entry => entry.date === today);
      
      if (existingEntryIndex === -1) {
        // No clock in today, create new entry
        state.history.unshift({
          date: today,
          clockIn: null,
          clockOut: action.payload
        });
      } else {
        // Update clock out
        state.history[existingEntryIndex].clockOut = action.payload;
      }
      
      state.todayAttendance = state.history.find(entry => entry.date === today);
    },
    setLoading: (state, action) => {
      state.isLoading = action.payload;
    },
    loadAttendanceHistory: (state) => {
      const today = new Date().toISOString().split('T')[0];
      state.todayAttendance = state.history.find(entry => entry.date === today) || null;
    },
    clearAttendance: (state) => {
      state.todayAttendance = null;
      state.history = [];
    },
  },
});

export const { clockIn, clockOut, setLoading, loadAttendanceHistory, clearAttendance } = attendanceSlice.actions;
export default attendanceSlice.reducer;