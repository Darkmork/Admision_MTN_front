import React, { useState, useEffect } from 'react';
import Button from '../ui/Button';
import Card from '../ui/Card';
import Badge from '../ui/Badge';
import LoadingSpinner from '../ui/LoadingSpinner';
import {
  CalendarIcon,
  ClockIcon,
  UserIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  MapPinIcon,
  VideoIcon
} from '../icons/Icons';
import { 
  FiCalendar, 
  FiClock, 
  FiUser, 
  FiMapPin, 
  FiVideo, 
  FiPhone,
  FiMail,
  FiEdit,
  FiSave,
  FiCheck,
  FiStar
} from 'react-icons/fi';
import {
  Interview,
  InterviewFormProps,
  InterviewFormMode,
  InterviewStatus,
  InterviewType,
  InterviewMode,
  InterviewResult,
  CreateInterviewRequest,
  UpdateInterviewRequest,
  CompleteInterviewRequest,
  INTERVIEW_STATUS_LABELS,
  INTERVIEW_TYPE_LABELS,
  INTERVIEW_MODE_LABELS,
  INTERVIEW_RESULT_LABELS,
  InterviewUtils,
  INTERVIEW_VALIDATION,
  INTERVIEW_CONFIG
} from '../../types/interview';

// Mock data para entrevistadores disponibles
const mockInterviewers = [
  { id: 5, name: 'María González', role: 'Psicóloga', available: true },
  { id: 6, name: 'Roberto Silva', role: 'Director Académico', available: true },
  { id: 7, name: 'Carmen Morales', role: 'Coordinadora', available: false },
  { id: 8, name: 'Ana Castillo', role: 'Profesora', available: true }
];

const InterviewForm: React.FC<InterviewFormProps> = ({
  interview,
  mode,
  onSubmit,
  onCancel,
  isSubmitting = false,
  className = ''
}) => {
  
  const [formData, setFormData] = useState({
    applicationId: 0,
    interviewerId: 0,
    type: InterviewType.FAMILY,
    mode: InterviewMode.IN_PERSON,
    scheduledDate: '',
    scheduledTime: '',
    duration: INTERVIEW_VALIDATION.DURATION.DEFAULT,
    location: '',
    virtualMeetingLink: '',
    notes: '',
    preparation: '',
    status: InterviewStatus.SCHEDULED,
    result: undefined as InterviewResult | undefined,
    score: undefined as number | undefined,
    recommendations: '',
    followUpRequired: false,
    followUpNotes: ''
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isDirty, setIsDirty] = useState(false);

  useEffect(() => {
    if (interview && (mode === InterviewFormMode.EDIT || mode === InterviewFormMode.VIEW || mode === InterviewFormMode.COMPLETE)) {
      setFormData({
        applicationId: interview.applicationId,
        interviewerId: interview.interviewerId,
        type: interview.type,
        mode: interview.mode,
        scheduledDate: interview.scheduledDate,
        scheduledTime: interview.scheduledTime,
        duration: interview.duration,
        location: interview.location || '',
        virtualMeetingLink: interview.virtualMeetingLink || '',
        notes: interview.notes || '',
        preparation: interview.preparation || '',
        status: interview.status,
        result: interview.result,
        score: interview.score,
        recommendations: interview.recommendations || '',
        followUpRequired: interview.followUpRequired,
        followUpNotes: interview.followUpNotes || ''
      });
    }
  }, [interview, mode]);

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setIsDirty(true);
    
    // Limpiar error del campo cuando el usuario comience a escribir
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }

    // Lógica específica por campo
    if (field === 'mode') {
      // Limpiar campos específicos de modalidad cuando cambia
      if (value === InterviewMode.VIRTUAL) {
        setFormData(prev => ({ ...prev, location: '' }));
      } else if (value === InterviewMode.IN_PERSON) {
        setFormData(prev => ({ ...prev, virtualMeetingLink: '' }));
      }
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    // Validaciones para crear/editar
    if (mode === InterviewFormMode.CREATE || mode === InterviewFormMode.EDIT) {
      if (!formData.scheduledDate) {
        newErrors.scheduledDate = 'La fecha es obligatoria';
      } else {
        const selectedDate = new Date(formData.scheduledDate);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        if (selectedDate < today) {
          newErrors.scheduledDate = 'La fecha no puede ser anterior a hoy';
        }
      }

      if (!formData.scheduledTime) {
        newErrors.scheduledTime = 'La hora es obligatoria';
      }

      if (!formData.interviewerId) {
        newErrors.interviewerId = 'Debe seleccionar un entrevistador';
      }

      if (formData.duration < INTERVIEW_VALIDATION.DURATION.MIN || formData.duration > INTERVIEW_VALIDATION.DURATION.MAX) {
        newErrors.duration = `La duración debe estar entre ${INTERVIEW_VALIDATION.DURATION.MIN} y ${INTERVIEW_VALIDATION.DURATION.MAX} minutos`;
      }

      if (formData.mode === InterviewMode.IN_PERSON && !formData.location.trim()) {
        newErrors.location = 'La ubicación es obligatoria para entrevistas presenciales';
      }

      if (formData.mode === InterviewMode.VIRTUAL && !formData.virtualMeetingLink.trim()) {
        newErrors.virtualMeetingLink = 'El enlace es obligatorio para entrevistas virtuales';
      }
    }

    // Validaciones para completar
    if (mode === InterviewFormMode.COMPLETE) {
      if (!formData.result) {
        newErrors.result = 'Debe seleccionar un resultado';
      }

      if (!formData.recommendations.trim()) {
        newErrors.recommendations = 'Las recomendaciones son obligatorias';
      }

      if (formData.score !== undefined && (formData.score < INTERVIEW_VALIDATION.SCORE.MIN || formData.score > INTERVIEW_VALIDATION.SCORE.MAX)) {
        newErrors.score = `La puntuación debe estar entre ${INTERVIEW_VALIDATION.SCORE.MIN} y ${INTERVIEW_VALIDATION.SCORE.MAX}`;
      }

      if (formData.followUpRequired && !formData.followUpNotes.trim()) {
        newErrors.followUpNotes = 'Debe especificar las notas de seguimiento';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    if (mode === InterviewFormMode.CREATE) {
      const createData: CreateInterviewRequest = {
        applicationId: formData.applicationId,
        interviewerId: formData.interviewerId,
        type: formData.type,
        mode: formData.mode,
        scheduledDate: formData.scheduledDate,
        scheduledTime: formData.scheduledTime,
        duration: formData.duration,
        location: formData.location || undefined,
        virtualMeetingLink: formData.virtualMeetingLink || undefined,
        notes: formData.notes || undefined,
        preparation: formData.preparation || undefined
      };
      onSubmit(createData);
    } else if (mode === InterviewFormMode.EDIT) {
      const updateData: UpdateInterviewRequest = {
        interviewerId: formData.interviewerId,
        type: formData.type,
        mode: formData.mode,
        scheduledDate: formData.scheduledDate,
        scheduledTime: formData.scheduledTime,
        duration: formData.duration,
        location: formData.location || undefined,
        virtualMeetingLink: formData.virtualMeetingLink || undefined,
        notes: formData.notes || undefined,
        preparation: formData.preparation || undefined,
        status: formData.status
      };
      onSubmit(updateData);
    } else if (mode === InterviewFormMode.COMPLETE) {
      const completeData: CompleteInterviewRequest = {
        result: formData.result!,
        score: formData.score,
        recommendations: formData.recommendations,
        followUpRequired: formData.followUpRequired,
        followUpNotes: formData.followUpNotes || undefined
      };
      onSubmit(completeData);
    }
  };

  const isViewMode = mode === InterviewFormMode.VIEW;
  const isCompleteMode = mode === InterviewFormMode.COMPLETE;
  const isCreateMode = mode === InterviewFormMode.CREATE;

  const getFormTitle = () => {
    switch (mode) {
      case InterviewFormMode.CREATE:
        return 'Nueva Entrevista';
      case InterviewFormMode.EDIT:
        return 'Editar Entrevista';
      case InterviewFormMode.COMPLETE:
        return 'Completar Entrevista';
      case InterviewFormMode.VIEW:
        return 'Detalles de Entrevista';
      default:
        return 'Entrevista';
    }
  };

  return (
    <div className={`space-y-6 ${className}`}>
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <CalendarIcon className="w-6 h-6 text-azul-monte-tabor" />
            <h2 className="text-xl font-semibold text-azul-monte-tabor">
              {getFormTitle()}
            </h2>
          </div>
          
          {interview && (
            <div className="flex items-center gap-2">
              <Badge variant={InterviewUtils.getStatusColor(interview.status)}>
                {INTERVIEW_STATUS_LABELS[interview.status]}
              </Badge>
            </div>
          )}
        </div>

        {/* Información del estudiante (solo en vista/completar) */}
        {interview && (isViewMode || isCompleteMode) && (
          <Card className="p-4 bg-blue-50 border-blue-200">
            <div className="flex items-start gap-3">
              <UserIcon className="w-5 h-5 text-blue-600 mt-0.5" />
              <div>
                <h3 className="font-medium text-blue-900">{interview.studentName}</h3>
                <p className="text-sm text-blue-700">{interview.gradeApplied}</p>
                <p className="text-xs text-blue-600">{interview.parentNames}</p>
              </div>
            </div>
          </Card>
        )}

        {/* Formulario principal */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Información básica */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900">Información Básica</h3>
            
            {/* Tipo de entrevista */}
            <div>
              <label htmlFor="type" className="block text-sm font-medium text-gray-700 mb-2">
                Tipo de Entrevista *
              </label>
              <select
                id="type"
                value={formData.type}
                onChange={(e) => handleInputChange('type', e.target.value as InterviewType)}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-azul-monte-tabor focus:border-transparent ${
                  errors.type ? 'border-red-300 bg-red-50' : 'border-gray-300'
                }`}
                disabled={isViewMode || isCompleteMode}
              >
                {Object.values(InterviewType).map(type => (
                  <option key={type} value={type}>
                    {INTERVIEW_TYPE_LABELS[type]}
                  </option>
                ))}
              </select>
              {errors.type && (
                <p className="mt-1 text-sm text-red-600">{errors.type}</p>
              )}
            </div>

            {/* Modalidad */}
            <div>
              <label htmlFor="mode" className="block text-sm font-medium text-gray-700 mb-2">
                Modalidad *
              </label>
              <select
                id="mode"
                value={formData.mode}
                onChange={(e) => handleInputChange('mode', e.target.value as InterviewMode)}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-azul-monte-tabor focus:border-transparent ${
                  errors.mode ? 'border-red-300 bg-red-50' : 'border-gray-300'
                }`}
                disabled={isViewMode || isCompleteMode}
              >
                {Object.values(InterviewMode).map(mode => (
                  <option key={mode} value={mode}>
                    {INTERVIEW_MODE_LABELS[mode]}
                  </option>
                ))}
              </select>
              {errors.mode && (
                <p className="mt-1 text-sm text-red-600">{errors.mode}</p>
              )}
            </div>

            {/* Entrevistador */}
            <div>
              <label htmlFor="interviewer" className="block text-sm font-medium text-gray-700 mb-2">
                Entrevistador *
              </label>
              <select
                id="interviewer"
                value={formData.interviewerId}
                onChange={(e) => handleInputChange('interviewerId', parseInt(e.target.value))}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-azul-monte-tabor focus:border-transparent ${
                  errors.interviewerId ? 'border-red-300 bg-red-50' : 'border-gray-300'
                }`}
                disabled={isViewMode || isCompleteMode}
              >
                <option value="">Seleccionar entrevistador</option>
                {mockInterviewers.map(interviewer => (
                  <option 
                    key={interviewer.id} 
                    value={interviewer.id}
                    disabled={!interviewer.available}
                  >
                    {interviewer.name} - {interviewer.role} {!interviewer.available ? '(No disponible)' : ''}
                  </option>
                ))}
              </select>
              {errors.interviewerId && (
                <p className="mt-1 text-sm text-red-600">{errors.interviewerId}</p>
              )}
            </div>
          </div>

          {/* Programación */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900">Programación</h3>
            
            {/* Fecha */}
            <div>
              <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-2">
                <FiCalendar className="inline w-4 h-4 mr-1" />
                Fecha *
              </label>
              <input
                id="date"
                type="date"
                value={formData.scheduledDate}
                onChange={(e) => handleInputChange('scheduledDate', e.target.value)}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-azul-monte-tabor focus:border-transparent ${
                  errors.scheduledDate ? 'border-red-300 bg-red-50' : 'border-gray-300'
                }`}
                disabled={isViewMode || isCompleteMode}
              />
              {errors.scheduledDate && (
                <p className="mt-1 text-sm text-red-600">{errors.scheduledDate}</p>
              )}
            </div>

            {/* Hora */}
            <div>
              <label htmlFor="time" className="block text-sm font-medium text-gray-700 mb-2">
                <FiClock className="inline w-4 h-4 mr-1" />
                Hora *
              </label>
              <select
                id="time"
                value={formData.scheduledTime}
                onChange={(e) => handleInputChange('scheduledTime', e.target.value)}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-azul-monte-tabor focus:border-transparent ${
                  errors.scheduledTime ? 'border-red-300 bg-red-50' : 'border-gray-300'
                }`}
                disabled={isViewMode || isCompleteMode}
              >
                <option value="">Seleccionar hora</option>
                {INTERVIEW_CONFIG.DEFAULT_TIME_SLOTS.map(time => (
                  <option key={time} value={time}>
                    {time}
                  </option>
                ))}
              </select>
              {errors.scheduledTime && (
                <p className="mt-1 text-sm text-red-600">{errors.scheduledTime}</p>
              )}
            </div>

            {/* Duración */}
            <div>
              <label htmlFor="duration" className="block text-sm font-medium text-gray-700 mb-2">
                Duración (minutos) *
              </label>
              <input
                id="duration"
                type="number"
                min={INTERVIEW_VALIDATION.DURATION.MIN}
                max={INTERVIEW_VALIDATION.DURATION.MAX}
                step="15"
                value={formData.duration}
                onChange={(e) => handleInputChange('duration', parseInt(e.target.value))}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-azul-monte-tabor focus:border-transparent ${
                  errors.duration ? 'border-red-300 bg-red-50' : 'border-gray-300'
                }`}
                disabled={isViewMode || isCompleteMode}
              />
              {errors.duration && (
                <p className="mt-1 text-sm text-red-600">{errors.duration}</p>
              )}
            </div>
          </div>
        </div>

        {/* Ubicación/Enlace */}
        <div>
          {formData.mode === InterviewMode.IN_PERSON && (
            <div>
              <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-2">
                <FiMapPin className="inline w-4 h-4 mr-1" />
                Ubicación *
              </label>
              <input
                id="location"
                type="text"
                value={formData.location}
                onChange={(e) => handleInputChange('location', e.target.value)}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-azul-monte-tabor focus:border-transparent ${
                  errors.location ? 'border-red-300 bg-red-50' : 'border-gray-300'
                }`}
                placeholder="Ej: Sala de Entrevistas 1"
                disabled={isViewMode || isCompleteMode}
              />
              {errors.location && (
                <p className="mt-1 text-sm text-red-600">{errors.location}</p>
              )}
            </div>
          )}

          {formData.mode === InterviewMode.VIRTUAL && (
            <div>
              <label htmlFor="virtualLink" className="block text-sm font-medium text-gray-700 mb-2">
                <FiVideo className="inline w-4 h-4 mr-1" />
                Enlace de Reunión Virtual *
              </label>
              <input
                id="virtualLink"
                type="url"
                value={formData.virtualMeetingLink}
                onChange={(e) => handleInputChange('virtualMeetingLink', e.target.value)}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-azul-monte-tabor focus:border-transparent ${
                  errors.virtualMeetingLink ? 'border-red-300 bg-red-50' : 'border-gray-300'
                }`}
                placeholder="https://meet.google.com/..."
                disabled={isViewMode || isCompleteMode}
              />
              {errors.virtualMeetingLink && (
                <p className="mt-1 text-sm text-red-600">{errors.virtualMeetingLink}</p>
              )}
            </div>
          )}
        </div>

        {/* Notas y preparación */}
        {!isCompleteMode && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-2">
                Notas
              </label>
              <textarea
                id="notes"
                rows={4}
                value={formData.notes}
                onChange={(e) => handleInputChange('notes', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-azul-monte-tabor focus:border-transparent"
                placeholder="Notas adicionales sobre la entrevista..."
                disabled={isViewMode}
              />
            </div>

            <div>
              <label htmlFor="preparation" className="block text-sm font-medium text-gray-700 mb-2">
                Preparación
              </label>
              <textarea
                id="preparation"
                rows={4}
                value={formData.preparation}
                onChange={(e) => handleInputChange('preparation', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-azul-monte-tabor focus:border-transparent"
                placeholder="Materiales o preparación necesaria..."
                disabled={isViewMode}
              />
            </div>
          </div>
        )}

        {/* Sección de completar entrevista */}
        {isCompleteMode && (
          <div className="space-y-6 border-t pt-6">
            <h3 className="text-lg font-medium text-gray-900">Resultados de la Entrevista</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Resultado */}
              <div>
                <label htmlFor="result" className="block text-sm font-medium text-gray-700 mb-2">
                  Resultado *
                </label>
                <select
                  id="result"
                  value={formData.result || ''}
                  onChange={(e) => handleInputChange('result', e.target.value as InterviewResult)}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-azul-monte-tabor focus:border-transparent ${
                    errors.result ? 'border-red-300 bg-red-50' : 'border-gray-300'
                  }`}
                >
                  <option value="">Seleccionar resultado</option>
                  {Object.values(InterviewResult).map(result => (
                    <option key={result} value={result}>
                      {INTERVIEW_RESULT_LABELS[result]}
                    </option>
                  ))}
                </select>
                {errors.result && (
                  <p className="mt-1 text-sm text-red-600">{errors.result}</p>
                )}
              </div>

              {/* Puntuación */}
              <div>
                <label htmlFor="score" className="block text-sm font-medium text-gray-700 mb-2">
                  <FiStar className="inline w-4 h-4 mr-1" />
                  Puntuación (1-10)
                </label>
                <input
                  id="score"
                  type="number"
                  min={INTERVIEW_VALIDATION.SCORE.MIN}
                  max={INTERVIEW_VALIDATION.SCORE.MAX}
                  value={formData.score || ''}
                  onChange={(e) => handleInputChange('score', e.target.value ? parseInt(e.target.value) : undefined)}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-azul-monte-tabor focus:border-transparent ${
                    errors.score ? 'border-red-300 bg-red-50' : 'border-gray-300'
                  }`}
                />
                {errors.score && (
                  <p className="mt-1 text-sm text-red-600">{errors.score}</p>
                )}
              </div>
            </div>

            {/* Recomendaciones */}
            <div>
              <label htmlFor="recommendations" className="block text-sm font-medium text-gray-700 mb-2">
                Recomendaciones *
              </label>
              <textarea
                id="recommendations"
                rows={4}
                value={formData.recommendations}
                onChange={(e) => handleInputChange('recommendations', e.target.value)}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-azul-monte-tabor focus:border-transparent ${
                  errors.recommendations ? 'border-red-300 bg-red-50' : 'border-gray-300'
                }`}
                placeholder="Comentarios y recomendaciones sobre la entrevista..."
              />
              {errors.recommendations && (
                <p className="mt-1 text-sm text-red-600">{errors.recommendations}</p>
              )}
            </div>

            {/* Seguimiento */}
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <input
                  id="followUp"
                  type="checkbox"
                  checked={formData.followUpRequired}
                  onChange={(e) => handleInputChange('followUpRequired', e.target.checked)}
                  className="rounded border-gray-300 text-azul-monte-tabor focus:ring-azul-monte-tabor"
                />
                <label htmlFor="followUp" className="text-sm font-medium text-gray-700">
                  Requiere seguimiento
                </label>
              </div>

              {formData.followUpRequired && (
                <div>
                  <label htmlFor="followUpNotes" className="block text-sm font-medium text-gray-700 mb-2">
                    Notas de Seguimiento *
                  </label>
                  <textarea
                    id="followUpNotes"
                    rows={3}
                    value={formData.followUpNotes}
                    onChange={(e) => handleInputChange('followUpNotes', e.target.value)}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-azul-monte-tabor focus:border-transparent ${
                      errors.followUpNotes ? 'border-red-300 bg-red-50' : 'border-gray-300'
                    }`}
                    placeholder="Especificar qué tipo de seguimiento se requiere..."
                  />
                  {errors.followUpNotes && (
                    <p className="mt-1 text-sm text-red-600">{errors.followUpNotes}</p>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Botones de acción */}
        {!isViewMode && (
          <div className="flex items-center justify-end gap-3 pt-4 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={isSubmitting}
            >
              Cancelar
            </Button>
            
            <Button
              type="submit"
              disabled={isSubmitting || (!isDirty && mode === InterviewFormMode.EDIT)}
            >
              {isSubmitting ? (
                <>
                  <LoadingSpinner size="sm" />
                  <span className="ml-2">
                    {isCreateMode ? 'Creando...' : 
                     isCompleteMode ? 'Completando...' : 'Guardando...'}
                  </span>
                </>
              ) : (
                <>
                  {isCreateMode ? (
                    <>
                      <FiSave className="w-5 h-5 mr-2" />
                      Programar Entrevista
                    </>
                  ) : isCompleteMode ? (
                    <>
                      <FiCheck className="w-5 h-5 mr-2" />
                      Completar Entrevista
                    </>
                  ) : (
                    <>
                      <FiEdit className="w-5 h-5 mr-2" />
                      Guardar Cambios
                    </>
                  )}
                </>
              )}
            </Button>
          </div>
        )}

        {isViewMode && (
          <div className="flex justify-end pt-4 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
            >
              Cerrar
            </Button>
          </div>
        )}
      </form>
    </div>
  );
};

export default InterviewForm;