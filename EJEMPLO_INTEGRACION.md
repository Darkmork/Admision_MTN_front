# Ejemplo de Integración - Componentes del Coordinador

Guía práctica para integrar los componentes del coordinador en tu aplicación React.

## 1. Setup de Rutas (React Router v7)

### Opción A: Rutas Anidadas
```tsx
// src/App.tsx
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import {
  CoordinatorDashboard,
  TemporalTrendsView,
  AdvancedSearchView
} from './components/coordinator';

// Layout del Coordinador
import CoordinatorLayout from './layouts/CoordinatorLayout';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Rutas del Coordinador */}
        <Route path="/coordinator" element={<CoordinatorLayout />}>
          <Route index element={<CoordinatorDashboard />} />
          <Route path="trends" element={<TemporalTrendsView />} />
          <Route path="search" element={<AdvancedSearchView />} />
        </Route>

        {/* Otras rutas */}
        <Route path="/" element={<Navigate to="/coordinator" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
```

### Opción B: Con Protección de Rutas
```tsx
// src/App.tsx
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import {
  CoordinatorDashboard,
  TemporalTrendsView,
  AdvancedSearchView
} from './components/coordinator';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />

        {/* Rutas Protegidas del Coordinador */}
        <Route
          path="/coordinator"
          element={
            <ProtectedRoute roles={['ADMIN', 'COORDINATOR']}>
              <CoordinatorLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<CoordinatorDashboard />} />
          <Route path="trends" element={<TemporalTrendsView />} />
          <Route path="search" element={<AdvancedSearchView />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
```

---

## 2. Layout del Coordinador

```tsx
// src/layouts/CoordinatorLayout.tsx
import { Outlet, NavLink } from 'react-router-dom';

export const CoordinatorLayout = () => {
  return (
    <div className="min-h-screen bg-gray-100">
      {/* Navbar */}
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex space-x-8">
              <NavLink
                to="/coordinator"
                end
                className={({ isActive }) =>
                  `inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                    isActive
                      ? 'border-blue-500 text-gray-900'
                      : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                  }`
                }
              >
                Dashboard
              </NavLink>

              <NavLink
                to="/coordinator/trends"
                className={({ isActive }) =>
                  `inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                    isActive
                      ? 'border-blue-500 text-gray-900'
                      : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                  }`
                }
              >
                Análisis Temporal
              </NavLink>

              <NavLink
                to="/coordinator/search"
                className={({ isActive }) =>
                  `inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                    isActive
                      ? 'border-blue-500 text-gray-900'
                      : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                  }`
                }
              >
                Búsqueda Avanzada
              </NavLink>
            </div>

            <div className="flex items-center">
              <span className="text-sm text-gray-700">Coordinador</span>
            </div>
          </div>
        </div>
      </nav>

      {/* Content */}
      <main>
        <Outlet />
      </main>
    </div>
  );
};

export default CoordinatorLayout;
```

---

## 3. Protección de Rutas (Opcional)

```tsx
// src/components/auth/ProtectedRoute.tsx
import { Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

interface ProtectedRouteProps {
  children: React.ReactNode;
  roles?: string[];
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  roles = []
}) => {
  const { user, isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (roles.length > 0 && !roles.includes(user?.role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return <>{children}</>;
};
```

---

## 4. React Query Setup (Recomendado)

```tsx
// src/main.tsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import App from './App';
import './index.css';

// Configurar Query Client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutos
      gcTime: 10 * 60 * 1000, // 10 minutos (antes era cacheTime)
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <App />
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  </React.StrictMode>
);
```

---

## 5. Uso con React Query (Hook Personalizado)

```tsx
// src/hooks/useDashboardData.ts
import { useQuery } from '@tanstack/react-query';
import { dashboardClient } from '../api/dashboard.client';

export const useDashboardData = (academicYear?: number) => {
  return useQuery({
    queryKey: ['dashboard', 'admin-stats', academicYear],
    queryFn: () => dashboardClient.getDetailedAdminStats({ academicYear }),
    staleTime: 3 * 60 * 1000, // 3 minutos (mismo que backend cache)
  });
};

export const useTemporalTrends = () => {
  return useQuery({
    queryKey: ['analytics', 'temporal-trends'],
    queryFn: () => dashboardClient.getTemporalTrends(),
    staleTime: 15 * 60 * 1000, // 15 minutos
  });
};

export const useAdvancedSearch = (params: AdvancedSearchParams) => {
  return useQuery({
    queryKey: ['applications', 'search', params],
    queryFn: () => searchClient.advancedSearch(params),
    enabled: !!params.search || Object.keys(params).length > 4,
  });
};
```

### Uso en Componente
```tsx
// src/components/coordinator/CoordinatorDashboardWithQuery.tsx
import { useDashboardData } from '../../hooks/useDashboardData';

export const CoordinatorDashboardWithQuery = () => {
  const [selectedYear, setSelectedYear] = useState(2025);
  const { data, isLoading, error, refetch } = useDashboardData(selectedYear);

  if (isLoading) return <LoadingSpinner />;
  if (error) return <ErrorMessage error={error} />;

  return (
    <div>
      {/* Renderizar dashboard con data */}
    </div>
  );
};
```

---

## 6. Configuración de Variables de Entorno

```bash
# .env.local
VITE_API_BASE_URL=http://localhost:8080
VITE_API_TIMEOUT=10000
```

```tsx
// Uso en código
const baseURL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';
```

---

## 7. Pruebas E2E con Playwright

```typescript
// e2e/coordinator-dashboard.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Coordinator Dashboard', () => {
  test('should display dashboard statistics', async ({ page }) => {
    await page.goto('http://localhost:5173/coordinator');

    // Verificar que el dashboard se carga
    await expect(page.locator('h1')).toContainText('Dashboard de Coordinador');

    // Verificar KPIs
    await expect(page.locator('text=Total Postulaciones')).toBeVisible();
    await expect(page.locator('text=Tasa de Aceptación')).toBeVisible();
  });

  test('should filter by academic year', async ({ page }) => {
    await page.goto('http://localhost:5173/coordinator');

    // Seleccionar año
    await page.selectOption('#year', '2025');

    // Esperar recarga de datos
    await page.waitForResponse(
      (res) => res.url().includes('detailed-stats') && res.status() === 200
    );

    // Verificar que los datos se actualizaron
    await expect(page.locator('text=2025')).toBeVisible();
  });
});

test.describe('Advanced Search', () => {
  test('should search applications', async ({ page }) => {
    await page.goto('http://localhost:5173/coordinator/search');

    // Ingresar búsqueda
    await page.fill('input[placeholder*="Buscar"]', 'Juan');
    await page.click('button:has-text("Buscar")');

    // Esperar resultados
    await page.waitForResponse(
      (res) => res.url().includes('/search') && res.status() === 200
    );

    // Verificar tabla de resultados
    await expect(page.locator('table')).toBeVisible();
  });

  test('should apply filters', async ({ page }) => {
    await page.goto('http://localhost:5173/coordinator/search');

    // Abrir filtros
    await page.click('button:has-text("Filtros")');

    // Aplicar filtro de estado
    await page.selectOption('select:has-text("Estado")', 'APPROVED');

    // Buscar
    await page.click('button:has-text("Buscar")');

    // Verificar resultados filtrados
    await expect(page.locator('span:has-text("APPROVED")')).toBeVisible();
  });
});
```

---

## 8. Manejo de Errores Global

```tsx
// src/components/ErrorBoundary.tsx
import { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100">
          <div className="max-w-md w-full bg-white shadow-lg rounded-lg p-6">
            <h2 className="text-2xl font-bold text-red-600 mb-4">
              Algo salió mal
            </h2>
            <p className="text-gray-600 mb-4">
              {this.state.error?.message || 'Error desconocido'}
            </p>
            <button
              onClick={() => window.location.reload()}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700"
            >
              Recargar página
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// Uso en App.tsx
<ErrorBoundary>
  <App />
</ErrorBoundary>
```

---

## 9. Build y Deploy

```bash
# Desarrollo
npm run dev

# Build para producción
npm run build

# Preview de producción
npm run preview

# E2E tests
npm run e2e
```

```json
// package.json - scripts completos
{
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "preview": "vite preview",
    "e2e": "playwright test",
    "e2e:ui": "playwright test --ui",
    "e2e:headed": "playwright test --headed",
    "e2e:debug": "playwright test --debug"
  }
}
```

---

## 10. Checklist de Integración

### Pre-requisitos
- [ ] Node.js 18+ instalado
- [ ] Backend services corriendo (puertos 8080-8086)
- [ ] PostgreSQL database activa
- [ ] Variables de entorno configuradas

### Setup
- [ ] Dependencias instaladas (`npm install`)
- [ ] Componentes importados correctamente
- [ ] Rutas configuradas en React Router
- [ ] Layout del coordinador creado
- [ ] React Query setup (opcional)

### Testing
- [ ] Backend endpoints verificados con curl
- [ ] Frontend en desarrollo (`npm run dev`)
- [ ] Navegación entre vistas funcional
- [ ] Gráficos renderizando correctamente
- [ ] Búsqueda avanzada operativa
- [ ] Exportación CSV funcional

### Producción
- [ ] Build exitoso (`npm run build`)
- [ ] Preview funcional (`npm run preview`)
- [ ] E2E tests pasando (`npm run e2e`)
- [ ] Error boundaries implementados
- [ ] Performance optimizado

---

## 🚀 Quick Start

```bash
# 1. Clonar e instalar
cd Admision_MTN_front
npm install

# 2. Verificar backend
curl http://localhost:8080/gateway/status

# 3. Iniciar desarrollo
npm run dev

# 4. Abrir navegador
# http://localhost:5173/coordinator
```

**¡Listo!** Los componentes del coordinador están integrados y funcionando.
