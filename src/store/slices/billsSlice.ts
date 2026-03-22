import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import {
  billService,
  Bill,
  CreateBillRequest,
  UpdateBillRequest,
  BillFilters,
} from "../../api";

// ============ STATE TYPE ============
interface BillsState {
  bills: Bill[];
  isLoading: boolean;
  error: string | null;
}

const initialState: BillsState = {
  bills: [],
  isLoading: false,
  error: null,
};

// ============ ASYNC THUNKS ============

export const fetchBills = createAsyncThunk(
  "bills/fetchBills",
  async (filters: BillFilters = {}, { rejectWithValue }) => {
    try {
      const response = await billService.getAll(filters);

      if (response.success && response.data) {
        return response.data.bills || response.data;
      }

      return rejectWithValue(response.message || "Failed to fetch bills");
    } catch (error: any) {
      return rejectWithValue(error.message || "An error occurred");
    }
  },
);

export const createBill = createAsyncThunk(
  "bills/createBill",
  async (data: CreateBillRequest, { rejectWithValue }) => {
    try {
      const response = await billService.create(data);

      if (response.success && response.data?.bill) {
        return response.data.bill;
      }

      return rejectWithValue(response.message || "Failed to create bill");
    } catch (error: any) {
      return rejectWithValue(error.message || "An error occurred");
    }
  },
);

export const updateBill = createAsyncThunk(
  "bills/updateBill",
  async (
    { id, data }: { id: string; data: UpdateBillRequest },
    { rejectWithValue },
  ) => {
    try {
      const response = await billService.update(id, data);

      if (response.success && response.data?.bill) {
        return response.data.bill;
      }

      return rejectWithValue(response.message || "Failed to update bill");
    } catch (error: any) {
      return rejectWithValue(error.message || "An error occurred");
    }
  },
);

export const deleteBill = createAsyncThunk(
  "bills/deleteBill",
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await billService.delete(id);

      if (response.success) {
        return id;
      }

      return rejectWithValue(response.message || "Failed to delete bill");
    } catch (error: any) {
      return rejectWithValue(error.message || "An error occurred");
    }
  },
);

export const markBillAsPaid = createAsyncThunk(
  "bills/markAsPaid",
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await billService.markAsPaid(id);

      if (response.success && response.data?.bill) {
        return response.data.bill;
      }

      return rejectWithValue(response.message || "Failed to mark bill as paid");
    } catch (error: any) {
      return rejectWithValue(error.message || "An error occurred");
    }
  },
);

export const markBillAsUnpaid = createAsyncThunk(
  "bills/markAsUnpaid",
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await billService.markAsUnpaid(id);

      if (response.success && response.data?.bill) {
        return response.data.bill;
      }

      return rejectWithValue(
        response.message || "Failed to mark bill as unpaid",
      );
    } catch (error: any) {
      return rejectWithValue(error.message || "An error occurred");
    }
  },
);

// ============ SLICE ============
const billsSlice = createSlice({
  name: "bills",
  initialState,
  reducers: {
    clearBillsError: (state) => {
      state.error = null;
    },
    resetBills: (state) => {
      state.bills = [];
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // Fetch Bills
    builder
      .addCase(fetchBills.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchBills.fulfilled, (state, action) => {
        state.isLoading = false;
        state.bills = action.payload;
        state.error = null;
      })
      .addCase(fetchBills.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Create Bill
    builder
      .addCase(createBill.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createBill.fulfilled, (state, action) => {
        state.isLoading = false;
        state.bills.push(action.payload);
        state.error = null;
      })
      .addCase(createBill.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Update Bill
    builder
      .addCase(updateBill.fulfilled, (state, action) => {
        const index = state.bills.findIndex((b) => b.id === action.payload.id);
        if (index !== -1) {
          state.bills[index] = action.payload;
        }
      })
      .addCase(updateBill.rejected, (state, action) => {
        state.error = action.payload as string;
      });

    // Delete Bill
    builder
      .addCase(deleteBill.fulfilled, (state, action) => {
        state.bills = state.bills.filter((b) => b.id !== action.payload);
      })
      .addCase(deleteBill.rejected, (state, action) => {
        state.error = action.payload as string;
      });

    // Mark as Paid
    builder
      .addCase(markBillAsPaid.fulfilled, (state, action) => {
        const index = state.bills.findIndex((b) => b.id === action.payload.id);
        if (index !== -1) {
          state.bills[index] = action.payload;
        }
      })
      .addCase(markBillAsPaid.rejected, (state, action) => {
        state.error = action.payload as string;
      });

    // Mark as Unpaid
    builder
      .addCase(markBillAsUnpaid.fulfilled, (state, action) => {
        const index = state.bills.findIndex((b) => b.id === action.payload.id);
        if (index !== -1) {
          state.bills[index] = action.payload;
        }
      })
      .addCase(markBillAsUnpaid.rejected, (state, action) => {
        state.error = action.payload as string;
      });
  },
});

export const { clearBillsError, resetBills } = billsSlice.actions;
export default billsSlice.reducer;
