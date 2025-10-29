import React, { useState } from 'react';
import { professorAuthService } from '../services/professorAuthService';

const TestProfessorLogin: React.FC = () => {
    const [email, setEmail] = useState('alejandra.flores@mtn.cl');
    const [password, setPassword] = useState('12345678');
    const [result, setResult] = useState<string>('');
    const [isLoading, setIsLoading] = useState(false);

    const handleTestLogin = async () => {
        setIsLoading(true);
        setResult('');

        try {
            console.log('🧪 Probando login con:', { email, password });
            
            const response = await professorAuthService.login({ email, password });
            
            console.log('✅ Respuesta del login:', response);
            setResult(`✅ Login exitoso: ${JSON.stringify(response, null, 2)}`);
            
        } catch (error: any) {
            console.error('❌ Error en login:', error);
            setResult(`❌ Error: ${error.message}`);
        } finally {
            setIsLoading(false);
        }
    };

    const handleTestBackend = async () => {
        setIsLoading(true);
        setResult('');

        try {
            console.log('🧪 Probando conexión al backend...');
            
            const response = await fetch('http://localhost:8080/api/auth/check-email?email=alejandra.flores@mtn.cl');
            const data = await response.text();
            
            console.log('✅ Respuesta del backend:', data);
            setResult(`✅ Backend responde: ${data}`);
            
        } catch (error: any) {
            console.error('❌ Error conectando al backend:', error);
            setResult(`❌ Error de conexión: ${error.message}`);
        } finally {
            setIsLoading(false);
        }
        }

    return (
        <div className="p-6 max-w-md mx-auto bg-white rounded-lg shadow-md">
            <h2 className="text-xl font-bold mb-4">🧪 Prueba de Login del Profesor</h2>
            
            <div className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Email:
                    </label>
                    <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Email del profesor"
                    />
                </div>
                
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Contraseña:
                    </label>
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Contraseña"
                    />
                </div>
                
                <div className="flex space-x-2">
                    <button
                        onClick={handleTestLogin}
                        disabled={isLoading}
                        className="flex-1 bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 disabled:opacity-50"
                    >
                        {isLoading ? 'Probando...' : 'Probar Login'}
                    </button>
                    
                    <button
                        onClick={handleTestBackend}
                        disabled={isLoading}
                        className="flex-1 bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600 disabled:opacity-50"
                    >
                        {isLoading ? 'Probando...' : 'Probar Backend'}
                    </button>
                </div>
                
                {result && (
                    <div className="mt-4 p-3 bg-gray-100 rounded-md">
                        <pre className="text-sm text-gray-800 whitespace-pre-wrap">{result}</pre>
                    </div>
                )}
            </div>
        </div>
    );
};

export default TestProfessorLogin;





