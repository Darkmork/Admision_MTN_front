import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import Input from '../components/ui/Input';
import RutInput from '../components/ui/RutInput';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import EmailVerification from '../components/ui/EmailVerification';
import { LogoIcon } from '../components/icons/Icons';
import { useAuth } from '../context/AuthContext';

const ApoderadoLogin: React.FC = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [showRegister, setShowRegister] = useState(false);
    const [isEmailVerified, setIsEmailVerified] = useState(false);
    
    // Campos para registro
    const [registerData, setRegisterData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        password: '',
        confirmPassword: '',
        phone: '',
        rut: ''
    });
    
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const { login, register } = useAuth();
    
    const redirectTo = searchParams.get('redirect') || '/dashboard-apoderado';

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        try {
            // Simulando autenticación
            if (email && password) {
                console.log('🔐 ApoderadoLogin: Attempting login with:', { email, password: password.length + ' chars' });
                await login(email, password, 'apoderado');
                console.log('✅ ApoderadoLogin: Login successful, navigating to:', redirectTo);
                navigate(redirectTo);
            } else {
                console.warn('⚠️ ApoderadoLogin: Missing email or password');
                setError('Por favor complete todos los campos');
            }
        } catch (err) {
            console.error('❌ ApoderadoLogin: Login failed:', err);
            setError('Credenciales inválidas. Verifique su email y contraseña.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        // Validar verificación de email
        if (!isEmailVerified) {
            setError('Debe verificar su dirección de correo electrónico antes de continuar');
            setIsLoading(false);
            return;
        }

        // Validaciones
        if (registerData.password !== registerData.confirmPassword) {
            setError('Las contraseñas no coinciden');
            setIsLoading(false);
            return;
        }

        if (registerData.password.length < 6) {
            setError('La contraseña debe tener al menos 6 caracteres');
            setIsLoading(false);
            return;
        }

        try {
            await register(registerData, 'apoderado');
            // Para usuarios nuevos registrados, redirigir al formulario de postulación
            // no al dashboard directamente
            navigate('/postulacion');
        } catch (err) {
            setError('Error al crear la cuenta. Intente nuevamente.');
        } finally {
            setIsLoading(false);
        }
    };

    const updateRegisterField = (field: string, value: string) => {
        setRegisterData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-8">
                {/* Header */}
                <div className="text-center">
                    <div className="flex justify-center mb-8">
                        <LogoIcon className="w-32 h-32" />
                    </div>
                    <h2 className="text-3xl font-bold text-azul-monte-tabor">
                        {showRegister ? 'Crear Cuenta para Postular' : 'Acceso de Apoderados'}
                    </h2>
                    <p className="mt-2 text-gris-piedra">
                        {showRegister 
                            ? 'Cree su cuenta para iniciar el proceso de postulación de su hijo/a'
                            : 'Ingrese a su cuenta para continuar con la postulación o acceder a su dashboard'
                        }
                    </p>
                </div>

                <Card className="p-8">
                    {!showRegister ? (
                        // Formulario de Login
                        <form onSubmit={handleLogin} className="space-y-6">
                            {error && (
                                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                                    {error}
                                </div>
                            )}

                            <Input
                                id="email"
                                label="Correo Electrónico"
                                type="email"
                                placeholder="apoderado@ejemplo.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                isRequired
                            />

                            <Input
                                id="password"
                                label="Contraseña"
                                type="password"
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                isRequired
                                showPasswordToggle
                            />

                            <Button
                                type="submit"
                                variant="primary"
                                size="lg"
                                isLoading={isLoading}
                                loadingText="Iniciando sesión..."
                                className="w-full"
                            >
                                Iniciar Sesión
                            </Button>

                            <div className="text-center">
                                <button
                                    type="button"
                                    onClick={() => setShowRegister(true)}
                                    className="text-azul-monte-tabor hover:underline"
                                >
                                    ¿Primera vez? Crear cuenta para postular
                                </button>
                            </div>
                        </form>
                    ) : (
                        // Formulario de Registro
                        <form onSubmit={handleRegister} className="space-y-4">
                            {error && (
                                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                                    {error}
                                </div>
                            )}

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <Input
                                    id="firstName"
                                    label="Nombres"
                                    placeholder="Juan Carlos"
                                    value={registerData.firstName}
                                    onChange={(e) => updateRegisterField('firstName', e.target.value)}
                                    isRequired
                                />
                                <Input
                                    id="lastName"
                                    label="Apellidos"
                                    placeholder="Pérez González"
                                    value={registerData.lastName}
                                    onChange={(e) => updateRegisterField('lastName', e.target.value)}
                                    isRequired
                                />
                            </div>

                            <RutInput
                                name="rut"
                                label="RUT"
                                placeholder="12.345.678-9"
                                value={registerData.rut}
                                onChange={(value) => updateRegisterField('rut', value)}
                                required
                            />

                            <EmailVerification
                                email={registerData.email}
                                rut={registerData.rut}
                                onEmailChange={(email) => updateRegisterField('email', email)}
                                onVerificationComplete={setIsEmailVerified}
                                placeholder="apoderado@ejemplo.com"
                                isRequired
                            />

                            <Input
                                id="phone"
                                label="Teléfono"
                                type="tel"
                                placeholder="+569 1234 5678"
                                value={registerData.phone}
                                onChange={(e) => updateRegisterField('phone', e.target.value)}
                                isRequired
                            />

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <Input
                                    id="password-register"
                                    label="Contraseña"
                                    type="password"
                                    placeholder="••••••••"
                                    value={registerData.password}
                                    onChange={(e) => updateRegisterField('password', e.target.value)}
                                    isRequired
                                    showPasswordToggle
                                />
                                <Input
                                    id="confirmPassword"
                                    label="Confirmar Contraseña"
                                    type="password"
                                    placeholder="••••••••"
                                    value={registerData.confirmPassword}
                                    onChange={(e) => updateRegisterField('confirmPassword', e.target.value)}
                                    isRequired
                                    showPasswordToggle
                                />
                            </div>

                            <div className="flex gap-4">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => setShowRegister(false)}
                                    className="flex-1"
                                >
                                    Volver al Login
                                </Button>
                                <Button
                                    type="submit"
                                    variant="primary"
                                    isLoading={isLoading}
                                    loadingText="Creando cuenta..."
                                    disabled={!isEmailVerified || isLoading}
                                    className="flex-1"
                                >
                                    {isEmailVerified ? 'Crear Cuenta' : 'Verificar Email Primero'}
                                </Button>
                            </div>
                        </form>
                    )}

                    <div className="mt-6 pt-6 border-t border-gray-200">
                        <div className="text-center">
                            <Link 
                                to="/" 
                                className="text-azul-monte-tabor hover:underline"
                            >
                                ← Volver al inicio
                            </Link>
                        </div>
                    </div>
                </Card>

                {/* Información adicional */}
                <div className="text-center text-sm text-gris-piedra">
                    <p>¿Problemas para acceder?</p>
                    <p>Contacte a admisiones: <a href="mailto:admisiones@mtn.cl" className="text-azul-monte-tabor hover:underline">admisiones@mtn.cl</a></p>
                </div>
            </div>
        </div>
    );
};

export default ApoderadoLogin;