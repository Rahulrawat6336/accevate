import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Fetch dashboard
export const fetchDashboard = createAsyncThunk(
  'dashboard/fetch',
  async (token, { rejectWithValue }) => {
    try {
      console.log('Fetching dashboard with token:', token);

      const response = await axios.post(
        'https://aapsuj.accevate.co/flutter-api/dashboard.php',
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        },
      );

      console.log('Dashboard response:', response.data);

      // Save user data
      if (response.data.user) {
        await AsyncStorage.setItem(
          'userData',
          JSON.stringify(response.data.user),
        );
      }

      return response.data;
    } catch (error) {
      console.error('Dashboard fetch error:', error);

      return rejectWithValue(
        error.response?.data?.message || 'Failed to load dashboard',
      );
    }
  },
);

// Clear dashboard
export const clearDashboard = createAsyncThunk('dashboard/clear', async () => {
  await AsyncStorage.removeItem('userData');
});

const dashboardSlice = createSlice({
  name: 'dashboard',

  initialState: {
    status: false,
    message: '',
    user: null,

    carousel: [],
    student: null,
    amount: null,
    color: '#667eea',

    loading: false,
    error: null,
  },

  reducers: {},

  extraReducers: builder => {
    builder

      // Pending
      .addCase(fetchDashboard.pending, state => {
        state.loading = true;
        state.error = null;
      })

      // Success
      .addCase(fetchDashboard.fulfilled, (state, action) => {
        const data = action.payload;

        state.loading = false;
        state.status = data.status;
        state.message = data.msg;

        // User
        state.user = data.user || null;

        // Dashboard
        state.carousel = data.dashboard?.carousel || [];
        state.student = data.dashboard?.student || null;
        state.amount = data.dashboard?.amount || null;
        state.color = data.dashboard?.color?.dynamic_color || '#667eea';

        state.error = null;
      })

      // Error
      .addCase(fetchDashboard.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to load dashboard data';
      })

      // Clear
      .addCase(clearDashboard.fulfilled, state => {
        state.status = false;
        state.message = '';

        state.user = null;
        state.carousel = [];
        state.student = null;
        state.amount = null;
        state.color = '#667eea';

        state.error = null;
      });
  },
});

export default dashboardSlice.reducer;
