import React, { useState } from 'react';
import Input from '../components/ui/Input';
import Select from '../components/ui/Select';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import { CheckCircleIcon } from '../components/icons/Icons';
import { usePersistedForm } from '../hooks/usePersistedForm';
import { useApplications, useNotifications } from '../context/AppContext';
import { educationalLevels } from '../services/examMockData';

const steps = [
  "Datos del Postulante",
  "Datos de los Padres",
  "Documentación",
  "Confirmación",
  "Crear Cuenta de Apoderado"
];

const gradeOptions = educationalLevels.map(level => ({
    value: level.value,
    label: level.label
}));

const validationConfig = {
    firstName: { required: true, minLength: 2 },
    lastName: { required: true, minLength: 2 },
    birthDate: { required: true },
    grade: { required: true },
    parent1Name: { required: true, minLength: 2 },
    parent1Email: { required: true, email: true },
    parent1Phone: { required: true, pattern: /^[+]?[\d\s-]{8,}$/ },
    parent2Name: { minLength: 2 },
    parent2Email: { email: true },
    accountEmail: { required: true, email: true },
    accountPassword: { required: true, minLength: 6 },
    accountPassword2: { required: true, custom: (value: string) => {
        // This will be handled separately for password confirmation
        return null;
    }}
};

const ApplicationForm: React.FC = () => {
    const [currentStep, setCurrentStep] = useState(0);
    const [accountCreated, setAccountCreated] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { addApplication } = useApplications();
    const { addNotification } = useNotifications();
    
    const { data, errors, updateField, touchField, validateForm, resetForm, clearPersistedData } = usePersistedForm(
        validationConfig,
        {},
        'mtn_application_form'
    );

    const validateCurrentStep = (): boolean => {
        const stepFields = getStepFields(currentStep);
        let isValid = true;
        
        stepFields.forEach(field => {
            touchField(field);
            if (errors[field]) {
                isValid = false;
            }
        });
        
        // Special validation for password confirmation
        if (currentStep === 4 && data.accountPassword !== data.accountPassword2) {
            isValid = false;
        }
        
        return isValid;
    };

    const getStepFields = (step: number): string[] => {
        switch (step) {
            case 0: return ['firstName', 'lastName', 'birthDate', 'grade'];
            case 1: return ['parent1Name', 'parent1Email', 'parent1Phone'];
            case 2: return []; // Document upload step
            case 3: return []; // Confirmation step
            case 4: return ['accountEmail', 'accountPassword', 'accountPassword2'];
            default: return [];
        }
    };

    const nextStep = () => {
        if (validateCurrentStep()) {
            setCurrentStep(prev => Math.min(prev + 1, steps.length - 1));
        }
    };
    
    const prevStep = () => setCurrentStep(prev => Math.max(prev - 1, 0));

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
                                placeholder="Juan" 
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
                        </div>
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
                    </div>
                );
            case 1:
                return (
                    <div className="space-y-6">
                        <div>
                            <h3 className="text-xl font-bold text-azul-monte-tabor mb-4">Información del Padre/Madre/Apoderado 1</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <Input 
                                    id="parent1-name" 
                                    label="Nombre Completo" 
                                    isRequired 
                                    value={data.parent1Name || ''}
                                    onChange={(e) => updateField('parent1Name', e.target.value)}
                                    onBlur={() => touchField('parent1Name')}
                                    error={errors.parent1Name}
                                />
                                <Input 
                                    id="parent1-email" 
                                    label="Email" 
                                    type="email" 
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
                        </div>
                         <div>
                            <h3 className="text-xl font-bold text-azul-monte-tabor mb-4">Información del Padre/Madre/Apoderado 2 (Opcional)</h3>
                             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <Input 
                                    id="parent2-name" 
                                    label="Nombre Completo"
                                    value={data.parent2Name || ''}
                                    onChange={(e) => updateField('parent2Name', e.target.value)}
                                    onBlur={() => touchField('parent2Name')}
                                    error={errors.parent2Name}
                                />
                                <Input 
                                    id="parent2-email" 
                                    label="Email" 
                                    type="email"
                                    value={data.parent2Email || ''}
                                    onChange={(e) => updateField('parent2Email', e.target.value)}
                                    onBlur={() => touchField('parent2Email')}
                                    error={errors.parent2Email}
                                />
                            </div>
                        </div>
                    </div>
                );
            case 2:
                return (
                    <div>
                        <h3 className="text-xl font-bold text-azul-monte-tabor mb-4">Carga de Documentos</h3>
                        <p className="text-gris-piedra mb-6">Por favor, adjunte los siguientes documentos en formato PDF.</p>
                        <div className="space-y-4">
                            <div className="flex justify-between items-center p-3 border rounded-lg">
                                <label htmlFor="doc1">Certificado de Nacimiento <span className="text-rojo-sagrado">*</span></label>
                                <input type="file" id="doc1" className="text-sm" />
                            </div>
                            <div className="flex justify-between items-center p-3 border rounded-lg">
                                <label htmlFor="doc2">Informe de Jardín Anterior</label>
                                <input type="file" id="doc2" className="text-sm" />
                            </div>
                            <div className="flex justify-between items-center p-3 border rounded-lg">
                                <label htmlFor="doc3">Certificado de Bautismo</label>
                                <input type="file" id="doc3" className="text-sm" />
                            </div>
                        </div>
                    </div>
                );
            case 3:
                return (
                    <div className="text-center">
                        <h3 className="text-2xl font-bold text-azul-monte-tabor mb-4">Postulación Enviada</h3>
                        <p className="text-gris-piedra mb-6">Gracias por postular. Hemos recibido su información y nos pondremos en contacto pronto.</p>
                        <CheckCircleIcon className="w-24 h-24 text-verde-esperanza mx-auto mb-6" />
                        <p className="text-sm text-gris-piedra">Recibirá un correo de confirmación con los próximos pasos.</p>
                    </div>
                );
            case 4:
                if (accountCreated) {
                    return (
                        <div className="text-center">
                            <h3 className="text-2xl font-bold text-azul-monte-tabor mb-4">¡Cuenta creada exitosamente!</h3>
                            <p className="text-gris-piedra mb-6">Con estos datos podrá acceder al portal de seguimiento de postulaciones.</p>
                            <div className="mb-4">
                                <p className="font-bold">Correo:</p>
                                <p className="text-azul-monte-tabor">{data.accountEmail}</p>
                            </div>
                            <p className="text-sm text-gris-piedra">Guarde su contraseña en un lugar seguro.</p>
                            <div className="mt-6">
                                <Button 
                                    variant="secondary" 
                                    onClick={() => window.location.href = '/familia/login'}
                                >
                                    Iniciar Sesión
                                </Button>
                            </div>
                        </div>
                    );
                }
                return (
                    <div className="space-y-6">
                        <h3 className="text-xl font-bold text-azul-monte-tabor mb-4">Crear Cuenta de Apoderado</h3>
                        <p className="text-gris-piedra mb-4">Con estos datos podrá acceder al portal de seguimiento de postulaciones.</p>
                        <Input
                            id="account-email"
                            label="Correo electrónico"
                            type="email"
                            value={data.accountEmail || ''}
                            onChange={(e) => updateField('accountEmail', e.target.value)}
                            onBlur={() => touchField('accountEmail')}
                            placeholder="apoderado@ejemplo.com"
                            isRequired
                            error={errors.accountEmail}
                        />
                        <Input
                            id="account-password"
                            label="Contraseña"
                            type="password"
                            value={data.accountPassword || ''}
                            onChange={(e) => updateField('accountPassword', e.target.value)}
                            onBlur={() => touchField('accountPassword')}
                            placeholder="Cree una contraseña (mínimo 6 caracteres)"
                            isRequired
                            error={errors.accountPassword}
                        />
                        <Input
                            id="account-password2"
                            label="Confirmar contraseña"
                            type="password"
                            value={data.accountPassword2 || ''}
                            onChange={(e) => updateField('accountPassword2', e.target.value)}
                            onBlur={() => touchField('accountPassword2')}
                            placeholder="Repita la contraseña"
                            isRequired
                            error={data.accountPassword && data.accountPassword2 && data.accountPassword !== data.accountPassword2 ? 'Las contraseñas no coinciden' : errors.accountPassword2}
                        />
                        <Button
                            variant="primary"
                            className="w-full"
                            isLoading={isSubmitting}
                            loadingText="Creando cuenta..."
                            onClick={async (e) => {
                                e.preventDefault();
                                if (validateCurrentStep()) {
                                    setIsSubmitting(true);
                                    try {
                                        // Simulate API call
                                        await new Promise(resolve => setTimeout(resolve, 2000));
                                        
                                        // Create application
                                        const newApplication = {
                                            id: `APP-${Date.now()}`,
                                            applicant: {
                                                id: `STU-${Date.now()}`,
                                                firstName: data.firstName,
                                                lastName: data.lastName,
                                                birthDate: data.birthDate,
                                                grade: gradeOptions.find(g => g.value === data.grade)?.label || data.grade
                                            },
                                            status: 'Borrador' as any,
                                            submissionDate: new Date().toISOString().split('T')[0],
                                            documents: [
                                                { id: 'DOC-01', name: 'Certificado de Nacimiento', status: 'pending' as any },
                                                { id: 'DOC-02', name: 'Informe de Jardín Anterior', status: 'pending' as any },
                                                { id: 'DOC-03', name: 'Certificado de Bautismo', status: 'pending' as any },
                                            ]
                                        };
                                        
                                        addApplication(newApplication);
                                        addNotification({
                                            type: 'success',
                                            title: 'Cuenta creada exitosamente',
                                            message: `Se ha creado la cuenta para ${data.accountEmail}`
                                        });
                                        
                                        setAccountCreated(true);
                                        clearPersistedData();
                                    } catch (error) {
                                        addNotification({
                                            type: 'error',
                                            title: 'Error al crear cuenta',
                                            message: 'No se pudo crear la cuenta. Intente nuevamente.'
                                        });
                                    } finally {
                                        setIsSubmitting(false);
                                    }
                                }
                            }}
                        >
                            Crear cuenta y finalizar
                        </Button>
                    </div>
                );
            default:
                return null;
        }
    };

    return (
        <div className="bg-gray-50 py-16">
            <div className="container mx-auto px-6 max-w-4xl">
                <h1 className="text-4xl font-bold text-azul-monte-tabor text-center mb-2 font-serif">Formulario de Postulación</h1>
                <p className="text-gris-piedra text-center mb-10">Siga los pasos para completar el proceso de admisión.</p>

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

                {/* Navigation Buttons */}
                {currentStep < steps.length - 1 && (
                    <div className="mt-8 flex justify-between">
                        <Button variant="outline" onClick={prevStep} disabled={currentStep === 0}>
                            Anterior
                        </Button>
                        <Button variant="secondary" onClick={nextStep}>
                            Siguiente
                        </Button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ApplicationForm;