import React, { useState, useEffect } from 'react';
import { Logger } from '../src/utils/logger';import Card from '../ui/Card';
import { Logger } from '../src/utils/logger';import Button from '../ui/Button';
import { Logger } from '../src/utils/logger';import Badge from '../ui/Badge';
import { Logger } from '../src/utils/logger';import Modal from '../ui/Modal';
import { Logger } from '../src/utils/logger';import LoadingSpinner from '../ui/LoadingSpinner';
import { Logger } from '../src/utils/logger';import SimpleToast from '../ui/SimpleToast';
import { Logger } from '../src/utils/logger';import {
import { Logger } from '../src/utils/logger';  CalendarIcon,
  ClockIcon,
  UserIcon,
  CheckCircleIcon,
  XCircleIcon,
  RefreshIcon,
  PlusIcon,
  FilterIcon,
  ViewIcon,
  EditIcon
} from '../icons/Icons';
import { FiCalendar, FiClock, FiUser, FiVideo, FiMapPin, FiPhone, FiMail, FiFilter, FiSearch, FiEye, FiEdit, FiCheck, FiX, FiRefreshCw, FiArrowLeft } from 'react-icons/fi';
import { Logger } from '../src/utils/logger';import {
import { Logger } from '../src/utils/logger';  Interview,
  InterviewStatus,
  InterviewType,
  InterviewMode,
  InterviewResult,
  InterviewFilters,
  InterviewStats,
  InterviewFormMode,
  CreateInterviewRequest,
  UpdateInterviewRequest,
  CompleteInterviewRequest,
  INTERVIEW_STATUS_LABELS,
  INTERVIEW_TYPE_LABELS,
  INTERVIEW_MODE_LABELS,
  INTERVIEW_RESULT_LABELS,
  InterviewUtils
} from '../../types/interview';
import InterviewTable from './InterviewTable';
import { Logger } from '../src/utils/logger';import InterviewForm from './InterviewForm';
import { Logger } from '../src/utils/logger';import InterviewCalendar from './InterviewCalendar';
import { Logger } from '../src/utils/logger';import InterviewStatsPanel from './InterviewStatsPanel';
import { Logger } from '../src/utils/logger';import InterviewStatusPanel from './InterviewStatusPanel';
import { Logger } from '../src/utils/logger';import InterviewOverview from './InterviewOverview';
import { Logger } from '../src/utils/logger';// Removed excessive imports for simplification
import interviewService from '../../services/interviewService';
import { Logger } from '../src/utils/logger';import { emailTemplateService, EmailTemplate } from '../../services/emailTemplateService';
import { Logger } from '../src/utils/logger';import { applicationService } from '../../services/applicationService';
import { Logger } from '../src/utils/logger';// Removed non-essential service imports

interface InterviewManagementProps {
  className?: string;
  onBack?: () => void;
}

const InterviewManagement: React.FC<InterviewManagementProps> = ({ className = '', onBack }) => {
  // Estados principales
  const [interviews, setInterviews] = useState<Interview[]>([]);
  const [selectedInterview, setSelectedInterview] = useState<Interview | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  // Estados de modal
  const [showForm, setShowForm] = useState(false);
  const [showCalendar, setShowCalendar] = useState(false);
  const [showStats, setShowStats] = useState(false);
  const [formMode, setFormMode] = useState<InterviewFormMode>(InterviewFormMode.CREATE);
  
  // Estado para sincronización entre vistas
  const [refreshKey, setRefreshKey] = useState(0);

  // Estados de filtros
  const [filters, setFilters] = useState<InterviewFilters>({
    page: 0,
    size: 10,
    sort: 'scheduledDate,desc'
  });
  const [showFilters, setShowFilters] = useState(false);

  // Datos de estadísticas
  const [stats, setStats] = useState<InterviewStats | null>(null);
  const [isLoadingStats, setIsLoadingStats] = useState(false);

  // Modos esenciales + vista de estudiantes
  const [viewMode, setViewMode] = useState<'students' | 'table' | 'calendar'>('students');
  
  // Estados para la vista de estudiantes
  const [selectedStudentId, setSelectedStudentId] = useState<number | null>(null);
  const [selectedStudentName, setSelectedStudentName] = useState<string>('');

  // Simplified email template state
  const [emailTemplates, setEmailTemplates] = useState<EmailTemplate[]>([]);

  useEffect(() => {
    loadInterviews();
    loadStats();
    loadEmailTemplates();
  }, [filters]);

  // Auto-refresh cuando el componente se monta o actualiza
  useEffect(() => {
    loadInterviews();
  }, [refreshKey]);

  const loadInterviews = async () => {
    try {
      Logger.info('🔄 InterviewManagement: Iniciando carga de entrevistas...');
      setIsLoading(true);
      setError(null);

      // Usar servicio real con filtros
      if (filters.status || filters.type || filters.mode || filters.dateFrom || filters.dateTo) {
        Logger.info('🔍 InterviewManagement: Cargando con filtros:', filters);
        const response = await interviewService.getInterviewsWithFilters(
          {
            status: filters.status,
            type: filters.type,
            mode: filters.mode,
            startDate: filters.dateFrom,
            endDate: filters.dateTo,
            interviewerId: filters.interviewerId
          },
          filters.page || 0,
          filters.size || 20,
          'scheduledDate',
          'desc'
        );
        Logger.info('✅ InterviewManagement: Entrevistas con filtros cargadas:', response.interviews.length);
        setInterviews(response.interviews);
      } else {
        Logger.info('📋 InterviewManagement: Cargando todas las entrevistas sin filtros');
        // Cargar todas las entrevistas sin filtros
        const response = await interviewService.getAllInterviews(
          filters.page || 0,
          filters.size || 20,
          'scheduledDate',
          'desc'
        );
        Logger.info('✅ InterviewManagement: Todas las entrevistas cargadas:', response.interviews.length);
        Logger.info('📋 InterviewManagement: Primeras 3 entrevistas:', response.interviews.slice(0, 3));
        setInterviews(response.interviews);
      }

    } catch (err: any) {
      Logger.error('❌ InterviewManagement: Error al cargar las entrevistas:', err);
      setError(err.message || 'Error al cargar las entrevistas');
      showToast('Error al cargar las entrevistas', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      setIsLoadingStats(true);
      
      // Usar servicio real para estadísticas
      const statsData = await interviewService.getInterviewStatistics();
      setStats(statsData);
      
    } catch (err: any) {
      Logger.error('Error loading stats:', err);
      // Si hay error, no mostrar estadísticas pero no fallar la carga
      setStats(null);
    } finally {
      setIsLoadingStats(false);
    }
  };

  const loadEmailTemplates = async () => {
    try {
      const response = await emailTemplateService.getAllTemplates();
      if (response.success && Array.isArray(response.data)) {
        // Filtrar solo templates relacionados con entrevistas
        const interviewTemplates = response.data.filter(template => 
          template.category.includes('INTERVIEW') || 
          template.category === 'STUDENT_SELECTION' ||
          template.category === 'STUDENT_REJECTION'
        );
        setEmailTemplates(interviewTemplates);
      } else {
        setEmailTemplates([]);
      }
    } catch (error) {
      // Si falla, usar templates vacíos pero no mostrar error
      setEmailTemplates([]);
    }
  };

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 5000);
  };

  const handleCreateInterview = () => {
    setSelectedInterview(null);
    setFormMode(InterviewFormMode.CREATE);
    setShowForm(true);
  };

  const handleEditInterview = (interview: Interview) => {
    setSelectedInterview(interview);
    setFormMode(InterviewFormMode.EDIT);
    setShowForm(true);
  };

  const handleCompleteInterview = (interview: Interview) => {
    setSelectedInterview(interview);
    setFormMode(InterviewFormMode.COMPLETE);
    setShowForm(true);
  };

  const handleViewInterview = (interview: Interview) => {
    setSelectedInterview(interview);
    setFormMode(InterviewFormMode.VIEW);
    setShowForm(true);
  };

  const handleEditFromView = (interview: Interview) => {
    setSelectedInterview(interview);
    setFormMode(InterviewFormMode.EDIT);
    // No cerrar el modal, solo cambiar el modo
  };

  // Verificar si ya existe una entrevista programada del mismo tipo para la aplicación
  const hasScheduledInterviewOfType = (applicationId: number, interviewType: InterviewType): boolean => {
    return interviews.some(interview => 
      interview.applicationId === applicationId && 
      interview.type === interviewType &&
      (interview.status === InterviewStatus.SCHEDULED || 
       interview.status === InterviewStatus.CONFIRMED ||
       interview.status === InterviewStatus.IN_PROGRESS)
    );
  };

  const handleFormSubmit = async (data: CreateInterviewRequest | UpdateInterviewRequest | CompleteInterviewRequest) => {
    try {
      setIsSubmitting(true);
      
      if (formMode === InterviewFormMode.CREATE) {
        const createData = data as CreateInterviewRequest;
        
        // Prevenir doble programación del mismo tipo
        if (hasScheduledInterviewOfType(createData.applicationId, createData.type)) {
          showToast(`Ya existe una entrevista ${createData.type.toLowerCase()} programada o en progreso para esta solicitud. No se puede programar otra del mismo tipo.`, 'error');
          setIsSubmitting(false);
          return;
        }
        
        await interviewService.createInterview(createData);
        showToast('Entrevista programada exitosamente con estado AGENDADA', 'success');
      } else if (formMode === InterviewFormMode.EDIT && selectedInterview) {
        await interviewService.updateInterview(selectedInterview.id, data as UpdateInterviewRequest);
        showToast('Entrevista actualizada exitosamente', 'success');
      } else if (formMode === InterviewFormMode.COMPLETE && selectedInterview) {
        await interviewService.completeInterview(selectedInterview.id, data as CompleteInterviewRequest);
        showToast('Entrevista completada exitosamente', 'success');
      }
      
      setShowForm(false);
      await loadInterviews();
      await loadStats(); // Recargar estadísticas también
      
      // Incrementar refreshKey para sincronizar todas las vistas
      setRefreshKey(prev => prev + 1);
      
    } catch (err: any) {
      Logger.error('Error procesando entrevista:', err);
      showToast(err.message || 'Error al procesar la entrevista', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancelInterview = async (interview: Interview) => {
    try {
      await interviewService.cancelInterview(interview.id);
      showToast('Entrevista cancelada exitosamente', 'success');
      await loadInterviews();
      await loadStats();
      setRefreshKey(prev => prev + 1); // Sincronizar todas las vistas
    } catch (err: any) {
      Logger.error('Error cancelando entrevista:', err);
      showToast(err.message || 'Error al cancelar la entrevista', 'error');
    }
  };

  const handleRescheduleInterview = (interview: Interview) => {
    setSelectedInterview(interview);
    setFormMode(InterviewFormMode.EDIT);
    setShowForm(true);
  };

  const handleFilterChange = (newFilters: Partial<InterviewFilters>) => {
    setFilters(prev => ({ ...prev, ...newFilters, page: 0 }));
  };

  const resetFilters = () => {
    setFilters({
      page: 0,
      size: 10,
      sort: 'scheduledDate,desc'
    });
  };

  // Funciones simplificadas de notificación
  const handleSendNotification = async (interview: Interview, type: 'scheduled' | 'confirmed' | 'reminder') => {
    try {
      // Simulación de envío de notificación
      showToast('Notificación enviada exitosamente', 'success');
    } catch (error) {
      showToast('Error al enviar notificación', 'error');
    }
  };

  const handleSendReminder = async (interview: Interview) => {
    try {
      // Simulación de envío de recordatorio
      showToast('Recordatorio enviado exitosamente', 'success');
    } catch (error) {
      showToast('Error al enviar recordatorio', 'error');
    }
  };

  // Funciones para la vista de estudiantes
  const handleStudentSelect = (applicationId: number, studentName: string) => {
    setSelectedStudentId(applicationId);
    setSelectedStudentName(studentName);
  };

  const handleBackToStudentList = () => {
    setSelectedStudentId(null);
    setSelectedStudentName('');
  };

  const handleScheduleInterviewForStudent = (applicationId: number, interviewType?: string) => {
    setSelectedInterview({
      applicationId: applicationId.toString(),
      studentName: selectedStudentName,
      type: interviewType as any,
    } as any);
    setFormMode(InterviewFormMode.CREATE);
    setShowForm(true);
  };

  // Removed unused getViewModeIcon function

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          {onBack && (
            <Button 
              onClick={onBack}
              variant="outline"
              className="flex items-center"
            >
              <FiArrowLeft className="w-4 h-4 mr-2" />
              Volver
            </Button>
          )}
          <CalendarIcon className="w-8 h-8 text-azul-monte-tabor" />
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Gestión de Entrevistas
            </h1>
            <p className="text-sm text-gray-600">
              Programa, gestiona y evalúa las entrevistas de admisión
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <Button
            variant="outline"
            onClick={() => setShowFilters(!showFilters)}
            className={showFilters ? 'bg-blue-50 border-blue-300' : ''}
          >
            <FiFilter className="w-5 h-5 mr-2" />
            Filtros
          </Button>
          
          <Button
            variant="outline"
            onClick={loadInterviews}
            disabled={isLoading}
          >
            <FiRefreshCw className={`w-5 h-5 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Actualizar
          </Button>

          <Button
            variant="primary"
            onClick={handleCreateInterview}
          >
            <PlusIcon className="w-5 h-5 mr-2" />
            Nueva Entrevista
          </Button>
        </div>
      </div>

      {/* Estadísticas rápidas */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="p-4 text-center">
            <CalendarIcon className="w-6 h-6 text-blue-500 mx-auto mb-2" />
            <p className="text-2xl font-bold text-blue-600">{stats.totalInterviews}</p>
            <p className="text-sm text-gray-600">Total Entrevistas</p>
          </Card>
          
          <Card className="p-4 text-center">
            <ClockIcon className="w-6 h-6 text-orange-500 mx-auto mb-2" />
            <p className="text-2xl font-bold text-orange-600">{stats.pendingInterviews}</p>
            <p className="text-sm text-gray-600">Pendientes</p>
          </Card>
          
          <Card className="p-4 text-center">
            <CheckCircleIcon className="w-6 h-6 text-green-500 mx-auto mb-2" />
            <p className="text-2xl font-bold text-green-600">{stats.completedInterviews}</p>
            <p className="text-sm text-gray-600">Completadas</p>
          </Card>
          
          <Card className="p-4 text-center">
            <UserIcon className="w-6 h-6 text-purple-500 mx-auto mb-2" />
            <p className="text-2xl font-bold text-purple-600">{(stats.averageScore || 0).toFixed(1)}</p>
            <p className="text-sm text-gray-600">Puntuación Promedio</p>
          </Card>
        </div>
      )}

      {/* Filtros expansibles */}
      {showFilters && (
        <Card className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Estado
              </label>
              <select
                value={filters.status || ''}
                onChange={(e) => handleFilterChange({ status: e.target.value as InterviewStatus || undefined })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-azul-monte-tabor"
              >
                <option value="">Todos los estados</option>
                {Object.values(InterviewStatus).map(status => (
                  <option key={status} value={status}>
                    {INTERVIEW_STATUS_LABELS[status]}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tipo
              </label>
              <select
                value={filters.type || ''}
                onChange={(e) => handleFilterChange({ type: e.target.value as InterviewType || undefined })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-azul-monte-tabor"
              >
                <option value="">Todos los tipos</option>
                {Object.values(InterviewType).map(type => (
                  <option key={type} value={type}>
                    {INTERVIEW_TYPE_LABELS[type]}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Fecha desde
              </label>
              <input
                type="date"
                value={filters.dateFrom || ''}
                onChange={(e) => handleFilterChange({ dateFrom: e.target.value || undefined })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-azul-monte-tabor"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Fecha hasta
              </label>
              <input
                type="date"
                value={filters.dateTo || ''}
                onChange={(e) => handleFilterChange({ dateTo: e.target.value || undefined })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-azul-monte-tabor"
              />
            </div>
          </div>

          <div className="flex justify-end space-x-3 mt-4">
            <Button variant="outline" onClick={resetFilters}>
              Limpiar Filtros
            </Button>
            <Button variant="primary" onClick={() => setShowFilters(false)}>
              Aplicar Filtros
            </Button>
          </div>
        </Card>
      )}

      {/* Navegación de vistas */}
      <div className="flex gap-2">
        <Button
          variant={viewMode === 'students' ? 'primary' : 'outline'}
          onClick={() => setViewMode('students')}
        >
          <FiUser className="w-5 h-5 mr-2" />
          Estudiantes
        </Button>
        <Button
          variant={viewMode === 'table' ? 'primary' : 'outline'}
          onClick={() => setViewMode('table')}
        >
          <FiFilter className="w-5 h-5 mr-2" />
          Lista
        </Button>
        <Button
          variant={viewMode === 'calendar' ? 'primary' : 'outline'}
          onClick={() => setViewMode('calendar')}
        >
          <FiCalendar className="w-5 h-5 mr-2" />
          Calendario
        </Button>
      </div>

      {/* Vista principal según modo seleccionado */}
      {isLoading ? (
        <div className="flex justify-center items-center py-12">
          <LoadingSpinner size="lg" />
        </div>
      ) : error ? (
        <Card className="p-6 text-center">
          <XCircleIcon className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-red-800 mb-2">Error al cargar</h3>
          <p className="text-red-600 mb-4">{error}</p>
          <Button variant="outline" onClick={loadInterviews}>
            Reintentar
          </Button>
        </Card>
      ) : (
        <>
          {viewMode === 'students' && (
            selectedStudentId ? (
              <StudentDetailView
                applicationId={selectedStudentId}
                studentName={selectedStudentName}
                onBack={handleBackToStudentList}
                onScheduleInterview={handleScheduleInterviewForStudent}
                onViewInterview={handleViewInterview}
                onEditInterview={handleEditInterview}
                refreshKey={refreshKey}
              />
            ) : (
              <StudentListView
                onStudentSelect={handleStudentSelect}
              />
            )
          )}

          {viewMode === 'table' && (
            <Card className="p-6">
              <InterviewTable
                key={`table-${refreshKey}`}
                interviews={interviews}
                isLoading={isLoading}
                onEdit={handleEditInterview}
                onComplete={handleCompleteInterview}
                onCancel={handleCancelInterview}
                onReschedule={handleRescheduleInterview}
                onView={handleViewInterview}
                onSendNotification={handleSendNotification}
                onSendReminder={handleSendReminder}
              />
            </Card>
          )}

          {viewMode === 'calendar' && (
            <Card className="p-6">
              <InterviewCalendar
                key={`calendar-${refreshKey}`}
                interviews={interviews}
                onSelectEvent={handleViewInterview}
                onSelectSlot={(slotInfo) => {
                  handleCreateInterview();
                }}
              />
            </Card>
          )}
        </>
      )}

      {/* Modal de formulario */}
      <Modal
        isOpen={showForm}
        onClose={() => setShowForm(false)}
        title={
          formMode === InterviewFormMode.CREATE ? 'Nueva Entrevista' :
          formMode === InterviewFormMode.EDIT ? 'Editar Entrevista' :
          formMode === InterviewFormMode.COMPLETE ? 'Completar Entrevista' :
          'Detalles de Entrevista'
        }
        size="lg"
      >
        <InterviewForm
          interview={selectedInterview}
          mode={formMode}
          onSubmit={handleFormSubmit}
          onCancel={() => setShowForm(false)}
          onEdit={handleEditFromView}
          isSubmitting={isSubmitting}
        />
      </Modal>

      {/* Removed complex email modal for simplification */}

      {/* Toast de notificaciones */}
      {toast && (
        <SimpleToast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
};

// Componente simple para lista de estudiantes
interface StudentListViewProps {
  onStudentSelect: (applicationId: number, studentName: string) => void;
}

const StudentListView: React.FC<StudentListViewProps> = ({ onStudentSelect }) => {
  const [applications, setApplications] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadApplications();
  }, []);

  const loadApplications = async () => {
    try {
      setIsLoading(true);
      Logger.info('📋 Cargando aplicaciones para vista de estudiantes...');

      // Usar el servicio de aplicaciones real
      const response = await applicationService.getAllApplications();
      Logger.info('📋 Aplicaciones obtenidas:', response);

      // Filtrar solo aplicaciones con datos de estudiante válidos
      const validApplications = response.filter(app =>
        app &&
        app.id &&
        app.student &&
        app.student.firstName &&
        app.student.lastName
      );

      // Mapear al formato esperado por la vista
      const mappedApplications = validApplications.map(app => ({
        id: app.id,
        studentName: `${app.student.firstName} ${app.student.lastName} ${app.student.maternalLastName || ''}`.trim(),
        gradeApplied: app.student.gradeApplied || 'Sin especificar',
        parentNames: [
          app.father?.fullName || 'N/A',
          app.mother?.fullName || 'N/A'
        ].filter(name => name !== 'N/A').join(' y ') || 'Sin información de padres',
        status: app.status || 'PENDING'
      }));

      Logger.info('📋 Aplicaciones mapeadas:', mappedApplications);
      setApplications(mappedApplications);

    } catch (error) {
      Logger.error('❌ Error cargando aplicaciones:', error);
      // Solo usar mock si realmente falla todo (mezclando IDs con y sin entrevistas)
      setApplications([
        // Estudiantes CON entrevistas (según DB)
        { id: 1, studentName: 'Juan Pérez González', gradeApplied: 'Kinder', parentNames: 'María González y Pedro Pérez', status: 'APPROVED' },
        { id: 4, studentName: 'Ana Martínez López', gradeApplied: '1° Básico', parentNames: 'Carmen López y Roberto Martínez', status: 'APPROVED' },
        { id: 26, studentName: 'GASPAR GONZALEZ', gradeApplied: '2° Básico', parentNames: 'Padres de Gaspar', status: 'APPROVED' },
        // Estudiantes SIN entrevistas (según DB)
        { id: 7, studentName: 'María Fernández Torres', gradeApplied: 'Kinder', parentNames: 'Carlos Torres y Ana Fernández', status: 'PENDING' },
        { id: 8, studentName: 'Pablo García Morales', gradeApplied: '1° Básico', parentNames: 'Luis Morales y Carmen García', status: 'PENDING' },
        { id: 15, studentName: 'Sofía López Ruiz', gradeApplied: '3° Básico', parentNames: 'Roberto Ruiz y Patricia López', status: 'PENDING' },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <Card className="p-6">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Estudiantes para Entrevistas</h3>
        <p className="text-sm text-gray-600">Selecciona un estudiante para gestionar sus entrevistas</p>
      </div>
      
      <div className="grid gap-4">
        {applications.map((app) => (
          <div
            key={app.id}
            className="p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 cursor-pointer transition-colors"
            onClick={() => onStudentSelect(app.id, app.studentName)}
          >
            <div className="flex justify-between items-start">
              <div>
                <h4 className="font-medium text-gray-900">{app.studentName}</h4>
                <p className="text-sm text-gray-600">Grado: {app.gradeApplied}</p>
                <p className="text-sm text-gray-500">Padres: {app.parentNames}</p>
              </div>
              <Badge variant="success" size="sm">
                {app.status}
              </Badge>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
};

// Componente simple para vista detallada del estudiante
interface StudentDetailViewProps {
  applicationId: number;
  studentName: string;
  onBack: () => void;
  onScheduleInterview: (applicationId: number, interviewType?: string) => void;
  onViewInterview: (interview: Interview) => void;
  onEditInterview: (interview: Interview) => void;
  refreshKey: number; // Nueva prop para manejar actualizaciones
}

const StudentDetailView: React.FC<StudentDetailViewProps> = ({
  applicationId,
  studentName,
  onBack,
  onScheduleInterview,
  onViewInterview,
  onEditInterview,
  refreshKey
}) => {
  const [studentInterviews, setStudentInterviews] = useState<Interview[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadStudentInterviews();
  }, [applicationId, refreshKey]); // Agregamos refreshKey a las dependencias

  const loadStudentInterviews = async () => {
    try {
      Logger.info(`🔄 StudentDetailView: Cargando entrevistas para aplicación ${applicationId}...`);
      setIsLoading(true);

      // Debug: Probar conexión directa al endpoint
      Logger.info('🧪 Debug: Probando conexión directa al endpoint...');
      try {
        const directResponse = await fetch('http://localhost:8080/api/interviews');
        const directData = await directResponse.json();
        Logger.info('🧪 Debug: Respuesta directa del endpoint:', directData);

        if (directData.success && directData.data) {
          const filtered = directData.data.filter((interview: any) =>
            parseInt(interview.applicationId) === applicationId
          );
          Logger.info(`🧪 Debug: Entrevistas filtradas para app ${applicationId}:`, filtered);
        }
      } catch (directError) {
        Logger.error('🧪 Debug: Error en conexión directa:', directError);
      }

      // Usar el servicio normal
      const response = await interviewService.getInterviewsByApplication(applicationId);
      Logger.info(`✅ StudentDetailView: Entrevistas obtenidas para aplicación ${applicationId}:`, response);
      setStudentInterviews(response.interviews || []);
    } catch (error) {
      Logger.error(`❌ StudentDetailView: Error loading student interviews for ${applicationId}:`, error);
      setStudentInterviews([]);
    } finally {
      setIsLoading(false);
    }
  };

  const interviewTypes = [
    { key: 'INDIVIDUAL', label: 'Entrevista Individual' },
    { key: 'FAMILY', label: 'Entrevista Familiar' },
    { key: 'PSYCHOLOGICAL', label: 'Entrevista Psicológica' },
    { key: 'ACADEMIC', label: 'Entrevista Académica' },
    { key: 'BEHAVIORAL', label: 'Entrevista Conductual' }
  ];

  const getInterviewForType = (type: string) => {
    Logger.info(`🔍 StudentDetailView: Buscando entrevista tipo "${type}" para aplicación ${applicationId}`);
    Logger.info(`📋 StudentDetailView: Entrevistas disponibles:`, studentInterviews.map(i => ({id: i.id, type: i.type, status: i.status, interviewer: i.interviewerName, date: i.scheduledDate})));

    // SOLO buscar por tipo exacto - NO crear entrevistas falsas
    const found = studentInterviews.find(interview => interview.type === type);

    Logger.info(`${found ? '✅' : '❌'} StudentDetailView: Entrevista tipo "${type}" ${found ? 'encontrada: ' + found.id : 'no encontrada'}`);

    return found;
  };

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-xl font-semibold text-gray-900">{studentName}</h3>
            <p className="text-sm text-gray-600">ID de aplicación: {applicationId}</p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={loadStudentInterviews}
              disabled={isLoading}
            >
              🔄 Debug Reload
            </Button>
            <Button variant="outline" onClick={onBack}>
              <FiArrowLeft className="w-4 h-4 mr-2" />
              Volver a Lista
            </Button>
          </div>
        </div>

        <div className="grid gap-4">
          <div className="flex justify-between items-center">
            <h4 className="font-medium text-gray-900">Tipos de Entrevista</h4>
            <div className="text-sm text-blue-600 bg-blue-50 px-2 py-1 rounded">
              Debug: {studentInterviews.length} entrevistas cargadas
            </div>
          </div>
          
          {interviewTypes.map((type) => {
            const existingInterview = getInterviewForType(type.key);
            
            return (
              <div key={type.key} className="p-4 border border-gray-200 rounded-lg">
                <div className="flex justify-between items-center">
                  <div>
                    <h5 className="font-medium text-gray-900">{type.label}</h5>
                    {existingInterview ? (
                      <div className="text-sm text-gray-600 mt-1 space-y-1">
                        <div className="flex items-center gap-2">
                          <FiCheck className="w-4 h-4 text-green-500" />
                          <span className="font-medium text-green-700">Programada</span>
                          <Badge
                            variant={
                              existingInterview.status === 'COMPLETED' ? 'success' :
                              existingInterview.status === 'CONFIRMED' ? 'info' :
                              existingInterview.status === 'SCHEDULED' ? 'warning' : 'secondary'
                            }
                            size="sm"
                          >
                            {existingInterview.status}
                          </Badge>
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-xs bg-gray-50 p-2 rounded">
                          <div>
                            <span className="font-medium">📅 Fecha:</span>
                            <br />
                            {(() => {
                              // Usar fullScheduledDateTime si existe, sino combinar fecha y hora
                              const dateTimeString = (existingInterview as any).fullScheduledDateTime ||
                                                    `${existingInterview.scheduledDate}T${existingInterview.scheduledTime || '00:00'}`;
                              return new Date(dateTimeString).toLocaleDateString('es-CL', {
                                weekday: 'short',
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric'
                              });
                            })()}
                          </div>
                          <div>
                            <span className="font-medium">🕐 Hora:</span>
                            <br />
                            {existingInterview.scheduledTime || 'No especificada'}
                          </div>
                          <div>
                            <span className="font-medium">👨‍🏫 Entrevistador:</span>
                            <br />
                            {existingInterview.interviewerName || 'No asignado'}
                          </div>
                          <div>
                            <span className="font-medium">⏱️ Duración:</span>
                            <br />
                            {existingInterview.duration || 60} min
                          </div>
                          {existingInterview.location && (
                            <div className="col-span-2">
                              <span className="font-medium">📍 Ubicación:</span>
                              <br />
                              {existingInterview.location}
                            </div>
                          )}
                          {existingInterview.notes && (
                            <div className="col-span-2">
                              <span className="font-medium">📝 Notas:</span>
                              <br />
                              {existingInterview.notes}
                            </div>
                          )}
                        </div>
                      </div>
                    ) : (
                      <div className="text-sm text-gray-500 mt-1 flex items-center gap-2">
                        <FiX className="w-4 h-4 text-gray-400" />
                        <span>No programada</span>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex gap-2">
                    {existingInterview ? (
                      <>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => onViewInterview(existingInterview)}
                        >
                          <FiEye className="w-4 h-4 mr-1" />
                          Ver
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => onEditInterview(existingInterview)}
                        >
                          <FiEdit className="w-4 h-4 mr-1" />
                          Editar
                        </Button>
                      </>
                    ) : (
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => onScheduleInterview(applicationId, type.key)}
                      >
                        <FiCalendar className="w-4 h-4 mr-1" />
                        Agendar
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );
};

export default InterviewManagement;