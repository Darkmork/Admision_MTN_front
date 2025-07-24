import React, { useState, useMemo } from 'react';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import Table from '../components/ui/Table';
import { 
    DashboardIcon, 
    FileTextIcon, 
    UsersIcon, 
    BookOpenIcon,
    CheckCircleIcon,
    ClockIcon
} from '../components/icons/Icons';
import { 
    mockProfessors, 
    getPendingExamsByProfessor, 
    getProfessorStats,
    mockStudentExams,
    mockStudentProfiles
} from '../services/professorMockData';
import { ExamStatus, StudentExam } from '../types';
import { Link, useNavigate } from 'react-router-dom';

const baseSections = [
    { key: 'dashboard', label: 'Dashboard General', icon: DashboardIcon },
    { key: 'evaluaciones', label: 'Evaluaciones Pendientes', icon: ClockIcon },
    { key: 'estudiantes', label: 'Mis Estudiantes', icon: UsersIcon },
    { key: 'reportes', label: 'Reportes y Estadísticas', icon: FileTextIcon },
    { key: 'configuracion', label: 'Configuración', icon: BookOpenIcon }
];

const ProfessorDashboard: React.FC = () => {
    const [activeSection, setActiveSection] = useState('dashboard');
    const navigate = useNavigate();
    
    // Obtener profesor actual del localStorage
    const [currentProfessor, setCurrentProfessor] = useState(() => {
        const storedProfessor = localStorage.getItem('currentProfessor');
        return storedProfessor ? JSON.parse(storedProfessor) : null;
    });

    const stats = useMemo(() => {
        return getProfessorStats(currentProfessor.id);
    }, [currentProfessor.id]);

    const pendingExams = useMemo(() => {
        return getPendingExamsByProfessor(currentProfessor.id);
    }, [currentProfessor.id]);

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
            'MATH': 'Matemática',
            'SPANISH': 'Lenguaje',
            'ENGLISH': 'Inglés'
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

    const renderDashboard = () => (
        <div className="space-y-6">
            {/* Welcome Card */}
            <Card className="p-6 bg-gradient-to-r from-azul-monte-tabor to-blue-700 text-blanco-pureza">
                <h1 className="text-2xl font-bold mb-2">
                    Bienvenido/a, {currentProfessor.firstName} {currentProfessor.lastName}
                </h1>
                <p className="text-blue-100">
                    Departamento de {currentProfessor.department}
                </p>
                <p className="text-blue-100 text-sm mt-1">
                    Asignaturas: {currentProfessor.subjects.map(getSubjectName).join(', ')}
                </p>
            </Card>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card className="p-6 text-center">
                    <FileTextIcon className="w-8 h-8 text-azul-monte-tabor mx-auto mb-3" />
                    <div className="text-2xl font-bold text-azul-monte-tabor">{stats?.totalExams || 0}</div>
                    <div className="text-sm text-gris-piedra">Total Exámenes</div>
                </Card>
                
                <Card className="p-6 text-center">
                    <CheckCircleIcon className="w-8 h-8 text-verde-esperanza mx-auto mb-3" />
                    <div className="text-2xl font-bold text-verde-esperanza">{stats?.evaluatedExams || 0}</div>
                    <div className="text-sm text-gris-piedra">Evaluados</div>
                </Card>
                
                <Card className="p-6 text-center">
                    <ClockIcon className="w-8 h-8 text-dorado-nazaret mx-auto mb-3" />
                    <div className="text-2xl font-bold text-dorado-nazaret">{stats?.pendingEvaluations || 0}</div>
                    <div className="text-sm text-gris-piedra">Pendientes</div>
                </Card>
                
                <Card className="p-6 text-center">
                    <UsersIcon className="w-8 h-8 text-azul-monte-tabor mx-auto mb-3" />
                    <div className="text-2xl font-bold text-azul-monte-tabor">{stats?.averageScore || 0}%</div>
                    <div className="text-sm text-gris-piedra">Promedio General</div>
                </Card>
            </div>

            {/* Recent Activity */}
            <Card className="p-6">
                <h2 className="text-xl font-bold text-azul-monte-tabor mb-4">Actividad Reciente</h2>
                <div className="space-y-3">
                    {pendingExams.slice(0, 5).map((exam) => {
                        const student = mockStudentProfiles.find(s => s.id === exam.studentId);
                        return (
                            <div key={exam.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                <div>
                                    <p className="font-medium">
                                        {student?.firstName} {student?.lastName}
                                    </p>
                                    <p className="text-sm text-gris-piedra">
                                        {getSubjectName(exam.subjectId)} - {student?.grade}
                                    </p>
                                </div>
                                <div className="flex items-center gap-3">
                                    {getStatusBadge(exam.status)}
                                    <Button 
                                        size="sm" 
                                        variant="primary"
                                        onClick={() => navigate(`/profesor/evaluar/${exam.id}`)}
                                    >
                                        Evaluar
                                    </Button>
                                </div>
                            </div>
                        );
                    })}
                    {pendingExams.length === 0 && (
                        <p className="text-gris-piedra text-center py-4">
                            No hay evaluaciones pendientes en este momento
                        </p>
                    )}
                </div>
            </Card>
        </div>
    );

    const renderEvaluaciones = () => {
        const examColumns = [
            {
                key: 'student' as keyof any,
                header: 'Estudiante',
                render: (value: any, exam: StudentExam) => {
                    const student = mockStudentProfiles.find(s => s.id === exam.studentId);
                    return (
                        <div>
                            <p className="font-semibold">{student?.firstName} {student?.lastName}</p>
                            <p className="text-sm text-gris-piedra">{student?.grade}</p>
                        </div>
                    );
                }
            },
            {
                key: 'subjectId' as keyof StudentExam,
                header: 'Asignatura',
                render: (subjectId: string) => getSubjectName(subjectId)
            },
            {
                key: 'completedAt' as keyof StudentExam,
                header: 'Fecha Completado',
                render: (date: string) => date ? new Date(date).toLocaleDateString('es-CL') : '-'
            },
            {
                key: 'score' as keyof StudentExam,
                header: 'Puntaje',
                render: (score: number) => score ? `${score} pts` : '-'
            },
            {
                key: 'actions' as keyof any,
                header: 'Acciones',
                render: (value: any, exam: StudentExam) => (
                    <Button 
                        size="sm" 
                        variant="primary"
                        onClick={() => navigate(`/profesor/evaluar/${exam.id}`)}
                    >
                        Evaluar
                    </Button>
                )
            }
        ];

        return (
            <Card className="p-6">
                <h2 className="text-xl font-bold text-azul-monte-tabor mb-4">
                    Evaluaciones Pendientes ({pendingExams.length})
                </h2>
                <Table 
                    data={pendingExams}
                    columns={examColumns}
                    emptyMessage="No hay evaluaciones pendientes"
                />
            </Card>
        );
    };

    const renderEstudiantes = () => {
        const myStudents = mockStudentProfiles.filter(student => 
            student.examResults.some(exam => 
                currentProfessor.subjects.includes(exam.subjectId)
            )
        );

        const studentColumns = [
            {
                key: 'name' as keyof any,
                header: 'Estudiante',
                render: (value: any, student: any) => (
                    <div>
                        <p className="font-semibold">{student.firstName} {student.lastName}</p>
                        <p className="text-sm text-gris-piedra">{student.grade}</p>
                    </div>
                )
            },
            {
                key: 'examResults' as keyof any,
                header: 'Exámenes',
                render: (examResults: any[], student: any) => {
                    const myExams = mockStudentExams.filter(exam => 
                        exam.studentId === student.id && 
                        currentProfessor.subjects.includes(exam.subjectId)
                    );
                    return `${myExams.length} exámenes`;
                }
            },
            {
                key: 'status' as keyof any,
                header: 'Estado',
                render: (value: any, student: any) => {
                    const myExams = mockStudentExams.filter(exam => 
                        exam.studentId === student.id && 
                        currentProfessor.subjects.includes(exam.subjectId)
                    );
                    const evaluated = myExams.filter(exam => exam.evaluation).length;
                    return evaluated === myExams.length ? 
                        <Badge variant="success">Completo</Badge> : 
                        <Badge variant="warning">Pendiente</Badge>;
                }
            },
            {
                key: 'actions' as keyof any,
                header: 'Ver Perfil',
                render: (value: any, student: any) => (
                    <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => navigate(`/profesor/estudiante/${student.id}`)}
                    >
                        Ver Perfil
                    </Button>
                )
            }
        ];

        return (
            <Card className="p-6">
                <h2 className="text-xl font-bold text-azul-monte-tabor mb-4">
                    Mis Estudiantes ({myStudents.length})
                </h2>
                <Table 
                    data={myStudents}
                    columns={studentColumns}
                    emptyMessage="No hay estudiantes asignados"
                />
            </Card>
        );
    };

    const renderSection = () => {
        switch (activeSection) {
            case 'dashboard':
                return renderDashboard();
            case 'evaluaciones':
                return renderEvaluaciones();
            case 'estudiantes':
                return renderEstudiantes();
            case 'reportes':
                return (
                    <Card className="p-6">
                        <h2 className="text-xl font-bold text-azul-monte-tabor mb-4">Reportes y Estadísticas</h2>
                        <p className="text-gris-piedra">Funcionalidad en desarrollo...</p>
                    </Card>
                );
            case 'configuracion':
                return (
                    <Card className="p-6">
                        <h2 className="text-xl font-bold text-azul-monte-tabor mb-4">Configuración</h2>
                        <div className="space-y-4">
                            <div>
                                <h3 className="font-semibold text-azul-monte-tabor mb-2">Información Personal</h3>
                                <p><strong>Nombre:</strong> {currentProfessor.firstName} {currentProfessor.lastName}</p>
                                <p><strong>Email:</strong> {currentProfessor.email}</p>
                                <p><strong>Departamento:</strong> {currentProfessor.department}</p>
                                {currentProfessor.isAdmin && (
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
                return renderDashboard();
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