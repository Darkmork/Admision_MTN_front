import React, { useState } from 'react';
import Card from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import Button from '../components/ui/Button';
import { ApplicationStatus, Document } from '../types';
import { mockApplications } from '../services/mockData';
import { CheckCircleIcon, ClockIcon, FileTextIcon, XCircleIcon } from '../components/icons/Icons';
import { useApplications } from '../context/AppContext';

const sections = [
  { key: 'resumen', label: 'Resumen de Postulación' },
  { key: 'datos', label: 'Datos del Postulante y Apoderados' },
  { key: 'documentos', label: 'Documentos' },
  { key: 'notificaciones', label: 'Notificaciones' },
  { key: 'citas', label: 'Próximas Citas' },
  { key: 'historial', label: 'Historial de Acciones' },
  { key: 'cuenta', label: 'Opciones de Cuenta' },
  { key: 'ayuda', label: 'Ayuda y Soporte' },
];

const getStatusColor = (status: ApplicationStatus) => {
    switch (status) {
        case ApplicationStatus.ACCEPTED: return 'bg-verde-esperanza text-blanco-pureza';
        case ApplicationStatus.REJECTED: return 'bg-rojo-sagrado text-blanco-pureza';
        case ApplicationStatus.WAITLIST: return 'bg-dorado-nazaret text-blanco-pureza';
        case ApplicationStatus.SUBMITTED:
        case ApplicationStatus.INTERVIEW_SCHEDULED:
            return 'bg-blue-200 text-azul-monte-tabor';
        default: return 'bg-gray-200 text-gris-piedra';
    }
};

const getDocumentStatusIcon = (status: Document['status']) => {
    switch(status) {
        case 'approved': return <CheckCircleIcon className="w-5 h-5 text-verde-esperanza" />;
        case 'submitted': return <ClockIcon className="w-5 h-5 text-blue-500" />;
        case 'rejected': return <XCircleIcon className="w-5 h-5 text-rojo-sagrado" />;
        default: return <FileTextIcon className="w-5 h-5 text-gris-piedra" />;
    }
};


const FamilyDashboard: React.FC = () => {
  const [activeSection, setActiveSection] = useState('resumen');
  const { applications } = useApplications();
  
  // Use the first application from context, or fallback to mock data
  const myApplication = applications.length > 0 ? applications[0] : mockApplications[0];

  const renderSection = () => {
    switch (activeSection) {
      case 'resumen':
    return (
          <Card className="p-6">
            <h2 className="text-xl font-bold text-azul-monte-tabor mb-6">Resumen de Postulación</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold text-azul-monte-tabor mb-2">Información del Postulante</h3>
                <p><strong>Nombre:</strong> {myApplication.applicant.firstName} {myApplication.applicant.lastName}</p>
                <p><strong>Fecha de Nacimiento:</strong> {myApplication.applicant.birthDate}</p>
                <p><strong>Nivel:</strong> {myApplication.applicant.grade}</p>
              </div>
              <div>
                <h3 className="font-semibold text-azul-monte-tabor mb-2">Estado de Postulación</h3>
                <div className="mb-2">
                  <Badge variant={getStatusColor(myApplication.status) === 'bg-verde-esperanza text-blanco-pureza' ? 'success' : 
                                  getStatusColor(myApplication.status) === 'bg-rojo-sagrado text-blanco-pureza' ? 'error' :
                                  getStatusColor(myApplication.status) === 'bg-dorado-nazaret text-blanco-pureza' ? 'warning' : 'info'}>
                    {myApplication.status}
                  </Badge>
                </div>
                <p><strong>Fecha de Postulación:</strong> {new Date(myApplication.submissionDate).toLocaleDateString('es-CL')}</p>
                {myApplication.interviewDate && (
                  <p><strong>Entrevista:</strong> {new Date(myApplication.interviewDate).toLocaleDateString('es-CL')}</p>
                )}
              </div>
            </div>
          </Card>
        );
      case 'datos':
        return (
          <Card className="p-6">
            <h2 className="text-xl font-bold text-azul-monte-tabor mb-4">Datos del Postulante y Apoderados</h2>
            <p className="text-gris-piedra">(Aquí se mostrarán los datos del postulante y apoderados. Se puede permitir edición en el futuro.)</p>
                        </Card>
        );
      case 'documentos':
        return (
          <Card className="p-6">
            <h2 className="text-xl font-bold text-azul-monte-tabor mb-4">Documentos</h2>
            <div className="space-y-3">
              {myApplication.documents.map(doc => (
                <div key={doc.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <FileTextIcon className="w-5 h-5 text-dorado-nazaret" />
                    <span className="font-medium">{doc.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {getDocumentStatusIcon(doc.status)}
                    <Badge 
                      variant={doc.status === 'approved' ? 'success' : 
                              doc.status === 'rejected' ? 'error' : 
                              doc.status === 'submitted' ? 'info' : 'neutral'}
                      size="sm"
                    >
                      {doc.status === 'approved' ? 'Aprobado' : 
                       doc.status === 'rejected' ? 'Rechazado' : 
                       doc.status === 'submitted' ? 'En Revisión' : 'Pendiente'}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
            {myApplication.documents.some(doc => doc.status === 'pending') && (
              <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                <p className="text-sm text-azul-monte-tabor">
                  <strong>Nota:</strong> Algunos documentos aún están pendientes de revisión. 
                  El equipo de admisiones los revisará pronto.
                </p>
              </div>
            )}
          </Card>
        );
      case 'notificaciones':
        return (
          <Card className="p-6">
                                <h2 className="text-xl font-bold text-azul-monte-tabor mb-4">Notificaciones</h2>
                                <ul className="space-y-3">
              <li className="text-sm text-gris-piedra">(Aquí aparecerán notificaciones importantes para la familia.)</li>
            </ul>
          </Card>
        );
      case 'citas':
        return (
          <Card className="p-6">
            <h2 className="text-xl font-bold text-azul-monte-tabor mb-4">Próximas Citas</h2>
            <p className="text-gris-piedra">(Aquí se mostrarán las entrevistas y reuniones agendadas.)</p>
          </Card>
        );
      case 'historial':
        return (
          <Card className="p-6">
            <h2 className="text-xl font-bold text-azul-monte-tabor mb-4">Historial de Acciones</h2>
            <p className="text-gris-piedra">(Aquí se mostrará el historial de acciones realizadas por la familia en el sistema.)</p>
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
    <div className="bg-gray-50 min-h-screen py-12 flex">
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
      <main className="flex-1 max-w-3xl mx-auto">
        {renderSection()}
      </main>
        </div>
    );
};

export default FamilyDashboard;