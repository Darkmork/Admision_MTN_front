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
}

interface EvaluatorAssignment {
  evaluationType: EvaluationType;
  evaluatorId: number;
  evaluatorName: string;
}

const EvaluationManagement: React.FC<EvaluationManagementProps> = ({
  applications,
  onRefresh
}) => {
  const [evaluations, setEvaluations] = useState<Evaluation[]>([]);
  const [evaluators, setEvaluators] = useState<User[]>([]);
  const [selectedApplication, setSelectedApplication] = useState<Application | null>(null);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [showProgressModal, setShowProgressModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [bulkOperations, setBulkOperations] = useState<{
    selectedApplications: number[];
    operation: string;
  }>({
    selectedApplications: [],
    operation: ''
  });

  const { addNotification } = useNotifications();

  useEffect(() => {
    loadEvaluators();
  }, []);

  const loadEvaluators = async () => {
    try {
      console.log('🔄 Cargando evaluadores reales para gestión de evaluaciones...');
      
      // Obtener solo los usuarios del colegio (staff) que pueden ser evaluadores
      const usersResponse = await userService.getSchoolStaffUsers();
      const allStaff = usersResponse.content || [];
      
      // Definir qué roles pueden ser evaluadores
      const evaluatorRoles = [
        SystemUserRole.TEACHER,      // Profesores generales con especialización
        SystemUserRole.COORDINATOR,  // Coordinadores de asignatura
        SystemUserRole.CYCLE_DIRECTOR,
        SystemUserRole.PSYCHOLOGIST
      ];
      
      // Filtrar solo los evaluadores activos y verificados
      const activeEvaluators = allStaff.filter(user => 
        evaluatorRoles.includes(user.role) && user.active && user.emailVerified
      );
      
      setEvaluators(activeEvaluators);
      console.log('✅ Evaluadores cargados para gestión:', activeEvaluators.length);
      
    } catch (error) {
      console.error('❌ Error cargando evaluadores:', error);
      setEvaluators([]);
    }
  };

  const handleAssignEvaluations = async (applicationId: number) => {
    try {
      setIsLoading(true);
      await evaluationService.assignEvaluationsToApplication(applicationId);
      
      addNotification({
        type: 'success',
        title: 'Evaluaciones Asignadas',
        message: 'Se han asignado automáticamente todas las evaluaciones requeridas'
      });
      
      onRefresh();
    } catch (error) {
      console.error('Error assigning evaluations:', error);
      addNotification({
        type: 'error',
        title: 'Error',
        message: 'Error al asignar evaluaciones automáticamente'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCustomAssignment = async (applicationId: number, assignments: EvaluatorAssignment[]) => {
    try {
      setIsLoading(true);
      
      for (const assignment of assignments) {
        await evaluationService.assignSpecificEvaluation(
          applicationId,
          assignment.evaluationType,
          assignment.evaluatorId
        );
      }

      addNotification({
        type: 'success',
        title: 'Asignación Personalizada',
        message: 'Se han asignado las evaluaciones con los evaluadores específicos'
      });

      setShowAssignModal(false);
      onRefresh();
    } catch (error) {
      console.error('Error with custom assignment:', error);
      addNotification({
        type: 'error',
        title: 'Error',
        message: 'Error en la asignación personalizada'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleBulkAssignEvaluations = async () => {
    try {
      setIsLoading(true);
      
      for (const applicationId of bulkOperations.selectedApplications) {
        await evaluationService.assignEvaluationsToApplication(applicationId);
      }

      addNotification({
        type: 'success',
        title: 'Asignación Masiva',
        message: `Se asignaron evaluaciones a ${bulkOperations.selectedApplications.length} postulaciones`
      });

      setBulkOperations({ selectedApplications: [], operation: '' });
      onRefresh();
    } catch (error) {
      console.error('Error with bulk assignment:', error);
      addNotification({
        type: 'error',
        title: 'Error',
        message: 'Error en la asignación masiva'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getApplicationEvaluationStats = async (applicationId: number) => {
    try {
      return await evaluationService.getEvaluationProgress(applicationId);
    } catch (error) {
      console.error('Error getting evaluation stats:', error);
      return null;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'UNDER_REVIEW':
        return <ClockIcon className="w-5 h-5 text-yellow-500" />;
      case 'APPROVED':
        return <CheckCircleIcon className="w-5 h-5 text-green-500" />;
      case 'REJECTED':
        return <ExclamationTriangleIcon className="w-5 h-5 text-red-500" />;
      default:
        return <ClockIcon className="w-5 h-5 text-gray-500" />;
    }
  };

  const getRequiredEvaluations = () => [
    EvaluationType.LANGUAGE_EXAM,
    EvaluationType.MATHEMATICS_EXAM,
    EvaluationType.ENGLISH_EXAM,
    EvaluationType.CYCLE_DIRECTOR_REPORT,
    EvaluationType.PSYCHOLOGICAL_INTERVIEW
  ];

  const getEvaluatorsByType = (evaluationType: EvaluationType) => {
    // Mapeo de tipos de evaluación a criterios de filtrado
    const getEvaluatorCriteria = (type: EvaluationType) => {
      switch (type) {
        case EvaluationType.LANGUAGE_EXAM:
          return (evaluator: User) => 
            (evaluator.role === SystemUserRole.TEACHER || evaluator.role === SystemUserRole.COORDINATOR) &&
            evaluator.subject === 'LANGUAGE';
            
        case EvaluationType.MATHEMATICS_EXAM:
          return (evaluator: User) => 
            (evaluator.role === SystemUserRole.TEACHER || evaluator.role === SystemUserRole.COORDINATOR) &&
            evaluator.subject === 'MATHEMATICS';
            
        case EvaluationType.ENGLISH_EXAM:
          return (evaluator: User) => 
            (evaluator.role === SystemUserRole.TEACHER || evaluator.role === SystemUserRole.COORDINATOR) &&
            evaluator.subject === 'ENGLISH';
            
        case EvaluationType.CYCLE_DIRECTOR_REPORT:
        case EvaluationType.CYCLE_DIRECTOR_INTERVIEW:
          return (evaluator: User) => evaluator.role === SystemUserRole.CYCLE_DIRECTOR;
          
        case EvaluationType.PSYCHOLOGICAL_INTERVIEW:
          return (evaluator: User) => evaluator.role === SystemUserRole.PSYCHOLOGIST;
          
        default:
          return () => false;
      }
    };

    const criteria = getEvaluatorCriteria(evaluationType);
    return evaluators.filter(criteria);
  };

  return (
    <div className="space-y-6">
      {/* Header with bulk operations */}
      <Card className="p-6">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h2 className="text-xl font-bold text-azul-monte-tabor mb-2 flex items-center gap-2">
              <BarChart3 className="w-6 h-6" />
              Gestión de Evaluaciones
            </h2>
            <p className="text-gris-piedra">
              Administra las evaluaciones de todas las postulaciones
            </p>
          </div>

          {bulkOperations.selectedApplications.length > 0 && (
            <div className="flex gap-2">
              <Badge variant="info" size="sm">
                {bulkOperations.selectedApplications.length} seleccionadas
              </Badge>
              <Button
                variant="primary"
                size="sm"
                onClick={handleBulkAssignEvaluations}
                disabled={isLoading}
              >
                <Plus className="w-4 h-4 mr-1" />
                Asignar Evaluaciones
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setBulkOperations({ selectedApplications: [], operation: '' })}
              >
                <X className="w-4 h-4 mr-1" />
                Cancelar
              </Button>
            </div>
          )}
        </div>

        <div className="text-sm text-gris-piedra">
          <p>
            • <strong>Asignación Automática:</strong> Asigna evaluadores disponibles automáticamente
          </p>
          <p>
            • <strong>Asignación Personalizada:</strong> Selecciona evaluadores específicos
          </p>
          <p>
            • <strong>Seguimiento:</strong> Monitorea el progreso de cada evaluación
          </p>
        </div>
      </Card>

      {/* Applications list with evaluation management */}
      <Card className="p-6">
        <div className="space-y-4">
          {applications.map(application => {
            const isSelected = bulkOperations.selectedApplications.includes(application.id);
            
            return (
              <div
                key={application.id}
                className={`border rounded-lg p-4 transition-colors ${
                  isSelected ? 'border-azul-monte-tabor bg-blue-50' : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4">
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setBulkOperations(prev => ({
                            ...prev,
                            selectedApplications: [...prev.selectedApplications, application.id]
                          }));
                        } else {
                          setBulkOperations(prev => ({
                            ...prev,
                            selectedApplications: prev.selectedApplications.filter(id => id !== application.id)
                          }));
                        }
                      }}
                      className="mt-1"
                    />

                    <div className="flex items-center gap-3">
                      {getStatusIcon(application.status)}
                      <div>
                        <h4 className="font-semibold text-azul-monte-tabor">
                          {application.student.firstName} {application.student.lastName}
                        </h4>
                        <p className="text-sm text-gris-piedra">
                          {application.student.rut} • {application.student.gradeApplied}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          Postulación creada: {new Date(application.createdAt).toLocaleDateString('es-CL')}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={async () => {
                        const stats = await getApplicationEvaluationStats(application.id);
                        if (stats) {
                          addNotification({
                            type: 'info',
                            title: 'Progreso de Evaluaciones',
                            message: `${stats.completedEvaluations}/${stats.totalEvaluations} completadas (${stats.completionPercentage}%)`
                          });
                        }
                      }}
                    >
                      <ChartBarIcon className="w-4 h-4 mr-1" />
                      Progreso
                    </Button>

                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => handleAssignEvaluations(application.id)}
                      disabled={isLoading}
                    >
                      <Bot className="w-4 h-4 mr-1" />
                      Auto-Asignar
                    </Button>

                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => {
                        setSelectedApplication(application);
                        setShowAssignModal(true);
                      }}
                    >
                      <UserIcon className="w-4 h-4 mr-1" />
                      Personalizada
                    </Button>
                  </div>
                </div>
              </div>
            );
          })}

          {applications.length === 0 && (
            <div className="text-center py-8">
              <BarChart3 className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gris-piedra">No hay postulaciones disponibles</p>
            </div>
          )}
        </div>
      </Card>

      {/* Custom Assignment Modal */}
      {selectedApplication && (
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
      const initialAssignments = requiredEvaluations.map(type => ({
        evaluationType: type,
        evaluatorId: 0,
        evaluatorName: ''
      }));
      setAssignments(initialAssignments);
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

  const handleSubmit = () => {
    const validAssignments = assignments.filter(a => a.evaluatorId > 0);
    if (validAssignments.length === 0) {
      return;
    }
    onAssign(application.id, validAssignments);
  };

  if (!isOpen) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Asignación Personalizada de Evaluadores">
      <div className="space-y-6">
        {/* Application info */}
        <Card className="p-4 bg-blue-50 border-blue-200">
          <h4 className="font-semibold text-azul-monte-tabor mb-2">
                            {application.student.firstName} {application.student.lastName}
          </h4>
          <p className="text-sm text-gris-piedra">
            RUT: {application.student.rut} • Curso: {application.student.gradeApplied}
          </p>
        </Card>

        {/* Evaluation assignments */}
        <div className="space-y-4">
          <h4 className="font-semibold text-azul-monte-tabor flex items-center gap-2">
            <Users className="w-5 h-5" />
            Asignar Evaluadores
          </h4>

          {requiredEvaluations.map(evaluationType => {
            const availableEvaluators = getEvaluatorsByType(evaluationType);
            const assignment = assignments.find(a => a.evaluationType === evaluationType);

            return (
              <div key={evaluationType} className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <h5 className="font-medium text-azul-monte-tabor">
                    {EVALUATION_TYPE_LABELS[evaluationType]}
                  </h5>
                  <Badge variant="info" size="sm">
                    {availableEvaluators.length} evaluadores disponibles
                  </Badge>
                </div>

                <select
                  value={assignment?.evaluatorId || 0}
                  onChange={(e) => updateAssignment(evaluationType, parseInt(e.target.value))}
                  className="w-full p-2 border border-gray-300 rounded-lg"
                >
                  <option value={0}>Seleccionar evaluador...</option>
                  {availableEvaluators.map(evaluator => (
                    <option key={evaluator.id} value={evaluator.id}>
                      {evaluator.firstName} {evaluator.lastName} - {SystemRoleLabels[evaluator.role]}
                    </option>
                  ))}
                </select>

                {availableEvaluators.length === 0 && (
                  <p className="text-sm text-red-600 mt-2 flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4" />
                    No hay evaluadores disponibles para este tipo
                  </p>
                )}
              </div>
            );
          })}
        </div>

        {/* Action buttons */}
        <div className="flex gap-3 pt-4 border-t">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={isLoading}
            className="flex-1"
          >
            Cancelar
          </Button>
          <Button
            variant="primary"
            onClick={handleSubmit}
            disabled={isLoading || assignments.filter(a => a.evaluatorId > 0).length === 0}
            className="flex-1"
          >
            {isLoading ? 'Asignando...' : (
              <>
                <CheckCircle className="w-4 h-4 mr-1" />
                Asignar Evaluadores
              </>
            )}
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default EvaluationManagement;