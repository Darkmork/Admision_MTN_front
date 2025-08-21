import React, { useState, useEffect } from 'react';
import Card from '../ui/Card';
import Button from '../ui/Button';
import Badge from '../ui/Badge';
import Modal from '../ui/Modal';
import LoadingSpinner from '../ui/LoadingSpinner';
import Table from '../ui/Table';
import { UsersIcon, CheckCircleIcon, ClockIcon, AlertTriangleIcon } from '../icons/Icons';
import { evaluatorService, Evaluator, Evaluation, EvaluationProgress, USER_ROLES, EVALUATION_TYPES } from '../../services/evaluatorService';
import { applicationService, Application } from '../../services/applicationService';
import { userService } from '../../services/userService';
import { User, UserRole, USER_ROLE_LABELS } from '../../types/user';

interface EvaluatorManagementProps {
  applications?: Application[];
  onRefresh?: () => void;
}

const EvaluatorManagement: React.FC<EvaluatorManagementProps> = ({ applications = [], onRefresh }) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'assign' | 'bulk' | 'progress'>('overview');
  const [evaluators, setEvaluators] = useState<Record<string, User[]>>({});
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

  const loadAllEvaluators = async () => {
    setLoading(true);
    try {
      console.log('🔄 Cargando evaluadores reales del sistema...');
      
      // Obtener solo los usuarios del colegio (staff) que pueden ser evaluadores
      const usersResponse = await userService.getSchoolStaffUsers();
      const allStaff = usersResponse.content || [];
      
      // Definir qué roles pueden ser evaluadores
      const evaluatorRoles = [
        UserRole.TEACHER_LANGUAGE,
        UserRole.TEACHER_MATHEMATICS, 
        UserRole.TEACHER_ENGLISH,
        UserRole.CYCLE_DIRECTOR,
        UserRole.PSYCHOLOGIST
      ];
      
      // Agrupar evaluadores por rol
      const evaluatorData: Record<string, User[]> = {};
      
      evaluatorRoles.forEach(role => {
        const roleUsers = allStaff.filter(user => 
          user.role === role && user.active && user.emailVerified
        );
        evaluatorData[role] = roleUsers;
        console.log(`✅ Evaluadores ${USER_ROLE_LABELS[role]}:`, roleUsers.length);
      });
      
      setEvaluators(evaluatorData);
      console.log('✅ Evaluadores cargados exitosamente:', evaluatorData);
      
    } catch (error) {
      console.error('❌ Error cargando evaluadores:', error);
      // Fallback a datos vacíos
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

  const handleAssignEvaluations = async (applicationId: number) => {
    setLoading(true);
    try {
      // Intentar asignación automática
      let result;
      try {
        result = await evaluatorService.assignEvaluationsToApplication(applicationId);
      } catch (authError) {
        console.warn('Auth failed, trying public endpoint');
        result = await evaluatorService.assignEvaluationsToApplicationPublic(applicationId);
      }
      
      console.log('Evaluaciones asignadas:', result);
      
      // Recargar las evaluaciones de la aplicación
      if (selectedApplication?.id === applicationId) {
        await loadApplicationEvaluations(applicationId);
      }
      
      onRefresh?.();
      alert('Evaluaciones asignadas correctamente');
    } catch (error) {
      console.error('Error assigning evaluations:', error);
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
      console.error('Error assigning specific evaluation:', error);
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
      console.error('Error loading application evaluations:', error);
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
        console.warn('Auth failed, trying public endpoint');
        result = await evaluatorService.assignBulkEvaluationsPublic({ applicationIds: bulkSelection });
      }
      
      setBulkResults(result);
      setShowBulkResults(true);
      setBulkSelection([]);
      onRefresh?.();
    } catch (error) {
      console.error('Error in bulk assignment:', error);
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
                    <span className="text-sm">
                      {evaluator.firstName} {evaluator.lastName}
                    </span>
                    <Badge variant={evaluator.active ? 'success' : 'error'}>
                      {evaluator.active ? 'Activo' : 'Inactivo'}
                    </Badge>
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
        
        <div className="grid grid-cols-1 gap-4">
          {applications.map(app => (
            <div key={app.id} className="border rounded-lg p-4">
              <div className="flex justify-between items-center">
                <div>
                  <h4 className="font-medium">
                    {app.applicant?.firstName} {app.applicant?.lastName}
                  </h4>
                  <p className="text-sm text-gray-600">
                    Grado: {app.applicant?.grade} | Estado: {app.status}
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
      </Card>

      {selectedApplication && evaluations.length > 0 && (
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">
            Evaluaciones de {selectedApplication.applicant?.firstName} {selectedApplication.applicant?.lastName}
          </h3>
          
          {progress && (
            <div className="mb-4 p-3 bg-blue-50 rounded">
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
                    onChange={() => {}} // Manejado por el onClick del div
                    className="mr-3"
                  />
                  <div>
                    <p className="font-medium">
                      {app.applicant?.firstName} {app.applicant?.lastName}
                    </p>
                    <p className="text-sm text-gray-600">
                      Grado: {app.applicant?.grade} | Estado: {app.status}
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

          {selectedEvaluationType && (
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
                {/* Aquí filtraremos por el rol requerido para el tipo de evaluación */}
                {Object.entries(evaluators).map(([role, roleEvaluators]) => 
                  roleEvaluators.map(evaluator => (
                    <option key={evaluator.id} value={evaluator.id}>
                      {evaluator.firstName} {evaluator.lastName} ({USER_ROLE_LABELS[role as UserRole]})
                    </option>
                  ))
                )}
              </select>
            </div>
          )}

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