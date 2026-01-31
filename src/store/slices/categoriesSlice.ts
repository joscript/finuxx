import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { categoryService, Category, CreateCategoryRequest, UpdateCategoryRequest } from '../../api';

// ============ STATE TYPE ============
interface CategoriesState {
  categories: Category[];
  isLoading: boolean;
  error: string | null;
}

const initialState: CategoriesState = {
  categories: [],
  isLoading: false,
  error: null,
};

// ============ ASYNC THUNKS ============

export const fetchCategories = createAsyncThunk(
  'categories/fetchCategories',
  async (_, { rejectWithValue }) => {
    try {
      const response = await categoryService.getAll();
      
      if (response.success && response.data) {
        return response.data.categories || [];
      }
      
      return rejectWithValue(response.message || 'Failed to fetch categories');
    } catch (error: any) {
      return rejectWithValue(error.message || 'An error occurred');
    }
  }
);

export const createCategory = createAsyncThunk(
  'categories/createCategory',
  async (data: CreateCategoryRequest, { rejectWithValue }) => {
    try {
      const response = await categoryService.create(data);
      
      if (response.success && response.data?.category) {
        return response.data.category;
      }
      
      return rejectWithValue(response.message || 'Failed to create category');
    } catch (error: any) {
      return rejectWithValue(error.message || 'An error occurred');
    }
  }
);

export const updateCategory = createAsyncThunk(
  'categories/updateCategory',
  async ({ id, data }: { id: number; data: UpdateCategoryRequest }, { rejectWithValue }) => {
    try {
      const response = await categoryService.update(id, data);
      
      if (response.success && response.data?.category) {
        return response.data.category;
      }
      
      return rejectWithValue(response.message || 'Failed to update category');
    } catch (error: any) {
      return rejectWithValue(error.message || 'An error occurred');
    }
  }
);

export const deleteCategory = createAsyncThunk(
  'categories/deleteCategory',
  async (id: number, { rejectWithValue }) => {
    try {
      const response = await categoryService.delete(id);
      
      if (response.success) {
        return id;
      }
      
      return rejectWithValue(response.message || 'Failed to delete category');
    } catch (error: any) {
      return rejectWithValue(error.message || 'An error occurred');
    }
  }
);

// ============ SLICE ============
const categoriesSlice = createSlice({
  name: 'categories',
  initialState,
  reducers: {
    clearCategoriesError: (state) => {
      state.error = null;
    },
    resetCategories: (state) => {
      state.categories = [];
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // Fetch Categories
    builder
      .addCase(fetchCategories.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchCategories.fulfilled, (state, action) => {
        state.isLoading = false;
        state.categories = action.payload;
        state.error = null;
      })
      .addCase(fetchCategories.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Create Category
    builder
      .addCase(createCategory.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createCategory.fulfilled, (state, action) => {
        state.isLoading = false;
        state.categories.push(action.payload);
        state.error = null;
      })
      .addCase(createCategory.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Update Category
    builder
      .addCase(updateCategory.fulfilled, (state, action) => {
        const index = state.categories.findIndex((c) => c.id === action.payload.id);
        if (index !== -1) {
          state.categories[index] = action.payload;
        }
      })
      .addCase(updateCategory.rejected, (state, action) => {
        state.error = action.payload as string;
      });

    // Delete Category
    builder
      .addCase(deleteCategory.fulfilled, (state, action) => {
        state.categories = state.categories.filter((c) => c.id !== action.payload);
      })
      .addCase(deleteCategory.rejected, (state, action) => {
        state.error = action.payload as string;
      });
  },
});

export const { clearCategoriesError, resetCategories } = categoriesSlice.actions;
export default categoriesSlice.reducer;
