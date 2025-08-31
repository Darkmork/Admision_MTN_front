import axios from 'axios';

/**
 * 🎯 SERVICIO API UNIFICADO
 * 
 * Este servicio reemplaza múltiples servicios específicos y utiliza endpoints consolidados
 * para reducir la complejidad y mejorar el performance.
 * 
 * BENEFICIOS:
 * - Menos requests HTTP (batch requests)
 * - Lógica centralizada
 * - Mejor caching
 * - Mantenimiento simplificado
 */

const API_BASE_URL = 'http://localhost:8080/api/unified';

interface QueryOptions {
    include?: string[];
    filters?: Record<string, any>;
    pagination?: {
        page: number;
        size: number;
        sortBy?: string;
        sortDir?: 'asc' | 'desc';
    };
    special?: string[];
}

class UnifiedApiService {
    private static instance: UnifiedApiService;

    public static getInstance(): UnifiedApiService {
        if (!UnifiedApiService.instance) {
            UnifiedApiService.instance = new UnifiedApiService();
        }
        return UnifiedApiService.instance;
    }

    private getAuthHeaders() {
        const token = localStorage.getItem('auth_token') || localStorage.getItem('professor_token');
        return token ? { Authorization: `Bearer ${token}` } : {};
    }

    private buildQueryParams(options: QueryOptions): URLSearchParams {
        const params = new URLSearchParams();
        
        if (options.include?.length) {
            params.append('include', options.include.join(','));
        }
        
        if (options.special?.length) {
            params.append('special', options.special.join(','));
        }
        
        if (options.filters) {
            Object.entries(options.filters).forEach(([key, value]) => {
                if (value !== null && value !== undefined) {
                    params.append(key, String(value));
                }
            });
        }
        
        if (options.pagination) {
            const { page, size, sortBy, sortDir } = options.pagination;
            params.append('page', String(page));
            params.append('size', String(size));
            if (sortBy) params.append('sortBy', sortBy);
            if (sortDir) params.append('sortDir', sortDir);
        }
        
        return params;
    }

    // 🎯 ENTREVISTAS - Reemplaza InterviewService completo
    async getInterviews(options: QueryOptions = {}) {
        try {
            const params = this.buildQueryParams(options);
            const response = await axios.get(`${API_BASE_URL}/interviews?${params}`, {
                headers: this.getAuthHeaders()
            });
            return response.data;
        } catch (error) {
            console.error('Error fetching interviews:', error);
            throw error;
        }
    }

    // 🎯 Método específico para dashboard de entrevistas
    async getInterviewsDashboard() {
        return this.getInterviews({
            include: ['statistics'],
            special: ['today', 'upcoming', 'overdue', 'requiring-followup']
        });
    }

    // 🎯 Método específico para entrevistas por entrevistador
    async getInterviewsByInterviewer(interviewerId: number, includeStats = false) {
        return this.getInterviews({
            filters: { interviewer: interviewerId },
            include: includeStats ? ['statistics'] : [],
            pagination: { page: 0, size: 50, sortBy: 'scheduledDate', sortDir: 'desc' }
        });
    }

    // 🎯 APLICACIONES - Reemplaza ApplicationService completo
    async getApplications(options: QueryOptions = {}) {
        try {
            const params = this.buildQueryParams(options);
            const response = await axios.get(`${API_BASE_URL}/applications?${params}`, {
                headers: this.getAuthHeaders()
            });
            return response.data;
        } catch (error) {
            console.error('Error fetching applications:', error);
            throw error;
        }
    }

    // 🎯 Dashboard de aplicaciones
    async getApplicationsDashboard() {
        return this.getApplications({
            include: ['statistics'],
            special: ['recent', 'requiring-documents']
        });
    }

    // 🎯 Buscar aplicaciones
    async searchApplications(searchTerm: string, status?: string) {
        return this.getApplications({
            filters: { 
                search: searchTerm,
                status: status
            },
            pagination: { page: 0, size: 20, sortBy: 'submissionDate', sortDir: 'desc' }
        });
    }

    // 🎯 EVALUACIONES - Reemplaza EvaluationService completo  
    async getEvaluations(options: QueryOptions = {}) {
        try {
            const params = this.buildQueryParams(options);
            const response = await axios.get(`${API_BASE_URL}/evaluations?${params}`, {
                headers: this.getAuthHeaders()
            });
            return response.data;
        } catch (error) {
            console.error('Error fetching evaluations:', error);
            throw error;
        }
    }

    // 🎯 Evaluaciones por evaluador
    async getEvaluationsByEvaluator(evaluatorId: number) {
        return this.getEvaluations({
            filters: { evaluator: evaluatorId },
            include: ['statistics']
        });
    }

    // 🎯 DISPONIBILIDAD - Reemplaza InterviewerScheduleService + InterviewAvailabilityService
    async getAvailability(options: {
        date?: string;
        time?: string;
        interviewType?: string;
        year?: number;
        interviewer?: number;
        include?: string[];
    } = {}) {
        try {
            const params = new URLSearchParams();
            
            Object.entries(options).forEach(([key, value]) => {
                if (value !== null && value !== undefined) {
                    if (key === 'include' && Array.isArray(value)) {
                        params.append(key, value.join(','));
                    } else {
                        params.append(key, String(value));
                    }
                }
            });
            
            const response = await axios.get(`${API_BASE_URL}/availability?${params}`, {
                headers: this.getAuthHeaders()
            });
            return response.data;
        } catch (error) {
            console.error('Error fetching availability:', error);
            throw error;
        }
    }

    // 🎯 Obtener entrevistadores disponibles para fecha/hora
    async getAvailableInterviewers(date: string, time: string, interviewType?: string) {
        return this.getAvailability({
            date,
            time,
            interviewType
        });
    }

    // 🎯 Resumen de disponibilidad para calendario
    async getAvailabilitySummary(date: string) {
        return this.getAvailability({
            date,
            include: ['summary']
        });
    }

    // 🎯 Horarios de un entrevistador específico
    async getInterviewerSchedules(interviewerId: number, year?: number, includeWorkload = false) {
        return this.getAvailability({
            interviewer: interviewerId,
            year,
            include: includeWorkload ? ['workload'] : []
        });
    }

    // 🎯 QUERIES COMPLEJAS - Para casos que requieren múltiples recursos
    async complexQuery(queryRequest: {
        entities: string[];
        filters?: Record<string, any>;
        include?: Record<string, string[]>;
    }) {
        try {
            const response = await axios.post(`${API_BASE_URL}/query`, queryRequest, {
                headers: this.getAuthHeaders()
            });
            return response.data;
        } catch (error) {
            console.error('Error in complex query:', error);
            throw error;
        }
    }

    // 🎯 DASHBOARD UNIFICADO - Un solo call para todo el dashboard
    async getDashboard(modules?: string[]) {
        try {
            const params = modules?.length 
                ? `?modules=${modules.join(',')}`
                : '';
            
            const response = await axios.get(`${API_BASE_URL}/dashboard${params}`, {
                headers: this.getAuthHeaders()
            });
            return response.data;
        } catch (error) {
            console.error('Error fetching dashboard:', error);
            throw error;
        }
    }

    // 🎯 MÉTODOS DE CONVENIENCIA ESPECÍFICOS

    // Dashboard completo del admin
    async getAdminDashboard() {
        return this.getDashboard(['interviews', 'applications', 'evaluations']);
    }

    // Dashboard del profesor  
    async getProfessorDashboard(professorId: number) {
        const [interviews, evaluations] = await Promise.all([
            this.getInterviewsByInterviewer(professorId, true),
            this.getEvaluationsByEvaluator(professorId)
        ]);
        
        return {
            interviews,
            evaluations,
            summary: {
                pendingInterviews: interviews.interviews?.filter((i: any) => i.status === 'SCHEDULED')?.length || 0,
                pendingEvaluations: evaluations.evaluations?.filter((e: any) => e.status === 'PENDING')?.length || 0
            }
        };
    }

    // Datos para crear nueva entrevista
    async getInterviewCreationData(date: string, time: string, interviewType: string) {
        return this.complexQuery({
            entities: ['interviews'],
            filters: { date, time, interviewType }
        });
    }

    // Resumen semanal
    async getWeeklySummary(startDate: string, endDate: string) {
        return this.complexQuery({
            entities: ['interviews', 'applications', 'evaluations'],
            filters: {
                dateFrom: startDate,
                dateTo: endDate
            }
        });
    }

    // 🎯 CACHE MANAGEMENT
    private cache = new Map<string, { data: any; timestamp: number; ttl: number }>();

    private getCacheKey(endpoint: string, params: any): string {
        return `${endpoint}_${JSON.stringify(params)}`;
    }

    async getCachedData<T>(
        endpoint: string, 
        params: any, 
        fetcher: () => Promise<T>, 
        ttlMinutes: number = 5
    ): Promise<T> {
        const key = this.getCacheKey(endpoint, params);
        const cached = this.cache.get(key);
        const now = Date.now();

        if (cached && (now - cached.timestamp) < cached.ttl) {
            return cached.data;
        }

        const data = await fetcher();
        this.cache.set(key, {
            data,
            timestamp: now,
            ttl: ttlMinutes * 60 * 1000
        });

        return data;
    }

    clearCache() {
        this.cache.clear();
    }

    // 🎯 BATCH OPERATIONS
    async batchRequest(requests: Array<{
        method: 'get' | 'post';
        endpoint: string;
        params?: any;
        data?: any;
    }>) {
        try {
            const promises = requests.map(req => {
                if (req.method === 'get') {
                    const params = new URLSearchParams(req.params || {});
                    return axios.get(`${API_BASE_URL}/${req.endpoint}?${params}`, {
                        headers: this.getAuthHeaders()
                    });
                } else {
                    return axios.post(`${API_BASE_URL}/${req.endpoint}`, req.data, {
                        headers: this.getAuthHeaders()
                    });
                }
            });

            const responses = await Promise.all(promises);
            return responses.map(res => res.data);
        } catch (error) {
            console.error('Error in batch request:', error);
            throw error;
        }
    }
}

// Singleton export
export const unifiedApiService = UnifiedApiService.getInstance();

// Named exports for specific use cases
export const InterviewAPI = {
    getAll: (options?: QueryOptions) => unifiedApiService.getInterviews(options),
    getDashboard: () => unifiedApiService.getInterviewsDashboard(),
    getByInterviewer: (id: number) => unifiedApiService.getInterviewsByInterviewer(id),
    getAvailable: (date: string, time: string, type?: string) => 
        unifiedApiService.getAvailableInterviewers(date, time, type)
};

export const ApplicationAPI = {
    getAll: (options?: QueryOptions) => unifiedApiService.getApplications(options),
    getDashboard: () => unifiedApiService.getApplicationsDashboard(),
    search: (term: string, status?: string) => unifiedApiService.searchApplications(term, status)
};

export const EvaluationAPI = {
    getAll: (options?: QueryOptions) => unifiedApiService.getEvaluations(options),
    getByEvaluator: (id: number) => unifiedApiService.getEvaluationsByEvaluator(id)
};

export const DashboardAPI = {
    getAdmin: () => unifiedApiService.getAdminDashboard(),
    getProfessor: (id: number) => unifiedApiService.getProfessorDashboard(id),
    getWeekly: (start: string, end: string) => unifiedApiService.getWeeklySummary(start, end)
};

export default unifiedApiService;