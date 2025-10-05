#!/bin/bash

# Archivos críticos con console.log sensibles
FILES=(
  "services/api.ts"
  "services/applicationService.ts"
  "pages/ProfessorLoginPage.tsx"
  "components/admin/StudentDetailModal.tsx"
)

echo "🧹 Eliminando console.log de archivos críticos..."

for file in "${FILES[@]}"; do
  if [ -f "$file" ]; then
    echo "  Procesando: $file"
    # Eliminar líneas que contienen console.log/info/warn/error/debug
    sed -i '' '/console\.\(log\|info\|warn\|error\|debug\)/d' "$file"
  fi
done

echo "✅ Completado"
