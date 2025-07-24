import { Professor, StudentProfile, ExamEvaluation, AreaScore, EvaluationStatus, StudentExam, ExamStatus } from '../types';

export const mockProfessors: Professor[] = [
    {
        id: 'PROF-001',
        firstName: 'María Elena',
        lastName: 'González Sánchez',
        email: 'maria.gonzalez@mtn.cl',
        password: 'profesor123',
        subjects: ['MATH'],
        assignedGrades: ['prekinder', 'kinder', '1basico', '2basico'],
        department: 'Matemática Inicial',
        isActive: true
    },
    {
        id: 'PROF-002',
        firstName: 'Carlos Roberto',
        lastName: 'Ruiz Morales',
        email: 'carlos.ruiz@mtn.cl',
        password: 'profesor123',
        subjects: ['SPANISH'],
        assignedGrades: ['prekinder', 'kinder', '1basico', '2basico', '3basico'],
        department: 'Lenguaje y Comunicación Básica',
        isActive: true
    },
    {
        id: 'PROF-003',
        firstName: 'Jennifer',
        lastName: 'Thompson Wilson',
        email: 'jennifer.thompson@mtn.cl',
        password: 'profesor123',
        subjects: ['ENGLISH'],
        assignedGrades: ['prekinder', 'kinder', '1basico', '2basico', '3basico', '4basico'],
        department: 'Inglés Básico',
        isActive: true
    },
    {
        id: 'PROF-004',
        firstName: 'Ana Patricia',
        lastName: 'López Rivera',
        email: 'ana.lopez@mtn.cl',
        password: 'profesor123',
        subjects: ['MATH'],
        assignedGrades: ['3basico', '4basico', '5basico', '6basico'],
        department: 'Matemática Intermedia',
        isActive: true
    },
    {
        id: 'PROF-005',
        firstName: 'Roberto',
        lastName: 'Silva Castro',
        email: 'roberto.silva@mtn.cl',
        password: 'profesor123',
        subjects: ['SPANISH'],
        assignedGrades: ['4basico', '5basico', '6basico', '7basico', '8basico'],
        department: 'Lenguaje y Comunicación Intermedia',
        isActive: true
    },
    {
        id: 'PROF-006',
        firstName: 'Patricia Elena',
        lastName: 'Morales Torres',
        email: 'patricia.morales@mtn.cl',
        password: 'profesor123',
        subjects: ['ENGLISH'],
        assignedGrades: ['5basico', '6basico', '7basico', '8basico'],
        department: 'Inglés Intermedio',
        isActive: true
    },
    {
        id: 'PROF-007',
        firstName: 'Eduardo',
        lastName: 'Hernández Vega',
        email: 'eduardo.hernandez@mtn.cl',
        password: 'profesor123',
        subjects: ['MATH'],
        assignedGrades: ['7basico', '8basico', '1medio', '2medio'],
        department: 'Matemática Media',
        isActive: true
    },
    {
        id: 'PROF-008',
        firstName: 'Carmen Gloria',
        lastName: 'Figueroa Díaz',
        email: 'carmen.figueroa@mtn.cl',
        password: 'profesor123',
        subjects: ['SPANISH'],
        assignedGrades: ['1medio', '2medio', '3medio', '4medio'],
        department: 'Lenguaje y Comunicación Media',
        isActive: true
    },
    {
        id: 'PROF-009',
        firstName: 'Michael James',
        lastName: 'Anderson Smith',
        email: 'michael.anderson@mtn.cl',
        password: 'profesor123',
        subjects: ['ENGLISH'],
        assignedGrades: ['1medio', '2medio', '3medio', '4medio'],
        department: 'Inglés Avanzado',
        isActive: true
    },
    {
        id: 'PROF-010',
        firstName: 'Jorge',
        lastName: 'Gangale',
        email: 'jorge.gangale@mtn.cl',
        password: 'profesor123',
        subjects: ['MATH'],
        assignedGrades: ['8basico', '1medio', '2medio', '3medio', '4medio'],
        department: 'Matemática Avanzada',
        isActive: true,
        isAdmin: true
    }
];

export const mockStudentProfiles: StudentProfile[] = [
    {
        id: 'STU-001',
        firstName: 'Mateo',
        lastName: 'González Rojas',
        grade: '1° Básico',
        birthDate: '2018-05-10',
        applicationId: 'APP-001',
        examResults: [],
        overallEvaluation: 'Estudiante con gran potencial académico'
    },
    {
        id: 'STU-002',
        firstName: 'Sofía',
        lastName: 'Martínez López',
        grade: 'Kínder',
        birthDate: '2017-09-22',
        applicationId: 'APP-002',
        examResults: [],
        overallEvaluation: 'Excelente comprensión y participación'
    },
    {
        id: 'STU-003',
        firstName: 'Lucas',
        lastName: 'Silva Castro',
        grade: 'Pre-Kínder',
        birthDate: '2019-01-30',
        applicationId: 'APP-003',
        examResults: []
    },
    {
        id: 'STU-004',
        firstName: 'Isabella',
        lastName: 'Fernández Soto',
        grade: '2° Básico',
        birthDate: '2016-03-14',
        applicationId: 'APP-004',
        examResults: []
    },
    {
        id: 'STU-005',
        firstName: 'Benjamín',
        lastName: 'Vidal Morales',
        grade: '3° Básico',
        birthDate: '2015-11-05',
        applicationId: 'APP-005',
        examResults: []
    },
    {
        id: 'STU-006',
        firstName: 'Valentina',
        lastName: 'Ramírez Peña',
        grade: '5° Básico',
        birthDate: '2013-07-18',
        applicationId: 'APP-006',
        examResults: []
    },
    {
        id: 'STU-007',
        firstName: 'Diego',
        lastName: 'Cortés Mendoza',
        grade: '7° Básico',
        birthDate: '2011-12-03',
        applicationId: 'APP-007',
        examResults: []
    },
    {
        id: 'STU-008',
        firstName: 'Camila',
        lastName: 'Espinoza Torres',
        grade: '1° Medio',
        birthDate: '2009-04-25',
        applicationId: 'APP-008',
        examResults: []
    },
    {
        id: 'STU-009',
        firstName: 'Nicolás',
        lastName: 'Mendoza Silva',
        grade: '8° Básico',
        birthDate: '2010-08-12',
        applicationId: 'APP-009',
        examResults: []
    },
    {
        id: 'STU-010',
        firstName: 'Martina',
        lastName: 'Pérez Vargas',
        grade: '2° Medio',
        birthDate: '2008-03-20',
        applicationId: 'APP-010',
        examResults: []
    },
    {
        id: 'STU-011',
        firstName: 'Sebastián',
        lastName: 'Morales Díaz',
        grade: '3° Medio',
        birthDate: '2007-11-15',
        applicationId: 'APP-011',
        examResults: []
    },
    {
        id: 'STU-012',
        firstName: 'Fernanda',
        lastName: 'Castillo Ruiz',
        grade: '4° Medio',
        birthDate: '2006-06-08',
        applicationId: 'APP-012',
        examResults: []
    }
];

export const mockAreaScores: AreaScore[] = [
    // Para Matemática
    {
        area: 'Números y Operaciones',
        score: 18,
        maxScore: 20,
        percentage: 90,
        comments: 'Excelente manejo de operaciones básicas'
    },
    {
        area: 'Geometría',
        score: 7,
        maxScore: 10,
        percentage: 70,
        comments: 'Necesita reforzar conceptos de área y perímetro'
    },
    
    // Para Lenguaje
    {
        area: 'Comprensión Lectora',
        score: 22,
        maxScore: 25,
        percentage: 88,
        comments: 'Muy buena comprensión de textos narrativos'
    },
    {
        area: 'Gramática y Ortografía',
        score: 15,
        maxScore: 20,
        percentage: 75,
        comments: 'Debe trabajar en reglas de acentuación'
    },
    
    // Para Inglés
    {
        area: 'Grammar',
        score: 16,
        maxScore: 20,
        percentage: 80,
        comments: 'Good understanding of basic structures'
    },
    {
        area: 'Vocabulary',
        score: 14,
        maxScore: 15,
        percentage: 93,
        comments: 'Excellent vocabulary range for the level'
    }
];

export const mockExamEvaluations: ExamEvaluation[] = [
    {
        id: 'EVAL-001',
        examId: 'EXAM-001',
        professorId: 'PROF-001',
        evaluatedAt: '2024-08-16T14:30:00Z',
        
        // Calificación
        score: 25,
        maxScore: 30,
        percentage: 83.3,
        grade: '6.2',
        
        // Evaluación cualitativa
        strengths: [
            'Excelente comprensión de conceptos numéricos',
            'Estrategias de resolución de problemas bien desarrolladas',
            'Presentación ordenada del trabajo'
        ],
        weaknesses: [
            'Dificultades con fracciones mixtas',
            'Algunos errores de cálculo por apresuramiento',
            'Necesita mayor precisión en diagramas geométricos'
        ],
        examAdaptation: 'El estudiante se adaptó muy bien al formato del examen. Completó todas las secciones dentro del tiempo establecido y mostró una metodología organizada para abordar los problemas.',
        behaviorObservations: 'Comportamiento ejemplar durante todo el examen. Mantuvo la concentración, siguió las instrucciones correctamente y pidió aclaraciones de manera apropiada cuando fue necesario.',
        generalComments: 'Mateo demuestra un sólido foundation en matemática básica. Su capacidad de razonamiento lógico es destacable para su edad. Con práctica adicional en áreas específicas, puede alcanzar un nivel excelente.',
        improvementAreas: [
            'Práctica adicional con fracciones y decimales',
            'Ejercicios de precisión en cálculos básicos',
            'Desarrollo de habilidades de representación gráfica'
        ],
        
        areaScores: [
            {
                area: 'Números y Operaciones',
                score: 18,
                maxScore: 20,
                percentage: 90,
                comments: 'Excelente manejo de operaciones básicas'
            },
            {
                area: 'Geometría',
                score: 7,
                maxScore: 10,
                percentage: 70,
                comments: 'Necesita reforzar conceptos de área y perímetro'
            }
        ],
        
        recommendations: 'Recomiendo que Mateo practique ejercicios de fracciones mixtas y desarrolle mayor precisión en sus cálculos. Es un excelente candidato para el programa académico regular con apoyo adicional en geometría.',
        requiresFollowUp: false,
        followUpNotes: 'Monitorear progreso en geometría durante el primer trimestre'
    },
    {
        id: 'EVAL-002',
        examId: 'EXAM-002',
        professorId: 'PROF-002',
        evaluatedAt: '2024-08-16T15:45:00Z',
        
        score: 28,
        maxScore: 35,
        percentage: 80,
        grade: '5.8',
        
        strengths: [
            'Excelente comprensión lectora',
            'Vocabulario amplio para su edad',
            'Capacidad de síntesis destacable'
        ],
        weaknesses: [
            'Errores frecuentes en acentuación',
            'Redacción algo básica para el nivel',
            'Dificultades con análisis morfológico'
        ],
        examAdaptation: 'Sofía mostró una adaptación excelente al examen. Gestionó bien el tiempo y demostró estrategias efectivas de lectura comprensiva.',
        behaviorObservations: 'Actitud muy positiva y concentrada. Se tomó el tiempo necesario para reflexionar antes de responder. Demostró confianza en sus respuestas.',
        generalComments: 'Sofía tiene una base sólida en lenguaje y comunicación. Su comprensión lectora es superior al promedio de su grupo etario. Con trabajo focalizad en ortografía y redacción, puede destacar significativamente.',
        improvementAreas: [
            'Reglas de acentuación y ortografía',
            'Técnicas de redacción y estructura textual',
            'Análisis gramatical básico'
        ],
        
        areaScores: [
            {
                area: 'Comprensión Lectora',
                score: 22,
                maxScore: 25,
                percentage: 88,
                comments: 'Muy buena comprensión de textos narrativos'
            },
            {
                area: 'Gramática y Ortografía',
                score: 6,
                maxScore: 10,
                percentage: 60,
                comments: 'Debe trabajar en reglas de acentuación'
            }
        ],
        
        recommendations: 'Sofía tiene gran potencial en el área de lenguaje. Recomiendo incluirla en actividades de lectura avanzada y proporcionar ejercicios específicos de ortografía.',
        requiresFollowUp: true,
        followUpNotes: 'Programar sesión de refuerzo en ortografía después de dos semanas'
    }
];

export const mockStudentExams: StudentExam[] = [
    {
        id: 'EXAM-001',
        studentId: 'STU-001',
        subjectId: 'MATH',
        scheduleId: 'SCH-001',
        status: ExamStatus.COMPLETED,
        score: 25,
        completedAt: '2024-08-15T11:30:00Z',
        timeSpent: 85,
        evaluation: mockExamEvaluations[0]
    },
    {
        id: 'EXAM-002',
        studentId: 'STU-002',
        subjectId: 'SPANISH',
        scheduleId: 'SCH-001',
        status: ExamStatus.COMPLETED,
        score: 28,
        completedAt: '2024-08-15T11:45:00Z',
        timeSpent: 82,
        evaluation: mockExamEvaluations[1]
    },
    {
        id: 'EXAM-003',
        studentId: 'STU-001',
        subjectId: 'SPANISH',
        scheduleId: 'SCH-002',
        status: ExamStatus.COMPLETED,
        score: 30,
        completedAt: '2024-08-16T10:20:00Z',
        timeSpent: 78
    },
    {
        id: 'EXAM-004',
        studentId: 'STU-003',
        subjectId: 'ENGLISH',
        scheduleId: 'SCH-004',
        status: ExamStatus.COMPLETED,
        score: 18,
        completedAt: '2024-08-17T15:15:00Z',
        timeSpent: 65
    },
    {
        id: 'EXAM-005',
        studentId: 'STU-004',
        subjectId: 'MATH',
        scheduleId: 'SCH-001',
        status: ExamStatus.IN_PROGRESS
    },
    {
        id: 'EXAM-006',
        studentId: 'STU-005',
        subjectId: 'SPANISH',
        scheduleId: 'SCH-002',
        status: ExamStatus.SCHEDULED
    },
    // Exámenes para Jorge Gangale - Matemática 8° Básico a IV° Medio
    {
        id: 'EXAM-007',
        studentId: 'STU-009', // Nicolás - 8° Básico
        subjectId: 'MATH',
        scheduleId: 'SCH-003',
        status: ExamStatus.COMPLETED,
        score: 22,
        completedAt: '2024-08-20T09:30:00Z',
        timeSpent: 95
        // Sin evaluación - para que aparezca como pendiente
    },
    {
        id: 'EXAM-008',
        studentId: 'STU-008', // Camila - 1° Medio
        subjectId: 'MATH',
        scheduleId: 'SCH-003',
        status: ExamStatus.COMPLETED,
        score: 28,
        completedAt: '2024-08-20T10:15:00Z',
        timeSpent: 87
        // Sin evaluación - para que aparezca como pendiente
    },
    {
        id: 'EXAM-009',
        studentId: 'STU-010', // Martina - 2° Medio
        subjectId: 'MATH',
        scheduleId: 'SCH-003',
        status: ExamStatus.COMPLETED,
        score: 26,
        completedAt: '2024-08-20T11:00:00Z',
        timeSpent: 102
        // Sin evaluación - para que aparezca como pendiente
    },
    {
        id: 'EXAM-010',
        studentId: 'STU-011', // Sebastián - 3° Medio
        subjectId: 'MATH',
        scheduleId: 'SCH-004',
        status: ExamStatus.COMPLETED,
        score: 30,
        completedAt: '2024-08-21T08:45:00Z',
        timeSpent: 110
        // Sin evaluación - para que aparezca como pendiente
    },
    {
        id: 'EXAM-011',
        studentId: 'STU-012', // Fernanda - 4° Medio
        subjectId: 'MATH',
        scheduleId: 'SCH-004',
        status: ExamStatus.COMPLETED,
        score: 24,
        completedAt: '2024-08-21T09:30:00Z',
        timeSpent: 118
        // Sin evaluación - para que aparezca como pendiente
    }
];

// Función para mapear grados a códigos de nivel
const mapGradeToLevelCode = (grade: string): string => {
    const gradeMapping: { [key: string]: string } = {
        'Pre-Kínder': 'prekinder',
        'Kínder': 'kinder',
        '1° Básico': '1basico',
        '2° Básico': '2basico',
        '3° Básico': '3basico',
        '4° Básico': '4basico',
        '5° Básico': '5basico',
        '6° Básico': '6basico',
        '7° Básico': '7basico',
        '8° Básico': '8basico',
        '1° Medio': '1medio',
        '2° Medio': '2medio',
        '3° Medio': '3medio',
        '4° Medio': '4medio'
    };
    return gradeMapping[grade] || grade.toLowerCase();
};

// Función para obtener estudiantes por profesor (filtrado por niveles asignados)
export const getStudentsByProfessor = (professorId: string): StudentProfile[] => {
    const professor = mockProfessors.find(p => p.id === professorId);
    if (!professor) return [];

    return mockStudentProfiles.filter(student => {
        const studentLevelCode = mapGradeToLevelCode(student.grade);
        
        // Verificar si el profesor tiene asignado el nivel del estudiante
        const hasAssignedLevel = professor.assignedGrades.includes(studentLevelCode);
        
        // Verificar si el estudiante tiene exámenes en las materias del profesor
        const hasRelevantExams = student.examResults.some(exam => 
            professor.subjects.includes(exam.subjectId)
        );
        
        return hasAssignedLevel && hasRelevantExams;
    });
};

// Función para obtener exámenes pendientes de evaluación por profesor
export const getPendingExamsByProfessor = (professorId: string): StudentExam[] => {
    const professor = mockProfessors.find(p => p.id === professorId);
    if (!professor) return [];

    return mockStudentExams.filter(exam => {
        // Verificar si es una materia del profesor
        if (!professor.subjects.includes(exam.subjectId)) return false;
        
        // Verificar si el examen está completado pero sin evaluación
        if (exam.status !== ExamStatus.COMPLETED || exam.evaluation) return false;
        
        // Verificar si el estudiante está en un nivel asignado al profesor
        const student = mockStudentProfiles.find(s => s.id === exam.studentId);
        if (!student) return false;
        
        const studentLevelCode = mapGradeToLevelCode(student.grade);
        return professor.assignedGrades.includes(studentLevelCode);
    });
};

// Función para obtener estadísticas del profesor
export const getProfessorStats = (professorId: string) => {
    const professor = mockProfessors.find(p => p.id === professorId);
    if (!professor) return null;

    const relevantExams = mockStudentExams.filter(exam => 
        professor.subjects.includes(exam.subjectId)
    );

    const completedExams = relevantExams.filter(exam => exam.status === ExamStatus.COMPLETED);
    const evaluatedExams = completedExams.filter(exam => exam.evaluation);
    const pendingEvaluations = completedExams.filter(exam => !exam.evaluation);

    const averageScore = evaluatedExams.length > 0 
        ? evaluatedExams.reduce((sum, exam) => sum + (exam.evaluation?.percentage || 0), 0) / evaluatedExams.length
        : 0;

    return {
        totalExams: relevantExams.length,
        completedExams: completedExams.length,
        evaluatedExams: evaluatedExams.length,
        pendingEvaluations: pendingEvaluations.length,
        averageScore: Math.round(averageScore * 10) / 10,
        subjects: professor.subjects
    };
};