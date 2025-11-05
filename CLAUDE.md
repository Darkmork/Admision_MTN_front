# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

React + TypeScript frontend for Colegio Monte Tabor y Nazaret's admission system. The application connects to a microservices backend deployed on Railway and is deployed on Vercel.

**Tech Stack:**
- React 19.1 + TypeScript 5.7
- Vite 6.2 (build tool)
- React Router 7.6 (routing)
- TanStack Query 5.90 (server state)
- Axios 1.11 (HTTP client with retry logic)
- Tailwind CSS (styling)

**Deployment:**
- Frontend: Vercel (auto-deploy from GitHub)
- Backend: Railway microservices
- Gateway URL: https://gateway-service-production-a753.up.railway.app

## Development Commands

```bash
# Install dependencies
npm install

# Development server (localhost:5173)
npm run dev

# Production build
npm run build

# Preview production build
npm run preview

# End-to-end tests (Playwright)
npm run e2e              # Headless
npm run e2e:ui           # Interactive UI
npm run e2e:headed       # Headed browser
npm run e2e:debug        # Debug mode

# Install Playwright browsers
npm run playwright:install
```

## Critical Architecture Patterns

### 1. Runtime API Base URL Detection

**CRITICAL**: The API base URL is determined at **runtime in the browser**, NOT at build time.

**Why**: Vite/esbuild optimizes code at build time, which would hardcode `localhost` into production builds. This system uses runtime detection to switch between local development and production environments dynamically.

**Implementation** (`config/api.config.ts`):
```typescript
export function getApiBaseUrl(): string {
  if (typeof window === 'undefined') return 'http://localhost:8080';

  const hostname = window.location.hostname;

  // Vercel deployment → Railway backend
  if (hostname.includes('vercel.app')) {
    return 'https://gateway-service-production-a753.up.railway.app';
  }

  // Custom production domains → Railway backend
  if (hostname === 'admision.mtn.cl' || hostname === 'admin.mtn.cl') {
    return 'https://gateway-service-production-a753.up.railway.app';
  }

  // Local development
  return 'http://localhost:8080';
}
```

**Request flow**:
1. Browser loads application
2. Request interceptor (`services/http.ts`) calls `getApiBaseUrl()`
3. Function detects hostname from `window.location`
4. Returns appropriate backend URL
5. Full URL is constructed: `baseURL + path`

**See**: `VERCEL_RUNTIME_DETECTION.md` for detailed technical explanation.

### 2. HTTP Client Architecture

**Unified HTTP client** (`services/http.ts`) handles:
- Runtime base URL detection
- Automatic JWT token injection (Bearer auth)
- CSRF token management for mutations
- Exponential backoff retry (3 attempts for 408/429/500/502/503/504)
- Request correlation IDs for tracing
- 401 auto-redirect to login
- 403 redirect to unauthorized page

**Usage**:
```typescript
import httpClient from './services/http';

// GET request
const data = await httpClient.get('/api/applications');

// POST request (CSRF token added automatically)
const result = await httpClient.post('/api/applications', applicationData);

// PUT/DELETE (CSRF token added automatically)
await httpClient.put('/api/applications/123', updates);
await httpClient.delete('/api/applications/123');
```

**Token hierarchy**:
1. `localStorage.getItem('auth_token')` - Regular users (apoderados)
2. `localStorage.getItem('professor_token')` - School staff
3. `oidcService.getAccessToken()` - OIDC fallback

### 3. CSRF Protection

**CSRF Service** (`services/csrfService.ts`) automatically manages tokens:
- Fetches token from `/api/auth/csrf-token` on first mutation
- Caches token for 1 hour
- Automatically adds `X-CSRF-Token` header to POST/PUT/DELETE/PATCH requests
- Refreshes on 403 CSRF validation errors

**Backend services requiring CSRF** (as of Jan 2025):
- User Service
- Application Service
- Evaluation Service
- Guardian Service

**Note**: Notification and Dashboard services do NOT require CSRF tokens.

### 4. Route Parameter Naming Convention

**CRITICAL**: All evaluation form routes use `:evaluationId` parameter (NOT `:examId`).

**Correct pattern**:
```typescript
// Route definition (App.tsx)
<Route path="/cycle-director-interview/:evaluationId" element={<CycleDirectorInterviewForm />} />

// Component (CycleDirectorInterviewForm.tsx)
const { evaluationId } = useParams<{ evaluationId: string }>();
const evaluation = await professorEvaluationService.getEvaluationById(parseInt(evaluationId));
```

**Components using this pattern**:
- `FamilyInterviewPage` (`/profesor/entrevista-familiar/:evaluationId`)
- `CycleDirectorInterviewForm` (`/cycle-director-interview/:evaluationId`)
- `PsychologicalInterviewForm` (`/psychological-interview/:evaluationId`)

**Why**: Mismatched parameter names (`examId` vs `evaluationId`) cause components to get `undefined`, resulting in infinite "Cargando..." states.

### 5. UI Component Patterns

**Password Input with Visibility Toggle**:
The `Input` component (`components/ui/Input.tsx`) supports password visibility toggling via the `showPasswordToggle` prop.

```typescript
// Input component with password toggle
<Input
  id="password"
  label="Contraseña"
  type="password"
  value={password}
  onChange={(e) => setPassword(e.target.value)}
  isRequired
  showPasswordToggle  // Adds eye icon toggle
/>
```

**Features**:
- Eye icon (FiEye) shows when password is hidden
- Eye-off icon (FiEyeOff) shows when password is visible
- Toggle button positioned absolutely on the right
- Proper accessibility labels in Spanish
- Automatic input padding adjustment when toggle is present

**Used in**:
- `ApoderadoLogin.tsx` (login + registration forms)
- `ProfessorLoginPage.tsx`
- `AdminLoginPage.tsx`

### 6. Authentication & Protected Routes

**Three authentication contexts**:
1. **Apoderados** (guardians): `ProtectedApoderadoRoute`
2. **Professors** (teachers, psychologists, cycle directors): `ProtectedProfessorRoute`
3. **Admins/Coordinators**: `ProtectedAdminRoute`, `ProtectedCoordinatorRoute`

**Token storage**:
- Apoderados: `localStorage.setItem('auth_token', token)`
- Professors: `localStorage.setItem('professor_token', token)`
- Current user: `localStorage.setItem('currentProfessor', JSON.stringify(user))`

**RBAC roles** (from backend):
- `ADMIN`
- `COORDINATOR`
- `APODERADO`
- `TEACHER`
- `PSYCHOLOGIST`
- `CYCLE_DIRECTOR`
- `INTERVIEWER` - Functionally equivalent to PSYCHOLOGIST but specialized for family interviews

### 7. Component Organization

**Root-level components** (`/components`):
- `auth/` - Login forms, protected routes
- `admin/` - Admin dashboard, management
- `evaluations/` - Evaluation forms (family, cycle director, psychological)
- `interviews/` - Interview scheduling, display
- `documents/` - Document upload, viewer
- `layout/` - Header, Footer, navigation
- `ui/` - Reusable UI components (Button, Card, Input, Modal, etc.)

**Pages** (`/pages`):
- `HomePage.tsx` - Public landing page
- `ApplicationForm.tsx` - Student application submission
- `AdminDashboard.tsx` - Admin panel
- `ProfessorDashboard.tsx` - Teacher/evaluator dashboard
- `FamilyDashboard.tsx` - Guardian portal
- Various evaluation/interview pages

**Services** (`/services`):
- `http.ts` - Unified HTTP client
- `authService.ts` - Login, registration
- `applicationService.ts` - Application CRUD
- `evaluationService.ts` - Evaluations, scoring
- `interviewService.ts` - Interview scheduling
- `csrfService.ts` - CSRF token management
- `oidcService.ts` - OIDC authentication (if configured)

### 8. Evaluation Auto-Creation Pattern

**Backend behavior** (as of Jan 2025 rollback point):
- When an interview is created, backend automatically creates N evaluations (one per interviewer)
- Supports multiple interviewers (primary + second interviewer)
- Each evaluation has correct `evaluator_id` and `evaluation_type`

**Frontend expectations**:
- Professors see interviews where they are primary OR secondary interviewer
- Clicking "Realizar" button:
  1. Fetches all evaluations for logged-in professor
  2. Filters by `applicationId` AND `evaluationType`
  3. Navigates to appropriate form with `:evaluationId` parameter

**Evaluation type mapping**:
- Interview type `FAMILY` → Evaluation type `FAMILY_INTERVIEW`
- Interview type `CYCLE_DIRECTOR` → Evaluation type `CYCLE_DIRECTOR_INTERVIEW`
- Interview type `INDIVIDUAL` → Evaluation type `PSYCHOLOGICAL_INTERVIEW`

### 9. Schedule Management Component Pattern

**CRITICAL**: The system uses `WeeklyCalendar` component for ALL schedule management interfaces.

**Single source of truth**: `components/schedule/WeeklyCalendar.tsx`
- Modern grid-based weekly calendar view (Monday-Sunday)
- Visual slot selection interface
- Supports recurrent schedules, specific dates, and exceptions
- Role-agnostic (works with any user role via `userId` and `userRole` props)

**Usage locations**:
1. **Admin panel** (`AdminDashboard.tsx` → User management modal)
2. **Professor dashboard** (`ProfessorDashboard.tsx` → 'horarios' section)
3. **Schedule dashboard** (`ScheduleDashboard.tsx` → Standalone page for ADMIN/CYCLE_DIRECTOR/PSYCHOLOGIST/INTERVIEWER)

**Usage pattern**:
```typescript
<WeeklyCalendar
  userId={user.id}
  userRole={user.role}
  onScheduleChange={() => {
    console.log('📅 Horarios actualizados');
  }}
/>
```

**DEPRECATED components** (do NOT use):
- `AvailabilityScheduleManager.tsx` - Old dropdown-based interface (replaced Oct 2025)
- `InterviewerScheduleManager.tsx` - Old component, use WeeklyCalendar instead

**Why this pattern**:
- Ensures consistent UX/UI across all schedule management screens
- Changes made in admin panel automatically sync with professor's own view (same backend data)
- Single component to maintain and improve

## Path Aliases (vite.config.ts)

```typescript
'@' → root directory
'@components' → /components
'@services' → /services
'@types' → /types
'@utils' → /utils
'@hooks' → /hooks
'@context' → /context
'@pages' → /pages
```

**Usage**:
```typescript
import Button from '@components/ui/Button';
import { httpClient } from '@services/http';
import { Application } from '@types/application';
```

## Environment Variables

**Development** (`.env.development`):
```bash
VITE_PORT=5173
VITE_HOST=true
VITE_OPEN=true
# API_BASE_URL is NOT needed - runtime detection handles it
```

**Production** (`.env.production`):
```bash
# DO NOT set VITE_API_BASE_URL - runtime detection required
VITE_SOURCE_MAPS=false
```

**CRITICAL**: Do NOT set `VITE_API_BASE_URL` in environment variables. The system uses runtime detection via `getApiBaseUrl()` to automatically switch between localhost and Railway based on the browser's hostname.

## Debugging Production Issues

**Check runtime API detection**:
1. Open browser DevTools Console
2. Look for logs: `[API Config] Hostname detected: ...`
3. Verify: `[API Config] Vercel deployment detected → Railway backend`
4. Check requests go to: `https://gateway-service-production-a753.up.railway.app`

**Manual check**:
```typescript
// Run in browser console
import { debugApiConfig } from './config/api.config';
debugApiConfig();
```

**Common issues**:
- **"Cargando Entrevista..." forever**: Route parameter mismatch (`examId` vs `evaluationId`)
- **401 on all requests**: Token not in localStorage or expired
- **403 CSRF errors**: CSRF token missing or invalid, check backend has same `CSRF_SECRET`
- **CORS errors**: Gateway CORS not configured for origin, check backend settings
- **Network errors**: Backend service down, check Railway status

## Key Documentation Files

- **`VERCEL_RUNTIME_DETECTION.md`** - Technical details of API URL detection
- **`RBAC_HTTP_CLIENT_GUIDE.md`** - HTTP client integration guide
- **`OIDC_INTEGRATION_SUMMARY.md`** - OIDC authentication setup (if used)
- **`SCREEN_ENDPOINT_MAPPING.md`** - Frontend screens to backend endpoints
- **Backend CLAUDE.md**: `/Users/jorgegangale/Desktop/MIcroservicios/CLAUDE.md` (microservices architecture)
- **Rollback points**: `/Users/jorgegangale/Desktop/MIcroservicios/ROLLBACK-POINT-*.md`

## Build Configuration

**Security headers** (production only):
- `Strict-Transport-Security: max-age=31536000`
- `X-Content-Type-Options: nosniff`
- `X-Frame-Options: DENY`
- `Referrer-Policy: strict-origin-when-cross-origin`

**Code splitting**:
- `vendor`: React, React DOM
- `router`: React Router
- `ui`: Hero Icons, Lucide React
- `utils`: Axios, XLSX

**Minification**: esbuild (production), disabled (development)

**Console logs**: Kept in production for debugging (temporarily, as of Jan 2025)

## Testing

**Playwright E2E tests** (`/e2e`):
- Test authentication flows
- Test application submission
- Test document upload
- Test evaluation workflows

**Test data** (`/database`):
- SQL seed scripts
- Test users with different roles
- Sample applications

## Common Workflows

### Adding a New Protected Page

1. Create page component in `/pages/NewPage.tsx`
2. Add route in `App.tsx`:
```typescript
<Route path="/new-page" element={
  <ProtectedProfessorRoute>
    <NewPage />
  </ProtectedProfessorRoute>
} />
```
3. Add navigation link in appropriate dashboard

### Adding a New Service Method

1. Add method to service file (`/services/newService.ts`):
```typescript
export const newService = {
  async getData() {
    const response = await httpClient.get('/api/data');
    return response.data;
  }
};
```
2. Use in component with TanStack Query (recommended):
```typescript
const { data, isLoading } = useQuery({
  queryKey: ['data'],
  queryFn: () => newService.getData()
});
```

### Fixing Route Parameter Mismatches

1. Check route definition in `App.tsx`: `:paramName`
2. Check component `useParams`: must match exactly
3. Update `useEffect` dependencies to include param
4. Verify API call uses correct parameter

Example:
```typescript
// App.tsx
<Route path="/form/:evaluationId" element={<FormComponent />} />

// FormComponent.tsx
const { evaluationId } = useParams<{ evaluationId: string }>();  // NOT examId
useEffect(() => {
  loadData(evaluationId);
}, [evaluationId]);  // Include in dependencies
```

## Deployment

**Vercel (automatic)**:
1. Push to GitHub `main` branch
2. Vercel auto-builds and deploys
3. Check deployment logs in Vercel dashboard
4. Verify runtime detection works (check browser console)

**Manual deployment**:
```bash
npm run build
# Upload /dist to hosting provider
```

## Backend Integration

**Gateway URL**: `https://gateway-service-production-a753.up.railway.app`

**All API requests** go through the gateway, which routes to:
- User Service (Port 8082)
- Application Service (Port 8083)
- Evaluation Service (Port 8084)
- Notification Service (Port 8085)
- Dashboard Service (Port 8086)
- Guardian Service (Port 8087)

**Private networking**: Backend services communicate via Railway private network, not accessible publicly.

**Request format**:
```
Frontend → Gateway (public) → Backend Service (private) → PostgreSQL
```

**Response format** (standardized):
```typescript
{
  success: true,
  data: [...],
  meta: { timestamp: "..." }
}
```

## Known Issues & Planned Solutions

### Multiple Session Management (Nov 2025)

**Issue**: When the same user opens multiple sessions (different browser tabs/windows), the system enters a conflicting state causing ERR_TOO_MANY_REDIRECTS or CSRF token failures.

**Root Cause**:
- Multiple tabs use same JWT token from localStorage
- Backend may invalidate token when new login occurs
- Frontend doesn't detect session invalidation
- CSRF tokens get out of sync between sessions

**Planned Solution** (not yet implemented):
1. **Invalidate previous session on new login** (Backend - user-service):
   - Create `active_sessions` table: `(user_id, token_hash, created_at, last_activity)`
   - On login: mark all previous sessions as invalid
   - On token validation: check if token is in active_sessions
   - Return 401 if token has been invalidated

2. **Single session enforcement** (Frontend):
   - On 401 error: clear localStorage and redirect to login
   - Show message: "Tu sesión ha sido cerrada porque iniciaste sesión en otro dispositivo"
   - Optional: Use BroadcastChannel API to notify other tabs of logout

**Alternative Solutions**:
- **Multi-session support**: Generate unique JTI (JWT ID) per session, track all active sessions
- **Session refresh with conflict detection**: Frontend polls for session validity
- **WebSocket-based session management**: Real-time session invalidation

**Current Workaround**: Users should close all tabs/windows and log in again if experiencing redirect loops.

**Files to modify** (when implementing):
- Backend: `user-service/src/controllers/AuthController.js` (login logic)
- Backend: `user-service/src/middleware/auth.js` (token validation)
- Backend: New migration for `active_sessions` table
- Frontend: `services/authService.ts` (handle 401 errors)
- Frontend: `services/http.ts` (improve error handling)

## Changelog Highlights

**Nov 4, 2025** - Documented multiple session issue:
- Identified ERR_TOO_MANY_REDIRECTS cause (multiple active sessions)
- Planned solution: session invalidation on new login
- Added to Known Issues section for future implementation

**Oct 30, 2025** - INTERVIEWER role support and schedule component unification:
- Added INTERVIEWER role support to professor login portal (`professorAuthService.isProfessorRole()`)
- Added subject and department mappings for INTERVIEWER role in `ProfessorLoginPage.tsx`
- Replaced `AvailabilityScheduleManager` with `WeeklyCalendar` in `ProfessorDashboard.tsx` 'horarios' section
- Unified schedule management UX/UI across admin panel and professor dashboard
- INTERVIEWER users can now log in and manage interview schedules like PSYCHOLOGIST users

**Oct 27, 2025** - Password visibility toggle:
- Enhanced `Input` component with optional `showPasswordToggle` prop
- Added eye icon toggle (FiEye/FiEyeOff from react-icons)
- Updated all login forms (Apoderado, Professor, Admin) with password visibility
- 5 total password fields now have toggle functionality

**Jan 26, 2025** - Rollback point created:
- Fixed `CycleDirectorInterviewForm` route parameter mismatch (`examId` → `evaluationId`)
- Backend auto-creates evaluations for all interview participants
- CSRF protection fully integrated
- Runtime API detection verified working on Vercel

**Previous updates**:
- Runtime API base URL detection implemented (fixes Vercel → Railway routing)
- CSRF service with automatic token management
- Unified HTTP client with retry logic
- Protected routes with RBAC
