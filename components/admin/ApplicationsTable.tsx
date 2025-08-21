import React from 'react';
import Button from '../ui/Button';
import Badge from '../ui/Badge';
import LoadingSpinner from '../ui/LoadingSpinner';
import { Application } from '../../services/applicationService';
import {
  FileTextIcon,
  EyeIcon,
  ArchiveIcon,
  UserIcon
} from '../icons/Icons';

interface ApplicationsTableProps {
  applications: Application[];
  isLoading?: boolean;
  onView?: (application: Application) => void;
  onArchive?: (application: Application) => void;
  className?: string;
}

const ApplicationsTable: React.FC<ApplicationsTableProps> = ({
  applications,
  isLoading = false,
  onView,
  onArchive,
  className = ''
}) => {
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <LoadingSpinner size="lg" />
          <p className="mt-4 text-gray-600">Cargando postulaciones...</p>
        </div>
      </div>
    );
  }

  if (applications.length === 0) {
    return (
      <div className="text-center py-12 bg-gray-50 rounded-lg">
        <FileTextIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-600">No se encontraron postulaciones</p>
        <p className="text-sm text-gray-500 mt-1">
          Las postulaciones aparecerán aquí cuando se envíen
        </p>
      </div>
    );
  }

  const getStatusColor = (status: string): 'success' | 'warning' | 'error' | 'info' | 'gray' => {
    switch (status?.toUpperCase()) {
      case 'SUBMITTED':
      case 'ENVIADA':
        return 'info';
      case 'UNDER_REVIEW':
      case 'EN_REVISION':
        return 'warning';
      case 'INTERVIEW_SCHEDULED':
      case 'ENTREVISTA_PROGRAMADA':
        return 'warning';
      case 'APPROVED':
      case 'ACEPTADA':
        return 'success';
      case 'REJECTED':
      case 'RECHAZADA':
        return 'error';
      case 'WAITLIST':
      case 'LISTA_ESPERA':
        return 'warning';
      default:
        return 'gray';
    }
  };

  const getStatusLabel = (status: string): string => {
    switch (status?.toUpperCase()) {
      case 'SUBMITTED':
        return 'Enviada';
      case 'UNDER_REVIEW':
        return 'En Revisión';
      case 'INTERVIEW_SCHEDULED':
        return 'Entrevista Programada';
      case 'APPROVED':
        return 'Aceptada';
      case 'REJECTED':
        return 'Rechazada';
      case 'WAITLIST':
        return 'Lista de Espera';
      default:
        return status || 'Sin Estado';
    }
  };

  const formatDate = (dateString: string): string => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('es-CL', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch (error) {
      return 'Fecha inválida';
    }
  };

  return (
    <div className={`overflow-hidden ${className}`}>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Estudiante
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Grado
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Apoderado
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Estado
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Fecha Envío
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {applications.map((application) => (
              <tr key={application.id} className="hover:bg-gray-50">
                {/* Estudiante */}
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 h-10 w-10">
                      <div className="h-10 w-10 rounded-full bg-azul-monte-tabor bg-opacity-10 flex items-center justify-center">
                        <span className="text-sm font-medium text-azul-monte-tabor">
                          {application.student.firstName.charAt(0)}{application.student.lastName.charAt(0)}
                        </span>
                      </div>
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-medium text-gray-900">
                        {application.student.firstName} {application.student.lastName}
                      </div>
                      <div className="text-sm text-gray-500">
                        RUT: {application.student.rut}
                      </div>
                    </div>
                  </div>
                </td>

                {/* Grado */}
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">{application.student.gradeApplied}</div>
                </td>

                {/* Apoderado */}
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">
                    {application.applicantUser.firstName} {application.applicantUser.lastName}
                  </div>
                  <div className="text-sm text-gray-500">
                    {application.applicantUser.email}
                  </div>
                </td>

                {/* Estado */}
                <td className="px-6 py-4 whitespace-nowrap">
                  <Badge variant={getStatusColor(application.status)}>
                    {getStatusLabel(application.status)}
                  </Badge>
                </td>

                {/* Fecha Envío */}
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {formatDate(application.submissionDate)}
                </td>

                {/* Acciones */}
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div className="flex items-center justify-end space-x-2">
                    {/* Ver detalles */}
                    {onView && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onView(application)}
                        title="Ver detalles"
                      >
                        <EyeIcon className="w-4 h-4" />
                      </Button>
                    )}

                    {/* Archivar */}
                    {onArchive && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onArchive(application)}
                        title="Cerrar y archivar postulación"
                        className="text-orange-600 hover:text-orange-700 border-orange-300 hover:border-orange-400"
                      >
                        <ArchiveIcon className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Leyenda */}
      <div className="mt-4 px-6 py-3 bg-gray-50 border-t">
        <div className="flex items-center justify-between text-xs text-gray-500">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-1">
              <Badge variant="info">Enviada</Badge>
              <span>Nueva postulación</span>
            </div>
            <div className="flex items-center space-x-1">
              <Badge variant="warning">En Revisión</Badge>
              <span>Bajo evaluación</span>
            </div>
            <div className="flex items-center space-x-1">
              <Badge variant="success">Aceptada</Badge>
              <span>Proceso exitoso</span>
            </div>
          </div>
          
          <div className="text-right">
            <span>Total: {applications.length} postulaciones</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ApplicationsTable;