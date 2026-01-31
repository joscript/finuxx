import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { accountService, Account, CreateAccountRequest, UpdateAccountRequest } from '../../api';

// ============ STATE TYPE ============
interface AccountsState {
  accounts: Account[];
  totals: {
    totalAssets: number;
    totalLiabilities: number;
    netWorth: number;
  } | null;
  isLoading: boolean;
  error: string | null;
}

const initialState: AccountsState = {
  accounts: [],
  totals: null,
  isLoading: false,
  error: null,
};

// ============ ASYNC THUNKS ============

export const fetchAccounts = createAsyncThunk(
  'accounts/fetchAccounts',
  async (_, { rejectWithValue }) => {
    try {
      const response = await accountService.getAll();
      
      if (response.success && response.data) {
        return response.data;
      }
      
      return rejectWithValue(response.message || 'Failed to fetch accounts');
    } catch (error: any) {
      return rejectWithValue(error.message || 'An error occurred');
    }
  }
);

export const createAccount = createAsyncThunk(
  'accounts/createAccount',
  async (data: CreateAccountRequest, { rejectWithValue }) => {
    try {
      const response = await accountService.create(data);
      
      if (response.success && response.data?.account) {
        return response.data.account;
      }
      
      return rejectWithValue(response.message || 'Failed to create account');
    } catch (error: any) {
      return rejectWithValue(error.message || 'An error occurred');
    }
  }
);

export const updateAccount = createAsyncThunk(
  'accounts/updateAccount',
  async ({ id, data }: { id: number; data: UpdateAccountRequest }, { rejectWithValue }) => {
    try {
      const response = await accountService.update(id, data);
      
      if (response.success && response.data?.account) {
        return response.data.account;
      }
      
      return rejectWithValue(response.message || 'Failed to update account');
    } catch (error: any) {
      return rejectWithValue(error.message || 'An error occurred');
    }
  }
);

export const deleteAccount = createAsyncThunk(
  'accounts/deleteAccount',
  async (id: number, { rejectWithValue }) => {
    try {
      const response = await accountService.delete(id);
      
      if (response.success) {
        return id;
      }
      
      return rejectWithValue(response.message || 'Failed to delete account');
    } catch (error: any) {
      return rejectWithValue(error.message || 'An error occurred');
    }
  }
);

// ============ SLICE ============
const accountsSlice = createSlice({
  name: 'accounts',
  initialState,
  reducers: {
    clearAccountsError: (state) => {
      state.error = null;
    },
    resetAccounts: (state) => {
      state.accounts = [];
      state.totals = null;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // Fetch Accounts
    builder
      .addCase(fetchAccounts.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchAccounts.fulfilled, (state, action) => {
        state.isLoading = false;
        state.accounts = action.payload.accounts || [];
        state.totals = action.payload.totals || null;
        state.error = null;
      })
      .addCase(fetchAccounts.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Create Account
    builder
      .addCase(createAccount.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createAccount.fulfilled, (state, action) => {
        state.isLoading = false;
        state.accounts.push(action.payload);
        state.error = null;
      })
      .addCase(createAccount.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Update Account
    builder
      .addCase(updateAccount.fulfilled, (state, action) => {
        const index = state.accounts.findIndex((a) => a.id === action.payload.id);
        if (index !== -1) {
          state.accounts[index] = action.payload;
        }
      })
      .addCase(updateAccount.rejected, (state, action) => {
        state.error = action.payload as string;
      });

    // Delete Account
    builder
      .addCase(deleteAccount.fulfilled, (state, action) => {
        state.accounts = state.accounts.filter((a) => a.id !== action.payload);
      })
      .addCase(deleteAccount.rejected, (state, action) => {
        state.error = action.payload as string;
      });
  },
});

export const { clearAccountsError, resetAccounts } = accountsSlice.actions;
export default accountsSlice.reducer;
