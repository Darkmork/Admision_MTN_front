/**
 * Dashboard & Analytics API Types
 * Sistema de Admisión MTN
 */

export interface DashboardStats {
  totalApplications: number;
  acceptanceRate: number;
  availableSlots: number;
  submittedCount: number;
  underReviewCount: number;
  approvedCount: number;
  rejectedCount: number;
  waitlistCount: number;
  completedInterviews: number;
  scheduledInterviews: number;
  pendingEvaluations: number;
  month: string;
  timestamp?: string;
}

export interface AdminStats extends DashboardStats {
  byGrade: GradeStats[];
  bySchool: SchoolStats[];
  recentApplications: ApplicationSummary[];
  evaluationProgress: EvaluationProgress;
}

export interface GradeStats {
  grade: string;
  total: number;
  approved: number;
  rejected: number;
  pending: number;
  acceptanceRate: number;
}

export interface SchoolStats {
  school: string;
  total: number;
  approved: number;
  rejected: number;
}

export interface ApplicationSummary {
  id: number;
  studentName: string;
  gradeApplied: string;
  status: string;
  submissionDate: string;
  hasInterview: boolean;
}

export interface EvaluationProgress {
  totalEvaluations: number;
  completedEvaluations: number;
  pendingEvaluations: number;
  averageScore: number;
}

export interface AnalyticsMetrics {
  totalApplications: number;
  approvedApplications: number;
  rejectedApplications: number;
  pendingApplications: number;
  acceptanceRate: number;
  averageProcessingTime: number;
  interviewsScheduled: number;
  interviewsCompleted: number;
  evaluationsCompleted: number;
  documentCompletionRate: number;
  timestamp: string;
}

export interface StatusDistribution {
  status: string;
  count: number;
  percentage: number;
  color?: string;
}

export interface TemporalTrend {
  month: string;
  year: number;
  totalApplications: number;
  approvedApplications: number;
  rejectedApplications: number;
  growthRate: number;
}

export interface MonthlyTrend {
  month: string;
  total: number;
  submitted: number;
  approved: number;
  rejected: number;
  underReview: number;
}

export interface GradeDistribution {
  grade: string;
  count: number;
  percentage: number;
}

export interface Alert {
  id: string;
  type: 'capacity' | 'trend' | 'performance' | 'warning';
  severity: 'info' | 'warning' | 'error';
  title: string;
  message: string;
  actionable: boolean;
  action?: string;
  timestamp: string;
}

export interface DetailedAdminStats {
  totalApplications: number;
  statusBreakdown: {
    submitted: number;
    underReview: number;
    approved: number;
    rejected: number;
    waitlist: number;
  };
  interviewMetrics: {
    scheduled: number;
    completed: number;
    pending: number;
    completionRate: number;
  };
  evaluationMetrics: {
    total: number;
    completed: number;
    pending: number;
    averageScore: number;
  };
  monthlyTrends: MonthlyTrend[];
  gradeDistribution: GradeDistribution[];
  availableYears: number[];
}

export interface DashboardFilters {
  academicYear?: number;
  startDate?: string;
  endDate?: string;
  gradeLevel?: string;
  status?: string;
}

export interface ExamScore {
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED';
  score: number | null;
  maxScore: number | null;
  percentage: string | null;
}

export interface FamilyInterview {
  interviewerName: string;
  score: number | null;
  result: 'POSITIVE' | 'NEGATIVE' | 'NEUTRAL' | null;
  status: 'SCHEDULED' | 'COMPLETED' | 'CANCELLED' | 'RESCHEDULED';
}

export interface DocumentMetrics {
  approved: number;
  total: number;
  completionRate: string;
}

export interface ApplicantMetric {
  applicationId: number;
  studentId: number;
  studentName: string;
  gradeApplied: string;
  applicationStatus: string;
  examScores: {
    mathematics: ExamScore;
    language: ExamScore;
    english: ExamScore;
    completionRate: string;
  };
  familyInterviews: FamilyInterview[];
  documents: DocumentMetrics;
}

export interface ApplicantMetricsFilters {
  academicYear?: number;
  grade?: string;
  status?: string;
  sortBy?: 'studentName' | 'gradeApplied' | 'evaluationPassRate' | 'interviewAvg' | 'applicationStatus';
  sortOrder?: 'ASC' | 'DESC';
}

export interface ApplicantMetricsResponse {
  success: boolean;
  data: ApplicantMetric[];
  meta: {
    total: number;
    timestamp: string;
  };
}
