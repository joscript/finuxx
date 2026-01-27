import { Ionicons } from '@expo/vector-icons';

// ============ ACCOUNT TYPES ============
export type AccountType = 'checking' | 'savings' | 'credit' | 'investment' | 'wallet' | 'loan';
export type AccountCategory = 'asset' | 'liability';

export interface Account {
  id: string;
  name: string;
  type: AccountType;
  category: AccountCategory;
  balance: number;
  currency: string;
  icon: keyof typeof Ionicons.glyphMap;
  iconColor: string;
  iconBgColor: string;
  lastSynced: Date;
  isSyncing?: boolean;
}

// ============ GOAL TYPES ============
export interface GoalContribution {
  id: string;
  goalId: string;
  accountId?: string;
  accountName?: string;
  amount: number;
  date: Date;
  note?: string;
}

export interface Goal {
  id: string;
  name: string;
  emoji: string;
  targetAmount: number;
  currentAmount: number;
  deadline: string;
  monthsLeft: number;
  monthlyContribution: number;
  color: string;
  iconBgColor: string;
  linkedAccountId?: string;
  contributions: GoalContribution[];
}

// ============ TRANSACTION TYPES ============
export interface Transaction {
  id: string;
  type: 'income' | 'expense';
  category: string;
  categoryIcon: keyof typeof Ionicons.glyphMap;
  categoryColor: string;
  merchant: string;
  note?: string;
  amount: number;
  date: string;
  isRecurring?: boolean;
  hasReceipt?: boolean;
  accountId?: string;
  accountName?: string;
  goalId?: string; // For goal contributions tracked as transactions
}
