import React, { useState } from 'react';
import { FiCheck, FiX, FiAlertCircle } from 'react-icons/fi';
import Button from '../ui/Button';
import { applicationService } from '../../services/applicationService';

interface ApplicationStatusChangerProps {
    applicationId: number;
    currentStatus: string;
    studentName: string;
    onStatusChanged: () => void;
    onClose: () => void;
}

const ApplicationStatusChanger: React.FC<ApplicationStatusChangerProps> = ({
    applicationId,
    currentStatus,
    studentName,
    onStatusChanged,
    onClose
}) => {
    const [selectedStatus, setSelectedStatus] = useState<string>(currentStatus);
    const [changeNote, setChangeNote] = useState<string>('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const statusOptions = [
        { value: 'SUBMITTED', label: 'Enviada', color: 'bg-blue-100 text-blue-800' },
        { value: 'UNDER_REVIEW', label: 'En Revisión', color: 'bg-yellow-100 text-yellow-800' },
        { value: 'INTERVIEW_SCHEDULED', label: 'Entrevista Programada', color: 'bg-purple-100 text-purple-800' },
        { value: 'APPROVED', label: 'Aceptada', color: 'bg-green-100 text-green-800' },
        { value: 'REJECTED', label: 'Rechazada', color: 'bg-red-100 text-red-800' },
        { value: 'WAITLIST', label: 'Lista de Espera', color: 'bg-orange-100 text-orange-800' },
        { value: 'ARCHIVED', label: 'Archivada', color: 'bg-gray-100 text-gray-800' }
    ];

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (selectedStatus === currentStatus) {
            setError('Debes seleccionar un estado diferente al actual');
            return;
        }

        setIsSubmitting(true);
        setError(null);

        try {
            await applicationService.updateApplicationStatus(
                applicationId,
                selectedStatus,
                changeNote || undefined
            );

            onStatusChanged();
            onClose();
        } catch (err: any) {
            setError(err.message || 'Error al cambiar el estado');
        } finally {
            setIsSubmitting(false);
        }
    };

    const getCurrentStatusLabel = () => {
        return statusOptions.find(s => s.value === currentStatus)?.label || currentStatus;
    };

    const getNewStatusLabel = () => {
        return statusOptions.find(s => s.value === selectedStatus)?.label || selectedStatus;
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-xl">
                {/* Header */}
                <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
                    <div>
                        <h2 className="text-xl font-bold text-gray-900">Cambiar Estado de Postulación</h2>
                        <p className="text-sm text-gray-600 mt-1">Estudiante: {studentName}</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 transition-colors"
                    >
                        <FiX className="w-6 h-6" />
                    </button>
                </div>

                {/* Content */}
                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    {/* Current Status Info */}
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <p className="text-sm text-blue-800 font-medium">
                            Estado actual: <span className="font-bold">{getCurrentStatusLabel()}</span>
                        </p>
                    </div>

                    {/* Status Selection */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-3">
                            Nuevo Estado <span className="text-red-500">*</span>
                        </label>
                        <div className="grid grid-cols-2 gap-3">
                            {statusOptions.map((option) => (
                                <button
                                    key={option.value}
                                    type="button"
                                    onClick={() => setSelectedStatus(option.value)}
                                    className={`
                                        px-4 py-3 rounded-lg border-2 transition-all text-left
                                        ${selectedStatus === option.value
                                            ? 'border-blue-500 bg-blue-50'
                                            : 'border-gray-200 hover:border-gray-300 bg-white'
                                        }
                                        ${option.value === currentStatus ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                                    `}
                                    disabled={option.value === currentStatus}
                                >
                                    <div className="flex items-center justify-between">
                                        <span className={`text-sm font-medium px-2 py-1 rounded ${option.color}`}>
                                            {option.label}
                                        </span>
                                        {selectedStatus === option.value && (
                                            <FiCheck className="w-5 h-5 text-blue-600" />
                                        )}
                                    </div>
                                    {option.value === currentStatus && (
                                        <p className="text-xs text-gray-500 mt-1">(Estado actual)</p>
                                    )}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Change Note */}
                    <div>
                        <label htmlFor="changeNote" className="block text-sm font-medium text-gray-700 mb-2">
                            Nota del Cambio (Opcional)
                        </label>
                        <textarea
                            id="changeNote"
                            value={changeNote}
                            onChange={(e) => setChangeNote(e.target.value)}
                            rows={4}
                            placeholder="Escribe una nota explicando el motivo del cambio de estado..."
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                        />
                        <p className="text-xs text-gray-500 mt-1">
                            Esta nota quedará registrada en el historial de cambios
                        </p>
                    </div>

                    {/* Confirmation Summary */}
                    {selectedStatus !== currentStatus && (
                        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                            <div className="flex items-start">
                                <FiAlertCircle className="w-5 h-5 text-yellow-600 mr-3 mt-0.5 flex-shrink-0" />
                                <div>
                                    <p className="text-sm font-medium text-yellow-800">
                                        Confirma el cambio de estado
                                    </p>
                                    <p className="text-sm text-yellow-700 mt-1">
                                        De <span className="font-semibold">{getCurrentStatusLabel()}</span> → <span className="font-semibold">{getNewStatusLabel()}</span>
                                    </p>
                                    <p className="text-xs text-yellow-600 mt-2">
                                        ⚠️ El apoderado recibirá una notificación por correo electrónico informando este cambio.
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Error Message */}
                    {error && (
                        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                            <div className="flex items-start">
                                <FiAlertCircle className="w-5 h-5 text-red-600 mr-3 mt-0.5" />
                                <p className="text-sm text-red-700">{error}</p>
                            </div>
                        </div>
                    )}

                    {/* Actions */}
                    <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
                        <Button
                            type="button"
                            variant="secondary"
                            onClick={onClose}
                            disabled={isSubmitting}
                        >
                            Cancelar
                        </Button>
                        <Button
                            type="submit"
                            variant="primary"
                            disabled={isSubmitting || selectedStatus === currentStatus}
                        >
                            {isSubmitting ? 'Guardando...' : 'Confirmar Cambio'}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ApplicationStatusChanger;
