import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Badge from '../components/ui/Badge';
import { ArrowLeftIcon, SaveIcon, CheckCircleIcon, ClockIcon } from '../components/icons/Icons';
import { useFormValidation } from '../hooks/useFormValidation';
import { useNotifications } from '../context/AppContext';
import { 
    mockStudentExams, 
    mockStudentProfiles, 
    mockProfessors 
} from '../services/professorMockData';
import { ExamEvaluation, AreaScore } from '../types';

const ExamEvaluation: React.FC = () => {
    const { examId } = useParams<{ examId: string }>();
    const navigate = useNavigate();
    const { addNotification } = useNotifications();
    
    // Obtener profesor actual del localStorage
    const [currentProfessor] = useState(() => {
        const storedProfessor = localStorage.getItem('currentProfessor');
        return storedProfessor ? JSON.parse(storedProfessor) : null;
    });
    
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [areaScores, setAreaScores] = useState<AreaScore[]>([]);
    const [strengths, setStrengths] = useState<string[]>(['']);
    const [weaknesses, setWeaknesses] = useState<string[]>(['']);
    const [improvementAreas, setImprovementAreas] = useState<string[]>(['']);

    const exam = mockStudentExams.find(e => e.id === examId);
    const student = mockStudentProfiles.find(s => s.id === exam?.studentId);

    const validationConfig = {
        score: { required: true, custom: (value: number) => {
            if (value < 0) return 'El puntaje no puede ser negativo';
            if (value > maxScore) return `El puntaje no puede ser mayor a ${maxScore}`;
            return null;
        }},
        maxScore: { required: true, custom: (value: number) => value <= 0 ? 'El puntaje máximo debe ser mayor a 0' : null },
        grade: { required: true },
        examAdaptation: { required: true, minLength: 10 },
        behaviorObservations: { required: true, minLength: 10 },
        generalComments: { required: true, minLength: 20 },
        recommendations: { required: true, minLength: 10 }
    };

    const { data, errors, updateField, touchField, validateForm } = useFormValidation(
        validationConfig,
        {
            score: exam?.score || 0,
            maxScore: getMaxScoreBySubject(exam?.subjectId || ''),
            grade: '',
            examAdaptation: '',
            behaviorObservations: '',
            generalComments: '',
            recommendations: '',
            requiresFollowUp: false
        }
    );

    const maxScore = data.maxScore || getMaxScoreBySubject(exam?.subjectId || '');
    const percentage = data.score && maxScore ? Math.round((data.score / maxScore) * 100) : 0;

    useEffect(() => {
        if (exam?.subjectId) {
            initializeAreaScores(exam.subjectId);
        }
    }, [exam?.subjectId]);

    function getMaxScoreBySubject(subjectId: string): number {
        const maxScores: { [key: string]: number } = {
            'MATH': 30,
            'SPANISH': 35,
            'ENGLISH': 25
        };
        return maxScores[subjectId] || 30;
    }

    function getSubjectName(subjectId: string): string {
        const names: { [key: string]: string } = {
            'MATH': 'Matemática',
            'SPANISH': 'Lenguaje y Comunicación',
            'ENGLISH': 'Inglés'
        };
        return names[subjectId] || subjectId;
    }

    function initializeAreaScores(subjectId: string) {
        const areas: { [key: string]: string[] } = {
            'MATH': ['Números y Operaciones', 'Álgebra', 'Geometría', 'Resolución de Problemas'],
            'SPANISH': ['Comprensión Lectora', 'Gramática y Ortografía', 'Expresión Escrita', 'Vocabulario'],
            'ENGLISH': ['Grammar', 'Vocabulary', 'Reading Comprehension', 'Writing']
        };

        const subjectAreas = areas[subjectId] || [];
        const scorePerArea = Math.floor(maxScore / subjectAreas.length);
        
        setAreaScores(subjectAreas.map(area => ({
            area,
            score: 0,
            maxScore: scorePerArea,
            percentage: 0,
            comments: ''
        })));
    }

    const updateAreaScore = (index: number, field: keyof AreaScore, value: any) => {
        setAreaScores(prev => {
            const updated = [...prev];
            updated[index] = { ...updated[index], [field]: value };
            
            if (field === 'score') {
                updated[index].percentage = updated[index].maxScore ? 
                    Math.round((value / updated[index].maxScore) * 100) : 0;
            }
            
            return updated;
        });
    };

    const addToList = (list: string[], setList: React.Dispatch<React.SetStateAction<string[]>>) => {
        setList([...list, '']);
    };

    const updateListItem = (list: string[], setList: React.Dispatch<React.SetStateAction<string[]>>, index: number, value: string) => {
        const updated = [...list];
        updated[index] = value;
        setList(updated);
    };

    const removeFromList = (list: string[], setList: React.Dispatch<React.SetStateAction<string[]>>, index: number) => {
        if (list.length > 1) {
            setList(list.filter((_, i) => i !== index));
        }
    };

    const calculateGrade = (percentage: number): string => {
        // Sistema de notas chileno (1.0 - 7.0)
        if (percentage >= 90) return '7.0';
        if (percentage >= 85) return '6.5';
        if (percentage >= 80) return '6.0';
        if (percentage >= 75) return '5.5';
        if (percentage >= 70) return '5.0';
        if (percentage >= 65) return '4.5';
        if (percentage >= 60) return '4.0';
        if (percentage >= 55) return '3.5';
        if (percentage >= 50) return '3.0';
        if (percentage >= 40) return '2.0';
        return '1.0';
    };

    useEffect(() => {
        if (percentage > 0) {
            updateField('grade', calculateGrade(percentage));
        }
    }, [percentage]);

    const handleSubmit = async () => {
        if (!validateForm()) {
            addNotification({
                type: 'error',
                title: 'Error de validación',
                message: 'Por favor completa todos los campos requeridos'
            });
            return;
        }

        setIsSubmitting(true);
        
        try {
            // Simular guardado de evaluación
            await new Promise(resolve => setTimeout(resolve, 2000));
            
            const evaluation: ExamEvaluation = {
                id: `EVAL-${Date.now()}`,
                examId: examId!,
                professorId: currentProfessor.id,
                evaluatedAt: new Date().toISOString(),
                score: data.score,
                maxScore: data.maxScore,
                percentage,
                grade: data.grade,
                strengths: strengths.filter(s => s.trim() !== ''),
                weaknesses: weaknesses.filter(w => w.trim() !== ''),
                examAdaptation: data.examAdaptation,
                behaviorObservations: data.behaviorObservations,
                generalComments: data.generalComments,
                improvementAreas: improvementAreas.filter(i => i.trim() !== ''),
                areaScores: areaScores.filter(a => a.score > 0),
                recommendations: data.recommendations,
                requiresFollowUp: data.requiresFollowUp,
                followUpNotes: data.followUpNotes || ''
            };

            addNotification({
                type: 'success',
                title: 'Evaluación guardada',
                message: `La evaluación de ${student?.firstName} ${student?.lastName} ha sido guardada exitosamente`
            });

            navigate('/profesor');
        } catch (error) {
            addNotification({
                type: 'error',
                title: 'Error al guardar',
                message: 'No se pudo guardar la evaluación. Intenta nuevamente.'
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!exam || !student) {
        return (
            <div className="bg-gray-50 min-h-screen py-12">
                <div className="container mx-auto px-6 text-center">
                    <h1 className="text-2xl font-bold text-azul-monte-tabor mb-4">
                        Examen no encontrado
                    </h1>
                    <Button variant="primary" onClick={() => navigate('/profesor')}>
                        Volver al Dashboard
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-gray-50 min-h-screen py-8">
            <div className="container mx-auto px-6 max-w-4xl">
                {/* Header */}
                <div className="mb-6">
                    <button 
                        onClick={() => navigate('/profesor')}
                        className="inline-flex items-center text-azul-monte-tabor hover:text-blue-800 transition-colors mb-4"
                    >
                        <ArrowLeftIcon className="w-4 h-4 mr-2" />
                        Volver al Dashboard
                    </button>
                    
                    <Card className="p-6 bg-gradient-to-r from-azul-monte-tabor to-blue-700 text-blanco-pureza">
                        <div className="flex items-center justify-between">
                            <div>
                                <h1 className="text-2xl font-bold mb-2">
                                    Evaluación de Examen
                                </h1>
                                <p className="text-blue-100">
                                    <strong>Estudiante:</strong> {student.firstName} {student.lastName} ({student.grade})
                                </p>
                                <p className="text-blue-100">
                                    <strong>Asignatura:</strong> {getSubjectName(exam.subjectId)}
                                </p>
                                <p className="text-blue-100 text-sm">
                                    <strong>Fecha del Examen:</strong> {new Date(exam.completedAt!).toLocaleDateString('es-CL')}
                                </p>
                            </div>
                            <div className="text-right">
                                <ClockIcon className="w-12 h-12 text-blue-200 mb-2" />
                                <p className="text-blue-100 text-sm">
                                    Tiempo: {exam.timeSpent} min
                                </p>
                            </div>
                        </div>
                    </Card>
                </div>

                {/* Calificación General */}
                <Card className="p-6 mb-6">
                    <h2 className="text-xl font-bold text-azul-monte-tabor mb-4">Calificación General</h2>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                        <Input
                            id="score"
                            label="Puntaje Obtenido"
                            type="number"
                            value={data.score}
                            onChange={(e) => updateField('score', parseInt(e.target.value))}
                            onBlur={() => touchField('score')}
                            error={errors.score}
                            isRequired
                        />
                        <Input
                            id="maxScore"
                            label="Puntaje Máximo"
                            type="number"
                            value={data.maxScore}
                            onChange={(e) => updateField('maxScore', parseInt(e.target.value))}
                            onBlur={() => touchField('maxScore')}
                            error={errors.maxScore}
                            isRequired
                        />
                        <div>
                            <label className="block text-sm font-medium text-gris-piedra mb-1">
                                Porcentaje
                            </label>
                            <div className="bg-gray-50 p-2 rounded-lg text-center">
                                <Badge variant={percentage >= 70 ? 'success' : percentage >= 50 ? 'warning' : 'error'} size="lg">
                                    {percentage}%
                                </Badge>
                            </div>
                        </div>
                        <Input
                            id="grade"
                            label="Nota (1.0 - 7.0)"
                            value={data.grade}
                            onChange={(e) => updateField('grade', e.target.value)}
                            onBlur={() => touchField('grade')}
                            error={errors.grade}
                            isRequired
                            readOnly
                        />
                    </div>
                </Card>

                {/* Evaluación por Áreas */}
                <Card className="p-6 mb-6">
                    <h2 className="text-xl font-bold text-azul-monte-tabor mb-4">Evaluación por Áreas</h2>
                    <div className="space-y-4">
                        {areaScores.map((area, index) => (
                            <div key={index} className="border border-gray-200 rounded-lg p-4">
                                <h3 className="font-semibold text-azul-monte-tabor mb-3">{area.area}</h3>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <Input
                                        id={`area-score-${index}`}
                                        label="Puntaje"
                                        type="number"
                                        value={area.score}
                                        onChange={(e) => updateAreaScore(index, 'score', parseInt(e.target.value))}
                                        placeholder="0"
                                    />
                                    <Input
                                        id={`area-max-${index}`}
                                        label="Puntaje Máximo"
                                        type="number"
                                        value={area.maxScore}
                                        onChange={(e) => updateAreaScore(index, 'maxScore', parseInt(e.target.value))}
                                    />
                                    <div>
                                        <label className="block text-sm font-medium text-gris-piedra mb-1">
                                            Porcentaje
                                        </label>
                                        <div className="bg-gray-50 p-2 rounded-lg text-center">
                                            <Badge variant={area.percentage >= 70 ? 'success' : area.percentage >= 50 ? 'warning' : 'neutral'}>
                                                {area.percentage}%
                                            </Badge>
                                        </div>
                                    </div>
                                </div>
                                <div className="mt-3">
                                    <label className="block text-sm font-medium text-gris-piedra mb-1">
                                        Comentarios del Área
                                    </label>
                                    <textarea
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-azul-monte-tabor"
                                        rows={2}
                                        value={area.comments}
                                        onChange={(e) => updateAreaScore(index, 'comments', e.target.value)}
                                        placeholder="Comentarios específicos sobre esta área..."
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                </Card>

                {/* Fortalezas */}
                <Card className="p-6 mb-6">
                    <h2 className="text-xl font-bold text-azul-monte-tabor mb-4">Fortalezas del Estudiante</h2>
                    <div className="space-y-3">
                        {strengths.map((strength, index) => (
                            <div key={index} className="flex items-center gap-3">
                                <div className="flex-1">
                                    <textarea
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-azul-monte-tabor"
                                        rows={2}
                                        value={strength}
                                        onChange={(e) => updateListItem(strengths, setStrengths, index, e.target.value)}
                                        placeholder="Describe una fortaleza observada..."
                                    />
                                </div>
                                <div className="flex gap-2">
                                    <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={() => addToList(strengths, setStrengths)}
                                    >
                                        +
                                    </Button>
                                    {strengths.length > 1 && (
                                        <Button
                                            size="sm"
                                            variant="danger"
                                            onClick={() => removeFromList(strengths, setStrengths, index)}
                                        >
                                            ×
                                        </Button>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </Card>

                {/* Debilidades */}
                <Card className="p-6 mb-6">
                    <h2 className="text-xl font-bold text-azul-monte-tabor mb-4">Áreas a Mejorar</h2>
                    <div className="space-y-3">
                        {weaknesses.map((weakness, index) => (
                            <div key={index} className="flex items-center gap-3">
                                <div className="flex-1">
                                    <textarea
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-azul-monte-tabor"
                                        rows={2}
                                        value={weakness}
                                        onChange={(e) => updateListItem(weaknesses, setWeaknesses, index, e.target.value)}
                                        placeholder="Describe un área que necesita mejora..."
                                    />
                                </div>
                                <div className="flex gap-2">
                                    <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={() => addToList(weaknesses, setWeaknesses)}
                                    >
                                        +
                                    </Button>
                                    {weaknesses.length > 1 && (
                                        <Button
                                            size="sm"
                                            variant="danger"
                                            onClick={() => removeFromList(weaknesses, setWeaknesses, index)}
                                        >
                                            ×
                                        </Button>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </Card>

                {/* Observaciones Cualitativas */}
                <Card className="p-6 mb-6">
                    <h2 className="text-xl font-bold text-azul-monte-tabor mb-4">Observaciones Cualitativas</h2>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gris-piedra mb-1">
                                Adecuación al Examen <span className="text-rojo-sagrado">*</span>
                            </label>
                            <textarea
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-azul-monte-tabor"
                                rows={3}
                                value={data.examAdaptation}
                                onChange={(e) => updateField('examAdaptation', e.target.value)}
                                onBlur={() => touchField('examAdaptation')}
                                placeholder="Describe cómo se adaptó el estudiante al formato y estructura del examen..."
                            />
                            {errors.examAdaptation && <p className="mt-1 text-xs text-rojo-sagrado">{errors.examAdaptation}</p>}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gris-piedra mb-1">
                                Comportamiento Durante el Examen <span className="text-rojo-sagrado">*</span>
                            </label>
                            <textarea
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-azul-monte-tabor"
                                rows={3}
                                value={data.behaviorObservations}
                                onChange={(e) => updateField('behaviorObservations', e.target.value)}
                                onBlur={() => touchField('behaviorObservations')}
                                placeholder="Observaciones sobre concentración, actitud, seguimiento de instrucciones..."
                            />
                            {errors.behaviorObservations && <p className="mt-1 text-xs text-rojo-sagrado">{errors.behaviorObservations}</p>}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gris-piedra mb-1">
                                Comentarios Generales <span className="text-rojo-sagrado">*</span>
                            </label>
                            <textarea
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-azul-monte-tabor"
                                rows={4}
                                value={data.generalComments}
                                onChange={(e) => updateField('generalComments', e.target.value)}
                                onBlur={() => touchField('generalComments')}
                                placeholder="Comentarios generales sobre el desempeño, metodología, y otros aspectos relevantes..."
                            />
                            {errors.generalComments && <p className="mt-1 text-xs text-rojo-sagrado">{errors.generalComments}</p>}
                        </div>
                    </div>
                </Card>

                {/* Elementos a Mejorar */}
                <Card className="p-6 mb-6">
                    <h2 className="text-xl font-bold text-azul-monte-tabor mb-4">Elementos Específicos a Mejorar</h2>
                    <div className="space-y-3">
                        {improvementAreas.map((area, index) => (
                            <div key={index} className="flex items-center gap-3">
                                <div className="flex-1">
                                    <textarea
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-azul-monte-tabor"
                                        rows={2}
                                        value={area}
                                        onChange={(e) => updateListItem(improvementAreas, setImprovementAreas, index, e.target.value)}
                                        placeholder="Elemento específico que el estudiante debe mejorar..."
                                    />
                                </div>
                                <div className="flex gap-2">
                                    <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={() => addToList(improvementAreas, setImprovementAreas)}
                                    >
                                        +
                                    </Button>
                                    {improvementAreas.length > 1 && (
                                        <Button
                                            size="sm"
                                            variant="danger"
                                            onClick={() => removeFromList(improvementAreas, setImprovementAreas, index)}
                                        >
                                            ×
                                        </Button>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </Card>

                {/* Recomendaciones */}
                <Card className="p-6 mb-6">
                    <h2 className="text-xl font-bold text-azul-monte-tabor mb-4">Recomendaciones y Seguimiento</h2>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gris-piedra mb-1">
                                Recomendaciones <span className="text-rojo-sagrado">*</span>
                            </label>
                            <textarea
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-azul-monte-tabor"
                                rows={4}
                                value={data.recommendations}
                                onChange={(e) => updateField('recommendations', e.target.value)}
                                onBlur={() => touchField('recommendations')}
                                placeholder="Recomendaciones específicas para el estudiante, padres y profesores..."
                            />
                            {errors.recommendations && <p className="mt-1 text-xs text-rojo-sagrado">{errors.recommendations}</p>}
                        </div>

                        <div className="flex items-center gap-3">
                            <input
                                type="checkbox"
                                id="requiresFollowUp"
                                checked={data.requiresFollowUp}
                                onChange={(e) => updateField('requiresFollowUp', e.target.checked)}
                                className="rounded border-gray-300 text-azul-monte-tabor focus:ring-azul-monte-tabor"
                            />
                            <label htmlFor="requiresFollowUp" className="text-sm font-medium text-gris-piedra">
                                Requiere seguimiento adicional
                            </label>
                        </div>

                        {data.requiresFollowUp && (
                            <div>
                                <label className="block text-sm font-medium text-gris-piedra mb-1">
                                    Notas de Seguimiento
                                </label>
                                <textarea
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-azul-monte-tabor"
                                    rows={3}
                                    value={data.followUpNotes || ''}
                                    onChange={(e) => updateField('followUpNotes', e.target.value)}
                                    placeholder="Especifica qué tipo de seguimiento se requiere y cuándo..."
                                />
                            </div>
                        )}
                    </div>
                </Card>

                {/* Botones de Acción */}
                <div className="flex justify-between items-center">
                    <Button 
                        variant="outline" 
                        onClick={() => navigate('/profesor')}
                    >
                        Cancelar
                    </Button>
                    <Button 
                        variant="primary"
                        onClick={handleSubmit}
                        isLoading={isSubmitting}
                        loadingText="Guardando..."
                        leftIcon={<SaveIcon className="w-4 h-4" />}
                    >
                        Guardar Evaluación
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default ExamEvaluation;