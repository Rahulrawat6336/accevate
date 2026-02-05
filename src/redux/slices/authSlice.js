import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Async thunk for login
export const login = createAsyncThunk(
  'auth/login',
  async ({ body }, { rejectWithValue }) => {
    try {
      console.log('Login body:', body);
      const response = await axios.post(
        'https://aapsuj.accevate.co/flutter-api/login.php',
        body,
      );
      console.log('Login response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Login error:', error);
      return rejectWithValue(error.response?.data?.message || 'Login failed');
    }
  },
);

// Async thunk for logout
export const logout = createAsyncThunk('auth/logout', async () => {
  // Clear AsyncStorage
  await AsyncStorage.removeItem('token');
  await AsyncStorage.removeItem('userId');
  await AsyncStorage.removeItem('userData');
});

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    userId: null,
    loading: false,
    error: null,
  },
  reducers: {
    setUserId: (state, action) => {
      state.userId = action.payload;
    },
    clearError: state => {
      state.error = null;
    },
  },
  extraReducers: builder => {
    builder
      .addCase(login.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.loading = false;
        state.userId = action.payload.userid;
        state.error = null;
      })
      .addCase(login.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Login failed. Please try again.';
      })
      .addCase(logout.fulfilled, state => {
        state.userId = null;
        state.error = null;
      });
  },
});

export const { setUserId, clearError } = authSlice.actions;
export default authSlice.reducer;
