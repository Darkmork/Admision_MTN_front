#!/bin/bash

#################################################
# Console Sanitization Script
# Replaces all console.* statements with Logger
#################################################

set -e

FRONT_DIR="/Users/jorgegangale/Library/Mobile Documents/com~apple~CloudDocs/Proyectos/Admision_MTN/Admision_MTN_front"

cd "$FRONT_DIR"

echo "Starting console sanitization..."
echo "================================="
echo ""

# Step 1: Add Logger import to all files that use console.*
echo "[1/5] Adding Logger imports to files with console statements..."

for file in $(grep -rl "console\.\(log\|info\|warn\|error\|debug\)" services/ src/ components/ pages/ hooks/ context/ 2>/dev/null | grep -E "\.(ts|tsx)$"); do
  # Check if file already has Logger import
  if ! grep -q "import.*Logger.*from.*logger" "$file" 2>/dev/null; then
    # Determine correct import path based on file location
    if [[ "$file" == services/* ]]; then
      import_path="../src/utils/logger"
    elif [[ "$file" == src/services/* ]]; then
      import_path="../utils/logger"
    elif [[ "$file" == src/components/* ]] || [[ "$file" == src/pages/* ]]; then
      import_path="@/utils/logger"
    elif [[ "$file" == components/* ]] || [[ "$file" == pages/* ]]; then
      import_path="../src/utils/logger"
    elif [[ "$file" == hooks/* ]] || [[ "$file" == context/* ]]; then
      import_path="../src/utils/logger"
    elif [[ "$file" == src/hooks/* ]] || [[ "$file" == src/context/* ]]; then
      import_path="../utils/logger"
    else
      import_path="../utils/logger"
    fi

    # Add import after the last existing import
    sed -i '' "/^import/a\\
import { Logger } from '$import_path';" "$file" 2>/dev/null || true
  fi
done

echo "  ✅ Logger imports added"

# Step 2: Replace console.log with Logger.info
echo "[2/5] Replacing console.log with Logger.info..."
find services/ src/ components/ pages/ hooks/ context/ -type f \( -name "*.ts" -o -name "*.tsx" \) 2>/dev/null | \
  xargs sed -i '' 's/console\.log(/Logger.info(/g' 2>/dev/null || true
echo "  ✅ console.log replaced"

# Step 3: Replace console.error with Logger.error
echo "[3/5] Replacing console.error with Logger.error..."
find services/ src/ components/ pages/ hooks/ context/ -type f \( -name "*.ts" -o -name "*.tsx" \) 2>/dev/null | \
  xargs sed -i '' 's/console\.error(/Logger.error(/g' 2>/dev/null || true
echo "  ✅ console.error replaced"

# Step 4: Replace console.warn with Logger.warn
echo "[4/5] Replacing console.warn with Logger.warn..."
find services/ src/ components/ pages/ hooks/ context/ -type f \( -name "*.ts" -o -name "*.tsx" \) 2>/dev/null | \
  xargs sed -i '' 's/console\.warn(/Logger.warn(/g' 2>/dev/null || true
echo "  ✅ console.warn replaced"

# Step 5: Replace console.debug/info/table with Logger.debug
echo "[5/5] Replacing console.debug/info/table with Logger.debug..."
find services/ src/ components/ pages/ hooks/ context/ -type f \( -name "*.ts" -o -name "*.tsx" \) 2>/dev/null | \
  xargs sed -i '' -e 's/console\.debug(/Logger.debug(/g' \
                    -e 's/console\.info(/Logger.debug(/g' \
                    -e 's/console\.table(/Logger.debug(/g' 2>/dev/null || true
echo "  ✅ console.debug/info/table replaced"

echo ""
echo "Console sanitization complete!"
echo "==============================="
echo ""

# Verify results
echo "Verification:"
echo "-------------"
remaining=$(grep -r "console\.\(log\|info\|warn\|error\|debug\|table\)" services/ src/ components/ pages/ hooks/ context/ 2>/dev/null | wc -l | xargs)
echo "Remaining console statements in source code: $remaining"
echo ""

if [ "$remaining" -eq 0 ]; then
  echo "✅ SUCCESS: All console statements have been sanitized!"
else
  echo "⚠️  WARNING: $remaining console statements still remain."
  echo "   These may be in comments, strings, or require manual review."
fi

echo ""
echo "Next steps:"
echo "1. Review changes with: git diff"
echo "2. Test the application: npm run dev"
echo "3. Build for production: npm run build"
echo "4. Verify production bundle has zero console output"
