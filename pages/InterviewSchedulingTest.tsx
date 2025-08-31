import React, { useState } from 'react';
import AvailableInterviewersSelector from '../components/interviews/AvailableInterviewersSelector';

const InterviewSchedulingTest: React.FC = () => {
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [selectedInterviewerId, setSelectedInterviewerId] = useState(0);

  const timeSlots = [
    '08:00', '08:30', '09:00', '09:30', '10:00', '10:30',
    '11:00', '11:30', '12:00', '12:30', '13:00', '13:30',
    '14:00', '14:30', '15:00', '15:30', '16:00'
  ];

  // Obtener fecha mínima (hoy)
  const today = new Date().toISOString().split('T')[0];
  
  // Obtener fecha máxima (3 meses adelante)
  const maxDate = new Date();
  maxDate.setMonth(maxDate.getMonth() + 3);
  const maxDateStr = maxDate.toISOString().split('T')[0];

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              🧪 Prueba de Sistema de Horarios de Entrevistas
            </h1>
            <p className="text-gray-600">
              Selecciona una fecha y hora para ver qué entrevistadores están disponibles según sus horarios configurados.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6 mb-6">
            {/* Selector de fecha */}
            <div className="space-y-2">
              <label htmlFor="date" className="block text-sm font-medium text-gray-700">
                📅 Fecha de la entrevista
              </label>
              <input
                type="date"
                id="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                min={today}
                max={maxDateStr}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {/* Selector de hora */}
            <div className="space-y-2">
              <label htmlFor="time" className="block text-sm font-medium text-gray-700">
                🕐 Hora de la entrevista
              </label>
              <select
                id="time"
                value={selectedTime}
                onChange={(e) => setSelectedTime(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Selecciona una hora</option>
                {timeSlots.map(time => (
                  <option key={time} value={time}>
                    {time}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Selector de entrevistadores disponibles */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              👥 Entrevistadores Disponibles
            </h3>
            <AvailableInterviewersSelector
              selectedDate={selectedDate}
              selectedTime={selectedTime}
              selectedInterviewerId={selectedInterviewerId}
              onInterviewerSelect={setSelectedInterviewerId}
            />
          </div>

          {/* Resumen de selección */}
          {selectedDate && selectedTime && selectedInterviewerId > 0 && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-semibold text-blue-900 mb-2">📋 Resumen de la Entrevista</h4>
              <div className="text-sm text-blue-800 space-y-1">
                <p><strong>Fecha:</strong> {new Date(selectedDate).toLocaleDateString('es-CL', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}</p>
                <p><strong>Hora:</strong> {selectedTime}</p>
                <p><strong>Entrevistador ID:</strong> {selectedInterviewerId}</p>
              </div>
            </div>
          )}

          {/* Información de horarios configurados */}
          <div className="mt-8 bg-gray-50 border border-gray-200 rounded-lg p-4">
            <h4 className="font-semibold text-gray-900 mb-3">ℹ️ Horarios Configurados en el Sistema</h4>
            <div className="text-sm text-gray-700 space-y-2">
              <div><strong>Test Admin (ID 100):</strong> Lunes 9-11, Miércoles 14-16, Viernes 10-12</div>
              <div><strong>Carlos Morales (ID 104):</strong> Martes 9-12, Jueves 13-16</div>
              <div><strong>Ana Rivera (ID 105):</strong> Lunes 10-12, Miércoles 15-16, Viernes 9-11</div>
              <div><strong>Elena Castro (ID 106):</strong> Miércoles 8-12, Viernes 13-15</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InterviewSchedulingTest;