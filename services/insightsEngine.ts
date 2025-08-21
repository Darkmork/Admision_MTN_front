import { Application, ApplicationStatus } from '../types';
import { mockExamResults } from './mockData';

export interface Insight {
  id: string;
  type: 'success' | 'warning' | 'danger' | 'info';
  category: 'rendimiento' | 'proceso' | 'calidad' | 'oportunidad' | 'prediccion';
  title: string;
  description: string;
  impact: 'bajo' | 'medio' | 'alto' | 'critico';
  actionable: boolean;
  recommendations: string[];
  metrics?: {
    current: number;
    target?: number;
    trend?: 'up' | 'down' | 'stable';
  };
}

export interface RecommendationAction {
  id: string;
  title: string;
  description: string;
  priority: 'baja' | 'media' | 'alta' | 'critica';
  effort: 'bajo' | 'medio' | 'alto';
  timeline: string;
  expectedImpact: string;
}

export class InsightsEngine {
  private applications: Application[];
  private examResults: any[];

  constructor(applications: Application[], examResults: any[] = mockExamResults) {
    this.applications = applications;
    this.examResults = examResults;
  }

  // Generar todos los insights
  generateInsights(): Insight[] {
    const insights: Insight[] = [];

    insights.push(...this.analyzeAcceptanceRate());
    insights.push(...this.analyzeProcessingTime());
    insights.push(...this.analyzeExamPerformance());
    insights.push(...this.analyzeTrends());
    insights.push(...this.predictCapacity());
    insights.push(...this.identifyRisks());

    return insights.sort((a, b) => this.priorityScore(b) - this.priorityScore(a));
  }

  // Generar recomendaciones accionables
  generateRecommendations(): RecommendationAction[] {
    const recommendations: RecommendationAction[] = [];
    const insights = this.generateInsights();

    insights.forEach(insight => {
      if (insight.actionable) {
        recommendations.push(...this.convertToActions(insight));
      }
    });

    return recommendations;
  }

  private analyzeAcceptanceRate(): Insight[] {
    const total = this.applications.length;
    const accepted = this.applications.filter(a => a.status === ApplicationStatus.ACCEPTED).length;
    const rate = total > 0 ? (accepted / total) * 100 : 0;

    const insights: Insight[] = [];

    if (rate < 10) {
      insights.push({
        id: 'acceptance-rate-low',
        type: 'warning',
        category: 'rendimiento',
        title: 'Tasa de Aceptación Muy Baja',
        description: `La tasa de aceptación actual es ${rate.toFixed(1)}%, significativamente menor al rango objetivo de 15-25%.`,
        impact: 'alto',
        actionable: true,
        recommendations: [
          'Revisar criterios de selección para verificar si son demasiado restrictivos',
          'Analizar las razones principales de rechazo',
          'Considerar programas de apoyo para postulantes con potencial'
        ],
        metrics: { current: rate, target: 20, trend: 'down' }
      });
    } else if (rate > 40) {
      insights.push({
        id: 'acceptance-rate-high',
        type: 'danger',
        category: 'calidad',
        title: 'Tasa de Aceptación Demasiado Alta',
        description: `La tasa de aceptación es ${rate.toFixed(1)}%, lo que podría comprometer la selectividad del proceso.`,
        impact: 'critico',
        actionable: true,
        recommendations: [
          'Evaluar si los estándares de admisión son suficientemente rigurosos',
          'Implementar criterios adicionales de evaluación',
          'Considerar limitar el número de cupos disponibles'
        ],
        metrics: { current: rate, target: 25, trend: 'up' }
      });
    } else {
      insights.push({
        id: 'acceptance-rate-optimal',
        type: 'success',
        category: 'rendimiento',
        title: 'Tasa de Aceptación Óptima',
        description: `La tasa de aceptación de ${rate.toFixed(1)}% está dentro del rango ideal para mantener calidad y accesibilidad.`,
        impact: 'bajo',
        actionable: false,
        recommendations: ['Mantener los criterios actuales de selección'],
        metrics: { current: rate, target: 20, trend: 'stable' }
      });
    }

    return insights;
  }

  private analyzeProcessingTime(): Insight[] {
    const avgTime = this.applications.length > 0
      ? Math.round(this.applications.reduce((acc, app) => {
          const days = Math.floor((Date.now() - new Date(app.submissionDate).getTime()) / (1000 * 60 * 60 * 24));
          return acc + days;
        }, 0) / this.applications.length)
      : 0;

    const insights: Insight[] = [];

    if (avgTime > 45) {
      insights.push({
        id: 'processing-time-slow',
        type: 'warning',
        category: 'proceso',
        title: 'Tiempo de Procesamiento Elevado',
        description: `El tiempo promedio de ${avgTime} días excede significativamente el objetivo de 30 días.`,
        impact: 'alto',
        actionable: true,
        recommendations: [
          'Implementar sistema de seguimiento automatizado',
          'Asignar más recursos al proceso de revisión',
          'Identificar y eliminar cuellos de botella en el flujo'
        ],
        metrics: { current: avgTime, target: 30, trend: 'up' }
      });
    }

    return insights;
  }

  private analyzeExamPerformance(): Insight[] {
    const insights: Insight[] = [];
    const subjects = ['Matemática', 'Lenguaje', 'Inglés'];

    subjects.forEach(subject => {
      const subjectResults = this.examResults.filter(e => e.subject === subject);
      if (subjectResults.length === 0) return;

      const average = subjectResults.reduce((acc, e) => acc + e.score, 0) / subjectResults.length;
      const lowScores = subjectResults.filter(e => e.score < 70).length;
      const lowPercentage = (lowScores / subjectResults.length) * 100;

      if (lowPercentage > 30) {
        insights.push({
          id: `exam-performance-${subject.toLowerCase()}`,
          type: 'warning',
          category: 'calidad',
          title: `Rendimiento Bajo en ${subject}`,
          description: `${lowPercentage.toFixed(1)}% de estudiantes obtuvieron menos de 70 puntos en ${subject}.`,
          impact: 'medio',
          actionable: true,
          recommendations: [
            `Revisar el nivel de dificultad del examen de ${subject}`,
            'Implementar talleres de preparación específicos',
            'Evaluar si los contenidos evaluados están alineados con el curriculum previo'
          ],
          metrics: { current: average, target: 80, trend: 'down' }
        });
      }
    });

    return insights;
  }

  private analyzeTrends(): Insight[] {
    const insights: Insight[] = [];
    
    // Análisis de tendencias por mes
    const monthlyData = this.applications.reduce((acc, app) => {
      const month = new Date(app.submissionDate).getMonth();
      acc[month] = (acc[month] || 0) + 1;
      return acc;
    }, {} as Record<number, number>);

    const months = Object.keys(monthlyData).map(Number).sort();
    if (months.length >= 3) {
      const recent = monthlyData[months[months.length - 1]] || 0;
      const previous = monthlyData[months[months.length - 2]] || 0;
      const change = recent - previous;
      const changePercent = previous > 0 ? (change / previous) * 100 : 0;

      if (changePercent > 20) {
        insights.push({
          id: 'applications-increasing',
          type: 'info',
          category: 'prediccion',
          title: 'Incremento en Postulaciones',
          description: `Las postulaciones han aumentado ${changePercent.toFixed(1)}% respecto al mes anterior.`,
          impact: 'medio',
          actionable: true,
          recommendations: [
            'Preparar recursos adicionales para manejar el incremento',
            'Revisar capacidad de procesamiento',
            'Considerar abrir convocatorias adicionales'
          ],
          metrics: { current: recent, target: previous, trend: 'up' }
        });
      }
    }

    return insights;
  }

  private predictCapacity(): Insight[] {
    const insights: Insight[] = [];
    const waitlist = this.applications.filter(a => a.status === ApplicationStatus.WAITLIST).length;
    const accepted = this.applications.filter(a => a.status === ApplicationStatus.ACCEPTED).length;
    
    if (waitlist > accepted * 0.5) {
      insights.push({
        id: 'capacity-constraint',
        type: 'warning',
        category: 'oportunidad',
        title: 'Oportunidad de Expansión',
        description: `Hay ${waitlist} estudiantes en lista de espera (${((waitlist/this.applications.length)*100).toFixed(1)}% del total).`,
        impact: 'alto',
        actionable: true,
        recommendations: [
          'Evaluar posibilidad de aumentar cupos',
          'Considerar crear secciones adicionales',
          'Analizar demanda vs capacidad institucional'
        ],
        metrics: { current: waitlist, trend: 'up' }
      });
    }

    return insights;
  }

  private identifyRisks(): Insight[] {
    const insights: Insight[] = [];
    const pending = this.applications.filter(a => a.status === ApplicationStatus.SUBMITTED).length;
    const total = this.applications.length;

    if (pending > total * 0.4) {
      insights.push({
        id: 'processing-backlog',
        type: 'danger',
        category: 'proceso',
        title: 'Acumulación de Postulaciones Pendientes',
        description: `${pending} postulaciones (${((pending/total)*100).toFixed(1)}%) están pendientes de procesamiento.`,
        impact: 'critico',
        actionable: true,
        recommendations: [
          'Asignar recursos urgentes para reducir el backlog',
          'Implementar procesamiento en paralelo',
          'Establecer plazos límite para cada etapa del proceso'
        ],
        metrics: { current: pending, target: Math.floor(total * 0.2), trend: 'up' }
      });
    }

    return insights;
  }

  private convertToActions(insight: Insight): RecommendationAction[] {
    return insight.recommendations.map((rec, index) => ({
      id: `${insight.id}-action-${index}`,
      title: rec,
      description: `Acción derivada del insight: ${insight.title}`,
      priority: this.mapImpactToPriority(insight.impact),
      effort: this.estimateEffort(rec),
      timeline: this.estimateTimeline(insight.impact),
      expectedImpact: `Mejora esperada en ${insight.category}`
    }));
  }

  private priorityScore(insight: Insight): number {
    const impactScore = { bajo: 1, medio: 2, alto: 3, critico: 4 };
    const typeScore = { danger: 4, warning: 3, info: 2, success: 1 };
    return impactScore[insight.impact] * typeScore[insight.type];
  }

  private mapImpactToPriority(impact: string): 'baja' | 'media' | 'alta' | 'critica' {
    const mapping = { bajo: 'baja', medio: 'media', alto: 'alta', critico: 'critica' };
    return mapping[impact as keyof typeof mapping] || 'media';
  }

  private estimateEffort(action: string): 'bajo' | 'medio' | 'alto' {
    if (action.includes('implementar') || action.includes('desarrollar')) return 'alto';
    if (action.includes('revisar') || action.includes('evaluar')) return 'medio';
    return 'bajo';
  }

  private estimateTimeline(impact: string): string {
    const timelines = {
      critico: '1-2 semanas',
      alto: '2-4 semanas', 
      medio: '1-2 meses',
      bajo: '2-3 meses'
    };
    return timelines[impact as keyof typeof timelines] || '1 mes';
  }
}

// Función helper para usar el motor de insights
export const generateInsightsForDashboard = (applications: Application[]) => {
  const engine = new InsightsEngine(applications);
  return {
    insights: engine.generateInsights(),
    recommendations: engine.generateRecommendations()
  };
};