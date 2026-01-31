import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { budgetService, Budget, CreateBudgetRequest, UpdateBudgetRequest } from '../../api';

// ============ STATE TYPE ============
interface BudgetsState {
  budgets: Budget[];
  currentBudget: Budget | null;
  isLoading: boolean;
  error: string | null;
}

const initialState: BudgetsState = {
  budgets: [],
  currentBudget: null,
  isLoading: false,
  error: null,
};

// ============ ASYNC THUNKS ============

export const fetchBudgets = createAsyncThunk(
  'budgets/fetchBudgets',
  async (_, { rejectWithValue }) => {
    try {
      const response = await budgetService.getAll();
      
      if (response.success && response.data) {
        return response.data.budgets || response.data;
      }
      
      return rejectWithValue(response.message || 'Failed to fetch budgets');
    } catch (error: any) {
      return rejectWithValue(error.message || 'An error occurred');
    }
  }
);

export const fetchCurrentBudget = createAsyncThunk(
  'budgets/fetchCurrentBudget',
  async (_, { rejectWithValue }) => {
    try {
      const response = await budgetService.getCurrent();
      
      if (response.success && response.data?.budget) {
        return response.data.budget;
      }
      
      return rejectWithValue(response.message || 'No current budget found');
    } catch (error: any) {
      return rejectWithValue(error.message || 'An error occurred');
    }
  }
);

export const createBudget = createAsyncThunk(
  'budgets/createBudget',
  async (data: CreateBudgetRequest, { rejectWithValue }) => {
    try {
      const response = await budgetService.create(data);
      
      if (response.success && response.data?.budget) {
        return response.data.budget;
      }
      
      return rejectWithValue(response.message || 'Failed to create budget');
    } catch (error: any) {
      return rejectWithValue(error.message || 'An error occurred');
    }
  }
);

export const updateBudget = createAsyncThunk(
  'budgets/updateBudget',
  async ({ id, data }: { id: number; data: UpdateBudgetRequest }, { rejectWithValue }) => {
    try {
      const response = await budgetService.update(id, data);
      
      if (response.success && response.data?.budget) {
        return response.data.budget;
      }
      
      return rejectWithValue(response.message || 'Failed to update budget');
    } catch (error: any) {
      return rejectWithValue(error.message || 'An error occurred');
    }
  }
);

export const deleteBudget = createAsyncThunk(
  'budgets/deleteBudget',
  async (id: number, { rejectWithValue }) => {
    try {
      const response = await budgetService.delete(id);
      
      if (response.success) {
        return id;
      }
      
      return rejectWithValue(response.message || 'Failed to delete budget');
    } catch (error: any) {
      return rejectWithValue(error.message || 'An error occurred');
    }
  }
);

// ============ SLICE ============
const budgetsSlice = createSlice({
  name: 'budgets',
  initialState,
  reducers: {
    clearBudgetsError: (state) => {
      state.error = null;
    },
    resetBudgets: (state) => {
      state.budgets = [];
      state.currentBudget = null;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // Fetch Budgets
    builder
      .addCase(fetchBudgets.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchBudgets.fulfilled, (state, action) => {
        state.isLoading = false;
        state.budgets = action.payload;
        state.error = null;
      })
      .addCase(fetchBudgets.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Fetch Current Budget
    builder
      .addCase(fetchCurrentBudget.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchCurrentBudget.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentBudget = action.payload;
        state.error = null;
      })
      .addCase(fetchCurrentBudget.rejected, (state, action) => {
        state.isLoading = false;
        state.currentBudget = null;
        // Don't set error for "no current budget" - it's expected
      });

    // Create Budget
    builder
      .addCase(createBudget.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createBudget.fulfilled, (state, action) => {
        state.isLoading = false;
        state.budgets.push(action.payload);
        state.currentBudget = action.payload;
        state.error = null;
      })
      .addCase(createBudget.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Update Budget
    builder
      .addCase(updateBudget.fulfilled, (state, action) => {
        const index = state.budgets.findIndex((b) => b.id === action.payload.id);
        if (index !== -1) {
          state.budgets[index] = action.payload;
        }
        if (state.currentBudget?.id === action.payload.id) {
          state.currentBudget = action.payload;
        }
      })
      .addCase(updateBudget.rejected, (state, action) => {
        state.error = action.payload as string;
      });

    // Delete Budget
    builder
      .addCase(deleteBudget.fulfilled, (state, action) => {
        state.budgets = state.budgets.filter((b) => b.id !== action.payload);
        if (state.currentBudget?.id === action.payload) {
          state.currentBudget = null;
        }
      })
      .addCase(deleteBudget.rejected, (state, action) => {
        state.error = action.payload as string;
      });
  },
});

export const { clearBudgetsError, resetBudgets } = budgetsSlice.actions;
export default budgetsSlice.reducer;
