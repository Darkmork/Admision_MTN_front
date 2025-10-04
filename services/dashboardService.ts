import api from './api';

export interface WeeklyInterviews {
  total: number;
  scheduled: number;
  completed: number;
  weekRange: {
    start: string;
    end: string;
  };
}

export interface PendingEvaluations {
  byType: Record<string, number>;
  total: number;
}

export interface MonthlyTrend {
  month: string;
  total: number;
  submitted: number;
  approved: number;
  rejected: number;
}

export interface StatusBreakdown {
  [status: string]: number;
}

export interface DetailedDashboardStats {
  success: boolean;
  data: {
    academicYear: number;
    availableYears: number[];
    weeklyInterviews: WeeklyInterviews;
    pendingEvaluations: PendingEvaluations;
    monthlyTrends: MonthlyTrend[];
    statusBreakdown: StatusBreakdown;
  };
  timestamp: string;
}

class DashboardService {
  /**
   * Obtiene estadísticas detalladas del dashboard administrativo
   * @param academicYear - Año académico (opcional, por defecto año actual + 1)
   */
  async getDetailedStats(academicYear?: number): Promise<DetailedDashboardStats> {
    try {
      const params = academicYear ? { academicYear } : {};
      const response = await api.get<DetailedDashboardStats>(
        '/api/dashboard/admin/detailed-stats',
        { params }
      );
      return response.data;
    } catch (error: any) {
      console.error('Error fetching detailed dashboard stats:', error);
      throw new Error(
        error.response?.data?.message || 'Error al obtener estadísticas del dashboard'
      );
    }
  }

  /**
   * Obtiene los años académicos disponibles
   */
  async getAvailableYears(): Promise<number[]> {
    try {
      const stats = await this.getDetailedStats();
      return stats.data.availableYears;
    } catch (error) {
      console.error('Error fetching available years:', error);
      // Fallback: retornar años por defecto
      const currentYear = new Date().getFullYear();
      return [currentYear, currentYear + 1, currentYear + 2];
    }
  }
}

export const dashboardService = new DashboardService();
