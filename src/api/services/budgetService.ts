import { apiClient } from '../client';
import { ENDPOINTS } from '../config';
import {
  Budget,
  CreateBudgetRequest,
  UpdateBudgetRequest,
} from '../types';

class BudgetService {
  /**
   * Get all budgets
   */
  async getAll(): Promise<{ success: boolean; data?: { budgets: Budget[] }; message?: string }> {
    return apiClient.get<{ budgets: Budget[] }>(ENDPOINTS.BUDGETS);
  }

  /**
   * Get current/active budget with spending breakdown
   */
  async getCurrent(): Promise<{ success: boolean; data?: { budget: Budget }; message?: string }> {
    return apiClient.get<{ budget: Budget }>(ENDPOINTS.BUDGETS_CURRENT);
  }

  /**
   * Get single budget by ID
   */
  async getById(id: number): Promise<{ success: boolean; data?: { budget: Budget }; message?: string }> {
    return apiClient.get<{ budget: Budget }>(`${ENDPOINTS.BUDGETS}/${id}`);
  }

  /**
   * Create a new budget with category allocations
   */
  async create(data: CreateBudgetRequest): Promise<{ success: boolean; data?: { budget: Budget }; message?: string }> {
    return apiClient.post<{ budget: Budget }>(ENDPOINTS.BUDGETS, data);
  }

  /**
   * Update a budget
   */
  async update(id: number, data: UpdateBudgetRequest): Promise<{ success: boolean; data?: { budget: Budget }; message?: string }> {
    return apiClient.put<{ budget: Budget }>(`${ENDPOINTS.BUDGETS}/${id}`, data);
  }

  /**
   * Delete a budget
   */
  async delete(id: number): Promise<{ success: boolean; message?: string }> {
    return apiClient.delete(`${ENDPOINTS.BUDGETS}/${id}`);
  }
}

export const budgetService = new BudgetService();
