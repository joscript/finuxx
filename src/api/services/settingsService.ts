import { apiClient } from '../client';
import { ENDPOINTS } from '../config';
import { Settings, UpdateSettingsRequest } from '../types';

class SettingsService {
  /**
   * Get user settings
   */
  async get(): Promise<{ success: boolean; data?: { settings: Settings }; message?: string }> {
    return apiClient.get<{ settings: Settings }>(ENDPOINTS.SETTINGS);
  }

  /**
   * Update user settings
   */
  async update(data: UpdateSettingsRequest): Promise<{ success: boolean; data?: { settings: Settings }; message?: string }> {
    return apiClient.put<{ settings: Settings }>(ENDPOINTS.SETTINGS, data);
  }
}

export const settingsService = new SettingsService();
