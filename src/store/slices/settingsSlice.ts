import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { settingsService, Settings, UpdateSettingsRequest } from '../../api';

// ============ STATE TYPE ============
interface SettingsState {
  settings: Settings | null;
  isLoading: boolean;
  error: string | null;
}

const initialState: SettingsState = {
  settings: null,
  isLoading: false,
  error: null,
};

// ============ ASYNC THUNKS ============

export const fetchSettings = createAsyncThunk(
  'settings/fetchSettings',
  async (_, { rejectWithValue }) => {
    try {
      const response = await settingsService.get();
      
      if (response.success && response.data?.settings) {
        return response.data.settings;
      }
      
      return rejectWithValue(response.message || 'Failed to fetch settings');
    } catch (error: any) {
      return rejectWithValue(error.message || 'An error occurred');
    }
  }
);

export const updateSettings = createAsyncThunk(
  'settings/updateSettings',
  async (data: UpdateSettingsRequest, { rejectWithValue }) => {
    try {
      const response = await settingsService.update(data);
      
      if (response.success && response.data?.settings) {
        return response.data.settings;
      }
      
      return rejectWithValue(response.message || 'Failed to update settings');
    } catch (error: any) {
      return rejectWithValue(error.message || 'An error occurred');
    }
  }
);

// ============ SLICE ============
const settingsSlice = createSlice({
  name: 'settings',
  initialState,
  reducers: {
    clearSettingsError: (state) => {
      state.error = null;
    },
    resetSettings: (state) => {
      state.settings = null;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // Fetch Settings
    builder
      .addCase(fetchSettings.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchSettings.fulfilled, (state, action) => {
        state.isLoading = false;
        state.settings = action.payload;
        state.error = null;
      })
      .addCase(fetchSettings.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Update Settings
    builder
      .addCase(updateSettings.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateSettings.fulfilled, (state, action) => {
        state.isLoading = false;
        state.settings = action.payload;
        state.error = null;
      })
      .addCase(updateSettings.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearSettingsError, resetSettings } = settingsSlice.actions;
export default settingsSlice.reducer;
