import { apiClient } from '../client';
import { ENDPOINTS } from '../config';
import {
  Goal,
  GoalContribution,
  CreateGoalRequest,
  UpdateGoalRequest,
  AddContributionRequest,
} from '../types';

class GoalService {
  /**
   * Get all goals with progress
   */
  async getAll(): Promise<{ success: boolean; data?: { goals: Goal[] }; message?: string }> {
    return apiClient.get<{ goals: Goal[] }>(ENDPOINTS.GOALS);
  }

  /**
   * Get single goal by ID with contributions
   */
  async getById(id: number): Promise<{ success: boolean; data?: { goal: Goal }; message?: string }> {
    return apiClient.get<{ goal: Goal }>(`${ENDPOINTS.GOALS}/${id}`);
  }

  /**
   * Create a new goal
   */
  async create(data: CreateGoalRequest): Promise<{ success: boolean; data?: { goal: Goal }; message?: string }> {
    return apiClient.post<{ goal: Goal }>(ENDPOINTS.GOALS, data);
  }

  /**
   * Update a goal
   */
  async update(id: number, data: UpdateGoalRequest): Promise<{ success: boolean; data?: { goal: Goal }; message?: string }> {
    return apiClient.put<{ goal: Goal }>(`${ENDPOINTS.GOALS}/${id}`, data);
  }

  /**
   * Delete a goal
   */
  async delete(id: number): Promise<{ success: boolean; message?: string }> {
    return apiClient.delete(`${ENDPOINTS.GOALS}/${id}`);
  }

  /**
   * Get all contributions for a goal
   */
  async getContributions(goalId: number): Promise<{ success: boolean; data?: { contributions: GoalContribution[] }; message?: string }> {
    return apiClient.get<{ contributions: GoalContribution[] }>(`${ENDPOINTS.GOALS}/${goalId}/contributions`);
  }

  /**
   * Add a contribution to a goal
   */
  async addContribution(
    goalId: number,
    data: AddContributionRequest
  ): Promise<{ 
    success: boolean; 
    data?: { 
      contribution: GoalContribution; 
      goal: { currentAmount: string; progress: number } 
    }; 
    message?: string 
  }> {
    return apiClient.post(`${ENDPOINTS.GOALS}/${goalId}/contributions`, data);
  }
}

export const goalService = new GoalService();
