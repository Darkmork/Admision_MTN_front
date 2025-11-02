import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Card from '../ui/Card';
import Button from '../ui/Button';
import Input from '../ui/Input';
import { ArrowLeftIcon, SaveIcon, PrinterIcon } from '../icons/Icons';
import { useNotifications } from '../../context/AppContext';
import { professorEvaluationService, ProfessorEvaluation } from '../../services/professorEvaluationService';
import api from '../../services/api';

interface CycleDirectorReportData {
    studentName: string;
    birthDate: string;
    age: string;
    currentSchool: string;
    gradeApplied: string;
    
    // Antecedentes relevantes
    strengths: string;
    difficulties: string;
    interviewAdaptation: string;
    outstandingTraits: string;
    familyBackground: string;
    
    // Antecedentes académicos
    academicBackground: string;
}

interface SubjectResult {
    subject: string;
    score: number;
    percentage: number;
    comments: string;
    recommendations: string;
}

const CycleDirectorReportForm: React.FC = () => {
    const { evaluationId } = useParams<{ evaluationId: string }>();
    const navigate = useNavigate();
    const { addNotification } = useNotifications();
    
    const [evaluation, setEvaluation] = useState<ProfessorEvaluation | null>(null);
    const [subjectEvaluations, setSubjectEvaluations] = useState<ProfessorEvaluation[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    
    const [reportData, setReportData] = useState<CycleDirectorReportData>({
        studentName: '',
        birthDate: '',
        age: '',
        currentSchool: '',
        gradeApplied: '',
        strengths: '',
        difficulties: '',
        interviewAdaptation: '',
        outstandingTraits: '',
        familyBackground: '',
        academicBackground: ''
    });

    // Obtener profesor actual del localStorage
    const [currentProfessor] = useState(() => {
        const storedProfessor = localStorage.getItem('currentProfessor');
        return storedProfessor ? JSON.parse(storedProfessor) : null;
    });

    useEffect(() => {
        const loadEvaluationData = async () => {
            if (!evaluationId) return;
            
            try {
                setIsLoading(true);
                console.log('🔄 Cargando evaluación director de ciclo:', evaluationId);
                
                // Cargar la evaluación del director de ciclo
                const directorEvaluation = await professorEvaluationService.getEvaluationById(parseInt(evaluationId));
                
                if (directorEvaluation) {
                    setEvaluation(directorEvaluation);

                    console.log('📋 Director evaluation data:', {
                        applicationId: directorEvaluation.applicationId,
                        studentName: directorEvaluation.studentName,
                        studentGrade: directorEvaluation.studentGrade
                    });

                    // Primero mapear datos de la evaluación
                    const evaluationData = {
                        strengths: directorEvaluation.strengths || '',
                        difficulties: directorEvaluation.areasForImprovement || '',
                        interviewAdaptation: '',
                        outstandingTraits: '',
                        familyBackground: '',
                        academicBackground: directorEvaluation.observations || ''
                    };

                    // Cargar información completa del estudiante desde la aplicación
                    const studentInfo = await loadStudentInfo(directorEvaluation.applicationId);

                    // Combinar ambos conjuntos de datos
                    setReportData(prev => ({
                        ...prev,
                        ...evaluationData,
                        ...studentInfo
                    }));

                    // Cargar todas las evaluaciones del mismo estudiante para obtener resultados académicos
                    await loadSubjectEvaluations(directorEvaluation.applicationId);

                    console.log('✅ Evaluación director cargada completamente');
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

        loadEvaluationData();
    }, [evaluationId]); // ✅ SOLO evaluationId como dependencia

    const loadStudentInfo = async (applicationId: number): Promise<Partial<CycleDirectorReportData>> => {
        try {
            console.log('🔄 Cargando información completa del estudiante para application:', applicationId);

            // Obtener la aplicación completa que incluye todos los datos del estudiante
            const response = await api.get(`/api/applications/${applicationId}`);
            const data = response.data;
            const application = data.data || data;

            console.log('📊 Aplicación completa recibida:', application);

            if (application && application.student) {
                const student = application.student;

                console.log('👤 Datos del estudiante:', {
                    firstName: student.firstName,
                    paternalLastName: student.paternalLastName,
                    maternalLastName: student.maternalLastName,
                    birthDate: student.birthDate,
                    currentSchool: student.currentSchool,
                    gradeApplied: student.gradeApplied
                });

                // Calcular edad si hay fecha de nacimiento
                let age = '';
                if (student.birthDate) {
                    const birthDate = new Date(student.birthDate);
                    const today = new Date();
                    let calculatedAge = today.getFullYear() - birthDate.getFullYear();
                    const monthDiff = today.getMonth() - birthDate.getMonth();
                    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
                        calculatedAge--;
                    }
                    age = `${calculatedAge} años`;
                }

                const studentInfo = {
                    studentName: `${student.firstName} ${student.paternalLastName || student.lastName || ''} ${student.maternalLastName || ''}`.trim(),
                    birthDate: student.birthDate ? student.birthDate.split('T')[0] : '',
                    age: age,
                    currentSchool: student.currentSchool || '',
                    gradeApplied: student.gradeApplied || ''
                };

                console.log('✅ Información del estudiante procesada:', studentInfo);
                return studentInfo;
            }

            return {};

        } catch (error) {
            console.error('❌ Error cargando información del estudiante:', error);
            addNotification({
                type: 'warning',
                title: 'Atención',
                message: 'No se pudo cargar la información completa del estudiante. Por favor, completa los campos manualmente.'
            });
            return {};
        }
    };

    const loadSubjectEvaluations = async (applicationId: number) => {
        try {
            console.log('🔄 Cargando evaluaciones académicas para application:', applicationId);

            // Obtener todas las evaluaciones de esta aplicación desde el backend
            const response = await api.get(`/api/evaluations?applicationId=${applicationId}`);
            const data = response.data;
            const allEvaluations = data.data || data;

            console.log('📊 Todas las evaluaciones de la aplicación:', allEvaluations);

            // Filtrar solo las evaluaciones académicas completadas
            const subjectEvals = allEvaluations.filter((evalItem: any) =>
                ['MATHEMATICS_EXAM', 'LANGUAGE_EXAM', 'ENGLISH_EXAM'].includes(evalItem.evaluationType) &&
                evalItem.status === 'COMPLETED'
            );

            // Mapear al formato esperado por el componente
            const mappedEvals = subjectEvals.map((evalItem: any) => ({
                id: evalItem.id,
                applicationId: evalItem.applicationId,
                evaluationType: evalItem.evaluationType,
                status: evalItem.status,
                score: evalItem.score,
                maxScore: evalItem.maxScore || getMaxScoreForType(evalItem.evaluationType),
                observations: evalItem.observations || '',
                recommendations: evalItem.recommendations || '',
                strengths: evalItem.strengths || '',
                areasForImprovement: evalItem.areasForImprovement || '',
                studentName: evalItem.student ? `${evalItem.student.firstName} ${evalItem.student.lastName}` : '',
                studentGrade: evalItem.student ? evalItem.student.gradeApplied : ''
            }));

            setSubjectEvaluations(mappedEvals as any);
            console.log('✅ Evaluaciones académicas cargadas y mapeadas:', mappedEvals);

        } catch (error) {
            console.error('❌ Error cargando evaluaciones académicas:', error);
            addNotification({
                type: 'warning',
                title: 'Atención',
                message: 'No se pudieron cargar algunas evaluaciones académicas. Los resultados pueden estar incompletos.'
            });
        }
    };

    const getSubjectResults = (): SubjectResult[] => {
        const subjects = ['Matemática', 'Lenguaje', 'Inglés'];
        const evaluationTypes = ['MATHEMATICS_EXAM', 'LANGUAGE_EXAM', 'ENGLISH_EXAM'];

        return subjects.map((subject, index) => {
            const evaluation = subjectEvaluations.find(evalItem =>
                evalItem.evaluationType === evaluationTypes[index]
            );

            if (!evaluation) {
                return {
                    subject,
                    score: 0,
                    percentage: 0,
                    comments: 'Evaluación pendiente',
                    recommendations: ''
                };
            }

            const maxScore = (evaluation as any).maxScore || getMaxScoreForType(evaluationTypes[index]);
            const score = evaluation.score || 0;
            const percentage = maxScore > 0 ? Math.round((score / maxScore) * 100) : 0;

            return {
                subject,
                score,
                percentage,
                comments: evaluation.recommendations || '', // COMENTARIOS ← recommendations de BD (Jorge Gangale)
                recommendations: evaluation.areasForImprovement || '' // ÁREAS A TRABAJAR ← areasForImprovement de BD (chatgpt)
            };
        });
    };

    const getMaxScoreForType = (evaluationType: string): number => {
        const maxScores: { [key: string]: number } = {
            'MATHEMATICS_EXAM': 30,
            'LANGUAGE_EXAM': 35,
            'ENGLISH_EXAM': 25
        };
        return maxScores[evaluationType] || 30;
    };

    const updateReportData = (field: keyof CycleDirectorReportData, value: string) => {
        setReportData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const handleSave = async () => {
        if (!evaluation) return;
        
        setIsSubmitting(true);
        
        try {
            // Actualizar la evaluación con los datos del informe
            const updatedEvaluation: Partial<ProfessorEvaluation> = {
                strengths: reportData.strengths,
                areasForImprovement: reportData.difficulties,
                observations: `${reportData.academicBackground}\n\nAdaptación a entrevista: ${reportData.interviewAdaptation}\nRasgos sobresalientes: ${reportData.outstandingTraits}\nAntecedentes familiares: ${reportData.familyBackground}`,
                recommendations: `Informe completado por Director de Ciclo: ${currentProfessor?.firstName} ${currentProfessor?.lastName}`,
                status: 'COMPLETED'
            };
            
            await professorEvaluationService.updateEvaluation(evaluation.id, updatedEvaluation);
            
            addNotification({
                type: 'success',
                title: 'Informe guardado',
                message: 'El informe del Director de Ciclo ha sido guardado exitosamente'
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
        const printContent = document.getElementById('cycle-director-report');
        if (printContent) {
            const newWindow = window.open('', '_blank');
            if (newWindow) {
                newWindow.document.write(`
                    <html>
                        <head>
                            <title>Informe Admisión ${new Date().getFullYear() + 1} - Director de Ciclo</title>
                            <style>
                                body { font-family: Arial, sans-serif; margin: 20px; }
                                .header { text-align: center; margin-bottom: 30px; }
                                .info-grid { display: grid; grid-template-columns: 200px 1fr; gap: 10px; margin-bottom: 20px; }
                                .section { margin-bottom: 30px; }
                                .section-title { font-weight: bold; margin-bottom: 15px; border-bottom: 1px solid #000; padding-bottom: 5px; }
                                .table { width: 100%; border-collapse: collapse; }
                                .table th, .table td { border: 1px solid #000; padding: 8px; text-align: left; }
                                .field { margin-bottom: 15px; }
                                .field-label { font-weight: bold; margin-bottom: 5px; }
                                textarea, input { border: none; outline: none; font-family: inherit; width: 100%; }
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

    const subjectResults = getSubjectResults();

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
                            Informe Director de Ciclo {new Date().getFullYear() + 1}
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
                <Card className="p-8" id="cycle-director-report">
                    {/* Encabezado del informe */}
                    <div className="text-center mb-8">
                        <h1 className="text-2xl font-bold text-azul-monte-tabor mb-2">
                            INFORME ADMISIÓN {new Date().getFullYear() + 1} - DIRECTOR DE CICLO
                        </h1>
                    </div>

                    {/* Información del estudiante */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1">Nombre</label>
                                <Input
                                    value={reportData.studentName}
                                    onChange={(e) => updateReportData('studentName', e.target.value)}
                                    className="font-medium"
                                    placeholder="Nombre completo del estudiante"
                                />
                            </div>
                            
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1">Fecha de Nacimiento</label>
                                <Input
                                    type="date"
                                    value={reportData.birthDate}
                                    onChange={(e) => updateReportData('birthDate', e.target.value)}
                                />
                            </div>
                            
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1">Edad</label>
                                <Input
                                    value={reportData.age}
                                    onChange={(e) => updateReportData('age', e.target.value)}
                                    placeholder="Edad en años"
                                />
                            </div>
                        </div>
                        
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1">Colegio Actual</label>
                                <Input
                                    value={reportData.currentSchool}
                                    onChange={(e) => updateReportData('currentSchool', e.target.value)}
                                    placeholder="Nombre del colegio actual"
                                />
                            </div>
                            
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1">Curso al que postula</label>
                                <Input
                                    value={reportData.gradeApplied}
                                    onChange={(e) => updateReportData('gradeApplied', e.target.value)}
                                    placeholder="Ej: 1º Básico 2025"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Antecedentes relevantes */}
                    <div className="mb-8">
                        <h2 className="text-lg font-bold text-azul-monte-tabor mb-4 border-b-2 border-azul-monte-tabor pb-2">
                            ANTECEDENTES RELEVANTES
                        </h2>
                        
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1">Fortalezas</label>
                                <textarea
                                    rows={4}
                                    value={reportData.strengths}
                                    onChange={(e) => updateReportData('strengths', e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-azul-monte-tabor"
                                    placeholder="Describe las fortalezas observadas..."
                                />
                            </div>
                            
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1">Dificultades</label>
                                <textarea
                                    rows={4}
                                    value={reportData.difficulties}
                                    onChange={(e) => updateReportData('difficulties', e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-azul-monte-tabor"
                                    placeholder="Describe las dificultades observadas..."
                                />
                            </div>
                            
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1">Adecuación a la entrevista</label>
                                <textarea
                                    rows={3}
                                    value={reportData.interviewAdaptation}
                                    onChange={(e) => updateReportData('interviewAdaptation', e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-azul-monte-tabor"
                                    placeholder="Describe cómo se adaptó el estudiante a la entrevista..."
                                />
                            </div>
                            
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1">Rasgos sobresalientes</label>
                                <textarea
                                    rows={3}
                                    value={reportData.outstandingTraits}
                                    onChange={(e) => updateReportData('outstandingTraits', e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-azul-monte-tabor"
                                    placeholder="Menciona rasgos sobresalientes del estudiante..."
                                />
                            </div>
                            
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1">Familiares</label>
                                <textarea
                                    rows={3}
                                    value={reportData.familyBackground}
                                    onChange={(e) => updateReportData('familyBackground', e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-azul-monte-tabor"
                                    placeholder="Información relevante sobre el contexto familiar..."
                                />
                            </div>
                        </div>
                    </div>

                    {/* Antecedentes académicos */}
                    <div className="mb-8">
                        <h2 className="text-lg font-bold text-azul-monte-tabor mb-4 border-b-2 border-azul-monte-tabor pb-2">
                            ANTECEDENTES ACADÉMICOS
                        </h2>
                        
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-1">Antecedentes relevantes</label>
                            <textarea
                                rows={5}
                                value={reportData.academicBackground}
                                onChange={(e) => updateReportData('academicBackground', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-azul-monte-tabor"
                                placeholder="Describe los antecedentes académicos relevantes del estudiante..."
                            />
                        </div>
                    </div>

                    {/* Resultados académicos del examen */}
                    <div className="mb-8">
                        <h2 className="text-lg font-bold text-azul-monte-tabor mb-4 border-b-2 border-azul-monte-tabor pb-2">
                            Resultados académicos del examen
                        </h2>
                        
                        <div className="overflow-x-auto">
                            <table className="w-full border-collapse border border-gray-400">
                                <thead>
                                    <tr className="bg-gray-100">
                                        <th className="border border-gray-400 px-4 py-2 text-left font-bold">ASIGNATURA</th>
                                        <th className="border border-gray-400 px-4 py-2 text-center font-bold">PORCENTAJE</th>
                                        <th className="border border-gray-400 px-4 py-2 text-left font-bold">COMENTARIOS</th>
                                        <th className="border border-gray-400 px-4 py-2 text-left font-bold">ÁREAS A TRABAJAR/ RECOMENDACIONES</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {subjectResults.map((result, index) => (
                                        <tr key={index}>
                                            <td className="border border-gray-400 px-4 py-2 font-medium">
                                                {result.subject}
                                            </td>
                                            <td className="border border-gray-400 px-4 py-2 text-center font-semibold text-blue-600">
                                                {result.percentage > 0 ? `${result.percentage}%` : '-'}
                                            </td>
                                            <td className="border border-gray-400 px-4 py-2">
                                                {result.comments || 'Sin evaluación'}
                                            </td>
                                            <td className="border border-gray-400 px-4 py-2">
                                                {result.recommendations || 'Sin recomendaciones'}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Información adicional para el pie */}
                    <div className="mt-8 pt-4 border-t border-gray-300 text-xs text-gray-600">
                        <p>Fecha de evaluación: {new Date().toLocaleDateString('es-CL')}</p>
                        <p>Director de Ciclo: {currentProfessor?.firstName} {currentProfessor?.lastName}</p>
                        <p>Colegio Monte Tabor y Nazaret - Sistema de Admisión {new Date().getFullYear() + 1}</p>
                    </div>
                </Card>
            </div>
        </div>
    );
};

export default CycleDirectorReportForm;