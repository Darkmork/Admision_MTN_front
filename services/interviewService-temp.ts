import api from './api';
import {
  Interview,
  InterviewStatus,
  InterviewType,
  InterviewMode,
  InterviewResult,
  InterviewFilters,
  InterviewStats,
  CreateInterviewRequest,
  UpdateInterviewRequest,
  CompleteInterviewRequest
} from '../types/interview';

// Respuesta simple del endpoint público
export interface PublicInterviewResponse {
  returnedRecords: number;
  databaseName: string;
  tableExists: number;
  totalCount: number;
  applicationsCount: number;
  interviews: {
    scheduledDate: string;
    id: number;
    applicationId: number;
    status: string;
  }[];
}

class TemporaryInterviewService {
  private publicUrl = '/api/interviews/public/all';
  private localUpdates: Map<number, Partial<Interview>> = new Map();

  // Convertir response simple a formato frontend
  private mapPublicInterviewResponse(interview: any): Interview {
    // Convertir fecha ISO a formato compatible con inputs HTML
    const isoDate = interview.scheduledDate;
    const dateObj = new Date(isoDate);
    const htmlDate = dateObj.toISOString().split('T')[0]; // yyyy-MM-dd
    const htmlTime = dateObj.toISOString().split('T')[1].substring(0, 5); // HH:mm
    
    return {
      id: interview.id,
      applicationId: interview.applicationId,
      studentName: `Estudiante ${interview.applicationId}`, // Placeholder
      parentNames: `Familia ${interview.applicationId}`, // Placeholder
      gradeApplied: 'Por definir', // Placeholder
      interviewerId: 2, // ID del entrevistador por defecto
      interviewerName: 'Ana Rivera', // Nombre por defecto
      status: interview.status as InterviewStatus,
      type: 'INDIVIDUAL' as InterviewType,
      mode: 'IN_PERSON' as InterviewMode,
      scheduledDate: htmlDate, // Formato yyyy-MM-dd
      scheduledTime: htmlTime, // Formato HH:mm
      duration: 60,
      location: 'Oficina Principal',
      virtualMeetingLink: undefined,
      notes: `Entrevista para aplicación ${interview.applicationId}`,
      preparation: undefined,
      result: undefined,
      score: undefined,
      recommendations: undefined,
      followUpRequired: false,
      followUpNotes: undefined,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      completedAt: undefined,
      isUpcoming: new Date(interview.scheduledDate) > new Date(),
      isOverdue: new Date(interview.scheduledDate) < new Date() && interview.status === 'SCHEDULED',
      canBeCompleted: interview.status === 'SCHEDULED',
      canBeEdited: interview.status !== 'COMPLETED',
      canBeCancelled: interview.status === 'SCHEDULED'
    };
  }

  async getAllInterviews(
    page: number = 0,
    size: number = 20,
    sortBy: string = 'scheduledDate',
    sortDir: 'asc' | 'desc' = 'desc',
    search?: string
  ): Promise<{ interviews: Interview[]; totalElements: number; totalPages: number }> {
    console.log('🔄 TemporaryInterviewService: Obteniendo entrevistas desde endpoint público');
    
    const response = await api.get<PublicInterviewResponse>(this.publicUrl);
    
    console.log('✅ TemporaryInterviewService: Response recibida:', response.data);
    
    const interviews = response.data.interviews.map(interview => {
      const mappedInterview = this.mapPublicInterviewResponse(interview);
      
      // Aplicar actualizaciones locales si existen
      const localUpdate = this.localUpdates.get(interview.id);
      if (localUpdate) {
        return { ...mappedInterview, ...localUpdate };
      }
      
      return mappedInterview;
    });

    return {
      interviews,
      totalElements: response.data.totalCount,
      totalPages: Math.ceil(response.data.totalCount / size)
    };
  }

  // Métodos placeholder para mantener compatibilidad
  async createInterview(request: CreateInterviewRequest): Promise<Interview> {
    throw new Error('Función no disponible en modo temporal');
  }

  async getInterviewById(id: number): Promise<Interview> {
    // Obtener todas las entrevistas y buscar la específica
    const { interviews } = await this.getAllInterviews();
    const interview = interviews.find(i => i.id === id);
    
    if (!interview) {
      throw new Error(`Entrevista con ID ${id} no encontrada`);
    }
    
    return interview;
  }

  async updateInterview(id: number, request: UpdateInterviewRequest): Promise<Interview> {
    console.log('⚠️ TemporaryInterviewService: Guardando cambios localmente (no persiste en BD)');
    
    // Mostrar notificación al usuario
    if (typeof window !== 'undefined') {
      console.warn('🟡 MODO DEMO: Los cambios se guardan solo en memoria y se perderán al recargar la página');
    }
    
    // Crear actualización local
    const localUpdate: Partial<Interview> = {
      status: request.status,
      type: request.type,
      mode: request.mode,
      scheduledDate: request.scheduledDate,
      scheduledTime: request.scheduledTime,
      duration: request.duration,
      location: request.location,
      virtualMeetingLink: request.virtualMeetingLink,
      notes: request.notes,
      preparation: request.preparation,
      updatedAt: new Date().toISOString()
    };
    
    // Guardar en memoria local
    this.localUpdates.set(id, localUpdate);
    
    // Simular respuesta exitosa
    const currentData = await this.getInterviewById(id);
    return { ...currentData, ...localUpdate };
  }

  async deleteInterview(id: number): Promise<void> {
    throw new Error('Función no disponible en modo temporal');
  }

  async getInterviewStatistics(): Promise<InterviewStats> {
    return {
      totalInterviews: 2,
      byStatus: {
        SCHEDULED: 2,
        CONFIRMED: 0,
        IN_PROGRESS: 0,
        COMPLETED: 0,
        CANCELLED: 0,
        NO_SHOW: 0,
        RESCHEDULED: 0
      },
      byType: {
        INDIVIDUAL: 1,
        FAMILY: 1,
        PSYCHOLOGICAL: 0,
        ACADEMIC: 0,
        BEHAVIORAL: 0
      },
      upcomingInterviews: 2,
      overdueInterviews: 0,
      completedThisMonth: 0,
      averageScore: 0
    };
  }
}

export default new TemporaryInterviewService();