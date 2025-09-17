/**
 * Users API Client - Typed SDK
 * Generated for MTN Admission System
 */

import httpClient from '../../services/http';
import type {
  User,
  CreateUserRequest,
  UpdateUserRequest,
  UserSearchParams,
  UserStatistics,
  UsersResponse,
  PaginatedResponse
} from './users.types';

export class UsersClient {
  private readonly basePath = '/api/users';

  /**
   * Get all users with optional filtering and pagination
   */
  async getUsers(params?: UserSearchParams): Promise<PaginatedResponse<User>> {
    const response = await httpClient.get<UsersResponse<PaginatedResponse<User>>>(
      this.basePath,
      { params }
    );
    return response.data;
  }

  /**
   * Get user by ID
   */
  async getUserById(id: number): Promise<User> {
    const response = await httpClient.get<UsersResponse<User>>(
      `${this.basePath}/${id}`
    );
    return response.data;
  }

  /**
   * Create new user (admin only)
   */
  async createUser(userData: CreateUserRequest): Promise<User> {
    const response = await httpClient.post<UsersResponse<User>>(
      this.basePath,
      userData
    );
    return response.data;
  }

  /**
   * Update existing user
   */
  async updateUser(id: number, userData: UpdateUserRequest): Promise<User> {
    const response = await httpClient.put<UsersResponse<User>>(
      `${this.basePath}/${id}`,
      userData
    );
    return response.data;
  }

  /**
   * Delete user (soft delete)
   */
  async deleteUser(id: number): Promise<void> {
    await httpClient.delete<UsersResponse<void>>(`${this.basePath}/${id}`);
  }

  /**
   * Activate/deactivate user
   */
  async toggleUserStatus(id: number, active: boolean): Promise<User> {
    const response = await httpClient.patch<UsersResponse<User>>(
      `${this.basePath}/${id}/status`,
      { active }
    );
    return response.data;
  }

  /**
   * Reset user password (admin only)
   */
  async resetUserPassword(id: number): Promise<{ temporaryPassword: string }> {
    const response = await httpClient.post<UsersResponse<{ temporaryPassword: string }>>(
      `${this.basePath}/${id}/reset-password`
    );
    return response.data;
  }

  /**
   * Get user statistics (admin only)
   */
  async getUserStatistics(): Promise<UserStatistics> {
    const response = await httpClient.get<UsersResponse<UserStatistics>>(
      `${this.basePath}/statistics`
    );
    return response.data;
  }

  /**
   * Get users by role
   */
  async getUsersByRole(role: User['role'], params?: Omit<UserSearchParams, 'role'>): Promise<User[]> {
    const response = await httpClient.get<UsersResponse<User[]>>(
      `${this.basePath}/by-role/${role}`,
      { params }
    );
    return response.data;
  }

  /**
   * Get evaluators (teachers, psychologists, directors)
   */
  async getEvaluators(params?: {
    subject?: User['subject'];
    educationalLevel?: User['educationalLevel'];
    activeOnly?: boolean;
  }): Promise<User[]> {
    const response = await httpClient.get<UsersResponse<User[]>>(
      `${this.basePath}/evaluators`,
      { params }
    );
    return response.data;
  }

  /**
   * Search users by query
   */
  async searchUsers(query: string, params?: Omit<UserSearchParams, 'query'>): Promise<User[]> {
    const response = await httpClient.get<UsersResponse<User[]>>(
      `${this.basePath}/search`,
      { params: { query, ...params } }
    );
    return response.data;
  }

  /**
   * Verify user email
   */
  async verifyUserEmail(id: number): Promise<void> {
    await httpClient.post<UsersResponse<void>>(
      `${this.basePath}/${id}/verify-email`
    );
  }

  /**
   * Update user preferences
   */
  async updateUserPreferences(id: number, preferences: any): Promise<User> {
    const response = await httpClient.patch<UsersResponse<User>>(
      `${this.basePath}/${id}/preferences`,
      preferences
    );
    return response.data;
  }
}

// Export singleton instance
export const usersClient = new UsersClient();

// Export individual functions for convenience
export const {
  getUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  toggleUserStatus,
  resetUserPassword,
  getUserStatistics,
  getUsersByRole,
  getEvaluators,
  searchUsers,
  verifyUserEmail,
  updateUserPreferences
} = usersClient;