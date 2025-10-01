import React, { useState, useEffect } from 'react';
import { interviewService } from '../services/interviewService';
import { FiCalendar, FiClock, FiCheck } from 'react-icons/fi';
import {
  createSantiagoDate,
  formatSantiagoDate,
  getTodayInSantiago,
  addDaysInSantiago,
  CHILE_DATE_OPTIONS
} from '../utils/timezone';

interface DayScheduleSelectorProps {
  evaluatorId: number;
  evaluatorName: string;
  selectedDate?: string;
  selectedTime?: string;
  onDateTimeSelect: (date: string, time: string) => void;
  disabled?: boolean;
}

const DayScheduleSelector: React.FC<DayScheduleSelectorProps> = ({
  evaluatorId,
  evaluatorName,
  selectedDate,
  selectedTime,
  onDateTimeSelect,
  disabled = false
}) => {
  const [availableSlots, setAvailableSlots] = useState<string[]>([]);
  const [isLoadingSlots, setIsLoadingSlots] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Cargar horarios cuando se selecciona una fecha
  useEffect(() => {
    console.log(`📅 DayScheduleSelector useEffect: selectedDate="${selectedDate}", evaluatorId="${evaluatorId}"`);
    if (selectedDate && evaluatorId) {
      loadDaySlots(selectedDate);
    } else {
      setAvailableSlots([]);
    }
  }, [selectedDate, evaluatorId]);

  const loadDaySlots = async (date: string) => {
    setIsLoadingSlots(true);
    setError(null);
    
    try {
      console.log(`🔍 Cargando horarios para evaluador ${evaluatorId} (tipo: ${typeof evaluatorId}) en fecha ${date}`);
      
      // Validar que tenemos un evaluadorId válido
      if (!evaluatorId || evaluatorId <= 0) {
        console.warn(`⚠️ EvaluatorId inválido: ${evaluatorId}`);
        setAvailableSlots([]);
        return;
      }
      
      // Obtener horarios disponibles para ese día específico
      const slots = await interviewService.getAvailableTimeSlots(
        evaluatorId,
        date,
        60 // duración por defecto de 60 minutos
      );
      
      console.log(`✅ Horarios obtenidos:`, slots);
      console.log(`🔍 Tipo de slots:`, Array.isArray(slots), typeof slots);
      
      // Validar que slots sea un array
      if (!Array.isArray(slots)) {
        console.error(`❌ Los slots no son un array:`, slots);
        setAvailableSlots([]);
        return;
      }
      
      // Validación defensiva: asegurar que tenemos strings
      const validSlots = slots.map((slot, index) => {
        console.log(`🔍 Slot ${index}:`, slot, typeof slot);
        if (typeof slot === 'string') {
          return slot;
        } else if (typeof slot === 'object' && slot !== null) {
          // Si es un objeto, intentar extraer el tiempo como string
          const extracted = slot.time || slot.slot || slot.value || String(slot);
          console.log(`🔧 Slot objeto convertido:`, extracted);
          return extracted;
        } else {
          // Fallback para otros tipos
          const fallback = String(slot);
          console.log(`🔧 Slot fallback:`, fallback);
          return fallback;
        }
      }).filter(slot => slot && typeof slot === 'string');
      
      console.log(`✅ Slots válidos finales:`, validSlots);
      setAvailableSlots(validSlots);
      
      // Si el horario previamente seleccionado ya no está disponible, limpiarlo
      if (selectedTime && !validSlots.includes(selectedTime)) {
        onDateTimeSelect(date, '');
      }
      
    } catch (error) {
      console.error('Error cargando horarios del día:', error);
      setError('Error al cargar horarios disponibles');
      setAvailableSlots([]);
    } finally {
      setIsLoadingSlots(false);
    }
  };

  const handleDateChange = (date: string) => {
    console.log(`📅 DayScheduleSelector: Cambio de fecha de "${selectedDate}" a "${date}"`);
    onDateTimeSelect(date, ''); // Limpiar hora cuando cambia la fecha
  };

  const handleTimeSelect = (time: string) => {
    if (selectedDate) {
      onDateTimeSelect(selectedDate, time);
    }
  };

  const getMinDate = () => {
    return getTodayInSantiago();
  };

  const getMaxDate = () => {
    return addDaysInSantiago(getTodayInSantiago(), 90); // 3 meses adelante
  };

  const formatSelectedDateTime = () => {
    if (!selectedDate || !selectedTime) return null;

    const date = createSantiagoDate(selectedDate);
    return {
      dateText: formatSantiagoDate(date, CHILE_DATE_OPTIONS),
      timeText: selectedTime
    };
  };

  return (
    <div className="space-y-4">
      {/* Selector de Fecha */}
      <div>
        <label htmlFor="interview-date" className="block text-sm font-medium text-gray-700 mb-2">
          <FiCalendar className="inline w-4 h-4 mr-1" />
          Paso 1: Seleccionar Fecha *
        </label>
        <input
          id="interview-date"
          type="date"
          value={selectedDate || ''}
          onChange={(e) => {
            console.log(`📅 Input onChange: valor actual="${selectedDate}", nuevo valor="${e.target.value}"`);
            handleDateChange(e.target.value);
          }}
          min={getMinDate()}
          max={getMaxDate()}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          disabled={disabled}
        />
        {selectedDate && (
          <p className="mt-1 text-sm text-gray-600">
            Fecha seleccionada: {formatSantiagoDate(selectedDate, CHILE_DATE_OPTIONS)}
          </p>
        )}
      </div>

      {/* Selector de Horarios del Día */}
      {selectedDate && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            <FiClock className="inline w-4 h-4 mr-1" />
            Paso 2: Seleccionar Hora Disponible *
          </label>
          
          {isLoadingSlots && (
            <div className="flex items-center justify-center p-4 bg-blue-50 border border-blue-200 rounded-md">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600 mr-2"></div>
              <span className="text-sm text-blue-700">Cargando horarios disponibles...</span>
            </div>
          )}

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-md">
              <p className="text-sm text-red-700">❌ {error}</p>
            </div>
          )}

          {!isLoadingSlots && !error && availableSlots.length === 0 && (
            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-md">
              <p className="text-sm text-yellow-800">
                ⚠️ No hay horarios disponibles para <strong>{evaluatorName}</strong> en esta fecha.
                <br />Por favor seleccione otra fecha.
              </p>
            </div>
          )}

          {!isLoadingSlots && !error && availableSlots.length > 0 && (
            <div>
              <div className="mb-3">
                <p className="text-sm text-green-700">
                  ✅ {availableSlots.length} horario{availableSlots.length > 1 ? 's' : ''} disponible{availableSlots.length > 1 ? 's' : ''} 
                  para <strong>{evaluatorName}</strong>
                </p>
              </div>
              
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2">
                {availableSlots.map(time => (
                  <button
                    key={time}
                    onClick={() => handleTimeSelect(time)}
                    disabled={disabled}
                    className={`px-2 py-1 text-xs font-medium rounded border transition-colors ${
                      selectedTime === time
                        ? 'bg-blue-600 text-white border-blue-600'
                        : 'bg-white text-gray-700 border-gray-300 hover:bg-blue-50 hover:border-blue-300'
                    } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                  >
                    {time}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Confirmación de Selección */}
      {selectedDate && selectedTime && (
        <div className="p-3 bg-green-50 border border-green-200 rounded-md">
          <div className="flex items-start">
            <FiCheck className="w-4 h-4 text-green-600 mt-0.5 mr-2 flex-shrink-0" />
            <div>
              <p className="text-sm font-medium text-green-800">
                Horario Seleccionado:
              </p>
              <p className="text-sm text-green-700">
                📅 {formatSelectedDateTime()?.dateText}
                <br />
                🕐 {formatSelectedDateTime()?.timeText} hrs
                <br />
                👤 Evaluador: {evaluatorName}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Ayuda */}
      {!selectedDate && (
        <div className="p-3 bg-blue-50 border border-blue-200 rounded-md">
          <p className="text-sm text-blue-700">
            💡 Seleccione una fecha para ver los horarios disponibles del evaluador
          </p>
        </div>
      )}
    </div>
  );
};

export default DayScheduleSelector;