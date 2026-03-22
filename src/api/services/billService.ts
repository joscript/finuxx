import { apiClient } from "../client";
import { ENDPOINTS } from "../config";
import {
  Bill,
  BillSummary,
  CreateBillRequest,
  UpdateBillRequest,
  PayBillRequest,
} from "../types";

export interface BillsResponse {
  bills: Bill[];
  summary: BillSummary;
}

export interface BillFilters {
  isPaid?: boolean;
  upcoming?: boolean;
}

class BillService {
  /**
   * Get all bills with summary
   */
  async getAll(
    filters?: BillFilters,
  ): Promise<{ success: boolean; data?: BillsResponse; message?: string }> {
    let endpoint = ENDPOINTS.BILLS;

    if (filters) {
      const params = new URLSearchParams();
      if (filters.isPaid !== undefined)
        params.append("isPaid", filters.isPaid.toString());
      if (filters.upcoming !== undefined)
        params.append("upcoming", filters.upcoming.toString());

      const queryString = params.toString();
      if (queryString) {
        endpoint += `?${queryString}`;
      }
    }

    return apiClient.get<BillsResponse>(endpoint);
  }

  /**
   * Get single bill by ID
   */
  async getById(
    id: string,
  ): Promise<{ success: boolean; data?: { bill: Bill }; message?: string }> {
    return apiClient.get<{ bill: Bill }>(`${ENDPOINTS.BILLS}/${id}`);
  }

  /**
   * Create a new bill
   */
  async create(
    data: CreateBillRequest,
  ): Promise<{ success: boolean; data?: { bill: Bill }; message?: string }> {
    return apiClient.post<{ bill: Bill }>(ENDPOINTS.BILLS, data);
  }

  /**
   * Update a bill
   */
  async update(
    id: string,
    data: UpdateBillRequest,
  ): Promise<{ success: boolean; data?: { bill: Bill }; message?: string }> {
    return apiClient.put<{ bill: Bill }>(`${ENDPOINTS.BILLS}/${id}`, data);
  }

  /**
   * Delete a bill
   */
  async delete(id: string): Promise<{ success: boolean; message?: string }> {
    return apiClient.delete(`${ENDPOINTS.BILLS}/${id}`);
  }

  /**
   * Mark a bill as paid
   */
  async markAsPaid(
    id: string,
    data?: PayBillRequest,
  ): Promise<{ success: boolean; data?: { bill: Bill }; message?: string }> {
    return apiClient.post<{ bill: Bill }>(`${ENDPOINTS.BILLS}/${id}/pay`, data);
  }

  /**
   * Mark a bill as unpaid
   */
  async markAsUnpaid(
    id: string,
  ): Promise<{ success: boolean; data?: { bill: Bill }; message?: string }> {
    return apiClient.post<{ bill: Bill }>(`${ENDPOINTS.BILLS}/${id}/unpay`);
  }
}

export const billService = new BillService();
