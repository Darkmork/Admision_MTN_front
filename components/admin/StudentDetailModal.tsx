import React, { useState, useEffect } from 'react';
import Modal from '../ui/Modal';
import Badge from '../ui/Badge';
import Button from '../ui/Button';
import {
    FiUser, FiPhone, FiMail, FiMapPin, FiHome, FiBookOpen, FiCalendar,
    FiFileText, FiEdit, FiDownload, FiClock, FiCheckCircle, FiAlertCircle,
    FiUsers, FiBriefcase, FiHeart, FiStar, FiEye,
    FiX, FiChevronRight, FiInfo, FiMessageSquare, FiAward, FiRefreshCw
} from 'react-icons/fi';
import { useNotifications } from '../../context/AppContext';
import { applicationService, Application } from '../../services/applicationService';
import interviewService from '../../services/interviewService';
import { Interview, InterviewStatus, INTERVIEW_TYPE_LABELS } from '../../types/interview';
import evaluationService from '../../services/evaluationService';
import { Evaluation } from '../../types/evaluation';

interface Postulante {
    id: number;
    nombreCompleto: string;
    nombres: string;
    apellidoPaterno: string;
    apellidoMaterno: string;
    rut: string;
    fechaNacimiento: string;
    edad: number;
    esHijoFuncionario: boolean;
    nombrePadreFuncionario?: string;
    esHijoExalumno: boolean;
    anioEgresoExalumno?: number;
    esAlumnoInclusion: boolean;
    tipoInclusion?: string;
    notasInclusion?: string;
    email?: string;
    direccion: string;
    cursoPostulado: string;
    colegioActual?: string;
    colegioDestino: 'MONTE_TABOR' | 'NAZARET';
    añoAcademico: string;
    estadoPostulacion: string;
    fechaPostulacion: string;
    fechaActualizacion: string;
    nombreContactoPrincipal: string;
    emailContacto: string;
    telefonoContacto: string;
    relacionContacto: string;
    nombrePadre?: string;
    emailPadre?: string;
    telefonoPadre?: string;
    profesionPadre?: string;
    nombreMadre?: string;
    emailMadre?: string;
    telefonoMadre?: string;
    profesionMadre?: string;
    documentosCompletos: boolean;
    cantidadDocumentos: number;
    evaluacionPendiente: boolean;
    entrevistaProgramada: boolean;
    fechaEntrevista?: string;
    necesidadesEspeciales: boolean;
    observaciones?: string;
    notasInternas?: string;
    creadoPor: string;
    fechaCreacion: string;
}

// Tipos de entrevistas requeridas
const REQUIRED_INTERVIEW_TYPES = [
  { type: 'FAMILY', title: 'Familiar', icon: '👨‍👩‍👧‍👦', required: true },
  { type: 'INDIVIDUAL', title: 'Individual', icon: '👤', required: true },
  { type: 'PSYCHOLOGICAL', title: 'Psicológica', icon: '🧠', required: true },
  { type: 'ACADEMIC', title: 'Académica', icon: '📚', required: true },
  { type: 'OTHER', title: 'Adicional', icon: '➕', required: false }
];

interface StudentDetailModalProps {
    isOpen: boolean;
    onClose: () => void;
    postulante?: Postulante;
    onEdit?: (postulante: Postulante) => void;
    onUpdateStatus?: (postulante: Postulante, newStatus: string) => void;
    onScheduleInterview?: (postulante: Postulante, interviewType?: string) => void;
}

const StudentDetailModal: React.FC<StudentDetailModalProps> = ({
    isOpen,
    onClose,
    postulante,
    onEdit,
    onUpdateStatus,
    onScheduleInterview
}) => {
    const [activeTab, setActiveTab] = useState<'info' | 'familia' | 'academico' | 'entrevistas' | 'evaluaciones' | 'documentos' | 'historial'>('info');
    const [fullApplication, setFullApplication] = useState<Application | null>(null);
    const [interviews, setInterviews] = useState<Interview[]>([]);
    const [evaluations, setEvaluations] = useState<Evaluation[]>([]);
    const [loading, setLoading] = useState(false);
    const [interviewsLoading, setInterviewsLoading] = useState(false);
    const [evaluationsLoading, setEvaluationsLoading] = useState(false);
    const [selectedEvaluation, setSelectedEvaluation] = useState<Evaluation | null>(null);
    const [showEvaluationDetail, setShowEvaluationDetail] = useState(false);
    const { addNotification } = useNotifications();

    // Cargar información completa de la aplicación, entrevistas y evaluaciones
    useEffect(() => {
        if (postulante && isOpen) {
            loadFullApplication();
            loadInterviews();
            loadEvaluations();
        }
    }, [postulante, isOpen]);

    const loadFullApplication = async () => {
        if (!postulante) return;

        setLoading(true);
        try {
            const app = await applicationService.getApplicationById(postulante.id);
            setFullApplication(app);
        } catch (error) {
            console.error('Error loading full application:', error);
            addNotification({
                type: 'warning',
                title: 'Información limitada',
                message: 'No se pudo cargar toda la información del estudiante'
            });
        } finally {
            setLoading(false);
        }
    };

    const loadInterviews = async () => {
        if (!postulante) return;

        setInterviewsLoading(true);
        try {
            const response = await interviewService.getInterviewsByApplication(postulante.id);
            setInterviews(response.interviews || []);
        } catch (error) {
            console.error('Error loading interviews:', error);
            setInterviews([]);
        } finally {
            setInterviewsLoading(false);
        }
    };

    const loadEvaluations = async () => {
        if (!postulante) return;

        setEvaluationsLoading(true);
        try {
            const evaluationsData = await evaluationService.getEvaluationsByApplicationId(postulante.id);
            setEvaluations(evaluationsData || []);
        } catch (error) {
            console.error('Error loading evaluations:', error);
            setEvaluations([]);
        } finally {
            setEvaluationsLoading(false);
        }
    };

    const refreshData = async () => {
        await Promise.all([loadFullApplication(), loadInterviews(), loadEvaluations()]);
    };

    console.log('🎭 StudentDetailModal render - isOpen:', isOpen, 'postulante:', postulante, 'activeTab:', activeTab, 'loading:', loading);
    if (!postulante) {
        console.log('⚠️ StudentDetailModal - No postulante provided, returning null');
        return null;
    }
    console.log('✅ StudentDetailModal - Will render modal content');

    const getStatusVariant = (status: string) => {
        switch (status) {
            case 'APPROVED': return 'green';
            case 'REJECTED': return 'red';
            case 'UNDER_REVIEW': return 'blue';
            case 'INTERVIEW_SCHEDULED': return 'purple';
            case 'EXAM_SCHEDULED': return 'orange';
            case 'DOCUMENTS_REQUESTED': return 'yellow';
            case 'WAITLIST': return 'gray';
            default: return 'gray';
        }
    };

    const getStatusText = (status: string) => {
        switch (status) {
            case 'PENDING': return 'Pendiente';
            case 'UNDER_REVIEW': return 'En Revisión';
            case 'DOCUMENTS_REQUESTED': return 'Documentos Solicitados';
            case 'INTERVIEW_SCHEDULED': return 'Entrevista Programada';
            case 'EXAM_SCHEDULED': return 'Examen Programado';
            case 'APPROVED': return 'Aprobado';
            case 'REJECTED': return 'Rechazado';
            case 'WAITLIST': return 'Lista de Espera';
            default: return status;
        }
    };

    const renderSpecialCategories = () => (
        <div className="space-y-2">
            {postulante.esHijoFuncionario && (
                <div className="flex items-center gap-2 p-2 bg-blue-50 rounded">
                    <FiBriefcase className="w-4 h-4 text-blue-600" />
                    <div>
                        <Badge variant="blue" size="sm">Hijo de Funcionario</Badge>
                        <div className="text-sm text-gray-600 mt-1">
                            {postulante.nombrePadreFuncionario || 'Funcionario no especificado'}
                        </div>
                    </div>
                </div>
            )}
            {postulante.esHijoExalumno && (
                <div className="flex items-center gap-2 p-2 bg-green-50 rounded">
                    <FiAward className="w-4 h-4 text-green-600" />
                    <div>
                        <Badge variant="green" size="sm">Hijo de Exalumno</Badge>
                        <div className="text-sm text-gray-600 mt-1">
                            Egreso: {postulante.anioEgresoExalumno || 'Año no especificado'}
                        </div>
                    </div>
                </div>
            )}
            {postulante.esAlumnoInclusion && (
                <div className="flex items-center gap-2 p-2 bg-purple-50 rounded">
                    <FiHeart className="w-4 h-4 text-purple-600" />
                    <div>
                        <Badge variant="purple" size="sm">Alumno de Inclusión</Badge>
                        <div className="text-sm text-gray-600 mt-1">
                            {postulante.tipoInclusion || 'Tipo no especificado'}
                        </div>
                        {postulante.notasInclusion && (
                            <div className="text-xs text-gray-500 mt-1">
                                {postulante.notasInclusion}
                            </div>
                        )}
                    </div>
                </div>
            )}
            {!postulante.esHijoFuncionario && !postulante.esHijoExalumno && !postulante.esAlumnoInclusion && (
                <div className="flex items-center gap-2 p-2 bg-gray-50 rounded">
                    <FiStar className="w-4 h-4 text-gray-600" />
                    <Badge variant="gray" size="sm">Postulante Regular</Badge>
                </div>
            )}
        </div>
    );

    const renderInfoTab = () => {
        console.log('📝 renderInfoTab called');
        return (
        <div className="space-y-6">
            {/* Header con foto y datos básicos */}
            <div className="flex items-start gap-4 p-4 bg-gradient-to-r from-blue-50 to-green-50 rounded-lg">
                <div className="w-20 h-20 bg-gray-200 rounded-full flex items-center justify-center">
                    <FiUser className="w-8 h-8 text-gray-400" />
                </div>
                <div className="flex-1">
                    <h2 className="text-2xl font-bold text-gray-900">{postulante.nombreCompleto}</h2>
                    <div className="flex items-center gap-4 mt-2">
                        <Badge variant={getStatusVariant(postulante.estadoPostulacion)} size="lg">
                            {getStatusText(postulante.estadoPostulacion)}
                        </Badge>
                        <span className="text-gray-600">RUT: {postulante.rut}</span>
                        <span className="text-gray-600">{postulante.edad} años</span>
                    </div>
                </div>
            </div>

            {/* Información básica */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                        <FiUser className="w-5 h-5" />
                        Datos Personales
                    </h3>
                    <div className="space-y-3 bg-gray-50 p-4 rounded-lg">
                        <div className="flex justify-between">
                            <span className="text-gray-600">Fecha de Nacimiento:</span>
                            <span className="font-medium">
                                {new Date(postulante.fechaNacimiento).toLocaleDateString('es-ES')}
                            </span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-600">Email:</span>
                            <span className="font-medium">{postulante.email || 'No especificado'}</span>
                        </div>
                        <div className="flex justify-between items-start">
                            <span className="text-gray-600">Dirección:</span>
                            <span className="font-medium text-right flex-1 ml-2">{postulante.direccion}</span>
                        </div>
                    </div>
                </div>

                <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                        <FiBookOpen className="w-5 h-5" />
                        Información Académica
                    </h3>
                    <div className="space-y-3 bg-gray-50 p-4 rounded-lg">
                        <div className="flex justify-between">
                            <span className="text-gray-600">Curso Postulado:</span>
                            <Badge variant="blue" size="sm">{postulante.cursoPostulado}</Badge>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-600">Colegio Destino:</span>
                            <Badge variant="green" size="sm">
                                {postulante.colegioDestino === 'MONTE_TABOR' ? 'Monte Tabor' : 'Nazaret'}
                            </Badge>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-600">Colegio Actual:</span>
                            <span className="font-medium">{postulante.colegioActual || 'No especificado'}</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Categorías especiales */}
            <div>
                <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2 mb-4">
                    <FiStar className="w-5 h-5" />
                    Categorías Especiales
                </h3>
                {renderSpecialCategories()}
            </div>

            {/* Estado y fechas */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                        <FiClock className="w-5 h-5" />
                        Fechas Importantes
                    </h3>
                    <div className="space-y-3 bg-gray-50 p-4 rounded-lg">
                        <div className="flex justify-between">
                            <span className="text-gray-600">Fecha Postulación:</span>
                            <span className="font-medium">
                                {new Date(postulante.fechaPostulacion).toLocaleDateString('es-ES')}
                            </span>
                        </div>
                        {postulante.fechaEntrevista && (
                            <div className="flex justify-between">
                                <span className="text-gray-600">Fecha Entrevista:</span>
                                <span className="font-medium text-purple-600">
                                    {new Date(postulante.fechaEntrevista).toLocaleDateString('es-ES')}
                                </span>
                            </div>
                        )}
                    </div>
                </div>

                <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                        <FiCheckCircle className="w-5 h-5" />
                        Estado del Proceso
                    </h3>
                    <div className="space-y-3 bg-gray-50 p-4 rounded-lg">
                        <div className="flex justify-between items-center">
                            <span className="text-gray-600">Documentos:</span>
                            <Badge variant={postulante.documentosCompletos ? 'green' : 'red'} size="sm">
                                {postulante.documentosCompletos ? 'Completos' : 'Incompletos'} ({postulante.cantidadDocumentos})
                            </Badge>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-gray-600">Evaluación:</span>
                            <Badge variant={postulante.evaluacionPendiente ? 'yellow' : 'green'} size="sm">
                                {postulante.evaluacionPendiente ? 'Pendiente' : 'Completada'}
                            </Badge>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-gray-600">Entrevista:</span>
                            <Badge variant={postulante.entrevistaProgramada ? 'purple' : 'gray'} size="sm">
                                {postulante.entrevistaProgramada ? 'Programada' : 'No programada'}
                            </Badge>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        );
    };

    const renderFamiliaTab = () => (
        <div className="space-y-6">
            {/* Contacto Principal */}
            <div>
                <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2 mb-4">
                    <FiUsers className="w-5 h-5" />
                    Contacto Principal
                </h3>
                <div className="bg-green-50 p-4 rounded-lg">
                    <div className="flex items-start gap-3">
                        <FiUser className="w-5 h-5 text-green-600 mt-0.5" />
                        <div className="flex-1">
                            <h4 className="font-semibold text-gray-900">{postulante.nombreContactoPrincipal}</h4>
                            <p className="text-sm text-gray-600 mb-2">
                                Relación: {postulante.relacionContacto}
                            </p>
                            <div className="space-y-1">
                                <div className="flex items-center gap-2 text-sm">
                                    <FiPhone className="w-4 h-4 text-gray-400" />
                                    <span>{postulante.telefonoContacto || 'No especificado'}</span>
                                </div>
                                <div className="flex items-center gap-2 text-sm">
                                    <FiMail className="w-4 h-4 text-gray-400" />
                                    <span>{postulante.emailContacto || 'No especificado'}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Información de Padres */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Padre */}
                <div>
                    <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2 mb-4">
                        <FiUser className="w-5 h-5" />
                        Información del Padre
                    </h3>
                    <div className="bg-blue-50 p-4 rounded-lg">
                        <h4 className="font-semibold text-gray-900 mb-2">
                            {postulante.nombrePadre || 'No especificado'}
                        </h4>
                        <div className="space-y-2 text-sm">
                            <div className="flex items-center gap-2">
                                <FiBriefcase className="w-4 h-4 text-gray-400" />
                                <span>Profesión: {postulante.profesionPadre || 'No especificada'}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <FiPhone className="w-4 h-4 text-gray-400" />
                                <span>Teléfono: {postulante.telefonoPadre || 'No especificado'}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <FiMail className="w-4 h-4 text-gray-400" />
                                <span>Email: {postulante.emailPadre || 'No especificado'}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Madre */}
                <div>
                    <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2 mb-4">
                        <FiUser className="w-5 h-5" />
                        Información de la Madre
                    </h3>
                    <div className="bg-pink-50 p-4 rounded-lg">
                        <h4 className="font-semibold text-gray-900 mb-2">
                            {postulante.nombreMadre || 'No especificado'}
                        </h4>
                        <div className="space-y-2 text-sm">
                            <div className="flex items-center gap-2">
                                <FiBriefcase className="w-4 h-4 text-gray-400" />
                                <span>Profesión: {postulante.profesionMadre || 'No especificada'}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <FiPhone className="w-4 h-4 text-gray-400" />
                                <span>Teléfono: {postulante.telefonoMadre || 'No especificado'}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <FiMail className="w-4 h-4 text-gray-400" />
                                <span>Email: {postulante.emailMadre || 'No especificado'}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );

    const renderAcademicoTab = () => (
        <div className="space-y-6">
            {/* Estado Académico */}
            <div>
                <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2 mb-4">
                    <FiAward className="w-5 h-5" />
                    Estado Académico
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-gray-50 p-4 rounded-lg">
                        <div className="flex items-center gap-2 mb-2">
                            <FiCheckCircle className={`w-5 h-5 ${postulante.evaluacionPendiente ? 'text-yellow-500' : 'text-green-500'}`} />
                            <span className="font-medium">Evaluación Académica</span>
                        </div>
                        <Badge variant={postulante.evaluacionPendiente ? 'yellow' : 'green'} size="sm">
                            {postulante.evaluacionPendiente ? 'Pendiente' : 'Completada'}
                        </Badge>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-lg">
                        <div className="flex items-center gap-2 mb-2">
                            <FiCalendar className={`w-5 h-5 ${postulante.entrevistaProgramada ? 'text-purple-500' : 'text-gray-400'}`} />
                            <span className="font-medium">Entrevista</span>
                        </div>
                        <Badge variant={postulante.entrevistaProgramada ? 'purple' : 'gray'} size="sm">
                            {postulante.entrevistaProgramada ? 'Programada' : 'No programada'}
                        </Badge>
                        {postulante.fechaEntrevista && (
                            <div className="text-sm text-gray-600 mt-1">
                                {new Date(postulante.fechaEntrevista).toLocaleDateString('es-ES')}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Observaciones */}
            {(postulante.observaciones || postulante.necesidadesEspeciales) && (
                <div>
                    <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2 mb-4">
                        <FiMessageSquare className="w-5 h-5" />
                        Observaciones y Necesidades
                    </h3>
                    <div className="space-y-4">
                        {postulante.necesidadesEspeciales && (
                            <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                                <div className="flex items-center gap-2 mb-2">
                                    <FiAlertCircle className="w-5 h-5 text-yellow-600" />
                                    <span className="font-medium text-yellow-800">Necesidades Especiales</span>
                                </div>
                                <p className="text-sm text-yellow-700">
                                    Este estudiante tiene necesidades especiales que requieren atención.
                                </p>
                            </div>
                        )}
                        {postulante.observaciones && (
                            <div className="bg-blue-50 p-4 rounded-lg">
                                <h4 className="font-medium text-gray-900 mb-2">Observaciones</h4>
                                <p className="text-sm text-gray-700">{postulante.observaciones}</p>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );

    const renderEntrevistasTab = () => {
        const requiredTypes = REQUIRED_INTERVIEW_TYPES.filter(t => t.required);
        const completedInterviews = interviews.filter(i => i.status === InterviewStatus.COMPLETED).length;
        const scheduledInterviews = interviews.filter(i =>
            i.status === InterviewStatus.SCHEDULED || i.status === InterviewStatus.CONFIRMED
        ).length;
        const missingInterviews = requiredTypes.filter(type =>
            !interviews.some(interview => interview.type === type.type)
        ).length;

        const progress = Math.round(((completedInterviews + scheduledInterviews) / requiredTypes.length) * 100);

        return (
            <div className="space-y-6">
                {/* Header con refresh */}
                <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                        <FiCalendar className="w-5 h-5" />
                        Sistema de 4 Entrevistas
                    </h3>
                    <Button
                        size="sm"
                        variant="outline"
                        onClick={loadInterviews}
                        disabled={interviewsLoading}
                    >
                        <FiRefreshCw className={`w-4 h-4 mr-1 ${interviewsLoading ? 'animate-spin' : ''}`} />
                        Actualizar
                    </Button>
                </div>

                {/* Progreso general */}
                <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-gray-700">Progreso de Entrevistas Obligatorias</span>
                        <span className="text-sm text-gray-600">{completedInterviews + scheduledInterviews} de {requiredTypes.length}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                        <div
                            className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${progress}%` }}
                        ></div>
                    </div>
                    <div className="flex justify-between text-xs text-gray-600">
                        <span>{completedInterviews} completadas</span>
                        <span>{scheduledInterviews} programadas</span>
                        <span>{missingInterviews} pendientes</span>
                    </div>
                </div>

                {/* Estado de cada tipo de entrevista */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {REQUIRED_INTERVIEW_TYPES.map(type => {
                        const interview = interviews.find(i => i.type === type.type);
                        const hasInterview = !!interview;
                        const isCompleted = interview?.status === InterviewStatus.COMPLETED;
                        const isScheduled = interview?.status === InterviewStatus.SCHEDULED ||
                                          interview?.status === InterviewStatus.CONFIRMED;

                        return (
                            <div key={type.type} className={`p-4 rounded-lg border-2 ${
                                isCompleted ? 'border-green-200 bg-green-50' :
                                isScheduled ? 'border-blue-200 bg-blue-50' :
                                type.required ? 'border-orange-200 bg-orange-50' :
                                'border-gray-200 bg-gray-50'
                            }`}>
                                <div className="flex items-center justify-between mb-2">
                                    <div className="flex items-center gap-2">
                                        <span className="text-lg">{type.icon}</span>
                                        <span className="font-medium text-gray-900">{type.title}</span>
                                        {type.required && <span className="text-red-500 text-xs">*</span>}
                                    </div>
                                    <Badge
                                        variant="neutral"
                                        size="sm"
                                        className={`text-xs ${
                                            isCompleted ? 'text-green-700 bg-green-100' :
                                            isScheduled ? 'text-blue-700 bg-blue-100' :
                                            type.required ? 'text-orange-700 bg-orange-100' :
                                            'text-gray-600 bg-gray-100'
                                        }`}
                                    >
                                        {isCompleted ? 'Completada' :
                                         isScheduled ? 'Programada' :
                                         type.required ? 'Requerida' : 'Opcional'}
                                    </Badge>
                                </div>

                                {interview && (
                                    <div className="space-y-1 text-xs text-gray-600">
                                        <p>📅 {new Date(interview.scheduledDate).toLocaleDateString('es-CL')}</p>
                                        <p>🕐 {interview.scheduledTime}</p>
                                        <p>👤 {interview.interviewerName}</p>
                                        {interview.status === InterviewStatus.COMPLETED && interview.score && (
                                            <p className="text-green-600 font-medium">⭐ {interview.score}/10</p>
                                        )}
                                    </div>
                                )}

                                <div className="mt-3">
                                    {hasInterview ? (
                                        <Button size="sm" variant="outline" className="w-full text-xs">
                                            <FiEye className="w-3 h-3 mr-1" />
                                            Ver Detalles
                                        </Button>
                                    ) : (
                                        <Button
                                            size="sm"
                                            variant="primary"
                                            className="w-full text-xs"
                                            onClick={() => onScheduleInterview?.(postulante, type.type)}
                                        >
                                            <FiCalendar className="w-3 h-3 mr-1" />
                                            Programar
                                        </Button>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Lista de entrevistas */}
                {interviews.length > 0 && (
                    <div>
                        <h4 className="font-medium text-gray-900 mb-3">Historial de Entrevistas ({interviews.length})</h4>
                        <div className="space-y-3">
                            {interviews.map(interview => (
                                <div key={interview.id} className="border rounded-lg p-3 bg-white">
                                    <div className="flex items-start justify-between">
                                        <div className="flex items-center gap-2">
                                            <span className="text-base">
                                                {REQUIRED_INTERVIEW_TYPES.find(t => t.type === interview.type)?.icon || '📋'}
                                            </span>
                                            <div>
                                                <h5 className="font-medium text-gray-900">
                                                    {INTERVIEW_TYPE_LABELS[interview.type as keyof typeof INTERVIEW_TYPE_LABELS] || interview.type}
                                                </h5>
                                                <p className="text-sm text-gray-600">{interview.interviewerName}</p>
                                            </div>
                                        </div>
                                        <Badge variant="info" size="sm">
                                            {interview.status === InterviewStatus.COMPLETED ? 'Completada' :
                                             interview.status === InterviewStatus.SCHEDULED ? 'Programada' :
                                             interview.status === InterviewStatus.CONFIRMED ? 'Confirmada' :
                                             interview.status}
                                        </Badge>
                                    </div>
                                    <div className="mt-2 text-sm text-gray-600">
                                        📅 {new Date(interview.scheduledDate).toLocaleDateString('es-CL')}
                                        🕐 {interview.scheduledTime}
                                        {interview.status === InterviewStatus.COMPLETED && interview.score && (
                                            <span className="ml-2 text-green-600 font-medium">⭐ {interview.score}/10</span>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {interviewsLoading && (
                    <div className="text-center py-4">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto"></div>
                        <p className="text-sm text-gray-600 mt-2">Cargando entrevistas...</p>
                    </div>
                )}
            </div>
        );
    };

    const renderDocumentosTab = () => (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                    <FiFileText className="w-5 h-5" />
                    Documentos de la Postulación
                </h3>
                <Badge variant={postulante.documentosCompletos ? 'green' : 'red'} size="sm">
                    {postulante.documentosCompletos ? 'Completos' : 'Incompletos'}
                </Badge>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex items-center gap-2 mb-3">
                    <FiInfo className="w-5 h-5 text-blue-500" />
                    <span className="font-medium">Estado de Documentos</span>
                </div>
                <div className="text-sm text-gray-700">
                    <p>Total de documentos: <span className="font-medium">{postulante.cantidadDocumentos}</span></p>
                    <p className="mt-1">
                        Estado: <Badge variant={postulante.documentosCompletos ? 'green' : 'red'} size="xs">
                            {postulante.documentosCompletos ? 'Documentación completa' : 'Faltan documentos'}
                        </Badge>
                    </p>
                </div>
            </div>

            {fullApplication?.documents && fullApplication.documents.length > 0 ? (
                <div className="space-y-3">
                    <h4 className="font-medium text-gray-900">Lista de Documentos</h4>
                    {fullApplication.documents.map((doc, index) => (
                        <div key={index} className="flex items-center justify-between p-3 bg-white border border-gray-200 rounded-lg">
                            <div className="flex items-center gap-3">
                                <FiFileText className="w-4 h-4 text-blue-500" />
                                <div>
                                    <span className="text-sm font-medium text-gray-900">
                                        {doc.fileName || `Documento ${index + 1}`}
                                    </span>
                                    <div className="text-xs text-gray-500">
                                        {doc.documentType || 'Tipo no especificado'}
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <Badge variant="green" size="xs">Subido</Badge>
                                <Button variant="ghost" size="sm">
                                    <FiDownload className="w-4 h-4" />
                                </Button>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="text-center py-8 text-gray-500">
                    <FiFileText className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                    <p>No hay documentos disponibles para mostrar</p>
                </div>
            )}
        </div>
    );

    const renderHistorialTab = () => (
        <div className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <FiClock className="w-5 h-5" />
                Historial del Proceso
            </h3>

            <div className="space-y-4">
                <div className="flex items-start gap-3 p-3 bg-blue-50 border-l-4 border-blue-400 rounded-r-lg">
                    <FiCheckCircle className="w-5 h-5 text-blue-600 mt-0.5" />
                    <div className="flex-1">
                        <h4 className="font-medium text-blue-900">Postulación Creada</h4>
                        <p className="text-sm text-blue-700">
                            {new Date(postulante.fechaCreacion).toLocaleDateString('es-ES')} -
                            Creada por: {postulante.creadoPor}
                        </p>
                    </div>
                </div>

                <div className="flex items-start gap-3 p-3 bg-green-50 border-l-4 border-green-400 rounded-r-lg">
                    <FiFileText className="w-5 h-5 text-green-600 mt-0.5" />
                    <div className="flex-1">
                        <h4 className="font-medium text-green-900">Estado Actual</h4>
                        <p className="text-sm text-green-700">
                            {getStatusText(postulante.estadoPostulacion)}
                        </p>
                    </div>
                </div>

                {postulante.fechaEntrevista && (
                    <div className="flex items-start gap-3 p-3 bg-purple-50 border-l-4 border-purple-400 rounded-r-lg">
                        <FiCalendar className="w-5 h-5 text-purple-600 mt-0.5" />
                        <div className="flex-1">
                            <h4 className="font-medium text-purple-900">Entrevista Programada</h4>
                            <p className="text-sm text-purple-700">
                                {new Date(postulante.fechaEntrevista).toLocaleDateString('es-ES')}
                            </p>
                        </div>
                    </div>
                )}
            </div>

            <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-medium text-gray-900 mb-2">Información del Sistema</h4>
                <div className="text-sm text-gray-600 space-y-1">
                    <p>ID del Postulante: <span className="font-mono">{postulante.id}</span></p>
                    <p>Fecha de última actualización: {new Date(postulante.fechaActualizacion).toLocaleString('es-ES')}</p>
                </div>
            </div>
        </div>
    );

    const getEvaluationTypeLabel = (type: string) => {
        const labels: Record<string, string> = {
            'MATHEMATICS_EXAM': 'Examen de Matemática',
            'LANGUAGE_EXAM': 'Examen de Lenguaje',
            'ENGLISH_EXAM': 'Examen de Inglés',
            'PSYCHOLOGICAL_INTERVIEW': 'Entrevista Psicológica',
            'DIRECTOR_INTERVIEW': 'Entrevista con Director(a)',
            'COORDINATOR_INTERVIEW': 'Entrevista con Coordinador(a)'
        };
        return labels[type] || type;
    };

    const getEvaluationIcon = (type: string) => {
        const icons: Record<string, string> = {
            'MATHEMATICS_EXAM': '🔢',
            'LANGUAGE_EXAM': '📖',
            'ENGLISH_EXAM': '🌐',
            'PSYCHOLOGICAL_INTERVIEW': '🧠',
            'DIRECTOR_INTERVIEW': '👔',
            'COORDINATOR_INTERVIEW': '👨‍🏫'
        };
        return icons[type] || '📋';
    };

    const REQUIRED_EVALUATION_TYPES = [
        { type: 'MATHEMATICS_EXAM', title: 'Examen de Matemática', icon: '🔢', required: true },
        { type: 'LANGUAGE_EXAM', title: 'Examen de Lenguaje', icon: '📖', required: true },
        { type: 'ENGLISH_EXAM', title: 'Examen de Inglés', icon: '🌐', required: true },
        { type: 'PSYCHOLOGICAL_INTERVIEW', title: 'Entrevista Psicológica', icon: '🧠', required: true },
        { type: 'CYCLE_DIRECTOR_INTERVIEW', title: 'Entrevista Director(a) de Ciclo', icon: '👔', required: true },
        { type: 'CYCLE_DIRECTOR_REPORT', title: 'Informe Director(a) de Ciclo', icon: '📋', required: false }
    ];

    const renderEvaluationsTab = () => {
        const requiredTypes = REQUIRED_EVALUATION_TYPES.filter(t => t.required);
        const completedEvaluations = evaluations.filter(e => e.status === 'COMPLETED').length;
        const inProgressEvaluations = evaluations.filter(e => e.status === 'IN_PROGRESS').length;
        const missingEvaluations = requiredTypes.filter(type =>
            !evaluations.some(evaluation => evaluation.evaluationType === type.type)
        ).length;

        const progress = Math.round(((completedEvaluations + inProgressEvaluations) / requiredTypes.length) * 100);

        return (
            <div className="space-y-6">
                {/* Header con refresh */}
                <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                        <FiCheckCircle className="w-5 h-5" />
                        Sistema de Evaluaciones
                    </h3>
                    <Button
                        size="sm"
                        variant="outline"
                        onClick={loadEvaluations}
                        disabled={evaluationsLoading}
                    >
                        <FiRefreshCw className={`w-4 h-4 mr-1 ${evaluationsLoading ? 'animate-spin' : ''}`} />
                        Actualizar
                    </Button>
                </div>

                {/* Progreso general */}
                <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-gray-700">Progreso de Evaluaciones Obligatorias</span>
                        <span className="text-sm text-gray-600">{completedEvaluations + inProgressEvaluations} de {requiredTypes.length}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                        <div
                            className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${progress}%` }}
                        ></div>
                    </div>
                    <div className="flex justify-between text-xs text-gray-600">
                        <span>{completedEvaluations} completadas</span>
                        <span>{inProgressEvaluations} en progreso</span>
                        <span>{missingEvaluations} pendientes</span>
                    </div>
                </div>

                {/* Estado de cada tipo de evaluación */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {REQUIRED_EVALUATION_TYPES.map(type => {
                        const evaluation = evaluations.find(e => e.evaluationType === type.type);
                        const hasEvaluation = !!evaluation;
                        const isCompleted = evaluation?.status === 'COMPLETED';
                        const isInProgress = evaluation?.status === 'IN_PROGRESS';

                        return (
                            <div key={type.type} className={`p-4 rounded-lg border-2 ${
                                isCompleted ? 'border-green-200 bg-green-50' :
                                isInProgress ? 'border-blue-200 bg-blue-50' :
                                type.required ? 'border-orange-200 bg-orange-50' :
                                'border-gray-200 bg-gray-50'
                            }`}>
                                <div className="flex items-center justify-between mb-2">
                                    <div className="flex items-center gap-2">
                                        <span className="text-lg">{type.icon}</span>
                                        <span className="font-medium text-gray-900">{type.title}</span>
                                        {type.required && <span className="text-red-500 text-xs">*</span>}
                                    </div>
                                    <Badge
                                        variant="neutral"
                                        size="sm"
                                        className={`text-xs ${
                                            isCompleted ? 'text-green-700 bg-green-100' :
                                            isInProgress ? 'text-blue-700 bg-blue-100' :
                                            type.required ? 'text-orange-700 bg-orange-100' :
                                            'text-gray-600 bg-gray-100'
                                        }`}
                                    >
                                        {isCompleted ? 'Completada' :
                                         isInProgress ? 'En Progreso' :
                                         type.required ? 'Requerida' : 'Opcional'}
                                    </Badge>
                                </div>

                                {evaluation && (
                                    <div className="space-y-1 text-xs text-gray-600">
                                        {evaluation.score !== null && evaluation.score !== undefined && (
                                            <p className="font-medium text-blue-600">📊 Puntaje: {evaluation.score}{type.type.includes('EXAM') ? '/100' : ''}</p>
                                        )}
                                        {evaluation.evaluator && (
                                            <p>👤 {evaluation.evaluator.firstName} {evaluation.evaluator.lastName}</p>
                                        )}
                                        {evaluation.completionDate && (
                                            <p>✅ {new Date(evaluation.completionDate).toLocaleDateString('es-CL')}</p>
                                        )}
                                    </div>
                                )}

                                {!hasEvaluation && (
                                    <p className="text-xs text-gray-500 mt-2">⏳ Evaluación pendiente</p>
                                )}

                                {hasEvaluation && (
                                    <div className="mt-3">
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            className="w-full text-xs"
                                            onClick={() => {
                                                setSelectedEvaluation(evaluation);
                                                setShowEvaluationDetail(true);
                                            }}
                                        >
                                            <FiEye className="w-3 h-3 mr-1" />
                                            Ver Detalles
                                        </Button>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>

                {evaluationsLoading && (
                    <div className="text-center py-4">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto"></div>
                        <p className="text-sm text-gray-600 mt-2">Cargando evaluaciones...</p>
                    </div>
                )}
            </div>
        );
    };

    const tabs = [
        { key: 'info', label: 'Información General', icon: FiUser },
        { key: 'familia', label: 'Familia', icon: FiUsers },
        { key: 'academico', label: 'Académico', icon: FiAward },
        { key: 'entrevistas', label: 'Entrevistas', icon: FiCalendar },
        { key: 'evaluaciones', label: 'Evaluaciones', icon: FiCheckCircle },
        { key: 'documentos', label: 'Documentos', icon: FiFileText },
        { key: 'historial', label: 'Historial', icon: FiClock }
    ];

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="Información Detallada del Estudiante"
            size="max"
        >
            <div className="flex flex-col min-h-[600px]">
                {/* Tabs */}
                <div className="flex border-b border-gray-200 mb-6 overflow-x-auto">
                    {tabs.map((tab) => {
                        const Icon = tab.icon;
                        return (
                            <button
                                key={tab.key}
                                onClick={() => setActiveTab(tab.key as any)}
                                className={`flex items-center gap-2 px-4 py-2 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                                    activeTab === tab.key
                                        ? 'border-blue-500 text-blue-600'
                                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                }`}
                            >
                                <Icon className="w-4 h-4" />
                                {tab.label}
                            </button>
                        );
                    })}
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto">
                    {loading ? (
                        <div className="flex items-center justify-center py-12">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                        </div>
                    ) : (
                        <>
                            {activeTab === 'info' && renderInfoTab()}
                            {activeTab === 'familia' && renderFamiliaTab()}
                            {activeTab === 'academico' && renderAcademicoTab()}
                            {activeTab === 'entrevistas' && renderEntrevistasTab()}
                            {activeTab === 'evaluaciones' && renderEvaluationsTab()}
                            {activeTab === 'documentos' && renderDocumentosTab()}
                            {activeTab === 'historial' && renderHistorialTab()}
                        </>
                    )}
                </div>

                {/* Action buttons */}
                <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-gray-200">
                    <Button variant="outline" onClick={onClose}>
                        Cerrar
                    </Button>
                    <Button 
                        variant="secondary" 
                        onClick={() => onEdit?.(postulante)}
                    >
                        <FiEdit className="w-4 h-4 mr-2" />
                        Editar
                    </Button>
                    {postulante.estadoPostulacion === 'UNDER_REVIEW' && (
                        <Button 
                            variant="primary" 
                            onClick={() => onScheduleInterview?.(postulante)}
                        >
                            <FiCalendar className="w-4 h-4 mr-2" />
                            Programar Entrevista
                        </Button>
                    )}
                </div>
            </div>

            {/* Modal de Detalles de Evaluación */}
            {showEvaluationDetail && selectedEvaluation && (
                <Modal
                    isOpen={showEvaluationDetail}
                    onClose={() => {
                        setShowEvaluationDetail(false);
                        setSelectedEvaluation(null);
                    }}
                    title="Detalles de la Evaluación"
                    size="lg"
                >
                    {console.log('📊 Selected Evaluation:', selectedEvaluation)}
                    <div className="space-y-6">
                        {/* Header */}
                        <div className="bg-blue-50 p-4 rounded-lg">
                            <h3 className="text-lg font-bold text-blue-900">
                                {selectedEvaluation.evaluationType === 'MATHEMATICS_EXAM' && '📐 Examen de Matemática'}
                                {selectedEvaluation.evaluationType === 'LANGUAGE_EXAM' && '📚 Examen de Lenguaje'}
                                {selectedEvaluation.evaluationType === 'ENGLISH_EXAM' && '🌎 Examen de Inglés'}
                                {selectedEvaluation.evaluationType === 'PSYCHOLOGICAL_INTERVIEW' && '🧠 Entrevista Psicológica'}
                                {selectedEvaluation.evaluationType === 'DIRECTOR_INTERVIEW' && '👔 Entrevista Director(a) de Ciclo'}
                                {selectedEvaluation.evaluationType === 'DIRECTOR_REPORT' && '📋 Informe Director(a) de Ciclo'}
                            </h3>
                            <div className="flex items-center gap-4 mt-2 text-sm text-blue-700">
                                <span>👤 {selectedEvaluation.evaluator?.firstName} {selectedEvaluation.evaluator?.lastName}</span>
                                {selectedEvaluation.completionDate && (
                                    <span>📅 {new Date(selectedEvaluation.completionDate).toLocaleDateString('es-CL', { dateStyle: 'long' })}</span>
                                )}
                            </div>
                        </div>

                        {/* Puntaje */}
                        {selectedEvaluation.score !== null && selectedEvaluation.score !== undefined && (
                            <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                                <div className="flex items-center justify-between">
                                    <span className="text-lg font-semibold text-green-900">Puntaje Obtenido:</span>
                                    <span className="text-3xl font-bold text-green-700">
                                        {selectedEvaluation.score}
                                        {selectedEvaluation.evaluationType && selectedEvaluation.evaluationType.includes('EXAM') ? '/100' : '/10'}
                                    </span>
                                </div>
                            </div>
                        )}

                        {/* Observaciones Generales */}
                        {selectedEvaluation.observations && (
                            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                                <h4 className="font-semibold text-blue-900 mb-2 flex items-center gap-2">
                                    <FiMessageSquare className="w-5 h-5" />
                                    Observaciones Generales
                                </h4>
                                <p className="text-gray-700 whitespace-pre-wrap">{selectedEvaluation.observations}</p>
                            </div>
                        )}

                        {/* Fortalezas */}
                        {selectedEvaluation.strengths && (
                            <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                                <h4 className="font-semibold text-green-900 mb-2 flex items-center gap-2">
                                    <FiCheckCircle className="w-5 h-5" />
                                    Fortalezas Identificadas
                                </h4>
                                <p className="text-gray-700 whitespace-pre-wrap">{selectedEvaluation.strengths}</p>
                            </div>
                        )}

                        {/* Áreas de Mejora */}
                        {selectedEvaluation.areasForImprovement && (
                            <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
                                <h4 className="font-semibold text-orange-900 mb-2 flex items-center gap-2">
                                    <FiAlertCircle className="w-5 h-5" />
                                    Áreas de Mejora
                                </h4>
                                <p className="text-gray-700 whitespace-pre-wrap">{selectedEvaluation.areasForImprovement}</p>
                            </div>
                        )}

                        {/* Recomendaciones */}
                        {selectedEvaluation.recommendations && (
                            <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
                                <h4 className="font-semibold text-purple-900 mb-2 flex items-center gap-2">
                                    <FiStar className="w-5 h-5" />
                                    Recomendaciones
                                </h4>
                                <p className="text-gray-700 whitespace-pre-wrap">{selectedEvaluation.recommendations}</p>
                            </div>
                        )}

                        {/* Campos específicos para Entrevista Psicológica */}
                        {selectedEvaluation.evaluationType === 'PSYCHOLOGICAL_INTERVIEW' && (
                            <div className="space-y-4">
                                {selectedEvaluation.socialSkillsAssessment && (
                                    <div className="bg-teal-50 p-4 rounded-lg border border-teal-200">
                                        <h4 className="font-semibold text-teal-900 mb-2">🤝 Habilidades Sociales</h4>
                                        <p className="text-gray-700 whitespace-pre-wrap">{selectedEvaluation.socialSkillsAssessment}</p>
                                    </div>
                                )}
                                {selectedEvaluation.emotionalMaturity && (
                                    <div className="bg-indigo-50 p-4 rounded-lg border border-indigo-200">
                                        <h4 className="font-semibold text-indigo-900 mb-2">💎 Madurez Emocional</h4>
                                        <p className="text-gray-700 whitespace-pre-wrap">{selectedEvaluation.emotionalMaturity}</p>
                                    </div>
                                )}
                                {selectedEvaluation.motivationAssessment && (
                                    <div className="bg-pink-50 p-4 rounded-lg border border-pink-200">
                                        <h4 className="font-semibold text-pink-900 mb-2">🎯 Motivación</h4>
                                        <p className="text-gray-700 whitespace-pre-wrap">{selectedEvaluation.motivationAssessment}</p>
                                    </div>
                                )}
                                {selectedEvaluation.familySupportAssessment && (
                                    <div className="bg-amber-50 p-4 rounded-lg border border-amber-200">
                                        <h4 className="font-semibold text-amber-900 mb-2">👨‍👩‍👧‍👦 Apoyo Familiar</h4>
                                        <p className="text-gray-700 whitespace-pre-wrap">{selectedEvaluation.familySupportAssessment}</p>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Campos específicos para Evaluación Director de Ciclo */}
                        {(selectedEvaluation.evaluationType === 'DIRECTOR_INTERVIEW' || selectedEvaluation.evaluationType === 'CYCLE_DIRECTOR_INTERVIEW' || selectedEvaluation.evaluationType === 'CYCLE_DIRECTOR_REPORT') && (
                            <div className="space-y-4">
                                {selectedEvaluation.academicReadiness && (
                                    <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                                        <h4 className="font-semibold text-blue-900 mb-2">📚 Preparación Académica</h4>
                                        <p className="text-gray-700 whitespace-pre-wrap">{selectedEvaluation.academicReadiness}</p>
                                    </div>
                                )}
                                {selectedEvaluation.behavioralAssessment && (
                                    <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
                                        <h4 className="font-semibold text-purple-900 mb-2">🎭 Evaluación Conductual</h4>
                                        <p className="text-gray-700 whitespace-pre-wrap">{selectedEvaluation.behavioralAssessment}</p>
                                    </div>
                                )}
                                {selectedEvaluation.integrationPotential && (
                                    <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                                        <h4 className="font-semibold text-green-900 mb-2">🌟 Potencial de Integración</h4>
                                        <p className="text-gray-700 whitespace-pre-wrap">{selectedEvaluation.integrationPotential}</p>
                                    </div>
                                )}
                                {selectedEvaluation.finalRecommendation !== undefined && (
                                    <div className={`p-4 rounded-lg border-2 ${selectedEvaluation.finalRecommendation ? 'bg-green-50 border-green-400' : 'bg-red-50 border-red-400'}`}>
                                        <h4 className={`font-bold mb-2 ${selectedEvaluation.finalRecommendation ? 'text-green-900' : 'text-red-900'}`}>
                                            {selectedEvaluation.finalRecommendation ? '✅ Recomendación Positiva' : '❌ No Recomendado'}
                                        </h4>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Estado */}
                        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                            <span className="font-medium text-gray-700">Estado de la Evaluación:</span>
                            <Badge variant={selectedEvaluation.status === 'COMPLETED' ? 'success' : 'warning'} size="lg">
                                {selectedEvaluation.status === 'COMPLETED' ? 'Completada' : 'En Proceso'}
                            </Badge>
                        </div>

                        {/* Botones de Acción */}
                        <div className="flex justify-end gap-3 pt-4 border-t">
                            <Button
                                variant="outline"
                                onClick={() => {
                                    setShowEvaluationDetail(false);
                                    setSelectedEvaluation(null);
                                }}
                            >
                                Cerrar
                            </Button>
                        </div>
                    </div>
                </Modal>
            )}
        </Modal>
    );
};

export default StudentDetailModal;