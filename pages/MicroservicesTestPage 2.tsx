import React from 'react';
import MicroservicesDashboard from '../components/admin/MicroservicesDashboard';

const MicroservicesTestPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">🏗️ Dashboard de Microservicios - Página de Prueba</h1>
          <p className="text-gray-600">
            Esta página permite probar directamente el dashboard de microservicios sin autenticación.
          </p>
          <div className="mt-4 space-x-4">
            <a 
              href="/admin/login" 
              className="text-blue-600 hover:text-blue-800 underline"
            >
              👤 Ir al Login Admin
            </a>
            <a 
              href="/admin" 
              className="text-blue-600 hover:text-blue-800 underline"
            >
              🏠 Ir al Dashboard Admin
            </a>
            <a 
              href="/microservices-test.html" 
              className="text-blue-600 hover:text-blue-800 underline"
            >
              🧪 Test Simple HTML
            </a>
          </div>
        </div>

        {/* Dashboard de Microservicios */}
        <MicroservicesDashboard />

        {/* Información adicional */}
        <div className="mt-8 bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">ℹ️ Información de la Implementación</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-semibold text-green-800 mb-2">✅ Backend Funcionando</h3>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Spring Boot en puerto 8080</li>
                <li>• 4 microservicios simulados</li>
                <li>• API Gateway simulado</li>
                <li>• Endpoints de prueba activos</li>
                <li>• CORS configurado correctamente</li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-blue-800 mb-2">🎯 Frontend Integrado</h3>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• React dashboard en puerto 5176</li>
                <li>• MicroservicesDashboard componente</li>
                <li>• MicroservicesService configurado</li>
                <li>• Integración con AdminDashboard</li>
                <li>• Sección "🏗️ Microservicios" disponible</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Test rápido */}
        <div className="mt-8 bg-blue-50 p-6 rounded-lg border border-blue-200">
          <h2 className="text-xl font-semibold text-blue-800 mb-4">🚀 Test Rápido</h2>
          <p className="text-blue-700 mb-4">
            Haz clic en los botones del dashboard arriba para probar:
          </p>
          <div className="grid md:grid-cols-2 gap-4 text-sm">
            <div>
              <div className="font-semibold text-blue-800 mb-2">🔄 Actualizar:</div>
              <div className="text-blue-700">Recarga el estado de todos los servicios</div>
            </div>
            <div>
              <div className="font-semibold text-blue-800 mb-2">🧪 Probar Microservicio:</div>
              <div className="text-blue-700">Ejecuta tests completos de funcionalidad</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MicroservicesTestPage;