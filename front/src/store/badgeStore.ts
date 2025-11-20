import { create } from 'zustand';
import { apiClient } from '@/lib/api/client';

interface BadgeState {
  reportBadgeCount: number;
  setReportBadgeCount: (count: number) => void;
  refreshReportBadge: () => Promise<void>;
}

export const useBadgeStore = create<BadgeState>((set) => ({
  reportBadgeCount: 0,

  setReportBadgeCount: (count: number) => {
    set({ reportBadgeCount: count });
  },

  refreshReportBadge: async () => {
    try {
      // Add timestamp to prevent HTTP caching
      const response = await apiClient.get(`/api/admin/reports/badge?t=${Date.now()}`, {
        headers: {
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache',
        },
      });
      set({ reportBadgeCount: response.data.data.count });
    } catch (error) {
      console.error('Failed to refresh report badge:', error);
      // Set to 0 on error to avoid showing stale data
      set({ reportBadgeCount: 0 });
    }
  },
}));
