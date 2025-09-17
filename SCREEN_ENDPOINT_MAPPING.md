# Screen → Endpoint Mapping Guide

## 🎯 Implementation Complete

This guide documents the complete mapping of application screens to new gateway endpoints, implementing the hybrid monolith/microservices architecture with feature flag support.

## 🔧 Architecture Pattern

```
Frontend → API Gateway → [Feature Flags] → Monolith/Microservices
```

- **All requests** go through the gateway (no direct FE routes change)
- **Feature flags** in gateway handle monolith↔microservices routing
- **Binary uploads** use hybrid pattern: monolith storage + gateway metadata
- **Authentication** via Bearer tokens with roles extracted from JWT

## 📱 Screen Mappings

### 1. 👤 User Profile Management

**Screen**: Profile settings, preferences, security

**Primary Endpoint**: `GET /api/users/me`
- ✅ **Roles extracted from JWT token** (no separate role endpoint needed)
- ✅ **User preferences** and session management
- ✅ **Activity tracking** and security features

```typescript
// Implementation
import profileService from './services/profileService';

const profile = await profileService.getCurrentUser();
// Returns: { id, firstName, lastName, role, permissions, preferences, sessionInfo }
```

**Related Endpoints**:
- `PUT /api/users/me` - Update profile
- `POST /api/users/me/change-password` - Password management
- `PATCH /api/users/me/preferences` - Settings update
- `GET /api/users/me/sessions` - Security management

---

### 2. 📝 Application Workflow (Families)

**Screens**: Application form, document upload, status tracking

#### Draft Management
**Endpoint**: `POST /api/applications`
- ✅ **Create draft** allows incremental completion
- ✅ **Auto-save** with completion percentage tracking
- ✅ **Validation** before submission

```typescript
// Create Draft
const draft = await applicationWorkflowService.createDraft({
  firstName: 'Joaquín',
  lastName: 'González', 
  gradeApplying: '1° Básico'
});

// Update Draft  
const updated = await applicationWorkflowService.updateDraft(draftId, updatedData);
```

#### Submission Process
**Endpoint**: `POST /api/applications/{id}/submit`
- ✅ **Final validation** and completeness check
- ✅ **Confirmation code** generation
- ✅ **Automatic notifications** to family
- ✅ **Workflow triggers** (evaluations, document requests)

```typescript
// Submit Application
const submission = await applicationWorkflowService.submitApplication(applicationId, {
  parentalConsent: true,
  termsAccepted: true,
  privacyPolicyAccepted: true
});
// Returns: { confirmationCode, requiredDocuments, nextSteps }
```

#### Status & History Tracking
**Endpoints**: 
- `GET /api/applications/{id}` - Current status with enriched data
- `GET /api/applications/{id}/transitions` - Complete audit trail

```typescript
// Enhanced Status
const status = await applicationWorkflowService.getApplicationStatus(applicationId);
// Returns: { status, nextSteps, currentStageProgress, assignedEvaluators }

// Complete History
const history = await applicationWorkflowService.getApplicationHistory(applicationId);
// Returns: { transitions, timeline, currentStatus }
```

---

### 3. 📄 Document Management

**Screens**: Document upload, validation status, requirements checklist

#### Hybrid Upload Pattern
**Workflow**: Binary to monolith → Metadata to gateway

```typescript
// Complete Upload Process
const document = await documentGatewayService.uploadDocument({
  file: selectedFile,
  documentType: 'BIRTH_CERTIFICATE',
  applicationId: applicationId,
  description: 'Certificado de nacimiento'
});

// Step 1: Upload binary to monolith → get external_id
// Step 2: Register metadata in gateway with external_id
// Returns: { externalId, downloadUrl, validationStatus }
```

#### Metadata Management
**Endpoint**: `POST /api/applications/{id}/documents`
- ✅ **Links external_id** from monolith to application
- ✅ **Document requirements** tracking
- ✅ **Validation status** monitoring
- ✅ **Download URLs** with expiration

```typescript
// Add Metadata (called automatically by upload service)
const metadata = await applicationWorkflowService.addDocumentMetadata(applicationId, {
  externalId: 'DOC_12345_ABCDEF',
  documentType: 'BIRTH_CERTIFICATE',
  fileName: 'certificado_joaquin.pdf'
});
```

#### Document Validation
**Features**: AI/ML validation, manual review flags

```typescript
// Validate Document
const validation = await documentGatewayService.validateDocument(
  externalId,
  'BIRTH_CERTIFICATE',
  true // strict validation
);
// Returns: { isValid, validationDetails, suggestedActions }
```

---

### 4. 🎯 Evaluation Management (Teachers/Psychologists)

**Screens**: Evaluation dashboard, scoring forms, workload management

#### Assignment & Workload
**Endpoint**: `GET /api/evaluations?status=ASSIGNED`
- ✅ **Filtered by current evaluator** (from JWT token)
- ✅ **Student information** included
- ✅ **Priority and deadline** management
- ✅ **Workload balancing** features

```typescript
// Get Assigned Evaluations
const assignments = await evaluationWorkflowService.getAssignedEvaluations({
  status: 'ASSIGNED',
  includeStudentInfo: true
});

// Check Current Workload
const workload = await evaluationWorkflowService.getEvaluatorWorkload();
// Returns: { currentLoad, availability, maxCapacity }
```

#### Evaluation Lifecycle
**Endpoints**:
- `POST /api/evaluations/{id}/start` - Begin evaluation
- `POST /api/evaluations/{id}/scores` - Submit scores
- `POST /api/evaluations/{id}/complete` - Finalize

```typescript
// Start Evaluation
const started = await evaluationWorkflowService.startEvaluation(evalId, {
  startNotes: 'Iniciando evaluación académica',
  sessionType: 'IN_PERSON',
  estimatedDuration: 60
});

// Submit Scores
const scored = await evaluationWorkflowService.submitScores(evalId, {
  scores: { mathematics: 85, language: 78 },
  overallScore: 81.5,
  recommendations: 'Buen desempeño general'
});

// Complete Evaluation
const completed = await evaluationWorkflowService.completeEvaluation(evalId, {
  finalScore: 85,
  maxScore: 100,
  finalRecommendations: 'Recomendar admisión'
});
```

---

### 5. 🤝 Interview Management (Cycle Directors)

**Screens**: Interview calendar, scheduling, confirmation tracking

#### Scheduling System
**Endpoint**: `POST /api/interviews`
- ✅ **Availability checking** across interviewers
- ✅ **Automatic invitations** to all participants
- ✅ **Virtual meeting** integration (Zoom, Teams)
- ✅ **Confirmation tracking** per participant

```typescript
// Schedule Interview
const scheduled = await interviewWorkflowService.scheduleInterview({
  applicationId: 123,
  interviewerId: 45,
  scheduledDate: '2025-02-15T10:00:00Z',
  duration: 60,
  location: 'Sala de Entrevistas',
  type: 'FAMILY',
  participants: [
    { role: 'STUDENT', name: 'Joaquín', email: 'padre@example.com', required: true },
    { role: 'FATHER', name: 'Carlos', email: 'padre@example.com', required: true }
  ]
});
// Returns: { confirmationCode, invitationsSent, virtualMeetingInfo }
```

#### Interview Actions
**Endpoints**:
- `POST /api/interviews/{id}/confirm` - Participant confirmation
- `POST /api/interviews/{id}/reschedule` - Change datetime
- `POST /api/interviews/{id}/no-show` - Mark absence
- `POST /api/interviews/{id}/complete` - Submit evaluation

```typescript
// Confirm Attendance
const confirmed = await interviewWorkflowService.confirmInterview(interviewId, {
  participantEmail: 'padre@example.com',
  confirmationCode: 'CONF123',
  confirmed: true
});

// Complete Interview
const completed = await interviewWorkflowService.completeInterview(interviewId, {
  actualDuration: 55,
  interviewOutcome: {
    overallImpression: 'GOOD',
    recommendation: 'RECOMMEND',
    keyStrengths: ['Familia comprometida', 'Valores alineados']
  },
  detailedNotes: 'Entrevista muy positiva...'
});
```

---

### 6. 📧 Notification Templates (Admin)

**Screens**: Template editor, campaign management, analytics

#### Template Management
**Endpoint**: `GET /api/notifications/admin/templates`
- ✅ **Category-based** organization
- ✅ **Multi-language** support (ES/EN)
- ✅ **Variable system** with validation
- ✅ **Preview functionality** with sample data

```typescript
// Get Templates
const templates = await notificationTemplateService.getTemplates({
  category: 'INTERVIEW',
  type: 'EMAIL',
  isActive: true
});

// Create Template
const newTemplate = await notificationTemplateService.createTemplate({
  name: 'Interview Confirmation',
  category: 'INTERVIEW',
  subject: 'Entrevista programada - {{student.firstName}}',
  htmlContent: '<h1>Hola {{user.firstName}}</h1>...',
  variables: [
    { name: 'student.firstName', type: 'string', required: true },
    { name: 'interview.date', type: 'date', required: true }
  ]
});
```

#### Template Operations
**Features**: Preview, validation, testing, cloning

```typescript
// Preview with Sample Data
const preview = await notificationTemplateService.previewTemplate(templateId, {
  'student.firstName': 'Joaquín',
  'user.firstName': 'María',
  'interview.date': '15 de Febrero, 2025'
});

// Send Test Email
const test = await notificationTemplateService.sendTestEmail(templateId, {
  recipientEmail: 'admin@mtn.cl',
  sampleVariables: sampleData
});

// Validate Template
const validation = await notificationTemplateService.validateTemplate({
  subject: 'Test {{invalid.variable}}',
  htmlContent: '<p>Content</p>',
  textContent: 'Content',
  variables: []
});
// Returns: { isValid, errors, warnings, suggestions }
```

---

## 🔄 Feature Flag Integration

### Gateway Routing Logic
The gateway uses feature flags to route requests between monolith and microservices:

```yaml
# Gateway Configuration (conceptual)
routing:
  /api/users/*:
    feature_flag: "users_microservice_enabled"
    if_enabled: "users-service"
    if_disabled: "monolith"
  
  /api/applications/*:
    feature_flag: "applications_microservice_enabled" 
    if_enabled: "applications-service"
    if_disabled: "monolith"
```

### Frontend Impact
- ✅ **No route changes** in frontend code
- ✅ **Transparent switching** between implementations
- ✅ **Gradual migration** service by service
- ✅ **Rollback capability** via feature flags

---

## 🚀 Integration Benefits

### 1. Seamless Transition
- **Zero frontend changes** when switching services
- **Gradual migration** reduces risk
- **A/B testing** capabilities

### 2. Enhanced Features
- **Rich status tracking** with progress indicators
- **Real-time notifications** and updates
- **Advanced document validation** with AI
- **Comprehensive audit trails**

### 3. Operational Excellence
- **Request correlation** with unique IDs
- **Performance monitoring** and metrics
- **Error handling** with automatic retries
- **Security** with JWT token validation

---

## 📊 Monitoring & Observability

### Request Tracing
Every request includes correlation headers:
```
X-Correlation-Id: 550e8400-e29b-41d4-a716-446655440000
X-Request-Time: 2025-01-31T19:47:00Z
X-Client-Type: mtn-admission-web
X-Client-Version: 1.0.0
```

### Error Handling
```typescript
// Automatic error mapping
401 → Redirect to login with return URL
403 → Show forbidden page with context
429/502/503 → Exponential backoff retry
500 → User-friendly error with correlation ID
```

### Performance Metrics
```typescript
// Request timing and retry tracking
const metrics = apiClient.getMetrics();
console.log('Average request time:', metrics.averageResponseTime);
console.log('Retry rate:', metrics.retryRate);
```

---

## 🔧 Development Workflow

### 1. Testing Integration
```typescript
// Use demo component for development
import { GatewayServiceIntegrationDemo } from './examples/GatewayServiceIntegration';

// Test all endpoint mappings
<GatewayServiceIntegrationDemo />
```

### 2. Environment Configuration
```bash
# Gateway endpoints
VITE_API_BASE_URL=https://gateway.mtn.cl
VITE_API_GATEWAY_URL=https://api.mtn.cl

# Feature flag endpoints (optional)
VITE_FEATURE_FLAGS_URL=https://flags.mtn.cl
```

### 3. Service Integration
```typescript
// Replace existing API calls with new services
// Old: applicationService.createApplication()
// New: applicationWorkflowService.createDraft()

// Migration is gradual and non-breaking
```

---

## ✅ Implementation Status

**🎯 Complete Implementation:**

| Screen/Feature | Service | Status | Key Endpoints |
|---|---|---|---|
| User Profile | `profileService` | ✅ Complete | `/api/users/me` |
| Application Workflow | `applicationWorkflowService` | ✅ Complete | `POST /api/applications`, `POST /{id}/submit` |
| Document Management | `documentGatewayService` | ✅ Complete | Hybrid monolith → gateway pattern |
| Evaluation Management | `evaluationWorkflowService` | ✅ Complete | `/api/evaluations` with lifecycle endpoints |
| Interview Scheduling | `interviewWorkflowService` | ✅ Complete | `POST /api/interviews` with full workflow |
| Notification Templates | `notificationTemplateService` | ✅ Complete | `/api/notifications/admin/templates` |

**🔧 Technical Features:**
- ✅ JWT role extraction in gateway
- ✅ Feature flag routing support
- ✅ Hybrid binary upload pattern
- ✅ Correlation ID tracking
- ✅ Exponential backoff retries
- ✅ Comprehensive error mapping
- ✅ Real-time status updates
- ✅ Advanced workflow management

The implementation is **production-ready** and provides a complete migration path from monolith to microservices architecture with zero frontend disruption.