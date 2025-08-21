import React, { useState, useEffect } from 'react';
import Card from '../ui/Card';
import Button from '../ui/Button';
import { 
  AcademicEvaluation, 
  EvaluationType, 
  EvaluationStatus,
  EVALUATION_TYPE_LABELS,
  GRADE_OPTIONS,
  MIN_SCORE,
  MAX_SCORE,
  ValidationRules,
  UpdateEvaluationRequest
} from '../../types/evaluation';

interface AcademicEvaluationFormProps {
  evaluation: AcademicEvaluation;
  onSave: (data: UpdateEvaluationRequest) => Promise<void>;
  onCancel: () => void;
  isReadOnly?: boolean;
  isLoading?: boolean;
}

const AcademicEvaluationForm: React.FC<AcademicEvaluationFormProps> = ({
  evaluation,
  onSave,
  onCancel,
  isReadOnly = false,
  isLoading = false
}) => {
  const [formData, setFormData] = useState<UpdateEvaluationRequest>({
    score: evaluation.score || 0,
    grade: evaluation.grade || '',
    observations: evaluation.observations || '',
    strengths: evaluation.strengths || '',
    areasForImprovement: evaluation.areasForImprovement || '',
    recommendations: evaluation.recommendations || '',
    status: evaluation.status
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isDirty, setIsDirty] = useState(false);

  useEffect(() => {
    setFormData({
      score: evaluation.score || 0,
      grade: evaluation.grade || '',
      observations: evaluation.observations || '',
      strengths: evaluation.strengths || '',
      areasForImprovement: evaluation.areasForImprovement || '',
      recommendations: evaluation.recommendations || '',
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

    // Score validation
    if (formData.score !== undefined && !ValidationRules.score(formData.score)) {
      newErrors.score = `El puntaje debe estar entre ${MIN_SCORE} y ${MAX_SCORE}`;
    }

    // Grade validation
    if (formData.grade && !ValidationRules.grade(formData.grade)) {
      newErrors.grade = 'Selecciona una calificación válida';
    }

    // Required fields validation
    if (!ValidationRules.requiredText(formData.observations || '')) {
      newErrors.observations = 'Las observaciones son requeridas';
    }

    if (!ValidationRules.requiredText(formData.strengths || '')) {
      newErrors.strengths = 'Las fortalezas son requeridas';
    }

    if (!ValidationRules.requiredText(formData.areasForImprovement || '')) {
      newErrors.areasForImprovement = 'Las áreas de mejora son requeridas';
    }

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
      console.error('Error saving evaluation:', error);
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
      console.error('Error saving draft:', error);
    }
  };

  const getSubjectLabel = () => {
    switch (evaluation.evaluationType) {
      case EvaluationType.LANGUAGE_EXAM:
        return 'Lenguaje y Comunicación';
      case EvaluationType.MATHEMATICS_EXAM:
        return 'Matemáticas';
      case EvaluationType.ENGLISH_EXAM:
        return 'Inglés';
      default:
        return EVALUATION_TYPE_LABELS[evaluation.evaluationType];
    }
  };

  const getGradeDescription = (grade: string): string => {
    const descriptions: Record<string, string> = {
      'A': 'Excelente (90-100)',
      'B': 'Bueno (80-89)',
      'C': 'Satisfactorio (70-79)',
      'D': 'Necesita Mejora (60-69)',
      'F': 'Insuficiente (0-59)'
    };
    return descriptions[grade] || '';
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <Card className="p-6">
        <div className="flex justify-between items-start">
          <div>
            <h2 className="text-2xl font-bold text-azul-monte-tabor">
              📚 {getSubjectLabel()}
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

      {/* Score and Grade Section */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">🎯 Calificación</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Puntaje Numérico (0-100) *
            </label>
            <input
              type="number"
              min={MIN_SCORE}
              max={MAX_SCORE}
              value={formData.score || ''}
              onChange={(e) => handleFieldChange('score', parseInt(e.target.value) || 0)}
              disabled={isReadOnly}
              className={`w-full border rounded-md px-3 py-2 ${
                errors.score ? 'border-red-500' : 'border-gray-300'
              } ${isReadOnly ? 'bg-gray-100' : ''}`}
              placeholder="Ingresa el puntaje obtenido"
            />
            {errors.score && (
              <p className="text-red-500 text-sm mt-1">{errors.score}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Calificación Conceptual *
            </label>
            <select
              value={formData.grade || ''}
              onChange={(e) => handleFieldChange('grade', e.target.value)}
              disabled={isReadOnly}
              className={`w-full border rounded-md px-3 py-2 ${
                errors.grade ? 'border-red-500' : 'border-gray-300'
              } ${isReadOnly ? 'bg-gray-100' : ''}`}
            >
              <option value="">Seleccionar calificación</option>
              {GRADE_OPTIONS.map(grade => (
                <option key={grade} value={grade}>
                  {grade} - {getGradeDescription(grade)}
                </option>
              ))}
            </select>
            {errors.grade && (
              <p className="text-red-500 text-sm mt-1">{errors.grade}</p>
            )}
          </div>
        </div>
      </Card>

      {/* Detailed Assessment */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">📝 Evaluación Detallada</h3>
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Observaciones Generales *
            </label>
            <textarea
              value={formData.observations || ''}
              onChange={(e) => handleFieldChange('observations', e.target.value)}
              disabled={isReadOnly}
              rows={4}
              className={`w-full border rounded-md px-3 py-2 ${
                errors.observations ? 'border-red-500' : 'border-gray-300'
              } ${isReadOnly ? 'bg-gray-100' : ''}`}
              placeholder="Describe el desempeño general del estudiante durante la evaluación..."
            />
            {errors.observations && (
              <p className="text-red-500 text-sm mt-1">{errors.observations}</p>
            )}
          </div>

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
              placeholder="Menciona las principales fortalezas y habilidades destacadas..."
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
              placeholder="Identifica áreas que requieren mayor atención o desarrollo..."
            />
            {errors.areasForImprovement && (
              <p className="text-red-500 text-sm mt-1">{errors.areasForImprovement}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              💡 Recomendaciones
            </label>
            <textarea
              value={formData.recommendations || ''}
              onChange={(e) => handleFieldChange('recommendations', e.target.value)}
              disabled={isReadOnly}
              rows={3}
              className={`w-full border rounded-md px-3 py-2 border-gray-300 ${
                isReadOnly ? 'bg-gray-100' : ''
              }`}
              placeholder="Sugerencias específicas para apoyar el desarrollo del estudiante..."
            />
          </div>
        </div>
      </Card>

      {/* Subject-Specific Criteria */}
      <Card className="p-6">
        <h4 className="font-semibold text-azul-monte-tabor mb-4">
          🔍 Criterios Específicos - {getSubjectLabel()}
        </h4>
        
        {evaluation.evaluationType === EvaluationType.LANGUAGE_EXAM && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div className="space-y-2">
              <h5 className="font-medium text-gray-700">Comprensión Lectora:</h5>
              <ul className="text-gray-600 space-y-1">
                <li>• Interpretación de textos</li>
                <li>• Inferencias y conclusiones</li>
                <li>• Vocabulario y contexto</li>
              </ul>
            </div>
            <div className="space-y-2">
              <h5 className="font-medium text-gray-700">Expresión Escrita:</h5>
              <ul className="text-gray-600 space-y-1">
                <li>• Coherencia y cohesión</li>
                <li>• Ortografía y gramática</li>
                <li>• Creatividad y originalidad</li>
              </ul>
            </div>
          </div>
        )}

        {evaluation.evaluationType === EvaluationType.MATHEMATICS_EXAM && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div className="space-y-2">
              <h5 className="font-medium text-gray-700">Razonamiento Lógico:</h5>
              <ul className="text-gray-600 space-y-1">
                <li>• Resolución de problemas</li>
                <li>• Pensamiento abstracto</li>
                <li>• Estrategias de solución</li>
              </ul>
            </div>
            <div className="space-y-2">
              <h5 className="font-medium text-gray-700">Conocimientos:</h5>
              <ul className="text-gray-600 space-y-1">
                <li>• Operaciones básicas</li>
                <li>• Conceptos matemáticos</li>
                <li>• Aplicación práctica</li>
              </ul>
            </div>
          </div>
        )}

        {evaluation.evaluationType === EvaluationType.ENGLISH_EXAM && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div className="space-y-2">
              <h5 className="font-medium text-gray-700">Comprensión:</h5>
              <ul className="text-gray-600 space-y-1">
                <li>• Listening comprehension</li>
                <li>• Reading comprehension</li>
                <li>• Vocabulary range</li>
              </ul>
            </div>
            <div className="space-y-2">
              <h5 className="font-medium text-gray-700">Expresión:</h5>
              <ul className="text-gray-600 space-y-1">
                <li>• Speaking fluency</li>
                <li>• Written expression</li>
                <li>• Grammar accuracy</li>
              </ul>
            </div>
          </div>
        )}
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

export default AcademicEvaluationForm;