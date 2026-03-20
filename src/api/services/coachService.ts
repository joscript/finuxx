import { apiClient } from "../client";
import { ENDPOINTS } from "../config";
import { CoachMessage, CoachMessageResponse } from "../types";

class CoachService {
  async getMessages(params: { limit?: number; before?: string } = {}): Promise<{
    success: boolean;
    data?: { messages: CoachMessage[] };
    message?: string;
  }> {
    const parts: string[] = [];
    if (params.limit) parts.push(`limit=${params.limit}`);
    if (params.before) parts.push(`before=${params.before}`);
    const qs = parts.length > 0 ? `?${parts.join("&")}` : "";
    return apiClient.get<{ messages: CoachMessage[] }>(
      `${ENDPOINTS.COACH_MESSAGES}${qs}`,
    );
  }

  async sendMessage(message: string): Promise<{
    success: boolean;
    data?: CoachMessageResponse;
    message?: string;
  }> {
    return apiClient.post<CoachMessageResponse>(ENDPOINTS.COACH_MESSAGES, {
      message,
    });
  }

  async clearHistory(): Promise<{ success: boolean; message?: string }> {
    return apiClient.delete(ENDPOINTS.COACH_MESSAGES);
  }
}

export const coachService = new CoachService();
