import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Async thunk for OTP verification
export const verifyOtp = createAsyncThunk(
  'otp/verify',
  async ({ body }, { rejectWithValue }) => {
    try {
      console.log('OTP verify body:', body);
      const response = await axios.post(
        'https://aapsuj.accevate.co/flutter-api/verify_otp.php',
        body,
      );
      console.log('OTP verify response:', response.data);

      // Save token to AsyncStorage
      if (response.data.token) {
        await AsyncStorage.setItem('token', response.data.token);
        await AsyncStorage.setItem('userId', body.userid.toString());
      }

      return response.data;
    } catch (error) {
      console.error('OTP verification error:', error);
      return rejectWithValue(
        error.response?.data?.message || 'OTP verification failed',
      );
    }
  },
);

// Clear OTP data
export const clearOtp = createAsyncThunk('otp/clear', async () => {
  await AsyncStorage.removeItem('token');
});

// Load token from storage
export const loadToken = createAsyncThunk('otp/loadToken', async () => {
  const token = await AsyncStorage.getItem('token');
  const userId = await AsyncStorage.getItem('userId');
  return { token, userId };
});

const otpSlice = createSlice({
  name: 'otp',
  initialState: {
    token: null,
    loading: false,
    error: null,
  },
  reducers: {
    setToken: (state, action) => {
      state.token = action.payload;
    },
    clearError: state => {
      state.error = null;
    },
  },
  extraReducers: builder => {
    builder
      .addCase(verifyOtp.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(verifyOtp.fulfilled, (state, action) => {
        state.loading = false;
        state.token = action.payload.token;
        state.error = null;
      })
      .addCase(verifyOtp.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Invalid OTP. Please try again.';
      })
      .addCase(clearOtp.fulfilled, state => {
        state.token = null;
        state.error = null;
      })
      .addCase(loadToken.fulfilled, (state, action) => {
        if (action.payload.token) {
          state.token = action.payload.token;
        }
      });
  },
});

export const { setToken, clearError } = otpSlice.actions;
export default otpSlice.reducer;
