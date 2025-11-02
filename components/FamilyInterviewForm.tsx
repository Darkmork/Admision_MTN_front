import React, { useState, useEffect } from 'react';
import { FiSave, FiCheck, FiLoader, FiAlertCircle } from 'react-icons/fi';
import { familyInterviewService } from '../services/familyInterviewService';

interface FamilyInterviewFormProps {
  evaluation: any; // Evaluation data with gradeApplied
  onSave?: (data: any, score: number) => Promise<void>;
  onCancel?: () => void;
  disabled?: boolean;
  readonly?: boolean;
}

const FamilyInterviewForm: React.FC<FamilyInterviewFormProps> = ({
  evaluation,
  onSave,
  onCancel,
  disabled = false,
  readonly = false
}) => {
  const [template, setTemplate] = useState<any>(null);
  const [interviewData, setInterviewData] = useState<any>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [currentScore, setCurrentScore] = useState(0);

  // Load template and existing data when component mounts
  useEffect(() => {
    const loadTemplate = async () => {
      try {
        setLoading(true);

        // Get student's grade from evaluation
        // Try multiple field names for compatibility
        const studentGrade = evaluation.gradeApplied ||
                            evaluation.student?.gradeApplied ||
                            (evaluation as any).studentGrade;

        if (!studentGrade) {
          console.error('No se pudo determinar el grado del estudiante');
          console.error('Evaluation object:', evaluation);
          alert('No se pudo determinar el grado del estudiante');
          return;
        }

        console.log(`📋 Loading template for grade: ${studentGrade}`);

        // Fetch template for this grade
        const templateData = await familyInterviewService.getTemplateForGrade(studentGrade);
        setTemplate(templateData);

        console.log('✅ Template loaded:', templateData);

        // Load existing interview data if evaluation exists
        if (evaluation.id) {
          try {
            const { data, score } = await familyInterviewService.getInterviewData(evaluation.id);

            if (data && Object.keys(data).length > 0) {
              setInterviewData(data);
              setCurrentScore(score);
              console.log('✅ Existing interview data loaded:', data);
            } else {
              // Initialize empty structure
              setInterviewData(initializeEmptyData(templateData));
            }
          } catch (error) {
            console.log('ℹ️ No existing interview data found, starting fresh');
            setInterviewData(initializeEmptyData(templateData));
          }
        } else {
          setInterviewData(initializeEmptyData(templateData));
        }
      } catch (error: any) {
        console.error('❌ Error loading template:', error);
        alert(error.message || 'Error al cargar el template de entrevista');
      } finally {
        setLoading(false);
      }
    };

    loadTemplate();
  }, [evaluation.id, evaluation.gradeApplied, evaluation.student?.gradeApplied]);

  // Calculate score whenever interview data changes
  useEffect(() => {
    if (template && interviewData) {
      const score = familyInterviewService.calculateScore(interviewData);
      setCurrentScore(score);
    }
  }, [interviewData, template]);

  // Initialize empty data structure based on template
  const initializeEmptyData = (templateData: any) => {
    const data: any = {};

    // Initialize sections
    if (templateData.sections) {
      for (const [sectionKey, sectionData] of Object.entries(templateData.sections as any)) {
        data[sectionKey] = {};

        for (const questionKey of Object.keys(sectionData.questions)) {
          data[sectionKey][questionKey] = {
            score: 0,
            text: ''
          };
        }
      }
    }

    // Initialize observations
    data.observations = {
      checklist: {},
      overallOpinion: {
        score: 0,
        text: ''
      }
    };

    return data;
  };

  // Handle question score change
  const handleScoreChange = (sectionKey: string, questionKey: string, score: number) => {
    setInterviewData((prev: any) => ({
      ...prev,
      [sectionKey]: {
        ...prev[sectionKey],
        [questionKey]: {
          ...prev[sectionKey]?.[questionKey],
          score
        }
      }
    }));
  };

  // Handle observation checklist change
  const handleChecklistChange = (itemKey: string, checked: boolean) => {
    setInterviewData((prev: any) => ({
      ...prev,
      observations: {
        ...prev.observations,
        checklist: {
          ...prev.observations?.checklist,
          [itemKey]: checked
        }
      }
    }));
  };

  // Handle overall opinion change
  const handleOverallOpinionChange = (score: number) => {
    setInterviewData((prev: any) => ({
      ...prev,
      observations: {
        ...prev.observations,
        overallOpinion: {
          score
        }
      }
    }));
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!evaluation.id) {
      console.error('ID de evaluación no encontrado');
      alert('ID de evaluación no encontrado');
      return;
    }

    try {
      setSaving(true);

      // Validate responses
      const validation = familyInterviewService.validateResponses(template, interviewData);

      if (!validation.valid) {
        console.warn('⚠️ Validation errors:', validation.errors);
        alert(`Formulario incompleto: ${validation.errors.length} campos faltantes`);
        return;
      }

      // Save to backend
      const result = await familyInterviewService.saveInterviewData(evaluation.id, interviewData);

      console.log('✅ Interview data saved:', result);
      alert(`Entrevista guardada exitosamente. Puntaje: ${result.totalScore}/51`);

      // Call parent onSave callback if provided
      if (onSave) {
        await onSave(result.interview_data, result.totalScore);
      }
    } catch (error: any) {
      console.error('❌ Error saving interview:', error);
      alert(error.message || 'Error al guardar la entrevista');
    } finally {
      setSaving(false);
    }
  };

  // Render score selector for a question
  const renderScoreSelector = (
    sectionKey: string,
    questionKey: string,
    question: any
  ) => {
    const currentValue = interviewData[sectionKey]?.[questionKey]?.score || 0;

    return (
      <div className="space-y-2">
        <p className="text-sm font-medium text-gray-900 mb-3">{question.text}</p>
        <div className="space-y-2">
          {Object.entries(question.rubric).map(([score, description]) => {
            const scoreNum = parseInt(score);
            const isSelected = currentValue === scoreNum;

            return (
              <label
                key={score}
                className={`flex items-start p-3 border rounded-lg cursor-pointer transition-colors ${
                  isSelected
                    ? 'bg-blue-50 border-blue-500'
                    : 'bg-white border-gray-200 hover:bg-gray-50'
                } ${readonly ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                <input
                  type="radio"
                  name={`${sectionKey}-${questionKey}`}
                  value={scoreNum}
                  checked={isSelected}
                  onChange={() => !readonly && handleScoreChange(sectionKey, questionKey, scoreNum)}
                  disabled={readonly || disabled}
                  className="mt-1 mr-3"
                />
                <div className="flex-1">
                  <div className="font-semibold text-gray-900">
                    {scoreNum} punto{scoreNum > 1 ? 's' : ''}
                  </div>
                  <div className="text-sm text-gray-600">{description as string}</div>
                </div>
              </label>
            );
          })}
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="text-center">
          <FiLoader className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Cargando formulario de entrevista...</p>
        </div>
      </div>
    );
  }

  if (!template) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="text-center">
          <FiAlertCircle className="w-8 h-8 text-red-600 mx-auto mb-4" />
          <p className="text-gray-600">No se pudo cargar el template de entrevista</p>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-6xl mx-auto bg-white rounded-lg shadow-lg p-6 space-y-8">
      {/* Header */}
      <div className="border-b pb-4">
        <h1 className="text-3xl font-bold text-blue-900 mb-2">
          {template.metadata?.title || 'Entrevista a Familias'}
        </h1>
        <p className="text-gray-600">
          Grado: <span className="font-semibold">{template.gradeApplied}</span>
          {' · '}
          Rango: <span className="font-semibold">{template.gradeRange}</span>
        </p>
      </div>

      {/* Dynamic Sections */}
      {template.sections && Object.entries(template.sections).map(([sectionKey, sectionData]: [string, any]) => {
        // Calculate section score
        const sectionScore = Object.keys(sectionData.questions).reduce((total, qKey) => {
          return total + (interviewData[sectionKey]?.[qKey]?.score || 0);
        }, 0);

        const maxSectionScore = Object.keys(sectionData.questions).reduce((total, qKey) => {
          const question = sectionData.questions[qKey];
          const maxScore = Math.max(...Object.keys(question.rubric).map(Number));
          return total + maxScore;
        }, 0);

        return (
          <section key={sectionKey} className="border-t pt-6">
            <h2 className="text-2xl font-bold text-blue-900 mb-4">
              {sectionData.title}
            </h2>

            <div className="space-y-6">
              {Object.entries(sectionData.questions).map(([questionKey, question]: [string, any]) => (
                <div key={questionKey} className="p-4 bg-gray-50 rounded-lg">
                  {renderScoreSelector(sectionKey, questionKey, question)}
                </div>
              ))}
            </div>

            <div className="mt-4 p-3 bg-blue-50 rounded-lg">
              <p className="text-sm font-semibold">
                Subtotal {sectionData.title}: {sectionScore} / {maxSectionScore} puntos
              </p>
            </div>
          </section>
        );
      })}

      {/* Observations Section */}
      {template.observations && (
        <section className="border-t pt-6">
          <h2 className="text-2xl font-bold text-blue-900 mb-4">
            {template.observations.title || 'Observaciones'}
          </h2>

          {/* Checklist */}
          {template.observations.checklist && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-3">
                {template.observations.checklist.title || 'Lista de Verificación'}
              </h3>
              <div className="space-y-3">
                {Object.entries(template.observations.checklist.items).map(([itemKey, itemData]: [string, any]) => {
                  const isChecked = interviewData.observations?.checklist?.[itemKey] || false;

                  return (
                    <label
                      key={itemKey}
                      className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50"
                    >
                      <span className="font-medium">{itemData.text}</span>
                      <div className="flex items-center space-x-4">
                        <label className="flex items-center">
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={(e) => !readonly && handleChecklistChange(itemKey, e.target.checked)}
                            disabled={readonly || disabled}
                            className="mr-2"
                          />
                          {isChecked ? `Sí (${itemData.points} pt)` : 'No (0 pt)'}
                        </label>
                      </div>
                    </label>
                  );
                })}
              </div>

              <div className="mt-3 p-3 bg-blue-50 rounded-lg">
                <p className="text-sm font-semibold">
                  Subtotal Checklist: {
                    Object.keys(interviewData.observations?.checklist || {}).filter(
                      k => interviewData.observations.checklist[k]
                    ).reduce((total, k) => {
                      const itemData = template.observations.checklist.items[k];
                      return total + (itemData?.points || 0);
                    }, 0)
                  } / {
                    Object.values(template.observations.checklist.items).reduce(
                      (total: number, item: any) => total + (item.points || 0), 0
                    )
                  } puntos
                </p>
              </div>
            </div>
          )}

          {/* Overall Opinion */}
          {template.observations.overallOpinion && (
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-3">
                {template.observations.overallOpinion.title || 'Opinión General'}
              </h3>
              <div className="space-y-2">
                {Object.entries(template.observations.overallOpinion.options).map(([score, text]: [string, any]) => {
                  const scoreNum = parseInt(score);
                  const isSelected = interviewData.observations?.overallOpinion?.score === scoreNum;

                  return (
                    <label
                      key={score}
                      className={`flex items-center p-3 border rounded-lg cursor-pointer transition-colors ${
                        isSelected
                          ? 'bg-blue-50 border-blue-500'
                          : 'bg-white border-gray-200 hover:bg-gray-50'
                      }`}
                    >
                      <input
                        type="radio"
                        name="overallOpinion"
                        value={scoreNum}
                        checked={isSelected}
                        onChange={() => !readonly && handleOverallOpinionChange(scoreNum)}
                        disabled={readonly || disabled}
                        className="mr-3"
                      />
                      <span className="flex-1">{text}</span>
                      <span className="font-semibold text-blue-900">{scoreNum} pts</span>
                    </label>
                  );
                })}
              </div>

              <div className="mt-3 p-3 bg-blue-50 rounded-lg">
                <p className="text-sm font-semibold">
                  Subtotal Opinión: {interviewData.observations?.overallOpinion?.score || 0} / {
                    Math.max(...Object.keys(template.observations.overallOpinion.options).map(Number))
                  } puntos
                </p>
              </div>
            </div>
          )}
        </section>
      )}

      {/* Total Score */}
      <div className="border-t pt-6">
        <div className="p-6 bg-gradient-to-r from-blue-600 to-blue-800 text-white rounded-lg">
          <h3 className="text-2xl font-bold mb-4">Puntaje Total</h3>
          <div className="text-center">
            <p className="text-5xl font-bold">
              {currentScore} / {familyInterviewService.getMaxScore()}
            </p>
            <p className="text-xl mt-2 opacity-90">
              {familyInterviewService.getScorePercentage(currentScore)}% del puntaje máximo
            </p>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      {!readonly && (
        <div className="flex items-center justify-end space-x-4 border-t pt-6">
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              disabled={disabled || saving}
              className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancelar
            </button>
          )}
          <button
            type="submit"
            disabled={disabled || saving}
            className="flex items-center px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? (
              <>
                <FiLoader className="mr-2 animate-spin" />
                Guardando...
              </>
            ) : (
              <>
                <FiCheck className="mr-2" />
                Guardar Entrevista
              </>
            )}
          </button>
        </div>
      )}
    </form>
  );
};

export default FamilyInterviewForm;
