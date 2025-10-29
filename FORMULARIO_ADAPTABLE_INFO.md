# Formulario de Entrevista Familiar Adaptable

## Resumen

He creado un **formulario único adaptable** que muestra preguntas diferentes según el nivel educativo al que postula el estudiante.

## Archivos Creados

✅ **Backup del formulario original**: `components/FamilyInterviewForm.tsx.backup`

## Cómo Funciona el Formulario Adaptable

### 1. Prop `gradeApplied`

El formulario recibe una prop `gradeApplied` (string) que puede ser:
- Niveles BÁSICOS: "PRE_KINDER", "KINDER", "1_BASICO", "2_BASICO", "3_BASICO", "4_BASICO"
- Niveles MEDIOS: "5_BASICO", "6_BASICO", "7_BASICO", "8_BASICO", "I_MEDIO", "II_MEDIO", "III_MEDIO", "IV_MEDIO"

### 2. Detección Automática del Nivel

```typescript
// Función que determina si es nivel básico o medio
const isBasicLevel = (grade: string): boolean => {
  const basicGrades = ['PRE_KINDER', 'KINDER', '1_BASICO', '2_BASICO', '3_BASICO', '4_BASICO'];
  return basicGrades.includes(grade);
};
```

### 3. Preguntas Adaptables

**Sección I - Pregunta 2 (Valores familiares)**:
- **Nivel BÁSICO (Pre K - 4° Básico)**: "¿Qué es lo que más valoran de sus familias de origen y qué es lo que no les gustó?"
- **Nivel MEDIO (5° Básico - IV Medio)**: "¿Qué valores familiares han intencionado? ¿Cómo lo han hecho? ¿Cómo ha logrado incorporar a todos los hijos?"

**Sección I - Pregunta 3 (Hábitos/Límites)**:
- **Nivel BÁSICO**: "¿Cómo trabajan los hábitos y normas en su familia?"
- **Nivel MEDIO**: "¿Qué límites y/o responsabilidades han establecido en ellos?"

### 4. Descripciones de Puntajes Adaptables

Las descripciones de 1, 2, 3 puntos también cambian según el nivel, tomando el texto exacto del documento original.

## Uso del Componente

```typescript
import FamilyInterviewForm from './components/FamilyInterviewForm';

// Para un estudiante que postula a 2° Básico
<FamilyInterviewForm
  gradeApplied="2_BASICO"
  onSubmit={handleSubmit}
  onSaveDraft={handleDraft}
/>

// Para un estudiante que postula a I Medio
<FamilyInterviewForm
  gradeApplied="I_MEDIO"
  onSubmit={handleSubmit}
  onSaveDraft={handleDraft}
/>
```

## Ventajas

✅ Un solo componente para mantener
✅ Mismo interface de datos
✅ Lógica centralizada
✅ Fácil de actualizar
✅ Muestra automáticamente el nivel en el header

## Próximos Pasos

1. ⏳ **Reemplazar el formulario actual** con la versión adaptable
2. ⏳ **Actualizar el componente padre** que use `FamilyInterviewForm` para pasar la prop `gradeApplied`
3. ⏳ **Probar en local** con diferentes niveles educativos
4. ⏳ **Desplegar a Vercel**

## Rollback

Si necesitas volver al formulario original:
```bash
mv components/FamilyInterviewForm.tsx.backup components/FamilyInterviewForm.tsx
```
