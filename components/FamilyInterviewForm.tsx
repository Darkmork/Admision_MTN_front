import React, { useState, useEffect } from 'react';
import { FiSave, FiCheck, FiAlertCircle, FiUser, FiUsers, FiHeart, FiTrendingUp } from 'react-icons/fi';

interface FamilyInterviewFormProps {
  evaluation: any; // Evaluation data from parent
  initialData?: FamilyInterviewData; // Saved form data if exists
  onSave: (data: FamilyInterviewData) => Promise<void>;
  onSaveDraft: (data: FamilyInterviewData) => Promise<void>;
  onCancel?: () => void;
  disabled?: boolean;
  readonly?: boolean;
}

export interface FamilyInterviewData {
  // Información básica
  interviewerNames: string;
  familyName: string;
  studentsApplying: string;
  currentSchool: string;
  motherName: string;
  fatherName: string;
  questionnaireLink: string;

  // Sección I: Familia y Educación
  motivationScore: number;
  valuesScore: number;
  habitsScore: number;
  section1Total: number;

  // Sección II: Hijo que postula
  strengthsScore: number;
  frustrationScore: number;
  section2Total: number;

  // Sección III: Espiritualidad
  spiritualityScore: number;
  section3Total: number;

  // Sección IV: Responsabilidad Social
  socialResponsibilityScore: number;
  section4Total: number;

  // Observaciones
  belongsToSchoenstatt: boolean | null;
  coupleRespect: boolean | null;
  simplicityHonesty: boolean | null;
  belongingDesire: boolean | null;
  observationsTotal: number;

  // Opinión final
  finalOpinion: number;
  finalOpinionTotal: number;

  // Justificación
  justification: string;

  // Totales
  interviewTotal: number;
  observationsPercentage: number;
  opinionPercentage: number;
  grandTotal: number;
}

const FamilyInterviewForm: React.FC<FamilyInterviewFormProps> = ({
  evaluation,
  initialData,
  onSave,
  onSaveDraft,
  onCancel,
  disabled = false,
  readonly = false
}) => {
  const [formData, setFormData] = useState<FamilyInterviewData>(initialData || {
    interviewerNames: '',
    familyName: '',
    studentsApplying: evaluation.studentName || '',
    currentSchool: evaluation.currentSchool || '',
    motherName: evaluation.mother?.name || '',
    fatherName: evaluation.father?.name || '',
    questionnaireLink: '',

    motivationScore: 0,
    valuesScore: 0,
    habitsScore: 0,
    section1Total: 0,

    strengthsScore: 0,
    frustrationScore: 0,
    section2Total: 0,

    spiritualityScore: 0,
    section3Total: 0,

    socialResponsibilityScore: 0,
    section4Total: 0,

    belongsToSchoenstatt: null,
    coupleRespect: null,
    simplicityHonesty: null,
    belongingDesire: null,
    observationsTotal: 0,

    finalOpinion: 0,
    finalOpinionTotal: 0,

    justification: '',

    interviewTotal: 0,
    observationsPercentage: 0,
    opinionPercentage: 0,
    grandTotal: 0
  });

  // Calcular totales automáticamente
  useEffect(() => {
    const section1Total = formData.motivationScore + formData.valuesScore + formData.habitsScore;
    const section2Total = formData.strengthsScore + formData.frustrationScore;
    const section3Total = formData.spiritualityScore;
    const section4Total = formData.socialResponsibilityScore;

    const interviewTotal = section1Total + section2Total + section3Total + section4Total;
    const interviewPercentage = Math.round((interviewTotal / 26) * 100);

    const observationsTotal =
      (formData.belongsToSchoenstatt ? 1 : 0) +
      (formData.coupleRespect ? 2 : 0) +
      (formData.simplicityHonesty ? 2 : 0) +
      (formData.belongingDesire ? 1 : 0);

    const observationsPercentage = Math.round((observationsTotal / 6) * 100);

    const finalOpinionTotal = formData.finalOpinion;
    const opinionPercentage = Math.round((finalOpinionTotal / 5) * 100);

    const grandTotal = interviewPercentage + observationsPercentage + opinionPercentage;

    setFormData(prev => ({
      ...prev,
      section1Total,
      section2Total,
      section3Total,
      section4Total,
      interviewTotal,
      observationsTotal,
      finalOpinionTotal,
      observationsPercentage,
      opinionPercentage,
      grandTotal
    }));
  }, [
    formData.motivationScore,
    formData.valuesScore,
    formData.habitsScore,
    formData.strengthsScore,
    formData.frustrationScore,
    formData.spiritualityScore,
    formData.socialResponsibilityScore,
    formData.belongsToSchoenstatt,
    formData.coupleRespect,
    formData.simplicityHonesty,
    formData.belongingDesire,
    formData.finalOpinion
  ]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSave(formData);
  };

  const handleSaveDraft = async () => {
    await onSaveDraft(formData);
  };

  const ScoreSelector: React.FC<{
    value: number;
    onChange: (value: number) => void;
    max: number;
    disabled?: boolean;
    label: string;
    descriptions: { [key: number]: string };
  }> = ({ value, onChange, max, disabled, label, descriptions }) => (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700">{label}</label>
      <div className="space-y-2">
        {Array.from({ length: max }, (_, i) => i + 1).map(score => (
          <label
            key={score}
            className={`flex items-start p-3 border rounded-lg cursor-pointer transition-colors ${
              value === score
                ? 'bg-blue-50 border-blue-500'
                : 'bg-white border-gray-200 hover:bg-gray-50'
            } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            <input
              type="radio"
              name={`score-${label}`}
              value={score}
              checked={value === score}
              onChange={() => !disabled && onChange(score)}
              disabled={disabled}
              className="mt-1 mr-3"
            />
            <div className="flex-1">
              <div className="font-semibold text-gray-900">{score} punto{score > 1 ? 's' : ''}</div>
              <div className="text-sm text-gray-600">{descriptions[score]}</div>
            </div>
          </label>
        ))}
      </div>
    </div>
  );

  return (
    <form onSubmit={handleSubmit} className="max-w-6xl mx-auto bg-white rounded-lg shadow-lg p-6 space-y-8">
      {/* Header */}
      <div className="border-b pb-4">
        <h1 className="text-3xl font-bold text-blue-900 mb-2">
          Entrevista a Familias Nuevas
        </h1>
        <p className="text-gray-600">Formulario de evaluación individual para entrevistadores</p>
      </div>

      {/* Información Básica section removed - now displayed as info cards in FamilyInterviewPage.tsx */}

      {/* Sección I: Familia y Educación */}
      <section className="border-t pt-6">
        <h2 className="text-2xl font-bold text-blue-900 mb-4 flex items-center">
          <FiUsers className="mr-2" />
          I. Familia y Educación de los Hijos
        </h2>

        <div className="space-y-6">
          <ScoreSelector
            label="1. Motivos de postulación al MTN"
            value={formData.motivationScore}
            onChange={(value) => setFormData({ ...formData, motivationScore: value })}
            max={3}
            disabled={readonly}
            descriptions={{
              1: 'Cerca de la casa, buenos resultados académicos, conocen alumnos (al menos 2 indicadores)',
              2: 'Colegio familiar, innovación pedagógica, dual, coeducacional, inclusión, católico, Schoenstatt (al menos 2)',
              3: 'Originalidad, vínculos, responsabilidad social, respeto, sencillez, unidad familiar (al menos 3)'
            }}
          />

          <ScoreSelector
            label="2. Valores familiares"
            value={formData.valuesScore}
            onChange={(value) => setFormData({ ...formData, valuesScore: value })}
            max={3}
            disabled={readonly}
            descriptions={{
              1: 'Identifican valores de familia de origen, no se percibe proyecto común',
              2: 'Identifican valores y han definido valores comunes',
              3: 'Adhieren a varios valores vistos en cosas concretas: familia, solidaridad, sencillez, respeto (al menos 3)'
            }}
          />

          <ScoreSelector
            label="3. Hábitos, normas y límites"
            value={formData.habitsScore}
            onChange={(value) => setFormData({ ...formData, habitsScore: value })}
            max={3}
            disabled={readonly}
            descriptions={{
              1: 'Sin rutinas claras, no hay autoridad / Reglas rígidas y autoritarias',
              2: 'Reglas claras pero la implementación no facilita autonomía',
              3: 'Normas claras aplicadas con firmeza y afecto, fomentando autonomía y seguridad'
            }}
          />
        </div>

        <div className="mt-4 p-3 bg-blue-50 rounded-lg">
          <p className="text-sm font-semibold">
            Subtotal Sección I: {formData.section1Total} / 9 puntos
          </p>
        </div>
      </section>

      {/* Sección II: Hijo que Postula */}
      <section className="border-t pt-6">
        <h2 className="text-2xl font-bold text-blue-900 mb-4 flex items-center">
          <FiHeart className="mr-2" />
          II. Hijo/a que Postula
        </h2>

        <div className="space-y-6">
          <ScoreSelector
            label="Fortalezas del hijo/a"
            value={formData.strengthsScore}
            onChange={(value) => setFormData({ ...formData, strengthsScore: value })}
            max={3}
            disabled={readonly}
            descriptions={{
              1: 'Respuesta vaga, no queda claro el aporte concreto a la familia',
              2: 'Describen el aporte con ejemplos que lo caracterizan actualmente',
              3: 'Desarrollo claro de aportes con ejemplos concretos, proyectan originalidad como aporte a sociedad'
            }}
          />

          <ScoreSelector
            label="Frustración y reacción ante dificultades"
            value={formData.frustrationScore}
            onChange={(value) => setFormData({ ...formData, frustrationScore: value })}
            max={2}
            disabled={readonly}
            descriptions={{
              1: 'Conoce a su hijo/a e identifica formas de reaccionar frente a frustración',
              2: 'Conoce reacciones y muestra cómo lo han ayudado/apoyado en el proceso'
            }}
          />
        </div>

        <div className="mt-4 p-3 bg-blue-50 rounded-lg">
          <p className="text-sm font-semibold">
            Subtotal Sección II: {formData.section2Total} / 5 puntos
          </p>
        </div>
      </section>

      {/* Sección III: Espiritualidad */}
      <section className="border-t pt-6">
        <h2 className="text-2xl font-bold text-blue-900 mb-4 flex items-center">
          <FiHeart className="mr-2" />
          III. Espiritualidad
        </h2>

        <ScoreSelector
          label="Educación en la fe"
          value={formData.spiritualityScore}
          onChange={(value) => setFormData({ ...formData, spiritualityScore: value })}
          max={3}
          disabled={readonly}
          descriptions={{
            1: 'Espacios de oración personal o con hijos. Actividades formales: misa, mes de María, etc.',
            2: 'Idea clara de transmitir espiritualidad. Leen cuentos con valores, comparten vivencias, participan con sentido',
            3: 'Camino espiritual familiar claro y profundo. Participan en parroquias/movimientos. Anhelo profundo de vivir en fe'
          }}
        />

        <div className="mt-4 p-3 bg-blue-50 rounded-lg">
          <p className="text-sm font-semibold">
            Subtotal Sección III: {formData.section3Total} / 3 puntos
          </p>
        </div>
      </section>

      {/* Sección IV: Responsabilidad Social */}
      <section className="border-t pt-6">
        <h2 className="text-2xl font-bold text-blue-900 mb-4 flex items-center">
          <FiTrendingUp className="mr-2" />
          IV. Responsabilidad por la Sociedad
        </h2>

        <ScoreSelector
          label="Participación social"
          value={formData.socialResponsibilityScore}
          onChange={(value) => setFormData({ ...formData, socialResponsibilityScore: value })}
          max={3}
          disabled={readonly}
          descriptions={{
            1: 'Acciones esporádicas con enfoque en donación (caja navidad, kilo alimento)',
            2: 'Preocupación continua, múltiples acciones. Interés en ayudar, importancia de participar',
            3: 'Anhelo profundo. Compromiso en trabajo y estilo de vida. Empatía. Fomento con hijos. Aportan desde talentos'
          }}
        />

        <div className="mt-4 p-3 bg-blue-50 rounded-lg">
          <p className="text-sm font-semibold">
            Subtotal Sección IV: {formData.section4Total} / 3 puntos
          </p>
        </div>
      </section>

      {/* Total Entrevista */}
      <div className="border-t pt-4">
        <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
          <p className="text-lg font-bold text-green-900">
            Total Puntos Entrevista: {formData.interviewTotal} / 26 puntos = {Math.round((formData.interviewTotal / 26) * 100)}%
          </p>
        </div>
      </div>

      {/* Observaciones */}
      <section className="border-t pt-6">
        <h2 className="text-2xl font-bold text-blue-900 mb-4">Observaciones de los Entrevistadores</h2>

        <div className="space-y-3">
          {[
            { key: 'belongsToSchoenstatt', label: 'Pertenecen o pertenecieron al Movimiento de Schoenstatt', points: 1 },
            { key: 'coupleRespect', label: 'Respeto, sintonía, cariño de la pareja', points: 2 },
            { key: 'simplicityHonesty', label: 'Sencillez, honestidad y transparencia', points: 2 },
            { key: 'belongingDesire', label: 'Anhelo de pertenencia', points: 1 }
          ].map(item => (
            <label key={item.key} className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50">
              <span className="font-medium">{item.label}</span>
              <div className="flex items-center space-x-4">
                <label className="flex items-center">
                  <input
                    type="radio"
                    name={item.key}
                    checked={formData[item.key as keyof FamilyInterviewData] === true}
                    onChange={() => setFormData({ ...formData, [item.key]: true })}
                    disabled={readonly}
                    className="mr-2"
                  />
                  Sí ({item.points} pt)
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    name={item.key}
                    checked={formData[item.key as keyof FamilyInterviewData] === false}
                    onChange={() => setFormData({ ...formData, [item.key]: false })}
                    disabled={readonly}
                    className="mr-2"
                  />
                  No (0 pt)
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    name={item.key}
                    checked={formData[item.key as keyof FamilyInterviewData] === null}
                    onChange={() => setFormData({ ...formData, [item.key]: null })}
                    disabled={readonly}
                    className="mr-2"
                  />
                  N/A
                </label>
              </div>
            </label>
          ))}
        </div>

        <div className="mt-4 p-3 bg-blue-50 rounded-lg">
          <p className="text-sm font-semibold">
            Subtotal Observaciones: {formData.observationsTotal} / 6 puntos = {formData.observationsPercentage}%
          </p>
        </div>
      </section>

      {/* Opinión Final */}
      <section className="border-t pt-6">
        <h2 className="text-2xl font-bold text-blue-900 mb-4">Opinión de los Entrevistadores</h2>

        <div className="space-y-2">
          {[
            { value: 5, label: 'Tenemos claridad que la familia posee el perfil de las familias del colegio MTN' },
            { value: 4, label: 'Tenemos claridad que la familia posee el perfil, con reparos' },
            { value: 3, label: 'No tenemos claridad que la familia posea el perfil' },
            { value: 2, label: 'La familia muestra un bajo perfil respecto a las familias del colegio' },
            { value: 1, label: 'La familia no cumple con el perfil de las familias del colegio MTN' }
          ].map(option => (
            <label
              key={option.value}
              className={`flex items-center p-3 border rounded-lg cursor-pointer transition-colors ${
                formData.finalOpinion === option.value
                  ? 'bg-blue-50 border-blue-500'
                  : 'bg-white border-gray-200 hover:bg-gray-50'
              }`}
            >
              <input
                type="radio"
                name="finalOpinion"
                value={option.value}
                checked={formData.finalOpinion === option.value}
                onChange={() => setFormData({ ...formData, finalOpinion: option.value })}
                disabled={readonly}
                className="mr-3"
              />
              <span className="flex-1">{option.label}</span>
              <span className="font-semibold text-blue-900">{option.value} pts</span>
            </label>
          ))}
        </div>

        <div className="mt-4 p-3 bg-blue-50 rounded-lg">
          <p className="text-sm font-semibold">
            Subtotal Opinión: {formData.finalOpinionTotal} / 5 puntos = {formData.opinionPercentage}%
          </p>
        </div>
      </section>

      {/* Justificación */}
      <section className="border-t pt-6">
        <h2 className="text-xl font-bold text-gray-800 mb-3">
          Justificación de la opinión (máximo 5 líneas)
        </h2>
        <textarea
          value={formData.justification}
          onChange={(e) => setFormData({ ...formData, justification: e.target.value })}
          disabled={readonly}
          rows={5}
          maxLength={500}
          className="w-full px-3 py-2 border border-gray-300 rounded-md"
          placeholder="Justifique su opinión sobre el perfil de la familia..."
        />
        <p className="text-sm text-gray-500 mt-1">
          {formData.justification.length} / 500 caracteres
        </p>
      </section>

      {/* Total General */}
      <div className="border-t pt-6">
        <div className="p-6 bg-gradient-to-r from-blue-600 to-blue-800 text-white rounded-lg">
          <h3 className="text-2xl font-bold mb-4">Puntaje Total Final</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-sm opacity-90">Entrevista</p>
              <p className="text-3xl font-bold">{Math.round((formData.interviewTotal / 26) * 100)}%</p>
            </div>
            <div>
              <p className="text-sm opacity-90">Observaciones</p>
              <p className="text-3xl font-bold">{formData.observationsPercentage}%</p>
            </div>
            <div>
              <p className="text-sm opacity-90">Opinión</p>
              <p className="text-3xl font-bold">{formData.opinionPercentage}%</p>
            </div>
          </div>
          <div className="mt-6 pt-6 border-t border-blue-400">
            <p className="text-4xl font-bold text-center">
              TOTAL: {formData.grandTotal}%
            </p>
          </div>
        </div>
      </div>

      {/* Botones */}
      {!readonly && (
        <div className="flex items-center justify-end space-x-4 border-t pt-6">
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              disabled={disabled}
              className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancelar
            </button>
          )}
          <button
            type="button"
            onClick={handleSaveDraft}
            disabled={disabled || readonly}
            className="flex items-center px-6 py-2 border border-blue-600 text-blue-600 rounded-md hover:bg-blue-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <FiSave className="mr-2" />
            Guardar Borrador
          </button>
          <button
            type="submit"
            disabled={disabled || readonly}
            className="flex items-center px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <FiCheck className="mr-2" />
            Guardar y Completar
          </button>
        </div>
      )}
    </form>
  );
};

export default FamilyInterviewForm;
