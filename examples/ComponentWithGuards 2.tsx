/**
 * Ejemplo de uso de guardas de rol en componentes
 * Muestra cómo usar RoleGuard y el hook useRoleGuard
 */

import React, { useState, useEffect } from 'react';
import {
  AdminGuard,
  TeacherGuard,
  FamilyGuard,
  StaffGuard,
  ConditionalGuard,
  useRoleGuard
} from '../components/auth/RoleGuard';
import apiClient from '../services/apiClient';

const DashboardWithGuards: React.FC = () => {
  const {
    isAdmin,
    isTeacher,
    isFamily,
    isStaff,
    getRoleDisplay,
    roles,
    user,
  } = useRoleGuard();

  const [applications, setApplications] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Cargar datos según el rol del usuario
      if (isAdmin()) {
        const [applicationsData, usersData] = await Promise.all([
          apiClient.getApplications({ page: 0, size: 10 }),
          apiClient.getUsers({ page: 0, size: 10 }),
        ]);
        setApplications(applicationsData.content);
        setUsers(usersData.content);
      } else if (isTeacher()) {
        const evaluationsData = await apiClient.getEvaluations({ page: 0, size: 10 });
        setApplications(evaluationsData.content);
      } else if (isFamily()) {
        const applicationsData = await apiClient.getApplications({ 
          page: 0, 
          size: 10,
          // Filtrar por el usuario actual
        });
        setApplications(applicationsData.content);
      }
    } catch (error) {
      console.error('Error loading dashboard data:', error);
      setError(apiClient.handleError(error));
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header del Dashboard */}
      <div className="bg-white shadow rounded-lg p-6 mb-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Dashboard - {getRoleDisplay()}
            </h1>
            <p className="text-sm text-gray-600 mt-1">
              Bienvenido, {user?.profile?.name || user?.profile?.email}
            </p>
          </div>
          
          <div className="text-right">
            <div className="text-sm text-gray-500">
              Roles: {roles.join(', ')}
            </div>
            <div className="text-xs text-gray-400 mt-1">
              Sistema de Admisión MTN
            </div>
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-800">{error}</p>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Sección solo para ADMIN */}
        <AdminGuard>
          <div className="bg-white shadow rounded-lg p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              🔧 Panel de Administración
            </h3>
            
            <div className="space-y-4">
              <div className="flex justify-between items-center p-3 bg-blue-50 rounded">
                <span className="text-sm font-medium text-blue-900">
                  Total de Usuarios
                </span>
                <span className="text-2xl font-bold text-blue-600">
                  {users.length}
                </span>
              </div>
              
              <div className="flex justify-between items-center p-3 bg-green-50 rounded">
                <span className="text-sm font-medium text-green-900">
                  Aplicaciones Activas
                </span>
                <span className="text-2xl font-bold text-green-600">
                  {applications.length}
                </span>
              </div>
              
              <button 
                onClick={() => window.location.href = '/admin/users'}
                className="w-full bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 text-sm"
              >
                Gestionar Usuarios
              </button>
            </div>
          </div>
        </AdminGuard>

        {/* Sección para PROFESORES (Teacher, Psychologist, etc.) */}
        <TeacherGuard>
          <div className="bg-white shadow rounded-lg p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              👨‍🏫 Panel de Evaluaciones
            </h3>
            
            <div className="space-y-4">
              <div className="flex justify-between items-center p-3 bg-yellow-50 rounded">
                <span className="text-sm font-medium text-yellow-900">
                  Evaluaciones Pendientes
                </span>
                <span className="text-2xl font-bold text-yellow-600">
                  {applications.filter((app: any) => app.status === 'PENDING').length}
                </span>
              </div>
              
              <button 
                onClick={() => window.location.href = '/professor/evaluations'}
                className="w-full bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 text-sm"
              >
                Ver Evaluaciones
              </button>
            </div>
          </div>
        </TeacherGuard>

        {/* Sección para FAMILIAS */}
        <FamilyGuard>
          <div className="bg-white shadow rounded-lg p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              👨‍👩‍👧‍👦 Mi Aplicación
            </h3>
            
            <div className="space-y-4">
              <div className="flex justify-between items-center p-3 bg-purple-50 rounded">
                <span className="text-sm font-medium text-purple-900">
                  Estado de Aplicación
                </span>
                <span className="text-sm font-bold text-purple-600">
                  {applications[0]?.status || 'Sin aplicación'}
                </span>
              </div>
              
              <button 
                onClick={() => window.location.href = '/family/application'}
                className="w-full bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700 text-sm"
              >
                Ver Mi Aplicación
              </button>
            </div>
          </div>
        </FamilyGuard>

        {/* Sección para TODO EL PERSONAL */}
        <StaffGuard>
          <div className="bg-white shadow rounded-lg p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              📊 Estadísticas Generales
            </h3>
            
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-2">
                <div className="text-center p-2 bg-gray-50 rounded">
                  <div className="text-lg font-bold text-gray-700">
                    {applications.length}
                  </div>
                  <div className="text-xs text-gray-500">Aplicaciones</div>
                </div>
                
                <div className="text-center p-2 bg-gray-50 rounded">
                  <div className="text-lg font-bold text-gray-700">
                    {applications.filter((app: any) => app.status === 'APPROVED').length}
                  </div>
                  <div className="text-xs text-gray-500">Aprobadas</div>
                </div>
              </div>
            </div>
          </div>
        </StaffGuard>

        {/* Guarda condicional personalizada */}
        <ConditionalGuard
          condition={(user, roles) => {
            // Solo mostrar si el usuario es director Y tiene más de X evaluaciones
            return roles.includes('CYCLE_DIRECTOR') && applications.length > 5;
          }}
          fallback={
            <div className="bg-gray-100 rounded-lg p-6 text-center">
              <p className="text-gray-500 text-sm">
                Sección disponible solo para Directores con evaluaciones activas
              </p>
            </div>
          }
        >
          <div className="bg-white shadow rounded-lg p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              🎯 Panel de Director
            </h3>
            
            <div className="text-center">
              <div className="text-3xl font-bold text-indigo-600">
                {applications.length}
              </div>
              <div className="text-sm text-gray-500 mt-1">
                Evaluaciones para Revisión
              </div>
              
              <button 
                onClick={() => window.location.href = '/professor/interviews'}
                className="mt-4 bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700 text-sm"
              >
                Programar Entrevistas
              </button>
            </div>
          </div>
        </ConditionalGuard>
      </div>

      {/* Información de debugging (solo en desarrollo) */}
      {import.meta.env.DEV && (
        <div className="mt-8 bg-gray-100 rounded-lg p-4">
          <h4 className="text-sm font-medium text-gray-700 mb-2">Debug Info:</h4>
          <div className="text-xs text-gray-600 space-y-1">
            <div>Roles: {JSON.stringify(roles)}</div>
            <div>Is Admin: {isAdmin() ? 'Yes' : 'No'}</div>
            <div>Is Teacher: {isTeacher() ? 'Yes' : 'No'}</div>
            <div>Is Family: {isFamily() ? 'Yes' : 'No'}</div>
            <div>Is Staff: {isStaff() ? 'Yes' : 'No'}</div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DashboardWithGuards;