import React, { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import WeeklyCalendar from '../components/schedule/WeeklyCalendar';
import ScheduleCalendarView from '../components/schedule/ScheduleCalendarView';
import ScheduleAnalytics from '../components/schedule/ScheduleAnalytics';
import { Calendar, Settings, BarChart3, Clock, Users, ChevronRight } from 'lucide-react';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';

const ScheduleDashboard: React.FC = () => {
    const { user } = useContext(AuthContext);
    const [activeTab, setActiveTab] = useState<'schedule' | 'calendar' | 'analytics'>('schedule');
    const [selectedDate, setSelectedDate] = useState<string | null>(null);

    if (!user) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <div className="text-center">
                    <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gris-piedra">Acceso denegado. Inicia sesión para continuar.</p>
                </div>
            </div>
        );
    }

    const isAdmin = user.role === 'ADMIN';
    const isAuthorized = ['ADMIN', 'CYCLE_DIRECTOR', 'PSYCHOLOGIST', 'COORDINATOR', 'INTERVIEWER'].includes(user.role);

    if (!isAuthorized) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <div className="text-center">
                    <Settings className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h2 className="text-xl font-semibold text-gris-piedra mb-2">Acceso Restringido</h2>
                    <p className="text-gris-piedra">
                        Esta sección está disponible solo para administradores y entrevistadores.
                    </p>
                </div>
            </div>
        );
    }

    const tabs = [
        {
            key: 'schedule',
            label: 'Mis Horarios',
            icon: <Settings className="w-4 h-4" />,
            description: 'Configura tus horarios de disponibilidad'
        },
        {
            key: 'calendar',
            label: 'Calendario',
            icon: <Calendar className="w-4 h-4" />,
            description: 'Vista de calendario con disponibilidad'
        }
    ];

    if (isAdmin) {
        tabs.push({
            key: 'analytics',
            label: 'Analíticas',
            icon: <BarChart3 className="w-4 h-4" />,
            description: 'Reportes y estadísticas del sistema'
        });
    }

    const getCurrentTabComponent = () => {
        switch (activeTab) {
            case 'schedule':
                return (
                    <WeeklyCalendar
                        userId={user.id}
                        userRole={user.role}
                        onScheduleChange={() => {
                            console.log('📅 Horarios actualizados en ScheduleDashboard');
                        }}
                    />
                );
            case 'calendar':
                return (
                    <ScheduleCalendarView 
                        onDateSelect={setSelectedDate}
                        showAvailabilitySummary={true}
                    />
                );
            case 'analytics':
                return isAdmin ? (
                    <ScheduleAnalytics year={new Date().getFullYear()} />
                ) : null;
            default:
                return null;
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="container mx-auto px-6 max-w-7xl">
                {/* Header */}
                <div className="mb-8">
                    <div className="flex items-center gap-2 text-sm text-gris-piedra mb-2">
                        <span>Dashboard</span>
                        <ChevronRight className="w-4 h-4" />
                        <span className="text-azul-monte-tabor font-medium">Sistema de Horarios</span>
                    </div>
                    
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                        <div>
                            <h1 className="text-3xl font-bold text-azul-monte-tabor mb-2">
                                Sistema de Horarios de Entrevistadores
                            </h1>
                            <p className="text-gris-piedra text-lg">
                                {isAdmin 
                                    ? 'Gestiona los horarios de disponibilidad de todos los entrevistadores del sistema'
                                    : 'Configura tus horarios de disponibilidad para entrevistas de admisión'
                                }
                            </p>
                        </div>

                        <div className="flex items-center gap-3">
                            <Badge variant="info">
                                {user.firstName} {user.lastName}
                            </Badge>
                            <Badge variant={isAdmin ? 'success' : 'secondary'}>
                                {user.role}
                            </Badge>
                        </div>
                    </div>
                </div>

                {/* System Info Card */}
                <Card className="p-6 mb-8 border-l-4 border-azul-monte-tabor bg-blue-50">
                    <div className="flex items-start gap-4">
                        <div className="p-2 bg-azul-monte-tabor rounded-lg">
                            <Clock className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <h3 className="font-semibold text-azul-monte-tabor mb-2">
                                Sistema de Horarios Inteligente
                            </h3>
                            <p className="text-gris-piedra mb-3">
                                Este sistema permite a los entrevistadores configurar sus horarios de disponibilidad 
                                y automáticamente filtra los entrevistadores disponibles al crear nuevas entrevistas.
                            </p>
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
                                <div className="flex items-center gap-2">
                                    <div className="w-2 h-2 rounded-full bg-green-500"></div>
                                    <span>Horarios recurrentes semanales</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                                    <span>Fechas específicas personalizadas</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="w-2 h-2 rounded-full bg-red-500"></div>
                                    <span>Excepciones y días no disponibles</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </Card>

                {/* Tab Navigation */}
                <div className="mb-8">
                    <div className="border-b border-gray-200">
                        <nav className="flex space-x-8">
                            {tabs.map((tab) => (
                                <button
                                    key={tab.key}
                                    onClick={() => setActiveTab(tab.key as any)}
                                    className={`
                                        group relative py-4 px-1 border-b-2 font-medium text-sm transition-colors
                                        ${activeTab === tab.key
                                            ? 'border-azul-monte-tabor text-azul-monte-tabor'
                                            : 'border-transparent text-gris-piedra hover:text-azul-monte-tabor hover:border-gray-300'
                                        }
                                    `}
                                >
                                    <div className="flex items-center gap-2">
                                        {tab.icon}
                                        <span>{tab.label}</span>
                                    </div>
                                    
                                    {/* Tooltip */}
                                    <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-1 bg-black text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                                        {tab.description}
                                    </div>
                                </button>
                            ))}
                        </nav>
                    </div>
                </div>

                {/* Active Tab Content */}
                <div className="transition-all duration-300">
                    {getCurrentTabComponent()}
                </div>

                {/* Selected Date Info */}
                {selectedDate && activeTab === 'calendar' && (
                    <Card className="p-4 mt-6 bg-blue-50 border-blue-200">
                        <div className="flex items-center gap-3">
                            <Calendar className="w-5 h-5 text-azul-monte-tabor" />
                            <div>
                                <span className="font-semibold text-azul-monte-tabor">Fecha seleccionada: </span>
                                <span className="text-gris-piedra">
                                    {new Date(selectedDate).toLocaleDateString('es-CL', {
                                        weekday: 'long',
                                        year: 'numeric',
                                        month: 'long',
                                        day: 'numeric'
                                    })}
                                </span>
                            </div>
                            <Button 
                                size="sm" 
                                variant="outline"
                                onClick={() => setSelectedDate(null)}
                            >
                                Limpiar selección
                            </Button>
                        </div>
                    </Card>
                )}

                {/* Quick Actions - Admin Only */}
                {isAdmin && (
                    <Card className="p-6 mt-8">
                        <h3 className="text-lg font-semibold text-azul-monte-tabor mb-4">
                            Acciones Rápidas para Administradores
                        </h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                            <Button
                                variant="outline"
                                className="justify-start"
                                leftIcon={<Users className="w-4 h-4" />}
                            >
                                Gestionar Entrevistadores
                            </Button>
                            <Button
                                variant="outline"
                                className="justify-start"
                                leftIcon={<Calendar className="w-4 h-4" />}
                            >
                                Configurar Horarios Masivos
                            </Button>
                            <Button
                                variant="outline"
                                className="justify-start"
                                leftIcon={<BarChart3 className="w-4 h-4" />}
                            >
                                Ver Reportes Detallados
                            </Button>
                            <Button
                                variant="outline"
                                className="justify-start"
                                leftIcon={<Settings className="w-4 h-4" />}
                            >
                                Configuración del Sistema
                            </Button>
                        </div>
                    </Card>
                )}

                {/* Footer */}
                <div className="mt-12 pt-8 border-t border-gray-200">
                    <div className="text-center text-sm text-gris-piedra">
                        <p>
                            Sistema de Gestión de Horarios de Entrevistadores - 
                            Colegio Monte Tabor y Nazaret © {new Date().getFullYear()}
                        </p>
                        <p className="mt-1">
                            Diseñado para optimizar la programación automática de entrevistas de admisión
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ScheduleDashboard;