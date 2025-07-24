import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import { LogoIcon, UserIcon } from '../components/icons/Icons';
import { useFormValidation } from '../hooks/useFormValidation';
import { useNotifications } from '../context/AppContext';
import { mockProfessors } from '../services/professorMockData';

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
            // Simular verificación de login
            await new Promise(resolve => setTimeout(resolve, 1500));

            // Buscar profesor en datos mock
            const professor = mockProfessors.find(p => 
                p.email === data.email && 
                p.password === data.password &&
                p.isActive
            );

            if (professor) {
                // Guardar información del profesor en localStorage
                localStorage.setItem('currentProfessor', JSON.stringify({
                    id: professor.id,
                    firstName: professor.firstName,
                    lastName: professor.lastName,
                    email: professor.email,
                    subjects: professor.subjects,
                    assignedGrades: professor.assignedGrades,
                    department: professor.department
                }));

                addNotification({
                    type: 'success',
                    title: 'Bienvenido/a',
                    message: `Hola ${professor.firstName} ${professor.lastName}`
                });

                navigate('/profesor');
            } else {
                addNotification({
                    type: 'error',
                    title: 'Error de autenticación',
                    message: 'Email o contraseña incorrectos'
                });
            }
        } catch (error) {
            addNotification({
                type: 'error',
                title: 'Error del sistema',
                message: 'No se pudo procesar el login. Intenta nuevamente.'
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

    return (
        <div className="min-h-screen bg-gradient-to-br from-azul-monte-tabor via-blue-700 to-blue-900 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-8">
                {/* Logo y Header */}
                <div className="text-center">
                    <div className="mx-auto flex justify-center">
                        <LogoIcon />
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

                        {/* Información de demo */}
                        <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                            <h4 className="text-sm font-semibold text-azul-monte-tabor mb-2">
                                Credenciales de Demostración:
                            </h4>
                            <div className="text-xs text-gris-piedra space-y-1">
                                <p><strong>Email:</strong> jorge.gangale@mtn.cl</p>
                                <p><strong>Contraseña:</strong> profesor123</p>
                                <p className="mt-2 text-blue-600">
                                    <strong>Niveles asignados:</strong> 8° Básico a IV° Medio (Matemática)
                                </p>
                                <p className="mt-1 text-yellow-600">
                                    <strong>⭐ Permisos de Administrador</strong>
                                </p>
                            </div>
                        </div>

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

                {/* Lista de profesores disponibles para demo */}
                <Card className="p-6 bg-blanco-pureza bg-opacity-95">
                    <h4 className="text-sm font-bold text-azul-monte-tabor mb-3">
                        Otros Profesores Disponibles:
                    </h4>
                    <div className="space-y-2 text-xs text-gris-piedra">
                        <div>
                            <p><strong>Carlos Ruiz:</strong> carlos.ruiz@mtn.cl</p>
                            <p className="text-blue-600">Lenguaje - PK a 3° Básico</p>
                        </div>
                        <div>
                            <p><strong>Jennifer Thompson:</strong> jennifer.thompson@mtn.cl</p>
                            <p className="text-blue-600">Inglés - PK a 4° Básico</p>
                        </div>
                        <div>
                            <p><strong>María González:</strong> maria.gonzalez@mtn.cl</p>
                            <p className="text-blue-600">Matemática - PK a 2° Básico</p>
                        </div>
                        <p className="mt-2 text-center text-blue-700">
                            <strong>Contraseña para todos:</strong> profesor123
                        </p>
                    </div>
                </Card>
            </div>
        </div>
    );
};

export default ProfessorLoginPage;