import React, { useState, useEffect } from 'react';
import { Logger } from '../src/utils/logger';import Card from '../ui/Card';
import { Logger } from '../src/utils/logger';import Button from '../ui/Button';
import { Logger } from '../src/utils/logger';import Badge from '../ui/Badge';
import { Logger } from '../src/utils/logger';import { 
import { Logger } from '../src/utils/logger';  CycleDirectorEvaluation, 
  EvaluationType, 
  EvaluationStatus,
  EVALUATION_TYPE_LABELS,
  ValidationRules,
  UpdateEvaluationRequest
} from '../../types/evaluation';

interface CycleDirectorFormProps {
  evaluation: CycleDirectorEvaluation;
  onSave: (data: UpdateEvaluationRequest) => Promise<void>;
  onCancel: () => void;
  isReadOnly?: boolean;
  isLoading?: boolean;
}

const CycleDirectorForm: React.FC<CycleDirectorFormProps> = ({
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
    academicReadiness: evaluation.academicReadiness || '',
    behavioralAssessment: evaluation.behavioralAssessment || '',
    integrationPotential: evaluation.integrationPotential || '',
    finalRecommendation: evaluation.finalRecommendation || false,
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
      academicReadiness: evaluation.academicReadiness || '',
      behavioralAssessment: evaluation.behavioralAssessment || '',
      integrationPotential: evaluation.integrationPotential || '',
      finalRecommendation: evaluation.finalRecommendation || false,
      status: evaluation.status
    });
  }, [evaluation]);

  const handleFieldChange = (field: keyof UpdateEvaluationRequest, value: any) => {
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
      { field: 'academicReadiness', label: 'Preparación académica' },
      { field: 'behavioralAssessment', label: 'Evaluación conductual' },
      { field: 'integrationPotential', label: 'Potencial de integración' },
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

  const getEvaluationTitle = () => {
    return evaluation.evaluationType === EvaluationType.CYCLE_DIRECTOR_INTERVIEW 
      ? 'Entrevista Director/a de Ciclo'
      : 'Informe Director de Ciclo';
  };

  const getRecommendationBadge = () => {
    if (formData.finalRecommendation === true) {
      return <Badge variant="success">👍 Recomendado</Badge>;
    } else if (formData.finalRecommendation === false) {
      return <Badge variant="error">👎 No Recomendado</Badge>;
    }
    return <Badge variant="default">⏳ Sin Decidir</Badge>;
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <Card className="p-6">
        <div className="flex justify-between items-start">
          <div>
            <h2 className="text-2xl font-bold text-azul-monte-tabor">
              🎓 {getEvaluationTitle()}
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
            <div className="mt-2">
              {getRecommendationBadge()}
            </div>
          </div>
        </div>
      </Card>

      {/* Guidelines */}
      <Card className="p-6 bg-green-50 border-green-200">
        <h4 className="font-semibold text-green-800 mb-3">📋 Aspectos a Evaluar</h4>
        <div className="text-sm text-green-700 space-y-1">
          <p>• <strong>Preparación Académica:</strong> Nivel de conocimientos y habilidades para el grado</p>
          <p>• <strong>Comportamiento:</strong> Conducta, disciplina y respeto por normas</p>
          <p>• <strong>Integración:</strong> Capacidad de adaptarse al ambiente escolar y social</p>
          <p>• <strong>Potencial de Desarrollo:</strong> Proyección del crecimiento académico</p>
        </div>
      </Card>

      {/* Observaciones Generales */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">👁️ Observaciones Generales</h3>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Impresión general del estudiante *
          </label>
          <textarea
            value={formData.observations || ''}
            onChange={(e) => handleFieldChange('observations', e.target.value)}
            disabled={isReadOnly}
            rows={4}
            className={`w-full border rounded-md px-3 py-2 ${
              errors.observations ? 'border-red-500' : 'border-gray-300'
            } ${isReadOnly ? 'bg-gray-100' : ''}`}
            placeholder="Describe tu impresión general del estudiante, incluyendo actitud, presentación y primera impresión..."
          />
          {errors.observations && (
            <p className="text-red-500 text-sm mt-1">{errors.observations}</p>
          )}
        </div>
      </Card>

      {/* Evaluación Específica del Director */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">🎯 Evaluación Específica</h3>
        
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              📚 Preparación Académica *
            </label>
            <textarea
              value={formData.academicReadiness || ''}
              onChange={(e) => handleFieldChange('academicReadiness', e.target.value)}
              disabled={isReadOnly}
              rows={4}
              className={`w-full border rounded-md px-3 py-2 ${
                errors.academicReadiness ? 'border-red-500' : 'border-gray-300'
              } ${isReadOnly ? 'bg-gray-100' : ''}`}
              placeholder="Evalúa el nivel académico del estudiante, conocimientos previos, habilidades de estudio, organización..."
            />
            {errors.academicReadiness && (
              <p className="text-red-500 text-sm mt-1">{errors.academicReadiness}</p>
            )}
            <p className="text-xs text-gray-500 mt-1">
              Considera: conocimientos del grado anterior, hábitos de estudio, organización, autonomía académica...
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              🎭 Evaluación Conductual *
            </label>
            <textarea
              value={formData.behavioralAssessment || ''}
              onChange={(e) => handleFieldChange('behavioralAssessment', e.target.value)}
              disabled={isReadOnly}
              rows={4}
              className={`w-full border rounded-md px-3 py-2 ${
                errors.behavioralAssessment ? 'border-red-500' : 'border-gray-300'
              } ${isReadOnly ? 'bg-gray-100' : ''}`}
              placeholder="Describe el comportamiento del estudiante, disciplina, respeto por normas, relación con figuras de autoridad..."
            />
            {errors.behavioralAssessment && (
              <p className="text-red-500 text-sm mt-1">{errors.behavioralAssessment}</p>
            )}
            <p className="text-xs text-gray-500 mt-1">
              Evalúa: disciplina, respeto, seguimiento de instrucciones, autocontrol, responsabilidad...
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              🌟 Potencial de Integración *
            </label>
            <textarea
              value={formData.integrationPotential || ''}
              onChange={(e) => handleFieldChange('integrationPotential', e.target.value)}
              disabled={isReadOnly}
              rows={4}
              className={`w-full border rounded-md px-3 py-2 ${
                errors.integrationPotential ? 'border-red-500' : 'border-gray-300'
              } ${isReadOnly ? 'bg-gray-100' : ''}`}
              placeholder="Evalúa la capacidad del estudiante para integrarse al ambiente escolar, adaptabilidad, trabajo en equipo..."
            />
            {errors.integrationPotential && (
              <p className="text-red-500 text-sm mt-1">{errors.integrationPotential}</p>
            )}
            <p className="text-xs text-gray-500 mt-1">
              Considera: adaptabilidad, sociabilidad, trabajo colaborativo, valores del colegio...
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
              ✅ Fortalezas Identificadas *
            </label>
            <textarea
              value={formData.strengths || ''}
              onChange={(e) => handleFieldChange('strengths', e.target.value)}
              disabled={isReadOnly}
              rows={3}
              className={`w-full border rounded-md px-3 py-2 ${
                errors.strengths ? 'border-red-500' : 'border-gray-300'
              } ${isReadOnly ? 'bg-gray-100' : ''}`}
              placeholder="Menciona las principales fortalezas del estudiante desde la perspectiva directiva..."
            />
            {errors.strengths && (
              <p className="text-red-500 text-sm mt-1">{errors.strengths}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              🎯 Áreas de Mejora *
            </label>
            <textarea
              value={formData.areasForImprovement || ''}
              onChange={(e) => handleFieldChange('areasForImprovement', e.target.value)}
              disabled={isReadOnly}
              rows={3}
              className={`w-full border rounded-md px-3 py-2 ${
                errors.areasForImprovement ? 'border-red-500' : 'border-gray-300'
              } ${isReadOnly ? 'bg-gray-100' : ''}`}
              placeholder="Identifica aspectos que requieren atención o desarrollo..."
            />
            {errors.areasForImprovement && (
              <p className="text-red-500 text-sm mt-1">{errors.areasForImprovement}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              📋 Recomendaciones Pedagógicas *
            </label>
            <textarea
              value={formData.recommendations || ''}
              onChange={(e) => handleFieldChange('recommendations', e.target.value)}
              disabled={isReadOnly}
              rows={4}
              className={`w-full border rounded-md px-3 py-2 ${
                errors.recommendations ? 'border-red-500' : 'border-gray-300'
              } ${isReadOnly ? 'bg-gray-100' : ''}`}
              placeholder="Proporciona recomendaciones específicas para el éxito del estudiante en el colegio..."
            />
            {errors.recommendations && (
              <p className="text-red-500 text-sm mt-1">{errors.recommendations}</p>
            )}
            <p className="text-xs text-gray-500 mt-1">
              Incluye estrategias pedagógicas, adaptaciones necesarias, seguimiento sugerido...
            </p>
          </div>
        </div>
      </Card>

      {/* Recomendación Final */}
      <Card className="p-6 bg-yellow-50 border-yellow-200">
        <h3 className="text-lg font-semibold mb-4 text-yellow-800">⚖️ Recomendación Final</h3>
        
        <div className="space-y-4">
          <p className="text-sm text-yellow-700">
            Como Director/a de Ciclo, basándose en toda la evaluación realizada, ¿recomendaría la admisión de este estudiante?
          </p>
          
          <div className="flex space-x-6">
            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="radio"
                name="finalRecommendation"
                value="true"
                checked={formData.finalRecommendation === true}
                onChange={() => handleFieldChange('finalRecommendation', true)}
                disabled={isReadOnly}
                className="text-green-600 focus:ring-green-500"
              />
              <span className="text-green-700 font-medium">👍 SÍ, Recomiendo la Admisión</span>
            </label>
            
            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="radio"
                name="finalRecommendation"
                value="false"
                checked={formData.finalRecommendation === false}
                onChange={() => handleFieldChange('finalRecommendation', false)}
                disabled={isReadOnly}
                className="text-red-600 focus:ring-red-500"
              />
              <span className="text-red-700 font-medium">👎 NO Recomiendo la Admisión</span>
            </label>
          </div>
        </div>
      </Card>

      {/* Criterios de Evaluación */}
      <Card className="p-6 bg-gray-50">
        <h4 className="font-semibold text-azul-monte-tabor mb-4">📊 Criterios de Evaluación del Director</h4>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
          <div>
            <h5 className="font-medium text-gray-700 mb-2">Preparación Académica:</h5>
            <ul className="text-gray-600 space-y-1">
              <li>• Conocimientos del grado anterior</li>
              <li>• Hábitos de estudio establecidos</li>
              <li>• Organización y autonomía</li>
              <li>• Capacidad de aprendizaje</li>
            </ul>
          </div>
          
          <div>
            <h5 className="font-medium text-gray-700 mb-2">Comportamiento:</h5>
            <ul className="text-gray-600 space-y-1">
              <li>• Disciplina y autocontrol</li>
              <li>• Respeto por normas y autoridad</li>
              <li>• Responsabilidad personal</li>
              <li>• Actitud colaborativa</li>
            </ul>
          </div>
          
          <div>
            <h5 className="font-medium text-gray-700 mb-2">Potencial de Integración:</h5>
            <ul className="text-gray-600 space-y-1">
              <li>• Adaptabilidad al ambiente escolar</li>
              <li>• Habilidades sociales apropiadas</li>
              <li>• Alineación con valores del colegio</li>
              <li>• Proyección de desarrollo</li>
            </ul>
          </div>
          
          <div>
            <h5 className="font-medium text-gray-700 mb-2">Recomendación:</h5>
            <ul className="text-gray-600 space-y-1">
              <li>• Evaluación integral del perfil</li>
              <li>• Viabilidad de admisión</li>
              <li>• Necesidades de apoyo</li>
              <li>• Proyección de éxito académico</li>
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
                {isLoading ? 'Guardando...' : '✅ Completar Evaluación'}
              </Button>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
};

export default CycleDirectorForm;