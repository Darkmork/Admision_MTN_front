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
// Mock service removido - usando applicationService real
import { useAuth } from '../context/AuthContext';
import ApplicationsTable from '../components/admin/ApplicationsTable';
import SimpleToast from '../components/ui/SimpleToast';
import AdminDataTables from '../components/admin/AdminDataTables';
import StudentDetailModal from '../components/admin/StudentDetailModal';

const sections = [
  { key: 'dashboard', label: 'Dashboard General' },
  { key: 'tablas', label: 'Tablas de Datos' },
  { key: 'postulaciones', label: 'Gestión de Postulaciones' },
  { key: 'evaluaciones', label: 'Gestión de Evaluaciones' },
  { key: 'evaluadores', label: 'Gestión de Evaluadores' },
  { key: 'entrevistas', label: 'Gestión de Entrevistas' },
  { key: 'calendario', label: 'Calendario Global' },
  { key: 'usuarios', label: 'Gestión de Usuarios' },
];

const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState('dashboard');
  const [selectedApplication, setSelectedApplication] = useState<Application | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedPostulante, setSelectedPostulante] = useState<any>(null);
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

  const [archiveDialog, setArchiveDialog] = useState<{
    show: boolean;
    application: Application | null;
    message: string;
  }>({
    show: false,
    application: null,
    message: ''
  });


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
      const apps = await applicationService.getAllApplications();
      setLocalApplications(apps);
    } catch (error) {
      console.error('Error loading local applications:', error);
      // Fallback a datos estáticos
      // Fallback eliminado - solo datos reales del backend
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

  // Transformar datos de Application a Postulante para el modal
  const transformApplicationToPostulante = (app: Application): any => {
    const birthDate = new Date(app.student.birthDate);
    const today = new Date();
    const age = today.getFullYear() - birthDate.getFullYear() - 
               (today.getMonth() < birthDate.getMonth() || 
                (today.getMonth() === birthDate.getMonth() && today.getDate() < birthDate.getDate()) ? 1 : 0);
    
    const nombreCompleto = `${app.student.firstName} ${app.student.lastName}${app.student.maternalLastName ? ' ' + app.student.maternalLastName : ''}`;
    
    return {
      id: app.id,
      // Datos básicos del estudiante
      nombreCompleto,
      nombres: app.student.firstName,
      apellidoPaterno: app.student.lastName,
      apellidoMaterno: app.student.maternalLastName || '',
      rut: app.student.rut,
      fechaNacimiento: app.student.birthDate,
      edad: age,
      
      // Categorías especiales
      esHijoFuncionario: app.student.isEmployeeChild || false,
      nombrePadreFuncionario: app.student.employeeParentName,
      esHijoExalumno: app.student.isAlumniChild || false,
      anioEgresoExalumno: app.student.alumniParentYear,
      esAlumnoInclusion: app.student.isInclusionStudent || false,
      tipoInclusion: app.student.inclusionType,
      notasInclusion: app.student.inclusionNotes,
      
      email: app.student.email,
      direccion: app.student.address,
      
      // Datos académicos
      cursoPostulado: app.student.gradeApplied,
      colegioActual: app.student.currentSchool,
      colegioDestino: (app.student.targetSchool || 'MONTE_TABOR'),
      añoAcademico: '2025',
      
      // Estado de postulación
      estadoPostulacion: app.status,
      fechaPostulacion: app.submissionDate,
      fechaActualizacion: app.submissionDate,
      
      // Contacto principal (usar apoderado como principal)
      nombreContactoPrincipal: app.guardian?.fullName || 'No especificado',
      emailContacto: app.guardian?.email || '',
      telefonoContacto: app.guardian?.phone || '',
      relacionContacto: app.guardian?.relationship || '',
      
      // Datos de padres
      nombrePadre: app.father?.fullName,
      emailPadre: app.father?.email,
      telefonoPadre: app.father?.phone,
      profesionPadre: app.father?.profession,
      
      nombreMadre: app.mother?.fullName,
      emailMadre: app.mother?.email,
      telefonoMadre: app.mother?.phone,
      profesionMadre: app.mother?.profession,
      
      // Información académica y evaluaciones
      documentosCompletos: app.documents ? app.documents.length > 0 : false,
      cantidadDocumentos: app.documents ? app.documents.length : 0,
      evaluacionPendiente: app.status === 'PENDING' || app.status === 'UNDER_REVIEW',
      entrevistaProgramada: app.status === 'INTERVIEW_SCHEDULED',
      fechaEntrevista: app.status === 'INTERVIEW_SCHEDULED' ? new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() : undefined,
      
      // Observaciones
      necesidadesEspeciales: app.student.additionalNotes?.toLowerCase().includes('especial') || false,
      observaciones: app.student.additionalNotes,
      notasInternas: undefined,
      
      // Metadatos
      creadoPor: app.applicantUser?.email || 'Sistema',
      fechaCreacion: app.submissionDate
    };
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

  // Funciones para manejar el modal de detalles
  const handleViewApplicationDetail = (app: Application) => {
    console.log('🔍 handleViewApplicationDetail called with app:', app);
    const postulante = transformApplicationToPostulante(app);
    console.log('✅ Transformed postulante:', postulante);
    setSelectedPostulante(postulante);
    setIsDetailModalOpen(true);
    console.log('📖 Modal state set to open');
  };

  const handleCloseDetailModal = () => {
    setIsDetailModalOpen(false);
    setSelectedPostulante(null);
  };

  const renderSection = () => {
    switch (activeSection) {
      case 'tablas':
        return (
          <div className="space-y-6">
            <AdminDataTables />
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
                onView={handleViewApplicationDetail}
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

          {/* Botón de Acceso al Módulo del Coordinador */}
          <div className="px-4 mb-4">
            <button
              onClick={() => navigate('/coordinador')}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-all bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-md hover:shadow-lg"
            >
              <FiBarChart2 className="w-5 h-5" />
              <div className="flex-1">
                <div className="text-sm font-semibold">Dashboard Coordinador</div>
                <div className="text-xs opacity-90">Analytics y búsqueda avanzada</div>
              </div>
            </button>
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

      {/* Modal de detalles del estudiante */}
      <StudentDetailModal
        isOpen={isDetailModalOpen}
        onClose={handleCloseDetailModal}
        postulante={selectedPostulante}
        onEdit={(postulante) => {
          handleCloseDetailModal();
          // TODO: Implementar edición si se necesita
        }}
        onScheduleInterview={(postulante) => {
          handleCloseDetailModal();
          // TODO: Implementar programación de entrevista si se necesita
        }}
        onUpdateStatus={(postulante, status) => {
          handleCloseDetailModal();
          // TODO: Implementar actualización de estado si se necesita
        }}
      />
    </div>
  );
};

export default AdminDashboard;