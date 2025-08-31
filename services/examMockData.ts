import { ExamSubject, ExamSchedule, StudyMaterial, StudentExam, ExamStatus } from '../types';

export const examSchedules: ExamSchedule[] = [
    {
        id: 'SCH-001',
        date: '2024-08-15',
        startTime: '09:00',
        endTime: '10:30',
        location: 'Sala 5BN',
        maxCapacity: 30,
        currentEnrollment: 25
    },
    {
        id: 'SCH-002',
        date: '2024-08-15',
        startTime: '11:00',
        endTime: '12:30',
        location: 'Sala 6AT',
        maxCapacity: 30,
        currentEnrollment: 28
    },
    {
        id: 'SCH-003',
        date: '2024-08-16',
        startTime: '09:00',
        endTime: '10:30',
        location: 'Sala 5BN',
        maxCapacity: 30,
        currentEnrollment: 22
    },
    {
        id: 'SCH-004',
        date: '2024-08-17',
        startTime: '14:00',
        endTime: '15:30',
        location: 'Sala 4MT',
        maxCapacity: 25,
        currentEnrollment: 20
    },
    {
        id: 'SCH-005',
        date: '2024-08-17',
        startTime: '16:00',
        endTime: '17:30',
        location: 'Sala 3NZ',
        maxCapacity: 25,
        currentEnrollment: 18
    }
];

export const studyMaterials: StudyMaterial[] = [
    // Matemática
    {
        id: 'MAT-001',
        title: 'Guía de Matemática - Números y Operaciones',
        description: 'Conceptos básicos de números enteros, fracciones y operaciones fundamentales.',
        type: 'pdf',
        url: '/materials/matematica-numeros.pdf',
        downloadable: true
    },
    {
        id: 'MAT-002',
        title: 'Video Tutorial - Resolución de Problemas',
        description: 'Estrategias para resolver problemas matemáticos paso a paso.',
        type: 'video',
        url: '/materials/matematica-problemas.mp4',
        downloadable: false
    },
    {
        id: 'MAT-003',
        title: 'Ejercicios de Geometría Básica',
        description: 'Ejercicios prácticos de áreas, perímetros y figuras geométricas.',
        type: 'pdf',
        url: '/materials/matematica-geometria.pdf',
        downloadable: true
    },
    
    // Lenguaje
    {
        id: 'LEN-001',
        title: 'Guía de Comprensión Lectora',
        description: 'Técnicas para mejorar la comprensión de textos narrativos y expositivos.',
        type: 'pdf',
        url: '/materials/lenguaje-comprension.pdf',
        downloadable: true
    },
    {
        id: 'LEN-002',
        title: 'Reglas de Ortografía y Gramática',
        description: 'Manual con las principales reglas ortográficas y gramaticales.',
        type: 'document',
        url: '/materials/lenguaje-ortografia.docx',
        downloadable: true
    },
    {
        id: 'LEN-003',
        title: 'Vocabulario Esencial',
        description: 'Lista de palabras y expresiones importantes para el nivel.',
        type: 'pdf',
        url: '/materials/lenguaje-vocabulario.pdf',
        downloadable: true
    },
    
    // Inglés
    {
        id: 'ENG-001',
        title: 'Basic English Grammar',
        description: 'Fundamental grammar rules and sentence structures.',
        type: 'pdf',
        url: '/materials/english-grammar.pdf',
        downloadable: true
    },
    {
        id: 'ENG-002',
        title: 'Audio Practice - Listening Skills',
        description: 'Audio exercises to improve listening comprehension.',
        type: 'video',
        url: '/materials/english-listening.mp3',
        downloadable: false
    },
    {
        id: 'ENG-003',
        title: 'Essential Vocabulary List',
        description: 'Common words and phrases for basic communication.',
        type: 'pdf',
        url: '/materials/english-vocabulary.pdf',
        downloadable: true
    }
];

// Matemática por niveles
const mathTopicsByLevel = {
    prekinder: [
        'Números del 1 al 10',
        'Formas geométricas básicas',
        'Conceptos de tamaño y cantidad',
        'Patrones simples',
        'Colores y clasificación'
    ],
    kinder: [
        'Números del 1 al 20',
        'Suma y resta básica',
        'Figuras geométricas',
        'Medidas y comparación',
        'Patrones y secuencias'
    ],
    basica_1_4: [
        'Números hasta 1000',
        'Operaciones básicas (+, -, ×, ÷)',
        'Fracciones simples',
        'Geometría básica (perímetro, área)',
        'Resolución de problemas',
        'Sistema métrico'
    ],
    basica_5_8: [
        'Números enteros y decimales',
        'Fracciones y porcentajes',
        'Geometría (ángulos, triángulos)',
        'Ecuaciones de primer grado',
        'Proporciones y regla de tres',
        'Estadística básica'
    ],
    media_1_2: [
        'Álgebra (ecuaciones y sistemas)',
        'Geometría analítica',
        'Funciones lineales y cuadráticas',
        'Trigonometría básica',
        'Probabilidades',
        'Logaritmos y exponenciales'
    ],
    media_3_4: [
        'Cálculo diferencial básico',
        'Funciones complejas',
        'Trigonometría avanzada',
        'Estadística y probabilidades',
        'Geometría del espacio',
        'Límites y derivadas'
    ]
};

const languageTopicsByLevel = {
    prekinder: [
        'Reconocimiento de letras',
        'Sonidos y fonemas',
        'Vocabulario básico',
        'Comprensión oral',
        'Expresión oral simple'
    ],
    kinder: [
        'Lectura de palabras simples',
        'Escritura básica',
        'Comprensión de textos cortos',
        'Vocabulario ampliado',
        'Narración oral'
    ],
    basica_1_4: [
        'Comprensión lectora',
        'Gramática básica',
        'Ortografía y acentuación',
        'Producción de textos',
        'Vocabulario temático',
        'Análisis de cuentos'
    ],
    basica_5_8: [
        'Comprensión de textos complejos',
        'Gramática avanzada',
        'Ortografía y puntuación',
        'Ensayos y composición',
        'Literatura chilena',
        'Análisis crítico'
    ],
    media_1_2: [
        'Literatura universal',
        'Análisis de textos',
        'Ensayo argumentativo',
        'Comunicación oral formal',
        'Medios de comunicación',
        'Técnicas de estudio'
    ],
    media_3_4: [
        'Literatura contemporánea',
        'Análisis crítico avanzado',
        'Discurso académico',
        'Investigación y fuentes',
        'Comunicación profesional',
        'Preparación PSU/PAES'
    ]
};

const englishTopicsByLevel = {
    prekinder: [
        'Basic vocabulary (colors, numbers)',
        'Simple greetings',
        'Family members',
        'Basic commands',
        'Songs and rhymes'
    ],
    kinder: [
        'Alphabet recognition',
        'Simple words and phrases',
        'Basic conversations',
        'Common objects',
        'Simple instructions'
    ],
    basica_1_4: [
        'Basic grammar structures',
        'Present tense',
        'Essential vocabulary',
        'Simple reading',
        'Basic writing',
        'Pronunciation'
    ],
    basica_5_8: [
        'Past and future tenses',
        'Question formation',
        'Reading comprehension',
        'Writing paragraphs',
        'Listening skills',
        'Cultural topics'
    ],
    media_1_2: [
        'Complex grammar',
        'Advanced vocabulary',
        'Essay writing',
        'Literature basics',
        'Formal presentations',
        'Cambridge level preparation'
    ],
    media_3_4: [
        'Academic English',
        'Critical analysis',
        'Research skills',
        'Professional communication',
        'Advanced literature',
        'Standardized test prep'
    ]
};

export const examSubjects: ExamSubject[] = [
    {
        id: 'MATH',
        name: 'Matemática',
        description: 'Evaluación de conceptos matemáticos fundamentales adaptada según el nivel educativo del estudiante.',
        duration: 80,
        totalQuestions: 30,
        passingScore: 60,
        instructions: [
            'Lee cuidadosamente cada pregunta antes de responder.',
            'Puedes usar calculadora para operaciones básicas (según nivel).',
            'Muestra tu trabajo en los problemas que lo requieran.',
            'Revisa tus respuestas antes de entregar.',
            'Tienes 1 hora y 20 minutos para completar el examen.'
        ],
        studyMaterials: studyMaterials.filter(material => material.id.startsWith('MAT')),
        schedules: [examSchedules[0], examSchedules[1], examSchedules[2]],
        topics: mathTopicsByLevel.basica_1_4 // Default, se ajusta según el nivel del estudiante
    },
    {
        id: 'SPANISH',
        name: 'Lenguaje y Comunicación',
        description: 'Evaluación de comprensión lectora, gramática, ortografía y expresión escrita en español adaptada por nivel.',
        duration: 80,
        totalQuestions: 35,
        passingScore: 60,
        instructions: [
            'Lee los textos con atención antes de responder.',
            'Cuida la ortografía y gramática en tus respuestas.',
            'En las preguntas de desarrollo, estructura bien tus ideas.',
            'Usa letra clara y legible.',
            'Administra bien tu tiempo entre las diferentes secciones.'
        ],
        studyMaterials: studyMaterials.filter(material => material.id.startsWith('LEN')),
        schedules: [examSchedules[0], examSchedules[1], examSchedules[2]],
        topics: languageTopicsByLevel.basica_1_4 // Default, se ajusta según el nivel del estudiante
    },
    {
        id: 'ENGLISH',
        name: 'Inglés',
        description: 'Evaluación de conocimientos de inglés adaptada según el nivel educativo del estudiante.',
        duration: 80,
        totalQuestions: 25,
        passingScore: 60,
        instructions: [
            'All questions are in English, answer in English.',
            'Read each question carefully.',
            'Choose the best answer for multiple choice questions.',
            'For writing sections, use proper grammar and spelling.',
            'You have 1 hour and 20 minutes to complete the exam.'
        ],
        studyMaterials: studyMaterials.filter(material => material.id.startsWith('ENG')),
        schedules: [examSchedules[3], examSchedules[4]],
        topics: englishTopicsByLevel.basica_1_4 // Default, se ajusta según el nivel del estudiante
    }
];

export const mockStudentExams: StudentExam[] = [
    {
        id: 'EXAM-001',
        studentId: 'STU-001',
        subjectId: 'MATH',
        scheduleId: 'SCH-001',
        status: ExamStatus.SCHEDULED
    },
    {
        id: 'EXAM-002',
        studentId: 'STU-001',
        subjectId: 'SPANISH',
        scheduleId: 'SCH-001',
        status: ExamStatus.SCHEDULED
    },
    {
        id: 'EXAM-003',
        studentId: 'STU-001',
        subjectId: 'ENGLISH',
        scheduleId: 'SCH-004',
        status: ExamStatus.NOT_STARTED
    }
];

// Función para obtener temas según nivel educativo
export const getTopicsByLevel = (subjectId: string, level: string) => {
    const levelKey = normalizeLevel(level);
    
    switch (subjectId) {
        case 'MATH':
            return mathTopicsByLevel[levelKey as keyof typeof mathTopicsByLevel] || mathTopicsByLevel.basica_1_4;
        case 'SPANISH':
            return languageTopicsByLevel[levelKey as keyof typeof languageTopicsByLevel] || languageTopicsByLevel.basica_1_4;
        case 'ENGLISH':
            return englishTopicsByLevel[levelKey as keyof typeof englishTopicsByLevel] || englishTopicsByLevel.basica_1_4;
        default:
            return [];
    }
};

// Función auxiliar para normalizar nombres de niveles
const normalizeLevel = (level: string): string => {
    const levelMap: { [key: string]: string } = {
        'playgroup': 'prekinder',
        'pre-kínder': 'prekinder',
        'prekínder': 'prekinder',
        'kínder': 'kinder',
        '1° básico': 'basica_1_4',
        '2° básico': 'basica_1_4',
        '3° básico': 'basica_1_4',
        '4° básico': 'basica_1_4',
        '5° básico': 'basica_5_8',
        '6° básico': 'basica_5_8',
        '7° básico': 'basica_5_8',
        '8° básico': 'basica_5_8',
        '1° medio': 'media_1_2',
        'i medio': 'media_1_2',
        '2° medio': 'media_1_2',
        'ii medio': 'media_1_2',
        '3° medio': 'media_3_4',
        'iii medio': 'media_3_4',
        '4° medio': 'media_3_4',
        'iv medio': 'media_3_4'
    };

    return levelMap[level.toLowerCase()] || 'basica_1_4';
};

// Niveles educativos disponibles
export const educationalLevels = [
    { value: 'playgroup', label: 'Playgroup', category: 'Preescolar' },
    { value: 'prekinder', label: 'Pre-Kínder', category: 'Preescolar' },
    { value: 'kinder', label: 'Kínder', category: 'Preescolar' },
    { value: '1basico', label: '1° Básico', category: 'Enseñanza Básica' },
    { value: '2basico', label: '2° Básico', category: 'Enseñanza Básica' },
    { value: '3basico', label: '3° Básico', category: 'Enseñanza Básica' },
    { value: '4basico', label: '4° Básico', category: 'Enseñanza Básica' },
    { value: '5basico', label: '5° Básico', category: 'Enseñanza Básica' },
    { value: '6basico', label: '6° Básico', category: 'Enseñanza Básica' },
    { value: '7basico', label: '7° Básico', category: 'Enseñanza Básica' },
    { value: '8basico', label: '8° Básico', category: 'Enseñanza Básica' },
    { value: '1medio', label: 'I Medio', category: 'Enseñanza Media' },
    { value: '2medio', label: 'II Medio', category: 'Enseñanza Media' },
    { value: '3medio', label: 'III Medio', category: 'Enseñanza Media' },
    { value: '4medio', label: 'IV Medio', category: 'Enseñanza Media' }
];