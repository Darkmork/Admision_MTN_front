
import { Application, ApplicationStatus } from '../types';

// Mock exam data for analytics
export const mockExamResults = [
  { id: 'EXAM-001', studentId: 'STU-001', subject: 'Matemática', score: 85, maxScore: 100, date: '2024-07-20' },
  { id: 'EXAM-002', studentId: 'STU-002', subject: 'Matemática', score: 92, maxScore: 100, date: '2024-07-21' },
  { id: 'EXAM-003', studentId: 'STU-003', subject: 'Matemática', score: 78, maxScore: 100, date: '2024-07-22' },
  { id: 'EXAM-004', studentId: 'STU-004', subject: 'Matemática', score: 65, maxScore: 100, date: '2024-07-23' },
  { id: 'EXAM-005', studentId: 'STU-005', subject: 'Matemática', score: 88, maxScore: 100, date: '2024-07-24' },
  { id: 'EXAM-006', studentId: 'STU-001', subject: 'Lenguaje', score: 90, maxScore: 100, date: '2024-07-25' },
  { id: 'EXAM-007', studentId: 'STU-002', subject: 'Lenguaje', score: 87, maxScore: 100, date: '2024-07-26' },
  { id: 'EXAM-008', studentId: 'STU-003', subject: 'Lenguaje', score: 82, maxScore: 100, date: '2024-07-27' },
  { id: 'EXAM-009', studentId: 'STU-004', subject: 'Lenguaje', score: 70, maxScore: 100, date: '2024-07-28' },
  { id: 'EXAM-010', studentId: 'STU-005', subject: 'Lenguaje', score: 95, maxScore: 100, date: '2024-07-29' },
  { id: 'EXAM-011', studentId: 'STU-001', subject: 'Inglés', score: 80, maxScore: 100, date: '2024-07-30' },
  { id: 'EXAM-012', studentId: 'STU-002', subject: 'Inglés', score: 85, maxScore: 100, date: '2024-07-31' },
  { id: 'EXAM-013', studentId: 'STU-003', subject: 'Inglés', score: 75, maxScore: 100, date: '2024-08-01' },
  { id: 'EXAM-014', studentId: 'STU-004', subject: 'Inglés', score: 60, maxScore: 100, date: '2024-08-02' },
  { id: 'EXAM-015', studentId: 'STU-005', subject: 'Inglés', score: 90, maxScore: 100, date: '2024-08-03' },
];

export const mockApplications: Application[] = [
    {
        id: 'APP-001',
        applicant: { id: 'STU-001', firstName: 'Mateo', lastName: 'González Rojas', birthDate: '2018-05-10', grade: 'Pre-Kínder' },
        status: ApplicationStatus.SUBMITTED,
        submissionDate: '2024-07-15',
        documents: [
            { id: 'DOC-01', name: 'Certificado de Nacimiento', status: 'approved' },
            { id: 'DOC-02', name: 'Informe de Jardín Anterior', status: 'submitted' },
            { id: 'DOC-03', name: 'Certificado de Bautismo', status: 'pending' },
        ],
        interviewDate: '2024-08-05 10:00'
    },
    {
        id: 'APP-002',
        applicant: { id: 'STU-002', firstName: 'Sofía', lastName: 'Martínez López', birthDate: '2017-09-22', grade: 'Kínder' },
        status: ApplicationStatus.ACCEPTED,
        submissionDate: '2024-07-12',
        documents: [
            { id: 'DOC-01', name: 'Certificado de Nacimiento', status: 'approved' },
            { id: 'DOC-02', name: 'Informe de Jardín Anterior', status: 'approved' },
            { id: 'DOC-03', name: 'Certificado de Bautismo', status: 'approved' },
        ],
        interviewDate: '2024-08-02 11:30'
    },
    {
        id: 'APP-003',
        applicant: { id: 'STU-003', firstName: 'Lucas', lastName: 'Silva Castro', birthDate: '2019-01-30', grade: 'Playgroup' },
        status: ApplicationStatus.INTERVIEW_SCHEDULED,
        submissionDate: '2024-07-20',
        documents: [
            { id: 'DOC-01', name: 'Certificado de Nacimiento', status: 'submitted' },
            { id: 'DOC-02', name: 'Informe de Jardín Anterior', status: 'pending' },
            { id: 'DOC-03', name: 'Certificado de Bautismo', status: 'pending' },
        ],
        interviewDate: '2024-08-10 09:00'
    },
    {
        id: 'APP-004',
        applicant: { id: 'STU-004', firstName: 'Isabella', lastName: 'Fernández Soto', birthDate: '2018-03-14', grade: 'Pre-Kínder' },
        status: ApplicationStatus.REJECTED,
        submissionDate: '2024-07-11',
        documents: [
            { id: 'DOC-01', name: 'Certificado de Nacimiento', status: 'approved' },
            { id: 'DOC-02', name: 'Informe de Jardín Anterior', status: 'approved' },
            { id: 'DOC-03', name: 'Certificado de Bautismo', status: 'approved' },
        ],
        interviewDate: '2024-08-01 14:00'
    },
    {
        id: 'APP-005',
        applicant: { id: 'STU-005', firstName: 'Benjamín', lastName: 'Vidal Morales', birthDate: '2017-11-05', grade: 'Kínder' },
        status: ApplicationStatus.WAITLIST,
        submissionDate: '2024-07-18',
        documents: [
            { id: 'DOC-01', name: 'Certificado de Nacimiento', status: 'approved' },
            { id: 'DOC-02', name: 'Informe de Jardín Anterior', status: 'approved' },
            { id: 'DOC-03', name: 'Certificado de Bautismo', status: 'approved' },
        ],
        interviewDate: '2024-08-08 15:30'
    },
];
