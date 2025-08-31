import React, { useState } from 'react';
import Card from '../ui/Card';
import Button from '../ui/Button';
import { FiUsers, FiFileText, FiBarChart2, FiCalendar, FiBookOpen, FiStar, FiUser, FiMail } from 'react-icons/fi';
import UsersDataTable from './UsersDataTable';
import ApplicationsDataTable from './ApplicationsDataTable';
import EnhancedApplicationsDataTable from './EnhancedApplicationsDataTable';
import PostulantesDataTable from './PostulantesDataTable';
import EvaluationsDataTable from './EvaluationsDataTable';
import EmailNotificationsTable from './EmailNotificationsTable';
import InterviewsDataTable from './InterviewsDataTable';
import Modal from '../ui/Modal';

type TableView = 'users' | 'postulantes' | 'applications' | 'evaluations' | 'emails' | 'interviews' | 'reports' | 'analytics';

interface AdminDataTablesProps {
    className?: string;
}

const AdminDataTables: React.FC<AdminDataTablesProps> = ({ className = '' }) => {
    const [activeView, setActiveView] = useState<TableView>('users');
    const [showCreateUserModal, setShowCreateUserModal] = useState(false);
    const [showEditUserModal, setShowEditUserModal] = useState(false);
    const [selectedUser, setSelectedUser] = useState<any>(null);

    // Configuración de las vistas disponibles
    const views = [
        {
            key: 'users' as TableView,
            title: 'Gestión de Usuarios',
            description: 'Administrar usuarios del sistema',
            icon: FiUsers,
            color: 'blue'
        },
        {
            key: 'postulantes' as TableView,
            title: 'Gestión de Postulantes',
            description: 'Administrar estudiantes que postulan al colegio',
            icon: FiUser,
            color: 'teal'
        },
        {
            key: 'applications' as TableView,
            title: 'Postulaciones Avanzadas',
            description: 'Gestión completa con filtros avanzados y exportación',
            icon: FiFileText,
            color: 'green'
        },
        {
            key: 'evaluations' as TableView,
            title: 'Evaluaciones',
            description: 'Seguimiento de evaluaciones',
            icon: FiStar,
            color: 'purple'
        },
        {
            key: 'emails' as TableView,
            title: 'Notificaciones Email',
            description: 'Tracking de correos personalizados con respuestas automáticas',
            icon: FiMail,
            color: 'cyan'
        },
        {
            key: 'interviews' as TableView,
            title: 'Entrevistas',
            description: 'Programación de entrevistas',
            icon: FiCalendar,
            color: 'orange'
        },
        {
            key: 'reports' as TableView,
            title: 'Reportes',
            description: 'Informes y estadísticas',
            icon: FiBarChart2,
            color: 'indigo'
        },
        {
            key: 'analytics' as TableView,
            title: 'Análisis',
            description: 'Análisis de datos',
            icon: FiBookOpen,
            color: 'pink'
        }
    ];

    // Renderizar el contenido según la vista activa
    const renderContent = () => {
        switch (activeView) {
            case 'users':
                return (
                    <UsersDataTable
                        onCreateUser={() => setShowCreateUserModal(true)}
                        onEditUser={(user) => {
                            setSelectedUser(user);
                            setShowEditUserModal(true);
                        }}
                    />
                );
            
            case 'postulantes':
                return (
                    <PostulantesDataTable
                        onViewPostulante={(postulante) => {
                            console.log('Ver postulante:', postulante);
                            // TODO: Implementar modal de vista detallada del postulante
                        }}
                        onEditPostulante={(postulante) => {
                            console.log('Editar postulante:', postulante);
                            // TODO: Implementar modal de edición del postulante
                        }}
                        onScheduleInterview={(postulante) => {
                            console.log('Programar entrevista para:', postulante.nombreCompleto);
                            // TODO: Implementar modal de programación de entrevista
                        }}
                        onUpdateStatus={(postulante, newStatus) => {
                            console.log('Actualizar estado:', postulante.nombreCompleto, 'nuevo estado:', newStatus);
                            // TODO: Implementar actualización de estado
                        }}
                    />
                );
            
            case 'applications':
                return (
                    <EnhancedApplicationsDataTable
                        onViewApplication={(app) => {
                            console.log('Ver aplicación completa:', app);
                            // TODO: Implementar modal de vista detallada
                        }}
                        onEditApplication={(app) => {
                            console.log('Editar aplicación:', app);
                            // TODO: Implementar modal de edición
                        }}
                        onScheduleInterview={(app) => {
                            console.log('Programar entrevista para:', app.studentFullName);
                            // TODO: Implementar modal de programación de entrevista
                        }}
                        onScheduleExam={(app) => {
                            console.log('Programar examen para:', app.studentFullName);
                            // TODO: Implementar modal de programación de examen
                        }}
                        onUpdateStatus={(app, newStatus) => {
                            console.log('Actualizar estado:', app.studentFullName, 'nuevo estado:', newStatus);
                            // TODO: Implementar actualización de estado
                        }}
                    />
                );
            
            case 'evaluations':
                return (
                    <EvaluationsDataTable
                        onViewEvaluation={(evaluation) => {
                            console.log('Ver evaluación:', evaluation);
                            // TODO: Implementar modal de vista detallada de evaluación
                        }}
                        onEditEvaluation={(evaluation) => {
                            console.log('Editar evaluación:', evaluation);
                            // TODO: Implementar modal de edición de evaluación
                        }}
                        onScheduleEvaluation={(evaluation) => {
                            console.log('Programar evaluación para:', evaluation.studentName);
                            // TODO: Implementar modal de programación de evaluación
                        }}
                        onUpdateStatus={(evaluation, newStatus) => {
                            console.log('Actualizar estado de evaluación:', evaluation.studentName, 'nuevo estado:', newStatus);
                            // TODO: Implementar actualización de estado
                        }}
                    />
                );
            
            case 'emails':
                return <EmailNotificationsTable />;
            
            case 'interviews':
                return <InterviewsDataTable />;
            
            case 'reports':
                return (
                    <Card className="p-8 text-center">
                        <FiBarChart2 className="mx-auto h-12 w-12 text-indigo-400 mb-4" />
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">
                            Reportes del Sistema
                        </h3>
                        <p className="text-gray-600 mb-4">
                            Esta sección incluirá reportes detallados con filtros avanzados por período, curso y estado.
                        </p>
                        <Button variant="primary">
                            Próximamente
                        </Button>
                    </Card>
                );
            
            case 'analytics':
                return (
                    <Card className="p-8 text-center">
                        <FiBookOpen className="mx-auto h-12 w-12 text-pink-400 mb-4" />
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">
                            Análisis de Datos
                        </h3>
                        <p className="text-gray-600 mb-4">
                            Esta sección proporcionará análisis avanzados con filtros por múltiples criterios y visualizaciones.
                        </p>
                        <Button variant="primary">
                            Próximamente
                        </Button>
                    </Card>
                );
            
            default:
                return null;
        }
    };

    const activeViewConfig = views.find(view => view.key === activeView);

    return (
        <div className={`space-y-6 ${className}`}>
            {/* Header con navegación de tabs */}
            <Card className="p-6">
                <div className="border-b border-gray-200 mb-6">
                    <div className="flex flex-wrap gap-2">
                        {views.map((view) => {
                            const Icon = view.icon;
                            const isActive = activeView === view.key;
                            
                            return (
                                <button
                                    key={view.key}
                                    onClick={() => setActiveView(view.key)}
                                    className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg border transition-all duration-200 ${
                                        isActive
                                            ? `bg-${view.color}-50 text-${view.color}-700 border-${view.color}-200`
                                            : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50 hover:text-gray-700'
                                    }`}
                                >
                                    <Icon size={16} />
                                    {view.title}
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Descripción de la vista activa */}
                {activeViewConfig && (
                    <div className="flex items-center gap-3">
                        <activeViewConfig.icon className={`h-8 w-8 text-${activeViewConfig.color}-500`} />
                        <div>
                            <h2 className="text-xl font-bold text-gray-900">
                                {activeViewConfig.title}
                            </h2>
                            <p className="text-gray-600">
                                {activeViewConfig.description}
                            </p>
                        </div>
                    </div>
                )}
            </Card>

            {/* Contenido de la vista activa */}
            {renderContent()}

            {/* Modales */}
            <Modal
                isOpen={showCreateUserModal}
                onClose={() => setShowCreateUserModal(false)}
                title="Crear Nuevo Usuario"
                size="lg"
            >
                <div className="p-6">
                    <p className="text-gray-600">
                        Formulario para crear un nuevo usuario del sistema.
                    </p>
                    <div className="mt-4 flex justify-end gap-2">
                        <Button
                            variant="outline"
                            onClick={() => setShowCreateUserModal(false)}
                        >
                            Cancelar
                        </Button>
                        <Button variant="primary">
                            Guardar Usuario
                        </Button>
                    </div>
                </div>
            </Modal>

            <Modal
                isOpen={showEditUserModal}
                onClose={() => {
                    setShowEditUserModal(false);
                    setSelectedUser(null);
                }}
                title="Editar Usuario"
                size="lg"
            >
                <div className="p-6">
                    <p className="text-gray-600">
                        Formulario para editar el usuario: {selectedUser?.firstName} {selectedUser?.lastName}
                    </p>
                    <div className="mt-4 flex justify-end gap-2">
                        <Button
                            variant="outline"
                            onClick={() => {
                                setShowEditUserModal(false);
                                setSelectedUser(null);
                            }}
                        >
                            Cancelar
                        </Button>
                        <Button variant="primary">
                            Guardar Cambios
                        </Button>
                    </div>
                </div>
            </Modal>
        </div>
    );
};

export default AdminDataTables;