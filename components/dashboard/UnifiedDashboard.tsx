import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { unifiedApiService, DashboardAPI } from '../../services/unifiedApiService';
import { BarChart3, Users, Calendar, Clock, TrendingUp, AlertCircle } from 'lucide-react';
import Card from '../ui/Card';
import Badge from '../ui/Badge';

/**
 * 🎯 DASHBOARD UNIFICADO
 * 
 * Ejemplo de cómo el nuevo sistema consolidado reduce la complejidad:
 * 
 * ANTES:
 * - 8 servicios diferentes (interviewService, applicationService, evaluationService, etc.)
 * - 15+ API calls separados
 * - Múltiples estados de loading
 * - Lógica duplicada
 * 
 * DESPUÉS:
 * - 1 servicio unificado
 * - 1-3 API calls máximo
 * - Estado centralizado
 * - Lógica simplificada
 */

interface DashboardData {
    interviewStats?: any;
    applicationStats?: any;
    evaluationStats?: any;
    todaysInterviews?: any[];
    upcomingInterviews?: any[];
    recentApplications?: any[];
    pendingEvaluations?: any[];
}

const UnifiedDashboard: React.FC = () => {
    const { user } = useContext(AuthContext);
    const [dashboardData, setDashboardData] = useState<DashboardData>({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        loadDashboardData();
    }, [user]);

    const loadDashboardData = async () => {
        if (!user) return;

        try {
            setLoading(true);
            setError(null);

            let data: DashboardData = {};

            // 🎯 UN SOLO API CALL para Admin Dashboard
            if (user.role === 'ADMIN' || user.role === 'CYCLE_DIRECTOR') {
                // ANTES: 8-10 API calls separados
                // DESPUÉS: 1 API call
                data = await DashboardAPI.getAdmin();
            } 
            // 🎯 UN SOLO API CALL para Professor Dashboard  
            else if (['TEACHER', 'PSYCHOLOGIST', 'COORDINATOR'].includes(user.role)) {
                // ANTES: 5-6 API calls separados
                // DESPUÉS: 1 API call
                data = await DashboardAPI.getProfessor(user.id);
            }

            setDashboardData(data);

        } catch (err) {
            console.error('Error loading dashboard:', err);
            setError(err instanceof Error ? err.message : 'Error al cargar dashboard');
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center py-12">
                <div className="text-center">
                    <BarChart3 className="w-8 h-8 text-azul-monte-tabor mx-auto mb-2 animate-pulse" />
                    <p className="text-gris-piedra">Cargando dashboard unificado...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <Card className="p-6 border-red-200 bg-red-50">
                <div className="flex items-center gap-2 text-red-800">
                    <AlertCircle className="w-5 h-5" />
                    <div>
                        <h3 className="font-semibold">Error al cargar dashboard</h3>
                        <p className="text-sm">{error}</p>
                    </div>
                </div>
            </Card>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-azul-monte-tabor">
                        Dashboard Unificado
                    </h1>
                    <p className="text-gris-piedra">
                        Bienvenido, {user?.firstName} {user?.lastName}
                    </p>
                </div>
                <Badge variant="info" className="text-sm">
                    API Consolidada v2.0
                </Badge>
            </div>

            {/* Performance Metrics */}
            <Card className="p-4 bg-green-50 border-green-200">
                <div className="flex items-center gap-3">
                    <TrendingUp className="w-5 h-5 text-green-600" />
                    <div className="flex-1">
                        <h3 className="font-semibold text-green-800">
                            Mejora de Performance
                        </h3>
                        <p className="text-sm text-green-700">
                            Dashboard cargado con {
                                user?.role === 'ADMIN' ? '1 API call' : 
                                ['TEACHER', 'PSYCHOLOGIST', 'COORDINATOR'].includes(user?.role || '') ? '1 API call' : 
                                'APIs optimizadas'
                            } (antes: 8-15 calls)
                        </p>
                    </div>
                </div>
            </Card>

            {/* Statistics Cards */}
            {dashboardData.interviewStats && (
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <Card className="p-6">
                        <div className="flex items-center justify-between mb-2">
                            <h3 className="text-sm font-medium text-gris-piedra">Total Entrevistas</h3>
                            <Calendar className="w-5 h-5 text-azul-monte-tabor" />
                        </div>
                        <div className="text-2xl font-bold text-azul-monte-tabor">
                            {dashboardData.interviewStats.totalInterviews || 0}
                        </div>
                        <div className="text-xs text-gris-piedra mt-1">
                            {dashboardData.interviewStats.scheduledInterviews || 0} programadas
                        </div>
                    </Card>

                    <Card className="p-6">
                        <div className="flex items-center justify-between mb-2">
                            <h3 className="text-sm font-medium text-gris-piedra">Completadas</h3>
                            <Clock className="w-5 h-5 text-verde-esperanza" />
                        </div>
                        <div className="text-2xl font-bold text-verde-esperanza">
                            {dashboardData.interviewStats.completedInterviews || 0}
                        </div>
                        <div className="text-xs text-gris-piedra mt-1">
                            {Math.round(dashboardData.interviewStats.completionRate || 0)}% tasa
                        </div>
                    </Card>

                    <Card className="p-6">
                        <div className="flex items-center justify-between mb-2">
                            <h3 className="text-sm font-medium text-gris-piedra">Aplicaciones</h3>
                            <Users className="w-5 h-5 text-dorado-nazaret" />
                        </div>
                        <div className="text-2xl font-bold text-dorado-nazaret">
                            {dashboardData.applicationStats?.totalApplications || 0}
                        </div>
                        <div className="text-xs text-gris-piedra mt-1">
                            {dashboardData.applicationStats?.pendingApplications || 0} pendientes
                        </div>
                    </Card>

                    <Card className="p-6">
                        <div className="flex items-center justify-between mb-2">
                            <h3 className="text-sm font-medium text-gris-piedra">Evaluaciones</h3>
                            <BarChart3 className="w-5 h-5 text-rojo-nazaret" />
                        </div>
                        <div className="text-2xl font-bold text-rojo-nazaret">
                            {dashboardData.evaluationStats?.totalEvaluations || 0}
                        </div>
                        <div className="text-xs text-gris-piedra mt-1">
                            {dashboardData.evaluationStats?.pendingEvaluations || 0} pendientes
                        </div>
                    </Card>
                </div>
            )}

            {/* Today's Interviews */}
            {dashboardData.todaysInterviews && dashboardData.todaysInterviews.length > 0 && (
                <Card className="p-6">
                    <h3 className="text-lg font-semibold text-azul-monte-tabor mb-4">
                        Entrevistas de Hoy ({dashboardData.todaysInterviews.length})
                    </h3>
                    <div className="space-y-3">
                        {dashboardData.todaysInterviews.slice(0, 5).map((interview: any, index: number) => (
                            <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                <div className="flex items-center gap-3">
                                    <Clock className="w-4 h-4 text-gris-piedra" />
                                    <div>
                                        <p className="font-medium text-azul-monte-tabor">
                                            {interview.scheduledTime} - {interview.type}
                                        </p>
                                        <p className="text-sm text-gris-piedra">
                                            {interview.location}
                                        </p>
                                    </div>
                                </div>
                                <Badge variant="info" size="sm">
                                    {interview.status}
                                </Badge>
                            </div>
                        ))}
                    </div>
                </Card>
            )}

            {/* Recent Applications */}
            {dashboardData.recentApplications && dashboardData.recentApplications.length > 0 && (
                <Card className="p-6">
                    <h3 className="text-lg font-semibold text-azul-monte-tabor mb-4">
                        Aplicaciones Recientes ({dashboardData.recentApplications.length})
                    </h3>
                    <div className="space-y-3">
                        {dashboardData.recentApplications.slice(0, 5).map((application: any, index: number) => (
                            <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                <div className="flex items-center gap-3">
                                    <Users className="w-4 h-4 text-gris-piedra" />
                                    <div>
                                        <p className="font-medium text-azul-monte-tabor">
                                            {application.student?.firstName} {application.student?.lastName}
                                        </p>
                                        <p className="text-sm text-gris-piedra">
                                            {application.submissionDate}
                                        </p>
                                    </div>
                                </div>
                                <Badge 
                                    variant={
                                        application.status === 'APPROVED' ? 'success' :
                                        application.status === 'REJECTED' ? 'danger' :
                                        application.status === 'UNDER_REVIEW' ? 'warning' : 'info'
                                    } 
                                    size="sm"
                                >
                                    {application.status}
                                </Badge>
                            </div>
                        ))}
                    </div>
                </Card>
            )}

            {/* API Usage Info */}
            <Card className="p-4 bg-blue-50 border-blue-200">
                <div className="flex items-center gap-3">
                    <BarChart3 className="w-5 h-5 text-blue-600" />
                    <div className="flex-1">
                        <h3 className="font-semibold text-blue-800">
                            Sistema API Consolidado
                        </h3>
                        <p className="text-sm text-blue-700">
                            Este dashboard utiliza endpoints unificados que reducen las llamadas API de {' '}
                            <strong>317 endpoints específicos</strong> a <strong>~6 endpoints raíz</strong> con parámetros dinámicos.
                        </p>
                    </div>
                </div>
            </Card>
        </div>
    );
};

export default UnifiedDashboard;