import { apiClient } from "../client";
import { ENDPOINTS } from "../config";
import {
  ReportOverview,
  ReportCategory,
  ReportTrends,
  ReportInsight,
  ReportQuery,
} from "../types";

function buildQueryString(params: ReportQuery): string {
  const parts: string[] = [];
  if (params.period) parts.push(`period=${params.period}`);
  if (params.startDate) parts.push(`startDate=${params.startDate}`);
  if (params.endDate) parts.push(`endDate=${params.endDate}`);
  return parts.length > 0 ? `?${parts.join("&")}` : "";
}

class ReportService {
  async getOverview(params: ReportQuery = {}): Promise<{
    success: boolean;
    data?: { overview: ReportOverview };
    message?: string;
  }> {
    return apiClient.get<{ overview: ReportOverview }>(
      `${ENDPOINTS.REPORTS.OVERVIEW}${buildQueryString(params)}`,
    );
  }

  async getCategories(params: ReportQuery = {}): Promise<{
    success: boolean;
    data?: { categories: ReportCategory[]; totalExpenses: number };
    message?: string;
  }> {
    return apiClient.get<{
      categories: ReportCategory[];
      totalExpenses: number;
    }>(`${ENDPOINTS.REPORTS.CATEGORIES}${buildQueryString(params)}`);
  }

  async getTrends(params: ReportQuery = {}): Promise<{
    success: boolean;
    data?: ReportTrends;
    message?: string;
  }> {
    return apiClient.get<ReportTrends>(
      `${ENDPOINTS.REPORTS.TRENDS}${buildQueryString(params)}`,
    );
  }

  async getInsights(params: ReportQuery = {}): Promise<{
    success: boolean;
    data?: { insights: ReportInsight[]; period: string };
    message?: string;
  }> {
    return apiClient.get<{ insights: ReportInsight[]; period: string }>(
      `${ENDPOINTS.REPORTS.INSIGHTS}${buildQueryString(params)}`,
    );
  }
}

export const reportService = new ReportService();
