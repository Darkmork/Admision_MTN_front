export const API_BASE_URL = 'http://localhost:8080/api';

export const API_ENDPOINTS = {
  // Authentication
  AUTH: '/auth',
  LOGIN: '/auth/login',
  REGISTER: '/auth/register',
  VERIFY_EMAIL: '/auth/verify-email',
  
  // Applications
  APPLICATIONS: '/applications',
  MY_APPLICATIONS: '/applications/my-applications',
  DASHBOARD_DATA: '/applications/dashboard-data',
  
  // Documents
  DOCUMENTS: '/documents',
  DOCUMENT_STATUS: '/document-status',
  
  // Evaluations
  EVALUATIONS: '/evaluations',
  MY_EVALUATIONS: '/evaluations/my-evaluations',
  PENDING_EVALUATIONS: '/evaluations/pending',
  
  // Schedules - NEW
  SCHEDULES: '/schedules',
  FAMILY_SCHEDULES: '/schedules/family',
  EVALUATOR_SCHEDULES: '/schedules/evaluator',
  CONFIRM_SCHEDULE: '/schedules/{id}/confirm',
  RESCHEDULE: '/schedules/{id}/reschedule',
  COMPLETE_SCHEDULE: '/schedules/{id}/complete',
  PENDING_CONFIRMATIONS: '/schedules/pending-confirmations',
  
  // Users
  USERS: '/users',
  SCHOOL_USERS: '/school-users'
};

export const STORAGE_KEYS = {
  AUTH_TOKEN: 'auth_token',
  AUTHENTICATED_USER: 'authenticated_user',
  CURRENT_PROFESSOR: 'currentProfessor'
};

export const DEFAULT_CONFIG = {
  REQUEST_TIMEOUT: 10000,
  RETRY_ATTEMPTS: 3,
  RETRY_DELAY: 1000
};