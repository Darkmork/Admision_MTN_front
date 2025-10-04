/**
 * Ejemplo de configuración de Router con rutas protegidas
 * Integración completa OIDC + React Router + RBAC
 */

import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { OidcProvider } from '../context/OidcContext';
import { 
  AdminRoute, 
  TeacherRoute, 
  FamilyRoute, 
  StaffRoute,
  UnauthorizedPage 
} from '../components/auth/ProtectedRoute';
import OidcLogin from '../components/auth/OidcLogin';
import OidcCallback from '../components/auth/OidcCallback';

// Componentes de ejemplo (placeholders)
const AdminDashboard = () => <div>Admin Dashboard</div>;
const TeacherDashboard = () => <div>Teacher Dashboard</div>;
const FamilyDashboard = () => <div>Family Dashboard</div>;
const ApplicationsPage = () => <div>Applications Page</div>;
const UsersPage = () => <div>Users Management</div>;
const EvaluationsPage = () => <div>Evaluations Page</div>;
const InterviewsPage = () => <div>Interviews Page</div>;
const HomePage = () => <div>Home Page</div>;

const AppRouter: React.FC = () => {
  return (
    <OidcProvider>
      <Router>
        <Routes>
          {/* Rutas públicas */}
          <Route path="/" element={<HomePage />} />
          <Route 
            path="/login" 
            element={
              <OidcLogin 
                showDualLogin={true}
                title="Sistema de Admisión MTN"
                redirectPath="/dashboard"
              />
            } 
          />
          <Route path="/callback" element={<OidcCallback />} />
          <Route path="/unauthorized" element={<UnauthorizedPage />} />

          {/* Rutas protegidas para ADMIN */}
          <Route
            path="/admin/*"
            element={
              <AdminRoute>
                <Routes>
                  <Route path="" element={<Navigate to="/admin/dashboard" replace />} />
                  <Route path="dashboard" element={<AdminDashboard />} />
                  <Route path="users" element={<UsersPage />} />
                  <Route path="applications" element={<ApplicationsPage />} />
                  <Route path="evaluations" element={<EvaluationsPage />} />
                  <Route path="interviews" element={<InterviewsPage />} />
                </Routes>
              </AdminRoute>
            }
          />

          {/* Rutas protegidas para PROFESORES */}
          <Route
            path="/professor/*"
            element={
              <TeacherRoute>
                <Routes>
                  <Route path="" element={<Navigate to="/professor/dashboard" replace />} />
                  <Route path="dashboard" element={<TeacherDashboard />} />
                  <Route path="evaluations" element={<EvaluationsPage />} />
                  <Route path="interviews" element={<InterviewsPage />} />
                </Routes>
              </TeacherRoute>
            }
          />

          {/* Rutas protegidas para FAMILIAS */}
          <Route
            path="/family/*"
            element={
              <FamilyRoute>
                <Routes>
                  <Route path="" element={<Navigate to="/family/dashboard" replace />} />
                  <Route path="dashboard" element={<FamilyDashboard />} />
                  <Route path="application" element={<ApplicationsPage />} />
                </Routes>
              </FamilyRoute>
            }
          />

          {/* Rutas protegidas para TODO EL PERSONAL */}
          <Route
            path="/staff/*"
            element={
              <StaffRoute>
                <Routes>
                  <Route path="" element={<Navigate to="/staff/dashboard" replace />} />
                  <Route path="dashboard" element={<AdminDashboard />} />
                  <Route path="applications" element={<ApplicationsPage />} />
                </Routes>
              </StaffRoute>
            }
          />

          {/* Ruta por defecto - redirigir según el rol */}
          <Route 
            path="/dashboard" 
            element={<DashboardRedirect />} 
          />

          {/* 404 - Not Found */}
          <Route 
            path="*" 
            element={
              <div className="text-center mt-8">
                <h1 className="text-2xl font-bold">404 - Página No Encontrada</h1>
                <p className="mt-2">La página que buscas no existe.</p>
              </div>
            } 
          />
        </Routes>
      </Router>
    </OidcProvider>
  );
};

/**
 * Componente para redirigir al dashboard apropiado según el rol del usuario
 */
const DashboardRedirect: React.FC = () => {
  const { roles, isAuthenticated, isLoading } = useOidcAuth();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Redirigir según el rol principal
  if (roles.includes('ADMIN')) {
    return <Navigate to="/admin/dashboard" replace />;
  } else if (roles.includes('APODERADO')) {
    return <Navigate to="/family/dashboard" replace />;
  } else if (roles.some(r => ['TEACHER', 'PSYCHOLOGIST', 'CYCLE_DIRECTOR', 'COORDINATOR'].includes(r))) {
    return <Navigate to="/professor/dashboard" replace />;
  }

  // Si no tiene un rol reconocido, mostrar error
  return <Navigate to="/unauthorized" replace />;
};

export default AppRouter;
export { DashboardRedirect };