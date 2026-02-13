// ============ USER TYPES ============
export interface User {
  id: number;
  name: string;
  email: string;
  createdAt: string;
  updatedAt: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

// ============ ACCOUNT TYPES ============
export type AccountType = 'checking' | 'savings' | 'credit' | 'investment' | 'wallet' | 'loan';
export type AccountCategory = 'asset' | 'liability';

export interface Account {
  id: number;
  userId: number;
  name: string;
  type: AccountType;
  category: AccountCategory;
  balance: string;
  currency: string;
  icon?: string;
  iconColor?: string;
  iconBgColor?: string;
  institution?: string;
  accountNumber?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AccountTotals {
  totalAssets: number;
  totalLiabilities: number;
  netWorth: number;
}

export interface CreateAccountRequest {
  name: string;
  type: AccountType;
  category: AccountCategory;
  balance?: number;
  currency?: string;
  icon?: string;
  iconColor?: string;
  iconBgColor?: string;
  institution?: string;
  accountNumber?: string;
  notes?: string;
}

export interface UpdateAccountRequest extends Partial<CreateAccountRequest> {}

// ============ TRANSACTION TYPES ============
export type TransactionType = 'income' | 'expense' | 'transfer';

export interface Transaction {
  id: number;
  userId: number;
  accountId: number;
  categoryId?: number;
  type: TransactionType;
  amount: string;
  merchant?: string;
  description?: string;
  transactionDate: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  category?: Category;
  account?: Account;
}

export interface TransactionSummary {
  totalIncome: number;
  totalExpenses: number;
  netFlow: number;
  transactionCount: number;
  averageTransaction: number;
}

export interface CreateTransactionRequest {
  accountId: number;
  categoryId?: number;
  type: TransactionType;
  amount: number;
  merchant?: string;
  description?: string;
  transactionDate: string;
  notes?: string;
}

export interface UpdateTransactionRequest extends Partial<CreateTransactionRequest> {}

export interface TransactionFilters {
  page?: number;
  limit?: number;
  type?: TransactionType;
  categoryId?: number;
  accountId?: number;
  startDate?: string;
  endDate?: string;
  search?: string;
}

// ============ CATEGORY TYPES ============
export interface Category {
  id: string;
  userId?: string;
  name: string;
  icon: string;
  color: string;
  isIncomeCategory: boolean;
  isSystemDefault: boolean;
  isUserCategory: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateCategoryRequest {
  name: string;
  icon: string;
  color: string;
  isIncomeCategory?: boolean;
}

export interface UpdateCategoryRequest {
  name?: string;
  icon?: string;
  color?: string;
  isIncomeCategory?: boolean;
}

// ============ GOAL TYPES ============
export interface Goal {
  id: number;
  userId: number;
  name: string;
  targetAmount: string;
  currentAmount: string;
  deadline?: string;
  icon?: string;
  iconColor?: string;
  linkedAccountId?: number;
  description?: string;
  progress: number;
  createdAt: string;
  updatedAt: string;
  contributions?: GoalContribution[];
}

export interface GoalContribution {
  id: number;
  goalId: number;
  accountId?: number;
  amount: string;
  contributionDate: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateGoalRequest {
  name: string;
  targetAmount: number;
  currentAmount?: number;
  deadline?: string;
  icon?: string;
  iconColor?: string;
  linkedAccountId?: number;
  description?: string;
}

export interface UpdateGoalRequest extends Partial<CreateGoalRequest> {}

export interface AddContributionRequest {
  amount: number;
  accountId?: number;
  contributionDate?: string;
  notes?: string;
}

// ============ BUDGET TYPES ============
export interface Budget {
  id: string;
  userId: string;
  name: string;
  totalAmount: string;
  startDate: string;
  endDate: string;
  createdAt: string;
  updatedAt: string;
  categories?: BudgetCategory[];
  // Calculated fields from GET /budgets/current
  totalSpent?: number;
  totalRemaining?: number;
  percentageUsed?: number;
}

export interface BudgetCategory {
  id: string;
  budgetId: string;
  categoryId: string;
  allocatedAmount: string;
  name: string;
  icon: string;
  color: string;
  iconBgColor: string;
  // Calculated spending fields from GET /budgets/current
  spent?: number;
  remaining?: number;
  percentage?: number;
  category?: Category;
}

export interface BudgetCategoryAllocation {
  categoryId: string;
  allocatedAmount: number;
  name: string;
  icon: string;
  color: string;
  iconBgColor: string;
}

export interface CreateBudgetRequest {
  name: string;
  totalAmount: number;
  startDate: string;
  endDate: string;
  categories?: BudgetCategoryAllocation[];
}

export interface UpdateBudgetRequest {
  name?: string;
  totalAmount?: number;
  startDate?: string;
  endDate?: string;
  categories?: BudgetCategoryAllocation[];
}

// ============ BILL TYPES ============
export type BillFrequency = 'once' | 'weekly' | 'biweekly' | 'monthly' | 'quarterly' | 'yearly';

export interface Bill {
  id: number;
  userId: number;
  name: string;
  amount: string;
  dueDate: string;
  frequency: BillFrequency;
  accountId?: number;
  isPaid: boolean;
  isAutoPay: boolean;
  reminderDays?: number;
  notes?: string;
  paidDate?: string;
  paidAmount?: string;
  createdAt: string;
  updatedAt: string;
  account?: Account;
}

export interface BillSummary {
  total: number;
  paid: number;
  unpaid: number;
  overdue: number;
  paidAmount: number;
  unpaidAmount: number;
}

export interface CreateBillRequest {
  name: string;
  amount: number;
  dueDate: string;
  frequency: BillFrequency;
  accountId?: number;
  isPaid?: boolean;
  isAutoPay?: boolean;
  reminderDays?: number;
  notes?: string;
}

export interface UpdateBillRequest extends Partial<CreateBillRequest> {}

export interface PayBillRequest {
  paidDate?: string;
  paidAmount?: number;
}

// ============ NOTIFICATION TYPES ============
export type NotificationType = 'bill_reminder' | 'budget_alert' | 'goal_update' | 'general';

export interface Notification {
  id: number;
  userId: number;
  type: NotificationType;
  title: string;
  message: string;
  isRead: boolean;
  data?: Record<string, any>;
  createdAt: string;
}

// ============ SETTINGS TYPES ============
export interface NotificationSettings {
  email: boolean;
  push: boolean;
  billReminders: boolean;
  budgetAlerts: boolean;
  goalUpdates: boolean;
}

export interface Settings {
  id: number;
  userId: number;
  currency: string;
  language: string;
  theme: 'light' | 'dark' | 'system';
  notifications: NotificationSettings;
  dateFormat: string;
  startOfWeek: 'sunday' | 'monday';
  createdAt: string;
  updatedAt: string;
}

export interface UpdateSettingsRequest {
  currency?: string;
  language?: string;
  theme?: 'light' | 'dark' | 'system';
  notifications?: Partial<NotificationSettings>;
  dateFormat?: string;
  startOfWeek?: 'sunday' | 'monday';
}
