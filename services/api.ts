import axios from 'axios';

// Configuración base de axios
const api = axios.create({
    baseURL: 'http://localhost:8080',
    timeout: 30000, // Aumentado a 30 segundos para consultas complejas
    headers: {
        'Content-Type': 'application/json',
    },
});

// Función para verificar si es una ruta pública que no requiere autenticación
const isPublicRoute = (url: string): boolean => {
    const publicPaths = [
        '/api/auth/login',
        '/api/auth/register',
        '/api/auth/refresh',
        '/api/email/',
        '/api/usuario-auth/',
        '/api/public/',
        '/api/applications/public/',
        '/api/documents/public/',
        '/api/schedules/public/',
        '/api/evaluations/public/',
        '/api/rut/'
    ];
    
    return publicPaths.some(path => url.includes(path));
};

// Interceptor para agregar el token de autenticación
api.interceptors.request.use(
    (config) => {
        const url = config.url || '';
        const isPublic = isPublicRoute(url);
        
        console.log(`🔍 API Request: ${url} - Is Public: ${isPublic}`);
        
        // Solo agregar token de autenticación si NO es una ruta pública
        if (!isPublic) {
            // Intentar obtener token de usuario regular
            let token = localStorage.getItem('auth_token');
            
            // Si no hay token de usuario regular, intentar con token de profesor
            if (!token) {
                token = localStorage.getItem('professor_token');
            }
            
            if (token) {
                config.headers.Authorization = `Bearer ${token}`;
                console.log(`🔑 Added auth token for private route`);
            } else {
                console.log(`❓ No token found for private route`);
            }
        } else {
            console.log(`🌐 Public route - no auth required`);
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Interceptor para manejar errores
api.interceptors.response.use(
    (response) => response,
    (error) => {
        console.error('API Error:', error);
        
        if (error.response) {
            // El servidor respondió con un código de estado fuera del rango 2xx
            console.error('Error response:', error.response.data);
            console.error('Error status:', error.response.status);
            console.error('Error headers:', error.response.headers);
            console.error('Request data:', error.config.data);
            
            // Si es 401, limpiar la sesión correspondiente
            if (error.response.status === 401) {
                // Limpiar token de usuario regular
                localStorage.removeItem('auth_token');
                localStorage.removeItem('authenticated_user');
                
                // Limpiar token de profesor
                localStorage.removeItem('professor_token');
                localStorage.removeItem('professor_user');
                localStorage.removeItem('currentProfessor');
            }
        } else if (error.request) {
            // La petición fue hecha pero no se recibió respuesta
            console.error('No response received:', error.request);
        } else {
            // Algo pasó al configurar la petición
            console.error('Request setup error:', error.message);
        }
        
        return Promise.reject(error);
    }
);

export default api; 