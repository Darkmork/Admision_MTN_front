
export enum ApplicationStatus {
    DRAFT = 'Borrador',
    SUBMITTED = 'En Revisión',
    INTERVIEW_SCHEDULED = 'Entrevista Agendada',
    ACCEPTED = 'Aceptado',
    REJECTED = 'Rechazado',
    WAITLIST = 'Lista de Espera'
}

export interface Document {
    id: string;
    name: string;
    status: 'pending' | 'submitted' | 'approved' | 'rejected';
    notes?: string;
}

export interface Applicant {
    id: string;
    firstName: string;
    lastName: string;
    birthDate: string;
    grade: string;
}

export interface Application {
    id: string;
    applicant: Applicant;
    status: ApplicationStatus;
    submissionDate: string;
    documents: Document[];
    interviewDate?: string;
}

export enum ExamStatus {
    NOT_STARTED = 'No Iniciado',
    SCHEDULED = 'Programado',
    IN_PROGRESS = 'En Progreso',
    COMPLETED = 'Completado',
    MISSED = 'No Asistió'
}

export interface ExamSchedule {
    id: string;
    date: string;
    startTime: string;
    endTime: string;
    location: string;
    maxCapacity: number;
    currentEnrollment: number;
}

export interface StudyMaterial {
    id: string;
    title: string;
    description: string;
    type: 'pdf' | 'video' | 'link' | 'document';
    url: string;
    downloadable: boolean;
}

export interface ExamSubject {
    id: string;
    name: string;
    description: string;
    duration: number; // in minutes
    totalQuestions: number;
    passingScore: number;
    instructions: string[];
    studyMaterials: StudyMaterial[];
    schedules: ExamSchedule[];
    topics: string[];
}

export interface StudentExam {
    id: string;
    studentId: string;
    subjectId: string;
    scheduleId: string;
    status: ExamStatus;
    score?: number;
    completedAt?: string;
    timeSpent?: number; // in minutes
    evaluation?: ExamEvaluation;
}

export interface Professor {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    password: string; // For login authentication
    subjects: string[]; // Array of subject IDs (MATH, SPANISH, ENGLISH)
    assignedGrades: string[]; // Array of grade levels assigned (e.g., ['prekinder', 'kinder', '1basico'])
    department: string;
    isActive: boolean;
    isAdmin?: boolean; // Para permisos de administrador
}

export interface ExamEvaluation {
    id: string;
    examId: string;
    professorId: string;
    evaluatedAt: string;
    
    // Calificación
    score: number; // Puntaje obtenido
    maxScore: number; // Puntaje máximo
    percentage: number; // Porcentaje
    grade: string; // Nota (1.0 - 7.0 o sistema de letras)
    
    // Evaluación cualitativa
    strengths: string[]; // Fortalezas
    weaknesses: string[]; // Debilidades
    examAdaptation: string; // Adecuación al examen
    behaviorObservations: string; // Comportamiento durante el examen
    generalComments: string; // Comentarios generales
    improvementAreas: string[]; // Elementos a mejorar
    
    // Evaluación por áreas específicas
    areaScores?: AreaScore[];
    
    // Recomendaciones
    recommendations: string;
    requiresFollowUp: boolean;
    followUpNotes?: string;
}

export interface AreaScore {
    area: string; // e.g., "Comprensión Lectora", "Álgebra", "Grammar"
    score: number;
    maxScore: number;
    percentage: number;
    comments?: string;
}

export enum EvaluationStatus {
    PENDING = 'Pendiente',
    IN_PROGRESS = 'En Evaluación',
    COMPLETED = 'Completada',
    REVIEWED = 'Revisada'
}

export interface StudentProfile {
    id: string;
    firstName: string;
    lastName: string;
    grade: string;
    birthDate: string;
    applicationId: string;
    examResults: StudentExam[];
    overallEvaluation?: string;
}
