import api from './api';
import { DataAdapter } from './dataAdapter';

export interface ApplicationRequest {
    // Datos del estudiante
    firstName: string;
    paternalLastName: string;
    maternalLastName: string;
    rut: string;
    birthDate: string;
    studentEmail?: string;
    studentAddress: string;
    grade: string;
    schoolApplied: string; // "MONTE_TABOR" para niños, "NAZARET" para niñas
    currentSchool?: string;
    additionalNotes?: string;

    // Datos del padre
    parent1Name: string;
    parent1Rut: string;
    parent1Email: string;
    parent1Phone: string;
    parent1Address: string;
    parent1Profession: string;

    // Datos de la madre
    parent2Name: string;
    parent2Rut: string;
    parent2Email: string;
    parent2Phone: string;
    parent2Address: string;
    parent2Profession: string;

    // Datos del sostenedor
    supporterName: string;
    supporterRut: string;
    supporterEmail: string;
    supporterPhone: string;
    supporterRelation: string;

    // Datos del apoderado
    guardianName: string;
    guardianRut: string;
    guardianEmail: string;
    guardianPhone: string;
    guardianRelation: string;
}

export interface ApplicationResponse {
    success: boolean;
    message: string;
    id?: number;
    studentName?: string;
    grade?: string;
    status?: string;
    submissionDate?: string;
    applicantEmail?: string;
}

export interface Application {
    id: number;
    student: {
        id?: string;
        fullName?: string;
        firstName: string;
        lastName: string;
        paternalLastName?: string;
        maternalLastName?: string;
        rut: string;
        birthDate: string;
        email?: string;
        address?: string;
        gradeApplied?: string;
        currentSchool?: string;
        additionalNotes?: string;
        // Campos de categorías especiales
        targetSchool?: string;
        isEmployeeChild?: boolean;
        employeeParentName?: string;
        isAlumniChild?: boolean;
        alumniParentYear?: number;
        isInclusionStudent?: boolean;
        inclusionType?: string;
        inclusionNotes?: string;
    };
    father: {
        fullName: string;
        rut: string;
        email: string;
        phone: string;
        address: string;
        profession: string;
    };
    mother: {
        fullName: string;
        rut: string;
        email: string;
        phone: string;
        address: string;
        profession: string;
    };
    supporter: {
        fullName: string;
        rut: string;
        email: string;
        phone: string;
        relationship: string;
    };
    guardian: {
        fullName: string;
        rut: string;
        email: string;
        phone: string;
        relationship: string;
    };
    status: string;
    submissionDate: string;
    applicantUser: {
        email: string;
        firstName: string;
        lastName: string;
    };
    documents?: any[];
}

class ApplicationService {

    // Helper function to transform frontend grade format to backend format
    private transformGradeToBackend(grade: string): string {
        // Frontend uses: "8basico", "1medio", etc.
        // Backend expects: "8_BASICO", "1_MEDIO", "PRE_KINDER", "KINDER"
        const gradeMap: Record<string, string> = {
            'PREKINDER': 'PRE_KINDER',
            'KINDER': 'KINDER',
            '1basico': '1_BASICO',
            '2basico': '2_BASICO',
            '3basico': '3_BASICO',
            '4basico': '4_BASICO',
            '5basico': '5_BASICO',
            '6basico': '6_BASICO',
            '7basico': '7_BASICO',
            '8basico': '8_BASICO',
            '1medio': '1_MEDIO',
            '2medio': '2_MEDIO',
            '3medio': '3_MEDIO',
            '4medio': '4_MEDIO'
        };

        return gradeMap[grade] || grade.toUpperCase().replace('BASICO', '_BASICO').replace('MEDIO', '_MEDIO');
    }

    // Método mejorado para administradores: obtener todas las postulaciones desde microservicio
    async getAllApplications(): Promise<Application[]> {
        try {
            console.log('📊 Admin: Obteniendo postulaciones desde microservicio');

            // Primero intentar el endpoint principal que devuelve la estructura completa
            try {
                console.log('🔄 Probando endpoint principal: /api/applications');
                const response = await api.get('/api/applications');
                console.log('✅ Respuesta del endpoint principal:', response.data);

                // El backend devuelve {success: true, data: [...]}
                const applications = response.data?.data || response.data || [];
                console.log('✅ Aplicaciones recibidas:', applications.length);

                // El endpoint /api/applications ya devuelve la estructura correcta
                // No necesitamos adaptador, solo filtrar las aplicaciones válidas
                const validApplications = applications.filter((app: any) =>
                    app &&
                    app.id &&
                    app.student &&
                    app.student.firstName &&
                    app.student.lastName &&
                    app.student.firstName !== null &&
                    app.student.lastName !== null
                );

                console.log('✅ Aplicaciones válidas filtradas:', validApplications.length);
                if (validApplications.length > 0) {
                    console.log('📋 Primera aplicación completa:', validApplications[0]);
                    console.log('📋 Student object:', validApplications[0]?.student);
                    console.log('📋 firstName:', validApplications[0]?.student?.firstName);
                    console.log('📋 lastName:', validApplications[0]?.student?.lastName);
                    console.log('📋 paternalLastName:', validApplications[0]?.student?.paternalLastName);
                    console.log('📋 maternalLastName:', validApplications[0]?.student?.maternalLastName);
                }
                return validApplications;

            } catch (mainError) {
                console.log('❌ Falló endpoint principal, intentando público...');

                // Como fallback, usar el endpoint público con adaptador si es necesario
                const response = await api.get('/api/applications/public/all');
                console.log('✅ Éxito con endpoint público:', response.data);

                // Este endpoint devuelve formato diferente, usar adaptador
                const adaptedApplications = DataAdapter.adaptApplicationApiResponse(response);
                console.log('✅ Aplicaciones adaptadas desde público:', adaptedApplications.length);
                return adaptedApplications;
            }

        } catch (error: any) {
            console.error('❌ Error obteniendo postulaciones desde microservicio:', error);

            // Como fallback, devolver un array vacío
            console.log('🔄 Devolviendo array vacío como fallback');
            return [];
        }
    }
    
    // Método para administradores: obtener estadísticas del dashboard
    async getAdminDashboardStats(): Promise<{
        totalApplications: number;
        applicationsByStatus: Record<string, number>;
        applicationsByGrade: Record<string, number>;
        recentApplications: Application[];
    }> {
        try {
            console.log('📊 Admin: Obteniendo estadísticas del dashboard');
            
            const applications = await this.getAllApplications();
            
            // Calcular estadísticas
            const totalApplications = applications.length;
            
            const applicationsByStatus = applications.reduce((acc, app) => {
                acc[app.status] = (acc[app.status] || 0) + 1;
                return acc;
            }, {} as Record<string, number>);
            
            const applicationsByGrade = applications.reduce((acc, app) => {
                const grade = app.student?.gradeApplied || 'Sin especificar';
                acc[grade] = (acc[grade] || 0) + 1;
                return acc;
            }, {} as Record<string, number>);
            
            // Ordenar por fecha de envío para obtener las más recientes
            const recentApplications = applications
                .sort((a, b) => new Date(b.submissionDate).getTime() - new Date(a.submissionDate).getTime())
                .slice(0, 10);
            
            return {
                totalApplications,
                applicationsByStatus,
                applicationsByGrade,
                recentApplications
            };
            
        } catch (error: any) {
            console.error('❌ Error obteniendo estadísticas admin:', error);
            return {
                totalApplications: 0,
                applicationsByStatus: {},
                applicationsByGrade: {},
                recentApplications: []
            };
        }
    }
    
    async createApplication(request: ApplicationRequest): Promise<ApplicationResponse> {
        try {
            console.log('📝 Enviando postulación:', request);
            
            const response = await api.post('/api/applications', request);
            
            console.log('✅ Postulación enviada exitosamente');
            return response.data;
            
        } catch (error: any) {
            console.error('❌ Error enviando postulación:', error);
            
            if (error.response?.status === 400) {
                const message = error.response?.data?.message || 'Datos de postulación inválidos';
                throw new Error(message);
            } else if (error.response?.status === 409) {
                throw new Error('Ya existe una postulación para este RUT');
            } else if (error.response?.status === 500) {
                throw new Error('Error del servidor al procesar la postulación');
            }
            
            throw new Error('Error al enviar la postulación');
        }
    }
    
    async getMyApplications(): Promise<Application[]> {
        try {
            console.log('📋 Obteniendo mis postulaciones');

            const response = await api.get('/api/applications/my-applications');
            console.log('📋 Respuesta del servidor:', response);
            console.log('📋 response.data:', response.data);

            // Backend devuelve {success: true, data: [...], count: X}
            const applications = response.data.data || response.data;
            console.log('📋 Applications extraídas:', applications);
            console.log('📋 Es array?', Array.isArray(applications));

            if (!Array.isArray(applications)) {
                console.error('❌ Error: applications no es un array:', applications);
                return [];
            }

            return applications;

        } catch (error: any) {
            console.error('❌ Error obteniendo postulaciones:', error);
            throw new Error('Error al obtener las postulaciones');
        }
    }
    
    async getApplicationById(id: number): Promise<Application> {
        try {
            console.log('📄 Obteniendo postulación:', id);

            const response = await api.get(`/api/applications/${id}`);
            console.log('📄 Respuesta completa del backend:', response.data);

            // El backend devuelve los datos directamente, no en response.data.data
            return response.data;

        } catch (error: any) {
            console.error('❌ Error obteniendo postulación:', error);
            throw new Error('Error al obtener la postulación');
        }
    }
    
    async getDashboardData(): Promise<{
        applications: Application[];
        hasApplications: boolean;
        primaryApplication?: Application;
    }> {
        try {
            console.log('📊 Obteniendo datos del dashboard');
            
            // Primero intentar obtener las aplicaciones del usuario autenticado
            let applications: Application[] = [];
            
            try {
                applications = await this.getMyApplications();
                console.log('📋 Aplicaciones del usuario obtenidas:', applications);
            } catch (authError) {
                console.log('⚠️ Usuario no autenticado, intentando obtener datos públicos...');
                
                // Si falla la autenticación, intentar obtener datos públicos (solo para desarrollo)
                try {
                    const publicResponse = await api.get('/api/applications/public/all');
                    // Backend devuelve {success: true, data: [...], pagination: {...}}
                    applications = publicResponse.data.data || publicResponse.data || [];
                    console.log('📋 Datos públicos obtenidos:', applications);
                } catch (publicError) {
                    console.log('⚠️ No se pudieron obtener datos públicos, intentando datos mock...');
                    
                    // Si falla, intentar obtener datos mock
                    try {
                        const mockResponse = await api.get('/api/applications/public/mock-applications');
                        applications = mockResponse.data || [];
                        console.log('📋 Datos mock obtenidos:', applications);
                    } catch (mockError) {
                        console.log('⚠️ No se pudieron obtener datos mock:', mockError);
                    }
                }
            }
            
            console.log('📋 Tipo de applications:', typeof applications);
            console.log('📋 Es array?', Array.isArray(applications));
            
            if (!Array.isArray(applications)) {
                console.error('❌ Error: applications no es un array:', applications);
                return {
                    applications: [],
                    hasApplications: false
                };
            }
            
            return {
                applications,
                hasApplications: applications.length > 0,
                primaryApplication: applications.length > 0 ? applications[0] : undefined
            };
            
        } catch (error: any) {
            console.error('❌ Error obteniendo datos del dashboard:', error);
            return {
                applications: [],
                hasApplications: false
            };
        }
    }

    // Método para administradores: archivar postulación
    async archiveApplication(id: number): Promise<void> {
        try {
            console.log('📂 Admin: Archivando postulación:', id);

            await api.put(`/api/applications/${id}/archive`);

            console.log('✅ Admin: Postulación archivada exitosamente');

        } catch (error: any) {
            console.error('❌ Error archivando postulación:', error);

            if (error.response?.status === 404) {
                throw new Error('Postulación no encontrada');
            } else if (error.response?.status === 403) {
                throw new Error('No tienes permisos para archivar esta postulación');
            }

            throw new Error('Error al archivar la postulación');
        }
    }

    // US-9: Change application status with audit trail
    async updateApplicationStatus(
        id: number,
        newStatus: string,
        changeNote?: string
    ): Promise<{ success: boolean; message: string; data: any }> {
        try {
            console.log('🔄 Admin: Cambiando estado de postulación:', { id, newStatus, changeNote });

            const response = await api.patch(`/api/applications/${id}/status`, {
                status: newStatus,  // Backend expects 'status', not 'newStatus'
                notes: changeNote   // Backend expects 'notes', not 'changeNote'
            });

            console.log('✅ Admin: Estado actualizado exitosamente:', response.data);

            return response.data;

        } catch (error: any) {
            console.error('❌ Error actualizando estado:', error);

            if (error.response?.status === 404) {
                throw new Error('Postulación no encontrada');
            } else if (error.response?.status === 400) {
                throw new Error(error.response.data?.error || 'Estado inválido');
            } else if (error.response?.status === 403) {
                throw new Error('No tienes permisos para cambiar el estado');
            }

            throw new Error('Error al actualizar el estado de la postulación');
        }
    }

    // US-9: Get status change history for an application
    async getApplicationStatusHistory(id: number): Promise<any[]> {
        try {
            console.log('📜 Admin: Obteniendo historial de estados:', id);

            const response = await api.get(`/api/applications/${id}/status-history`);

            console.log('✅ Admin: Historial obtenido:', response.data);

            return response.data.data || [];

        } catch (error: any) {
            console.error('❌ Error obteniendo historial:', error);

            if (error.response?.status === 404) {
                throw new Error('Postulación no encontrada');
            }

            throw new Error('Error al obtener el historial de estados');
        }
    }

    // Función principal para enviar aplicaciones
    async submitApplication(data: ApplicationRequest): Promise<ApplicationResponse> {
        try {
            console.log('📝 Enviando postulación:', data);

            // Validar datos antes de enviar
            if (!data.firstName || !data.paternalLastName || !data.maternalLastName) {
                throw new Error('Faltan datos obligatorios del estudiante');
            }

            if (!data.rut || !data.birthDate || !data.grade) {
                throw new Error('Faltan datos básicos del estudiante');
            }

            // Transform data to match backend schema
            // Backend expects all data: student, parents, guardian, supporter
            const transformedData = {
                // Student data
                studentFirstName: data.firstName,
                studentPaternalLastName: data.paternalLastName,
                studentMaternalLastName: data.maternalLastName,
                studentRUT: data.rut,
                studentDateOfBirth: data.birthDate,
                gradeAppliedFor: this.transformGradeToBackend(data.grade),
                studentEmail: data.studentEmail || '',
                studentAddress: data.studentAddress || '',
                studentCurrentSchool: data.currentSchool || '',
                studentAdmissionPreference: data.admissionPreference || 'NINGUNA',
                studentPais: 'Chile',
                studentRegion: '',
                studentComuna: '',
                studentAdditionalNotes: data.additionalNotes || '',

                // Father data (parent1)
                parent1Name: data.parent1Name || '',
                parent1Rut: data.parent1Rut || '',
                parent1Email: data.parent1Email || '',
                parent1Phone: data.parent1Phone || '',
                parent1Address: data.parent1Address || '',
                parent1Profession: data.parent1Profession || '',

                // Mother data (parent2)
                parent2Name: data.parent2Name || '',
                parent2Rut: data.parent2Rut || '',
                parent2Email: data.parent2Email || '',
                parent2Phone: data.parent2Phone || '',
                parent2Address: data.parent2Address || '',
                parent2Profession: data.parent2Profession || '',

                // Guardian data
                guardianName: data.guardianName || '',
                guardianRut: data.guardianRut || '',
                guardianEmail: data.guardianEmail || '',
                guardianPhone: data.guardianPhone || '',
                guardianRelation: data.guardianRelation || 'OTRO',

                // Supporter data
                supporterName: data.supporterName || '',
                supporterRut: data.supporterRut || '',
                supporterEmail: data.supporterEmail || '',
                supporterPhone: data.supporterPhone || '',
                supporterRelation: data.supporterRelation || 'OTRO',

                // Additional notes
                additionalNotes: data.additionalNotes || ''
            };

            console.log('🔄 Datos transformados para el backend:', transformedData);

            // Enviar al backend
            const response = await api.post('/api/applications', transformedData);

            console.log('✅ Postulación enviada exitosamente:', response.data);

            // Backend devuelve {success: true, data: {id, status, ...}}
            const applicationData = response.data.data || response.data;

            return {
                success: true,
                message: response.data.message || 'Postulación enviada exitosamente',
                id: applicationData.id,
                studentName: applicationData.studentName,
                grade: applicationData.grade
            };

        } catch (error: any) {
            console.error('❌ Error enviando postulación:', error);

            // Manejo específico de errores HTTP
            if (error.response) {
                const status = error.response.status;
                const data = error.response.data;

                switch (status) {
                    case 400:
                        throw new Error(data.message || 'Datos de la postulación inválidos');
                    case 401:
                        throw new Error('No estás autorizado para enviar postulaciones');
                    case 403:
                        throw new Error('No tienes permisos para realizar esta acción');
                    case 409:
                        throw new Error(data.message || 'Ya existe una postulación con estos datos');
                    case 422:
                        // Errores de validación específicos
                        if (data.errors && Array.isArray(data.errors)) {
                            throw new Error(data.errors.join(', '));
                        }
                        throw new Error(data.message || 'Error de validación en los datos');
                    case 500:
                        throw new Error('Error interno del servidor. Intenta nuevamente.');
                    default:
                        throw new Error(data.message || 'Error desconocido al enviar la postulación');
                }
            } else if (error.request) {
                throw new Error('No se pudo conectar con el servidor. Verifica tu conexión.');
            } else {
                throw new Error(error.message || 'Error inesperado al enviar la postulación');
            }
        }
    }

    // Función para actualizar una postulación existente
    async updateApplication(applicationId: number, applicationData: any): Promise<any> {
        try {
            console.log('✏️ Actualizando postulación:', applicationId, applicationData);

            const response = await api.put(`/api/applications/${applicationId}`, applicationData);

            console.log('✅ Postulación actualizada exitosamente:', response.data);
            return response.data;
        } catch (error: any) {
            console.error('❌ Error actualizando postulación:', error);

            if (error.response) {
                const { status, data } = error.response;
                switch (status) {
                    case 400:
                        if (data.errors && Array.isArray(data.errors)) {
                            throw new Error(data.errors.join(', '));
                        }
                        throw new Error(data.message || 'Error de validación en los datos');
                    case 404:
                        throw new Error('Postulación no encontrada');
                    case 500:
                        throw new Error('Error interno del servidor. Intenta nuevamente.');
                    default:
                        throw new Error(data.message || 'Error desconocido al actualizar la postulación');
                }
            } else if (error.request) {
                throw new Error('No se pudo conectar con el servidor. Verifica tu conexión.');
            } else {
                throw new Error(error.message || 'Error inesperado al actualizar la postulación');
            }
        }
    }

    // Función para subir documentos
    async uploadDocument(applicationId: number, file: File, documentType: string): Promise<any> {
        try {
            console.log(`📎 Subiendo documento ${documentType} para aplicación ${applicationId}`);

            const formData = new FormData();
            formData.append('file', file);
            formData.append('documentType', documentType);
            formData.append('applicationId', applicationId.toString());

            const response = await api.post('/api/applications/documents', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            console.log('✅ Documento subido exitosamente:', response.data);
            return response.data;

        } catch (error: any) {
            console.error('❌ Error subiendo documento:', error);

            if (error.response) {
                const status = error.response.status;
                const data = error.response.data;

                switch (status) {
                    case 400:
                        throw new Error(data.message || 'Archivo o tipo de documento inválido');
                    case 401:
                        throw new Error('No estás autorizado para subir documentos');
                    case 413:
                        throw new Error('El archivo es demasiado grande');
                    case 415:
                        throw new Error('Tipo de archivo no permitido');
                    case 422:
                        throw new Error(data.message || 'Error de validación del documento');
                    default:
                        throw new Error(data.message || 'Error al subir el documento');
                }
            }

            throw new Error('Error de conexión al subir el documento');
        }
    }

    async getApplicationDocuments(applicationId: number): Promise<any> {
        try {
            const response = await api.get(`/api/applications/${applicationId}/documents`);
            return response.data;
        } catch (error: any) {
            if (error.response?.data) {
                const data = error.response.data;
                throw new Error(data.message || data.error || 'Error al cargar documentos');
            }
            throw new Error('Error de conexión al cargar documentos');
        }
    }

    // Update document approval status
    async updateDocumentApprovalStatus(
        documentId: number,
        approvalStatus: 'PENDING' | 'APPROVED' | 'REJECTED'
    ): Promise<any> {
        try {
            console.log(`📋 Actualizando estado de aprobación del documento ${documentId} a ${approvalStatus}`);

            const response = await api.put(
                `/api/applications/documents/${documentId}/approval`,
                { approvalStatus }
            );

            console.log('✅ Estado de aprobación actualizado:', response.data);
            return response.data;

        } catch (error: any) {
            console.error('❌ Error actualizando estado de aprobación:', error);

            if (error.response) {
                const { status, data } = error.response;
                switch (status) {
                    case 400:
                        throw new Error(data.error || 'Datos inválidos');
                    case 403:
                        throw new Error('No tienes permisos para aprobar documentos');
                    case 404:
                        throw new Error('Documento no encontrado');
                    default:
                        throw new Error(data.error || 'Error al actualizar estado de aprobación');
                }
            }

            throw new Error('Error de conexión al actualizar estado de aprobación');
        }
    }

    // Get complementary form data for an application
    async getComplementaryForm(applicationId: number): Promise<any> {
        try {
            console.log(`📋 Obteniendo formulario complementario para aplicación ${applicationId}`);

            const response = await api.get(`/api/applications/${applicationId}/complementary-form`);

            console.log('✅ Formulario complementario obtenido:', response.data);
            const backendData = response.data.data || response.data;

            // Transform snake_case backend fields to camelCase frontend fields
            if (backendData) {
                const transformedData = {
                    otherSchools: backendData.other_schools,
                    fatherEducation: backendData.father_education,
                    fatherCurrentActivity: backendData.father_current_activity,
                    motherEducation: backendData.mother_education,
                    motherCurrentActivity: backendData.mother_current_activity,
                    applicationReasons: backendData.application_reasons,
                    schoolChangeReason: backendData.school_change_reason,
                    familyValues: backendData.family_values,
                    faithExperiences: backendData.faith_experiences,
                    communityServiceExperiences: backendData.community_service_experiences,
                    childrenDescriptions: backendData.children_descriptions || [],
                    isSubmitted: backendData.is_submitted,
                    submittedAt: backendData.submitted_at,
                    // Also include camelCase versions if backend provides them (for compatibility)
                    ...backendData
                };
                console.log('✅ Datos transformados a camelCase:', transformedData);
                return transformedData;
            }

            return backendData;

        } catch (error: any) {
            console.error('❌ Error obteniendo formulario complementario:', error);

            if (error.response?.status === 404) {
                // Formulario no existe todavía, eso es válido
                return null;
            }

            throw new Error('Error al obtener el formulario complementario');
        }
    }

    // Save complementary form data for an application
    async saveComplementaryForm(applicationId: number, formData: any): Promise<any> {
        try {
            console.log(`📝 Guardando formulario complementario para aplicación ${applicationId}`);

            const response = await api.post(`/api/applications/${applicationId}/complementary-form`, formData);

            console.log('✅ Formulario complementario guardado:', response.data);
            return response.data;

        } catch (error: any) {
            console.error('❌ Error guardando formulario complementario:', error);

            if (error.response) {
                const { status, data } = error.response;
                switch (status) {
                    case 400:
                        throw new Error(data.error || 'Datos del formulario inválidos');
                    case 403:
                        throw new Error('No tienes permisos para guardar este formulario');
                    case 404:
                        throw new Error('Postulación no encontrada');
                    default:
                        throw new Error(data.error || 'Error al guardar el formulario complementario');
                }
            }

            throw new Error('Error de conexión al guardar el formulario complementario');
        }
    }
}

export const applicationService = new ApplicationService();