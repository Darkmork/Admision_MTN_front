import api from './api';
import {
  User,
  CreateUserRequest,
  UpdateUserRequest,
  UserFilters,
  PagedResponse,
  UserStats,
  UserRole,
  USER_ROLE_LABELS
} from '../types/user';
import { DataAdapter } from './dataAdapter';

class UserService {

  // ============= MÉTODOS PRINCIPALES =============

  /**
   * Obtener todos los usuarios con filtros y paginación
   */
  async getAllUsers(filters: UserFilters = {}): Promise<PagedResponse<User>> {
    try {
      console.log('👥 Obteniendo usuarios desde microservicio:', filters);

      const params = new URLSearchParams();
      
      if (filters.search) params.append('search', filters.search);
      if (filters.role) params.append('role', filters.role);
      if (filters.active !== undefined) params.append('active', filters.active.toString());
      if (filters.page !== undefined) params.append('page', filters.page.toString());
      if (filters.size !== undefined) params.append('size', filters.size.toString());
      if (filters.sort) params.append('sort', filters.sort);

      const response = await api.get(`/api/users?${params.toString()}`);
      
      console.log('✅ Respuesta cruda del microservicio:', response.data);
      
      // Usar el adaptador para convertir datos simples a estructura compleja
      const adaptedResponse = DataAdapter.adaptUserApiResponse(response);
      
      console.log('✅ Usuarios adaptados exitosamente:', adaptedResponse.content.length);
      return adaptedResponse;

    } catch (error: any) {
      console.error('❌ Error obteniendo usuarios del microservicio:', error);
      throw this.handleError(error, 'Error al obtener los usuarios');
    }
  }

  /**
   * Obtener usuario por ID
   */
  async getUserById(id: number): Promise<User> {
    try {
      console.log('👤 Obteniendo usuario por ID:', id);

      const response = await api.get(`/api/users/${id}`);

      // DEFENSIVE: Validate response exists
      if (!response || !response.data) {
        console.error('❌ getUserById: response or response.data is undefined');
        throw new Error('No se recibió respuesta válida del servidor');
      }

      console.log('✅ Usuario obtenido exitosamente');
      return response.data;

    } catch (error: any) {
      console.error('❌ Error obteniendo usuario:', error);
      throw this.handleError(error, 'Error al obtener el usuario');
    }
  }

  /**
   * Crear nuevo usuario
   */
  async createUser(request: CreateUserRequest): Promise<User> {
    try {
      console.log('➕ Creando usuario:', request.email);

      const response = await api.post('/api/users', request);

      // DEFENSIVE: Validate response exists
      if (!response || !response.data) {
        console.error('❌ createUser: response or response.data is undefined');
        throw new Error('No se recibió respuesta válida del servidor');
      }

      console.log('✅ Usuario creado exitosamente');
      return response.data;

    } catch (error: any) {
      console.error('❌ Error creando usuario:', error);
      throw this.handleError(error, 'Error al crear el usuario');
    }
  }

  /**
   * Actualizar usuario existente
   */
  async updateUser(id: number, request: UpdateUserRequest): Promise<User> {
    try {
      console.log('✏️ Actualizando usuario:', id);

      const response = await api.put(`/api/users/${id}`, request);

      // DEFENSIVE: Validate response exists
      if (!response || !response.data) {
        console.error('❌ updateUser: response or response.data is undefined');
        throw new Error('No se recibió respuesta válida del servidor');
      }

      console.log('✅ Usuario actualizado exitosamente');
      return response.data;

    } catch (error: any) {
      console.error('❌ Error actualizando usuario:', error);
      throw this.handleError(error, 'Error al actualizar el usuario');
    }
  }

  /**
   * Desactivar usuario
   */
  async deactivateUser(id: number): Promise<void> {
    try {
      console.log('🔒 Desactivando usuario:', id);

      await api.put(`/api/users/${id}/deactivate`);
      
      console.log('✅ Usuario desactivado exitosamente');

    } catch (error: any) {
      console.error('❌ Error desactivando usuario:', error);
      throw this.handleError(error, 'Error al desactivar el usuario');
    }
  }

  /**
   * Eliminar usuario permanentemente de la base de datos
   */
  async deleteUser(id: number): Promise<void> {
    try {
      console.log('🗑️ Eliminando usuario permanentemente:', id);

      await api.delete(`/api/users/${id}`);
      
      console.log('✅ Usuario eliminado permanentemente');

    } catch (error: any) {
      console.error('❌ Error eliminando usuario:', error);
      throw this.handleError(error, 'Error al eliminar el usuario');
    }
  }

  /**
   * Activar usuario
   */
  async activateUser(id: number): Promise<User> {
    try {
      console.log('🔓 Activando usuario:', id);

      const response = await api.put(`/api/users/${id}/activate`);

      // DEFENSIVE: Validate response exists
      if (!response || !response.data) {
        console.error('❌ activateUser: response or response.data is undefined');
        throw new Error('No se recibió respuesta válida del servidor');
      }

      console.log('✅ Usuario activado exitosamente');
      return response.data;

    } catch (error: any) {
      console.error('❌ Error activando usuario:', error);
      throw this.handleError(error, 'Error al activar el usuario');
    }
  }

  /**
   * Restablecer contraseña de usuario
   */
  async resetUserPassword(id: number): Promise<void> {
    try {
      console.log('🔑 Restableciendo contraseña:', id);

      await api.put(`/api/users/${id}/reset-password`);
      
      console.log('✅ Contraseña restablecida exitosamente');

    } catch (error: any) {
      console.error('❌ Error restableciendo contraseña:', error);
      throw this.handleError(error, 'Error al restablecer la contraseña');
    }
  }

  /**
   * Obtener todos los roles disponibles
   */
  async getAllRoles(): Promise<UserRole[]> {
    try {
      console.log('📋 Obteniendo roles disponibles');

      const response = await api.get('/api/users/roles');

      // DEFENSIVE: Validate response exists
      if (!response || !response.data) {
        console.error('❌ getAllRoles: response or response.data is undefined');
        // Fallback a los roles definidos en el frontend
        return Object.values(UserRole);
      }

      console.log('✅ Roles obtenidos exitosamente');
      return response.data;

    } catch (error: any) {
      console.error('❌ Error obteniendo roles:', error);
      // Fallback a los roles definidos en el frontend
      return Object.values(UserRole);
    }
  }

  /**
   * Obtener estadísticas de usuarios
   */
  async getUserStats(): Promise<UserStats> {
    try {
      console.log('📊 Obteniendo estadísticas de usuarios');

      const response = await api.get('/api/users/stats');

      // DEFENSIVE: Validate response exists
      if (!response || !response.data) {
        console.error('❌ getUserStats: response or response.data is undefined');
        throw new Error('No se recibió respuesta válida del servidor');
      }

      console.log('✅ Estadísticas obtenidas exitosamente');
      return response.data;

    } catch (error: any) {
      console.error('❌ Error obteniendo estadísticas:', error);
      throw this.handleError(error, 'Error al obtener las estadísticas');
    }
  }

  // ============= MÉTODOS DE UTILIDAD =============

  /**
   * Buscar usuarios por término de búsqueda
   */
  async searchUsers(searchTerm: string, filters: Omit<UserFilters, 'search'> = {}): Promise<PagedResponse<User>> {
    return this.getAllUsers({
      ...filters,
      search: searchTerm
    });
  }

  /**
   * Obtener usuarios por rol
   */
  async getUsersByRole(role: UserRole, filters: Omit<UserFilters, 'role'> = {}): Promise<PagedResponse<User>> {
    return this.getAllUsers({
      ...filters,
      role
    });
  }

  /**
   * Obtener usuarios activos
   */
  async getActiveUsers(filters: Omit<UserFilters, 'active'> = {}): Promise<PagedResponse<User>> {
    return this.getAllUsers({
      ...filters,
      active: true
    });
  }

  /**
   * Obtener solo usuarios del colegio (staff) - excluye APODERADOS
   */
  async getSchoolStaffUsers(filters: UserFilters = {}): Promise<PagedResponse<User>> {
    try {
      console.log('👨‍🏫 Obteniendo usuarios del colegio desde microservicio');
      
      // Filtrar en el backend excluyendo APODERADOS mediante parámetros
      const staffFilters = {
        ...filters,
        excludeRole: 'APODERADO' // Nuevo parámetro para excluir APODERADOS
      };
      
      const params = new URLSearchParams();
      
      if (staffFilters.search) params.append('search', staffFilters.search);
      if (staffFilters.role) params.append('role', staffFilters.role);
      if (staffFilters.active !== undefined) params.append('active', staffFilters.active.toString());
      if (staffFilters.page !== undefined) params.append('page', staffFilters.page.toString());
      if (staffFilters.size !== undefined) params.append('size', staffFilters.size.toString());
      if (staffFilters.sort) params.append('sort', staffFilters.sort);
      // Excluir APODERADOS en el backend
      params.append('excludeRole', 'APODERADO');

      const response = await api.get(`/api/users?${params.toString()}`);
      
      console.log('✅ Respuesta cruda staff del microservicio:', response.data);
      
      // Usar el adaptador para convertir datos simples a estructura compleja
      const adaptedResponse = DataAdapter.adaptUserApiResponse(response);
      
      console.log('✅ Usuarios staff adaptados exitosamente:', adaptedResponse.content.length);
      return adaptedResponse;

    } catch (error: any) {
      console.error('❌ Error obteniendo usuarios staff del microservicio:', error);
      throw this.handleError(error, 'Error al obtener usuarios del colegio');
    }
  }

  /**
   * Obtener usuarios inactivos
   */
  async getInactiveUsers(filters: Omit<UserFilters, 'active'> = {}): Promise<PagedResponse<User>> {
    return this.getAllUsers({
      ...filters,
      active: false
    });
  }

  /**
   * Obtener evaluadores activos
   */
  async getActiveEvaluators(): Promise<PagedResponse<User>> {
    const evaluatorRoles = [
      UserRole.TEACHER,
      UserRole.COORDINATOR,
      UserRole.CYCLE_DIRECTOR,
      UserRole.PSYCHOLOGIST
    ];

    // Como el backend no soporta filtro por múltiples roles, 
    // haremos múltiples llamadas y las combinamos
    try {
      const promises = evaluatorRoles.map(role => 
        this.getUsersByRole(role, { active: true })
      );
      
      const results = await Promise.all(promises);
      
      // Combinar todos los usuarios
      const allUsers: User[] = [];
      let totalElements = 0;
      
      results.forEach(result => {
        allUsers.push(...result.content);
        totalElements += result.totalElements;
      });

      return {
        content: allUsers,
        totalElements,
        totalPages: Math.ceil(totalElements / 10),
        number: 0,
        size: totalElements,
        first: true,
        last: true,
        numberOfElements: allUsers.length,
        empty: allUsers.length === 0
      };

    } catch (error: any) {
      console.error('❌ Error obteniendo evaluadores:', error);
      throw this.handleError(error, 'Error al obtener los evaluadores');
    }
  }

  // ============= VALIDACIONES =============

  /**
   * Validar datos de usuario antes de enviar
   */
  validateUserData(data: CreateUserRequest | UpdateUserRequest): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    // Validar nombre
    if (!data.firstName || data.firstName.trim().length < 2) {
      errors.push('El nombre debe tener al menos 2 caracteres');
    }

    // Validar apellido
    if (!data.lastName || data.lastName.trim().length < 2) {
      errors.push('El apellido debe tener al menos 2 caracteres');
    }

    // Validar email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!data.email || !emailRegex.test(data.email)) {
      errors.push('El formato del email no es válido');
    }

    // Validar RUT
    const rutRegex = /^[0-9]+-[0-9kK]$/;
    if (!data.rut || !rutRegex.test(data.rut)) {
      errors.push('El formato del RUT no es válido (ej: 12345678-9)');
    }

    // Validar contraseña para creación
    if ('password' in data && data.password && data.password.length < 8) {
      errors.push('La contraseña debe tener al menos 8 caracteres');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }


  /**
   * Obtener usuarios del colegio sin autenticación (público)
   */
  async getSchoolStaffUsersPublic(): Promise<PagedResponse<User>> {
    try {
      console.log('👨‍🏫 Obteniendo usuarios del colegio desde endpoint público');

      const response = await api.get('/api/users/public/school-staff');

      // DEFENSIVE: Validate response exists
      if (!response || !response.data) {
        console.error('❌ getSchoolStaffUsersPublic: response or response.data is undefined');
        throw new Error('No se recibió respuesta válida del servidor');
      }

      console.log('✅ Respuesta del endpoint público:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Error obteniendo usuarios del colegio (público):', error);
      throw this.handleError(error, 'Error al obtener usuarios del colegio');
    }
  }

  // ============= MANEJO DE ERRORES =============

  private handleError(error: any, defaultMessage: string): Error {
    const message = error.response?.data?.message ||
                   error.response?.data?.error ||
                   error.message ||
                   defaultMessage;

    return new Error(message);
  }
}

export const userService = new UserService();