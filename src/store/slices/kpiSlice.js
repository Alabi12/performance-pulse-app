// src/store/slices/kpiSlice.js
import { createSlice } from '@reduxjs/toolkit';

// Mock initial KPIs for demonstration
const mockKPIs = [
  {
    id: 1,
    title: "Increase Monthly Sales",
    description: "Achieve 20% growth in monthly sales revenue",
    targetValue: 50000,
    currentValue: 35000,
    deadline: "2024-03-31",
    category: "sales",
    status: "approved",
    createdBy: 1,
    createdAt: "2024-01-15",
    approvedBy: 2,
    approvedAt: "2024-01-16"
  },
  {
    id: 2,
    title: "Complete React Native Training",
    description: "Finish advanced React Native course and build 3 practice apps",
    targetValue: 1,
    currentValue: 0.5,
    deadline: "2024-02-28",
    category: "learning",
    status: "pending",
    createdBy: 1,
    createdAt: "2024-01-20"
  },
  {
    id: 3,
    title: "Reduce Customer Complaints",
    description: "Decrease customer complaints by 30% through improved service",
    targetValue: 10,
    currentValue: 15,
    deadline: "2024-04-15",
    category: "customer",
    status: "approved",
    createdBy: 3,
    createdAt: "2024-01-10",
    approvedBy: 2,
    approvedAt: "2024-01-12"
  }
];

const initialState = {
  kpis: mockKPIs,
  isLoading: false,
  error: null
};

const kpiSlice = createSlice({
  name: 'kpi',
  initialState,
  reducers: {
    fetchKPIs: (state) => {
      state.isLoading = true;
    },
    fetchKPIsSuccess: (state, action) => {
      state.kpis = action.payload;
      state.isLoading = false;
      state.error = null;
    },
    fetchKPIsFailure: (state, action) => {
      state.isLoading = false;
      state.error = action.payload;
    },
    createKPI: (state, action) => {
      const newKPI = {
        ...action.payload,
        id: Math.max(...state.kpis.map(k => k.id), 0) + 1,
        createdAt: new Date().toISOString().split('T')[0],
        status: 'pending'
      };
      state.kpis.push(newKPI);
    },
    updateKPIProgress: (state, action) => {
      const { id, currentValue } = action.payload;
      const kpiIndex = state.kpis.findIndex(kpi => kpi.id === id);
      if (kpiIndex !== -1) {
        state.kpis[kpiIndex].currentValue = currentValue;
      }
    },
    approveKPI: (state, action) => {
      const kpiId = action.payload;
      const kpiIndex = state.kpis.findIndex(kpi => kpi.id === kpiId);
      if (kpiIndex !== -1) {
        state.kpis[kpiIndex].status = 'approved';
        state.kpis[kpiIndex].approvedBy = 2; // Mock manager ID
        state.kpis[kpiIndex].approvedAt = new Date().toISOString().split('T')[0];
      }
    },
    rejectKPI: (state, action) => {
      const kpiId = action.payload;
      const kpiIndex = state.kpis.findIndex(kpi => kpi.id === kpiId);
      if (kpiIndex !== -1) {
        state.kpis[kpiIndex].status = 'rejected';
      }
    },
    deleteKPI: (state, action) => {
      const kpiId = action.payload;
      state.kpis = state.kpis.filter(kpi => kpi.id !== kpiId);
    },
    setLoading: (state, action) => {
      state.isLoading = action.payload;
    }
  }
});

export const {
  fetchKPIs,
  fetchKPIsSuccess,
  fetchKPIsFailure,
  createKPI,
  updateKPIProgress,
  approveKPI,
  rejectKPI,
  deleteKPI,
  setLoading
} = kpiSlice.actions;

export default kpiSlice.reducer;