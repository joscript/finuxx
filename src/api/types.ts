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
export type AccountType =
  | "checking"
  | "savings"
  | "credit"
  | "investment"
  | "wallet"
  | "loan";
export type AccountCategory = "asset" | "liability";

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
export type TransactionType = "income" | "expense" | "transfer";

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
  accountId?: string;
  categoryId?: string;
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
  id: string;
  userId: string;
  name: string;
  targetAmount: string;
  currentAmount: string;
  deadline?: string;
  emoji: string;
  color: string;
  iconBgColor: string;
  linkedAccountId?: string;
  description?: string;
  progress: number;
  createdAt: string;
  updatedAt: string;
  contributions?: GoalContribution[];
}

export interface GoalContribution {
  id: string;
  goalId: string;
  accountId?: string;
  amount: string;
  contributionDate: string;
  note?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateGoalRequest {
  name: string;
  targetAmount: number;
  currentAmount?: number;
  deadline: string;
  emoji: string;
  color: string;
  iconBgColor: string;
  linkedAccountId?: string;
  description?: string;
}

export interface UpdateGoalRequest extends Partial<CreateGoalRequest> {}

export interface AddContributionRequest {
  amount: number;
  accountId?: string;
  contributionDate?: string;
  note?: string;
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
export type BillRecurrence =
  | "once"
  | "weekly"
  | "biweekly"
  | "monthly"
  | "quarterly"
  | "yearly";

export interface Bill {
  id: string;
  userId: string;
  name: string;
  amount: string;
  dueDate: string;
  recurrence: BillRecurrence;
  accountId?: string;
  isPaid: boolean;
  isAutoPay: boolean;
  reminderDaysBefore?: number[];
  notes?: string;
  paidAt?: string;
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
  totalAmount: number;
  paidAmount: number;
  unpaidAmount: number;
}

export interface CreateBillRequest {
  name: string;
  amount: number;
  dueDate: string;
  recurrence: BillRecurrence;
  accountId?: string;
  isPaid?: boolean;
  isAutoPay?: boolean;
  reminderDaysBefore?: number[];
  notes?: string;
}

export interface UpdateBillRequest extends Partial<CreateBillRequest> {}

export interface PayBillRequest {
  paidAmount?: number;
}

// ============ NOTIFICATION TYPES ============
export type NotificationType = "bill" | "alert" | "ai" | "system";

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
  theme: "light" | "dark" | "system";
  notifications: NotificationSettings;
  dateFormat: string;
  startOfWeek: "sunday" | "monday";
  incomeType?: "salary" | "freelance" | "mixed" | null;
  financialGoals?: string[] | null;
  createdAt: string;
  updatedAt: string;
}

export interface UpdateSettingsRequest {
  currency?: string;
  language?: string;
  theme?: "light" | "dark" | "system";
  notifications?: Partial<NotificationSettings>;
  dateFormat?: string;
  startOfWeek?: "sunday" | "monday";
  incomeType?: "salary" | "freelance" | "mixed";
  financialGoals?: string[];
}

// ============ REPORTS ============

export type ReportPeriod = "week" | "month" | "year";

export interface ReportOverview {
  income: number;
  expenses: number;
  savings: number;
  transactionCount: number;
  period: ReportPeriod;
  startDate: string;
  endDate: string;
}

export interface ReportCategory {
  id: string;
  name: string;
  icon: string;
  color: string;
  amount: number;
  count: number;
  percent: number;
}

export interface ReportTrends {
  chartData: number[];
  labels: string[];
  period: ReportPeriod;
}

export interface ReportInsight {
  id: string;
  text: string;
  type: "warning" | "tip" | "success";
}

export interface ReportQuery {
  period?: ReportPeriod;
  startDate?: string;
  endDate?: string;
}

// ============ COACH ============

export interface CoachMessage {
  id: string;
  userId: string;
  type: "user" | "ai" | "suggestion";
  message: string;
  suggestions?: string[] | null;
  createdAt: string;
}

export interface SendCoachMessageRequest {
  message: string;
}

export interface CoachMessageResponse {
  userMessage: CoachMessage;
  aiMessage: CoachMessage;
}
