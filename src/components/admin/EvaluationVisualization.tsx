import React, { useEffect, useState } from 'react';
import {
    FiEye,
    FiDownload,
    FiFilter,
    FiRefreshCw,
    FiCheckCircle,
    FiClock,
    FiAlertCircle,
    FiX,
    FiFileText,
    FiUser,
    FiCalendar,
    FiStar
} from 'react-icons/fi';
import Card from '../../../components/ui/Card';
import Button from '../../../components/ui/Button';
import Badge from '../../../components/ui/Badge';
import { evaluationService } from '../../../services/evaluationService';
import { Evaluation } from '../../../types/evaluation';

interface EvaluationVisualizationProps {
    className?: string;
}

const EvaluationVisualization: React.FC<EvaluationVisualizationProps> = ({ className = '' }) => {
    const [evaluations, setEvaluations] = useState<Evaluation[]>([]);
    const [filteredEvaluations, setFilteredEvaluations] = useState<Evaluation[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedEvaluation, setSelectedEvaluation] = useState<Evaluation | null>(null);
    const [showDetailModal, setShowDetailModal] = useState(false);

    // Filtros
    const [filterType, setFilterType] = useState<string>('ALL');
    const [filterStatus, setFilterStatus] = useState<string>('ALL');
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        loadEvaluations();
    }, []);

    useEffect(() => {
        applyFilters();
    }, [evaluations, filterType, filterStatus, searchTerm]);

    const loadEvaluations = async () => {
        try {
            setIsLoading(true);
            setError(null);

            const data = await evaluationService.getAllEvaluations();
            setEvaluations(data);
        } catch (err: any) {
            console.error('Error loading evaluations:', err);
            setError(err.message || 'Error al cargar las evaluaciones');
        } finally {
            setIsLoading(false);
        }
    };

    const applyFilters = () => {
        let filtered = [...evaluations];

        // Filtro por tipo
        if (filterType !== 'ALL') {
            filtered = filtered.filter(e => e.evaluationType === filterType);
        }

        // Filtro por estado
        if (filterStatus !== 'ALL') {
            filtered = filtered.filter(e => e.status === filterStatus);
        }

        // Búsqueda por texto
        if (searchTerm.trim()) {
            const term = searchTerm.toLowerCase();
            filtered = filtered.filter(e =>
                e.student?.firstName?.toLowerCase().includes(term) ||
                e.student?.lastName?.toLowerCase().includes(term) ||
                e.evaluator?.firstName?.toLowerCase().includes(term) ||
                e.evaluator?.lastName?.toLowerCase().includes(term)
            );
        }

        setFilteredEvaluations(filtered);
    };

    const getEvaluationTypeLabel = (type: string): string => {
        const labels: Record<string, string> = {
            'MATHEMATICS_EXAM': 'Examen de Matemáticas',
            'LANGUAGE_EXAM': 'Examen de Lenguaje',
            'ENGLISH_EXAM': 'Examen de Inglés',
            'PSYCHOLOGICAL_INTERVIEW': 'Entrevista Psicológica',
            'CYCLE_DIRECTOR_INTERVIEW': 'Entrevista Director',
            'CYCLE_DIRECTOR_REPORT': 'Informe Director de Ciclo'
        };
        return labels[type] || type;
    };

    const getStatusLabel = (status: string): string => {
        const labels: Record<string, string> = {
            'PENDING': 'Pendiente',
            'IN_PROGRESS': 'En Progreso',
            'COMPLETED': 'Completada',
            'REVIEWED': 'Revisada',
            'APPROVED': 'Aprobada'
        };
        return labels[status] || status;
    };

    const getStatusColor = (status: string): 'gray' | 'yellow' | 'blue' | 'green' | 'red' => {
        const colors: Record<string, 'gray' | 'yellow' | 'blue' | 'green' | 'red'> = {
            'PENDING': 'gray',
            'IN_PROGRESS': 'yellow',
            'COMPLETED': 'blue',
            'REVIEWED': 'green',
            'APPROVED': 'green'
        };
        return colors[status] || 'gray';
    };

    const getTypeColor = (type: string): 'blue' | 'green' | 'purple' | 'orange' | 'pink' => {
        const colors: Record<string, 'blue' | 'green' | 'purple' | 'orange' | 'pink'> = {
            'MATHEMATICS_EXAM': 'blue',
            'LANGUAGE_EXAM': 'green',
            'ENGLISH_EXAM': 'purple',
            'PSYCHOLOGICAL_INTERVIEW': 'pink',
            'CYCLE_DIRECTOR_INTERVIEW': 'orange',
            'CYCLE_DIRECTOR_REPORT': 'orange'
        };
        return colors[type] || 'blue';
    };

    const handleViewDetails = (evaluation: Evaluation) => {
        setSelectedEvaluation(evaluation);
        setShowDetailModal(true);
    };

    const handleExportCSV = () => {
        const csvData = filteredEvaluations.map(e => ({
            'ID': e.id,
            'Estudiante': `${e.student?.firstName || ''} ${e.student?.lastName || ''}`,
            'Tipo': getEvaluationTypeLabel(e.evaluationType),
            'Estado': getStatusLabel(e.status),
            'Puntaje': e.score || '',
            'Evaluador': `${e.evaluator?.firstName || ''} ${e.evaluator?.lastName || ''}`,
            'Fecha Evaluación': e.evaluationDate ? new Date(e.evaluationDate).toLocaleDateString() : '',
            'Fecha Completado': e.completionDate ? new Date(e.completionDate).toLocaleDateString() : '',
            'Observaciones': e.observations || '',
            'Recomendaciones': e.recommendations || ''
        }));

        const csv = [
            Object.keys(csvData[0]).join(','),
            ...csvData.map(row => Object.values(row).map(val => `"${val}"`).join(','))
        ].join('\n');

        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', `evaluaciones_${new Date().toISOString().split('T')[0]}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    // Estadísticas
    const stats = {
        total: evaluations.length,
        completed: evaluations.filter(e => e.status === 'COMPLETED' || e.status === 'REVIEWED' || e.status === 'APPROVED').length,
        inProgress: evaluations.filter(e => e.status === 'IN_PROGRESS').length,
        pending: evaluations.filter(e => e.status === 'PENDING').length
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                <span className="ml-3 text-gray-600">Cargando evaluaciones...</span>
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-red-50 border border-red-200 rounded-lg p-6">
                <div className="flex items-start">
                    <FiAlertCircle className="w-6 h-6 text-red-600 mr-3 mt-0.5" />
                    <div>
                        <p className="text-sm font-medium text-red-800">Error al cargar evaluaciones</p>
                        <p className="text-sm text-red-700 mt-1">{error}</p>
                        <Button
                            variant="secondary"
                            size="sm"
                            onClick={loadEvaluations}
                            className="mt-3"
                        >
                            <FiRefreshCw className="w-4 h-4 mr-2" />
                            Reintentar
                        </Button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className={`space-y-6 ${className}`}>
            {/* Estadísticas */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card className="p-4 bg-blue-50 border-blue-200">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-blue-600">Total Evaluaciones</p>
                            <p className="text-2xl font-bold text-blue-700">{stats.total}</p>
                        </div>
                        <FiFileText className="h-8 w-8 text-blue-500" />
                    </div>
                </Card>

                <Card className="p-4 bg-green-50 border-green-200">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-green-600">Completadas</p>
                            <p className="text-2xl font-bold text-green-700">{stats.completed}</p>
                        </div>
                        <FiCheckCircle className="h-8 w-8 text-green-500" />
                    </div>
                </Card>

                <Card className="p-4 bg-yellow-50 border-yellow-200">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-yellow-600">En Progreso</p>
                            <p className="text-2xl font-bold text-yellow-700">{stats.inProgress}</p>
                        </div>
                        <FiClock className="h-8 w-8 text-yellow-500" />
                    </div>
                </Card>

                <Card className="p-4 bg-red-50 border-red-200">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-red-600">Pendientes</p>
                            <p className="text-2xl font-bold text-red-700">{stats.pending}</p>
                        </div>
                        <FiAlertCircle className="h-8 w-8 text-red-500" />
                    </div>
                </Card>
            </div>

            {/* Filtros y Acciones */}
            <Card className="p-4">
                <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
                    <div className="flex flex-col md:flex-row gap-3 flex-1">
                        {/* Búsqueda */}
                        <input
                            type="text"
                            placeholder="Buscar por estudiante o evaluador..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />

                        {/* Filtro por Tipo */}
                        <select
                            value={filterType}
                            onChange={(e) => setFilterType(e.target.value)}
                            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                            <option value="ALL">Todos los tipos</option>
                            <option value="MATHEMATICS_EXAM">Matemáticas</option>
                            <option value="LANGUAGE_EXAM">Lenguaje</option>
                            <option value="ENGLISH_EXAM">Inglés</option>
                            <option value="PSYCHOLOGICAL_INTERVIEW">Psicológica</option>
                            <option value="CYCLE_DIRECTOR_INTERVIEW">Director</option>
                            <option value="CYCLE_DIRECTOR_REPORT">Informe Director</option>
                        </select>

                        {/* Filtro por Estado */}
                        <select
                            value={filterStatus}
                            onChange={(e) => setFilterStatus(e.target.value)}
                            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                            <option value="ALL">Todos los estados</option>
                            <option value="PENDING">Pendiente</option>
                            <option value="IN_PROGRESS">En Progreso</option>
                            <option value="COMPLETED">Completada</option>
                            <option value="REVIEWED">Revisada</option>
                            <option value="APPROVED">Aprobada</option>
                        </select>
                    </div>

                    {/* Acciones */}
                    <div className="flex gap-2">
                        <Button
                            variant="secondary"
                            size="sm"
                            onClick={loadEvaluations}
                        >
                            <FiRefreshCw className="w-4 h-4 mr-2" />
                            Actualizar
                        </Button>
                        <Button
                            variant="primary"
                            size="sm"
                            onClick={handleExportCSV}
                            disabled={filteredEvaluations.length === 0}
                        >
                            <FiDownload className="w-4 h-4 mr-2" />
                            Exportar CSV
                        </Button>
                    </div>
                </div>

                <div className="mt-3 text-sm text-gray-600">
                    Mostrando {filteredEvaluations.length} de {evaluations.length} evaluaciones
                </div>
            </Card>

            {/* Lista de Evaluaciones */}
            <div className="grid grid-cols-1 gap-4">
                {filteredEvaluations.length === 0 ? (
                    <Card className="p-8 text-center">
                        <FiFileText className="w-12 h-12 mx-auto text-gray-400 mb-3" />
                        <p className="text-gray-600">No se encontraron evaluaciones con los filtros aplicados</p>
                    </Card>
                ) : (
                    filteredEvaluations.map((evaluation) => (
                        <Card key={evaluation.id} className="p-4 hover:shadow-md transition-shadow">
                            <div className="flex items-start justify-between">
                                {/* Información Principal */}
                                <div className="flex-1 grid grid-cols-1 md:grid-cols-4 gap-4">
                                    {/* Estudiante */}
                                    <div>
                                        <p className="text-xs text-gray-500 mb-1">Estudiante</p>
                                        <p className="font-medium text-gray-900">
                                            {evaluation.student?.firstName} {evaluation.student?.lastName}
                                        </p>
                                        <p className="text-xs text-gray-500 mt-1">
                                            App ID: {evaluation.applicationId}
                                        </p>
                                    </div>

                                    {/* Tipo y Evaluador */}
                                    <div>
                                        <p className="text-xs text-gray-500 mb-1">Tipo</p>
                                        <Badge variant={getTypeColor(evaluation.evaluationType)} size="sm" className="mb-2">
                                            {getEvaluationTypeLabel(evaluation.evaluationType)}
                                        </Badge>
                                        <p className="text-xs text-gray-600 flex items-center">
                                            <FiUser className="w-3 h-3 mr-1" />
                                            {evaluation.evaluator?.firstName} {evaluation.evaluator?.lastName}
                                        </p>
                                    </div>

                                    {/* Estado y Puntaje */}
                                    <div>
                                        <p className="text-xs text-gray-500 mb-1">Estado</p>
                                        <Badge variant={getStatusColor(evaluation.status)} size="sm" className="mb-2">
                                            {getStatusLabel(evaluation.status)}
                                        </Badge>
                                        {evaluation.score !== null && evaluation.score !== undefined && (
                                            <p className="text-xs text-gray-600 flex items-center">
                                                <FiStar className="w-3 h-3 mr-1 text-yellow-500" />
                                                Puntaje: {evaluation.score}
                                            </p>
                                        )}
                                    </div>

                                    {/* Fechas */}
                                    <div>
                                        <p className="text-xs text-gray-500 mb-1">Fechas</p>
                                        {evaluation.completionDate && (
                                            <p className="text-xs text-gray-600 flex items-center mb-1">
                                                <FiCheckCircle className="w-3 h-3 mr-1 text-green-500" />
                                                {new Date(evaluation.completionDate).toLocaleDateString('es-ES')}
                                            </p>
                                        )}
                                        {evaluation.createdAt && (
                                            <p className="text-xs text-gray-500 flex items-center">
                                                <FiCalendar className="w-3 h-3 mr-1" />
                                                Creada: {new Date(evaluation.createdAt).toLocaleDateString('es-ES')}
                                            </p>
                                        )}
                                    </div>
                                </div>

                                {/* Acciones */}
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleViewDetails(evaluation)}
                                >
                                    <FiEye className="w-4 h-4 mr-2" />
                                    Ver Detalles
                                </Button>
                            </div>

                            {/* Observaciones Preview */}
                            {evaluation.observations && (
                                <div className="mt-3 pt-3 border-t border-gray-200">
                                    <p className="text-xs text-gray-500">Observaciones:</p>
                                    <p className="text-sm text-gray-700 line-clamp-2">{evaluation.observations}</p>
                                </div>
                            )}
                        </Card>
                    ))
                )}
            </div>

            {/* Modal de Detalle */}
            {showDetailModal && selectedEvaluation && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
                        {/* Header */}
                        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
                            <div>
                                <h2 className="text-xl font-bold text-gray-900">Detalle de Evaluación</h2>
                                <p className="text-sm text-gray-600">ID: {selectedEvaluation.id}</p>
                            </div>
                            <button
                                onClick={() => setShowDetailModal(false)}
                                className="text-gray-400 hover:text-gray-600 transition-colors"
                            >
                                <FiX className="w-6 h-6" />
                            </button>
                        </div>

                        {/* Content */}
                        <div className="p-6 space-y-6">
                            {/* Información General */}
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <p className="text-sm font-medium text-gray-700">Estudiante</p>
                                    <p className="text-base text-gray-900">
                                        {selectedEvaluation.student?.firstName} {selectedEvaluation.student?.lastName}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-gray-700">Evaluador</p>
                                    <p className="text-base text-gray-900">
                                        {selectedEvaluation.evaluator?.firstName} {selectedEvaluation.evaluator?.lastName}
                                    </p>
                                    <p className="text-xs text-gray-600">{selectedEvaluation.evaluator?.email}</p>
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-gray-700">Tipo de Evaluación</p>
                                    <Badge variant={getTypeColor(selectedEvaluation.evaluationType)}>
                                        {getEvaluationTypeLabel(selectedEvaluation.evaluationType)}
                                    </Badge>
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-gray-700">Estado</p>
                                    <Badge variant={getStatusColor(selectedEvaluation.status)}>
                                        {getStatusLabel(selectedEvaluation.status)}
                                    </Badge>
                                </div>
                            </div>

                            {/* Puntajes y Recomendación */}
                            {(selectedEvaluation.score !== null || selectedEvaluation.finalRecommendation !== null) && (
                                <div className="border-t border-gray-200 pt-4">
                                    <h3 className="text-lg font-semibold text-gray-900 mb-3">Resultados</h3>
                                    <div className="grid grid-cols-2 gap-4">
                                        {selectedEvaluation.score !== null && selectedEvaluation.score !== undefined && (
                                            <div>
                                                <p className="text-sm font-medium text-gray-700">Puntaje</p>
                                                <p className="text-2xl font-bold text-blue-600">{selectedEvaluation.score}</p>
                                            </div>
                                        )}
                                        {selectedEvaluation.finalRecommendation !== null && selectedEvaluation.finalRecommendation !== undefined && (
                                            <div>
                                                <p className="text-sm font-medium text-gray-700">Recomendación Final</p>
                                                <Badge variant={selectedEvaluation.finalRecommendation ? 'green' : 'red'}>
                                                    {selectedEvaluation.finalRecommendation ? 'APROBADO' : 'NO APROBADO'}
                                                </Badge>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* Observaciones y Comentarios */}
                            <div className="border-t border-gray-200 pt-4 space-y-4">
                                <h3 className="text-lg font-semibold text-gray-900">Detalles de la Evaluación</h3>

                                {selectedEvaluation.observations && (
                                    <div>
                                        <p className="text-sm font-medium text-gray-700">Observaciones</p>
                                        <p className="text-sm text-gray-900 bg-gray-50 rounded p-3 mt-1">
                                            {selectedEvaluation.observations}
                                        </p>
                                    </div>
                                )}

                                {selectedEvaluation.strengths && (
                                    <div>
                                        <p className="text-sm font-medium text-gray-700">Fortalezas</p>
                                        <p className="text-sm text-gray-900 bg-green-50 rounded p-3 mt-1">
                                            {selectedEvaluation.strengths}
                                        </p>
                                    </div>
                                )}

                                {selectedEvaluation.areasForImprovement && (
                                    <div>
                                        <p className="text-sm font-medium text-gray-700">Áreas de Mejora</p>
                                        <p className="text-sm text-gray-900 bg-yellow-50 rounded p-3 mt-1">
                                            {selectedEvaluation.areasForImprovement}
                                        </p>
                                    </div>
                                )}

                                {selectedEvaluation.recommendations && (
                                    <div>
                                        <p className="text-sm font-medium text-gray-700">Recomendaciones</p>
                                        <p className="text-sm text-gray-900 bg-blue-50 rounded p-3 mt-1">
                                            {selectedEvaluation.recommendations}
                                        </p>
                                    </div>
                                )}

                                {/* Campos adicionales de entrevistas psicológicas y director */}
                                {selectedEvaluation.socialSkillsAssessment && (
                                    <div>
                                        <p className="text-sm font-medium text-gray-700">Habilidades Sociales</p>
                                        <p className="text-sm text-gray-900 bg-gray-50 rounded p-3 mt-1">
                                            {selectedEvaluation.socialSkillsAssessment}
                                        </p>
                                    </div>
                                )}

                                {selectedEvaluation.emotionalMaturity && (
                                    <div>
                                        <p className="text-sm font-medium text-gray-700">Madurez Emocional</p>
                                        <p className="text-sm text-gray-900 bg-gray-50 rounded p-3 mt-1">
                                            {selectedEvaluation.emotionalMaturity}
                                        </p>
                                    </div>
                                )}

                                {selectedEvaluation.behavioralAssessment && (
                                    <div>
                                        <p className="text-sm font-medium text-gray-700">Evaluación Conductual</p>
                                        <p className="text-sm text-gray-900 bg-gray-50 rounded p-3 mt-1">
                                            {selectedEvaluation.behavioralAssessment}
                                        </p>
                                    </div>
                                )}

                                {selectedEvaluation.motivationAssessment && (
                                    <div>
                                        <p className="text-sm font-medium text-gray-700">Motivación</p>
                                        <p className="text-sm text-gray-900 bg-gray-50 rounded p-3 mt-1">
                                            {selectedEvaluation.motivationAssessment}
                                        </p>
                                    </div>
                                )}

                                {selectedEvaluation.familySupportAssessment && (
                                    <div>
                                        <p className="text-sm font-medium text-gray-700">Apoyo Familiar</p>
                                        <p className="text-sm text-gray-900 bg-gray-50 rounded p-3 mt-1">
                                            {selectedEvaluation.familySupportAssessment}
                                        </p>
                                    </div>
                                )}

                                {selectedEvaluation.integrationPotential && (
                                    <div>
                                        <p className="text-sm font-medium text-gray-700">Potencial de Integración</p>
                                        <p className="text-sm text-gray-900 bg-gray-50 rounded p-3 mt-1">
                                            {selectedEvaluation.integrationPotential}
                                        </p>
                                    </div>
                                )}

                                {selectedEvaluation.academicReadiness && (
                                    <div>
                                        <p className="text-sm font-medium text-gray-700">Preparación Académica</p>
                                        <p className="text-sm text-gray-900 bg-gray-50 rounded p-3 mt-1">
                                            {selectedEvaluation.academicReadiness}
                                        </p>
                                    </div>
                                )}
                            </div>

                            {/* Fechas */}
                            <div className="border-t border-gray-200 pt-4">
                                <h3 className="text-lg font-semibold text-gray-900 mb-3">Fechas</h3>
                                <div className="grid grid-cols-2 gap-4 text-sm">
                                    {selectedEvaluation.evaluationDate && (
                                        <div>
                                            <p className="text-gray-700">Fecha de Evaluación</p>
                                            <p className="text-gray-900">{new Date(selectedEvaluation.evaluationDate).toLocaleDateString('es-ES')}</p>
                                        </div>
                                    )}
                                    {selectedEvaluation.completionDate && (
                                        <div>
                                            <p className="text-gray-700">Fecha de Completado</p>
                                            <p className="text-gray-900">{new Date(selectedEvaluation.completionDate).toLocaleDateString('es-ES')}</p>
                                        </div>
                                    )}
                                    {selectedEvaluation.createdAt && (
                                        <div>
                                            <p className="text-gray-700">Fecha de Creación</p>
                                            <p className="text-gray-900">{new Date(selectedEvaluation.createdAt).toLocaleDateString('es-ES')}</p>
                                        </div>
                                    )}
                                    {selectedEvaluation.updatedAt && (
                                        <div>
                                            <p className="text-gray-700">Última Actualización</p>
                                            <p className="text-gray-900">{new Date(selectedEvaluation.updatedAt).toLocaleDateString('es-ES')}</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 px-6 py-4 flex justify-end">
                            <Button
                                variant="secondary"
                                onClick={() => setShowDetailModal(false)}
                            >
                                Cerrar
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default EvaluationVisualization;
