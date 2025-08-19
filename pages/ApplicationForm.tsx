import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Input from '../components/ui/Input';
import RutInput from '../components/ui/RutInput';
import Select from '../components/ui/Select';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import EmailVerification from '../components/ui/EmailVerification';
import { CheckCircleIcon, LogoIcon, UploadIcon } from '../components/icons/Icons';
import { useApplications, useNotifications } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import { educationalLevels } from '../services/examMockData';
import api from '../services/api';
import { applicationService } from '../services/applicationService';
import { documentService, DOCUMENT_TYPES } from '../services/documentService';

const steps = [
  "Datos del Postulante",
  "Datos de los Padres",
  "Sostenedor",
  "Apoderado",
  "Documentación",
  "Confirmación"
];

const gradeOptions = educationalLevels.map(level => ({
    value: level.value,
    label: level.label
}));

const validationConfig = {
    firstName: { required: true, minLength: 2 },
    lastName: { required: true, minLength: 2 },
    rut: { required: true, minLength: 9 },
    birthDate: { required: true },
    grade: { required: true },
    studentEmail: { email: true },
    studentAddress: { required: true, minLength: 5 },
    currentSchool: { minLength: 2 }, // Será requerido condicionalmente
    parent1Name: { required: true, minLength: 2 },
    parent1Email: { required: true, email: true },
    parent1Phone: { required: true, pattern: /^[+]?[\d\s-]{8,}$/ },
    parent1Rut: { required: true, minLength: 9 },
    parent1Address: { required: true, minLength: 5 },
    parent1Profession: { required: true, minLength: 2 },
    parent2Name: { required: true, minLength: 2 },
    parent2Email: { required: true, email: true },
    parent2Phone: { required: true, pattern: /^[+]?[\d\s-]{8,}$/ },
    parent2Rut: { required: true, minLength: 9 },
    parent2Address: { required: true, minLength: 5 },
    parent2Profession: { required: true, minLength: 2 },
    supporterName: { required: true, minLength: 2 },
    supporterEmail: { required: true, email: true },
    supporterPhone: { required: true, pattern: /^[+]?[\d\s-]{8,}$/ },
    supporterRut: { required: true, minLength: 9 },
    supporterRelation: { required: true },
    guardianName: { required: true, minLength: 2 },
    guardianEmail: { required: true, email: true },
    guardianPhone: { required: true, pattern: /^[+]?[\d\s-]{8,}$/ },
    guardianRut: { required: true, minLength: 9 },
    guardianRelation: { required: true }
};

const ApplicationForm: React.FC = () => {
    const [currentStep, setCurrentStep] = useState(0);
    const [accountCreated, setAccountCreated] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showVerification, setShowVerification] = useState(false);
    const [verificationEmail, setVerificationEmail] = useState('');
    const [isVerifying, setIsVerifying] = useState(false);
    const [verificationCode, setVerificationCode] = useState('');
    const [verificationError, setVerificationError] = useState('');
    const [showAuthForm, setShowAuthForm] = useState(true);
    const [showRegister, setShowRegister] = useState(false);
    const [authLoading, setAuthLoading] = useState(false);
    const [authError, setAuthError] = useState('');
    const [submittedApplicationId, setSubmittedApplicationId] = useState<number | null>(null);
    const [uploadedDocuments, setUploadedDocuments] = useState<Map<string, File>>(new Map());
    
    const { addApplication } = useApplications();
    const { addNotification } = useNotifications();
    const { user, isAuthenticated, login, register } = useAuth();
    
    // Estado del formulario simplificado
    const [data, setData] = useState<any>({});
    const [errors, setErrors] = useState<any>({});
    
    // Estado para autenticación
    const [authData, setAuthData] = useState({
        email: '',
        password: '',
        firstName: '',
        lastName: '',
        phone: '',
        rut: '',
        confirmPassword: ''
    });
    
    // Estado para verificación de email
    const [isEmailVerified, setIsEmailVerified] = useState(false);
    
    // Helper function to update fields
    const updateField = useCallback((name: string, value: any) => {
        setData(prev => ({ ...prev, [name]: value }));
    }, []);
    
    // Helper function to touch fields (placeholder)
    const touchField = useCallback((name: string) => {
        // Simple placeholder for now
    }, []);
    
    // Función para actualizar datos de autenticación
    const updateAuthField = useCallback((name: string, value: string) => {
        setAuthData(prev => ({ ...prev, [name]: value }));
    }, []);
    
    // Función para manejar login
    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setAuthLoading(true);
        setAuthError('');

        try {
            await login(authData.email, authData.password, 'apoderado');
            setShowAuthForm(false);
            // Pre-llenar el formulario con datos del usuario si están disponibles
            if (user) {
                updateField('parent1Email', user.email);
                updateField('parent1Name', `${user.firstName} ${user.lastName}`);
                updateField('parent1Phone', user.phone || '');
                updateField('parent1Rut', user.rut || '');
            }
        } catch (err) {
            setAuthError('Credenciales inválidas. Verifique su email y contraseña.');
        } finally {
            setAuthLoading(false);
        }
    };

    // Función para manejar registro
    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        setAuthLoading(true);
        setAuthError('');

        // Validar verificación de email
        if (!isEmailVerified) {
            setAuthError('Debe verificar su dirección de correo electrónico antes de continuar');
            setAuthLoading(false);
            return;
        }

        // Validaciones
        if (authData.password !== authData.confirmPassword) {
            setAuthError('Las contraseñas no coinciden');
            setAuthLoading(false);
            return;
        }

        if (authData.password.length < 6) {
            setAuthError('La contraseña debe tener al menos 6 caracteres');
            setAuthLoading(false);
            return;
        }

        try {
            await register(authData, 'apoderado');
            setShowAuthForm(false);
            // Pre-llenar el formulario con datos del usuario
            updateField('parent1Email', authData.email);
            updateField('parent1Name', `${authData.firstName} ${authData.lastName}`);
            updateField('parent1Phone', authData.phone);
            updateField('parent1Rut', authData.rut);
        } catch (err) {
            setAuthError('Error al crear la cuenta. Intente nuevamente.');
        } finally {
            setAuthLoading(false);
        }
    };
    
    // Verificar si el usuario ya está autenticado
    useEffect(() => {
        if (isAuthenticated && user) {
            setShowAuthForm(false);
            // Pre-llenar algunos campos con datos del usuario
            updateField('parent1Email', user.email);
            updateField('parent1Name', `${user.firstName} ${user.lastName}`);
            updateField('parent1Phone', user.phone || '');
            updateField('parent1Rut', user.rut || '');
        }
    }, [isAuthenticated, user]);
    
    // Helper function to check if current school is required
    const requiresCurrentSchool = useCallback((grade: string): boolean => {
        const schoolRequiredGrades = [
            '2basico', '3basico', '4basico', '5basico', '6basico', '7basico', '8basico',
            '1medio', '2medio', '3medio', '4medio'
        ];
        return schoolRequiredGrades.includes(grade);
    }, []);

    // Helper function to auto-fill data when parent is selected
    const handleParentRelationChange = useCallback((field: string, value: string, type: 'supporter' | 'guardian') => {
        updateField(`${type}Relation`, value);
        
        if (value === 'padre') {
            // Auto-fill with father's data
            updateField(`${type}Name`, data.parent1Name || '');
            updateField(`${type}Email`, data.parent1Email || '');
            updateField(`${type}Phone`, data.parent1Phone || '');
            updateField(`${type}Rut`, data.parent1Rut || '');
        } else if (value === 'madre') {
            // Auto-fill with mother's data
            updateField(`${type}Name`, data.parent2Name || '');
            updateField(`${type}Email`, data.parent2Email || '');
            updateField(`${type}Phone`, data.parent2Phone || '');
            updateField(`${type}Rut`, data.parent2Rut || '');
        } else {
            // Clear fields for other relationships
            updateField(`${type}Name`, '');
            updateField(`${type}Email`, '');
            updateField(`${type}Phone`, '');
            updateField(`${type}Rut`, '');
        }
    }, [data.parent1Name, data.parent1Email, data.parent1Phone, data.parent1Rut, data.parent2Name, data.parent2Email, data.parent2Phone, data.parent2Rut, updateField]);

    const validateCurrentStep = useCallback((): boolean => {
        // Email validation helper
        const isValidEmail = (email: string): boolean => {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            return emailRegex.test(email);
        };

        // Phone validation helper
        const isValidPhone = (phone: string): boolean => {
            const phoneRegex = /^[+]?[\d\s-]{8,}$/;
            return phoneRegex.test(phone);
        };

        // Validation by step
        switch (currentStep) {
            case 0:
                // Validate postulant data
                if (!data.firstName?.trim() || !data.lastName?.trim() || !data.rut?.trim() || 
                    !data.birthDate || !data.grade || !data.studentAddress?.trim()) {
                    return false;
                }
                // Check for school if required
                if (requiresCurrentSchool(data.grade || '') && !data.currentSchool?.trim()) {
                    return false;
                }
                // Validate optional email if provided
                if (data.studentEmail && !isValidEmail(data.studentEmail)) {
                    return false;
                }
                return true;
                
            case 1:
                // Validate both parents data
                if (!data.parent1Name?.trim() || !data.parent1Email?.trim() || !data.parent1Phone?.trim() ||
                    !data.parent1Rut?.trim() || !data.parent1Address?.trim() || !data.parent1Profession?.trim() ||
                    !data.parent2Name?.trim() || !data.parent2Email?.trim() || !data.parent2Phone?.trim() ||
                    !data.parent2Rut?.trim() || !data.parent2Address?.trim() || !data.parent2Profession?.trim()) {
                    return false;
                }
                // Validate email formats
                if (!isValidEmail(data.parent1Email || '') || !isValidEmail(data.parent2Email || '')) {
                    return false;
                }
                // Validate phone formats
                if (!isValidPhone(data.parent1Phone || '') || !isValidPhone(data.parent2Phone || '')) {
                    return false;
                }
                return true;
                
            case 2:
                // Validate supporter data
                if (!data.supporterName?.trim() || !data.supporterEmail?.trim() || !data.supporterPhone?.trim() ||
                    !data.supporterRut?.trim() || !data.supporterRelation) {
                    return false;
                }
                // Validate email and phone formats
                if (!isValidEmail(data.supporterEmail || '') || !isValidPhone(data.supporterPhone || '')) {
                    return false;
                }
                return true;
                
            case 3:
                // Validate guardian data
                if (!data.guardianName?.trim() || !data.guardianEmail?.trim() || !data.guardianPhone?.trim() ||
                    !data.guardianRut?.trim() || !data.guardianRelation) {
                    return false;
                }
                // Validate email and phone formats
                if (!isValidEmail(data.guardianEmail || '') || !isValidPhone(data.guardianPhone || '')) {
                    return false;
                }
                return true;
                
            default:
                return true;
        }
    }, [data, currentStep, requiresCurrentSchool]);

    const getStepFields = useCallback((step: number): string[] => {
        switch (step) {
            case 0: return ['firstName', 'lastName', 'rut', 'birthDate', 'grade', 'studentAddress'];
            case 1: return ['parent1Name', 'parent1Email', 'parent1Phone', 'parent1Rut', 'parent1Address', 'parent1Profession', 'parent2Name', 'parent2Email', 'parent2Phone', 'parent2Rut', 'parent2Address', 'parent2Profession'];
            case 2: return ['supporterName', 'supporterEmail', 'supporterPhone', 'supporterRut', 'supporterRelation'];
            case 3: return ['guardianName', 'guardianEmail', 'guardianPhone', 'guardianRut', 'guardianRelation'];
            case 4: return []; // Document upload step
            case 5: return []; // Confirmation step
            default: return [];
        }
    }, []);

    const nextStep = async () => {
        if (validateCurrentStep()) {
            const nextStepIndex = currentStep + 1;
            
            // Si es el último paso (documentos), enviar la postulación
            if (currentStep === 4) {
                setIsSubmitting(true);
                try {
                    // Preparar datos para la API
                    const applicationRequest = {
                        // Datos del estudiante
                        firstName: data.firstName,
                        lastName: data.lastName,
                        rut: data.rut,
                        birthDate: data.birthDate,
                        studentEmail: data.studentEmail,
                        studentAddress: data.studentAddress,
                        grade: data.grade,
                        currentSchool: data.currentSchool,
                        additionalNotes: data.additionalNotes,

                        // Datos del padre
                        parent1Name: data.parent1Name,
                        parent1Rut: data.parent1Rut,
                        parent1Email: data.parent1Email,
                        parent1Phone: data.parent1Phone,
                        parent1Address: data.parent1Address,
                        parent1Profession: data.parent1Profession,

                        // Datos de la madre
                        parent2Name: data.parent2Name,
                        parent2Rut: data.parent2Rut,
                        parent2Email: data.parent2Email,
                        parent2Phone: data.parent2Phone,
                        parent2Address: data.parent2Address,
                        parent2Profession: data.parent2Profession,

                        // Datos del sostenedor
                        supporterName: data.supporterName,
                        supporterRut: data.supporterRut,
                        supporterEmail: data.supporterEmail,
                        supporterPhone: data.supporterPhone,
                        supporterRelation: data.supporterRelation,

                        // Datos del apoderado
                        guardianName: data.guardianName,
                        guardianRut: data.guardianRut,
                        guardianEmail: data.guardianEmail,
                        guardianPhone: data.guardianPhone,
                        guardianRelation: data.guardianRelation
                    };
                    
                    // Enviar a la API real
                    console.log('Enviando postulación:', applicationRequest);
                    const response = await applicationService.createApplication(applicationRequest);
                    
                    // Guardar el ID de la aplicación para subir documentos
                    setSubmittedApplicationId(response.id);
                    
                    // Subir documentos si hay alguno seleccionado
                    let documentsUploaded = 0;
                    if (uploadedDocuments.size > 0) {
                        console.log(`Subiendo ${uploadedDocuments.size} documentos para la aplicación ${response.id}`);
                        
                        const uploadPromises = Array.from(uploadedDocuments.entries()).map(([docType, file]) => {
                            const isRequired = ['BIRTH_CERTIFICATE', 'GRADES_2023', 'GRADES_2024', 'GRADES_2025_SEMESTER_1', 'PERSONALITY_REPORT_2024', 'PERSONALITY_REPORT_2025_SEMESTER_1'].includes(docType);
                            return documentService.uploadDocument(response.id, {
                                file,
                                documentType: docType,
                                isRequired
                            });
                        });

                        await Promise.all(uploadPromises);
                        documentsUploaded = uploadedDocuments.size;
                        
                        addNotification({
                            type: 'success',
                            title: 'Documentos subidos',
                            message: `${uploadedDocuments.size} documento(s) subido(s) exitosamente`
                        });
                        
                        // Limpiar documentos después de subir
                        setUploadedDocuments(new Map());
                    }
                    
                    // Agregar a la lista local (opcional, para compatibilidad con el contexto existente)
                    addApplication({
                        id: response.id?.toString() || Date.now().toString(),
                        studentName: response.studentName || `${data.firstName} ${data.lastName}`,
                        grade: response.grade || data.grade,
                        status: response.status || 'pending',
                        submissionDate: response.submissionDate || new Date().toISOString(),
                        documents: []
                    });
                    
                    // Mensaje final según si se subieron documentos o no
                    if (documentsUploaded > 0) {
                        addNotification({
                            type: 'success',
                            title: 'Postulación completada',
                            message: `Su postulación y ${documentsUploaded} documento(s) han sido enviados exitosamente.`
                        });
                    } else {
                        addNotification({
                            type: 'info',
                            title: 'Postulación guardada',
                            message: 'Su postulación ha sido guardada. Recuerde completar los documentos desde su dashboard.'
                        });
                    }
                    
                    // Limpiar datos del formulario
                    setData({});
                    setCurrentStep(nextStepIndex);
                } catch (error: any) {
                    console.error('Error al enviar postulación:', error);
                    addNotification({
                        type: 'error',
                        title: 'Error',
                        message: error.message || 'No se pudo enviar la postulación. Intente nuevamente.'
                    });
                } finally {
                    setIsSubmitting(false);
                }
            } else {
                setCurrentStep(nextStepIndex);
            }
        } else {
            // Show validation error message
            addNotification({
                type: 'error',
                title: 'Campos incompletos',
                message: 'Por favor, complete todos los campos obligatorios antes de continuar.'
            });
        }
    };
    
    const prevStep = () => setCurrentStep(prev => Math.max(prev - 1, 0));

    // Funciones para manejar documentos
    const handleFileSelect = (documentType: string, file: File) => {
        const newDocs = new Map(uploadedDocuments);
        newDocs.set(documentType, file);
        setUploadedDocuments(newDocs);
    };

    // Esta función ya no se necesita - los documentos se suben automáticamente al enviar la postulación

    // Helper function to check if current step can proceed
    const canProceedToNextStep = useMemo((): boolean => {
        return validateCurrentStep();
    }, [data, currentStep, requiresCurrentSchool]);

    // Helper function to get missing fields for current step
    const getMissingFields = useMemo((): string[] => {
        const missing: string[] = [];
        
        switch (currentStep) {
            case 0:
                if (!data.firstName?.trim()) missing.push('Nombres');
                if (!data.lastName?.trim()) missing.push('Apellidos');
                if (!data.rut?.trim()) missing.push('RUT');
                if (!data.birthDate) missing.push('Fecha de Nacimiento');
                if (!data.grade) missing.push('Nivel al que postula');
                if (!data.studentAddress?.trim()) missing.push('Dirección');
                if (requiresCurrentSchool(data.grade || '') && !data.currentSchool?.trim()) missing.push('Colegio de Procedencia');
                break;
            case 1:
                if (!data.parent1Name?.trim()) missing.push('Nombre del Padre');
                if (!data.parent1Email?.trim()) missing.push('Email del Padre');
                if (!data.parent1Phone?.trim()) missing.push('Teléfono del Padre');
                if (!data.parent1Rut?.trim()) missing.push('RUT del Padre');
                if (!data.parent1Address?.trim()) missing.push('Dirección del Padre');
                if (!data.parent1Profession?.trim()) missing.push('Profesión del Padre');
                if (!data.parent2Name?.trim()) missing.push('Nombre de la Madre');
                if (!data.parent2Email?.trim()) missing.push('Email de la Madre');
                if (!data.parent2Phone?.trim()) missing.push('Teléfono de la Madre');
                if (!data.parent2Rut?.trim()) missing.push('RUT de la Madre');
                if (!data.parent2Address?.trim()) missing.push('Dirección de la Madre');
                if (!data.parent2Profession?.trim()) missing.push('Profesión de la Madre');
                break;
            case 2:
                if (!data.supporterRelation) missing.push('Parentesco del Sostenedor');
                if (!data.supporterName?.trim()) missing.push('Nombre del Sostenedor');
                if (!data.supporterEmail?.trim()) missing.push('Email del Sostenedor');
                if (!data.supporterPhone?.trim()) missing.push('Teléfono del Sostenedor');
                if (!data.supporterRut?.trim()) missing.push('RUT del Sostenedor');
                break;
            case 3:
                if (!data.guardianRelation) missing.push('Parentesco del Apoderado');
                if (!data.guardianName?.trim()) missing.push('Nombre del Apoderado');
                if (!data.guardianEmail?.trim()) missing.push('Email del Apoderado');
                if (!data.guardianPhone?.trim()) missing.push('Teléfono del Apoderado');
                if (!data.guardianRut?.trim()) missing.push('RUT del Apoderado');
                break;
        }
        
        return missing;
    }, [data, currentStep, requiresCurrentSchool]);

    // Función para renderizar el formulario de autenticación
    const renderAuthForm = () => {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
                <div className="max-w-md w-full space-y-8">
                    {/* Header */}
                    <div className="text-center">
                        <div className="flex justify-center mb-6">
                            <LogoIcon />
                        </div>
                        <h2 className="text-3xl font-bold text-azul-monte-tabor">
                            {showRegister ? 'Crear Cuenta de Apoderado' : 'Iniciar Postulación'}
                        </h2>
                        <p className="mt-2 text-gris-piedra">
                            {showRegister 
                                ? 'Complete sus datos para crear una cuenta y comenzar su postulación'
                                : 'Debe crear una cuenta o iniciar sesión para postular'
                            }
                        </p>
                    </div>

                    <Card className="p-8">
                        {!showRegister ? (
                            // Formulario de Login
                            <form onSubmit={handleLogin} className="space-y-6">
                                {authError && (
                                    <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                                        {authError}
                                    </div>
                                )}

                                <Input
                                    id="email"
                                    label="Correo Electrónico"
                                    type="email"
                                    placeholder="apoderado@ejemplo.com"
                                    value={authData.email}
                                    onChange={(e) => updateAuthField('email', e.target.value)}
                                    isRequired
                                />

                                <Input
                                    id="password"
                                    label="Contraseña"
                                    type="password"
                                    placeholder="••••••••"
                                    value={authData.password}
                                    onChange={(e) => updateAuthField('password', e.target.value)}
                                    isRequired
                                />

                                <Button
                                    type="submit"
                                    variant="primary"
                                    size="lg"
                                    isLoading={authLoading}
                                    loadingText="Iniciando sesión..."
                                    className="w-full"
                                >
                                    Iniciar Sesión y Postular
                                </Button>

                                <div className="text-center">
                                    <button
                                        type="button"
                                        onClick={() => setShowRegister(true)}
                                        className="text-azul-monte-tabor hover:underline"
                                    >
                                        ¿No tiene cuenta? Regístrese aquí
                                    </button>
                                </div>
                            </form>
                        ) : (
                            // Formulario de Registro
                            <form onSubmit={handleRegister} className="space-y-4">
                                {authError && (
                                    <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                                        {authError}
                                    </div>
                                )}

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <Input
                                        id="firstName"
                                        label="Nombres"
                                        placeholder="Juan Carlos"
                                        value={authData.firstName}
                                        onChange={(e) => updateAuthField('firstName', e.target.value)}
                                        isRequired
                                    />
                                    <Input
                                        id="lastName"
                                        label="Apellidos"
                                        placeholder="Pérez González"
                                        value={authData.lastName}
                                        onChange={(e) => updateAuthField('lastName', e.target.value)}
                                        isRequired
                                    />
                                </div>

                                <RutInput
                                    name="rut"
                                    label="RUT"
                                    placeholder="12.345.678-9"
                                    value={authData.rut}
                                    onChange={(value) => updateAuthField('rut', value)}
                                    required
                                />

                                <EmailVerification
                                    email={authData.email}
                                    onEmailChange={(email) => updateAuthField('email', email)}
                                    onVerificationComplete={setIsEmailVerified}
                                    placeholder="apoderado@ejemplo.com"
                                    isRequired
                                />

                                <Input
                                    id="phone"
                                    label="Teléfono"
                                    type="tel"
                                    placeholder="+569 1234 5678"
                                    value={authData.phone}
                                    onChange={(e) => updateAuthField('phone', e.target.value)}
                                    isRequired
                                />

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <Input
                                        id="password-register"
                                        label="Contraseña"
                                        type="password"
                                        placeholder="••••••••"
                                        value={authData.password}
                                        onChange={(e) => updateAuthField('password', e.target.value)}
                                        isRequired
                                    />
                                    <Input
                                        id="confirmPassword"
                                        label="Confirmar Contraseña"
                                        type="password"
                                        placeholder="••••••••"
                                        value={authData.confirmPassword}
                                        onChange={(e) => updateAuthField('confirmPassword', e.target.value)}
                                        isRequired
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
                                        isLoading={authLoading}
                                        loadingText="Creando cuenta..."
                                        disabled={!isEmailVerified || authLoading}
                                        className="flex-1"
                                    >
                                        {isEmailVerified ? 'Crear Cuenta y Postular' : 'Verificar Email Primero'}
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

    const renderStepContent = () => {
        switch (currentStep) {
            case 0:
                return (
                    <div className="space-y-4">
                        <h3 className="text-xl font-bold text-azul-monte-tabor">Información del Postulante</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <Input 
                                id="firstName" 
                                label="Nombres" 
                                placeholder="Juan Carlos" 
                                isRequired 
                                value={data.firstName || ''}
                                onChange={(e) => updateField('firstName', e.target.value)}
                                onBlur={() => touchField('firstName')}
                                error={errors.firstName}
                            />
                            <Input 
                                id="lastName" 
                                label="Apellidos" 
                                placeholder="Pérez González" 
                                isRequired 
                                value={data.lastName || ''}
                                onChange={(e) => updateField('lastName', e.target.value)}
                                onBlur={() => touchField('lastName')}
                                error={errors.lastName}
                            />
                            <RutInput 
                                name="rut" 
                                label="RUT del Postulante" 
                                placeholder="12.345.678-9" 
                                required 
                                value={data.rut || ''}
                                onChange={(value) => updateField('rut', value)}
                                onBlur={() => touchField('rut')}
                                error={errors.rut}
                            />
                            <Input 
                                id="birthDate" 
                                label="Fecha de Nacimiento" 
                                type="date" 
                                isRequired 
                                value={data.birthDate || ''}
                                onChange={(e) => updateField('birthDate', e.target.value)}
                                onBlur={() => touchField('birthDate')}
                                error={errors.birthDate}
                            />
                        </div>
                        <Input 
                            id="studentEmail" 
                            label="Correo Electrónico (opcional)" 
                            type="email"
                            placeholder="estudiante@ejemplo.com"
                            value={data.studentEmail || ''}
                            onChange={(e) => updateField('studentEmail', e.target.value)}
                            onBlur={() => touchField('studentEmail')}
                            error={errors.studentEmail}
                        />
                        <Input 
                            id="studentAddress" 
                            label="Dirección de Residencia" 
                            placeholder="Av. Providencia 1234, Providencia, Santiago"
                            isRequired 
                            value={data.studentAddress || ''}
                            onChange={(e) => updateField('studentAddress', e.target.value)}
                            onBlur={() => touchField('studentAddress')}
                            error={errors.studentAddress}
                        />
                        {/* Campo condicional para Colegio de Procedencia */}
                        {requiresCurrentSchool(data.grade || '') && (
                            <Input 
                                id="currentSchool" 
                                label="Colegio de Procedencia" 
                                placeholder="Colegio San José"
                                isRequired 
                                value={data.currentSchool || ''}
                                onChange={(e) => updateField('currentSchool', e.target.value)}
                                onBlur={() => touchField('currentSchool')}
                                error={(!data.currentSchool || data.currentSchool.trim().length < 2) ? 'Este campo es requerido para estudiantes desde 2° básico' : ''}
                            />
                        )}
                        
                        {/* Mensaje informativo para niveles que no requieren colegio anterior */}
                        {!requiresCurrentSchool(data.grade || '') && data.grade && (
                            <div className="p-4 bg-blue-50 rounded-lg">
                                <p className="text-sm text-blue-800">
                                    <strong>Nota:</strong> Para el nivel seleccionado no es necesario indicar colegio de procedencia.
                                    {['playgroup', 'prekinder', 'kinder'].includes(data.grade) 
                                        ? ' Si viene de un jardín infantil, puede mencionarlo en observaciones adicionales.'
                                        : ' Es su primer año escolar formal.'}
                                </p>
                            </div>
                        )}
                        <Select 
                            id="grade" 
                            label="Nivel al que postula" 
                            options={gradeOptions}
                            isRequired 
                            value={data.grade || ''}
                            onChange={(e) => updateField('grade', e.target.value)}
                            onBlur={() => touchField('grade')}
                            error={errors.grade}
                        />
                        
                        {/* Campo de observaciones adicionales */}
                        <div className="mt-4">
                            <label htmlFor="additionalNotes" className="block text-sm font-medium text-gray-700 mb-2">
                                Observaciones Adicionales (Opcional)
                            </label>
                            <textarea
                                id="additionalNotes"
                                rows={3}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-azul-monte-tabor focus:border-azul-monte-tabor"
                                placeholder="Ej: Viene del Jardín Infantil Los Angelitos, tiene experiencia en actividades extracurriculares, etc."
                                value={data.additionalNotes || ''}
                                onChange={(e) => updateField('additionalNotes', e.target.value)}
                            />
                            <p className="text-xs text-gray-500 mt-1">
                                Puede mencionar jardín infantil de procedencia, actividades previas, o cualquier información relevante.
                            </p>
                        </div>
                    </div>
                );
            case 1:
                return (
                    <div className="space-y-6">
                        <div>
                            <h3 className="text-xl font-bold text-azul-monte-tabor mb-4">Información del Padre</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <Input 
                                    id="parent1-name" 
                                    label="Nombre Completo" 
                                    placeholder="María Elena González"
                                    isRequired 
                                    value={data.parent1Name || ''}
                                    onChange={(e) => updateField('parent1Name', e.target.value)}
                                    onBlur={() => touchField('parent1Name')}
                                    error={errors.parent1Name}
                                />
                                <RutInput 
                                    name="parent1-rut" 
                                    label="RUT" 
                                    placeholder="16.789.123-4"
                                    required 
                                    value={data.parent1Rut || ''}
                                    onChange={(value) => updateField('parent1Rut', value)}
                                    onBlur={() => touchField('parent1Rut')}
                                    error={errors.parent1Rut}
                                />
                                <Input 
                                    id="parent1-email" 
                                    label="Email" 
                                    type="email" 
                                    placeholder="maria.gonzalez@ejemplo.com"
                                    isRequired 
                                    value={data.parent1Email || ''}
                                    onChange={(e) => updateField('parent1Email', e.target.value)}
                                    onBlur={() => touchField('parent1Email')}
                                    error={errors.parent1Email}
                                />
                                <Input 
                                    id="parent1-phone" 
                                    label="Teléfono" 
                                    type="tel" 
                                    isRequired 
                                    placeholder="+569 1234 5678"
                                    value={data.parent1Phone || ''}
                                    onChange={(e) => updateField('parent1Phone', e.target.value)}
                                    onBlur={() => touchField('parent1Phone')}
                                    error={errors.parent1Phone}
                                />
                            </div>
                            <div className="mt-4">
                                <Input 
                                    id="parent1-address" 
                                    label="Dirección" 
                                    placeholder="Los Leones 456, Providencia, Santiago"
                                    isRequired 
                                    value={data.parent1Address || ''}
                                    onChange={(e) => updateField('parent1Address', e.target.value)}
                                    onBlur={() => touchField('parent1Address')}
                                    error={errors.parent1Address}
                                />
                            </div>
                            <div className="mt-4">
                                <Input 
                                    id="parent1-profession" 
                                    label="Profesión" 
                                    placeholder="Ingeniero Comercial"
                                    isRequired 
                                    value={data.parent1Profession || ''}
                                    onChange={(e) => updateField('parent1Profession', e.target.value)}
                                    onBlur={() => touchField('parent1Profession')}
                                    error={errors.parent1Profession}
                                />
                            </div>
                        </div>
                         <div>
                            <h3 className="text-xl font-bold text-azul-monte-tabor mb-4">Información de la Madre</h3>
                             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <Input 
                                    id="parent2-name" 
                                    label="Nombre Completo"
                                    placeholder="María Elena González"
                                    isRequired
                                    value={data.parent2Name || ''}
                                    onChange={(e) => updateField('parent2Name', e.target.value)}
                                    onBlur={() => touchField('parent2Name')}
                                    error={errors.parent2Name}
                                />
                                <RutInput 
                                    name="parent2-rut" 
                                    label="RUT"
                                    placeholder="15.678.912-3"
                                    required
                                    value={data.parent2Rut || ''}
                                    onChange={(value) => updateField('parent2Rut', value)}
                                    onBlur={() => touchField('parent2Rut')}
                                    error={errors.parent2Rut}
                                />
                                <Input 
                                    id="parent2-email" 
                                    label="Email" 
                                    type="email"
                                    placeholder="maria.gonzalez@ejemplo.com"
                                    isRequired
                                    value={data.parent2Email || ''}
                                    onChange={(e) => updateField('parent2Email', e.target.value)}
                                    onBlur={() => touchField('parent2Email')}
                                    error={errors.parent2Email}
                                />
                                <Input 
                                    id="parent2-phone" 
                                    label="Teléfono" 
                                    type="tel"
                                    placeholder="+569 8765 4321"
                                    isRequired
                                    value={data.parent2Phone || ''}
                                    onChange={(e) => updateField('parent2Phone', e.target.value)}
                                    onBlur={() => touchField('parent2Phone')}
                                    error={errors.parent2Phone}
                                />
                            </div>
                            <div className="mt-4">
                                <Input 
                                    id="parent2-address" 
                                    label="Dirección"
                                    placeholder="Av. Vitacura 789, Las Condes, Santiago"
                                    isRequired
                                    value={data.parent2Address || ''}
                                    onChange={(e) => updateField('parent2Address', e.target.value)}
                                    onBlur={() => touchField('parent2Address')}
                                    error={errors.parent2Address}
                                />
                            </div>
                            <div className="mt-4">
                                <Input 
                                    id="parent2-profession" 
                                    label="Profesión"
                                    placeholder="Profesora de Educación Básica"
                                    isRequired
                                    value={data.parent2Profession || ''}
                                    onChange={(e) => updateField('parent2Profession', e.target.value)}
                                    onBlur={() => touchField('parent2Profession')}
                                    error={errors.parent2Profession}
                                />
                            </div>
                        </div>
                    </div>
                );
            case 2:
                return (
                    <div className="space-y-4">
                        <h3 className="text-xl font-bold text-azul-monte-tabor">Información del Sostenedor</h3>
                        <p className="text-gris-piedra mb-4">Persona responsable del pago de mensualidades y compromisos económicos.</p>
                        
                        {/* Selección de parentesco primero */}
                        <Select 
                            id="supporter-relation" 
                            label="Parentesco con el postulante" 
                            options={[
                                { value: '', label: 'Seleccione...' },
                                { value: 'padre', label: 'Padre' },
                                { value: 'madre', label: 'Madre' },
                                { value: 'abuelo', label: 'Abuelo/a' },
                                { value: 'tio', label: 'Tío/a' },
                                { value: 'hermano', label: 'Hermano/a' },
                                { value: 'tutor', label: 'Tutor Legal' },
                                { value: 'otro', label: 'Otro' }
                            ]}
                            isRequired 
                            value={data.supporterRelation || ''}
                            onChange={(e) => handleParentRelationChange('supporterRelation', e.target.value, 'supporter')}
                            onBlur={() => touchField('supporterRelation')}
                            error={errors.supporterRelation}
                        />

                        {/* Mensaje informativo para padre/madre */}
                        {(data.supporterRelation === 'padre' || data.supporterRelation === 'madre') && (
                            <div className="p-3 bg-green-50 rounded-lg">
                                <p className="text-sm text-green-800">
                                    ✅ Los datos se han completado automáticamente con la información del {data.supporterRelation} ingresada anteriormente.
                                </p>
                            </div>
                        )}

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <Input 
                                id="supporter-name" 
                                label="Nombre Completo" 
                                placeholder="Ana María Rodríguez"
                                isRequired 
                                value={data.supporterName || ''}
                                onChange={(e) => updateField('supporterName', e.target.value)}
                                onBlur={() => touchField('supporterName')}
                                error={errors.supporterName}
                                disabled={data.supporterRelation === 'padre' || data.supporterRelation === 'madre'}
                            />
                            <RutInput 
                                name="supporter-rut" 
                                label="RUT" 
                                placeholder="18.456.789-2"
                                required 
                                value={data.supporterRut || ''}
                                onChange={(value) => updateField('supporterRut', value)}
                                onBlur={() => touchField('supporterRut')}
                                error={errors.supporterRut}
                                disabled={data.supporterRelation === 'padre' || data.supporterRelation === 'madre'}
                            />
                            <Input 
                                id="supporter-email" 
                                label="Email" 
                                type="email" 
                                placeholder="ana.rodriguez@ejemplo.com"
                                isRequired 
                                value={data.supporterEmail || ''}
                                onChange={(e) => updateField('supporterEmail', e.target.value)}
                                onBlur={() => touchField('supporterEmail')}
                                error={errors.supporterEmail}
                                disabled={data.supporterRelation === 'padre' || data.supporterRelation === 'madre'}
                            />
                            <Input 
                                id="supporter-phone" 
                                label="Teléfono" 
                                type="tel" 
                                isRequired 
                                placeholder="+569 9876 5432"
                                value={data.supporterPhone || ''}
                                onChange={(e) => updateField('supporterPhone', e.target.value)}
                                onBlur={() => touchField('supporterPhone')}
                                error={errors.supporterPhone}
                                disabled={data.supporterRelation === 'padre' || data.supporterRelation === 'madre'}
                            />
                        </div>
                    </div>
                );
            case 3:
                return (
                    <div className="space-y-4">
                        <h3 className="text-xl font-bold text-azul-monte-tabor">Información del Apoderado</h3>
                        <p className="text-gris-piedra mb-4">Persona responsable de la representación del estudiante en el colegio.</p>
                        
                        {/* Selección de parentesco primero */}
                        <Select 
                            id="guardian-relation" 
                            label="Parentesco con el postulante" 
                            options={[
                                { value: '', label: 'Seleccione...' },
                                { value: 'padre', label: 'Padre' },
                                { value: 'madre', label: 'Madre' },
                                { value: 'abuelo', label: 'Abuelo/a' },
                                { value: 'tio', label: 'Tío/a' },
                                { value: 'hermano', label: 'Hermano/a' },
                                { value: 'tutor', label: 'Tutor Legal' },
                                { value: 'otro', label: 'Otro' }
                            ]}
                            isRequired 
                            value={data.guardianRelation || ''}
                            onChange={(e) => handleParentRelationChange('guardianRelation', e.target.value, 'guardian')}
                            onBlur={() => touchField('guardianRelation')}
                            error={errors.guardianRelation}
                        />

                        {/* Mensaje informativo para padre/madre */}
                        {(data.guardianRelation === 'padre' || data.guardianRelation === 'madre') && (
                            <div className="p-3 bg-green-50 rounded-lg">
                                <p className="text-sm text-green-800">
                                    ✅ Los datos se han completado automáticamente con la información del {data.guardianRelation} ingresada anteriormente.
                                </p>
                            </div>
                        )}

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <Input 
                                id="guardian-name" 
                                label="Nombre Completo" 
                                placeholder="Roberto Silva Martínez"
                                isRequired 
                                value={data.guardianName || ''}
                                onChange={(e) => updateField('guardianName', e.target.value)}
                                onBlur={() => touchField('guardianName')}
                                error={errors.guardianName}
                                disabled={data.guardianRelation === 'padre' || data.guardianRelation === 'madre'}
                            />
                            <RutInput 
                                name="guardian-rut" 
                                label="RUT" 
                                placeholder="19.234.567-8"
                                required 
                                value={data.guardianRut || ''}
                                onChange={(value) => updateField('guardianRut', value)}
                                onBlur={() => touchField('guardianRut')}
                                error={errors.guardianRut}
                                disabled={data.guardianRelation === 'padre' || data.guardianRelation === 'madre'}
                            />
                            <Input 
                                id="guardian-email" 
                                label="Email" 
                                type="email" 
                                placeholder="roberto.silva@ejemplo.com"
                                isRequired 
                                value={data.guardianEmail || ''}
                                onChange={(e) => updateField('guardianEmail', e.target.value)}
                                onBlur={() => touchField('guardianEmail')}
                                error={errors.guardianEmail}
                                disabled={data.guardianRelation === 'padre' || data.guardianRelation === 'madre'}
                            />
                            <Input 
                                id="guardian-phone" 
                                label="Teléfono" 
                                type="tel" 
                                isRequired 
                                placeholder="+569 5555 1234"
                                value={data.guardianPhone || ''}
                                onChange={(e) => updateField('guardianPhone', e.target.value)}
                                onBlur={() => touchField('guardianPhone')}
                                error={errors.guardianPhone}
                                disabled={data.guardianRelation === 'padre' || data.guardianRelation === 'madre'}
                            />
                        </div>
                    </div>
                );
            case 4:
                const documentTypes = [
                    { key: 'BIRTH_CERTIFICATE', label: 'Certificado de Nacimiento', required: true },
                    { key: 'GRADES_2023', label: 'Certificado de Estudios 2023 (si aplica)', required: true },
                    { key: 'GRADES_2024', label: 'Certificado de Estudios 2024', required: true },
                    { key: 'GRADES_2025_SEMESTER_1', label: 'Certificado de Estudios primer semestre 2025', required: true },
                    { key: 'PERSONALITY_REPORT_2024', label: 'Informe de Personalidad 2024', required: true },
                    { key: 'PERSONALITY_REPORT_2025_SEMESTER_1', label: 'Informe de Personalidad primer semestre 2025', required: true },
                    { key: 'STUDENT_PHOTO', label: 'Fotografía del Postulante', required: false },
                    { key: 'BAPTISM_CERTIFICATE', label: 'Certificado de Bautismo', required: false },
                    { key: 'PREVIOUS_SCHOOL_REPORT', label: 'Informe de Jardín/Colegio Anterior', required: false },
                    { key: 'MEDICAL_CERTIFICATE', label: 'Certificado Médico', required: false },
                    { key: 'PSYCHOLOGICAL_REPORT', label: 'Informe Psicológico (si aplica)', required: false }
                ];

                return (
                    <div>
                        <h3 className="text-xl font-bold text-azul-monte-tabor mb-4">Carga de Documentos</h3>
                        
                        {/* Permitir subir documentos antes de crear la aplicación */}
                        <>
                            <p className="text-gris-piedra mb-6">Por favor, adjunte los siguientes documentos en formato PDF, JPG o PNG (máximo 10MB cada uno).</p>
                                
                                <div className="space-y-6">
                                    {/* Documentos obligatorios */}
                                    <div className="mb-6">
                                        <h4 className="text-lg font-semibold text-azul-monte-tabor mb-3">Documentos Obligatorios</h4>
                                        <div className="space-y-3">
                                            {documentTypes.filter(doc => doc.required).map(doc => (
                                                <div key={doc.key} className="flex justify-between items-center p-3 border rounded-lg bg-red-50">
                                                    <label className="font-medium">
                                                        {doc.label} <span className="text-rojo-sagrado">*</span>
                                                    </label>
                                                    <div className="flex items-center gap-2">
                                                        <input 
                                                            type="file" 
                                                            accept=".pdf,.jpg,.jpeg,.png"
                                                            onChange={(e) => {
                                                                const file = e.target.files?.[0];
                                                                if (file) handleFileSelect(doc.key, file);
                                                            }}
                                                            className="text-sm"
                                                        />
                                                        {uploadedDocuments.has(doc.key) && (
                                                            <span className="text-verde-esperanza text-sm">✓ Seleccionado</span>
                                                        )}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                    
                                    {/* Documentos opcionales */}
                                    <div>
                                        <h4 className="text-lg font-semibold text-azul-monte-tabor mb-3">Documentos Opcionales</h4>
                                        <div className="space-y-3">
                                            {documentTypes.filter(doc => !doc.required).map(doc => (
                                                <div key={doc.key} className="flex justify-between items-center p-3 border rounded-lg">
                                                    <label className="font-medium">{doc.label}</label>
                                                    <div className="flex items-center gap-2">
                                                        <input 
                                                            type="file" 
                                                            accept={doc.key === 'STUDENT_PHOTO' ? '.jpg,.jpeg,.png' : '.pdf,.jpg,.jpeg,.png'}
                                                            onChange={(e) => {
                                                                const file = e.target.files?.[0];
                                                                if (file) handleFileSelect(doc.key, file);
                                                            }}
                                                            className="text-sm"
                                                        />
                                                        {uploadedDocuments.has(doc.key) && (
                                                            <span className="text-verde-esperanza text-sm">✓ Seleccionado</span>
                                                        )}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                    
                                    {/* Resumen de documentos seleccionados */}
                                    {uploadedDocuments.size > 0 && (
                                        <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                                            <p className="text-sm text-azul-monte-tabor mb-3">
                                                📄 {uploadedDocuments.size} documento(s) seleccionado(s) para subir
                                            </p>
                                            <p className="text-xs text-gris-piedra">
                                                Los documentos se subirán automáticamente al enviar la postulación
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </>
                        
                        <div className="mt-6 p-4 bg-amber-50 rounded-lg">
                            <p className="text-sm text-amber-800">
                                <strong>Notas importantes:</strong>
                            </p>
                            <ul className="text-sm text-amber-800 mt-2 list-disc list-inside space-y-1">
                                <li>Los certificados de estudios e informes de personalidad son obligatorios solo para estudiantes de 3° básico en adelante.</li>
                                <li>Para estudiantes menores, adjunte los documentos que correspondan según su nivel educativo actual.</li>
                                <li>La fotografía del postulante es opcional pero recomendada para agilizar el proceso.</li>
                                <li>Los informes de personalidad deben ser emitidos por el colegio o jardín infantil de origen.</li>
                                <li><strong>Puede enviar su postulación aunque no haya subido todos los documentos.</strong> Podrá completarlos más tarde desde su dashboard.</li>
                            </ul>
                        </div>
                        
                        <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                            <p className="text-sm text-azul-monte-tabor">
                                <strong>💡 Consejo:</strong> Si no tiene todos los documentos listos, puede enviar su postulación ahora y completar los documentos faltantes más tarde desde su dashboard familiar.
                            </p>
                        </div>
                    </div>
                );
            case 5:
                return (
                    <div className="text-center">
                        <h3 className="text-2xl font-bold text-azul-monte-tabor mb-4">Postulación Enviada</h3>
                        <p className="text-gris-piedra mb-6">Gracias por postular. Hemos recibido su información y nos pondremos en contacto pronto.</p>
                        <CheckCircleIcon className="w-24 h-24 text-verde-esperanza mx-auto mb-6" />
                        <p className="text-sm text-gris-piedra">Recibirá un correo de confirmación con los próximos pasos.</p>
                        <div className="mt-8 p-6 bg-blue-50 rounded-lg text-left">
                            <h4 className="font-bold text-azul-monte-tabor mb-3">Próximos pasos:</h4>
                            <ol className="list-decimal list-inside space-y-2 text-sm text-gris-piedra">
                                <li>Recibirá un correo de confirmación en las próximas 24 horas</li>
                                <li>El equipo de admisiones revisará su postulación</li>
                                <li>Se le contactará para coordinar entrevistas familiares</li>
                                <li>Podrá acceder al portal de exámenes una vez aprobada la documentación</li>
                                <li>Los resultados se publicarán según el cronograma establecido</li>
                            </ol>
                        </div>
                        <div className="mt-6 space-y-3">
                            <Link to="/dashboard-apoderado">
                                <Button 
                                    variant="primary"
                                    className="w-full"
                                >
                                    Ver Mi Dashboard
                                </Button>
                            </Link>
                            <Button 
                                variant="outline" 
                                onClick={() => window.location.href = '/'}
                                className="w-full"
                            >
                                Volver al Inicio
                            </Button>
                        </div>
                    </div>
                );
            default:
                return null;
        }
    };

    // Si no está autenticado, mostrar formulario de autenticación
    if (showAuthForm || !isAuthenticated) {
        return renderAuthForm();
    }

    return (
        <div className="bg-gray-50 py-16">
            <div className="container mx-auto px-6 max-w-4xl">
                {/* Header con información del usuario */}
                <div className="mb-6 flex justify-between items-center">
                    <div>
                        <h1 className="text-4xl font-bold text-azul-monte-tabor font-serif">Formulario de Postulación</h1>
                        <p className="text-gris-piedra">Siga los pasos para completar el proceso de admisión.</p>
                    </div>
                    <div className="text-right">
                        <p className="text-sm text-gris-piedra">Apoderado:</p>
                        <p className="font-semibold text-azul-monte-tabor">{user?.firstName} {user?.lastName}</p>
                        <Link to="/dashboard-apoderado" className="text-sm text-azul-monte-tabor hover:underline">
                            Ver mi dashboard →
                        </Link>
                    </div>
                </div>

                {/* Progress Bar */}
                <div className="mb-10">
                    <div className="flex justify-between mb-2">
                        {steps.map((step, index) => (
                             <div key={index} className={`text-center w-1/4 ${index <= currentStep ? 'text-azul-monte-tabor font-bold' : 'text-gris-piedra'}`}>
                                {step}
                            </div>
                        ))}
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                        <div className="bg-dorado-nazaret h-2.5 rounded-full" style={{ width: `${(currentStep / (steps.length - 1)) * 100}%` }}></div>
                    </div>
                </div>

                <Card className="p-8 md:p-12">
                    {renderStepContent()}
                </Card>

                {/* Missing Fields Warning */}
                {currentStep < 4 && getMissingFields.length > 0 && (
                    <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                        <div className="flex items-start">
                            <div className="flex-shrink-0">
                                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                </svg>
                            </div>
                            <div className="ml-3">
                                <h3 className="text-sm font-medium text-red-800">Campos obligatorios faltantes:</h3>
                                <div className="mt-2">
                                    <ul className="list-disc list-inside text-sm text-red-700">
                                        {getMissingFields.map((field, index) => (
                                            <li key={index}>{field}</li>
                                        ))}
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Navigation Buttons */}
                {currentStep < steps.length - 1 && (
                    <div className="mt-8 flex justify-between">
                        <Button variant="outline" onClick={prevStep} disabled={currentStep === 0}>
                            Anterior
                        </Button>
                        <Button 
                            variant="primary" 
                            onClick={nextStep}
                            isLoading={isSubmitting}
                            loadingText="Enviando..."
                            disabled={!canProceedToNextStep && !isSubmitting}
                        >
                            {currentStep === 4 ? 'Enviar Postulación' : 'Siguiente'}
                        </Button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ApplicationForm;