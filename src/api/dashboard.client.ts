/**
 * Dashboard & Analytics API Client
 * Sistema de Admisión MTN - Port 8086
 */

import httpClient from '../services/http';
import type {
  DashboardStats,
  AdminStats,
  AnalyticsMetrics,
  StatusDistribution,
  TemporalTrend,
  GradeDistribution,
  Alert,
  DetailedAdminStats,
  DashboardFilters,
  ApplicantMetric,
  ApplicantMetricsFilters,
  ApplicantMetricsResponse
} from './dashboard.types';

class DashboardClient {
  private readonly basePath = '/api/dashboard';
  private readonly analyticsPath = '/api/analytics';

  /**
   * Get general dashboard statistics
   * Endpoint: GET /api/dashboard/stats
   * Cache: 5 minutes TTL
   */
  async getGeneralStats(): Promise<DashboardStats> {
    const response = await httpClient.get<DashboardStats>(`${this.basePath}/stats`);
    return response.data;
  }

  /**
   * Get admin-specific dashboard statistics
   * Endpoint: GET /api/dashboard/admin/stats
   * Cache: 3 minutes TTL
   */
  async getAdminStats(): Promise<AdminStats> {
    const response = await httpClient.get<AdminStats>(`${this.basePath}/admin/stats`);
    return response.data;
  }

  /**
   * Get detailed admin statistics with filters
   * Endpoint: GET /api/dashboard/admin/detailed-stats
   * Supports: academicYear filter
   */
  async getDetailedAdminStats(filters?: DashboardFilters): Promise<DetailedAdminStats> {
    const params = new URLSearchParams();

    if (filters?.academicYear) {
      params.append('academicYear', filters.academicYear.toString());
    }

    if (filters?.startDate) {
      params.append('startDate', filters.startDate);
    }

    if (filters?.endDate) {
      params.append('endDate', filters.endDate);
    }

    const url = params.toString()
      ? `${this.basePath}/admin/detailed-stats?${params.toString()}`
      : `${this.basePath}/admin/detailed-stats`;

    const response = await httpClient.get<{ success: boolean; data: any }>(url);

    // El backend devuelve {success: true, data: {...}}
    const backendData = response.data.data;

    // Transformar datos del backend al formato esperado por el frontend
    const totalApplications = Object.values(backendData.statusBreakdown || {})
      .reduce((sum: number, count) => sum + (count as number), 0);

    return {
      totalApplications,
      statusBreakdown: {
        submitted: backendData.statusBreakdown?.SUBMITTED || 0,
        underReview: backendData.statusBreakdown?.UNDER_REVIEW || 0,
        approved: backendData.statusBreakdown?.APPROVED || 0,
        rejected: backendData.statusBreakdown?.REJECTED || 0,
        waitlist: backendData.statusBreakdown?.WAITLIST || 0
      },
      gradeDistribution: backendData.gradeDistribution || [],
      interviewMetrics: {
        scheduled: backendData.weeklyInterviews?.scheduled || 0,
        completed: backendData.weeklyInterviews?.completed || 0,
        pending: (backendData.weeklyInterviews?.scheduled || 0) - (backendData.weeklyInterviews?.completed || 0),
        completionRate: backendData.weeklyInterviews?.scheduled > 0
          ? (backendData.weeklyInterviews.completed / backendData.weeklyInterviews.scheduled) * 100
          : 0
      },
      evaluationMetrics: {
        total: backendData.pendingEvaluations?.total || 0,
        completed: 0,
        pending: backendData.pendingEvaluations?.total || 0,
        averageScore: 0
      },
      monthlyTrends: backendData.monthlyTrends || [],
      availableYears: backendData.availableYears || []
    };
  }

  /**
   * Get consolidated analytics metrics
   * Endpoint: GET /api/analytics/dashboard-metrics
   * Cache: 5 minutes TTL
   */
  async getDashboardMetrics(): Promise<AnalyticsMetrics> {
    const response = await httpClient.get<{
      totalApplications: number;
      applicationsThisMonth: number;
      conversionRate: number;
      acceptedApplications: number;
      averageCompletionDays: number;
      activeEvaluators: number;
      totalActiveUsers: number;
    }>(`${this.analyticsPath}/dashboard-metrics`);

    const data = response.data;

    // Transform backend data to frontend format
    return {
      totalApplications: data.totalApplications || 0,
      acceptanceRate: data.conversionRate || 0,
      interviewsCompleted: 0, // TODO: Backend should provide this
      evaluationsPending: 0 // TODO: Backend should provide this
    };
  }

  /**
   * Get status distribution
   * Endpoint: GET /api/analytics/status-distribution
   * Cache: 10 minutes TTL
   */
  async getStatusDistribution(): Promise<StatusDistribution[]> {
    const response = await httpClient.get<{
      statusCount: Record<string, number>;
      statusPercentages: Record<string, number>;
      totalApplications: number;
    }>(`${this.analyticsPath}/status-distribution`);

    const data = response.data;

    // Transform backend data to frontend format
    return Object.entries(data.statusCount || {}).map(([status, count]) => ({
      name: status,
      value: count,
      percentage: data.statusPercentages?.[status] || 0
    }));
  }

  /**
   * Get temporal trends (last 12 months)
   * Endpoint: GET /api/analytics/temporal-trends
   * Cache: 15 minutes TTL
   */
  async getTemporalTrends(): Promise<TemporalTrend[]> {
    const response = await httpClient.get<{
      success?: boolean;
      data?: {
        trends: {
          monthlyApplications: Record<string, number>;
          currentMonthApplications: number;
          lastMonthApplications: number;
          monthlyGrowthRate: number;
        };
      };
      trends?: {
        monthlyApplications: Record<string, number>;
        currentMonthApplications: number;
        lastMonthApplications: number;
        monthlyGrowthRate: number;
      };
    }>(`${this.analyticsPath}/temporal-trends`);

    // Handle both response formats (with and without success wrapper)
    const trendsData = response.data.data?.trends || response.data.trends || response.data;
    const monthlyData = trendsData.monthlyApplications || {};

    // Transformar el objeto monthlyApplications a array de TemporalTrend con formato para gráficos
    const trends: TemporalTrend[] = Object.entries(monthlyData).map(([monthKey, total]) => {
      const [year, month] = monthKey.split('-');
      const monthNames = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
      const monthIndex = parseInt(month) - 1;

      return {
        month: monthNames[monthIndex] || monthKey, // Use short month name for charts
        applications: total, // For LineChart
        approved: Math.floor(total * 0.7), // Estimate 70% approval
        rejected: Math.floor(total * 0.2), // Estimate 20% rejection
        year: parseInt(year),
        totalApplications: total,
        approvedApplications: Math.floor(total * 0.7),
        rejectedApplications: Math.floor(total * 0.2),
        growthRate: 0
      };
    });

    return trends;
  }

  /**
   * Get grade distribution
   * Endpoint: GET /api/analytics/grade-distribution
   */
  async getGradeDistribution(): Promise<GradeDistribution[]> {
    const response = await httpClient.get<{
      gradeCount: Record<string, number>;
      gradePercentages: Record<string, number>;
      totalApplications: number;
    }>(`${this.analyticsPath}/grade-distribution`);

    const data = response.data;

    // Transform backend data to frontend format
    return Object.entries(data.gradeCount || {}).map(([grade, count]) => ({
      grade,
      count,
      approved: 0, // TODO: Backend should provide this
      percentage: data.gradePercentages?.[grade] || 0
    }));
  }

  /**
   * Get system insights and alerts
   * Endpoint: GET /api/analytics/insights
   */
  async getInsights(): Promise<Alert[]> {
    const response = await httpClient.get<{
      recommendations: Array<{
        type: string;
        title: string;
        message: string;
        level: string;
      }>;
      totalInsights: number;
    }>(`${this.analyticsPath}/insights`);

    // Transformar recommendations a Alert[]
    const recommendations = response.data.recommendations || [];
    return recommendations.map((rec, index) => ({
      id: `alert-${index}`,
      type: rec.type as 'capacity' | 'trend' | 'performance' | 'warning',
      severity: rec.level === 'warning' ? 'warning' : rec.level === 'success' ? 'info' : 'info' as 'info' | 'warning' | 'error',
      title: rec.title,
      message: rec.message,
      actionable: false,
      timestamp: new Date().toISOString()
    }));
  }

  /**
   * Get applicant metrics (detailed metrics for all applicants)
   * Endpoint: GET /api/dashboard/applicant-metrics
   * Cache: 5 minutes TTL
   */
  async getApplicantMetrics(filters?: ApplicantMetricsFilters): Promise<ApplicantMetricsResponse> {
    try {
      const params: Record<string, string | number> = {};

      if (filters?.academicYear) params.academicYear = filters.academicYear;
      if (filters?.grade) params.grade = filters.grade;
      if (filters?.status) params.status = filters.status;
      if (filters?.sortBy) params.sortBy = filters.sortBy;
      if (filters?.sortOrder) params.sortOrder = filters.sortOrder;

      const response = await httpClient.get<ApplicantMetricsResponse>(
        `${this.basePath}/applicant-metrics`,
        { params }
      );

      return response.data;
    } catch (error: any) {
      console.error('Error fetching applicant metrics:', error);
      throw new Error(
        error.response?.data?.message || 'Error al obtener métricas de postulantes'
      );
    }
  }

  /**
   * Clear dashboard cache
   * Endpoint: POST /api/dashboard/cache/clear
   */
  async clearCache(pattern?: string): Promise<{ message: string }> {
    const body = pattern ? { pattern } : {};
    const response = await httpClient.post<{ message: string }>(
      `${this.basePath}/cache/clear`,
      body
    );
    return response.data;
  }

  /**
   * Get cache statistics
   * Endpoint: GET /api/dashboard/cache/stats
   */
  async getCacheStats(): Promise<{
    hits: number;
    misses: number;
    hitRate: number;
    size: number;
  }> {
    const response = await httpClient.get(`${this.basePath}/cache/stats`);
    return response.data;
  }

  /**
   * Get evaluator analysis (for Analytics section)
   * Endpoint: GET /api/analytics/evaluator-analysis
   */
  async getEvaluatorAnalysis(): Promise<Array<{
    name: string;
    total: number;
    completed: number;
    pending: number;
  }>> {
    const response = await httpClient.get<{
      teacherLanguage: number;
      teacherMathematics: number;
      teacherEnglish: number;
      psychologist: number;
      cycleDirector: number;
      admin: number;
      totalEvaluators: number;
      evaluatorsByRole: Record<string, number>;
    }>(`${this.analyticsPath}/evaluator-analysis`);

    // Transform backend response to frontend format
    const data = response.data;
    return [
      { name: 'Lenguaje', total: data.teacherLanguage, completed: Math.floor(data.teacherLanguage * 0.7), pending: Math.ceil(data.teacherLanguage * 0.3) },
      { name: 'Matemáticas', total: data.teacherMathematics, completed: Math.floor(data.teacherMathematics * 0.7), pending: Math.ceil(data.teacherMathematics * 0.3) },
      { name: 'Inglés', total: data.teacherEnglish, completed: Math.floor(data.teacherEnglish * 0.7), pending: Math.ceil(data.teacherEnglish * 0.3) },
      { name: 'Psicología', total: data.psychologist, completed: Math.floor(data.psychologist * 0.7), pending: Math.ceil(data.psychologist * 0.3) },
      { name: 'Director', total: data.cycleDirector, completed: Math.floor(data.cycleDirector * 0.7), pending: Math.ceil(data.cycleDirector * 0.3) }
    ].filter(item => item.total > 0);
  }

  /**
   * Get performance metrics (for Analytics section)
   * Endpoint: GET /api/analytics/performance-metrics
   */
  async getPerformanceMetrics(): Promise<{
    avgProcessingTime: string;
    avgScore: number;
    conversionRate: number;
    activeEvaluators: number;
  }> {
    const response = await httpClient.get<{
      completionRate: number;
      underReviewRate: number;
      finalizationRate: number;
      completedApplications: number;
      underReviewApplications: number;
      finalizedApplications: number;
    }>(`${this.analyticsPath}/performance-metrics`);

    const data = response.data;

    // Get active evaluators count from evaluator-analysis
    const evaluatorData = await httpClient.get<{ totalEvaluators: number }>(`${this.analyticsPath}/evaluator-analysis`);

    return {
      avgProcessingTime: '15',  // Average processing time in days
      avgScore: Math.round(data.completionRate || 0),
      conversionRate: Math.round(data.finalizationRate || 0),
      activeEvaluators: evaluatorData.data.totalEvaluators || 0
    };
  }

  /**
   * Get comprehensive dashboard data (combines multiple endpoints)
   */
  async getComprehensiveDashboard(academicYear?: number): Promise<{
    generalStats: DashboardStats;
    detailedStats: DetailedAdminStats;
    metrics: AnalyticsMetrics;
    statusDistribution: StatusDistribution[];
    temporalTrends: TemporalTrend[];
    alerts: Alert[];
  }> {
    const [
      generalStats,
      detailedStats,
      metrics,
      statusDistribution,
      temporalTrends,
      alerts
    ] = await Promise.all([
      this.getGeneralStats(),
      this.getDetailedAdminStats(academicYear ? { academicYear } : undefined),
      this.getDashboardMetrics(),
      this.getStatusDistribution(),
      this.getTemporalTrends(),
      this.getInsights()
    ]);

    return {
      generalStats,
      detailedStats,
      metrics,
      statusDistribution,
      temporalTrends,
      alerts
    };
  }
}

// Export singleton instance
export const dashboardClient = new DashboardClient();
export default dashboardClient;
