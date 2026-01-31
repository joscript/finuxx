import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { notificationService, Notification } from '../../api';

// ============ STATE TYPE ============
interface NotificationsState {
  notifications: Notification[];
  unreadCount: number;
  isLoading: boolean;
  error: string | null;
}

const initialState: NotificationsState = {
  notifications: [],
  unreadCount: 0,
  isLoading: false,
  error: null,
};

// ============ ASYNC THUNKS ============

export const fetchNotifications = createAsyncThunk(
  'notifications/fetchNotifications',
  async (_, { rejectWithValue }) => {
    try {
      const response = await notificationService.getAll();
      
      if (response.success && response.data) {
        const notifications = response.data.notifications || [];
        const unreadCount = notifications.filter((n: Notification) => !n.isRead).length;
        return {
          notifications,
          unreadCount,
        };
      }
      
      return rejectWithValue(response.message || 'Failed to fetch notifications');
    } catch (error: any) {
      return rejectWithValue(error.message || 'An error occurred');
    }
  }
);

export const markNotificationAsRead = createAsyncThunk(
  'notifications/markAsRead',
  async (id: number, { rejectWithValue }) => {
    try {
      const response = await notificationService.markAsRead(id);
      
      if (response.success) {
        return id;
      }
      
      return rejectWithValue(response.message || 'Failed to mark as read');
    } catch (error: any) {
      return rejectWithValue(error.message || 'An error occurred');
    }
  }
);

export const markAllNotificationsAsRead = createAsyncThunk(
  'notifications/markAllAsRead',
  async (_, { rejectWithValue }) => {
    try {
      const response = await notificationService.markAllAsRead();
      
      if (response.success) {
        return true;
      }
      
      return rejectWithValue(response.message || 'Failed to mark all as read');
    } catch (error: any) {
      return rejectWithValue(error.message || 'An error occurred');
    }
  }
);

export const deleteNotification = createAsyncThunk(
  'notifications/deleteNotification',
  async (id: number, { rejectWithValue }) => {
    try {
      const response = await notificationService.delete(id);
      
      if (response.success) {
        return id;
      }
      
      return rejectWithValue(response.message || 'Failed to delete notification');
    } catch (error: any) {
      return rejectWithValue(error.message || 'An error occurred');
    }
  }
);

// ============ SLICE ============
const notificationsSlice = createSlice({
  name: 'notifications',
  initialState,
  reducers: {
    clearNotificationsError: (state) => {
      state.error = null;
    },
    resetNotifications: (state) => {
      state.notifications = [];
      state.unreadCount = 0;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // Fetch Notifications
    builder
      .addCase(fetchNotifications.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchNotifications.fulfilled, (state, action) => {
        state.isLoading = false;
        state.notifications = action.payload.notifications;
        state.unreadCount = action.payload.unreadCount;
        state.error = null;
      })
      .addCase(fetchNotifications.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Mark as Read
    builder
      .addCase(markNotificationAsRead.fulfilled, (state, action) => {
        const notification = state.notifications.find((n) => n.id === action.payload);
        if (notification && !notification.isRead) {
          notification.isRead = true;
          state.unreadCount = Math.max(0, state.unreadCount - 1);
        }
      })
      .addCase(markNotificationAsRead.rejected, (state, action) => {
        state.error = action.payload as string;
      });

    // Mark All as Read
    builder
      .addCase(markAllNotificationsAsRead.fulfilled, (state) => {
        state.notifications.forEach((n) => {
          n.isRead = true;
        });
        state.unreadCount = 0;
      })
      .addCase(markAllNotificationsAsRead.rejected, (state, action) => {
        state.error = action.payload as string;
      });

    // Delete Notification
    builder
      .addCase(deleteNotification.fulfilled, (state, action) => {
        const notification = state.notifications.find((n) => n.id === action.payload);
        if (notification && !notification.isRead) {
          state.unreadCount = Math.max(0, state.unreadCount - 1);
        }
        state.notifications = state.notifications.filter((n) => n.id !== action.payload);
      })
      .addCase(deleteNotification.rejected, (state, action) => {
        state.error = action.payload as string;
      });
  },
});

export const { clearNotificationsError, resetNotifications } = notificationsSlice.actions;
export default notificationsSlice.reducer;
