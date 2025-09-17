// Datos estáticos necesarios para el sistema - reemplazo temporal de archivos mock eliminados

export interface ExamSubject {
  id: string;
  name: string;
  description: string;
  educationalLevel: string[];
  timeLimit: number; // en minutos
  totalQuestions: number;
}

export interface EducationalLevel {
  id: string;
  name: string;
  description: string;
  grades: string[];
}

export interface ProfessorData {
  id: number;
  name: string;
  email: string;
  role: string;
  subject?: string;
  educationalLevel?: string;
}

// Datos estáticos de niveles educacionales
export const educationalLevels: EducationalLevel[] = [
  {
    id: 'PRESCHOOL',
    name: 'Preescolar',
    description: 'Educación Preescolar',
    grades: ['Prekínder', 'Kínder']
  },
  {
    id: 'BASIC',
    name: 'Educación Básica',
    description: 'Educación Básica',
    grades: ['1° Básico', '2° Básico', '3° Básico', '4° Básico', '5° Básico', '6° Básico', '7° Básico', '8° Básico']
  },
  {
    id: 'HIGH_SCHOOL',
    name: 'Educación Media',
    description: 'Educación Media',
    grades: ['1° Medio', '2° Medio', '3° Medio', '4° Medio']
  }
];

// Para compatibilidad con ApplicationForm (formato value/label)
export const educationalLevelsForForm = [
  { value: 'prekinder', label: 'Prekínder' },
  { value: 'kinder', label: 'Kínder' },
  { value: '1basico', label: '1° Básico' },
  { value: '2basico', label: '2° Básico' },
  { value: '3basico', label: '3° Básico' },
  { value: '4basico', label: '4° Básico' },
  { value: '5basico', label: '5° Básico' },
  { value: '6basico', label: '6° Básico' },
  { value: '7basico', label: '7° Básico' },
  { value: '8basico', label: '8° Básico' },
  { value: '1medio', label: '1° Medio' },
  { value: '2medio', label: '2° Medio' },
  { value: '3medio', label: '3° Medio' },
  { value: '4medio', label: '4° Medio' }
];

// Datos estáticos de materias de examen
export const examSubjects: ExamSubject[] = [
  {
    id: 'MATHEMATICS',
    name: 'Matemáticas',
    description: 'Evaluación de conocimientos matemáticos básicos',
    educationalLevel: ['BASIC', 'HIGH_SCHOOL'],
    timeLimit: 60,
    totalQuestions: 20
  },
  {
    id: 'LANGUAGE',
    name: 'Lenguaje y Comunicación',
    description: 'Evaluación de comprensión lectora y expresión escrita',
    educationalLevel: ['BASIC', 'HIGH_SCHOOL'],
    timeLimit: 90,
    totalQuestions: 25
  },
  {
    id: 'SCIENCES',
    name: 'Ciencias Naturales',
    description: 'Evaluación de conocimientos científicos básicos',
    educationalLevel: ['BASIC', 'HIGH_SCHOOL'],
    timeLimit: 45,
    totalQuestions: 15
  }
];

// Función helper para obtener topics por nivel
export const getTopicsByLevel = (level: string) => {
  switch (level) {
    case 'BASIC':
      return [
        'Operaciones básicas',
        'Geometría elemental',
        'Fracciones y decimales',
        'Comprensión lectora',
        'Gramática básica'
      ];
    case 'HIGH_SCHOOL':
      return [
        'Álgebra',
        'Geometría avanzada',
        'Estadística y probabilidades',
        'Literatura',
        'Análisis de textos'
      ];
    default:
      return [];
  }
};

// Datos básicos de profesores para el sistema
export const staticProfessorData: ProfessorData[] = [
  {
    id: 1,
    name: 'Ana Rivera',
    email: 'ana.rivera@mtn.cl',
    role: 'TEACHER',
    subject: 'LANGUAGE',
    educationalLevel: 'BASIC'
  },
  {
    id: 2,
    name: 'Carlos Morales',
    email: 'carlos.morales@mtn.cl',
    role: 'CYCLE_DIRECTOR',
    educationalLevel: 'ALL_LEVELS'
  },
  {
    id: 3,
    name: 'Elena Castro',
    email: 'elena.castro@mtn.cl',
    role: 'PSYCHOLOGIST',
    educationalLevel: 'ALL_LEVELS'
  }
];

// Mock data para componentes que aún no están conectados al backend
export const mockStudentProfiles = [
  {
    id: '1',
    name: 'Juan Pérez',
    grade: '5° Básico',
    age: 11,
    rut: '12345678-9',
    status: 'ACTIVE'
  },
  {
    id: '2', 
    name: 'María González',
    grade: '3° Medio',
    age: 16,
    rut: '87654321-0',
    status: 'ACTIVE'
  }
];

export const mockStudentExams = [
  {
    id: '1',
    studentId: '1',
    subject: 'MATHEMATICS',
    score: 85,
    status: 'COMPLETED',
    date: '2024-08-15'
  },
  {
    id: '2',
    studentId: '1',
    subject: 'LANGUAGE',
    score: 92,
    status: 'COMPLETED', 
    date: '2024-08-16'
  }
];

export const mockProfessors = staticProfessorData;

// Funciones helper para professor dashboard
export const getPendingExamsByProfessor = (professorId: number) => {
  return mockStudentExams.filter(exam => 
    exam.status === 'PENDING' || exam.status === 'IN_PROGRESS'
  );
};

export const getProfessorStats = (professorId: number) => {
  const exams = mockStudentExams;
  return {
    totalExams: exams.length,
    completedExams: exams.filter(e => e.status === 'COMPLETED').length,
    pendingExams: exams.filter(e => e.status === 'PENDING').length,
    inProgressExams: exams.filter(e => e.status === 'IN_PROGRESS').length
  };
};