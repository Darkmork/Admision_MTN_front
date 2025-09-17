import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Card from '../ui/Card';
import Button from '../ui/Button';
import Input from '../ui/Input';
import { ArrowLeftIcon, SaveIcon, FileTextIcon, PrinterIcon } from '../icons/Icons';
import { useNotifications } from '../../context/AppContext';
import { professorEvaluationService, ProfessorEvaluation } from '../../services/professorEvaluationService';
import { EvaluationType } from '../../types/evaluation';

interface AdmissionReportData {
    studentName: string;
    birthDate: string;
    age: string;
    currentSchool: string;
    gradeApplied: string;
    evaluatorName: string;
    
    // Actitud frente al examen
    strengths: string;
    difficulties: string;
    examAdaptation: string;
    observations: string;
    
    // Resultados académicos
    subject: string;
    score: number;
    maxScore: number;
    percentage: number;
    comments: string;
    areasToWork: string;
}

const AdmissionReportForm: React.FC = () => {
    const { examId } = useParams<{ examId: string }>();
    const navigate = useNavigate();
    const { addNotification } = useNotifications();
    
    const [evaluation, setEvaluation] = useState<ProfessorEvaluation | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    
    const [reportData, setReportData] = useState<AdmissionReportData>({
        studentName: '',
        birthDate: '',
        age: '',
        currentSchool: '',
        gradeApplied: '',
        evaluatorName: '',
        strengths: '',
        difficulties: '',
        examAdaptation: '',
        observations: '',
        subject: '',
        score: 0,
        maxScore: 30,
        percentage: 0,
        comments: '',
        areasToWork: ''
    });

    // Obtener profesor actual del localStorage
    const [currentProfessor] = useState(() => {
        const storedProfessor = localStorage.getItem('currentProfessor');
        return storedProfessor ? JSON.parse(storedProfessor) : null;
    });

    useEffect(() => {
        const loadEvaluation = async () => {
            if (!examId) return;
            
            try {
                setIsLoading(true);
                console.log('🔄 Cargando evaluación para informe:', examId);
                
                const foundEvaluation = await professorEvaluationService.getEvaluationById(parseInt(examId));
                
                if (foundEvaluation) {
                    setEvaluation(foundEvaluation);
                    
                    // DEBUG: Verificar qué datos de estudiante tenemos
                    console.log('🔍 DEBUG - Datos del estudiante en foundEvaluation:');
                    console.log('📋 studentName:', foundEvaluation.studentName);
                    console.log('📅 studentBirthDate:', foundEvaluation.studentBirthDate);
                    console.log('🏫 currentSchool:', foundEvaluation.currentSchool);
                    console.log('📚 studentGrade:', foundEvaluation.studentGrade);
                    console.log('🏢 application:', foundEvaluation.application);
                    if (foundEvaluation.application?.student) {
                        console.log('👤 application.student:', foundEvaluation.application.student);
                        console.log('📅 application.student.birthDate:', foundEvaluation.application.student.birthDate);
                        console.log('🏫 application.student.currentSchool:', foundEvaluation.application.student.currentSchool);
                    }
                    
                    // Calcular edad automáticamente si hay fecha de nacimiento
                    const calculateAge = (birthDate: string): string => {
                        if (!birthDate) return '';
                        const birth = new Date(birthDate);
                        const today = new Date();
                        let age = today.getFullYear() - birth.getFullYear();
                        const monthDiff = today.getMonth() - birth.getMonth();
                        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
                            age--;
                        }
                        return age.toString();
                    };
                    
                    // Obtener puntaje máximo por defecto para el tipo de evaluación
                    const defaultMaxScore = getMaxScore(foundEvaluation.evaluationType);
                    
                    // Mapear datos de la evaluación y la aplicación al formato del informe
                    setReportData(prev => ({
                        ...prev,
                        // Datos básicos del estudiante (auto-rellenados desde la postulación)
                        studentName: foundEvaluation.studentName || '',
                        gradeApplied: foundEvaluation.studentGrade || '',
                        birthDate: foundEvaluation.studentBirthDate || foundEvaluation.application?.student?.birthDate || '',
                        currentSchool: foundEvaluation.currentSchool || foundEvaluation.application?.student?.currentSchool || '',
                        
                        // Datos del evaluador
                        evaluatorName: currentProfessor ? `${currentProfessor.firstName} ${currentProfessor.lastName}` : '',
                        
                        // Datos académicos
                        subject: getSubjectName(foundEvaluation.evaluationType),
                        score: foundEvaluation.score || 0,
                        maxScore: foundEvaluation.maxScore || defaultMaxScore, // Usar maxScore guardado o el por defecto
                        percentage: foundEvaluation.score && foundEvaluation.maxScore ? 
                            Math.round((foundEvaluation.score / foundEvaluation.maxScore) * 100) : 0,
                        
                        // Campos específicos de evaluación
                        strengths: foundEvaluation.strengths || '',
                        difficulties: '',
                        examAdaptation: '',
                        observations: foundEvaluation.observations || '',
                        comments: foundEvaluation.recommendations || '',
                        areasToWork: foundEvaluation.areasForImprovement || ''
                    }));
                    
                    // Calcular edad automáticamente si tenemos fecha de nacimiento
                    const birthDate = foundEvaluation.studentBirthDate || foundEvaluation.application?.student?.birthDate;
                    if (birthDate) {
                        setReportData(prev => ({
                            ...prev,
                            age: calculateAge(birthDate)
                        }));
                    }
                    
                    console.log('✅ Evaluación cargada para informe:', foundEvaluation);
                } else {
                    console.error('❌ Evaluación no encontrada');
                    addNotification({
                        type: 'error',
                        title: 'Error',
                        message: 'Evaluación no encontrada'
                    });
                }
                
            } catch (error: any) {
                console.error('❌ Error cargando evaluación:', error);
                addNotification({
                    type: 'error',
                    title: 'Error',
                    message: 'No se pudo cargar la evaluación'
                });
            } finally {
                setIsLoading(false);
            }
        };

        loadEvaluation();
    }, [examId]); // ✅ SOLO examId como dependencia

    const getSubjectName = (evaluationType: string): string => {
        const subjects: { [key: string]: string } = {
            'MATHEMATICS_EXAM': 'Matemáticas',
            'LANGUAGE_EXAM': 'Lenguaje y Comunicación',
            'ENGLISH_EXAM': 'Inglés',
            'PSYCHOLOGICAL_INTERVIEW': 'Evaluación Psicológica',
            'CYCLE_DIRECTOR_INTERVIEW': 'Entrevista Director de Ciclo'
        };
        return subjects[evaluationType] || evaluationType;
    };

    const getMaxScore = (evaluationType: string): number => {
        const maxScores: { [key: string]: number } = {
            'MATHEMATICS_EXAM': 30,
            'LANGUAGE_EXAM': 35,
            'ENGLISH_EXAM': 25,
            'PSYCHOLOGICAL_INTERVIEW': 100,
            'CYCLE_DIRECTOR_INTERVIEW': 100
        };
        return maxScores[evaluationType] || 30;
    };

    const calculateAge = (birthDate: string): string => {
        if (!birthDate) return '';
        const birth = new Date(birthDate);
        const today = new Date();
        let age = today.getFullYear() - birth.getFullYear();
        const monthDiff = today.getMonth() - birth.getMonth();
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
            age--;
        }
        return age.toString();
    };

    const updateReportData = (field: keyof AdmissionReportData, value: string | number) => {
        setReportData(prev => {
            const newData = { ...prev, [field]: value };
            
            // Calcular porcentaje automáticamente si se cambia el score o maxScore
            if (field === 'score' || field === 'maxScore') {
                const currentScore = field === 'score' ? Number(value) : prev.score;
                const currentMaxScore = field === 'maxScore' ? Number(value) : prev.maxScore;
                newData.percentage = currentMaxScore > 0 ? Math.round((currentScore / currentMaxScore) * 100) : 0;
            }
            
            // Calcular edad automáticamente si se cambia la fecha de nacimiento
            if (field === 'birthDate') {
                newData.age = calculateAge(String(value));
            }
            
            return newData;
        });
    };

    const handleSave = async () => {
        if (!evaluation) return;
        
        setIsSubmitting(true);
        
        try {
            // Actualizar la evaluación con los datos del informe
            const updatedEvaluation: Partial<ProfessorEvaluation> = {
                score: reportData.score,
                maxScore: reportData.maxScore, // Guardar el puntaje máximo personalizado
                strengths: reportData.strengths,
                areasForImprovement: reportData.areasToWork,
                observations: `${reportData.observations}\n\nAdecuación al examen: ${reportData.examAdaptation}\nDificultades: ${reportData.difficulties}`,
                recommendations: reportData.comments
            };
            
            await professorEvaluationService.updateEvaluation(evaluation.id, updatedEvaluation);
            
            addNotification({
                type: 'success',
                title: 'Informe guardado',
                message: 'El informe de admisión ha sido guardado exitosamente'
            });
            
            // Navegar de regreso al dashboard después de guardar exitosamente
            setTimeout(() => {
                navigate('/profesor/dashboard');
            }, 1500);
            
        } catch (error) {
            console.error('❌ Error al guardar informe:', error);
            addNotification({
                type: 'error',
                title: 'Error al guardar',
                message: 'No se pudo guardar el informe. Intenta nuevamente.'
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    const handlePrint = () => {
        const printContent = document.getElementById('admission-report');
        if (printContent) {
            const newWindow = window.open('', '_blank');
            if (newWindow) {
                newWindow.document.write(`
                    <html>
                        <head>
                            <title>Informe de Admisión 2025 - ${reportData.subject}</title>
                            <style>
                                body { font-family: Arial, sans-serif; margin: 20px; }
                                .header { text-align: center; margin-bottom: 30px; }
                                .info-grid { display: grid; grid-template-columns: 200px 1fr; gap: 10px; margin-bottom: 20px; }
                                .section { margin-bottom: 30px; }
                                .section-title { font-weight: bold; margin-bottom: 15px; border-bottom: 1px solid #000; }
                                .table { width: 100%; border-collapse: collapse; }
                                .table th, .table td { border: 1px solid #000; padding: 8px; text-align: left; }
                                .field { margin-bottom: 10px; }
                                .field-label { font-weight: bold; }
                                textarea, input { border: none; outline: none; font-family: inherit; }
                            </style>
                        </head>
                        <body>
                            ${printContent.innerHTML}
                        </body>
                    </html>
                `);
                newWindow.document.close();
                newWindow.print();
            }
        }
    };

    if (isLoading) {
        return (
            <div className="bg-gray-50 min-h-screen py-12">
                <div className="container mx-auto px-6 text-center">
                    <h1 className="text-2xl font-bold text-azul-monte-tabor mb-4">
                        Cargando Informe...
                    </h1>
                    <p className="text-azul-monte-tabor">Por favor, espera mientras cargamos la información.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-gray-50 min-h-screen py-8">
            <div className="container mx-auto px-6 max-w-4xl">
                {/* Header con navegación */}
                <div className="mb-6">
                    <button 
                        onClick={() => navigate('/profesor')}
                        className="inline-flex items-center text-azul-monte-tabor hover:text-blue-800 transition-colors mb-4"
                    >
                        <ArrowLeftIcon className="w-4 h-4 mr-2" />
                        Volver al Dashboard
                    </button>
                    
                    <div className="flex justify-between items-center">
                        <h1 className="text-2xl font-bold text-azul-monte-tabor">
                            Informe de Admisión 2025
                        </h1>
                        <div className="flex gap-3">
                            <Button
                                variant="outline"
                                onClick={handlePrint}
                                leftIcon={<PrinterIcon className="w-4 h-4" />}
                            >
                                Imprimir
                            </Button>
                            <Button
                                variant="primary"
                                onClick={handleSave}
                                isLoading={isSubmitting}
                                loadingText="Guardando..."
                                leftIcon={<SaveIcon className="w-4 h-4" />}
                            >
                                Guardar
                            </Button>
                        </div>
                    </div>
                </div>

                {/* Informe imprimible */}
                <Card className="p-8" id="admission-report">
                    {/* Encabezado del informe */}
                    <div className="text-center mb-8">
                        <h1 className="text-2xl font-bold text-azul-monte-tabor mb-2">
                            INFORME ADMISIÓN 2025 - {reportData.subject}
                        </h1>
                    </div>

                    {/* Información del estudiante */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1">
                                    Nombre <span className="text-xs text-gray-500">(desde postulación)</span>
                                </label>
                                <Input
                                    value={reportData.studentName}
                                    readOnly
                                    className="bg-gray-50 font-medium"
                                    placeholder="Se obtiene automáticamente desde la postulación"
                                />
                            </div>
                            
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1">
                                    Fecha de Nacimiento <span className="text-xs text-gray-500">(desde postulación)</span>
                                </label>
                                <Input
                                    type="date"
                                    value={reportData.birthDate}
                                    readOnly
                                    className="bg-gray-50"
                                />
                            </div>
                            
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1">
                                    Edad <span className="text-xs text-gray-500">(calculada automáticamente)</span>
                                </label>
                                <Input
                                    value={reportData.age ? `${reportData.age} años` : ''}
                                    readOnly
                                    className="bg-gray-50 font-medium"
                                    placeholder="Se calcula desde fecha de nacimiento"
                                />
                            </div>
                        </div>
                        
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1">
                                    Colegio Actual <span className="text-xs text-gray-500">(desde postulación)</span>
                                </label>
                                <Input
                                    value={reportData.currentSchool}
                                    readOnly
                                    className="bg-gray-50"
                                    placeholder="Se obtiene automáticamente desde la postulación"
                                />
                            </div>
                            
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1">
                                    Curso al que postula <span className="text-xs text-gray-500">(desde postulación)</span>
                                </label>
                                <Input
                                    value={reportData.gradeApplied}
                                    readOnly
                                    className="bg-gray-50"
                                    placeholder="Se obtiene automáticamente desde la postulación"
                                />
                            </div>
                            
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1">Profesor evaluador</label>
                                <Input
                                    value={reportData.evaluatorName}
                                    onChange={(e) => updateReportData('evaluatorName', e.target.value)}
                                    placeholder="Nombre del profesor evaluador"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Actitud frente al examen - Grid 2x2 */}
                    <div className="mb-6">
                        <h2 className="text-lg font-bold text-azul-monte-tabor mb-3 border-b-2 border-azul-monte-tabor pb-2">
                            ACTITUD FRENTE AL EXAMEN
                        </h2>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1">Fortalezas observadas</label>
                                <textarea
                                    rows={3}
                                    value={reportData.strengths}
                                    onChange={(e) => updateReportData('strengths', e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-azul-monte-tabor text-sm"
                                    placeholder="Ej: Perseverancia, concentración, estrategias organizadas..."
                                />
                            </div>
                            
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1">Dificultades observadas</label>
                                <textarea
                                    rows={3}
                                    value={reportData.difficulties}
                                    onChange={(e) => updateReportData('difficulties', e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-azul-monte-tabor text-sm"
                                    placeholder="Ej: Frustración, ansiedad, dificultad para organizar..."
                                />
                            </div>
                            
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1">Adecuación al formato</label>
                                <textarea
                                    rows={3}
                                    value={reportData.examAdaptation}
                                    onChange={(e) => updateReportData('examAdaptation', e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-azul-monte-tabor text-sm"
                                    placeholder="Ej: Comprensión de instrucciones, manejo de tiempos..."
                                />
                            </div>
                            
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1">Comportamiento general</label>
                                <textarea
                                    rows={3}
                                    value={reportData.observations}
                                    onChange={(e) => updateReportData('observations', e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-azul-monte-tabor text-sm"
                                    placeholder="Ej: Actitud colaborativa, autonomía, respeto..."
                                />
                            </div>
                        </div>
                    </div>

                    {/* Resultados académicos del examen */}
                    <div className="mb-8">
                        <h2 className="text-lg font-bold text-azul-monte-tabor mb-4 border-b-2 border-azul-monte-tabor pb-2">
                            Resultados académicos del examen
                        </h2>
                        
                        {/* Información de puntaje antes de la tabla */}
                        <div className="mb-4 p-4 bg-gray-50 rounded-lg">
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-1">
                                        Asignatura <span className="text-xs text-gray-500">(automático)</span>
                                    </label>
                                    <Input
                                        value={reportData.subject}
                                        readOnly
                                        className="font-medium bg-gray-100"
                                        placeholder="Se define por tipo de evaluación"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-1">
                                        Puntaje Obtenido <span className="text-rojo-sagrado">*</span>
                                    </label>
                                    <Input
                                        type="number"
                                        value={reportData.score}
                                        onChange={(e) => updateReportData('score', parseInt(e.target.value) || 0)}
                                        className="text-center font-bold text-lg"
                                        placeholder="0"
                                        min="0"
                                        max={reportData.maxScore}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-1">
                                        Puntaje Máximo <span className="text-rojo-sagrado">*</span>
                                    </label>
                                    <Input
                                        type="number"
                                        value={reportData.maxScore}
                                        onChange={(e) => updateReportData('maxScore', parseInt(e.target.value) || 1)}
                                        className="text-center font-bold text-lg border-azul-monte-tabor"
                                        placeholder="30"
                                        min="1"
                                        max="200"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-1">
                                        % de Logro <span className="text-xs text-gray-500">(automático)</span>
                                    </label>
                                    <div className="bg-azul-monte-tabor text-white p-2 rounded text-center font-bold text-lg">
                                        {reportData.percentage}%
                                    </div>
                                </div>
                            </div>
                            <div className="mt-3 text-xs text-gray-600">
                                <p><strong>Nota:</strong> El puntaje máximo puede editarse según el examen específico. El porcentaje se calcula automáticamente.</p>
                            </div>
                        </div>
                        
                        {/* Comentarios y áreas a trabajar - Más espacio */}
                        <div className="space-y-6">
                            <div>
                                <label className="block text-lg font-bold text-azul-monte-tabor mb-3">
                                    COMENTARIOS SOBRE EL DESEMPEÑO EN EL EXAMEN
                                </label>
                                <textarea
                                    rows={8}
                                    value={reportData.comments}
                                    onChange={(e) => updateReportData('comments', e.target.value)}
                                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-azul-monte-tabor focus:border-azul-monte-tabor text-sm leading-relaxed"
                                    placeholder="Describe detalladamente el desempeño del estudiante durante el examen:

• Comprensión de conceptos (ej: demostró sólido entendimiento de...)
• Metodología de trabajo (ej: organizó sus respuestas de manera...)
• Manejo de la dificultad (ej: ante problemas complejos mostró...)
• Precisión y exactitud (ej: sus respuestas fueron...)
• Nivel de logro alcanzado (ej: logró resolver correctamente...)
• Otros aspectos relevantes del desempeño académico..."
                                />
                            </div>
                            
                            <div>
                                <label className="block text-lg font-bold text-azul-monte-tabor mb-3">
                                    ÁREAS A TRABAJAR Y RECOMENDACIONES ESPECÍFICAS
                                </label>
                                <textarea
                                    rows={8}
                                    value={reportData.areasToWork}
                                    onChange={(e) => updateReportData('areasToWork', e.target.value)}
                                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-azul-monte-tabor focus:border-azul-monte-tabor text-sm leading-relaxed"
                                    placeholder="Proporciona recomendaciones específicas y detalladas:

• Áreas académicas a reforzar (ej: operaciones básicas, comprensión lectora...)
• Estrategias de estudio sugeridas (ej: práctica diaria de...)
• Habilidades a desarrollar (ej: organización, planificación...)
• Metodologías recomendadas (ej: uso de material concreto...)
• Apoyo familiar sugerido (ej: acompañamiento en...)
• Recursos adicionales (ej: ejercicios específicos, material de apoyo...)
• Plazos y metas a corto plazo..."
                                />
                            </div>
                        </div>
                    </div>

                    {/* Información adicional para el pie */}
                    <div className="mt-8 pt-4 border-t border-gray-300 text-xs text-gray-600">
                        <p>Fecha de evaluación: {new Date().toLocaleDateString('es-CL')}</p>
                        <p>Evaluador: {reportData.evaluatorName}</p>
                        <p>Colegio Monte Tabor y Nazaret - Sistema de Admisión 2025</p>
                    </div>
                </Card>
            </div>
        </div>
    );
};

export default AdmissionReportForm;