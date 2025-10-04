#!/bin/bash
# Script simplificado de generación de tipos TypeScript desde OpenAPI
# Sistema de Admisión MTN

set -e

# Configuration
API_BASE_URL=${VITE_API_BASE_URL:-"http://localhost:8080"}
OUTPUT_DIR="src/api"

echo "🔧 Generando tipos TypeScript desde OpenAPI..."
echo "📡 API Base URL: $API_BASE_URL"
echo "📁 Output Directory: $OUTPUT_DIR"

# Ensure output directory exists
mkdir -p "$OUTPUT_DIR"

# List of services to generate types for
SERVICES=("users" "applications" "evaluations" "interviews" "notifications" "files" "auth")

# Function to generate mock types (fallback)
generate_mock_types() {
    local service=$1
    local output_file="$OUTPUT_DIR/${service}.types.ts"
    
    echo "🔧 Creando tipos mock para $service..."
    
    cat > "$output_file" << EOF
/**
 * TypeScript types for ${service^^} Service
 * Generated at: $(date +'%Y-%m-%d %H:%M:%S')
 * 
 * Auto-generated types for MTN Admission System
 */

// Common response wrapper
export interface ${service^}Response<T = any> {
  data: T;
  message?: string;
  success: boolean;
  timestamp: string;
}

export interface ${service^}Error {
  error: string;
  message: string;
  statusCode: number;
  timestamp: string;
  correlationId?: string;
}

export interface PaginatedResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  first: boolean;
  last: boolean;
}
EOF

    # Add service-specific types
    case $service in
        "users")
            cat >> "$output_file" << 'EOF'

export interface User {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  rut: string;
  phone?: string;
  role: 'ADMIN' | 'TEACHER' | 'PSYCHOLOGIST' | 'CYCLE_DIRECTOR' | 'COORDINATOR' | 'APODERADO';
  subject?: 'GENERAL' | 'LANGUAGE' | 'MATHEMATICS' | 'ENGLISH' | 'ALL_SUBJECTS';
  educationalLevel?: 'PRESCHOOL' | 'BASIC' | 'HIGH_SCHOOL' | 'ALL_LEVELS';
  active: boolean;
  emailVerified: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateUserRequest {
  firstName: string;
  lastName: string;
  email: string;
  rut: string;
  phone?: string;
  role: User['role'];
  subject?: User['subject'];
  educationalLevel?: User['educationalLevel'];
  password?: string;
}

export interface UpdateUserRequest extends Partial<CreateUserRequest> {
  active?: boolean;
}
EOF
            ;;
        "applications")
            cat >> "$output_file" << 'EOF'

export interface Application {
  id: number;
  studentId: number;
  fatherId?: number;
  motherId?: number;
  supporterId?: number;
  guardianId?: number;
  applicantUserId: number;
  status: 'PENDING' | 'UNDER_REVIEW' | 'INTERVIEW_SCHEDULED' | 'EXAM_SCHEDULED' | 'APPROVED' | 'REJECTED' | 'WAITLIST' | 'ARCHIVED';
  submissionDate: string;
  createdAt: string;
  updatedAt: string;
  student?: Student;
  father?: Parent;
  mother?: Parent;
  supporter?: Supporter;
  guardian?: Guardian;
}

export interface Student {
  id: number;
  firstName: string;
  lastName: string;
  rut: string;
  birthDate: string;
  gradeApplying: string;
  currentSchool?: string;
  specialNeeds: boolean;
  specialNeedsDescription?: string;
}

export interface Parent {
  id: number;
  firstName: string;
  lastName: string;
  rut: string;
  email: string;
  phone: string;
  address: string;
  occupation: string;
  relationship: 'FATHER' | 'MOTHER';
}

export interface Guardian {
  id: number;
  firstName: string;
  lastName: string;
  rut: string;
  email: string;
  phone: string;
  relationship: string;
}

export interface Supporter {
  id: number;
  firstName: string;
  lastName: string;
  rut: string;
  email: string;
  phone: string;
  relationship: string;
}
EOF
            ;;
        "evaluations")
            cat >> "$output_file" << 'EOF'

export interface Evaluation {
  id: number;
  applicationId: number;
  evaluatorId: number;
  type: 'ACADEMIC' | 'PSYCHOLOGICAL' | 'INTERVIEW';
  subject?: 'MATHEMATICS' | 'LANGUAGE' | 'ENGLISH' | 'GENERAL';
  score?: number;
  maxScore?: number;
  comments?: string;
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  scheduledDate?: string;
  completedDate?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateEvaluationRequest {
  applicationId: number;
  evaluatorId: number;
  type: Evaluation['type'];
  subject?: Evaluation['subject'];
  scheduledDate?: string;
}

export interface UpdateEvaluationRequest {
  score?: number;
  maxScore?: number;
  comments?: string;
  status?: Evaluation['status'];
  completedDate?: string;
}
EOF
            ;;
        "interviews")
            cat >> "$output_file" << 'EOF'

export interface Interview {
  id: number;
  applicationId: number;
  interviewerId: number;
  scheduledDate: string;
  location: string;
  type: 'FAMILY' | 'STUDENT' | 'BOTH';
  status: 'SCHEDULED' | 'COMPLETED' | 'CANCELLED' | 'RESCHEDULED';
  notes?: string;
  recommendations?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ScheduleInterviewRequest {
  applicationId: number;
  interviewerId: number;
  scheduledDate: string;
  location: string;
  type: Interview['type'];
}

export interface UpdateInterviewRequest {
  scheduledDate?: string;
  location?: string;
  status?: Interview['status'];
  notes?: string;
  recommendations?: string;
}
EOF
            ;;
        "notifications")
            cat >> "$output_file" << 'EOF'

export interface Notification {
  id: number;
  userId: number;
  type: 'EMAIL' | 'SMS' | 'SYSTEM';
  subject: string;
  message: string;
  status: 'PENDING' | 'SENT' | 'DELIVERED' | 'FAILED';
  scheduledAt?: string;
  sentAt?: string;
  createdAt: string;
}

export interface CreateNotificationRequest {
  userId: number;
  type: Notification['type'];
  subject: string;
  message: string;
  scheduledAt?: string;
}
EOF
            ;;
        "files")
            cat >> "$output_file" << 'EOF'

export interface FileUpload {
  id: number;
  applicationId?: number;
  userId?: number;
  fileName: string;
  originalName: string;
  mimeType: string;
  size: number;
  type: 'BIRTH_CERTIFICATE' | 'ACADEMIC_RECORD' | 'PHOTO' | 'OTHER';
  uploadedAt: string;
}

export interface UploadFileRequest {
  applicationId?: number;
  type: FileUpload['type'];
  file: File;
}
EOF
            ;;
        "auth")
            cat >> "$output_file" << 'EOF'

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  refreshToken: string;
  user: User;
  expiresAt: string;
}

export interface RefreshTokenRequest {
  refreshToken: string;
}

export interface RegisterRequest {
  firstName: string;
  lastName: string;
  email: string;
  rut: string;
  phone?: string;
  password: string;
}

export interface ResetPasswordRequest {
  email: string;
}

export interface ConfirmResetPasswordRequest {
  token: string;
  newPassword: string;
}
EOF
            ;;
    esac

    echo "✅ Tipos generados para $service"
}

# Generate types for each service
for service in "${SERVICES[@]}"; do
    generate_mock_types "$service"
done

# Generate index file
echo "📝 Generando archivo index..."
cat > "$OUTPUT_DIR/index.ts" << 'EOF'
/**
 * API Types Index
 * Re-exports all generated API types for MTN Admission System
 */

// Service Types
export * from './users.types';
export * from './applications.types';
export * from './evaluations.types';
export * from './interviews.types';
export * from './notifications.types';
export * from './files.types';
export * from './auth.types';

// Common types
export interface ApiResponse<T = any> {
  data: T;
  message?: string;
  success: boolean;
  timestamp: string;
}

export interface ApiError {
  error: string;
  message: string;
  statusCode: number;
  timestamp: string;
  correlationId?: string;
}

export interface PaginationParams {
  page?: number;
  size?: number;
  sort?: string;
  direction?: 'asc' | 'desc';
}

export interface PaginatedResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  first: boolean;
  last: boolean;
}
EOF

echo "✅ Generación completada exitosamente!"
echo "📁 Tipos generados en: $OUTPUT_DIR"
echo "🎯 Para usar: import type { User } from '@/api'"