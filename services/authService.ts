import api from './api';
import encryptionService from './encryptionService';

export interface LoginRequest {
    email: string;
    password: string;
}

export interface RegisterRequest {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    rut: string;
    phone?: string;
}

export interface AuthResponse {
    success: boolean;
    message: string;
    token?: string;
    email?: string;
    firstName?: string;
    lastName?: string;
    role?: string;
}

class AuthService {

    async login(request: LoginRequest): Promise<AuthResponse> {
        try {
            // Encrypt credentials before sending
            let payload: any;

            if (encryptionService.isEncryptionAvailable()) {
                console.log('[Auth] Attempting credential encryption...');
                const encryptedPayload = await encryptionService.encryptCredentials({
                    email: request.email,
                    password: request.password
                });

                if (encryptedPayload) {
                    console.log('[Auth] Credentials encrypted successfully');
                    payload = encryptedPayload;
                } else {
                    console.warn('[Auth] Backend encryption not available, using plaintext');
                    payload = request;
                }
            } else {
                console.warn('[Auth] Web Crypto API not available, using plaintext');
                payload = request;
            }

            const response = await api.post('/api/auth/login', payload);
            return response.data;
            
        } catch (error: any) {
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
    
    async register(request: RegisterRequest): Promise<AuthResponse> {
        try {
            // Encrypt ALL registration data before sending
            let payload: any;

            if (encryptionService.isEncryptionAvailable()) {
                console.log('[Auth] Attempting to encrypt registration data...');

                // Encrypt ALL fields together (not just email/password)
                const encryptedPayload = await encryptionService.encryptCredentials({
                    email: request.email,
                    password: request.password,
                    firstName: request.firstName,
                    lastName: request.lastName,
                    rut: request.rut,
                    phone: request.phone
                });

                if (encryptedPayload) {
                    payload = encryptedPayload;
                    console.log('[Auth] Registration data encrypted successfully');
                } else {
                    console.warn('[Auth] Backend encryption not available, using plaintext');
                    payload = request;
                }
            } else {
                console.warn('[Auth] Web Crypto API not available, using plaintext');
                payload = request;
            }

            const response = await api.post('/api/auth/register', payload);
            return response.data;
            
        } catch (error: any) {
            if (error.response?.status === 400) {
                const message = error.response?.data?.message || 'Datos de registro inválidos';
                throw new Error(message);
            } else if (error.response?.status === 409) {
                throw new Error('Ya existe un usuario con este email o RUT');
            } else if (error.response?.status === 500) {
                throw new Error('Error del servidor al crear la cuenta');
            }
            
            throw new Error('Error al crear la cuenta');
        }
    }
    
    async checkEmailExists(email: string): Promise<boolean> {
        try {
            const response = await api.get(`/api/auth/check-email?email=${encodeURIComponent(email)}`);
            return response.data;
            
        } catch (error: any) {
            return false;
        }
    }
    
    logout() {
        // Limpiar token del localStorage
        localStorage.removeItem('auth_token');
        localStorage.removeItem('authenticated_user');
    }
}

export const authService = new AuthService();