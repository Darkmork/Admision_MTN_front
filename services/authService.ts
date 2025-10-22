import api from './api';
import { encryptCredentials, getCachedPublicKey, isEncryptionSupported } from '../utils/crypto';
import { getApiBaseUrl } from '../config/api.config';

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
            // Check if browser supports encryption
            if (!isEncryptionSupported()) {
                console.warn('[Auth] Web Crypto API not supported, falling back to HTTPS only');
                const response = await api.post('/api/auth/login', request);
                return response.data;
            }

            try {
                // Fetch public key via API Gateway (not directly from user service)
                const API_GATEWAY_URL = getApiBaseUrl();
                console.log('[Auth] Using API Gateway URL:', API_GATEWAY_URL);
                const publicKeyInfo = await getCachedPublicKey(API_GATEWAY_URL);

                console.log('[Auth] Encrypting credentials with RSA + AES...');

                // Encrypt credentials
                const encryptedPayload = await encryptCredentials(request, publicKeyInfo);

                console.log('[Auth] Sending encrypted credentials to backend');

                // Send encrypted payload
                const response = await api.post('/api/auth/login', encryptedPayload);
                return response.data;

            } catch (encryptError) {
                // If encryption fails, fall back to HTTPS only
                console.warn('[Auth] Encryption failed, falling back to HTTPS only:', encryptError);
                const response = await api.post('/api/auth/login', request);
                return response.data;
            }

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
            // Check if browser supports encryption
            if (!isEncryptionSupported()) {
                console.warn('[Auth] Web Crypto API not supported, falling back to HTTPS only');
                const response = await api.post('/api/auth/register', request);
                return response.data;
            }

            try {
                // Fetch public key via API Gateway (not directly from user service)
                const API_GATEWAY_URL = getApiBaseUrl();
                console.log('[Auth] Using API Gateway URL:', API_GATEWAY_URL);
                const publicKeyInfo = await getCachedPublicKey(API_GATEWAY_URL);

                console.log('[Auth] Encrypting registration data with RSA + AES...');

                // Encrypt registration data
                const encryptedPayload = await encryptCredentials(request, publicKeyInfo);

                console.log('[Auth] Sending encrypted registration data to backend');

                // Send encrypted payload
                const response = await api.post('/api/auth/register', encryptedPayload);
                return response.data;

            } catch (encryptError) {
                // If encryption fails, fall back to HTTPS only
                console.warn('[Auth] Encryption failed, falling back to HTTPS only:', encryptError);
                const response = await api.post('/api/auth/register', request);
                return response.data;
            }

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