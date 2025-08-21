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
    const response = await api.post<InterviewResponse>(this.baseUrl, request);
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
    
    return {
      interviews: response.data.content.map(item => this.mapInterviewResponse(item)),
      totalElements: response.data.totalElements,
      totalPages: response.data.totalPages
    };
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
    const response = await api.get<InterviewResponse[]>(`${this.baseUrl}/interviewer/${interviewerId}`);
    return response.data.map(item => this.mapInterviewResponse(item));
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
}

export const interviewService = new InterviewService();
export default interviewService;