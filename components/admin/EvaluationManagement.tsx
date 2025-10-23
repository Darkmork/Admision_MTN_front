import React, { useState, useEffect } from 'react';
import { useNotifications } from '../../context/AppContext';
import Card from '../ui/Card';
import Button from '../ui/Button';
import Badge from '../ui/Badge';
import Modal from '../ui/Modal';
import {
  evaluationService,
  UserRole,
  USER_ROLE_LABELS
} from '../../services/evaluationService';
import { evaluatorService } from '../../services/evaluatorService';
import { userService } from '../../services/userService';
import { User, UserRole as SystemUserRole, USER_ROLE_LABELS as SystemRoleLabels } from '../../types/user';
import {
  Evaluation,
  EvaluationType,
  EvaluationStatus,
  EVALUATION_TYPE_LABELS,
  EVALUATION_STATUS_LABELS
} from '../../types/evaluation';
import { Application } from '../../services/applicationService';
import {
  UserIcon,
  ClockIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  ChartBarIcon,
  PlusIcon,
  EyeIcon
} from '../icons/Icons';
import { 
  BarChart3, 
  Bot, 
  Users, 
  Clock, 
  CheckCircle, 
  AlertTriangle, 
  Plus, 
  Eye,
  X
} from 'lucide-react';

interface EvaluationManagementProps {
  applications: Application[];
  onRefresh: () => void;
  onAssign: (applicationId: number, assignments: EvaluatorAssignment[]) => Promise<void>;
}

interface EvaluatorAssignment {
  evaluationType: EvaluationType;
  evaluatorId: number;
  evaluatorName: string;
}

interface EvaluatorCache {
  [key: string]: any[];
}

const EvaluationManagement: React.FC<EvaluationManagementProps> = ({
  applications,
  onRefresh,
  onAssign
}) => {
  const [evaluators, setEvaluators] = useState<any[]>([]);
  const [evaluatorCache, setEvaluatorCache] = useState<EvaluatorCache>({});
  const [isLoading, setIsLoading] = useState(false);
  const [selectedApplication, setSelectedApplication] = useState<Application | null>(null);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const { addNotification } = useNotifications();

  useEffect(() => {
    loadEvaluators();
  }, []);

  // NUEVA FUNCIÓN QUE SOLO CARGA USUARIOS REALES
  const loadEvaluators = async () => {
    try {
      console.log('🔄 NUEVA FUNCIÓN - Cargando SOLO usuarios reales...');

      // Cargar usuarios reales desde el endpoint público
      const usersResponse = await userService.getSchoolStaffUsersPublic();

      // Defensive check: ensure usersResponse exists and has content
      if (!usersResponse) {
        console.error('❌ No se recibió respuesta del servicio de usuarios');
        addNotification('error', 'Error al cargar evaluadores: No se pudo conectar con el servidor');
        return;
      }

      const allStaff = usersResponse.content || usersResponse.data || [];

      console.log('📊 Total staff encontrado:', allStaff.length);
      console.log('👥 Usuarios encontrados:', allStaff.map(u => `${u.firstName} ${u.lastName} - ${u.role} - ${u.subject}`));

      // Filtrar usuarios por especialización
      console.log('🎯 FILTROS DE ESPECIALIZACIÓN:');

      const languageTeachers = allStaff.filter(user =>
        (user.role === 'TEACHER' || user.role === 'COORDINATOR') &&
        user.subject === 'LANGUAGE' && user.active && user.emailVerified
      );
      console.log('📚 LANGUAGE teachers:', languageTeachers.map(u => `${u.firstName} ${u.lastName}`));

      const mathTeachers = allStaff.filter(user =>
        (user.role === 'TEACHER' || user.role === 'COORDINATOR') &&
        user.subject === 'MATHEMATICS' && user.active && user.emailVerified
      );
      console.log('🧮 MATHEMATICS teachers:', mathTeachers.map(u => `${u.firstName} ${u.lastName}`));

      const englishTeachers = allStaff.filter(user =>
        (user.role === 'TEACHER' || user.role === 'COORDINATOR') &&
        user.subject === 'ENGLISH' && user.active && user.emailVerified
      );
      console.log('🇺🇸 ENGLISH teachers:', englishTeachers.map(u => `${u.firstName} ${u.lastName}`));

      const cycleDirectors = allStaff.filter(user =>
        user.role === 'CYCLE_DIRECTOR' && user.active && user.emailVerified
      );
      console.log('👥 CYCLE_DIRECTOR:', cycleDirectors.map(u => `${u.firstName} ${u.lastName}`));

      const psychologists = allStaff.filter(user =>
        user.role === 'PSYCHOLOGIST' && user.active && user.emailVerified
      );
      console.log('🧠 PSYCHOLOGIST:', psychologists.map(u => `${u.firstName} ${u.lastName}`));

      const cache: EvaluatorCache = {
        'TEACHER_LANGUAGE': languageTeachers,
        'TEACHER_MATHEMATICS': mathTeachers,
        'TEACHER_ENGLISH': englishTeachers,
        'CYCLE_DIRECTOR': cycleDirectors,
        'PSYCHOLOGIST': psychologists
      };

      console.log('🔍 Filtros aplicados por rol:');
      Object.entries(cache).forEach(([role, users]) => {
        console.log(`📝 ${role}:`, users.map(u => `${u.firstName} ${u.lastName} (${u.subject})`));
      });

      const allEvaluators = Object.values(cache).flat();

      setEvaluatorCache(cache);
      setEvaluators(allEvaluators);
      console.log('✅ Solo usuarios reales cargados:', allEvaluators.length);

    } catch (error) {
      console.error('❌ Error cargando usuarios reales:', error);
      addNotification('Error al cargar evaluadores. Por favor, intenta de nuevo.', 'error');
      setEvaluators([]);
      setEvaluatorCache({});
    }
  };

  const handleAssignEvaluations = async (applicationId: number) => {
    try {
      setIsLoading(true);
      await evaluationService.assignEvaluationsToApplication(applicationId);
      addNotification('Evaluaciones asignadas automáticamente', 'success');
      onRefresh();
    } catch (error) {
      console.error('Error assigning evaluations:', error);
      addNotification('Error al asignar evaluaciones', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCustomAssignment = async (applicationId: number, assignments: EvaluatorAssignment[]) => {
    try {
      setIsLoading(true);

      for (const assignment of assignments) {
        if (assignment.evaluatorId > 0) {
          await evaluationService.assignSpecificEvaluation(
            applicationId,
            assignment.evaluationType,
            assignment.evaluatorId
          );
        }
      }

      addNotification('Evaluadores asignados correctamente', 'success');
      setShowAssignModal(false);
      setSelectedApplication(null);
      onRefresh();
    } catch (error) {
      console.error('Error assigning evaluators:', error);
      addNotification('Error al asignar evaluadores', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenCustomAssignment = (application: Application) => {
    setSelectedApplication(application);
    setShowAssignModal(true);
  };

  const getEvaluatorsByType = (evaluationType: EvaluationType) => {
    // Mapeo directo de tipos de evaluación a roles del evaluatorService
    const getEvaluatorServiceRole = (type: EvaluationType) => {
      switch (type) {
        case EvaluationType.LANGUAGE_EXAM:
          return 'TEACHER_LANGUAGE';
        case EvaluationType.MATHEMATICS_EXAM:
          return 'TEACHER_MATHEMATICS';
        case EvaluationType.ENGLISH_EXAM:
          return 'TEACHER_ENGLISH';
        case EvaluationType.CYCLE_DIRECTOR_REPORT:
        case EvaluationType.CYCLE_DIRECTOR_INTERVIEW:
          return 'CYCLE_DIRECTOR';
        case EvaluationType.PSYCHOLOGICAL_INTERVIEW:
          return 'PSYCHOLOGIST';
        default:
          return null;
      }
    };

    const serviceRole = getEvaluatorServiceRole(evaluationType);
    if (!serviceRole) {
      console.log(`❌ getEvaluatorsByType(${evaluationType}) -> Sin role mapping`);
      return [];
    }

    // Usar cache si está disponible
    const availableEvaluators = evaluatorCache[serviceRole] || [];
    console.log(`🔍 getEvaluatorsByType(${evaluationType}) -> serviceRole: ${serviceRole}`);
    console.log(`📊 Cache disponible:`, Object.keys(evaluatorCache));
    console.log(`📋 Evaluadores disponibles para ${serviceRole}:`, availableEvaluators.map(e => `${e.firstName} ${e.lastName} (${e.subject})`));

    if (evaluationType === EvaluationType.MATHEMATICS_EXAM) {
      console.log(`🧮 MATEMÁTICAS - Evaluadores:`, availableEvaluators);
    }

    return availableEvaluators;
  };

  const applicationsWithEvaluations = applications.map(app => {
    const pendingEvaluations = app.evaluations?.filter(
      evaluation => evaluation.status === EvaluationStatus.PENDING
    ).length || 0;

    const completedEvaluations = app.evaluations?.filter(
      evaluation => evaluation.status === EvaluationStatus.COMPLETED
    ).length || 0;

    return {
      ...app,
      pendingEvaluations,
      completedEvaluations,
      totalEvaluations: app.evaluations?.length || 0
    };
  });

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <BarChart3 className="w-6 h-6 text-azul-monte-tabor" />
            <h2 className="text-xl font-semibold text-gray-900">
              Gestión de Evaluaciones
            </h2>
          </div>

          <div className="flex items-center space-x-2">
            <Badge variant="info" size="sm">
              {evaluators.length} evaluadores disponibles
            </Badge>
            <Button
              variant="outline"
              size="sm"
              onClick={loadEvaluators}
              disabled={isLoading}
            >
              🔄 Actualizar
            </Button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full table-auto">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">
                  Estudiante
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">
                  Estado
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">
                  Evaluaciones
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">
                  Progreso
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody>
              {applicationsWithEvaluations.map((application) => (
                <tr key={application.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="px-4 py-4">
                    <div>
                      <div className="font-medium text-gray-900">
                        {application.student?.firstName} {application.student?.lastName}
                      </div>
                      <div className="text-sm text-gray-500">
                        {application.student?.gradeApplied}
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <Badge
                      variant={application.status === 'APPROVED' ? 'success' :
                              application.status === 'REJECTED' ? 'error' : 'warning'}
                      size="sm"
                    >
                      {application.status}
                    </Badge>
                  </td>
                  <td className="px-4 py-4">
                    {(() => {
                      // Filtrar solo exámenes académicos (Math, Language, English)
                      const academicExams = (application.evaluations || []).filter(
                        (e: any) =>
                          e.evaluationType === 'MATHEMATICS_EXAM' ||
                          e.evaluationType === 'LANGUAGE_EXAM' ||
                          e.evaluationType === 'ENGLISH_EXAM'
                      );
                      const totalAcademicExams = 3; // Siempre 3 exámenes académicos
                      const completedAcademicExams = academicExams.filter(
                        (e: any) => e.status === 'COMPLETED'
                      ).length;
                      const pendingAcademicExams = totalAcademicExams - completedAcademicExams;

                      return (
                        <div className="flex items-center space-x-2">
                          <span className="text-sm text-gray-600">
                            {completedAcademicExams}/{totalAcademicExams}
                          </span>
                          {pendingAcademicExams > 0 && (
                            <Badge variant="warning" size="sm">
                              {pendingAcademicExams} pendientes
                            </Badge>
                          )}
                        </div>
                      );
                    })()}
                  </td>
                  <td className="px-4 py-4">
                    {(() => {
                      // Calcular progreso solo con exámenes académicos
                      const academicExams = (application.evaluations || []).filter(
                        (e: any) =>
                          e.evaluationType === 'MATHEMATICS_EXAM' ||
                          e.evaluationType === 'LANGUAGE_EXAM' ||
                          e.evaluationType === 'ENGLISH_EXAM'
                      );
                      const totalAcademicExams = 3;
                      const completedAcademicExams = academicExams.filter(
                        (e: any) => e.status === 'COMPLETED'
                      ).length;
                      const progressPercentage = (completedAcademicExams / totalAcademicExams) * 100;

                      return (
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-azul-monte-tabor h-2 rounded-full"
                            style={{ width: `${progressPercentage}%` }}
                          ></div>
                        </div>
                      );
                    })()}
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleAssignEvaluations(application.id)}
                        disabled={isLoading}
                      >
                        <Bot className="w-4 h-4 mr-1" />
                        Auto
                      </Button>
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => handleOpenCustomAssignment(application)}
                        disabled={isLoading}
                      >
                        <Users className="w-4 h-4 mr-1" />
                        Manual
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Modal de Asignación Manual */}
      {showAssignModal && selectedApplication && (
        <CustomAssignmentModal
          application={selectedApplication}
          evaluators={evaluators}
          isOpen={showAssignModal}
          onClose={() => {
            setShowAssignModal(false);
            setSelectedApplication(null);
          }}
          onAssign={handleCustomAssignment}
          isLoading={isLoading}
          getEvaluatorsByType={getEvaluatorsByType}
        />
      )}
    </div>
  );
};

// Custom Assignment Modal Component
interface CustomAssignmentModalProps {
  application: Application;
  evaluators: any[];
  isOpen: boolean;
  onClose: () => void;
  onAssign: (applicationId: number, assignments: EvaluatorAssignment[]) => void;
  isLoading: boolean;
  getEvaluatorsByType: (type: EvaluationType) => any[];
}

const CustomAssignmentModal: React.FC<CustomAssignmentModalProps> = ({
  application,
  evaluators,
  isOpen,
  onClose,
  onAssign,
  isLoading,
  getEvaluatorsByType
}) => {
  const [assignments, setAssignments] = useState<EvaluatorAssignment[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  const requiredEvaluations = [
    EvaluationType.LANGUAGE_EXAM,
    EvaluationType.MATHEMATICS_EXAM,
    EvaluationType.ENGLISH_EXAM,
    EvaluationType.CYCLE_DIRECTOR_REPORT,
    EvaluationType.PSYCHOLOGICAL_INTERVIEW
  ];

  useEffect(() => {
    // Initialize assignments when modal opens
    if (isOpen) {
      const initialAssignments = requiredEvaluations.map(type => {
        // Buscar si ya existe una evaluación asignada para este tipo
        const existingEvaluation = application.evaluations?.find(
          (ev: any) => ev.evaluationType === type
        );

        return {
          evaluationType: type,
          evaluatorId: existingEvaluation?.evaluatorId || 0,
          evaluatorName: existingEvaluation?.evaluator
            ? `${existingEvaluation.evaluator.firstName} ${existingEvaluation.evaluator.lastName}`
            : ''
        };
      });
      setAssignments(initialAssignments);
      setSubmitMessage(null); // Limpiar mensajes previos
      setIsSubmitting(false);
    }
  }, [isOpen]);

  const updateAssignment = (evaluationType: EvaluationType, evaluatorId: number) => {
    const evaluator = evaluators.find(e => e.id === evaluatorId);

    setAssignments(prev => prev.map(assignment =>
      assignment.evaluationType === evaluationType
        ? {
            ...assignment,
            evaluatorId,
            evaluatorName: evaluator ? `${evaluator.firstName} ${evaluator.lastName}` : ''
          }
        : assignment
    ));
  };

  const handleSubmit = async () => {
    const validAssignments = assignments.filter(a => a.evaluatorId > 0);
    if (validAssignments.length === 0) {
      setSubmitMessage({ type: 'error', text: 'Debe asignar al menos un evaluador' });
      return;
    }

    setIsSubmitting(true);
    setSubmitMessage({ type: 'success', text: `Asignando ${validAssignments.length} evaluador(es)... Por favor espere.` });

    try {
      await onAssign(application.id, validAssignments);
      setSubmitMessage({
        type: 'success',
        text: `✅ Se asignaron ${validAssignments.length} evaluador(es) correctamente. Se han enviado notificaciones por email.`
      });

      // Cerrar modal después de 2 segundos para que el usuario vea el mensaje
      setTimeout(() => {
        onClose();
      }, 2000);
    } catch (error: any) {
      console.error('Error en handleSubmit:', error);
      setSubmitMessage({
        type: 'error',
        text: `❌ Error: ${error.message || 'No se pudieron asignar los evaluadores. Por favor intente nuevamente.'}`
      });
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Asignación Manual de Evaluadores"
      size="lg"
    >
      <div className="space-y-6">
        <div className="bg-blue-50 p-4 rounded-lg">
          <h4 className="font-medium text-blue-800 mb-2">
            Estudiante: {application.student?.firstName} {application.student?.lastName}
          </h4>
          <p className="text-blue-600 text-sm">
            Curso aplicado: {application.student?.gradeApplied}
          </p>
        </div>

        <div className="space-y-4">
          <h4 className="flex items-center font-medium text-gray-900">
            <Users className="w-5 h-5 mr-2" />
            Asignar Evaluadores
          </h4>

          {requiredEvaluations.map(evaluationType => {
            const availableEvaluators = getEvaluatorsByType(evaluationType);
            const assignment = assignments.find(a => a.evaluationType === evaluationType);

            // Verificar si ya existe una evaluación asignada para este tipo
            const existingEvaluation = application.evaluations?.find(
              (ev: any) => ev.evaluationType === evaluationType
            );
            const isAlreadyAssigned = !!existingEvaluation;
            const assignedEvaluatorId = existingEvaluation?.evaluatorId;

            return (
              <div key={evaluationType} className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <h5 className="font-medium text-azul-monte-tabor">
                    {EVALUATION_TYPE_LABELS[evaluationType]}
                  </h5>
                  <div className="flex items-center gap-2">
                    {isAlreadyAssigned && (
                      <Badge variant="success" size="sm">
                        Ya asignado
                      </Badge>
                    )}
                    <Badge variant="info" size="sm">
                      {availableEvaluators.length} evaluadores disponibles
                    </Badge>
                  </div>
                </div>

                <select
                  value={assignment?.evaluatorId || 0}
                  onChange={(e) => updateAssignment(evaluationType, parseInt(e.target.value))}
                  disabled={isAlreadyAssigned}
                  className={`w-full p-2 border rounded-lg ${
                    isAlreadyAssigned
                      ? 'border-gray-300 bg-gray-100 text-gray-600 cursor-not-allowed'
                      : 'border-gray-300'
                  }`}
                >
                  <option value={0}>
                    {isAlreadyAssigned ? 'Evaluador ya asignado' : 'Seleccionar evaluador...'}
                  </option>
                  {availableEvaluators.map(evaluator => (
                    <option key={evaluator.id} value={evaluator.id}>
                      {evaluator.firstName} {evaluator.lastName} - {SystemRoleLabels[evaluator.role]}
                    </option>
                  ))}
                </select>

                {isAlreadyAssigned && (
                  <p className="text-blue-600 text-sm mt-2 flex items-center gap-1">
                    <CheckCircle className="w-4 h-4" />
                    Este evaluador ya fue asignado a esta evaluación y no puede ser modificado
                  </p>
                )}

                {availableEvaluators.length === 0 && !isAlreadyAssigned && (
                  <p className="text-red-500 text-sm mt-2">
                    No hay evaluadores disponibles para este tipo de evaluación
                  </p>
                )}
              </div>
            );
          })}
        </div>

        {/* Mensaje de feedback */}
        {submitMessage && (
          <div className={`p-4 rounded-lg ${
            submitMessage.type === 'success'
              ? 'bg-green-50 border border-green-200 text-green-800'
              : 'bg-red-50 border border-red-200 text-red-800'
          }`}>
            <p className="text-sm font-medium">{submitMessage.text}</p>
          </div>
        )}

        <div className="flex justify-end space-x-3 pt-4 border-t">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={isSubmitting}
          >
            Cancelar
          </Button>
          <Button
            variant="primary"
            onClick={handleSubmit}
            disabled={isSubmitting}
            isLoading={isSubmitting}
          >
            {isSubmitting ? 'Asignando...' : 'Asignar Evaluadores'}
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default EvaluationManagement;