import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Card from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import Button from '../components/ui/Button';
import { ApplicationStatus, Document } from '../types';
import { mockApplications } from '../services/mockData';
import { CheckCircleIcon, ClockIcon, FileTextIcon, XCircleIcon, CalendarIcon, UsersIcon, LogoIcon } from '../components/icons/Icons';
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
  FiX
} from 'react-icons/fi';
import { useApplications } from '../context/AppContext';
import { applicationService, Application } from '../services/applicationService';
import { useAuth } from '../context/AuthContext';
import FamilyInterviews from '../components/family/FamilyInterviews';

const sections = [
  { key: 'resumen', label: 'Resumen de Postulación' },
  { key: 'datos', label: 'Datos del Postulante y Apoderados' },
  { key: 'documentos', label: 'Documentos' },
  { key: 'calendario', label: 'Mi Calendario' },
  { key: 'entrevistas', label: 'Mis Entrevistas' },
  { key: 'notificaciones', label: 'Notificaciones' },
  { key: 'historial', label: 'Historial de Acciones' },
  { key: 'cuenta', label: 'Opciones de Cuenta' },
  { key: 'ayuda', label: 'Ayuda y Soporte' },
];

const getStatusColor = (status: ApplicationStatus) => {
    switch (status) {
        case ApplicationStatus.ACCEPTED: return 'bg-verde-esperanza text-blanco-pureza';
        case ApplicationStatus.REJECTED: return 'bg-rojo-sagrado text-blanco-pureza';
        case ApplicationStatus.WAITLIST: return 'bg-dorado-nazaret text-blanco-pureza';
        case ApplicationStatus.SUBMITTED:
        case ApplicationStatus.INTERVIEW_SCHEDULED:
            return 'bg-blue-200 text-azul-monte-tabor';
        default: return 'bg-gray-200 text-gris-piedra';
    }
};

const getDocumentStatusIcon = (status: Document['status']) => {
    switch(status) {
        case 'approved': return <CheckCircleIcon className="w-5 h-5 text-verde-esperanza" />;
        case 'submitted': return <ClockIcon className="w-5 h-5 text-blue-500" />;
        case 'rejected': return <XCircleIcon className="w-5 h-5 text-rojo-sagrado" />;
        default: return <FileTextIcon className="w-5 h-5 text-gris-piedra" />;
    }
};


const FamilyDashboard: React.FC = () => {
  const [activeSection, setActiveSection] = useState('resumen');
  const [realApplications, setRealApplications] = useState<Application[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { applications } = useApplications();
  const { user, isAuthenticated } = useAuth();
  
  // Load real applications on component mount
  useEffect(() => {
    const loadApplications = async () => {
      if (!isAuthenticated || !user) {
        setIsLoading(false);
        return;
      }
      
      try {
        setIsLoading(true);
        const dashboardData = await applicationService.getDashboardData();
        
        // Validar que applications sea un array
        if (dashboardData && Array.isArray(dashboardData.applications)) {
          setRealApplications(dashboardData.applications);
          setError(null);
        } else {
          console.warn('Dashboard data no contiene un array de applications:', dashboardData);
          setRealApplications([]);
          setError('Formato de datos inválido del servidor');
        }
      } catch (error: any) {
        console.error('Error loading dashboard data:', error);
        setError('Error al cargar los datos del dashboard');
        setRealApplications([]);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadApplications();
  }, [isAuthenticated, user]);
  
  // Use real applications if available, otherwise fallback to context or mock data
  const hasRealApplication = Array.isArray(realApplications) && realApplications.length > 0;
  const myApplication = hasRealApplication 
    ? realApplications[0] 
    : (applications.length > 0 ? applications[0] : null);

  const renderSection = () => {
    switch (activeSection) {
      case 'resumen':
        return (
          <div className="space-y-6">
            {/* Header con logo del colegio */}
            <Card className="p-6 bg-gradient-to-r from-azul-monte-tabor to-blue-700 text-blanco-pureza">
              {/* Mostrar error si existe */}
              {error && (
                <div className="mb-4 p-4 bg-red-100 border border-red-300 rounded-lg">
                  <p className="text-red-700 font-medium flex items-center gap-2">
                    <FiAlertTriangle className="w-5 h-5" />
                    Error al cargar datos:
                  </p>
                  <p className="text-red-600 text-sm">{error}</p>
                  <button 
                    onClick={() => window.location.reload()} 
                    className="mt-2 text-red-600 hover:text-red-800 underline text-sm"
                  >
                    Reintentar
                  </button>
                </div>
              )}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-6">
                  <LogoIcon className="w-24 h-24" />
                  <div>
                    <h1 className="text-3xl font-bold">Monte Tabor & Nazaret</h1>
                    <p className="text-blue-100 text-lg">Portal de Apoderados</p>
                    {user && (
                      <p className="text-blue-200 text-sm">Bienvenido, {user.firstName} {user.lastName}</p>
                    )}
                  </div>
                </div>
                <div className="text-right">
                  {hasRealApplication ? (
                    <Badge variant="success" size="sm">Datos Reales</Badge>
                  ) : (
                    <Badge variant="warning" size="sm">Datos de Ejemplo</Badge>
                  )}
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="ml-2 text-white border-white hover:bg-white hover:text-azul-monte-tabor"
                    onClick={() => window.location.reload()}
                  >
                    <FiRefreshCw className="w-4 h-4 mr-2" />
                  Actualizar
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="ml-2 text-white border-white hover:bg-white hover:text-azul-monte-tabor"
                    onClick={async () => {
                      try {
                        setIsLoading(true);
                        const dashboardData = await applicationService.getDashboardData();
                        if (dashboardData && Array.isArray(dashboardData.applications)) {
                          setRealApplications(dashboardData.applications);
                          setError(null);
                        }
                      } catch (error: any) {
                        setError('Error al cargar datos: ' + error.message);
                      } finally {
                        setIsLoading(false);
                      }
                    }}
                  >
                    <FiBarChart2 className="w-4 h-4 mr-2" />
                  Cargar Datos
                  </Button>
                </div>
              </div>
              <p className="text-blue-100">
                Bienvenido al portal de seguimiento del proceso de admisión. 
                Aquí podrá monitorear el progreso de la postulación de su hijo/a.
              </p>
            </Card>

            {/* Sección de Nueva Postulación o Resumen */}
            {!hasRealApplication ? (
              <Card className="p-8 text-center bg-gradient-to-br from-green-50 to-blue-50 border-2 border-dashed border-azul-monte-tabor">
                <div className="max-w-md mx-auto">
                  <FileTextIcon className="w-16 h-16 text-azul-monte-tabor mx-auto mb-4" />
                  <h2 className="text-2xl font-bold text-azul-monte-tabor mb-3">
                    {isLoading ? 'Cargando...' : '¡Inicie su Postulación!'}
                  </h2>
                  <p className="text-gris-piedra mb-6">
                    {isLoading 
                      ? 'Obteniendo información de su postulación...' 
                      : 'Aún no tiene una postulación registrada. Comience el proceso de admisión para su hijo/a completando el formulario de postulación.'
                    }
                  </p>
                  {!isLoading && (
                    <Link to="/postulacion">
                      <Button variant="primary" size="lg" className="w-full">
                        Crear Nueva Postulación
                      </Button>
                    </Link>
                  )}
                  {isLoading && (
                    <div className="flex items-center justify-center gap-2">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-azul-monte-tabor"></div>
                      <span className="text-azul-monte-tabor">Cargando...</span>
                    </div>
                  )}
                </div>
              </Card>
            ) : (
              <div className="space-y-6">
                {/* Estadísticas de postulaciones */}
                {Array.isArray(realApplications) && realApplications.length > 1 && (
                  <Card className="p-6">
                    <h2 className="text-xl font-bold text-azul-monte-tabor mb-4">Resumen de Postulaciones</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="text-center p-4 bg-blue-50 rounded-lg">
                        <p className="text-2xl font-bold text-azul-monte-tabor">{Array.isArray(realApplications) ? realApplications.length : 0}</p>
                        <p className="text-sm text-gris-piedra">Total Postulaciones</p>
                      </div>
                      <div className="text-center p-4 bg-green-50 rounded-lg">
                        <p className="text-2xl font-bold text-verde-esperanza">
                          {Array.isArray(realApplications) ? realApplications.filter(app => app.status === 'APPROVED').length : 0}
                        </p>
                        <p className="text-sm text-gris-piedra">Aprobadas</p>
                      </div>
                      <div className="text-center p-4 bg-yellow-50 rounded-lg">
                        <p className="text-2xl font-bold text-dorado-nazaret">
                          {Array.isArray(realApplications) ? realApplications.filter(app => ['PENDING', 'UNDER_REVIEW'].includes(app.status)).length : 0}
                        </p>
                        <p className="text-sm text-gris-piedra">En Proceso</p>
                      </div>
                    </div>
                  </Card>
                )}
                
                <Card className="p-6">
                <h2 className="text-xl font-bold text-azul-monte-tabor mb-6">
                  {Array.isArray(realApplications) && realApplications.length > 1 ? 'Postulación Principal' : 'Resumen de Postulación'}
                </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold text-azul-monte-tabor mb-2">Información del Postulante</h3>
                {hasRealApplication ? (
                  <>
                    <p><strong>Nombre:</strong> {myApplication.student.firstName} {myApplication.student.lastName}</p>
                    <p><strong>RUT:</strong> {myApplication.student.rut}</p>
                    <p><strong>Fecha de Nacimiento:</strong> {new Date(myApplication.student.birthDate).toLocaleDateString('es-CL')}</p>
                    <p><strong>Nivel:</strong> {myApplication.student.gradeApplied}</p>
                    <p><strong>Dirección:</strong> {myApplication.student.address}</p>
                    {myApplication.student.currentSchool && (
                      <p><strong>Colegio Actual:</strong> {myApplication.student.currentSchool}</p>
                    )}
                  </>
                ) : (
                  <>
                    <p><strong>Nombre:</strong> {myApplication.applicant?.firstName} {myApplication.applicant?.lastName}</p>
                    <p><strong>Fecha de Nacimiento:</strong> {myApplication.applicant?.birthDate}</p>
                    <p><strong>Nivel:</strong> {myApplication.applicant?.grade}</p>
                  </>
                )}
              </div>
              <div>
                <h3 className="font-semibold text-azul-monte-tabor mb-2">Estado de Postulación</h3>
                <div className="mb-2">
                  <Badge variant={
                    myApplication.status === 'APPROVED' ? 'success' : 
                    myApplication.status === 'REJECTED' ? 'error' :
                    myApplication.status === 'WAITLIST' ? 'warning' : 'info'
                  }>
                    {myApplication.status === 'PENDING' ? 'Pendiente' :
                     myApplication.status === 'UNDER_REVIEW' ? 'En Revisión' :
                     myApplication.status === 'DOCUMENTS_REQUESTED' ? 'Documentos Solicitados' :
                     myApplication.status === 'INTERVIEW_SCHEDULED' ? 'Entrevista Programada' :
                     myApplication.status === 'EXAM_SCHEDULED' ? 'Examen Programado' :
                     myApplication.status === 'APPROVED' ? 'Aprobado' :
                     myApplication.status === 'REJECTED' ? 'Rechazado' :
                     myApplication.status === 'WAITLIST' ? 'Lista de Espera' :
                     myApplication.status}
                  </Badge>
                </div>
                <p><strong>Fecha de Postulación:</strong> {new Date(myApplication.submissionDate).toLocaleDateString('es-CL')}</p>
                {hasRealApplication && myApplication.applicantUser && (
                  <p><strong>Apoderado:</strong> {myApplication.applicantUser.firstName} {myApplication.applicantUser.lastName}</p>
                )}
                {myApplication.interviewDate && (
                  <p><strong>Entrevista:</strong> {new Date(myApplication.interviewDate).toLocaleDateString('es-CL')}</p>
                )}
              </div>
            </div>
            
              {/* Accesos Rápidos */}
              <Card className="p-6 mt-6">
                <h3 className="text-lg font-bold text-azul-monte-tabor mb-4">Accesos Rápidos</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <button 
                    onClick={() => setActiveSection('calendario')}
                    className="flex items-center gap-3 p-4 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors text-left"
                  >
                    <CalendarIcon className="w-8 h-8 text-azul-monte-tabor" />
                    <div>
                      <h4 className="font-semibold text-azul-monte-tabor">Mi Calendario</h4>
                      <p className="text-sm text-gris-piedra">Ver mis fechas y eventos personalizados</p>
                    </div>
                  </button>
                  
                  <button 
                    onClick={() => setActiveSection('entrevistas')}
                    className="flex items-center gap-3 p-4 bg-green-50 hover:bg-green-100 rounded-lg transition-colors text-left"
                  >
                    <UsersIcon className="w-8 h-8 text-verde-esperanza" />
                    <div>
                      <h4 className="font-semibold text-azul-monte-tabor">Mis Entrevistas</h4>
                      <p className="text-sm text-gris-piedra">Programar y gestionar entrevistas</p>
                    </div>
                  </button>
                </div>
              </Card>
            </Card>
              </div>
            )}
          </div>
        );
      case 'datos':
        return (
          <Card className="p-6">
            <h2 className="text-xl font-bold text-azul-monte-tabor mb-6">Datos del Postulante y Apoderados</h2>
            
            {hasRealApplication ? (
              <div className="space-y-8">
                {/* Datos del Estudiante */}
                <div>
                  <h3 className="text-lg font-semibold text-azul-monte-tabor mb-4 border-b border-gray-200 pb-2">
                    📚 Información del Estudiante
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <p><strong>Nombres:</strong> {myApplication.student.firstName}</p>
                      <p><strong>Apellidos:</strong> {myApplication.student.lastName}</p>
                      <p><strong>RUT:</strong> {myApplication.student.rut}</p>
                      <p><strong>Fecha de Nacimiento:</strong> {new Date(myApplication.student.birthDate).toLocaleDateString('es-CL')}</p>
                    </div>
                    <div>
                      <p><strong>Nivel Postulado:</strong> {myApplication.student.gradeApplied}</p>
                      <p><strong>Dirección:</strong> {myApplication.student.address}</p>
                      {myApplication.student.email && <p><strong>Email:</strong> {myApplication.student.email}</p>}
                      {myApplication.student.currentSchool && <p><strong>Colegio Actual:</strong> {myApplication.student.currentSchool}</p>}
                    </div>
                  </div>
                  {myApplication.student.additionalNotes && (
                    <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                      <p className="text-sm"><strong>Observaciones:</strong> {myApplication.student.additionalNotes}</p>
                    </div>
                  )}
                </div>

                {/* Datos del Padre */}
                <div>
                  <h3 className="text-lg font-semibold text-azul-monte-tabor mb-4 border-b border-gray-200 pb-2">
                    👨‍💼 Información del Padre
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <p><strong>Nombre Completo:</strong> {myApplication.father.fullName}</p>
                      <p><strong>RUT:</strong> {myApplication.father.rut}</p>
                      <p><strong>Email:</strong> {myApplication.father.email}</p>
                    </div>
                    <div>
                      <p><strong>Teléfono:</strong> {myApplication.father.phone}</p>
                      <p><strong>Profesión:</strong> {myApplication.father.profession}</p>
                      <p><strong>Dirección:</strong> {myApplication.father.address}</p>
                    </div>
                  </div>
                </div>

                {/* Datos de la Madre */}
                <div>
                  <h3 className="text-lg font-semibold text-azul-monte-tabor mb-4 border-b border-gray-200 pb-2">
                    👩‍💼 Información de la Madre
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <p><strong>Nombre Completo:</strong> {myApplication.mother.fullName}</p>
                      <p><strong>RUT:</strong> {myApplication.mother.rut}</p>
                      <p><strong>Email:</strong> {myApplication.mother.email}</p>
                    </div>
                    <div>
                      <p><strong>Teléfono:</strong> {myApplication.mother.phone}</p>
                      <p><strong>Profesión:</strong> {myApplication.mother.profession}</p>
                      <p><strong>Dirección:</strong> {myApplication.mother.address}</p>
                    </div>
                  </div>
                </div>

                {/* Datos del Sostenedor */}
                <div>
                  <h3 className="text-lg font-semibold text-azul-monte-tabor mb-4 border-b border-gray-200 pb-2">
                    💰 Sostenedor Económico
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <p><strong>Nombre Completo:</strong> {myApplication.supporter.fullName}</p>
                      <p><strong>RUT:</strong> {myApplication.supporter.rut}</p>
                      <p><strong>Email:</strong> {myApplication.supporter.email}</p>
                    </div>
                    <div>
                      <p><strong>Teléfono:</strong> {myApplication.supporter.phone}</p>
                      <p><strong>Relación:</strong> {myApplication.supporter.relationship}</p>
                    </div>
                  </div>
                </div>

                {/* Datos del Apoderado */}
                <div>
                  <h3 className="text-lg font-semibold text-azul-monte-tabor mb-4 border-b border-gray-200 pb-2">
                    👥 Apoderado Académico
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <p><strong>Nombre Completo:</strong> {myApplication.guardian.fullName}</p>
                      <p><strong>RUT:</strong> {myApplication.guardian.rut}</p>
                      <p><strong>Email:</strong> {myApplication.guardian.email}</p>
                    </div>
                    <div>
                      <p><strong>Teléfono:</strong> {myApplication.guardian.phone}</p>
                      <p><strong>Relación:</strong> {myApplication.guardian.relationship}</p>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <FileTextIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <p className="text-gris-piedra mb-4">
                  No hay información de postulación disponible
                </p>
                <Link to="/postulacion">
                  <Button variant="primary">
                    Crear Nueva Postulación
                  </Button>
                </Link>
              </div>
            )}
          </Card>
        );
      case 'documentos':
        return (
          <Card className="p-6">
            <h2 className="text-xl font-bold text-azul-monte-tabor mb-4">Documentos</h2>
            <div className="space-y-3">
              {myApplication.documents.map(doc => (
                <div key={doc.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <FileTextIcon className="w-5 h-5 text-dorado-nazaret" />
                    <span className="font-medium">{doc.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {getDocumentStatusIcon(doc.status)}
                    <Badge 
                      variant={doc.status === 'approved' ? 'success' : 
                              doc.status === 'rejected' ? 'error' : 
                              doc.status === 'submitted' ? 'info' : 'neutral'}
                      size="sm"
                    >
                      {doc.status === 'approved' ? 'Aprobado' : 
                       doc.status === 'rejected' ? 'Rechazado' : 
                       doc.status === 'submitted' ? 'En Revisión' : 'Pendiente'}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
            {myApplication.documents.some(doc => doc.status === 'pending') && (
              <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                <p className="text-sm text-azul-monte-tabor">
                  <strong>Nota:</strong> Algunos documentos aún están pendientes de revisión. 
                  El equipo de admisiones los revisará pronto.
                </p>
              </div>
            )}
          </Card>
        );
      case 'calendario':
        return (
          <Card className="p-6">
            <h2 className="text-xl font-bold text-azul-monte-tabor mb-6 flex items-center gap-2">
              <CalendarIcon className="w-6 h-6" />
              Mi Calendario Personal
            </h2>
            
            <div className="space-y-6">
              {/* Próximos Eventos */}
              <div>
                <h3 className="font-semibold text-azul-monte-tabor mb-3">Próximos Eventos</h3>
                <div className="space-y-3">
                  <div className="border-l-4 border-l-azul-monte-tabor bg-blue-50 p-4 rounded-r-lg">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-medium text-azul-monte-tabor">Entrevista Familiar</h4>
                        <p className="text-sm text-gris-piedra">Reunión con el equipo de admisiones</p>
                        <p className="text-sm font-medium mt-1">📅 15 de Octubre, 2024 - 🕐 10:00 AM</p>
                      </div>
                      <Badge variant="info" size="sm">Confirmada</Badge>
                    </div>
                  </div>
                  
                  <div className="border-l-4 border-l-dorado-nazaret bg-yellow-50 p-4 rounded-r-lg">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-medium text-azul-monte-tabor">Examen de Matemática</h4>
                        <p className="text-sm text-gris-piedra">
                          Evaluación para {hasRealApplication ? myApplication.student.firstName : myApplication.applicant?.firstName}
                        </p>
                        <p className="text-sm font-medium mt-1">📅 20 de Octubre, 2024 - 🕐 9:00 AM</p>
                      </div>
                      <Badge variant="warning" size="sm">Programado</Badge>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Fechas Importantes */}
              <div>
                <h3 className="font-semibold text-azul-monte-tabor mb-3">Fechas Importantes del Proceso</h3>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="font-medium flex items-center gap-2">
                      <FiList className="w-4 h-4" />
                      Cierre de Documentos:
                    </p>
                      <p className="text-gris-piedra">30 de Septiembre, 2024</p>
                    </div>
                    <div>
                      <p className="font-medium flex items-center gap-2">
                      <FiFile className="w-4 h-4" />
                      Publicación de Resultados:
                    </p>
                      <p className="text-gris-piedra">1 de Noviembre, 2024</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        );
      case 'entrevistas':
        return <FamilyInterviews />;
      case 'notificaciones':
        return (
          <Card className="p-6">
                                <h2 className="text-xl font-bold text-azul-monte-tabor mb-4">Notificaciones</h2>
                                <ul className="space-y-3">
              <li className="text-sm text-gris-piedra">(Aquí aparecerán notificaciones importantes para la familia.)</li>
            </ul>
          </Card>
        );
      case 'citas':
        return (
          <Card className="p-6">
            <h2 className="text-xl font-bold text-azul-monte-tabor mb-4">Próximas Citas</h2>
            <p className="text-gris-piedra">(Aquí se mostrarán las entrevistas y reuniones agendadas.)</p>
          </Card>
        );
      case 'historial':
        return (
          <Card className="p-6">
            <h2 className="text-xl font-bold text-azul-monte-tabor mb-4">Historial de Acciones</h2>
            <p className="text-gris-piedra">(Aquí se mostrará el historial de acciones realizadas por la familia en el sistema.)</p>
          </Card>
        );
      case 'cuenta':
        return (
          <Card className="p-6">
            <h2 className="text-xl font-bold text-azul-monte-tabor mb-4">Opciones de Cuenta</h2>
            <ul className="space-y-3">
              <li><button className="text-azul-monte-tabor hover:underline">Cambiar contraseña</button></li>
              <li><button className="text-azul-monte-tabor hover:underline">Cerrar sesión</button></li>
                                </ul>
          </Card>
        );
      case 'ayuda':
        return (
          <Card className="p-6">
            <h2 className="text-xl font-bold text-azul-monte-tabor mb-4">Ayuda y Soporte</h2>
            <p className="text-gris-piedra">¿Tienes dudas? Contáctanos a <a href="mailto:contacto@mtn.cl" className="text-azul-monte-tabor underline">contacto@mtn.cl</a></p>
                        </Card>
        );
      default:
        return null;
    }
  };

  // Mostrar estado de carga
  if (isLoading) {
    return (
      <div className="bg-gray-50 min-h-screen py-12 flex items-center justify-center">
        <Card className="p-8 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-azul-monte-tabor mx-auto mb-4"></div>
          <p className="text-gris-piedra">Cargando información del dashboard...</p>
        </Card>
      </div>
    );
  }

  // Mostrar error si hay alguno
  if (error) {
    return (
      <div className="bg-gray-50 min-h-screen py-12 flex items-center justify-center">
        <Card className="p-8 text-center">
          <XCircleIcon className="w-16 h-16 text-rojo-sagrado mx-auto mb-4" />
          <h2 className="text-xl font-bold text-rojo-sagrado mb-2">Error</h2>
          <p className="text-gris-piedra mb-4">{error}</p>
          <Button variant="primary" onClick={() => window.location.reload()}>
            Reintentar
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen py-12 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-azul-monte-tabor p-6 flex-shrink-0 hidden md:flex md:flex-col rounded-xl mr-8">
        <nav className="space-y-2">
          {sections.map(section => (
            <button
              key={section.key}
              onClick={() => setActiveSection(section.key)}
              className={`w-full text-left px-4 py-2 rounded-lg font-semibold transition-colors duration-200 ${activeSection === section.key ? 'bg-dorado-nazaret/20 text-dorado-nazaret' : 'text-blanco-pureza hover:bg-blue-800'}`}
            >
              {section.label}
            </button>
          ))}
        </nav>
      </aside>
      {/* Main Content */}
      <main className="flex-1 max-w-3xl mx-auto">
        {renderSection()}
      </main>
        </div>
    );
};

export default FamilyDashboard;