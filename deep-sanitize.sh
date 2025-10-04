#!/bin/bash

echo "🧹 Deep Console Sanitization - Removing ALL console statements"
echo "=============================================================="

# Count before
BEFORE=$(grep -r "console\." --include="*.ts" --include="*.tsx" src/ services/ components/ pages/ hooks/ context/ 2>/dev/null | grep -v "src/utils/logger.ts" | wc -l | tr -d ' ')
echo "📊 Console statements found (excluding logger): $BEFORE"

# Files to process (exclude logger.ts)
FILES=$(find src/ services/ components/ pages/ hooks/ context/ -type f \( -name "*.ts" -o -name "*.tsx" \) ! -name "logger.ts" 2>/dev/null)

for file in $FILES; do
  # Skip if file doesn't exist or is logger
  if [[ ! -f "$file" ]] || [[ "$file" == *"logger.ts"* ]]; then
    continue
  fi
  
  # Check if file has console statements
  if grep -q "console\." "$file" 2>/dev/null; then
    # Add Logger import if not present
    if ! grep -q "import.*Logger.*from.*utils/logger" "$file" 2>/dev/null; then
      # Detect relative path depth
      DEPTH=$(echo "$file" | grep -o "/" | wc -l)
      PREFIX=""
      for i in $(seq 1 $((DEPTH - 1))); do
        PREFIX="../$PREFIX"
      done
      
      # Add import after last import or at top
      if grep -q "^import" "$file" 2>/dev/null; then
        sed -i '' "/^import/a\\
import { Logger } from '${PREFIX}src/utils/logger';\\
" "$file"
      else
        sed -i '' "1i\\
import { Logger } from '${PREFIX}src/utils/logger';\\
" "$file"
      fi
    fi
    
    # Replace all console statements
    sed -i '' 's/console\.log(/Logger.info(/g' "$file"
    sed -i '' 's/console\.error(/Logger.error(/g' "$file"
    sed -i '' 's/console\.warn(/Logger.warn(/g' "$file"
    sed -i '' 's/console\.debug(/Logger.debug(/g' "$file"
    sed -i '' 's/console\.info(/Logger.debug(/g' "$file"
    sed -i '' 's/console\.table(/Logger.debug(/g' "$file"
    
    echo "  ✅ $file"
  fi
done

# Count after
AFTER=$(grep -r "console\." --include="*.ts" --include="*.tsx" src/ services/ components/ pages/ hooks/ context/ 2>/dev/null | grep -v "src/utils/logger.ts" | wc -l | tr -d ' ')

echo ""
echo "✅ Deep sanitization complete!"
echo "📊 Before: $BEFORE console statements"
echo "📊 After:  $AFTER console statements (excluding logger.ts)"
echo "📊 Removed: $((BEFORE - AFTER)) statements"
