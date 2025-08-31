import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { authService } from '../services/authService';

interface User {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    role: 'APODERADO' | 'ADMIN' | 'TEACHER' | 'COORDINATOR' | 'CYCLE_DIRECTOR' | 'PSYCHOLOGIST' | 'TEACHER_LANGUAGE' | 'TEACHER_MATHEMATICS' | 'TEACHER_ENGLISH';
    phone?: string;
    rut?: string;
}

interface AuthContextType {
    user: User | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    login: (email: string, password: string, role: string) => Promise<void>;
    register: (userData: any, role: string) => Promise<void>;
    logout: () => void;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
    children: ReactNode;
}

// Helper function to map backend roles to frontend roles
const mapBackendRole = (backendRole: string): User['role'] => {
    switch (backendRole) {
        case 'ADMIN':
            return 'ADMIN';
        case 'APODERADO':
            return 'APODERADO';
        case 'TEACHER':
            return 'TEACHER'; // Keep generic teacher role
        case 'COORDINATOR':
            return 'COORDINATOR';
        case 'CYCLE_DIRECTOR':
            return 'CYCLE_DIRECTOR';
        case 'PSYCHOLOGIST':
            return 'PSYCHOLOGIST';
        // Legacy specific teacher roles (if still used)
        case 'TEACHER_LANGUAGE':
            return 'TEACHER_LANGUAGE';
        case 'TEACHER_MATHEMATICS':
            return 'TEACHER_MATHEMATICS';
        case 'TEACHER_ENGLISH':
            return 'TEACHER_ENGLISH';
        default:
            console.warn(`Unknown backend role: ${backendRole}, defaulting to TEACHER`);
            return 'TEACHER';
    }
};

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        // Verificar si hay una sesión guardada al cargar la app
        const savedUser = localStorage.getItem('authenticated_user');
        if (savedUser) {
            try {
                setUser(JSON.parse(savedUser));
            } catch (error) {
                console.error('Error parsing saved user:', error);
                localStorage.removeItem('authenticated_user');
            }
        }
        setIsLoading(false);
    }, []);

    const login = async (email: string, password: string, role: string) => {
        setIsLoading(true);
        
        try {
            console.log('🚀 AuthContext: Attempting login for:', email);
            const response = await authService.login({ email, password });
            console.log('📥 AuthContext: Backend response:', response);
            
            if (response.success && response.token && response.email) {
                console.log('✅ AuthContext: Login successful, saving token and user data');
                const userData: User = {
                    id: Date.now().toString(), // Temporal, el backend debería devolver el ID
                    email: response.email,
                    firstName: response.firstName,
                    lastName: response.lastName,
                    role: mapBackendRole(response.role || 'TEACHER')
                };
                
                // ✅ Si es admin, también configurar información de profesor para compatibilidad
                if (userData.role === 'ADMIN') {
                    localStorage.setItem('currentProfessor', JSON.stringify({
                        id: response.id || 26,
                        firstName: response.firstName || '',
                        lastName: response.lastName || '',
                        email: response.email || '',
                        subjects: ['MATH', 'SPANISH', 'ENGLISH', 'PSYCHOLOGY'],
                        assignedGrades: ['prekinder', 'kinder', '1basico', '2basico', '3basico', '4basico', '5basico', '6basico', '7basico', '8basico', '1medio', '2medio', '3medio', '4medio'],
                        department: 'Administración',
                        isAdmin: true
                    }));
                    
                    // También guardar el token de profesor para el sistema de evaluaciones
                    localStorage.setItem('professor_token', response.token);
                    localStorage.setItem('professor_user', JSON.stringify({
                        email: response.email,
                        firstName: response.firstName,
                        lastName: response.lastName,
                        role: response.role
                    }));
                }
                
                // Guardar token y usuario
                localStorage.setItem('auth_token', response.token);
                localStorage.setItem('authenticated_user', JSON.stringify(userData));
                console.log('💾 AuthContext: Token and user saved to localStorage');
                setUser(userData);
                console.log('👤 AuthContext: User set in state, login complete');
            } else {
                console.error('❌ AuthContext: Login response missing required fields:', response);
                throw new Error(response.message || 'Error en la autenticación');
            }
        } catch (error: any) {
            console.error('❌ AuthContext: Login error:', error);
            throw new Error(error.message || 'Error en la autenticación');
        } finally {
            setIsLoading(false);
        }
    };

    const register = async (userData: any, role: string) => {
        setIsLoading(true);
        
        try {
            const response = await authService.register({
                firstName: userData.firstName,
                lastName: userData.lastName,
                email: userData.email,
                password: userData.password,
                rut: userData.rut,
                phone: userData.phone
            });
            
            if (response.success && response.token && response.email) {
                const newUser: User = {
                    id: Date.now().toString(), // Temporal, el backend debería devolver el ID
                    email: response.email,
                    firstName: response.firstName,
                    lastName: response.lastName,
                    role: mapBackendRole(response.role || 'APODERADO'),
                    phone: userData.phone,
                    rut: userData.rut
                };
                
                // Guardar token y usuario
                localStorage.setItem('auth_token', response.token);
                localStorage.setItem('authenticated_user', JSON.stringify(newUser));
                setUser(newUser);
            } else {
                throw new Error(response.message || 'Error al crear la cuenta');
            }
        } catch (error: any) {
            throw new Error(error.message || 'Error al crear la cuenta');
        } finally {
            setIsLoading(false);
        }
    };

    const logout = () => {
        authService.logout();
        // ✅ También limpiar datos de profesor/admin
        localStorage.removeItem('currentProfessor');
        localStorage.removeItem('professor_token');
        localStorage.removeItem('professor_user');
        setUser(null);
    };

    const value: AuthContextType = {
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        register,
        logout
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth debe ser usado dentro de un AuthProvider');
    }
    return context;
};