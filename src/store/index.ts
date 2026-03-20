import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./slices/authSlice";
import accountsReducer from "./slices/accountsSlice";
import transactionsReducer from "./slices/transactionsSlice";
import goalsReducer from "./slices/goalsSlice";
import budgetsReducer from "./slices/budgetsSlice";
import billsReducer from "./slices/billsSlice";
import notificationsReducer from "./slices/notificationsSlice";
import settingsReducer from "./slices/settingsSlice";
import categoriesReducer from "./slices/categoriesSlice";
import reportsReducer from "./slices/reportsSlice";
import coachReducer from "./slices/coachSlice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    accounts: accountsReducer,
    transactions: transactionsReducer,
    goals: goalsReducer,
    budgets: budgetsReducer,
    bills: billsReducer,
    notifications: notificationsReducer,
    settings: settingsReducer,
    categories: categoriesReducer,
    reports: reportsReducer,
    coach: coachReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // Ignore these action types
        ignoredActions: ["persist/PERSIST", "persist/REHYDRATE"],
      },
    }),
});

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
