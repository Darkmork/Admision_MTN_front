/**
 * Applicant Metrics Modal Component
 * Displays detailed metrics for each applicant with advanced filtering and sorting
 */

import React, { useState, useEffect } from 'react';
import { FiX, FiRefreshCw, FiFilter, FiChevronDown, FiChevronUp, FiUserCheck, FiFileText, FiMessageCircle } from 'react-icons/fi';
import { dashboardService } from '../../services/dashboardService';
import type { ApplicantMetric, ApplicantMetricsFilters } from '../../src/api/dashboard.types';

interface ApplicantMetricsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const GRADES = [
  'Kinder',
  '1° Básico',
  '2° Básico',
  '3° Básico',
  '4° Básico',
  '5° Básico',
  '6° Básico',
  '7° Básico',
  '8° Básico',
  'I° Medio',
  'II° Medio',
  'III° Medio',
  'IV° Medio'
];

const APPLICATION_STATUSES = [
  { value: 'SUBMITTED', label: 'Enviada' },
  { value: 'UNDER_REVIEW', label: 'En Revisión' },
  { value: 'APPROVED', label: 'Aprobada' },
  { value: 'REJECTED', label: 'Rechazada' },
  { value: 'WAITLIST', label: 'Lista de Espera' }
];

export const ApplicantMetricsModal: React.FC<ApplicantMetricsModalProps> = ({
  isOpen,
  onClose
}) => {
  const [applicants, setApplicants] = useState<ApplicantMetric[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);

  const [filters, setFilters] = useState<ApplicantMetricsFilters>({
    academicYear: new Date().getFullYear() + 1,
    sortBy: 'studentName',
    sortOrder: 'ASC'
  });

  useEffect(() => {
    if (isOpen) {
      loadApplicantMetrics();
    }
  }, [isOpen, filters]);

  const loadApplicantMetrics = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await dashboardService.getApplicantMetrics(filters);
      setApplicants(response.data);
    } catch (err: any) {
      console.error('Error loading applicant metrics:', err);
      setError(err.message || 'Error al cargar métricas de postulantes');
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key: keyof ApplicantMetricsFilters, value: any) => {
    setFilters(prev => ({
      ...prev,
      [key]: value || undefined
    }));
  };

  const handleSort = (column: ApplicantMetricsFilters['sortBy']) => {
    setFilters(prev => ({
      ...prev,
      sortBy: column,
      sortOrder: prev.sortBy === column && prev.sortOrder === 'ASC' ? 'DESC' : 'ASC'
    }));
  };

  const getStatusColor = (status: string): string => {
    const colors: Record<string, string> = {
      'SUBMITTED': 'bg-blue-100 text-blue-800',
      'UNDER_REVIEW': 'bg-yellow-100 text-yellow-800',
      'APPROVED': 'bg-green-100 text-green-800',
      'REJECTED': 'bg-red-100 text-red-800',
      'WAITLIST': 'bg-purple-100 text-purple-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getStatusLabel = (status: string): string => {
    const labels: Record<string, string> = {
      'SUBMITTED': 'Enviada',
      'UNDER_REVIEW': 'En Revisión',
      'APPROVED': 'Aprobada',
      'REJECTED': 'Rechazada',
      'WAITLIST': 'Lista de Espera'
    };
    return labels[status] || status;
  };

  const getScoreColor = (score: string | null): string => {
    if (!score) return 'text-gray-400';
    const numScore = parseFloat(score);
    if (numScore >= 70) return 'text-green-600 font-semibold';
    if (numScore >= 50) return 'text-yellow-600';
    return 'text-red-600';
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="flex min-h-full items-start justify-center p-4 pt-8">
        <div className="relative bg-white rounded-lg shadow-xl w-full max-w-7xl max-h-[90vh] overflow-hidden flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-blue-600 to-blue-700">
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-white">
                Métricas de Postulantes
              </h2>
              <p className="text-sm text-blue-100 mt-1">
                Análisis detallado de evaluaciones, entrevistas y documentos por postulante
              </p>
            </div>

            <div className="flex items-center space-x-3">
              {/* Filter Toggle Button */}
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`inline-flex items-center px-3 py-2 border border-white/30 rounded-md shadow-sm text-sm font-medium text-white ${
                  showFilters ? 'bg-white/30' : 'bg-white/10 hover:bg-white/20'
                } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-white transition-colors`}
                title="Filtros"
              >
                <FiFilter className="w-4 h-4 mr-2" />
                Filtros
              </button>

              {/* Refresh Button */}
              <button
                onClick={loadApplicantMetrics}
                disabled={loading}
                className="inline-flex items-center px-3 py-2 border border-white/30 rounded-md shadow-sm text-sm font-medium text-white bg-white/10 hover:bg-white/20 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                title="Actualizar datos"
              >
                <FiRefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              </button>

              {/* Close Button */}
              <button
                onClick={onClose}
                className="text-white/80 hover:text-white transition-colors p-2"
              >
                <FiX className="w-6 h-6" />
              </button>
            </div>
          </div>

          {/* Filters Panel */}
          {showFilters && (
            <div className="bg-gray-50 border-b border-gray-200 p-4">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {/* Academic Year */}
                <div>
                  <label htmlFor="academicYear" className="block text-sm font-medium text-gray-700 mb-1">
                    Año Académico
                  </label>
                  <input
                    type="number"
                    id="academicYear"
                    value={filters.academicYear}
                    onChange={(e) => handleFilterChange('academicYear', parseInt(e.target.value))}
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm"
                  />
                </div>

                {/* Grade */}
                <div>
                  <label htmlFor="grade" className="block text-sm font-medium text-gray-700 mb-1">
                    Curso
                  </label>
                  <select
                    id="grade"
                    value={filters.grade || ''}
                    onChange={(e) => handleFilterChange('grade', e.target.value)}
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm"
                  >
                    <option value="">Todos los cursos</option>
                    {GRADES.map(grade => (
                      <option key={grade} value={grade}>{grade}</option>
                    ))}
                  </select>
                </div>

                {/* Status */}
                <div>
                  <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
                    Estado
                  </label>
                  <select
                    id="status"
                    value={filters.status || ''}
                    onChange={(e) => handleFilterChange('status', e.target.value)}
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm"
                  >
                    <option value="">Todos los estados</option>
                    {APPLICATION_STATUSES.map(status => (
                      <option key={status.value} value={status.value}>{status.label}</option>
                    ))}
                  </select>
                </div>

                {/* Reset Filters */}
                <div className="flex items-end">
                  <button
                    onClick={() => setFilters({
                      academicYear: new Date().getFullYear() + 1,
                      sortBy: 'studentName',
                      sortOrder: 'ASC'
                    })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    Limpiar Filtros
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6">
            {/* Loading State */}
            {loading && (
              <div className="flex items-center justify-center py-12">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                  <p className="text-gray-600">Cargando métricas...</p>
                </div>
              </div>
            )}

            {/* Error State */}
            {!loading && error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex items-center">
                  <svg className="h-5 w-5 text-red-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                  <p className="text-red-800">{error}</p>
                </div>
                <button
                  onClick={loadApplicantMetrics}
                  className="mt-3 text-sm text-red-700 hover:text-red-900 underline"
                >
                  Reintentar
                </button>
              </div>
            )}

            {/* Results Summary */}
            {!loading && !error && (
              <div className="mb-4 flex justify-between items-center">
                <p className="text-sm text-gray-600">
                  Mostrando <span className="font-semibold">{applicants.length}</span> postulante(s)
                </p>
              </div>
            )}

            {/* Table */}
            {!loading && !error && applicants.length > 0 && (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th
                        onClick={() => handleSort('studentName')}
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                      >
                        <div className="flex items-center">
                          Estudiante
                          {filters.sortBy === 'studentName' && (
                            filters.sortOrder === 'ASC' ? <FiChevronUp className="ml-1" /> : <FiChevronDown className="ml-1" />
                          )}
                        </div>
                      </th>
                      <th
                        onClick={() => handleSort('gradeApplied')}
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                      >
                        <div className="flex items-center">
                          Curso
                          {filters.sortBy === 'gradeApplied' && (
                            filters.sortOrder === 'ASC' ? <FiChevronUp className="ml-1" /> : <FiChevronDown className="ml-1" />
                          )}
                        </div>
                      </th>
                      <th
                        onClick={() => handleSort('applicationStatus')}
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                      >
                        <div className="flex items-center">
                          Estado
                          {filters.sortBy === 'applicationStatus' && (
                            filters.sortOrder === 'ASC' ? <FiChevronUp className="ml-1" /> : <FiChevronDown className="ml-1" />
                          )}
                        </div>
                      </th>
                      <th
                        onClick={() => handleSort('evaluationPassRate')}
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                      >
                        <div className="flex items-center">
                          <FiUserCheck className="mr-1" />
                          Evaluaciones
                          {filters.sortBy === 'evaluationPassRate' && (
                            filters.sortOrder === 'ASC' ? <FiChevronUp className="ml-1" /> : <FiChevronDown className="ml-1" />
                          )}
                        </div>
                      </th>
                      <th
                        onClick={() => handleSort('interviewAvg')}
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                      >
                        <div className="flex items-center">
                          <FiMessageCircle className="mr-1" />
                          Entrevistas
                          {filters.sortBy === 'interviewAvg' && (
                            filters.sortOrder === 'ASC' ? <FiChevronUp className="ml-1" /> : <FiChevronDown className="ml-1" />
                          )}
                        </div>
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        <div className="flex items-center">
                          <FiFileText className="mr-1" />
                          Documentos
                        </div>
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Apoderado
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {applicants.map((applicant) => (
                      <tr key={applicant.applicationId} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{applicant.studentName}</div>
                          <div className="text-xs text-gray-500">ID: {applicant.applicationId}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {applicant.gradeApplied}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(applicant.applicationStatus)}`}>
                            {getStatusLabel(applicant.applicationStatus)}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <div className="flex flex-col">
                            <span className={getScoreColor(applicant.evaluationAvgScore)}>
                              {applicant.evaluationAvgScore ? `${applicant.evaluationAvgScore}%` : 'N/A'}
                            </span>
                            <span className="text-xs text-gray-500">
                              {applicant.evaluationsCompleted}/{applicant.evaluationsTotal} completadas
                            </span>
                            <span className="text-xs text-gray-500">
                              Aprobación: {applicant.evaluationPassRate}%
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <div className="flex flex-col">
                            <span className={getScoreColor(applicant.interviewAvgScore)}>
                              {applicant.interviewAvgScore ? `${applicant.interviewAvgScore}` : 'N/A'}
                            </span>
                            <span className="text-xs text-gray-500">
                              {applicant.familyInterviewsCompleted} familiares
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <div className="flex flex-col">
                            <span className={applicant.documentsApproved === applicant.documentsTotal && applicant.documentsTotal > 0 ? 'text-green-600' : 'text-gray-900'}>
                              {applicant.documentsApproved}/{applicant.documentsTotal} aprobados
                            </span>
                            <span className="text-xs text-gray-500">
                              Completado: {applicant.documentCompletionRate}%
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{applicant.guardianName}</div>
                          <div className="text-xs text-gray-500">{applicant.guardianEmail}</div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Empty State */}
            {!loading && !error && applicants.length === 0 && (
              <div className="text-center py-12">
                <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                </svg>
                <h3 className="mt-2 text-sm font-medium text-gray-900">No hay postulantes</h3>
                <p className="mt-1 text-sm text-gray-500">
                  No se encontraron postulantes con los filtros seleccionados.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ApplicantMetricsModal;
