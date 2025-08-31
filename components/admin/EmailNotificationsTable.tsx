import React, { useState } from 'react';
import DataTable, { TableColumn } from '../ui/DataTable';
import Badge from '../ui/Badge';
import Button from '../ui/Button';
import { FiEye, FiMail, FiCheck, FiX, FiClock, FiRefreshCw } from 'react-icons/fi';
import Modal from '../ui/Modal';
import { useDataTable } from '../../hooks/useDataTable';
import { dataService, EmailNotificationData } from '../../services/dataService';

// Usar tipos centralizados
type EmailNotification = EmailNotificationData;

interface EmailNotificationsTableProps {
    applicationId?: number; // Si se proporciona, muestra solo emails de esa aplicación
}

const EmailNotificationsTable: React.FC<EmailNotificationsTableProps> = ({ applicationId }) => {
    // Usar hook centralizado para manejo de datos
    const {
        data: emailNotifications,
        loading,
        error,
        pagination,
        loadData,
        refresh
    } = useDataTable<EmailNotification>(
        (page, size) => dataService.getEmailNotifications(page, size),
        { initialPageSize: 25 }
    );

    const [selectedNotification, setSelectedNotification] = useState<EmailNotification | null>(null);
    const [showDetailsModal, setShowDetailsModal] = useState(false);
    const [events, setEvents] = useState<any[]>([]);


    // Cargar eventos de una notificación
    const loadNotificationEvents = async (notificationId: number) => {
        try {
            const response = await fetch(`/api/admin/email-notifications/${notificationId}/events`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
                }
            });

            if (response.ok) {
                const eventsData = await response.json();
                setEvents(eventsData);
            }
        } catch (error) {
            console.error('Error cargando eventos:', error);
        }
    };

    // Ver detalles de notificación
    const handleViewDetails = async (notification: EmailNotification) => {
        setSelectedNotification(notification);
        await loadNotificationEvents(notification.id);
        setShowDetailsModal(true);
    };

    const handlePageChange = (page: number, pageSize: number) => {
        loadData(page, pageSize);
    };

    // Formatear tipos de email
    const getEmailTypeLabel = (type: string) => {
        const labels: Record<string, string> = {
            'INTERVIEW_SCHEDULED': 'Entrevista Programada',
            'INTERVIEW_REMINDER': 'Recordatorio Entrevista',
            'INTERVIEW_CONFIRMED': 'Entrevista Confirmada',
            'INTERVIEW_RESCHEDULED': 'Entrevista Reprogramada',
            'INTERVIEW_CANCELLED': 'Entrevista Cancelada',
            'ACCEPTANCE_NOTIFICATION': 'Notificación Aceptación',
            'REJECTION_NOTIFICATION': 'Notificación Rechazo',
            'WAITLIST_NOTIFICATION': 'Lista de Espera',
            'GENERAL_COMMUNICATION': 'Comunicación General'
        };
        return labels[type] || type;
    };

    // Formatear valores de respuesta
    const getResponseValueLabel = (value?: string) => {
        const labels: Record<string, string> = {
            'ACCEPT': 'Aceptar',
            'REJECT': 'Rechazar', 
            'RESCHEDULE': 'Reprogramar',
            'NEED_MORE_INFO': 'Más información'
        };
        return value ? labels[value] || value : '';
    };

    // Configuración de columnas
    const columns: TableColumn<EmailNotification>[] = [
        {
            key: 'status',
            title: 'Estado',
            width: 120,
            align: 'center',
            render: (_, record) => {
                if (!record) return <div>-</div>;
                return (
                    <div className="flex flex-col gap-1">
                        <Badge variant={record.opened ? 'green' : 'gray'} size="xs">
                            {record.opened ? (
                                <>
                                    <FiCheck className="w-3 h-3" />
                                    Leído
                                </>
                            ) : (
                                <>
                                    <FiMail className="w-3 h-3" />
                                    No leído
                                </>
                            )}
                        </Badge>
                        {record.responseRequired && (
                            <Badge variant={record.responded ? 'blue' : 'orange'} size="xs">
                                {record.responded ? (
                                    <>
                                        <FiCheck className="w-3 h-3" />
                                        Respondido
                                    </>
                                ) : (
                                    <>
                                        <FiClock className="w-3 h-3" />
                                        Pendiente
                                    </>
                                )}
                            </Badge>
                        )}
                    </div>
                );
            }
        },
        {
            key: 'student',
            title: 'Estudiante',
            dataIndex: 'studentName',
            sortable: true,
            filterable: true,
            filterType: 'text',
            width: 200,
            render: (_, record) => {
                if (!record) return <div>-</div>;
                return (
                    <div className="flex flex-col">
                        <span className="font-medium text-gray-900">{record.studentName || '-'}</span>
                        <div className="flex items-center gap-2 text-xs text-gray-500">
                            <Badge variant="blue" size="xs">
                                {record.targetSchool === 'MONTE_TABOR' ? 'Monte Tabor' : 'Nazaret'}
                            </Badge>
                            <span>{record.studentGender === 'FEMALE' ? '👧' : '👦'}</span>
                        </div>
                    </div>
                );
            }
        },
        {
            key: 'email',
            title: 'Email',
            dataIndex: 'recipientEmail',
            sortable: true,
            filterable: true,
            filterType: 'text',
            width: 220,
            render: (_, record) => {
                if (!record) return <div>-</div>;
                return (
                    <div className="flex flex-col">
                        <span className="text-sm text-gray-900">{record.recipientEmail || '-'}</span>
                        <span className="text-xs text-gray-500">
                            Aplicación #{record.application?.id || 'N/A'}
                        </span>
                    </div>
                );
            }
        },
        {
            key: 'type',
            title: 'Tipo',
            dataIndex: 'emailType',
            sortable: true,
            filterable: true,
            filterType: 'select',
            filterOptions: [
                { label: 'Entrevista Programada', value: 'INTERVIEW_SCHEDULED' },
                { label: 'Recordatorio', value: 'INTERVIEW_REMINDER' },
                { label: 'Confirmación', value: 'INTERVIEW_CONFIRMED' },
                { label: 'Aceptación', value: 'ACCEPTANCE_NOTIFICATION' },
                { label: 'Rechazo', value: 'REJECTION_NOTIFICATION' }
            ],
            width: 180,
            render: (_, record) => {
                if (!record) return <div>-</div>;
                return (
                    <div className="flex flex-col">
                        <span className="text-sm font-medium text-gray-900">
                            {getEmailTypeLabel(record.emailType || '')}
                        </span>
                        <span className="text-xs text-gray-500">{record.subject || '-'}</span>
                    </div>
                );
            }
        },
        {
            key: 'metrics',
            title: 'Métricas',
            width: 140,
            align: 'center',
            render: (_, record) => {
                if (!record) return <div>-</div>;
                return (
                    <div className="flex flex-col gap-1 text-xs">
                        <div className="flex items-center gap-1">
                            <FiEye className="w-3 h-3 text-blue-500" />
                            <span>Abierto {record.openCount || 0}x</span>
                        </div>
                        {record.opened && record.openedAt && (
                            <span className="text-gray-500">
                                {new Date(record.openedAt).toLocaleDateString()}
                            </span>
                        )}
                        {record.responded && record.responseValue && (
                            <Badge variant="green" size="xs">
                                {getResponseValueLabel(record.responseValue)}
                            </Badge>
                        )}
                    </div>
                );
            }
        },
        {
            key: 'dates',
            title: 'Fechas',
            dataIndex: 'sentAt',
            sortable: true,
            filterable: true,
            filterType: 'date',
            width: 140,
            render: (_, record) => {
                if (!record) return <div>-</div>;
                return (
                    <div className="flex flex-col text-xs">
                        <div>
                            <span className="text-gray-500">Enviado:</span><br />
                            <span className="text-gray-900">
                                {record.sentAt ? new Date(record.sentAt).toLocaleDateString('es-ES') : '-'}
                            </span>
                        </div>
                        {record.respondedAt && (
                            <div className="mt-1">
                                <span className="text-gray-500">Respondido:</span><br />
                                <span className="text-green-600">
                                    {new Date(record.respondedAt).toLocaleDateString('es-ES')}
                                </span>
                            </div>
                        )}
                    </div>
                );
            }
        },
        {
            key: 'actions',
            title: 'Acciones',
            width: 100,
            align: 'center',
            render: (_, record) => {
                if (!record) return <div>-</div>;
                return (
                    <div className="flex justify-center gap-1">
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleViewDetails(record)}
                        >
                            <FiEye className="w-4 h-4" />
                        </Button>
                    </div>
                );
            }
        }
    ];

    // El hook useDataTable maneja la carga inicial automáticamente
    // TODO: Implementar carga de estadísticas si se necesita

    return (
        <div className="space-y-6">
            {/* Estadísticas - Solo para vista general */}
            {false && !applicationId && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="bg-white p-4 rounded-lg shadow-sm border">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Total Emails</p>
                                <p className="text-2xl font-bold text-gray-900">{emailStats.totalEmails}</p>
                            </div>
                            <FiMail className="w-8 h-8 text-blue-500" />
                        </div>
                    </div>
                    
                    <div className="bg-white p-4 rounded-lg shadow-sm border">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Tasa de Apertura</p>
                                <p className="text-2xl font-bold text-green-600">{emailStats.openRate}%</p>
                            </div>
                            <FiEye className="w-8 h-8 text-green-500" />
                        </div>
                    </div>
                    
                    <div className="bg-white p-4 rounded-lg shadow-sm border">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Tasa de Respuesta</p>
                                <p className="text-2xl font-bold text-blue-600">{emailStats.responseRate}%</p>
                            </div>
                            <FiCheck className="w-8 h-8 text-blue-500" />
                        </div>
                    </div>
                    
                    <div className="bg-white p-4 rounded-lg shadow-sm border">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Pendientes</p>
                                <p className="text-2xl font-bold text-orange-600">{emailStats.pendingResponsesCount}</p>
                            </div>
                            <FiClock className="w-8 h-8 text-orange-500" />
                        </div>
                    </div>
                </div>
            )}

            {/* Tabla de notificaciones */}
            <DataTable
                title={applicationId ? `Emails - Aplicación #${applicationId}` : "Notificaciones de Email"}
                columns={columns}
                data={emailNotifications}
                loading={loading}
                pagination={{
                    ...pagination,
                    onChange: handlePageChange
                }}
                onRefresh={refresh}
                rowKey="id"
                className="shadow-sm"
            />

            {/* Modal de detalles */}
            {showDetailsModal && selectedNotification && (
                <Modal
                    isOpen={showDetailsModal}
                    onClose={() => setShowDetailsModal(false)}
                    title={`Detalles - ${selectedNotification.studentName}`}
                >
                    <div className="space-y-4">
                        {/* Información básica */}
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="text-sm font-medium text-gray-600">Tipo de Email</label>
                                <p className="text-sm text-gray-900">{getEmailTypeLabel(selectedNotification.emailType)}</p>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-gray-600">Estado</label>
                                <div className="flex gap-2">
                                    <Badge variant={selectedNotification.opened ? 'green' : 'gray'} size="sm">
                                        {selectedNotification.opened ? 'Leído' : 'No leído'}
                                    </Badge>
                                    {selectedNotification.responseRequired && (
                                        <Badge variant={selectedNotification.responded ? 'blue' : 'orange'} size="sm">
                                            {selectedNotification.responded ? 'Respondido' : 'Pendiente'}
                                        </Badge>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Asunto */}
                        <div>
                            <label className="text-sm font-medium text-gray-600">Asunto</label>
                            <p className="text-sm text-gray-900">{selectedNotification.subject}</p>
                        </div>

                        {/* Métricas */}
                        <div className="grid grid-cols-3 gap-4">
                            <div>
                                <label className="text-sm font-medium text-gray-600">Veces Abierto</label>
                                <p className="text-lg font-semibold text-blue-600">{selectedNotification.openCount}</p>
                            </div>
                            {selectedNotification.opened && selectedNotification.openedAt && (
                                <div>
                                    <label className="text-sm font-medium text-gray-600">Primera Apertura</label>
                                    <p className="text-sm text-gray-900">
                                        {new Date(selectedNotification.openedAt).toLocaleString('es-ES')}
                                    </p>
                                </div>
                            )}
                            {selectedNotification.responded && selectedNotification.respondedAt && (
                                <div>
                                    <label className="text-sm font-medium text-gray-600">Respuesta</label>
                                    <p className="text-sm text-gray-900">
                                        {getResponseValueLabel(selectedNotification.responseValue)}
                                    </p>
                                    <p className="text-xs text-gray-500">
                                        {new Date(selectedNotification.respondedAt).toLocaleString('es-ES')}
                                    </p>
                                </div>
                            )}
                        </div>

                        {/* Eventos */}
                        {events.length > 0 && (
                            <div>
                                <label className="text-sm font-medium text-gray-600">Historial de Eventos</label>
                                <div className="mt-2 space-y-2 max-h-60 overflow-y-auto">
                                    {events.map((event, index) => (
                                        <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded text-sm">
                                            <div className="flex items-center gap-2">
                                                <span className="font-medium">{event.eventType}</span>
                                                {event.ipAddress && (
                                                    <span className="text-gray-500">IP: {event.ipAddress}</span>
                                                )}
                                            </div>
                                            <span className="text-gray-500">
                                                {new Date(event.createdAt).toLocaleString('es-ES')}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </Modal>
            )}
        </div>
    );
};

export default EmailNotificationsTable;