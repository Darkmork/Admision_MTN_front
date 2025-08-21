import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/AppContext';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import Modal from '../components/ui/Modal';
import { 
  Evaluation, 
  AcademicEvaluation, 
  PsychologicalEvaluation, 
  CycleDirectorEvaluation,
  EvaluationType, 
  EvaluationStatus,
  EVALUATION_TYPE_LABELS,
  EVALUATION_STATUS_LABELS,
  UpdateEvaluationRequest
} from '../types/evaluation';
import evaluationApiService from '../services/evaluationApiService';
import { 
  FileTextIcon, 
  ClockIcon, 
  CheckCircleIcon, 
  UsersIcon,
  BarChartIcon,
  EyeIcon
} from '../components/icons/Icons';
import AcademicEvaluationForm from '../components/evaluations/AcademicEvaluationFormNew';
import PsychologicalInterviewForm from '../components/evaluations/PsychologicalInterviewFormNew';
import CycleDirectorForm from '../components/evaluations/CycleDirectorFormNew';

const sections = [
  { key: 'dashboard', label: 'Dashboard' },
  { key: 'pendientes', label: 'Evaluaciones Pendientes' },
  { key: 'completadas', label: 'Evaluaciones Completadas' },
  { key: 'reportes', label: 'Mis Reportes' },
  { key: 'perfil', label: 'Mi Perfil' }
];

const EvaluatorDashboard: React.FC = () => {
  const [activeSection, setActiveSection] = useState('dashboard');
  const [evaluations, setEvaluations] = useState<Evaluation[]>([]);
  const [pendingEvaluations, setPendingEvaluations] = useState<Evaluation[]>([]);
  const [selectedEvaluation, setSelectedEvaluation] = useState<Evaluation | null>(null);
  const [showEvaluationModal, setShowEvaluationModal] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { user } = useAuth();
  const { addNotification } = useNotifications();

  useEffect(() => {
    loadEvaluations();
  }, []);

  const loadEvaluations = async () => {
    try {
      setIsLoading(true);
      const [allEvaluations, pendingEvals] = await Promise.all([
        evaluationService.getMyEvaluations(),
        evaluationService.getMyPendingEvaluations()
      ]);
      setEvaluations(allEvaluations);
      setPendingEvaluations(pendingEvals);
    } catch (error) {
      console.error('Error loading evaluations:', error);
      addNotification({
        type: 'error',
        title: 'Error',
        message: 'Error al cargar las evaluaciones'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleStartEvaluation = (evaluation: Evaluation) => {
    setSelectedEvaluation(evaluation);
    setShowEvaluationModal(true);
  };

  const handleSaveEvaluation = async (evaluationData: Partial<Evaluation>) => {
    if (!selectedEvaluation) return;

    try {
      setIsSubmitting(true);
      await evaluationService.updateEvaluation(selectedEvaluation.id, {
        ...evaluationData,
        status: EvaluationStatus.IN_PROGRESS
      });
      
      addNotification({
        type: 'success',
        title: 'Guardado',
        message: 'La evaluación ha sido guardada exitosamente'
      });
      
      loadEvaluations();
      setShowEvaluationModal(false);
    } catch (error) {
      console.error('Error saving evaluation:', error);
      addNotification({
        type: 'error',
        title: 'Error',
        message: 'Error al guardar la evaluación'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCompleteEvaluation = async (evaluationData: Partial<Evaluation>) => {
    if (!selectedEvaluation) return;

    try {
      setIsSubmitting(true);
      await evaluationService.updateEvaluation(selectedEvaluation.id, {
        ...evaluationData,
        status: EvaluationStatus.COMPLETED
      });
      
      addNotification({
        type: 'success',
        title: 'Completada',
        message: 'La evaluación ha sido completada exitosamente'
      });
      
      loadEvaluations();
      setShowEvaluationModal(false);
    } catch (error) {
      console.error('Error completing evaluation:', error);
      addNotification({
        type: 'error',
        title: 'Error',
        message: 'Error al completar la evaluación'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusIcon = (status: EvaluationStatus) => {
    switch (status) {
      case EvaluationStatus.PENDING:
        return <ClockIcon className="w-5 h-5 text-yellow-500" />;
      case EvaluationStatus.IN_PROGRESS:
        return <FileTextIcon className="w-5 h-5 text-blue-500" />;
      case EvaluationStatus.COMPLETED:
        return <CheckCircleIcon className="w-5 h-5 text-green-500" />;
      default:
        return <FileTextIcon className="w-5 h-5 text-gray-500" />;
    }
  };

  const getTypeIcon = (type: EvaluationType) => {
    switch (type) {
      case EvaluationType.LANGUAGE_EXAM:
      case EvaluationType.MATHEMATICS_EXAM:
      case EvaluationType.ENGLISH_EXAM:
        return '📚';
      case EvaluationType.PSYCHOLOGICAL_INTERVIEW:
        return '🧠';
      case EvaluationType.CYCLE_DIRECTOR_INTERVIEW:
      case EvaluationType.CYCLE_DIRECTOR_REPORT:
        return '👥';
      default:
        return '📋';
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
                Tienes {pendingEvaluations.length} evaluaciones pendientes por completar
              </p>
              <div className="flex gap-4">
                <Button 
                  variant="outline" 
                  className="text-white border-white hover:bg-white hover:text-azul-monte-tabor"
                  onClick={() => setActiveSection('pendientes')}
                >
                  Ver Pendientes
                </Button>
                <Button 
                  variant="outline" 
                  className="text-white border-white hover:bg-white hover:text-azul-monte-tabor"
                  onClick={() => setActiveSection('completadas')}
                >
                  Historial
                </Button>
              </div>
            </Card>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <Card className="p-4 text-center">
                <ClockIcon className="w-8 h-8 text-yellow-500 mx-auto mb-2" />
                <p className="text-2xl font-bold text-yellow-600">
                  {pendingEvaluations.length}
                </p>
                <p className="text-sm text-gris-piedra">Pendientes</p>
              </Card>
              
              <Card className="p-4 text-center">
                <FileTextIcon className="w-8 h-8 text-blue-500 mx-auto mb-2" />
                <p className="text-2xl font-bold text-blue-600">
                  {evaluations.filter(e => e.status === EvaluationStatus.IN_PROGRESS).length}
                </p>
                <p className="text-sm text-gris-piedra">En Progreso</p>
              </Card>
              
              <Card className="p-4 text-center">
                <CheckCircleIcon className="w-8 h-8 text-green-500 mx-auto mb-2" />
                <p className="text-2xl font-bold text-green-600">
                  {evaluations.filter(e => e.status === EvaluationStatus.COMPLETED).length}
                </p>
                <p className="text-sm text-gris-piedra">Completadas</p>
              </Card>
              
              <Card className="p-4 text-center">
                <BarChartIcon className="w-8 h-8 text-purple-500 mx-auto mb-2" />
                <p className="text-2xl font-bold text-purple-600">
                  {evaluations.length}
                </p>
                <p className="text-sm text-gris-piedra">Total</p>
              </Card>
            </div>

            {/* Recent Evaluations */}
            <Card className="p-6">
              <h3 className="text-lg font-bold text-azul-monte-tabor mb-4">
                📋 Evaluaciones Recientes
              </h3>
              {isLoading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-azul-monte-tabor mx-auto"></div>
                  <p className="text-gris-piedra mt-4">Cargando evaluaciones...</p>
                </div>
              ) : evaluations.length === 0 ? (
                <div className="text-center py-8">
                  <FileTextIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gris-piedra">No tienes evaluaciones asignadas</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {evaluations.slice(0, 5).map(evaluation => (
                    <div key={evaluation.id} className="flex items-center justify-between p-4 border rounded-lg hover:shadow-md transition-shadow">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
                          <span className="text-lg">{getTypeIcon(evaluation.evaluationType)}</span>
                        </div>
                        <div>
                          <h4 className="font-medium text-azul-monte-tabor">
                            {EVALUATION_TYPE_LABELS[evaluation.evaluationType]}
                          </h4>
                          {evaluation.application && (
                            <p className="text-sm text-gris-piedra">
                              {evaluation.application.student.firstName} {evaluation.application.student.lastName} • 
                              {evaluation.application.student.gradeApplied}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        {getStatusIcon(evaluation.status)}
                        <Badge 
                          variant={
                            evaluation.status === EvaluationStatus.COMPLETED ? 'success' :
                            evaluation.status === EvaluationStatus.IN_PROGRESS ? 'info' : 'warning'
                          }
                          size="sm"
                        >
                          {EVALUATION_STATUS_LABELS[evaluation.status]}
                        </Badge>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleStartEvaluation(evaluation)}
                        >
                          <EyeIcon className="w-4 h-4 mr-1" />
                          Ver
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </div>
        );

      case 'pendientes':
        return (
          <Card className="p-6">
            <h2 className="text-xl font-bold text-azul-monte-tabor mb-6">
              ⏳ Evaluaciones Pendientes
            </h2>
            {pendingEvaluations.length === 0 ? (
              <div className="text-center py-8">
                <CheckCircleIcon className="w-16 h-16 text-green-300 mx-auto mb-4" />
                <p className="text-gris-piedra">¡Excelente! No tienes evaluaciones pendientes</p>
              </div>
            ) : (
              <div className="space-y-4">
                {pendingEvaluations.map(evaluation => (
                  <div key={evaluation.id} className="border border-yellow-200 bg-yellow-50 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full bg-yellow-100 flex items-center justify-center">
                          <span className="text-xl">{getTypeIcon(evaluation.evaluationType)}</span>
                        </div>
                        <div>
                          <h4 className="font-bold text-azul-monte-tabor">
                            {EVALUATION_TYPE_LABELS[evaluation.evaluationType]}
                          </h4>
                          {evaluation.application && (
                            <p className="text-sm text-gris-piedra">
                              Estudiante: {evaluation.application.student.firstName} {evaluation.application.student.lastName}
                            </p>
                          )}
                          <p className="text-xs text-gray-500 mt-1">
                            Asignada: {new Date(evaluation.createdAt).toLocaleDateString('es-CL')}
                          </p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="primary"
                          size="sm"
                          onClick={() => handleStartEvaluation(evaluation)}
                        >
                          {evaluation.status === EvaluationStatus.IN_PROGRESS ? '📝 Continuar' : '🚀 Comenzar'}
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        );

      case 'completadas':
        return (
          <Card className="p-6">
            <h2 className="text-xl font-bold text-azul-monte-tabor mb-6">
              ✅ Evaluaciones Completadas
            </h2>
            {evaluations.filter(e => e.status === EvaluationStatus.COMPLETED).length === 0 ? (
              <div className="text-center py-8">
                <FileTextIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gris-piedra">Aún no has completado ninguna evaluación</p>
              </div>
            ) : (
              <div className="space-y-4">
                {evaluations.filter(e => e.status === EvaluationStatus.COMPLETED).map(evaluation => (
                  <div key={evaluation.id} className="border border-green-200 bg-green-50 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
                          <CheckCircleIcon className="w-6 h-6 text-green-600" />
                        </div>
                        <div>
                          <h4 className="font-bold text-azul-monte-tabor">
                            {EVALUATION_TYPE_LABELS[evaluation.evaluationType]}
                          </h4>
                          {evaluation.application && (
                            <p className="text-sm text-gris-piedra">
                              Estudiante: {evaluation.application.student.firstName} {evaluation.application.student.lastName}
                            </p>
                          )}
                          <p className="text-xs text-gray-500 mt-1">
                            Completada: {evaluation.completionDate ? new Date(evaluation.completionDate).toLocaleDateString('es-CL') : 'N/A'}
                          </p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleStartEvaluation(evaluation)}
                        >
                          <EyeIcon className="w-4 h-4 mr-1" />
                          Ver Detalles
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
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
        <aside className="w-64 bg-white shadow-md min-h-screen">
          <div className="p-6">
            <h1 className="text-xl font-bold text-azul-monte-tabor">Panel Evaluador</h1>
            <p className="text-sm text-gris-piedra mt-1">{user?.firstName} {user?.lastName}</p>
          </div>
          <nav className="px-4">
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
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-6">
          {renderSection()}
        </main>
      </div>

      {/* Evaluation Modal */}
      {selectedEvaluation && (
        <EvaluationFormModal
          evaluation={selectedEvaluation}
          isOpen={showEvaluationModal}
          onClose={() => setShowEvaluationModal(false)}
          onSave={handleSaveEvaluation}
          onComplete={handleCompleteEvaluation}
          isSubmitting={isSubmitting}
        />
      )}
    </div>
  );
};

// Modal component for evaluation form (placeholder)
interface EvaluationFormModalProps {
  evaluation: Evaluation;
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: Partial<Evaluation>) => void;
  onComplete: (data: Partial<Evaluation>) => void;
  isSubmitting: boolean;
}

const EvaluationFormModal: React.FC<EvaluationFormModalProps> = ({
  evaluation,
  isOpen,
  onClose,
  onSave,
  onComplete,
  isSubmitting
}) => {
  if (!isOpen) return null;

  const renderEvaluationForm = () => {
    // Academic evaluations (Language, Math, English)
    if (evaluation.evaluationType === EvaluationType.LANGUAGE_EXAM ||
        evaluation.evaluationType === EvaluationType.MATHEMATICS_EXAM ||
        evaluation.evaluationType === EvaluationType.ENGLISH_EXAM) {
      return (
        <AcademicEvaluationForm
          evaluation={evaluation}
          onSave={onSave}
          onComplete={onComplete}
          isSubmitting={isSubmitting}
        />
      );
    }
    
    // Psychological interview
    if (evaluation.evaluationType === EvaluationType.PSYCHOLOGICAL_INTERVIEW) {
      return (
        <PsychologicalInterviewForm
          evaluation={evaluation}
          onSave={onSave}
          onComplete={onComplete}
          isSubmitting={isSubmitting}
        />
      );
    }
    
    // Cycle Director forms (Report and Interview)
    if (evaluation.evaluationType === EvaluationType.CYCLE_DIRECTOR_REPORT ||
        evaluation.evaluationType === EvaluationType.CYCLE_DIRECTOR_INTERVIEW) {
      return (
        <CycleDirectorForm
          evaluation={evaluation}
          onSave={onSave}
          onComplete={onComplete}
          isSubmitting={isSubmitting}
        />
      );
    }
    
    // Fallback for unknown evaluation types
    return (
      <div className="text-center py-8">
        <p className="text-gris-piedra">Tipo de evaluación no reconocido</p>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-6xl max-h-[95vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b">
          <h3 className="text-xl font-bold text-azul-monte-tabor">
            {EVALUATION_TYPE_LABELS[evaluation.evaluationType]}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-2xl"
            disabled={isSubmitting}
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {renderEvaluationForm()}
        </div>
      </div>
    </div>
  );
};

export default EvaluatorDashboard;