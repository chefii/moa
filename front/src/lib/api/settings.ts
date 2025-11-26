import apiClient from './client';

export interface FooterLink {
  id: string;
  title: string;
  url: string;
  order: number;
  isExternal: boolean;
  isActive: boolean;
  category: string;
  createdAt: string;
  updatedAt: string;
}

export const settingsApi = {
  // Get footer links
  getFooterLinks: async (category: string, isActive: boolean = true): Promise<FooterLink[]> => {
    try {
      // Placeholder: 실제 API 호출 대신 기본값 반환
      return [
        {
          id: '1',
          title: '이용약관',
          url: '/terms/service',
          order: 0,
          isExternal: false,
          isActive: true,
          category: 'terms',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        {
          id: '2',
          title: '개인정보처리방침',
          url: '/terms/privacy',
          order: 1,
          isExternal: false,
          isActive: true,
          category: 'terms',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ];
    } catch (error) {
      console.error('Failed to get footer links:', error);
      return [];
    }
  },
};
