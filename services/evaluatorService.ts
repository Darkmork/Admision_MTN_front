import api from './api';

export interface Evaluator {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  active: boolean;
}

export interface Evaluation {
  id: number;
  evaluationType: string;
  status: string;
  score?: number;
  grade?: string;
  observations?: string;
  strengths?: string;
  areasForImprovement?: string;
  recommendations?: string;
  socialSkillsAssessment?: string;
  emotionalMaturity?: string;
  motivationAssessment?: string;
  familySupportAssessment?: string;
  academicReadiness?: string;
  behavioralAssessment?: string;
  integrationPotential?: string;
  finalRecommendation?: boolean;
  evaluationDate?: string;
  completionDate?: string;
  createdAt: string;
  updatedAt?: string;
  evaluator?: Evaluator;
  application?: {
    id: number;
    status: string;
    submissionDate: string;
    student: {
      firstName: string;
      lastName: string;
      rut: string;
      gradeApplied: string;
    };
  };
}

export interface EvaluationProgress {
  applicationId: number;
  totalEvaluations: number;
  completedEvaluations: number;
  completionPercentage: number;
  isComplete: boolean;
}

export interface EvaluationStatistics {
  totalEvaluations: number;
  statusBreakdown: Record<string, number>;
  typeBreakdown: Record<string, number>;
  averageScoresByType: Record<string, number>;
  evaluatorActivity: Record<string, number>;
  completionRate: number;
}

export interface BulkAssignmentRequest {
  applicationIds: number[];
}

export interface BulkAssignmentResult {
  totalApplications: number;
  successCount: number;
  failureCount: number;
  successful: string[];
  failed: string[];
  isComplete: boolean;
}

export const evaluatorService = {
  // Obtener evaluadores por rol
  async getEvaluatorsByRole(role: string): Promise<Evaluator[]> {
    try {
      const response = await api.get(`/api/evaluations/evaluators/${role}`);
      return response.data;
    } catch (error) {
      console.error('Error getting evaluators by role:', error);
      throw error;
    }
  },

  // Obtener evaluadores por rol (endpoint público para desarrollo)
  async getEvaluatorsByRolePublic(role: string): Promise<Evaluator[]> {
    try {
      const response = await api.get(`/api/evaluations/public/evaluators/${role}`);
      return response.data;
    } catch (error) {
      console.error('Error getting evaluators by role (public):', error);
      throw error;
    }
  },

  // Asignar evaluaciones automáticamente a una aplicación
  async assignEvaluationsToApplication(applicationId: number): Promise<Evaluation[]> {
    try {
      const response = await api.post(`/api/evaluations/assign/${applicationId}`);
      return response.data;
    } catch (error) {
      console.error('Error assigning evaluations to application:', error);
      throw error;
    }
  },

  // Asignar evaluaciones automáticamente (endpoint público)
  async assignEvaluationsToApplicationPublic(applicationId: number): Promise<any> {
    try {
      const response = await api.post(`/api/evaluations/public/assign/${applicationId}`);
      return response.data;
    } catch (error) {
      console.error('Error assigning evaluations (public):', error);
      throw error;
    }
  },

  // Asignar evaluación específica a evaluador específico
  async assignSpecificEvaluation(
    applicationId: number, 
    evaluationType: string, 
    evaluatorId: number
  ): Promise<Evaluation> {
    try {
      const response = await api.post(`/api/evaluations/assign/${applicationId}/${evaluationType}/${evaluatorId}`);
      return response.data;
    } catch (error) {
      console.error('Error assigning specific evaluation:', error);
      throw error;
    }
  },

  // Obtener evaluaciones de una aplicación
  async getEvaluationsByApplication(applicationId: number): Promise<Evaluation[]> {
    try {
      const response = await api.get(`/api/evaluations/application/${applicationId}`);
      return response.data;
    } catch (error) {
      console.error('Error getting evaluations by application:', error);
      throw error;
    }
  },

  // Obtener evaluaciones detalladas de una aplicación
  async getDetailedEvaluationsByApplication(applicationId: number): Promise<Evaluation[]> {
    try {
      const response = await api.get(`/api/evaluations/application/${applicationId}/detailed`);
      return response.data;
    } catch (error) {
      console.error('Error getting detailed evaluations by application:', error);
      throw error;
    }
  },

  // Obtener progreso de evaluaciones de una aplicación
  async getEvaluationProgress(applicationId: number): Promise<EvaluationProgress> {
    try {
      const response = await api.get(`/api/evaluations/application/${applicationId}/progress`);
      return response.data;
    } catch (error) {
      console.error('Error getting evaluation progress:', error);
      throw error;
    }
  },

  // Obtener evaluaciones del evaluador actual
  async getMyEvaluations(): Promise<Evaluation[]> {
    try {
      const response = await api.get('/api/evaluations/my-evaluations');
      return response.data;
    } catch (error) {
      console.error('Error getting my evaluations:', error);
      throw error;
    }
  },

  // Obtener evaluaciones pendientes del evaluador actual
  async getMyPendingEvaluations(): Promise<Evaluation[]> {
    try {
      const response = await api.get('/api/evaluations/my-pending');
      return response.data;
    } catch (error) {
      console.error('Error getting my pending evaluations:', error);
      throw error;
    }
  },

  // Actualizar evaluación
  async updateEvaluation(evaluationId: number, evaluationData: Partial<Evaluation>): Promise<Evaluation> {
    try {
      const response = await api.put(`/api/evaluations/${evaluationId}`, evaluationData);
      return response.data;
    } catch (error) {
      console.error('Error updating evaluation:', error);
      throw error;
    }
  },

  // Actualizar evaluación con nuevos tipos
  async updateEvaluationWithTypes(evaluationId: number, evaluationData: any): Promise<any> {
    try {
      const response = await api.put(`/api/evaluations/${evaluationId}`, evaluationData);
      return response.data;
    } catch (error) {
      console.error('Error updating evaluation with types:', error);
      throw error;
    }
  },

  // Obtener evaluación por ID
  async getEvaluationById(evaluationId: number): Promise<Evaluation> {
    try {
      const response = await api.get(`/api/evaluations/${evaluationId}`);
      return response.data;
    } catch (error) {
      console.error('Error getting evaluation by ID:', error);
      throw error;
    }
  },

  // Asignación masiva de evaluaciones
  async assignBulkEvaluations(request: BulkAssignmentRequest): Promise<BulkAssignmentResult> {
    try {
      const response = await api.post('/api/evaluations/assign/bulk', request);
      return response.data;
    } catch (error) {
      console.error('Error assigning bulk evaluations:', error);
      throw error;
    }
  },

  // Asignación masiva (endpoint público)
  async assignBulkEvaluationsPublic(request: BulkAssignmentRequest): Promise<BulkAssignmentResult> {
    try {
      const response = await api.post('/api/evaluations/public/assign/bulk', request);
      return response.data;
    } catch (error) {
      console.error('Error assigning bulk evaluations (public):', error);
      throw error;
    }
  },

  // Reasignar evaluación a otro evaluador
  async reassignEvaluation(evaluationId: number, newEvaluatorId: number): Promise<Evaluation> {
    try {
      const response = await api.put(`/api/evaluations/${evaluationId}/reassign/${newEvaluatorId}`);
      return response.data;
    } catch (error) {
      console.error('Error reassigning evaluation:', error);
      throw error;
    }
  },

  // Obtener estadísticas de evaluaciones
  async getEvaluationStatistics(): Promise<EvaluationStatistics> {
    try {
      const response = await api.get('/api/evaluations/statistics');
      return response.data;
    } catch (error) {
      console.error('Error getting evaluation statistics:', error);
      throw error;
    }
  },

  // Obtener estadísticas (endpoint público)
  async getEvaluationStatisticsPublic(): Promise<EvaluationStatistics> {
    try {
      const response = await api.get('/api/evaluations/public/statistics');
      return response.data;
    } catch (error) {
      console.error('Error getting evaluation statistics (public):', error);
      throw error;
    }
  }
};

// Constantes para los tipos y estados
export const EVALUATION_TYPES = {
  LANGUAGE_EXAM: 'Examen de Lenguaje',
  MATHEMATICS_EXAM: 'Examen de Matemáticas',
  ENGLISH_EXAM: 'Examen de Inglés',
  CYCLE_DIRECTOR_REPORT: 'Informe Director de Ciclo',
  CYCLE_DIRECTOR_INTERVIEW: 'Entrevista Director/a de Ciclo',
  PSYCHOLOGICAL_INTERVIEW: 'Entrevista Psicológica'
} as const;

export const EVALUATION_STATUSES = {
  PENDING: 'Pendiente',
  IN_PROGRESS: 'En Progreso',
  COMPLETED: 'Completada',
  REVIEWED: 'Revisada',
  APPROVED: 'Aprobada'
} as const;

export const USER_ROLES = {
  TEACHER_LANGUAGE: 'Profesor de Lenguaje',
  TEACHER_MATHEMATICS: 'Profesor de Matemáticas',
  TEACHER_ENGLISH: 'Profesor de Inglés',
  CYCLE_DIRECTOR: 'Director/a de Ciclo',
  PSYCHOLOGIST: 'Psicólogo/a'
} as const;

// Mapeo de tipos de evaluación a roles requeridos
export const EVALUATION_TYPE_TO_ROLE = {
  LANGUAGE_EXAM: 'TEACHER_LANGUAGE',
  MATHEMATICS_EXAM: 'TEACHER_MATHEMATICS',
  ENGLISH_EXAM: 'TEACHER_ENGLISH',
  CYCLE_DIRECTOR_REPORT: 'CYCLE_DIRECTOR',
  CYCLE_DIRECTOR_INTERVIEW: 'CYCLE_DIRECTOR',
  PSYCHOLOGICAL_INTERVIEW: 'PSYCHOLOGIST'
} as const;