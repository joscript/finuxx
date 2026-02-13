import { apiClient } from '../client';
import { ENDPOINTS } from '../config';
import {
  Category,
  CreateCategoryRequest,
  UpdateCategoryRequest,
} from '../types';

class CategoryService {
  /**
   * Get all categories (system + user), optionally filtered by type
   */
  async getAll(params?: { type?: 'income' | 'expense' }): Promise<{ success: boolean; data?: { categories: Category[] }; message?: string }> {
    const query = params?.type ? `?type=${params.type}` : '';
    return apiClient.get<{ categories: Category[] }>(`${ENDPOINTS.CATEGORIES}${query}`);
  }

  /**
   * Get single category by ID
   */
  async getById(id: string): Promise<{ success: boolean; data?: { category: Category }; message?: string }> {
    return apiClient.get<{ category: Category }>(`${ENDPOINTS.CATEGORIES}/${id}`);
  }

  /**
   * Create a new custom category
   */
  async create(data: CreateCategoryRequest): Promise<{ success: boolean; data?: { category: Category }; message?: string }> {
    return apiClient.post<{ category: Category }>(ENDPOINTS.CATEGORIES, data);
  }

  /**
   * Update a user's custom category
   */
  async update(id: string, data: UpdateCategoryRequest): Promise<{ success: boolean; data?: { category: Category }; message?: string }> {
    return apiClient.put<{ category: Category }>(`${ENDPOINTS.CATEGORIES}/${id}`, data);
  }

  /**
   * Delete a user's custom category
   */
  async delete(id: string): Promise<{ success: boolean; message?: string }> {
    return apiClient.delete(`${ENDPOINTS.CATEGORIES}/${id}`);
  }
}

export const categoryService = new CategoryService();
