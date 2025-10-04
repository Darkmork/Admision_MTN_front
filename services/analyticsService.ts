import api from './api';
import { Logger } from '../src/utils/logger';
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
      Logger.info('📊 Obteniendo métricas del dashboard...');
      const response = await api.get('/api/analytics/dashboard-metrics');
      Logger.info('✅ Métricas del dashboard obtenidas:', response.data);
      return response.data;
    } catch (error: any) {
      Logger.error('❌ Error obteniendo métricas del dashboard:', error);
      throw new Error('Error al obtener métricas del dashboard: ' + error.message);
    }
  }

  /**
   * Obtener distribución por estado de postulaciones
   */
  async getStatusDistribution(): Promise<StatusDistribution> {
    try {
      Logger.info('📈 Obteniendo distribución por estado...');
      const response = await api.get('/api/analytics/status-distribution');
      Logger.info('✅ Distribución por estado obtenida:', response.data);
      return response.data;
    } catch (error: any) {
      Logger.error('❌ Error obteniendo distribución por estado:', error);
      throw new Error('Error al obtener distribución por estado: ' + error.message);
    }
  }

  /**
   * Obtener distribución por grado académico
   */
  async getGradeDistribution(): Promise<GradeDistribution> {
    try {
      Logger.info('📚 Obteniendo distribución por grado...');
      const response = await api.get('/api/analytics/grade-distribution');
      Logger.info('✅ Distribución por grado obtenida:', response.data);
      return response.data;
    } catch (error: any) {
      Logger.error('❌ Error obteniendo distribución por grado:', error);
      throw new Error('Error al obtener distribución por grado: ' + error.message);
    }
  }

  /**
   * Obtener análisis de evaluadores
   */
  async getEvaluatorAnalysis(): Promise<EvaluatorAnalysis> {
    try {
      Logger.info('👥 Obteniendo análisis de evaluadores...');
      const response = await api.get('/api/analytics/evaluator-analysis');
      Logger.info('✅ Análisis de evaluadores obtenido:', response.data);
      return response.data;
    } catch (error: any) {
      Logger.error('❌ Error obteniendo análisis de evaluadores:', error);
      throw new Error('Error al obtener análisis de evaluadores: ' + error.message);
    }
  }

  /**
   * Obtener tendencias temporales
   */
  async getTemporalTrends(): Promise<TemporalTrends> {
    try {
      Logger.info('📅 Obteniendo tendencias temporales...');
      const response = await api.get('/api/analytics/temporal-trends');
      Logger.info('✅ Tendencias temporales obtenidas:', response.data);
      return response.data;
    } catch (error: any) {
      Logger.error('❌ Error obteniendo tendencias temporales:', error);
      throw new Error('Error al obtener tendencias temporales: ' + error.message);
    }
  }

  /**
   * Obtener métricas de rendimiento del proceso
   */
  async getPerformanceMetrics(): Promise<PerformanceMetrics> {
    try {
      Logger.info('⚡ Obteniendo métricas de rendimiento...');
      const response = await api.get('/api/analytics/performance-metrics');
      Logger.info('✅ Métricas de rendimiento obtenidas:', response.data);
      return response.data;
    } catch (error: any) {
      Logger.error('❌ Error obteniendo métricas de rendimiento:', error);
      throw new Error('Error al obtener métricas de rendimiento: ' + error.message);
    }
  }

  /**
   * Obtener insights y recomendaciones
   */
  async getInsights(): Promise<Insights> {
    try {
      Logger.info('💡 Obteniendo insights y recomendaciones...');
      const response = await api.get('/api/analytics/insights');
      Logger.info('✅ Insights obtenidos:', response.data);
      return response.data;
    } catch (error: any) {
      Logger.error('❌ Error obteniendo insights:', error);
      throw new Error('Error al obtener insights: ' + error.message);
    }
  }

  /**
   * Obtener todas las métricas de análisis en una sola llamada
   */
  async getCompleteAnalytics(): Promise<CompleteAnalytics> {
    try {
      Logger.info('🎯 Obteniendo análisis completo...');
      const response = await api.get('/api/analytics/complete-analytics');
      Logger.info('✅ Análisis completo obtenido:', response.data);
      return response.data;
    } catch (error: any) {
      Logger.error('❌ Error obteniendo análisis completo:', error);
      throw new Error('Error al obtener análisis completo: ' + error.message);
    }
  }

  /**
   * Obtener todas las métricas individualmente y combinar (fallback)
   */
  async getAllAnalyticsSeparately(): Promise<CompleteAnalytics> {
    try {
      Logger.info('🔄 Obteniendo análisis por partes...');
      
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

      Logger.info('✅ Análisis combinado exitosamente');
      return completeAnalytics;
      
    } catch (error: any) {
      Logger.error('❌ Error obteniendo análisis por partes:', error);
      throw new Error('Error al obtener análisis: ' + error.message);
    }
  }

  /**
   * Verificar conectividad con el backend
   */
  async testConnection(): Promise<boolean> {
    try {
      Logger.info('🔍 Verificando conectividad con analytics API...');
      const response = await api.get('/api/analytics/dashboard-metrics');
      Logger.info('✅ Conectividad verificada');
      return true;
    } catch (error: any) {
      Logger.error('❌ Error de conectividad:', error);
      return false;
    }
  }
}

export const analyticsService = new AnalyticsService();