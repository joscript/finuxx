import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import {
  goalService,
  Goal,
  GoalContribution,
  CreateGoalRequest,
  UpdateGoalRequest,
  AddContributionRequest,
} from '../../api';

// ============ STATE TYPE ============
interface GoalsState {
  goals: Goal[];
  selectedGoal: Goal | null;
  isLoading: boolean;
  error: string | null;
}

const initialState: GoalsState = {
  goals: [],
  selectedGoal: null,
  isLoading: false,
  error: null,
};

// ============ ASYNC THUNKS ============

export const fetchGoals = createAsyncThunk(
  'goals/fetchGoals',
  async (_, { rejectWithValue }) => {
    try {
      const response = await goalService.getAll();
      
      if (response.success && response.data) {
        return response.data.goals || response.data;
      }
      
      return rejectWithValue(response.message || 'Failed to fetch goals');
    } catch (error: any) {
      return rejectWithValue(error.message || 'An error occurred');
    }
  }
);

export const fetchGoalById = createAsyncThunk(
  'goals/fetchGoalById',
  async (id: number, { rejectWithValue }) => {
    try {
      const response = await goalService.getById(id);
      
      if (response.success && response.data?.goal) {
        return response.data.goal;
      }
      
      return rejectWithValue(response.message || 'Failed to fetch goal');
    } catch (error: any) {
      return rejectWithValue(error.message || 'An error occurred');
    }
  }
);

export const createGoal = createAsyncThunk(
  'goals/createGoal',
  async (data: CreateGoalRequest, { rejectWithValue }) => {
    try {
      const response = await goalService.create(data);
      
      if (response.success && response.data?.goal) {
        return response.data.goal;
      }
      
      return rejectWithValue(response.message || 'Failed to create goal');
    } catch (error: any) {
      return rejectWithValue(error.message || 'An error occurred');
    }
  }
);

export const updateGoal = createAsyncThunk(
  'goals/updateGoal',
  async ({ id, data }: { id: number; data: UpdateGoalRequest }, { rejectWithValue }) => {
    try {
      const response = await goalService.update(id, data);
      
      if (response.success && response.data?.goal) {
        return response.data.goal;
      }
      
      return rejectWithValue(response.message || 'Failed to update goal');
    } catch (error: any) {
      return rejectWithValue(error.message || 'An error occurred');
    }
  }
);

export const deleteGoal = createAsyncThunk(
  'goals/deleteGoal',
  async (id: number, { rejectWithValue }) => {
    try {
      const response = await goalService.delete(id);
      
      if (response.success) {
        return id;
      }
      
      return rejectWithValue(response.message || 'Failed to delete goal');
    } catch (error: any) {
      return rejectWithValue(error.message || 'An error occurred');
    }
  }
);

export const addContribution = createAsyncThunk(
  'goals/addContribution',
  async ({ goalId, data }: { goalId: number; data: AddContributionRequest }, { rejectWithValue }) => {
    try {
      const response = await goalService.addContribution(goalId, data);
      
      if (response.success && response.data) {
        return { goalId, goal: response.data.goal, contribution: response.data.contribution };
      }
      
      return rejectWithValue(response.message || 'Failed to add contribution');
    } catch (error: any) {
      return rejectWithValue(error.message || 'An error occurred');
    }
  }
);

// ============ SLICE ============
const goalsSlice = createSlice({
  name: 'goals',
  initialState,
  reducers: {
    clearGoalsError: (state) => {
      state.error = null;
    },
    setSelectedGoal: (state, action) => {
      state.selectedGoal = action.payload;
    },
    clearSelectedGoal: (state) => {
      state.selectedGoal = null;
    },
    resetGoals: (state) => {
      state.goals = [];
      state.selectedGoal = null;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // Fetch Goals
    builder
      .addCase(fetchGoals.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchGoals.fulfilled, (state, action) => {
        state.isLoading = false;
        state.goals = action.payload;
        state.error = null;
      })
      .addCase(fetchGoals.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Fetch Goal By ID
    builder
      .addCase(fetchGoalById.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchGoalById.fulfilled, (state, action) => {
        state.isLoading = false;
        state.selectedGoal = action.payload;
        state.error = null;
      })
      .addCase(fetchGoalById.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Create Goal
    builder
      .addCase(createGoal.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createGoal.fulfilled, (state, action) => {
        state.isLoading = false;
        state.goals.push(action.payload);
        state.error = null;
      })
      .addCase(createGoal.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Update Goal
    builder
      .addCase(updateGoal.fulfilled, (state, action) => {
        const index = state.goals.findIndex((g) => g.id === action.payload.id);
        if (index !== -1) {
          state.goals[index] = action.payload;
        }
        if (state.selectedGoal?.id === action.payload.id) {
          state.selectedGoal = action.payload;
        }
      })
      .addCase(updateGoal.rejected, (state, action) => {
        state.error = action.payload as string;
      });

    // Delete Goal
    builder
      .addCase(deleteGoal.fulfilled, (state, action) => {
        state.goals = state.goals.filter((g) => g.id !== action.payload);
        if (state.selectedGoal?.id === action.payload) {
          state.selectedGoal = null;
        }
      })
      .addCase(deleteGoal.rejected, (state, action) => {
        state.error = action.payload as string;
      });

    // Add Contribution
    builder
      .addCase(addContribution.fulfilled, (state, action) => {
        const { goalId, goal } = action.payload;
        const index = state.goals.findIndex((g) => g.id === goalId);
        if (index !== -1 && goal) {
          // Update the currentAmount and progress on the existing goal
          state.goals[index].currentAmount = goal.currentAmount;
        }
        if (state.selectedGoal?.id === goalId && goal) {
          state.selectedGoal.currentAmount = goal.currentAmount;
        }
      })
      .addCase(addContribution.rejected, (state, action) => {
        state.error = action.payload as string;
      });
  },
});

export const { clearGoalsError, setSelectedGoal, clearSelectedGoal, resetGoals } = goalsSlice.actions;
export default goalsSlice.reducer;
