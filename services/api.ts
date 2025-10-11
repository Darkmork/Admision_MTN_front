import axios from 'axios';
import { csrfService } from './csrfService';
import { getApiBaseUrl } from '../config/api.config';

// Configuración base de axios - Using nginx gateway for microservices
// NO baseURL here - will be set in request interceptor for runtime detection
const api = axios.create({
    // baseURL will be set dynamically in the interceptor below
    timeout: 30000, // Aumentado a 30 segundos para consultas complejas
    headers: {
        'Content-Type': 'application/json',
    },
    withCredentials: true, // Required for CSRF cookie to be sent
});

// Función para verificar si es una ruta pública que no requiere autenticación
const isPublicRoute = (url: string): boolean => {
    const publicPaths = [
        '/api/auth/login',
        '/api/auth/register',
        '/api/auth/refresh',
        '/api/auth/public-key',
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

// Interceptor para agregar el token de autenticación y CSRF token
api.interceptors.request.use(
    async (config) => {
        // CRITICAL: Set baseURL at runtime for each request
        const runtimeBaseURL = getApiBaseUrl();

        // Build full URL if config.url is relative
        if (config.url && !config.url.startsWith('http')) {
            config.url = runtimeBaseURL + config.url;
        }

        const url = config.url || '';
        const isPublic = isPublicRoute(url);

        console.log(`📤 api.ts - Runtime baseURL: ${runtimeBaseURL}`);
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

        // Add CSRF token for POST, PUT, DELETE, PATCH requests
        const method = (config.method || 'get').toUpperCase();
        const needsCsrf = ['POST', 'PUT', 'DELETE', 'PATCH'].includes(method);

        // Skip CSRF token for CSRF token endpoint itself
        if (needsCsrf && !url.includes('/csrf-token')) {
            try {
                const csrfHeaders = await csrfService.getCsrfHeaders();
                config.headers['X-CSRF-Token'] = csrfHeaders['X-CSRF-Token'];
                console.log(`🛡️ Added CSRF token to ${method} request`);
            } catch (error) {
                console.error('❌ Failed to get CSRF token:', error);
                // Continue without CSRF token - backend will reject the request
            }
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
            
            // Si es 401, limpiar la sesión correspondiente y redirigir
            if (error.response.status === 401) {
                console.warn('🔐 JWT token expired or invalid - cleaning session');

                // Limpiar token de usuario regular
                localStorage.removeItem('auth_token');
                localStorage.removeItem('authenticated_user');

                // Limpiar token de profesor
                localStorage.removeItem('professor_token');
                localStorage.removeItem('professor_user');
                localStorage.removeItem('currentProfessor');

                // Solo redirigir si no estamos ya en una página de login o si no es una ruta pública
                const currentPath = window.location.pathname;
                const isLoginPage = currentPath.includes('/login') || currentPath === '/';
                const requestUrl = error.config?.url || '';
                const isPublicRoute = requestUrl.includes('/public/') ||
                                     requestUrl.includes('/api/auth/login') ||
                                     requestUrl.includes('/api/auth/register');

                if (!isLoginPage && !isPublicRoute) {
                    console.warn('🔄 Redirecting to login due to expired token');
                    // Usar setTimeout para evitar problemas con el contexto de React
                    setTimeout(() => {
                        if (currentPath.includes('/admin') || currentPath.includes('/profesor')) {
                            window.location.href = '/admin/login';
                        } else {
                            window.location.href = '/login';
                        }
                    }, 100);
                }
            }

            // Si es 403, puede ser un CSRF token inválido
            if (error.response.status === 403) {
                const errorMessage = error.response.data?.error || '';
                if (errorMessage.toLowerCase().includes('csrf') || errorMessage.toLowerCase().includes('invalid token')) {
                    console.warn('🛡️ CSRF token invalid or missing - clearing token');
                    csrfService.clearToken();
                    // El próximo request automáticamente obtendrá un nuevo token
                }
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