import { apiClient } from "../client";
import { ENDPOINTS } from "../config";
import {
  Goal,
  GoalContribution,
  CreateGoalRequest,
  UpdateGoalRequest,
  AddContributionRequest,
} from "../types";

class GoalService {
  /**
   * Get all goals with progress
   */
  async getAll(): Promise<{
    success: boolean;
    data?: { goals: Goal[] };
    message?: string;
  }> {
    return apiClient.get<{ goals: Goal[] }>(ENDPOINTS.GOALS);
  }

  /**
   * Get single goal by ID with contributions
   */
  async getById(
    id: string,
  ): Promise<{ success: boolean; data?: { goal: Goal }; message?: string }> {
    return apiClient.get<{ goal: Goal }>(`${ENDPOINTS.GOALS}/${id}`);
  }

  /**
   * Create a new goal
   */
  async create(
    data: CreateGoalRequest,
  ): Promise<{ success: boolean; data?: { goal: Goal }; message?: string }> {
    return apiClient.post<{ goal: Goal }>(ENDPOINTS.GOALS, data);
  }

  /**
   * Update a goal
   */
  async update(
    id: string,
    data: UpdateGoalRequest,
  ): Promise<{ success: boolean; data?: { goal: Goal }; message?: string }> {
    return apiClient.put<{ goal: Goal }>(`${ENDPOINTS.GOALS}/${id}`, data);
  }

  /**
   * Delete a goal
   */
  async delete(id: string): Promise<{ success: boolean; message?: string }> {
    return apiClient.delete(`${ENDPOINTS.GOALS}/${id}`);
  }

  /**
   * Get all contributions for a goal (paginated)
   */
  async getContributions(
    goalId: string,
    page = 1,
    limit = 20,
  ): Promise<{
    success: boolean;
    data?: GoalContribution[];
    pagination?: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
    message?: string;
  }> {
    return apiClient.get(
      `${ENDPOINTS.GOALS}/${goalId}/contributions?page=${page}&limit=${limit}`,
    );
  }

  /**
   * Add a contribution to a goal
   */
  async addContribution(
    goalId: string,
    data: AddContributionRequest,
  ): Promise<{
    success: boolean;
    data?: {
      contribution: GoalContribution;
      goal: { currentAmount: string; progress: number };
    };
    message?: string;
  }> {
    return apiClient.post(`${ENDPOINTS.GOALS}/${goalId}/contributions`, data);
  }
}

export const goalService = new GoalService();
