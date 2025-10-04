import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Logger } from '../src/utils/logger';import Card from '../components/ui/Card';
import { Logger } from '../src/utils/logger';import Button from '../components/ui/Button';
import { Logger } from '../src/utils/logger';import Badge from '../components/ui/Badge';
import { Logger } from '../src/utils/logger';import Table from '../components/ui/Table';
import { Logger } from '../src/utils/logger';import { 
import { Logger } from '../src/utils/logger';    DashboardIcon, 
    FileTextIcon, 
    UsersIcon, 
    BookOpenIcon,
    CheckCircleIcon,
    ClockIcon,
    BarChartIcon
} from '../components/icons/Icons';
import { 
import { Logger } from '../src/utils/logger';    mockProfessors, 
    getPendingExamsByProfessor, 
    getProfessorStats,
    mockStudentExams,
    mockStudentProfiles
} from '../services/staticData';
import { ExamStatus, StudentExam, StudentProfile } from '../types';
import { Logger } from '../src/utils/logger';import { Link, useNavigate } from 'react-router-dom';
import { Logger } from '../src/utils/logger';import { professorEvaluationService, ProfessorEvaluation, ProfessorEvaluationStats } from '../services/professorEvaluationService';
import { Logger } from '../src/utils/logger';import { professorAuthService } from '../services/professorAuthService';
import { Logger } from '../src/utils/logger';import { EvaluationStatus, EvaluationType } from '../types/evaluation';
import { Logger } from '../src/utils/logger';import { FiRefreshCw, FiBarChart2 } from 'react-icons/fi';
import { Logger } from '../src/utils/logger';
const baseSections = [
    { key: 'dashboard', label: 'Dashboard General', icon: DashboardIcon },
    { key: 'evaluaciones', label: 'Evaluaciones Pendientes', icon: ClockIcon },
    { key: 'estudiantes', label: 'Mis Estudiantes', icon: UsersIcon },
    { key: 'reportes', label: 'Reportes y Estadísticas', icon: FileTextIcon },
    { key: 'configuracion', label: 'Configuración', icon: BookOpenIcon }
];

const ProfessorDashboard: React.FC = () => {
    const [activeSection, setActiveSection] = useState('evaluaciones'); // Cambiado de 'dashboard' a 'evaluaciones'
    const navigate = useNavigate();
    
    Logger.info('🚀 ProfessorDashboard renderizándose...');
    Logger.info('📋 activeSection inicial:', activeSection);
    
    // Obtener profesor actual del localStorage
    const [currentProfessor, setCurrentProfessor] = useState(() => {
        const storedProfessor = localStorage.getItem('currentProfessor');
        Logger.info('🔍 localStorage.getItem("currentProfessor"):', storedProfessor);
        const parsed = storedProfessor ? JSON.parse(storedProfessor) : null;
        Logger.info('🔍 currentProfessor parseado:', parsed);
        return parsed;
    });

    // Usar useRef para estabilizar la referencia y evitar re-renders infinitos
    const currentProfessorRef = useRef(currentProfessor);
    currentProfessorRef.current = currentProfessor;

    // Estado para las evaluaciones reales
    const [evaluations, setEvaluations] = useState<ProfessorEvaluation[]>([]);
    const [evaluationStats, setEvaluationStats] = useState<ProfessorEvaluationStats>({
        total: 0,
        pending: 0,
        inProgress: 0,
        completed: 0,
        averageScore: 0
    });
    const [isLoading, setIsLoading] = useState(true);
    

    // Cargar evaluaciones del profesor - SOLO UNA VEZ al montar
    // Cargar datos actualizados del profesor desde el backend
    useEffect(() => {
        const updateProfessorData = async () => {
            try {
                Logger.info('🔄 Llamando a getCurrentProfessor()...');
                const professorData = await professorAuthService.getCurrentProfessor();
                Logger.info('📦 Datos recibidos del backend:', professorData);

                if (professorData) {
                    // Actualizar localStorage con los datos frescos del backend
                    const updatedProfessor = {
                        ...currentProfessor,
                        id: professorData.id,
                        subject: professorData.subject,
                        firstName: professorData.firstName,
                        lastName: professorData.lastName,
                        email: professorData.email,
                        role: professorData.role
                    };
                    localStorage.setItem('currentProfessor', JSON.stringify(updatedProfessor));
                    setCurrentProfessor(updatedProfessor);
                    Logger.info('✅ Datos del profesor actualizados desde backend:', updatedProfessor);
                    Logger.info('✅ Subject guardado:', updatedProfessor.subject);
                } else {
                    Logger.warn('⚠️ getCurrentProfessor() retornó null');
                }
            } catch (error) {
                Logger.error('❌ Error actualizando datos del profesor:', error);
            }
        };

        updateProfessorData();
    }, []); // Solo al montar el componente

    useEffect(() => {
        Logger.info('🔄 useEffect ejecutándose...');
        Logger.info('👤 currentProfessor:', currentProfessor);

        const loadEvaluations = async () => {
            if (!currentProfessor) {
                Logger.info('❌ No hay currentProfessor, saltando loadEvaluations');
                return;
            }

            try {
                setIsLoading(true);
                Logger.info('🔄 Cargando evaluaciones del profesor...');
                Logger.info('🆔 ID del profesor:', currentProfessor.id);

                const [evaluationsData, statsData] = await Promise.all([
                    professorEvaluationService.getMyEvaluations(),
                    professorEvaluationService.getMyEvaluationStats()
                ]);

                Logger.info('✅ Evaluaciones obtenidas del servicio:', evaluationsData);
                Logger.info('📊 Stats obtenidos del servicio:', statsData);

                setEvaluations(evaluationsData);
                setEvaluationStats(statsData);

                Logger.info('✅ Estado actualizado - evaluations:', evaluationsData.length);
                Logger.info('✅ Estado actualizado - evaluationStats:', statsData);

            } catch (error: any) {
                Logger.error('❌ Error cargando evaluaciones:', error);

                // Si no hay evaluaciones asignadas, mostrar estado vacío
                if (error.message.includes('No se encontraron evaluaciones')) {
                    setEvaluations([]);
                    setEvaluationStats({
                        total: 0,
                        pending: 0,
                        inProgress: 0,
                        completed: 0,
                        averageScore: 0
                    });
                } else {
                    // Para otros errores, mostrar notificación
                    Logger.error('Error específico:', error.message);
                }
            } finally {
                setIsLoading(false);
                Logger.info('✅ Loading completado');
            }
        };

        loadEvaluations();
    }, []); // ✅ DEPENDENCIAS VACÍAS - SOLO SE EJECUTA AL MONTAR


    // Datos mock para compatibilidad (se pueden eliminar después)
    const stats = useMemo(() => {
        return getProfessorStats(currentProfessor?.id);
    }, [currentProfessor?.id]);

    const pendingExams = useMemo(() => {
        return getPendingExamsByProfessor(currentProfessor?.id);
    }, [currentProfessor?.id]);

    const handleLogout = () => {
        localStorage.removeItem('currentProfessor');
        navigate('/profesor/login');
    };

    // Determinar si mostrar sección de administrador
    const sections = currentProfessor?.isAdmin 
        ? [...baseSections, { key: 'admin', label: 'Panel Administrador', icon: UsersIcon }]
        : baseSections;

    const getSubjectName = (subjectId: string) => {
        const names: { [key: string]: string } = {
            'MATHEMATICS': 'Matemática',
            'MATH': 'Matemática',
            'LANGUAGE': 'Lenguaje y Comunicación',
            'SPANISH': 'Lenguaje',
            'ENGLISH': 'Inglés',
            'GENERAL': 'General',
            'ALL_SUBJECTS': 'Todas las Asignaturas'
        };
        return names[subjectId] || subjectId;
    };

    const getStatusBadge = (status: ExamStatus) => {
        switch (status) {
            case ExamStatus.COMPLETED:
                return <Badge variant="success">Completado</Badge>;
            case ExamStatus.IN_PROGRESS:
                return <Badge variant="warning">En Progreso</Badge>;
            case ExamStatus.SCHEDULED:
                return <Badge variant="info">Programado</Badge>;
            default:
                return <Badge variant="neutral">{status}</Badge>;
        }
    };

    const getEvaluationStatusBadge = (status: EvaluationStatus) => {
        switch (status) {
            case EvaluationStatus.COMPLETED:
                return <Badge variant="success">Completada</Badge>;
            case EvaluationStatus.IN_PROGRESS:
                return <Badge variant="warning">En Progreso</Badge>;
            case EvaluationStatus.PENDING:
                return <Badge variant="info">Pendiente</Badge>;
            default:
                return <Badge variant="neutral">{status}</Badge>;
        }
    };

    const getEvaluationTypeLabel = (type: EvaluationType) => {
        const labels: { [key in EvaluationType]: string } = {
            [EvaluationType.MATHEMATICS_EXAM]: 'Examen de Matemáticas',
            [EvaluationType.LANGUAGE_EXAM]: 'Examen de Lenguaje',
            [EvaluationType.ENGLISH_EXAM]: 'Examen de Inglés',
            [EvaluationType.PSYCHOLOGICAL_INTERVIEW]: 'Entrevista Psicológica',
            [EvaluationType.CYCLE_DIRECTOR_INTERVIEW]: 'Entrevista Director de Ciclo',
            [EvaluationType.CYCLE_DIRECTOR_REPORT]: 'Informe Director de Ciclo'
        };
        return labels[type] || type;
    };

    const renderDashboard = () => (
        <div className="space-y-6">
            {/* Welcome Card */}
            <Card className="p-6 bg-gradient-to-r from-azul-monte-tabor to-blue-700 text-blanco-pureza">
                <h1 className="text-2xl font-bold mb-2">
                    Bienvenido/a, {currentProfessor?.firstName} {currentProfessor?.lastName}
                </h1>
                <p className="text-blue-100">
                    Profesor/a de {currentProfessor?.subject ? getSubjectName(currentProfessor.subject) : 'Asignatura no especificada'}
                </p>
                <p className="text-blue-100 text-sm mt-1">
                    Rol: {currentProfessor?.role === 'TEACHER' ? 'Docente' : currentProfessor?.role}
                </p>
            </Card>

            {/* Stats Grid - Usando datos reales */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card className="p-6 text-center">
                    <FileTextIcon className="w-8 h-8 text-azul-monte-tabor mx-auto mb-3" />
                    <div className="text-2xl font-bold text-azul-monte-tabor">{evaluationStats.total}</div>
                    <div className="text-sm text-gris-piedra">Total Evaluaciones</div>
                </Card>
                
                <Card className="p-6 text-center">
                    <CheckCircleIcon className="w-8 h-8 text-verde-esperanza mx-auto mb-3" />
                    <div className="text-2xl font-bold text-verde-esperanza">{evaluationStats.completed}</div>
                    <div className="text-sm text-gris-piedra">Completadas</div>
                </Card>
                
                <Card className="p-6 text-center">
                    <ClockIcon className="w-8 h-8 text-dorado-nazaret mx-auto mb-3" />
                    <div className="text-2xl font-bold text-dorado-nazaret">{evaluationStats.pending + evaluationStats.inProgress}</div>
                    <div className="text-sm text-gris-piedra">Pendientes</div>
                </Card>
                
                <Card className="p-6 text-center">
                    <UsersIcon className="w-8 h-8 text-azul-monte-tabor mx-auto mb-3" />
                    <div className="text-2xl font-bold text-azul-monte-tabor">{evaluationStats.averageScore} pts</div>
                    <div className="text-sm text-gris-piedra">Promedio General</div>
                </Card>
            </div>

            {/* Recent Evaluations - Usando datos reales */}
            <Card className="p-6">
                <h2 className="text-xl font-bold text-azul-monte-tabor mb-4">Evaluaciones Recientes</h2>
                {isLoading ? (
                    <div className="text-center py-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-azul-monte-tabor mx-auto"></div>
                        <p className="text-gris-piedra mt-2">Cargando evaluaciones...</p>
                    </div>
                ) : evaluations.length > 0 ? (
                    <div className="space-y-3">
                        {evaluations.slice(0, 5).map((evaluation) => (
                            <div key={evaluation.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                <div>
                                    <p className="font-medium">
                                        {evaluation.studentName}
                                    </p>
                                    <p className="text-sm text-gris-piedra">
                                        {getEvaluationTypeLabel(evaluation.evaluationType)} - {evaluation.studentGrade}
                                    </p>
                                    {evaluation.scheduledDate && (
                                        <p className="text-xs text-gris-piedra">
                                            Programada: {new Date(evaluation.scheduledDate).toLocaleDateString('es-CL')}
                                        </p>
                                    )}
                                </div>
                                <div className="flex items-center gap-2">
                                    {getEvaluationStatusBadge(evaluation.status)}
                                    <Button 
                                        size="sm" 
                                        variant="primary"
                                        onClick={() => navigate(
                                            evaluation.evaluationType === 'CYCLE_DIRECTOR_INTERVIEW'
                                                ? `/profesor/entrevista-director/${evaluation.id}`
                                                : evaluation.evaluationType === 'CYCLE_DIRECTOR_REPORT'
                                                ? `/profesor/informe-director/${evaluation.id}`
                                                : `/profesor/informe/${evaluation.id}`
                                        )}
                                    >
                                        {evaluation.evaluationType === 'CYCLE_DIRECTOR_INTERVIEW' 
                                            ? (evaluation.status === EvaluationStatus.COMPLETED ? "Ver Entrevista" : "Crear Entrevista")
                                            : (evaluation.status === EvaluationStatus.COMPLETED ? "Ver Informe" : "Crear Informe")}
                                    </Button>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p className="text-gris-piedra text-center py-4">
                        No hay evaluaciones asignadas en este momento
                    </p>
                )}
            </Card>
        </div>
    );

    const renderEvaluaciones = () => {
        const evaluationColumns = [
            {
                key: 'student' as keyof ProfessorEvaluation,
                header: 'Estudiante',
                render: (value: any, evaluation: ProfessorEvaluation) => (
                    <div>
                        <p className="font-semibold">{evaluation.studentName}</p>
                        <p className="text-sm text-gris-piedra">{evaluation.studentGrade}</p>
                    </div>
                )
            },
            {
                key: 'evaluationType' as keyof ProfessorEvaluation,
                header: 'Tipo de Evaluación',
                render: (type: EvaluationType) => getEvaluationTypeLabel(type)
            },
            {
                key: 'scheduledDate' as keyof ProfessorEvaluation,
                header: 'Fecha Programada',
                render: (date: string) => date ? new Date(date).toLocaleDateString('es-CL') : '-'
            },
            {
                key: 'status' as keyof ProfessorEvaluation,
                header: 'Estado',
                render: (status: EvaluationStatus) => getEvaluationStatusBadge(status)
            },
            {
                key: 'score' as keyof ProfessorEvaluation,
                header: 'Puntaje',
                render: (score: number) => score ? `${score} pts` : '-'
            },
            {
                key: 'actions' as keyof ProfessorEvaluation,
                header: 'Acciones',
                render: (value: any, evaluation: ProfessorEvaluation) => (
                    <Button
                        size="sm"
                        variant="primary"
                        onClick={() => navigate(`/profesor/informe/${evaluation.id}`)}
                    >
                        {evaluation.status === EvaluationStatus.COMPLETED ? "Ver Informe" : "Completar Informe"}
                    </Button>
                )
            }
        ];

        return (
            <Card className="p-6">
                <h2 className="text-xl font-bold text-azul-monte-tabor mb-4">
                    Mis Evaluaciones Asignadas ({evaluations.length})
                </h2>
                {(() => { Logger.info('🔄 Renderizando evaluaciones - isLoading:', isLoading, 'evaluations:', evaluations); return null; })()}
                {isLoading ? (
                    <div className="text-center py-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-azul-monte-tabor mx-auto"></div>
                        <p className="text-gris-piedra mt-2">Cargando evaluaciones...</p>
                    </div>
                ) : (
                    <Table 
                        data={evaluations}
                        columns={evaluationColumns}
                        emptyMessage="No hay evaluaciones asignadas"
                    />
                )}
            </Card>
        );
    };

    const renderEstudiantes = () => {
        // Crear lista única de estudiantes desde las evaluaciones reales
        const uniqueStudents = new Map();
        evaluations.forEach(evaluation => {
            const studentId = evaluation.studentId || evaluation.id;
            if (!uniqueStudents.has(studentId)) {
                uniqueStudents.set(studentId, {
                    id: studentId,
                    name: evaluation.studentName,
                    grade: evaluation.studentGrade,
                    birthDate: evaluation.studentBirthDate,
                    currentSchool: evaluation.currentSchool,
                    evaluations: []
                });
            }
            uniqueStudents.get(studentId).evaluations.push(evaluation);
        });
        
        const myStudents = Array.from(uniqueStudents.values());

        const studentColumns = [
            {
                key: 'name' as const,
                header: 'Estudiante',
                render: (value: any, student: any) => (
                    <div>
                        <p className="font-semibold">{student.name}</p>
                        <p className="text-sm text-gris-piedra">{student.grade}</p>
                        {student.currentSchool && (
                            <p className="text-xs text-gris-piedra">
                                {student.currentSchool}
                            </p>
                        )}
                    </div>
                )
            },
            {
                key: 'evaluations' as const,
                header: 'Evaluaciones',
                render: (evaluations: ProfessorEvaluation[], student: any) => (
                    <div>
                        <p className="font-medium">{evaluations.length} evaluacion{evaluations.length !== 1 ? 'es' : ''}</p>
                        <div className="flex flex-wrap gap-1 mt-1">
                            {evaluations.map((evaluation, index) => (
                                <span key={index} className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                                    {getEvaluationTypeLabel(evaluation.evaluationType).split(' ')[0]}
                                </span>
                            ))}
                        </div>
                    </div>
                )
            },
            {
                key: 'status' as const,
                header: 'Estado',
                render: (value: any, student: any) => {
                    const completedEvaluations = student.evaluations.filter((e: ProfessorEvaluation) => 
                        e.status === EvaluationStatus.COMPLETED
                    );
                    const totalEvaluations = student.evaluations.length;
                    
                    if (completedEvaluations.length === totalEvaluations) {
                        return <Badge variant="success">Completo ({completedEvaluations.length}/{totalEvaluations})</Badge>;
                    } else if (completedEvaluations.length > 0) {
                        return <Badge variant="warning">Parcial ({completedEvaluations.length}/{totalEvaluations})</Badge>;
                    } else {
                        return <Badge variant="info">Pendiente ({completedEvaluations.length}/{totalEvaluations})</Badge>;
                    }
                }
            },
            {
                key: 'averageScore' as const,
                header: 'Promedio',
                render: (value: any, student: any) => {
                    const completedWithScore = student.evaluations.filter((e: ProfessorEvaluation) => 
                        e.status === EvaluationStatus.COMPLETED && e.score
                    );
                    
                    if (completedWithScore.length === 0) {
                        return <span className="text-gris-piedra">-</span>;
                    }
                    
                    const average = completedWithScore.reduce((sum: number, e: ProfessorEvaluation) => 
                        sum + (e.score || 0), 0) / completedWithScore.length;
                    
                    return (
                        <div className="text-center">
                            <span className="font-semibold text-azul-monte-tabor">
                                {Math.round(average)} pts
                            </span>
                        </div>
                    );
                }
            },
            {
                key: 'actions' as const,
                header: 'Acciones',
                render: (value: any, student: any) => (
                    <div className="flex gap-2">
                        {student.evaluations.map((evaluation: ProfessorEvaluation) => (
                            <Button 
                                key={evaluation.id}
                                size="sm" 
                                variant={evaluation.status === EvaluationStatus.COMPLETED ? "outline" : "primary"}
                                onClick={() => navigate(
                                    evaluation.evaluationType === 'CYCLE_DIRECTOR_INTERVIEW'
                                        ? `/profesor/entrevista-director/${evaluation.id}`
                                        : evaluation.evaluationType === 'CYCLE_DIRECTOR_REPORT'
                                        ? `/profesor/informe-director/${evaluation.id}`
                                        : `/profesor/informe/${evaluation.id}`
                                )}
                                title={getEvaluationTypeLabel(evaluation.evaluationType)}
                            >
                                {evaluation.evaluationType === 'CYCLE_DIRECTOR_INTERVIEW' 
                                    ? (evaluation.status === EvaluationStatus.COMPLETED ? "Ver Entrevista" : "Entrevista")
                                    : (evaluation.status === EvaluationStatus.COMPLETED ? "Ver Informe" : "Evaluar")}
                            </Button>
                        ))}
                    </div>
                )
            }
        ];

        return (
            <Card className="p-6">
                <h2 className="text-xl font-bold text-azul-monte-tabor mb-4">
                    Mis Estudiantes ({myStudents.length})
                </h2>
                {isLoading ? (
                    <div className="text-center py-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-azul-monte-tabor mx-auto"></div>
                        <p className="text-gris-piedra mt-2">Cargando estudiantes...</p>
                    </div>
                ) : (
                    <Table 
                        data={myStudents}
                        columns={studentColumns}
                        emptyMessage="No hay estudiantes asignados"
                    />
                )}
            </Card>
        );
    };

    const renderReportesEstadisticas = () => {
        // Calcular estadísticas detalladas
        const completedEvaluations = evaluations.filter(e => e.status === EvaluationStatus.COMPLETED);
        const evaluationsWithScore = completedEvaluations.filter(e => e.score);
        
        // Estadísticas por tipo de evaluación
        const statsByType = evaluations.reduce((acc: any, evaluation) => {
            const type = evaluation.evaluationType;
            if (!acc[type]) {
                acc[type] = { total: 0, completed: 0, pending: 0, averageScore: 0, scores: [] };
            }
            acc[type].total++;
            if (evaluation.status === EvaluationStatus.COMPLETED) {
                acc[type].completed++;
                if (evaluation.score) {
                    acc[type].scores.push(evaluation.score);
                }
            } else {
                acc[type].pending++;
            }
            acc[type].averageScore = acc[type].scores.length > 0 
                ? Math.round(acc[type].scores.reduce((sum: number, score: number) => sum + score, 0) / acc[type].scores.length)
                : 0;
            return acc;
        }, {});

        // Estadísticas por grado
        const statsByGrade = evaluations.reduce((acc: any, evaluation) => {
            const grade = evaluation.studentGrade;
            if (!acc[grade]) {
                acc[grade] = { total: 0, completed: 0, averageScore: 0, scores: [] };
            }
            acc[grade].total++;
            if (evaluation.status === EvaluationStatus.COMPLETED) {
                acc[grade].completed++;
                if (evaluation.score) {
                    acc[grade].scores.push(evaluation.score);
                }
            }
            acc[grade].averageScore = acc[grade].scores.length > 0 
                ? Math.round(acc[grade].scores.reduce((sum: number, score: number) => sum + score, 0) / acc[grade].scores.length)
                : 0;
            return acc;
        }, {});

        // Evaluaciones por fecha (últimas 2 semanas)
        const twoWeeksAgo = new Date();
        twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14);
        
        const recentEvaluations = completedEvaluations.filter(e => 
            e.completedDate && new Date(e.completedDate) >= twoWeeksAgo
        );

        return (
            <div className="space-y-6">
                {/* Header */}
                <div className="flex justify-between items-center">
                    <h2 className="text-xl font-bold text-azul-monte-tabor">
                        Reportes y Estadísticas
                    </h2>
                    <div className="flex gap-2">
                        <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => window.print()}
                        >
                            Imprimir Reporte
                        </Button>
                        <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => {
                                // Generar CSV básico
                                const csvData = evaluations.map(e => 
                                    `${e.studentName},${e.studentGrade},${getEvaluationTypeLabel(e.evaluationType)},${e.status},${e.score || 'N/A'}`
                                ).join('\n');
                                const blob = new Blob([`Estudiante,Grado,Evaluación,Estado,Puntaje\n${csvData}`], { type: 'text/csv' });
                                const url = window.URL.createObjectURL(blob);
                                const a = document.createElement('a');
                                a.href = url;
                                a.download = `evaluaciones_${currentProfessor?.firstName}_${new Date().toISOString().split('T')[0]}.csv`;
                                a.click();
                            }}
                        >
                            Exportar CSV
                        </Button>
                    </div>
                </div>

                {/* Resumen General */}
                <Card className="p-6">
                    <h3 className="text-lg font-bold text-azul-monte-tabor mb-4">Resumen General</h3>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div className="bg-blue-50 p-4 rounded-lg text-center">
                            <div className="text-2xl font-bold text-azul-monte-tabor">{evaluationStats.total}</div>
                            <div className="text-sm text-gris-piedra">Total Evaluaciones</div>
                        </div>
                        <div className="bg-green-50 p-4 rounded-lg text-center">
                            <div className="text-2xl font-bold text-verde-esperanza">{evaluationStats.completed}</div>
                            <div className="text-sm text-gris-piedra">Completadas</div>
                            <div className="text-xs text-gris-piedra">
                                ({Math.round((evaluationStats.completed / evaluationStats.total) * 100)}%)
                            </div>
                        </div>
                        <div className="bg-yellow-50 p-4 rounded-lg text-center">
                            <div className="text-2xl font-bold text-dorado-nazaret">{evaluationStats.pending + evaluationStats.inProgress}</div>
                            <div className="text-sm text-gris-piedra">Pendientes</div>
                        </div>
                        <div className="bg-purple-50 p-4 rounded-lg text-center">
                            <div className="text-2xl font-bold text-azul-monte-tabor">{evaluationStats.averageScore} pts</div>
                            <div className="text-sm text-gris-piedra">Promedio General</div>
                        </div>
                    </div>
                </Card>

                {/* Estadísticas por Tipo de Evaluación */}
                <Card className="p-6">
                    <h3 className="text-lg font-bold text-azul-monte-tabor mb-4">Estadísticas por Tipo de Evaluación</h3>
                    <div className="space-y-4">
                        {Object.entries(statsByType).map(([type, stats]: [string, any]) => (
                            <div key={type} className="border border-gray-200 rounded-lg p-4">
                                <div className="flex justify-between items-center mb-2">
                                    <h4 className="font-semibold text-azul-monte-tabor">
                                        {getEvaluationTypeLabel(type as EvaluationType)}
                                    </h4>
                                    <Badge variant="info">{stats.total} evaluaciones</Badge>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                                    <div>
                                        <span className="text-gris-piedra">Completadas:</span>
                                        <span className="ml-2 font-medium text-verde-esperanza">
                                            {stats.completed}/{stats.total} ({Math.round((stats.completed/stats.total)*100)}%)
                                        </span>
                                    </div>
                                    <div>
                                        <span className="text-gris-piedra">Pendientes:</span>
                                        <span className="ml-2 font-medium text-dorado-nazaret">{stats.pending}</span>
                                    </div>
                                    <div>
                                        <span className="text-gris-piedra">Promedio:</span>
                                        <span className="ml-2 font-medium text-azul-monte-tabor">
                                            {stats.averageScore > 0 ? `${stats.averageScore} pts` : 'N/A'}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </Card>

                {/* Estadísticas por Grado */}
                <Card className="p-6">
                    <h3 className="text-lg font-bold text-azul-monte-tabor mb-4">Estadísticas por Grado</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {Object.entries(statsByGrade).map(([grade, stats]: [string, any]) => (
                            <div key={grade} className="border border-gray-200 rounded-lg p-4">
                                <h4 className="font-semibold text-azul-monte-tabor mb-2">{grade}</h4>
                                <div className="space-y-2 text-sm">
                                    <div className="flex justify-between">
                                        <span className="text-gris-piedra">Total:</span>
                                        <span className="font-medium">{stats.total}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gris-piedra">Completadas:</span>
                                        <span className="font-medium text-verde-esperanza">{stats.completed}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gris-piedra">Promedio:</span>
                                        <span className="font-medium text-azul-monte-tabor">
                                            {stats.averageScore > 0 ? `${stats.averageScore} pts` : 'N/A'}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </Card>

                {/* Actividad Reciente */}
                <Card className="p-6">
                    <h3 className="text-lg font-bold text-azul-monte-tabor mb-4">
                        Actividad Reciente (últimas 2 semanas)
                    </h3>
                    {recentEvaluations.length > 0 ? (
                        <div className="space-y-3">
                            {recentEvaluations.slice(0, 10).map((evaluation) => (
                                <div key={evaluation.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                    <div>
                                        <p className="font-medium">{evaluation.studentName}</p>
                                        <p className="text-sm text-gris-piedra">
                                            {getEvaluationTypeLabel(evaluation.evaluationType)} - {evaluation.studentGrade}
                                        </p>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-medium text-azul-monte-tabor">
                                            {evaluation.score ? `${evaluation.score} pts` : 'Sin puntaje'}
                                        </p>
                                        <p className="text-xs text-gris-piedra">
                                            {evaluation.completedDate ? new Date(evaluation.completedDate).toLocaleDateString('es-CL') : '-'}
                                        </p>
                                    </div>
                                </div>
                            ))}
                            {recentEvaluations.length > 10 && (
                                <p className="text-center text-gris-piedra text-sm">
                                    ... y {recentEvaluations.length - 10} evaluaciones más
                                </p>
                            )}
                        </div>
                    ) : (
                        <p className="text-gris-piedra text-center py-4">
                            No hay evaluaciones completadas en las últimas 2 semanas
                        </p>
                    )}
                </Card>

                {/* Progreso y Productividad */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <Card className="p-6">
                        <h3 className="text-lg font-bold text-azul-monte-tabor mb-4">Progreso Semanal</h3>
                        <div className="space-y-3">
                            <div className="flex justify-between items-center">
                                <span className="text-gris-piedra">Esta semana:</span>
                                <span className="font-medium text-azul-monte-tabor">
                                    {recentEvaluations.filter(e => {
                                        const oneWeekAgo = new Date();
                                        oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
                                        return e.completedDate && new Date(e.completedDate) >= oneWeekAgo;
                                    }).length} evaluaciones
                                </span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-gris-piedra">Semana anterior:</span>
                                <span className="font-medium text-azul-monte-tabor">
                                    {recentEvaluations.filter(e => {
                                        const twoWeeksAgo = new Date();
                                        const oneWeekAgo = new Date();
                                        twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14);
                                        oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
                                        return e.completedDate && 
                                               new Date(e.completedDate) >= twoWeeksAgo && 
                                               new Date(e.completedDate) < oneWeekAgo;
                                    }).length} evaluaciones
                                </span>
                            </div>
                        </div>
                    </Card>

                    <Card className="p-6">
                        <h3 className="text-lg font-bold text-azul-monte-tabor mb-4">Información del Profesor</h3>
                        <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                                <span className="text-gris-piedra">Nombre:</span>
                                <span className="font-medium">{currentProfessor?.firstName} {currentProfessor?.lastName}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gris-piedra">Asignatura:</span>
                                <span className="font-medium">{currentProfessor?.subject ? getSubjectName(currentProfessor.subject) : 'No especificada'}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gris-piedra">Total de Estudiantes:</span>
                                <span className="font-medium">{new Set(evaluations.map(e => e.applicationId)).size}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gris-piedra">Evaluaciones Asignadas:</span>
                                <span className="font-medium">{evaluations.length}</span>
                            </div>
                        </div>
                    </Card>
                </div>
            </div>
        );
    };


    const renderSection = () => {
        Logger.info('🔄 renderSection ejecutándose...');
        Logger.info('📋 activeSection:', activeSection);
        Logger.info('📋 activeSection type:', typeof activeSection);
        Logger.info('📋 activeSection === "evaluaciones":', activeSection === 'evaluaciones');
        
        switch (activeSection) {
            case 'dashboard':
                Logger.info('🏠 Renderizando dashboard');
                return renderDashboard();
            case 'evaluaciones':
                Logger.info('📋 Renderizando evaluaciones');
                return renderEvaluaciones();
            case 'estudiantes':
                Logger.info('👥 Renderizando estudiantes');
                return renderEstudiantes();
            case 'reportes':
                Logger.info('📊 Renderizando reportes');
                return renderReportesEstadisticas();
            case 'configuracion':
                Logger.info('⚙️ Renderizando configuración');
                return (
                    <Card className="p-6">
                        <h2 className="text-xl font-bold text-azul-monte-tabor mb-4">Configuración</h2>
                        <div className="space-y-4">
                            <div>
                                <h3 className="font-semibold text-azul-monte-tabor mb-2">Información Personal</h3>
                                <p><strong>Nombre:</strong> {currentProfessor?.firstName} {currentProfessor?.lastName}</p>
                                <p><strong>Email:</strong> {currentProfessor?.email}</p>
                                <p><strong>Asignatura:</strong> {currentProfessor?.subject ? getSubjectName(currentProfessor.subject) : 'No especificada'}</p>
                                <p><strong>Rol:</strong> {currentProfessor?.role === 'TEACHER' ? 'Docente' : currentProfessor?.role}</p>
                                {currentProfessor?.isAdmin && (
                                    <p className="text-dorado-nazaret"><strong>Permisos:</strong> Administrador</p>
                                )}
                            </div>
                            <div className="pt-4 border-t">
                                <Button variant="outline">Cambiar Contraseña</Button>
                            </div>
                        </div>
                    </Card>
                );
            case 'admin':
                Logger.info('👑 Renderizando admin');
                return (
                    <Card className="p-6">
                        <h2 className="text-xl font-bold text-azul-monte-tabor mb-4">Panel de Administrador</h2>
                        <div className="space-y-6">
                            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                                <h3 className="font-semibold text-azul-monte-tabor mb-2">Acceso Administrativo</h3>
                                <p className="text-gris-piedra mb-4">
                                    Como administrador, tienes acceso completo al sistema de gestión del colegio.
                                </p>
                                <Link to="/admin">
                                    <Button variant="primary">
                                        Ir al Panel de Administrador
                                    </Button>
                                </Link>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                                    <h4 className="font-semibold text-azul-monte-tabor mb-2">Gestión de Postulaciones</h4>
                                    <p className="text-sm text-gris-piedra mb-3">
                                        Revisar y procesar solicitudes de admisión
                                    </p>
                                    <Link to="/admin">
                                        <Button variant="outline" size="sm">Acceder</Button>
                                    </Link>
                                </div>
                                
                                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                                    <h4 className="font-semibold text-azul-monte-tabor mb-2">Gestión de Usuarios</h4>
                                    <p className="text-sm text-gris-piedra mb-3">
                                        Administrar cuentas de profesores y familias
                                    </p>
                                    <Link to="/admin">
                                        <Button variant="outline" size="sm">Acceder</Button>
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </Card>
                );
            default:
                Logger.info('⚠️ Caso default - activeSection no reconocido:', activeSection);
                Logger.info('🔄 Redirigiendo a evaluaciones por defecto');
                return renderEvaluaciones();
        }
    };

    return (
        <div className="bg-gray-50 min-h-screen">
            <div className="flex">
                {/* Sidebar */}
                <aside className="w-64 bg-azul-monte-tabor min-h-screen p-6">
                    <div className="text-blanco-pureza mb-8">
                        <h2 className="text-xl font-bold">Portal Profesores</h2>
                        <p className="text-blue-200 text-sm">Sistema de Evaluaciones</p>
                    </div>
                    
                    <nav className="space-y-2">
                        {sections.map((section) => {
                            const IconComponent = section.icon;
                            return (
                                <button
                                    key={section.key}
                                    onClick={() => setActiveSection(section.key)}
                                    className={`w-full text-left px-4 py-3 rounded-lg font-semibold transition-colors duration-200 flex items-center gap-3 ${
                                        activeSection === section.key 
                                            ? 'bg-dorado-nazaret text-azul-monte-tabor' 
                                            : 'text-blanco-pureza hover:bg-blue-800'
                                    }`}
                                >
                                    <IconComponent className="w-5 h-5" />
                                    {section.label}
                                </button>
                            );
                        })}
                    </nav>

                    <div className="mt-8 pt-8 border-t border-blue-700 space-y-2">
                        <Link to="/">
                            <Button variant="outline" size="sm" className="w-full text-blanco-pureza border-blanco-pureza hover:bg-blanco-pureza hover:text-azul-monte-tabor">
                                Volver al Portal Principal
                            </Button>
                        </Link>
                        <Button 
                            variant="outline" 
                            size="sm" 
                            className="w-full text-blanco-pureza border-blanco-pureza hover:bg-red-500 hover:text-blanco-pureza"
                            onClick={handleLogout}
                        >
                            Cerrar Sesión
                        </Button>
                    </div>
                </aside>

                {/* Main Content */}
                <main className="flex-1 p-8">
                    {renderSection()}
                </main>
            </div>
        </div>
    );
};

export default ProfessorDashboard;