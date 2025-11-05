import React, { useState } from 'react';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import { FiX, FiAlertTriangle, FiCalendar, FiClock, FiUser } from 'react-icons/fi';
import { Interview, INTERVIEW_TYPE_LABELS } from '../../types/interview';
import { interviewService } from '../../services/interviewService';

interface CancelInterviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  interview: Interview | null;
  onSuccess: () => void;
}

const CancelInterviewModal: React.FC<CancelInterviewModalProps> = ({
  isOpen,
  onClose,
  interview,
  onSuccess
}) => {
  const [cancellationReason, setCancellationReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!interview) return;

    if (!cancellationReason.trim()) {
      setError('Por favor ingrese un motivo de cancelación');
      return;
    }

    if (cancellationReason.trim().length < 5) {
      setError('El motivo debe tener al menos 5 caracteres');
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);

      console.log(`🚫 Cancelando entrevista ${interview.id} con razón: "${cancellationReason}"`);

      await interviewService.cancelInterview(interview.id, cancellationReason.trim());

      console.log('✅ Entrevista cancelada exitosamente');

      // Limpiar formulario y cerrar modal
      setCancellationReason('');
      onSuccess();
      onClose();
    } catch (error: any) {
      console.error('❌ Error al cancelar entrevista:', error);
      setError(error.response?.data?.message || error.message || 'Error al cancelar la entrevista');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      setCancellationReason('');
      setError(null);
      onClose();
    }
  };

  if (!interview) return null;

  // Formatear fecha y hora
  const formatDateTime = (date: string, time: string) => {
    const [year, month, day] = date.split('-');
    const [hour, minute] = time.split(':');
    const dateObj = new Date(parseInt(year), parseInt(month) - 1, parseInt(day), parseInt(hour), parseInt(minute));

    return {
      date: dateObj.toLocaleDateString('es-CL', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      }),
      time: dateObj.toLocaleTimeString('es-CL', {
        hour: '2-digit',
        minute: '2-digit'
      })
    };
  };

  const dateTime = formatDateTime(interview.scheduledDate, interview.scheduledTime);

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Cancelar Entrevista"
      size="md"
    >
      <form onSubmit={handleSubmit} className="p-6 space-y-6">
        {/* Advertencia */}
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start space-x-3">
          <FiAlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <h4 className="text-sm font-semibold text-red-800 mb-1">
              ¿Está seguro que desea cancelar esta entrevista?
            </h4>
            <p className="text-sm text-red-700">
              Esta acción no se puede deshacer. Se enviará una notificación automática al apoderado y al entrevistador.
            </p>
          </div>
        </div>

        {/* Detalles de la entrevista */}
        <div className="bg-gray-50 rounded-lg p-4 space-y-3">
          <h4 className="text-sm font-semibold text-gray-700 mb-3">
            Detalles de la Entrevista a Cancelar
          </h4>

          <div className="grid grid-cols-1 gap-3">
            {/* Estudiante */}
            <div className="flex items-start space-x-2">
              <FiUser className="w-4 h-4 text-gray-500 mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <p className="text-xs text-gray-600">Estudiante</p>
                <p className="text-sm font-medium text-gray-900">{interview.studentName}</p>
              </div>
            </div>

            {/* Tipo de Entrevista */}
            <div className="flex items-start space-x-2">
              <div className="w-4 h-4 text-gray-500 mt-0.5 flex-shrink-0">📝</div>
              <div className="flex-1">
                <p className="text-xs text-gray-600">Tipo de Entrevista</p>
                <p className="text-sm font-medium text-gray-900">{INTERVIEW_TYPE_LABELS[interview.type]}</p>
              </div>
            </div>

            {/* Fecha y Hora */}
            <div className="flex items-start space-x-2">
              <FiCalendar className="w-4 h-4 text-gray-500 mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <p className="text-xs text-gray-600">Fecha y Hora</p>
                <p className="text-sm font-medium text-gray-900 capitalize">{dateTime.date}</p>
                <p className="text-sm text-gray-700 flex items-center mt-1">
                  <FiClock className="w-3 h-3 mr-1" />
                  {dateTime.time} hrs
                </p>
              </div>
            </div>

            {/* Entrevistador(es) */}
            <div className="flex items-start space-x-2">
              <FiUser className="w-4 h-4 text-gray-500 mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <p className="text-xs text-gray-600">Entrevistador(es)</p>
                <p className="text-sm font-medium text-gray-900">{interview.interviewerName}</p>
                {interview.secondInterviewerName && (
                  <p className="text-sm text-gray-700 mt-1">
                    & {interview.secondInterviewerName}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Campo de motivo de cancelación */}
        <div>
          <label htmlFor="cancellationReason" className="block text-sm font-medium text-gray-700 mb-2">
            Motivo de Cancelación *
          </label>
          <textarea
            id="cancellationReason"
            value={cancellationReason}
            onChange={(e) => {
              setCancellationReason(e.target.value);
              setError(null);
            }}
            placeholder="Ingrese el motivo detallado de la cancelación (mínimo 5 caracteres)..."
            rows={4}
            disabled={isSubmitting}
            className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 transition-colors resize-none ${
              error
                ? 'border-red-300 focus:ring-red-500 focus:border-red-500'
                : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
            } ${isSubmitting ? 'bg-gray-100 cursor-not-allowed' : 'bg-white'}`}
            required
          />
          <p className="mt-1 text-xs text-gray-500">
            {cancellationReason.length}/500 caracteres
          </p>
        </div>

        {/* Error message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3">
            <p className="text-sm text-red-700">❌ {error}</p>
          </div>
        )}

        {/* Botones de acción */}
        <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
          <Button
            type="button"
            variant="outline"
            onClick={handleClose}
            disabled={isSubmitting}
          >
            Volver
          </Button>
          <Button
            type="submit"
            variant="danger"
            disabled={isSubmitting || !cancellationReason.trim() || cancellationReason.trim().length < 5}
            className="bg-red-600 hover:bg-red-700 text-white disabled:bg-gray-300 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <>
                <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></span>
                Cancelando...
              </>
            ) : (
              <>
                <FiX className="w-4 h-4 mr-2" />
                Cancelar Entrevista
              </>
            )}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default CancelInterviewModal;
