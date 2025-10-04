import React, { useEffect, useState } from 'react';
import { FiClock, FiUser, FiFileText, FiAlertCircle } from 'react-icons/fi';
import { applicationService } from '../../services/applicationService';

interface StatusHistoryItem {
    id: number;
    application_id: number;
    previous_status: string;
    new_status: string;
    change_note: string | null;
    changed_at: string;
    changed_by_first_name: string | null;
    changed_by_last_name: string | null;
    changed_by_email: string | null;
}

interface ApplicationStatusHistoryProps {
    applicationId: number;
}

const ApplicationStatusHistory: React.FC<ApplicationStatusHistoryProps> = ({ applicationId }) => {
    const [history, setHistory] = useState<StatusHistoryItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        loadHistory();
    }, [applicationId]);

    const loadHistory = async () => {
        setIsLoading(true);
        setError(null);

        try {
            const data = await applicationService.getApplicationStatusHistory(applicationId);
            setHistory(data);
        } catch (err: any) {
            setError(err.message || 'Error al cargar el historial');
        } finally {
            setIsLoading(false);
        }
    };

    const getStatusLabel = (status: string): string => {
        const statusMap: Record<string, string> = {
            'SUBMITTED': 'Enviada',
            'ENVIADA': 'Enviada',
            'UNDER_REVIEW': 'En Revisión',
            'EN_REVISION': 'En Revisión',
            'INTERVIEW_SCHEDULED': 'Entrevista Programada',
            'ENTREVISTA_PROGRAMADA': 'Entrevista Programada',
            'APPROVED': 'Aceptada',
            'ACEPTADA': 'Aceptada',
            'REJECTED': 'Rechazada',
            'RECHAZADA': 'Rechazada',
            'WAITLIST': 'Lista de Espera',
            'LISTA_ESPERA': 'Lista de Espera',
            'ARCHIVED': 'Archivada',
            'ARCHIVADA': 'Archivada'
        };

        return statusMap[status?.toUpperCase()] || status;
    };

    const getStatusColor = (status: string): string => {
        const colorMap: Record<string, string> = {
            'SUBMITTED': 'bg-blue-100 text-blue-800',
            'ENVIADA': 'bg-blue-100 text-blue-800',
            'UNDER_REVIEW': 'bg-yellow-100 text-yellow-800',
            'EN_REVISION': 'bg-yellow-100 text-yellow-800',
            'INTERVIEW_SCHEDULED': 'bg-purple-100 text-purple-800',
            'ENTREVISTA_PROGRAMADA': 'bg-purple-100 text-purple-800',
            'APPROVED': 'bg-green-100 text-green-800',
            'ACEPTADA': 'bg-green-100 text-green-800',
            'REJECTED': 'bg-red-100 text-red-800',
            'RECHAZADA': 'bg-red-100 text-red-800',
            'WAITLIST': 'bg-orange-100 text-orange-800',
            'LISTA_ESPERA': 'bg-orange-100 text-orange-800',
            'ARCHIVED': 'bg-gray-100 text-gray-800',
            'ARCHIVADA': 'bg-gray-100 text-gray-800'
        };

        return colorMap[status?.toUpperCase()] || 'bg-gray-100 text-gray-800';
    };

    const formatDate = (dateString: string): string => {
        const date = new Date(dateString);
        return date.toLocaleString('es-CL', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const getUserName = (item: StatusHistoryItem): string => {
        if (item.changed_by_first_name && item.changed_by_last_name) {
            return `${item.changed_by_first_name} ${item.changed_by_last_name}`;
        }
        return item.changed_by_email || 'Sistema';
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                <span className="ml-3 text-gray-600">Cargando historial...</span>
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex items-start">
                    <FiAlertCircle className="w-5 h-5 text-red-600 mr-3 mt-0.5" />
                    <div>
                        <p className="text-sm font-medium text-red-800">Error al cargar historial</p>
                        <p className="text-sm text-red-700 mt-1">{error}</p>
                    </div>
                </div>
            </div>
        );
    }

    if (history.length === 0) {
        return (
            <div className="text-center py-8 text-gray-500">
                <FiClock className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                <p className="text-sm">No hay cambios de estado registrados</p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                <FiClock className="w-5 h-5 mr-2" />
                Historial de Cambios de Estado
            </h3>

            <div className="relative">
                {/* Timeline line */}
                <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-200"></div>

                {/* History items */}
                <div className="space-y-6">
                    {history.map((item, index) => (
                        <div key={item.id} className="relative pl-10">
                            {/* Timeline dot */}
                            <div className={`
                                absolute left-2 w-4 h-4 rounded-full border-2 border-white
                                ${index === 0 ? 'bg-blue-600' : 'bg-gray-400'}
                            `}></div>

                            {/* Content */}
                            <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow">
                                {/* Status change */}
                                <div className="flex items-center space-x-2 mb-2">
                                    <span className={`text-xs font-medium px-2 py-1 rounded ${getStatusColor(item.previous_status)}`}>
                                        {getStatusLabel(item.previous_status)}
                                    </span>
                                    <span className="text-gray-400">→</span>
                                    <span className={`text-xs font-medium px-2 py-1 rounded ${getStatusColor(item.new_status)}`}>
                                        {getStatusLabel(item.new_status)}
                                    </span>
                                </div>

                                {/* Metadata */}
                                <div className="space-y-1">
                                    <div className="flex items-center text-xs text-gray-600">
                                        <FiUser className="w-3 h-3 mr-1" />
                                        <span>{getUserName(item)}</span>
                                    </div>

                                    <div className="flex items-center text-xs text-gray-500">
                                        <FiClock className="w-3 h-3 mr-1" />
                                        <span>{formatDate(item.changed_at)}</span>
                                    </div>
                                </div>

                                {/* Change note */}
                                {item.change_note && (
                                    <div className="mt-3 bg-gray-50 rounded p-3">
                                        <div className="flex items-start">
                                            <FiFileText className="w-4 h-4 text-gray-500 mr-2 mt-0.5 flex-shrink-0" />
                                            <p className="text-sm text-gray-700 italic">{item.change_note}</p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Summary */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mt-4">
                <p className="text-xs text-blue-800">
                    Total de cambios registrados: <span className="font-semibold">{history.length}</span>
                </p>
            </div>
        </div>
    );
};

export default ApplicationStatusHistory;
