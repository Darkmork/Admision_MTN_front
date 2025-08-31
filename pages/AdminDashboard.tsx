import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import Modal from '../components/ui/Modal';
import { DashboardIcon, FileTextIcon, UsersIcon, BarChartIcon, CheckCircleIcon, ClockIcon, UserIcon } from '../components/icons/Icons';
import { 
  FiFileText, 
  FiBarChart2, 
  FiFile, 
  FiKey, 
  FiMail, 
  FiAlertTriangle, 
  FiCheckCircle, 
  FiXCircle, 
  FiRefreshCw, 
  FiEdit,
  FiUser,
  FiBookOpen,
  FiCalendar,
  FiClock,
  FiEye,
  FiDownload,
  FiUpload,
  FiPlus,
  FiTrash2,
  FiSettings,
  FiList,
  FiAlertCircle,
  FiInfo,
  FiCheck,
  FiX,
  FiSearch
} from 'react-icons/fi';
import CreateUserForm from '../components/admin/CreateUserForm';
import { CreateUserRequest, UserRole, User } from '../types/user';
import { useApplications, useNotifications, useAppContext } from '../context/AppContext';
import { userService } from '../services/userService';
import { 
  evaluationService
} from '../services/evaluationService';
import {
  Evaluation, 
  EvaluationType, 
  EvaluationStatus,
  EVALUATION_TYPE_LABELS,
  EVALUATION_STATUS_LABELS 
} from '../types/evaluation';
import EvaluationManagement from '../components/admin/EvaluationManagement';
import EvaluationStatistics from '../components/admin/EvaluationStatistics';
import EvaluationReports from '../components/admin/EvaluationReports';
import EvaluatorManagement from '../components/admin/EvaluatorManagement';
import { UserManagement } from '../components/users';
import { InterviewManagement } from '../components/interviews';
import SharedCalendar from '../components/admin/SharedCalendar';
import { Application, applicationService } from '../services/applicationService';
import { mockApplications, mockApplicationService } from '../services/mockApplicationService';
import { useAuth } from '../context/AuthContext';
import ApplicationsTable from '../components/admin/ApplicationsTable';
import SimpleToast from '../components/ui/SimpleToast';
import { analyticsService, CompleteAnalytics } from '../services/analyticsService';
import AdminDataTables from '../components/admin/AdminDataTables';
import InstitutionalEmailManager from '../components/admin/InstitutionalEmailManager';
import UnifiedDashboard from '../components/dashboard/UnifiedDashboard';
import { unifiedApiService, DashboardAPI } from '../services/unifiedApiService';


const sections = [
  { key: 'dashboard', label: 'Dashboard General' },
  { key: 'unified-dashboard', label: '🎯 Dashboard Unificado' },
  { key: 'tablas', label: 'Tablas de Datos' },
  { key: 'postulaciones', label: 'Gestión de Postulaciones' },
  { key: 'evaluaciones', label: 'Gestión de Evaluaciones' },
  { key: 'evaluadores', label: 'Gestión de Evaluadores' },
  { key: 'entrevistas', label: 'Gestión de Entrevistas' },
  { key: 'emails-institucionales', label: 'Emails Institucionales' },
  { key: 'calendario', label: 'Calendario Global' },
  { key: 'analytics', label: 'Análisis de Datos' },
  { key: 'reportes', label: 'Reportes' },
  { key: 'usuarios', label: 'Gestión de Usuarios' },
  { key: 'notificaciones', label: 'Notificaciones' },
  { key: 'historial', label: 'Historial de Acciones' },

];

const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState('dashboard');
  const [selectedApplication, setSelectedApplication] = useState<Application | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [dateFilter, setDateFilter] = useState({ start: '', end: '' });
  const [statusFilter, setStatusFilter] = useState('all');
  
  // Estados para cambio de contraseña
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  
  // Estados para gestión de usuarios
  const [showCreateUserForm, setShowCreateUserForm] = useState(false);
  const [showEditUserForm, setShowEditUserForm] = useState(false);
  const [showActivityModal, setShowActivityModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [showCredentialsModal, setShowCredentialsModal] = useState(false);
  const [showAuditModal, setShowAuditModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [userFilter, setUserFilter] = useState({
    role: 'all',
    status: 'all',
    search: ''
  });
  const [isLoadingUsers, setIsLoadingUsers] = useState(false);
  
  // Evaluation management state
  const [evaluations, setEvaluations] = useState<Evaluation[]>([]);
  const [isLoadingEvaluations, setIsLoadingEvaluations] = useState(false);
  const [evaluationFilter, setEvaluationFilter] = useState({
    status: 'all',
    type: 'all',
    evaluator: 'all'
  });
  const [evaluationSubsection, setEvaluationSubsection] = useState<'management' | 'statistics' | 'reports'>('management');
  const [showAssignEvaluationModal, setShowAssignEvaluationModal] = useState(false);
  const [selectedApplicationForEvaluation, setSelectedApplicationForEvaluation] = useState<Application | null>(null);
  
  // Estados para aplicaciones reales
  const { applications } = useApplications();
  const { addNotification } = useNotifications();
  const { user, logout } = useAuth();
  const { dispatch } = useAppContext();
  
  // Estado local para aplicaciones (para evaluadores)
  const [localApplications, setLocalApplications] = useState<Application[]>([]);
  const [isLoadingLocalApplications, setIsLoadingLocalApplications] = useState(false);

  // Estados para gestión de postulaciones
  const [adminApplications, setAdminApplications] = useState<Application[]>([]);
  const [isLoadingAdminApplications, setIsLoadingAdminApplications] = useState(false);
  const [applicationToast, setApplicationToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  
  // Estados para analytics
  const [analyticsData, setAnalyticsData] = useState<CompleteAnalytics | null>(null);
  const [isLoadingAnalytics, setIsLoadingAnalytics] = useState(false);
  const [analyticsError, setAnalyticsError] = useState<string | null>(null);
  const [archiveDialog, setArchiveDialog] = useState<{
    show: boolean;
    application: Application | null;
    message: string;
  }>({
    show: false,
    application: null,
    message: ''
  });

  // Estados para dashboard unificado
  const [unifiedDashboardData, setUnifiedDashboardData] = useState<any>(null);
  const [isLoadingUnifiedDashboard, setIsLoadingUnifiedDashboard] = useState(false);
  const [unifiedDashboardError, setUnifiedDashboardError] = useState<string | null>(null);

  useEffect(() => {
    loadApplications();
    if (activeSection === 'usuarios') {
      loadUsers();
    }
    if (activeSection === 'evaluadores') {
      loadLocalApplications();
    }
    if (activeSection === 'postulaciones') {
      loadAdminApplications();
    }
    if (activeSection === 'analytics') {
      loadAnalyticsData();
    }
    if (activeSection === 'unified-dashboard') {
      loadUnifiedDashboardData();
    }
  }, [activeSection]);

  const loadApplications = async () => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      // Use the applicationService which handles the API calls properly
      const applications = await applicationService.getAllApplications();
      dispatch({ type: 'SET_APPLICATIONS', payload: applications });
    } catch (error) {
      console.error('Error loading applications:', error);
      // applicationService already handles fallbacks, but set empty array if it fails completely
      dispatch({ type: 'SET_APPLICATIONS', payload: [] });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const loadLocalApplications = async () => {
    try {
      setIsLoadingLocalApplications(true);
      const apps = await mockApplicationService.getAllApplications();
      setLocalApplications(apps);
    } catch (error) {
      console.error('Error loading local applications:', error);
      // Fallback a datos estáticos
      setLocalApplications(mockApplications);
    } finally {
      setIsLoadingLocalApplications(false);
    }
  };

  const loadUsers = async () => {
    try {
      setIsLoadingUsers(true);
      const usersData = await userService.getSchoolStaffUsers();
      // userService devuelve PagedResponse, necesitamos solo el contenido (solo staff del colegio)
      setUsers(usersData.content || []);
    } catch (error) {
      console.error('Error cargando usuarios:', error);
      addNotification({
        type: 'error',
        title: 'Error',
        message: 'No se pudieron cargar los usuarios'
      });
    } finally {
      setIsLoadingUsers(false);
    }
  };

  const loadAdminApplications = async () => {
    try {
      setIsLoadingAdminApplications(true);
      const appsData = await applicationService.getAllApplications();
      setAdminApplications(appsData || []);
    } catch (error) {
      console.error('Error cargando postulaciones admin:', error);
      showApplicationToast('No se pudieron cargar las postulaciones', 'error');
    } finally {
      setIsLoadingAdminApplications(false);
    }
  };

  const loadAnalyticsData = async () => {
    try {
      setIsLoadingAnalytics(true);
      setAnalyticsError(null);
      console.log('🔄 Cargando datos de analytics...');
      
      const data = await analyticsService.getCompleteAnalytics();
      console.log('✅ Datos de analytics obtenidos:', data);
      
      setAnalyticsData(data);
    } catch (error: any) {
      console.error('❌ Error cargando analytics:', error);
      setAnalyticsError(error.message || 'Error al cargar datos de análisis');
      
      // Solo mostrar toast de error si no es un error de autenticación (401)
      // El error 401 se maneja automáticamente en el interceptor de api.ts
      if (error.response?.status !== 401) {
        addNotification({
          type: 'error',
          title: 'Error de Analytics',
          message: 'No se pudieron cargar los datos de análisis: ' + error.message
        });
      }
    } finally {
      setIsLoadingAnalytics(false);
    }
  };

  const loadUnifiedDashboardData = async () => {
    try {
      setIsLoadingUnifiedDashboard(true);
      setUnifiedDashboardError(null);
      console.log('🎯 Cargando dashboard unificado...');
      
      // Un solo API call para obtener todos los datos del dashboard
      const data = await DashboardAPI.getAdmin();
      console.log('✅ Dashboard unificado obtenido:', data);
      
      setUnifiedDashboardData(data);
    } catch (error: any) {
      console.error('❌ Error cargando dashboard unificado:', error);
      setUnifiedDashboardError(error.message || 'Error al cargar dashboard unificado');
      
      if (error.response?.status !== 401) {
        addNotification({
          type: 'error',
          title: 'Error del Dashboard Unificado',
          message: 'No se pudo cargar el dashboard: ' + error.message
        });
      }
    } finally {
      setIsLoadingUnifiedDashboard(false);
    }
  };

  // Mostrar toast para aplicaciones
  const showApplicationToast = (message: string, type: 'success' | 'error') => {
    setApplicationToast({ message, type });
    setTimeout(() => setApplicationToast(null), 5000);
  };

  // Confirmar archivado de postulación
  const confirmArchive = (application: Application) => {
    const message = `⚠️ ¿Estás seguro de que deseas ARCHIVAR la postulación de ${application.student.firstName} ${application.student.lastName}?

Esta acción:
• Cerrará el proceso de admisión del estudiante
• La postulación no aparecerá en la lista activa
• Quedará archivada en el sistema para consultas futuras
• Esta acción no se puede deshacer fácilmente`;

    setArchiveDialog({
      show: true,
      application,
      message
    });
  };

  // Ejecutar archivado
  const executeArchive = async () => {
    const { application } = archiveDialog;
    if (!application) return;

    try {
      await applicationService.archiveApplication(application.id);
      showApplicationToast(`Postulación de ${application.student.firstName} ${application.student.lastName} archivada exitosamente`, 'success');
      await loadAdminApplications(); // Recargar la lista
    } catch (error: any) {
      showApplicationToast(error.message || 'Error al archivar la postulación', 'error');
    } finally {
      setArchiveDialog({ show: false, application: null, message: '' });
    }
  };

  const renderSection = () => {
    switch (activeSection) {
      case 'tablas':
        return (
          <div className="space-y-6">
            <AdminDataTables />
          </div>
        );

      case 'unified-dashboard':
        return (
          <div className="space-y-6">
            {/* Header con información del sistema consolidado */}
            <Card className="p-6 bg-gradient-to-r from-green-500 to-blue-600 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold mb-2">
                    🎯 Dashboard Unificado API v2.0
                  </h2>
                  <p className="text-green-100 mb-2">
                    Sistema consolidado: 317 → 50 endpoints (~84% reducción)
                  </p>
                  <p className="text-green-200 text-sm">
                    1 API call vs 8-15 calls tradicionales • Latencia reducida 75% • Mejor caching
                  </p>
                </div>
                <div className="text-right">
                  <Button 
                    variant="outline" 
                    className="text-white border-white hover:bg-white hover:text-green-600 mb-2"
                    onClick={loadUnifiedDashboardData}
                    disabled={isLoadingUnifiedDashboard}
                  >
                    <FiRefreshCw className={`w-4 h-4 mr-2 ${isLoadingUnifiedDashboard ? 'animate-spin' : ''}`} />
                    {isLoadingUnifiedDashboard ? 'Cargando...' : 'Actualizar'}
                  </Button>
                  <p className="text-xs text-green-100">
                    API Calls optimizadas
                  </p>
                </div>
              </div>
            </Card>

            {/* Mostrar el componente UnifiedDashboard */}
            <UnifiedDashboard />

            {/* Métricas de performance del nuevo sistema */}
            <Card className="p-6 bg-blue-50 border-blue-200">
              <h3 className="text-lg font-semibold text-blue-900 mb-4 flex items-center">
                <FiBarChart2 className="w-5 h-5 mr-2" />
                Métricas de Performance del Sistema Unificado
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="text-center">
                  <p className="text-3xl font-bold text-blue-600">84%</p>
                  <p className="text-sm text-blue-700">Reducción de Endpoints</p>
                  <p className="text-xs text-gray-600">317 → ~50 endpoints</p>
                </div>
                <div className="text-center">
                  <p className="text-3xl font-bold text-green-600">80%</p>
                  <p className="text-sm text-green-700">Menos API Calls</p>
                  <p className="text-xs text-gray-600">8-15 → 1-3 calls</p>
                </div>
                <div className="text-center">
                  <p className="text-3xl font-bold text-purple-600">75%</p>
                  <p className="text-sm text-purple-700">Mejora Latencia</p>
                  <p className="text-xs text-gray-600">~2000ms → ~500ms</p>
                </div>
                <div className="text-center">
                  <p className="text-3xl font-bold text-orange-600">60%</p>
                  <p className="text-sm text-orange-700">Reducción Bandwidth</p>
                  <p className="text-xs text-gray-600">Datos consolidados</p>
                </div>
              </div>
            </Card>

            {/* Comparación de arquitecturas */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="p-6 border-red-200 bg-red-50">
                <h3 className="text-lg font-semibold text-red-800 mb-4">
                  ❌ Arquitectura Anterior (Fragmentada)
                </h3>
                <ul className="space-y-2 text-sm text-red-700">
                  <li>• 317 endpoints distribuidos en 37 controladores</li>
                  <li>• 25 servicios frontend separados</li>
                  <li>• 8-15 API calls por dashboard</li>
                  <li>• Lógica duplicada en múltiples endpoints</li>
                  <li>• Mantenimiento complejo con alta fragmentación</li>
                </ul>
              </Card>

              <Card className="p-6 border-green-200 bg-green-50">
                <h3 className="text-lg font-semibold text-green-800 mb-4">
                  ✅ Nueva Arquitectura (Consolidada)
                </h3>
                <ul className="space-y-2 text-sm text-green-700">
                  <li>• ~50 endpoints principales con parámetros dinámicos</li>
                  <li>• 1 servicio unificado con métodos especializados</li>
                  <li>• 1-3 API calls máximo por dashboard</li>
                  <li>• Lógica centralizada y reutilizable</li>
                  <li>• Mantenimiento simplificado con patrones estándar</li>
                </ul>
              </Card>
            </div>
          </div>
        );

      case 'dashboard':
        return (
          <div className="space-y-6">
            {/* Welcome Card */}
            <Card className="p-6 bg-gradient-to-r from-azul-monte-tabor to-blue-600 text-white">
              <h2 className="text-2xl font-bold mb-2">
                Bienvenido/a, {user?.firstName} {user?.lastName}
              </h2>
              <p className="text-blue-100 mb-4">
                Panel de administración del sistema de admisión
              </p>
              <div className="flex gap-4">
                <Button 
                  variant="outline" 
                  className="text-white border-white hover:bg-white hover:text-azul-monte-tabor"
                  onClick={() => setActiveSection('postulaciones')}
                >
                  Ver Postulaciones
                </Button>
                <Button 
                  variant="outline" 
                  className="text-white border-white hover:bg-white hover:text-azul-monte-tabor"
                  onClick={() => setActiveSection('evaluaciones')}
                >
                  Gestionar Evaluaciones
                </Button>
              </div>
            </Card>

            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <Card className="p-4 text-center">
                <FileTextIcon className="w-8 h-8 text-blue-500 mx-auto mb-2" />
                <p className="text-2xl font-bold text-blue-600">
                  {applications.length}
                </p>
                <p className="text-sm text-gris-piedra">Total Postulaciones</p>
              </Card>
              
              <Card className="p-4 text-center">
                <ClockIcon className="w-8 h-8 text-yellow-500 mx-auto mb-2" />
                <p className="text-2xl font-bold text-yellow-600">
                  {applications.filter(app => app.status === 'PENDING').length}
                </p>
                <p className="text-sm text-gris-piedra">Pendientes</p>
              </Card>
              
              <Card className="p-4 text-center">
                <CheckCircleIcon className="w-8 h-8 text-green-500 mx-auto mb-2" />
                <p className="text-2xl font-bold text-green-600">
                  {applications.filter(app => app.status === 'APPROVED').length}
                </p>
                <p className="text-sm text-gris-piedra">Aprobadas</p>
              </Card>
              
              <Card className="p-4 text-center">
                <UsersIcon className="w-8 h-8 text-purple-500 mx-auto mb-2" />
                <p className="text-2xl font-bold text-purple-600">
                  {users.length}
                </p>
                <p className="text-sm text-gris-piedra">Usuarios Sistema</p>
              </Card>
            </div>
          </div>
        );

      case 'evaluaciones':
        return (
          <div className="space-y-6">
            {/* Navigation tabs for subsections */}
            <div className="flex gap-2">
              <Button
                variant={evaluationSubsection === 'management' ? 'primary' : 'outline'}
                onClick={() => setEvaluationSubsection('management')}
              >
                <FiList className="w-5 h-5 mr-2" />
                Gestión de Evaluaciones
              </Button>
              <Button
                variant={evaluationSubsection === 'statistics' ? 'primary' : 'outline'}
                onClick={() => setEvaluationSubsection('statistics')}
              >
                <FiBarChart2 className="w-5 h-5 mr-2" />
                Estadísticas y Análisis
              </Button>
              <Button
                variant={evaluationSubsection === 'reports' ? 'primary' : 'outline'}
                onClick={() => setEvaluationSubsection('reports')}
              >
                <FiFile className="w-5 h-5 mr-2" />
                Informes y Reportes
              </Button>
            </div>

            {/* Render appropriate subsection */}
            {evaluationSubsection === 'management' ? (
              <EvaluationManagement 
                applications={applications} 
                onRefresh={loadApplications}
              />
            ) : evaluationSubsection === 'statistics' ? (
              <EvaluationStatistics />
            ) : (
              <EvaluationReports 
                applications={applications}
                onRefresh={loadApplications}
              />
            )}
          </div>
        );

      case 'evaluadores':
        return (
          <div className="space-y-6">
            <EvaluatorManagement 
              applications={localApplications} 
              onRefresh={loadLocalApplications}
            />
          </div>
        );

      case 'postulaciones':
        return (
          <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <FileTextIcon className="w-8 h-8 text-azul-monte-tabor" />
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">
                    Gestión de Postulaciones
                  </h1>
                  <p className="text-sm text-gray-600">
                    Administra todas las postulaciones del sistema
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <Button
                  variant="outline"
                  onClick={loadAdminApplications}
                  disabled={isLoadingAdminApplications}
                >
                  <FiRefreshCw className={`w-5 h-5 mr-2 ${isLoadingAdminApplications ? 'animate-spin' : ''}`} />
                  Actualizar
                </Button>
              </div>
            </div>

            {/* Estadísticas rápidas */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card className="p-4 text-center">
                <FileTextIcon className="w-6 h-6 text-blue-500 mx-auto mb-2" />
                <p className="text-2xl font-bold text-blue-600">
                  {adminApplications.length}
                </p>
                <p className="text-sm text-gray-600">Total Activas</p>
              </Card>
              
              <Card className="p-4 text-center">
                <ClockIcon className="w-6 h-6 text-yellow-500 mx-auto mb-2" />
                <p className="text-2xl font-bold text-yellow-600">
                  {adminApplications.filter(app => app.status === 'SUBMITTED').length}
                </p>
                <p className="text-sm text-gray-600">Nuevas</p>
              </Card>
              
              <Card className="p-4 text-center">
                <CheckCircleIcon className="w-6 h-6 text-green-500 mx-auto mb-2" />
                <p className="text-2xl font-bold text-green-600">
                  {adminApplications.filter(app => app.status === 'APPROVED').length}
                </p>
                <p className="text-sm text-gray-600">Aceptadas</p>
              </Card>
              
              <Card className="p-4 text-center">
                <UsersIcon className="w-6 h-6 text-purple-500 mx-auto mb-2" />
                <p className="text-2xl font-bold text-purple-600">
                  {adminApplications.filter(app => app.status === 'UNDER_REVIEW').length}
                </p>
                <p className="text-sm text-gray-600">En Revisión</p>
              </Card>
            </div>

            {/* Tabla de postulaciones */}
            <Card className="p-6">
              <ApplicationsTable
                applications={adminApplications}
                isLoading={isLoadingAdminApplications}
                onView={(app) => {
                  // TODO: Implementar vista detallada
                  console.log('Ver postulación:', app);
                }}
                onArchive={confirmArchive}
              />
            </Card>
          </div>
        );

      case 'usuarios':
        return (
          <div className="space-y-6">
            <UserManagement onBack={() => setActiveSection('dashboard')} />
          </div>
        );

      case 'emails-institucionales':
        return (
          <div className="space-y-6">
            <InstitutionalEmailManager onBack={() => setActiveSection('dashboard')} />
          </div>
        );
      case 'entrevistas':
        return (
          <div className="space-y-6">
            <InterviewManagement onBack={() => setActiveSection('dashboard')} />
          </div>
        );
      case 'calendario':
        return (
          <div className="space-y-6">
            <SharedCalendar 
              onCreateInterview={(date, time) => {
                // Cambiar a la sección de entrevistas y abrir formulario de creación
                setActiveSection('entrevistas');
                // Aquí podrías pasar los datos de fecha/hora al componente
              }}
            />
          </div>
        );

      case 'reportes':
        // Navegar al dashboard de reportes
        navigate('/reportes');
        return null;

      case 'analytics':
        return (
          <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <BarChartIcon className="w-8 h-8 text-azul-monte-tabor" />
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">
                    Análisis de Datos
                  </h1>
                  <p className="text-sm text-gray-600">
                    Métricas y estadísticas del proceso de admisión en tiempo real
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <Button
                  variant="outline"
                  onClick={loadAnalyticsData}
                  disabled={isLoadingAnalytics}
                >
                  <FiRefreshCw className={`w-5 h-5 mr-2 ${isLoadingAnalytics ? 'animate-spin' : ''}`} />
                  {isLoadingAnalytics ? 'Cargando...' : 'Actualizar Análisis'}
                </Button>
              </div>
            </div>

            {/* Estado de carga o error */}
            {isLoadingAnalytics ? (
              <div className="flex justify-center items-center py-12">
                <div className="flex items-center space-x-3">
                  <FiRefreshCw className="w-8 h-8 animate-spin text-azul-monte-tabor" />
                  <span className="text-lg text-gray-600">Cargando análisis de datos...</span>
                </div>
              </div>
            ) : analyticsError ? (
              <div className="bg-red-50 border border-red-200 rounded-lg p-6">
                <div className="flex items-center space-x-3">
                  <FiAlertCircle className="w-6 h-6 text-red-500" />
                  <div>
                    <h3 className="text-red-800 font-medium">Error al cargar datos</h3>
                    <p className="text-red-600 text-sm mt-1">{analyticsError}</p>
                  </div>
                </div>
                <Button
                  variant="outline"
                  onClick={loadAnalyticsData}
                  className="mt-4 border-red-300 text-red-700 hover:bg-red-50"
                >
                  <FiRefreshCw className="w-4 h-4 mr-2" />
                  Reintentar
                </Button>
              </div>
            ) : analyticsData ? (
              <>
                {/* Métricas Principales */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  <Card className="p-6 bg-gradient-to-r from-blue-500 to-blue-600 text-white">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-blue-100 text-sm mb-1">Total Postulaciones</p>
                        <p className="text-3xl font-bold">{analyticsData.dashboardMetrics.totalApplications}</p>
                        <p className="text-blue-200 text-xs mt-2">
                          +{analyticsData.dashboardMetrics.applicationsThisMonth} este mes
                        </p>
                      </div>
                      <FileTextIcon className="w-12 h-12 text-blue-200" />
                    </div>
                  </Card>

                  <Card className="p-6 bg-gradient-to-r from-green-500 to-green-600 text-white">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-green-100 text-sm mb-1">Tasa de Conversión</p>
                        <p className="text-3xl font-bold">{analyticsData.dashboardMetrics.conversionRate}%</p>
                        <p className="text-green-200 text-xs mt-2">
                          {analyticsData.dashboardMetrics.acceptedApplications} aceptadas
                        </p>
                      </div>
                      <CheckCircleIcon className="w-12 h-12 text-green-200" />
                    </div>
                  </Card>

                  <Card className="p-6 bg-gradient-to-r from-yellow-500 to-yellow-600 text-white">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-yellow-100 text-sm mb-1">Tiempo Promedio</p>
                        <p className="text-3xl font-bold">{analyticsData.dashboardMetrics.averageCompletionDays} días</p>
                        <p className="text-yellow-200 text-xs mt-2">
                          Para completar postulación
                        </p>
                      </div>
                      <ClockIcon className="w-12 h-12 text-yellow-200" />
                    </div>
                  </Card>

                  <Card className="p-6 bg-gradient-to-r from-purple-500 to-purple-600 text-white">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-purple-100 text-sm mb-1">Evaluadores Activos</p>
                        <p className="text-3xl font-bold">{analyticsData.dashboardMetrics.activeEvaluators}</p>
                        <p className="text-purple-200 text-xs mt-2">
                          {analyticsData.dashboardMetrics.totalActiveUsers} usuarios totales
                        </p>
                      </div>
                      <UsersIcon className="w-12 h-12 text-purple-200" />
                    </div>
                  </Card>
            </div>

            {/* Gráficos y Análisis */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Distribución por Estado */}
                <Card className="p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <FiBarChart2 className="w-5 h-5 mr-2 text-azul-monte-tabor" />
                    Distribución por Estado
                  </h3>
                  <div className="space-y-3">
                    {Object.entries(analyticsData.statusDistribution.statusCount).map(([status, count]) => (
                      <div key={status} className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className={`w-3 h-3 rounded-full ${
                            status === 'PENDING' ? 'bg-gray-500' :
                            status === 'UNDER_REVIEW' ? 'bg-yellow-500' :
                            status === 'APPROVED' ? 'bg-green-500' :
                            status === 'REJECTED' ? 'bg-red-500' :
                            status === 'WAITLIST' ? 'bg-orange-500' :
                            'bg-blue-500'
                          }`}></div>
                          <span className="text-sm text-gray-700">{status}</span>
                        </div>
                        <div className="flex items-center space-x-3">
                          <span className="text-sm font-medium">{count}</span>
                          <div className="w-20 bg-gray-200 rounded-full h-2">
                            <div 
                              className={`h-2 rounded-full ${
                                status === 'PENDING' ? 'bg-gray-500' :
                                status === 'UNDER_REVIEW' ? 'bg-yellow-500' :
                                status === 'APPROVED' ? 'bg-green-500' :
                                status === 'REJECTED' ? 'bg-red-500' :
                                status === 'WAITLIST' ? 'bg-orange-500' :
                                'bg-blue-500'
                              }`}
                              style={{
                                width: `${analyticsData.statusDistribution.statusPercentages[status] || 0}%`
                              }}
                            ></div>
                          </div>
                          <span className="text-xs text-gray-500">
                            {Math.round(analyticsData.statusDistribution.statusPercentages[status] || 0)}%
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>

              {/* Distribución por Grado */}
              <Card className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <FiBookOpen className="w-5 h-5 mr-2 text-azul-monte-tabor" />
                  Distribución por Grado
                </h3>
                <div className="space-y-3">
                  {Object.entries(analyticsData.gradeDistribution.gradeCount).map(([grade, count]) => (
                    <div key={grade} className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-3 h-3 rounded-full bg-azul-monte-tabor"></div>
                        <span className="text-sm text-gray-700">{grade}</span>
                      </div>
                      <div className="flex items-center space-x-3">
                        <span className="text-sm font-medium">{count}</span>
                        <div className="w-20 bg-gray-200 rounded-full h-2">
                          <div 
                            className="h-2 rounded-full bg-azul-monte-tabor"
                            style={{
                              width: `${analyticsData.gradeDistribution.gradePercentages[grade] || 0}%`
                            }}
                          ></div>
                        </div>
                        <span className="text-xs text-gray-500">
                          {Math.round(analyticsData.gradeDistribution.gradePercentages[grade] || 0)}%
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            </div>

            {/* Métricas de Evaluadores */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <FiUser className="w-5 h-5 mr-2 text-azul-monte-tabor" />
                Análisis de Evaluadores
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <p className="text-2xl font-bold text-azul-monte-tabor">
                    {analyticsData.evaluatorAnalysis.teacherLanguage}
                  </p>
                  <p className="text-sm text-gray-600">Profesores de Lenguaje</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-azul-monte-tabor">
                    {analyticsData.evaluatorAnalysis.teacherMathematics}
                  </p>
                  <p className="text-sm text-gray-600">Profesores de Matemáticas</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-azul-monte-tabor">
                    {analyticsData.evaluatorAnalysis.teacherEnglish}
                  </p>
                  <p className="text-sm text-gray-600">Profesores de Inglés</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-azul-monte-tabor">
                    {analyticsData.evaluatorAnalysis.psychologist}
                  </p>
                  <p className="text-sm text-gray-600">Psicólogos</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-azul-monte-tabor">
                    {analyticsData.evaluatorAnalysis.cycleDirector}
                  </p>
                  <p className="text-sm text-gray-600">Directores de Ciclo</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-azul-monte-tabor">
                    {analyticsData.evaluatorAnalysis.admin}
                  </p>
                  <p className="text-sm text-gray-600">Administradores</p>
                </div>
              </div>
            </Card>

            {/* Tendencias Temporales */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <FiCalendar className="w-5 h-5 mr-2 text-azul-monte-tabor" />
                Tendencias Temporales
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="text-md font-medium text-gray-800 mb-3">Postulaciones por Mes</h4>
                  <div className="space-y-2">
                    {Object.entries(analyticsData.temporalTrends.monthlyApplications)
                      .sort()
                      .slice(-6) // Últimos 6 meses
                      .map(([month, count]) => {
                        const maxCount = Math.max(...Object.values(analyticsData.temporalTrends.monthlyApplications));
                        return (
                          <div key={month} className="flex items-center justify-between">
                            <span className="text-sm text-gray-700">{month}</span>
                            <div className="flex items-center space-x-2">
                              <div className="w-16 bg-gray-200 rounded-full h-2">
                                <div 
                                  className="h-2 rounded-full bg-azul-monte-tabor"
                                  style={{
                                    width: `${Math.max((count / Math.max(maxCount, 1)) * 100, 5)}%`
                                  }}
                                ></div>
                              </div>
                              <span className="text-sm font-medium w-8 text-right">{count}</span>
                            </div>
                          </div>
                        );
                      })}
                  </div>
                </div>

                <div>
                  <h4 className="text-md font-medium text-gray-800 mb-3">Métricas de Rendimiento</h4>
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-gray-600">Postulaciones Completadas</span>
                        <span className="font-medium">
                          {Math.round(analyticsData.performanceMetrics.completionRate)}%
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="h-2 rounded-full bg-green-500"
                          style={{
                            width: `${analyticsData.performanceMetrics.completionRate}%`
                          }}
                        ></div>
                      </div>
                    </div>
                    
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-gray-600">En Proceso de Evaluación</span>
                        <span className="font-medium">
                          {Math.round(analyticsData.performanceMetrics.underReviewRate)}%
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="h-2 rounded-full bg-yellow-500"
                          style={{
                            width: `${analyticsData.performanceMetrics.underReviewRate}%`
                          }}
                        ></div>
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-gray-600">Proceso Finalizado</span>
                        <span className="font-medium">
                          {Math.round(analyticsData.performanceMetrics.finalizationRate)}%
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="h-2 rounded-full bg-azul-monte-tabor"
                          style={{
                            width: `${analyticsData.performanceMetrics.finalizationRate}%`
                          }}
                        ></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </Card>

            {/* Insights y Recomendaciones */}
            <Card className="p-6 bg-blue-50 border-blue-200">
              <h3 className="text-lg font-semibold text-blue-900 mb-4 flex items-center">
                <FiInfo className="w-5 h-5 mr-2" />
                Insights y Recomendaciones
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {analyticsData.insights.recommendations.map((insight, index) => {
                  const getIconComponent = (type: string) => {
                    switch (type) {
                      case 'workload': return <FiAlertCircle className="w-4 h-4 mr-1" />;
                      case 'efficiency': return <FiCheck className="w-4 h-4 mr-1" />;
                      case 'resources': return <FiUser className="w-4 h-4 mr-1" />;
                      case 'trend': return <FiBarChart2 className="w-4 h-4 mr-1" />;
                      default: return <FiInfo className="w-4 h-4 mr-1" />;
                    }
                  };

                  const getBorderColor = (level: string) => {
                    switch (level) {
                      case 'success': return 'border-green-200';
                      case 'warning': return 'border-yellow-200';
                      case 'error': return 'border-red-200';
                      default: return 'border-blue-200';
                    }
                  };

                  const getTextColor = (level: string) => {
                    switch (level) {
                      case 'success': return 'text-green-700';
                      case 'warning': return 'text-yellow-700';
                      case 'error': return 'text-red-700';
                      default: return 'text-blue-700';
                    }
                  };

                  const getTitleColor = (level: string) => {
                    switch (level) {
                      case 'success': return 'text-green-800';
                      case 'warning': return 'text-yellow-800';
                      case 'error': return 'text-red-800';
                      default: return 'text-blue-800';
                    }
                  };

                  return (
                    <div 
                      key={index} 
                      className={`bg-white p-4 rounded-lg border ${getBorderColor(insight.level)}`}
                    >
                      <h4 className={`font-medium mb-2 flex items-center ${getTitleColor(insight.level)}`}>
                        {getIconComponent(insight.type)}
                        {insight.title}
                      </h4>
                      <p className={`text-sm ${getTextColor(insight.level)}`}>
                        {insight.message}
                      </p>
                    </div>
                  );
                })}
              </div>
            </Card>
          </>
        ) : null}
        </div>
      );

      default:
        return (
          <Card className="p-6">
            <h2 className="text-xl font-bold text-azul-monte-tabor mb-4">
              Sección en Desarrollo
            </h2>
            <p className="text-gris-piedra">Esta sección estará disponible próximamente.</p>
          </Card>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex">
        {/* Sidebar */}
        <aside className="w-64 bg-white shadow-md min-h-screen flex flex-col">
          <div className="p-6">
            <h1 className="text-xl font-bold text-azul-monte-tabor">Panel Admin</h1>
            <p className="text-sm text-gris-piedra mt-1">{user?.firstName} {user?.lastName}</p>
          </div>
          <nav className="px-4 flex-1">
            {sections.map(section => (
              <button
                key={section.key}
                onClick={() => setActiveSection(section.key)}
                className={`w-full flex items-center gap-3 px-4 py-3 mb-2 rounded-lg text-left transition-colors ${
                  activeSection === section.key
                    ? 'bg-azul-monte-tabor text-white'
                    : 'text-gris-piedra hover:bg-gray-100'
                }`}
              >
                <span className="text-sm">{section.label}</span>
              </button>
            ))}
          </nav>
          <div className="p-4 border-t border-gray-200 mt-auto">
            <Button
              variant="primary"
              className="w-full bg-azul-monte-tabor hover:bg-blue-700 text-white font-medium py-3 transition-all duration-200 shadow-md hover:shadow-lg"
              onClick={() => logout()}
            >
              Cerrar Sesión
            </Button>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-6">
          {renderSection()}
        </main>
      </div>

      {/* Modal de confirmación para archivar postulación */}
      <Modal
        isOpen={archiveDialog.show}
        onClose={() => setArchiveDialog({ show: false, application: null, message: '' })}
        title="Archivar Postulación"
        size="md"
      >
        <div className="space-y-4">
          <div className="flex items-start space-x-3">
            <FiAlertTriangle className="w-6 h-6 text-orange-500 mt-1" />
            <p className="text-gray-700 whitespace-pre-line">{archiveDialog.message}</p>
          </div>
          
          <div className="flex justify-end space-x-3">
            <Button
              variant="outline"
              onClick={() => setArchiveDialog({ show: false, application: null, message: '' })}
            >
              Cancelar
            </Button>
            <Button
              variant="primary"
              onClick={executeArchive}
              className="bg-orange-600 hover:bg-orange-700"
            >
              Archivar Postulación
            </Button>
          </div>
        </div>
      </Modal>

      {/* Toast para aplicaciones */}
      {applicationToast && (
        <SimpleToast
          message={applicationToast.message}
          type={applicationToast.type}
          onClose={() => setApplicationToast(null)}
        />
      )}
    </div>
  );
};

export default AdminDashboard;