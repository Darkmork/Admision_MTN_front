import React, { useState, useEffect } from 'react';
import Card from '../ui/Card';
import Button from '../ui/Button';
import Badge from '../ui/Badge';
import LoadingSpinner from '../ui/LoadingSpinner';
import { 
  FiArrowLeft, 
  FiUser, 
  FiCalendar, 
  FiClock, 
  FiMapPin, 
  FiVideo,
  FiPlus,
  FiEye,
  FiEdit,
  FiCheckCircle,
  FiAlertCircle
} from 'react-icons/fi';
import {
  Interview,
  InterviewStatus,
  InterviewResult,
  INTERVIEW_STATUS_LABELS,
  INTERVIEW_TYPE_LABELS,
  INTERVIEW_RESULT_LABELS,
  InterviewUtils
} from '../../types/interview';
import { applicationService } from '../../services/applicationService';
import interviewService from '../../services/interviewService';

interface StudentDetailPageProps {
  applicationId: number;
  studentName: string;
  onBack: () => void;
  onScheduleInterview: (applicationId: number, interviewType?: string) => void;
  onViewInterview: (interview: Interview) => void;
  onEditInterview: (interview: Interview) => void;
  className?: string;
}

interface StudentDetail {
  applicationId: number;
  studentName: string;
  gradeApplied: string;
  parentNames: string;
  applicationStatus: string;
  submissionDate: string;
  interviews: Interview[];
}

// Componente para las fichas de entrevistas
interface InterviewCardProps {
  title: string;
  description: string;
  type: string;
  interviews: Interview[];
  onSchedule: () => void;
  isOptional?: boolean;
}

const InterviewCard: React.FC<InterviewCardProps> = ({
  title,
  description,
  type,
  interviews,
  onSchedule,
  isOptional = false
}) => {
  // Buscar entrevista de este tipo
  const existingInterview = interviews.find(interview => interview.type === type);
  
  const getCardStatus = () => {
    if (!existingInterview) {
      return {
        color: isOptional ? 'border-gray-200 bg-gray-50' : 'border-orange-200 bg-orange-50',
        status: isOptional ? 'Opcional' : 'Pendiente',
        statusColor: isOptional ? 'text-gray-600 bg-gray-100' : 'text-orange-700 bg-orange-100',
        action: 'Programar'
      };
    }
    
    switch (existingInterview.status) {
      case InterviewStatus.SCHEDULED:
        return {
          color: 'border-blue-200 bg-blue-50',
          status: 'Programada',
          statusColor: 'text-blue-700 bg-blue-100',
          action: 'Ver Detalles'
        };
      case InterviewStatus.CONFIRMED:
        return {
          color: 'border-purple-200 bg-purple-50',
          status: 'Confirmada',
          statusColor: 'text-purple-700 bg-purple-100',
          action: 'Ver Detalles'
        };
      case InterviewStatus.COMPLETED:
        return {
          color: 'border-green-200 bg-green-50',
          status: 'Completada',
          statusColor: 'text-green-700 bg-green-100',
          action: 'Ver Resultado'
        };
      case InterviewStatus.CANCELLED:
        return {
          color: 'border-red-200 bg-red-50',
          status: 'Cancelada',
          statusColor: 'text-red-700 bg-red-100',
          action: 'Reprogramar'
        };
      default:
        return {
          color: 'border-gray-200 bg-gray-50',
          status: 'Sin programar',
          statusColor: 'text-gray-600 bg-gray-100',
          action: 'Programar'
        };
    }
  };

  const cardStatus = getCardStatus();

  return (
    <Card className={`p-4 ${cardStatus.color} border-2`}>
      <div className="flex flex-col h-full">
        <div className="flex-1">
          <div className="flex items-start justify-between mb-3">
            <h3 className="font-medium text-gray-900 text-sm leading-tight">
              {title}
            </h3>
            <Badge 
              variant="neutral" 
              size="sm"
              className={`${cardStatus.statusColor} text-xs`}
            >
              {cardStatus.status}
            </Badge>
          </div>
          
          <p className="text-xs text-gray-600 mb-3">
            {description}
          </p>
          
          {existingInterview && (
            <div className="space-y-1 mb-3">
              <p className="text-xs text-gray-500">
                📅 {new Date(existingInterview.scheduledDate).toLocaleDateString('es-CL')}
              </p>
              <p className="text-xs text-gray-500">
                🕐 {existingInterview.scheduledTime}
              </p>
              <p className="text-xs text-gray-500">
                👤 {existingInterview.interviewerName}
              </p>
              {existingInterview.status === InterviewStatus.COMPLETED && existingInterview.score && (
                <p className="text-xs font-medium text-green-600">
                  ⭐ {existingInterview.score}/10
                </p>
              )}
            </div>
          )}
        </div>
        
        <Button
          size="sm"
          variant={existingInterview ? "outline" : "primary"}
          onClick={onSchedule}
          className="w-full text-xs"
        >
          {existingInterview ? (
            <>
              <FiEye className="w-3 h-3 mr-1" />
              {cardStatus.action}
            </>
          ) : (
            <>
              <FiPlus className="w-3 h-3 mr-1" />
              {cardStatus.action}
            </>
          )}
        </Button>
      </div>
    </Card>
  );
};

const StudentDetailPage: React.FC<StudentDetailPageProps> = ({
  applicationId,
  studentName,
  onBack,
  onScheduleInterview,
  onViewInterview,
  onEditInterview,
  className = ''
}) => {
  const [studentDetail, setStudentDetail] = useState<StudentDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadStudentDetail();
  }, [applicationId]);

  const loadStudentDetail = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Cargar información del estudiante y sus entrevistas en paralelo
      const [applications, interviewsResponse] = await Promise.all([
        applicationService.getAllApplications(),
        interviewService.getAllInterviews()
      ]);

      const application = applications.find(app => app.id === applicationId);
      if (!application) {
        setError('Estudiante no encontrado');
        return;
      }

      const interviews = interviewsResponse.interviews.filter(
        interview => interview.applicationId === applicationId
      );

      setStudentDetail({
        applicationId: application.id,
        studentName: application.student ? 
          `${application.student.firstName} ${application.student.lastName} ${application.student.maternalLastName || ''}`.trim() :
          'Sin información',
        gradeApplied: application.student?.gradeApplied || 'No especificado',
        parentNames: 'Padres de familia', // Esto se podría mejorar con datos reales
        applicationStatus: application.status,
        submissionDate: application.submissionDate || application.createdAt || '',
        interviews: interviews.sort((a, b) => new Date(a.scheduledDate).getTime() - new Date(b.scheduledDate).getTime())
      });

    } catch (err: any) {
      console.error('Error loading student detail:', err);
      setError('Error al cargar los detalles del estudiante');
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString: string): string => {
    if (!dateString) return 'Sin fecha';
    return new Date(dateString).toLocaleDateString('es-CL');
  };

  const getInterviewStatusSummary = (interviews: Interview[]) => {
    const completed = interviews.filter(i => i.status === InterviewStatus.COMPLETED).length;
    const scheduled = interviews.filter(i => 
      i.status === InterviewStatus.SCHEDULED || i.status === InterviewStatus.CONFIRMED
    ).length;
    const total = interviews.length;

    if (total === 0) {
      return { message: 'Sin entrevistas programadas', color: 'red', icon: FiAlertCircle };
    }
    if (completed === total) {
      return { message: `${completed} entrevista${completed > 1 ? 's' : ''} completada${completed > 1 ? 's' : ''}`, color: 'green', icon: FiCheckCircle };
    }
    return { message: `${completed}/${total} completadas`, color: 'yellow', icon: FiClock };
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <LoadingSpinner size="lg" />
        <span className="ml-3 text-gray-600">Cargando detalles...</span>
      </div>
    );
  }

  if (error || !studentDetail) {
    return (
      <Card className="p-6 text-center">
        <p className="text-red-600 mb-4">{error}</p>
        <Button onClick={onBack} variant="outline">
          <FiArrowLeft className="w-4 h-4 mr-2" />
          Volver
        </Button>
      </Card>
    );
  }

  const statusSummary = getInterviewStatusSummary(studentDetail.interviews);

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header con botón de volver */}
      <div className="flex items-center space-x-4">
        <Button onClick={onBack} variant="outline">
          <FiArrowLeft className="w-4 h-4 mr-2" />
          Volver
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{studentDetail.studentName}</h1>
          <p className="text-gray-600">{studentDetail.gradeApplied}</p>
        </div>
      </div>

      {/* Información del estudiante */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900 flex items-center">
            <FiUser className="w-5 h-5 mr-2" />
            Información del Estudiante
          </h2>
          
          <div className="flex items-center space-x-2">
            <statusSummary.icon className={`w-5 h-5 text-${statusSummary.color}-500`} />
            <span className={`text-sm font-medium text-${statusSummary.color}-600`}>
              {statusSummary.message}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-600">Curso postulado</p>
            <p className="font-medium">{studentDetail.gradeApplied}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Fecha de postulación</p>
            <p className="font-medium">{formatDate(studentDetail.submissionDate)}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Estado de postulación</p>
            <Badge variant="info">{studentDetail.applicationStatus}</Badge>
          </div>
          <div>
            <p className="text-sm text-gray-600">ID de aplicación</p>
            <p className="font-medium">#{studentDetail.applicationId}</p>
          </div>
        </div>
      </Card>

      {/* Entrevistas Obligatorias */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-gray-900 flex items-center">
            <FiCalendar className="w-5 h-5 mr-2" />
            Entrevistas del Proceso de Admisión
          </h2>
        </div>

        {/* Fichas de entrevistas obligatorias */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
          {/* Entrevista Familiar */}
          <InterviewCard
            title="👨‍👩‍👧‍👦 Entrevista Familiar"
            description="Entrevista con los padres y familia"
            type="FAMILY"
            interviews={studentDetail.interviews}
            onSchedule={() => onScheduleInterview(studentDetail.applicationId, 'FAMILY')}
          />
          
          {/* Entrevista Individual */}
          <InterviewCard
            title="👤 Entrevista Individual"
            description="Entrevista personal con el estudiante"
            type="INDIVIDUAL"
            interviews={studentDetail.interviews}
            onSchedule={() => onScheduleInterview(studentDetail.applicationId, 'INDIVIDUAL')}
          />
          
          {/* Entrevista Psicológica */}
          <InterviewCard
            title="🧠 Evaluación Psicológica"
            description="Evaluación psicopedagógica"
            type="PSYCHOLOGICAL"
            interviews={studentDetail.interviews}
            onSchedule={() => onScheduleInterview(studentDetail.applicationId, 'PSYCHOLOGICAL')}
          />
          
          {/* Entrevista Académica */}
          <InterviewCard
            title="📚 Entrevista Académica"
            description="Evaluación académica y pedagógica"
            type="ACADEMIC"
            interviews={studentDetail.interviews}
            onSchedule={() => onScheduleInterview(studentDetail.applicationId, 'ACADEMIC')}
          />
          
          {/* Entrevista Adicional */}
          <InterviewCard
            title="➕ Entrevista Adicional"
            description="Entrevista especial si se requiere"
            type="OTHER"
            interviews={studentDetail.interviews}
            onSchedule={() => onScheduleInterview(studentDetail.applicationId, 'OTHER')}
            isOptional={true}
          />
        </div>

        <div className="border-t pt-6">
          <h3 className="text-md font-medium text-gray-900 mb-4 flex items-center">
            <FiCalendar className="w-4 h-4 mr-2" />
            Historial de Entrevistas ({studentDetail.interviews.length})
          </h3>

          {studentDetail.interviews.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <FiCalendar className="w-12 h-12 mx-auto mb-3 text-gray-300" />
              <p className="text-lg mb-2">No hay entrevistas registradas</p>
              <p className="text-sm">Use las fichas de arriba para programar las entrevistas requeridas</p>
            </div>
          ) : (
            <div className="space-y-4">
              {studentDetail.interviews.map((interview) => (
                <div
                  key={interview.id}
                  className="border rounded-lg p-4 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="font-medium text-gray-900 flex items-center">
                        <span className="text-lg mr-2">
                          {interview.type === 'FAMILY' ? '👨‍👩‍👧‍👦' : 
                           interview.type === 'INDIVIDUAL' ? '👤' :
                           interview.type === 'PSYCHOLOGICAL' ? '🧠' : '📋'}
                        </span>
                        {INTERVIEW_TYPE_LABELS[interview.type]}
                      </h3>
                      <p className="text-sm text-gray-600 mt-1">
                        <FiUser className="inline w-4 h-4 mr-1" />
                        {interview.interviewerName}
                      </p>
                    </div>
                    
                    <Badge 
                      variant={InterviewUtils.getStatusColor(interview.status)}
                    >
                      {INTERVIEW_STATUS_LABELS[interview.status]}
                    </Badge>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
                    <div className="flex items-center text-sm text-gray-600">
                      <FiCalendar className="w-4 h-4 mr-2" />
                      {formatDate(interview.scheduledDate)}
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <FiClock className="w-4 h-4 mr-2" />
                      {interview.scheduledTime} ({interview.duration}min)
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      {interview.mode === 'VIRTUAL' ? (
                        <>
                          <FiVideo className="w-4 h-4 mr-2" />
                          Virtual
                        </>
                      ) : (
                        <>
                          <FiMapPin className="w-4 h-4 mr-2" />
                          {interview.location || 'Presencial'}
                        </>
                      )}
                    </div>
                  </div>

                  {/* Resultado si está completada */}
                  {interview.status === InterviewStatus.COMPLETED && interview.result && (
                    <div className="mb-4 p-3 bg-green-50 rounded-md">
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="text-sm font-medium text-green-800">
                            Resultado: {INTERVIEW_RESULT_LABELS[interview.result]}
                          </span>
                          {interview.score && (
                            <span className="ml-3 text-sm text-green-700">
                              Puntuación: {interview.score}/10
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Acciones */}
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => onViewInterview(interview)}
                    >
                      <FiEye className="w-4 h-4 mr-1" />
                      Ver
                    </Button>
                    {interview.status !== InterviewStatus.COMPLETED && (
                      <Button
                        size="sm"
                        variant="primary"
                        onClick={() => onEditInterview(interview)}
                      >
                        <FiEdit className="w-4 h-4 mr-1" />
                        Editar
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </Card>
    </div>
  );
};

export default StudentDetailPage;