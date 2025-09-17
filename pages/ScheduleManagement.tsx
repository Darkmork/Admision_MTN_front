import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

interface TimeSlot {
  id: string;
  day: string;
  startTime: string;
  endTime: string;
  isAvailable: boolean;
}

const ScheduleManagement: React.FC = () => {
  const { user } = useAuth();
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');

  const daysOfWeek = [
    'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes'
  ];

  const timeOptions = [
    '08:00', '08:30', '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
    '12:00', '12:30', '13:00', '13:30', '14:00', '14:30', '15:00', '15:30',
    '16:00', '16:30', '17:00', '17:30', '18:00'
  ];

  useEffect(() => {
    initializeDefaultSlots();
  }, []);

  const initializeDefaultSlots = () => {
    const defaultSlots: TimeSlot[] = [];
    daysOfWeek.forEach(day => {
      // Morning slots
      defaultSlots.push({
        id: `${day}-morning`,
        day,
        startTime: '09:00',
        endTime: '12:00',
        isAvailable: false
      });
      // Afternoon slots
      defaultSlots.push({
        id: `${day}-afternoon`,
        day,
        startTime: '14:00',
        endTime: '17:00',
        isAvailable: false
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
    setIsLoading(true);
    try {
      // Simulate API call - in real implementation, this would save to backend
      await new Promise(resolve => setTimeout(resolve, 1000));
      setMessage('✅ Horarios guardados exitosamente');
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
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
      isAvailable: true
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
                        onChange={(e) => handleTimeChange(slot.id, 'startTime', e.target.value)}
                        className="border border-gray-300 rounded px-2 py-1"
                        disabled={!slot.isAvailable}
                      >
                        {daysOfWeek.map(day => (
                          <option key={day} value={day}>{day}</option>
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