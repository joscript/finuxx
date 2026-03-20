import { Ionicons } from "@expo/vector-icons";

// ============ TYPES ============
export interface Account {
  id: string;
  name: string;
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
  balance: number;
}

export interface Transaction {
  id: string;
  type: "income" | "expense";
  category: string;
  categoryId?: string;
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
}

export interface TransactionGroup {
  date: string;
  dateLabel: string;
  data: Transaction[];
}

export interface FilterOptions {
  type: "all" | "income" | "expense";
  categories: string[];
  showRecurringOnly: boolean;
  minAmount: string;
  maxAmount: string;
}

export const DEFAULT_FILTERS: FilterOptions = {
  type: "all",
  categories: [],
  showRecurringOnly: false,
  minAmount: "",
  maxAmount: "",
};

// ============ CONSTANTS ============
export const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

export const CATEGORY_OPTIONS = [
  {
    id: "food",
    name: "Food & Dining",
    icon: "restaurant-outline" as const,
    color: "#f97316",
  },
  {
    id: "transport",
    name: "Transportation",
    icon: "car-outline" as const,
    color: "#3b82f6",
  },
  {
    id: "shopping",
    name: "Shopping",
    icon: "bag-outline" as const,
    color: "#ec4899",
  },
  {
    id: "bills",
    name: "Bills & Utilities",
    icon: "flash-outline" as const,
    color: "#f59e0b",
  },
  {
    id: "entertainment",
    name: "Entertainment",
    icon: "game-controller-outline" as const,
    color: "#8b5cf6",
  },
  {
    id: "health",
    name: "Health",
    icon: "medical-outline" as const,
    color: "#ef4444",
  },
  {
    id: "groceries",
    name: "Groceries",
    icon: "cart-outline" as const,
    color: "#10b981",
  },
  {
    id: "salary",
    name: "Salary",
    icon: "briefcase-outline" as const,
    color: "#22c55e",
  },
  {
    id: "freelance",
    name: "Freelance",
    icon: "laptop-outline" as const,
    color: "#06b6d4",
  },
  {
    id: "investment",
    name: "Investment",
    icon: "trending-up-outline" as const,
    color: "#22c55e",
  },
  {
    id: "other",
    name: "Other",
    icon: "ellipsis-horizontal-outline" as const,
    color: "#6b7280",
  },
];

export const ACCOUNT_OPTIONS: Account[] = [
  {
    id: "cash",
    name: "Cash",
    icon: "cash-outline",
    color: "#22c55e",
    balance: 5000,
  },
  {
    id: "gcash",
    name: "GCash",
    icon: "phone-portrait-outline",
    color: "#007bff",
    balance: 12500,
  },
  {
    id: "maya",
    name: "Maya",
    icon: "wallet-outline",
    color: "#6366f1",
    balance: 8750,
  },
  {
    id: "bpi",
    name: "BPI Savings",
    icon: "business-outline",
    color: "#ef4444",
    balance: 45000,
  },
  {
    id: "bdo",
    name: "BDO Checking",
    icon: "card-outline",
    color: "#f59e0b",
    balance: 23000,
  },
  {
    id: "credit",
    name: "Credit Card",
    icon: "card-outline",
    color: "#8b5cf6",
    balance: -15000,
  },
];

// ============ HELPER FUNCTIONS ============
export function formatCurrency(amount: number): string {
  return `₱${amount.toLocaleString()}`;
}

export function formatDateLabel(dateString: string): string {
  const date = new Date(dateString);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  if (date.toDateString() === today.toDateString()) {
    return "Today";
  }
  if (date.toDateString() === yesterday.toDateString()) {
    return "Yesterday";
  }

  return date.toLocaleDateString("en-US", {
    weekday: "long",
    month: "short",
    day: "numeric",
  });
}

export function groupTransactionsByDate(
  transactions: Transaction[],
): TransactionGroup[] {
  const groups: { [key: string]: Transaction[] } = {};

  transactions.forEach((transaction) => {
    if (!groups[transaction.date]) {
      groups[transaction.date] = [];
    }
    groups[transaction.date].push(transaction);
  });

  return Object.keys(groups)
    .sort((a, b) => new Date(b).getTime() - new Date(a).getTime())
    .map((date) => ({
      date,
      dateLabel: formatDateLabel(date),
      data: groups[date],
    }));
}
