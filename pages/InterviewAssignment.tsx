import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import EvaluatorScheduleDisplay from '../components/EvaluatorScheduleDisplay';
import { userService } from '../services/userService';
import { applicationService } from '../services/applicationService';
import { interviewService } from '../services/interviewService';
import { User } from '../types/user';
import { Application } from '../types/application';
import { Interview } from '../types/interview';

const InterviewAssignment: React.FC = () => {
  const { user } = useAuth();
  const [evaluators, setEvaluators] = useState<User[]>([]);
  const [selectedEvaluator, setSelectedEvaluator] = useState<User | null>(null);
  const [pendingApplications, setPendingApplications] = useState<Application[]>([]);
  const [selectedApplication, setSelectedApplication] = useState<Application | null>(null);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<{ date: string; time: string } | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    try {
      // Cargar evaluadores
      const usersResponse = await userService.getAllUsers();
      const evaluatorUsers = (usersResponse?.content || []).filter(u => 
        ['TEACHER', 'COORDINATOR', 'PSYCHOLOGIST', 'CYCLE_DIRECTOR'].includes(u.role) && u.active
      );
      setEvaluators(evaluatorUsers);

      // Cargar postulaciones pendientes
      const applications = await applicationService.getAllApplications();
      const pending = (applications || []).filter(app => 
        ['SUBMITTED', 'UNDER_REVIEW'].includes(app.status)
      );
      setPendingApplications(pending);

      // Seleccionar primer evaluador por defecto
      if (evaluatorUsers.length > 0) {
        setSelectedEvaluator(evaluatorUsers[0]);
      }

      console.log('✅ Datos iniciales cargados:', { 
        evaluators: evaluatorUsers.length, 
        pendingApplications: pending.length 
      });
    } catch (error) {
      console.error('Error loading data:', error);
      setMessage('❌ Error cargando datos iniciales');
      // Establecer valores por defecto para evitar errores
      setEvaluators([]);
      setPendingApplications([]);
    }
  };

  const handleSlotSelect = (date: string, time: string) => {
    setSelectedTimeSlot({ date, time });
  };

  const handleAssignInterview = async () => {
    if (!selectedApplication || !selectedEvaluator || !selectedTimeSlot) {
      setMessage('❌ Debe seleccionar una postulación, evaluador y horario');
      return;
    }

    setIsLoading(true);
    try {
      const interviewData = {
        applicationId: selectedApplication.id,
        interviewerId: selectedEvaluator.id,
        scheduledDate: selectedTimeSlot.date,
        scheduledTime: selectedTimeSlot.time,
        type: 'ADMISSION',
        mode: 'IN_PERSON',
        duration: 60,
        notes: `Entrevista asignada para ${selectedApplication.student.firstName} ${selectedApplication.student.lastName}`
      };

      await interviewService.createInterview(interviewData);
      
      setMessage('✅ Entrevista asignada exitosamente');
      setSelectedApplication(null);
      setSelectedTimeSlot(null);
      
      // Recargar datos
      loadInitialData();
      
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      console.error('Error assigning interview:', error);
      setMessage('❌ Error asignando la entrevista');
      setTimeout(() => setMessage(''), 3000);
    } finally {
      setIsLoading(false);
    }
  };

  if (!user || !['ADMIN', 'COORDINATOR', 'CYCLE_DIRECTOR'].includes(user.role)) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-md text-center">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Acceso Restringido</h2>
          <p className="text-gray-600">Esta página es solo para coordinadores y administradores.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Asignación de Entrevistas
          </h1>
          <p className="text-gray-600">
            Asigne entrevistas a los evaluadores seleccionando postulaciones pendientes
            y horarios disponibles.
          </p>
        </div>

        {/* Message */}
        {message && (
          <div className="mb-6">
            <div className={`p-4 rounded-lg ${
              message.includes('✅') ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'
            }`}>
              {message}
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Evaluators Selection */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Seleccionar Evaluador
              </h3>
              <div className="space-y-2">
                {evaluators.map(evaluator => (
                  <button
                    key={evaluator.id}
                    onClick={() => setSelectedEvaluator(evaluator)}
                    className={`w-full text-left p-3 rounded-lg border transition-colors ${
                      selectedEvaluator?.id === evaluator.id
                        ? 'border-blue-500 bg-blue-50 text-blue-900'
                        : 'border-gray-200 hover:bg-gray-50'
                    }`}
                  >
                    <div className="font-medium">{evaluator.firstName} {evaluator.lastName}</div>
                    <div className="text-sm text-gray-600">{evaluator.roleDisplayName}</div>
                    {evaluator.educationalLevelDisplayName && (
                      <div className="text-xs text-gray-500">{evaluator.educationalLevelDisplayName}</div>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Pending Applications */}
            <div className="bg-white rounded-lg shadow-md p-6 mt-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Postulaciones Pendientes ({pendingApplications.length})
              </h3>
              <div className="space-y-2 max-h-80 overflow-y-auto">
                {pendingApplications.map(application => (
                  <button
                    key={application.id}
                    onClick={() => setSelectedApplication(application)}
                    className={`w-full text-left p-3 rounded-lg border transition-colors ${
                      selectedApplication?.id === application.id
                        ? 'border-green-500 bg-green-50 text-green-900'
                        : 'border-gray-200 hover:bg-gray-50'
                    }`}
                  >
                    <div className="font-medium">
                      {application.student.firstName} {application.student.lastName}
                    </div>
                    <div className="text-sm text-gray-600">
                      {application.student.gradeApplied} - {application.status}
                    </div>
                    <div className="text-xs text-gray-500">
                      {new Date(application.submissionDate).toLocaleDateString('es-CL')}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Schedule Display */}
          <div className="lg:col-span-2">
            {selectedEvaluator ? (
              <EvaluatorScheduleDisplay
                evaluatorId={selectedEvaluator.id}
                evaluatorName={`${selectedEvaluator.firstName} ${selectedEvaluator.lastName}`}
                onSlotSelect={handleSlotSelect}
                selectedSlot={selectedTimeSlot}
              />
            ) : (
              <div className="bg-white rounded-lg shadow-md p-6 flex items-center justify-center h-96">
                <div className="text-center text-gray-500">
                  <div className="text-4xl mb-4">👆</div>
                  <p>Seleccione un evaluador para ver sus horarios disponibles</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Assignment Panel */}
        {selectedApplication && selectedEvaluator && selectedTimeSlot && (
          <div className="mt-6 bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Confirmar Asignación
            </h3>
            <div className="bg-blue-50 p-4 rounded-lg mb-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <strong>Estudiante:</strong><br />
                  {selectedApplication.student.firstName} {selectedApplication.student.lastName}<br />
                  <span className="text-sm text-gray-600">{selectedApplication.student.gradeApplied}</span>
                </div>
                <div>
                  <strong>Evaluador:</strong><br />
                  {selectedEvaluator.firstName} {selectedEvaluator.lastName}<br />
                  <span className="text-sm text-gray-600">{selectedEvaluator.roleDisplayName}</span>
                </div>
                <div>
                  <strong>Fecha y Hora:</strong><br />
                  {new Date(selectedTimeSlot.date).toLocaleDateString('es-CL', { 
                    weekday: 'long', 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}<br />
                  <span className="text-sm text-gray-600">{selectedTimeSlot.time} hrs</span>
                </div>
              </div>
            </div>
            <div className="flex justify-end space-x-4">
              <button
                onClick={() => {
                  setSelectedApplication(null);
                  setSelectedTimeSlot(null);
                }}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleAssignInterview}
                disabled={isLoading}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
              >
                {isLoading ? 'Asignando...' : 'Confirmar Asignación'}
              </button>
            </div>
          </div>
        )}

        {/* Help */}
        <div className="mt-6 bg-white rounded-lg shadow-md p-6">
          <h3 className="font-semibold text-gray-900 mb-2">💡 Cómo usar</h3>
          <ul className="text-sm text-gray-600 space-y-1">
            <li>1. Seleccione un evaluador de la lista izquierda</li>
            <li>2. Revise su horario semanal - los slots verdes están disponibles</li>
            <li>3. Seleccione una postulación pendiente</li>
            <li>4. Haga clic en un horario disponible (verde) para seleccionarlo</li>
            <li>5. Confirme la asignación en el panel inferior</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default InterviewAssignment;