#!/bin/bash

# Script to disable verbose console.log statements in production-critical files
# Keeps console.error and console.warn for debugging

echo "🔇 Disabling verbose console.log statements..."

# Backup original files
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="./logs-backup-$TIMESTAMP"
mkdir -p "$BACKUP_DIR"

# Files to clean (most verbose ones)
FILES=(
  "services/http.ts"
  "services/applicationService.ts"
  "services/evaluationService.ts"
  "services/interviewService.ts"
  "pages/AdminDashboard.tsx"
)

for file in "${FILES[@]}"; do
  if [ -f "$file" ]; then
    echo "📝 Processing $file..."

    # Backup
    cp "$file" "$BACKUP_DIR/$(basename $file).bak"

    # Comment out console.log (but keep console.error, console.warn)
    # This uses sed to add // before console.log lines
    sed -i.tmp 's/^\(\s*\)console\.log(/\1\/\/ console.log(/g' "$file"
    rm -f "$file.tmp"

    echo "   ✅ Commented out console.log in $file"
  else
    echo "   ⚠️  File not found: $file"
  fi
done

echo ""
echo "✅ Console.log cleanup complete!"
echo "📦 Backups saved in: $BACKUP_DIR"
echo ""
echo "Note: console.error and console.warn are still active for debugging."
