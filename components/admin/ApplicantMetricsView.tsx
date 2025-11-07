import React, { useState, useEffect } from 'react';
import { FiUser, FiFileText, FiAward, FiTrendingUp, FiFilter, FiDownload, FiX } from 'react-icons/fi';
import Card from '../ui/Card';
import Badge from '../ui/Badge';
import Button from '../ui/Button';
import { dashboardClient } from '../../src/api/dashboard.client';
import type { ApplicantMetric, ApplicantMetricsFilters } from '../../src/api/dashboard.types';
import { PieChart, Pie, BarChart, Bar, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export const ApplicantMetricsView: React.FC = () => {
  const [applicants, setApplicants] = useState<ApplicantMetric[]>([]);
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<ApplicantMetricsFilters>({
    academicYear: new Date().getFullYear()
  });

  useEffect(() => {
    loadApplicantMetrics();
  }, [filters]);

  const loadApplicantMetrics = async () => {
    try {
      setLoading(true);
      const response = await dashboardClient.getApplicantMetrics(filters);
      setApplicants(response.data || []);
    } catch (error) {
      console.error('Error loading applicant metrics:', error);
    } finally {
      setLoading(false);
    }
  };

  const exportToExcel = () => {
    const excelData = applicants.map(app => ({
      'ID Aplicación': app.applicationId,
      'Nombre Estudiante': app.studentName,
      'Curso': app.gradeApplied,
      'Estado': app.applicationStatus,
      'Matemáticas (%)': app.examScores?.mathematics?.percentage || 'Pendiente',
      'Matemáticas (Score)': app.examScores?.mathematics?.score ? `${app.examScores.mathematics.score}/${app.examScores.mathematics.maxScore}` : '-',
      'Lenguaje (%)': app.examScores?.language?.percentage || 'Pendiente',
      'Lenguaje (Score)': app.examScores?.language?.score ? `${app.examScores.language.score}/${app.examScores.language.maxScore}` : '-',
      'Inglés (%)': app.examScores?.english?.percentage || 'Pendiente',
      'Inglés (Score)': app.examScores?.english?.score ? `${app.examScores.english.score}/${app.examScores.english.maxScore}` : '-',
      'Completitud Exámenes (%)': app.examScores?.completionRate || '0%',
      'Entrevistas Realizadas': app.familyInterviews?.length || 0,
      'Entrevistas (Detalle)': app.familyInterviews?.map(i =>
        `${i.interviewerName}: ${i.result || 'Pendiente'} (${i.score || 'N/A'}/10)`
      ).join('; ') || 'Sin entrevistas',
      'Documentos Aprobados': app.documents ? `${app.documents.approved}/${app.documents.total}` : '0/0',
      'Completitud Documentos (%)': app.documents?.completionRate || '0%'
    }));

    const headers = Object.keys(excelData[0] || {});
    const csvContent = [
      headers.join(','),
      ...excelData.map(row => headers.map(header => {
        const value = String(row[header as keyof typeof row] || '');
        return value.includes(',') ? `"${value}"` : value;
      }).join(','))
    ].join('\n');

    const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `metricas_postulantes_${filters.academicYear || new Date().getFullYear()}.csv`;
    link.click();
  };

  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { variant: 'success' | 'warning' | 'error' | 'info', label: string }> = {
      'PENDING': { variant: 'warning', label: 'Pendiente' },
      'IN_PROGRESS': { variant: 'info', label: 'En Progreso' },
      'COMPLETED': { variant: 'success', label: 'Completado' },
      'APPROVED': { variant: 'success', label: 'Aprobado' },
      'REJECTED': { variant: 'error', label: 'Rechazado' },
      'UNDER_REVIEW': { variant: 'info', label: 'En Revisión' },
      'WAITLIST': { variant: 'warning', label: 'Lista de Espera' },
      'SUBMITTED': { variant: 'info', label: 'Enviado' }
    };

    const config = statusMap[status] || { variant: 'info' as const, label: status };
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const getScoreBadge = (percentage: string | null, status: string) => {
    if (status !== 'COMPLETED' || !percentage) {
      return <Badge variant="warning">Pendiente</Badge>;
    }

    const score = parseFloat(percentage);
    if (score >= 80) return <Badge variant="success">{percentage}%</Badge>;
    if (score >= 60) return <Badge variant="warning">{percentage}%</Badge>;
    return <Badge variant="error">{percentage}%</Badge>;
  };

  const getInterviewResultBadge = (result: string | null) => {
    if (!result) return <Badge variant="warning">Pendiente</Badge>;

    const resultMap: Record<string, { variant: 'success' | 'warning' | 'error', label: string }> = {
      'POSITIVE': { variant: 'success', label: 'Positivo' },
      'NEGATIVE': { variant: 'error', label: 'Negativo' },
      'NEUTRAL': { variant: 'warning', label: 'Neutral' }
    };

    const config = resultMap[result] || { variant: 'warning' as const, label: result };
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const getChartData = () => {
    const examPerformance = applicants.reduce((acc, app) => {
      const mathScore = parseFloat(app.examScores?.mathematics?.percentage || '0');
      const langScore = parseFloat(app.examScores?.language?.percentage || '0');
      const engScore = parseFloat(app.examScores?.english?.percentage || '0');

      const avgScore = (mathScore + langScore + engScore) / 3;

      if (avgScore >= 80) acc.excelente++;
      else if (avgScore >= 60) acc.bueno++;
      else if (avgScore > 0) acc.regular++;
      else acc.pendiente++;

      return acc;
    }, { excelente: 0, bueno: 0, regular: 0, pendiente: 0 });

    const performanceData = [
      { name: 'Excelente (≥80%)', value: examPerformance.excelente, color: '#10B981' },
      { name: 'Bueno (60-79%)', value: examPerformance.bueno, color: '#F59E0B' },
      { name: 'Regular (<60%)', value: examPerformance.regular, color: '#EF4444' },
      { name: 'Pendiente', value: examPerformance.pendiente, color: '#9CA3AF' }
    ];

    const examAverages = {
      mathematics: 0,
      language: 0,
      english: 0,
      count: 0
    };

    applicants.forEach(app => {
      if (app.examScores?.mathematics?.percentage) {
        examAverages.mathematics += parseFloat(app.examScores.mathematics.percentage);
        examAverages.count++;
      }
      if (app.examScores?.language?.percentage) {
        examAverages.language += parseFloat(app.examScores.language.percentage);
      }
      if (app.examScores?.english?.percentage) {
        examAverages.english += parseFloat(app.examScores.english.percentage);
      }
    });

    const avgData = [
      { name: 'Matemáticas', promedio: examAverages.count > 0 ? Math.round(examAverages.mathematics / examAverages.count) : 0 },
      { name: 'Lenguaje', promedio: examAverages.count > 0 ? Math.round(examAverages.language / examAverages.count) : 0 },
      { name: 'Inglés', promedio: examAverages.count > 0 ? Math.round(examAverages.english / examAverages.count) : 0 }
    ];

    return { performanceData, avgData };
  };

  const { performanceData, avgData } = getChartData();

  const uniqueGrades = [...new Set(applicants.map(a => a.gradeApplied))].sort();
  const uniqueStatuses = [...new Set(applicants.map(a => a.applicationStatus))];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando métricas de postulantes...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Métricas Detalladas de Postulantes</h2>
          <p className="text-gray-600 mt-1">
            Rendimiento académico y entrevistas de cada postulante
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2"
          >
            <FiFilter className="h-4 w-4" />
            {showFilters ? 'Ocultar Filtros' : 'Mostrar Filtros'}
          </Button>
          <Button
            variant="primary"
            onClick={exportToExcel}
            disabled={applicants.length === 0}
            className="flex items-center gap-2"
          >
            <FiDownload className="h-4 w-4" />
            Exportar a Excel
          </Button>
        </div>
      </div>

      {showFilters && (
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Filtros</h3>
            <button
              onClick={() => setShowFilters(false)}
              className="text-gray-400 hover:text-gray-600"
            >
              <FiX className="h-5 w-5" />
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Año Académico
              </label>
              <select
                value={filters.academicYear || ''}
                onChange={(e) => setFilters({ ...filters, academicYear: parseInt(e.target.value) })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value={new Date().getFullYear()}>{new Date().getFullYear()}</option>
                <option value={new Date().getFullYear() - 1}>{new Date().getFullYear() - 1}</option>
                <option value={new Date().getFullYear() + 1}>{new Date().getFullYear() + 1}</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Curso
              </label>
              <select
                value={filters.grade || ''}
                onChange={(e) => setFilters({ ...filters, grade: e.target.value || undefined })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Todos los cursos</option>
                {uniqueGrades.map(grade => (
                  <option key={grade} value={grade}>{grade}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Estado
              </label>
              <select
                value={filters.status || ''}
                onChange={(e) => setFilters({ ...filters, status: e.target.value || undefined })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Todos los estados</option>
                {uniqueStatuses.map(status => (
                  <option key={status} value={status}>
                    {status === 'APPROVED' ? 'Aprobado' :
                     status === 'REJECTED' ? 'Rechazado' :
                     status === 'UNDER_REVIEW' ? 'En Revisión' :
                     status === 'WAITLIST' ? 'Lista de Espera' :
                     status === 'SUBMITTED' ? 'Enviado' : status}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {(filters.grade || filters.status) && (
            <div className="mt-4 flex items-center gap-2">
              <span className="text-sm text-gray-600">Filtros activos:</span>
              {filters.grade && (
                <Badge variant="info">
                  Curso: {filters.grade}
                  <button
                    onClick={() => setFilters({ ...filters, grade: undefined })}
                    className="ml-2 hover:text-red-600"
                  >
                    ×
                  </button>
                </Badge>
              )}
              {filters.status && (
                <Badge variant="info">
                  Estado: {filters.status}
                  <button
                    onClick={() => setFilters({ ...filters, status: undefined })}
                    className="ml-2 hover:text-red-600"
                  >
                    ×
                  </button>
                </Badge>
              )}
              <button
                onClick={() => setFilters({ academicYear: filters.academicYear })}
                className="text-sm text-blue-600 hover:text-blue-800 underline ml-2"
              >
                Limpiar todos
              </button>
            </div>
          )}
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Postulantes</p>
              <p className="text-3xl font-bold text-blue-600 mt-2">{applicants.length}</p>
            </div>
            <FiUser className="h-8 w-8 text-blue-500" />
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Evaluaciones Completadas</p>
              <p className="text-3xl font-bold text-green-600 mt-2">
                {applicants.length > 0 ? Math.round(
                  applicants.reduce((sum, a) => {
                    const completed = [a.examScores?.mathematics, a.examScores?.language, a.examScores?.english]
                      .filter(e => e && e.status === 'COMPLETED').length;
                    return sum + (completed / 3) * 100;
                  }, 0) / applicants.length
                ) : 0}%
              </p>
            </div>
            <FiAward className="h-8 w-8 text-green-500" />
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Entrevistas Realizadas</p>
              <p className="text-3xl font-bold text-purple-600 mt-2">
                {applicants.reduce((sum, a) => sum + (a.familyInterviews?.length || 0), 0)}
              </p>
            </div>
            <FiFileText className="h-8 w-8 text-purple-500" />
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Documentos Aprobados</p>
              <p className="text-3xl font-bold text-orange-600 mt-2">
                {applicants.length > 0 ? Math.round(
                  applicants.reduce((sum, a) => sum + parseFloat(String(a.documents?.completionRate || '0')), 0) / applicants.length
                ) : 0}%
              </p>
            </div>
            <FiTrendingUp className="h-8 w-8 text-orange-500" />
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Distribución de Rendimiento</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={performanceData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }: { name?: string; percent?: number }) => `${name || ''}: ${Math.round((percent || 0) * 100)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {performanceData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </Card>

        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Promedio por Examen</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={avgData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis domain={[0, 100]} />
              <Tooltip />
              <Legend />
              <Bar dataKey="promedio" fill="#3B82F6" name="Promedio (%)" />
            </BarChart>
          </ResponsiveContainer>
        </Card>
      </div>

      <Card className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Detalle por Postulante ({applicants.length} resultados)
        </h3>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Postulante
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Curso
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Estado
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Matemáticas
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Lenguaje
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Inglés
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Entrevistas Familiares
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Documentos
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {applicants.map((applicant) => (
                <tr key={applicant.applicationId} className="hover:bg-gray-50">
                  <td className="px-4 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center">
                        <FiUser className="h-5 w-5 text-blue-600" />
                      </div>
                      <div className="ml-3">
                        <div className="text-sm font-medium text-gray-900">
                          {applicant.studentName}
                        </div>
                        <div className="text-xs text-gray-500">
                          ID: {applicant.applicationId}
                        </div>
                      </div>
                    </div>
                  </td>

                  <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                    {applicant.gradeApplied}
                  </td>

                  <td className="px-4 py-4 whitespace-nowrap">
                    {getStatusBadge(applicant.applicationStatus)}
                  </td>

                  <td className="px-4 py-4 whitespace-nowrap">
                    <div className="space-y-1">
                      {getScoreBadge(applicant.examScores?.mathematics?.percentage || null, applicant.examScores?.mathematics?.status || 'PENDING')}
                      {applicant.examScores?.mathematics?.score !== null && applicant.examScores?.mathematics?.score !== undefined && (
                        <div className="text-xs text-gray-500">
                          {applicant.examScores?.mathematics?.score}/{applicant.examScores?.mathematics?.maxScore}
                        </div>
                      )}
                    </div>
                  </td>

                  <td className="px-4 py-4 whitespace-nowrap">
                    <div className="space-y-1">
                      {getScoreBadge(applicant.examScores?.language?.percentage || null, applicant.examScores?.language?.status || 'PENDING')}
                      {applicant.examScores?.language?.score !== null && applicant.examScores?.language?.score !== undefined && (
                        <div className="text-xs text-gray-500">
                          {applicant.examScores?.language?.score}/{applicant.examScores?.language?.maxScore}
                        </div>
                      )}
                    </div>
                  </td>

                  <td className="px-4 py-4 whitespace-nowrap">
                    <div className="space-y-1">
                      {getScoreBadge(applicant.examScores?.english?.percentage || null, applicant.examScores?.english?.status || 'PENDING')}
                      {applicant.examScores?.english?.score !== null && applicant.examScores?.english?.score !== undefined && (
                        <div className="text-xs text-gray-500">
                          {applicant.examScores?.english?.score}/{applicant.examScores?.english?.maxScore}
                        </div>
                      )}
                    </div>
                  </td>

                  <td className="px-4 py-4">
                    {applicant.familyInterviews && applicant.familyInterviews.length > 0 ? (
                      <div className="space-y-2">
                        {applicant.familyInterviews.map((interview, idx) => (
                          <div key={idx} className="text-sm">
                            <div className="font-medium text-gray-700">{interview.interviewerName}</div>
                            <div className="flex items-center gap-2">
                              {getInterviewResultBadge(interview.result)}
                              {interview.score !== null && (
                                <span className="text-xs text-gray-500">
                                  Puntaje: {interview.score}/10
                                </span>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <Badge variant="warning">Sin entrevistas</Badge>
                    )}
                  </td>

                  <td className="px-4 py-4 whitespace-nowrap">
                    <div className="space-y-1">
                      <div className="text-sm font-medium text-gray-900">
                        {applicant.documents?.completionRate || '0'}%
                      </div>
                      <div className="text-xs text-gray-500">
                        {applicant.documents?.approved || 0}/{applicant.documents?.total || 0} aprobados
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-1.5">
                        <div
                          className="bg-green-500 h-1.5 rounded-full"
                          style={{ width: `${applicant.documents?.completionRate || 0}%` }}
                        ></div>
                      </div>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {applicants.length === 0 && (
            <div className="text-center py-12">
              <FiUser className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No se encontraron postulantes para los filtros seleccionados</p>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
};

export default ApplicantMetricsView;
  const [applicants, setApplicants] = useState<ApplicantMetric[]>([]);
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<ApplicantMetricsFilters>({
    academicYear: new Date().getFullYear()
  });

  useEffect(() => {
    loadApplicantMetrics();
  }, [filters]);

  const loadApplicantMetrics = async () => {
    try {
      setLoading(true);
      const response = await dashboardClient.getApplicantMetrics(filters);
      setApplicants(response.data || []);
    } catch (error) {
      console.error('Error loading applicant metrics:', error);
    } finally {
      setLoading(false);
    }
  };

  const exportToExcel = () => {
    // Crear datos para Excel
    const excelData = applicants.map(app => ({
      'ID Aplicación': app.applicationId,
      'Nombre Estudiante': app.studentName,
      'Curso': app.gradeApplied,
      'Estado': app.applicationStatus,
      'Matemáticas (%)': app.examScores?.mathematics?.percentage || 'Pendiente',
      'Matemáticas (Score)': app.examScores?.mathematics?.score ? `${app.examScores.mathematics.score}/${app.examScores.mathematics.maxScore}` : '-',
      'Lenguaje (%)': app.examScores?.language?.percentage || 'Pendiente',
      'Lenguaje (Score)': app.examScores?.language?.score ? `${app.examScores.language.score}/${app.examScores.language.maxScore}` : '-',
      'Inglés (%)': app.examScores?.english?.percentage || 'Pendiente',
      'Inglés (Score)': app.examScores?.english?.score ? `${app.examScores.english.score}/${app.examScores.english.maxScore}` : '-',
      'Completitud Exámenes (%)': app.examScores?.completionRate || '0%',
      'Entrevistas Realizadas': app.familyInterviews?.length || 0,
      'Entrevistas (Detalle)': app.familyInterviews?.map(i =>
        `${i.interviewerName}: ${i.result || 'Pendiente'} (${i.score || 'N/A'}/10)`
      ).join('; ') || 'Sin entrevistas',
      'Documentos Aprobados': app.documents ? `${app.documents.approved}/${app.documents.total}` : '0/0',
      'Completitud Documentos (%)': app.documents?.completionRate || '0%'
    }));

    // Convertir a CSV
    const headers = Object.keys(excelData[0] || {});
    const csvContent = [
      headers.join(','),
      ...excelData.map(row => headers.map(header => {
        const value = String(row[header as keyof typeof row] || '');
        return value.includes(',') ? `"${value}"` : value;
      }).join(','))
    ].join('\n');

    // Descargar archivo
    const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `metricas_postulantes_${filters.academicYear || new Date().getFullYear()}.csv`;
    link.click();
  };

  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { variant: 'success' | 'warning' | 'error' | 'info', label: string }> = {
      'PENDING': { variant: 'warning', label: 'Pendiente' },
      'IN_PROGRESS': { variant: 'info', label: 'En Progreso' },
      'COMPLETED': { variant: 'success', label: 'Completado' },
      'APPROVED': { variant: 'success', label: 'Aprobado' },
      'REJECTED': { variant: 'error', label: 'Rechazado' },
      'UNDER_REVIEW': { variant: 'info', label: 'En Revisión' },
      'WAITLIST': { variant: 'warning', label: 'Lista de Espera' },
      'SUBMITTED': { variant: 'info', label: 'Enviado' }
    };

    const config = statusMap[status] || { variant: 'info' as const, label: status };
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const getScoreBadge = (percentage: string | null, status: string) => {
    if (status !== 'COMPLETED' || !percentage) {
      return <Badge variant="warning">Pendiente</Badge>;
    }

    const score = parseFloat(percentage);
    if (score >= 80) return <Badge variant="success">{percentage}%</Badge>;
    if (score >= 60) return <Badge variant="warning">{percentage}%</Badge>;
    return <Badge variant="error">{percentage}%</Badge>;
  };

  const getInterviewResultBadge = (result: string | null) => {
    if (!result) return <Badge variant="warning">Pendiente</Badge>;

    const resultMap: Record<string, { variant: 'success' | 'warning' | 'error', label: string }> = {
      'POSITIVE': { variant: 'success', label: 'Positivo' },
      'NEGATIVE': { variant: 'error', label: 'Negativo' },
      'NEUTRAL': { variant: 'warning', label: 'Neutral' }
    };

    const config = resultMap[result] || { variant: 'warning' as const, label: result };
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  // Datos para gráficos
  const getChartData = () => {
    // Distribución de rendimiento en exámenes
    const examPerformance = applicants.reduce((acc, app) => {
      const mathScore = parseFloat(app.examScores?.mathematics?.percentage || '0');
      const langScore = parseFloat(app.examScores?.language?.percentage || '0');
      const engScore = parseFloat(app.examScores?.english?.percentage || '0');

      const avgScore = (mathScore + langScore + engScore) / 3;

      if (avgScore >= 80) acc.excelente++;
      else if (avgScore >= 60) acc.bueno++;
      else if (avgScore > 0) acc.regular++;
      else acc.pendiente++;

      return acc;
    }, { excelente: 0, bueno: 0, regular: 0, pendiente: 0 });

    const performanceData = [
      { name: 'Excelente (≥80%)', value: examPerformance.excelente, color: '#10B981' },
      { name: 'Bueno (60-79%)', value: examPerformance.bueno, color: '#F59E0B' },
      { name: 'Regular (<60%)', value: examPerformance.regular, color: '#EF4444' },
      { name: 'Pendiente', value: examPerformance.pendiente, color: '#9CA3AF' }
    ];

    // Promedio de puntajes por examen
    const examAverages = {
      mathematics: 0,
      language: 0,
      english: 0,
      count: 0
    };

    applicants.forEach(app => {
      if (app.examScores?.mathematics?.percentage) {
        examAverages.mathematics += parseFloat(app.examScores.mathematics.percentage);
        examAverages.count++;
      }
      if (app.examScores?.language?.percentage) {
        examAverages.language += parseFloat(app.examScores.language.percentage);
      }
      if (app.examScores?.english?.percentage) {
        examAverages.english += parseFloat(app.examScores.english.percentage);
      }
    });

    const avgData = [
      { name: 'Matemáticas', promedio: examAverages.count > 0 ? Math.round(examAverages.mathematics / examAverages.count) : 0 },
      { name: 'Lenguaje', promedio: examAverages.count > 0 ? Math.round(examAverages.language / examAverages.count) : 0 },
      { name: 'Inglés', promedio: examAverages.count > 0 ? Math.round(examAverages.english / examAverages.count) : 0 }
    ];

    return { performanceData, avgData };
  };

  const { performanceData, avgData } = getChartData();

  // Obtener cursos únicos y estados únicos para filtros
  const uniqueGrades = [...new Set(applicants.map(a => a.gradeApplied))].sort();
  const uniqueStatuses = [...new Set(applicants.map(a => a.applicationStatus))];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando métricas de postulantes...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Actions */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Métricas Detalladas de Postulantes</h2>
          <p className="text-gray-600 mt-1">
            Rendimiento académico y entrevistas de cada postulante
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2"
          >
            <FiFilter className="h-4 w-4" />
            {showFilters ? 'Ocultar Filtros' : 'Mostrar Filtros'}
          </Button>
          <Button
            variant="primary"
            onClick={exportToExcel}
            disabled={applicants.length === 0}
            className="flex items-center gap-2"
          >
            <FiDownload className="h-4 w-4" />
            Exportar a Excel
          </Button>
        </div>
      </div>

      {/* Filters Panel */}
      {showFilters && (
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Filtros</h3>
            <button
              onClick={() => setShowFilters(false)}
              className="text-gray-400 hover:text-gray-600"
            >
              <FiX className="h-5 w-5" />
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Año Académico
              </label>
              <select
                value={filters.academicYear || ''}
                onChange={(e) => setFilters({ ...filters, academicYear: parseInt(e.target.value) })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value={new Date().getFullYear()}>{new Date().getFullYear()}</option>
                <option value={new Date().getFullYear() - 1}>{new Date().getFullYear() - 1}</option>
                <option value={new Date().getFullYear() + 1}>{new Date().getFullYear() + 1}</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Curso
              </label>
              <select
                value={filters.grade || ''}
                onChange={(e) => setFilters({ ...filters, grade: e.target.value || undefined })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Todos los cursos</option>
                {uniqueGrades.map(grade => (
                  <option key={grade} value={grade}>{grade}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Estado
              </label>
              <select
                value={filters.status || ''}
                onChange={(e) => setFilters({ ...filters, status: e.target.value || undefined })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Todos los estados</option>
                {uniqueStatuses.map(status => (
                  <option key={status} value={status}>
                    {status === 'APPROVED' ? 'Aprobado' :
                     status === 'REJECTED' ? 'Rechazado' :
                     status === 'UNDER_REVIEW' ? 'En Revisión' :
                     status === 'WAITLIST' ? 'Lista de Espera' :
                     status === 'SUBMITTED' ? 'Enviado' : status}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {(filters.grade || filters.status) && (
            <div className="mt-4 flex items-center gap-2">
              <span className="text-sm text-gray-600">Filtros activos:</span>
              {filters.grade && (
                <Badge variant="info">
                  Curso: {filters.grade}
                  <button
                    onClick={() => setFilters({ ...filters, grade: undefined })}
                    className="ml-2 hover:text-red-600"
                  >
                    ×
                  </button>
                </Badge>
              )}
              {filters.status && (
                <Badge variant="info">
                  Estado: {filters.status}
                  <button
                    onClick={() => setFilters({ ...filters, status: undefined })}
                    className="ml-2 hover:text-red-600"
                  >
                    ×
                  </button>
                </Badge>
              )}
              <button
                onClick={() => setFilters({ academicYear: filters.academicYear })}
                className="text-sm text-blue-600 hover:text-blue-800 underline ml-2"
              >
                Limpiar todos
              </button>
            </div>
          )}
        </Card>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Postulantes</p>
              <p className="text-3xl font-bold text-blue-600 mt-2">{applicants.length}</p>
            </div>
            <FiUser className="h-8 w-8 text-blue-500" />
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Evaluaciones Completadas</p>
              <p className="text-3xl font-bold text-green-600 mt-2">
                {applicants.length > 0 ? Math.round(
                  applicants.reduce((sum, a) => {
                    const completed = [a.examScores.mathematics, a.examScores.language, a.examScores.english]
                      .filter(e => e.status === 'COMPLETED').length;
                    return sum + (completed / 3) * 100;
                  }, 0) / applicants.length
                ) : 0}%
              </p>
            </div>
            <FiAward className="h-8 w-8 text-green-500" />
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Entrevistas Realizadas</p>
              <p className="text-3xl font-bold text-purple-600 mt-2">
                {applicants.reduce((sum, a) => sum + a.familyInterviews.length, 0)}
              </p>
            </div>
            <FiFileText className="h-8 w-8 text-purple-500" />
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Documentos Aprobados</p>
              <p className="text-3xl font-bold text-orange-600 mt-2">
                {applicants.length > 0 ? Math.round(
                  applicants.reduce((sum, a) => sum + parseFloat(a.documents.completionRate), 0) / applicants.length
                ) : 0}%
              </p>
            </div>
            <FiTrendingUp className="h-8 w-8 text-orange-500" />
          </div>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Performance Distribution */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Distribución de Rendimiento</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={performanceData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {performanceData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </Card>

        {/* Average Scores by Exam */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Promedio por Examen</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={avgData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis domain={[0, 100]} />
              <Tooltip />
              <Legend />
              <Bar dataKey="promedio" fill="#3B82F6" name="Promedio (%)" />
            </BarChart>
          </ResponsiveContainer>
        </Card>
      </div>

      {/* Detailed Table */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Detalle por Postulante ({applicants.length} resultados)
        </h3>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Postulante
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Curso
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Estado
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Matemáticas
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Lenguaje
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Inglés
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Entrevistas Familiares
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Documentos
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {applicants.map((applicant) => (
                <tr key={applicant.applicationId} className="hover:bg-gray-50">
                  {/* Postulante Info */}
                  <td className="px-4 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center">
                        <FiUser className="h-5 w-5 text-blue-600" />
                      </div>
                      <div className="ml-3">
                        <div className="text-sm font-medium text-gray-900">
                          {applicant.studentName}
                        </div>
                        <div className="text-xs text-gray-500">
                          ID: {applicant.applicationId}
                        </div>
                      </div>
                    </div>
                  </td>

                  {/* Curso */}
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                    {applicant.gradeApplied}
                  </td>

                  {/* Estado */}
                  <td className="px-4 py-4 whitespace-nowrap">
                    {getStatusBadge(applicant.applicationStatus)}
                  </td>

                  {/* Matemáticas */}
                  <td className="px-4 py-4 whitespace-nowrap">
                    <div className="space-y-1">
                      {getScoreBadge(applicant.examScores?.mathematics?.percentage || null, applicant.examScores?.mathematics?.status || 'PENDING')}
                      {applicant.examScores?.mathematics?.score !== null && applicant.examScores?.mathematics?.score !== undefined && (
                        <div className="text-xs text-gray-500">
                          {applicant.examScores.mathematics.score}/{applicant.examScores.mathematics.maxScore}
                        </div>
                      )}
                    </div>
                  </td>

                  {/* Lenguaje */}
                  <td className="px-4 py-4 whitespace-nowrap">
                    <div className="space-y-1">
                      {getScoreBadge(applicant.examScores?.language?.percentage || null, applicant.examScores?.language?.status || 'PENDING')}
                      {applicant.examScores?.language?.score !== null && applicant.examScores?.language?.score !== undefined && (
                        <div className="text-xs text-gray-500">
                          {applicant.examScores.language.score}/{applicant.examScores.language.maxScore}
                        </div>
                      )}
                    </div>
                  </td>

                  {/* Inglés */}
                  <td className="px-4 py-4 whitespace-nowrap">
                    <div className="space-y-1">
                      {getScoreBadge(applicant.examScores?.english?.percentage || null, applicant.examScores?.english?.status || 'PENDING')}
                      {applicant.examScores?.english?.score !== null && applicant.examScores?.english?.score !== undefined && (
                        <div className="text-xs text-gray-500">
                          {applicant.examScores.english.score}/{applicant.examScores.english.maxScore}
                        </div>
                      )}
                    </div>
                  </td>

                  {/* Entrevistas Familiares */}
                  <td className="px-4 py-4">
                    {applicant.familyInterviews && applicant.familyInterviews.length > 0 ? (
                      <div className="space-y-2">
                        {applicant.familyInterviews.map((interview, idx) => (
                          <div key={idx} className="text-sm">
                            <div className="font-medium text-gray-700">{interview.interviewerName}</div>
                            <div className="flex items-center gap-2">
                              {getInterviewResultBadge(interview.result)}
                              {interview.score !== null && (
                                <span className="text-xs text-gray-500">
                                  Puntaje: {interview.score}/10
                                </span>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <Badge variant="warning">Sin entrevistas</Badge>
                    )}
                  </td>

                  {/* Documentos */}
                  <td className="px-4 py-4 whitespace-nowrap">
                    <div className="space-y-1">
                      <div className="text-sm font-medium text-gray-900">
                        {applicant.documents?.completionRate || '0'}%
                      </div>
                      <div className="text-xs text-gray-500">
                        {applicant.documents?.approved || 0}/{applicant.documents?.total || 0} aprobados
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-1.5">
                        <div
                          className="bg-green-500 h-1.5 rounded-full"
                          style={{ width: `${applicant.documents?.completionRate || 0}%` }}
                        ></div>
                      </div>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {applicants.length === 0 && (
            <div className="text-center py-12">
              <FiUser className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No se encontraron postulantes para los filtros seleccionados</p>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
};

export default ApplicantMetricsView;
