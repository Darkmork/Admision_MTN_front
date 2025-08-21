import api from './api';

export interface DashboardMetrics {
  totalApplications: number;
  applicationsThisMonth: number;
  conversionRate: number;
  acceptedApplications: number;
  averageCompletionDays: number;
  activeEvaluators: number;
  totalActiveUsers: number;
}

export interface StatusDistribution {
  statusCount: Record<string, number>;
  statusPercentages: Record<string, number>;
  totalApplications: number;
}

export interface GradeDistribution {
  gradeCount: Record<string, number>;
  gradePercentages: Record<string, number>;
  totalApplications: number;
}

export interface EvaluatorAnalysis {
  teacherLanguage: number;
  teacherMathematics: number;
  teacherEnglish: number;
  psychologist: number;
  cycleDirector: number;
  admin: number;
  totalEvaluators: number;
  evaluatorsByRole: Record<string, number>;
}

export interface TemporalTrends {
  monthlyApplications: Record<string, number>;
  currentMonthApplications: number;
  lastMonthApplications: number;
  monthlyGrowthRate: number;
}

export interface PerformanceMetrics {
  completionRate: number;
  underReviewRate: number;
  finalizationRate: number;
  completedApplications: number;
  underReviewApplications: number;
  finalizedApplications: number;
}

export interface InsightRecommendation {
  type: string;
  title: string;
  message: string;
  level: 'success' | 'warning' | 'info' | 'error';
}

export interface Insights {
  recommendations: InsightRecommendation[];
  totalInsights: number;
}

export interface CompleteAnalytics {
  dashboardMetrics: DashboardMetrics;
  statusDistribution: StatusDistribution;
  gradeDistribution: GradeDistribution;
  evaluatorAnalysis: EvaluatorAnalysis;
  temporalTrends: TemporalTrends;
  performanceMetrics: PerformanceMetrics;
  insights: Insights;
  generatedAt: string;
}

class AnalyticsService {
  
  /**
   * Obtener métricas principales del dashboard
   */
  async getDashboardMetrics(): Promise<DashboardMetrics> {
    try {
      console.log('📊 Obteniendo métricas del dashboard...');
      const response = await api.get('/api/analytics/dashboard-metrics');
      console.log('✅ Métricas del dashboard obtenidas:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('❌ Error obteniendo métricas del dashboard:', error);
      throw new Error('Error al obtener métricas del dashboard: ' + error.message);
    }
  }

  /**
   * Obtener distribución por estado de postulaciones
   */
  async getStatusDistribution(): Promise<StatusDistribution> {
    try {
      console.log('📈 Obteniendo distribución por estado...');
      const response = await api.get('/api/analytics/status-distribution');
      console.log('✅ Distribución por estado obtenida:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('❌ Error obteniendo distribución por estado:', error);
      throw new Error('Error al obtener distribución por estado: ' + error.message);
    }
  }

  /**
   * Obtener distribución por grado académico
   */
  async getGradeDistribution(): Promise<GradeDistribution> {
    try {
      console.log('📚 Obteniendo distribución por grado...');
      const response = await api.get('/api/analytics/grade-distribution');
      console.log('✅ Distribución por grado obtenida:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('❌ Error obteniendo distribución por grado:', error);
      throw new Error('Error al obtener distribución por grado: ' + error.message);
    }
  }

  /**
   * Obtener análisis de evaluadores
   */
  async getEvaluatorAnalysis(): Promise<EvaluatorAnalysis> {
    try {
      console.log('👥 Obteniendo análisis de evaluadores...');
      const response = await api.get('/api/analytics/evaluator-analysis');
      console.log('✅ Análisis de evaluadores obtenido:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('❌ Error obteniendo análisis de evaluadores:', error);
      throw new Error('Error al obtener análisis de evaluadores: ' + error.message);
    }
  }

  /**
   * Obtener tendencias temporales
   */
  async getTemporalTrends(): Promise<TemporalTrends> {
    try {
      console.log('📅 Obteniendo tendencias temporales...');
      const response = await api.get('/api/analytics/temporal-trends');
      console.log('✅ Tendencias temporales obtenidas:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('❌ Error obteniendo tendencias temporales:', error);
      throw new Error('Error al obtener tendencias temporales: ' + error.message);
    }
  }

  /**
   * Obtener métricas de rendimiento del proceso
   */
  async getPerformanceMetrics(): Promise<PerformanceMetrics> {
    try {
      console.log('⚡ Obteniendo métricas de rendimiento...');
      const response = await api.get('/api/analytics/performance-metrics');
      console.log('✅ Métricas de rendimiento obtenidas:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('❌ Error obteniendo métricas de rendimiento:', error);
      throw new Error('Error al obtener métricas de rendimiento: ' + error.message);
    }
  }

  /**
   * Obtener insights y recomendaciones
   */
  async getInsights(): Promise<Insights> {
    try {
      console.log('💡 Obteniendo insights y recomendaciones...');
      const response = await api.get('/api/analytics/insights');
      console.log('✅ Insights obtenidos:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('❌ Error obteniendo insights:', error);
      throw new Error('Error al obtener insights: ' + error.message);
    }
  }

  /**
   * Obtener todas las métricas de análisis en una sola llamada
   */
  async getCompleteAnalytics(): Promise<CompleteAnalytics> {
    try {
      console.log('🎯 Obteniendo análisis completo...');
      const response = await api.get('/api/analytics/complete-analytics');
      console.log('✅ Análisis completo obtenido:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('❌ Error obteniendo análisis completo:', error);
      throw new Error('Error al obtener análisis completo: ' + error.message);
    }
  }

  /**
   * Obtener todas las métricas individualmente y combinar (fallback)
   */
  async getAllAnalyticsSeparately(): Promise<CompleteAnalytics> {
    try {
      console.log('🔄 Obteniendo análisis por partes...');
      
      const [
        dashboardMetrics,
        statusDistribution,
        gradeDistribution,
        evaluatorAnalysis,
        temporalTrends,
        performanceMetrics,
        insights
      ] = await Promise.all([
        this.getDashboardMetrics(),
        this.getStatusDistribution(),
        this.getGradeDistribution(),
        this.getEvaluatorAnalysis(),
        this.getTemporalTrends(),
        this.getPerformanceMetrics(),
        this.getInsights()
      ]);

      const completeAnalytics: CompleteAnalytics = {
        dashboardMetrics,
        statusDistribution,
        gradeDistribution,
        evaluatorAnalysis,
        temporalTrends,
        performanceMetrics,
        insights,
        generatedAt: new Date().toISOString()
      };

      console.log('✅ Análisis combinado exitosamente');
      return completeAnalytics;
      
    } catch (error: any) {
      console.error('❌ Error obteniendo análisis por partes:', error);
      throw new Error('Error al obtener análisis: ' + error.message);
    }
  }

  /**
   * Verificar conectividad con el backend
   */
  async testConnection(): Promise<boolean> {
    try {
      console.log('🔍 Verificando conectividad con analytics API...');
      const response = await api.get('/api/analytics/dashboard-metrics');
      console.log('✅ Conectividad verificada');
      return true;
    } catch (error: any) {
      console.error('❌ Error de conectividad:', error);
      return false;
    }
  }
}

export const analyticsService = new AnalyticsService();