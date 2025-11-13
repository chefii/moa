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
  isPhoneVerified?: boolean;
  emailVerifiedAt?: string | null;
  phoneVerifiedAt?: string | null;
  updatedAt?: string;
  userRoles: UserRole[]; // 다중 역할 (detail에서는 필수)
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
};
