import React, { useState, useEffect } from 'react';
import Button from '../ui/Button';
import LoadingSpinner from '../ui/LoadingSpinner';
import { interviewerScheduleService, InterviewerSchedule } from '../../services/interviewerScheduleService';

interface WeeklyCalendarProps {
  userId: number;
  userRole: string;
  onScheduleChange?: () => void;
}

interface TimeSlot {
  hour: number;
  isSelected: boolean;
  hasSchedule: boolean;
  scheduleId?: number;
}

interface DaySchedule {
  [key: string]: TimeSlot; // key is "08", "09", etc.
}

interface WeeklySchedule {
  MONDAY: DaySchedule;
  TUESDAY: DaySchedule;
  WEDNESDAY: DaySchedule;
  THURSDAY: DaySchedule;
  FRIDAY: DaySchedule;
}

const WeeklyCalendar: React.FC<WeeklyCalendarProps> = ({ 
  userId, 
  userRole, 
  onScheduleChange 
}) => {
  
  const [schedule, setSchedule] = useState<WeeklySchedule>({
    MONDAY: {},
    TUESDAY: {},
    WEDNESDAY: {},
    THURSDAY: {},
    FRIDAY: {}
  });
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  // Horarios de 8 AM a 4 PM
  const hours = Array.from({length: 8}, (_, i) => i + 8); // [8, 9, 10, 11, 12, 13, 14, 15]
  const days = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY'];
  const dayLabels = {
    MONDAY: 'Lunes',
    TUESDAY: 'Martes', 
    WEDNESDAY: 'Miércoles',
    THURSDAY: 'Jueves',
    FRIDAY: 'Viernes'
  };

  // Inicializar el calendario vacío
  const initializeEmptySchedule = (): WeeklySchedule => {
    const emptySchedule: WeeklySchedule = {
      MONDAY: {},
      TUESDAY: {},
      WEDNESDAY: {},
      THURSDAY: {},
      FRIDAY: {}
    };

    days.forEach(day => {
      hours.forEach(hour => {
        const hourStr = hour.toString().padStart(2, '0');
        emptySchedule[day as keyof WeeklySchedule][hourStr] = {
          hour,
          isSelected: false,
          hasSchedule: false
        };
      });
    });

    return emptySchedule;
  };

  // Cargar horarios existentes
  const loadSchedules = async () => {
    try {
      setLoading(true);
      const schedules = await interviewerScheduleService.getInterviewerSchedulesByYear(userId, 2025);
      
      // Inicializar calendario vacío
      const newSchedule = initializeEmptySchedule();
      
      // Marcar horarios existentes
      schedules.forEach((schedule: InterviewerSchedule) => {
        if (schedule.dayOfWeek && schedule.scheduleType === 'RECURRING') {
          const startHour = parseInt(schedule.startTime.split(':')[0]);
          const endHour = parseInt(schedule.endTime.split(':')[0]);
          
          // Marcar todas las horas del rango como ocupadas (solo dentro del rango 8-15)
          for (let hour = startHour; hour < endHour; hour++) {
            if (hour >= 8 && hour <= 15) { // Solo horas dentro del rango del calendario
              const hourStr = hour.toString().padStart(2, '0');
              if (newSchedule[schedule.dayOfWeek as keyof WeeklySchedule][hourStr]) {
                newSchedule[schedule.dayOfWeek as keyof WeeklySchedule][hourStr] = {
                  hour,
                  isSelected: false,
                  hasSchedule: true,
                  scheduleId: schedule.id
                };
              }
            }
          }
        }
      });
      
      setSchedule(newSchedule);
    } catch (error) {
      console.error('Error loading schedules:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (userId) {
      loadSchedules();
    } else {
      setSchedule(initializeEmptySchedule());
      setLoading(false);
    }
  }, [userId]);

  // Alternar selección de hora
  const toggleTimeSlot = (day: string, hourStr: string) => {
    setSchedule(prev => {
      // Crear copia profunda para evitar mutaciones
      const newSchedule = JSON.parse(JSON.stringify(prev)) as WeeklySchedule;
      const currentSlot = newSchedule[day as keyof WeeklySchedule][hourStr];
      
      // Si ya tiene horario guardado, lo marcamos para eliminación
      if (currentSlot.hasSchedule) {
        newSchedule[day as keyof WeeklySchedule][hourStr] = {
          ...currentSlot,
          hasSchedule: false,
          isSelected: false
        };
      } else {
        // Alternar selección normal
        newSchedule[day as keyof WeeklySchedule][hourStr] = {
          ...currentSlot,
          isSelected: !currentSlot.isSelected
        };
      }
      
      setHasChanges(true);
      return newSchedule;
    });
  };

  // Obtener horas seleccionadas para un día
  const getSelectedHours = (day: string): number[] => {
    const daySchedule = schedule[day as keyof WeeklySchedule];
    return Object.values(daySchedule)
      .filter(slot => slot.isSelected)
      .map(slot => slot.hour)
      .sort((a, b) => a - b);
  };

  // Guardar cambios
  const saveSchedules = async () => {
    try {
      setSaving(true);
      
      // 1. Primero eliminar todos los horarios existentes del usuario
      const existingSchedules = await interviewerScheduleService.getInterviewerSchedulesByYear(userId, 2025);
      for (const existingSchedule of existingSchedules) {
        if (existingSchedule.id) {
          await interviewerScheduleService.deleteSchedule(existingSchedule.id);
        }
      }
      
      // 2. Luego crear los nuevos horarios basados en la selección
      for (const day of days) {
        const selectedHours = getSelectedHours(day);
        
        if (selectedHours.length === 0) continue;
        
        // Agrupar horas consecutivas en rangos
        const ranges: Array<{start: number, end: number}> = [];
        let currentRange: {start: number, end: number} | null = null;
        
        for (const hour of selectedHours) {
          if (!currentRange) {
            currentRange = { start: hour, end: hour + 1 };
          } else if (hour === currentRange.end) {
            currentRange.end = hour + 1;
          } else {
            ranges.push(currentRange);
            currentRange = { start: hour, end: hour + 1 };
          }
        }
        
        if (currentRange) {
          ranges.push(currentRange);
        }
        
        // Crear horarios para cada rango
        for (const range of ranges) {
          const scheduleData = {
            interviewer: { id: userId },
            dayOfWeek: day,
            startTime: `${range.start.toString().padStart(2, '0')}:00`,
            endTime: `${range.end.toString().padStart(2, '0')}:00`,
            scheduleType: 'RECURRING' as const,
            year: 2025,
            isActive: true,
            notes: 'Horario configurado desde calendario semanal'
          };
          
          await interviewerScheduleService.createSchedule(scheduleData);
        }
      }
      
      // 3. Recargar horarios
      await loadSchedules();
      setHasChanges(false);
      
      if (onScheduleChange) {
        onScheduleChange();
      }
      
    } catch (error) {
      console.error('Error saving schedules:', error);
      alert('Error al guardar los horarios. Por favor, inténtalo nuevamente.');
    } finally {
      setSaving(false);
    }
  };

  // Formatear hora para mostrar
  const formatHour = (hour: number): string => {
    if (hour === 12) return '12 PM';
    if (hour > 12) return `${hour - 12} PM`;
    return `${hour} AM`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <LoadingSpinner />
        <span className="ml-2">Cargando horarios...</span>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border shadow-sm p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">
            📅 Horarios Disponibles para Entrevistas
          </h3>
          <p className="text-sm text-gray-600 mt-1">
            Haz click en las casillas para marcar tus horarios disponibles (8 AM - 4 PM)
          </p>
        </div>
        
        {hasChanges && (
          <Button
            onClick={saveSchedules}
            disabled={saving}
            style={{
              backgroundColor: '#3b82f6',
              color: 'white',
              padding: '8px 16px',
              borderRadius: '4px',
              border: 'none',
              cursor: saving ? 'not-allowed' : 'pointer',
              opacity: saving ? 0.6 : 1
            }}
          >
            {saving ? '💾 Guardando...' : '💾 Guardar Cambios'}
          </Button>
        )}
      </div>

      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr>
              <th className="border border-gray-300 bg-gray-50 p-3 text-left font-medium text-gray-700">
                Hora
              </th>
              {days.map(day => (
                <th key={day} className="border border-gray-300 bg-gray-50 p-3 text-center font-medium text-gray-700">
                  {dayLabels[day as keyof typeof dayLabels]}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {hours.map(hour => {
              const hourStr = hour.toString().padStart(2, '0');
              return (
                <tr key={hour}>
                  <td className="border border-gray-300 bg-gray-50 p-3 font-medium text-gray-700 text-center">
                    {formatHour(hour)}
                  </td>
                  {days.map(day => {
                    const slot = schedule[day as keyof WeeklySchedule][hourStr];
                    const isSelected = slot?.isSelected;
                    const hasSchedule = slot?.hasSchedule;
                    
                    
                    return (
                      <td key={`${day}-${hourStr}`} className="border border-gray-300 p-1">
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            toggleTimeSlot(day, hourStr);
                          }}
                          style={{
                            width: '100%',
                            height: '48px',
                            borderRadius: '4px',
                            fontSize: '14px',
                            fontWeight: '500',
                            border: '2px solid #333',
                            cursor: 'pointer',
                            backgroundColor: hasSchedule 
                              ? '#22c55e' 
                              : isSelected
                                ? '#3b82f6'
                                : '#f3f4f6',
                            color: hasSchedule || isSelected ? 'white' : '#6b7280'
                          }}
                          title={
                            hasSchedule 
                              ? 'Click para eliminar horario guardado' 
                              : isSelected 
                                ? 'Click para quitar' 
                                : 'Click para agregar'
                          }
                        >
                          {hasSchedule ? '✅' : isSelected ? '🕐' : ''}
                        </button>
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="mt-4 flex items-center gap-6 text-sm text-gray-600">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-gray-100 border rounded"></div>
          <span>Disponible para marcar</span>
        </div>
        <div className="flex items-center gap-2">
          <div style={{
            width: '16px',
            height: '16px',
            backgroundColor: '#3b82f6',
            borderRadius: '4px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            fontSize: '12px'
          }}>🕐</div>
          <span>Seleccionado (sin guardar)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-green-500 rounded flex items-center justify-center text-white text-xs">✅</div>
          <span>Horario guardado (click para eliminar)</span>
        </div>
      </div>

      {hasChanges && (
        <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
          <p className="text-sm text-yellow-800">
            ⚠️ Tienes cambios sin guardar. Haz click en "Guardar Cambios" para aplicarlos.
          </p>
        </div>
      )}
    </div>
  );
};

export default WeeklyCalendar;