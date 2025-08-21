import api from './api';
import { Evaluation, EvaluationStatus, EvaluationType } from '../types/evaluation';

export interface ProfessorEvaluation {
    id: number;
    evaluationType: EvaluationType;
    status: EvaluationStatus;
    applicationId: number;
    studentId?: number;
    studentName: string;
    studentGrade: string;
    studentBirthDate?: string;
    currentSchool?: string;
    scheduledDate?: string;
    completedDate?: string;
    score?: number;
    maxScore?: number;
    grade?: string;
    observations?: string;
    strengths?: string;
    areasForImprovement?: string;
    recommendations?: string;
    requiresFollowUp?: boolean;
    followUpNotes?: string;
    application?: {
        student?: {
            birthDate?: string;
            currentSchool?: string;
        };
    };
}

export interface ProfessorEvaluationStats {
    total: number;
    pending: number;
    inProgress: number;
    completed: number;
    averageScore: number;
}

class ProfessorEvaluationService {
    
    /**
     * Obtener todas las evaluaciones asignadas al profesor actual
     */
    async getMyEvaluations(): Promise<ProfessorEvaluation[]> {
        try {
            console.log('📋 Obteniendo evaluaciones del profesor...');
            
            const response = await api.get('/api/evaluations/my-evaluations');
            const evaluations = response.data;
            
            console.log('✅ Evaluaciones obtenidas del backend:', evaluations);
            console.log('📊 Número de evaluaciones:', evaluations.length);
            
            const mappedEvaluations = this.mapToProfessorEvaluations(evaluations);
            console.log('🔄 Evaluaciones mapeadas para el frontend:', mappedEvaluations);
            
            return mappedEvaluations;
            
        } catch (error: any) {
            console.error('❌ Error obteniendo evaluaciones:', error);
            
            if (error.response?.status === 401) {
                throw new Error('No tienes permisos para acceder a las evaluaciones. Verifica tu autenticación.');
            } else if (error.response?.status === 404) {
                throw new Error('No se encontraron evaluaciones asignadas.');
            } else if (error.response?.status === 500) {
                throw new Error('Error del servidor al obtener evaluaciones.');
            }
            
            throw new Error('Error al obtener las evaluaciones asignadas. Verifica tu conexión.');
        }
    }
    
    /**
     * Obtener solo las evaluaciones pendientes del profesor
     */
    async getMyPendingEvaluations(): Promise<ProfessorEvaluation[]> {
        try {
            console.log('⏳ Obteniendo evaluaciones pendientes...');
            
            const response = await api.get('/api/evaluations/my-pending');
            const evaluations = response.data;
            
            console.log('✅ Evaluaciones pendientes obtenidas:', evaluations.length);
            return this.mapToProfessorEvaluations(evaluations);
            
        } catch (error: any) {
            console.error('❌ Error obteniendo evaluaciones pendientes:', error);
            
            if (error.response?.status === 401) {
                throw new Error('No tienes permisos para acceder a las evaluaciones pendientes.');
            } else if (error.response?.status === 404) {
                throw new Error('No se encontraron evaluaciones pendientes.');
            }
            
            throw new Error('Error al obtener las evaluaciones pendientes.');
        }
    }
    
    /**
     * Obtener estadísticas de evaluaciones del profesor
     */
    async getMyEvaluationStats(): Promise<ProfessorEvaluationStats> {
        try {
            const evaluations = await this.getMyEvaluations();
            
            const total = evaluations.length;
            const pending = evaluations.filter(e => e.status === EvaluationStatus.PENDING).length;
            const inProgress = evaluations.filter(e => e.status === EvaluationStatus.IN_PROGRESS).length;
            const completed = evaluations.filter(e => e.status === EvaluationStatus.COMPLETED).length;
            
            const completedEvaluations = evaluations.filter(e => e.status === EvaluationStatus.COMPLETED && e.score);
            const averageScore = completedEvaluations.length > 0 
                ? Math.round(completedEvaluations.reduce((sum, e) => sum + (e.score || 0), 0) / completedEvaluations.length)
                : 0;
            
            return {
                total,
                pending,
                inProgress,
                completed,
                averageScore
            };
            
        } catch (error: any) {
            console.error('❌ Error obteniendo estadísticas:', error);
            throw new Error('No se pudieron obtener las estadísticas de evaluaciones.');
        }
    }
    
    /**
     * Actualizar una evaluación (marcar como completada, agregar puntaje, etc.)
     */
    async updateEvaluation(evaluationId: number, evaluationData: Partial<ProfessorEvaluation>): Promise<ProfessorEvaluation> {
        try {
            console.log('💾 Actualizando evaluación:', evaluationId);
            
            const response = await api.put(`/api/evaluations/${evaluationId}`, evaluationData);
            const updatedEvaluation = response.data;
            
            console.log('✅ Evaluación actualizada exitosamente');
            return this.mapToProfessorEvaluation(updatedEvaluation);
            
        } catch (error: any) {
            console.error('❌ Error actualizando evaluación:', error);
            
            if (error.response?.status === 401) {
                throw new Error('No tienes permisos para actualizar esta evaluación.');
            } else if (error.response?.status === 404) {
                throw new Error('Evaluación no encontrada.');
            } else if (error.response?.status === 400) {
                throw new Error('Datos de evaluación inválidos.');
            }
            
            throw new Error('Error al actualizar la evaluación. Intenta nuevamente.');
        }
    }
    
    /**
     * Obtener una evaluación específica por ID
     */
    async getEvaluationById(evaluationId: number): Promise<ProfessorEvaluation> {
        try {
            console.log('🔍 Obteniendo evaluación específica:', evaluationId);
            
            const response = await api.get(`/api/evaluations/${evaluationId}`);
            const evaluation = response.data;
            
            console.log('✅ Evaluación obtenida:', evaluation);
            return this.mapToProfessorEvaluation(evaluation);
            
        } catch (error: any) {
            console.error('❌ Error obteniendo evaluación:', error);
            
            if (error.response?.status === 401) {
                throw new Error('No tienes permisos para acceder a esta evaluación.');
            } else if (error.response?.status === 404) {
                throw new Error('Evaluación no encontrada.');
            }
            
            throw new Error('Error al obtener la evaluación.');
        }
    }
    
    /**
     * Mapear respuesta de la API a formato del frontend
     */
    private mapToProfessorEvaluations(apiEvaluations: any[]): ProfessorEvaluation[] {
        return apiEvaluations.map((evaluation) => this.mapToProfessorEvaluation(evaluation));
    }
    
    private mapToProfessorEvaluation(apiEvaluation: any): ProfessorEvaluation {
        console.log('🔄 Mapeando evaluación individual:', apiEvaluation);
        console.log('🔍 Estructura de datos recibida:', {
            id: apiEvaluation.id,
            evaluationType: apiEvaluation.evaluationType,
            application: apiEvaluation.application,
            student: apiEvaluation.student
        });
        
        // DEBUG: Verificar datos específicos del estudiante
        console.log('🔍 DEBUG - Datos específicos del estudiante:');
        console.log('📅 Fecha nacimiento directa:', apiEvaluation.student?.birthDate || apiEvaluation.student?.birth_date);
        console.log('🏫 Colegio actual directo:', apiEvaluation.student?.currentSchool || apiEvaluation.student?.current_school);
        if (apiEvaluation.application?.student) {
            console.log('📅 Fecha nacimiento en application:', apiEvaluation.application.student.birthDate || apiEvaluation.application.student.birth_date);
            console.log('🏫 Colegio actual en application:', apiEvaluation.application.student.currentSchool || apiEvaluation.application.student.current_school);
        }
        
        const mappedEvaluation = {
            id: apiEvaluation.id || apiEvaluation.evaluationId,
            evaluationType: apiEvaluation.evaluationType || apiEvaluation.type,
            status: apiEvaluation.status || EvaluationStatus.PENDING,
            applicationId: apiEvaluation.applicationId || apiEvaluation.application?.id,
            studentId: this.getStudentId(apiEvaluation),
            studentName: this.getStudentName(apiEvaluation),
            studentGrade: this.getStudentGrade(apiEvaluation),
            studentBirthDate: this.getStudentBirthDate(apiEvaluation),
            currentSchool: this.getCurrentSchool(apiEvaluation),
            scheduledDate: apiEvaluation.scheduledDate || apiEvaluation.scheduledAt || apiEvaluation.evaluation_date || apiEvaluation.evaluationDate,
            completedDate: apiEvaluation.completedDate || apiEvaluation.completedAt || apiEvaluation.completion_date || apiEvaluation.completionDate,
            score: apiEvaluation.score,
            maxScore: apiEvaluation.maxScore,
            grade: apiEvaluation.grade,
            observations: apiEvaluation.observations,
            strengths: apiEvaluation.strengths,
            areasForImprovement: apiEvaluation.areasForImprovement || apiEvaluation.areas_for_improvement,
            recommendations: apiEvaluation.recommendations,
            requiresFollowUp: apiEvaluation.requiresFollowUp,
            followUpNotes: apiEvaluation.followUpNotes,
            application: apiEvaluation.application
        };
        
        console.log('✅ Evaluación mapeada:', mappedEvaluation);
        return mappedEvaluation;
    }
    
    private getStudentId(apiEvaluation: any): number | undefined {
        // Primero intentar obtener del estudiante directo
        if (apiEvaluation.student?.id) return apiEvaluation.student.id;
        
        // Luego intentar obtener del estudiante anidado en application
        if (apiEvaluation.application?.student?.id) return apiEvaluation.application.student.id;
        
        // Finalmente intentar del campo directo
        if (apiEvaluation.studentId) return apiEvaluation.studentId;
        
        return undefined;
    }
    
    private getStudentName(apiEvaluation: any): string {
        // Primero intentar obtener del estudiante directo
        if (apiEvaluation.student) {
            return `${apiEvaluation.student.firstName || ''} ${apiEvaluation.student.lastName || ''}`.trim();
        }
        
        // Luego intentar obtener del estudiante anidado en application
        if (apiEvaluation.application?.student) {
            return `${apiEvaluation.application.student.firstName || ''} ${apiEvaluation.application.student.lastName || ''}`.trim();
        }
        
        // Finalmente intentar del campo directo
        if (apiEvaluation.studentName) {
            return apiEvaluation.studentName;
        }
        
        return 'Estudiante no especificado';
    }
    
    private getStudentGrade(apiEvaluation: any): string {
        // Primero intentar obtener del estudiante directo
        if (apiEvaluation.student?.grade) return apiEvaluation.student.grade;
        
        // Luego intentar obtener del estudiante anidado en application
        if (apiEvaluation.application?.student?.gradeApplied) return apiEvaluation.application.student.gradeApplied;
        if (apiEvaluation.application?.student?.grade) return apiEvaluation.application.student.grade;
        
        // Finalmente intentar de otros campos
        if (apiEvaluation.gradeLevel) return apiEvaluation.gradeLevel;
        if (apiEvaluation.studentGrade) return apiEvaluation.studentGrade;
        
        return 'Grado no especificado';
    }
    
    private getStudentBirthDate(apiEvaluation: any): string | undefined {
        // ✅ ORDEN ACTUALIZADO: Primero application.student (ahora incluye birthDate desde backend)
        if (apiEvaluation.application?.student?.birthDate) return apiEvaluation.application.student.birthDate;
        if (apiEvaluation.application?.student?.birth_date) return apiEvaluation.application.student.birth_date;
        
        // Luego intentar del estudiante directo (para compatibilidad)
        if (apiEvaluation.student?.birthDate) return apiEvaluation.student.birthDate;
        if (apiEvaluation.student?.birth_date) return apiEvaluation.student.birth_date;
        
        // Finalmente intentar de otros campos
        if (apiEvaluation.studentBirthDate) return apiEvaluation.studentBirthDate;
        if (apiEvaluation.student_birth_date) return apiEvaluation.student_birth_date;
        
        return undefined;
    }
    
    private getCurrentSchool(apiEvaluation: any): string | undefined {
        // ✅ ORDEN ACTUALIZADO: Primero application.student (ahora incluye currentSchool desde backend)
        if (apiEvaluation.application?.student?.currentSchool) return apiEvaluation.application.student.currentSchool;
        if (apiEvaluation.application?.student?.current_school) return apiEvaluation.application.student.current_school;
        
        // Luego intentar del estudiante directo (para compatibilidad)
        if (apiEvaluation.student?.currentSchool) return apiEvaluation.student.currentSchool;
        if (apiEvaluation.student?.current_school) return apiEvaluation.student.current_school;
        
        // Finalmente intentar de otros campos
        if (apiEvaluation.currentSchool) return apiEvaluation.currentSchool;
        if (apiEvaluation.current_school) return apiEvaluation.current_school;
        
        return undefined;
    }
}

export const professorEvaluationService = new ProfessorEvaluationService();
