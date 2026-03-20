import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import {
  reportService,
  ReportOverview,
  ReportCategory,
  ReportTrends,
  ReportInsight,
  ReportQuery,
  ReportPeriod,
} from "../../api";

// ============ STATE TYPE ============
interface ReportsState {
  overview: ReportOverview | null;
  categories: ReportCategory[];
  totalExpenses: number;
  trends: ReportTrends | null;
  insights: ReportInsight[];
  period: ReportPeriod;
  isLoading: boolean;
  error: string | null;
}

const initialState: ReportsState = {
  overview: null,
  categories: [],
  totalExpenses: 0,
  trends: null,
  insights: [],
  period: "month",
  isLoading: false,
  error: null,
};

// ============ ASYNC THUNKS ============

export const fetchReportOverview = createAsyncThunk(
  "reports/fetchOverview",
  async (params: ReportQuery, { rejectWithValue }) => {
    try {
      const response = await reportService.getOverview(params);
      if (response.success && response.data?.overview) {
        return response.data.overview;
      }
      return rejectWithValue(response.message || "Failed to fetch overview");
    } catch (error: any) {
      return rejectWithValue(error.message || "An error occurred");
    }
  },
);

export const fetchReportCategories = createAsyncThunk(
  "reports/fetchCategories",
  async (params: ReportQuery, { rejectWithValue }) => {
    try {
      const response = await reportService.getCategories(params);
      if (response.success && response.data) {
        return response.data;
      }
      return rejectWithValue(response.message || "Failed to fetch categories");
    } catch (error: any) {
      return rejectWithValue(error.message || "An error occurred");
    }
  },
);

export const fetchReportTrends = createAsyncThunk(
  "reports/fetchTrends",
  async (params: ReportQuery, { rejectWithValue }) => {
    try {
      const response = await reportService.getTrends(params);
      if (response.success && response.data) {
        return response.data;
      }
      return rejectWithValue(response.message || "Failed to fetch trends");
    } catch (error: any) {
      return rejectWithValue(error.message || "An error occurred");
    }
  },
);

export const fetchReportInsights = createAsyncThunk(
  "reports/fetchInsights",
  async (params: ReportQuery, { rejectWithValue }) => {
    try {
      const response = await reportService.getInsights(params);
      if (response.success && response.data?.insights) {
        return response.data.insights;
      }
      return rejectWithValue(response.message || "Failed to fetch insights");
    } catch (error: any) {
      return rejectWithValue(error.message || "An error occurred");
    }
  },
);

export const fetchAllReports = createAsyncThunk(
  "reports/fetchAll",
  async (params: ReportQuery, { dispatch }) => {
    await Promise.all([
      dispatch(fetchReportOverview(params)),
      dispatch(fetchReportCategories(params)),
      dispatch(fetchReportTrends(params)),
      dispatch(fetchReportInsights(params)),
    ]);
  },
);

// ============ SLICE ============
const reportsSlice = createSlice({
  name: "reports",
  initialState,
  reducers: {
    setPeriod: (state, action) => {
      state.period = action.payload;
    },
    clearReportsError: (state) => {
      state.error = null;
    },
    resetReports: () => initialState,
  },
  extraReducers: (builder) => {
    // Fetch All Reports
    builder
      .addCase(fetchAllReports.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchAllReports.fulfilled, (state) => {
        state.isLoading = false;
      })
      .addCase(fetchAllReports.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || "Failed to fetch reports";
      });

    // Overview
    builder
      .addCase(fetchReportOverview.fulfilled, (state, action) => {
        state.overview = action.payload;
      })
      .addCase(fetchReportOverview.rejected, (state, action) => {
        state.error = action.payload as string;
      });

    // Categories
    builder
      .addCase(fetchReportCategories.fulfilled, (state, action) => {
        state.categories = action.payload.categories;
        state.totalExpenses = action.payload.totalExpenses;
      })
      .addCase(fetchReportCategories.rejected, (state, action) => {
        state.error = action.payload as string;
      });

    // Trends
    builder
      .addCase(fetchReportTrends.fulfilled, (state, action) => {
        state.trends = action.payload;
      })
      .addCase(fetchReportTrends.rejected, (state, action) => {
        state.error = action.payload as string;
      });

    // Insights
    builder
      .addCase(fetchReportInsights.fulfilled, (state, action) => {
        state.insights = action.payload;
      })
      .addCase(fetchReportInsights.rejected, (state, action) => {
        state.error = action.payload as string;
      });
  },
});

export const { setPeriod, clearReportsError, resetReports } =
  reportsSlice.actions;
export default reportsSlice.reducer;
