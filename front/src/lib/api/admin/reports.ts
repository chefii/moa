import apiClient from '../client';
import { ApiResponse } from '../types';

export type ReportStatus = 'PENDING' | 'REVIEWING' | 'RESOLVED' | 'REJECTED';
export type ReportType = 'USER' | 'GATHERING' | 'POST' | 'COMMENT' | 'OTHER';

export interface Report {
  id: string;
  reporterId: string;
  reportedId: string;
  gatheringId?: string;
  postId?: string;
  reasonCode: string;
  customReason?: string;
  description?: string;
  statusCode: string;
  adminNote?: string;
  resolvedAt?: string;
  resolvedBy?: string;
  createdAt: string;
  reporter?: {
    id: string;
    name: string;
    email: string;
  };
  reported?: {
    id: string;
    name: string;
    email: string;
  };
  post?: {
    id: string;
    title: string;
    content: string;
  };
  reasonCommonCode?: {
    code: string;
    name: string;
    description?: string;
  };
  statusCommonCode?: {
    code: string;
    name: string;
    description?: string;
  };
}

export interface ReportListResponse {
  data: Report[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface ReportStats {
  totalReports: number;
  pendingReports: number;
  reviewingReports: number;
  resolvedReports: number;
  rejectedReports: number;
}

export interface UpdateReportStatusDto {
  status: ReportStatus;
  adminNote?: string;
}

export const reportsApi = {
  // Get all reports
  getReports: async (
    page = 1,
    limit = 10,
    status?: ReportStatus,
    type?: ReportType
  ): Promise<ReportListResponse> => {
    let url = `/api/admin/reports?page=${page}&limit=${limit}`;
    if (status) url += `&status=${status}`;
    if (type) url += `&type=${type}`;

    const response = await apiClient.get<any>(url);
    return {
      data: response.data.data,
      pagination: response.data.pagination,
    };
  },

  // Get report by ID
  getReportById: async (id: string): Promise<Report> => {
    const response = await apiClient.get<ApiResponse<Report>>(
      `/api/admin/reports/${id}`
    );
    return response.data.data!;
  },

  // Update report status
  updateReportStatus: async (
    id: string,
    data: UpdateReportStatusDto
  ): Promise<Report> => {
    const response = await apiClient.put<ApiResponse<Report>>(
      `/api/admin/reports/${id}/status`,
      data
    );
    return response.data.data!;
  },

  // Get report statistics
  getReportStats: async (): Promise<ReportStats> => {
    const response = await apiClient.get<ApiResponse<ReportStats>>(
      '/api/admin/reports/stats/overview'
    );
    return response.data.data!;
  },
};
