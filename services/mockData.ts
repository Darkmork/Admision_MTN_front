
import { Application, ApplicationStatus } from '../types';

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
