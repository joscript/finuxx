import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import {
  transactionService,
  Transaction,
  TransactionSummary,
  CreateTransactionRequest,
  UpdateTransactionRequest,
  TransactionFilters,
} from "../../api";

// ============ STATE TYPE ============
interface TransactionsState {
  transactions: Transaction[];
  summary: TransactionSummary | null;
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  } | null;
  filters: TransactionFilters;
  isLoading: boolean;
  error: string | null;
}

const initialState: TransactionsState = {
  transactions: [],
  summary: null,
  pagination: null,
  filters: {},
  isLoading: false,
  error: null,
};

// ============ ASYNC THUNKS ============

export const fetchTransactions = createAsyncThunk(
  "transactions/fetchTransactions",
  async (filters: TransactionFilters = {}, { rejectWithValue }) => {
    try {
      const response = await transactionService.getAll(filters);

      console.log(">>> Fetch Transactions Response data:", response.data);

      if (response.success && response.data) {
        return {
          transactions: response.data,
          pagination: response.pagination,
        };
      }

      return rejectWithValue(
        response.message || "Failed to fetch transactions",
      );
    } catch (error: any) {
      return rejectWithValue(error.message || "An error occurred");
    }
  },
);

export const fetchTransactionSummary = createAsyncThunk(
  "transactions/fetchSummary",
  async (_, { rejectWithValue }) => {
    try {
      const response = await transactionService.getSummary();

      if (response.success && response.data?.summary) {
        return response.data.summary;
      }

      return rejectWithValue(response.message || "Failed to fetch summary");
    } catch (error: any) {
      return rejectWithValue(error.message || "An error occurred");
    }
  },
);

export const createTransaction = createAsyncThunk(
  "transactions/createTransaction",
  async (data: CreateTransactionRequest, { rejectWithValue }) => {
    try {
      const response = await transactionService.create(data);

      if (response.success && response.data?.transaction) {
        return response.data.transaction;
      }

      return rejectWithValue(
        response.message || "Failed to create transaction",
      );
    } catch (error: any) {
      return rejectWithValue(error.message || "An error occurred");
    }
  },
);

export const updateTransaction = createAsyncThunk(
  "transactions/updateTransaction",
  async (
    { id, data }: { id: number; data: UpdateTransactionRequest },
    { rejectWithValue },
  ) => {
    try {
      const response = await transactionService.update(id, data);

      if (response.success && response.data?.transaction) {
        return response.data.transaction;
      }

      return rejectWithValue(
        response.message || "Failed to update transaction",
      );
    } catch (error: any) {
      return rejectWithValue(error.message || "An error occurred");
    }
  },
);

export const deleteTransaction = createAsyncThunk(
  "transactions/deleteTransaction",
  async (id: number, { rejectWithValue }) => {
    try {
      const response = await transactionService.delete(id);

      if (response.success) {
        return id;
      }

      return rejectWithValue(
        response.message || "Failed to delete transaction",
      );
    } catch (error: any) {
      return rejectWithValue(error.message || "An error occurred");
    }
  },
);

// ============ SLICE ============
const transactionsSlice = createSlice({
  name: "transactions",
  initialState,
  reducers: {
    clearTransactionsError: (state) => {
      state.error = null;
    },
    setFilters: (state, action) => {
      state.filters = action.payload;
    },
    resetTransactions: (state) => {
      state.transactions = [];
      state.summary = null;
      state.pagination = null;
      state.filters = {};
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // Fetch Transactions
    builder
      .addCase(fetchTransactions.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchTransactions.fulfilled, (state, action) => {
        state.isLoading = false;
        state.transactions = action.payload.transactions;
        state.pagination = action.payload.pagination || null;
        state.error = null;
      })
      .addCase(fetchTransactions.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Fetch Summary
    builder
      .addCase(fetchTransactionSummary.fulfilled, (state, action) => {
        state.summary = action.payload;
      })
      .addCase(fetchTransactionSummary.rejected, (state, action) => {
        state.error = action.payload as string;
      });

    // Create Transaction
    builder
      .addCase(createTransaction.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createTransaction.fulfilled, (state, action) => {
        state.isLoading = false;
        state.transactions.unshift(action.payload);
        state.error = null;
      })
      .addCase(createTransaction.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Update Transaction
    builder
      .addCase(updateTransaction.fulfilled, (state, action) => {
        const index = state.transactions.findIndex(
          (t) => t.id === action.payload.id,
        );
        if (index !== -1) {
          state.transactions[index] = action.payload;
        }
      })
      .addCase(updateTransaction.rejected, (state, action) => {
        state.error = action.payload as string;
      });

    // Delete Transaction
    builder
      .addCase(deleteTransaction.fulfilled, (state, action) => {
        state.transactions = state.transactions.filter(
          (t) => t.id !== action.payload,
        );
      })
      .addCase(deleteTransaction.rejected, (state, action) => {
        state.error = action.payload as string;
      });
  },
});

export const { clearTransactionsError, setFilters, resetTransactions } =
  transactionsSlice.actions;
export default transactionsSlice.reducer;
