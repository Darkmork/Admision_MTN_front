#!/bin/bash
# Script de verificación completa de integración OIDC + Keycloak
# Valida que todos los componentes de autenticación estén correctamente configurados

set -euo pipefail

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Logging functions
log() {
    echo -e "${GREEN}[$(date +'%Y-%m-%d %H:%M:%S %Z')] ✅ $1${NC}"
}

warn() {
    echo -e "${YELLOW}[$(date +'%Y-%m-%d %H:%M:%S %Z')] ⚠️  $1${NC}"
}

error() {
    echo -e "${RED}[$(date +'%Y-%m-%d %H:%M:%S %Z')] ❌ $1${NC}"
}

info() {
    echo -e "${BLUE}[$(date +'%Y-%m-%d %H:%M:%S %Z')] 📋 $1${NC}"
}

header() {
    echo ""
    echo -e "${BLUE}========================================${NC}"
    echo -e "${BLUE} $1${NC}"
    echo -e "${BLUE}========================================${NC}"
}

# Configuration
FRONTEND_URL="http://localhost:5173"
BACKEND_URL="http://localhost:8080"
KEYCLOAK_URL="http://localhost:8080/auth"  # Development
KEYCLOAK_REALM="mtn-admision"

# Test results
TESTS_PASSED=0
TESTS_FAILED=0

run_test() {
    local test_name="$1"
    local test_command="$2"
    
    info "🧪 Ejecutando: $test_name"
    
    if eval "$test_command" &>/dev/null; then
        log "✅ $test_name - PASSED"
        ((TESTS_PASSED++))
        return 0
    else
        error "❌ $test_name - FAILED"
        ((TESTS_FAILED++))
        return 1
    fi
}

# 1. Verificación de archivos OIDC
verify_oidc_files() {
    header "1. VERIFICACIÓN DE ARCHIVOS OIDC"
    
    info "📁 Verificando estructura de archivos OIDC..."
    
    # Archivos principales
    run_test "services/oidcService.ts existe" "test -f services/oidcService.ts"
    run_test "context/OidcContext.tsx existe" "test -f context/OidcContext.tsx"
    run_test "hooks/useOidcAuth.ts existe" "test -f hooks/useOidcAuth.ts"
    
    # Componentes de autenticación
    run_test "components/auth/OidcLogin.tsx existe" "test -f components/auth/OidcLogin.tsx"
    run_test "components/auth/OidcLogout.tsx existe" "test -f components/auth/OidcLogout.tsx"
    run_test "components/auth/OidcCallback.tsx existe" "test -f components/auth/OidcCallback.tsx"
    run_test "components/auth/ProtectedOidcRoute.tsx existe" "test -f components/auth/ProtectedOidcRoute.tsx"
    
    # Verificar dependencias críticas
    run_test "oidc-client-ts instalado en package.json" "grep -q 'oidc-client-ts' package.json"
    run_test "oidc-client-ts instalado en node_modules" "test -d node_modules/oidc-client-ts"
}

# 2. Verificación de configuración OIDC
verify_oidc_config() {
    header "2. VERIFICACIÓN DE CONFIGURACIÓN OIDC"
    
    info "⚙️ Verificando configuración OIDC..."
    
    # Variables de entorno OIDC
    if [ -f ".env.development" ]; then
        run_test "VITE_OIDC_ISSUER configurado" "grep -q 'VITE_OIDC_ISSUER=' .env.development"
        run_test "VITE_OIDC_CLIENT_ID configurado" "grep -q 'VITE_OIDC_CLIENT_ID=' .env.development"
        run_test "VITE_OIDC_REDIRECT_URI configurado" "grep -q 'VITE_OIDC_REDIRECT_URI=' .env.development"
        run_test "VITE_FEATURE_RBAC_ENABLED=true" "grep -q 'VITE_FEATURE_RBAC_ENABLED=true' .env.development"
        
        # Verificar configuración chilena
        run_test "Zona horaria chilena en OIDC" "grep -q 'VITE_TIMEZONE=America/Santiago' .env.development"
        run_test "Locale chileno en OIDC" "grep -q 'VITE_LOCALE=es-CL' .env.development"
        run_test "Protección PII habilitada" "grep -q 'VITE_PII_PROTECTION=true' .env.development"
    else
        error "Archivo .env.development no encontrado"
        ((TESTS_FAILED++))
    fi
    
    # Verificar services/config.ts
    if [ -f "services/config.ts" ]; then
        run_test "OIDC_CONFIG exportado en config.ts" "grep -q 'OIDC_CONFIG' services/config.ts"
        run_test "CHILEAN_CONFIG exportado en config.ts" "grep -q 'CHILEAN_CONFIG' services/config.ts"
        run_test "getEnvVar function en config.ts" "grep -q 'getEnvVar' services/config.ts"
    else
        error "Archivo services/config.ts no encontrado"
        ((TESTS_FAILED++))
    fi
}

# 3. Verificación de sintaxis TypeScript
verify_typescript_syntax() {
    header "3. VERIFICACIÓN DE SINTAXIS TYPESCRIPT"
    
    info "📝 Verificando sintaxis de archivos TypeScript..."
    
    # Verificar archivos principales con TypeScript
    if command -v npx >/dev/null 2>&1; then
        run_test "Sintaxis TypeScript válida" "npx tsc --noEmit --skipLibCheck"
    else
        warn "TypeScript compiler no disponible, saltando verificación de sintaxis"
    fi
    
    # Verificar imports/exports
    run_test "Imports correctos en OidcService" "grep -q 'import.*oidc-client-ts' services/oidcService.ts"
    run_test "Export default en OidcService" "grep -q 'export.*oidcService' services/oidcService.ts"
    run_test "useOidc hook exportado" "grep -q 'export.*useOidc' context/OidcContext.tsx"
    run_test "ProtectedOidcRoute exportado" "grep -q 'export.*ProtectedOidcRoute' components/auth/ProtectedOidcRoute.tsx"
}

# 4. Verificación de funcionalidad OIDC
verify_oidc_functionality() {
    header "4. VERIFICACIÓN DE FUNCIONALIDAD OIDC"
    
    info "🔧 Verificando funcionalidades específicas de OIDC..."
    
    # Verificar métodos críticos en oidcService.ts
    run_test "Método login implementado" "grep -q 'async login' services/oidcService.ts"
    run_test "Método logout implementado" "grep -q 'async logout' services/oidcService.ts"
    run_test "Método handleCallback implementado" "grep -q 'async handleCallback' services/oidcService.ts"
    run_test "Método renewToken implementado" "grep -q 'async renewToken' services/oidcService.ts"
    run_test "Método hasRole implementado" "grep -q 'hasRole' services/oidcService.ts"
    
    # Verificar manejo de roles
    run_test "Extracción de realm_access roles" "grep -q 'realm_access' services/oidcService.ts"
    run_test "Extracción de resource_access roles" "grep -q 'resource_access' services/oidcService.ts"
    run_test "Método getUserRoles implementado" "grep -q 'getUserRoles' services/oidcService.ts"
    
    # Verificar PII masking chileno
    run_test "Método maskRut implementado" "grep -q 'maskRut' services/oidcService.ts"
    run_test "Método maskPhone implementado" "grep -q 'maskPhone' services/oidcService.ts"
    run_test "Método maskEmail implementado" "grep -q 'maskEmail' services/oidcService.ts"
}

# 5. Verificación de componentes React
verify_react_components() {
    header "5. VERIFICACIÓN DE COMPONENTES REACT"
    
    info "⚛️ Verificando componentes React de autenticación..."
    
    # Verificar estructura de componentes
    run_test "OidcLogin es componente funcional" "grep -q 'const OidcLogin.*React.FC' components/auth/OidcLogin.tsx"
    run_test "OidcLogout es componente funcional" "grep -q 'const OidcLogout.*React.FC' components/auth/OidcLogout.tsx"
    run_test "OidcCallback es componente funcional" "grep -q 'const OidcCallback.*React.FC' components/auth/OidcCallback.tsx"
    run_test "ProtectedOidcRoute es componente funcional" "grep -q 'const ProtectedOidcRoute.*React.FC' components/auth/ProtectedOidcRoute.tsx"
    
    # Verificar uso de hooks
    run_test "OidcLogin usa useOidcAuth" "grep -q 'useOidcAuth' components/auth/OidcLogin.tsx"
    run_test "OidcLogout usa useOidcAuth" "grep -q 'useOidcAuth' components/auth/OidcLogout.tsx"
    run_test "ProtectedOidcRoute usa useRoleCheck" "grep -q 'useRoleCheck' components/auth/ProtectedOidcRoute.tsx"
    
    # Verificar componentes especializados
    run_test "AdminProtectedRoute existe" "grep -q 'AdminProtectedRoute' components/auth/ProtectedOidcRoute.tsx"
    run_test "TeacherProtectedRoute existe" "grep -q 'TeacherProtectedRoute' components/auth/ProtectedOidcRoute.tsx"
    run_test "FamilyProtectedRoute existe" "grep -q 'FamilyProtectedRoute' components/auth/ProtectedOidcRoute.tsx"
}

# 6. Verificación de integración con backend
verify_backend_integration() {
    header "6. VERIFICACIÓN DE INTEGRACIÓN BACKEND"
    
    info "🔗 Verificando integración con el backend..."
    
    # Verificar conectividad con backend
    if curl -s "$BACKEND_URL/actuator/health" | grep -q '"status":"UP"'; then
        log "Backend Spring Boot está disponible"
        ((TESTS_PASSED++))
        
        # Verificar endpoints de autenticación
        run_test "Endpoint /actuator/health responde" "curl -s -o /dev/null -w '%{http_code}' $BACKEND_URL/actuator/health | grep -q '200'"
        
        # Verificar configuración CORS para OIDC
        local cors_test=$(curl -s -I -H "Origin: $FRONTEND_URL" "$BACKEND_URL/actuator/health" | grep -c "access-control" || echo "0")
        if [ "$cors_test" -gt 0 ]; then
            log "Headers CORS están configurados ($cors_test headers encontrados)"
            ((TESTS_PASSED++))
        else
            warn "Headers CORS no encontrados o no configurados para OIDC"
            ((TESTS_FAILED++))
        fi
    else
        warn "Backend no está disponible - algunas verificaciones se saltarán"
        ((TESTS_FAILED++))
    fi
}

# 7. Verificación de seguridad OIDC
verify_oidc_security() {
    header "7. VERIFICACIÓN DE SEGURIDAD OIDC"
    
    info "🔒 Verificando configuraciones de seguridad OIDC..."
    
    # Verificar configuración de seguridad en archivos
    run_test "Response type 'code' configurado" "grep -q 'response_type.*code' services/oidcService.ts"
    run_test "Scope 'openid profile email' configurado" "grep -q 'openid.*profile.*email' services/config.ts || grep -q 'openid.*profile.*email' services/oidcService.ts"
    run_test "automaticSilentRenew habilitado" "grep -q 'automaticSilentRenew.*true' services/oidcService.ts"
    run_test "includeIdTokenInSilentRenew configurado" "grep -q 'includeIdTokenInSilentRenew.*true' services/oidcService.ts"
    
    # Verificar manejo de errores de seguridad
    run_test "Manejo de errores de token" "grep -q 'handleTokenExpired' services/oidcService.ts"
    run_test "Manejo de errores de renovación" "grep -q 'handleSilentRenewError' services/oidcService.ts"
    run_test "Event listeners configurados" "grep -q 'addUserLoaded' services/oidcService.ts"
    
    # Verificar configuración de headers de seguridad
    if [ -f "vite.config.ts" ]; then
        run_test "Headers de seguridad en Vite" "grep -q 'Strict-Transport-Security' vite.config.ts"
        run_test "CSP configurado" "grep -q 'Content-Security-Policy' vite.config.ts"
        run_test "X-Frame-Options configurado" "grep -q 'X-Frame-Options' vite.config.ts"
    fi
}

# 8. Verificación de logs y debugging
verify_logging() {
    header "8. VERIFICACIÓN DE LOGGING Y DEBUGGING"
    
    info "📊 Verificando sistema de logging..."
    
    # Verificar logs de debug en componentes
    run_test "Logs de login en OidcService" "grep -q 'console.log.*login' services/oidcService.ts"
    run_test "Logs de logout en OidcService" "grep -q 'console.log.*logout' services/oidcService.ts"
    run_test "Logs de callback en OidcService" "grep -q 'console.log.*callback' services/oidcService.ts"
    run_test "Logs de error en componentes" "grep -q 'console.error' components/auth/OidcLogin.tsx"
    
    # Verificar logs de información del usuario (con masking)
    run_test "Logs de usuario con masking" "grep -q 'maskUserInfo' services/oidcService.ts"
    run_test "Logs de estado de autenticación" "grep -q 'console.log.*Estado de autenticación' context/OidcContext.tsx"
}

# Función principal
main() {
    header "🔐 VERIFICACIÓN COMPLETA DE INTEGRACIÓN OIDC + KEYCLOAK"
    info "Sistema de Admisión MTN - Colegio Monte Tabor y Nazaret"
    info "Zona horaria: $(date +'%Z %z')"
    info "Keycloak URL configurado: $KEYCLOAK_URL"
    info "Backend URL: $BACKEND_URL"
    info "Frontend URL: $FRONTEND_URL"
    echo ""
    
    # Cambiar al directorio del frontend
    if [ ! -f "package.json" ]; then
        error "No se encuentra package.json. Ejecutar desde el directorio del frontend."
        exit 1
    fi
    
    # Ejecutar todas las verificaciones
    verify_oidc_files
    verify_oidc_config
    verify_typescript_syntax
    verify_oidc_functionality
    verify_react_components
    verify_backend_integration
    verify_oidc_security
    verify_logging
    
    # Resumen final
    header "📊 RESUMEN DE VERIFICACIÓN OIDC"
    echo ""
    
    local total_tests=$((TESTS_PASSED + TESTS_FAILED))
    local success_rate=$((TESTS_PASSED * 100 / total_tests))
    
    if [ $TESTS_FAILED -eq 0 ]; then
        log "🎉 TODAS LAS VERIFICACIONES OIDC PASARON EXITOSAMENTE"
        log "✅ Tests exitosos: $TESTS_PASSED/$total_tests"
        log "📈 Tasa de éxito: $success_rate%"
        echo ""
        log "🔥 La integración OIDC + Keycloak está LISTA"
        log "🚀 Puedes proceder con las pruebas de autenticación"
        echo ""
        info "🔗 Endpoints de verificación:"
        info "   • Frontend: $FRONTEND_URL"
        info "   • Backend: $BACKEND_URL"
        info "   • Keycloak: $KEYCLOAK_URL"
        info "   • Login: $FRONTEND_URL/login"
        info "   • Callback: $FRONTEND_URL/auth/callback"
        echo ""
        info "🧪 Próximos pasos sugeridos:"
        info "   1. Iniciar Keycloak con la configuración del realm"
        info "   2. Crear usuarios de prueba en Keycloak"
        info "   3. Probar flujo completo de login/logout"
        info "   4. Verificar roles y permisos RBAC"
        info "   5. Probar renovación automática de tokens"
        
        exit 0
    else
        warn "⚠️  ALGUNAS VERIFICACIONES OIDC FALLARON"
        error "❌ Tests fallidos: $TESTS_FAILED/$total_tests"
        log "✅ Tests exitosos: $TESTS_PASSED/$total_tests"
        warn "📈 Tasa de éxito: $success_rate%"
        echo ""
        error "🔧 ACCIÓN REQUERIDA: Revisar los errores arriba antes de proceder"
        echo ""
        warn "💡 Soluciones comunes para OIDC:"
        warn "   • Verificar que oidc-client-ts esté instalado correctamente"
        warn "   • Revisar configuración de variables VITE_OIDC_* en .env.development"
        warn "   • Validar que Keycloak esté configurado con el realm correcto"
        warn "   • Asegurar que los URLs de redirect coincidan entre frontend y Keycloak"
        warn "   • Verificar que los client IDs existan en Keycloak"
        warn "   • Revisar CORS en el backend para permitir el frontend"
        
        exit 1
    fi
}

# Ejecutar función principal
main "$@"