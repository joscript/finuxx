// API Configuration
export const API_CONFIG = {
  BASE_URL: "http://localhost:3001/api/v1",
  TIMEOUT: 30000, // 30 seconds
};

// API Endpoints
export const ENDPOINTS = {
  // Health
  HEALTH: "/health",

  // Auth
  AUTH: {
    REGISTER: "/auth/register",
    LOGIN: "/auth/login",
    REFRESH_TOKEN: "/auth/refresh-token",
    ME: "/auth/me",
    UPDATE_PASSWORD: "/auth/update-password",
    LOGOUT: "/auth/logout",
    PUSH_TOKEN: "/auth/push-token",
  },

  // Accounts
  ACCOUNTS: "/accounts",

  // Transactions
  TRANSACTIONS: "/transactions",
  TRANSACTIONS_SUMMARY: "/transactions/summary",

  // Categories
  CATEGORIES: "/categories",

  // Goals
  GOALS: "/goals",

  // Budgets
  BUDGETS: "/budgets",
  BUDGETS_CURRENT: "/budgets/current",

  // Bills
  BILLS: "/bills",

  // Notifications
  NOTIFICATIONS: "/notifications",
  NOTIFICATIONS_UNREAD_COUNT: "/notifications/unread-count",
  NOTIFICATIONS_READ_ALL: "/notifications/read-all",

  // Settings
  SETTINGS: "/settings",

  // Reports
  REPORTS: {
    OVERVIEW: "/reports/overview",
    CATEGORIES: "/reports/categories",
    TRENDS: "/reports/trends",
    INSIGHTS: "/reports/insights",
  },

  // Coach
  COACH_MESSAGES: "/coach/messages",
};
