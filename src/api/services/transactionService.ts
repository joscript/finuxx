import { apiClient } from '../client';
import { ENDPOINTS } from '../config';
import {
  Transaction,
  TransactionSummary,
  CreateTransactionRequest,
  UpdateTransactionRequest,
  TransactionFilters,
} from '../types';

export interface TransactionsResponse {
  transactions: Transaction[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

class TransactionService {
  /**
   * Get all transactions with filters and pagination
   */
  async getAll(filters?: TransactionFilters): Promise<{ success: boolean; data?: Transaction[]; pagination?: TransactionsResponse['pagination']; message?: string }> {
    let endpoint = ENDPOINTS.TRANSACTIONS;
    
    if (filters) {
      const params = new URLSearchParams();
      if (filters.page) params.append('page', filters.page.toString());
      if (filters.limit) params.append('limit', filters.limit.toString());
      if (filters.type) params.append('type', filters.type);
      if (filters.categoryId) params.append('categoryId', filters.categoryId.toString());
      if (filters.accountId) params.append('accountId', filters.accountId.toString());
      if (filters.startDate) params.append('startDate', filters.startDate);
      if (filters.endDate) params.append('endDate', filters.endDate);
      if (filters.search) params.append('search', filters.search);
      
      const queryString = params.toString();
      if (queryString) {
        endpoint += `?${queryString}`;
      }
    }
    
    return apiClient.get(endpoint);
  }

  /**
   * Get transaction summary/statistics
   */
  async getSummary(): Promise<{ success: boolean; data?: { summary: TransactionSummary }; message?: string }> {
    return apiClient.get<{ summary: TransactionSummary }>(ENDPOINTS.TRANSACTIONS_SUMMARY);
  }

  /**
   * Get single transaction by ID
   */
  async getById(id: number): Promise<{ success: boolean; data?: { transaction: Transaction }; message?: string }> {
    return apiClient.get<{ transaction: Transaction }>(`${ENDPOINTS.TRANSACTIONS}/${id}`);
  }

  /**
   * Create a new transaction
   */
  async create(data: CreateTransactionRequest): Promise<{ success: boolean; data?: { transaction: Transaction }; message?: string }> {
    return apiClient.post<{ transaction: Transaction }>(ENDPOINTS.TRANSACTIONS, data);
  }

  /**
   * Update a transaction
   */
  async update(id: number, data: UpdateTransactionRequest): Promise<{ success: boolean; data?: { transaction: Transaction }; message?: string }> {
    return apiClient.put<{ transaction: Transaction }>(`${ENDPOINTS.TRANSACTIONS}/${id}`, data);
  }

  /**
   * Delete a transaction
   */
  async delete(id: number): Promise<{ success: boolean; message?: string }> {
    return apiClient.delete(`${ENDPOINTS.TRANSACTIONS}/${id}`);
  }
}

export const transactionService = new TransactionService();
