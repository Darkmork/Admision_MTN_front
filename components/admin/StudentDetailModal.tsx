import React, { useState, useEffect } from 'react';
import Modal from '../ui/Modal';
import Badge from '../ui/Badge';
import Button from '../ui/Button';
import { 
    FiUser, FiPhone, FiMail, FiMapPin, FiHome, FiBookOpen, FiCalendar, 
    FiFileText, FiEdit, FiDownload, FiClock, FiCheckCircle, FiAlertCircle, 
    FiUsers, FiBriefcase, FiHeart, FiStar, FiEye,
    FiX, FiChevronRight, FiInfo, FiMessageSquare, FiAward
} from 'react-icons/fi';
import { useNotifications } from '../../context/AppContext';
import { applicationService, Application } from '../../services/applicationService';

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

interface StudentDetailModalProps {
    isOpen: boolean;
    onClose: () => void;
    postulante?: Postulante;
    onEdit?: (postulante: Postulante) => void;
    onUpdateStatus?: (postulante: Postulante, newStatus: string) => void;
    onScheduleInterview?: (postulante: Postulante) => void;
}

const StudentDetailModal: React.FC<StudentDetailModalProps> = ({
    isOpen,
    onClose,
    postulante,
    onEdit,
    onUpdateStatus,
    onScheduleInterview
}) => {
    const [activeTab, setActiveTab] = useState<'info' | 'familia' | 'academico' | 'documentos' | 'historial'>('info');
    const [fullApplication, setFullApplication] = useState<Application | null>(null);
    const [loading, setLoading] = useState(false);
    const { addNotification } = useNotifications();

    // Cargar información completa de la aplicación
    useEffect(() => {
        if (postulante && isOpen) {
            loadFullApplication();
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

    if (!postulante) return null;

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

    const renderInfoTab = () => (
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

    const tabs = [
        { key: 'info', label: 'Información General', icon: FiUser },
        { key: 'familia', label: 'Familia', icon: FiUsers },
        { key: 'academico', label: 'Académico', icon: FiAward },
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
            <div className="flex flex-col h-full">
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
        </Modal>
    );
};

export default StudentDetailModal;