// src/store/slices/authSlice.js
import { createSlice } from '@reduxjs/toolkit';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { authApi } from '../../services/authApi'; // Add this import

const initialState = {
  user: null,
  token: null,
  isLoading: false,
  error: null
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    loginStart: (state) => {
      state.isLoading = true;
      state.error = null;
    },
    loginSuccess: (state, action) => {
      state.isLoading = false;
      state.user = action.payload.user;
      state.token = action.payload.token;
      state.error = null;
    },
    loginFailure: (state, action) => {
      state.isLoading = false;
      state.error = action.payload;
      state.user = null;
      state.token = null;
    },
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.error = null;
      state.isLoading = false;
    },
    clearError: (state) => {
      state.error = null;
    },
    setAuthLoading: (state, action) => {
      state.isLoading = action.payload;
    }
  }
});

// Async action creators
export const login = (credentials) => async (dispatch) => {
  dispatch(loginStart());
  try {
    console.log('Attempting login with:', credentials);
    const result = await authApi.login(credentials);
    console.log('Login successful:', result);
    dispatch(loginSuccess(result));
  } catch (error) {
    console.log('Login failed:', error.message);
    dispatch(loginFailure(error.message));
  }
};

export const loadStoredAuth = () => async (dispatch) => {
  try {
    const storedAuth = await AsyncStorage.getItem('performancePulseAuth');
    if (storedAuth) {
      const authData = JSON.parse(storedAuth);
      console.log('Loaded stored auth:', authData);
      dispatch(loginSuccess(authData));
    }
  } catch (error) {
    console.log('Error loading stored auth:', error);
  } finally {
    dispatch(setAuthLoading(false));
  }
};

export const logoutUser = () => async (dispatch) => {
  dispatch(logout());
  try {
    await AsyncStorage.removeItem('performancePulseAuth');
  } catch (error) {
    console.log('Error removing auth from storage:', error);
  }
};

export const { 
  loginStart, 
  loginSuccess, 
  loginFailure, 
  logout, 
  clearError,
  setAuthLoading
} = authSlice.actions;

export default authSlice.reducer;