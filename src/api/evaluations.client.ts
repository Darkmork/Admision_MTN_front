/**
 * Evaluations API Client - Typed SDK
 * Generated for MTN Admission System
 */

import httpClient from '../../services/http';
import type {
  Evaluation,
  CreateEvaluationRequest,
  UpdateEvaluationRequest,
  EvaluationSearchParams,
  EvaluationStatistics,
  EvaluatorAssignment,
  EvaluationsResponse,
  PaginatedResponse
} from './evaluations.types';

export class EvaluationsClient {
  private readonly basePath = '/api/evaluations';

  /**
   * Get all evaluations with optional filtering and pagination
   */
  async getEvaluations(params?: EvaluationSearchParams): Promise<PaginatedResponse<Evaluation>> {
    const response = await httpClient.get<EvaluationsResponse<PaginatedResponse<Evaluation>>>(
      this.basePath,
      { params }
    );
    return response.data;
  }

  /**
   * Get evaluation by ID
   */
  async getEvaluationById(id: number): Promise<Evaluation> {
    const response = await httpClient.get<EvaluationsResponse<Evaluation>>(
      `${this.basePath}/${id}`
    );
    return response.data;
  }

  /**
   * Create new evaluation
   */
  async createEvaluation(evaluationData: CreateEvaluationRequest): Promise<Evaluation> {
    const response = await httpClient.post<EvaluationsResponse<Evaluation>>(
      this.basePath,
      evaluationData
    );
    return response.data;
  }

  /**
   * Update evaluation with scores and comments
   */
  async updateEvaluation(id: number, evaluationData: UpdateEvaluationRequest): Promise<Evaluation> {
    const response = await httpClient.put<EvaluationsResponse<Evaluation>>(
      `${this.basePath}/${id}`,
      evaluationData
    );
    return response.data;
  }

  /**
   * Delete evaluation
   */
  async deleteEvaluation(id: number): Promise<void> {
    await httpClient.delete<EvaluationsResponse<void>>(`${this.basePath}/${id}`);
  }

  /**
   * Complete evaluation with final score
   */
  async completeEvaluation(
    id: number, 
    data: { score: number; maxScore: number; comments?: string; recommendations?: string }
  ): Promise<Evaluation> {
    const response = await httpClient.post<EvaluationsResponse<Evaluation>>(
      `${this.basePath}/${id}/complete`,
      data
    );
    return response.data;
  }

  /**
   * Get evaluations by application
   */
  async getEvaluationsByApplication(applicationId: number): Promise<Evaluation[]> {
    const response = await httpClient.get<EvaluationsResponse<Evaluation[]>>(
      `${this.basePath}/application/${applicationId}`
    );
    return response.data;
  }

  /**
   * Get evaluations assigned to evaluator
   */
  async getEvaluationsByEvaluator(
    evaluatorId: number, 
    params?: Omit<EvaluationSearchParams, 'evaluatorId'>
  ): Promise<Evaluation[]> {
    const response = await httpClient.get<EvaluationsResponse<Evaluation[]>>(
      `${this.basePath}/evaluator/${evaluatorId}`,
      { params }
    );
    return response.data;
  }

  /**
   * Get evaluations by type (ACADEMIC, PSYCHOLOGICAL, etc.)
   */
  async getEvaluationsByType(
    type: Evaluation['type'],
    params?: Omit<EvaluationSearchParams, 'type'>
  ): Promise<Evaluation[]> {
    const response = await httpClient.get<EvaluationsResponse<Evaluation[]>>(
      `${this.basePath}/type/${type}`,
      { params }
    );
    return response.data;
  }

  /**
   * Get evaluations by subject and educational level
   */
  async getEvaluationsBySubject(
    subject: Evaluation['subject'],
    educationalLevel?: Evaluation['educationalLevel']
  ): Promise<Evaluation[]> {
    const response = await httpClient.get<EvaluationsResponse<Evaluation[]>>(
      `${this.basePath}/subject/${subject}`,
      { params: { educationalLevel } }
    );
    return response.data;
  }

  /**
   * Get pending evaluations for evaluator
   */
  async getPendingEvaluations(evaluatorId: number): Promise<Evaluation[]> {
    const response = await httpClient.get<EvaluationsResponse<Evaluation[]>>(
      `${this.basePath}/evaluator/${evaluatorId}/pending`
    );
    return response.data;
  }

  /**
   * Get completed evaluations for evaluator
   */
  async getCompletedEvaluations(evaluatorId: number): Promise<Evaluation[]> {
    const response = await httpClient.get<EvaluationsResponse<Evaluation[]>>(
      `${this.basePath}/evaluator/${evaluatorId}/completed`
    );
    return response.data;
  }

  /**
   * Get evaluation statistics
   */
  async getEvaluationStatistics(): Promise<EvaluationStatistics> {
    const response = await httpClient.get<EvaluationsResponse<EvaluationStatistics>>(
      `${this.basePath}/statistics`
    );
    return response.data;
  }

  /**
   * Get evaluator workload and assignments
   */
  async getEvaluatorAssignments(): Promise<EvaluatorAssignment[]> {
    const response = await httpClient.get<EvaluationsResponse<EvaluatorAssignment[]>>(
      `${this.basePath}/assignments`
    );
    return response.data;
  }

  /**
   * Assign evaluation to evaluator
   */
  async assignEvaluator(evaluationId: number, evaluatorId: number): Promise<Evaluation> {
    const response = await httpClient.post<EvaluationsResponse<Evaluation>>(
      `${this.basePath}/${evaluationId}/assign`,
      { evaluatorId }
    );
    return response.data;
  }

  /**
   * Reschedule evaluation
   */
  async rescheduleEvaluation(id: number, newDate: string): Promise<Evaluation> {
    const response = await httpClient.post<EvaluationsResponse<Evaluation>>(
      `${this.basePath}/${id}/reschedule`,
      { scheduledDate: newDate }
    );
    return response.data;
  }

  /**
   * Cancel evaluation
   */
  async cancelEvaluation(id: number, reason?: string): Promise<Evaluation> {
    const response = await httpClient.post<EvaluationsResponse<Evaluation>>(
      `${this.basePath}/${id}/cancel`,
      { reason }
    );
    return response.data;
  }

  /**
   * Export evaluations to CSV
   */
  async exportEvaluations(params?: EvaluationSearchParams): Promise<Blob> {
    const response = await httpClient.get(
      `${this.basePath}/export`,
      { 
        params,
        headers: { 'Accept': 'text/csv' },
        responseType: 'blob'
      }
    );
    return response as unknown as Blob;
  }

  /**
   * Bulk assign evaluations
   */
  async bulkAssignEvaluations(
    evaluationIds: number[], 
    evaluatorId: number
  ): Promise<Evaluation[]> {
    const response = await httpClient.post<EvaluationsResponse<Evaluation[]>>(
      `${this.basePath}/bulk/assign`,
      { evaluationIds, evaluatorId }
    );
    return response.data;
  }
}

// Export singleton instance
export const evaluationsClient = new EvaluationsClient();

// Export individual functions for convenience
export const {
  getEvaluations,
  getEvaluationById,
  createEvaluation,
  updateEvaluation,
  deleteEvaluation,
  completeEvaluation,
  getEvaluationsByApplication,
  getEvaluationsByEvaluator,
  getEvaluationsByType,
  getEvaluationsBySubject,
  getPendingEvaluations,
  getCompletedEvaluations,
  getEvaluationStatistics,
  getEvaluatorAssignments,
  assignEvaluator,
  rescheduleEvaluation,
  cancelEvaluation,
  exportEvaluations,
  bulkAssignEvaluations
} = evaluationsClient;