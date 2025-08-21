import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import { LogoIcon, UserIcon } from '../components/icons/Icons';
import { useFormValidation } from '../hooks/useFormValidation';
import { useNotifications } from '../context/AppContext';
import { professorAuthService } from '../services/professorAuthService';

const ProfessorLoginPage: React.FC = () => {
    const navigate = useNavigate();
    const { addNotification } = useNotifications();
    const [isLoggingIn, setIsLoggingIn] = useState(false);

    const validationConfig = {
        email: { 
            required: true, 
            email: true,
            custom: (value: string) => {
                if (!value.includes('@mtn.cl')) {
                    return 'Debe usar un email institucional (@mtn.cl)';
                }
                return null;
            }
        },
        password: { required: true, minLength: 6 }
    };

    const { data, errors, updateField, touchField, validateForm } = useFormValidation(
        validationConfig,
        { email: '', password: '' }
    );

    const handleLogin = async () => {
        if (!validateForm()) {
            addNotification({
                type: 'error',
                title: 'Error de validación',
                message: 'Por favor completa todos los campos correctamente'
            });
            return;
        }

        setIsLoggingIn(true);

        try {
            console.log('🔐 Iniciando login para profesor:', data.email);
            
            // Usar el servicio de autenticación real
            const response = await professorAuthService.login({
                email: data.email,
                password: data.password
            });

            if (response.success && response.token) {
                // Verificar que el rol sea de profesor
                if (response.role && professorAuthService.isProfessorRole(response.role)) {
                    
                    // Guardar información del profesor en localStorage para compatibilidad
                    localStorage.setItem('currentProfessor', JSON.stringify({
                        id: response.id || 26, // Usar ID real del backend o fallback
                        firstName: response.firstName || '',
                        lastName: response.lastName || '',
                        email: response.email || '',
                        subjects: getSubjectsByRole(response.role),
                        assignedGrades: ['prekinder', 'kinder', '1basico', '2basico', '3basico', '4basico', '5basico', '6basico', '7basico', '8basico', '1medio', '2medio', '3medio', '4medio'],
                        department: getDepartmentByRole(response.role),
                        isAdmin: response.role === 'ADMIN'
                    }));

                    addNotification({
                        type: 'success',
                        title: 'Bienvenido/a',
                        message: `Hola ${response.firstName} ${response.lastName}`
                    });

                    console.log('✅ Login exitoso, redirigiendo al dashboard...');
                    
                    // ✅ Redirigir según el rol del usuario
                    if (response.role === 'ADMIN') {
                        console.log('🔑 Usuario admin detectado, redirigiendo al panel de administración...');
                        navigate('/admin');
                    } else {
                        console.log('👨‍🏫 Usuario profesor detectado, redirigiendo al dashboard de profesor...');
                        navigate('/profesor');
                    }
                    
                } else {
                    addNotification({
                        type: 'error',
                        title: 'Acceso denegado',
                        message: 'Este portal es solo para profesores y personal del colegio'
                    });
                }
            } else {
                addNotification({
                    type: 'error',
                    title: 'Error de autenticación',
                    message: response.message || 'Error al iniciar sesión'
                });
            }
        } catch (error: any) {
            console.error('❌ Error en login:', error);
            addNotification({
                type: 'error',
                title: 'Error del sistema',
                message: error.message || 'No se pudo procesar el login. Intenta nuevamente.'
            });
        } finally {
            setIsLoggingIn(false);
        }
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            handleLogin();
        }
    };

    // Función para obtener las asignaturas según el rol
    const getSubjectsByRole = (role: string): string[] => {
        switch (role) {
            // Administración
            case 'ADMIN':
                return ['MATH', 'SPANISH', 'ENGLISH', 'SCIENCE', 'HISTORY', 'PSYCHOLOGY'];
            
            // Profesores ciclo inicial (pueden evaluar todo en su ciclo)
            case 'TEACHER_EARLY_CYCLE':
                return ['MATH', 'SPANISH'];
            
            // Profesores básica por asignatura
            case 'TEACHER_LANGUAGE_BASIC':
                return ['SPANISH'];
            case 'TEACHER_MATHEMATICS_BASIC':
                return ['MATH'];
            case 'TEACHER_ENGLISH_BASIC':
                return ['ENGLISH'];
            case 'TEACHER_SCIENCE_BASIC':
                return ['SCIENCE'];
            case 'TEACHER_HISTORY_BASIC':
                return ['HISTORY'];
            
            // Profesores media por asignatura
            case 'TEACHER_LANGUAGE_HIGH':
                return ['SPANISH'];
            case 'TEACHER_MATHEMATICS_HIGH':
                return ['MATH'];
            case 'TEACHER_ENGLISH_HIGH':
                return ['ENGLISH'];
            case 'TEACHER_SCIENCE_HIGH':
                return ['SCIENCE'];
            case 'TEACHER_HISTORY_HIGH':
                return ['HISTORY'];
            
            // Coordinadores (acceso a su área en todos los niveles)
            case 'COORDINATOR_LANGUAGE':
                return ['SPANISH'];
            case 'COORDINATOR_MATHEMATICS':
                return ['MATH'];
            case 'COORDINATOR_ENGLISH':
                return ['ENGLISH'];
            case 'COORDINATOR_SCIENCE':
                return ['SCIENCE'];
            case 'COORDINATOR_HISTORY':
                return ['HISTORY'];
            
            // Especialistas
            case 'CYCLE_DIRECTOR':
                return ['MATH', 'SPANISH', 'ENGLISH', 'SCIENCE', 'HISTORY'];
            case 'PSYCHOLOGIST':
                return ['PSYCHOLOGY'];
            
            // Legacy roles
            case 'TEACHER_MATHEMATICS':
                return ['MATH'];
            case 'TEACHER_LANGUAGE':
                return ['SPANISH'];
            case 'TEACHER_ENGLISH':
                return ['ENGLISH'];
            
            default:
                return [];
        }
    };

    // Función para obtener el departamento según el rol
    const getDepartmentByRole = (role: string): string => {
        switch (role) {
            // Administración
            case 'ADMIN':
                return 'Administración';
            
            // Profesores ciclo inicial
            case 'TEACHER_EARLY_CYCLE':
                return 'Educación Inicial (K-2°)';
            
            // Profesores básica
            case 'TEACHER_LANGUAGE_BASIC':
                return 'Lenguaje y Comunicación (3°-7°)';
            case 'TEACHER_MATHEMATICS_BASIC':
                return 'Matemática (3°-7°)';
            case 'TEACHER_ENGLISH_BASIC':
                return 'Inglés (3°-7°)';
            case 'TEACHER_SCIENCE_BASIC':
                return 'Ciencias Naturales (3°-7°)';
            case 'TEACHER_HISTORY_BASIC':
                return 'Historia y Geografía (3°-7°)';
            
            // Profesores media
            case 'TEACHER_LANGUAGE_HIGH':
                return 'Lenguaje y Comunicación (8°-IV)';
            case 'TEACHER_MATHEMATICS_HIGH':
                return 'Matemática (8°-IV)';
            case 'TEACHER_ENGLISH_HIGH':
                return 'Inglés (8°-IV)';
            case 'TEACHER_SCIENCE_HIGH':
                return 'Ciencias Naturales (8°-IV)';
            case 'TEACHER_HISTORY_HIGH':
                return 'Historia y Geografía (8°-IV)';
            
            // Coordinadores
            case 'COORDINATOR_LANGUAGE':
                return 'Coordinación de Lenguaje';
            case 'COORDINATOR_MATHEMATICS':
                return 'Coordinación de Matemática';
            case 'COORDINATOR_ENGLISH':
                return 'Coordinación de Inglés';
            case 'COORDINATOR_SCIENCE':
                return 'Coordinación de Ciencias';
            case 'COORDINATOR_HISTORY':
                return 'Coordinación de Historia';
            
            // Especialistas
            case 'CYCLE_DIRECTOR':
                return 'Dirección de Ciclo';
            case 'PSYCHOLOGIST':
                return 'Psicología';
            
            // Legacy roles
            case 'TEACHER_MATHEMATICS':
                return 'Matemática (Sistema Anterior)';
            case 'TEACHER_LANGUAGE':
                return 'Lenguaje y Comunicación (Sistema Anterior)';
            case 'TEACHER_ENGLISH':
                return 'Inglés (Sistema Anterior)';
            
            default:
                return 'General';
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-azul-monte-tabor via-blue-700 to-blue-900 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-8">
                {/* Logo y Header */}
                <div className="text-center">
                    <div className="mx-auto flex justify-center">
                        <LogoIcon className="w-32 h-32" />
                    </div>
                    <h2 className="mt-6 text-3xl font-bold text-blanco-pureza">
                        Portal de Profesores
                    </h2>
                    <p className="mt-2 text-sm text-blue-200">
                        Sistema de Evaluación de Exámenes de Admisión
                    </p>
                </div>

                {/* Formulario de Login */}
                <Card className="p-8 bg-blanco-pureza">
                    <div className="space-y-6">
                        <div className="text-center">
                            <UserIcon className="mx-auto h-12 w-12 text-azul-monte-tabor mb-4" />
                            <h3 className="text-lg font-semibold text-azul-monte-tabor">
                                Iniciar Sesión
                            </h3>
                        </div>

                        <div className="space-y-4">
                            <Input
                                id="email"
                                label="Email Institucional"
                                type="email"
                                value={data.email}
                                onChange={(e) => updateField('email', e.target.value)}
                                onBlur={() => touchField('email')}
                                onKeyPress={handleKeyPress}
                                error={errors.email}
                                placeholder="nombre@mtn.cl"
                                isRequired
                            />

                            <Input
                                id="password"
                                label="Contraseña"
                                type="password"
                                value={data.password}
                                onChange={(e) => updateField('password', e.target.value)}
                                onBlur={() => touchField('password')}
                                onKeyPress={handleKeyPress}
                                error={errors.password}
                                placeholder="Ingresa tu contraseña"
                                isRequired
                            />
                        </div>

                        <Button
                            variant="primary"
                            onClick={handleLogin}
                            isLoading={isLoggingIn}
                            loadingText="Verificando..."
                            className="w-full"
                        >
                            Iniciar Sesión
                        </Button>



                        <div className="text-center pt-4 border-t border-gray-200">
                            <button
                                onClick={() => navigate('/')}
                                className="text-sm text-azul-monte-tabor hover:text-blue-800 transition-colors"
                            >
                                ← Volver al Portal Principal
                            </button>
                        </div>
                    </div>
                </Card>


            </div>
        </div>
    );
};

export default ProfessorLoginPage;