import api from './http';
import { User, CreateUserRequest, UpdateUserRequest, UserFilters, PagedResponse, UserStats } from '../types/user';

/**
 * Service for managing school staff (excludes guardians/apoderados)
 * Handles ADMIN, TEACHER, COORDINATOR, PSYCHOLOGIST, CYCLE_DIRECTOR roles
 */
class StaffService {
  private readonly BASE_URL = '/api/users/staff';

  /**
   * Get paginated list of staff members
   */
  async getStaffUsers(filters: UserFilters): Promise<PagedResponse<User>> {
    const params = new URLSearchParams();

    if (filters.page !== undefined) params.append('page', filters.page.toString());
    if (filters.size !== undefined) params.append('size', filters.size.toString());
    if (filters.search) params.append('search', filters.search);
    if (filters.role) params.append('role', filters.role);
    if (filters.active !== undefined) params.append('active', filters.active.toString());

    const response = await api.get<PagedResponse<User>>(`${this.BASE_URL}?${params.toString()}`);
    return response;  // httpClient.get already unwraps response.data
  }

  /**
   * Get staff user by ID
   */
  async getStaffUserById(id: number): Promise<User> {
    const response = await api.get<{ success: boolean; data: User }>(`/api/users/${id}`);
    return response.data.data;
  }

  /**
   * Create new staff member
   */
  async createStaffUser(userData: CreateUserRequest): Promise<User> {
    // Ensure role is not APODERADO
    if (userData.role === 'APODERADO') {
      throw new Error('Use guardianService to create guardians');
    }

    const response = await api.post<{ success: boolean; data: User }>('/api/users', userData);
    return response.data.data;
  }

  /**
   * Update staff member
   */
  async updateStaffUser(id: number, userData: UpdateUserRequest): Promise<User> {
    const response = await api.put<{ success: boolean; data: User }>(`/api/users/${id}`, userData);
    return response.data.data;
  }

  /**
   * Delete staff member
   */
  async deleteStaffUser(id: number): Promise<void> {
    await api.delete(`/api/users/${id}`);
  }

  /**
   * Activate staff member
   */
  async activateStaffUser(id: number): Promise<User> {
    const response = await api.put<{ success: boolean; data: User }>(`/api/users/${id}/activate`);
    return response.data.data;
  }

  /**
   * Deactivate staff member
   */
  async deactivateStaffUser(id: number): Promise<User> {
    const response = await api.put<{ success: boolean; data: User }>(`/api/users/${id}/deactivate`);
    return response.data.data;
  }

  /**
   * Reset staff member password
   */
  async resetStaffPassword(id: number): Promise<void> {
    await api.put(`/api/users/${id}/reset-password`);
  }

  /**
   * Get staff statistics
   */
  async getStaffStats(): Promise<UserStats> {
    const response = await api.get<{ success: boolean; data: UserStats }>('/api/users/stats');
    return response.data.data;
  }

  /**
   * Get available roles for staff
   */
  async getStaffRoles(): Promise<string[]> {
    const response = await api.get<{ success: boolean; data: string[] }>('/api/users/roles');
    // Filter out APODERADO role
    return response.data.data.filter(role => role !== 'APODERADO');
  }
}

export const staffService = new StaffService();
export default staffService;
