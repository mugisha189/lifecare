import api, { ApiResponse } from './api';

export interface Role {
  id: string;
  name: string;
  description: string | null;
  createdAt: string;
  updatedAt: string;
}

/**
 * Roles service for fetching role information
 */
export class RolesService {
  /**
   * Get all available roles
   */
  static async getRoles(): Promise<ApiResponse<Role[]>> {
    try {
      const response = await api.get<ApiResponse>('/roles');
      return response.data;
    } catch (error: any) {
      console.error('Get roles error:', error);
      return {
        ok: false,
        message: error.response?.data?.message || 'Failed to fetch roles',
      };
    }
  }

  /**
   * Get role by name (e.g., 'PATIENT', 'DOCTOR', 'PHARMACIST', 'LABORATORY_STAFF')
   */
  static async getRoleByName(name: string): Promise<ApiResponse<Role>> {
    try {
      const rolesResponse = await this.getRoles();
      if (!rolesResponse.ok || !rolesResponse.data) {
        return {
          ok: false,
          message: 'Failed to fetch roles',
        };
      }

      const role = rolesResponse.data.find(r => r.name.toUpperCase() === name.toUpperCase());
      if (!role) {
        return {
          ok: false,
          message: `Role "${name}" not found`,
        };
      }

      return {
        ok: true,
        message: 'Role found',
        data: role,
      };
    } catch (error: any) {
      console.error('Get role by name error:', error);
      return {
        ok: false,
        message: error.message || 'Failed to fetch role',
      };
    }
  }
}
