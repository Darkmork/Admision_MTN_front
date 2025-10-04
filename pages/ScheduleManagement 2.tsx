import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { interviewerScheduleService } from '../services/interviewerScheduleService';

interface TimeSlot {
  id: string;
  day: string;
  startTime: string;
  endTime: string;
  isAvailable: boolean;
  scheduleId?: number;
  scheduleType?: 'RECURRING' | 'SPECIFIC_DATE' | 'EXCEPTION';
  notes?: string;
}

const ScheduleManagement: React.FC = () => {
  const { user } = useAuth();
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');

  const daysOfWeek = [
    { display: 'Lunes', api: 'MONDAY' },
    { display: 'Martes', api: 'TUESDAY' },
    { display: 'Miércoles', api: 'WEDNESDAY' },
    { display: 'Jueves', api: 'THURSDAY' },
    { display: 'Viernes', api: 'FRIDAY' }
  ];

  const timeOptions = [
    '08:00', '08:30', '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
    '12:00', '12:30', '13:00', '13:30', '14:00', '14:30', '15:00', '15:30',
    '16:00', '16:30', '17:00', '17:30', '18:00'
  ];

  useEffect(() => {
    loadExistingSchedules();
  }, [user]);

  const loadExistingSchedules = async () => {
    if (!user?.id) return;

    setIsLoading(true);
    try {
      const currentYear = new Date().getFullYear();
      const schedules = await interviewerScheduleService.getInterviewerSchedulesByYear(user.id, currentYear);

      console.log('📅 Horarios cargados:', schedules);

      const transformedSlots: TimeSlot[] = schedules.map(schedule => ({
        id: `schedule-${schedule.id}`,
        day: translateDayToSpanish(schedule.dayOfWeek || ''),
        startTime: schedule.startTime,
        endTime: schedule.endTime,
        isAvailable: schedule.isActive,
        scheduleId: schedule.id,
        scheduleType: schedule.scheduleType,
        notes: schedule.notes
      }));

      setTimeSlots(transformedSlots);

      if (transformedSlots.length === 0) {
        initializeDefaultSlots();
      }

    } catch (error) {
      console.error('❌ Error cargando horarios:', error);
      setMessage('⚠️ Error al cargar horarios existentes. Creando horarios por defecto.');
      initializeDefaultSlots();
    } finally {
      setIsLoading(false);
    }
  };

  const translateDayToSpanish = (apiDay: string): string => {
    const dayMap: Record<string, string> = {
      'MONDAY': 'Lunes',
      'TUESDAY': 'Martes',
      'WEDNESDAY': 'Miércoles',
      'THURSDAY': 'Jueves',
      'FRIDAY': 'Viernes',
      'SATURDAY': 'Sábado',
      'SUNDAY': 'Domingo'
    };
    return dayMap[apiDay] || apiDay;
  };

  const translateDayToAPI = (spanishDay: string): string => {
    const dayMap: Record<string, string> = {
      'Lunes': 'MONDAY',
      'Martes': 'TUESDAY',
      'Miércoles': 'WEDNESDAY',
      'Jueves': 'THURSDAY',
      'Viernes': 'FRIDAY',
      'Sábado': 'SATURDAY',
      'Domingo': 'SUNDAY'
    };
    return dayMap[spanishDay] || spanishDay;
  };

  const initializeDefaultSlots = () => {
    const defaultSlots: TimeSlot[] = [];
    daysOfWeek.forEach(day => {
      // Morning slots
      defaultSlots.push({
        id: `${day.display}-morning`,
        day: day.display,
        startTime: '09:00',
        endTime: '12:00',
        isAvailable: false,
        scheduleType: 'RECURRING'
      });
      // Afternoon slots
      defaultSlots.push({
        id: `${day.display}-afternoon`,
        day: day.display,
        startTime: '14:00',
        endTime: '17:00',
        isAvailable: false,
        scheduleType: 'RECURRING'
      });
    });
    setTimeSlots(defaultSlots);
  };

  const handleSlotToggle = (slotId: string) => {
    setTimeSlots(prev => prev.map(slot => 
      slot.id === slotId ? { ...slot, isAvailable: !slot.isAvailable } : slot
    ));
  };

  const handleTimeChange = (slotId: string, field: 'startTime' | 'endTime', value: string) => {
    setTimeSlots(prev => prev.map(slot => 
      slot.id === slotId ? { ...slot, [field]: value } : slot
    ));
  };

  const handleSave = async () => {
    if (!user?.id) {
      setMessage('❌ Error: Usuario no identificado');
      return;
    }

    setIsLoading(true);
    try {
      const currentYear = new Date().getFullYear();
      const activeSlots = timeSlots.filter(slot => slot.isAvailable);

      console.log('💾 Guardando horarios activos:', activeSlots);

      // Delete existing schedules for this year first
      try {
        const existingSchedules = await interviewerScheduleService.getInterviewerSchedulesByYear(user.id, currentYear);
        for (const schedule of existingSchedules) {
          if (schedule.id) {
            await interviewerScheduleService.deleteSchedule(schedule.id);
          }
        }
      } catch (deleteError) {
        console.log('⚠️ No se encontraron horarios existentes para eliminar');
      }

      // Create new schedules for active slots
      const savedSchedules = [];
      for (const slot of activeSlots) {
        const scheduleData = {
          interviewer: {
            id: user.id,
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            role: user.role
          },
          dayOfWeek: translateDayToAPI(slot.day),
          startTime: slot.startTime,
          endTime: slot.endTime,
          year: currentYear,
          scheduleType: (slot.scheduleType || 'RECURRING') as 'RECURRING' | 'SPECIFIC_DATE' | 'EXCEPTION',
          isActive: true,
          notes: slot.notes || ''
        };

        try {
          const savedSchedule = await interviewerScheduleService.createSchedule(scheduleData);
          savedSchedules.push(savedSchedule);
          console.log('✅ Horario guardado:', savedSchedule);
        } catch (createError) {
          console.error('❌ Error creando horario individual:', createError);
        }
      }

      setMessage(`✅ Horarios guardados exitosamente (${savedSchedules.length} horarios activos)`);
      setTimeout(() => setMessage(''), 3000);

      // Reload schedules to reflect changes
      await loadExistingSchedules();

    } catch (error) {
      console.error('❌ Error guardando horarios:', error);
      setMessage('❌ Error al guardar los horarios');
      setTimeout(() => setMessage(''), 3000);
    } finally {
      setIsLoading(false);
    }
  };

  const addCustomSlot = () => {
    const newSlot: TimeSlot = {
      id: `custom-${Date.now()}`,
      day: 'Lunes',
      startTime: '09:00',
      endTime: '10:00',
      isAvailable: true,
      scheduleType: 'RECURRING'
    };
    setTimeSlots(prev => [...prev, newSlot]);
  };

  const removeSlot = (slotId: string) => {
    setTimeSlots(prev => prev.filter(slot => slot.id !== slotId));
  };

  if (!user || !['TEACHER', 'COORDINATOR', 'PSYCHOLOGIST', 'CYCLE_DIRECTOR'].includes(user.role)) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-md text-center">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Acceso Restringido</h2>
          <p className="text-gray-600">Esta página es solo para evaluadores del sistema.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Gestión de Horarios Disponibles
          </h1>
          <p className="text-gray-600">
            Configure sus horarios disponibles para entrevistas y evaluaciones.
            Los horarios que marque como disponibles serán visibles para la coordinación
            al momento de asignar entrevistas.
          </p>
          <div className="mt-4 p-4 bg-blue-50 rounded-lg">
            <p className="text-sm text-blue-800">
              <strong>Profesor:</strong> {user.firstName} {user.lastName} ({user.email})
            </p>
          </div>
        </div>

        {/* Message */}
        {message && (
          <div className="mb-6">
            <div className={`p-4 rounded-lg ${
              message.includes('✅') ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'
            }`}>
              {message}
            </div>
          </div>
        )}

        {/* Schedule Management */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-semibold text-gray-900">
              Horarios Semanales
            </h2>
            <button
              onClick={addCustomSlot}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              + Agregar Horario
            </button>
          </div>

          <div className="space-y-4">
            {timeSlots.map((slot) => (
              <div key={slot.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <input
                      type="checkbox"
                      checked={slot.isAvailable}
                      onChange={() => handleSlotToggle(slot.id)}
                      className="h-4 w-4 text-blue-600 rounded border-gray-300"
                    />
                    <div className="flex items-center space-x-2">
                      <select
                        value={slot.day}
                        onChange={(e) => setTimeSlots(prev => prev.map(s =>
                          s.id === slot.id ? { ...s, day: e.target.value } : s
                        ))}
                        className="border border-gray-300 rounded px-2 py-1"
                        disabled={!slot.isAvailable}
                      >
                        {daysOfWeek.map(day => (
                          <option key={day.display} value={day.display}>{day.display}</option>
                        ))}
                      </select>
                      <span className="text-gray-500">de</span>
                      <select
                        value={slot.startTime}
                        onChange={(e) => handleTimeChange(slot.id, 'startTime', e.target.value)}
                        className="border border-gray-300 rounded px-2 py-1"
                        disabled={!slot.isAvailable}
                      >
                        {timeOptions.map(time => (
                          <option key={time} value={time}>{time}</option>
                        ))}
                      </select>
                      <span className="text-gray-500">a</span>
                      <select
                        value={slot.endTime}
                        onChange={(e) => handleTimeChange(slot.id, 'endTime', e.target.value)}
                        className="border border-gray-300 rounded px-2 py-1"
                        disabled={!slot.isAvailable}
                      >
                        {timeOptions.map(time => (
                          <option key={time} value={time}>{time}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <button
                    onClick={() => removeSlot(slot.id)}
                    className="text-red-600 hover:text-red-800 transition-colors"
                  >
                    🗑️
                  </button>
                </div>
                {slot.isAvailable && (
                  <div className="mt-2 ml-8 text-sm text-green-600">
                    ✅ Disponible para entrevistas
                  </div>
                )}
              </div>
            ))}
          </div>

          {timeSlots.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              No hay horarios configurados. Haga clic en "Agregar Horario" para comenzar.
            </div>
          )}

          {/* Summary */}
          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <h3 className="font-semibold text-gray-900 mb-2">Resumen</h3>
            <p className="text-sm text-gray-600">
              Horarios disponibles: <strong>{timeSlots.filter(slot => slot.isAvailable).length}</strong>
            </p>
            <p className="text-sm text-gray-600">
              Total de horarios configurados: <strong>{timeSlots.length}</strong>
            </p>
          </div>

          {/* Action Buttons */}
          <div className="mt-6 flex justify-end space-x-4">
            <button
              onClick={initializeDefaultSlots}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Restablecer
            </button>
            <button
              onClick={handleSave}
              disabled={isLoading}
              className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
            >
              {isLoading ? 'Guardando...' : 'Guardar Horarios'}
            </button>
          </div>
        </div>

        {/* Help Section */}
        <div className="mt-6 bg-white rounded-lg shadow-md p-6">
          <h3 className="font-semibold text-gray-900 mb-2">💡 Ayuda</h3>
          <ul className="text-sm text-gray-600 space-y-1">
            <li>• Marque los horarios en los que está disponible para realizar entrevistas</li>
            <li>• Puede agregar horarios personalizados usando el botón "Agregar Horario"</li>
            <li>• Los horarios se guardan automáticamente y serán visibles para coordinación</li>
            <li>• Puede modificar o eliminar horarios en cualquier momento</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default ScheduleManagement;