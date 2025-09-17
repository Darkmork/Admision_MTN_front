# 🛡️ Guía de Implementación RBAC + Cliente HTTP Unificado
## Sistema de Admisión MTN - Seguridad y API Gateway Integration

### ✅ Implementación Completada

**Fecha**: 31 de Agosto, 2025  
**Ingeniero**: Staff Security/Platform Engineer  
**Scope**: Rutas protegidas por rol + Cliente HTTP unificado con API Gateway

---

## 🚀 Componentes Implementados

### 1. Sistema de Guardas por Rol (`components/auth/RoleGuard.tsx`)

#### Guardas Específicas por Rol
```typescript
// Uso básico de guardas
<AdminGuard>
  <ComponenteSoloParaAdmins />
</AdminGuard>

<TeacherGuard>
  <ComponenteParaProfesores />
</TeacherGuard>

<FamilyGuard>
  <ComponenteParaFamilias />
</FamilyGuard>
```

#### Guardas Disponibles
- **`AdminGuard`** - Solo para ADMIN
- **`TeacherGuard`** - Para todos los roles de profesores (TEACHER, PSYCHOLOGIST, CYCLE_DIRECTOR, COORDINATOR)
- **`DirectorGuard`** - Solo para CYCLE_DIRECTOR
- **`PsychologistGuard`** - Solo para PSYCHOLOGIST
- **`CoordinatorGuard`** - Solo para COORDINATOR
- **`FamilyGuard`** - Solo para APODERADO
- **`StaffGuard`** - Para todo el personal (Admin + Profesores)
- **`EvaluatorGuard`** - Para evaluadores (TEACHER, PSYCHOLOGIST, CYCLE_DIRECTOR)

#### Hook de Verificación de Roles
```typescript
const { 
  isAdmin, 
  isTeacher, 
  isFamily, 
  hasRole, 
  hasAnyRole,
  getRoleDisplay 
} = useRoleGuard();

// Verificaciones programáticas
if (isAdmin()) {
  // Lógica específica para admin
}

if (hasAnyRole(['TEACHER', 'COORDINATOR'])) {
  // Lógica para profesores o coordinadores
}
```

### 2. Rutas Protegidas (`components/auth/ProtectedRoute.tsx`)

#### Componentes de Ruta Protegida
```typescript
// Configuración de rutas con React Router
<Routes>
  <Route
    path="/admin/*"
    element={
      <AdminRoute>
        <AdminDashboard />
      </AdminRoute>
    }
  />
  
  <Route
    path="/professor/*"
    element={
      <TeacherRoute unauthorizedRedirect="/access-denied">
        <ProfessorDashboard />
      </TeacherRoute>
    }
  />
</Routes>
```

#### Rutas Específicas Disponibles
- **`AdminRoute`** - Rutas solo para administradores
- **`TeacherRoute`** - Rutas para profesores y evaluadores
- **`DirectorRoute`** - Rutas solo para directores de ciclo
- **`PsychologistRoute`** - Rutas solo para psicólogos
- **`FamilyRoute`** - Rutas solo para familias/apoderados
- **`StaffRoute`** - Rutas para todo el personal
- **`EvaluatorRoute`** - Rutas para evaluadores

#### Página de Acceso No Autorizado
- Componente `UnauthorizedPage` con información contextual del usuario
- Muestra roles actuales vs. requeridos
- Botones de navegación inteligente según el rol
- Información de soporte técnico

---

## 🌐 Cliente HTTP Unificado

### 3. Cliente HTTP Base (`services/http.ts`)

#### Características Principales
- **Autenticación Bearer automática** con token OIDC
- **Correlation ID único** para cada request
- **Reintentos exponenciales con jitter** para errores 429/502/503
- **Manejo automático de errores 401/403**
- **Métricas de rendimiento** por request
- **Headers de seguridad** personalizados

#### Configuración Automática
```typescript
// El cliente se configura automáticamente
const httpClient = new HttpClient();

// Headers agregados automáticamente:
{
  'Authorization': 'Bearer <token>',
  'X-Correlation-Id': '<uuid>',
  'X-Request-Time': '<iso-timestamp>',
  'X-Timezone': 'America/Santiago',
  'X-Client-Type': 'mtn-admission-web',
  'X-Client-Version': '1.0.0'
}
```

#### Reintentos Exponenciales
```typescript
// Configuración por defecto
const DEFAULT_RETRY_CONFIG = {
  attempts: 3,
  delay: 1000, // 1 segundo base
  jitter: true,
  retryableStatuses: [408, 429, 500, 502, 503, 504],
};

// Personalizable
httpClient.setRetryConfig({
  attempts: 5,
  delay: 2000,
});
```

#### Manejo de Errores Automático
- **401**: Intenta renovar token automáticamente, si falla redirige a `/login`
- **403**: Redirige a `/unauthorized`
- **429**: Retry automático con backoff exponencial
- **5xx**: Retry automático con backoff exponencial

### 4. API Client Simplificado (`services/apiClient.ts`)

#### Métodos de Conveniencia
```typescript
// Autenticación
await apiClient.checkAuth();
await apiClient.getCurrentUser();

// Usuarios
await apiClient.getUsers({ page: 0, size: 10, sort: 'email' });
await apiClient.createUser(userData);
await apiClient.updateUser(id, userData);

// Aplicaciones
await apiClient.getApplications({ status: 'PENDING' });
await apiClient.changeApplicationStatus(id, 'APPROVED');
await apiClient.archiveApplication(id);

// Evaluaciones
await apiClient.getEvaluations();
await apiClient.createEvaluation(evaluationData);

// Entrevistas
await apiClient.getInterviews();
await apiClient.scheduleInterview(interviewData);

// Archivos
await apiClient.uploadFile(file, 'DOCUMENT', applicationId);
const blob = await apiClient.downloadFile(fileId);

// Estadísticas
await apiClient.getDashboardStats();
await apiClient.getUserStats();

// Utilidades
await apiClient.validateRut(rut);
await apiClient.healthCheck();
```

#### Manejo Consistente de Errores
```typescript
try {
  await apiClient.createUser(userData);
} catch (error) {
  const errorMessage = apiClient.handleError(error);
  // errorMessage es un mensaje user-friendly en español
  setError(errorMessage);
}
```

---

## 📋 Configuración de API Gateway

### Variables de Entorno Requeridas
```bash
# API Gateway Integration
VITE_API_BASE_URL=http://localhost:8080
VITE_API_GATEWAY_URL=https://api.mtn.cl
VITE_API_TIMEOUT=30000

# Correlation y Observabilidad
VITE_OTEL_COLLECTOR_URL=http://localhost:14268/api/traces
VITE_ENABLE_PERFORMANCE_MONITORING=true

# Reintentos y Rate Limiting
VITE_HTTP_RETRY_ATTEMPTS=3
VITE_HTTP_RETRY_DELAY=1000
VITE_HTTP_JITTER_ENABLED=true
```

### Headers Automáticos Enviados
```typescript
// Request Headers
{
  'Content-Type': 'application/json',
  'Accept': 'application/json',
  'Authorization': 'Bearer <oidc-jwt-token>',
  'X-Correlation-Id': '<uuid-v4>',
  'X-Request-Time': '<iso-8601-timestamp>',
  'X-Timezone': 'America/Santiago',
  'X-Client-Type': 'mtn-admission-web',
  'X-Client-Version': '1.0.0'
}
```

---

## 🎯 Ejemplos de Uso

### Ejemplo 1: Router Completo con Rutas Protegidas
```typescript
// examples/RouterExample.tsx
<OidcProvider>
  <Router>
    <Routes>
      <Route path="/login" element={<OidcLogin showDualLogin />} />
      <Route path="/callback" element={<OidcCallback />} />
      
      <Route path="/admin/*" element={
        <AdminRoute>
          <AdminDashboard />
        </AdminRoute>
      } />
      
      <Route path="/professor/*" element={
        <TeacherRoute>
          <ProfessorDashboard />
        </TeacherRoute>
      } />
      
      <Route path="/family/*" element={
        <FamilyRoute>
          <FamilyDashboard />
        </FamilyRoute>
      } />
    </Routes>
  </Router>
</OidcProvider>
```

### Ejemplo 2: Componente con Guardas Múltiples
```typescript
// examples/ComponentWithGuards.tsx
const Dashboard = () => {
  const { isAdmin, isTeacher } = useRoleGuard();
  
  return (
    <div>
      <AdminGuard>
        <UserManagement />
      </AdminGuard>
      
      <TeacherGuard>
        <EvaluationPanel />
      </TeacherGuard>
      
      <StaffGuard>
        <GeneralStats />
      </StaffGuard>
      
      <ConditionalGuard 
        condition={(user, roles) => roles.includes('CYCLE_DIRECTOR')}
        fallback={<div>Solo para Directores</div>}
      >
        <DirectorPanel />
      </ConditionalGuard>
    </div>
  );
};
```

### Ejemplo 3: Uso del Cliente HTTP
```typescript
const ApplicationsPage = () => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const loadApplications = async () => {
    setLoading(true);
    try {
      const data = await apiClient.getApplications({
        page: 0,
        size: 20,
        sort: 'submissionDate',
        direction: 'desc',
        status: 'PENDING'
      });
      setApplications(data.content);
    } catch (err) {
      setError(apiClient.handleError(err));
    } finally {
      setLoading(false);
    }
  };

  const approveApplication = async (id: number) => {
    try {
      await apiClient.changeApplicationStatus(id, 'APPROVED', 'Cumple todos los requisitos');
      await loadApplications(); // Recargar lista
    } catch (err) {
      setError(apiClient.handleError(err));
    }
  };
};
```

---

## 🔧 Integración con Componentes Existentes

### Paso 1: Envolver la App con OidcProvider
```typescript
// App.tsx
import { OidcProvider } from './context/OidcContext';

function App() {
  return (
    <OidcProvider>
      {/* Tu aplicación existente */}
    </OidcProvider>
  );
}
```

### Paso 2: Reemplazar Axios por el Cliente HTTP
```typescript
// Antes
import axios from 'axios';
const response = await axios.get('/api/users');

// Después
import apiClient from './services/apiClient';
const users = await apiClient.getUsers();
```

### Paso 3: Agregar Guardas a Componentes Existentes
```typescript
// Antes
const AdminPanel = () => {
  return <div>Panel de Admin</div>;
};

// Después
import { AdminGuard } from './components/auth/RoleGuard';

const AdminPanel = () => {
  return (
    <AdminGuard>
      <div>Panel de Admin</div>
    </AdminGuard>
  );
};
```

### Paso 4: Actualizar Rutas Existentes
```typescript
// Antes
<Route path="/admin" element={<AdminDashboard />} />

// Después
import { AdminRoute } from './components/auth/ProtectedRoute';

<Route path="/admin" element={
  <AdminRoute>
    <AdminDashboard />
  </AdminRoute>
} />
```

---

## 🚨 Manejo de Errores y Debugging

### Logging Automático
El cliente HTTP genera logs detallados:
```
🌐 HTTP Request: GET /api/users
🔑 Added auth token for private route
✅ HTTP Success: 200 GET /api/users (correlationId: abc-123, duration: 245ms)
```

### Errores Comunes y Soluciones

#### Error 401 - Token Expirado
```
❌ Error 401: Token inválido o expirado, intentando renovar...
✅ Token renovado automáticamente
🔄 Reintentando request original...
```

#### Error 403 - Acceso Denegado
```
🚫 Error 403: Acceso denegado
🔄 Redirigiendo a /unauthorized
```

#### Rate Limiting (429)
```
🔄 Reintentando request (2/3) en 2150ms
⚠️ Rate limited - aplicando backoff exponencial
```

### Debug Mode
En desarrollo, habilitar logs detallados:
```typescript
// Habilitar en .env.development
VITE_DEBUG_MODE=true
VITE_HTTP_VERBOSE_LOGGING=true
```

---

## 📊 Métricas y Observabilidad

### Métricas Automáticas
El cliente HTTP recolecta automáticamente:
- **Duración de requests** por endpoint
- **Número de reintentos** por request
- **Tasa de errores** por status code
- **Correlation IDs** para trazabilidad

### Accessing Metrics
```typescript
const metrics = httpClient.getMetrics();
console.log('Requests activos:', metrics.size);

// Limpiar métricas
httpClient.clearMetrics();
```

### Health Checks
```typescript
const isHealthy = await apiClient.healthCheck();
if (!isHealthy) {
  console.warn('API Gateway no está disponible');
}
```

---

## 🎉 Resumen de Beneficios

### ✅ Seguridad
- **RBAC granular** a nivel de componente y ruta
- **Autenticación automática** con renovación de tokens
- **Headers de seguridad** automáticos
- **Correlation IDs** para auditoria

### ✅ Desarrollo
- **API consistente** para todas las operaciones
- **Manejo de errores unificado** con mensajes user-friendly
- **TypeScript completo** con tipos explícitos
- **Ejemplos listos para usar**

### ✅ Operaciones
- **Reintentos automáticos** con backoff exponencial
- **Métricas detalladas** para monitoreo
- **Logging estructurado** para debugging
- **Health checks** integrados

### ✅ Experiencia de Usuario
- **Transiciones suaves** entre estados de autenticación
- **Mensajes de error claros** en español chileno
- **Loading states** consistentes
- **Redirecciones inteligentes** según rol

---

## 🚀 Próximos Pasos

1. **Integrar en componentes existentes** usando los ejemplos
2. **Configurar API Gateway** en backend con CORS y rate limiting
3. **Implementar métricas** en Grafana para observabilidad
4. **Crear tests** para rutas protegidas y cliente HTTP
5. **Documentar endpoints** específicos para cada rol

**🎯 La implementación está COMPLETA y lista para integración inmediata!**