import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { authService, User } from "../../api";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { STORAGE_KEYS } from "../../api/client";

// ============ STATE TYPE ============
interface AuthState {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: User | null;
  error: string | null;
}

const initialState: AuthState = {
  isAuthenticated: false,
  isLoading: true,
  user: null,
  error: null,
};

// ============ ASYNC THUNKS ============

/**
 * Check authentication status on app start
 */
export const checkAuth = createAsyncThunk(
  "auth/checkAuth",
  async (_, { rejectWithValue }) => {
    try {
      const accessToken = await AsyncStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);

      if (!accessToken) {
        return { isAuthenticated: false, user: null };
      }

      // Try to get stored user first
      const storedUser = await authService.getStoredUser();

      // Verify with server
      const response = await authService.getCurrentUser();

      if (response.success && response.data?.user) {
        return { isAuthenticated: true, user: response.data.user };
      }

      // Token invalid, clear everything
      await authService.logout();
      return { isAuthenticated: false, user: null };
    } catch (error: any) {
      await authService.logout();
      return rejectWithValue(error.message || "Auth check failed");
    }
  },
);

/**
 * Login user
 */
export const login = createAsyncThunk(
  "auth/login",
  async (
    { email, password }: { email: string; password: string },
    { rejectWithValue },
  ) => {
    try {
      const response = await authService.login({ email, password });

      if (response.success && response.data) {
        return response.data.user;
      }

      return rejectWithValue(response.message || "Login failed");
    } catch (error: any) {
      return rejectWithValue(error.message || "An error occurred");
    }
  },
);

/**
 * Register new user
 */
export const register = createAsyncThunk(
  "auth/register",
  async (
    {
      name,
      email,
      password,
    }: { name: string; email: string; password: string },
    { rejectWithValue },
  ) => {
    try {
      const response = await authService.register({ name, email, password });

      if (response.success && response.data) {
        return response.data.user;
      }

      return rejectWithValue(response.message || "Registration failed");
    } catch (error: any) {
      return rejectWithValue(error.message || "An error occurred");
    }
  },
);

/**
 * Logout user
 */
export const logout = createAsyncThunk(
  "auth/logout",
  async (_, { rejectWithValue }) => {
    try {
      await authService.logout();
      return true;
    } catch (error: any) {
      console.error("Logout error:", error);
      // Still clear local state even if API call fails
      return true;
    }
  },
);

/**
 * Update user profile
 */
export const updateProfile = createAsyncThunk(
  "auth/updateProfile",
  async ({ name }: { name: string }, { rejectWithValue }) => {
    try {
      const response = await authService.updateProfile({ name });

      if (response.success && response.data?.user) {
        return response.data.user;
      }

      return rejectWithValue(response.message || "Failed to update profile");
    } catch (error: any) {
      return rejectWithValue(error.message || "An error occurred");
    }
  },
);

/**
 * Update user password
 */
export const updatePassword = createAsyncThunk(
  "auth/updatePassword",
  async (
    {
      currentPassword,
      newPassword,
    }: { currentPassword: string; newPassword: string },
    { rejectWithValue },
  ) => {
    try {
      const response = await authService.updatePassword({
        currentPassword,
        newPassword,
      });

      if (response.success) {
        return true;
      }

      return rejectWithValue(response.message || "Failed to update password");
    } catch (error: any) {
      return rejectWithValue(error.message || "An error occurred");
    }
  },
);

/**
 * Refresh user data
 */
export const refreshUser = createAsyncThunk(
  "auth/refreshUser",
  async (_, { rejectWithValue }) => {
    try {
      const response = await authService.getCurrentUser();

      if (response.success && response.data?.user) {
        return response.data.user;
      }

      return rejectWithValue("Failed to refresh user");
    } catch (error: any) {
      return rejectWithValue(error.message || "An error occurred");
    }
  },
);

// ============ SLICE ============
const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setUser: (state, action: PayloadAction<User>) => {
      state.user = action.payload;
    },
  },
  extraReducers: (builder) => {
    // Check Auth
    builder
      .addCase(checkAuth.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(checkAuth.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isAuthenticated = action.payload.isAuthenticated;
        state.user = action.payload.user;
        state.error = null;
      })
      .addCase(checkAuth.rejected, (state, action) => {
        state.isLoading = false;
        state.isAuthenticated = false;
        state.user = null;
        state.error = action.payload as string;
      });

    // Login
    builder
      .addCase(login.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isAuthenticated = true;
        state.user = action.payload;
        state.error = null;
      })
      .addCase(login.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Register
    builder
      .addCase(register.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(register.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isAuthenticated = true;
        state.user = action.payload;
        state.error = null;
      })
      .addCase(register.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Logout
    builder.addCase(logout.fulfilled, (state) => {
      state.isAuthenticated = false;
      state.user = null;
      state.error = null;
    });

    // Update Profile
    builder
      .addCase(updateProfile.fulfilled, (state, action) => {
        state.user = action.payload;
      })
      .addCase(updateProfile.rejected, (state, action) => {
        state.error = action.payload as string;
      });

    // Update Password
    builder
      .addCase(updatePassword.pending, (state) => {
        state.error = null;
      })
      .addCase(updatePassword.rejected, (state, action) => {
        state.error = action.payload as string;
      });

    // Refresh User
    builder.addCase(refreshUser.fulfilled, (state, action) => {
      state.user = action.payload;
    });
  },
});

export const { clearError, setUser } = authSlice.actions;
export default authSlice.reducer;
