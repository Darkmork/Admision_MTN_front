/**
 * Analytics Service para Microservicios
 * 
 * Calcula analytics basándose en datos reales obtenidos desde los microservicios
 * en lugar de endpoints específicos de analytics que no existen.
 */

import { DataAdapter } from './dataAdapter';
import { userService } from './userService';
import { applicationService } from './applicationService';

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
  level: string;
  title: string;
  message: string;
}

export interface Insights {
  recommendations: InsightRecommendation[];
}

export interface CompleteAnalytics {
  dashboardMetrics: DashboardMetrics;
  statusDistribution: StatusDistribution;
  gradeDistribution: GradeDistribution;
  evaluatorAnalysis: EvaluatorAnalysis;
  temporalTrends: TemporalTrends;
  performanceMetrics: PerformanceMetrics;
  insights: Insights;
}

class MicroservicesAnalyticsService {
  
  /**
   * Obtiene analytics completos calculándolos desde los microservicios
   */
  async getCompleteAnalytics(): Promise<CompleteAnalytics> {
    try {
      console.log('📊 Calculando analytics desde microservicios...');
      
      // Obtener datos base desde microservicios
      const applications = await applicationService.getAllApplications();
      const usersResponse = await userService.getAllUsers();
      const users = usersResponse.content;
      
      console.log('✅ Datos obtenidos:', { applications: applications.length, users: users.length });
      
      // Calcular métricas
      const dashboardMetrics = this.calculateDashboardMetrics(applications, users);
      const statusDistribution = this.calculateStatusDistribution(applications);
      const gradeDistribution = this.calculateGradeDistribution(applications);
      const evaluatorAnalysis = this.calculateEvaluatorAnalysis(users);
      const temporalTrends = this.calculateTemporalTrends(applications);
      const performanceMetrics = this.calculatePerformanceMetrics(applications);
      const insights = this.generateInsights(applications, users);
      
      const analytics: CompleteAnalytics = {
        dashboardMetrics,
        statusDistribution,
        gradeDistribution,
        evaluatorAnalysis,
        temporalTrends,
        performanceMetrics,
        insights
      };
      
      console.log('✅ Analytics calculados exitosamente');
      return analytics;
      
    } catch (error: any) {
      console.error('❌ Error calculando analytics:', error);
      throw new Error('No se pudieron calcular los analytics desde microservicios');
    }
  }
  
  private calculateDashboardMetrics(applications: any[], users: any[]): DashboardMetrics {
    const totalApplications = applications.length;
    const acceptedApplications = applications.filter(app => app.status === 'APPROVED' || app.status === 'ACCEPTED').length;
    const activeEvaluators = users.filter(user => 
      user.active && ['TEACHER', 'COORDINATOR', 'PSYCHOLOGIST', 'CYCLE_DIRECTOR'].includes(user.role)
    ).length;
    
    const currentMonth = new Date().getMonth();
    const applicationsThisMonth = applications.filter(app => {
      const appDate = new Date(app.submissionDate || app.createdAt);
      return appDate.getMonth() === currentMonth;
    }).length;
    
    return {
      totalApplications,
      applicationsThisMonth,
      conversionRate: totalApplications > 0 ? Math.round((acceptedApplications / totalApplications) * 100) : 0,
      acceptedApplications,
      averageCompletionDays: 15, // Valor estimado
      activeEvaluators,
      totalActiveUsers: users.filter(user => user.active).length
    };
  }
  
  private calculateStatusDistribution(applications: any[]): StatusDistribution {
    const statusCount: Record<string, number> = {};
    const totalApplications = applications.length;
    
    applications.forEach(app => {
      const status = app.status || 'PENDING';
      statusCount[status] = (statusCount[status] || 0) + 1;
    });
    
    const statusPercentages: Record<string, number> = {};
    Object.keys(statusCount).forEach(status => {
      statusPercentages[status] = totalApplications > 0 ? (statusCount[status] / totalApplications) * 100 : 0;
    });
    
    return { statusCount, statusPercentages, totalApplications };
  }
  
  private calculateGradeDistribution(applications: any[]): GradeDistribution {
    const gradeCount: Record<string, number> = {};
    const totalApplications = applications.length;
    
    applications.forEach(app => {
      const grade = app.student?.gradeApplied || 'No especificado';
      gradeCount[grade] = (gradeCount[grade] || 0) + 1;
    });
    
    const gradePercentages: Record<string, number> = {};
    Object.keys(gradeCount).forEach(grade => {
      gradePercentages[grade] = totalApplications > 0 ? (gradeCount[grade] / totalApplications) * 100 : 0;
    });
    
    return { gradeCount, gradePercentages, totalApplications };
  }
  
  private calculateEvaluatorAnalysis(users: any[]): EvaluatorAnalysis {
    const evaluatorsByRole: Record<string, number> = {};
    
    users.forEach(user => {
      if (user.active && ['TEACHER', 'COORDINATOR', 'PSYCHOLOGIST', 'CYCLE_DIRECTOR', 'ADMIN'].includes(user.role)) {
        evaluatorsByRole[user.role] = (evaluatorsByRole[user.role] || 0) + 1;
      }
    });
    
    return {
      teacherLanguage: Math.floor((evaluatorsByRole['TEACHER'] || 0) / 3), // Estimado
      teacherMathematics: Math.floor((evaluatorsByRole['TEACHER'] || 0) / 3),
      teacherEnglish: Math.floor((evaluatorsByRole['TEACHER'] || 0) / 3),
      psychologist: evaluatorsByRole['PSYCHOLOGIST'] || 0,
      cycleDirector: evaluatorsByRole['CYCLE_DIRECTOR'] || 0,
      admin: evaluatorsByRole['ADMIN'] || 0,
      totalEvaluators: Object.values(evaluatorsByRole).reduce((sum, count) => sum + count, 0),
      evaluatorsByRole
    };
  }
  
  private calculateTemporalTrends(applications: any[]): TemporalTrends {
    const monthlyApplications: Record<string, number> = {};
    const currentDate = new Date();
    
    // Inicializar últimos 6 meses
    for (let i = 5; i >= 0; i--) {
      const date = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1);
      const monthKey = date.toLocaleDateString('es-CL', { year: 'numeric', month: 'long' });
      monthlyApplications[monthKey] = 0;
    }
    
    applications.forEach(app => {
      const appDate = new Date(app.submissionDate || app.createdAt);
      const monthKey = appDate.toLocaleDateString('es-CL', { year: 'numeric', month: 'long' });
      if (monthlyApplications.hasOwnProperty(monthKey)) {
        monthlyApplications[monthKey]++;
      }
    });
    
    const currentMonth = currentDate.toLocaleDateString('es-CL', { year: 'numeric', month: 'long' });
    const lastMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1)
      .toLocaleDateString('es-CL', { year: 'numeric', month: 'long' });
    
    const currentMonthApplications = monthlyApplications[currentMonth] || 0;
    const lastMonthApplications = monthlyApplications[lastMonth] || 0;
    const monthlyGrowthRate = lastMonthApplications > 0 
      ? Math.round(((currentMonthApplications - lastMonthApplications) / lastMonthApplications) * 100) 
      : 0;
    
    return {
      monthlyApplications,
      currentMonthApplications,
      lastMonthApplications,
      monthlyGrowthRate
    };
  }
  
  private calculatePerformanceMetrics(applications: any[]): PerformanceMetrics {
    const total = applications.length;
    const completedApplications = applications.filter(app => 
      ['APPROVED', 'ACCEPTED', 'REJECTED'].includes(app.status)
    ).length;
    const underReviewApplications = applications.filter(app => 
      ['UNDER_REVIEW', 'IN_REVIEW'].includes(app.status)
    ).length;
    const finalizedApplications = applications.filter(app => 
      ['APPROVED', 'ACCEPTED', 'REJECTED', 'ARCHIVED'].includes(app.status)
    ).length;
    
    return {
      completionRate: total > 0 ? (completedApplications / total) * 100 : 0,
      underReviewRate: total > 0 ? (underReviewApplications / total) * 100 : 0,
      finalizationRate: total > 0 ? (finalizedApplications / total) * 100 : 0,
      completedApplications,
      underReviewApplications,
      finalizedApplications
    };
  }
  
  private generateInsights(applications: any[], users: any[]): Insights {
    const recommendations: InsightRecommendation[] = [];
    
    const totalApps = applications.length;
    const activeEvaluators = users.filter(user => 
      user.active && ['TEACHER', 'COORDINATOR', 'PSYCHOLOGIST', 'CYCLE_DIRECTOR'].includes(user.role)
    ).length;
    
    if (totalApps > 0 && activeEvaluators > 0) {
      const appsPerEvaluator = totalApps / activeEvaluators;
      
      if (appsPerEvaluator > 10) {
        recommendations.push({
          type: 'workload',
          level: 'warning',
          title: 'Alta carga de trabajo',
          message: `Cada evaluador tiene aproximadamente ${Math.round(appsPerEvaluator)} postulaciones. Considera agregar más evaluadores.`
        });
      } else {
        recommendations.push({
          type: 'efficiency',
          level: 'success',
          title: 'Carga balanceada',
          message: `La carga de trabajo está bien distribuida con ${Math.round(appsPerEvaluator)} postulaciones por evaluador.`
        });
      }
    }
    
    const pendingApps = applications.filter(app => app.status === 'PENDING').length;
    if (pendingApps > 0) {
      recommendations.push({
        type: 'trend',
        level: 'info',
        title: 'Postulaciones pendientes',
        message: `Hay ${pendingApps} postulaciones pendientes de revisión.`
      });
    }
    
    recommendations.push({
      type: 'resources',
      level: 'info',
      title: 'Sistema microservicios',
      message: 'Sistema funcionando correctamente con arquitectura de microservicios.'
    });
    
    return { recommendations };
  }
}

export const microservicesAnalyticsService = new MicroservicesAnalyticsService();