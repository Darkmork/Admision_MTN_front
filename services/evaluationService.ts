import api from './api';
import { 
  EvaluationSchedule,
  CreateGenericScheduleRequest,
  CreateIndividualScheduleRequest,
  RescheduleRequest,
  ScheduleResponse,
  ScheduleListResponse,
  EvaluationType,
  EvaluationStatus,
  ScheduleStatus,
  ScheduleType,
  Evaluation,
  EVALUATION_TYPE_LABELS,
  EVALUATION_STATUS_LABELS
} from '../types/evaluation';

export enum UserRole {
    APODERADO = 'APODERADO',
    ADMIN = 'ADMIN',
    TEACHER_LANGUAGE = 'TEACHER_LANGUAGE',
    TEACHER_MATHEMATICS = 'TEACHER_MATHEMATICS',
    TEACHER_ENGLISH = 'TEACHER_ENGLISH',
    CYCLE_DIRECTOR = 'CYCLE_DIRECTOR',
    PSYCHOLOGIST = 'PSYCHOLOGIST'
}

export const USER_ROLE_LABELS = {
    [UserRole.APODERADO]: 'Apoderado',
    [UserRole.ADMIN]: 'Administrador',
    [UserRole.TEACHER_LANGUAGE]: 'Profesor de Lenguaje',
    [UserRole.TEACHER_MATHEMATICS]: 'Profesor de Matemáticas',
    [UserRole.TEACHER_ENGLISH]: 'Profesor de Inglés',
    [UserRole.CYCLE_DIRECTOR]: 'Director de Ciclo',
    [UserRole.PSYCHOLOGIST]: 'Psicólogo/a'
};

class EvaluationService {

    // ============= PROGRAMACIÓN DE EVALUACIONES =============
    
    /**
     * Crear programación genérica (solo administradores)
     */
    async createGenericSchedule(request: CreateGenericScheduleRequest): Promise<ScheduleResponse> {
      try {
        console.log('📅 Creando programación genérica:', request);
        
        const response = await api.post('/api/schedules/generic', request);
        return response.data;
      } catch (error: any) {
        console.error('❌ Error creando programación genérica:', error);
        throw new Error(
          error.response?.data?.message || 
          error.message || 
          'Error al crear la programación'
        );
      }
    }

    /**
     * Crear programación individual
     */
    async createIndividualSchedule(request: CreateIndividualScheduleRequest): Promise<ScheduleResponse> {
      try {
        console.log('📅 Creando programación individual:', request);
        
        const response = await api.post('/api/schedules/individual', request);
        return response.data;
      } catch (error: any) {
        console.error('❌ Error creando programación individual:', error);
        throw new Error(
          error.response?.data?.message || 
          error.message || 
          'Error al crear la programación individual'
        );
      }
    }

    /**
     * Obtener próximas citas para una familia
     */
    async getFamilySchedules(applicationId: number): Promise<EvaluationSchedule[]> {
      try {
        console.log('📋 Obteniendo citas para aplicación:', applicationId);
        
        const response = await api.get(`/api/schedules/family/${applicationId}`);
        return response.data;
      } catch (error: any) {
        console.error('❌ Error obteniendo citas familiares:', error);
        throw new Error('Error al obtener las citas programadas');
      }
    }

    /**
     * Obtener calendario del evaluador
     */
    async getEvaluatorSchedule(
      evaluatorId: number, 
      startDate: string, 
      endDate: string
    ): Promise<EvaluationSchedule[]> {
      try {
        console.log('👨‍🏫 Obteniendo calendario del evaluador:', evaluatorId);
        
        const response = await api.get(`/api/schedules/evaluator/${evaluatorId}`, {
          params: { startDate, endDate }
        });
        return response.data;
      } catch (error: any) {
        console.error('❌ Error obteniendo calendario del evaluador:', error);
        throw new Error('Error al obtener el calendario del evaluador');
      }
    }

    /**
     * Confirmar cita (familias)
     */
    async confirmSchedule(scheduleId: number, userId: number): Promise<EvaluationSchedule> {
      try {
        console.log('✅ Confirmando cita:', scheduleId);
        
        const response = await api.put(`/api/schedules/${scheduleId}/confirm`, null, {
          params: { userId }
        });
        return response.data;
      } catch (error: any) {
        console.error('❌ Error confirmando cita:', error);
        throw new Error(
          error.response?.data?.message || 
          'Error al confirmar la cita'
        );
      }
    }

    /**
     * Reprogramar cita
     */
    async rescheduleAppointment(scheduleId: number, request: RescheduleRequest): Promise<EvaluationSchedule> {
      try {
        console.log('🔄 Reprogramando cita:', scheduleId, request);
        
        const response = await api.put(`/api/schedules/${scheduleId}/reschedule`, request);
        return response.data;
      } catch (error: any) {
        console.error('❌ Error reprogramando cita:', error);
        throw new Error(
          error.response?.data?.message || 
          'Error al reprogramar la cita'
        );
      }
    }

    /**
     * Obtener citas pendientes de confirmación
     */
    async getPendingConfirmations(): Promise<EvaluationSchedule[]> {
      try {
        console.log('⏰ Obteniendo citas pendientes de confirmación');
        
        const response = await api.get('/api/schedules/pending-confirmations');
        return response.data;
      } catch (error: any) {
        console.error('❌ Error obteniendo citas pendientes:', error);
        throw new Error('Error al obtener las citas pendientes de confirmación');
      }
    }

    /**
     * Marcar cita como completada
     */
    async markAsCompleted(scheduleId: number): Promise<EvaluationSchedule> {
      try {
        console.log('✅ Marcando cita como completada:', scheduleId);
        
        const response = await api.put(`/api/schedules/${scheduleId}/complete`);
        return response.data;
      } catch (error: any) {
        console.error('❌ Error marcando cita como completada:', error);
        throw new Error('Error al marcar la cita como completada');
      }
    }

    /**
     * Obtener citas mock para demostración
     */
    async getMockFamilySchedules(applicationId: number): Promise<EvaluationSchedule[]> {
      try {
        console.log('🎭 Obteniendo citas mock para aplicación:', applicationId);
        
        const response = await api.get(`/api/schedules/public/mock-schedules/${applicationId}`);
        
        // Convertir datos mock a formato TypeScript
        return response.data.map((mockSchedule: any) => this.convertMockToSchedule(mockSchedule));
      } catch (error: any) {
        console.error('❌ Error obteniendo citas mock:', error);
        throw new Error('Error al obtener las citas de demostración');
      }
    }

    /**
     * Crear datos mock locales para desarrollo
     */
    createLocalMockSchedules(applicationId: number): EvaluationSchedule[] {
      const now = new Date();
      const futureDate1 = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000); // +7 días
      const futureDate2 = new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000); // +14 días
      const pastDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000); // -7 días

      return [
        {
          id: 1,
          evaluationType: EvaluationType.MATHEMATICS_EXAM,
          gradeLevel: '4° Básico',
          application: {
            id: applicationId,
            student: {
              firstName: 'Juan',
              lastName: 'Pérez',
              gradeApplied: '4° Básico'
            }
          },
          evaluator: {
            id: 1,
            firstName: 'María',
            lastName: 'González',
            email: 'maria.gonzalez@mtn.cl'
          },
          scheduledDate: futureDate1.toISOString(),
          durationMinutes: 90,
          location: 'Sala de Matemáticas 201',
          instructions: 'Traer calculadora científica y útiles de escritura.',
          scheduleType: ScheduleType.GENERIC,
          status: ScheduleStatus.SCHEDULED,
          requiresConfirmation: true,
          confirmationDeadline: new Date(futureDate1.getTime() - 24 * 60 * 60 * 1000).toISOString(),
          attendeesRequired: 'Solo el estudiante',
          preparationMaterials: 'Calculadora científica, lápices, goma de borrar',
          createdAt: now.toISOString(),
          updatedAt: now.toISOString()
        },
        {
          id: 2,
          evaluationType: EvaluationType.PSYCHOLOGICAL_INTERVIEW,
          gradeLevel: '4° Básico',
          application: {
            id: applicationId,
            student: {
              firstName: 'Juan',
              lastName: 'Pérez',
              gradeApplied: '4° Básico'
            }
          },
          evaluator: {
            id: 2,
            firstName: 'Carlos',
            lastName: 'López',
            email: 'carlos.lopez@mtn.cl'
          },
          scheduledDate: futureDate2.toISOString(),
          durationMinutes: 60,
          location: 'Oficina de Psicología',
          instructions: 'Entrevista individual con el estudiante. Los padres deben esperar en el hall.',
          scheduleType: ScheduleType.INDIVIDUAL,
          status: ScheduleStatus.CONFIRMED,
          requiresConfirmation: true,
          confirmedAt: now.toISOString(),
          attendeesRequired: 'Estudiante y al menos un apoderado',
          preparationMaterials: 'Ninguno específico',
          createdAt: now.toISOString(),
          updatedAt: now.toISOString()
        },
        {
          id: 3,
          evaluationType: EvaluationType.LANGUAGE_EXAM,
          gradeLevel: '4° Básico',
          application: {
            id: applicationId,
            student: {
              firstName: 'Juan',
              lastName: 'Pérez',
              gradeApplied: '4° Básico'
            }
          },
          evaluator: {
            id: 3,
            firstName: 'Ana',
            lastName: 'Silva',
            email: 'ana.silva@mtn.cl'
          },
          scheduledDate: pastDate.toISOString(),
          durationMinutes: 90,
          location: 'Sala de Lenguaje 102',
          instructions: 'Evaluación de comprensión lectora y redacción.',
          scheduleType: ScheduleType.GENERIC,
          status: ScheduleStatus.COMPLETED,
          requiresConfirmation: false,
          createdAt: pastDate.toISOString(),
          updatedAt: pastDate.toISOString()
        }
      ];
    }

    /**
     * Convertir datos mock del backend a formato TypeScript
     */
    private convertMockToSchedule(mockData: any): EvaluationSchedule {
      return {
        id: mockData.id,
        evaluationType: mockData.evaluationType as EvaluationType,
        gradeLevel: mockData.gradeLevel,
        subject: mockData.subject,
        application: mockData.application ? {
          id: mockData.application.id,
          student: mockData.application.student
        } : undefined,
        evaluator: mockData.evaluator,
        scheduledDate: mockData.scheduledDate,
        durationMinutes: mockData.durationMinutes,
        location: mockData.location,
        meetingLink: mockData.meetingLink,
        instructions: mockData.instructions,
        scheduleType: mockData.scheduleType,
        status: mockData.status as ScheduleStatus,
        requiresConfirmation: mockData.requiresConfirmation,
        confirmationDeadline: mockData.confirmationDeadline,
        confirmedAt: mockData.confirmedAt,
        confirmedBy: mockData.confirmedBy,
        attendeesRequired: mockData.attendeesRequired,
        preparationMaterials: mockData.preparationMaterials,
        createdAt: mockData.createdAt,
        updatedAt: mockData.updatedAt
      };
    }

    // ============= EVALUACIONES LEGACY (mantener compatibilidad) =============

    // Métodos para administradores
    
    async assignEvaluationsToApplication(applicationId: number): Promise<Evaluation[]> {
        try {
            console.log('📝 Asignando evaluaciones automáticamente a aplicación:', applicationId);
            const response = await api.post(`/api/evaluations/assign/${applicationId}`);
            console.log('✅ Evaluaciones asignadas automáticamente');
            return response.data;
        } catch (error: any) {
            console.error('❌ Error asignando evaluaciones automáticamente:', error);
            throw new Error(error.response?.data?.message || 'Error al asignar evaluaciones automáticamente');
        }
    }

    async assignSpecificEvaluation(applicationId: number, evaluationType: EvaluationType, evaluatorId: number): Promise<Evaluation> {
        try {
            console.log('🎯 Asignando evaluación específica:', { applicationId, evaluationType, evaluatorId });
            const response = await api.post(`/api/evaluations/assign/${applicationId}/${evaluationType}/${evaluatorId}`);
            console.log('✅ Evaluación específica asignada');
            return response.data;
        } catch (error: any) {
            console.error('❌ Error asignando evaluación específica:', error);
            throw new Error(error.response?.data?.message || 'Error al asignar evaluación específica');
        }
    }

    async getEvaluationsByApplication(applicationId: number): Promise<Evaluation[]> {
        try {
            console.log('📋 Obteniendo evaluaciones para aplicación:', applicationId);
            const response = await api.get(`/api/evaluations/application/${applicationId}`);
            console.log('✅ Evaluaciones obtenidas');
            return response.data;
        } catch (error: any) {
            console.error('❌ Error obteniendo evaluaciones:', error);
            throw new Error(error.response?.data?.message || 'Error al obtener evaluaciones');
        }
    }

    async getEvaluationProgress(applicationId: number): Promise<{
        applicationId: number;
        totalEvaluations: number;
        completedEvaluations: number;
        completionPercentage: number;
        isComplete: boolean;
    }> {
        try {
            console.log('📊 Obteniendo progreso de evaluación para aplicación:', applicationId);
            const response = await api.get(`/api/evaluations/application/${applicationId}/progress`);
            console.log('✅ Progreso obtenido');
            return response.data;
        } catch (error: any) {
            console.error('❌ Error obteniendo progreso:', error);
            throw new Error(error.response?.data?.message || 'Error al obtener progreso de evaluación');
        }
    }

    async getEvaluatorsByRole(role: UserRole): Promise<any[]> {
        try {
            console.log('👨‍🏫 Obteniendo evaluadores por rol:', role);
            const response = await api.get(`/api/evaluations/evaluators/${role}`);
            console.log('✅ Evaluadores obtenidos');
            return response.data;
        } catch (error: any) {
            console.error('❌ Error obteniendo evaluadores por rol:', error);
            // Fallback to public endpoint for development
            try {
                console.log('🔄 Intentando endpoint público...');
                const response = await fetch(`http://localhost:8080/api/evaluations/public/evaluators/${role}`, {
                    headers: { 'Content-Type': 'application/json' }
                });
                if (response.ok) {
                    const data = await response.json();
                    console.log('✅ Evaluadores obtenidos desde endpoint público');
                    return data;
                }
            } catch (fallbackError) {
                console.error('❌ Error en endpoint público:', fallbackError);
            }
            return [];
        }
    }

    // Métodos para evaluadores

    async getMyEvaluations(): Promise<Evaluation[]> {
        const response = await api.get('/evaluations/my-evaluations');
        return response.data;
    }

    async getMyPendingEvaluations(): Promise<Evaluation[]> {
        const response = await api.get('/evaluations/my-pending');
        return response.data;
    }

    async updateEvaluation(evaluationId: number, evaluationData: Partial<Evaluation>): Promise<Evaluation> {
        const response = await api.put(`/evaluations/${evaluationId}`, evaluationData);
        return response.data;
    }

    async getEvaluationById(evaluationId: number): Promise<Evaluation> {
        const response = await api.get(`/evaluations/${evaluationId}`);
        return response.data;
    }

    // Métodos auxiliares

    getEvaluationTypeLabel(type: EvaluationType): string {
        return EVALUATION_TYPE_LABELS[type] || type;
    }

    getEvaluationStatusLabel(status: EvaluationStatus): string {
        return EVALUATION_STATUS_LABELS[status] || status;
    }

    getUserRoleLabel(role: UserRole): string {
        return USER_ROLE_LABELS[role] || role;
    }

    getStatusColor(status: EvaluationStatus): string {
        switch (status) {
            case EvaluationStatus.PENDING:
                return 'bg-yellow-100 text-yellow-800';
            case EvaluationStatus.IN_PROGRESS:
                return 'bg-blue-100 text-blue-800';
            case EvaluationStatus.COMPLETED:
                return 'bg-green-100 text-green-800';
            case EvaluationStatus.REVIEWED:
                return 'bg-purple-100 text-purple-800';
            case EvaluationStatus.APPROVED:
                return 'bg-green-100 text-green-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    }

    getRequiredFieldsForEvaluationType(type: EvaluationType): string[] {
        const commonFields = ['observations', 'strengths', 'areasForImprovement', 'recommendations'];
        
        switch (type) {
            case EvaluationType.LANGUAGE_EXAM:
            case EvaluationType.MATHEMATICS_EXAM:
            case EvaluationType.ENGLISH_EXAM:
                return [...commonFields, 'score', 'grade'];
            
            case EvaluationType.PSYCHOLOGICAL_INTERVIEW:
                return [...commonFields, 'socialSkillsAssessment', 'emotionalMaturity', 'motivationAssessment', 'familySupportAssessment'];
            
            case EvaluationType.CYCLE_DIRECTOR_REPORT:
            case EvaluationType.CYCLE_DIRECTOR_INTERVIEW:
                return [...commonFields, 'academicReadiness', 'behavioralAssessment', 'integrationPotential', 'finalRecommendation'];
            
            default:
                return commonFields;
        }
    }

    // Nuevos métodos para gestión avanzada de evaluaciones

    async assignBulkEvaluations(applicationIds: number[]): Promise<{
        totalApplications: number;
        successCount: number;
        failureCount: number;
        successful: string[];
        failed: string[];
        isComplete: boolean;
    }> {
        try {
            const response = await api.post('/evaluations/assign/bulk', { applicationIds });
            return response.data;
        } catch (error) {
            // Fallback to public endpoint for development
            const response = await fetch('http://localhost:8080/api/evaluations/public/assign/bulk', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ applicationIds })
            });
            if (response.ok) {
                return await response.json();
            }
            throw error;
        }
    }

    async reassignEvaluation(evaluationId: number, newEvaluatorId: number): Promise<Evaluation> {
        const response = await api.put(`/evaluations/${evaluationId}/reassign/${newEvaluatorId}`);
        return response.data;
    }

    async getEvaluationStatistics(): Promise<{
        totalEvaluations: number;
        statusBreakdown: Record<string, number>;
        typeBreakdown: Record<string, number>;
        averageScoresByType: Record<string, number>;
        evaluatorActivity: Record<string, number>;
        completionRate: number;
    }> {
        try {
            const response = await api.get('/evaluations/statistics');
            return response.data;
        } catch (error) {
            // Fallback to public endpoint for development
            const response = await fetch('http://localhost:8080/api/evaluations/public/statistics', {
                headers: { 'Content-Type': 'application/json' }
            });
            if (response.ok) {
                return await response.json();
            }
            throw error;
        }
    }

    async getDetailedEvaluationsByApplication(applicationId: number): Promise<any[]> {
        const response = await api.get(`/evaluations/application/${applicationId}/detailed`);
        return response.data;
    }

    validateEvaluationData(type: EvaluationType, data: Partial<Evaluation>): { isValid: boolean; errors: string[] } {
        const errors: string[] = [];
        const requiredFields = this.getRequiredFieldsForEvaluationType(type);

        for (const field of requiredFields) {
            if (!data[field as keyof Evaluation] || data[field as keyof Evaluation] === '') {
                errors.push(`El campo ${field} es requerido`);
            }
        }

        // Validaciones específicas
        if ((type === EvaluationType.LANGUAGE_EXAM || type === EvaluationType.MATHEMATICS_EXAM || type === EvaluationType.ENGLISH_EXAM)) {
            if (data.score !== undefined && (data.score < 0 || data.score > 100)) {
                errors.push('El puntaje debe estar entre 0 y 100');
            }
        }

        return {
            isValid: errors.length === 0,
            errors
        };
    }
}

export const evaluationService = new EvaluationService();
export default evaluationService;