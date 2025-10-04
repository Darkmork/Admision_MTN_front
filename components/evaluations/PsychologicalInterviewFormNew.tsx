import React, { useState, useEffect } from 'react';
import { Logger } from '../src/utils/logger';import Card from '../ui/Card';
import { Logger } from '../src/utils/logger';import Button from '../ui/Button';
import { Logger } from '../src/utils/logger';import { 
import { Logger } from '../src/utils/logger';  PsychologicalEvaluation, 
  EvaluationStatus,
  ValidationRules,
  UpdateEvaluationRequest
} from '../../types/evaluation';

interface PsychologicalInterviewFormProps {
  evaluation: PsychologicalEvaluation;
  onSave: (data: UpdateEvaluationRequest) => Promise<void>;
  onCancel: () => void;
  isReadOnly?: boolean;
  isLoading?: boolean;
}

const PsychologicalInterviewForm: React.FC<PsychologicalInterviewFormProps> = ({
  evaluation,
  onSave,
  onCancel,
  isReadOnly = false,
  isLoading = false
}) => {
  const [formData, setFormData] = useState<UpdateEvaluationRequest>({
    observations: evaluation.observations || '',
    strengths: evaluation.strengths || '',
    areasForImprovement: evaluation.areasForImprovement || '',
    recommendations: evaluation.recommendations || '',
    socialSkillsAssessment: evaluation.socialSkillsAssessment || '',
    emotionalMaturity: evaluation.emotionalMaturity || '',
    motivationAssessment: evaluation.motivationAssessment || '',
    familySupportAssessment: evaluation.familySupportAssessment || '',
    status: evaluation.status
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isDirty, setIsDirty] = useState(false);

  useEffect(() => {
    setFormData({
      observations: evaluation.observations || '',
      strengths: evaluation.strengths || '',
      areasForImprovement: evaluation.areasForImprovement || '',
      recommendations: evaluation.recommendations || '',
      socialSkillsAssessment: evaluation.socialSkillsAssessment || '',
      emotionalMaturity: evaluation.emotionalMaturity || '',
      motivationAssessment: evaluation.motivationAssessment || '',
      familySupportAssessment: evaluation.familySupportAssessment || '',
      status: evaluation.status
    });
  }, [evaluation]);

  const handleFieldChange = (field: keyof UpdateEvaluationRequest, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setIsDirty(true);
    
    // Clear error for this field when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    // Required fields validation
    const requiredFields = [
      { field: 'observations', label: 'Observaciones generales' },
      { field: 'socialSkillsAssessment', label: 'Evaluación de habilidades sociales' },
      { field: 'emotionalMaturity', label: 'Madurez emocional' },
      { field: 'motivationAssessment', label: 'Evaluación de motivación' },
      { field: 'familySupportAssessment', label: 'Evaluación del apoyo familiar' },
      { field: 'strengths', label: 'Fortalezas identificadas' },
      { field: 'areasForImprovement', label: 'Áreas de mejora' },
      { field: 'recommendations', label: 'Recomendaciones' }
    ] as const;

    requiredFields.forEach(({ field, label }) => {
      const value = formData[field] as string;
      if (!ValidationRules.requiredText(value || '')) {
        newErrors[field] = `${label} es requerido`;
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) return;

    const updateData: UpdateEvaluationRequest = {
      ...formData,
      status: EvaluationStatus.COMPLETED,
      completionDate: new Date().toISOString()
    };

    try {
      await onSave(updateData);
      setIsDirty(false);
    } catch (error) {
      Logger.error('Error saving evaluation:', error);
    }
  };

  const handleSaveAsDraft = async () => {
    const updateData: UpdateEvaluationRequest = {
      ...formData,
      status: EvaluationStatus.IN_PROGRESS
    };

    try {
      await onSave(updateData);
      setIsDirty(false);
    } catch (error) {
      Logger.error('Error saving draft:', error);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <Card className="p-6">
        <div className="flex justify-between items-start">
          <div>
            <h2 className="text-2xl font-bold text-azul-monte-tabor">
              🧠 Entrevista Psicológica
            </h2>
            <p className="text-gris-piedra mt-1">
              Estudiante: {evaluation.application?.student.firstName} {evaluation.application?.student.lastName}
            </p>
            <p className="text-sm text-gris-piedra">
              Grado: {evaluation.application?.student.gradeApplied} | RUT: {evaluation.application?.student.rut}
            </p>
          </div>
          <div className="text-right">
            <p className="text-sm text-gris-piedra">Evaluador:</p>
            <p className="font-medium">
              {evaluation.evaluator?.firstName} {evaluation.evaluator?.lastName}
            </p>
          </div>
        </div>
      </Card>

      {/* Guidelines */}
      <Card className="p-6 bg-blue-50 border-blue-200">
        <h4 className="font-semibold text-blue-800 mb-3">📋 Guía para la Evaluación Psicológica</h4>
        <div className="text-sm text-blue-700 space-y-1">
          <p>• Observe el comportamiento del estudiante durante la entrevista</p>
          <p>• Evalúe la capacidad de comunicación y expresión emocional</p>
          <p>• Considere la madurez apropiada para la edad</p>
          <p>• Analice la motivación para el aprendizaje y la integración social</p>
          <p>• Identifique el nivel de apoyo familiar percibido</p>
        </div>
      </Card>

      {/* Observaciones Generales */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">👁️ Observaciones Generales</h3>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Impresión general y comportamiento durante la entrevista *
          </label>
          <textarea
            value={formData.observations || ''}
            onChange={(e) => handleFieldChange('observations', e.target.value)}
            disabled={isReadOnly}
            rows={4}
            className={`w-full border rounded-md px-3 py-2 ${
              errors.observations ? 'border-red-500' : 'border-gray-300'
            } ${isReadOnly ? 'bg-gray-100' : ''}`}
            placeholder="Describe el comportamiento general, actitud, nivel de cooperación, comunicación verbal y no verbal..."
          />
          {errors.observations && (
            <p className="text-red-500 text-sm mt-1">{errors.observations}</p>
          )}
        </div>
      </Card>

      {/* Evaluación Psicológica Específica */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">🧠 Evaluación Psicológica Específica</h3>
        
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              🤝 Habilidades Sociales y Comunicación *
            </label>
            <textarea
              value={formData.socialSkillsAssessment || ''}
              onChange={(e) => handleFieldChange('socialSkillsAssessment', e.target.value)}
              disabled={isReadOnly}
              rows={3}
              className={`w-full border rounded-md px-3 py-2 ${
                errors.socialSkillsAssessment ? 'border-red-500' : 'border-gray-300'
              } ${isReadOnly ? 'bg-gray-100' : ''}`}
              placeholder="Evalúa la capacidad de interacción social, expresión de ideas, escucha activa, empatía..."
            />
            {errors.socialSkillsAssessment && (
              <p className="text-red-500 text-sm mt-1">{errors.socialSkillsAssessment}</p>
            )}
            <p className="text-xs text-gray-500 mt-1">
              Considera: contacto visual, expresión verbal, capacidad de diálogo, respeto por turnos...
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              💭 Madurez Emocional *
            </label>
            <textarea
              value={formData.emotionalMaturity || ''}
              onChange={(e) => handleFieldChange('emotionalMaturity', e.target.value)}
              disabled={isReadOnly}
              rows={3}
              className={`w-full border rounded-md px-3 py-2 ${
                errors.emotionalMaturity ? 'border-red-500' : 'border-gray-300'
              } ${isReadOnly ? 'bg-gray-100' : ''}`}
              placeholder="Describe el nivel de madurez emocional apropiado para la edad, autorregulación, manejo de emociones..."
            />
            {errors.emotionalMaturity && (
              <p className="text-red-500 text-sm mt-1">{errors.emotionalMaturity}</p>
            )}
            <p className="text-xs text-gray-500 mt-1">
              Evalúa: autocontrol, expresión emocional apropiada, tolerancia a la frustración...
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              🎯 Motivación y Actitud hacia el Aprendizaje *
            </label>
            <textarea
              value={formData.motivationAssessment || ''}
              onChange={(e) => handleFieldChange('motivationAssessment', e.target.value)}
              disabled={isReadOnly}
              rows={3}
              className={`w-full border rounded-md px-3 py-2 ${
                errors.motivationAssessment ? 'border-red-500' : 'border-gray-300'
              } ${isReadOnly ? 'bg-gray-100' : ''}`}
              placeholder="Evalúa el interés por aprender, curiosidad, disposición a enfrentar desafíos académicos..."
            />
            {errors.motivationAssessment && (
              <p className="text-red-500 text-sm mt-1">{errors.motivationAssessment}</p>
            )}
            <p className="text-xs text-gray-500 mt-1">
              Considera: entusiasmo, perseverancia, actitud hacia las tareas, metas personales...
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              👨‍👩‍👧‍👦 Evaluación del Apoyo Familiar *
            </label>
            <textarea
              value={formData.familySupportAssessment || ''}
              onChange={(e) => handleFieldChange('familySupportAssessment', e.target.value)}
              disabled={isReadOnly}
              rows={3}
              className={`w-full border rounded-md px-3 py-2 ${
                errors.familySupportAssessment ? 'border-red-500' : 'border-gray-300'
              } ${isReadOnly ? 'bg-gray-100' : ''}`}
              placeholder="Describe la percepción del estudiante sobre el apoyo familiar, estructura familiar, expectativas..."
            />
            {errors.familySupportAssessment && (
              <p className="text-red-500 text-sm mt-1">{errors.familySupportAssessment}</p>
            )}
            <p className="text-xs text-gray-500 mt-1">
              Evalúa: comunicación familiar, apoyo académico, estabilidad del entorno familiar...
            </p>
          </div>
        </div>
      </Card>

      {/* Análisis y Recomendaciones */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">💡 Análisis y Recomendaciones</h3>
        
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              ✅ Fortalezas Psicológicas Identificadas *
            </label>
            <textarea
              value={formData.strengths || ''}
              onChange={(e) => handleFieldChange('strengths', e.target.value)}
              disabled={isReadOnly}
              rows={3}
              className={`w-full border rounded-md px-3 py-2 ${
                errors.strengths ? 'border-red-500' : 'border-gray-300'
              } ${isReadOnly ? 'bg-gray-100' : ''}`}
              placeholder="Identifica las principales fortalezas emocionales, sociales y cognitivas del estudiante..."
            />
            {errors.strengths && (
              <p className="text-red-500 text-sm mt-1">{errors.strengths}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              🎯 Áreas de Desarrollo *
            </label>
            <textarea
              value={formData.areasForImprovement || ''}
              onChange={(e) => handleFieldChange('areasForImprovement', e.target.value)}
              disabled={isReadOnly}
              rows={3}
              className={`w-full border rounded-md px-3 py-2 ${
                errors.areasForImprovement ? 'border-red-500' : 'border-gray-300'
              } ${isReadOnly ? 'bg-gray-100' : ''}`}
              placeholder="Señala aspectos emocionales o sociales que podrían beneficiarse de apoyo adicional..."
            />
            {errors.areasForImprovement && (
              <p className="text-red-500 text-sm mt-1">{errors.areasForImprovement}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              📋 Recomendaciones Psicopedagógicas *
            </label>
            <textarea
              value={formData.recommendations || ''}
              onChange={(e) => handleFieldChange('recommendations', e.target.value)}
              disabled={isReadOnly}
              rows={4}
              className={`w-full border rounded-md px-3 py-2 ${
                errors.recommendations ? 'border-red-500' : 'border-gray-300'
              } ${isReadOnly ? 'bg-gray-100' : ''}`}
              placeholder="Proporciona recomendaciones específicas para el apoyo psicológico y la integración escolar..."
            />
            {errors.recommendations && (
              <p className="text-red-500 text-sm mt-1">{errors.recommendations}</p>
            )}
            <p className="text-xs text-gray-500 mt-1">
              Incluye estrategias de apoyo emocional, recomendaciones para padres y profesores...
            </p>
          </div>
        </div>
      </Card>

      {/* Criterios de Evaluación */}
      <Card className="p-6 bg-gray-50">
        <h4 className="font-semibold text-azul-monte-tabor mb-4">📊 Criterios de Evaluación Psicológica</h4>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
          <div>
            <h5 className="font-medium text-gray-700 mb-2">Desarrollo Emocional:</h5>
            <ul className="text-gray-600 space-y-1">
              <li>• Autoconciencia emocional</li>
              <li>• Regulación emocional</li>
              <li>• Expresión apropiada de emociones</li>
              <li>• Resiliencia y adaptabilidad</li>
            </ul>
          </div>
          
          <div>
            <h5 className="font-medium text-gray-700 mb-2">Habilidades Sociales:</h5>
            <ul className="text-gray-600 space-y-1">
              <li>• Comunicación efectiva</li>
              <li>• Empatía y comprensión social</li>
              <li>• Habilidades de colaboración</li>
              <li>• Resolución de conflictos</li>
            </ul>
          </div>
          
          <div>
            <h5 className="font-medium text-gray-700 mb-2">Motivación y Actitud:</h5>
            <ul className="text-gray-600 space-y-1">
              <li>• Interés por el aprendizaje</li>
              <li>• Perseverancia ante dificultades</li>
              <li>• Autonomía y autorregulación</li>
              <li>• Actitud positiva hacia la escuela</li>
            </ul>
          </div>
          
          <div>
            <h5 className="font-medium text-gray-700 mb-2">Contexto Familiar:</h5>
            <ul className="text-gray-600 space-y-1">
              <li>• Apoyo familiar percibido</li>
              <li>• Comunicación familiar</li>
              <li>• Estabilidad del entorno</li>
              <li>• Expectativas familiares</li>
            </ul>
          </div>
        </div>
      </Card>

      {/* Action Buttons */}
      {!isReadOnly && (
        <Card className="p-6">
          <div className="flex justify-between items-center">
            <div className="text-sm text-gris-piedra">
              {isDirty && "* Hay cambios sin guardar"}
            </div>
            <div className="flex space-x-3">
              <Button
                variant="outline"
                onClick={onCancel}
                disabled={isLoading}
              >
                Cancelar
              </Button>
              <Button
                variant="outline"
                onClick={handleSaveAsDraft}
                disabled={isLoading}
              >
                💾 Guardar Borrador
              </Button>
              <Button
                variant="primary"
                onClick={handleSave}
                disabled={isLoading}
              >
                {isLoading ? 'Guardando...' : '✅ Completar Entrevista'}
              </Button>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
};

export default PsychologicalInterviewForm;