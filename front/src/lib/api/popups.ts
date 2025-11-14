import apiClient from './client';
import { ApiResponse } from './types';
import { Popup } from './admin/popups';

export interface PublicPopup {
  id: string;
  type: 'MODAL' | 'BOTTOM_SHEET' | 'TOAST';
  title: string;
  content: string;
  imageUrl?: string;
  linkUrl?: string;
  buttonText?: string;
  showOnce: boolean;
  priority: number;
}

export const publicPopupsApi = {
  // Get active popups (authentication optional - filters viewed popups if logged in)
  getActivePopups: async (): Promise<PublicPopup[]> => {
    const response = await apiClient.get<ApiResponse<PublicPopup[]>>('/api/popups/active');
    return response.data.data || [];
  },

  // Record popup view (authentication optional - saves to database if logged in)
  recordPopupView: async (popupId: string): Promise<void> => {
    await apiClient.post(`/api/popups/view/${popupId}`);
  },
};
