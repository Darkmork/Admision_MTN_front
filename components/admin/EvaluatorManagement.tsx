import React, { useState, useEffect } from 'react';
import { Logger } from '../src/utils/logger';import Card from '../ui/Card';
import { Logger } from '../src/utils/logger';import Button from '../ui/Button';
import { Logger } from '../src/utils/logger';import Badge from '../ui/Badge';
import { Logger } from '../src/utils/logger';import Modal from '../ui/Modal';
import { Logger } from '../src/utils/logger';import LoadingSpinner from '../ui/LoadingSpinner';
import { Logger } from '../src/utils/logger';import Table from '../ui/Table';
import { Logger } from '../src/utils/logger';import { UsersIcon, CheckCircleIcon, ClockIcon, AlertTriangleIcon } from '../icons/Icons';
import { Logger } from '../src/utils/logger';import { FiRefreshCw } from 'react-icons/fi';
import { Logger } from '../src/utils/logger';import { evaluatorService, Evaluator, Evaluation, EvaluationProgress, USER_ROLES, EVALUATION_TYPES } from '../../services/evaluatorService';
import { Logger } from '../src/utils/logger';import { applicationService, Application } from '../../services/applicationService';
import { Logger } from '../src/utils/logger';import { userService } from '../../services/userService';
import { Logger } from '../src/utils/logger';import { User, UserRole, USER_ROLE_LABELS } from '../../types/user';
import { Logger } from '../src/utils/logger';import { interviewerScheduleService, InterviewerSchedule } from '../../services/interviewerScheduleService';
import { Logger } from '../src/utils/logger';
interface EvaluatorManagementProps {
  applications?: Application[];
  onRefresh?: () => void;
}

interface EvaluatorWithSchedule extends User {
  hasSchedule?: boolean;
  totalSlots?: number;
  activeSlots?: number;
  nextAvailableSlot?: string;
}

const EvaluatorManagement: React.FC<EvaluatorManagementProps> = ({ applications = [], onRefresh }) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'assign' | 'bulk' | 'progress' | 'schedules'>('overview');
  const [evaluators, setEvaluators] = useState<Record<string, EvaluatorWithSchedule[]>>({});
  const [schedules, setSchedules] = useState<Record<number, InterviewerSchedule[]>>({});
  const [selectedApplication, setSelectedApplication] = useState<Application | null>(null);
  const [selectedEvaluationType, setSelectedEvaluationType] = useState<string>('');
  const [selectedEvaluator, setSelectedEvaluator] = useState<number | null>(null);
  const [evaluations, setEvaluations] = useState<Evaluation[]>([]);
  const [progress, setProgress] = useState<EvaluationProgress | null>(null);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [bulkSelection, setBulkSelection] = useState<number[]>([]);
  const [showBulkResults, setShowBulkResults] = useState(false);
  const [bulkResults, setBulkResults] = useState<any>(null);

  // Cargar evaluadores al inicializar
  useEffect(() => {
    loadAllEvaluators();
  }, []);

  useEffect(() => {
    if (activeTab === 'schedules') {
      loadEvaluatorSchedules();
    }
  }, [activeTab, evaluators]);

  const loadAllEvaluators = async () => {
    setLoading(true);
    try {
      Logger.info('🔄 Cargando evaluadores desde evaluation service...');

      const evaluatorRoleMap = {
        'TEACHER_LANGUAGE': 'TEACHER_LANGUAGE',
        'TEACHER_MATHEMATICS': 'TEACHER_MATHEMATICS',
        'TEACHER_ENGLISH': 'TEACHER_ENGLISH',
        'CYCLE_DIRECTOR': 'CYCLE_DIRECTOR',
        'PSYCHOLOGIST': 'PSYCHOLOGIST'
      };

      const evaluatorData: Record<string, EvaluatorWithSchedule[]> = {};

      for (const [userRole, evaluationRole] of Object.entries(evaluatorRoleMap)) {
        try {
          Logger.info(`🔍 Cargando evaluadores para rol: ${evaluationRole}...`);

          let roleEvaluators;
          try {
            roleEvaluators = await evaluatorService.getEvaluatorsByRole(evaluationRole);
          } catch (authError) {
            Logger.info(`⚠️ Auth error, usando endpoint público para ${evaluationRole}`);
            roleEvaluators = await evaluatorService.getEvaluatorsByRolePublic(evaluationRole);
          }

          const evaluatorsWithSchedule: EvaluatorWithSchedule[] = roleEvaluators.map(evaluator => ({
            ...evaluator,
            role: userRole as UserRole,
            hasSchedule: false,
            totalSlots: 0,
            activeSlots: 0,
            nextAvailableSlot: 'Sin configurar'
          }));

          evaluatorData[userRole] = evaluatorsWithSchedule;

          // Mapeo de labels personalizado para evaluadores especializados
          const evaluatorLabels = {
            'TEACHER_LANGUAGE': 'Profesor/a de Lenguaje',
            'TEACHER_MATHEMATICS': 'Profesor/a de Matemáticas',
            'TEACHER_ENGLISH': 'Profesor/a de Inglés',
            'CYCLE_DIRECTOR': 'Director/a de Ciclo',
            'PSYCHOLOGIST': 'Psicólogo/a'
          };

          Logger.info(`✅ ${evaluatorLabels[userRole as keyof typeof evaluatorLabels]}:`, evaluatorsWithSchedule.length, 'evaluadores cargados');

        } catch (roleError) {
          Logger.error(`❌ Error cargando rol ${evaluationRole}:`, roleError);
          evaluatorData[userRole] = [];
        }
      }

      setEvaluators(evaluatorData);
      Logger.info('✅ Todos los evaluadores cargados exitosamente');

    } catch (error) {
      Logger.error('❌ Error cargando evaluadores:', error);
      setEvaluators({
        [UserRole.TEACHER_LANGUAGE]: [],
        [UserRole.TEACHER_MATHEMATICS]: [],
        [UserRole.TEACHER_ENGLISH]: [],
        [UserRole.CYCLE_DIRECTOR]: [],
        [UserRole.PSYCHOLOGIST]: []
      });
    } finally {
      setLoading(false);
    }
  };

  const loadEvaluatorSchedules = async () => {
    try {
      Logger.info('🔄 Cargando horarios de evaluadores...');
      const currentYear = new Date().getFullYear();
      const scheduleData: Record<number, InterviewerSchedule[]> = {};
      const updatedEvaluators: Record<string, EvaluatorWithSchedule[]> = {};

      // Para cada rol de evaluadores
      for (const [role, roleEvaluators] of Object.entries(evaluators)) {
        const evaluatorsWithSchedule: EvaluatorWithSchedule[] = [];

        for (const evaluator of roleEvaluators) {
          try {
            // Obtener horarios del evaluador
            const evaluatorSchedules = await interviewerScheduleService.getInterviewerSchedulesByYear(evaluator.id, currentYear);
            scheduleData[evaluator.id] = evaluatorSchedules;

            // Calcular estadísticas de horarios
            const activeSlots = evaluatorSchedules.filter(s => s.isActive).length;
            const totalSlots = evaluatorSchedules.length;

            const evaluatorWithSchedule: EvaluatorWithSchedule = {
              ...evaluator,
              hasSchedule: totalSlots > 0,
              totalSlots,
              activeSlots,
              nextAvailableSlot: activeSlots > 0 ? 'Disponible' : 'Sin horarios'
            };

            evaluatorsWithSchedule.push(evaluatorWithSchedule);
          } catch (error) {
            Logger.warn(`⚠️ No se pudieron cargar horarios para evaluador ${evaluator.id}:`, error);
            // Agregar sin datos de horario
            const evaluatorWithSchedule: EvaluatorWithSchedule = {
              ...evaluator,
              hasSchedule: false,
              totalSlots: 0,
              activeSlots: 0,
              nextAvailableSlot: 'Sin configurar'
            };
            evaluatorsWithSchedule.push(evaluatorWithSchedule);
          }
        }

        updatedEvaluators[role] = evaluatorsWithSchedule;
      }

      setSchedules(scheduleData);
      setEvaluators(updatedEvaluators);
      Logger.info('✅ Horarios de evaluadores cargados exitosamente');

    } catch (error) {
      Logger.error('❌ Error cargando horarios de evaluadores:', error);
    }
  };

  const handleAssignEvaluations = async (applicationId: number) => {
    setLoading(true);
    try {
      // Intentar asignación automática
      let result;
      try {
        result = await evaluatorService.assignEvaluationsToApplication(applicationId);
      } catch (authError) {
        Logger.warn('Auth failed, trying public endpoint');
        result = await evaluatorService.assignEvaluationsToApplicationPublic(applicationId);
      }

      Logger.info('Evaluaciones asignadas:', result);

      // Recargar las evaluaciones de la aplicación
      if (selectedApplication?.id === applicationId) {
        await loadApplicationEvaluations(applicationId);
      }

      onRefresh?.();
      alert('Evaluaciones asignadas correctamente');
    } catch (error) {
      Logger.error('Error assigning evaluations:', error);
      alert('Error al asignar evaluaciones');
    } finally {
      setLoading(false);
    }
  };

  const handleSpecificAssignment = async () => {
    if (!selectedApplication || !selectedEvaluationType || !selectedEvaluator) return;

    setLoading(true);
    try {
      await evaluatorService.assignSpecificEvaluation(
        selectedApplication.id,
        selectedEvaluationType,
        selectedEvaluator
      );

      await loadApplicationEvaluations(selectedApplication.id);
      setIsModalOpen(false);
      setSelectedEvaluationType('');
      setSelectedEvaluator(null);

      alert('Evaluación asignada correctamente');
    } catch (error) {
      Logger.error('Error assigning specific evaluation:', error);
      alert('Error al asignar evaluación específica');
    } finally {
      setLoading(false);
    }
  };

  const loadApplicationEvaluations = async (applicationId: number) => {
    try {
      const appEvaluations = await evaluatorService.getDetailedEvaluationsByApplication(applicationId);
      const appProgress = await evaluatorService.getEvaluationProgress(applicationId);

      setEvaluations(appEvaluations);
      setProgress(appProgress);
    } catch (error) {
      Logger.error('Error loading application evaluations:', error);
    }
  };

  const handleBulkAssignment = async () => {
    if (bulkSelection.length === 0) {
      alert('Selecciona al menos una aplicación');
      return;
    }

    setLoading(true);
    try {
      let result;
      try {
        result = await evaluatorService.assignBulkEvaluations({ applicationIds: bulkSelection });
      } catch (authError) {
        Logger.warn('Auth failed, trying public endpoint');
        result = await evaluatorService.assignBulkEvaluationsPublic({ applicationIds: bulkSelection });
      }

      setBulkResults(result);
      setShowBulkResults(true);
      setBulkSelection([]);
      onRefresh?.();
    } catch (error) {
      Logger.error('Error in bulk assignment:', error);
      alert('Error en asignación masiva');
    } finally {
      setLoading(false);
    }
  };

  const getTotalEvaluators = () => {
    return Object.values(evaluators).reduce((total, roleEvaluators) => total + roleEvaluators.length, 0);
  };

  const getActiveEvaluators = () => {
    return Object.values(evaluators).reduce((total, roleEvaluators) =>
      total + roleEvaluators.filter(e => e.active).length, 0
    );
  };

  const renderOverview = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center">
            <UsersIcon className="h-8 w-8 text-blue-500 mr-3" />
            <div>
              <p className="text-sm font-medium text-gray-600">Total Evaluadores</p>
              <p className="text-2xl font-bold text-gray-900">{getTotalEvaluators()}</p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center">
            <CheckCircleIcon className="h-8 w-8 text-green-500 mr-3" />
            <div>
              <p className="text-sm font-medium text-gray-600">Activos</p>
              <p className="text-2xl font-bold text-gray-900">{getActiveEvaluators()}</p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center">
            <ClockIcon className="h-8 w-8 text-yellow-500 mr-3" />
            <div>
              <p className="text-sm font-medium text-gray-600">Aplicaciones</p>
              <p className="text-2xl font-bold text-gray-900">{applications.length}</p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center">
            <AlertTriangleIcon className="h-8 w-8 text-orange-500 mr-3" />
            <div>
              <p className="text-sm font-medium text-gray-600">Sin Evaluar</p>
              <p className="text-2xl font-bold text-gray-900">
                {applications.filter(app => app.status === 'SUBMITTED').length}
              </p>
            </div>
          </div>
        </Card>
      </div>

      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Evaluadores por Rol</h3>
        <div className="space-y-4">
          {Object.entries(evaluators).map(([role, roleEvaluators]) => (
            <div key={role} className="border rounded-lg p-4">
              <div className="flex justify-between items-center mb-2">
                <h4 className="font-medium">{USER_ROLE_LABELS[role as UserRole]}</h4>
                <Badge variant={roleEvaluators.length > 0 ? 'success' : 'error'}>
                  {roleEvaluators.length} evaluador{roleEvaluators.length !== 1 ? 'es' : ''}
                </Badge>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                {roleEvaluators.map(evaluator => (
                  <div key={evaluator.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                    <div className="flex-1">
                      <span className="text-sm font-medium">
                        {evaluator.firstName} {evaluator.lastName}
                      </span>
                      {evaluator.hasSchedule && (
                        <div className="text-xs text-gray-600 mt-1">
                          📅 {evaluator.activeSlots + '/' + evaluator.totalSlots} horarios activos
                        </div>
                      )}
                    </div>
                    <div className="flex space-x-1">
                      <Badge variant={evaluator.active ? 'success' : 'error'}>
                        {evaluator.active ? 'Activo' : 'Inactivo'}
                      </Badge>
                      {evaluator.hasSchedule && (
                        <Badge variant="default">
                          🗓️ {evaluator.activeSlots! > 0 ? 'Disponible' : 'Sin horarios'}
                        </Badge>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );

  const renderAssignment = () => (
    <div className="space-y-6">
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Asignación Individual de Evaluaciones</h3>

        {applications.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <p className="text-lg font-medium mb-2">No hay aplicaciones disponibles</p>
            <p className="text-sm">Las aplicaciones aparecerán aquí cuando estén disponibles para asignación de evaluadores.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {applications.map(app => (
            <div key={app.id} className="border rounded-lg p-4">
              <div className="flex justify-between items-center">
                <div>
                  <h4 className="font-medium">
                    {app.student?.firstName} {app.student?.lastName}
                  </h4>
                  <p className="text-sm text-gray-600">
                    Grado: {app.student?.gradeApplied || app.grade || 'N/A'} | Estado: {app.status}
                  </p>
                  <p className="text-xs text-gray-500">
                    ID: {app.id} | Colegio: {app.student?.targetSchool || app.schoolApplied || 'N/A'}
                  </p>
                </div>
                <div className="flex space-x-2">
                  <Button
                    size="sm"
                    onClick={() => handleAssignEvaluations(app.id)}
                    disabled={loading}
                  >
                    Asignar Auto
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setSelectedApplication(app);
                      loadApplicationEvaluations(app.id);
                      setIsModalOpen(true);
                    }}
                  >
                    Asignar Manual
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => {
                      setSelectedApplication(app);
                      loadApplicationEvaluations(app.id);
                    }}
                  >
                    Ver Evaluaciones
                  </Button>
                </div>
              </div>
            </div>
            ))}
          </div>
        )}
      </Card>

      {selectedApplication && evaluations.length > 0 && (
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">
            Evaluaciones de {selectedApplication.student?.firstName} {selectedApplication.student?.lastName}
          </h3>

          {progress && (
            <div className="mb-4 p-3 bg-blue-50 rounded">
              <h4 className="font-medium text-blue-800 mb-2">Progreso de Evaluaciones</h4>
              <div className="space-y-2">
                <div>
                  <div className="flex justify-between text-sm">
                    <span>Entrevista familiar: {progress.familyInterview ? '✅ Completa' : '⏳ Pendiente'}</span>
                  </div>
                </div>
                <div>
                  <p className="text-sm font-medium">
                    Progreso: {progress.completedEvaluations}/{progress.totalEvaluations} completadas
                    ({progress.completionPercentage}%)
                  </p>
                  <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full"
                      style={{ width: `${progress.completionPercentage}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="space-y-3">
            {evaluations.map(evaluation => (
              <div key={evaluation.id} className="border rounded p-3">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="font-medium">
                      {EVALUATION_TYPES[evaluation.evaluationType as keyof typeof EVALUATION_TYPES]}
                    </p>
                    {evaluation.evaluator && (
                      <p className="text-sm text-gray-600">
                        Evaluador: {evaluation.evaluator.firstName} {evaluation.evaluator.lastName}
                      </p>
                    )}
                  </div>
                  <Badge
                    variant={
                      evaluation.status === 'COMPLETED' ? 'success' :
                      evaluation.status === 'IN_PROGRESS' ? 'warning' : 'default'
                    }
                  >
                    {evaluation.status}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );

  const renderBulkAssignment = () => (
    <div className="space-y-6">
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Asignación Masiva de Evaluaciones</h3>

        <div className="mb-4">
          <p className="text-sm text-gray-600 mb-2">
            Selecciona las aplicaciones para asignar evaluaciones automáticamente:
          </p>
          <div className="flex justify-between items-center mb-4">
            <span className="text-sm font-medium">
              {bulkSelection.length} aplicaciones seleccionadas
            </span>
            <div className="space-x-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => setBulkSelection(applications.map(app => app.id))}
              >
                Seleccionar Todas
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => setBulkSelection([])}
              >
                Limpiar Selección
              </Button>
              <Button
                size="sm"
                onClick={handleBulkAssignment}
                disabled={loading || bulkSelection.length === 0}
              >
                {loading ? 'Asignando...' : 'Asignar Seleccionadas'}
              </Button>
            </div>
          </div>
        </div>

        <div className="space-y-2">
          {applications.map(app => (
            <div
              key={app.id}
              className={`border rounded p-3 cursor-pointer transition-colors ${
                bulkSelection.includes(app.id) ? 'bg-blue-50 border-blue-300' : 'hover:bg-gray-50'
              }`}
              onClick={() => {
                setBulkSelection(prev =>
                  prev.includes(app.id)
                    ? prev.filter(id => id !== app.id)
                    : [...prev, app.id]
                );
              }}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    checked={bulkSelection.includes(app.id)}
                    onChange={() => {}}
                    className="mr-3"
                  />
                  <div>
                    <p className="font-medium">
                      {app.student?.firstName} {app.student?.lastName}
                    </p>
                    <p className="text-sm text-gray-600">
                      Grado: {app.student?.gradeApplied || app.grade || 'N/A'} | Estado: {app.status}
                    </p>
                  </div>
                </div>
                <Badge variant={app.status === 'SUBMITTED' ? 'warning' : 'default'}>
                  {app.status}
                </Badge>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {showBulkResults && bulkResults && (
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Resultados de Asignación Masiva</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div className="text-center p-3 bg-blue-50 rounded">
              <p className="text-2xl font-bold text-blue-600">{bulkResults.totalApplications}</p>
              <p className="text-sm text-gray-600">Total Procesadas</p>
            </div>
            <div className="text-center p-3 bg-green-50 rounded">
              <p className="text-2xl font-bold text-green-600">{bulkResults.successCount}</p>
              <p className="text-sm text-gray-600">Exitosas</p>
            </div>
            <div className="text-center p-3 bg-red-50 rounded">
              <p className="text-2xl font-bold text-red-600">{bulkResults.failureCount}</p>
              <p className="text-sm text-gray-600">Fallidas</p>
            </div>
          </div>

          {bulkResults.successful.length > 0 && (
            <div className="mb-4">
              <h4 className="font-medium text-green-600 mb-2">Asignaciones Exitosas:</h4>
              <div className="text-sm text-gray-600">
                {bulkResults.successful.join(', ')}
              </div>
            </div>
          )}

          {bulkResults.failed.length > 0 && (
            <div className="mb-4">
              <h4 className="font-medium text-red-600 mb-2">Asignaciones Fallidas:</h4>
              <div className="text-sm text-gray-600">
                {bulkResults.failed.join(', ')}
              </div>
            </div>
          )}

          <Button
            size="sm"
            variant="outline"
            onClick={() => setShowBulkResults(false)}
          >
            Cerrar Resultados
          </Button>
        </Card>
      )}
    </div>
  );

  const renderSchedulesView = () => (
    <div className="space-y-6">
      <Card className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-semibold">Horarios de Entrevistas por Evaluador</h3>
          <Button
            size="sm"
            onClick={loadEvaluatorSchedules}
            disabled={loading}
          >
            <FiRefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Actualizar Horarios
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Object.entries(evaluators).map(([role, roleEvaluators]) => (
            <div key={role} className="border rounded-lg p-4">
              <h4 className="font-medium mb-3 text-center">
                {USER_ROLE_LABELS[role as UserRole]}
              </h4>

              <div className="space-y-3">
                {roleEvaluators.map(evaluator => (
                  <div key={evaluator.id} className="border rounded p-3 bg-gray-50">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <p className="font-medium text-sm">
                          {evaluator.firstName} {evaluator.lastName}
                        </p>
                        <p className="text-xs text-gray-600">{evaluator.email}</p>
                      </div>
                      <Badge variant={evaluator.hasSchedule ? 'success' : 'warning'}>
                        {evaluator.hasSchedule ? '📅 Configurado' : '⚠️ Sin horarios'}
                      </Badge>
                    </div>

                    {evaluator.hasSchedule ? (
                      <div className="mt-2">
                        <div className="flex justify-between text-xs text-gray-600 mb-1">
                          <span>Horarios totales: {evaluator.totalSlots}</span>
                          <span>Activos: {evaluator.activeSlots}</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-green-600 h-2 rounded-full"
                            style={{
                              width: `${evaluator.totalSlots! > 0 ? (evaluator.activeSlots! / evaluator.totalSlots! * 100) : 0}%`
                            }}
                          ></div>
                        </div>

                        {schedules[evaluator.id] && schedules[evaluator.id].length > 0 && (
                          <div className="mt-2">
                            <p className="text-xs font-medium text-gray-700 mb-1">Próximos horarios:</p>
                            <div className="max-h-20 overflow-y-auto text-xs">
                              {schedules[evaluator.id]
                                .filter(s => s.isActive)
                                .slice(0, 3)
                                .map((schedule, idx) => (
                                  <div key={idx} className="text-gray-600">
                                    {schedule.dayOfWeek}: {schedule.startTime} - {schedule.endTime}
                                  </div>
                                ))
                              }
                              {schedules[evaluator.id].filter(s => s.isActive).length > 3 && (
                                <div className="text-gray-500 italic">
                                  +{schedules[evaluator.id].filter(s => s.isActive).length - 3} más...
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="mt-2 text-center">
                        <p className="text-xs text-gray-500 mb-2">
                          Este evaluador aún no ha configurado sus horarios de disponibilidad.
                        </p>
                        <Badge variant="warning" className="text-xs">
                          Requiere configuración
                        </Badge>
                      </div>
                    )}

                    <div className="mt-3 pt-2 border-t">
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-gray-500">
                          Estado: {evaluator.nextAvailableSlot}
                        </span>
                        {evaluator.hasSchedule && evaluator.activeSlots! > 0 && (
                          <Badge variant="success" className="text-xs">
                            ✓ Disponible para entrevistas
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                ))}

                {roleEvaluators.length === 0 && (
                  <div className="text-center text-gray-500 py-4">
                    <p className="text-sm">No hay evaluadores asignados a este rol</p>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Resumen global */}
        <div className="mt-6 p-4 bg-blue-50 rounded-lg">
          <h4 className="font-medium text-blue-900 mb-2">📊 Resumen de Disponibilidad</h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div>
              <p className="text-lg font-bold text-blue-600">
                {Object.values(evaluators).flat().filter(e => e.hasSchedule).length}
              </p>
              <p className="text-xs text-blue-800">Con Horarios</p>
            </div>
            <div>
              <p className="text-lg font-bold text-green-600">
                {Object.values(evaluators).flat().filter(e => e.activeSlots! > 0).length}
              </p>
              <p className="text-xs text-green-800">Disponibles</p>
            </div>
            <div>
              <p className="text-lg font-bold text-orange-600">
                {Object.values(evaluators).flat().filter(e => !e.hasSchedule).length}
              </p>
              <p className="text-xs text-orange-800">Sin Configurar</p>
            </div>
            <div>
              <p className="text-lg font-bold text-purple-600">
                {Object.values(evaluators).flat().reduce((sum, e) => sum + (e.activeSlots || 0), 0)}
              </p>
              <p className="text-xs text-purple-800">Total Slots Activos</p>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );

  if (loading && Object.keys(evaluators).length === 0) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Tabs */}
      <div className="border-b">
        <nav className="-mb-px flex space-x-8">
          {[
            { key: 'overview', label: 'Resumen' },
            { key: 'assign', label: 'Asignación Individual' },
            { key: 'bulk', label: 'Asignación Masiva' },
            { key: 'schedules', label: 'Horarios & Entrevistas' },
            { key: 'progress', label: 'Progreso' }
          ].map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as any)}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === tab.key
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Content */}
      {activeTab === 'overview' && renderOverview()}
      {activeTab === 'assign' && renderAssignment()}
      {activeTab === 'bulk' && renderBulkAssignment()}
      {activeTab === 'schedules' && renderSchedulesView()}

      {/* Modal for manual assignment */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Asignación Manual de Evaluación"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tipo de Evaluación
            </label>
            <select
              value={selectedEvaluationType}
              onChange={(e) => setSelectedEvaluationType(e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2"
            >
              <option value="">Seleccionar tipo...</option>
              {Object.entries(EVALUATION_TYPES).map(([key, label]) => (
                <option key={key} value={key}>{label}</option>
              ))}
            </select>
          </div>

          {selectedEvaluationType && (() => {
            Logger.info('🔍 MODAL DEBUG - Rendering evaluator selector');
            Logger.info('🔍 MODAL DEBUG - selectedEvaluationType:', selectedEvaluationType);
            Logger.info('🔍 MODAL DEBUG - evaluators object keys:', Object.keys(evaluators));
            Logger.info('🔍 MODAL DEBUG - evaluators object:', evaluators);
            return (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Evaluador
                </label>
                <select
                  value={selectedEvaluator || ''}
                  onChange={(e) => setSelectedEvaluator(Number(e.target.value))}
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                >
                  <option value="">Seleccionar evaluador...</option>
                  {/* Filtrar evaluadores por el rol requerido según el tipo de evaluación */}
                  {(() => {
                    Logger.info('🔍 MODAL DEBUG - Inside select options function');

                    // Mapear tipo de evaluación al rol requerido
                    let requiredRole: string | null = null;

                    switch (selectedEvaluationType) {
                      case 'LANGUAGE_EXAM':
                        requiredRole = 'TEACHER_LANGUAGE';
                        break;
                      case 'MATHEMATICS_EXAM':
                        requiredRole = 'TEACHER_MATHEMATICS';
                        break;
                      case 'ENGLISH_EXAM':
                        requiredRole = 'TEACHER_ENGLISH';
                        break;
                      case 'CYCLE_DIRECTOR_REPORT':
                      case 'CYCLE_DIRECTOR_INTERVIEW':
                        requiredRole = 'CYCLE_DIRECTOR';
                        break;
                      case 'PSYCHOLOGICAL_INTERVIEW':
                        requiredRole = 'PSYCHOLOGIST';
                        break;
                    }

                    Logger.info('🔍 MODAL DEBUG - requiredRole after switch:', requiredRole);

                    // Si no hay rol requerido, no mostrar evaluadores
                    if (!requiredRole) {
                      Logger.info('❌ MODAL DEBUG - No requiredRole, returning null');
                      return null;
                    }

                    // Obtener solo los evaluadores del rol requerido
                    const filteredEvaluators = evaluators[requiredRole] || [];
                    Logger.info('🔍 MODAL DEBUG - filteredEvaluators:', filteredEvaluators);
                    Logger.info('🔍 MODAL DEBUG - filteredEvaluators.length:', filteredEvaluators.length);

                    // Si no hay evaluadores disponibles, mostrar mensaje
                    if (filteredEvaluators.length === 0) {
                      Logger.info('⚠️ MODAL DEBUG - No evaluators, returning message');
                      return <option disabled>No hay evaluadores disponibles para este tipo</option>;
                    }

                    // Mostrar evaluadores filtrados
                    Logger.info('✅ MODAL DEBUG - Returning filtered evaluators options');
                    return filteredEvaluators.map(evaluator => (
                      <option key={evaluator.id} value={evaluator.id}>
                        {evaluator.firstName} {evaluator.lastName}
                      </option>
                    ));
                  })()}
                </select>
              </div>
            );
          })()}

          <div className="flex justify-end space-x-2 pt-4">
            <Button
              variant="outline"
              onClick={() => setIsModalOpen(false)}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleSpecificAssignment}
              disabled={!selectedEvaluationType || !selectedEvaluator || loading}
            >
              {loading ? 'Asignando...' : 'Asignar'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default EvaluatorManagement;