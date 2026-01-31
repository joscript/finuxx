// Auth
export {
  default as authReducer,
  checkAuth,
  login,
  register,
  logout,
  updateProfile,
  updatePassword,
  refreshUser,
  clearError,
  setUser,
} from './authSlice';

// Accounts
export {
  default as accountsReducer,
  fetchAccounts,
  createAccount,
  updateAccount,
  deleteAccount,
  clearAccountsError,
  resetAccounts,
} from './accountsSlice';

// Transactions
export {
  default as transactionsReducer,
  fetchTransactions,
  fetchTransactionSummary,
  createTransaction,
  updateTransaction,
  deleteTransaction,
  clearTransactionsError,
  setFilters,
  resetTransactions,
} from './transactionsSlice';

// Goals
export {
  default as goalsReducer,
  fetchGoals,
  fetchGoalById,
  createGoal,
  updateGoal,
  deleteGoal,
  addContribution,
  clearGoalsError,
  setSelectedGoal,
  clearSelectedGoal,
  resetGoals,
} from './goalsSlice';

// Budgets
export {
  default as budgetsReducer,
  fetchBudgets,
  fetchCurrentBudget,
  createBudget,
  updateBudget,
  deleteBudget,
  clearBudgetsError,
  resetBudgets,
} from './budgetsSlice';

// Bills
export {
  default as billsReducer,
  fetchBills,
  createBill,
  updateBill,
  deleteBill,
  markBillAsPaid,
  clearBillsError,
  resetBills,
} from './billsSlice';

// Notifications
export {
  default as notificationsReducer,
  fetchNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteNotification,
  clearNotificationsError,
  resetNotifications,
} from './notificationsSlice';

// Settings
export {
  default as settingsReducer,
  fetchSettings,
  updateSettings,
  clearSettingsError,
  resetSettings,
} from './settingsSlice';

// Categories
export {
  default as categoriesReducer,
  fetchCategories,
  createCategory,
  updateCategory,
  deleteCategory,
  clearCategoriesError,
  resetCategories,
} from './categoriesSlice';
