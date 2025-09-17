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

export interface InterviewResponse {
  id: number;
  applicationId: number;
  studentName: string;
  parentNames: string;
  gradeApplied: string;
  interviewerId: number;
  interviewerName: string;
  status: InterviewStatus;
  type: InterviewType;
  mode: InterviewMode;
  scheduledDate: string;
  scheduledTime: string;
  duration: number;
  location?: string;
  virtualMeetingLink?: string;
  notes?: string;
  preparation?: string;
  result?: InterviewResult;
  score?: number;
  recommendations?: string;
  followUpRequired: boolean;
  followUpNotes?: string;
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
  isUpcoming: boolean;
  isOverdue: boolean;
  canBeCompleted: boolean;
  canBeEdited: boolean;
  canBeCancelled: boolean;
}

export interface PaginatedInterviewResponse {
  content: InterviewResponse[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
  first: boolean;
  last: boolean;
}

class InterviewService {
  private baseUrl = '/api/interviews';

  // Convertir response del backend a formato frontend
  private mapInterviewResponse(response: InterviewResponse): Interview {
    return {
      id: response.id,
      applicationId: response.applicationId,
      studentName: response.studentName,
      parentNames: response.parentNames,
      gradeApplied: response.gradeApplied,
      interviewerId: response.interviewerId,
      interviewerName: response.interviewerName,
      status: response.status,
      type: response.type,
      mode: response.mode,
      scheduledDate: response.scheduledDate,
      scheduledTime: response.scheduledTime,
      duration: response.duration,
      location: response.location,
      virtualMeetingLink: response.virtualMeetingLink,
      notes: response.notes,
      preparation: response.preparation,
      result: response.result,
      score: response.score,
      recommendations: response.recommendations,
      followUpRequired: response.followUpRequired,
      followUpNotes: response.followUpNotes,
      createdAt: response.createdAt,
      updatedAt: response.updatedAt,
      completedAt: response.completedAt,
      isUpcoming: response.isUpcoming,
      isOverdue: response.isOverdue,
      canBeCompleted: response.canBeCompleted,
      canBeEdited: response.canBeEdited,
      canBeCancelled: response.canBeCancelled
    };
  }

  // CRUD básico
  async createInterview(request: CreateInterviewRequest): Promise<Interview> {
    // Asegurar que el status se establezca como SCHEDULED si no se especifica
    const requestWithStatus = {
      ...request,
      status: request.status || InterviewStatus.SCHEDULED
    };
    
    console.log('🚀 Creando entrevista con estado:', requestWithStatus.status);
    console.log('📤 Request completo enviado al backend:', JSON.stringify(requestWithStatus, null, 2));
    
    const response = await api.post<InterviewResponse>(this.baseUrl, requestWithStatus);
    
    console.log('📥 Response recibido del backend:', JSON.stringify(response.data, null, 2));
    return this.mapInterviewResponse(response.data);
  }

  async getInterviewById(id: number): Promise<Interview> {
    const response = await api.get<InterviewResponse>(`${this.baseUrl}/${id}`);
    return this.mapInterviewResponse(response.data);
  }

  async getAllInterviews(
    page: number = 0,
    size: number = 20,
    sortBy: string = 'scheduledDate',
    sortDir: 'asc' | 'desc' = 'desc',
    search?: string
  ): Promise<{ interviews: Interview[]; totalElements: number; totalPages: number }> {
    try {
      console.log('🔄 Obtaining interviews from main backend...');
      
      // Use main backend endpoint (monolithic architecture on port 8080)
      const response = await api.get<any>('http://localhost:8080/api/interviews');
      
      console.log('📋 Backend response:', response.data);
      
      // Main backend returns: { success: true, data: [...] }
      if (response.data && response.data.success && Array.isArray(response.data.data)) {
        console.log('✅ Found interviews from main backend:', response.data.data.length);
        return {
          interviews: response.data.data.map((item: any) => this.mapInterviewResponse(item)),
          totalElements: response.data.data.length,
          totalPages: 1
        };
      }
      
      console.log('⚠️ No valid response from main backend, trying fallback approaches...');
      
      // Fallback: try microservice format for backwards compatibility
      try {
        const microResponse = await api.get<PaginatedInterviewResponse>(`${this.baseUrl}/public/complete`);
        console.log('📋 Microservice response:', microResponse.data);
        
        // Check if microservice response is a placeholder
        if (microResponse.data && typeof microResponse.data === 'object' && 'error' in microResponse.data) {
          console.log('⚠️ Interview microservice not implemented');
          return {
            interviews: [],
            totalElements: 0,
            totalPages: 0
          };
        }
        
        // Check paginated format
        if (microResponse.data && microResponse.data.content && Array.isArray(microResponse.data.content)) {
          return {
            interviews: microResponse.data.content.map(item => this.mapInterviewResponse(item)),
            totalElements: microResponse.data.totalElements || 0,
            totalPages: microResponse.data.totalPages || 0
          };
        }
        
        // Check direct array format
        if (Array.isArray(microResponse.data)) {
          return {
            interviews: microResponse.data.map(item => this.mapInterviewResponse(item)),
            totalElements: microResponse.data.length,
            totalPages: 1
          };
        }
        
      } catch (microError) {
        console.log('⚠️ Microservice not available');
      }
      
      console.log('❌ No valid response structure found, returning empty data');
      return {
        interviews: [],
        totalElements: 0,
        totalPages: 0
      };
      
    } catch (error) {
      console.error('❌ Error fetching interviews from microservicio:', error);
      
      try {
        // Fallback al endpoint con autenticación si el público falla
        const params = new URLSearchParams({
          page: page.toString(),
          size: size.toString(),
          sortBy,
          sortDir
        });

        if (search) {
          params.append('search', search);
        }

        const response = await api.get<PaginatedInterviewResponse>(`${this.baseUrl}?${params}`);
        
        // Mismo manejo para el fallback
        if (response.data && typeof response.data === 'object' && 'error' in response.data) {
          console.log('⚠️ Interview service no implementado (fallback), devolviendo datos vacíos');
          return {
            interviews: [],
            totalElements: 0,
            totalPages: 0
          };
        }
        
        if (response.data && response.data.content && Array.isArray(response.data.content)) {
          return {
            interviews: response.data.content.map(item => this.mapInterviewResponse(item)),
            totalElements: response.data.totalElements || 0,
            totalPages: response.data.totalPages || 0
          };
        }
        
        // Si response.data es directamente un array (formato alternativo - fallback)
        if (Array.isArray(response.data)) {
          return {
            interviews: response.data.map(item => this.mapInterviewResponse(item)),
            totalElements: response.data.length,
            totalPages: 1
          };
        }
        
        // Fallback final: devolver datos vacíos
        console.log('⚠️ Fallback - devolviendo datos vacíos para entrevistas');
        return {
          interviews: [],
          totalElements: 0,
          totalPages: 0
        };
        
      } catch (fallbackError) {
        console.error('❌ Error en fallback de entrevistas:', fallbackError);
        // Devolver datos vacíos en lugar de fallar
        return {
          interviews: [],
          totalElements: 0,
          totalPages: 0
        };
      }
    }
  }

  async getInterviewsWithFilters(
    filters: InterviewFilters,
    page: number = 0,
    size: number = 20,
    sortBy: string = 'scheduledDate',
    sortDir: 'asc' | 'desc' = 'desc'
  ): Promise<{ interviews: Interview[]; totalElements: number; totalPages: number }> {
    const params = new URLSearchParams({
      page: page.toString(),
      size: size.toString(),
      sortBy,
      sortDir
    });

    if (filters.status) params.append('status', filters.status);
    if (filters.type) params.append('type', filters.type);
    if (filters.mode) params.append('mode', filters.mode);
    if (filters.interviewerId) params.append('interviewerId', filters.interviewerId.toString());
    if (filters.startDate) params.append('startDate', filters.startDate);
    if (filters.endDate) params.append('endDate', filters.endDate);

    const response = await api.get<PaginatedInterviewResponse>(`${this.baseUrl}/filter?${params}`);
    
    return {
      interviews: response.data.content.map(item => this.mapInterviewResponse(item)),
      totalElements: response.data.totalElements,
      totalPages: response.data.totalPages
    };
  }

  async updateInterview(id: number, request: UpdateInterviewRequest): Promise<Interview> {
    const response = await api.put<InterviewResponse>(`${this.baseUrl}/${id}`, request);
    return this.mapInterviewResponse(response.data);
  }

  async deleteInterview(id: number): Promise<void> {
    await api.delete(`${this.baseUrl}/${id}`);
  }

  // Operaciones de estado
  async confirmInterview(id: number): Promise<Interview> {
    const response = await api.post<InterviewResponse>(`${this.baseUrl}/${id}/confirm`);
    return this.mapInterviewResponse(response.data);
  }

  async startInterview(id: number): Promise<Interview> {
    const response = await api.post<InterviewResponse>(`${this.baseUrl}/${id}/start`);
    return this.mapInterviewResponse(response.data);
  }

  async completeInterview(id: number, request: CompleteInterviewRequest): Promise<Interview> {
    const response = await api.post<InterviewResponse>(`${this.baseUrl}/${id}/complete`, request);
    return this.mapInterviewResponse(response.data);
  }

  async cancelInterview(id: number): Promise<Interview> {
    const response = await api.post<InterviewResponse>(`${this.baseUrl}/${id}/cancel`);
    return this.mapInterviewResponse(response.data);
  }

  async rescheduleInterview(id: number, newDate: string, newTime: string): Promise<Interview> {
    const params = new URLSearchParams({
      newDate,
      newTime
    });
    const response = await api.post<InterviewResponse>(`${this.baseUrl}/${id}/reschedule?${params}`);
    return this.mapInterviewResponse(response.data);
  }

  async markAsNoShow(id: number): Promise<Interview> {
    const response = await api.post<InterviewResponse>(`${this.baseUrl}/${id}/no-show`);
    return this.mapInterviewResponse(response.data);
  }

  // Consultas especiales
  async getTodaysInterviews(): Promise<Interview[]> {
    const response = await api.get<InterviewResponse[]>(`${this.baseUrl}/today`);
    return response.data.map(item => this.mapInterviewResponse(item));
  }

  async getUpcomingInterviews(): Promise<Interview[]> {
    const response = await api.get<InterviewResponse[]>(`${this.baseUrl}/upcoming`);
    return response.data.map(item => this.mapInterviewResponse(item));
  }

  async getOverdueInterviews(): Promise<Interview[]> {
    const response = await api.get<InterviewResponse[]>(`${this.baseUrl}/overdue`);
    return response.data.map(item => this.mapInterviewResponse(item));
  }

  async getInterviewsRequiringFollowUp(): Promise<Interview[]> {
    const response = await api.get<InterviewResponse[]>(`${this.baseUrl}/follow-up`);
    return response.data.map(item => this.mapInterviewResponse(item));
  }

  async getInterviewsByInterviewer(interviewerId: number): Promise<Interview[]> {
    try {
      const response = await api.get<InterviewResponse[]>(`${this.baseUrl}/interviewer/${interviewerId}`);
      
      // Verificar si la respuesta es del placeholder (microservicio no implementado)
      if (response.data && typeof response.data === 'object' && 'error' in response.data) {
        console.log('⚠️ Interviews by interviewer service no implementado, devolviendo array vacío');
        return [];
      }
      
      // Verificar si es un array válido
      if (Array.isArray(response.data)) {
        return response.data.map(item => this.mapInterviewResponse(item));
      }
      
      console.log('⚠️ Estructura de respuesta inesperada para interviews by interviewer');
      return [];
    } catch (error) {
      console.error('Error fetching interviews by interviewer:', error);
      return [];
    }
  }

  async getInterviewsByApplication(applicationId: number): Promise<Interview[]> {
    const response = await api.get<InterviewResponse[]>(`${this.baseUrl}/application/${applicationId}`);
    return response.data.map(item => this.mapInterviewResponse(item));
  }

  async getInterviewsByDateRange(startDate: string, endDate: string): Promise<Interview[]> {
    const params = new URLSearchParams({
      startDate,
      endDate
    });
    const response = await api.get<InterviewResponse[]>(`${this.baseUrl}/date-range?${params}`);
    return response.data.map(item => this.mapInterviewResponse(item));
  }

  // Estadísticas
  async getInterviewStatistics(): Promise<InterviewStats> {
    const response = await api.get<InterviewStats>(`${this.baseUrl}/statistics`);
    return response.data;
  }

  // Para calendario
  async getCalendarInterviews(startDate: string, endDate: string, interviewerId?: number): Promise<Interview[]> {
    const params = new URLSearchParams({
      startDate,
      endDate
    });

    if (interviewerId) {
      params.append('interviewerId', interviewerId.toString());
    }

    const response = await api.get<InterviewResponse[]>(`${this.baseUrl}/calendar?${params}`);
    return response.data.map(item => this.mapInterviewResponse(item));
  }

  // Validación de disponibilidad
  async checkInterviewerAvailability(
    interviewerId: number,
    date: string,
    time: string,
    excludeInterviewId?: number
  ): Promise<boolean> {
    const params = new URLSearchParams({
      interviewerId: interviewerId.toString(),
      date,
      time
    });

    if (excludeInterviewId) {
      params.append('excludeInterviewId', excludeInterviewId.toString());
    }

    const response = await api.get<boolean>(`${this.baseUrl}/availability?${params}`);
    return response.data;
  }

  // Búsqueda
  async searchInterviews(searchTerm: string, page: number = 0, size: number = 20): Promise<{ interviews: Interview[]; totalElements: number; totalPages: number }> {
    return this.getAllInterviews(page, size, 'scheduledDate', 'desc', searchTerm);
  }

  // Notificaciones
  async sendNotification(id: number, notificationType: 'scheduled' | 'confirmed' | 'reminder'): Promise<string> {
    const params = new URLSearchParams({ notificationType });
    const response = await api.post<string>(`${this.baseUrl}/${id}/send-notification?${params}`);
    return response.data;
  }

  async sendReminder(id: number): Promise<string> {
    const response = await api.post<string>(`${this.baseUrl}/${id}/send-reminder`);
    return response.data;
  }

  // Horarios disponibles
  async getAvailableTimeSlots(
    interviewerId: number,
    date: string,
    duration: number = 60
  ): Promise<string[]> {
    try {
      // Validar y usar duración por defecto si es inválida
      const validDuration = (duration && !isNaN(duration) && duration > 0) ? duration : 60;
      
      const params = new URLSearchParams({
        interviewerId: interviewerId.toString(),
        date,
        duration: validDuration.toString()
      });
      
      const response = await api.get<string[]>(`${this.baseUrl}/available-slots?${params}`);
      
      console.log('🔍 Respuesta completa de available-slots:', response);
      console.log('🔍 Data de respuesta:', response.data);
      console.log('🔍 Tipo de data:', typeof response.data, Array.isArray(response.data));
      
      // Logging detallado de cada elemento en el array
      if (Array.isArray(response.data)) {
        response.data.forEach((item, index) => {
          console.log(`🔍 Item ${index}:`, item);
          console.log(`🔍 Item ${index} keys:`, Object.keys(item || {}));
          console.log(`🔍 Item ${index} type:`, typeof item);
        });
      }
      
      // Verificar si la respuesta es del placeholder (microservicio no implementado)
      if (response.data && typeof response.data === 'object' && 'error' in response.data) {
        console.log('⚠️ Available slots service no implementado, usando horarios por defecto');
        return this.getDefaultTimeSlots();
      }
      
      // Verificar si es un array válido
      if (Array.isArray(response.data)) {
        // Si es un array de strings (formato esperado)
        if (response.data.length === 0 || typeof response.data[0] === 'string') {
          console.log('✅ Devolviendo slots del backend (strings):', response.data);
          return response.data;
        }
        
        // Si es un array con objetos que contienen message/slots (formato backend sin horarios)
        if (response.data.length > 0 && response.data[0] && typeof response.data[0] === 'object' && 'slots' in response.data[0]) {
          const slotsData = response.data[0].slots;
          console.log('✅ Extrayendo slots de respuesta estructurada:', slotsData);
          if (Array.isArray(slotsData)) {
            return slotsData;
          }
        }
        
        // Si es un array de objetos slot directos (formato backend con horarios)
        if (response.data.length > 0 && response.data[0] && typeof response.data[0] === 'object' && 'time' in response.data[0]) {
          console.log('✅ Procesando slots con formato completo del backend');
          const availableSlots = response.data
            .filter(slot => slot.available === true)
            .map(slot => slot.time);
          console.log('✅ Slots disponibles filtrados:', availableSlots);
          return availableSlots;
        }
        
        console.log('✅ Devolviendo slots del backend (mixed):', response.data);
        return response.data;
      }
      
      console.log('⚠️ Estructura de respuesta inesperada para available slots, usando horarios por defecto');
      console.log('⚠️ Data recibida:', response.data);
      return this.getDefaultTimeSlots();
    } catch (error) {
      console.error('Error fetching available slots:', error);
      // Fallback: horarios estándar si el backend no los tiene configurados
      return this.getDefaultTimeSlots();
    }
  }

  async getInterviewerAvailability(
    interviewerId: number,
    startDate: string,
    endDate: string
  ): Promise<{ date: string; availableSlots: string[] }[]> {
    try {
      const params = new URLSearchParams({
        interviewerId: interviewerId.toString(),
        startDate,
        endDate
      });
      
      const response = await api.get<{ date: string; availableSlots: string[] }[]>(
        `${this.baseUrl}/interviewer-availability?${params}`
      );
      
      // Verificar si la respuesta es del placeholder (microservicio no implementado)
      if (response.data && typeof response.data === 'object' && 'error' in response.data) {
        console.log('⚠️ Interviewer availability service no implementado, devolviendo datos vacíos');
        return [];
      }
      
      // Verificar si es un array válido
      if (Array.isArray(response.data)) {
        return response.data;
      }
      
      console.log('⚠️ Estructura de respuesta inesperada para interviewer availability');
      return [];
    } catch (error) {
      console.error('Error fetching interviewer availability:', error);
      return [];
    }
  }

  // Validar conflictos de horarios antes de crear/editar entrevista
  async validateTimeSlot(
    interviewerId: number,
    date: string,
    time: string,
    duration: number,
    excludeInterviewId?: number
  ): Promise<{ isValid: boolean; conflictMessage?: string }> {
    try {
      const params = new URLSearchParams({
        interviewerId: interviewerId.toString(),
        date,
        time,
        duration: duration.toString()
      });
      
      if (excludeInterviewId) {
        params.append('excludeId', excludeInterviewId.toString());
      }
      
      const response = await api.get<{ isValid: boolean; conflictMessage?: string }>(
        `${this.baseUrl}/validate-slot?${params}`
      );
      return response.data;
    } catch (error) {
      console.error('Error validating time slot:', error);
      // En caso de error, permitir la creación pero mostrar advertencia
      return { 
        isValid: true, 
        conflictMessage: 'No se pudo validar el horario. Proceda con precaución.' 
      };
    }
  }

  // Método auxiliar para horarios por defecto
  private getDefaultTimeSlots(): string[] {
    return [
      '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
      '14:00', '14:30', '15:00', '15:30', '16:00', '16:30'
    ];
  }
}

export const interviewService = new InterviewService();
export default interviewService;