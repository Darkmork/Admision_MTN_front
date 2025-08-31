import React, { useState, useEffect } from 'react';
import Card from '../ui/Card';
import Button from '../ui/Button';
import Badge from '../ui/Badge';
import Modal from '../ui/Modal';
import LoadingSpinner from '../ui/LoadingSpinner';
import SimpleToast from '../ui/SimpleToast';
import {
  CalendarIcon,
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
import {
  Interview,
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
import InterviewForm from './InterviewForm';
import InterviewCalendar from './InterviewCalendar';
import InterviewStatsPanel from './InterviewStatsPanel';
import interviewService from '../../services/interviewService-temp';
import { emailTemplateService, EmailTemplate } from '../../services/emailTemplateService';

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

  // Modo de vista (tabla o calendario)
  const [viewMode, setViewMode] = useState<'table' | 'calendar' | 'stats'>('table');

  // Estados para email templates
  const [emailTemplates, setEmailTemplates] = useState<EmailTemplate[]>([]);
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [selectedInterviewForEmail, setSelectedInterviewForEmail] = useState<Interview | null>(null);
  const [selectedEmailTemplate, setSelectedEmailTemplate] = useState<EmailTemplate | null>(null);

  useEffect(() => {
    loadInterviews();
    loadStats();
    loadEmailTemplates();
  }, [filters]);

  const loadInterviews = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Usar servicio real con filtros
      if (filters.status || filters.type || filters.mode || filters.dateFrom || filters.dateTo) {
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
        setInterviews(response.interviews);
      } else {
        // Cargar todas las entrevistas sin filtros
        const response = await interviewService.getAllInterviews(
          filters.page || 0,
          filters.size || 20,
          'scheduledDate',
          'desc'
        );
        setInterviews(response.interviews);
      }
      
    } catch (err: any) {
      console.error('Error al cargar las entrevistas:', err);
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
      console.error('Error loading stats:', err);
      // Si hay error, no mostrar estadísticas pero no fallar la carga
      setStats(null);
    } finally {
      setIsLoadingStats(false);
    }
  };

  const loadEmailTemplates = async () => {
    try {
      const response = await emailTemplateService.getAllTemplates();
      if (response.success) {
        // Filtrar solo templates relacionados con entrevistas
        const interviewTemplates = response.data.filter(template => 
          template.category.includes('INTERVIEW') || 
          template.category === 'STUDENT_SELECTION' ||
          template.category === 'STUDENT_REJECTION'
        );
        setEmailTemplates(interviewTemplates);
      }
    } catch (error) {
      console.error('Error cargando email templates:', error);
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

  const handleFormSubmit = async (data: CreateInterviewRequest | UpdateInterviewRequest | CompleteInterviewRequest) => {
    try {
      setIsSubmitting(true);
      
      if (formMode === InterviewFormMode.CREATE) {
        await interviewService.createInterview(data as CreateInterviewRequest);
        showToast('Entrevista programada exitosamente', 'success');
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
      
    } catch (err: any) {
      console.error('Error procesando entrevista:', err);
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
    } catch (err: any) {
      console.error('Error cancelando entrevista:', err);
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

  // Funciones de notificación mejoradas con templates
  const handleSendNotification = async (interview: Interview, type: 'scheduled' | 'confirmed' | 'reminder') => {
    // Abrir modal de selección de template
    setSelectedInterviewForEmail(interview);
    setShowEmailModal(true);
  };

  const handleSendReminder = async (interview: Interview) => {
    // Abrir modal de selección de template con templates de recordatorio
    setSelectedInterviewForEmail(interview);
    setShowEmailModal(true);
  };

  const handleSendEmailWithTemplate = async (templateKey: string, variables?: Record<string, any>) => {
    if (!selectedInterviewForEmail) return;

    try {
      setIsSubmitting(true);
      
      // Preparar variables de la entrevista
      const interviewVariables = {
        studentName: selectedInterviewForEmail.studentName,
        studentFirstName: selectedInterviewForEmail.studentName.split(' ')[0],
        studentLastName: selectedInterviewForEmail.studentName.split(' ').slice(1).join(' '),
        parentNames: selectedInterviewForEmail.parentNames,
        gradeApplied: selectedInterviewForEmail.gradeApplied,
        interviewDate: new Date(selectedInterviewForEmail.scheduledDate).toLocaleDateString('es-CL'),
        interviewTime: selectedInterviewForEmail.scheduledTime,
        interviewerName: selectedInterviewForEmail.interviewerName,
        interviewMode: selectedInterviewForEmail.mode === 'VIRTUAL' ? 'Virtual' : 'Presencial',
        interviewLocation: selectedInterviewForEmail.location || 'Por confirmar',
        meetingLink: selectedInterviewForEmail.virtualMeetingLink || '',
        collegeName: 'Colegio Monte Tabor y Nazaret',
        collegePhone: '+56 2 2345 6789',
        collegeEmail: 'info@mtn.cl',
        currentDate: new Date().toLocaleDateString('es-CL'),
        currentYear: new Date().getFullYear().toString(),
        ...variables
      };

      // Enviar email usando el servicio de templates
      const result = await emailTemplateService.sendTemplatedEmail(
        templateKey, 
        selectedInterviewForEmail.applicationId, 
        interviewVariables
      );

      if (result.success) {
        setToast({
          message: 'Email enviado exitosamente a la familia',
          type: 'success'
        });
        setShowEmailModal(false);
        setSelectedInterviewForEmail(null);
        setSelectedEmailTemplate(null);
      } else {
        throw new Error(result.message || 'Error al enviar el email');
      }
    } catch (error) {
      console.error('Error enviando email:', error);
      setToast({
        message: 'Error al enviar el email',
        type: 'error'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const getViewModeIcon = (mode: string) => {
    switch (mode) {
      case 'table': return <FiFilter className="w-5 h-5" />;
      case 'calendar': return <FiCalendar className="w-5 h-5" />;
      case 'stats': return <FiUser className="w-5 h-5" />;
      default: return <FiFilter className="w-5 h-5" />;
    }
  };

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
        <Button
          variant={viewMode === 'stats' ? 'primary' : 'outline'}
          onClick={() => setViewMode('stats')}
        >
          <FiUser className="w-5 h-5 mr-2" />
          Estadísticas
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
          {viewMode === 'table' && (
            <Card className="p-6">
              <InterviewTable
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
                interviews={interviews}
                onSelectEvent={handleViewInterview}
                onSelectSlot={(slotInfo) => {
                  // TODO: Crear entrevista en slot seleccionado
                  console.log('Selected slot:', slotInfo);
                  handleCreateInterview();
                }}
              />
            </Card>
          )}

          {viewMode === 'stats' && stats && (
            <InterviewStatsPanel
              stats={stats}
              isLoading={isLoadingStats}
            />
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
          isSubmitting={isSubmitting}
        />
      </Modal>

      {/* Modal de selección de template de email */}
      <Modal
        isOpen={showEmailModal}
        onClose={() => {
          setShowEmailModal(false);
          setSelectedInterviewForEmail(null);
          setSelectedEmailTemplate(null);
        }}
        title="Enviar Email"
        size="lg"
      >
        <div className="space-y-6">
          {selectedInterviewForEmail && (
            <Card className="p-4 bg-blue-50">
              <h4 className="font-medium text-gray-900 mb-2">Entrevista seleccionada:</h4>
              <div className="text-sm space-y-1">
                <p><strong>Estudiante:</strong> {selectedInterviewForEmail.studentName}</p>
                <p><strong>Padres:</strong> {selectedInterviewForEmail.parentNames}</p>
                <p><strong>Fecha:</strong> {new Date(selectedInterviewForEmail.scheduledDate).toLocaleDateString('es-CL')}</p>
                <p><strong>Hora:</strong> {selectedInterviewForEmail.scheduledTime}</p>
                <p><strong>Entrevistador:</strong> {selectedInterviewForEmail.interviewerName}</p>
              </div>
            </Card>
          )}

          <div>
            <h4 className="font-medium text-gray-900 mb-3">Seleccionar Template de Email:</h4>
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {emailTemplates.length > 0 ? (
                emailTemplates.map((template) => (
                  <div
                    key={template.id}
                    className={`p-3 border rounded-md cursor-pointer transition-colors ${
                      selectedEmailTemplate?.id === template.id
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => setSelectedEmailTemplate(template)}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h5 className="font-medium text-gray-900">{template.name}</h5>
                        <p className="text-sm text-gray-600">{template.description}</p>
                        <Badge 
                          variant={template.category.includes('INTERVIEW') ? 'info' : 'neutral'}
                          size="sm"
                          className="mt-1"
                        >
                          {template.category.replace(/_/g, ' ')}
                        </Badge>
                      </div>
                      <div className="text-xs text-gray-500">
                        {template.isDefault && (
                          <Badge variant="success" size="sm">Por defecto</Badge>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <FiMail className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                  <p>No hay templates de email disponibles</p>
                  <p className="text-sm">Crea templates en la sección Emails Institucionales</p>
                </div>
              )}
            </div>
          </div>

          <div className="flex justify-end space-x-3">
            <Button
              variant="outline"
              onClick={() => {
                setShowEmailModal(false);
                setSelectedInterviewForEmail(null);
                setSelectedEmailTemplate(null);
              }}
            >
              Cancelar
            </Button>
            <Button
              onClick={() => selectedEmailTemplate && handleSendEmailWithTemplate(selectedEmailTemplate.templateKey)}
              disabled={!selectedEmailTemplate || isSubmitting}
              isLoading={isSubmitting}
              loadingText="Enviando..."
            >
              <FiMail className="w-4 h-4 mr-2" />
              Enviar Email
            </Button>
          </div>
        </div>
      </Modal>

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

export default InterviewManagement;