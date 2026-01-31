import { apiClient } from '../client';
import { ENDPOINTS } from '../config';
import {
  Category,
  CreateCategoryRequest,
  UpdateCategoryRequest,
} from '../types';

class CategoryService {
  /**
   * Get all categories
   */
  async getAll(): Promise<{ success: boolean; data?: { categories: Category[] }; message?: string }> {
    return apiClient.get<{ categories: Category[] }>(ENDPOINTS.CATEGORIES);
  }

  /**
   * Get single category by ID
   */
  async getById(id: number): Promise<{ success: boolean; data?: { category: Category }; message?: string }> {
    return apiClient.get<{ category: Category }>(`${ENDPOINTS.CATEGORIES}/${id}`);
  }

  /**
   * Create a new category
   */
  async create(data: CreateCategoryRequest): Promise<{ success: boolean; data?: { category: Category }; message?: string }> {
    return apiClient.post<{ category: Category }>(ENDPOINTS.CATEGORIES, data);
  }

  /**
   * Update a category
   */
  async update(id: number, data: UpdateCategoryRequest): Promise<{ success: boolean; data?: { category: Category }; message?: string }> {
    return apiClient.put<{ category: Category }>(`${ENDPOINTS.CATEGORIES}/${id}`, data);
  }

  /**
   * Delete a category
   */
  async delete(id: number): Promise<{ success: boolean; message?: string }> {
    return apiClient.delete(`${ENDPOINTS.CATEGORIES}/${id}`);
  }
}

export const categoryService = new CategoryService();
