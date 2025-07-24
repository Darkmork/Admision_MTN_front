
import React, { useState, useMemo } from 'react';
import Card from '../components/ui/Card';
import Table from '../components/ui/Table';
import Badge from '../components/ui/Badge';
import Button from '../components/ui/Button';
import Modal from '../components/ui/Modal';
import { mockApplications } from '../services/mockData';
import { ApplicationStatus, Application } from '../types';
import { DashboardIcon, FileTextIcon, UsersIcon, BarChartIcon, CheckCircleIcon } from '../components/icons/Icons';
import { useApplications, useNotifications } from '../context/AppContext';

const sections = [
  { key: 'dashboard', label: 'Dashboard General' },
  { key: 'postulaciones', label: 'Gestión de Postulaciones' },
  { key: 'entrevistas', label: 'Gestión de Entrevistas' },
  { key: 'reportes', label: 'Reportes' },
  { key: 'usuarios', label: 'Gestión de Usuarios' },
  { key: 'notificaciones', label: 'Notificaciones' },
  { key: 'historial', label: 'Historial de Acciones' },
  { key: 'cuenta', label: 'Opciones de Cuenta' },
  { key: 'ayuda', label: 'Ayuda y Soporte' },
];

const AdminDashboard: React.FC = () => {
  const [activeSection, setActiveSection] = useState('dashboard');
  const [selectedApplication, setSelectedApplication] = useState<Application | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { applications: contextApplications, updateApplication } = useApplications();
  const { addNotification } = useNotifications();
  
  // Use context applications if available, otherwise use mock data
  const applicationsData = contextApplications.length > 0 ? contextApplications : mockApplications;

  const stats = useMemo(() => {
    const statusCounts = applicationsData.reduce((acc, app) => {
      acc[app.status] = (acc[app.status] || 0) + 1;
      return acc;
    }, {} as Record<ApplicationStatus, number>);

    return {
      totalApplications: applicationsData.length,
      acceptedApplications: applicationsData.filter(a => a.status === ApplicationStatus.ACCEPTED).length,
      interviewsScheduled: applicationsData.filter(a => a.status === ApplicationStatus.INTERVIEW_SCHEDULED).length,
      recentApplications: applicationsData.slice(0, 5),
      statusCounts,
    };
  }, [applicationsData]);

  const handleUpdateApplicationStatus = (applicationId: string, newStatus: ApplicationStatus) => {
    updateApplication(applicationId, { status: newStatus });
    addNotification({
      type: 'success',
      title: 'Estado actualizado',
      message: `Se ha actualizado el estado de la postulación a ${newStatus}`
    });
    setIsModalOpen(false);
    setSelectedApplication(null);
  };

  const getStatusBadgeVariant = (status: ApplicationStatus) => {
    switch (status) {
      case ApplicationStatus.ACCEPTED: return 'success';
      case ApplicationStatus.REJECTED: return 'error';
      case ApplicationStatus.WAITLIST: return 'warning';
      case ApplicationStatus.INTERVIEW_SCHEDULED: return 'info';
      default: return 'neutral';
    }
  };

  const renderSection = () => {
    switch (activeSection) {
            case 'dashboard':
                return (
          <Card className="p-6 mb-6">
            <h2 className="text-xl font-bold text-azul-monte-tabor mb-4">Dashboard General</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <Card className="p-6"><h3 className="text-gris-piedra font-semibold">Total Postulaciones</h3><p className="text-4xl font-bold text-azul-monte-tabor">{stats.totalApplications}</p></Card>
              <Card className="p-6"><h3 className="text-gris-piedra font-semibold">Aceptados</h3><p className="text-4xl font-bold text-verde-esperanza">{stats.acceptedApplications}</p></Card>
              <Card className="p-6"><h3 className="text-gris-piedra font-semibold">Entrevistas Agendadas</h3><p className="text-4xl font-bold text-dorado-nazaret">{stats.interviewsScheduled}</p></Card>
                    </div>
            <h3 className="text-xl font-bold text-azul-monte-tabor mb-4">Postulaciones Recientes</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                            <tbody>
                  {stats.recentApplications.map(app => (
                    <tr key={app.id} className="border-b last:border-none">
                      <td className="py-3 pr-3 font-bold">{app.applicant.firstName} {app.applicant.lastName}</td>
                      <td className="py-3 px-3 text-gris-piedra">{app.applicant.grade}</td>
                      <td className="py-3 pl-3 text-right">
                        <span className="px-2 py-1 rounded-full font-semibold text-xs bg-blue-200 text-azul-monte-tabor">{app.status}</span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
            </div>
          </Card>
        );
      case 'postulaciones':
        const applicationColumns = [
          {
            key: 'applicant' as keyof Application,
            header: 'Postulante',
            render: (value: any, item: Application) => (
              <div>
                <p className="font-semibold">{item.applicant.firstName} {item.applicant.lastName}</p>
                <p className="text-sm text-gris-piedra">{item.applicant.grade}</p>
              </div>
            )
          },
          {
            key: 'submissionDate' as keyof Application,
            header: 'Fecha de Postulación',
            render: (value: string) => new Date(value).toLocaleDateString('es-CL')
          },
          {
            key: 'status' as keyof Application,
            header: 'Estado',
            render: (value: ApplicationStatus) => (
              <Badge variant={getStatusBadgeVariant(value)}>
                {value}
              </Badge>
            )
          },
          {
            key: 'interviewDate' as keyof Application,
            header: 'Entrevista',
            render: (value: string | undefined) => 
              value ? new Date(value).toLocaleDateString('es-CL') : '-'
          },
          {
            key: 'id' as keyof Application,
            header: 'Acciones',
            render: (value: string, item: Application) => (
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  setSelectedApplication(item);
                  setIsModalOpen(true);
                }}
              >
                Ver Detalles
              </Button>
            )
          }
        ];

        return (
          <Card className="p-6">
            <h2 className="text-xl font-bold text-azul-monte-tabor mb-4">Gestión de Postulaciones</h2>
            <Table 
              data={applicationsData} 
              columns={applicationColumns}
              emptyMessage="No hay postulaciones disponibles"
            />
          </Card>
        );
      case 'entrevistas':
        return (
          <Card className="p-6">
            <h2 className="text-xl font-bold text-azul-monte-tabor mb-4">Gestión de Entrevistas</h2>
            <p className="text-gris-piedra">(Aquí se podrá agendar, ver y gestionar entrevistas.)</p>
          </Card>
        );
      case 'reportes':
        return (
          <Card className="p-6">
            <h2 className="text-xl font-bold text-azul-monte-tabor mb-4">Reportes</h2>
            <p className="text-gris-piedra">(Aquí se podrán ver estadísticas, gráficos y exportar datos.)</p>
          </Card>
        );
      case 'usuarios':
        return (
          <Card className="p-6">
            <h2 className="text-xl font-bold text-azul-monte-tabor mb-4">Gestión de Usuarios</h2>
            <p className="text-gris-piedra">(Aquí se podrán gestionar cuentas de administradores y familias.)</p>
          </Card>
        );
      case 'notificaciones':
        return (
          <Card className="p-6">
            <h2 className="text-xl font-bold text-azul-monte-tabor mb-4">Notificaciones</h2>
            <p className="text-gris-piedra">(Aquí aparecerán notificaciones importantes para los administradores.)</p>
          </Card>
        );
      case 'historial':
        return (
          <Card className="p-6">
            <h2 className="text-xl font-bold text-azul-monte-tabor mb-4">Historial de Acciones</h2>
            <p className="text-gris-piedra">(Aquí se mostrará el historial de acciones realizadas por los administradores en el sistema.)</p>
          </Card>
        );
      case 'cuenta':
        return (
          <Card className="p-6">
            <h2 className="text-xl font-bold text-azul-monte-tabor mb-4">Opciones de Cuenta</h2>
            <ul className="space-y-3">
              <li><button className="text-azul-monte-tabor hover:underline">Cambiar contraseña</button></li>
              <li><button className="text-azul-monte-tabor hover:underline">Cerrar sesión</button></li>
            </ul>
          </Card>
        );
      case 'ayuda':
        return (
          <Card className="p-6">
            <h2 className="text-xl font-bold text-azul-monte-tabor mb-4">Ayuda y Soporte</h2>
            <p className="text-gris-piedra">¿Tienes dudas? Contáctanos a <a href="mailto:contacto@montetabor.cl" className="text-azul-monte-tabor underline">contacto@montetabor.cl</a></p>
                    </Card>
                );
            default:
        return null;
        }
    };
    
  return (
    <>
      <div className="flex min-h-[calc(100vh-150px)] bg-gray-50 py-12">
        {/* Sidebar */}
        <aside className="w-64 bg-azul-monte-tabor p-6 flex-shrink-0 hidden md:flex md:flex-col rounded-xl mr-8">
          <nav className="space-y-2">
            {sections.map(section => (
          <button
                key={section.key}
                onClick={() => setActiveSection(section.key)}
                className={`w-full text-left px-4 py-2 rounded-lg font-semibold transition-colors duration-200 ${activeSection === section.key ? 'bg-dorado-nazaret/20 text-dorado-nazaret' : 'text-blanco-pureza hover:bg-blue-800'}`}
          >
                {section.label}
          </button>
            ))}
                  </nav>
              </aside>
              {/* Main Content */}
        <main className="flex-1 max-w-5xl mx-auto">
          {renderSection()}
              </main>
          </div>

      {/* Application Details Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedApplication(null);
        }}
        title="Detalles de Postulación"
        size="lg"
      >
        {selectedApplication && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h4 className="font-semibold text-azul-monte-tabor mb-2">Información del Postulante</h4>
                <p><strong>Nombre:</strong> {selectedApplication.applicant.firstName} {selectedApplication.applicant.lastName}</p>
                <p><strong>Fecha de Nacimiento:</strong> {selectedApplication.applicant.birthDate}</p>
                <p><strong>Nivel:</strong> {selectedApplication.applicant.grade}</p>
              </div>
              <div>
                <h4 className="font-semibold text-azul-monte-tabor mb-2">Estado de Postulación</h4>
                <div className="mb-2">
                  <Badge variant={getStatusBadgeVariant(selectedApplication.status)}>
                    {selectedApplication.status}
                  </Badge>
                </div>
                <p><strong>Fecha de Postulación:</strong> {new Date(selectedApplication.submissionDate).toLocaleDateString('es-CL')}</p>
                {selectedApplication.interviewDate && (
                  <p><strong>Fecha de Entrevista:</strong> {new Date(selectedApplication.interviewDate).toLocaleDateString('es-CL')}</p>
                )}
              </div>
            </div>

            <div>
              <h4 className="font-semibold text-azul-monte-tabor mb-2">Documentos</h4>
              <div className="space-y-2">
                {selectedApplication.documents.map(doc => (
                  <div key={doc.id} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                    <span>{doc.name}</span>
                    <Badge variant={doc.status === 'approved' ? 'success' : doc.status === 'rejected' ? 'error' : 'neutral'}>
                      {doc.status === 'approved' ? 'Aprobado' : doc.status === 'rejected' ? 'Rechazado' : 'Pendiente'}
                    </Badge>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h4 className="font-semibold text-azul-monte-tabor mb-2">Cambiar Estado</h4>
              <div className="flex gap-2 flex-wrap">
                {Object.values(ApplicationStatus).map(status => (
                  <Button
                    key={status}
                    size="sm"
                    variant={selectedApplication.status === status ? 'primary' : 'outline'}
                    onClick={() => handleUpdateApplicationStatus(selectedApplication.id, status)}
                  >
                    {status}
                  </Button>
                ))}
              </div>
            </div>
          </div>
        )}
      </Modal>
    </>
  );
};

export default AdminDashboard;
