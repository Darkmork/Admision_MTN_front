#!/bin/bash
# Script de generación de tipos TypeScript desde OpenAPI
# Sistema de Admisión MTN - API Gateway Integration

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
API_BASE_URL=${VITE_API_BASE_URL:-"http://localhost:8080"}
API_GATEWAY_URL=${VITE_API_GATEWAY_URL:-"https://api.mtn.cl"}
OUTPUT_DIR="src/api"

# Ensure output directory exists
mkdir -p "$OUTPUT_DIR"

# OpenAPI specifications URLs
declare -A OPENAPI_SPECS=(
    ["users"]="${API_BASE_URL}/api/users/v3/api-docs"
    ["applications"]="${API_BASE_URL}/api/applications/v3/api-docs"
    ["evaluations"]="${API_BASE_URL}/api/evaluations/v3/api-docs"
    ["interviews"]="${API_BASE_URL}/api/interviews/v3/api-docs"
    ["notifications"]="${API_BASE_URL}/api/notifications/v3/api-docs"
    ["files"]="${API_BASE_URL}/api/files/v3/api-docs"
    ["dashboard"]="${API_BASE_URL}/api/dashboard/v3/api-docs"
    ["auth"]="${API_BASE_URL}/api/auth/v3/api-docs"
)

# Fallback OpenAPI specs (for when services are not running)
declare -A FALLBACK_SPECS=(
    ["users"]="https://raw.githubusercontent.com/mtn-school/api-specs/main/users-openapi.yaml"
    ["applications"]="https://raw.githubusercontent.com/mtn-school/api-specs/main/applications-openapi.yaml"
    ["evaluations"]="https://raw.githubusercontent.com/mtn-school/api-specs/main/evaluations-openapi.yaml"
    ["interviews"]="https://raw.githubusercontent.com/mtn-school/api-specs/main/interviews-openapi.yaml"
    ["notifications"]="https://raw.githubusercontent.com/mtn-school/api-specs/main/notifications-openapi.yaml"
    ["files"]="https://raw.githubusercontent.com/mtn-school/api-specs/main/files-openapi.yaml"
    ["dashboard"]="https://raw.githubusercontent.com/mtn-school/api-specs/main/dashboard-openapi.yaml"
    ["auth"]="https://raw.githubusercontent.com/mtn-school/api-specs/main/auth-openapi.yaml"
)

# Function to check if URL is accessible
check_url() {
    local url="$1"
    curl -s --max-time 5 --head "$url" > /dev/null 2>&1
}

# Function to generate types for a service
generate_service_types() {
    local service="$1"
    local spec_url="$2"
    local output_file="$OUTPUT_DIR/${service}.types.ts"
    
    info "🔄 Generando tipos para servicio: $service"
    info "   📡 URL: $spec_url"
    info "   📁 Output: $output_file"
    
    if check_url "$spec_url"; then
        log "✅ Especificación accesible: $spec_url"
        
        if npx openapi-typescript "$spec_url" -o "$output_file" 2>/dev/null; then
            log "✅ Tipos generados exitosamente para $service"
            
            # Add header comment to generated file
            local temp_file="${output_file}.tmp"
            cat > "$temp_file" << EOF
/**
 * Auto-generated TypeScript types for ${service^^} Service
 * Generated from OpenAPI specification: ${spec_url}
 * Generated at: $(date +'%Y-%m-%d %H:%M:%S %Z')
 * 
 * DO NOT EDIT MANUALLY - This file is auto-generated
 * Run: npm run generate:api-types to regenerate
 */

EOF
            cat "$output_file" >> "$temp_file"
            mv "$temp_file" "$output_file"
            
            return 0
        else
            error "❌ Error generando tipos para $service desde $spec_url"
            return 1
        fi
    else
        warn "⚠️  Especificación no accesible: $spec_url"
        return 1
    fi
}

# Function to create mock types when OpenAPI is not available
create_mock_types() {
    local service="$1"
    local output_file="$OUTPUT_DIR/${service}.types.ts"
    
    warn "🔧 Creando tipos mock para $service"
    
    cat > "$output_file" << EOF
/**
 * Mock TypeScript types for ${service^^} Service
 * Generated at: $(date +'%Y-%m-%d %H:%M:%S %Z')
 * 
 * TODO: Replace with actual OpenAPI generated types when available
 */

// Basic types for ${service} service
export interface ${service^}Response<T = any> {
  data: T;
  message?: string;
  success: boolean;
  timestamp: string;
}

export interface ${service^}ErrorResponse {
  error: string;
  message: string;
  statusCode: number;
  timestamp: string;
}

export interface PaginatedResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  first: boolean;
  last: boolean;
  sort: {
    empty: boolean;
    sorted: boolean;
    unsorted: boolean;
  };
}

// Service-specific types (placeholder)
export interface ${service^}Entity {
  id: number;
  createdAt: string;
  updatedAt: string;
}

// Placeholder for actual service operations
export interface operations {
  // TODO: Replace with actual OpenAPI operations
}

export interface paths {
  // TODO: Replace with actual OpenAPI paths
}

export interface components {
  schemas: {
    // TODO: Replace with actual OpenAPI schemas
  };
}
EOF

    log "✅ Tipos mock creados para $service"
}

# Main function
main() {
    header "🔧 GENERACIÓN DE TIPOS TYPESCRIPT DESDE OPENAPI"
    info "Sistema de Admisión MTN - API Gateway Integration"
    info "Fecha: $(date +'%Y-%m-%d %H:%M:%S %Z')"
    info "API Base URL: $API_BASE_URL"
    info "Output Directory: $OUTPUT_DIR"
    echo ""
    
    local services_generated=0
    local services_failed=0
    
    # Check if backend is running
    if check_url "$API_BASE_URL/actuator/health"; then
        log "🚀 Backend está ejecutándose - usando especificaciones en vivo"
    else
        warn "⚠️  Backend no está ejecutándose - usando especificaciones fallback"
    fi
    
    # Generate types for each service
    for service in "${!OPENAPI_SPECS[@]}"; do
        local spec_url="${OPENAPI_SPECS[$service]}"
        local success=false
        
        # Try primary spec URL
        if generate_service_types "$service" "$spec_url"; then
            success=true
        # Try fallback spec URL if available
        elif [[ -n "${FALLBACK_SPECS[$service]:-}" ]]; then
            warn "🔄 Intentando especificación fallback para $service"
            if generate_service_types "$service" "${FALLBACK_SPECS[$service]}"; then
                success=true
            fi
        fi
        
        # Create mock types if both failed
        if [ "$success" = false ]; then
            create_mock_types "$service"
        fi
        
        if [ "$success" = true ]; then
            ((services_generated++))
        else
            ((services_failed++))
        fi
        
        echo ""
    done
    
    # Generate index file
    info "📝 Generando archivo index para re-exportación..."
    local index_file="$OUTPUT_DIR/index.ts"
    
    cat > "$index_file" << 'EOF'
/**
 * API Types Index - Auto-generated
 * Re-exports all generated API types
 */

// Service Types
export * from './users.types';
export * from './applications.types';
export * from './evaluations.types';
export * from './interviews.types';
export * from './notifications.types';
export * from './files.types';
export * from './dashboard.types';
export * from './auth.types';

// Common types used across services
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

    log "✅ Archivo index generado: $index_file"
    
    # Create package.json script if it doesn't exist
    if [ -f "package.json" ] && ! grep -q '"generate:api-types"' package.json; then
        info "📦 Agregando script a package.json..."
        
        # Backup package.json
        cp package.json package.json.backup
        
        # Add script using jq if available, otherwise manual edit
        if command -v jq > /dev/null 2>&1; then
            jq '.scripts["generate:api-types"] = "./scripts/generate-api-types.sh"' package.json > package.json.tmp && mv package.json.tmp package.json
            log "✅ Script agregado a package.json usando jq"
        else
            warn "⚠️  jq no disponible - agrega manualmente el script:"
            warn '   "generate:api-types": "./scripts/generate-api-types.sh"'
        fi
    fi
    
    # Summary
    header "📊 RESUMEN DE GENERACIÓN"
    log "✅ Servicios procesados exitosamente: $services_generated"
    [ $services_failed -gt 0 ] && warn "⚠️  Servicios con tipos mock: $services_failed"
    
    echo ""
    info "🎯 Próximos pasos:"
    info "   1. Ejecutar 'npm run generate:api-types' para regenerar tipos"
    info "   2. Importar tipos en tus servicios: import type { operations } from './api/users.types'"
    info "   3. Usar tipos tipados en clientes API"
    
    if [ $services_generated -gt 0 ]; then
        log "🎉 Generación de tipos completada exitosamente!"
        exit 0
    else
        error "❌ No se pudo generar ningún tipo desde OpenAPI"
        exit 1
    fi
}

# Execute main function
main "$@"