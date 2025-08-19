import React, { useState, useEffect } from 'react';
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
import { schoolUserService } from '../services/schoolUserService';
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
import { Application } from '../services/applicationService';
import { mockApplications, mockApplicationService } from '../services/mockApplicationService';
import { useAuth } from '../context/AuthContext';


const sections = [
  { key: 'dashboard', label: 'Dashboard General' },
  { key: 'postulaciones', label: 'Gestión de Postulaciones' },
  { key: 'evaluaciones', label: 'Gestión de Evaluaciones' },
  { key: 'evaluadores', label: 'Gestión de Evaluadores' },
  { key: 'entrevistas', label: 'Gestión de Entrevistas' },
  { key: 'analytics', label: 'Análisis de Datos' },
  { key: 'reportes', label: 'Reportes' },
  { key: 'usuarios', label: 'Gestión de Usuarios' },
  { key: 'notificaciones', label: 'Notificaciones' },
  { key: 'historial', label: 'Historial de Acciones' },

];

const AdminDashboard: React.FC = () => {
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

  useEffect(() => {
    loadApplications();
    if (activeSection === 'usuarios') {
      loadUsers();
    }
    if (activeSection === 'evaluadores') {
      loadLocalApplications();
    }
  }, [activeSection]);

  const loadApplications = async () => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      // Use the public endpoint for now (for development)
      const response = await fetch('http://localhost:8080/api/applications/public/all', {
        headers: {
          'Content-Type': 'application/json'
        }
      });
      if (response.ok) {
        const data = await response.json();
        dispatch({ type: 'SET_APPLICATIONS', payload: data });
      } else {
        // If API fails, use mock applications for development
        console.warn('API call failed, using mock applications');
        const mockApps = [
          {
            id: 'APP-001',
            status: 'SUBMITTED',
            submissionDate: '2024-08-15T10:30:00',
            student: {
              firstName: 'Juan Carlos',
              lastName: 'Gangale González',
              rut: '12345678-9',
              gradeApplied: '3° Básico'
            }
          },
          {
            id: 'APP-002',
            status: 'INTERVIEW_SCHEDULED',
            submissionDate: '2024-08-16T09:15:00',
            student: {
              firstName: 'Ana Sofía',
              lastName: 'González López',
              rut: '87654321-0',
              gradeApplied: '4° Básico'
            }
          }
        ];
        dispatch({ type: 'SET_APPLICATIONS', payload: mockApps });
      }
    } catch (error) {
      console.error('Error loading applications:', error);
      // Use mock data as fallback
      const mockApps = [
        {
          id: 'APP-001',
          status: 'SUBMITTED',
          submissionDate: '2024-08-15T10:30:00',
          student: {
            firstName: 'Juan Carlos',
            lastName: 'Gangale González',
            rut: '12345678-9',
            gradeApplied: '3° Básico'
          }
        }
      ];
      dispatch({ type: 'SET_APPLICATIONS', payload: mockApps });
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
      const usersData = await schoolUserService.getUsers();
      setUsers(usersData);
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

  const renderSection = () => {
    switch (activeSection) {
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

      case 'usuarios':
        return (
          <div className="space-y-6">
            <UserManagement />
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
    </div>
  );
};

export default AdminDashboard;