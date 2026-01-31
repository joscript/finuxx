import { apiClient } from '../client';
import { ENDPOINTS } from '../config';
import {
  Account,
  AccountTotals,
  CreateAccountRequest,
  UpdateAccountRequest,
} from '../types';

export interface AccountsResponse {
  accounts: Account[];
  totals: AccountTotals;
}

export interface AccountFilters {
  type?: string;
  category?: 'asset' | 'liability';
}

class AccountService {
  /**
   * Get all accounts with totals
   */
  async getAll(filters?: AccountFilters): Promise<{ success: boolean; data?: AccountsResponse; message?: string }> {
    let endpoint = ENDPOINTS.ACCOUNTS;
    
    if (filters) {
      const params = new URLSearchParams();
      if (filters.type) params.append('type', filters.type);
      if (filters.category) params.append('category', filters.category);
      
      const queryString = params.toString();
      if (queryString) {
        endpoint += `?${queryString}`;
      }
    }
    
    return apiClient.get<AccountsResponse>(endpoint);
  }

  /**
   * Get single account by ID with recent transactions
   */
  async getById(id: number): Promise<{ success: boolean; data?: { account: Account }; message?: string }> {
    return apiClient.get<{ account: Account }>(`${ENDPOINTS.ACCOUNTS}/${id}`);
  }

  /**
   * Create a new account
   */
  async create(data: CreateAccountRequest): Promise<{ success: boolean; data?: { account: Account }; message?: string }> {
    return apiClient.post<{ account: Account }>(ENDPOINTS.ACCOUNTS, data);
  }

  /**
   * Update an account
   */
  async update(id: number, data: UpdateAccountRequest): Promise<{ success: boolean; data?: { account: Account }; message?: string }> {
    return apiClient.put<{ account: Account }>(`${ENDPOINTS.ACCOUNTS}/${id}`, data);
  }

  /**
   * Delete an account
   */
  async delete(id: number): Promise<{ success: boolean; message?: string }> {
    return apiClient.delete(`${ENDPOINTS.ACCOUNTS}/${id}`);
  }
}

export const accountService = new AccountService();
