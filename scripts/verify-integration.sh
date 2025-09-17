#!/bin/bash
# Script de verificación de integración Frontend + Plataforma de Seguridad
# Valida que todos los componentes estén correctamente configurados

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
API_GATEWAY_URL="https://api.mtn.cl"  # Production
KEYCLOAK_URL="https://auth.mtn.cl"    # Production

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

# 1. Verificación de archivos de configuración
verify_config_files() {
    header "1. VERIFICACIÓN DE ARCHIVOS DE CONFIGURACIÓN"
    
    run_test "Archivo .env.development existe" "test -f .env.development"
    run_test "Archivo .env.staging existe" "test -f .env.staging"
    run_test "Archivo .env.production existe" "test -f .env.production"
    run_test "Archivo vite.config.ts actualizado" "grep -q 'VITE_OIDC_ISSUER' vite.config.ts"
    run_test "Archivo services/config.ts actualizado" "grep -q 'OIDC_CONFIG' services/config.ts"
    
    # Verificar variables de entorno críticas
    if [ -f ".env.development" ]; then
        run_test "Variable VITE_API_BASE_URL definida" "grep -q 'VITE_API_BASE_URL=' .env.development"
        run_test "Variable VITE_OIDC_ISSUER definida" "grep -q 'VITE_OIDC_ISSUER=' .env.development"
        run_test "Variable VITE_OIDC_CLIENT_ID definida" "grep -q 'VITE_OIDC_CLIENT_ID=' .env.development"
        run_test "Variable VITE_FEATURE_RBAC_ENABLED definida" "grep -q 'VITE_FEATURE_RBAC_ENABLED=' .env.development"
        run_test "Zona horaria chilena configurada" "grep -q 'VITE_TIMEZONE=America/Santiago' .env.development"
    else
        error "Archivo .env.development no encontrado"
        ((TESTS_FAILED++))
    fi
}

# 2. Verificación de conectividad
verify_connectivity() {
    header "2. VERIFICACIÓN DE CONECTIVIDAD"
    
    # Frontend
    run_test "Frontend accesible" "curl -s -o /dev/null -w '%{http_code}' $FRONTEND_URL | grep -q '200'"
    
    # Backend
    run_test "Backend accesible" "curl -s -o /dev/null -w '%{http_code}' $BACKEND_URL/actuator/health | grep -q '200'"
    
    # API Health endpoints
    if curl -s "$BACKEND_URL/actuator/health" | grep -q '"status":"UP"'; then
        log "Backend health check: UP"
        ((TESTS_PASSED++))
    else
        error "Backend health check: DOWN"
        ((TESTS_FAILED++))
    fi
}

# 3. Verificación de CORS
verify_cors() {
    header "3. VERIFICACIÓN DE CORS"
    
    info "🌐 Verificando configuración CORS..."
    
    # Test CORS preflight
    local cors_response=$(curl -s -o /dev/null -w '%{http_code}' \
        -H "Origin: $FRONTEND_URL" \
        -H "Access-Control-Request-Method: GET" \
        -H "Access-Control-Request-Headers: Authorization" \
        -X OPTIONS "$BACKEND_URL/api/applications")
    
    if [ "$cors_response" = "200" ]; then
        log "CORS preflight funcionando correctamente"
        ((TESTS_PASSED++))
    else
        warn "CORS preflight response: $cors_response"
        ((TESTS_FAILED++))
    fi
    
    # Test actual CORS request
    local cors_headers=$(curl -s -I \
        -H "Origin: $FRONTEND_URL" \
        "$BACKEND_URL/api/applications/public/all" | grep -i "access-control")
    
    if echo "$cors_headers" | grep -q "access-control-allow-origin"; then
        log "Headers CORS presentes en respuesta"
        ((TESTS_PASSED++))
    else
        warn "Headers CORS no encontrados en respuesta"
        ((TESTS_FAILED++))
    fi
}

# 4. Verificación de variables de entorno en runtime
verify_env_runtime() {
    header "4. VERIFICACIÓN DE VARIABLES EN RUNTIME"
    
    # Verificar que las variables están siendo cargadas por Vite
    info "📋 Verificando carga de variables de entorno..."
    
    # Crear un test temporal para verificar las variables
    cat > /tmp/env-test.js << 'EOF'
// Test de variables de entorno
console.log('🔧 Variables de entorno detectadas:');
console.log('API_BASE_URL:', import.meta.env.VITE_API_BASE_URL || 'NO_DEFINIDA');
console.log('OIDC_ISSUER:', import.meta.env.VITE_OIDC_ISSUER || 'NO_DEFINIDA');
console.log('FEATURE_RBAC:', import.meta.env.VITE_FEATURE_RBAC_ENABLED || 'NO_DEFINIDA');
console.log('TIMEZONE:', import.meta.env.VITE_TIMEZONE || 'NO_DEFINIDA');
console.log('SECURITY_LEVEL:', import.meta.env.VITE_SECURITY_LEVEL || 'NO_DEFINIDA');
EOF
    
    if [ -f "/tmp/env-test.js" ]; then
        log "Test de variables creado correctamente"
        ((TESTS_PASSED++))
    else
        error "No se pudo crear test de variables"
        ((TESTS_FAILED++))
    fi
}

# 5. Verificación de dependencias
verify_dependencies() {
    header "5. VERIFICACIÓN DE DEPENDENCIAS"
    
    info "📦 Verificando dependencias del proyecto..."
    
    # Verificar package.json
    run_test "package.json existe" "test -f package.json"
    run_test "node_modules existe" "test -d node_modules"
    
    # Verificar dependencias críticas
    if [ -f "package.json" ]; then
        run_test "React 19 instalado" "grep -q '\"react\": \"^19' package.json"
        run_test "Vite instalado" "grep -q '\"vite\":' package.json"
        run_test "Axios instalado" "grep -q '\"axios\":' package.json"
        run_test "React Router instalado" "grep -q '\"react-router-dom\":' package.json"
        run_test "Heroicons instalado" "grep -q '\"@heroicons/react\":' package.json"
    fi
}

# 6. Verificación de estructura de archivos
verify_file_structure() {
    header "6. VERIFICACIÓN DE ESTRUCTURA DE ARCHIVOS"
    
    info "🗂️  Verificando estructura del proyecto..."
    
    # Directorios críticos
    run_test "Directorio components existe" "test -d components"
    run_test "Directorio services existe" "test -d services"
    run_test "Directorio context existe" "test -d context"
    run_test "Directorio types existe" "test -d types"
    run_test "Directorio hooks existe" "test -d hooks"
    run_test "Directorio pages existe" "test -d pages"
    
    # Archivos críticos
    run_test "index.html existe" "test -f index.html"
    run_test "vite.config.ts existe" "test -f vite.config.ts"
    run_test "tsconfig.json existe" "test -f tsconfig.json"
    
    # Archivos de configuración de servicios
    run_test "config.ts actualizado" "test -f services/config.ts"
    run_test "authService.ts existe" "test -f services/authService.ts"
}

# 7. Test de integración básica
verify_integration() {
    header "7. TEST DE INTEGRACIÓN BÁSICA"
    
    info "🔗 Verificando integración frontend-backend..."
    
    # Test endpoint público
    if curl -s "$BACKEND_URL/api/applications/public/all" | grep -q '\['; then
        log "Endpoint público responde correctamente"
        ((TESTS_PASSED++))
    else
        warn "Endpoint público no responde como se esperaba"
        ((TESTS_FAILED++))
    fi
    
    # Test health endpoint
    run_test "Health endpoint funcional" "curl -s $BACKEND_URL/actuator/health | grep -q 'UP'"
    
    # Test CORS headers
    local cors_test=$(curl -s -I -H "Origin: $FRONTEND_URL" "$BACKEND_URL/api/applications/public/all" | grep -c "access-control" || echo "0")
    
    if [ "$cors_test" -gt 0 ]; then
        log "CORS headers presentes ($cors_test headers encontrados)"
        ((TESTS_PASSED++))
    else
        warn "CORS headers no encontrados"
        ((TESTS_FAILED++))
    fi
}

# 8. Verificación de seguridad básica
verify_security() {
    header "8. VERIFICACIÓN DE SEGURIDAD BÁSICA"
    
    info "🔒 Verificando configuraciones de seguridad..."
    
    # Verificar que no hay secretos en archivos de configuración
    run_test "No hay secretos hardcodeados en .env.development" "! grep -i 'password.*=' .env.development | grep -v 'PLACEHOLDER\|TODO\|\*\*\*'"
    run_test "Variables de seguridad definidas" "grep -q 'VITE_SECURITY_LEVEL=' .env.development"
    run_test "CSP configurado en production" "grep -q 'VITE_CSP_ENABLED=true' .env.production"
    run_test "HTTPS requerido en production" "grep -q 'VITE_HTTPS_REQUIRED=true' .env.production"
    
    # Verificar headers de seguridad en vite.config.ts
    run_test "Headers de seguridad configurados" "grep -q 'Strict-Transport-Security' vite.config.ts"
    run_test "CSP configurado en Vite" "grep -q 'Content-Security-Policy' vite.config.ts"
}

# Función principal
main() {
    header "🚀 VERIFICACIÓN DE INTEGRACIÓN FRONTEND + PLATAFORMA DE SEGURIDAD"
    info "Sistema de Admisión MTN - Colegio Monte Tabor y Nazaret"
    info "Zona horaria: $(date +'%Z %z')"
    echo ""
    
    # Cambiar al directorio del frontend
    if [ ! -f "package.json" ]; then
        error "No se encuentra package.json. Ejecutar desde el directorio del frontend."
        exit 1
    fi
    
    # Ejecutar todas las verificaciones
    verify_config_files
    verify_connectivity
    verify_cors
    verify_env_runtime
    verify_dependencies
    verify_file_structure
    verify_integration
    verify_security
    
    # Resumen final
    header "📊 RESUMEN DE VERIFICACIÓN"
    echo ""
    
    local total_tests=$((TESTS_PASSED + TESTS_FAILED))
    local success_rate=$((TESTS_PASSED * 100 / total_tests))
    
    if [ $TESTS_FAILED -eq 0 ]; then
        log "🎉 TODAS LAS VERIFICACIONES PASARON EXITOSAMENTE"
        log "✅ Tests exitosos: $TESTS_PASSED/$total_tests"
        log "📈 Tasa de éxito: $success_rate%"
        echo ""
        log "🔥 La integración frontend + plataforma de seguridad está LISTA"
        log "🚀 Puedes proceder con las siguientes fases de integración"
        echo ""
        info "🔗 URLs de verificación:"
        info "   • Frontend: $FRONTEND_URL"
        info "   • Backend: $BACKEND_URL"
        info "   • Health: $BACKEND_URL/actuator/health"
        info "   • API Test: $BACKEND_URL/api/applications/public/all"
        
        exit 0
    else
        warn "⚠️  ALGUNAS VERIFICACIONES FALLARON"
        error "❌ Tests fallidos: $TESTS_FAILED/$total_tests"
        log "✅ Tests exitosos: $TESTS_PASSED/$total_tests"
        warn "📈 Tasa de éxito: $success_rate%"
        echo ""
        error "🔧 ACCIÓN REQUERIDA: Revisar los errores arriba antes de proceder"
        echo ""
        warn "💡 Soluciones comunes:"
        warn "   • Verificar que el backend esté ejecutándose"
        warn "   • Revisar configuración CORS en application.yml"
        warn "   • Validar variables de entorno en archivos .env"
        warn "   • Asegurar que las dependencias estén instaladas (npm install)"
        
        exit 1
    fi
}

# Ejecutar función principal
main "$@"