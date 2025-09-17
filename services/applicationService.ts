import api from './api';
import { DataAdapter } from './dataAdapter';

export interface ApplicationRequest {
    // Datos del estudiante
    firstName: string;
    lastName: string;
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
        firstName: string;
        lastName: string;
        maternalLastName?: string;
        rut: string;
        birthDate: string;
        email?: string;
        address: string;
        gradeApplied: string;
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
    
    // Método mejorado para administradores: obtener todas las postulaciones desde microservicio
    async getAllApplications(): Promise<Application[]> {
        try {
            console.log('📊 Admin: Obteniendo postulaciones desde microservicio');
            
            // Usar endpoints reales del microservicio
            let response;
            const endpoints = [
                '/api/applications/public/all',  // Endpoint que sabemos que funciona
                '/api/applications',             // Endpoint principal
                '/api/applications/all',         // Endpoint alternativo
            ];
            
            for (const endpoint of endpoints) {
                try {
                    console.log(`🔄 Probando endpoint: ${endpoint}`);
                    response = await api.get(endpoint);
                    console.log(`✅ Éxito con endpoint: ${endpoint}`, response.data);
                    break;
                } catch (endpointError) {
                    console.log(`❌ Falló endpoint: ${endpoint}`, endpointError.response?.status);
                    continue;
                }
            }
            
            if (!response) {
                throw new Error('Ningún endpoint de aplicaciones disponible');
            }
            
            // Usar el adaptador para convertir datos simples a estructura compleja
            const adaptedApplications = DataAdapter.adaptApplicationApiResponse(response);
            
            console.log('✅ Admin: Postulaciones adaptadas exitosamente:', adaptedApplications.length);
            console.log('📋 Primera postulación adaptada:', adaptedApplications[0]);
            return adaptedApplications;
            
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
            console.log('📋 Tipo de response.data:', typeof response.data);
            console.log('📋 Es array?', Array.isArray(response.data));
            
            if (!Array.isArray(response.data)) {
                console.error('❌ Error: response.data no es un array:', response.data);
                return [];
            }
            
            return response.data;
            
        } catch (error: any) {
            console.error('❌ Error obteniendo postulaciones:', error);
            throw new Error('Error al obtener las postulaciones');
        }
    }
    
    async getApplicationById(id: number): Promise<Application> {
        try {
            console.log('📄 Obteniendo postulación:', id);
            
            const response = await api.get(`/api/applications/${id}`);
            
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
                    applications = publicResponse.data || [];
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
}

export const applicationService = new ApplicationService();