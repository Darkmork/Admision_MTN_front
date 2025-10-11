import React, { useState, useEffect } from 'react';
import Card from '../ui/Card';
import Badge from '../ui/Badge';
import { FiCheck, FiX, FiClock } from 'react-icons/fi';
import { applicationService } from '../../services/applicationService';

// Tipos de evaluaciones
const EVALUATION_TYPES = [
    { key: 'LANGUAGE_EXAM', label: 'Lenguaje' },
    { key: 'MATHEMATICS_EXAM', label: 'Matemáticas' },
    { key: 'ENGLISH_EXAM', label: 'Inglés' },
    { key: 'PSYCHOLOGICAL_INTERVIEW', label: 'Psicológica' },
    { key: 'CYCLE_DIRECTOR_INTERVIEW', label: 'Director' },
    { key: 'CYCLE_DIRECTOR_REPORT', label: 'Informe' }
];

interface StudentEvaluation {
    id: number;
    studentName: string;
    studentRut: string;
    gradeApplied: string;
    evaluations: {
        [key: string]: {
            assigned: boolean;
            status?: string;
            evaluatorName?: string;
            score?: number;
            maxScore?: number;
            evaluationDate?: string;
            completionDate?: string;
            createdAt?: string;
        };
    };
}

const EvaluationsOverviewTable: React.FC = () => {
    const [students, setStudents] = useState<StudentEvaluation[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setLoading(true);
        setError(null);
        try {
            const applications = await applicationService.getAllApplications();

            const studentsData: StudentEvaluation[] = applications.map(app => {
                // Obtener evaluaciones de la aplicación
                const evaluationsMap: any = {};

                // Inicializar todas las evaluaciones como no asignadas
                EVALUATION_TYPES.forEach(type => {
                    evaluationsMap[type.key] = { assigned: false };
                });

                // Si la aplicación tiene evaluaciones, marcarlas como asignadas
                if (app.evaluations && Array.isArray(app.evaluations)) {
                    app.evaluations.forEach((ev: any) => {
                        evaluationsMap[ev.evaluationType] = {
                            assigned: true,
                            status: ev.status,
                            evaluatorName: ev.evaluator ? `${ev.evaluator.firstName} ${ev.evaluator.lastName}` : undefined,
                            score: ev.score,
                            maxScore: ev.maxScore || 100,
                            evaluationDate: ev.evaluationDate,
                            completionDate: ev.completionDate,
                            createdAt: ev.createdAt
                        };
                    });
                }

                return {
                    id: app.id,
                    studentName: `${app.student.firstName} ${app.student.paternalLastName || app.student.lastName} ${app.student.maternalLastName || ''}`.trim(),
                    studentRut: app.student.rut,
                    gradeApplied: app.student.gradeApplied || 'N/A',
                    evaluations: evaluationsMap
                };
            });

            setStudents(studentsData);
        } catch (err: any) {
            console.error('Error loading evaluations overview:', err);
            setError(err.message || 'Error al cargar datos');
        } finally {
            setLoading(false);
        }
    };

    const renderEvaluationCell = (evaluation: {
        assigned: boolean;
        status?: string;
        evaluatorName?: string;
        score?: number;
        maxScore?: number;
        evaluationDate?: string;
        completionDate?: string;
        createdAt?: string;
    }) => {
        if (evaluation.assigned) {
            const formatDate = (dateString?: string) => {
                if (!dateString) return null;
                const date = new Date(dateString);
                return date.toLocaleDateString('es-CL', { day: '2-digit', month: '2-digit', year: 'numeric' });
            };

            return (
                <div className="flex items-center justify-center">
                    <div className="flex flex-col items-center gap-1 min-w-[140px]">
                        <div className="flex items-center justify-center w-8 h-8 bg-green-100 rounded-full">
                            <FiCheck className="w-4 h-4 text-green-600" />
                        </div>

                        {/* Evaluador */}
                        {evaluation.evaluatorName && (
                            <span className="text-xs text-gray-700 font-medium text-center">
                                {evaluation.evaluatorName}
                            </span>
                        )}

                        {/* Estado */}
                        {evaluation.status === 'COMPLETED' && (
                            <Badge variant="green" size="sm">Completada</Badge>
                        )}
                        {evaluation.status === 'IN_PROGRESS' && (
                            <Badge variant="yellow" size="sm">En Progreso</Badge>
                        )}
                        {evaluation.status === 'PENDING' && (
                            <Badge variant="gray" size="sm">Pendiente</Badge>
                        )}

                        {/* Puntaje (solo si está completada) */}
                        {evaluation.status === 'COMPLETED' && evaluation.score !== undefined && (
                            <span className="text-xs font-semibold text-blue-600">
                                {evaluation.score}/{evaluation.maxScore || 100} pts
                            </span>
                        )}

                        {/* Fecha de creación */}
                        {evaluation.createdAt && (
                            <span className="text-xs text-gray-500">
                                Asignada: {formatDate(evaluation.createdAt)}
                            </span>
                        )}

                        {/* Fecha de completación */}
                        {evaluation.completionDate && (
                            <span className="text-xs text-gray-500">
                                Completada: {formatDate(evaluation.completionDate)}
                            </span>
                        )}
                    </div>
                </div>
            );
        }

        return (
            <div className="flex items-center justify-center">
                <div className="flex items-center justify-center w-8 h-8 bg-red-100 rounded-full">
                    <FiX className="w-4 h-4 text-red-600" />
                </div>
            </div>
        );
    };

    if (loading) {
        return (
            <Card className="p-6">
                <div className="flex items-center justify-center py-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                    <span className="ml-3 text-gray-600">Cargando evaluaciones...</span>
                </div>
            </Card>
        );
    }

    if (error) {
        return (
            <Card className="p-6">
                <div className="text-center py-12">
                    <p className="text-red-600">{error}</p>
                    <button
                        onClick={loadData}
                        className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                    >
                        Reintentar
                    </button>
                </div>
            </Card>
        );
    }

    return (
        <Card className="p-6">
            <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900">Resumen de Evaluaciones por Postulante</h3>
                <p className="text-sm text-gray-600 mt-1">
                    <span className="inline-flex items-center gap-1 mr-4">
                        <FiCheck className="w-4 h-4 text-green-600" /> Asignada
                    </span>
                    <span className="inline-flex items-center gap-1">
                        <FiX className="w-4 h-4 text-red-600" /> No asignada
                    </span>
                </p>
            </div>

            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider sticky left-0 bg-gray-50 z-10">
                                Estudiante
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Curso
                            </th>
                            {EVALUATION_TYPES.map(type => (
                                <th key={type.key} className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    {type.label}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {students.map(student => (
                            <tr key={student.id} className="hover:bg-gray-50">
                                <td className="px-4 py-4 whitespace-nowrap sticky left-0 bg-white z-10">
                                    <div>
                                        <div className="text-sm font-medium text-gray-900">{student.studentName}</div>
                                        <div className="text-sm text-gray-500">{student.studentRut}</div>
                                    </div>
                                </td>
                                <td className="px-4 py-4 whitespace-nowrap">
                                    <Badge variant="blue" size="sm">{student.gradeApplied}</Badge>
                                </td>
                                {EVALUATION_TYPES.map(type => (
                                    <td key={type.key} className="px-4 py-4 whitespace-nowrap">
                                        {renderEvaluationCell(student.evaluations[type.key])}
                                    </td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>

                {students.length === 0 && (
                    <div className="text-center py-12">
                        <p className="text-gray-500">No hay postulantes registrados</p>
                    </div>
                )}
            </div>

            <div className="mt-4 text-sm text-gray-600">
                Total de postulantes: {students.length}
            </div>
        </Card>
    );
};

export default EvaluationsOverviewTable;
