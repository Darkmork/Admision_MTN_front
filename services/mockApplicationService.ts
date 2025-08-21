// Mock service para aplicaciones - compatible con EvaluatorManagement
export interface Application {
  id: number;
  status: string;
  submissionDate: string;
  applicant: {
    firstName: string;
    lastName: string;
    grade: string;
  };
}

export const mockApplications: Application[] = [
  {
    id: 7,
    status: 'SUBMITTED',
    submissionDate: '2025-08-17T10:30:00',
    applicant: {
      firstName: 'Sofia',
      lastName: 'Martinez',
      grade: '2° Básico'
    }
  },
  {
    id: 8,
    status: 'SUBMITTED',
    submissionDate: '2025-08-18T09:15:00',
    applicant: {
      firstName: 'Jorgito',
      lastName: 'Gangalito',
      grade: '8° Básico'
    }
  },
  {
    id: 6,
    status: 'PENDING',
    submissionDate: '2025-08-16T14:20:00',
    applicant: {
      firstName: 'Jorge',
      lastName: 'Gangale',
      grade: '3° Medio'
    }
  },
  {
    id: 5,
    status: 'DOCUMENTS_REQUESTED',
    submissionDate: '2025-08-15T11:45:00',
    applicant: {
      firstName: 'Juan',
      lastName: 'Pérez',
      grade: '3° Básico'
    }
  },
  {
    id: 4,
    status: 'PENDING',
    submissionDate: '2025-08-14T16:10:00',
    applicant: {
      firstName: 'Gaspar Andres',
      lastName: 'Gonzalez Flores',
      grade: '3° Medio'
    }
  },
  {
    id: 3,
    status: 'PENDING',
    submissionDate: '2025-08-13T08:30:00',
    applicant: {
      firstName: 'Gaspar Andres',
      lastName: 'Gonzalez Flores',
      grade: '3° Medio'
    }
  }
];

export const mockApplicationService = {
  getAllApplications: async (): Promise<Application[]> => {
    // Simular delay de red
    await new Promise(resolve => setTimeout(resolve, 500));
    return mockApplications;
  },

  getApplicationById: async (id: number): Promise<Application | null> => {
    await new Promise(resolve => setTimeout(resolve, 200));
    return mockApplications.find(app => app.id === id) || null;
  },

  getApplicationsByStatus: async (status: string): Promise<Application[]> => {
    await new Promise(resolve => setTimeout(resolve, 300));
    return mockApplications.filter(app => app.status === status);
  }
};