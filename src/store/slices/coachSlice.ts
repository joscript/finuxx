import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { coachService, CoachMessage } from "../../api";

// ============ STATE TYPE ============
interface CoachState {
  messages: CoachMessage[];
  isLoading: boolean;
  isSending: boolean;
  error: string | null;
}

const initialState: CoachState = {
  messages: [],
  isLoading: false,
  isSending: false,
  error: null,
};

// ============ ASYNC THUNKS ============

export const fetchCoachMessages = createAsyncThunk(
  "coach/fetchMessages",
  async (
    params: { limit?: number; before?: string } | undefined,
    { rejectWithValue },
  ) => {
    try {
      const response = await coachService.getMessages(params || {});
      if (response.success && response.data?.messages) {
        return response.data.messages;
      }
      return rejectWithValue(response.message || "Failed to fetch messages");
    } catch (error: any) {
      return rejectWithValue(error.message || "An error occurred");
    }
  },
);

export const sendCoachMessage = createAsyncThunk(
  "coach/sendMessage",
  async (message: string, { rejectWithValue }) => {
    try {
      const response = await coachService.sendMessage(message);
      if (response.success && response.data) {
        return response.data;
      }
      return rejectWithValue(response.message || "Failed to send message");
    } catch (error: any) {
      return rejectWithValue(error.message || "An error occurred");
    }
  },
);

export const clearCoachHistory = createAsyncThunk(
  "coach/clearHistory",
  async (_, { rejectWithValue }) => {
    try {
      const response = await coachService.clearHistory();
      if (response.success) {
        return true;
      }
      return rejectWithValue(response.message || "Failed to clear history");
    } catch (error: any) {
      return rejectWithValue(error.message || "An error occurred");
    }
  },
);

// ============ SLICE ============
const coachSlice = createSlice({
  name: "coach",
  initialState,
  reducers: {
    clearCoachError: (state) => {
      state.error = null;
    },
    resetCoach: () => initialState,
  },
  extraReducers: (builder) => {
    // Fetch Messages
    builder
      .addCase(fetchCoachMessages.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchCoachMessages.fulfilled, (state, action) => {
        state.isLoading = false;
        state.messages = action.payload;
      })
      .addCase(fetchCoachMessages.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Send Message
    builder
      .addCase(sendCoachMessage.pending, (state) => {
        state.isSending = true;
        state.error = null;
      })
      .addCase(sendCoachMessage.fulfilled, (state, action) => {
        state.isSending = false;
        state.messages.push(action.payload.userMessage);
        state.messages.push(action.payload.aiMessage);
      })
      .addCase(sendCoachMessage.rejected, (state, action) => {
        state.isSending = false;
        state.error = action.payload as string;
      });

    // Clear History
    builder.addCase(clearCoachHistory.fulfilled, (state) => {
      state.messages = [];
    });
  },
});

export const { clearCoachError, resetCoach } = coachSlice.actions;
export default coachSlice.reducer;
