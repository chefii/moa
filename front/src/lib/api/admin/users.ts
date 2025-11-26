import { apiClient } from '../client';

export interface UserRole {
  id?: string;
  roleCode: string;
  isPrimary: boolean;
  grantedAt?: string;
  expiresAt?: string | null;
}

export interface AdminUser {
  id: string;
  email: string;
  name: string;
  nickname: string | null;
  profileImage: string | null;
  isVerified: boolean;
  isPhoneVerified?: boolean;
  emailVerifiedAt?: string | null;
  phoneVerifiedAt?: string | null;
  createdAt: string;
  userRoles: UserRole[]; // 다중 역할 지원
  businessProfile?: {
    businessName: string;
    isApproved: boolean;
  } | null;
}

export interface AdminUserDetail extends AdminUser {
  bio?: string | null;
  phone?: string | null;
  location?: string | null;
  gender?: string | null;
  age?: number | null;
  updatedAt?: string;
  userLevel?: {
    level: number;
    growthPoints: number;
  };
  userStreak?: {
    currentStreak: number;
    longestStreak: number;
    lastActivityDate: string;
  };
  interests?: Array<{
    category: {
      id: string;
      name: string;
      icon?: string;
      color?: string;
    };
  }>;
  businessProfile?: {
    businessName: string;
    businessNumber: string;
    businessAddress: string;
    businessPhone: string;
    businessDescription: string | null;
    isApproved: boolean;
    approvedAt: string | null;
    rejectionReason: string | null;
  } | null;
}

export interface GetUsersParams {
  role?: string;
  search?: string;
  page?: number;
  limit?: number;
}

export interface GetUsersResponse {
  success: boolean;
  data: AdminUser[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface GetUserResponse {
  success: boolean;
  data: AdminUserDetail;
}

export interface UpdateUserRoleRequest {
  role: string; // For backward compatibility (single role API)
}

export interface UpdateUserRolesRequest {
  roles: string[]; // Array of role codes
  primaryRole?: string; // Primary role (defaults to first role)
  reason?: string; // Reason for role change
}

export interface UpdateUserRoleResponse {
  success: boolean;
  data: AdminUser;
  message: string;
}

export interface RoleStatistics {
  totalUsers: number;
  roles: {
    USER: number;
    VERIFIED_USER: number;
    HOST: number;
    PREMIUM_USER: number;
    BUSINESS_PENDING: number;
    BUSINESS_USER: number;
    BUSINESS_MANAGER: number;
    MODERATOR: number;
    CONTENT_MANAGER: number;
    SUPPORT_MANAGER: number;
    SETTLEMENT_MANAGER: number;
    ADMIN: number;
    SUPER_ADMIN: number;
  };
}

export interface GetRoleStatisticsResponse {
  success: boolean;
  data: RoleStatistics;
}

export interface TermsAgreement {
  id: string;
  type: string;
  title: string;
  version: string;
  isRequired: boolean;
  agreed: boolean;
  agreedAt: string | null;
  ipAddress: string | null;
  userAgent: string | null;
}

export interface TermsAgreementStatistics {
  totalTerms: number;
  requiredTerms: number;
  agreedTerms: number;
  agreedRequiredTerms: number;
  completionRate: number;
  requiredCompletionRate: number;
}

export interface GetUserTermsAgreementsResponse {
  success: boolean;
  data: {
    terms: TermsAgreement[];
    statistics: TermsAgreementStatistics;
  };
}

export const usersApi = {
  // Get all users with filtering
  getUsers: async (params?: GetUsersParams): Promise<GetUsersResponse> => {
    const response = await apiClient.get('/api/admin/users', { params });
    return response.data;
  },

  // Get user by ID
  getUserById: async (id: string): Promise<GetUserResponse> => {
    const response = await apiClient.get(`/api/admin/users/${id}`);
    return response.data;
  },

  // Update user role (single - deprecated)
  updateUserRole: async (id: string, data: UpdateUserRoleRequest): Promise<UpdateUserRoleResponse> => {
    const response = await apiClient.put(`/api/admin/users/${id}/role`, data);
    return response.data;
  },

  // Update user roles (다중 역할 지원)
  updateUserRoles: async (id: string, data: UpdateUserRolesRequest): Promise<UpdateUserRoleResponse> => {
    const response = await apiClient.put(`/api/admin/users/${id}/roles`, data);
    return response.data;
  },

  // Get role statistics
  getRoleStatistics: async (): Promise<GetRoleStatisticsResponse> => {
    const response = await apiClient.get('/api/admin/users/stats/roles');
    return response.data;
  },

  // Reset user password to 1234
  resetPassword: async (id: string): Promise<{ success: boolean; message: string }> => {
    const response = await apiClient.post(`/api/admin/users/${id}/reset-password`);
    return response.data;
  },

  // Get user terms agreements
  getUserTermsAgreements: async (id: string): Promise<GetUserTermsAgreementsResponse> => {
    const response = await apiClient.get(`/api/users/${id}/terms-agreements`);
    return response.data;
  },
};
