// Budget component types
import { Budget as ApiBudget, BudgetCategory as ApiBudgetCategory } from '../../api';

// Re-export API types for convenience
export type { ApiBudget, ApiBudgetCategory };

// UI representation of a budget category (transformed from API data)
export interface UIBudgetCategory {
  id: string;
  categoryId: string;
  name: string;
  icon: string;
  spent: number;
  budget: number;
  color: string;
  iconBgColor: string;
}

export interface AvailableCategory {
  name: string;
  icon: string;
  color: string;
  iconBgColor: string;
  categoryId?: string; // API category ID (UUID)
}

export type BudgetPeriod = 'monthly' | 'weekly';

// Helper to transform API budget category to UI format
export function transformBudgetCategory(apiCategory: ApiBudgetCategory, index: number): UIBudgetCategory {
  return {
    id: apiCategory.id?.toString() || `cat-${index}`,
    categoryId: apiCategory.categoryId,
    name: apiCategory.category?.name || apiCategory.name || 'Category',
    icon: apiCategory.category?.icon || apiCategory.icon || 'ellipsis-horizontal-outline',
    spent: apiCategory.spent || 0,
    budget: parseFloat(apiCategory.allocatedAmount) || 0,
    color: apiCategory.category?.color || apiCategory.color || '#6b7280',
    iconBgColor: apiCategory.iconBgColor || getIconBgColor(apiCategory.category?.color || apiCategory.color),
  };
}

// Helper to get background color class based on icon color
function getIconBgColor(color?: string): string {
  if (!color) return 'bg-gray-100 dark:bg-gray-500/20';
  
  const colorMap: Record<string, string> = {
    '#22c55e': 'bg-emerald-100 dark:bg-emerald-500/20',
    '#4CAF50': 'bg-green-100 dark:bg-green-500/20',
    '#10b981': 'bg-green-100 dark:bg-green-500/20',
    '#f59e0b': 'bg-amber-100 dark:bg-amber-500/20',
    '#ef4444': 'bg-red-100 dark:bg-red-500/20',
    '#8b5cf6': 'bg-violet-100 dark:bg-violet-500/20',
    '#3b82f6': 'bg-blue-100 dark:bg-blue-500/20',
    '#ec4899': 'bg-pink-100 dark:bg-pink-500/20',
    '#06b6d4': 'bg-cyan-100 dark:bg-cyan-500/20',
    '#a855f7': 'bg-purple-100 dark:bg-purple-500/20',
    '#6366f1': 'bg-indigo-100 dark:bg-indigo-500/20',
    '#0ea5e9': 'bg-sky-100 dark:bg-sky-500/20',
    '#f43f5e': 'bg-rose-100 dark:bg-rose-500/20',
    '#14b8a6': 'bg-teal-100 dark:bg-teal-500/20',
  };
  
  return colorMap[color] || 'bg-gray-100 dark:bg-gray-500/20';
}
