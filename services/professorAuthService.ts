import api from './api';
import encryptionService from './encryptionService';

export interface ProfessorLoginRequest {
    email: string;
    password: string;
}

export interface ProfessorAuthResponse {
    success: boolean;
    message: string;
    token?: string;
    id?: number;
    email?: string;
    firstName?: string;
    lastName?: string;
    role?: string;
    subject?: string;
}

export interface ProfessorUser {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
    role: string;
    subject?: string;
    active: boolean;
    emailVerified: boolean;
}

class ProfessorAuthService {

    async login(request: ProfessorLoginRequest): Promise<ProfessorAuthResponse> {
        try {
            console.log('🔐 Intentando login de profesor:', request.email);

            // Encrypt credentials before sending
            let payload: any;

            if (encryptionService.isEncryptionAvailable()) {
                console.log('[Professor Auth] Attempting credential encryption...');
                const encryptedPayload = await encryptionService.encryptCredentials({
                    email: request.email,
                    password: request.password
                });

                if (encryptedPayload) {
                    console.log('[Professor Auth] Credentials encrypted successfully');
                    payload = encryptedPayload;
                } else {
                    console.warn('[Professor Auth] Backend encryption not available, using plaintext');
                    payload = request;
                }
            } else {
                console.warn('[Professor Auth] Web Crypto API not available, using plaintext');
                payload = request;
            }

            const response = await api.post('/api/auth/login', payload);
            const data = response.data;
            
            console.log('✅ Login exitoso para profesor:', data);
            
            // Guardar token en localStorage
            if (data.token) {
                localStorage.setItem('professor_token', data.token);
                localStorage.setItem('professor_user', JSON.stringify({
                    email: data.email,
                    firstName: data.firstName,
                    lastName: data.lastName,
                    role: data.role,
                    subject: data.subject
                }));
            }
            
            return data;
            
        } catch (error: any) {
            console.error('❌ Error en login de profesor:', error);
            
            if (error.response?.status === 401) {
                throw new Error('Credenciales inválidas');
            } else if (error.response?.status === 400) {
                throw new Error('Datos de login inválidos');
            } else if (error.response?.status === 500) {
                throw new Error('Error del servidor');
            }
            
            throw new Error('Error al iniciar sesión');
        }
    }
    
    async getCurrentProfessor(): Promise<ProfessorUser | null> {
        try {
            const token = localStorage.getItem('professor_token');
            if (!token) {
                return null;
            }

            // Configurar el token en el header
            const config = {
                headers: { Authorization: `Bearer ${token}` }
            };

            const response = await api.get('/api/users/me', config);
            // El backend retorna { success: true, user: {...} }
            return response.data.user || response.data;

        } catch (error: any) {
            console.error('❌ Error obteniendo profesor actual:', error);
            // Si hay error de autenticación, limpiar datos
            if (error.response?.status === 401) {
                this.logout();
            }
            return null;
        }
    }
    
    isAuthenticated(): boolean {
        const token = localStorage.getItem('professor_token');
        return !!token;
    }
    
    getStoredProfessor() {
        const stored = localStorage.getItem('professor_user');
        return stored ? JSON.parse(stored) : null;
    }
    
    logout() {
        localStorage.removeItem('professor_token');
        localStorage.removeItem('professor_user');
        localStorage.removeItem('currentProfessor');
    }
    
    // Método para verificar si el usuario es un profesor válido
    isProfessorRole(role: string): boolean {
        const professorRoles = [
            // Administración
            'ADMIN',
            
            // Roles del backend (actuales)
            'TEACHER',
            'COORDINATOR',
            'CYCLE_DIRECTOR',
            'PSYCHOLOGIST',
            
            // Profesores por ciclo (legacy/específicos)
            'TEACHER_EARLY_CYCLE',
            
            // Profesores básica (3° a 7°)
            'TEACHER_LANGUAGE_BASIC',
            'TEACHER_MATHEMATICS_BASIC',
            'TEACHER_ENGLISH_BASIC',
            'TEACHER_SCIENCE_BASIC',
            'TEACHER_HISTORY_BASIC',
            
            // Profesores media (8° a IV)
            'TEACHER_LANGUAGE_HIGH',
            'TEACHER_MATHEMATICS_HIGH',
            'TEACHER_ENGLISH_HIGH',
            'TEACHER_SCIENCE_HIGH',
            'TEACHER_HISTORY_HIGH',
            
            // Coordinadores específicos
            'COORDINATOR_LANGUAGE',
            'COORDINATOR_MATHEMATICS',
            'COORDINATOR_ENGLISH',
            'COORDINATOR_SCIENCE',
            'COORDINATOR_HISTORY',
            
            // Legacy roles (compatibilidad)
            'TEACHER_LANGUAGE',
            'TEACHER_MATHEMATICS', 
            'TEACHER_ENGLISH'
        ];
        return professorRoles.includes(role);
    }
}

export const professorAuthService = new ProfessorAuthService();
